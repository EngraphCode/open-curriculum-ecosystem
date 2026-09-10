---
title: "Agent-readiness standards verification"
collection: discovery
lane: current
status: verification-report
verified_at: 2026-09-09
supersedes: standards-verification-2026-06-01.report.md
---

# Agent-readiness standards verification — 2026-09-09

Supersedes `standards-verification-2026-06-01.report.md`, which is three months
stale and carries three now-false rows. Discharges the `ar1` refresh the hub
plan blocks on. Every row below was read at a primary source on 2026-09-09
except the two marked NOT REFRESHED.

## Findings that change what we should build

**1. The Agent Skills Discovery spec defines NO link relation type.** v0.2.0
(draft, published 2026-01-17, updated 2026-03-12) specifies the path, the index
schema, digests, methods, content types, caching and CORS — and contains no
Link-header relation, no relation name, and no mention of RFC 9727. So the hub
plan's **AR-A2 ("exactly one discoverable relation to the skills index") asks
for something no standard defines.** Adding it means either minting an extension
relation type as a URI (RFC 8288 §2.1.2) or inventing a token. Under the plan's
own "no fabricated metadata" principle that is a decision, not an
implementation task. Note the estate already links the skill from `llms.txt`
(Oak-Web-Application#4450) — a real, working discovery path that needs no
invented vocabulary.

**2. `llms.txt` is a Business-to-Agent surface, not an SEO or crawler surface.**
Measured adoption ~10% of 300k domains; 7.4% of the Fortune 500. Over a 90-day
window of 500M AI-bot visits, **408 fetched `/llms.txt`** — negligible. No W3C,
IETF or vendor commitment. The one consumer that demonstrably reads it is
**coding agents on developer-documentation sites**, which is precisely Oak's
audience for an MCP entry. So #4450 is worth landing on its merits and should
not be argued for on crawler-visibility grounds.

**3. Markdown content negotiation: `Accept: text/markdown` is the recommended
shape, and `.md` URLs are the weaker one** — one round trip instead of two, and
the canonical URL stays canonical. **Hard requirement that follows: every cache
layer must `Vary: Accept`**, or browsers get markdown and agents get HTML. This
is load-bearing for Oak: `www` sits behind Cloudflare with Vercel `PRERENDER`
caching, so AR-A5 is a caching change as much as a rendering one.

**4. MCP `2026-07-28` makes `server/discover` mandatory for servers.** The
revision moves the protocol core to stateless, drops session state, and adds a
mandatory `server/discover` RPC returning supported versions, capabilities and
identity in one call. Oak's app implements `2025-11-25` (MCP-644). This is the
one place the estate is behind a *mandatory* clause rather than a nice-to-have.

**5. Content Signals is interim; IETF AIPREF is the standards track.**
Cloudflare's policy (launched 2025-09-24) defines `search`, `ai-input`,
`ai-train`; its managed default is `search=yes, ai-train=no`. Cloudflare's own
lead acknowledges it is not standardised. `draft-ietf-aipref-vocab` is at **`-07`,
dated 2026-08-19, expiring 2027-02-20** (corrected the same day — the first
version of this row said `-06`/2026-08-14). It is a working-group document on
the **Proposed Standard** track defining `train-ai` and `search` categories
with y/n values — not yet an RFC.

Consequence for AR-A7, **CORRECTED the same day**: **Oak already publishes
Content Signals on `open-api`** — `Content-Signal: ai-train=yes, search=yes,
ai-input=yes`, in the robots.txt body from an origin file rather than a
Cloudflare prepend (verified in the served response). The mechanism
recommendation first written here rested on the false premise that nothing was
published yet. The live position is inconsistent — nothing on `www`, consent to
AI training on `open-api` — and its ratification is unverified. So the decision
owed is not "adopt or not" but **"are the published values ours, and should
every host say the same thing"**, with AIPREF tracked for when it lands.

**6. MCP Server Cards remain draft, and nothing about them has improved.**
CORRECTED 2026-09-09 (later the same day) by a primary-source watch pass; the
first version of this row rested on search summaries and was wrong in three
places. What the sources actually say:

- SEP-2127 is **open and unmerged**; the extension is **absent from
  `schema/draft`** (control: `ClientCapabilities` = 95 hits there).
- The repo was renamed `experimental-ext-server-card` → **`ext-server-card`**,
  but **the "not an accepted or official MCP extension" status line did not
  change**. The rename is a trap: it reads like graduation and is not.
- **There is no evidence Claude Desktop or Cursor ship Server Card support.**
  Zero mentions of either client in the extension repo (control: `ServerCard` =
  4 hits), the schema self-describes as pre-release, and the core-spec types PR
  #2652 was **closed unmerged on 2026-04-27**. The earlier claim that client
  support had raised this item's value is **withdrawn**.
- The site catalog is **`/.well-known/ai-catalog.json`**, media type
  `application/ai-catalog+json`, defined by the third-party `Agent-Card/ai-catalog`
  spec — **not by MCP**, and not the `/.well-known/mcp/catalog.json` first
  recorded here. That makes five candidate paths in twelve months, one of them
  owned by someone else entirely.
- Two further gates: the Extensions Track also requires a **merged SDK
  reference implementation**, and the card's **auth shape is unresolved**.
  SEP-2133 (the extensions framework) is merged and `final`, so the vehicle
  exists — the card has not boarded it.
- The WG charter's leadership terms **lapsed 2026-08-14** with no renewal, and
  the 2026-08-22 roadmap does not list Server Cards among its five priority
  areas.

MCP-422's hold stands, and its own 2026-08-20 table was confirmed accurate row
for row. MCP-346's "no" to `/.well-known/mcp.json` remains correct.

**7. Official MCP Registry: publishing needs proven domain ownership.**
`server.json` plus `mcp-publisher init`/`publish`; the registry enforces
namespace authentication and package-ownership verification, with a restricted
list of package registries. Nothing observed blocks a remote-endpoint server,
but the ownership-proof mechanism for a remote namespace is not stated in the
requirements doc — **MCP-637 needs the publishing guide read before it is
sized.**

## Rows carried forward unchanged

| Surface | Status |
|---|---|
| RFC 9727 api-catalog + `Link` relation | live and conformant on `www` (verified today) |
| Agent Skills 0.2.0 conformance | **met on `open-api`** — index valid against `schemas.agentskills.io/discovery/0.2.0`, `text/markdown`, HEAD, CORS `*`, and the advertised `sha256:` digest recomputed byte-exact |
| `auth.md` | **live at the lowercase path**, documents static-key auth and the deliberate OAuth absence; gaps are rate limits and a support path (MCP-427) |
| Commerce (x402, MPP, UCP, ACP) | non-goal — Oak does not transact on these surfaces |
| `/.well-known/mcp.json` | answered NO (MCP-346) |

## NOT REFRESHED — declared, not assumed

- **DNS-AID**: REFRESHED later the same day, and **unchanged** — still `-02`
  (2026-05-27, 105 days old), stream `None`, group "Individual Submissions",
  no intended standards level, **not working-group adopted**, expiring
  **2026-11-28**. The `dnsop` in the filename is the author's convention, not
  adoption (controlled: a `name__contains=dnsaid` search returns exactly one
  document). That expiry is the sharper trigger: a `-03` means re-measure for
  adoption; a lapse means superseded, close it.
- **WebMCP**: the API this estate tracked **no longer exists**. The spec is a
  Draft Community Group Report (2026-09-04), explicitly off the W3C Standards
  Track, and uses **`document.modelContext`** with `registerTool()` /
  `getTools()` / `executeTool()` — **zero uses of `navigator.modelContext` and
  zero of `provideContext`**. Per-tool registration is a different shape, not a
  rename, so sizing from the old description would size the wrong work. Chrome
  "Proposed, no ship milestone"; Firefox and Safari no signal.
- **Web Bot Auth**: not re-read today. AR-A8 remains a decision-and-evidence
  item, and no per-app decision ledger exists yet.

## Sources

Primary: `github.com/cloudflare/agent-skills-discovery-rfc` (README, v0.2.0);
`datatracker.ietf.org/doc/draft-ietf-aipref-vocab`;
`blog.modelcontextprotocol.io/posts/2026-07-28`;
`modelcontextprotocol.io/specification/2026-07-28`;
`github.com/modelcontextprotocol/registry` (official-registry-requirements);
`github.com/modelcontextprotocol/modelcontextprotocol/pull/2127`;
`blog.cloudflare.com/control-content-use-for-ai-training`;
`developers.openai.com/plugins/deploy/submission`. Secondary, for adoption
figures only: SE Ranking's 300k-domain study and the 500M-bot-visit analysis as
reported 2026.
