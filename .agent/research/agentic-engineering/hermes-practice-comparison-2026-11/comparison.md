# Hermes Agent and the Practice: how each learns, and what decides that a lesson stays

A comparison of the learning loop of Hermes Agent v0.23.0 with the learning loop of the
Practice, written to find the one feedback loop the Practice should make outcome-informed
first. Written 12 November 2026 by the seat Swift holds Aether (Claude Code cloud session
`01Duocji`, solo) for the owner, under [`brief.md`](brief.md).

In brief. Hermes and the Practice fail to close the same loop from opposite sides. Hermes
records, for every skill, when it was last used and how often, in code, on every use; nothing
reads that record as evidence of benefit, and its one scored loop is started by hand and
carries nothing back. The Practice records no use at all, yet it has twice measured whether
its lessons stopped the errors they were written for (sixteen of nineteen had not, within four
weeks), and since July it has required each new lesson to carry a prediction and a date. Both
of the Practice's measures are started by a person or by an agent remembering to. The last
archive measurement ran on 2 September. Two predictions passed their review dates in October
and stand undecided. The recommendation in section 6 is the smallest change that follows:
have the tool that already reads the prediction register report a review date that has
passed. A measure that nothing is scheduled to read does not operate, in either system.

## 0. Method

**Frame.** The brief's verdict stands as written and is not restated here: goal, scope and
exclusions are in [`brief.md`](brief.md) under "The verdict". The frame rests on one inference
that the owner has not stated, that this research strand serves the ratified node
`outcome-informed-practice-learning`. The session proceeded on it. The challenge pass was
asked to test it first; its result is in section 8.

**Depth.** Parallax Core: one charter (the brief), one seat reading first-hand, no fleet,
measured checks where the Practice's own tooling could answer, one challenge pass by a
reviewer that wrote neither account, and return conditions.

**Sources and their unequal standing.**

| Side | What was read | What was observed running | Pin |
| --- | --- | --- | --- |
| Hermes | The merged study in `../hermes-agent-v0.23.0-2026-11/`: `synthesis.md` whole; `memory-learning-architecture.md` sections 5 (L1 to L8) and L10 | Nothing. The study's status is `provisional` and forbids reading any row as observed behaviour. No Hermes code was run in this session either. | `hermes-agent` `2bd378ed`, `hermes-agent-self-evolution` `0a929e3a` |
| The Practice | The mechanisms named in section 2, each read first-hand at the cited lines | Its own tooling, run in this session: `pnpm practice:fitness:informational`, and read-only `git log` queries (section 2.3) | This repository's `engraph` at `495c82f45`, merged into the work branch at `d2e5aa15c` |

The evidence is unequal in the Practice's favour, and the comparison says so wherever it
matters: a "does" cell for Hermes means "the code at the tag reads this way"; a "does" cell for
the Practice means "this command returned this on 12 November 2026".

**Three frames, held apart.** The brief asked that the Hermes study's categories not be the
only lens. Section 3 uses those categories for breadth because both accounts can fill them.
Section 4.1 re-reads both systems in the Practice's own terms (capture, distil, graduate,
enforce, from ADR-131 and PDR-014). Section 4.2 re-reads both in terms that belong to neither:
the causal chain and the four latencies of the adaptive-capacities research record
(`.agent/research/agent-capacities-2026-09-09/report.md`, sections 7 and 2.1).

**Citation discipline.** Practice citations are repository paths with line numbers at the pin.
Each quoted phrase was checked mechanically at its cited lines with the quotation-match script
kept in `../hermes-agent-v0.23.0-2026-11/method-instruments.md` section 4, adapted to one
repository; the rows are in [`quotation-check-rows.tsv`](quotation-check-rows.tsv) and the
result is in section 7. Hermes claims cite the study's sections and verdict ids, where the
permalinks are.

**Out of scope, as the brief set it.** Hermes's repository architecture; ranking the two;
adopting Hermes code; advice to Hermes's maintainers; any change to a Practice rule, skill or
plan. Section 6 holds proposals only. The two precedents end in "what each could take"; this
document gives the Practice's half only, because the other half is advice the brief excludes.

## 1. Hermes, on the slice

From the study, in its terms, with nothing added. A reader who wants the mechanism detail
should read `memory-learning-architecture.md` sections 3 and 5.

- **What is kept.** Two bounded memory files, a tree of skills, and a session database, with
  sidecar records for pending writes, skill usage, a mutation ledger and the curator's state
  (L1).
- **What writes it.** The acting model's own tool calls during a turn, and a second agent that
  reviews the conversation after the reply when a counter reaches its interval (L2 and L3;
  V-3). The review prompt instructs it to be active: "most sessions produce at least one skill
  update" (`synthesis.md` section 5.1).
- **What decides that an item is kept, changed or retired.** For memory entries, the model's
  judgement inside a turn or a person's edit; "No time, usage or score input exists in code"
  (L6). For skills marked agent-created, elapsed time since the latest recorded activity,
  against two thresholds of 14 and 30 days, moves a skill from active to stale to archived
  (L6; V-7). All other skills have no automatic retention decision. The curator never deletes;
  the archive is the maximum (L6).
- **Whether anything records an item's effect.** Use is recorded: per-skill counts,
  timestamps, and whether a skill was used again after its latest patch (L7). Effect is not:
  the study found no record of which memory entry was used in a turn, no comparison of an
  outcome with and without an item, and no score on any item, by a sweep with a known positive
  (L7).
- **The scored loop.** A separate repository scores one skill's text on a held-out set with a
  word-overlap measure. It runs when a person starts it, its named optimiser is not
  constructible as called, and no code carries its result to the runtime (L8; V-9, V-12;
  `synthesis.md` section 2.3).

The study's own summary: "One runs automatically in every installation and measures nothing.
The other defines a measure and runs only when a person starts a script, with no code path
back to the runtime" (`synthesis.md` section 2.3).

## 2. The Practice, on the slice

Written by the discipline the Hermes account used: what the Practice says, from its own
documents; then what it does, from its tooling and history; with the two kept in separate
columns and a falsifier on each row.

### 2.1 What the Practice says it is

The Practice names its learning path as four stages, "capture → distil → **graduate →
enforce**" (`.agent/skills/knowledge/consolidate-docs/SKILL-CANONICAL.md:676`), and one
workflow, consolidation, as the place where the stages meet: "Without consolidation, the loop
stalls at refinement" (`docs/architecture/architectural-decisions/131-self-reinforcing-improvement-loop.md:65`).

- **Capture.** Every session writes mistakes, corrections and surprises to one file, the
  napkin, continuously; "`start-right` loads it whole into every session"
  (`.agent/skills/knowledge/napkin/SKILL-CANONICAL.md:158`). Capture is never withheld for size:
  "Capture is sacred; fitness is a signal that consolidation or graduation is overdue"
  (same file, line 78).
- **Distil and graduate.** "When the napkin exceeds ~500 lines" it is rotated (same file, line
  232): its lessons are extracted, each given a disposition, and the file archived only after
  processing (`consolidate-docs`, lines 576 to 597). A lesson that is settled is written into a
  permanent home: a rule, a decision record, a pattern file, a directive or a skill. The
  staging file says "**Promote on the first instance.** We do not hold a lesson here waiting
  for a second sighting; we promote it and trust the Practice to invalidate a wrong promotion
  through experience" (`.agent/memory/active/distilled.md:25-27`).
- **Who decides.** The agent running the consolidation decides; the owner does not pre-approve
  (PDR-101: "This is **not an owner gate.**",
  `.agent/practice-core/decision-records/PDR-101-graduation-requires-quorum.md:56`). A
  graduation that mints always-loaded doctrine is to pass a review quorum first, and "The
  deciding vote stays with the primary" (same file, lines 48 to 49).
- **Enforce.** Some lessons become code: a lint rule, a hook, a gate, a validator. The rest
  are text an agent must recall. The Practice's own record of this is PDR-098: "Authoring a
  rule installs *text*, not a *tripwire*"
  (`.agent/practice-core/decision-records/PDR-098-doctrine-traction-firing-detection-response.md:30-31`).
- **Predictions.** Since 20 July 2026, "every graduation at either speed carries a prediction"
  (`.agent/practice-core/decision-records/PDR-130-two-speed-learning.md:53-54`): a sentence
  stating the expected observable effect and its falsifier. Changes to how the estate learns go
  to a slow-lane register, each with a review date, "the gate at which it MUST be decided"
  (same file, lines 69 to 70), and "There is no third outcome and no undated holding state"
  (lines 73 to 74).
- **What it claims about effect.** It claims little, and says so. The ratified node: "This
  node does not claim that the learning loop is already observable"
  (`.agent/plans/strategic/outcome-informed-practice-learning.plan.md:132`). The consolidation
  skill: "a napkin corpus measures recurrence and cannot measure extinction"
  (`consolidate-docs`, lines 618 to 619).

### 2.2 Says and does

| Id | The Practice says | The Practice does (observed 2026-11-12 unless dated) | Would be shown wrong by |
| --- | --- | --- | --- |
| P-1 | The napkin rotates at about 500 lines (napkin skill, line 232); its declared limit is 300 | 1,795 lines on the work branch; the newest rotation marker in the file is dated 2026-09-29; the fitness tool reads it `critical` | A rotation marker later than 2026-09-29 in the file or an archive file dated after it |
| P-2 | The pending-graduations register targets zero items and a dwell of two days, hard at seven (`.agent/memory/operational/pending-graduations.md:7-12`) | "Live decision-debt: 6", all `due`; "Oldest undecided: 30d"; one entry the parser cannot classify | A re-run of the fitness tool at the pin giving other figures |
| P-3 | A slow-lane row is decided at its review date; there is no undated holding state (PDR-130, lines 69 to 74) | Two rows carry review dates of 2026-10-19 and 2026-10-26 and stand in the register with no decision (`pending-graduations.md:269-270`); the file's last eight commits, to 2026-11-09, are records commits | A decision for either row recorded anywhere in the repository; a search for each row's concept name found the register and its source reports only |
| P-4 | The tooling reports when the graduation pipeline falls behind | For fast-lane items it does: count, status and dwell. For slow-lane review dates it does not: `rg -i 'slow lane\|slow-lane\|review date'` over `agent-tools/src/practice-fitness` returned nothing, where `dwell` and `decision-debt` have their own modules | A reader of review dates under another name in that directory or elsewhere in `agent-tools` |
| P-5 | Every graduation carries a prediction and a falsifier (PDR-130, lines 56 to 62); "nobody has counted the graduations that landed without a prediction line" (lines 123 to 124); the falsifier for this fell due on 2026-10-20 | A keyword proxy, counted in this session: of 30 rule files added since 2026-07-20 and still present, 6 contain a prediction or falsifier term; of 39 pattern files, 17; of 13 decision records, 12 | The proxy is weak in both directions (section 7). A hand read of the 24 rule files finding prediction sentences worded otherwise |
| P-6 | A wrong promotion is invalidated "through experience" (`distilled.md:26-27`) | No record was found that later experience writes to against a promoted item. What removes doctrine, by commit subject since 2026-07-20: 15 rule files deleted, of which 4 were moved into directives (2026-08-02), 10 were folded into one general text (2026-10-04) and 1 was retired because a fact changed (2026-09-08); 1 pattern file deleted; no decision record deleted. Against that, 32 rules, 39 patterns and 15 decision records were added | A retirement whose stated reason is that the lesson was tried and did not work |
| P-7 | Whether a lesson worked needs "a designed surface-signature census per window, never an absence read" (`consolidate-docs`, lines 620 to 621) | No such census exists. Hook refusals are not counted per class: the hook documentation describes an error log and a compaction log only | A count of firings per rule or per hook entry kept anywhere |
| P-8 | Archive-scale synthesis is a cadence, with a marker ledger so that each pass starts after the last (`consolidate-docs`, lines 636 to 644) | Five reports, dated 2026-05-09 to 2026-09-02. Eight napkin archives are dated after the last marker. The last pass cost about 5.25M subagent tokens (`.agent/research/agentic-engineering/continuity-memory-and-knowledge-flow/historical-napkin-synthesis-2026-09-02.md:62-63`) | A synthesis report dated after 2026-09-02 |
| P-9 | Measured recurrence selects no mechanism; it prices a gap whose design lane is a plan (PDR-098, lines 98 to 110 and 180 to 181) | The plan sits in a backlog directory with six todos, all `pending`; its last commit is dated 2026-09-25 | A todo marked otherwise, or a later commit to the plan |
| P-10 | The review-cost gate's weights "change only against this ledger" (`.agent/memory/operational/review-cost-ledger.md:19-21`) | The ledger holds one row per pull request with the gate's verdict beside a seat's judgement of where the loop should have stopped, from 2026-09-13 to this pull request's predecessor | Not tested here: whether the weights have in fact changed against it |

### 2.3 What the Practice has measured about its own lessons

This is the part of the account the brief's frame did not anticipate. The Practice has
measured the effect of its learning, twice, and has written down what it found.

- **Recurrence after a verified home.** The synthesis of 2026-09-02 read six napkin files
  through a staged engine and found: "Sixteen of nineteen prior-kept mechanisms recurred within
  four weeks of the run that kept them" (`historical-napkin-synthesis-2026-09-02.md:114-115`).
  The three that did not were "mechanisms whose actuator went quiet, not classes shown
  extinguished" (lines 123 to 124).
- **What moved a rate.** The synthesis of 2026-08-07, as quoted by a later retrospective:
  "Prose cures do not move recurrence; only interface changes do — now measured, not asserted"
  (`.agent/reports/agentic-engineering/why-written-lessons-kept-needing-the-owner-2026-09-16.md:52-53`).
  That retrospective adds one counterfactual it marks as observational: a review-tally clause
  in doctrine from 2026-08-31 went unbuilt on at least seven pull requests; the tally builder
  and cost gate landed on 2026-09-12 and the next loop settled in two rounds (lines 299 to 317).
- **The instrument's stated limit.** "The napkin measures recurrence, never extinction." and
  "A cured class leaves no entry when it stops firing, so no pass over napkins can show a cure
  worked" (`historical-napkin-synthesis-2026-09-02.md:280-282`). The rate is a floor, and the
  record over-samples owner corrections (lines 210 to 211).
- **Prospective predictions that were decided.** The slow lane has worked at least once as
  written: PDR-130's own first review on 2026-10-01 retained it "on computed evidence"
  (PDR-130, lines 115 to 117), and on 2026-10-14 two rows were promoted with evidence logged
  against the others (`pending-graduations.md:232-238`).

So the Practice is not a system that measures nothing. It is a system whose measurements are
commissioned, expensive or remembered, and whose findings about itself ("prose cures do not
move recurrence") arrive in the same medium they describe.

## 3. Breadth: the learning loop side by side

The Hermes study's categories. "Code" means the mechanism is executed by a program without a
model's or a person's decision to start it.

| Question | Hermes v0.23.0 (read, not observed) | The Practice (read and observed) |
| --- | --- | --- |
| What is stored | Memory entries in two character-bounded files; skills; sessions | A capture file (the napkin) and its archives; a staging file; pattern files; rules, skills and directives; decision records; registers |
| Who uses it | One installation's agent, for one person | Every agent seat that opens the repository, on several platforms, and a sibling estate by exchange |
| What writes it | The acting model, and a second agent after the reply | The acting agent during work; an agent running consolidation |
| What starts a write | Code: a user-turn counter and a tool-iteration counter, default 10 | The agent's recall of an always-on instruction; for consolidation, a size signal from a tool the agent chooses to run, a session close, or the owner's word |
| How it re-enters | Memory and the skill index frozen into the prompt at session start; a skill body when loaded | The napkin whole at session start; rule files through per-platform adapters at session start; skills when triggered |
| What controls a write | Code guards on the writer: approval gates (default off), a content scan, a review whitelist, pin and lock | Review after the fact: the quorum for doctrine, pull-request review, validators and lint in CI; sub-agents barred from the core documents |
| What retains or retires | Code: time since last recorded use, for agent-created skills only; the model's judgement for memory | An agent's judgement at consolidation: stable and has a natural home. Retirement by relocation, folding or a changed fact (P-6). No ageing, no use input |
| What records use | Code: per-skill counts and timestamps on every view, load and patch | Nothing (P-7) |
| What records effect | Nothing in the runtime. Offline: a word-overlap score on a held-out set, by hand | Episodic recurrence counts from archive synthesis (P-8); a prediction, falsifier and review date per slow-lane row, and a prediction sentence on some graduations (P-3, P-5); a per-pull-request cost and stop judgement (P-10) |
| What reads the effect record | Nobody: no code path back (V-9) | A consolidation agent, when one runs and remembers; the fitness tool reads item age and not review dates (P-4) |
| How a wrong item is reversed | Archive restore, snapshot rollback, ledger rollback | Git history; a superseding decision record; a later consolidation's upstream review |

**Failure modes each system names in its own words.** Three coincide closely enough to quote
side by side. The left column is from `memory-learning-architecture.md` L10; the right from
the Practice's records.

| Hermes names | The Practice names |
| --- | --- |
| "the hoarding library: one references/ file per session, incident narration instead of rules" | "the napkin has become a journal": of 708 mapped items, 186 were state and 367 were already homed (`why-written-lessons-kept-needing-the-owner-2026-09-16.md:81-83`) |
| Captured failures "become persistent self-imposed constraints that bite you later when the environment changes" | "agents calibrate to the most salient blame signal (accreted caution, or the last correction), not the standing policy" (`pending-graduations.md:270`) |
| "A large library can therefore look fully curated while most of it is untouchable." | "a rule-dense corpus always offers a licensing rule for more activity" (`why-written-lessons-kept-needing-the-owner-2026-09-16.md:259-260`) |

Hermes names failure modes the Practice's records, as read, do not: a poisoned entry that
persists because memory enters the prompt, and two writers compounding each other's entries in
one home. The Practice names one Hermes's documents, as read, do not: a lesson that is homed,
loaded and still not applied at the moment of the act (PDR-098). Hermes's documents could not
name it without a recurrence measure, which Hermes does not have.

## 4. The same two systems under two other frames

### 4.1 In the Practice's terms

| Stage | The Practice | Hermes, read through this stage |
| --- | --- | --- |
| Capture | The napkin, written during work | No separate capture stage. The transcript is the raw record and stays in the session database |
| Distil | Rotation: extract, merge, prune | The review agent reads one conversation and writes skills and memory directly. Distillation and promotion are one step |
| Graduate | A settled lesson moves to a home whose authority and audience differ from the buffer's | No tiers of authority. A skill written a minute ago and a skill a year old are the same kind of object; the curator's states record age, not standing |
| Enforce | Some lessons become executed checks | None. Hermes's code guards constrain who may write the stores; no learned item becomes a check on the agent's later behaviour. Every learned item is text for a model |

Read this way the Practice's distinctive stage is the last. It is also the stage its own
measurements credit: the classes that stopped were stopped by a lint rule, a gate, a typed
refusal or a template step (`why-written-lessons-kept-needing-the-owner-2026-09-16.md:145-157`).
Hermes at this tag is, in these terms, a system made wholly of the Practice's recall-dependent
quadrant, with a faster and more reliable way of writing into it.

### 4.2 In neither system's terms

The adaptive-capacities record separates a persistent trace, a changed response, a retained
change in capability, and an improved outcome, and warns that none implies the next
(`.agent/research/agent-capacities-2026-09-09/report.md:9`). It offers a chain from experience
to "later evaluation of the learning process" and four latencies for a correction: detection,
authorised revision, propagation of the representation, and change in behaviour (lines 560 and
568 to 577).

| Link | Hermes | The Practice |
| --- | --- | --- |
| Persistent trace | Established in code | Established in the repository |
| Trace reaches the acting context | Established in code for memory and the index; a skill body only if loaded | Established for the napkin and rule files at session start |
| Changed response at the act | Not reachable by static reading (`synthesis.md` section 5.1) | Measured, weakly and unfavourably: 16 of 19 recurred with the trace loaded |
| Improved outcome | No measure in the runtime | One observational case (the tally and gate) |
| Later evaluation of the learning process | The offline loop, unwired | Episodic synthesis; PDR-130 reviews when they happen |
| Latency recorded | Time of last use | Date of capture and of graduation; item age in the register. No latency from correction to changed behaviour |

Under this frame the two systems stand closer than under either of the others. Each
establishes the first two links by construction and neither establishes the fourth. The
Practice alone has a number on the third, and the number says the link is weak for text.

That record also bears on this document's proposals. It already classifies PDR-130's review
rule as a governance choice and not a calibrated test, asks for an explicit inconclusive state,
and designs an experiment for rule retirement (report lines 525 and 1029 to 1040). Section 6
proposes nothing that programme already covers.

## 5. Where they converge, where they diverge, and why

**Converge.**

1. **Both learn by an agent writing text for a later agent to read**, and both write readily.
   Hermes's review prompt tells the reviewer to be active; the Practice promotes on the first
   instance.
2. **Both refuse to lose what was written.** Hermes's curator archives and never deletes. The
   Practice holds that "Information loss is unacceptable"
   (`.agent/skills/distillation/SKILL-CANONICAL.md:109`). In both, the stores grow: the
   Practice's rules, skills and directives grew 29.9 % by bytes in 42 days
   (`why-written-lessons-kept-needing-the-owner-2026-09-16.md:74`).
3. **Both name the cost of that growth** in nearly the same words (section 3).
4. **In both, the loop that measures is not the loop that operates.** This is the Hermes
   study's sharpest line, and it holds for the Practice in a weaker form. The Practice's
   measures did reach its doctrine (PDR-098 carries the 16-of-19 figure) and one instrument was
   built on the strength of them. What they have not reached is any standing consumer: the
   design lane they feed is a backlog plan (P-9), and nothing is scheduled to run the next
   measurement or to read a prediction's date (P-4, P-8).

**Diverge, with the reason for each.**

| Difference | Why it follows from what each system is |
| --- | --- |
| Hermes starts its learning writes from counters in code; the Practice starts them from recall and ceremony | Hermes is a program that hosts a model, so its authors can put a counter in the turn loop. The Practice is text hosted by several vendors' programs; its only loop is the session, and its triggers must be instructions or hooks |
| Hermes records use; the Practice does not | A Hermes skill is loaded through one function, which can count. A Practice rule is loaded by a platform at session start and applied, or not, inside a model's reasoning, where nothing observes it |
| Hermes retires by time since use; the Practice retires by judgement | Hermes has the use record, and one user whose idle skills are safely archived and restored. The Practice has no use record, and a rule that guards against a rare, severe error is correctly idle most of the time. Hermes's own documents record the hazard: "57 gone in one startup tick" |
| The Practice has an enforce stage; Hermes does not | The Practice governs a codebase with CI, lint and hooks, so a lesson can become a failing check. Hermes governs a general assistant with no fixed artefact to check against |
| The Practice writes predictions; Hermes does not | The Practice has an owner who asked which of its changes worked, and a record (PDR-130) of that question. Hermes's documents, as read, define improvement only in the offline repository |
| A person approves Hermes writes only if a gate is switched on; in the Practice a person is the main corrector of purpose | Hermes ships to many users and defaults to unattended. The Practice has one owner, whose corrections are its most cited evidence |

## 6. What the Practice could take

Three candidates, each in the shape the ratified node requires. None changes a rule, skill or
plan; each would need a plan of its own, written through the plan workflow, to proceed. The
live decision all three serve is the brief's: which single feedback loop gets an effect
measure first, or whether none should.

### 6.1 Recommended: make the prediction register's review dates fire

- **The loop.** Graduate, predict, review. It is the only loop in the Practice that states in
  advance what a lesson should change and when to look.
- **The change.** The fitness tool already parses the pending-graduations register and
  reports the age of its oldest fast-lane item. It would also read each slow-lane row's review
  date and report a row whose date has passed, in the same readout an agent already sees.
  Nothing new is collected and no new surface is created.
- **The live decision it enables.** At each consolidation: retain, promote or kill each row
  that has come due, on its recorded evidence. Over quarters, the owner's question that PDR-130
  quotes: which of our own changes worked.
- **The evidence that warrants it.** P-3 and P-4: two rows stood 24 and 17 days past their
  dates on 12 November with no decision recorded, in a register whose founding record says an
  untouched register means "the lane is theatre" (PDR-130, lines 108 to 110). The estate's own
  finding is that an obligation held in text loses to one held in an instrument (section 2.3);
  the review date is an obligation held in text. And the mirror: Hermes's scored loop does not
  operate because nothing starts it.
- **Falsifier or stop.** After the change lands, a row passes its review date by more than
  one dedicated consolidation and stays undecided while the readout shows it. That would mean
  the signal is seen and not acted on, which is a different problem from the one this cures,
  and the change should be removed.
- **The effect it expects to change.** For the owner: slow-lane concepts stop needing the
  owner to remember their dates. For a later agent: the register's rows are either live or
  decided, never silently expired.
- **What it does not do.** It does not tell anyone whether a prediction held. It makes the
  question arrive.

### 6.2 Count what already fires

- **The loop.** Enforce, then capture: whether a class that has an executed check is still
  being attempted.
- **The change.** The hooks that already match a pattern would append one content-free count
  per match, per policy entry, to a local log, and a rotation would read the counts for the
  window. This is the "surface-signature census" the Practice's own synthesis said it needs
  (P-7), limited to the classes that already have a signature. It is the nearest thing to
  Hermes's usage record that the Practice's architecture permits.
- **The live decision it enables.** For a hook-guarded class: is the guard still catching
  attempts (the text has not taught the lesson and the guard is carrying it), or has the count
  gone to zero (the guard can be considered for narrowing, by the experiment the capacities
  record designs)?
- **The evidence that warrants it.** "The napkin measures recurrence, never extinction"; the
  piped-exit-code class recurred seven times across four generations of cure text (PDR-098,
  lines 172 to 176), and the napkin could not have shown its extinction had it occurred.
- **Falsifier or stop.** Two rotations pass and no decision cites a count; or keeping the
  counts costs more attention than the readings return. The node names this risk directly:
  maintaining the learning substrate must not become the dominant work.
- **The effect it expects to change.** A later agent deciding whether to harden a cure a fifth
  time has a count and not an anecdote.
- **Obligations before any collection.** The node requires them to be stated first. A count
  per policy entry with no command text, path or seat identity; local and untracked; never
  read as a measure of a seat or a person. It covers only classes with a surface signature,
  which PDR-098 says are the minority.

### 6.3 Add no measure: decide PDR-130 by its own falsifier

- **The loop.** None new. The brief's decision allows this answer.
- **The change.** At the next dedicated consolidation, decide the two expired rows and count
  the fast-lane rate by hand once. P-5's proxy (6 of 30 new rules carry a prediction term) is
  the first reading; if a hand read confirms a low rate, PDR-130's fast-lane falsifier has
  fired and the record says what follows: "the obligation has no traction and needs a
  mechanical check or retirement" (lines 112 to 113).
- **The live decision it enables.** Keep the prediction obligation, mechanise it, or retire
  it.
- **The evidence that warrants it.** PDR-130, lines 122 to 124, says the count has not been
  made. The node's bet is explicitly disconfirmable in favour of "the simpler current process".
- **Falsifier or stop.** The hand read finds prediction sentences in most of the 24 rule
  files the proxy missed; then the obligation has traction and this candidate dissolves.
- **The effect it expects to change.** The owner learns, from one bounded reading, whether the
  prediction discipline is alive on the fast lane.

### 6.4 Why 6.1 first

It is the smallest of the three and the other two depend on what it repairs. A count from 6.2
is one more record with no scheduled reader unless some date brings an agent to it; 6.3's
decision is itself a slow-lane review that came due on 2026-10-20 and that nothing surfaced.
It adds no doctrine, which matters because the estate's measured response to failure is
additive (section 5, convergence 2). And it is the direct lesson of the mirror: Hermes built a
measure and left it unstarted; the Practice built a better one and left its clock in prose.

What 6.1 gives up: it does nothing for the fast lane, where most lessons go, and nothing for
extinction. If the owner's interest is whether rules work at the act, 6.2 is the candidate
that addresses it, at a higher cost in substrate.

## 7. Limits

- **Unequal evidence.** Stated in section 0. No sentence here about Hermes's behaviour in use
  is supported, and none is intended.
- **One day's observation.** The "does" column is this repository on 12 November 2026. A
  consolidation run the next day would change P-1 to P-3.
- **The P-5 proxy.** A term match for `falsif`, `prediction`, `expected effect` or `if …
  recurs`. It counts a file that uses the word for another purpose (two of the six rule
  matches do) and misses a prediction worded otherwise. PDR-130 also allows the sentence to
  live in "the register row that promoted it" (line 62), and rows are removed at graduation, so
  a prediction kept there is gone by design. The figure supports "the count has not been made
  and a first reading is low", and no more.
- **Commit subjects, not diffs.** P-6 classifies deletions by commit subject. A deletion's
  true reason could differ.
- **Claims of absence.** P-4, P-6 and P-7 each rest on a search with a stated scope and a
  known positive in the same scope. A mechanism under another name would not be found.
- **What was not read.** The Practice side read the mechanisms on the slice and four of the
  twelve documents the brief listed (ADR-131, PDR-014's headings only, the node, the
  2026-09-02 synthesis), plus four it did not list (PDR-098, PDR-101, PDR-130, the 2026-09-16
  retrospective). PDR-011, the practice-system review, the two September retrospectives and
  the vendor-memory audit were not read. The sibling estate was not read at all.
- **Quotation check.** Reported here after the rows were run: see section 8.
- **Lineage.** The brief, the Hermes study and this document share one author lineage, and
  the seat is a subject: its own napkin entries are part of P-1's line count.

## 8. Challenge pass and session record

To be completed after the challenge pass.
