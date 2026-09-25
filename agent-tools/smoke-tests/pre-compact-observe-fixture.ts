/**
 * Shared fixtures for the `PreCompact` observer smoke: the registered
 * command, the throwaway project it runs in, the harness-shaped run, the
 * payload, and the assertions every run must pass.
 */
import assert from 'node:assert/strict';
import {
  spawnSync,
  type SpawnSyncOptionsWithStringEncoding,
  type SpawnSyncReturns,
} from 'node:child_process';
import {
  closeSync,
  constants,
  fstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  symlinkSync,
} from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { trustedShellPath } from './trusted-shell-directories.js';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

/** The prefix on every answer's `systemMessage`. */
const ANSWER_PREFIX = '[pre-compact-observe] ';

/** The observer's log directory, under the project directory. */
export const OBSERVATION_DIRECTORY = '.claude/logs/pre-compact-observe';

/** The observer's log file, under the project directory. */
export const OBSERVATION_LOG = `${OBSERVATION_DIRECTORY}/observations.jsonl`;

/** The throwaway project's scratch `bin/`, holding only a `node` symlink. */
const SCRATCH_BIN = 'bin';

/** Mechanics, not an assertion: long enough never to cut a healthy run short. */
const RUN_TIMEOUT_MS = 60_000;

/** The `PreCompact` registrations in `.claude/settings.json`; its other keys are dropped. */
const settingsSchema = z.object({
  hooks: z.object({
    PreCompact: z.array(
      z.object({ hooks: z.array(z.object({ type: z.literal('command'), command: z.string() })) }),
    ),
  }),
});

/** The answer: exactly `continue: true` and a prefixed message; any other key fails. */
const answerSchema = z.strictObject({
  continue: z.literal(true),
  systemMessage: z.string().startsWith(ANSWER_PREFIX),
});

/** The fields of the log line the smoke asserts; the full record is the unit tests'. */
const observationSchema = z.object({
  marker: z.string(),
  payload: z.object({ status: z.string() }),
  stdin: z.object({ readError: z.string().optional() }),
  transcriptBytes: z.number().optional(),
  siblings: z.object({
    entries: z.array(z.object({ name: z.string(), kind: z.string(), size: z.number().optional() })),
    count: z.number().optional(),
  }),
});

/** The fields of one log line the smoke asserts. */
export type LoggedObservation = z.output<typeof observationSchema>;

/**
 * The one command `.claude/settings.json` registers for `PreCompact`.
 *
 * @returns The command text; the smoke fails when none or several are registered.
 */
export function registeredPreCompactCommand(): string {
  const text = readFileSync(join(repoRoot, '.claude', 'settings.json'), 'utf8');
  const parsed: unknown = JSON.parse(text);
  const settings = settingsSchema.parse(parsed);
  const commands = settings.hooks.PreCompact.flatMap((group) =>
    group.hooks.map((hook) => hook.command),
  );
  if (commands.length !== 1) {
    assert.fail(`expected exactly one PreCompact command, found ${commands.length}`);
  }
  return commands[0];
}

/**
 * Run the work in a fresh throwaway project, then remove it.
 *
 * @remarks
 * The project's name holds a space. Its real `.claude/` holds one symlink,
 * `hooks`, to the repository's `.claude/hooks`; `agent-tools` links to the
 * repository's `agent-tools`; and `bin/` holds only a `node` symlink to the
 * running Node. It is removed with `fs.rm`, which unlinks each symlink and
 * never follows it. Never walk this tree by hand: following the links would
 * delete the real workspace.
 *
 * @param run - The case, given the project's path.
 */
export async function inThrowawayProject(run: (project: string) => void): Promise<void> {
  const project = mkdtempSync(join(tmpdir(), 'pre-compact observe '));
  try {
    mkdirSync(join(project, '.claude'));
    symlinkSync(join(repoRoot, '.claude', 'hooks'), join(project, '.claude', 'hooks'));
    symlinkSync(join(repoRoot, 'agent-tools'), join(project, 'agent-tools'));
    mkdirSync(join(project, SCRATCH_BIN));
    symlinkSync(process.execPath, join(project, SCRATCH_BIN, 'node'));
    run(project);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
}

/**
 * Run the registered command through `/bin/sh -c`, as the harness does.
 *
 * @remarks
 * The environment holds only `CLAUDE_PROJECT_DIR` and `PATH`. `PATH` is the
 * scratch `bin/`, which can supply nothing but `node`, then the trusted shell
 * directories, so nothing beside the running Node can shadow the wrapper's
 * `bash`, `mktemp` or `sed`, and no system `node` can stand in for it.
 *
 * @param command - The registered command text.
 * @param project - The throwaway project, the run's working directory.
 * @param stdin - A string for a pipe, or a descriptor, as the child's stdin.
 * @returns The finished run.
 */
export function runRegisteredCommand(
  command: string,
  project: string,
  stdin: Pick<SpawnSyncOptionsWithStringEncoding, 'input' | 'stdio'>,
): SpawnSyncReturns<string> {
  return spawnSync('/bin/sh', ['-c', command], {
    ...stdin,
    cwd: project,
    env: {
      CLAUDE_PROJECT_DIR: project,
      PATH: [join(project, SCRATCH_BIN), trustedShellPath()].join(delimiter),
    },
    encoding: 'utf8',
    timeout: RUN_TIMEOUT_MS,
  });
}

/**
 * A `PreCompact` payload in the shape the harness sends, `scratchpad_dir`
 * and `prompt_id` included.
 *
 * @param project - The throwaway project, as `cwd`.
 * @param transcriptPath - The `transcript_path` to send.
 * @param customInstructions - The text after `/compact`; `null` for a bare one.
 * @returns The payload's JSON text.
 */
export function compactPayload(
  project: string,
  transcriptPath: string,
  customInstructions: string | null,
): string {
  return JSON.stringify({
    session_id: 'pre-compact-observe-smoke',
    transcript_path: transcriptPath,
    cwd: project,
    prompt_id: 'pre-compact-observe-smoke-prompt',
    hook_event_name: 'PreCompact',
    trigger: 'manual',
    custom_instructions: customInstructions,
    scratchpad_dir: join(project, 'scratchpad'),
  });
}

/** The text's only line, without its newline; fails unless the text is exactly one line. */
function onlyLine(text: string, source: string): string {
  assert.match(
    text,
    /^[^\n]+\n$/u,
    `expected exactly one line on ${source}: ${JSON.stringify(text)}`,
  );
  return text.slice(0, -1);
}

/**
 * Assert what every run must show, and read its log line.
 *
 * @remarks
 * Exit 0 and no stderr; one stdout line whose message is the prefix and the
 * log line's marker, so the probe answer, not the fail-open one; and one log
 * line, in a regular file at 0o600.
 *
 * @param result - The finished run.
 * @param project - The throwaway project the run observed into.
 * @returns The asserted fields of the one log line.
 */
export function assertObservedRun(
  result: SpawnSyncReturns<string>,
  project: string,
): LoggedObservation {
  assert.equal(
    result.error,
    undefined,
    `the run failed (EPIPE means the hook stopped reading stdin early): ${String(result.error)}`,
  );
  assert.equal(
    result.status,
    0,
    `exit ${String(result.status)} (${String(result.signal)}): ${result.stderr}`,
  );
  assert.equal(result.stderr, '', 'expected nothing on stderr');
  const answerLine: unknown = JSON.parse(onlyLine(result.stdout, 'stdout'));
  const answer = answerSchema.parse(answerLine);
  const observation = readObservation(join(project, OBSERVATION_LOG), answer.systemMessage);
  assert.equal(answer.systemMessage, `${ANSWER_PREFIX}${observation.marker}`);
  return observation;
}

/**
 * Open the observation log once, never through a symlink at its name, then
 * check and parse through that one descriptor, closed on every path.
 *
 * @param logPath - The observation log under the throwaway project.
 * @param systemMessage - The hook's answer, shown when there is no log.
 * @returns The asserted fields of the one log line.
 */
function readObservation(logPath: string, systemMessage: string): LoggedObservation {
  let log: number;
  try {
    log = openSync(logPath, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch (error) {
    return assert.fail(`no observation log (${String(error)}); the answer was: ${systemMessage}`);
  }
  try {
    const logEntry = fstatSync(log);
    assert.ok(logEntry.isFile(), 'the observation log is not a regular file');
    assert.equal(logEntry.mode & 0o777, 0o600, 'the observation log is not at 0o600');
    const logLine: unknown = JSON.parse(onlyLine(readFileSync(log, 'utf8'), 'the log'));
    return observationSchema.parse(logLine);
  } finally {
    closeSync(log);
  }
}
