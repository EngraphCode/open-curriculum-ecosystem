# MCP Registry publication

How the Oak MCP app's entry in the official MCP Registry
(`registry.modelcontextprotocol.io`) is composed, proved, and published — and
the two decisions that have to be taken before it can be: the namespace, and
the 100-character catalogue description.

Everything marked **measured** below was probed first-hand on 2026-09-09
against registry build `1.8.1` (`GET /v0.1/version` →
`{"version":"1.8.1","git_commit":"f52dc852…","build_time":"2026-08-06T23:41:04Z"}`).
Everything else cites the registry's own documentation or source.

## What the registry is, and its maturity

It is the ecosystem's server directory — it answers _"which servers exist?"_
for clients that browse rather than clients handed a URL. It is complementary
to the `initialize` handshake (which answers _"what can this server do?"_).

The project's own status note appears at the top of every publishing document:

> The MCP Registry is currently in preview. Breaking changes or data resets
> may occur before general availability.

A data reset costs a re-publish, which is cheap and repeatable. Unlike a
`/.well-known` path, a registry entry can be withdrawn and re-added without
stranding consumers on a promise (this is the asymmetry that decided MCP-346
the other way).

## The document is composed, never committed

There is no `server.json` in this repository, deliberately.

The field that matters most in a registry entry is the endpoint, and the
endpoint is not a repository fact: it comes from `CANONICAL_HOST`, deployment
configuration this app reads at boot. A committed copy would have to restate
that host, and `src/served-origin.ts` holds the invariant this app has kept
since MCP-351 — nothing but the served-origin derivations computes "where is
this deployed", because two places computing it are two places to disagree. A
registry entry advertising a stale address is worse than no entry at all: a
browsing client has no other way to reach us and no reason to doubt what it
read.

So the document is built at publication time:

```bash
MCP_REGISTRY_NAMESPACE=<the chosen namespace> \
MCP_REGISTRY_DESCRIPTION="Search, explore and download Oak's free, fully sequenced and resourced KS1-KS4 curriculum." \
CANONICAL_HOST=mcp.thenational.academy \
pnpm --filter oak-curriculum-mcp-streamable-http generate:server-json
```

The generator (`scripts/generate-server-json.ts`) writes
`.generated/server.json` only after four steps, in this order:

1. **Resolve** each field from the home that owns it
   (`src/mcp-registry/server-json-inputs.ts`) — the endpoint from the same
   `resolveServedMcpUrl` derivation the request path and the landing-page bake
   use, the version from `resolveApplicationVersion` (what `x-app-version`
   serves), the title and website from `OAK_SERVER_BRANDING`, and the server
   name from `MCP_SERVER_NAME` — which reads the same as the `initialize`
   name but is deliberately its own constant, because a published registry
   name cannot be edited and a rename forks the identity rather than moving
   it. Two values are supplied rather than derived, and both are decisions:
   the namespace, and the catalogue description (see below).
2. **Compose and validate locally** against every published registry
   constraint (`src/mcp-registry/server-json.ts`), so a bad document fails in
   the gate that built it.
3. **Measure the deployment.** Read the RFC 9728 protected-resource metadata
   at the address the document advertises, and require its `resource` to be
   _exactly_ the endpoint in the document. This is the step that makes the
   entry true of a running server rather than true of an environment variable.
4. **Ask the registry.** `POST /v0.1/validate` is public, unauthenticated and
   non-mutating, so the registry's own verdict is available before any
   credential exists.

Measured, the whole chain end to end:

```text
wrote .generated/server.json for academy.thenational/oak-curriculum-http v1.179.0
  endpoint https://mcp.thenational.academy/mcp — confirmed as the resource served at
    https://mcp.thenational.academy/.well-known/oauth-protected-resource/mcp
  registry validation: accepted by https://registry.modelcontextprotocol.io/v0.1/validate
```

Measured, the same generator refusing a host the app does not serve
(`CANONICAL_HOST=www.thenational.academy`), exit code 1:

```text
generate-server-json: the deployment did not serve protected-resource metadata at
https://www.thenational.academy/.well-known/oauth-protected-resource/mcp (HTTP 404)
— a registry entry must name a running server
```

The in-repo pin is `src/mcp-registry/server-json.integration.test.ts`: it boots
the real app, asks it over HTTP what endpoint it serves, and fails if the
document disagrees. That is what a host change trips.

The pin's reach was **measured by mutation**, not assumed — two probes, each
reverted:

| Mutation                                                                    | Pin                                                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `deriveSelfOrigin` returns a drifted canonical origin (the served PRM side) | **red**                                                                                     |
| `MCP_RESOURCE_PATH` changes, moving document and served value together      | **red** — the suite asserts the literal endpoint, so a shared-derivation change cannot hide |
| `deriveResourceUrl` in `application.ts` drifts                              | _green_                                                                                     |

The last row is the honest limit: that function feeds the tool-level
auth-error resource URL, a third consumer of `resolveServedMcpUrl`, and this
pin does not cover it. The PRM `resource` is the value pinned deliberately —
it is the endpoint a client binds its token audience to, and so the one a
registry entry is a promise about.

## The description decision

The registry caps `description` at 100 characters — **measured**, as a hard
`422` at the API, not a soft warning:

```text
POST /v0.1/validate  (description of 113 characters)
→ 422 {"message":"expected length <= 100","location":"body.description"}
```

The description this server already publishes in its `initialize` handshake
(`OAK_SERVER_BRANDING.description`) is 113 characters:

> Search, explore, download and use Oak's free, fully sequenced and resourced
> curriculum resources, for KS1 to KS4.

Truncating it at publication time would put a sentence nobody wrote in a
public catalogue, so the generator will not do that. It takes the line from
`MCP_REGISTRY_DESCRIPTION` and enforces the cap. **Recommended, 90
characters, the same claim authored to fit:**

> Search, explore and download Oak's free, fully sequenced and resourced
> KS1-KS4 curriculum.

The alternative is to shorten the served copy so one line serves both. That
is a change to reviewed agent-facing content with consequences for every MCP
host that renders it, and it needs a content-audit re-attestation — so it is
an editorial decision, not a publication step.

## The namespace decision

**The namespace is the reverse of the domain, not the domain.**
`thenational.academy/…` is not a valid namespace for the domain
`thenational.academy`; the registry reverses the labels when it grants
permissions:

```go
// ReverseString reverses a domain string (example.com -> com.example)
reverseDomain := ReverseString(domain)
{ Action: auth.PermissionActionPublish,
  ResourcePattern: fmt.Sprintf("%s/*", reverseDomain) }
```

— [`internal/api/handlers/v0/auth/common.go`](https://github.com/modelcontextprotocol/registry/blob/main/internal/api/handlers/v0/auth/common.go)

So proving ownership of `thenational.academy` grants `academy.thenational/*`.
Measured precedent in the live registry, in exactly Oak's shape — bare-domain
namespace, remote-only, endpoint on the `mcp.` subdomain of the namespace
domain:

```json
{
  "name": "app.linear/linear",
  "remotes": [{ "type": "streamable-http", "url": "https://mcp.linear.app/mcp" }]
}
```

Both candidate documents were **measured as accepted** by
`POST /v0.1/validate`: `academy.thenational/oak-curriculum-http` and
`io.github.oaknational/oak-curriculum-http` each returned
`{"valid":true,"issues":[]}`.

### Option A — `io.github.oaknational/oak-curriculum-http`

Proof of ownership is GitHub authentication only. No DNS, no zone owner, no
external dependency.

- Interactive: `mcp-publisher login github` — a GitHub **device** OAuth flow.
- **You must be an Owner of the `oaknational` organisation, not merely a
  member.** The registry reads the membership role and grants an org namespace
  only to `admin`:

  > GitHub authentication always grants your personal namespace,
  > `io.github.<your-username>/*`. To publish under an **organization**
  > namespace (`io.github.<orgname>/*`), you must be an **Owner** of that
  > organization. Ordinary org membership is no longer sufficient.

  A pending, unaccepted owner invitation does not count.

- With a PAT (`login github --token=…`): a classic PAT needs `read:org`; a
  fine-grained PAT needs _Organization permissions → Members → Read-only_.
  Neither needs any repository scope.
- **A PAT missing that scope fails silently into the wrong namespace.** The
  handler treats a plain `403` from `GET /user/memberships/orgs` as "no admin
  orgs" rather than as an error — only a rate-limit or SSO `403` fails closed
  (`github_at.go:254-270`). So an under-scoped token does not error: it grants
  the operator's _personal_ namespace, and a publish would put Oak's
  curriculum under `io.github.<person>/…`. Check the granted namespace before
  publishing, never just the login's exit code.
- **In GitHub Actions, use OIDC and no secret at all**:
  `mcp-publisher login github-oidc`, with `permissions: id-token: write`. OIDC
  grants the _repository owner's_ namespace — so an `oaknational` repo gets
  `io.github.oaknational/*` with no PAT and no Owner check. This one is
  **source-verified, not documented**: `buildPermissions` in
  [`github_oidc.go`](https://github.com/modelcontextprotocol/registry/blob/main/internal/api/handlers/v0/auth/github_oidc.go)
  grants `io.github.<claims.RepositoryOwner>/*` with no role check, while the
  published GitHub Actions guide never says which namespace OIDC grants.

### Option B — `academy.thenational/oak-curriculum-http`

Proof of ownership is a challenge on the `thenational.academy` zone. Two
mechanisms; they differ in one material way.

**DNS (TXT record).** Record type `TXT`, placed on the **apex** of
`thenational.academy` — _not_ under a `_mcp-auth` or `_mcp-registry` selector.
The registry documents this as the most common mistake and probes for it:

> The TXT record must be placed on the **apex** of your domain (e.g.
> `example.com`), **not** under a selector like `_mcp-auth.example.com`. MCP
> DNS auth follows SPF-style placement (apex), not DKIM-style (selector).

Value format `v=MCPv1; k=<algo>; p=<base64 public key>`, algorithm `ed25519`
or `ecdsap384`:

```bash
MY_DOMAIN="thenational.academy"

# Generate public/private key pair using Ed25519
openssl genpkey -algorithm Ed25519 -out key.pem

# Generate TXT record
PUBLIC_KEY="$(openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64)"
echo "${MY_DOMAIN}. IN TXT \"v=MCPv1; k=ed25519; p=${PUBLIC_KEY}\""
```

macOS ships LibreSSL, which has no Ed25519 in `genpkey`; use
`/opt/homebrew/opt/openssl@3/bin/openssl` explicitly, or take the
`ecdsap384` path (which needs `--algorithm ecdsap384` on login and a 96-hex
key rather than 64).

```bash
PRIVATE_KEY="$(openssl pkey -in key.pem -noout -text | grep -A3 "priv:" | tail -n +2 | tr -d ' :\n')"
mcp-publisher login dns --domain "${MY_DOMAIN}" --private-key "${PRIVATE_KEY}"
```

**HTTP challenge.** Serve the identical proof string at
`https://thenational.academy/.well-known/mcp-registry-auth`, then
`mcp-publisher login http --domain thenational.academy --private-key …`.

**The difference that matters:** DNS grants subdomain namespaces as well
(`academy.thenational/*` **and** `academy.thenational.*`); HTTP grants only
`academy.thenational/*`. The registry's CLI reference says both grant
subdomains — the source disagrees (`allowSubdomains := true` for DNS,
`false` for HTTP), and the source is what runs.

Either mechanism needs a change on a zone this team does not control, which is
the same zone-owner engagement shape as MCP-172 and the Cloudflare route work.
The apex TXT record is the smaller ask of the two — the HTTP challenge needs
the apex to stop redirecting to `www` for one path, which MCP-622 already
recorded as awkward.

### The question this decision does _not_ raise

**There is no requirement that the endpoint sit under the namespace domain.**
Verified three ways: the publish path's only namespace check is
`HasPermission(input.Body.Name, …)` against the server _name_, never the
remote URL; `validateRemoteTransport` does no network I/O and never reads the
name; and the live validator accepted `academy.thenational/…` with an endpoint
on an unrelated `*.vercel.app` host. So `mcp.thenational.academy` under
`academy.thenational` is fine, and so would a Vercel host be.

## Publishing (not yet done)

Publication is deliberately outstanding: it needs the namespace decision above.
When that lands, the maintainable route is a workflow, because the version must
change on every publish and a release already changes it.

There is no official publishing action — the tool is fetched from the release
tarball:

```yaml
permissions:
  id-token: write # OIDC only; the DNS route needs just contents: read
  contents: read

steps:
  - name: Install mcp-publisher
    run: |
      curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher
  - name: Compose and prove the entry
    env:
      MCP_REGISTRY_NAMESPACE: ${{ vars.MCP_REGISTRY_NAMESPACE }}
      MCP_REGISTRY_DESCRIPTION: ${{ vars.MCP_REGISTRY_DESCRIPTION }}
      CANONICAL_HOST: ${{ vars.CANONICAL_HOST }}
    run: pnpm --filter oak-curriculum-mcp-streamable-http generate:server-json
  - name: Authenticate
    run: ./mcp-publisher login github-oidc # or: login dns --domain … --private-key …
  - name: Publish
    run: ./mcp-publisher publish --file apps/oak-curriculum-mcp-streamable-http/.generated/server.json
```

If the PAT route is ever chosen instead of OIDC, put the token on a protected
Environment rather than a repository secret — the registry's own warning is
that an org token can overwrite _any_ server under `io.github.<org>/*`, and a
plain repo secret hands that to every repository writer.

### Verify the entry, not the exit code

```bash
curl -s 'https://registry.modelcontextprotocol.io/v0.1/servers/<url-encoded-name>/versions'
```

A successful publish is one where that call returns the version just published
with `"isLatest": true`.

## How the entry stays true

- **A published version is immutable.** _"The version string MUST be unique for
  each publication… Once published, the version string (and other metadata)
  cannot be changed."_ Changing the endpoint therefore means publishing a new
  version, never editing the old one — which is why the generator's
  pre-publication proof matters more than a post-publication check.
- **The version is the release version**, so every release is a publishable
  version and no version scheme has to be invented.
- **A host change fails the suite before it reaches the registry**, via the
  integration pin described above.
- **A dead endpoint is a takedown risk, not a publish-time error.** The
  registry does not probe the endpoint at publish time (measured: the validator
  accepted a document naming a hostname that does not resolve), but
  "non-functioning servers" are on its removal list. The uptime monitoring on
  MCP-481 is what protects the entry.

## Registry constraints worth knowing before editing anything

| Constraint                                                                                 | Consequence here                                                                                                                         |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `description` ≤ 100 characters                                                             | `OAK_SERVER_BRANDING.description` is 113, so `MCP_REGISTRY_DESCRIPTION` exists as a separate authored line; the builder enforces the cap |
| `$schema` required by the API, though absent from the schema's own `required` list         | always emitted                                                                                                                           |
| `remotes[].type` ∈ `streamable-http`, `sse`                                                | this app publishes one `streamable-http` remote                                                                                          |
| Remote URL must be HTTPS and non-loopback (`IsValidRemoteURL`)                             | the builder refuses a local-development origin outright                                                                                  |
| Namespace and name must each start and end alphanumeric                                    | stricter than the published JSON Schema pattern; the builder applies the stricter rule                                                   |
| `packages` is not required, and neither is `remotes`                                       | a remote-only entry is fully supported, and skips package-ownership verification entirely                                                |
| `_meta` accepts only `io.modelcontextprotocol.registry/publisher-provided`, capped at 4 KB | not used                                                                                                                                 |

## Sources

- Schema: `https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`
- [Authentication](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/authentication.mdx),
  [GitHub Actions](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/github-actions.mdx),
  [Remote servers](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/remote-servers.mdx),
  [Versioning](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/versioning.mdx),
  [Moderation policy](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/moderation-policy.mdx),
  [CLI commands](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/cli/commands.md)
- Source: [`internal/validators/`](https://github.com/modelcontextprotocol/registry/tree/main/internal/validators),
  [`internal/api/handlers/v0/auth/`](https://github.com/modelcontextprotocol/registry/tree/main/internal/api/handlers/v0/auth),
  [`internal/api/handlers/v0/publish.go`](https://github.com/modelcontextprotocol/registry/blob/main/internal/api/handlers/v0/publish.go)
- Live API: `https://registry.modelcontextprotocol.io/v0.1/{version,servers,validate}`
