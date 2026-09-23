import { err, ok, type Result } from '@oaknational/result';

import type { ModelPins } from './model-pins.js';

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
 * Flags every dialogue call carries, on open and on resume. `--json` selects
 * the event stream the verdict reads. `--skip-git-repo-check` relaxes the
 * CLI's git-repository guard, deliberately, so the call can run from the
 * empty root, which is not a repository. Each of the others closes an
 * authority channel the read-only sandbox does not govern: the owner's Codex
 * configuration, the exec-policy rules, memories and the shell snapshot.
 * Re-adjudicate the authority envelope (ADR-180 §6) before changing any.
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
 * Re-adjudicate the authority envelope (ADR-180 §6) before changing any.
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
 * @param instrumentRoot - The instrument's empty working root, which must also be the spawn's cwd.
 * @param pins - The validated model pins, each carried as one `-c` value.
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
 *
 * @param threadId - The thread to continue, already parsed as a UUID.
 * @param pins - The validated model pins, each carried as one `-c` value.
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
 * which programs the interlocutor's shell finds. Part of the authority
 * envelope (ADR-180 §6).
 */
const CHILD_PATH = '/usr/bin:/bin:/usr/sbin:/sbin';

type ChildEnvKey = 'HOME' | 'USER' | 'LOGNAME' | 'LANG' | 'TMPDIR' | 'PATH' | 'CODEX_HOME';

/**
 * The child's whole environment: exactly these names, never the seat's.
 * `executeTurn` builds it from its inputs, so no caller hands a spawn any
 * other. A keyed record rather than an interface, so it is assignable to the
 * process environment a spawn takes.
 */
export type ChildEnv = Readonly<Record<ChildEnvKey, string>>;

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
 * Build the child environment from an allowlist. The caller supplies the
 * instrument's own homes, so none of the owner's shell startup files or
 * Codex setup can load. No seat `CODEX_*`, `OPENAI_*` or proxy variable
 * passes. Re-adjudicate the authority envelope (ADR-180 §6) before changing
 * it.
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
