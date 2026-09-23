import { err, type Result } from '@oaknational/result';

import {
  buildOpenArgv,
  buildResumeArgv,
  type ChildEnv,
  type ModelPins,
  type ThreadId,
} from './envelope.js';
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
  /** The resolved real path of the `codex` executable. */
  readonly codexExecutable: string;
  /** The instrument's empty working root, the cwd of every spawn. */
  readonly instrumentRoot: string;
  readonly childEnv: ChildEnv;
  readonly modelPins: ModelPins;
}

/**
 * The effects a turn needs, injected.
 */
export interface TurnPorts {
  /** Confirms the instrument root is fit for a spawn, or says why not. */
  readonly checkRoot: () => Result<void, string>;
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
 * Run one dialogue turn inside the fixed call envelope and judge it. No field
 * of the request reaches the argv except the prompt (on stdin) and a thread
 * id already parsed as a UUID.
 */
export function executeTurn(
  request: TurnRequest,
  context: TurnContext,
  ports: TurnPorts,
): Result<TurnOutcome, TurnError> {
  const root = ports.checkRoot();
  if (!root.ok) {
    return err({ kind: 'root-not-ready', reason: root.error });
  }
  const argv =
    request.thread === undefined
      ? buildOpenArgv(context.instrumentRoot, context.modelPins)
      : buildResumeArgv(request.thread, context.modelPins);
  const run = ports.runCodex({
    executable: context.codexExecutable,
    argv,
    cwd: context.instrumentRoot,
    env: context.childEnv,
    stdin: request.prompt,
    timeoutMs: request.timeoutMs,
  });
  return judgeTurn(run, request.thread);
}
