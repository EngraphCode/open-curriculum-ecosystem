/**
 * Which paths this clone's ignore rules ignore, and so which paths are
 * instance tier: ignored by the rules and not tracked by git.
 *
 * @remarks
 * The verdict comes from `git check-ignore`, run through the one git runner in
 * `repository-paths.ts`, and the tracked set is that module's
 * `listTrackedPathSet`. Every read returns a `Result` (ADR-088), never a throw.
 *
 * `--no-index` asks what the rules say whatever the index holds, so it also
 * reports a tracked file a rule matches; {@link isInstanceTier} closes that
 * with the tracked set. `-c core.excludesFile=/dev/null` keeps the developer's
 * global excludes file out of the verdict. `.git/info/exclude` and the working
 * tree's `.gitignore` files are read as they stand on disk, so a pattern in
 * this clone's exclude file, or in an untracked or locally edited `.gitignore`,
 * still counts: those are the per-clone inputs the verdict can carry.
 *
 * @packageDocumentation
 */

import { err, flatMap, ok, type Result } from '@oaknational/result';

import {
  gitFailed,
  gitRunAt,
  NUL,
  splitNul,
  type GitReadFailure,
  type GitRunOutput,
} from './repository-paths.js';

/** The child path the live probe asks about under each candidate. */
const PROBE_CHILD = '__probe__';

/** Ask the rules, not the index, about NUL-separated stdin, without the global excludes file. */
const CHECK_IGNORE_ARGS = [
  '-c',
  'core.excludesFile=/dev/null',
  'check-ignore',
  '-z',
  '--stdin',
  '--no-index',
] as const;

/**
 * The stdin the ignore probe sends: each candidate, then, for a directory
 * candidate (one ending in `/`), `<candidate>/<probeChild>`, every record
 * NUL-terminated and exactly as written (`comms/` also sends
 * `comms//<probeChild>`; a file candidate is sent alone).
 */
export function ignoreProbeInput(candidates: readonly string[], probeChild: string): string {
  return candidates.flatMap((c) => probeStrings(c, probeChild).map((s) => s + NUL)).join('');
}

/**
 * Read what `git check-ignore -z --stdin` gave back for the candidates it was
 * sent ({@link ignoreProbeInput}): those it lists, directly or, for a
 * directory candidate, through its probe child (how a directory whose contents
 * `comms/*` ignores reads as ignored), matched by the exact strings sent, since
 * git echoes them verbatim. Status 1 means none; any other status but 0, or
 * none, is a failure.
 */
export function parseIgnoredPaths(
  candidates: readonly string[],
  probeChild: string,
  output: GitRunOutput,
): Result<ReadonlySet<string>, GitReadFailure> {
  if (output.status === 1) {
    return ok(new Set());
  }
  if (output.status !== 0) {
    return err(gitFailed(output));
  }
  const listed = new Set(splitNul(output.stdout));
  return ok(
    new Set(candidates.filter((c) => probeStrings(c, probeChild).some((s) => listed.has(s)))),
  );
}

/**
 * Ask the ignore rules of the clone at `repoRoot` which candidates
 * (repo-relative, `/`-separated; a directory ends in `/`) they ignore.
 *
 * @remarks
 * The trailing `/` is the candidate's contract, as it is the rules' own: only a
 * directory is asked about through a probe child, so a directory-only rule
 * (`name/`) never reads a file called `name` as ignored. An absent directory
 * written without its `/` is asked about as a file, so a rule that ignores only
 * its contents (`name/*`) reads it as not ignored; one present on disk git sees
 * as the directory it is. Known edge: a candidate that passes through a symlink
 * (a path under it, or the link written with a trailing `/`), or one carrying
 * pathspec magic, makes git refuse the whole batch (status 128), so the read
 * fails with git's message for every candidate.
 */
export function listIgnoredPaths(
  repoRoot: string,
  candidates: readonly string[],
): Result<ReadonlySet<string>, GitReadFailure> {
  const input = ignoreProbeInput(candidates, PROBE_CHILD);
  return flatMap(gitRunAt(repoRoot), (run) =>
    parseIgnoredPaths(candidates, PROBE_CHILD, run(CHECK_IGNORE_ARGS, input)),
  );
}

/**
 * What the repository says about the paths it was asked about, named so the
 * two sets cannot be swapped.
 */
export interface InstanceTierEvidence {
  /** Every tracked path, with the directories tracked files imply (`listTrackedPathSet`). */
  readonly tracked: ReadonlySet<string>;
  /** The candidates this clone's ignore rules ignore ({@link listIgnoredPaths}). */
  readonly ignored: ReadonlySet<string>;
}

/**
 * Whether a path, exactly as probed, is instance tier: the rules ignore it
 * and git does not track it. Tracked beats ignored: a force-added file a rule
 * matches travels with every checkout. An implied directory counts as tracked,
 * probed with a trailing `/` or without one (the set holds none).
 */
export function isInstanceTier(repoPath: string, evidence: InstanceTierEvidence): boolean {
  const trackedPath = repoPath.endsWith('/') ? repoPath.slice(0, -1) : repoPath;
  return evidence.ignored.has(repoPath) && !evidence.tracked.has(trackedPath);
}

/**
 * The exact strings the probe sends for one candidate: itself, then, for a
 * directory (a candidate ending in `/`) and only for a directory, its probe
 * child.
 */
function probeStrings(candidate: string, probeChild: string): readonly string[] {
  return candidate.endsWith('/') ? [candidate, `${candidate}/${probeChild}`] : [candidate];
}
