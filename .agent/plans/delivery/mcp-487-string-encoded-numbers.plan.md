---
id: mcp-487-string-encoded-numbers
node_type: delivery
name: "MCP-487 — accept string-encoded numbers at the MCP boundary, landed with local proof of the operations"
overview: "Re-base the August fix (a guarded z.preprocess on numeric MCP tool parameters that converts only plain decimal strings) onto the tip and land it only with local proof that every MCP operation it touches still works: the schema cases, the generated tools, and the served tool calls."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: mcp-output-contracts
impact_areas:
  - served-surface
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-10
---

# MCP-487 — string-encoded numbers at the MCP boundary

## Goal

A host whose MCP bridge sends numeric tool arguments as JSON strings (Claude Code did in August)
gets the same answer as a spec-compliant client: `"25"` and `25` both pass a `limit` bound of
300, `"5000"` and `5000` are both refused by it, and `"abc"`, `""`, `" "`, `"0x10"`,
`"Infinity"`, `null`, `true` and `[]` are all refused. The constraint is untouched; only the
representation is normalised. Owner ruling 2026-09-10: "487 sounds like it should merge, but
only with ironclad local proof that it does not break the relevant MCP operations."

## User groups and value

- **Teachers using an assistant on such a host**: keyword paging and the other six numeric
  parameters work instead of being refused before the bound.
- **The MCP surface's maintainers**: one generator rule, proven once, instead of per-tool
  workarounds.

## Mechanism

The sdk-codegen typegen wraps numeric parameters of flat MCP input schemas in a guarded
`z.preprocess` (plain-decimal strings only); six generated tool files regenerate from the
generator, never by hand; the content-audit surfaces re-attest through their own validator.
The August commit (SHA:9b6da6178, conserved as a patch) is applied onto the tip with the two
audit surfaces taken from the tip and regenerated, never hand-merged.

## Acceptance criteria (each with a proof)

1. The generator emits the guard for every numeric parameter and nothing else changes. Proof
   `repo-safe`: `build-zod-type.unit.test.ts` and `emit-input-schema.unit.test.ts`; the
   regenerated tool files equal the generator's output (`pnpm sdk-codegen` leaves a clean tree).
2. The nine representation cases behave as the goal states against the REAL generated schema.
   Proof `repo-safe`: a unit test importing the generated `get-keywords` schema and asserting all
   nine; cited in the pull request.
3. The served operations still work: every tool with a numeric parameter answers a call with
   the number as a string and as a number identically, and refuses the out-of-bound and
   non-decimal forms. Proof `repo-safe`: the MCP streamable-http workspace's tool-handler tests
   and the conformance suite green locally (`pnpm --filter <mcp workspace> test`, the
   `mcp-conformance` run), plus a recorded local call log of the six tools through the served
   endpoint with both encodings — the "ironclad local proof" the owner named, pasted into the
   pull request body.
4. The MCP content audit re-attests. Proof `repo-safe`: `validate-mcp-content-current-source`
   green after `refresh-mcp-content-current-source-anchors`, with the delta inventory
   regenerated.

## Out of scope

Any other coercion (booleans, arrays); the host's bridge; upstream's copy of the fix (the fork
never writes upstream; the finding rides the owner's held upstream-report item).

## Todos

1. Regenerate (`pnpm sdk-codegen`), diff against the patch's generated files, keep the
   generator's output.
2. Run the unit tests and add the nine-case test against the generated schema.
3. Run the served-operation proof and paste the log into the pull request.
4. Re-attest the content audit; commit; push; draft; code-expert and security-expert legs;
   Copilot; front door.

## Review dispositions

(none yet)
