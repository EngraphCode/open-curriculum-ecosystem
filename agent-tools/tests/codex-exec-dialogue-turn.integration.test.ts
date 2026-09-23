import { err, ok } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  executeTurn,
  type CodexCall,
  type TurnContext,
  type TurnError,
  type TurnPorts,
  type TurnRequest,
} from '../src/codex-exec/dialogue-turn';
import {
  buildChildEnv,
  buildOpenArgv,
  buildResumeArgv,
  parseThreadId,
  type ThreadId,
} from '../src/codex-exec/envelope';
import type { CodexRun } from '../src/codex-exec/turn-verdict';

const THREAD = '01a0cfaf-7914-72e2-afe7-fb2d0938eb94';

function threadId(): ThreadId {
  const parsed = parseThreadId(THREAD);
  if (!parsed.ok) {
    return expect.unreachable('fixture thread id must parse');
  }
  return parsed.value;
}

const context: TurnContext = {
  codexExecutable: '/codex-slot',
  instrumentRoot: '/root-slot',
  childEnv: buildChildEnv({
    instrumentHome: '/home-slot',
    instrumentCodexHome: '/codex-home-slot',
    user: 'user-slot',
    lang: 'lang-slot',
    tmpdir: '/tmp-slot',
  }),
  modelPins: { model: 'model-slot', effort: 'high' },
};

const opening: TurnRequest = { prompt: 'packet', thread: undefined, timeoutMs: 5000 };

const replied: CodexRun = {
  kind: 'exited',
  code: 0,
  stdout: [
    JSON.stringify({ type: 'thread.started', thread_id: THREAD }),
    JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'reply' } }),
  ].join('\n'),
  stderr: '',
};

/**
 * Ports whose runner records each call and returns one constant run.
 */
function portsReturning(run: CodexRun, rootReady = true): TurnPorts & { calls: CodexCall[] } {
  const calls: CodexCall[] = [];
  return {
    calls,
    checkRoot: () => (rootReady ? ok(undefined) : err('root holds an entry: .logs')),
    runCodex: (call) => {
      calls.push(call);
      return run;
    },
  };
}

describe('executeTurn', () => {
  it('opens a thread inside the envelope, from the instrument root, with the prompt on stdin', () => {
    const ports = portsReturning(replied);
    const verdict = executeTurn(opening, context, ports);
    expect(ports.calls).toStrictEqual([
      {
        executable: '/codex-slot',
        argv: buildOpenArgv('/root-slot', context.modelPins),
        cwd: '/root-slot',
        env: context.childEnv,
        stdin: 'packet',
        timeoutMs: 5000,
      },
    ]);
    expect(verdict).toStrictEqual({
      ok: true,
      value: { threadId: THREAD, message: 'reply', messages: ['reply'], commandExecutions: [] },
    });
  });

  it('resumes the requested thread from the same instrument root', () => {
    const ports = portsReturning(replied);
    const verdict = executeTurn(
      { prompt: 'next', thread: threadId(), timeoutMs: 5000 },
      context,
      ports,
    );
    expect(ports.calls.map((call) => [call.argv, call.cwd])).toStrictEqual([
      [buildResumeArgv(threadId(), context.modelPins), '/root-slot'],
    ]);
    expect(verdict.ok).toBe(true);
  });

  it('starts no Codex process when the instrument root is not fit for a spawn', () => {
    const ports = portsReturning(replied, false);
    const verdict = executeTurn(opening, context, ports);
    const notReady: TurnError = { kind: 'root-not-ready', reason: 'root holds an entry: .logs' };
    expect(verdict).toStrictEqual({ ok: false, error: notReady });
    expect(ports.calls).toStrictEqual([]);
  });

  it('returns the verdict of a run that failed', () => {
    const ports = portsReturning({ kind: 'killed', reason: 'timeout', stderr: '' });
    const verdict = executeTurn(opening, context, ports);
    expect(verdict).toStrictEqual({ ok: false, error: { kind: 'killed', reason: 'timeout' } });
  });
});
