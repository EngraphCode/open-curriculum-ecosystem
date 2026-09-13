# ADR-141: MCP Apps Standard as Only UI Surface

## Status

Accepted

## Date

2026-03-25

## Related

- [ADR-029: No Manual API Data Structures](029-no-manual-api-data.md)
- [ADR-030: SDK as Single Source of Truth](030-sdk-single-source-truth.md)
- [ADR-031: Generation-Time Extraction](031-generation-time-extraction.md)
- [ADR-046: OpenAI Connector Facades in Streamable HTTP](046-openai-connector-facades-in-streamable-http.md) (superseded by this ADR)
- [ADR-061: Widget CTA System](061-widget-cta-system.md) (superseded; CTA system deleted as part of this migration)
- [ADR-071: Widget URI Cache-Busting Simplification](071-widget-uri-cache-busting-simplification.md) (superseded by this ADR)

## Context

Oak's MCP HTTP server (`apps/oak-curriculum-mcp-streamable-http/`) serves
interactive widget UIs through tool definitions that carry ChatGPT-specific
`openai/*` metadata keys (`openai/outputTemplate`, `openai/toolInvocation/*`,
`openai/widgetAccessible`, `openai/visibility`) and a ChatGPT-only MIME type
(`text/html+skybridge`). Widget JavaScript communicates through the
`window.openai.*` API. This locks the entire UI surface to a single host.

The MCP Apps extension (SEP-1865, stable 2026-01-26) is the official,
host-neutral standard for serving interactive UIs from MCP tools. It is
supported by ChatGPT, Claude, Claude Desktop, VS Code GitHub Copilot, Goose,
Postman, and MCPJam. ChatGPT reads `_meta.ui.resourceUri` natively and
maintains `openai/outputTemplate` only as a compatibility alias.

The `@modelcontextprotocol/ext-apps` SDK (^1.5.0) is the migration target for
Oak's MCP Apps rollout. Resource registration now imports
`@modelcontextprotocol/ext-apps/server`; tool registration and the widget client
bridge complete in later work streams.

**Current framing note (2026-04-29):** this decision also carries the repo's
MCP Apps exploration goal. Oak is testing how one MCP App surface can work in
AI platforms such as Claude Cowork and ChatGPT while remaining a developer tool
surface for teams building with Oak's curriculum primitives.

## Decision

Oak builds one MCP server with MCP Apps widgets. ChatGPT is one host among
many. All OpenAI-specific coupling is deleted, not wrapped.

Specifically:

1. **Tool metadata**: All tool definitions use `_meta.ui.resourceUri` as the
   sole widget pointer. The `openai/*` metadata keys are deleted with no
   replacement:
   - `openai/outputTemplate` → `_meta.ui.resourceUri`
   - `openai/toolInvocation/invoking` and `/invoked` → deleted (no MCP Apps
     equivalent; hosts handle loading states)
   - `openai/widgetAccessible` → deleted (MCP Apps default visibility is
     `["model", "app"]`, meaning all tools are callable by both the model and
     widgets — this matches the current `widgetAccessible: true` semantics)
   - `openai/visibility: 'public'` → deleted (MCP Apps default visibility
     includes `"model"`, matching the current `'public'` semantics)

2. **Resource registration**: The HTTP app uses `registerAppResource` from
   `@modelcontextprotocol/ext-apps/server` with `RESOURCE_MIME_TYPE`
   (`text/html;profile=mcp-app`) instead of `text/html+skybridge`.

3. **Tool registration**: UI-bearing tools migrated to `registerAppTool`
   from `@modelcontextprotocol/ext-apps/server`. Generated tools continue to
   use the registry-driven path via `listUniversalTools(generatedToolRegistry)`.

4. **Widget client**: WS3 replaced the `window.openai.*` bridge with the
   MCP Apps `App` class from `@modelcontextprotocol/ext-apps/react`. The
   widget is a self-contained React MCP App using `useApp()` for host
   communication.

5. **No dual paths**: All OpenAI-specific resource metadata, MIME types,
   ChatGPT emulation wrappers, and `window.openai` widget bridges have been
   deleted. No compatibility layer exists.

## Consequences

### Positive

- One codebase serves ChatGPT, Claude, and any MCP Apps-compliant host.
- Widget resource registration uses the official MCP Apps SDK immediately.
- The custom `chatgpt-emulation-wrapper.ts` is deleted instead of being carried
  forward as a compatibility layer.
- Future hosts (Gemini, Cursor, etc.) gain widget support automatically.

### Negative

- Hard cutover means old ChatGPT-only widget previews stopped working immediately.
  WS3 introduced the MCP Apps client/basic-host development path (`pnpm dev:widget-in-host`).
- Any host that only reads `openai/outputTemplate` and not `_meta.ui.resourceUri`
  will not render widgets. Per the compatibility matrix, no known active host has
  this limitation — ChatGPT reads both.

### Neutral

- `_meta.securitySchemes` is retained alongside `_meta.ui` — it is not an
  OpenAI-specific key.
- The deprecated flat key `_meta["ui/resourceUri"]` is not emitted by Oak's
  codegen. `registerAppTool` auto-populates it at registration time for backward
  compatibility.

## Amendment — widget URI identity (2026-07-26, MCP-187; revised 2026-09-12, MCP-489)

`WIDGET_URI` is one published address, `ui://widget/oak-curriculum-app.html`,
the same on every build.

- **One owner.** The address is generated at sdk-codegen time from
  `cross-domain-constants.ts`. Every consumer — the tool
  `_meta.ui.resourceUri` advertisement, the served-surface registration key,
  and the auth public-resource allowlist — derives from that one constant;
  hand-frozen copies are banned by an ESLint `no-restricted-syntax` rule in
  the HTTP app (MCP-187, pull request 571).
- **A published contract.** When a plugin's MCP endpoint is scanned for
  submission, OpenAI stores the discovered metadata with that version: "The
  published plugin uses this metadata snapshot while tool calls and UI
  resources continue to use your live MCP server." Tool `_meta` fields
  "(including UI resource references and visibility)" and the "UI resource
  URI or linked resource metadata, including content security policy (CSP)
  settings" change only through a new reviewed version; "Until then, users
  continue to use the currently published snapshot" ([OpenAI, MCP server
  review requirements](https://developers.openai.com/plugins/deploy/app-review),
  read 2026-09-12). Developer-mode connectors and other MCP clients also keep
  the tool list they were given until they list tools again; this server runs
  stateless, with no session over which to notify them that the list changed.
  The server therefore answers at this one address on every build, and a
  submission is scanned only from a deployment that already serves this
  address and the widget's final `_meta.ui` settings.
- **Compatible changes ship behind the same address.** A content update
  served from the same published UI resource URI needs no new version "if the
  URI and published contract remain compatible", and "ChatGPT may continue
  serving cached resource contents for up to one hour" (same source). A
  change is compatible when it leaves the widget's `_meta.ui` settings (CSP
  domains, border preference) as they are and the widget still works with the
  tool results a host can still show it, from earlier releases and from the
  next one: it reads only fields those releases provide and ignores the rest.
- **Incompatible changes take a new address and a new version.** OpenAI's
  guidance is to "version resource identifiers when HTML, JavaScript, or CSS
  changes in a way that could break a cached component" ([OpenAI, Build your
  MCP server](https://developers.openai.com/apps-sdk/build/mcp-server), read
  2026-09-12), because "serving incompatible content at or removing content
  from a published UI resource URI can break the current version as soon as
  the server change deploys" (review requirements). The tools then advertise
  only the new address, and the server keeps serving every earlier address a
  published version or a client's earlier tool list can still reference, each
  with content that works with the tool metadata that named it. Every address
  the server answers at keeps one generated owner.
- **The address lives as long as its versions.** Once a published version
  references this address, the server keeps serving it for as long as that
  version can be used. Client tool lists never expire, so retiring an address
  is always a deliberate break for any client still holding it.
- **Staleness is the accepted cost.** The [MCP Apps
  specification](https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx)
  (2026-01-26) lets hosts "prefetch and cache UI resource content" and defines
  no invalidation a server can trigger, so a host that caches may show earlier
  widget content after a compatible change until its cache expires.
- **History.** Before this revision the address carried a per-build suffix —
  a timestamp hash (ADR-071), then from 2026-07-26 a hash of the commit SHA —
  so every release retired the address the previous release advertised, even
  though the widget bytes did not change between 2026-07-30 and this revision.
  Production showed the failure twice: a client holding a `resources/list`
  across the 1.148.0 deploy read "Resource not found" (UAT 2026-08-04, finding
  F2), and on 2026-09-10 a ChatGPT desktop connector holding release 1.178.6's
  address showed a resource-not-found error in place of the
  `get-curriculum-model` widget while production served release 1.181.1
  (MCP-489). This revision retires the last per-build address once; a client
  still holding it recovers when it lists tools again.

Source of truth:
`packages/sdks/oak-sdk-codegen/code-generation/typegen/cross-domain-constants.ts`;
the value is pinned by a designed sentinel in
`cross-domain-constants.unit.test.ts`, whose failure message names the
decision a change must re-adjudicate.
