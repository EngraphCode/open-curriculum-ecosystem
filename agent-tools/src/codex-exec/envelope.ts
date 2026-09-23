import { err, ok, type Result } from '@oaknational/result';

import {
  createTopLevelTomlBasicStringReader,
  type TopLevelTomlBasicStringReader,
} from '../core/toml-top-level-basic-string.js';

declare const threadIdBrand: unique symbol;

/**
 * A Codex thread id, known to be a lowercase UUID.
 *
 * `codex exec resume` also accepts thread names, so only a UUID-shaped value
 * may reach its argv; anything else could inject an option.
 */
export type ThreadId = string & { readonly [threadIdBrand]: true };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function isThreadId(value: string): value is ThreadId {
  return UUID_PATTERN.test(value);
}

/**
 * Accept a thread id only when it is a lowercase UUID of any version.
 */
export function parseThreadId(raw: string): Result<ThreadId, string> {
  return isThreadId(raw) ? ok(raw) : err('a thread id must be a lowercase UUID');
}

/**
 * The reasoning efforts the CLI accepts, as a closed set; an effort outside
 * it fails closed rather than reaching the argv.
 */
const REASONING_EFFORTS = [
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
  'ultra',
  'persistent',
] as const;

type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

/**
 * The owner's configured model and effort, carried into every dialogue call.
 * An absent key means the CLI default for that key.
 */
export interface ModelPins {
  readonly model?: string;
  readonly effort?: ReasoningEffort;
}

/**
 * Why the owner's configuration could not supply the model pins. It never
 * carries the configuration's text, which can hold secrets.
 */
export type ModelPinsError =
  { readonly kind: 'unparseable-config' } | { readonly kind: 'invalid-model-pin' };

const MODEL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

/**
 * Read `model` and `model_reasoning_effort` from the owner's Codex
 * configuration text, and nothing else from it.
 *
 * @param configText - The configuration file's text, or undefined when it does not exist.
 */
export function parseModelPins(configText: string | undefined): Result<ModelPins, ModelPinsError> {
  if (configText === undefined) {
    return ok({});
  }
  const reader = readConfigQuietly(configText);
  if (reader === undefined) {
    return err({ kind: 'unparseable-config' });
  }
  const model = readPin(reader, 'model', (value) =>
    MODEL_PATTERN.test(value) ? value : undefined,
  );
  const effort = readPin(reader, 'model_reasoning_effort', (value) =>
    REASONING_EFFORTS.find((candidate) => candidate === value),
  );
  if (!model.ok || !effort.ok) {
    return err({ kind: 'invalid-model-pin' });
  }
  return ok({
    ...(model.value === undefined ? {} : { model: model.value }),
    ...(effort.value === undefined ? {} : { effort: effort.value }),
  });
}

function readConfigQuietly(configText: string): TopLevelTomlBasicStringReader | undefined {
  try {
    return createTopLevelTomlBasicStringReader(configText);
  } catch {
    return undefined;
  }
}

/**
 * Read one optional top-level string key through a validator. A missing key
 * is no pin; a present key that is not a valid string fails closed.
 */
function readPin<T>(
  reader: TopLevelTomlBasicStringReader,
  key: string,
  validate: (value: string) => T | undefined,
): Result<T | undefined, 'invalid'> {
  const state = reader.inspect(key);
  if (state.kind === 'missing') {
    return ok(undefined);
  }
  const valid = state.kind === 'string' ? validate(state.value) : undefined;
  return valid === undefined ? err('invalid') : ok(valid);
}

/**
 * Flags every dialogue call carries, on open and on resume. Each one closes
 * an authority channel the read-only sandbox does not govern. Re-adjudicate
 * the authority envelope (ADR-180 §6) before changing any of them.
 */
const ENVELOPE_FLAGS = [
  '--json',
  '--ignore-user-config',
  '--ignore-rules',
  '--skip-git-repo-check',
  '--disable',
  'memories',
  '--disable',
  'shell_snapshot',
] as const;

/**
 * Settings every dialogue call restates on every turn, because a resumed
 * turn takes no `--sandbox` or `--cd` and per-turn overrides can carry over.
 */
const ENVELOPE_SETTINGS = [
  '-c',
  'sandbox_mode="read-only"',
  '-c',
  'approval_policy="never"',
  '-c',
  'web_search="disabled"',
  '-c',
  'project_root_markers=[]',
  '-c',
  'shell_environment_policy.inherit="core"',
  '-c',
  'allow_login_shell=false',
] as const;

function modelPinArgs(pins: ModelPins): readonly string[] {
  return [
    ...(pins.model === undefined ? [] : ['-c', `model=${JSON.stringify(pins.model)}`]),
    ...(pins.effort === undefined
      ? []
      : ['-c', `model_reasoning_effort=${JSON.stringify(pins.effort)}`]),
  ];
}

/**
 * The argv that opens a dialogue thread. The prompt goes on stdin (`-`), and
 * no caller argument can add to or alter the envelope.
 *
 * @param instrumentRoot - The instrument's empty working root, also the spawn's cwd.
 */
export function buildOpenArgv(instrumentRoot: string, pins: ModelPins): readonly string[] {
  return [
    'exec',
    ...ENVELOPE_FLAGS,
    '-C',
    instrumentRoot,
    ...ENVELOPE_SETTINGS,
    ...modelPinArgs(pins),
    '-',
  ];
}

/**
 * The argv that continues an existing dialogue thread. `resume` takes no
 * `-C`, so the spawn's cwd must be the same instrument root.
 */
export function buildResumeArgv(threadId: ThreadId, pins: ModelPins): readonly string[] {
  return [
    'exec',
    'resume',
    threadId,
    ...ENVELOPE_FLAGS,
    ...ENVELOPE_SETTINGS,
    ...modelPinArgs(pins),
    '-',
  ];
}

/**
 * The fixed system PATH the child sees, so no seat PATH entry can steer
 * which programs the interlocutor's shell finds.
 */
const CHILD_PATH = '/usr/bin:/bin:/usr/sbin:/sbin';

/**
 * The child's whole environment, as a closed shape: never the seat's.
 */
export interface ChildEnv {
  readonly HOME: string;
  readonly USER: string;
  readonly LOGNAME: string;
  readonly LANG: string;
  readonly TMPDIR: string;
  readonly PATH: string;
  readonly CODEX_HOME: string;
}

/**
 * What the composition root resolves for the child environment.
 */
export interface ChildEnvInputs {
  readonly instrumentHome: string;
  readonly instrumentCodexHome: string;
  readonly user: string;
  readonly lang: string;
  readonly tmpdir: string;
}

/**
 * Build the child environment from an allowlist. Both homes are the
 * instrument's own, so none of the owner's shell startup files or Codex
 * setup can load, and no seat `CODEX_*`, `OPENAI_*` or proxy variable passes.
 */
export function buildChildEnv(inputs: ChildEnvInputs): ChildEnv {
  return {
    HOME: inputs.instrumentHome,
    USER: inputs.user,
    LOGNAME: inputs.user,
    LANG: inputs.lang,
    TMPDIR: inputs.tmpdir,
    PATH: CHILD_PATH,
    CODEX_HOME: inputs.instrumentCodexHome,
  };
}
