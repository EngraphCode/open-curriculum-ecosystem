/**
 * The repository's own record of what exists: git's tracked paths, never a walk
 * of the disk.
 *
 * @remarks
 * A working disk also carries instance-tier state (comms events, claims, build
 * output, scratch) that a fresh checkout and CI never hold, so a gate that reads
 * the disk proves only its own machine. The tracked set answers whether a path
 * travels with a checkout; it reads git's index, so a staged file counts as
 * tracked on the machine that staged it. Every git read goes through one runner
 * and returns a `Result` (ADR-088), never a throw: pure cores read what git gave
 * back, and each caller translates a failure by its own contract.
 *
 * @packageDocumentation
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { err, flatMap, map, ok, type Result } from '@oaknational/result';

import { failureAsError } from './failure-as-error.js';
import { resolveTrustedGit } from './trusted-git.js';

/** Null byte: the record separator of git's `-z` output. */
const NUL = '\u0000';

/** Room for the whole listing of a large repository in one read. */
const MAX_GIT_OUTPUT_BYTES = 64 * 1024 * 1024;

/** What one git run gave back. */
export interface GitRunOutput {
  /** Exit status; `null` when git was killed, never started, or Node reported an error. */
  readonly status: number | null;
  readonly stdout: string;
  /** git's standard error, plus the reason when git never ran or was killed. */
  readonly stderr: string;
}

/** The `spawnSync` result fields the runner reads (both streams unset if git never started). */
export interface SpawnedGit {
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly error?: Error | undefined;
  readonly stdout?: string | null | undefined;
  readonly stderr?: string | null | undefined;
}

/** Run git with `args`: the one runner every read here goes through. */
type GitRun = (args: readonly string[]) => GitRunOutput;

/**
 * Why a git read gave no usable answer: no trusted git (`git-unavailable`, the
 * resolver's own refusal); a status the read does not accept, or none
 * (`git-failed`, git's own standard error); or a listing that names no file
 * (`empty-listing`: every checkout tracks files, so git read the wrong place).
 */
export type GitReadFailure =
  | { readonly kind: 'git-unavailable'; readonly message: string }
  | { readonly kind: 'git-failed'; readonly status: number | null; readonly stderr: string }
  | { readonly kind: 'empty-listing' };

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
 * Read what `git ls-files -z` gave back: every tracked path, split on NUL so a
 * space or a newline inside a path survives; or the failure when git exited
 * non-zero or without a status, or listed nothing.
 */
export function parseTrackedFiles(output: GitRunOutput): Result<readonly string[], GitReadFailure> {
  if (output.status !== 0) {
    return err(gitFailed(output));
  }
  const files = splitNul(output.stdout);
  return files.length === 0 ? err({ kind: 'empty-listing' }) : ok(files);
}

/** List every tracked file, binaries included, of the repository at `repoRoot`. */
export function listTrackedFiles(repoRoot: string): Result<readonly string[], GitReadFailure> {
  return flatMap(gitRunAt(repoRoot), (run) => parseTrackedFiles(run(['ls-files', '-z'])));
}

/**
 * Every tracked path in the repository at `repoRoot`, with the directories
 * tracked files imply ({@link withImpliedDirectories}).
 */
export function listTrackedPathSet(repoRoot: string): Result<ReadonlySet<string>, GitReadFailure> {
  return map(listTrackedFiles(repoRoot), withImpliedDirectories);
}

/**
 * Say, on one line for an operator, why a git read gave no usable answer, in
 * git's own words. The line ends without a full stop, so the caller's own
 * sentence closes it.
 */
export function describeGitReadFailure(failure: GitReadFailure): string {
  const line = failureLine(failure);
  return line.endsWith('.') ? line.slice(0, -1) : line;
}

function failureLine(failure: GitReadFailure): string {
  if (failure.kind === 'git-unavailable') {
    return failure.message;
  }
  if (failure.kind === 'empty-listing') {
    return 'git listed no tracked files, so it read the wrong place; refusing a vacuous pass';
  }
  const exit = failure.status === null ? 'no exit status' : `status ${String(failure.status)}`;
  const lines = failure.stderr.split('\n').map((line) => line.trim());
  const detail = lines.filter((line) => line.length > 0).join('; ') || '(no standard error)';
  return `git failed with ${exit}: ${detail}`;
}

/**
 * Translate what `spawnSync` gave back. A run Node reports an error for (never
 * started, output past the buffer) reads as no status, so a truncated listing
 * can never parse as a success. Node's error and the signal that killed git
 * both join git's standard error, so neither reason is lost.
 */
export function toGitRunOutput(spawned: SpawnedGit): GitRunOutput {
  const killed = spawned.signal === null ? '' : `git was killed by ${spawned.signal}`;
  const reasons = [spawned.stderr ?? '', spawned.error?.message ?? '', killed];
  const stderr = reasons.filter((part) => part.length > 0).join('\n');
  const status = spawned.error === undefined ? spawned.status : null;
  return { status, stdout: spawned.stdout ?? '', stderr };
}

/** The NUL-separated records of git's `-z` output, without the empty tail. */
function splitNul(text: string): string[] {
  return text.split(NUL).filter((entry) => entry.length > 0);
}

function gitFailed(output: GitRunOutput): GitReadFailure {
  return { kind: 'git-failed', status: output.status, stderr: output.stderr };
}

/**
 * The failure for a git the trusted resolver could not find: its refusal
 * message, carried verbatim.
 *
 * @param thrown - What {@link resolveTrustedGit} threw.
 * @returns The `git-unavailable` failure.
 */
export function gitUnavailable(thrown: unknown): GitReadFailure {
  return { kind: 'git-unavailable', message: failureAsError(thrown, 'resolveTrustedGit').message };
}

/**
 * The live runner: git by its trusted absolute path, from `repoRoot`, no shell.
 * A missing trusted git is the resolver's refusal, carried verbatim, never
 * rebranded ({@link resolveTrustedGit}).
 */
function gitRunAt(repoRoot: string): Result<GitRun, GitReadFailure> {
  let git: string;
  try {
    git = resolveTrustedGit();
  } catch (error) {
    return err(gitUnavailable(error));
  }
  const options = { cwd: repoRoot, encoding: 'utf8', maxBuffer: MAX_GIT_OUTPUT_BYTES } as const;
  return ok((args) => toGitRunOutput(spawnSync(git, args, options)));
}
