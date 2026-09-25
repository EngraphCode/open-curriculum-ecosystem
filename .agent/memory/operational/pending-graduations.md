---
fitness_line_target: 1100
fitness_line_limit: 1467
fitness_char_limit: 200000
fitness_line_length: 100
fitness_item_count: required
fitness_item_count_target: 0
fitness_item_count_soft: 2
fitness_item_count_hard: 3
fitness_item_dwell_target: 2
fitness_item_dwell_soft: 4
fitness_item_dwell_hard: 7
lifecycle_model: >-
  canonical pending-graduations register — every live item is decision-debt
  (status pending/due/overdue) until it is graduated, rejected, or marked
  duplicate. Provenance and adaptation are the safety net for a wrong call.
access_pattern: >-
  consolidation-pass-only — read at consolidations and drain sessions; not
  loaded every session by every agent
drain_strategy: >-
  Drain by DECIDING: graduate (write the doctrine into its rule/PDR/ADR/pattern/
  governance-doc home, then remove the entry) or reject (decided not worth a
  home, with the reason). The decision-debt count falls only through a recorded
  terminal disposition — never by deleting an undecided item and never by raising
  a limit. Do not split, shard, or hide buffer depth.
fitness_rationale: >-
  The primary health signal for this buffer is the decision-debt count
  (fitness_item_count, target 0) — a flow-rate reading of whether graduation is
  keeping pace with capture. The line and character limits are a secondary
  structural signal: drain-cadence back-pressure for a consolidation-pass-only
  buffer, not a size cap. Recalibrated 2026-06-08: line hard 2200 -> 1467, target
  1500 -> 1100, so line-critical (hard x 1.5, the global ADR-144 ratio) lands at
  ~2200. Both signals are reported and acted on, never chased: substance is never
  trimmed to clear a zone (knowledge-preservation), and the register is drained
  down by deciding items, not by tombstone-removal.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

# Pending Graduations

The canonical register of **learned doctrine awaiting its permanent home** —
a lesson, pattern, or decision that is *already settled* and simply not yet
written into the rule / PDR / ADR / pattern file / governance doc where it will
live and fire. Every live entry is decision-debt (`status: pending/due/overdue`),
drained by **graduating** it (write it into its home, verify, then remove the
entry) or **rejecting** it (decided not worth a home, with the reason). The
target is empty (`fitness_item_count_target: 0`); provenance and adaptation are
the safety net for a wrong call.

## What belongs here — and what does not

An entry belongs ONLY if all three hold:

1. **It is learned doctrine** — a settled lesson, pattern, or decision, validated
   by implementation, by surviving at least one later session uncorrected, or by
   an owner correction. Not a hypothesis, not a proposal, not a question.
2. **Its home is a doctrine surface** — a rule, PDR, ADR, `patterns/` file, or
   governance doc. (If the natural home is a *plan* or a *report*, the item is
   future work or a proposal, not a graduation — see below.)
3. **It is not yet written there** — the only outstanding act is authoring it
   into that home.

**Belongs** (worked shapes):

- *"The prove-the-checker-with-a-negative-control lesson is stable across three
  instances and has no pattern file yet."* → graduates to a `patterns/` file.
- *"The decision-locus doctrine (product scope is the owner's; engineering is
  collaborative) is settled and uncorrected, but lives only in the napkin."* →
  graduates to a `user-collaboration.md` section.

**Does NOT belong** — route via the destinations table in
[`ephemeral-to-permanent-homing.md`](ephemeral-to-permanent-homing.md):

- **Future work / a build to do later** (*"author the portable Core PDR when a
  second repo adopts X"; "build the IDE plugin once the owner approves"*) → a
  `plans/` entry (in `future/` with a promotion trigger). The underlying doctrine
  may already be homed; the *doing-it-later* is a plan, not a graduation.
- **A proposal or feasibility finding** (*"here is a design for an IDE
  integration plane"*) → a `reports/` or `research/` artefact, promoted to a plan
  on owner GO.
- **An open question** (*"what liveness primitive should the operating model
  carry?"*) → [`open-questions.md`](open-questions.md) if strategic, or an
  exploration plan if it is a design decision needing a session.
- **An operational what-next or owner decision** (*"should we re-establish the
  Director seat?"*) → [`repo-continuity.md`](repo-continuity.md) (Next Safe Steps
  / Open Owner-Decision Items) or the owning thread record.
- **A tooling gap** → the frictions register.

The test: if you cannot name the *exact* rule / PDR / ADR / pattern / doc section
the entry will be written into, it is probably not a graduation — find its real
home above. An item only remains live decision-debt when it is genuinely settled
doctrine, has a doctrine home, and that home just has not been authored yet.

## Draining and dwell

Each consolidation decides *every* decidable item — graduate or reject — toward
an empty register. An item stays only when a named constraint genuinely blocks
authoring its home now. The anti-starvation guard is the **dwell-time axis**
(`fitness_item_dwell_*`, target 2 / soft 4 / hard 7 days): it surfaces the
*oldest* undecided item's age and escalates it. The dwell reading is **age, not
a hedge** — a short dwell is never licence to leave a decidable item undecided.

New capture appends below as inline-bracket entries — `- **<title>**` then a
backtick-wrapped inline `[…]` block (may wrap across lines) with pipe-separated
`captured / source / target / trigger / size / status` fields (schema:
`agent-tools/src/practice-fitness/item-count.ts`). Every field name carries a
colon (`captured: …`, `trigger: …`). The bracket must NOT be fenced — a fenced
or unwrapped block is silently uncounted (it raises a malformed finding).
`target` must name a doctrine surface (rule / PDR / ADR / pattern / governance
doc); if it names a plan or report, the item belongs elsewhere. **After ANY
append, run the parser's own readout** (`pnpm practice:fitness:informational`,
the Live decision-debt line) **and verify the count MOVED** — colon-less
fields once left four items reading as a clean register (vacuous-green in a
debt register, 2026-07-08).

<!-- New pending-graduation capture appends below as inline-bracket entries. -->

- **Continuity surfaces: the three outcomes of handling a large record, the left-live verdict, the join to the plan, one owner per volatile fact**
  `[captured: 2026-09-25 | source: napkin entries of 2026-09-20 and 2026-09-21 (Zephyr guards Leeward): "appropriate handling" has three outcomes (curated; left live with the verdict recorded; found homed elsewhere and archived whole); a record is handled when the lifecycle question is answered for every section with a proof; a curated record points at its plan and never restates the sequence; one surface owns each volatile fact and the others link (the restatement made derived or absent) | target: .agent/directives/continuity-practice.md §Disposition of Continuity Surfaces and §Runbook | trigger: a fresh context below 30 % (PDR-052); the method half landed in consolidate-until-done step 7 on 2026-09-25 | size: four sentences | status: pending]`
- **Metacognition: a second worked instance of "fluency clusters at the finish line", and its counter-observation**
  `[captured: 2026-09-25 | source: napkin 2026-09-21 (Zephyr guards Leeward: four corrections in one afternoon, none self-caught) and 2026-09-24 (Swallow holds Drift: the slips clustered under parallel threads, not at a finish line) | target: .agent/directives/metacognition.md, the finish-line paragraph | trigger: a fresh context below 30 % (PDR-052) | size: two sentences | status: pending]`
- **Principles: the owner's words on what line limits are for**
  `[captured: 2026-09-25 | source: napkin 2026-09-24 (Blazar lifts Corona), the owner verbatim: the limits "enforce thoughtful code design and clear public APIs and proper encapsulation, not to ask if the bucket has enough room left"; filed on the pattern honest-restructure-over-band-aid on 2026-09-25 | target: .agent/directives/principles.md, the line-limits section | trigger: a fresh context below 30 % (PDR-052) | size: one sentence with the quotation | status: pending]`
- **Comms decision table of the 2026-09-25 pass: the rows with no home found (owner words A, decisions B, lessons C, follow-ups D)**
  `[captured: 2026-09-25 | source: the comms decision table (1,266 non-heartbeat events 2026-08-14 to 2026-09-25T11:17:35Z, eight analysts, one reducer), conserved with its analyses at .agent/research/agentic-engineering/continuity-memory-and-knowledge-flow/consolidation-2026-09-25/ (tracked; the analyst outputs and briefs are in the ignored instance tier .agent/state/collaboration/comms-analysis-2026-09-25/); section A (93 owner-word rows) was read whole by the seat and twenty-two of its rows are accepted for rules, skills, the rulings ledger and two Core PDRs; sections B (42 rows), C (93 rows) and D (61 rows) are unread by the seat and unverified | target: per row, in the table's plausible-home column; every move-bearing claim verified at the event file (comms-archive after the sweep) before the edit | trigger: the next curator context, any budget (no directive edits above 30 %) | size: one lane, several commits | status: pending]`
- **PDR-142 rows held for the fold: the napkin table's A39, A41, A42, A63 and the comms table's A94 ("above all, you should both go slow and take your time, alignment is far more important than speed here", 624db735, 2026-09-21) and A99 (the alignment goal, e9d146f8, 2026-09-24)**
  `[captured: 2026-09-25 | source: the two decision tables named in the row above | target: .agent/practice-core/decision-records/PDR-142-the-best-of-each-practice.md | trigger: the coordination branch carries engraph's PDR-142 (the fold of 2026-09-25 landed at 00d219dd0) | size: six sentences | status: pending]`
- **Agent collaboration: an outside check on a verdict that favours the seat, and a cold reader outside the model family**
  `[captured: 2026-09-25 | source: napkin 2026-09-21 (Zephyr guards Leeward, the exploration on "every correction came from outside"): a verdict that coincides with the seat's interest gets one outside check before it is posted (falsifier: three such checks that merely confirm); a key shared text gets one cold reader from outside the model family, not told which line the seats doubt (falsifier: two outside reads that find nothing the inside checks had not); frame diversity discriminates, volume does not | target: .agent/directives/agent-collaboration.md §second opinions | trigger: a fresh context below 30 % (PDR-052) | size: three sentences | status: pending]`

## Slow lane (PDR-130 — constitutional-class concepts, decided at their review date)

Rows here are live deliverables under a named review gate, NOT decision-debt:
each carries a prediction, a falsifier, and a review date, and is decided
(promote / kill-with-reasoning) AT that date. A dedicated consolidation passes
these by unless a review date has arrived. **Bootstrap exception (the row
below): a row tracking an ALREADY-ACCEPTED record is decided retain vs
retire-by-its-own-falsifier at review — promote/kill applies only to
not-yet-minted concepts.**

| Concept | Prediction (by review) | Falsifier | Review |
| --- | --- | --- | --- |
| Two-speed learning itself (PDR-130) | ≥3 fast-lane graduations carry prediction lines; ≥1 slow entry promoted or killed BY its review | Register untouched at review — the lane is theatre; retire the PDR by its own rule | 2026-10-01 (first consolidation on/after) |
| Close-time single-lesson graduation (retrospective 2026-07-20 proposal 1): a captured lesson that is single-instance sufficient (PDR-100), has a nameable doctrine home, and needs no cross-seat synthesis graduates AT session close; the frozen-corpus constraint gates rotation and cross-seat synthesis only. Promotion target: `session-handoff` step 6b, landed under the PDR-101 quorum. Provenance: authored FAST-enacted in the retrospective, reclassified slow-lane at PR #450 review (PDR-130 §§2/4; Director-ratified 2026-07-20) | Pre-promotion observable, accrued in this row during the quarter: each clause-eligible lesson that recurs between capture and its homing is logged here as it occurs — the measured cost of batching while the clause stays unenacted (worked warrant: a June-documented class re-surfaced 2026-07-17 and re-bit three seats before homing, ~3 days from that re-surfacing). At review: promote if at least one recurrence class accrued; the post-promotion prediction (recurrence drops to ~zero) binds only after enactment | No recurrence accrues by review (the batching frame carries no measured cost — the entry is killed), or the accrual log itself goes untouched (the row is theatre; kill it by the register's own rule) | 2026-10-20 |
| Blame-referent calibration (retrospective 2026-07-26, PDR-094 arc): agents calibrate to the most salient blame signal (accreted caution, or the last correction), not the standing policy, whenever the policy exists only in the owner's head; a WRITTEN owner-ratified policy line converts reversal-grade corrections on that axis into calibration-grade refinements. Provenance: `.agent/reports/agentic-engineering/2026-07-26-pdr-094-retention-arc-retrospective.md` §Meta root (v1–v2 hoard, v3 over-delete, v4 co-authored referent, all one arc) | By review: NO reversal-grade owner correction on the retention axis (the axis now carries its written line, PDR-094 v4); any retention correction observed is a refinement, not a reversal | A reversal-grade retention correction lands despite the written line — the written-referent cure is insufficient and the mechanism needs an action-time instrument (kill this row into that finding) | 2026-10-26 |
| A signal is not the fact it stands for (candidate principle; consolidation 2026-09-13, PR #143; n = 1 seat-day — seven instances at one seat on 2026-09-12/13, so an observation by `one-instance-is-an-observation`): before a seat acts on an instrument's verdict, a reviewer's finding, a single instance or a fit to the data at hand, or writes one into a durable record, it states what the signal stands for, why it is present, against what it is compared, and what would show it wrong. Foundations: `.agent/research/cognitive-systems/structured-thinking/` (experimental-design-foundations, statistical-rigour-foundations), cited never restated. The always-loaded forms landed fast-lane with PR #143: the rule, the `verify-dont-trust` instrument clause, the `reason` warrant sentence, the pattern `signal-read-as-fact`. Routed here at PR #143's round one (PDR-130 §§2/4: a directive-tier line importing research frames is constitutional-class) | By review: at least one instance of the class, recorded in the pattern's filings or the review-cost ledger, arises in a signal kind the rule and the clause do not name — evidence the general framing is needed at the directive tier; then promote the line into `principles.md` | Every instance recorded by review is one the named fast-lane forms already cover, or none is recorded — the line is redundant with its fast-lane forms; kill the entry with this reasoning | 2026-12-15 (first consolidation on/after) |
| Clocked obligations starve unclocked jobs (retrospective 2026-09-20, proposal 3): when a standing rule with a deadline (a DUE branch fold) will consume the budget of the owner's stated job, the seat puts that one collision to the owner at its first occurrence, as a question about which gives way, and does not resolve it by obeying whichever obligation is due. Provenance: `.agent/reports/agentic-engineering/why-the-register-stayed-at-twelve-for-three-days-2026-09-20.md` §The causal stack (four folds in sixty-six hours, zero register entries moved; the owner's one sentence removed the collision and the register emptied in forty minutes of directive work). The operational forms landed fast-lane in `consolidate-until-done` step 7 (price the pass, reserve the last step; 2026-09-20) and `user-collaboration.md` (report the job's measure first; 2026-09-19). Routed here because a line ranking an owner's job above standing rules is constitutional-class (PDR-130 §§2/4) | By review: the next dedicated consolidation that meets a DUE fold surfaces the collision in its first context and moves its measure in that context | It surfaces the collision and the measure still does not move; or no such collision occurs by review and the row is killed as untested | 2026-12-20 (first consolidation on/after) |
| Cure the governing text at the owner correction (retrospective 2026-09-16, proposal 2 with its compaction-wrap addendum A; registered at the 2026-09-16 dedicated consolidation): an owner correction that contradicts a governing text is cured at that text in the same session, in the owner's words, and the napkin records the instance; at a second correction on one class, the seat records where the contradicting or missing instruction lives — a wrong estate text, a platform text the estate cannot edit, or no text — and cures at that place. Provenance: `.agent/reports/agentic-engineering/why-written-lessons-kept-needing-the-owner-2026-09-16.md` §Proposals and §Addendum. Of the three texts that warranted it, the cross-fork routing clause and pr-lifecycle's watch prescription were cured fast-lane at the same consolidation, and the IO admissions in `testing-strategy.md` were cured at its directive pass on 2026-09-19 | By review: owner-corrected classes whose text was cured at the first correction do not recur as owner corrections, measured from napkins, which over-record corrections | Text-cured classes recur at a rate no lower than capture-only classes in the next since-marker synthesis; or a repeat-correction class has no contradicting or missing instruction to be found | 2026-12-16 (first consolidation on/after) |
