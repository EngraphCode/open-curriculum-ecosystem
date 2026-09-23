import { describe, expect, it } from 'vitest';

import { parseThreadId, type ThreadId } from '../src/codex-exec/envelope';
import { judgeTurn, type CodexRun, type TurnFailure } from '../src/codex-exec/turn-verdict';

const THREAD = '01a0cfaf-7914-72e2-afe7-fb2d0938eb94';
const OTHER_THREAD = '01a0cfc3-0f0d-7980-bded-63fabd607a2f';

function threadId(raw: string): ThreadId {
  const parsed = parseThreadId(raw);
  if (!parsed.ok) {
    return expect.unreachable('fixture thread id must parse');
  }
  return parsed.value;
}

function jsonl(...events: readonly object[]): string {
  return `${events.map((event) => JSON.stringify(event)).join('\n')}\n`;
}

function exited(stdout: string): CodexRun {
  return { kind: 'exited', code: 0, stdout, stderr: 'Reading additional input from stdin...\n' };
}

const started = (id: string) => ({ type: 'thread.started', thread_id: id });
const message = (text: string) => ({
  type: 'item.completed',
  item: { type: 'agent_message', text },
});
const completed = { type: 'turn.completed', usage: {} };

describe('judgeTurn', () => {
  it('reads an opening turn as its thread id and its last agent message', () => {
    const run = exited(jsonl(started(THREAD), { type: 'turn.started' }, message('ACK'), completed));
    expect(judgeTurn(run, undefined)).toStrictEqual({
      ok: true,
      value: { threadId: THREAD, message: 'ACK', messages: ['ACK'], commandExecutions: [] },
    });
  });

  it('accepts a resumed turn that re-emits the requested thread id, and keeps every message', () => {
    const run = exited(
      jsonl(
        started(THREAD),
        message('Preamble'),
        {
          type: 'item.completed',
          item: { type: 'command_execution', command: 'c', aggregated_output: 'o', exit_code: 0 },
        },
        message('Final'),
        completed,
      ),
    );
    expect(judgeTurn(run, threadId(THREAD))).toStrictEqual({
      ok: true,
      value: {
        threadId: THREAD,
        message: 'Final',
        messages: ['Preamble', 'Final'],
        commandExecutions: [{ command: 'c', output: 'o', exitCode: 0 }],
      },
    });
  });

  it.each<[string, CodexRun, ThreadId | undefined, TurnFailure]>([
    [
      'a Codex that could not be launched',
      { kind: 'unlaunchable', message: 'ENOENT' },
      undefined,
      { kind: 'unlaunchable', message: 'ENOENT' },
    ],
    [
      'a run killed at its timeout',
      { kind: 'killed', reason: 'timeout', stderr: 'partial' },
      undefined,
      { kind: 'killed', reason: 'timeout', stderrTail: 'partial' },
    ],
    [
      'a non-zero exit',
      { kind: 'exited', code: 1, stdout: '', stderr: 'boom' },
      undefined,
      { kind: 'nonzero-exit', code: 1, stderrTail: 'boom' },
    ],
    [
      'an output line that does not parse',
      exited(`${jsonl(started(THREAD), message('ACK'))}not json\n`),
      undefined,
      { kind: 'unparseable-output', lines: 1 },
    ],
    [
      'a failed turn',
      exited(jsonl(started(THREAD), { type: 'turn.failed', error: { message: 'quota' } })),
      undefined,
      { kind: 'turn-failed', code: 0, messages: ['quota'] },
    ],
    [
      'a failed turn that also exits non-zero, keeping the reason from its event stream',
      {
        kind: 'exited',
        code: 1,
        stdout: jsonl(started(THREAD), { type: 'turn.failed', error: { message: 'quota' } }),
        stderr: 'Reading additional input from stdin...\n',
      },
      undefined,
      { kind: 'turn-failed', code: 1, messages: ['quota'] },
    ],
    ['no thread id', exited(jsonl(message('ACK'))), undefined, { kind: 'no-thread-id' }],
    [
      'a thread id that is not a UUID',
      exited(jsonl(started('--dangerously-bypass-approvals-and-sandbox'), message('ACK'))),
      undefined,
      { kind: 'invalid-thread-id' },
    ],
    [
      'a resumed turn on another thread',
      exited(jsonl(started(OTHER_THREAD), message('ACK'))),
      threadId(THREAD),
      { kind: 'thread-mismatch', expected: threadId(THREAD), actual: threadId(OTHER_THREAD) },
    ],
    [
      'a resumed turn whose thread id is not a UUID, judged before any comparison',
      exited(jsonl(started('--x'), message('ACK'))),
      threadId(THREAD),
      { kind: 'invalid-thread-id' },
    ],
    [
      'two thread ids in one turn',
      exited(jsonl(started(THREAD), started(OTHER_THREAD), message('ACK'))),
      undefined,
      { kind: 'multiple-thread-ids', count: 2 },
    ],
    [
      'the same thread id started twice in one turn',
      exited(jsonl(started(THREAD), started(THREAD), message('ACK'))),
      undefined,
      { kind: 'multiple-thread-ids', count: 2 },
    ],
    [
      'no agent message',
      exited(jsonl(started(THREAD), completed)),
      undefined,
      { kind: 'no-agent-message' },
    ],
  ])('fails on %s', (_label, run, requested, failure) => {
    expect(judgeTurn(run, requested)).toStrictEqual({ ok: false, error: failure });
  });

  it('keeps only the last 500 characters of a long stderr', () => {
    const stderr = `${'x'.repeat(1000)}END`;
    expect(judgeTurn({ kind: 'exited', code: 2, stdout: '', stderr }, undefined)).toStrictEqual({
      ok: false,
      error: { kind: 'nonzero-exit', code: 2, stderrTail: `${'x'.repeat(497)}END` },
    });
  });
});
