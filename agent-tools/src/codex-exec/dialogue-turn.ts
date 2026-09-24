import { err, type Result } from '@oaknational/result';

import {
  appendCleanupRows,
  threadsCreated,
  type CleanupRow,
  type CleanupRowUnwritten,
  type DialogueId,
} from './cleanup-row.js';
import {
  buildChildEnv,
  buildOpenArgv,
  buildResumeArgv,
  type ChildEnv,
  type ChildEnvInputs,
  type ThreadId,
} from './envelope.js';
import type { ResolvedBinary } from './gate.js';
import type { ModelPins } from './model-pins.js';
import { judgeTurn, type CodexRun, type TurnFailure, type TurnOutcome } from './turn-verdict.js';

/**
 * One call to the Codex executable, as data. The runner that performs it
 * belongs to the IO edge.
 */
export interface CodexCall {
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly env: ChildEnv;
  readonly stdin: string;
  readonly timeoutMs: number;
}

/**
 * What the composition root resolves once and every turn uses.
 */
export interface TurnContext {
  /** The instrument's empty working root, the cwd of every spawn. */
  readonly instrumentRoot: string;
  /**
   * What the child environment is built from. The turn builds the
   * environment itself, so no caller can hand a spawn any other.
   */
  readonly childEnvInputs: ChildEnvInputs;
  readonly modelPins: ModelPins;
}

/**
 * The effects a turn needs, injected.
 */
export interface TurnPorts {
  /** Confirms the given instrument root is fit for a spawn, or says why not. */
  readonly checkRoot: (root: string) => Result<void, string>;
  /** Runs one call to completion, synchronously, and reports what the process did. */
  readonly runCodex: (call: CodexCall) => CodexRun;
  /** Reads the clock, for the time a cleanup row records. */
  readonly now: () => Date;
  /** Appends one row to the dialogues' cleanup map, or says why not. */
  readonly appendCleanupRow: (row: CleanupRow) => Result<void, string>;
}

/**
 * One dialogue turn. An opening turn names its dialogue, so each thread it
 * starts gets a cleanup row; a resumed turn names the thread it continues,
 * and starts none.
 */
export type TurnRequest =
  | {
      readonly kind: 'open';
      readonly dialogueId: DialogueId;
      readonly prompt: string;
      readonly timeoutMs: number;
    }
  | {
      readonly kind: 'resume';
      readonly thread: ThreadId;
      readonly prompt: string;
      readonly timeoutMs: number;
    };

/**
 * A turn's failure: the verdict's reasons, an instrument root that is not
 * fit for a spawn, which stops the turn before Codex starts, and a thread
 * whose cleanup row could not be written.
 */
export type TurnError =
  TurnFailure | { readonly kind: 'root-not-ready'; readonly reason: string } | CleanupRowUnwritten;

/**
 * Run one dialogue turn inside the fixed call envelope and judge it, with no
 * gate: `runTurn` is the gated route, and the probe reaches this directly.
 * The root checked is the root the spawn runs in. Of the request, only the
 * thread id, already parsed as a UUID, reaches the argv; the prompt goes on
 * stdin and the timeout to the runner.
 *
 * An opening turn writes a cleanup row for every thread it started before
 * the turn is judged, so a turn that fails or is killed leaves no thread
 * without a row. A row that cannot be written fails the turn.
 *
 * @param request - The turn: open a dialogue's thread, or resume one.
 * @param context - What the composition root resolved once for every turn.
 * @param binary - The `codex` binary as resolved once; the turn spawns its real path.
 * @param ports - The root check, the runner, the clock and the cleanup map.
 */
export function executeTurn(
  request: TurnRequest,
  context: TurnContext,
  binary: ResolvedBinary,
  ports: TurnPorts,
): Result<TurnOutcome, TurnError> {
  const root = ports.checkRoot(context.instrumentRoot);
  if (!root.ok) {
    return err({ kind: 'root-not-ready', reason: root.error });
  }
  const argv =
    request.kind === 'open'
      ? buildOpenArgv(context.instrumentRoot, context.modelPins)
      : buildResumeArgv(request.thread, context.modelPins);
  const run = ports.runCodex({
    executable: binary.executablePath,
    argv,
    cwd: context.instrumentRoot,
    env: buildChildEnv(context.childEnvInputs),
    stdin: request.prompt,
    timeoutMs: request.timeoutMs,
  });
  if (request.kind === 'resume') {
    return judgeTurn(run, request.thread);
  }
  const rows = appendCleanupRows(
    request.dialogueId,
    threadsCreated(run),
    ports.now().toISOString(),
    ports.appendCleanupRow,
  );
  if (!rows.ok) {
    return err(rows.error);
  }
  return judgeTurn(run, undefined);
}
