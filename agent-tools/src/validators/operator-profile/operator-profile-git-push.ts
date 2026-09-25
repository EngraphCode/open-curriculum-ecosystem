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
  leftRightCounts,
  remoteNames,
  type GitRunner,
} from './operator-profile-git.js';
import { INDEX_FILE_NAME, MACHINES_DIR_NAME, SCOPES_DIR_NAME } from './operator-profile-schema.js';

/**
 * The pathspecs to stage: the document paths that exist in the worktree plus
 * every tracked document path, so a deleted document (whose directory may no
 * longer exist) is staged as a deletion and never dropped.
 */
function stagingPaths(
  run: GitRunner,
  existing: readonly string[],
): Result<readonly string[], string> {
  const tracked = run(['ls-files', '--', INDEX_FILE_NAME, SCOPES_DIR_NAME, MACHINES_DIR_NAME]);
  if (!tracked.ok) {
    return err(gitFailure('git ls-files', tracked));
  }
  const trackedPaths = tracked.stdout.split('\n').filter((line) => line !== '');
  return ok([...new Set([...existing, ...trackedPaths])]);
}

/** Stage by pathspec and commit only those paths; `committed: false` when nothing changed. */
function stageAndCommit(
  run: GitRunner,
  message: string,
  existing: readonly string[],
): Result<{ readonly committed: boolean }, string> {
  const staged = stagingPaths(run, existing);
  if (!staged.ok) {
    return staged;
  }
  const paths = staged.value;
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

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/** A branch behind its remote is never pushed; the pull is the cure. */
function behindRefusal(committed: boolean, behind: number): string {
  return `${committed ? 'committed locally; ' : ''}the branch is ${plural(behind, 'commit')} behind the remote — run pnpm profile:sync pull, then push again`;
}

function pushAhead(run: GitRunner, committed: boolean): Result<string, string> {
  const counts = leftRightCounts(run);
  if (!counts.ok) {
    return counts;
  }
  const { ahead, behind } = counts.value;
  if (behind > 0) {
    return err(behindRefusal(committed, behind));
  }
  if (ahead === 0) {
    return ok('nothing to commit; in sync with the upstream');
  }
  const pushed = run(['push', '--quiet']);
  if (!pushed.ok) {
    return err(`push failed (the commits are local): ${firstLine(pushed.stderr) || 'no detail'}`);
  }
  return ok(
    committed
      ? 'committed and pushed'
      : `pushed ${plural(ahead, 'local commit')} (nothing new to commit)`,
  );
}

/**
 * Commit and push the operator's ratified writes: stage the profile's
 * documents by pathspec, commit those paths only, push whatever the upstream
 * lacks (setting the upstream on the first push); a branch behind its
 * remote is refused with the pull cure. The caller runs the profile check
 * first and passes the document paths that exist; tracked deletions are
 * added here.
 *
 * @param run - the git runner bound to the root
 * @param message - names the seat and the fact
 * @param existing - the profile's document paths that exist in the root
 * @returns what happened, or the failure to surface
 */
export function pushProfile(
  run: GitRunner,
  message: string,
  existing: readonly string[],
): Result<string, string> {
  const commit = stageAndCommit(run, message, existing);
  if (!commit.ok) {
    return commit;
  }
  return hasUpstream(run)
    ? pushAhead(run, commit.value.committed)
    : pushFirst(run, commit.value.committed);
}
