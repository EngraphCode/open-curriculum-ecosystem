import { parseGitRemoteUrl, type GitRemoteRepository } from '../core/git-remote-url.js';

/**
 * Whether `origin` is one repository on github.com, as every merge-bot
 * command that binds to origin asks it: `merge-bot push` trusts origin's
 * default branch only when origin is the repository the push goes to, and
 * `merge-bot retire` deletes only when origin is the repository the bot
 * identity would delete in. Each command chooses its own read of origin's
 * URLs and says why at that read. Neither echoes a URL or a part parsed from
 * one: an https URL can carry a token, and a query string reads as part of
 * the repository's name.
 */

/**
 * The repository origin's URLs name, when there is exactly one and it is read
 * over a transport worth trusting. Several URLs name nothing: fetch reads the
 * first and a single `config --get` the last, so a check of one would not
 * bind the other. Plain http names nothing: what a remote advertises over it
 * is not trusted. The parser reads either form all the same, for callers
 * that need only the repository a URL names.
 */
export function trustedOriginRepository(urls: readonly string[]): GitRemoteRepository | undefined {
  const url = urls[0]?.trim();
  return urls.length !== 1 || url === undefined || url.startsWith('http://')
    ? undefined
    : parseGitRemoteUrl(url);
}

/** Whether `remote` is `repository` on github.com, each part compared without case. */
export function namesGithubRepository(
  remote: GitRemoteRepository | undefined,
  repository: Pick<GitRemoteRepository, 'owner' | 'repoName'>,
): boolean {
  return (
    remote?.host.toLowerCase() === 'github.com' &&
    remote.owner.toLowerCase() === repository.owner.toLowerCase() &&
    remote.repoName.toLowerCase() === repository.repoName.toLowerCase()
  );
}
