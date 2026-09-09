# ADR-229: Own-built algorithm and data-structure foundations

**Status**: Accepted by owner direction, 2026-09-08; repository transcription
submitted for review. Implementation and qualification remain separate work.

**Date**: 2026-09-08

**Related**:
[ADR-041](041-workspace-structure-option-a.md) — repository dependency tiers;
[ADR-154](154-separate-framework-from-consumer.md) — general mechanism and
consumer separation;
[ADR-155](155-decompose-at-the-tension.md) — meaningful responsibility boundaries;
[ADR-173](173-graph-stack-topology.md) — existing graph stack, refined here for
implementation origin within this decision's scope;
[ADR-179](179-transport-agnostic-graph-substrate.md) — transport-independent substrate;
[ADR-226](226-agent-research-surface-for-imported-records.md) — historical research custody.

## Context

The Reliable Atoms programme seeks small, explicit, comprehensively assured
foundations whose guarantees can be reused across the estate. Graph and
non-graph reference research reveals useful mechanisms, contracts and failure
cases, but it does not itself settle who owns the resulting implementations or
which evidence transfers into a new composition.

On 8 September 2026, the owner decided to build our own algorithms and data
structures through Reliable Atoms and layers of composition, using the best
openly licensed examples as inspiration, and requested a governing document,
reconciliation of the relevant documents and a draft PR. The owner's word,
verbatim, given on 9 September 2026 when this record was reconciled: "The
general decision here is to select the best, permissively licenced libraries,
and use their code as inspiration to create Reliable Atoms and composition
layers tailored to our needs and created to our deliberately very high quality
standards." On licences, the same day: "We don't need to cite licences when we
just exploring options, it is useful to have the licence data recorded and
available." This record homes that decision in the repository. The companion [governing policy](../foundations/algorithms-and-data-structures-governance-2026-09-08.md)
owns its operational detail, including scope, reference investigations,
authorship, qualification and effort assessment.

## Decision

OCE authors and maintains its own graph and non-graph algorithms and data
structures as SMALL Reliable Atoms and meaningful layers of composition.
Reference research informs the mechanisms, contracts, representations,
structures and compositions. Each authored implementation and composition
establishes its own applicable qualification evidence.

The governing policy is the canonical development policy for this scope. The
[bundle index](../foundations/foundations-bundle-index-2026-09-08.md) locates
the general architecture, graph capability contracts, candidate designs,
worked examples and source review. Those documents own their specified
concerns; this ADR owns the repository's decision to follow that policy.

### Repository interpretation

- Scope follows the owned algorithm or data-structure responsibility, covering
  new capability and deliberate replacement or reconstruction. Language/runtime
  assumptions and separately governed protocol, storage, transport and platform
  services keep explicit contracts and dependency boundaries.
- Owner-directed offered capability establishes legitimate programme scope,
  including innovation before existing applications consume it. Qualification
  establishes the promised behaviour. Package promotion separately establishes
  cohesion, consumption, release responsibility and compliance with repository
  dependency and workspace rules.
- Atom and composition boundaries follow invariant ownership and change
  cohesion. Logical composition levels and distribution units have distinct
  purposes. ADR-041 and ADR-154 continue to govern repository placement and
  framework/consumer separation.
- ADR-173 continues to own the existing graph-stack topology, its selected RDF
  profile and corpus-source boundaries. Within this decision's scope, new or
  deliberately reconstructed algorithm and data-structure mechanisms follow
  this implementation-origin policy. Reusable graph foundations may support
  several models; their integration into an existing stack must preserve that
  stack's declared semantic and source-authority contracts.
- Exact reference material and its applicable licence, revision, assumptions
  and actual use remain recorded. Existing observations retain their evidence
  scope and execution date. A familiar mechanism and a reference's successful
  tests supply design evidence; our qualification binds our actual contract
  and implementation.

## Consequences

The estate owns the implementation, assurance, documentation and maintenance
of the foundations it authors. Reusing engineering knowledge can reduce design
uncertainty; whole-life effort savings remain an empirical hypothesis to assess
through delivered capabilities and later changes.

Delivery can proceed through small coherent increments while retaining the
complete capability requirements. Candidate designs and worked expectations
remain clearly distinguished from qualified implementations. This documentation
change supplies the governing decision and design baseline; it changes no
runtime code or dependency manifest.
