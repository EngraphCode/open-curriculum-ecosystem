---
id: graph-and-queue-foundations-delivery
node_type: delivery
name: "Graph and queue foundations delivery — the work packages and the queue atom"
overview: >-
  Home the foundations bundle's delivery programme (work packages W01 to
  W09) and its first candidate atom, the OCE queue, as plan-estate work
  under the Reliable Atoms programme, so that each package is picked up,
  sliced and proven through the estate's own delivery procedures rather
  than living only in an architecture record.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: reliable-atoms-programme
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-09
---

# Graph and queue foundations delivery

## Goal

The delivery programme the foundations bundle records — nine work packages
and one specified atom — is plan-estate work with an owner, a pickup shape
and proofs, not a table in an architecture record. When this lands, every
package has a named slice in the estate's delivery procedures, and the
queue atom is the first qualified Reliable Atom of the programme or a
register row with its failing gate named.

The governing decision is
[ADR-229](../../../docs/architecture/architectural-decisions/229-own-built-algorithm-and-data-structure-foundations.md);
the governing policy is the
[algorithms and data structures governance record](../../../docs/architecture/foundations/algorithms-and-data-structures-governance-2026-09-08.md);
the programme itself is the ratified strategic node this plan serves. The
work packages are defined in
[the graph library review and delivery record](../../../docs/architecture/foundations/graph-library-review-and-delivery-2026-09-08.md)
§6 and the queue atom in
[the OCE queue Reliable Atom specification](../../../docs/architecture/foundations/oce-queue-reliable-atom-2026-09-08.md).
Those records own the contracts and the evidence; this node owns the work.

## User groups and value

Engineers and agents picking up foundations work find one node that says
what is next, what it depends on and how it is proven. The programme's
maintainers see progress as register rows and landed slices, never as a
document's claim. Value is the programme's offered value under the
innovation clause (owner ruling 2026-08-31): owner-directed capability
establishes candidate scope before consumers exist.

## Mechanism

- **One slice per pickup.** Each work package is sliced at pickup into
  single-story PRs within the sizing bands (design-work-for-small-PRs);
  this node fixes the order the delivery record's §6 "Depends on"
  column states (W01's contracts first; the rest by their stated
  dependency contracts, never by package count), never a PR count.
- **The queue atom first.** The queue specification's exact public
  surface, ordering and rejection precedence, occurrence laws and
  queue-specific assurance are the acceptance contract; the atom is
  authored under the governing policy (references inform mechanism;
  qualification binds our contract) and enters the atom register at
  authoring with its gate status computed, never stored.
- **Three decisions, kept distinct** (the strategic node's mechanism):
  owner-directed scope establishes the candidate; the excellence bar
  qualifies it; the ten-gate test promotes it into a shared core
  package. A gate the queue atom fails at promotion is a register row
  naming that gate, routed to the owner at the batch's promotion moment.
- **Reference research recorded, not cited.** Reference libraries are
  selected as the best permissively licensed examples and read for
  mechanism; licence data is recorded and available in the source
  review, and cited where a reference's code shapes an implementation
  (documentation-hygiene §2 on adoption; PDR-115 for naming the source),
  never as a precondition for exploring options (owner's word,
  2026-09-09).

## Acceptance criteria (each with a proof — required)

1. Every work package W01 to W09 has a named slice or a dated
   disposition (picked up, deferred with a reason, or absorbed into
   another package) recorded on this node. Proof: `repo-safe` — this
   node's todo list against the delivery record's §6 table.
2. The queue atom is authored to its specification's public surface
   and laws, with the conformance instrument's bar recomputed green
   (TSDoc example pairs per symbol, bench presence, export-surface
   strictness, packed smoke), or it is a register row naming the
   failing gate. Proof: `repo-safe` — the conformance run and the
   atom's tests.
3. No document in the foundations bundle claims a qualified
   implementation that this node's slices have not landed. Proof:
   `repo-safe` — review of the bundle's status lines against the landed
   slices at each slice's PR.

## Todos

- W01 — exact atom contracts, bounded reference surveys, first
  structural and view composition, the public support-manifest format.
- W02 — addressability, evidence and RDF composition with explicit
  authority (after W01's reference, model and view contracts).
- W03 — higher arity, ports, layer and containment, checked
  composition (after W01's identity and occurrence contracts).
- W04 — temporal, external, durable and incremental execution.
- W05 — structural algorithms, query and numerical operation profiles
  informed by selected reference mechanisms.
- W06 — native specialised-model minimums.
- W07 — developer capabilities and domain and transport integration
  boundaries.
- W08 — comprehensive coverage and release qualification.
- W09 — OCE-specific doctrine and implementation alignment (the
  reconciled identity, mounting, query, validation and termination
  contracts of ADR-221 and PDR-134).
- The OCE queue Reliable Atom — the first candidate, sliced at pickup.

## Out of scope

- The contracts, laws and evidence themselves — owned by the bundle's
  records.
- Package promotion decisions — the strategic node's ten-gate test and
  the owner's word at the batch.
- New dependencies or a dependency overhaul — ADR-229's scope is
  own-built foundations.
