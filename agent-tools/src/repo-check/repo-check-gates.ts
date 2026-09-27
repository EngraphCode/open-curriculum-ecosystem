/**
 * The format and markdown gates: the process edge that runs each tool over
 * git's file universe, the staged set for the pre-commit hook and the tracked
 * tree for the root gates.
 *
 * @remarks
 * A tracked gate reads the tree through {@link readTrackedTree}, which fails
 * closed: a gate whose git read failed checked nothing, so it fails rather
 * than pass. Its files run in chunks within {@link ARGV_BUDGET_BYTES}, one
 * run after another, and the gate fails if any chunk fails.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';

import { describeGitReadFailure } from '../core/repository-paths.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';

import {
  combinedExitCode,
  globSignificantPaths,
  markdownOnly,
  trackedCheckFiles,
  trackedMarkdownlintRuns,
  trackedPrettierRuns,
  type MarkdownlintMode,
  type PrettierMode,
  type TrackedTreeReading,
} from './repo-check-files.js';
import { defaultRuntime } from './repo-check-profile.js';
import type { RepoCheckRuntime } from './repo-check-types.js';
import { readTrackedTree } from './repo-check-universe.js';

function stagedFiles(runtime: RepoCheckRuntime): readonly string[] {
  const result = runtime.runCaptured('git', [
    'diff',
    '--cached',
    '--name-only',
    '--diff-filter=ACMR',
  ]);

  if ((result.status ?? 1) !== 0) {
    throw new Error(result.stderr.trim() || 'git diff failed while discovering staged files');
  }

  const names = result.stdout
    .split(/\r?\n/u)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  // Symlink index entries (mode 120000, e.g. the .claude/skills adapters
  // pointing at .agents/skills external-skill content) carry no formattable
  // content of their own — the linked target is checked under its real path,
  // and prettier refuses symlink paths outright.
  const symlinks = stagedSymlinkPaths(runtime);
  return names.filter((name) => !symlinks.has(name));
}

/** Repo-relative paths of staged index entries that are symbolic links. */
function stagedSymlinkPaths(runtime: RepoCheckRuntime): ReadonlySet<string> {
  const result = runtime.runCaptured('git', ['ls-files', '--cached', '-s']);
  if ((result.status ?? 1) !== 0) {
    return new Set();
  }
  const symlinks = new Set<string>();
  for (const line of result.stdout.split(/\r?\n/u)) {
    if (line.startsWith('120000 ')) {
      const path = line.split('\t')[1];
      if (path !== undefined) {
        symlinks.add(path);
      }
    }
  }
  return symlinks;
}

function stagedMarkdownFiles(runtime: RepoCheckRuntime): readonly string[] {
  return stagedFiles(runtime).filter((entry) => entry.endsWith('.md'));
}

export async function runMarkdownlintStaged(
  runtime: RepoCheckRuntime = defaultRuntime,
): Promise<number> {
  const files = stagedMarkdownFiles(runtime);
  if (files.length === 0) {
    writeLine('repo-check markdownlint-staged: no staged Markdown files');
    return 0;
  }
  // `--no-globs` is load-bearing, not redundant: it tells markdownlint-cli2 to
  // ignore the `globs` array in `.markdownlint-cli2.jsonc` and lint ONLY the
  // explicit staged paths. Without it cli2 would union the staged files with the
  // config globs and re-lint the whole repo on every commit. The config's rules
  // and `ignores` still apply, so an explicitly-staged but excluded file is skipped.
  return runtime.runInherited('pnpm', ['exec', 'markdownlint-cli2', '--no-globs', '--', ...files]);
}

export async function runPrettierStaged(
  runtime: RepoCheckRuntime = defaultRuntime,
): Promise<number> {
  const files = stagedFiles(runtime);
  if (files.length === 0) {
    writeLine('repo-check prettier-staged: no staged files');
    return 0;
  }
  return runtime.runInherited('pnpm', [
    'exec',
    'prettier',
    '--check',
    '--ignore-unknown',
    '--',
    ...files,
  ]);
}

/**
 * The most bytes one run's paths may cost: well under a command line's limit
 * (1 MiB on macOS, shared with the environment), for any tracked tree.
 */
const ARGV_BUDGET_BYTES = 256 * 1024;

/** Run each planned `pnpm` argv in order, one after another, collecting each exit status. */
async function runInSequence(
  runtime: RepoCheckRuntime,
  runs: readonly (readonly string[])[],
): Promise<readonly number[]> {
  return runs.reduce<Promise<readonly number[]>>(
    async (prior, args) => [...(await prior), await runtime.runInherited('pnpm', args)],
    Promise.resolve([]),
  );
}

/** A gate's planned `pnpm` runs, or why it refuses to run. */
type GatePlan = Result<readonly (readonly string[])[], string>;

/** Read the tracked tree, plan the gate's runs over it, and run them. */
async function runTrackedGate(
  runtime: RepoCheckRuntime,
  label: string,
  plan: (reading: TrackedTreeReading) => GatePlan,
): Promise<number> {
  const reading = readTrackedTree(runtime);
  if (!reading.ok) {
    writeErrorLine(
      `repo-check ${label}: ${describeGitReadFailure(reading.error)}; the gate checked nothing.`,
    );
    return 1;
  }
  const runs = plan(reading.value);
  if (!runs.ok) {
    writeErrorLine(`repo-check ${label}: ${runs.error}`);
    return 1;
  }
  if (runs.value.length === 0) {
    writeLine(`repo-check ${label}: no files`);
    return 0;
  }
  return combinedExitCode(await runInSequence(runtime, runs.value));
}

/** prettier over every tracked file (the root gate and its repair). */
export async function runPrettierTracked(
  mode: PrettierMode,
  runtime: RepoCheckRuntime = defaultRuntime,
): Promise<number> {
  return runTrackedGate(runtime, 'prettier-tracked', (reading) =>
    ok(trackedPrettierRuns(mode, reading, ARGV_BUDGET_BYTES)),
  );
}

/**
 * markdownlint over every tracked Markdown file (the root gate and its repair),
 * refusing any path markdownlint-cli2 would read as a glob and skip.
 */
export async function runMarkdownlintTracked(
  mode: MarkdownlintMode,
  runtime: RepoCheckRuntime = defaultRuntime,
): Promise<number> {
  return runTrackedGate(runtime, 'markdownlint-tracked', (reading) => {
    const globbed = globSignificantPaths(markdownOnly(trackedCheckFiles(reading)));
    return globbed.length > 0
      ? err(
          `markdownlint-cli2 reads each path as a glob, so these tracked files would be skipped, not linted: ${globbed.join(', ')}`,
        )
      : ok(trackedMarkdownlintRuns(mode, reading, ARGV_BUDGET_BYTES));
  });
}
