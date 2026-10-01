import { err, ok, type Result } from '@oaknational/result';

import { parseGitRemoteUrl, type GitRemoteRepository } from '../core/git-remote-url.js';
import { DEFAULT_BRANCH_NAMES } from './branch-arg.js';
import type { GitCommandResult } from './git-executor.js';
import { describeGitChildEnd, type PushGitReads } from './push-git.js';
import type { BotIdentity } from './resolve-identity.js';

/**
 * Which branch `merge-bot push` writes, which it refuses, and which commit it
 * writes there. Changes reach a
 * default branch through a pull request, never a direct push: `main` and
 * `master` refuse by name, and so does the repository's own default branch,
 * read from `refs/remotes/origin/HEAD`, which a clone sets and every worktree
 * shares. Names compare without case, since a branch differing only in case
 * from the default one breaks every fetch on a case-insensitive disk.
 *
 * The origin read is trusted only when origin names the repository the push
 * goes to, over https or ssh, since the push itself goes to the configured
 * repository's URL, never to `origin`. It is a snapshot: a fetch does not move an existing
 * `origin/HEAD`, so after the repository's default branch changes,
 * `git remote set-head origin --auto` refreshes it. Where the configured
 * repository's ruleset on the default branch binds the bot, as this
 * repository's does, GitHub refuses a direct push either way. Anything
 * unreadable fails the push rather than guessing.
 */

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

/**
 * The repository origin's one URL names, when it is read over a transport the
 * push trusts. What a remote advertises over plain http, its default branch
 * included, is not trusted; the parser reads that form all the same, for
 * callers that need only the repository a URL names.
 */
function trustedOriginRepository(urls: readonly string[]): GitRemoteRepository | undefined {
  const url = urls[0]?.trim();
  return urls.length !== 1 || url === undefined || url.startsWith('http://')
    ? undefined
    : parseGitRemoteUrl(url);
}

/** Whether origin's one URL names the configured repository on github.com, over https or ssh. */
function trustOrigin(result: GitCommandResult, repository: Repository): Result<undefined, Error> {
  const repo = `github.com/${repository.owner}/${repository.repoName}`;
  const cure = `point origin at https://${repo}.git, then ${SET_HEAD_CURE}`;
  if (result.status !== 0) {
    return err(originReadFailure(result, cure));
  }
  const urls = result.stdout.split('\n').filter((line) => line.trim() !== '');
  const remote = trustedOriginRepository(urls);
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

/** A full object name: SHA-1 (40 hex digits) or SHA-256 (64). */
const OBJECT_NAME = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/u;

/**
 * Settle the commit a push writes: the one HEAD names, read once before the
 * mint, so every attempt pushes the same commit however long the retry waits.
 *
 * @param read - git's answer naming HEAD's commit (`rev-parse --verify HEAD^{commit}`).
 * @returns The commit's full object name, or the failure naming the cure.
 */
export function settleCommit(read: GitCommandResult): Result<string, Error> {
  const name = read.stdout.trim();
  return read.status === 0 && OBJECT_NAME.test(name)
    ? ok(name)
    : err(
        new Error(
          `cannot settle the commit HEAD names (git rev-parse ${describeGitChildEnd(read)}, answering ${JSON.stringify(name)}); check out a branch with a commit and push again`,
        ),
      );
}

/**
 * Settle the commit for a settled branch, as one snapshot of HEAD. The branch
 * is read first and the commit last, with origin's reads between; a checkout
 * that changed branch in that interval would pair the first branch with the
 * second branch's commit. So when the branch came from HEAD it is read again
 * after the commit, and a different answer fails the push before the mint. A
 * named branch takes HEAD's commit wherever HEAD is, and is not asked.
 *
 * @param branch - The settled target branch.
 * @param fromHead - Whether the branch was read from HEAD, never named.
 * @param reads - git's answers naming HEAD's commit and its branch.
 * @returns The commit's full object name, or the failure naming the cure.
 */
export async function settleCommitFor(
  branch: string,
  fromHead: boolean,
  reads: Pick<PushGitReads, 'headCommit' | 'currentBranch'>,
): Promise<Result<string, Error>> {
  const commit = settleCommit(await reads.headCommit());
  if (!commit.ok || !fromHead) {
    return commit;
  }
  const now = currentBranchFrom(await reads.currentBranch());
  if (!now.ok) {
    return now;
  }
  return now.value === branch
    ? commit
    : err(
        new Error(
          `HEAD moved from branch "${branch}" to ${now.value === undefined ? 'no branch' : `"${now.value}"`} while the push settled its target; nothing was minted or pushed; run the push again`,
        ),
      );
}

/**
 * Settle the branch a push writes: the one named, or the one HEAD is on;
 * refused by name first, then against the default branch origin names.
 *
 * @param named - The branch given with `--branch`, or undefined for HEAD's branch.
 * @param reads - git's answers about HEAD's branch and origin.
 * @param repository - The configured repository the push goes to.
 */
export async function settleTargetBranch(
  named: string | undefined,
  reads: Pick<PushGitReads, 'currentBranch' | 'originUrls' | 'originHead'>,
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
