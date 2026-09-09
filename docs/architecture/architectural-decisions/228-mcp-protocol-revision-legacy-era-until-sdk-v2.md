# ADR-228: The MCP app stays a legacy-era `2025-11-25` server until the SDK v2 package family is adopted

- **Status:** Proposed (2026-09-09). Nothing here is owner-ratified. It
  records a scoping decision MCP-644 asked for explicitly — "a scoping
  decision first, not a migration" — so that the posture stops being an
  undocumented consequence of a dependency version and becomes a reviewed
  choice with named exit conditions.
- **Date:** 2026-09-09
- **Related:** [ADR-112](112-per-request-mcp-transport.md) — the stateless
  per-request transport that makes the eventual migration cheap;
  [ADR-113](113-mcp-spec-compliant-auth-for-all-methods.md) — auth on every
  MCP method, which this record leaves untouched and explains why;
  [ADR-052](052-oauth-2.1-for-mcp-http-authentication.md) — the OAuth
  posture the v2 family's auth opt-ins would touch;
  [ADR-122](122-permissive-cors-for-oauth-protected-mcp.md) — permissive
  CORS, whose relationship to the transport's `Origin` MUST is flagged in
  §Consequences as out of scope here;
  [ADR-223](223-perishable-claims-carry-risk-based-freshness-metadata.md) —
  why every external claim below carries its read date.

## Context

The MCP specification's current revision is `2026-07-28`. This app
implements `2025-11-25`. Until this record, no document in the estate said
so: the revision was a property of a dependency version, visible only by
reading `node_modules`, and nothing named the consequences or the exit.

`2026-07-28` is the largest revision since MCP launched. It moves the core
to **stateless, self-contained requests** with per-request capability
negotiation, eliminates the `initialize` handshake and protocol-level
sessions, removes the GET stream endpoint, renumbers several errors, and
introduces a formal deprecation policy. In its vocabulary a server is
**modern** (version, identity and capabilities as per-request metadata) or
**legacy** (an `initialize` handshake); this app is legacy.

The revision also makes one RPC mandatory. Read at
`modelcontextprotocol.io/specification/2026-07-28/server/discover` on
2026-09-09, verbatim:

> `server/discover` lets a client query a server's supported protocol
> versions, capabilities, and identity before sending any other requests.
> Servers **MUST** implement it.

That RPC does not exist anywhere in this repository. MCP-644 measured
0 hits for `server/discover` against a working control (143 hits for
`tools/list`), and this app declares `2025-11-25` throughout.

### What was measured, and how

Every claim in this section was measured first-hand on 2026-09-09.

**The SDK's ceiling is the binding constraint.** From the installed
package's own `dist/esm/types.js` — read from `node_modules`, not from a
changelog:

```text
@modelcontextprotocol/sdk@1.30.0
  LATEST_PROTOCOL_VERSION            = '2025-11-25'
  SUPPORTED_PROTOCOL_VERSIONS        = ['2025-11-25', '2025-06-18',
                                        '2025-03-26', '2024-11-05',
                                        '2024-10-07']
  occurrences of 'server/discover'   = 0
  occurrences of '2026-07-28'        = 0
```

`1.30.0` is what this app depends on (`^1.30.0`) and is also the `latest`
dist-tag on npm. So the app is already on the newest published release of
its SDK line, and no bump is available that would move it forward. The
SDK's own `ROADMAP.md` states that the `v1.x` branch "targets the
2025-11-25 spec revision; new spec revisions are implemented on `main`
only" — the 1.x line will not gain `2026-07-28`.

**Modern-era support lives in a different package family.**
`@modelcontextprotocol/core`, `/server` and `/client` at `2.0.0` do carry
`server/discover` and `2026-07-28`. They are present in this repository's
lockfile only transitively, through `@mcpjam/cli` and `@posthog/mcp` — dev
tooling, not app dependencies. Adopting the current revision therefore
means migrating package families, not raising a version range.

**A `server/discover` handler on the 1.x line would be unreachable.** This
is the decisive measurement, taken over real HTTP through this app's own
production composition, with controls:

```text
POST /mcp  MCP-Protocol-Version: 2026-07-28  method: server/discover
  -> HTTP 400  {"error":{"code":-32000,"message":"Bad Request: Unsupported
                protocol version: 2026-07-28 (supported versions:
                2025-11-25, 2025-06-18, ...)"}}

CONTROL  same version, method: tools/list   (a method this app implements)
  -> HTTP 400, byte-identical body

CONTROL  method: server/discover at 2025-11-25 (a supported version)
  -> HTTP 200  {"error":{"code":-32601,"message":"Method not found"}}

CONTROL  initialize, no version header
  -> HTTP 200  {"result":{"protocolVersion":"2025-11-25", ...}}
```

The first control is the one that settles the design: the transport rejects
on the **declared version, before any method dispatch**, so a handler
registered for `server/discover` could never be reached. The second control
isolates the method's genuine absence; the third shows the legacy lane
healthy.

**The mandatory clause binds modern-era servers.** The revision's own
compatibility matrix describes a legacy server as a first-class state and
gives its expected behaviour: for a dual-era client meeting a legacy
server, "HTTP: the modern request returns a `4xx` without a recognized
modern error body, and the client falls back to `initialize`" — outcome
**Works**. If "Servers MUST implement `server/discover`" bound legacy-only
servers, that row would describe mandated non-conformance. The MUST scopes
to servers implementing the revision it appears in.

**Production corroborates the fallback.** MCP-497 measured, over 14 days:
754 `server/discover` refusals against 6,757 successful `initialize` calls
and 62,963 successful `tools/call` calls — including for the user the
refusals cluster on, who is one of the heaviest successful users. Clients
declare `2026-07-28`, receive the refusal listing what this server speaks,
negotiate down, and proceed. That is negotiation working as designed, not
clients locked out.

**Two things a reader will otherwise misread.**

- A wire probe cannot answer this question against production. Auth
  precedes method dispatch, so `POST /mcp {"method":"server/discover"}`
  returns `401` whether or not the method exists. The `401` is evidence in
  neither direction; the code-level and composition-level measurements
  above are the evidence.
- `src/landing-page/components/site-chrome.tsx` contains the string
  `2026-07-28`, which MCP-644 flagged as unresolved. **Resolved: it is a
  date**, recording when the footer's two legal URLs were verified live. It
  is not evidence of protocol support. Several other `2026-07-28` strings
  in the repository are likewise dates or owner-ruling stamps.

## Decision

1. **This app is a legacy-era `2025-11-25` server, deliberately and on the
   record.** The posture is not a defect and not an oversight; it is the
   only revision its SDK line implements, and that line is already at its
   newest published release.
2. **Do not implement `server/discover` on the 1.x SDK line.** It is
   unreachable behind the transport's version check (measured above), and
   the only answer it could conformantly give a `2026-07-28` request is a
   version refusal — which the transport already gives. A handler would be
   dead code that also misrepresents the server's era.
3. **Do not renumber the version refusal to a modern error code.** Emitting
   `-32022` (`UnsupportedProtocolVersionError`), `-32020` or `-32021` from
   a server with no modern lane would tell dual-era clients "this server
   speaks modern, retry with the advertised versions **rather than falling
   back**" — steering them away from the `initialize` fallback that
   currently works at production scale. The present `-32000` refusal is
   load-bearing precisely because it is _not_ a recognized modern error.
   `src/protocol-revision-era.integration.test.ts` is the tripwire.
4. **The migration target is `@modelcontextprotocol/server@2.x`, serving
   both eras.** Its `createMcpHandler` defaults to a dual-era stateless
   mode, so one factory and one endpoint can serve modern requests per this
   revision and legacy `initialize` traffic side by side. That is what makes
   `server/discover` reachable, and it is the only route to it.
5. **Self-description in a `DiscoverResult` will derive from served
   values, never from literals.** When the migration lands, `capabilities`
   and identity come from `SERVED_SURFACE` and `OAK_SERVER_BRANDING` — the
   existing single points of control — and `supportedVersions` from the
   SDK's own constant, on the MCP-351 discipline that a served surface
   describes itself from what it serves.
6. **Auth stays ahead of dispatch; ADR-113 is unchanged.** The
   `2026-07-28` authorization page carves out no exemption for
   `server/discover` and repeats that authorization "MUST be included in
   every HTTP request from client to server". A `401` on the probe is
   conformant. Discovery "before initialising" is protocol ordering, not
   permission to cross the resource-server boundary unauthenticated.

### The exit condition

Migrate when the work is scheduled on its own terms, or at the latest
before 1.x security support lapses — the SDK documents at least six months
of fixes from the v2 release of 2026-07-27, so roughly 2027-01-27. Verify
that date against the SDK's own `VERSIONING.md` at the time; do not trust
this line.

## Consequences

### Positive

1. **The revision is now a reviewed position with a named exit**, not an
   invisible property of a dependency range.
2. **The behaviour Oak's compatibility depends on is pinned by a test.** A
   future SDK release that renumbered the refusal into a recognized modern
   error would break dual-era fallback silently — it passes every other
   gate. It now fails one.
3. **MCP-644's flagged ambiguity is resolved** rather than left for the
   next reader to re-derive.
4. **The migration is smaller than "stateless migration" suggests.** The
   hardest part of `2026-07-28` — eliminating session state — this app has
   already done: ADR-112's per-request pattern runs
   `sessionIdGenerator: undefined` with a fresh server and transport per
   request, which the SDK's migration guide names as the case that maps
   directly onto the v2 default. The remaining work is wire shape and error
   semantics, not architecture.

### Negative

1. **Discovery stays degraded until the migration.** A client wanting
   versions, capabilities and identity in one call cannot have it, and must
   probe `tools/list`, `prompts/list` and `resources/list` instead. This is
   the gap MCP-422 refers to when it records that `server/discover` is
   "post-connection capability discovery, which no static card replaces" —
   no server card closes it.
2. **A conformance scanner will mark Oak behind**, correctly as to the
   revision and incorrectly as to fault. Any conformance evidence must name
   the revision it tested against or it will be read as current when it is
   not — the obligation MCP-184 carries.
3. **The error-surface noise persists.** The refusal reaches Sentry through
   the transport's `onerror`, which is MCP-497's subject. This record does
   not change it, and deliberately does not fix it: the cure is to stop
   classifying a spec-correct refusal as an exception, which is that
   ticket's own small change.

### Out of scope, flagged not resolved

`2026-07-28` Streamable HTTP states that servers "**MUST** validate the
`Origin` header on all incoming connections to prevent DNS rebinding
attacks", answering an invalid one with `403`. ADR-122's rationale for
permissive CORS is about authorization under Bearer tokens; DNS rebinding
is a different threat, and the MUST also appears under `2025-11-25`. This
predates MCP-644 and is not settled here. It wants its own ticket, with the
exploitability question routed to a security reviewer.

## References

- **MCP `2026-07-28`** (read 2026-09-09):
  [Discovery](https://modelcontextprotocol.io/specification/2026-07-28/server/discover),
  [Versioning and Compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning),
  [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http),
  [Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization),
  [Versioning index](https://modelcontextprotocol.io/specification/versioning)
- **SDK**: `modelcontextprotocol/typescript-sdk` — `ROADMAP.md`,
  `VERSIONING.md`, `docs/protocol-versions.md`,
  `docs/migration/support-2026-07-28.md` (read 2026-09-09)
- **Implementation**:
  - `apps/oak-curriculum-mcp-streamable-http/src/app/core-endpoints.ts`
    (the per-request factory and its stateless transport)
  - `apps/oak-curriculum-mcp-streamable-http/src/protocol-revision-era.integration.test.ts`
    (the era contract and its tripwire)
  - `apps/oak-curriculum-mcp-streamable-http/src/served-surface/served-surface.ts`
    (the capability source a `DiscoverResult` would derive from)
  - `apps/oak-curriculum-mcp-streamable-http/src/server-branding.ts`
    (the identity source)
- **Tickets**: MCP-644 (this scoping), MCP-497 (the error-surface noise),
  MCP-422 (server cards), MCP-184 (conformance evidence naming its
  revision), MCP-345 (advertised scopes)
