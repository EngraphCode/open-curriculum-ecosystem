---
id: graph-and-queue-foundations-delivery
node_type: delivery
name: "Capability Foundations first delivery — geometry through composed heap"
overview: >-
  Finish BinaryTreeIndices, admission, storage and order contracts, then two
  public-contract repair mechanisms and a composed BinaryHeap, with bounded
  proof and architectural-enforcement bindings before qualification.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: reliable-atoms-programme
impact_areas:
  - practice-and-estate
tickets: []
depends_on:
  - plan: reliable-atoms-workspace-shape
    kind: beneficial
owner_gates: []
last_updated: 2026-09-25
---

# Capability Foundations first delivery

## Goal

Finish **BinaryTreeIndices** as the first delivery target and a composed
**BinaryHeap** as the first useful endpoint. Each completed constituent supplies
public guarantees the next composition can use without reopening its mechanism.
The first stateful repair is the early check that meaningful composition works.
A register entry with a failed gate records incomplete work, not delivery success.

The [adoption profile](../../../docs/architecture/foundations/capability-foundations-adoption.md)
owns the contracts, completion criteria, TypeScript/Node profile and data/API
adoption boundaries. The [common architecture](../../../docs/architecture/foundations/reliable-atoms-and-composition-architecture-2026-09-08.md)
owns the assurance bar, and [ADR-230](../../../docs/architecture/architectural-decisions/230-own-built-algorithm-and-data-structure-foundations.md)
owns implementation origin. This node owns sequence and completion evidence.
Its identity is retained; it remains a sketch until actual owner ratification.

## User groups and value

Capability authors get a finite path from one provable law to a useful stateful
facility. Consumers get complete public contracts and evidence without maintaining
private lower invariants. Maintainers can distinguish completed work from open
obligations. Neither candidate value nor publication requires a second consumer.

## Mechanism

Each stage closes one supported responsibility. Author one-step delivery nodes at
pickup under the current repository rules; a row is not an umbrella implementation
PR. Reuse assurance infrastructure and add only the missing instrument required by
the selected capability. Preserve the complete assurance bar at every stage.

| Stage                  | Work                                                                                                                                                                 | Completion gate                                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0a — bind execution    | Bind exact source/exports, canonical outcomes, compiler/runtime matrix, proof method, production correspondence, classified entities and permitted imports/exposure. | A repository-bound contract/profile with actual commands and evidence obligations; resolve Primitive independence versus canonical Result honestly.                                                        |
| 0b — connect assurance | Demonstrate one geometry proof reaching production operations, plus positive/negative architectural controls and native/packed consumption routes.                   | Blocking automatic checks cover the whole governed source and emitted surface; forbidden imports, type exposure and unknown classification are rejected. A model-only proof or hand-check is insufficient. |
| 1 — geometry           | Finish exact bounded tree-index relations under the chosen outcome binding.                                                                                          | Applicable R requirements and C01–C08 if composed, with independent laws, production correspondence and public consumption.                                                                                |
| 2 — admission          | Close finite-number and bounded-count/capacity admission, failure precedence and their call sites.                                                                   | Every domain decision has one owner; actual runtime/type/semantic dependencies determine grade.                                                                                                            |
| 3 — storage and order  | Finish DenseOwnedBuffer and FiniteNumberOrder as separately owned contracts.                                                                                         | One selected growth/allocation/failure/lifetime policy; exact density/length/cleanup and cost evidence; lawful finite order with signed-zero equivalence.                                                  |
| 4 — append repair      | Compose public geometry/storage/order contracts under the appended-leaf premise.                                                                                     | Occurrence preservation, termination and restored order; a reviewer needs no lower private internals.                                                                                                      |
| 5 — root repair        | Establish the child-subtree premises, child choice and descending variant.                                                                                           | Complete subtree guarantee without an unsupported external-parent claim.                                                                                                                                   |
| 6 — heap               | Own state and construct/insert/peek/take/size histories; establish repair premises at every call.                                                                    | R02–R10 and C01–C08; duplicates/repeated references, stored undefined, empty/capacity outcomes and supported rejection post-states all covered.                                                            |
| 7 — public consumption | Consume the packed public form and substitute one compatible lower implementation.                                                                                   | Reproducible evidence supports the whole selected contract; stop before stable-queue policy work.                                                                                                          |

Stage 0 is finite feasibility work, not a qualified capability or a general proof
platform. Failure closes no qualification claim; resolve the affected obligation
before proceeding. Admission checks needed by geometry are specified with its
stage-0 contract and completed before geometry is called Qualified. Stage 2 closes
the remaining storage/order admission responsibilities, not a retrospective repair
of an already-qualified geometry contract.

The workspace-shape plan is beneficial to design progress: contract authoring can
proceed independently. Its applicable automatic enforcement is mandatory before
qualification. No manual review substitutes for that enforcement. Each workspace
uses the declared class and stricter budgets from its first implementation slice.

## Acceptance criteria (each with a proof — required)

1. The stage-0 profile is closed and its production-correspondence and boundary
   probes discriminate the named forbidden cases. Proof: `repo-safe` — exact
   source/config identities, proof receipts, positive/negative check results and
   native-source/packed-consumer validation records.
2. Every selected constituent satisfies its whole contract and applicable common
   and composition requirements before downstream reliance. Proof: `repo-safe` —
   independently derived laws/models, deterministic public-interface tests, complete
   mutation dispositions, performance evidence and documentation/consumption checks.
3. The first repair's connecting argument uses public prerequisites only, and the
   heap preserves occurrences and valid state over its full supported histories.
   Proof: `repo-safe` — composition review, independent occurrence-model traces and
   a compatible lower-implementation substitution through public surfaces.
4. Tests and imported helpers perform no I/O; provider/runtime observations use
   their appropriate validation surfaces with explicit scope. Proof: `repo-safe` —
   classified-source and dependency/exposure checks plus the relevant evidence.
5. Status claims in the register and documentation match exact implementation,
   contract and evidence revisions. Proof: `repo-safe` — recomputed qualification
   and review against the records above. Missing evidence leaves work incomplete.

## Later scope disposition

The earlier [graph delivery record](../../../docs/architecture/foundations/graph-library-review-and-delivery-2026-09-08.md)
retains W01–W09 as graph-programme design, not prerequisites for this first build.
W01's independent core laws are selected only when required by the current closure;
its graph contracts and W02–W09 remain later comprehensive graph work. The
[stable priority queue](../../../docs/architecture/foundations/oce-queue-reliable-atom-2026-09-08.md)
is a later composed capability adding captured priority and stable-tie policy.

API adoption is a separate operation-specific dependency graph. It can use suitable
native providers and selected completed contracts without waiting for unrelated heap,
graph or compiler families. Latest API-version support is ordinary maintenance of
its affected mappings, not a prerequisite for completing this heap delivery.

## Out of scope

- Stable ties, handles, arbitrary deletion, decrease-key, concurrency, scheduling
  and top-k in the first heap contract.
- Implementing the complete graph programme or API catalogue in this delivery.
- A general allocator, comparator framework or universal proof platform.
- New qualification claims from documentation or source reviews alone.
