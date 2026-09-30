/**
 * The tracked tree the root format and markdown gates run over, read from
 * git in three reads, each failing closed.
 *
 * @remarks
 * A gate that read nothing must never pass as if it checked everything, so a
 * failed or empty git read is the gate's failure ({@link GitReadFailure}),
 * never an empty file list. The pure core ({@link trackedTreeReading}) reads
 * what git gave back; {@link readTrackedTree} runs git through the gate's
 * runtime, which resolves the trusted git and never uses a shell.
 *
 * @packageDocumentation
 */

import { err, flatMap, map, ok, type Result } from '@oaknational/result';

import {
  gitFailed,
  parseTrackedFiles,
  toGitRunOutput,
  type GitReadFailure,
  type GitRunOutput,
} from '../core/repository-paths.js';

import {
  parseNulSeparatedPaths,
  parseSymlinkPaths,
  type TrackedTreeReading,
} from './repo-check-files.js';
import type { RepoCheckRuntime } from './repo-check-types.js';

/** What the three git reads gave back. */
export interface TrackedTreeOutputs {
  /** `git ls-files -z --deduplicate`: every tracked file, once even mid-merge. */
  readonly tracked: GitRunOutput;
  /**
   * `git diff-files --name-only --diff-filter=DT -z`: tracked files deleted or
   * retyped in the working tree, unstaged. The plumbing command never detects
   * renames, so a deletion is never read as one half of a rename.
   */
  readonly gone: GitRunOutput;
  /** `git ls-files --cached -s -z`: every index entry with its mode. */
  readonly stage: GitRunOutput;
}

/** A read's output when git exited 0; otherwise the failure, in git's own words. */
function succeeded(output: GitRunOutput): Result<string, GitReadFailure> {
  return output.status === 0 ? ok(output.stdout) : err(gitFailed(output));
}

/**
 * The tracked tree from what the three git reads gave back.
 *
 * @param outputs - The three reads' outputs.
 * @returns The reading, or the first failure: a failed read, or a tracked
 *   listing that names no file (git read the wrong place).
 */
export function trackedTreeReading(
  outputs: TrackedTreeOutputs,
): Result<TrackedTreeReading, GitReadFailure> {
  return flatMap(parseTrackedFiles(outputs.tracked), (tracked) =>
    flatMap(succeeded(outputs.gone), (gone) =>
      map(succeeded(outputs.stage), (stage) => ({
        tracked,
        goneFromWorkingTree: new Set(parseNulSeparatedPaths(gone)),
        symlinks: parseSymlinkPaths(stage),
      })),
    ),
  );
}

/**
 * Read the tracked tree through the gate's runtime.
 *
 * @param runtime - The gate's process runtime.
 * @returns The reading, or the first failure, with a killing signal named in
 *   git's standard error.
 */
export function readTrackedTree(
  runtime: RepoCheckRuntime,
): Result<TrackedTreeReading, GitReadFailure> {
  const run = (args: readonly string[]): GitRunOutput =>
    toGitRunOutput(runtime.runCaptured('git', args));
  return trackedTreeReading({
    tracked: run(['ls-files', '-z', '--deduplicate']),
    gone: run(['diff-files', '--name-only', '--diff-filter=DT', '-z']),
    stage: run(['ls-files', '--cached', '-s', '-z']),
  });
}
