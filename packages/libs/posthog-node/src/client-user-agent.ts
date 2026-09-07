/**
 * The one client string Oak emits: a `$mcp_client_user_agent` rebuilt from
 * closed pieces so PostHog's built-in harness column resolves (MCP-687).
 *
 * @remarks PostHog resolves that column at query time, in this precedence: the
 * `$mcp_vendor_client` header; then a `$mcp_client_user_agent` whose product is
 * `claude-code`, or one starting `grok`; then `$mcp_client_name`; then any other
 * `$mcp_client_user_agent`. Oak never emits a vendor header or a client name, so
 * for Oak's events the user agent is what resolves. The rule is open source:
 * https://github.com/PostHog/posthog/blob/b6c6a333056473cc7f20513256b62daeb5c05669/products/mcp_analytics/backend/mcp_harness.py
 * (its `_RAW_TOKEN` chain and `_label_multi_if`), with input-to-label examples
 * in the test beside it. It reads the user agent as the product token before
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
 * The product is chosen by the same bounded selection that derives
 * `oak_client_product`, so the two properties describe the same header value
 * by construction; version and surface are then read from that selected
 * value only.
 *
 * The version is the only place client-supplied bytes reach the value, and it
 * is bounded to at most a hundred distinct values by construction: a longer
 * digit run (a numeric installation id, say) omits the version rather than
 * truncating it, so the slot cannot carry a stable per-installation identifier.
 */

import {
  findLeadingProductRule,
  normaliseClientHeaderValue,
  selectLeadingProduct,
  type ClientProductRule,
} from './client-product-selection.js';
import type { ClientIdentityHeaders } from './event-policy-contract.js';

// The vendor's own vocabulary for the surface, taken from the labelling rule
// above rather than observed in Oak's traffic (only `cli` has been): a stated
// exception to the evidence-backed-token constraint, acceptable because every
// member is a fixed string re-emitted from this list and never a forwarded byte.
const CLIENT_BUILD_SURFACE_TOKENS = ['cli', 'sdk-ts', 'claude-vscode', 'claude-desktop'] as const;
type ClientBuildSurface = (typeof CLIENT_BUILD_SURFACE_TOKENS)[number];
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

/** Rebuilds the value from the selected rule and the normalised header it matched. */
function rebuildClientUserAgent(rule: ClientProductRule, normalised: string): string {
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

function readClientUserAgent(value: string): string | undefined {
  const normalised = normaliseClientHeaderValue(value);
  const rule = findLeadingProductRule(normalised);
  return rule === undefined ? undefined : rebuildClientUserAgent(rule, normalised);
}

/**
 * Rebuilds the user-agent value PostHog's harness column reads, from closed
 * pieces only, out of the same header value `normaliseOakClientProduct`
 * selects.
 *
 * @returns The rebuilt value, or `undefined` when no value names a known
 * product, in which case the property is omitted and the column reads "other".
 */
export function normaliseOakClientUserAgent(headers: ClientIdentityHeaders): string | undefined {
  const selected = selectLeadingProduct(headers);
  return selected === undefined
    ? undefined
    : rebuildClientUserAgent(selected.rule, selected.normalised);
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
