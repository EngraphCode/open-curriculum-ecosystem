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
last_updated: 2026-10-02
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

**Value line, from the ratified source.** The programme node
[`reliable-atoms-programme`](../strategic/reliable-atoms-programme.plan.md)
(status ratified, the owner's "Ratify all six" of 2026-09-08) carries the owner's
direction of 2026-08-17 verbatim: "where we can factor out code, data structures,
algorithms, patterns, into small, single responsibility, well tested, well
encapsulated modules, with a strict public API, and put those in the core, I want
us to do that, each one with extensive TSDoc, including multiple positive and
negative examples... all the most fundamental building blocks standardised and
brought up to a level of true engineering and developer experience excellence...
performance tested." The programme's Delivery section names this node's scope as
the first target: "BinaryTreeIndices is the first target capability, with required
admission/outcome prerequisites closed before qualification; the composed
BinaryHeap is the first useful endpoint." This node delivers the first eight such
modules under that word. The proof that each pull request delivers that value and
not activity: its body names the stage row it closes, the bar items (the
programme's §The bar, items 1 to 10) its evidence satisfies, and the Size row it is
entitled to fill; a row is filled only on recomputed evidence (criterion 5).

## Mechanism

Each stage closes one supported responsibility. Author one-step delivery nodes at
pickup under the current repository rules; a row is not an umbrella implementation
PR. Reuse assurance infrastructure and add only the missing instrument required by
the selected capability. Preserve the complete assurance bar at every stage.

| Stage                  | Work                                                                                                                                                                 | Completion gate                                                                                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
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

### Instruments behind the proofs

Each `repo-safe` proof names its instrument here; the estate's state on 2026-10-02
is recorded so the todos add only what is missing.

- Criteria 1, 2 and 3: the workspace's own `test` script under vitest (law and
  public-interface tests; type tests through `expectTypeOf`, bar item 3), run by
  the pre-push gate and by CI; mutation through Stryker in the shape
  `packages/core/type-helpers/stryker.config.mjs` already uses, the estate's one
  mutation precedent.
- Criterion 1's boundary half: positive and negative import and exposure fixtures
  in the workspace, under the boundary rules `validate-boundaries` already runs as
  a `repo-validators:check` leg.
- Criterion 1's packed-consumer half and stage 7: absent on 2026-10-02. No
  workspace carries a packed-form check (no publint, arethetypeswrong or API-report
  tool in the estate). Bar item 4 asks for one shared instrument; todo 2 adds it.
- Criterion 2's executed examples (bar item 1): absent on 2026-10-02. Todo 3 adds
  the smallest shape, a workspace test that extracts every `@example` fence from
  the public source and runs it.
- Criterion 4: no estate instrument fences I/O in tests on 2026-10-02 (the no-IO
  node sits in the conserved backlog). Until one exists, the proof is a recomputable
  search: a `git grep` over the workspace's test files and their imports for the
  `node:` I/O modules, process, network and clock calls returns nothing, and the pull
  request body shows the command and its empty result.
- Criterion 5: `pnpm --filter @oaknational/agent-tools validate-plan-corpus` for
  this node; the Size table below is the status surface until the programme's
  register exists (the workspace-shape node names the register as the programme's
  tranche one, not built on 2026-10-02); each row is filled at a merge SHA from the
  evidence files at that SHA.

## Size

Ten single-story pull requests, one per todo below, each under the default round
budget (PDR-132: at most two review rounds; PDR-140's two settlement pushes). Time
per pull request is unmeasured for code changes on 2026-10-02: the day's measured
rates are for documentation slices (about fifteen minutes door to door in this
repository). The first pull request measures three things once and writes them into
the table at its merge: the pre-push gate's run time at its first push (the
Director's routing of 2026-10-02), the review rounds taken, and the door-to-door
time. Those three govern the estimate for the remaining nine, written into the
table when they are known. Qualification claims from stage 1 on wait for the
workspace-shape node's validator and tiers (its todos 2 and 3), which are their own
pull requests under that node and are not counted here; contract and proof work in
this node proceeds without them.

The table's reader is the Director at each report cadence and the owner at
ratification and at each report; what it changes is whether the lane proceeds to
the next todo or stops at a failed gate.

| Todo | Stage                                | Merge SHA | Gate run | Rounds | Door to door |
| ---- | ------------------------------------ | --------- | -------- | ------ | ------------ |
| 1    | 0a, with the first geometry law      | —         | —        | —      | —            |
| 2    | 0b, enforcement and the packed route | —         | —        | —      | —            |
| 3    | 1, geometry                          | —         | —        | —      | —            |
| 4    | 2, admission                         | —         | —        | —      | —            |
| 5    | 3, storage                           | —         | —        | —      | —            |
| 6    | 3, order                             | —         | —        | —      | —            |
| 7    | 4, append repair                     | —         | —        | —      | —            |
| 8    | 5, root repair                       | —         | —        | —      | —            |
| 9    | 6, heap                              | —         | —        | —      | —            |
| 10   | 7, public consumption                | —         | —        | —      | —            |

## Todos

Each todo is one pull request with one story, opened with the pr-lifecycle
instruments declared in a working-notes comment at open: the round tally, and the
PDR-140 intake contract where the changeset carries prose. Each body names the
stage row, the bar items its evidence satisfies, and the proof below. Every pull
request takes `origin/engraph` by merge, never rebase, before it opens (the owner's
ruling of 2026-10-02). The word this delivery works under is the programme's: the
strategic node `reliable-atoms-programme` is ratified (2026-09-08) and names this
target by name, with delivery nodes "authored by their implementers at pickup"; the
delivery stamp on this node is the owner's to add whenever they read it, and it
gates nothing (the Director's reading of 2026-10-02 under the owner's ruling that
nothing is blocked on the owner, reported to the owner with this node). Todo 1
opens as this repository's next pull request after the consolidation slices merge,
or sooner if the owner says the product goes first.

1. **Bind the workspace and prove the first law** (stage 0a, and the minimum
   executable proof of 0b). A new workspace under `packages/core/` (ADR-041's tier
   for provider-neutral primitives) holding BinaryTreeIndices and its bound
   admission prerequisite: a `package.json` with the native and packed exports map
   and the `type-check`, `lint`, `test` and `build` scripts in the shape
   `packages/core/graph-core` uses; a `tsconfig.json` carrying the adoption
   profile's compiler options verbatim; a README binding the exact exports, the
   outcome binding (geometry imports the canonical `@oaknational/result` and is
   composed, or carries its own outcome union and is Primitive; the README records
   which and why), the proof method, the production-correspondence statement, and
   each entity's classification with its permitted imports and exposure; and one
   executable law, the parent relation `floor((i - 1) / 2)` for `0 < i < n`, with
   the invalid inputs (zero, `n`, negatives, fractions) as named outcomes. Proof:
   the workspace passes its four scripts at the pre-push gate and in CI; the law
   test asserts the relation at positions 1, 2 and `n - 1` and each named outcome;
   the README's exports list equals the `package.json` exports map.
2. **Connect enforcement and the packed route** (the rest of stage 0b). Positive
   and negative boundary fixtures: an allowed import of the public surface compiles
   and runs; a private-module import, a type exposed outside the declared surface
   and an unknown classification each fail lint or type-check. The one shared
   packed-form instrument (bar item 4) added to the estate as a `repo-validators:check`
   leg: the built package's exports map resolves for native and packed consumption
   and its emitted types resolve; its vendor is chosen at this todo's authoring
   after the vendor-literal check. Proof: the negative fixtures fail and the
   positive ones pass in CI; the packed check runs green on the built workspace and
   red on a fixture package with a broken exports map.
3. **Geometry complete** (stage 1). Both child relations, the absent-child and
   root-parent outcomes, the range and inverse laws, terminating parent chains, the
   length domain zero through `2^32 - 1` without 32-bit narrowing and without
   allocating maximum-size storage; TSDoc with positive and negative examples
   proportional to hazard (bar item 1) and the executed-examples test that runs
   every `@example` fence, moved to a shared helper at its second consumer; the
   misuse register as a README section (bar item 2); type tests for the contract
   (bar item 3); a mutation run with every surviving mutant dispositioned. Proof:
   the test file names each law and each outcome; the Stryker report at the merge
   SHA with zero undispositioned survivors; the executed-examples test green.
4. **Admission** (stage 2). FiniteNumberAdmission and BoundedCountAdmission as
   separately owned contracts: non-numbers, NaN and infinities rejected with
   determinate outcomes and a stated validation precedence; exact bounds,
   fractional and out-of-range counts and signed zero; every domain decision with
   one owner and geometry's call sites bound to them. Proof: a test per named case;
   the precedence test (a value failing two checks reports the first); each unit's
   grade recomputed from its actual imports, type-only included, and recorded in
   the README.
5. **Storage** (stage 3). DenseOwnedBuffer: dense storage, exact length, indexed
   read and replace, append, remove-last and obsolete-reference cleanup under one
   chosen growth, allocation, failure and lifetime policy with its costs stated.
   Proof: tests for density and length after every operation sequence, the
   removed slot holding no reference after remove-last, and unchanged state after
   each supported failure; a within-run bench for the append growth curve (bar
   item 6) only where the contract declares a complexity.
6. **Order** (stage 3). FiniteNumberOrder: a lawful total order on admitted finite
   numbers with signed zeros equivalent and no overflow-prone subtraction. Proof:
   the total-order laws (reflexive, antisymmetric, transitive, total) as property
   tests over admitted values including the signed zeros and the largest and
   smallest magnitudes; a negative test comparing `Number.MAX_VALUE` against its
   negation that a subtraction-based comparator fails.
7. **Append-leaf repair** (stage 4). Compose the public geometry, storage and
   order contracts to restore order after one appended leaf, preserving
   occurrences and terminating. Proof: the composition test imports only the
   sub-path exports of stages 1 to 3 (checked by the todo 2 boundary fixture);
   occurrence preservation by a multiset comparison before and after over
   generated histories; termination by a step bound of the tree height.
8. **Root-subtree repair** (stage 5). Child choice and descent at a subtree root
   whose child subtrees are ordered, with no claim about the external parent.
   Proof: the premise is asserted in the test setup and the post-state checks
   subtree order and occurrences only; a negative test shows an unordered
   external parent stays unordered.
9. **The heap** (stage 6). BinaryHeap owning private state with empty
   construction, insert, peek, take and size over supported histories; duplicates
   and repeated references as distinct occurrences; stored `undefined` distinct
   from empty; capacity rejection before mutation; unchanged state after each
   supported rejection; the public surface committed as the build's emitted
   declaration for the entry point with a check that it equals a fresh build (bar
   item 4's report). Proof: an independent occurrence model (a sorted multiset)
   driven by the same generated histories agrees with the heap at every step; the
   named outcomes for empty peek and take and for capacity; mutation and type
   tests as for todo 3; the declaration check green.
10. **Public consumption** (stage 7). A consumer fixture that uses the packed
    public form through the exports map, and a second DenseOwnedBuffer-conformant
    storage substituted through the public surfaces with the todo 9 model suite
    re-run unchanged. Proof: the packed-consumer fixture passes under the todo 2
    instrument; the substitution passes the todo 9 model suite; every Size row
    carries its merge SHA; the lane stops before stable-queue policy work.

## Out of scope, with homes

The [graph delivery record](../../../docs/architecture/foundations/graph-library-review-and-delivery-2026-09-08.md)
is the home of W01–W09 as graph-programme design, not prerequisites for this first
build. W01's independent core laws are selected only when required by the current
closure; its graph contracts and W02–W09 are the graph programme's own work, homed
there. The
[stable priority queue](../../../docs/architecture/foundations/oce-queue-reliable-atom-2026-09-08.md)
is the home of the composed capability adding captured priority and stable-tie
policy.

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
- The workspace-shape node's validator and tiers, and the programme's register:
  their own nodes, their own pull requests.

## Plan-body first-principles check

- **Shape.** Each proof tests Oak-authored laws (tree arithmetic, admission
  outcomes, order laws, occurrence preservation), never that vitest or TypeScript
  did their job. The two configuration-shaped todos (the profile in todo 1, the
  packed route in todo 2) are proven by fixtures that fail, not by a setting's
  presence.
- **Landing path.** The workspace sits under `packages/core/` with scripts in the
  shape the existing core workspaces use, so the pre-push gate and CI include it
  with no new wiring; this node sits under `.agent/plans/delivery/`, scanned by
  `validate-plan-corpus` as a `repo-validators:check` leg.
- **Vendor literal.** The compiler options are copied from the adoption profile
  at pickup, never from this node. No vendor call shape is named here; todo 2's
  packed-form instrument names its vendor at that todo's authoring after the
  vendor-literal check.
- **Optionality.** Each proof names one signal. Stage 1's qualification claim is
  sequenced to a named gate (the workspace-shape node's todos 2 and 3 merged),
  never deferred. Placement, name and outcome binding are decided in todo 1's
  README, the decision the owner's stage 0a row assigns to that stage.
- **Record consumer.** The Size table's reader and the decision it changes are
  named above it. The misuse register's reader is the next atom's author, who
  starts from the closed classes.
- **Rules tier.** No compatibility layer: the workspace inlines the ratified
  profile until the class profile exists, then extends it, one path at a time
  (replace-dont-bridge). No gate exclusion for the new workspace
  (never-disable-checks). One story per pull request (design-work-for-small-prs,
  one-pr-per-leaf-issue). Every pull request merges `origin/engraph` in, never
  rebases (the owner's ruling of 2026-10-02).
