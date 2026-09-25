import { err, ok, type Result } from '@oaknational/result';

import { parseGitRemoteUrl } from '../core/git-remote-url.js';
import type { GitCommandResult } from './git-executor.js';
import { describeGitChildEnd, type PushGitReads } from './push-git.js';
import type { BotIdentity } from './resolve-identity.js';

/**
 * Which branch `merge-bot push` writes, and which it refuses. Changes reach a
 * default branch through a pull request, never a direct push: `main` and
 * `master` refuse by name, and so does the repository's own default branch,
 * read from `refs/remotes/origin/HEAD`, which a clone sets and every worktree
 * shares. Names compare without case, since a branch differing only in case
 * from the default one breaks every fetch on a case-insensitive disk.
 *
 * The origin read is trusted only when origin names the repository the push
 * goes to, since the push itself goes to the configured repository's URL,
 * never to `origin`. It is a snapshot: a fetch does not move an existing
 * `origin/HEAD`, so after the repository's default branch changes,
 * `git remote set-head origin --auto` refreshes it. Where the configured
 * repository's ruleset on the default branch binds the bot, as this
 * repository's does, GitHub refuses a direct push either way. Anything
 * unreadable fails the push rather than guessing.
 */

/** Branch names that never take a direct push; the never-commit-to-main rule as behaviour. */
const DEFAULT_BRANCH_NAMES: ReadonlySet<string> = new Set(['main', 'master']);

/** Where `git symbolic-ref` names an origin branch. */
const ORIGIN_HEAD_PREFIX = 'refs/remotes/origin/';

/** The cure for an unset or stale `origin/HEAD`. */
const SET_HEAD_CURE = 'run `git remote set-head origin --auto`';

/** git's own exit status when a named remote does not exist. */
const NO_SUCH_REMOTE_STATUS = 2;

/** The refusal for a HEAD on no branch. */
const DETACHED_HEAD =
  'HEAD is detached — there is no branch to push; check a branch out, or name the target with --branch';

/** The branch to push, or the typed refusal. */
export type TargetBranch =
  | { readonly kind: 'target'; readonly branch: string }
  | { readonly kind: 'refused'; readonly reason: string };

/** The configured repository the push goes to. */
type Repository = Pick<BotIdentity, 'owner' | 'repoName'>;

/** A refusal, as the settled outcome. */
function refused(reason: string): TargetBranch {
  return { kind: 'refused', reason };
}

/** The refusal for a branch that is a default branch, by name or as origin names it. */
function defaultBranchRefusal(branch: string): string {
  return `"${branch}" is a default branch — changes reach it through a pull request, never a direct push`;
}

/** The refusals that need only the name, decided before any read of origin. */
function refuseBranchName(branch: string): string | undefined {
  if (branch.toLowerCase() === 'head') {
    return `"${branch}" names no branch — HEAD is git's name for the current commit; name the branch to push`;
  }
  if (branch.startsWith('refs/')) {
    return `"${branch}" reads as a full ref — name the branch alone; the push always writes refs/heads/<branch>`;
  }
  return DEFAULT_BRANCH_NAMES.has(branch.toLowerCase()) ? defaultBranchRefusal(branch) : undefined;
}

/** The branch HEAD is on, or undefined for a detached HEAD. */
function currentBranchFrom(result: GitCommandResult): Result<string | undefined, Error> {
  if (result.status !== 0) {
    return err(
      new Error(
        `cannot read the current branch (git branch ${describeGitChildEnd(result)}): ${result.stderr.trim()}`,
      ),
    );
  }
  const branch = result.stdout.trim();
  return ok(branch === '' ? undefined : branch);
}

/** The failure for origin's URL read, never echoing the URL, which can carry a credential. */
function originReadFailure(result: GitCommandResult, cure: string): Error {
  return result.status === NO_SUCH_REMOTE_STATUS && result.signal === null
    ? new Error(`cannot read the default branch: origin has no URL; ${cure}`)
    : new Error(
        `cannot read the default branch (git remote ${describeGitChildEnd(result)}): ${result.stderr.trim()}; ${cure}`,
      );
}

/** Whether origin's one URL names the configured repository on github.com. */
function trustOrigin(result: GitCommandResult, repository: Repository): Result<undefined, Error> {
  const repo = `github.com/${repository.owner}/${repository.repoName}`;
  const cure = `point origin at https://${repo}.git, then ${SET_HEAD_CURE}`;
  if (result.status !== 0) {
    return err(originReadFailure(result, cure));
  }
  const urls = result.stdout.split('\n').filter((line) => line.trim() !== '');
  const remote = urls.length === 1 ? parseGitRemoteUrl(urls[0] ?? '') : undefined;
  const names =
    remote?.host.toLowerCase() === 'github.com' &&
    remote.owner.toLowerCase() === repository.owner.toLowerCase() &&
    remote.repoName.toLowerCase() === repository.repoName.toLowerCase();
  return names
    ? ok(undefined)
    : err(
        new Error(
          `cannot trust origin's default branch: origin is not ${repo} alone, the repository the push goes to; ${cure}`,
        ),
      );
}

/** The branch `refs/remotes/origin/HEAD` points at, with the cure for each way it cannot be read. */
function defaultBranchFrom(result: GitCommandResult): Result<string, Error> {
  if (result.status === 1 && result.signal === null) {
    return err(
      new Error(
        `cannot read the default branch: refs/remotes/origin/HEAD is unset; ${SET_HEAD_CURE}`,
      ),
    );
  }
  if (result.status !== 0) {
    return err(
      new Error(
        `cannot read the default branch (git symbolic-ref ${describeGitChildEnd(result)}): ${result.stderr.trim()}`,
      ),
    );
  }
  const ref = result.stdout.trim();
  return ref.startsWith(ORIGIN_HEAD_PREFIX) && ref.length > ORIGIN_HEAD_PREFIX.length
    ? ok(ref.slice(ORIGIN_HEAD_PREFIX.length))
    : err(
        new Error(
          `cannot read the default branch: refs/remotes/origin/HEAD does not name an origin branch; ${SET_HEAD_CURE}`,
        ),
      );
}

/**
 * Settle the branch a push writes: the one named, or the one HEAD is on;
 * refused by name first, then against the default branch origin names.
 *
 * @param named - The branch given with `--branch`, or undefined for HEAD's branch.
 * @param reads - git's answers about HEAD and origin.
 * @param repository - The configured repository the push goes to.
 */
export async function settleTargetBranch(
  named: string | undefined,
  reads: PushGitReads,
  repository: Repository,
): Promise<Result<TargetBranch, Error>> {
  const current = named === undefined ? currentBranchFrom(await reads.currentBranch()) : ok(named);
  if (!current.ok) {
    return current;
  }
  const branch = current.value;
  if (branch === undefined) {
    return ok(refused(DETACHED_HEAD));
  }
  const byName = refuseBranchName(branch);
  if (byName !== undefined) {
    return ok(refused(byName));
  }
  const trusted = trustOrigin(await reads.originUrls(), repository);
  if (!trusted.ok) {
    return trusted;
  }
  const defaultBranch = defaultBranchFrom(await reads.originHead());
  if (!defaultBranch.ok) {
    return defaultBranch;
  }
  return ok(
    branch.toLowerCase() === defaultBranch.value.toLowerCase()
      ? refused(defaultBranchRefusal(branch))
      : { kind: 'target', branch },
  );
}
