#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { writeLine, writeErrorLine } from '../core/terminal-output.js';

export type {
  RepoCheckCommandResult,
  RepoCheckRuntime,
  CheckProfileFailurePhase,
  PostTurboGateStatus,
  CheckProfileEnvironmentEvidence,
  CheckProfileArtifact,
} from './repo-check-profile.js';

export {
  collectProfileEnvironmentEvidence,
  classifyCheckFailurePhase,
  profilePostTurboGateStatus,
  buildCheckProfileArtifact,
  defaultRuntime,
} from './repo-check-profile.js';

import {
  defaultRuntime,
  type RepoCheckCommandResult,
  type RepoCheckRuntime,
} from './repo-check-profile.js';

export {
  runMarkdownlintStaged,
  runMarkdownlintTracked,
  runPrettierStaged,
  runPrettierTracked,
} from './repo-check-gates.js';

import {
  runMarkdownlintStaged,
  runMarkdownlintTracked,
  runPrettierStaged,
  runPrettierTracked,
} from './repo-check-gates.js';
import { runProfile } from './repo-check-runner.js';
import { runShellcheckTracked } from './repo-check-shellcheck.js';

function usage(): string {
  return [
    'Usage: pnpm agent-tools:repo-check <command>',
    '',
    'Commands:',
    '  knip-gate              Run knip; fail loudly when a crash is swallowed behind exit 0 (F-147).',
    '  markdownlint-staged    Run markdownlint on staged Markdown files only.',
    '  markdownlint-tracked [--fix]',
    "                         Run markdownlint on every Markdown file in git's index (the root gate);",
    '                         a staged new file counts, an untracked one does not.',
    '  prettier-staged        Run Prettier on staged files only.',
    '  prettier-tracked [--write]',
    "                         Run Prettier on every file in git's index (the root gate);",
    '                         a staged new file counts, an untracked one does not.',
    '  profile [--dry-run] [--capture-output]',
    '                         Capture the pnpm check Turbo graph and, unless dry-run is set, time pnpm check.',
    '                         --capture-output stores pnpm check stdout/stderr beside the profile artifact.',
    '  shellcheck-tracked     Run shellcheck on every tracked shell script outside the vendored skills;',
    '                         fail on any finding, silencing directive, unrecognised shebang or missing',
    '                         bash floor, or when .tools/bin or PATH has no pinned shellcheck.',
  ].join('\n');
}

// knip reports per-workspace plugin-config load failures via a bare
// console.error ("ERROR: Error loading <path> (<cause>)") without recording an
// issue or throwing, then exits 0 — so a crashed analysis reads as a passing
// gate (frictions register F-147). The gate must run knip CAPTURED and treat
// any such swallowed-crash signature on a zero exit as a loud failure: a crash
// suppresses the very analysis that could find issues, so exit 0 lies twice.
// \p{Cc} (a control character) followed by "[<codes>m" is an ANSI SGR sequence;
// the property class expresses the ESC byte without a control char in the source.
const ANSI_ESCAPE_PATTERN = /\p{Cc}\[[0-9;]*m/gu;
// Match the exact F-147 signature (knip's WorkspaceWorker logError line), not
// any `ERROR:`-prefixed output — an unrelated ERROR line from a successfully
// loaded config must stay a clean pass, never a false-red gate.
const KNIP_SWALLOWED_CRASH_PATTERN = /^ERROR: Error loading /mu;

/**
 * Crash-class discriminator (F-112): knip always prints its verdict, so a
 * non-zero run that never spoke — or a null status, meaning a signal kill —
 * is a crash class, not a finding. The diagnosis line goes to STDOUT by
 * default: under the F-112 failure this line exists for, the hook chain's
 * stderr is the poisoned stream and writes to it vanish (observed
 * first-hand 2026-08-07, push path); stdout was the channel that survived.
 */
function knipCrashDiagnosis(result: RepoCheckCommandResult): string | null {
  const spoke = result.stdout.length > 0 || result.stderr.length > 0;
  if (result.status !== null && spoke) {
    return null;
  }
  return (
    'repo-check knip-gate: the knip child died without a verdict — ' +
    `status=${String(result.status)} signal=${String(result.signal)} ` +
    `stdout=${result.stdout.length}B stderr=${result.stderr.length}B ` +
    '(crash class, not unused code — F-112 names the pipe-backed-stdio mechanism to check first)'
  );
}

/** Forward the captured streams so a knip verdict reaches the operator verbatim. */
function reemitCapturedStreams(result: RepoCheckCommandResult): void {
  if (result.stdout.length > 0) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr.length > 0) {
    process.stderr.write(result.stderr);
  }
}

export async function runKnipGate(
  runtime: RepoCheckRuntime = defaultRuntime,
  emitDiagnostic: (line: string) => void = writeLine,
): Promise<number> {
  const result = runtime.runCaptured('pnpm', ['exec', 'knip']);
  reemitCapturedStreams(result);

  const status = result.status ?? 1;
  if (status !== 0) {
    const diagnosis = knipCrashDiagnosis(result);
    if (diagnosis !== null) {
      emitDiagnostic(diagnosis);
    }
    return status;
  }

  const plainOutput = `${result.stdout}\n${result.stderr}`.replaceAll(ANSI_ESCAPE_PATTERN, '');
  if (KNIP_SWALLOWED_CRASH_PATTERN.test(plainOutput)) {
    writeErrorLine(
      'repo-check knip-gate: knip exited 0 but reported a crash-class error above (F-147); ' +
        'a crashed analysis cannot count as a pass — failing the gate.',
    );
    return 1;
  }

  return 0;
}

interface RepoCheckCommand {
  /** The flags the command understands; anything else is rejected with usage. */
  readonly flags: ReadonlySet<string>;
  readonly run: (args: readonly string[]) => Promise<number>;
}

const NO_FLAGS: ReadonlySet<string> = new Set();

/** The command table: a Map, so a prototype key can never resolve to a non-command. */
const COMMANDS: ReadonlyMap<string, RepoCheckCommand> = new Map<string, RepoCheckCommand>([
  ['knip-gate', { flags: NO_FLAGS, run: () => runKnipGate() }],
  ['markdownlint-staged', { flags: NO_FLAGS, run: () => runMarkdownlintStaged() }],
  [
    'markdownlint-tracked',
    {
      flags: new Set(['--fix']),
      run: (args) => runMarkdownlintTracked(args.includes('--fix') ? 'fix' : 'check'),
    },
  ],
  ['prettier-staged', { flags: NO_FLAGS, run: () => runPrettierStaged() }],
  [
    'prettier-tracked',
    {
      flags: new Set(['--write']),
      run: (args) => runPrettierTracked(args.includes('--write') ? 'write' : 'check'),
    },
  ],
  // profile reads its own flags; they are listed here too, so a new one needs both.
  [
    'profile',
    { flags: new Set(['--dry-run', '--capture-output']), run: (args) => runProfile(args) },
  ],
  ['shellcheck-tracked', { flags: NO_FLAGS, run: () => runShellcheckTracked() }],
]);

/**
 * Resolve argv to a command and its checked arguments, or a usage failure.
 * An unrecognised flag is refused rather than ignored: a mistyped repair
 * flag (`--fxi`) must not run the read-only check and report green.
 */
function resolveCommand(
  argv: readonly string[],
): { readonly run: RepoCheckCommand['run']; readonly args: readonly string[] } | undefined {
  const [name, ...args] = argv;
  const command = name === undefined ? undefined : COMMANDS.get(name);
  if (command === undefined || args.some((arg) => !command.flags.has(arg))) {
    return undefined;
  }
  return { run: command.run, args };
}

const HELP_FLAGS: ReadonlySet<string> = new Set(['--help', '-h']);

/**
 * pnpm forwards a `--` separator to this entry unchanged: before the command
 * (`pnpm agent-tools:repo-check -- <command>`) or after it, when a root script
 * already names the command (`pnpm check:profile -- --dry-run`). One separator
 * in either place is dropped; any other is an argument like any other and is
 * refused with usage.
 */
function withoutForwardingSeparators(argv: readonly string[]): readonly string[] {
  const [first, ...rest] = argv[0] === '--' ? argv.slice(1) : argv;
  if (first === undefined) {
    return [];
  }
  return [first, ...(rest[0] === '--' ? rest.slice(1) : rest)];
}

async function main(): Promise<void> {
  const argv = withoutForwardingSeparators(process.argv.slice(2));
  if (argv.length === 1 && HELP_FLAGS.has(argv[0] ?? '')) {
    writeLine(usage());
    process.exitCode = 0;
    return;
  }
  const resolved = resolveCommand(argv);
  if (resolved === undefined) {
    writeErrorLine(usage());
    process.exitCode = 1;
    return;
  }
  // process.exitCode, never process.exit(): exit() can terminate before
  // piped stdout/stderr flush, truncating the captured output a gate
  // promises to re-emit. A gate that throws reports the message and exits 1:
  // a gate's failure is guidance, never a stack trace.
  try {
    process.exitCode = await resolved.run(resolved.args);
  } catch (error: unknown) {
    writeErrorLine(`repo-check: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

function isCliEntryPoint(): boolean {
  const entryPoint = process.argv[1];
  if (entryPoint === undefined) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(entryPoint)).href;
}

if (isCliEntryPoint()) {
  await main();
}
