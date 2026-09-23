import { err, ok, type Result } from '@oaknational/result';

import { parseThreadId, type ThreadId } from './envelope.js';
import { readTurnEvents } from './parse-events.js';
import type { CommandExecution, TurnEvents } from './types.js';

/**
 * What one `codex` process did, as plain data: the runner maps the process
 * result into this shape, so the verdict never touches a process handle.
 */
export type CodexRun =
  | {
      readonly kind: 'exited';
      readonly code: number;
      readonly stdout: string;
      readonly stderr: string;
    }
  | {
      readonly kind: 'killed';
      readonly reason: 'timeout' | 'signal' | 'overflow';
      readonly stderr: string;
    }
  | { readonly kind: 'unlaunchable'; readonly message: string };

/**
 * A turn that completed on the expected thread with a reply.
 */
export interface TurnOutcome {
  readonly threadId: ThreadId;
  /** The last agent message: the reply. */
  readonly message: string;
  /** Every agent message of the turn, in order, for the record. */
  readonly messages: readonly string[];
  readonly commandExecutions: readonly CommandExecution[];
}

/**
 * Why a turn did not count. Each reason is distinct so the CLI can report it
 * and the probe can judge it.
 */
export type TurnFailure =
  | { readonly kind: 'unlaunchable'; readonly message: string }
  | { readonly kind: 'killed'; readonly reason: 'timeout' | 'signal' | 'overflow' }
  | { readonly kind: 'nonzero-exit'; readonly code: number; readonly stderrTail: string }
  | { readonly kind: 'unparseable-output'; readonly lines: number }
  | { readonly kind: 'turn-failed'; readonly messages: readonly string[] }
  | { readonly kind: 'no-thread-id' }
  | { readonly kind: 'invalid-thread-id' }
  | {
      readonly kind: 'thread-mismatch';
      readonly expected: ThreadId | undefined;
      readonly actual: readonly string[];
    }
  | { readonly kind: 'no-agent-message' };

export type TurnVerdict = Result<TurnOutcome, TurnFailure>;

const STDERR_TAIL_LENGTH = 500;

/**
 * Judge one run of `codex exec` or `codex exec resume`.
 *
 * @param run - What the process did.
 * @param requested - The thread a resumed turn must continue; undefined when opening.
 */
export function judgeTurn(run: CodexRun, requested: ThreadId | undefined): TurnVerdict {
  if (run.kind === 'unlaunchable') {
    return err({ kind: 'unlaunchable', message: run.message });
  }
  if (run.kind === 'killed') {
    return err({ kind: 'killed', reason: run.reason });
  }
  if (run.code !== 0) {
    return err({
      kind: 'nonzero-exit',
      code: run.code,
      stderrTail: run.stderr.slice(-STDERR_TAIL_LENGTH),
    });
  }
  return judgeEvents(readTurnEvents(run.stdout.split('\n')), requested);
}

function judgeEvents(events: TurnEvents, requested: ThreadId | undefined): TurnVerdict {
  if (events.unparseableLines > 0) {
    return err({ kind: 'unparseable-output', lines: events.unparseableLines });
  }
  if (events.failures.length > 0) {
    return err({ kind: 'turn-failed', messages: events.failures });
  }
  const thread = judgeThread(events.threadIds, requested);
  if (!thread.ok) {
    return thread;
  }
  const message = events.agentMessages.at(-1);
  if (message === undefined) {
    return err({ kind: 'no-agent-message' });
  }
  return ok({
    threadId: thread.value,
    message,
    messages: events.agentMessages,
    commandExecutions: events.commandExecutions,
  });
}

/**
 * A turn names exactly one thread; a resumed turn names the requested one.
 */
function judgeThread(
  threadIds: readonly string[],
  requested: ThreadId | undefined,
): Result<ThreadId, TurnFailure> {
  const distinct = [...new Set(threadIds)];
  const [only] = distinct;
  if (only === undefined) {
    return err({ kind: 'no-thread-id' });
  }
  const mismatched = distinct.length > 1 || (requested !== undefined && only !== requested);
  if (mismatched) {
    return err({ kind: 'thread-mismatch', expected: requested, actual: distinct });
  }
  const parsed = parseThreadId(only);
  return parsed.ok ? ok(parsed.value) : err({ kind: 'invalid-thread-id' });
}
