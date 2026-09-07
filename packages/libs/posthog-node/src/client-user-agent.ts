/**
 * The one client string Oak emits: a `$mcp_client_user_agent` rebuilt from
 * closed pieces so PostHog's built-in harness column resolves (MCP-687).
 *
 * @remarks PostHog resolves that column at query time from
 * `$mcp_vendor_client`, then `$mcp_client_user_agent`, then `$mcp_client_name`.
 * The rule is open source — `products/mcp_analytics/backend/mcp_harness.py`
 * in PostHog/posthog — and reads the user agent as the product token before
 * the first `/` plus the first bracketed segment, so `claude-code/2 (cli)`
 * labels as "Claude Code", `(sdk-ts)` as "Claude Agent SDK", `(claude-vscode)`
 * and `(claude-desktop)` as their own labels, `Claude-User` as "Claude.ai" and
 * `codex-mcp-client/0` as "OpenAI Codex". Oak emits none of the vendor's raw
 * values, which ADR-218 §3 excludes as client-controlled strings; it emits the
 * property REBUILT from the product spelling observed in live traffic, an
 * optional major version of at most two digits, and an optional build surface
 * from the vendor's closed list. A header that names no product omits the
 * property, so the column resolves to "other" exactly as it did before
 * MCP-687. The raw header value never leaves this process (ADR-218,
 * 2026-09-07 amendment).
 *
 * The version is the only place client-supplied bytes reach the value, and it
 * is bounded to at most a hundred distinct values by construction: a longer
 * digit run (a numeric installation id, say) omits the version rather than
 * truncating it, so the slot cannot carry a stable per-installation identifier.
 */

import {
  asciiLower,
  CLIENT_PRODUCT_TOKEN_RULES,
  hasLeadingProductToken,
  isNonEmptyString,
} from './client-categories.js';
import type { ClientIdentityHeaders } from './event-policy-contract.js';

// The vendor's own vocabulary for the surface, taken from the labelling rule
// above rather than observed in Oak's traffic (only `cli` has been): a stated
// exception to the evidence-backed-token constraint, acceptable because every
// member is a fixed string re-emitted from this list and never a forwarded byte.
const CLIENT_BUILD_SURFACE_TOKENS = ['cli', 'sdk-ts', 'claude-vscode', 'claude-desktop'] as const;
type ClientBuildSurface = (typeof CLIENT_BUILD_SURFACE_TOKENS)[number];
// Bounds the surface scan so its cost is independent of an attacker-controlled
// header length; the product token is anchored at index 0 regardless. The
// product axis scans a shorter window (the longest token plus one) because it
// needs only the leading token; the two derivations still agree on which header
// value wins, because both anchor at index 0 with the same table.
const MAX_CLIENT_USER_AGENT_SCAN_LENGTH = 256;
// At most two digits with no leading zero, and the run must END there, so the
// slot holds exactly the hundred values 0–99: `/2.1.226` yields `2`,
// `/01.2` and `/8123456789012345` yield nothing.
const CLIENT_MAJOR_VERSION_PATTERN = /^(?:0|[1-9][0-9]?)(?![0-9])/u;
// The FIRST bracketed segment decides the surface, so list order carries no
// meaning and a header cannot reach a later bracket by prepending one. The
// segment ends at the first comma or close bracket, as PostHog's own extractor
// reads it: `(sdk-ts, agent-sdk/0.3)` yields `sdk-ts`.
const FIRST_BRACKETED_SEGMENT_PATTERN = /\(([^,)]*)[,)]/u;

function readClientMajorVersion(afterToken: string): string | undefined {
  if (!afterToken.startsWith('/')) {
    return undefined;
  }
  const match = CLIENT_MAJOR_VERSION_PATTERN.exec(afterToken.slice(1));
  return match === null ? undefined : match[0];
}

function readClientBuildSurface(normalised: string): ClientBuildSurface | undefined {
  const segment = FIRST_BRACKETED_SEGMENT_PATTERN.exec(normalised)?.[1];
  return CLIENT_BUILD_SURFACE_TOKENS.find((candidate) => candidate === segment);
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
  const version = readClientMajorVersion(normalised.slice(token.length));
  // PostHog reads the product as everything before the first `/`, so without a
  // version a bracketed surface would be swallowed into the product token and
  // the surface-specific labels could never resolve. A value without a version
  // therefore carries no surface either; it still labels by product prefix.
  const surface = version === undefined ? undefined : readClientBuildSurface(normalised);
  const versionPart = version === undefined ? '' : `/${version}`;
  const surfacePart = surface === undefined ? '' : ` (${surface})`;
  return `${spelling}${versionPart}${surfacePart}`;
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

/**
 * Whether a value is one the rebuild can produce: it is admitted iff
 * re-parsing it reproduces it byte for byte. The validator therefore IS the
 * derivation, so the grammar has one home and a new table row cannot drift
 * from the barrier the way a hand-copied regex would.
 */
export function isOakClientUserAgent(value: unknown): value is string {
  return typeof value === 'string' && readClientUserAgent(value) === value;
}
