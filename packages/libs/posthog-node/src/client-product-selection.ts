/**
 * The one bounded parser that picks a client product out of the identity
 * headers. Both the `oak_client_product` category and the rebuilt
 * `$mcp_client_user_agent` derive from its single selection, so the two
 * properties describe the same header value by construction (MCP-687).
 *
 * @remarks Product tokens must stay evidence-backed, and every row in the
 * table was verified first-hand in Oak's own inbound traffic over the 7 days
 * to 2026-08-13: `Claude-User` (10,045 requests), `claude-code/2.1.x (cli)`
 * (~3,100) and `codex-mcp-client/0.14x (…)` (~230). The correction path for a
 * new client is a token row plus its derivation-table test row — never a
 * widening of the match rule, and never forwarding the raw header value.
 *
 * The residual is deliberately unclaimed rather than guessed: `curl` (291),
 * `node` (249), `python-httpx` (87), browser `Mozilla/*` (74), `Bun` (39) and
 * `directory-admin-dashboard-inspection` (11) are Oak's own probes, smoke
 * tests and the browser widget, not named MCP client products. They belong in
 * 'other', which therefore means genuinely unidentifiable, not merely unread.
 */

import type { ClientIdentityHeaders, OakClientProduct } from './event-policy-contract.js';

/** Folds only [A-Z], so it is length-preserving and never shifts an index. */
export function asciiLower(value: string): string {
  return value.replaceAll(/[A-Z]/gu, (character) => character.toLowerCase());
}

// Bounds every read of a header value, trimming included, so the cost is
// independent of an attacker-controlled header length. Matching is anchored at
// index 0, so nothing beyond the window can change the outcome.
const MAX_CLIENT_HEADER_SCAN_LENGTH = 256;

/** `[token, category, spelling]`: the spelling is the only form ever re-emitted. */
export type ClientProductRule = readonly [string, OakClientProduct, string];

export const CLIENT_PRODUCT_TOKEN_RULES: readonly ClientProductRule[] = [
  ['claude-user', 'claude_ai', 'Claude-User'],
  ['claude-code', 'claude_code', 'claude-code'],
  ['codex-mcp-client', 'codex', 'codex-mcp-client'],
];

/**
 * Matches a product token only as the header's *leading* token.
 *
 * @remarks Deliberately stricter than the segment matcher the surface axis
 * uses. A User-Agent names its product first (`claude-code/2.1.226 (cli)`),
 * and a client-controlled string that merely *contains* a product name
 * somewhere is not that product self-declaring — it may be an unrelated
 * client, or a deliberate impersonation. Substring matching also makes the
 * outcome depend on rule order for a value carrying two product names;
 * anchoring removes that ambiguity, so the table's row order carries no
 * meaning.
 *
 * The boundary set omits `-`, which the family prefix allows: at product
 * granularity `claude-user` must not claim a hypothetical
 * `claude-user-agent/1.0`, whereas at family granularity `claude` legitimately
 * claims both. `/` and ` ` are the only real delimiters after a UA product
 * token.
 */
function hasLeadingProductToken(value: string, token: string): boolean {
  if (!value.startsWith(token)) {
    return false;
  }

  const boundary = value.at(token.length);
  return boundary === undefined || boundary === ' ' || boundary === '/';
}

/**
 * The shared normalisation of one header value: sliced to the window FIRST,
 * so no read scales with the raw length, then trimmed and case-folded.
 */
export function normaliseClientHeaderValue(value: string): string {
  return asciiLower(value.slice(0, MAX_CLIENT_HEADER_SCAN_LENGTH).trim());
}

/** The table row whose token leads the normalised value, if any. */
export function findLeadingProductRule(normalised: string): ClientProductRule | undefined {
  return CLIENT_PRODUCT_TOKEN_RULES.find(([token]) => hasLeadingProductToken(normalised, token));
}

export interface SelectedClientProduct {
  readonly rule: ClientProductRule;
  /** The normalised header value the rule was found in; version and surface are read from it. */
  readonly normalised: string;
}

/**
 * Selects the first header value that names a known product. A value that
 * names none does not participate, so an unrecognised vendor header falls
 * through to the User-Agent rather than forcing a verdict.
 *
 * @returns The rule and the normalised value it matched, or `undefined` when
 * the container is unreadable or no value names a product.
 */
export function selectLeadingProduct(
  headers: ClientIdentityHeaders,
): SelectedClientProduct | undefined {
  if (!headers.readable) {
    return undefined;
  }
  for (const value of headers.values) {
    // A type check only: an emptiness test would trim the whole untrusted value
    // and defeat the scan bound, and an all-space value names no product anyway.
    if (typeof value !== 'string') {
      continue;
    }
    const normalised = normaliseClientHeaderValue(value);
    const rule = findLeadingProductRule(normalised);
    if (rule !== undefined) {
      return { rule, normalised };
    }
  }
  return undefined;
}
