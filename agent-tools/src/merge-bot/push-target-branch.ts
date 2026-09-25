import { err, ok, type Result } from '@oaknational/result';

import { describeGitChildEnd, type GitContext } from './push-git.js';

/**
 * Which branches `merge-bot push` refuses to write. Changes reach a default
 * branch through a pull request, never a direct push: `main` and `master`
 * refuse by name, and so does the repository's own default branch, read from
 * `refs/remotes/origin/HEAD`, which a clone sets and every worktree shares.
 * That read is trusted only when `origin` names the repository the push goes
 * to, since the push itself goes to the configured repository's URL, never to
 * `origin`. Anything unreadable fails the push rather than guessing.
 */

/** Branch names that never take a direct push; the never-commit-to-main rule as behaviour. */
const DEFAULT_BRANCH_NAMES: ReadonlySet<string> = new Set(['main', 'master']);

/**
 * The typed refusal for a target branch, whether the name came from git or
 * from --branch, or undefined when the push may go ahead.
 *
 * @param branch - The branch the push would write, as `refs/heads/<branch>`.
 * @param defaultBranch - The repository's default branch, from {@link readDefaultBranch}.
 */
export function refuseTargetBranch(branch: string, defaultBranch: string): string | undefined {
  if (branch === 'HEAD') {
    return 'HEAD is detached — there is no branch to push; check a branch out, or name the target with --branch';
  }
  if (branch.startsWith('refs/')) {
    return `"${branch}" reads as a full ref — name the branch alone; the push always writes refs/heads/<branch>`;
  }
  if (DEFAULT_BRANCH_NAMES.has(branch) || branch === defaultBranch) {
    return `"${branch}" is a default branch — changes reach it through a pull request, never a direct push`;
  }
  return undefined;
}

const ORIGIN_HEAD_PREFIX = 'refs/remotes/origin/';

/**
 * The branch `refs/remotes/origin/HEAD` points at, from `git symbolic-ref`'s
 * full output, or undefined when the answer is not an origin branch.
 *
 * @param stdout - What `git symbolic-ref --quiet refs/remotes/origin/HEAD` printed.
 */
export function parseOriginHead(stdout: string): string | undefined {
  const ref = stdout.trim();
  return ref.startsWith(ORIGIN_HEAD_PREFIX) && ref.length > ORIGIN_HEAD_PREFIX.length
    ? ref.slice(ORIGIN_HEAD_PREFIX.length)
    : undefined;
}

const GITHUB_REMOTE =
  /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([^/]+)\/([^/]+?)(?:\.git)?$/;

/**
 * Whether a remote URL names exactly the GitHub repository `owner/repoName`,
 * in its HTTPS or SSH form. GitHub names are case-insensitive.
 *
 * @param url - The remote's URL, as `git config --get remote.origin.url` printed it.
 * @param owner - The configured repository's owner.
 * @param repoName - The configured repository's name.
 */
export function originNamesRepository(url: string, owner: string, repoName: string): boolean {
  const match = GITHUB_REMOTE.exec(url);
  return (
    match?.[1]?.toLowerCase() === owner.toLowerCase() &&
    match[2]?.toLowerCase() === repoName.toLowerCase()
  );
}

/**
 * Read the default branch of the configured repository from `origin`, or
 * fail with the cure named. Two git reads, no network.
 *
 * @param git - The resolved git binary and its executor.
 * @param options - The working directory, the child environment, and the
 * configured repository the push goes to.
 */
export async function readDefaultBranch(
  git: GitContext,
  options: {
    readonly cwd: string;
    readonly env: Readonly<Record<string, string | undefined>>;
    readonly owner: string;
    readonly repoName: string;
  },
): Promise<Result<string, Error>> {
  const where = { cwd: options.cwd, env: options.env };
  const url = await git.exec(git.file, ['config', '--get', 'remote.origin.url'], where);
  if (url.status !== 0) {
    return err(
      new Error(
        `cannot read the default branch: origin has no URL (git config ${describeGitChildEnd(url)})`,
      ),
    );
  }
  if (!originNamesRepository(url.stdout.trim(), options.owner, options.repoName)) {
    return err(
      new Error(
        `cannot trust origin's default branch: origin is not github.com/${options.owner}/${options.repoName}, the repository the push goes to`,
      ),
    );
  }
  const head = await git.exec(
    git.file,
    ['symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD'],
    where,
  );
  const branch = head.status === 0 ? parseOriginHead(head.stdout) : undefined;
  return branch === undefined
    ? err(
        new Error(
          'cannot read the default branch: refs/remotes/origin/HEAD is unset; run `git remote set-head origin --auto`',
        ),
      )
    : ok(branch);
}
