/**
 * The one published address of the Oak curriculum MCP App widget.
 *
 * Generated at sdk-codegen time so every consumer — the tool definitions
 * advertising `_meta.ui.resourceUri`, the app's served-surface registration
 * key, and the auth public-resource allowlist — derives from this one
 * constant (MCP-187).
 *
 * The address is the same on every build and is a published contract. A
 * client keeps the address from the tool list it was given, so serving a
 * different address in its place breaks every client holding an earlier
 * list, and a published plugin needs a new reviewed version before it sees a
 * new address. Widget changes ship as compatible content behind this address.
 * The contract, its evidence, and the procedure for an incompatible change
 * live in ADR-141 (widget URI identity amendment, MCP-489).
 *
 * @see https://modelcontextprotocol.io/extensions/apps/overview (MCP Apps standard)
 */
export const BASE_WIDGET_URI = 'ui://widget/oak-curriculum-app.html';

/**
 * Tools that should advertise a widget UI via `_meta.ui.resourceUri`.
 *
 * Only allowlisted **names** emit `_meta.ui.resourceUri` in codegen and in
 * aggregated tool definitions. Other tools must not include `resourceUri`
 * in `_meta.ui` (even if they use `_meta.ui.visibility` for app-only helpers).
 *
 * Tools in this set get `_meta.ui.resourceUri` in their codegen output
 * and in aggregated definitions.
 *
 * @see https://modelcontextprotocol.io/extensions/apps/overview (MCP Apps standard)
 */
export const WIDGET_TOOL_NAMES: ReadonlySet<string> = new Set([
  'get-curriculum-model',
  'user-search',
]);
