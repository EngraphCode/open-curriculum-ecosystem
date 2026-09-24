/**
 * The repository's own record of what exists: git's tracked paths, never a walk
 * of the disk.
 *
 * @remarks
 * A working disk also carries instance-tier state (comms events, claims, build
 * output, scratch) that a fresh checkout and CI never hold, so a gate that reads
 * the disk proves only its own machine. The set answers whether a path travels
 * with a checkout. It reads git's index, so a staged file counts as tracked on
 * the machine that staged it.
 *
 * @packageDocumentation
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { resolveTrustedGit } from './trusted-git.js';

/** Null byte: the `git ls-files -z` record separator. */
const NUL = '\u0000';

/**
 * The tracked files plus every directory a tracked file implies.
 *
 * @remarks
 * Git tracks files, not directories, but a directory exists on every checkout
 * when a tracked file lives under it. A root-level file adds no `.` entry.
 *
 * @param trackedFiles - Repo-relative tracked file paths, `/`-separated.
 * @returns The files and their ancestor directories.
 */
export function withImpliedDirectories(trackedFiles: readonly string[]): ReadonlySet<string> {
  const paths = new Set<string>();
  for (const file of trackedFiles) {
    paths.add(file);
    let parent = path.posix.dirname(file);
    // Every path already in the set has all its ancestors in the set, so the
    // walk stops at the first ancestor it has seen.
    while (parent !== '.' && !paths.has(parent)) {
      paths.add(parent);
      parent = path.posix.dirname(parent);
    }
  }
  return paths;
}

/**
 * Every tracked path in the repository, with the directories tracked files
 * imply.
 *
 * @param repoRoot - Absolute path to the repository root.
 * @returns The tracked-path set.
 */
export function listTrackedPathSet(repoRoot: string): ReadonlySet<string> {
  return withImpliedDirectories(listTrackedFiles(repoRoot));
}

/**
 * List every tracked file, NUL-delimited so paths with spaces survive.
 *
 * @param repoRoot - Absolute path to the repository root.
 * @returns Every tracked repo-relative path, including binaries.
 */
export function listTrackedFiles(repoRoot: string): string[] {
  const stdout = execFileSync(resolveTrustedGit(), ['ls-files', '-z'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return stdout.split(NUL).filter((entry) => entry.length > 0);
}
