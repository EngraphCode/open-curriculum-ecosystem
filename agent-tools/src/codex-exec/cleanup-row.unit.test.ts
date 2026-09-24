import { describe, expect, it } from 'vitest';

import { parseDialogueId, threadsCreated } from './cleanup-row.js';
import type { CodexRun } from './turn-verdict.js';

const THREAD = '01a0cfaf-7914-72e2-afe7-fb2d0938eb94';
const OTHER_THREAD = '01a0cfc3-0f0d-7980-bded-63fabd607a2f';

function jsonl(...events: readonly object[]): string {
  return `${events.map((event) => JSON.stringify(event)).join('\n')}\n`;
}

function exited(stdout: string, code = 0): CodexRun {
  return { kind: 'exited', code, stdout, stderr: '' };
}

const started = (id: string) => ({ type: 'thread.started', thread_id: id });
const turnStarted = { type: 'turn.started' };
const reply = { type: 'item.completed', item: { type: 'agent_message', text: 'ACK' } };
const completed = { type: 'turn.completed', usage: {} };
const failed = { type: 'turn.failed', error: { message: 'quota' } };

describe('parseDialogueId', () => {
  it.each(['a', 'dlg-20260924-ab12', 'probe', 'a'.repeat(64), '0-9-a'])(
    'accepts the lowercase slug %j',
    (raw) => {
      expect(parseDialogueId(raw)).toStrictEqual({ ok: true, value: raw });
    },
  );

  it.each([
    ['the empty string', ''],
    ['65 characters', 'a'.repeat(65)],
    ['an uppercase letter', 'Dlg-1'],
    ['a leading hyphen', '-dlg'],
    ['a trailing hyphen', 'dlg-'],
    ['a double hyphen', 'dlg--1'],
    ['option syntax', '--x'],
    ['a path separator', 'dlg/1'],
    ['a space', 'dlg 1'],
    ['a dot', 'dlg.1'],
    ['a newline', 'dlg\n1'],
  ])('refuses %s', (_label, raw) => {
    expect(parseDialogueId(raw)).toStrictEqual({
      ok: false,
      error: 'a dialogue id must be a lowercase slug of 1 to 64 characters',
    });
  });
});

describe('threadsCreated', () => {
  it.each<[string, CodexRun, readonly string[]]>([
    ['a whole turn', exited(jsonl(started(THREAD), turnStarted, reply, completed)), [THREAD]],
    [
      'a turn that failed after its thread started',
      exited(jsonl(started(THREAD), turnStarted, failed), 1),
      [THREAD],
    ],
    [
      'a run killed mid-turn, from its partial output',
      {
        kind: 'killed',
        reason: 'timeout',
        stdout: `${jsonl(started(THREAD), turnStarted)}{"type":"item.comp`,
        stderr: '',
      },
      [THREAD],
    ],
    [
      'the same thread started twice, once',
      exited(jsonl(started(THREAD), started(THREAD), turnStarted, reply, completed)),
      [THREAD],
    ],
    [
      'two distinct threads, in the order they started',
      exited(jsonl(started(OTHER_THREAD), started(THREAD), turnStarted, reply, completed)),
      [OTHER_THREAD, THREAD],
    ],
    [
      'only the id that is a thread id, beside one that is not',
      exited(jsonl(started('not-a-uuid'), started(THREAD), turnStarted, reply, completed)),
      [THREAD],
    ],
    ['no thread from a run with no output', exited(''), []],
    [
      'no thread from a stream that never started one',
      exited(jsonl(turnStarted, reply, completed)),
      [],
    ],
    ['no thread from a Codex that never launched', { kind: 'unlaunchable', message: 'ENOENT' }, []],
  ])('reads %s', (_label, run, threads) => {
    expect(threadsCreated(run)).toStrictEqual(threads);
  });
});
