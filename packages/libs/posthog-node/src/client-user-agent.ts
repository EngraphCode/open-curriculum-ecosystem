/**
 * The one client string Oak emits: a `$mcp_client_user_agent` rebuilt from
 * closed pieces so PostHog's built-in harness column resolves (MCP-687).
 *
 * @remarks PostHog resolves that column at query time from
 * `$mcp_vendor_client`, then `$mcp_client_user_agent`, then `$mcp_client_name`
 * (PostHog MCP analytics events reference, read 2026-09-07). Oak emits none of
 * the vendor's raw values, which ADR-218 §3 excludes as client-controlled
 * strings. Instead it emits the user-agent property REBUILT from: the product
 * spelling observed in live traffic, a version of digits and dots only, and a
 * bracketed build surface from a closed list, which the reference names as what
 * distinguishes Claude Code's `(cli)` from `(sdk-ts)`, `(claude-vscode)` and
 * `(claude-desktop)`. A header that does not parse omits the property, so the
 * column resolves to "other" exactly as it did before MCP-687. The raw header
 * value still never leaves this process (ADR-218, 2026-09-07 amendment).
 */

import {
  asciiLower,
  CLIENT_PRODUCT_TOKEN_RULES,
  hasLeadingProductToken,
  isNonEmptyString,
} from './client-categories.js';
import type { ClientIdentityHeaders } from './event-policy-contract.js';

const CLIENT_BUILD_SURFACE_TOKENS = ['cli', 'sdk-ts', 'claude-vscode', 'claude-desktop'] as const;
const MAX_CLIENT_VERSION_LENGTH = 16;
const MAX_CLIENT_USER_AGENT_LENGTH = 64;
// Bounds the surface scan so its cost is independent of an attacker-controlled
// header length; the product token is anchored at index 0 regardless.
const MAX_CLIENT_USER_AGENT_SCAN_LENGTH = 256;
const CLIENT_VERSION_PATTERN = /^[0-9]+(?:\.[0-9]+)*/u;
// The complete closed grammar of an emitted value. The final event policy
// re-checks every outbound value against it, so a property that somehow carried
// anything else is dropped at the barrier rather than shipped.
const CLIENT_USER_AGENT_PATTERN =
  /^(?:Claude-User|claude-code|codex-mcp-client)(?:\/[0-9]+(?:\.[0-9]+)*)?(?: \((?:cli|sdk-ts|claude-vscode|claude-desktop)\))?$/u;

function readClientVersion(value: string): string | undefined {
  const match = CLIENT_VERSION_PATTERN.exec(value);
  if (match === null || match[0].length > MAX_CLIENT_VERSION_LENGTH) {
    return undefined;
  }
  return match[0];
}

function readClientUserAgent(value: string): string | undefined {
  const normalised = asciiLower(value.trim().slice(0, MAX_CLIENT_USER_AGENT_SCAN_LENGTH));
  const rule = CLIENT_PRODUCT_TOKEN_RULES.find(([token]) =>
    hasLeadingProductToken(normalised, token),
  );
  if (rule === undefined) {
    return undefined;
  }
  const [token, , spelling] = rule;
  const afterToken = normalised.slice(token.length);
  const version = afterToken.startsWith('/') ? readClientVersion(afterToken.slice(1)) : undefined;
  const surface = CLIENT_BUILD_SURFACE_TOKENS.find((candidate) =>
    normalised.includes(`(${candidate})`),
  );
  return `${spelling}${version === undefined ? '' : `/${version}`}${
    surface === undefined ? '' : ` (${surface})`
  }`;
}

/**
 * Rebuilds the user-agent value PostHog's harness column reads, from closed
 * pieces only. The first header value that names a known product decides it, the
 * same rule `normaliseOakClientProduct` applies, so the two properties always
 * describe the same header.
 *
 * @returns The rebuilt value, or `undefined` when no value names a known
 * product, in which case the property is omitted and the column reads "other".
 */
export function normaliseOakClientUserAgent(headers: ClientIdentityHeaders): string | undefined {
  if (!headers.readable) {
    return undefined;
  }
  for (const value of headers.values) {
    if (!isNonEmptyString(value)) {
      continue;
    }
    const userAgent = readClientUserAgent(value);
    if (userAgent !== undefined) {
      return userAgent;
    }
  }
  return undefined;
}

/** Whether a value is one the rebuilt grammar can produce. */
export function isOakClientUserAgent(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= MAX_CLIENT_USER_AGENT_LENGTH &&
    CLIENT_USER_AGENT_PATTERN.test(value)
  );
}
