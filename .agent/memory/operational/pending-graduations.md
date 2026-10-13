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

- **Anything coming in from the default branch is merged, never rebased**
  `[captured: 2026-10-11 | source: the owner's ruling of 2026-10-02, verbatim in this estate's
  Claude per-user memory, read first-hand at the third dedicated consolidation | target:
  .agent/skills/change-custody/pr-lifecycle/SKILL-CANONICAL.md §Phase 1 step 1 (Divergence) and
  .agent/rules/never-use-git-to-remove-work.md §Standard Git Only — No Improvised Mechanics, the
  same bytes in both estates | trigger: the doctrine pull request of this pass | size: two
  sentences in each home | status: due]`

  Verbatim: "anything coming in from main must always be merged, not rebased, we must maintain the
  shared history". For the homes: a branch is brought current by merging the default branch in,
  never by a rebase, whatever a handoff or plan line says ("rebase onto the default branch first"
  is overridden), because a rebase rewrites commits the shared history depends on (carrier pull
  requests, the mirror branch, ancestry proofs); the lifecycle skill's "never rebase-and-force-push
  an already-pushed branch" loses its condition, and the rule's dirty-tree paragraph no longer
  reads a clean-tree rebase as permitted.

- **A script used twice becomes a standardised agent tool, routed for sizing, never extended in place**
  `[captured: 2026-10-11 | source: the owner's word of 2026-10-03 12:1xZ, verbatim in this
  estate's Claude per-user memory, read first-hand at the third dedicated consolidation | target:
  .agent/rules/use-built-agent-tools-cli.md §When The Built Tool Falls Short, a dated paragraph
  after the 2026-06-24 one, the same bytes in both estates | trigger: the doctrine pull request of
  this pass | size: one paragraph | status: due]`

  Verbatim: "if a script is used repeatedly it should be made into a standardised agent tool in
  the agent tools workspace". The second use is the signal: the script is named on the napkin
  with its usage line and routed to the Director for sizing and a ledger row; the conversion is
  work with criteria, sizing and value like any other, landing under agent-tools with its tests
  through a pull request; the script is never extended in place, and keep-scratchpad is no longer
  among the outcomes.

- **Model-authored text crosses a trust boundary only through a harness-owned closed grammar**
  `[captured: 2026-10-11 | source: the slow-lane row of 2026-09-26 (Swallow holds Drift's concept
  exploration; two instances in one session, in different registers), decided at its 2026-10-10
  review by the third dedicated consolidation (Corsair weaves Seabed, 459358) | target:
  principles.md §Agentic Quality, one paragraph, the same bytes in both estates, cross-referenced
  from the pattern cli-writer-boundary-discipline | trigger: the next context below the
  directive-file budget (the directive edit of this pass) | size: one paragraph | status: due]`

  Promoted at its review date on the evidence: the landing toolkit's wrappers and the code-mode
  reader (`agent-tools/src/codex-exec/command-records/harness-text.ts`, which reads the harness's
  text by anchored patterns and never the program's) hold; the third boundary instance was found,
  F-218 (`--event-id` checked only for being non-empty and then used as a file name, the cure
  "give `--event-id` a closed grammar" named and still open); the falsifier never fired (no boundary
  was found where admitting unparsed model-authored text is correct and safe, and no wrapper needed
  argument pass-through). The principle, for its home: text a model wrote (a program's printed
  output read as evidence, a command's argument tail, a flag value that becomes a path) crosses
  into host authority only after a harness-owned parser has admitted it against a closed grammar;
  what the grammar does not name is refused and named in the refusal, never passed through. The
  engineering instance stays in the pattern (its first cell); the directive line is the general
  form. The cure of F-218 is a code lane, not this graduation.

### Drained 2026-10-11 from the two napkins (Corsair weaves Seabed, 459358)

This estate's napkin (459 lines, 20 blocks, 2026-09-29 to 2026-10-05) and the sibling's (1,376
lines, 37 blocks, to 2026-10-11) were read whole by the seat, every candidate lesson probed by
phrase in both estates before it was written here (a control term first; a lesson a home already
carries is not an entry). The entries sourced from the sibling's napkin sit in its register's batch
of the same date; every target below is the same bytes in both estates unless marked. The napkins
are rotated after this batch, so a source cites the block's heading, which the archive keeps
byte-identical.

- **A command shape carried across a compaction is not the command**
  `[captured: 2026-10-11 | source: napkin blocks 2026-10-02T01:15Z and 02:32Z (Hazel: every
  Bash call compound against the tool-boundary rule, found by reading an old handoff; the context
  meter's first read after a compaction describing another moment, twice), 2026-10-03T13:2xZ
  (Efreet: the direct-message command refused twice on a shape carried in a summary) | target: the
  session-handoff skill under .agent/skills/, its resume step | trigger: the doctrine pull
  request of this pass | size: one paragraph | status: due]`

  At a resume after a compaction: the rules that govern the tool boundary are re-read before the
  first command; a command's help is read before its first attempt, since a shape carried in a
  summary is not the command; the context meter is read twice, a few calls apart, before anything
  is priced on it.

- **A finding that lives in a review body holds the door**
  `[captured: 2026-10-11 | source: napkin blocks 2026-10-02T02:32Z (Hazel: Copilot's overview said
  conflicts remained under "Findings: None"; three true contradictions) and 2026-10-02T17:48Z
  (a watch counting threads fired READY under a body listing "previously missed" findings) |
  target: .agent/skills/change-custody/pr-lifecycle/SKILL-CANONICAL.md, the door clause beside
  the body-only-findings harvest | trigger: the doctrine pull request of this pass | size: two
  sentences | status: due]`

  A door or watch that counts review threads also reads the latest vendor review on the head and
  holds while its body lists open or previously-missed findings; a sentence in a review body under
  "Findings: None" is a finding to test, never prose.

- **A finding on shared text is checked against the twin before a cure travels**
  `[captured: 2026-10-11 | source: napkin blocks 2026-10-02T18:5xZ (Efreet: two reviewers raised
  one sentence with opposite narrowings; the sibling's rule lacked the paragraph) and
  2026-10-03T00:5xZ (eleven findings on #346) | target:
  .agent/rules/review-feedback-defaults-to-triage.md §Action, beside the triage-by-risk entry of
  the sibling's register | trigger: the doctrine pull request of this pass | size: one paragraph |
  status: due]`

  A reviewer's finding on text both estates carry is read against the twin before any cure
  travels. Two reviewers' opposite narrowings of one sentence are cured by citing the governing
  loop, never by restating it. A cure over the risk bar (a credential in a log, a validator that
  can pass silently) travels to the sibling as the same bytes; a wording finding travels as a note.

- **An exhausted fold budget freezes every seat's records until the fold merges**
  `[captured: 2026-10-11 | source: napkin blocks 2026-10-02T18:5xZ (Efreet, 19:3xZ: the
  review-cost gate refused a records push because the fold's settlement budget was spent) and
  2026-10-03T13:2xZ (three fold findings on the one paragraph stating a decision) | target:
  .agent/skills/coordination-fold/SKILL-CANONICAL.md, beside the ten-minute entry of the
  sibling's register | trigger: the doctrine pull request of this pass | size: two sentences |
  status: due]`

  A records commit on a coordination branch whose draft is ready is a settlement push of the fold,
  so a spent fold budget freezes every seat's records until the fold merges: fold early, or before
  the ready-mark's review legs run. A records fold's findings land on the paragraph that states a
  decision; a dated estimate line that records the hour's rulings cures count, contradiction and
  wording in one push.

- **Under gates that read the whole working tree, dependent halves land as one commit**
  `[captured: 2026-10-11 | source: napkin blocks 2026-10-03T00:5xZ (Efreet: three refusals, two
  halves whose gates read each other) and 2026-10-03T19:5xZ (a tracked file linking an
  uncommitted new file); the sibling's napkin 2026-10-10T15:0xZ (Cedar: the partner's push failed
  on a README row linking an untracked report) | target:
  .agent/rules/stage-by-explicit-pathspec.md, the sentence "the gate reads the whole working tree
  while it runs" | trigger: the doctrine pull request of this pass | size: one paragraph | status:
  due]`

  A pathspec commit runs the hooks over a temporary index holding only its paths while the link
  validator reads the whole working tree: two halves whose gates read each other (a record and the
  script that names it) land as one commit; a tracked file that links a not-yet-tracked file is
  BLOCKING at every commit while both sit uncommitted, so the new file lands first or with its
  riders; on a shared primary a report and its index row are committed together before anyone
  pushes.

- **A port is cut from the destination's own text; the cure is the passage, not the anchor**
  `[captured: 2026-10-11 | source: napkin blocks 2026-10-02T01:15Z (Hazel: a raw patch duplicated
  three passages and reversed one), 2026-10-02T20:4xZ (Efreet: an anchor at zero on the twin
  because the passage wraps differently), 2026-10-03T00:5xZ (a carried validator's import
  closure) and 2026-10-03T19:5xZ (a three-way merge landed one-sided edits in the clean regions)
  | target: .agent/skills/change-custody/semantic-merge/SKILL-CANONICAL.md, the carry clauses,
  and the cross-estate rule's carry step | trigger: the doctrine pull request of this pass | size:
  one paragraph | status: due]`

  A port is cut from the destination's own text with edits that assert their anchors; where the
  twin's anchor reads zero because the passage wraps differently, the cured passage is applied to
  the estate's own wording and proved byte-equal to the sibling's merged text. A three-way merge
  of a conflicted shared file lands the other estate's one-sided edits in its clean regions, which
  are a read the ledger never made. A carried module's import closure is read before the copy.

- **Records that land in two estates are estate-neutral and dated; a later message settles an earlier line**
  `[captured: 2026-10-11 | source: napkin blocks 2026-10-02T14:01Z (Hazel: seven stale or false
  lines found by a peer's pass; a pull-request number without its estate), 2026-10-02T17:48Z (a
  later, more specific message from the same author settles an earlier ambiguous line; the ack
  asked and confirmed), 2026-10-05T16:3xZ (Sycamore: a records fold draws findings on a count, a
  date, a "here") | target: .agent/rules/records-are-technical-not-emotional.md §Records carry
  their authority honestly, and .agent/rules/handoff-messages-self-contained.md for the message
  clause | trigger: the doctrine pull request of this pass | size: three sentences | status: due]`

  A record that lands in two estates is written estate-neutral and dated before the ready-mark
  (no "here", no live count without its date); a pull-request number names its estate wherever
  both estates appear in one record. A later, more specific message from the same author settles
  an earlier ambiguous line, and the reading is acknowledged back before it is acted on.

- **A closed write list with nothing landed is itself the buffer**
  `[captured: 2026-10-11 | source: napkin block 2026-10-02T02:32Z (Hazel, Cricket suite 14: a
  grouped write list of 104 items, none landed) | target:
  .agent/skills/knowledge/consolidate-until-done/SKILL-CANONICAL.md, the landing step | trigger:
  the doctrine pull request of this pass | size: one sentence | status: due]`

  Group the drain's writes by home surface early and land the memory-surface group first, since
  it needs no pull request; a closed, grouped list with nothing landed is the buffer under
  another name.

- **Count from the whole listing, never from a tail**
  `[captured: 2026-10-11 | source: napkin block 2026-10-02T18:5xZ (Efreet: a diff stat piped
  through a tail of eight lines hid three of ten files) | target:
  .agent/rules/read-diagnostic-artefacts-in-full.md, the examples | trigger: the doctrine pull
  request of this pass | size: one sentence | status: due]`

  A count is taken from the whole listing or the command's own summary line, never from a
  tail or a head of it.

- **A content proof reads decisions, not lines alone**
  `[captured: 2026-10-11 | source: napkin block 2026-10-02T20:4xZ (Efreet: a six-file residue
  script read zero while a 22-file line proof found absent lines in ten files, every one
  superseded by a later decision); the same finding at this pass's open on the leftover omnibus
  branches of the second consolidation | target: .agent/rules/worktree-hygiene.md, the
  content-proof sentence | trigger: the doctrine pull request of this pass | size: one sentence |
  status: due]`

  Before a branch is retired as content-superseded, the proof reads each absent line against the
  decision that superseded it, not the line's presence alone; a line absent by a later decision
  is not lost work.

- **A failed push is never answered as done**
  `[captured: 2026-10-11 | source: napkin block 2026-10-02T00:10Z (Hazel: one chained command ran
  the push, its echo, the thread replies and the push-done line; the push exited 1) | target:
  .agent/rules/exit-codes-in-band-never-piped.md, one sentence beside the chain clause | trigger:
  the doctrine pull request of this pass | size: one sentence | status: due]`

  Every step after a push is gated on the push's exit with `&&`, and the remote is read against
  the local tip before any sentence says "pushed".

- **A smoke that resolves a binary through PATH fails the security rating**
  `[captured: 2026-10-11 | source: napkin block 2026-10-03T00:5xZ (Efreet: SonarCloud on the
  carried smoke, cured at d4a355624) | target: .agent/reference/shell-and-tooling-gotchas.md, one
  bullet (both estates carry the smokes) | trigger: the doctrine pull request of this pass |
  size: one bullet | status: due]`

  SonarCloud's security rating fails a smoke that resolves pnpm or git through PATH; a smoke spawns
  `process.execPath` with tsx and the resolved trusted git.

- **Oak GitHub reads are always permitted; writes stay forbidden until the owner lifts the ban**
  `[captured: 2026-10-13 | source: the owner's word of 2026-10-13 in the session of Walrus seeks
  Maelstrom (9585cc), verbatim in the napkin block of 13:0xZ and the repo-continuity invariant
  line of the same day | target: .agent/rules/downstream-checkout-never-writes-upstream-surfaces.md,
  the paragraph carrying the 2026-09-06 ruling, a dated amendment to its read half; the operator
  profile's repo scope line at the owner's word | trigger: the next doctrine pull request from the
  default branch | size: two sentences | status: due]`

  Verbatim: "You are always permitted read-only access to Oak github, write access is forbidden for
  now, that will change at a later date." For the home: a read of any Oak GitHub surface needs no
  permission; a write of any kind stays forbidden until the owner lifts it by word; the 2026-09-06
  ruling's read half is superseded and its write half stands.

## Slow lane (PDR-130 — constitutional-class concepts, decided at their review date)

Rows here are live deliverables under a named review gate, NOT decision-debt:
each carries a prediction, a falsifier, and a review date, and is decided
(promote / kill-with-reasoning) AT that date. A dedicated consolidation passes
these by unless a review date has arrived. **Bootstrap exception: a row tracking an
ALREADY-ACCEPTED record is decided retain vs retire-by-its-own-falsifier at
review — promote/kill applies only to not-yet-minted concepts.**

| Concept | Prediction (by review) | Falsifier | Review |
| --- | --- | --- | --- |
| Settlement under sampling reviewers cures the class, not the instance, and the budget counts the rounds two reviewers add at every push (retrospective 2026-10-05, proposal 3; the record named this section as the row's home in both estates and no row existed until the third dedicated consolidation registered it on 2026-10-11) | the next landing of more than two hundred files settles in at most three pushes per estate | a class cure that draws a further round on the same class | 2026-10-19 |
| Close-time single-lesson graduation (retrospective 2026-07-20 proposal 1): a captured lesson that is single-instance sufficient (PDR-100), has a nameable doctrine home, and needs no cross-seat synthesis graduates AT session close; the frozen-corpus constraint gates rotation and cross-seat synthesis only. Promotion target: `session-handoff` step 6b, landed under the PDR-101 quorum. Provenance: authored FAST-enacted in the retrospective, reclassified slow-lane at PR #450 review (PDR-130 §§2/4; Director-ratified 2026-07-20) | Pre-promotion observable, accrued in this row during the quarter: each clause-eligible lesson that recurs between capture and its homing is logged here as it occurs — the measured cost of batching while the clause stays unenacted (worked warrant: a June-documented class re-surfaced 2026-07-17 and re-bit three seats before homing, ~3 days from that re-surfacing). At review: promote if at least one recurrence class accrued; the post-promotion prediction (recurrence drops to ~zero) binds only after enactment | No recurrence accrues by review (the batching frame carries no measured cost — the entry is killed), or the accrual log itself goes untouched (the row is theatre; kill it by the register's own rule) | 2026-10-20 |
| Blame-referent calibration (retrospective 2026-07-26, PDR-094 arc): agents calibrate to the most salient blame signal (accreted caution, or the last correction), not the standing policy, whenever the policy exists only in the owner's head; a WRITTEN owner-ratified policy line converts reversal-grade corrections on that axis into calibration-grade refinements. Provenance: `.agent/reports/agentic-engineering/2026-07-26-pdr-094-retention-arc-retrospective.md` §Meta root (v1–v2 hoard, v3 over-delete, v4 co-authored referent, all one arc) | By review: NO reversal-grade owner correction on the retention axis (the axis now carries its written line, PDR-094 v4); any retention correction observed is a refinement, not a reversal | A reversal-grade retention correction lands despite the written line — the written-referent cure is insufficient and the mechanism needs an action-time instrument (kill this row into that finding) | 2026-10-26 |
| A signal is not the fact it stands for (candidate principle; consolidation 2026-09-13, PR #143; n = 1 seat-day — seven instances at one seat on 2026-09-12/13, so an observation by `one-instance-is-an-observation`): before a seat acts on an instrument's verdict, a reviewer's finding, a single instance or a fit to the data at hand, or writes one into a durable record, it states what the signal stands for, why it is present, against what it is compared, and what would show it wrong. Foundations: `.agent/research/cognitive-systems/structured-thinking/` (experimental-design-foundations, statistical-rigour-foundations), cited never restated. The always-loaded forms landed fast-lane with PR #143: the rule, the `verify-dont-trust` instrument clause, the `reason` warrant sentence, the pattern `signal-read-as-fact`. Routed here at PR #143's round one (PDR-130 §§2/4: a directive-tier line importing research frames is constitutional-class) | By review: at least one instance of the class, recorded in the pattern's filings or the review-cost ledger, arises in a signal kind the rule and the clause do not name — evidence the general framing is needed at the directive tier; then promote the line into `principles.md` | Every instance recorded by review is one the named fast-lane forms already cover, or none is recorded — the line is redundant with its fast-lane forms; kill the entry with this reasoning | 2026-12-15 (first consolidation on/after) |
| Clocked obligations starve unclocked jobs (retrospective 2026-09-20, proposal 3): when a standing rule with a deadline (a DUE branch fold) will consume the budget of the owner's stated job, the seat puts that one collision to the owner at its first occurrence, as a question about which gives way, and does not resolve it by obeying whichever obligation is due. Provenance: `.agent/reports/agentic-engineering/why-the-register-stayed-at-twelve-for-three-days-2026-09-20.md` §The causal stack (four folds in sixty-six hours, zero register entries moved; the owner's one sentence removed the collision and the register emptied in forty minutes of directive work). The operational forms landed fast-lane in `consolidate-until-done` step 7 (price the pass, reserve the last step; 2026-09-20) and `user-collaboration.md` (report the job's measure first; 2026-09-19). Routed here because a line ranking an owner's job above standing rules is constitutional-class (PDR-130 §§2/4) | By review: the next dedicated consolidation that meets a DUE fold surfaces the collision in its first context and moves its measure in that context | It surfaces the collision and the measure still does not move; or no such collision occurs by review and the row is killed as untested | 2026-12-20 (first consolidation on/after) |
| Cure the governing text at the owner correction (retrospective 2026-09-16, proposal 2 with its compaction-wrap addendum A; registered at the 2026-09-16 dedicated consolidation): an owner correction that contradicts a governing text is cured at that text in the same session, in the owner's words, and the napkin records the instance; at a second correction on one class, the seat records where the contradicting or missing instruction lives — a wrong estate text, a platform text the estate cannot edit, or no text — and cures at that place. Provenance: `.agent/reports/agentic-engineering/why-written-lessons-kept-needing-the-owner-2026-09-16.md` §Proposals and §Addendum. Of the three texts that warranted it, the cross-fork routing clause and pr-lifecycle's watch prescription were cured fast-lane at the same consolidation, and the IO admissions in `testing-strategy.md` were cured at its directive pass on 2026-09-19 | By review: owner-corrected classes whose text was cured at the first correction do not recur as owner corrections, measured from napkins, which over-record corrections | Text-cured classes recur at a rate no lower than capture-only classes in the next since-marker synthesis; or a repeat-correction class has no contradicting or missing instruction to be found | 2026-12-16 (first consolidation on/after) |
