import { err, ok, type Result } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  executeTurn,
  type CodexCall,
  type TurnContext,
  type TurnError,
  type TurnPorts,
  type TurnRequest,
} from './dialogue-turn.js';
import type { ResolvedBinary } from './gate.js';
import {
  buildChildEnv,
  buildOpenArgv,
  buildResumeArgv,
  parseThreadId,
  type ThreadId,
} from './envelope.js';
import type { CodexRun } from './turn-verdict.js';

const THREAD = '01a0cfaf-7914-72e2-afe7-fb2d0938eb94';
const OTHER_THREAD = '01a0cfc3-0f0d-7980-bded-63fabd607a2f';

function threadId(): ThreadId {
  const parsed = parseThreadId(THREAD);
  if (!parsed.ok) {
    return expect.unreachable('fixture thread id must parse');
  }
  return parsed.value;
}

/** The binary as the caller resolved it: its version and real path. */
const BINARY: ResolvedBinary = { cliVersion: '0.156.1', executablePath: '/codex-slot' };

const context: TurnContext = {
  instrumentRoot: '/root-slot',
  childEnvInputs: {
    instrumentHome: '/home-slot',
    instrumentCodexHome: '/codex-home-slot',
    user: 'user-slot',
    lang: 'lang-slot',
    tmpdir: '/tmp-slot',
  },
  modelPins: { model: 'model-slot', effort: 'high' },
};

/**
 * A whole turn on the given thread, as `codex exec --json` emits it.
 */
function repliedOn(thread: string): CodexRun {
  return {
    kind: 'exited',
    code: 0,
    stdout: [
      { type: 'thread.started', thread_id: thread },
      { type: 'turn.started' },
      { type: 'item.completed', item: { type: 'agent_message', text: 'reply' } },
      { type: 'turn.completed', usage: {} },
    ]
      .map((event) => JSON.stringify(event))
      .join('\n'),
    stderr: '',
  };
}

/**
 * Ports whose root check returns one constant result and whose runner
 * returns one constant run; both record what they were given.
 */
function portsReturning(
  run: CodexRun,
  root: Result<void, string> = ok(undefined),
): TurnPorts & { readonly checkedRoots: string[]; readonly calls: CodexCall[] } {
  const checkedRoots: string[] = [];
  const calls: CodexCall[] = [];
  return {
    checkedRoots,
    calls,
    checkRoot: (path) => {
      checkedRoots.push(path);
      return root;
    },
    runCodex: (call) => {
      calls.push(call);
      return run;
    },
  };
}

describe('executeTurn', () => {
  it.each<[string, TurnRequest, readonly string[]]>([
    [
      'opens a thread',
      { prompt: 'packet', thread: undefined, timeoutMs: 5000 },
      buildOpenArgv('/root-slot', context.modelPins),
    ],
    [
      'resumes the requested thread',
      { prompt: 'next packet', thread: threadId(), timeoutMs: 7000 },
      buildResumeArgv(threadId(), context.modelPins),
    ],
  ])(
    '%s inside the envelope, from the checked instrument root, with the prompt on stdin',
    (_label, request, argv) => {
      const ports = portsReturning(repliedOn(THREAD));
      const verdict = executeTurn(request, context, BINARY, ports);
      expect(ports.checkedRoots).toStrictEqual(['/root-slot']);
      expect(ports.calls).toStrictEqual([
        {
          executable: BINARY.executablePath,
          argv,
          cwd: '/root-slot',
          env: buildChildEnv(context.childEnvInputs),
          stdin: request.prompt,
          timeoutMs: request.timeoutMs,
        },
      ]);
      expect(verdict).toStrictEqual({
        ok: true,
        value: { threadId: THREAD, message: 'reply', messages: ['reply'], commandExecutions: [] },
      });
    },
  );

  it('refuses a resumed turn that Codex answers on another thread', () => {
    const ports = portsReturning(repliedOn(OTHER_THREAD));
    const verdict = executeTurn(
      { prompt: 'next', thread: threadId(), timeoutMs: 5000 },
      context,
      BINARY,
      ports,
    );
    expect(verdict).toMatchObject({ ok: false, error: { kind: 'thread-mismatch' } });
  });

  it('starts no Codex process when the instrument root is not fit for a spawn', () => {
    const ports = portsReturning(repliedOn(THREAD), err('root holds an entry: .logs'));
    const verdict = executeTurn(
      { prompt: 'packet', thread: undefined, timeoutMs: 5000 },
      context,
      BINARY,
      ports,
    );
    const notReady: TurnError = { kind: 'root-not-ready', reason: 'root holds an entry: .logs' };
    expect(verdict).toStrictEqual({ ok: false, error: notReady });
    expect(ports.calls).toStrictEqual([]);
  });
});
