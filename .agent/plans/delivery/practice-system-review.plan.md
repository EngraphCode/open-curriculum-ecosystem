---
id: practice-system-review
node_type: delivery
name: The Practice as one system across two estates — a review of the mechanisms of planning, implementing, reviewing and delivering value, as one report
overview: >-
  Read both estates fresh, as one system of development and value provision with two
  instantiations, and write one report: the mechanisms by which work is planned, decided,
  implemented, reviewed and delivered, how developer experience, strictness, contracts and
  authority are provided, how the system learns; where each estate instantiates each mechanism,
  where the two diverge and of what kind; and from that a candidate definition of the Practice
  and a simple model to proceed with, for the owner's decision.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: best-of-each-practice
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: >-
      The owner says whether the model the report derives is simple enough to proceed with
      (constitutively the owner's: "I will decide when that is and I will tell you", 2026-10-03;
      no standing ruling or lens resolves it); the dated word is recorded as a line in
      best-of-each-practice §Delivery, and this node is archived or revised to the next step.
    expires: 2026-10-24
last_updated: 2026-10-03
---

# The Practice as one system across two estates

The owner's words, 2026-10-03 20:4xZ, verbatim: "there are two estates with one system of
development and value provision and contracts and authority and so on, and that system currently
has divergences that we are trying to resolve." And: "forget what you think you know and review
the mechanisms in both estates for planning, implementing, and reviewing and delivering value.
What is in the repos that is not the delivered product but is the how and when and why of the
engineering and the developer experience and the user value and the strictness and the contracts
... everything that isn't 'the product'." And on the layers: "There is the Practice in general,
the Practice in a context, and the ephemeral state and memory and records that the Practice
accumulates over time in a context and learns from. There is the learning loop itself. I don't
think we have a definition of what the Practice is."

This is an n=1 session until the owner says otherwise: one seat reads, one report lands, the same
bytes in both estates. Nothing is aligned, carried or landed under this node; it produces
understanding and a model, and the owner decides when the model is simple enough to proceed from.

## Goal

One report that lets the owner see the development system whole: every mechanism by which the
two estates plan, decide, implement, review and deliver value, provide developer experience,
enforce strictness and contracts, exercise authority, and learn; where each estate instantiates
each mechanism; where the two diverge and of what kind; and, derived from the reading rather than
assumed before it, a candidate definition of the Practice in its layers and a simple model to
proceed with.

## User groups and value

- The owner: a single picture of the system instead of two trees and a ledger of hunks; a
  definition to ratify or correct; the divergences classed so a decision is one word per class,
  never per file; the extraction's design question answerable from a model instead of a copy.
- Seats in either estate: the same understanding of what governs their work and why; the
  corrections the report implies to the index surfaces seats read (`practice-index.md`,
  `practice.md` §Artefact Map, `practice-verification.md`) are the successor step's deliverable.
- The next design (the entity, the directory contract, the install shape): its first input,
  which is the model, not the inventory.

## Problem frame

Gap: one system of development runs in two repositories and no ratified statement of what it is
exists. Three partial ones do: the one-sentence definition in `.agent/practice-core/practice.md`
(the same sentence in both estates), the functional reading in this estate's report
`what-the-practice-is.md` of 2026-09-13 (nine functions, provisional, this estate only), and
PDR-143's seven scope classes (Proposed, both estates); none is ratified, none reconciles the
others, and none names the layers the owner described. The rest of the description lives only in
the artefacts that instantiate the system (records, rules, configs, scripts, hooks, workflows)
and in two seats' heads. Who it harms: the owner, who cannot judge alignment or
decide the extraction without a model and has paid two days of work shaped around a subset; the
seats, who learn the same lesson twice and meet gates whose reasons differ by estate. Mechanism
(the causal hypothesis): the Practice grew by a transplant and then by local learning in each
estate; every attempt to describe it chose the copyable subset and measured bytes, so the
alignment work optimised the wrong object and the learning loop, the records' structure and the
second ring (gates, hooks, configs, workflows) were never read as parts of one thing. Constraints:
one seat; read-only; both estates in one pass; the owner's guide of hours, not days; a report,
never a ledger. Success: the owner reads one document and can say what the Practice is and what
to do next.

## Mechanism

Why one reading of both estates produces the model: the mechanisms are the same system
instantiated twice, so reading them side by side exposes what is general (present in both for
the same reason), what is contextual (present in both, bound differently), what has diverged
(present in both, meaning different things), and what is missing on one side; the layers and the
learning loop fall out of that classification rather than being imposed on it. The reading starts
from what actually runs and governs, never from the ledger or the survey: the root entry points,
the scripts, the hooks, the workflows, the records, and only then the doctrine that explains them.

1. **Read the system by mechanism, both estates side by side.** For each area below, start from
   the artefacts that run or bind (scripts, hooks, workflows, configs, records, the plan estate,
   the collaboration substrate) and read the doctrine that explains them second. One row per
   mechanism: what it is and why it exists; where each estate instantiates it (paths); its class,
   one of `general` (the same thing for the same reason), `contextual` (the same thing bound to
   this host), `diverged` (present in both, meaning or behaviour different), `one-sided` (present
   in one), with the evidence; and what layer it belongs to (general, contextual, accumulated, or
   the loop). The areas, each read whole before the next:
   - planning: how work is defined, sized, ratified, tracked and completed (the plan estate and
     its schema, tickets and milestones, owner gates, the ratification stamp, criteria and proof
     types);
   - deciding and authority: ADRs, PDRs, EDRs and any other record kinds, what each records,
     where each lives, how they relate (the bridge index and ADR-023's host-side adoption
     records, the Core changelog and provenance), amendment logs, who decides what (owner,
     Director, implementer, reviewer), how rulings are captured and reach the records (PDR-107,
     PDR-142's verbatim-with-context rule, the explorations tier), the decision lenses;
   - implementing: branches, worktrees, coordination branches and folds, commit discipline and
     its gates, the agent tooling, the workspace layout and the standardisation of configuration
     across workspaces (TypeScript, lint and its custom structure and complexity rules, tests,
     formatting, dependency rules, build orchestration), type and test strictness;
   - reviewing: the pull-request lifecycle, the merge bot and its proofs, required checks and the
     CI workflows, the automated reviewers and the reviewer sub-agents, round budgets and
     settlement pricing, conscience checks, review triage;
   - delivering value: how value is defined and proved (user-value modelling, specification,
     acceptance criteria, definition of delivery, release readiness), how it ships (deployment,
     environments) and how its arrival is known;
   - developer experience and onboarding: entry points, READMEs, contributing paths, orientation,
     setup, the start-right rituals, the tooling's own usability;
   - strictness and contracts: validation strategy, boundary validation, contract and schema
     checks, parity checks between local and CI, the no-warning and never-disable rules, the
     substrate and fitness validators, what each contract protects and what enforces it;
   - the learning loop: capture at occurrence (napkin, comms, frictions, open questions;
     PDR-048), distillation, graduation into rules, records and validators (PDR-130's two speeds
     with their predictions, PDR-134's concept lifecycle), the inbound path from a sibling
     (PDR-024's incoming and the Box), retrospectives, the curator role, what counts as learned
     and what enforces it;
   - collaboration and roles: the Director and implementer roles, claims, liveness, the comms
     stream, handoffs, the inter-estate protocol, how many seats and why;
   - structure: the layout of the Practice directory and the root, which directories hold
     definitions and which hold instances (PDR-134 §1's strata and PDR-143 §1's "lives in"
     column are the records' existing answers, tested here), where host-specific and
     machine-local things live and why (PDR-141), the adapter model and what it generates.
   Each area names the records that claim to define it, so the reading tests their claims
   against the instantiations rather than re-deriving them; the areas are as named at
   authoring, split or added as the reading finds, never a closed set.
2. **Derive the model.** From the rows: the four layers the owner named (general; contextual;
   accumulated; the loop) are the hypothesis under test, with each mechanism placed in one; a
   mechanism that fits no layer, or two, is a row that says so and is evidence against the
   model, never forced in. The candidate definition of the Practice, one paragraph, is written
   against the three existing statements and says what it keeps from each and what it replaces,
   and whether the four layers refine or replace PDR-143's seven scope classes; it stands beside
   `practice.md`'s sentence as a proposal until the owner ratifies it, and its record home at
   ratification is PDR-143 (an amendment entry revising its §Decision), the report its evidence.
   The owner's words of 2026-10-03 quoted above land as amendment entries on PDR-143 and PDR-142,
   labelled heard first-hand by this seat, in the pull request that lands the report. Then what
   transmits to a new context, what is created empty there, and what stays the host's.
3. **Class the divergences.** Every `diverged` and `one-sided` row grouped by kind with the
   resolution direction for the kind, never per file: PDR-142 §How we judge and §How each kind
   travels already fix a direction per kind and the report cites them, naming where its classes
   differ; a one-word decision per class for the owner. The sequence of the next work belongs to
   the successor delivery node, never to the report.
4. **Write the report, once, in both estates.** One document,
   `.agent/reports/agentic-engineering/practice-system-review-2026-10.md`, the directory both
   estates already hold, the same bytes in each (OCE's README reserves the directory for
   promoted report-grade outputs, which this is); it names the two tips it read; every path it
   cites exists in the estate the row names, checked by the author's shell at writing and the
   check recorded in each pull request's description, the other estate's paths written as
   names, never links; each estate's README row for the directory added in the same landing; one
   pull request per estate, reviewed once, merged.

The reading's honesty rules: the ledger's categories, the survey's prefixes and this seat's
earlier conclusions are not inputs, while a prior seat's statement that is an artefact in the
tree is; a row cites what it read; a mechanism found in neither estate but assumed by both is a
row too; where the seat cannot tell the class or the layer, the row carries the fifth value
`unresolved` and says why. The row set is bounded: the rows are the sub-items the ten area lists name, a mechanism found that they do not
name is added with its reason, and an area that passes its half hour records what it did not read
as rows marked `unread` and the reading moves to the next area.

This node is the step that re-grounds the parent node's bet: `best-of-each-practice` bets on
alignment judged as text travels, measured by the dry-run merge, and the owner's word of
2026-10-03 20:4xZ sets that measure aside until the system is understood whole; the parent's
§Delivery carries that word as a dated line, so the plan estate does not hold a ratified bet and a
sketch that denies it with no link between them.

## Acceptance criteria (each with a proof)

1. The report exists as the same bytes in both estates, names the two tips it read, and carries
   one row per mechanism across the ten areas, every row classed and placed in a layer (or
   marked as fitting none) with its evidence. Proof, `repo-safe`: `cmp` of the two copies of the
   report, whole, at the two tips the report names; the path check recorded in each pull
   request's description.
2. The report carries the candidate definition, the layered model and the divergence classes with
   a resolution direction each. Proof, `owner-held`: the owner reads it and says whether the
   model is simple enough to proceed with; the word is recorded as a dated line in the parent
   node's §Delivery, the pattern that node already uses, and is this node's completion or its
   next revision.
3. Nothing else changed. Proof, `repo-safe`: the pull requests touch the report directory and
   this node only.

## Size

One seat. Reading both estates by area: about half an hour per area, five hours. The model, the
classes and the report: about an hour and a half. Review and merge once per estate: about an
hour. About seven and a half hours of one seat, in one or two sittings. The owner's guide is the
bound, hours and never days: an area that passes its half hour marks what it did not read as
`unread` rows and the reading moves on; a whole that passes one sitting stops and reports the
reason with its row count, and the owner decides, rather than the seat continuing or re-sizing.

## Out of scope

Aligning, carrying, landing or re-reading anything under the parity ledger; the two-landings
sketch; the extraction's design; product code; any new instrument (the report is written by hand
from the reading); a second seat.

## Todos

1. Read the ten areas, both estates side by side, in the order listed; one row per mechanism as
   each area closes.
2. Derive the layers, the definition and the transmission boundary from the rows.
3. Class the divergences by kind with a resolution direction each.
4. Write the report at the same relative path in both estates; validators green; one pull request
   per estate; the same bytes proved; the owner's reading.

## Plan-body first-principles check

- Shape: the proofs are `cmp`, the cited-paths validator and the owner's recorded word on the
  model; nothing measures activity.
- Frame, from the frame cards: (A) the Practice as a document set, the frame the work of
  2026-10-02 and 2026-10-03 operated under, measuring bytes although the ratified frame is
  concepts, never bytes (PDR-142 §Concepts travel); (B) the Practice as one system of mechanisms
  that documents instantiate, the owner's frame, adopted as a mechanism frame over the concept
  frame; (C) the Practice as the learning loop with everything else as its state, kept inside B
  as one of its layers. The bridge claim B rests on: reading the
  instantiating artefacts side by side is enough to recover the system; its falsifier is a
  mechanism both estates rely on that neither instantiates in any artefact, which the honesty
  rules say becomes a row.
- Proportionality: one seat, a report, no fleet, no ledger, no new instrument; the areas are
  named so the reading is bounded, and the size rule splits an area rather than deepening it. The
  direct-trial gate does not apply: the owner's purpose is understanding an unshaped concept, so
  the exploration is the work and its budget is the size above.
- Reversibility: a report in a directory, two pull requests; the model is a proposal the owner
  can decline by class.
- Landing path: `.agent/plans/delivery/` for this node, its body the same bytes in both estates;
  the report under `.agent/reports/agentic-engineering/` in both.
- Reviewers: the assumptions and documentation reviewers read this sketch before it was
  presented (2026-10-03 21:xZ); their accepted findings are applied in the commit that lands it
  (the three existing definitions named; the vacuous validator proof removed; the stop rule
  denominated in the owner's guide and the row set bounded; the parent node's dated word; the
  owner gate; the open sets; the records each area tests; the report's existing home). Declined,
  with the reason: landing the owner's 2026-10-03 words as PDR-143 and PDR-142 amendment entries
  in this commit (they land with the report, when the definition they bear on is written, and
  the notebook holds them verbatim until then); archiving the two-landings sketch (the owner's
  word keeps it a sketch as a perspective no longer held; the supersession chain is re-pointed to
  this node instead).
