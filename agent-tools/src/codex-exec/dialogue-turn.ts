import { err, type Result } from '@oaknational/result';

import {
  buildChildEnv,
  buildOpenArgv,
  buildResumeArgv,
  type ChildEnv,
  type ChildEnvInputs,
  type ThreadId,
} from './envelope.js';
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
}

/**
 * One dialogue turn: open a thread when `thread` is undefined, else resume it.
 */
export interface TurnRequest {
  readonly prompt: string;
  readonly thread: ThreadId | undefined;
  readonly timeoutMs: number;
}

/**
 * A turn's failure: the verdict's reasons, plus an instrument root that is
 * not fit for a spawn, which stops the turn before Codex starts.
 */
export type TurnError = TurnFailure | { readonly kind: 'root-not-ready'; readonly reason: string };

/**
 * Run one dialogue turn inside the fixed call envelope and judge it, with no
 * gate: `runTurn` is the gated route, and the probe reaches this directly.
 * The root checked is the root the spawn runs in. Of the request, only the
 * thread id, already parsed as a UUID, reaches the argv; the prompt goes on
 * stdin and the timeout to the runner.
 *
 * @param request - The turn: its prompt, its thread (undefined to open one) and its timeout.
 * @param context - What the composition root resolved once for every turn.
 * @param executablePath - The resolved real path of the `codex` binary this turn spawns.
 * @param ports - The root check and the runner.
 */
export function executeTurn(
  request: TurnRequest,
  context: TurnContext,
  executablePath: string,
  ports: TurnPorts,
): Result<TurnOutcome, TurnError> {
  const root = ports.checkRoot(context.instrumentRoot);
  if (!root.ok) {
    return err({ kind: 'root-not-ready', reason: root.error });
  }
  const argv =
    request.thread === undefined
      ? buildOpenArgv(context.instrumentRoot, context.modelPins)
      : buildResumeArgv(request.thread, context.modelPins);
  const run = ports.runCodex({
    executable: executablePath,
    argv,
    cwd: context.instrumentRoot,
    env: buildChildEnv(context.childEnvInputs),
    stdin: request.prompt,
    timeoutMs: request.timeoutMs,
  });
  return judgeTurn(run, request.thread);
}
