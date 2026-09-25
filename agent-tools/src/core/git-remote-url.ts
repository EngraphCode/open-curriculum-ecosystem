/**
 * A git remote URL, read as the host and the `owner/repo` path it names. Pure.
 *
 * The one parser for the three forms git prints: `https://host/owner/repo`,
 * scp-style `user@host:owner/repo` and `ssh://user@host/owner/repo`, each with
 * or without `.git`. Callers decide what the parts mean: the operator profile
 * keys a repository by owner and name on any host, and `merge-bot push`
 * trusts an origin only when the host is github.com.
 */

/** The parts of a remote URL that name a repository. */
export interface GitRemoteUrl {
  readonly host: string;
  readonly owner: string;
  readonly repo: string;
}

const REMOTE_URL = /^(?:ssh:\/\/)?(?:[A-Za-z0-9._-]+@)?(?:https?:\/\/)?([^/:]+)[:/](.*)$/u;

/** The `owner/repo` a path names, without a trailing slash or `.git`. */
function repositoryPath(path: string): Omit<GitRemoteUrl, 'host'> | undefined {
  const parts = path
    .replace(/\/$/u, '')
    .replace(/\.git$/u, '')
    .split('/');
  const [owner = '', repo = ''] = parts;
  return parts.length === 2 && owner !== '' && repo !== '' ? { owner, repo } : undefined;
}

/**
 * Read a remote URL as its host, owner and repository.
 *
 * @param url - the remote URL as `git remote get-url` prints it
 * @returns the parts, or undefined when the URL does not name exactly one
 * `owner/repo` path on a host
 */
export function parseGitRemoteUrl(url: string): GitRemoteUrl | undefined {
  const match = REMOTE_URL.exec(url.trim());
  const host = match?.[1];
  const repository = match?.[2] === undefined ? undefined : repositoryPath(match[2]);
  return host === undefined || repository === undefined ? undefined : { host, ...repository };
}
