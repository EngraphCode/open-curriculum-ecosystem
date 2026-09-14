/**
 * Operator profile — the push leg of the git layer.
 *
 * Stage the profile's documents by pathspec, commit only those paths (an
 * index entry outside them, staged by hand, is never swept in), and push
 * whatever the upstream lacks — including commits an earlier push left
 * local, so `profile:sync push` cures every finding the check prescribes it
 * for. The first push sets the upstream on the repository's one remote.
 */

import { err, ok, type Result } from '@oaknational/result';

import {
  firstLine,
  gitFailure,
  hasUpstream,
  remoteNames,
  type GitRunner,
} from './operator-profile-git.js';

/** Stage by pathspec and commit only those paths; `committed: false` when nothing changed. */
function stageAndCommit(
  run: GitRunner,
  message: string,
  paths: readonly string[],
): Result<{ readonly committed: boolean }, string> {
  if (paths.length === 0) {
    return ok({ committed: false });
  }
  const added = run(['add', '--', ...paths]);
  if (!added.ok) {
    return err(gitFailure('staging', added));
  }
  if (run(['diff', '--cached', '--quiet', '--', ...paths]).ok) {
    return ok({ committed: false });
  }
  const committed = run(['commit', '--quiet', '--only', '-m', message, '--', ...paths]);
  if (!committed.ok) {
    return err(gitFailure('commit', committed));
  }
  return ok({ committed: true });
}

/** Commits on the branch the upstream lacks. */
function aheadCount(run: GitRunner): Result<number, string> {
  const counted = run(['rev-list', '--count', '@{u}..HEAD']);
  if (!counted.ok) {
    return err(gitFailure('git rev-list', counted));
  }
  const count = Number.parseInt(firstLine(counted.stdout), 10);
  return Number.isNaN(count)
    ? err(`git rev-list returned no count: "${counted.stdout}"`)
    : ok(count);
}

/** The remote a first push goes to: the repository's one remote, never a guess. */
function firstPushRemote(run: GitRunner): Result<string, string> {
  const remotes = remoteNames(run);
  if (!remotes.ok) {
    return remotes;
  }
  const [only] = remotes.value;
  if (only !== undefined && remotes.value.length === 1) {
    return ok(only);
  }
  return err(
    `${remotes.value.length} remotes and no upstream — set the upstream once (git push -u <remote> HEAD), then push again`,
  );
}

function pushFirst(run: GitRunner, committed: boolean): Result<string, string> {
  const remote = firstPushRemote(run);
  if (!remote.ok) {
    return remote;
  }
  const pushed = run(['push', '--quiet', '-u', remote.value, 'HEAD']);
  if (!pushed.ok) {
    return err(`push failed (the commits are local): ${firstLine(pushed.stderr) || 'no detail'}`);
  }
  return ok(`${committed ? 'committed and ' : ''}pushed; upstream set on ${remote.value}`);
}

function pushAhead(run: GitRunner, committed: boolean): Result<string, string> {
  const ahead = aheadCount(run);
  if (!ahead.ok) {
    return ahead;
  }
  if (ahead.value === 0) {
    return ok('nothing to commit; in sync with the upstream');
  }
  const pushed = run(['push', '--quiet']);
  if (!pushed.ok) {
    return err(`push failed (the commits are local): ${firstLine(pushed.stderr) || 'no detail'}`);
  }
  return ok(
    committed
      ? 'committed and pushed'
      : `pushed ${ahead.value} local commit${ahead.value === 1 ? '' : 's'} (nothing new to commit)`,
  );
}

/**
 * Commit and push the operator's ratified writes: stage the profile's
 * documents by pathspec, commit those paths only, push whatever the upstream
 * lacks (setting the upstream on the first push). The caller runs the
 * profile check first and passes only paths that exist.
 *
 * @param run - the git runner bound to the root
 * @param message - names the seat and the fact
 * @param paths - the profile's document paths that exist in the root
 * @returns what happened, or the failure to surface
 */
export function pushProfile(
  run: GitRunner,
  message: string,
  paths: readonly string[],
): Result<string, string> {
  const commit = stageAndCommit(run, message, paths);
  if (!commit.ok) {
    return commit;
  }
  return hasUpstream(run)
    ? pushAhead(run, commit.value.committed)
    : pushFirst(run, commit.value.committed);
}
