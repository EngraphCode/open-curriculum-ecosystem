/**
 * Operator profile — key derivation and the credential tripwire. Pure.
 */

import { MACHINE_KEY_PATTERN, SCOPE_KEY_PATTERN } from './operator-profile-schema.js';

/**
 * Derive the scope key from an `origin` remote URL: the owner and repository
 * name, lowercased, joined with `--`. Accepts the `https://host/owner/repo(.git)`,
 * `git@host:owner/repo(.git)` and `ssh://git@host/owner/repo(.git)` forms.
 *
 * @param originUrl - the remote URL as `git remote get-url origin` prints it
 * @returns the scope key, or undefined when the URL does not name owner/repo
 */
export function deriveScopeKey(originUrl: string): string | undefined {
  const stripped = originUrl
    .trim()
    .replace(/^(?:ssh:\/\/)?(?:[A-Za-z0-9._-]+@)?(?:https?:\/\/)?[^/:]+[:/]/, '')
    .replace(/\/$/, '')
    .replace(/\.git$/, '');
  const [owner, repository, ...rest] = stripped.split('/');
  if (rest.length > 0 || owner === undefined || repository === undefined) {
    return undefined;
  }
  const key = `${owner}--${repository}`.toLowerCase();
  return SCOPE_KEY_PATTERN.test(key) ? key : undefined;
}

/**
 * Derive the machine key from a host name: the short (first-label) form,
 * lowercased. `hostname -s` already gives the short form; a fully qualified
 * name is cut at its first dot.
 *
 * @param hostName - as `hostname` or `os.hostname()` reports it
 * @returns the machine key, or undefined when the host name is unusable
 */
export function deriveMachineKey(hostName: string): string | undefined {
  const short = hostName.trim().split('.')[0]?.toLowerCase() ?? '';
  return MACHINE_KEY_PATTERN.test(short) ? short : undefined;
}

/** File stem of `repos/<stem>.md`, or undefined for any other path. */
export function scopeKeyFromRelPath(relPath: string): string | undefined {
  return /^repos\/([^/]+)\.md$/.exec(relPath)?.[1];
}

/** File stem of `machines/<stem>.md`, or undefined for any other path. */
export function machineKeyFromRelPath(relPath: string): string | undefined {
  return /^machines\/([^/]+)\.md$/.exec(relPath)?.[1];
}

/**
 * Credential-shaped line patterns. The profile names identities, never
 * credentials; a line matching any of these is refused by line number, and
 * the content is never echoed.
 */
const CREDENTIAL_LIKE_PATTERNS: readonly RegExp[] = [
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /\bsk-[A-Za-z0-9_-]{16,}/,
  /\bxox[abpr]-[A-Za-z0-9-]{10,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  // A labelled generic credential: the label at the start of a line (indented
  // or as a list item), optionally quoted, then `:` or `=` and a non-empty
  // value — the YAML-key and assignment shapes. Prose that mentions a label
  // without binding a value (`password managers`, `the token budget`) passes.
  /^\s*(?:-\s+)?["']?(?:password|passwd|secret|api[_-]?key|token|access[_-]?token|auth[_-]?token)["']?\s*[:=]\s*\S+/i,
  /^\s*(?:-\s+)?["']?authorization["']?\s*[:=]\s*["']?bearer\s+\S+/i,
];

/**
 * Line numbers (1-based) of credential-shaped lines in a document.
 *
 * @param content - the whole document, frontmatter included
 * @returns the offending line numbers, empty when clean
 */
export function findCredentialLikeLines(content: string): readonly number[] {
  return content
    .split('\n')
    .map((line, index) =>
      CREDENTIAL_LIKE_PATTERNS.some((pattern) => pattern.test(line)) ? index + 1 : 0,
    )
    .filter((lineNumber) => lineNumber > 0);
}
