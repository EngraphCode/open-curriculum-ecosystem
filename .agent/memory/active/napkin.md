---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

# Napkin

Current-session observations. Append below. Rotate when over ~400 lines (`consolidate-docs`
step 6): extract every behaviour-changing entry, merge into `distilled.md` or graduate to a
permanent home, verify the home, then archive and start fresh. Rotation is the preservation
step AFTER processing — never a fitness-relief move or a queue (owner correction, 2026-07-06).
Author entries per `records-are-technical-not-emotional` §Records carry their authority
honestly: observations get past tense, a named instance, and scope/expiry in the same
sentence; only owner-ratified doctrine gets the imperative. On this shared surface, edit by
exact-match anchor or append-only — never rewrite from a positional marker (truncate-race,
2026-07-28).

## Napkin rotated (2026-09-20 14:4xZ, Zephyr guards Leeward, 281e44)

Rotated below the line threshold at the owner's word of 2026-09-20, verbatim: "you are supposed
to analyse the buffers, preserve the knowledge, then analyse and preserve the knowledge in the
oversized memory files, nothing else". The window (the 2026-09-19 rotation record and this
seat's three blocks of 2026-09-20) is preserved in `archive/napkin-2026-09-20.md`,
byte-identical to the napkin committed at `SHA:28c5dd11d` (blob `3c2c8aedd` at both paths).

Every entry was read and placed before the move. Written into homes in the same commit: the
read of HEAD after an interrupted or refused ceremony (the `commit` skill's process step 2);
the owner's ruling on side-by-side gate runs in separate worktrees (`no-unbounded-host-load`
item 6, and `consolidate-until-done` step 8 stated to match); a plan priced again at resume,
and the 30 % gate pricing directive edits only (`consolidate-until-done` step 7); a cure checked
at source like the text it replaces (`pr-lifecycle`); a rule amended with its decision record
open, with the 30 % read clause as the instance (`new-rule-vs-pdr-clause`); the archive pointer
written inline (`continuity-practice.md`); a smoke check's wall-clock wait failing a push on a
loaded host (F-197); the lesson that did not bind its author and the report line that did
(`passive-guidance-loses-to-artefact-gravity` instance 5, and the 14:3xZ addendum of the
retrospective report); the context-loop experiment's findings and the design of its next run
(`.agent/reports/agentic-engineering/context-loop-experiment-working-seat-2026-09-19.md`); and
two items for the owner (the experiment's restart, the work-list candidate) beside F-189 in the
continuity thread record. Found already homed: the merge-message ref resolution
(`coordination-fold` step 4), the corrected-direction residue sweep (`pr-lifecycle`), the
budget rule's scope, the card answers and the narrowed job (the continuity thread record), the
whole-read verdict on `director-handoff.md` (the same record, item 3). Left in the archive as
single observations no home needs yet: the free-play associations of both wraps, and a wrap
that writes to the napkin it has just drained.

Comms: the ARC channel was read to its end at 14:42Z (last entry this seat's 14:29:32Z pause
notice); Dynamo turns Temper's 14:19Z team-start on the stream was read at the wrap. The
watermark is not advanced and no archive move has run, because the substantive-event mover is
still unhomed, as at the four rotations before.

## Napkin drained of this seat's blocks (2026-09-20 19:0xZ, Zephyr guards Leeward, 281e44)

The correction block of 15:0xZ and the wrap block of 15:1xZ with its 18:4xZ addendum are
preserved in `archive/napkin-2026-09-20b.md`, byte-identical to the napkin committed at
`SHA:6a9a78092` (blob `69206f15c` at both paths). Every entry was read and placed before the
move: the split method's skill half was already in `consolidate-until-done` step 7
(`SHA:3cd0df21a`); its directive half landed in `continuity-practice.md` §Runbook step 1 in
the commit that carries this record, at a context of 11 % after the owner's second compaction;
the done-condition candidate of the addendum is item 4 of the continuity thread record's owner
decisions. Left in the archive as single observations no home needs yet: the forwarding-address
association, the analysts' notes as a map of structure, and a peer's appends riding a seat's
commit. Dynamo turns Temper's block below stays, theirs to drain.

## 2026-09-20 15:0xZ — Dynamo turns Temper (2a4c8a): three pull requests in one queue cost sync rounds

- Observation: with #160, #161 and #162 all settled at once, each landing put the other two
  BEHIND (the door's strict up-to-date base), and each sync push draws a fresh reviewer round
  over the same tip-plus-merge. Three PRs → two sync rounds after #162, one more after #160.
  Nothing wrong; the cost is structural. Land in the order the checks finish, and open the next
  lane's PR only when the queue is short, or accept the rounds.
- Observation: the workspace census `check` failed on `engraph` at `93c35f285` (20 stale facts
  entries) and is in no gate; its facts count files under `.agent/`, so any commit there stales
  it. A finding for its own lane (recorded on #163's description).
- 2026-09-20 16:0xZ (Dynamo turns Temper, 2a4c8a): the `git add .` hook matches any staging
  command whose pathspec begins with a dot-directory (`git add -- x.ts .agent/reports/…`), so a
  tracked file under `.agent/` cannot be staged by name in the same command as a file elsewhere;
  an absolute path did not help (the substring still matched). What worked, without a sibling
  bypass: `git commit --include -F msg -- <paths>`, which commits the named paths with what is
  already staged. Friction for the hook's author: anchor the pattern at a word boundary or the
  argument's end (`git add .` alone, `git add .$`).
- 2026-09-20 16:2xZ (Dynamo turns Temper, 2a4c8a): a test-expert consult said new cases could
  join a pre-invariant loopback suite "since no new IO is introduced"; the directive
  (`testing-strategy.md` §Tests never use IO) has no such carve-out and both vendor reviewers
  cited it at round one of #166. A consult is a reading, not the directive: when a consult
  licenses something the directive names absolutely, read the directive's sentence before
  acting. Cost: one settlement push and one round.
- 2026-09-20 16:3xZ (Dynamo turns Temper, 2a4c8a): the forced-push hook reads the whole command
  text, so a `merge-bot push` followed in the same command by `gh api … -F body=@file` or
  `-f t=$id` is blocked as `push -f`. Keep the push and any `gh api` call with a `-f`/`-F`
  flag in separate commands.
- 2026-09-20 17:0xZ (Dynamo turns Temper, 2a4c8a): a backgrounded chain `python3 - <<EOF … EOF;
  git commit …` committed the UNEDITED file when the script's assertion failed, and my grep of
  the task output looked only for the push line, so #167 opened with cures its description
  claimed and its tip lacked (Copilot found it). Chain edits to commits with `&&`, print a
  sentinel from the script, and read a task's output for `Traceback` before trusting it.
- 2026-09-20 17:1xZ (Dynamo turns Temper, 2a4c8a) — play seeds, associations only: (1) a
  measurement stored inside the measured thing stales itself (the census's facts under
  `.agent/`; the context-usage row in the transcript it measures) and reaches a fixed point only
  by iterating; (2) the rule to measure vendor call shapes at plan time existed and the D8 plan
  still recommended a shape gh refuses (`--slurp` with `--jq`); the measurement happened at
  implementation, which is late but before the push.

## Zephyr guards Leeward (281e44) — 2026-09-20 19:4xZ, wrap before a compaction at ~56 %

- **The measure.** Register 0 due; distilled 0; open questions 0; the napkin holds Dynamo turns
  Temper's 15:0xZ block (theirs) and this block; oversized files curated this context: the
  design-system-integration record, `mcp-submission-drive`, `workspace-config-isolation`,
  `strategy-and-plan-estate-holistic-review` and `eef` (eleven of the named set in all), plus
  `statusline-enhancements` and `typescript-estate-consolidation-review` read whole and left
  live. Analyses for `upstream-api-alignment` and the codex hook experiment are on disk unacted;
  twenty-one paused records under 300 lines remain, then the continuity record's own history.
- **Metacognition.** The split method ran four times this context (nine, two, two, two, then
  one analyst per file) and cost the seat about 25 % of context for five curations, most of it
  the analyses and the re-emitted kept text. Two refusals were the seat's: MD018 on a wrapped
  line beginning `#865` (the pattern's instance 5 recurring on its recorder: the hook is the
  cure, and grepping `^#[0-9]` before the ceremony is the cheaper one, now done); and two
  ceremonies lost the `.git/index.lock` race to a periodic git process on the primary — the
  register already names the class, and the cure was to run the ceremony alone. The
  identity-naming ratchet refused a byte-identical archive because the census keys occurrences
  by path; the director-handoff archive of 2026-09-08 had the same shape and the same cure
  (re-point the row), which the commit skill's archive step could state.
- **Free play, one time-box.** Kept: a paused record that says "do not archive me" is right
  when its sections are open state, and the lifecycle's "leave-if-live" already says so; the
  analyst's per-section STATE column is a cheap first read of that. Kept: the join between a
  lane's record and its plan is where the record's "next step" lives on, so a curated record
  points at the plan and never restates the sequence. Discarded: a generic "paused records
  archive by default" rule — two of seven were live.
- **Concept exploration, compact.** Frame: a curation's cost has two parts, reading (paid by
  analysts) and re-emitting (paid by the seat), and the method halves only the first. Warrant:
  eef's 130-line identity table was read once and written once. Falsifier: an Edit that removes
  the finished range without the seat holding it — the tool refuses that by design, so the cost
  is inherent, and the only lever is choosing Write when kept < removed and Edit otherwise.
- **Loss scan.** Conserved: five archives with proofs (`SHA:52c376002`, `SHA:c5e49a10b`,
  `SHA:561a0ee36`); the `signal-read-as-fact` pattern's n = 2; the continuity record's resume
  point; the machine-local handoff on claim `48a715a4`. Promises: the two unacted analyses
  (scratchpad, machine-local — the archives are untracked but re-derivable by `cp`); the
  twenty-one small paused records. Blind spot: the census re-point is the only archive-time
  step the lifecycle text does not name; a candidate sentence for `continuity-practice.md`
  §Disposition at a context below 30 %.
- **Owner correction, 2026-09-20 ~20:0xZ, verbatim: "wrapping and pushing is no use whatsoever
  if you can't trigger your own compaction, which you can't, all you are achieving is
  stopping."** The instance: this seat wrapped at 56 % and answered the goal hook's refusals
  with "holding for `/compact`" seven times, on the reading that the earlier freeze order
  ("prepare for compaction and stop all processes") still governed; it did not — that order
  was for one compaction the owner then ran, and absent a fresh one the seat's compaction is the
  80 % auto-compaction, with the preparation at 70 %. The cure: a seat past the meter's peak
  keeps working the job in bounded pieces until the preparation threshold, and wraps then, once.
  Home: `consolidate-until-done` step 7 (the pricing paragraph: the budget of a context runs to
  the preparation threshold, never to a wrap the seat chooses early). The done-condition
  candidate of the continuity record's item 4 stands.
- **Owner declaration, 2026-09-20 ~20:1xZ:** the drainable buffers are drained enough for this
  round; the large memory files are the only remaining item for the goal, and they need
  knowledge curation and appropriate handling. The measure from here is the large-file set:
  twelve curated, five read whole and left live, three analyses pending (`mcp-agent-facing-content`,
  `orientation-skills-family`, `curriculum-hub-demo`), sixteen paused records under 300 lines
  unread, and the active set (`repo-continuity.md` 695 lines, `agentic-engineering-enhancements`
  568, the continuity record 492, `director-handoff.md` 428, `open-surface-zero` 346, and the
  frictions register's 3,937 live lines).
- **Metacognition at the declaration.** What held: the split method's per-section STATE column
  turned out to be the cheapest instrument for the lifecycle's first question ("live or
  finished?") — five of the seventeen records read today were left live on it, and each verdict
  cost a grep of the analysis, not a read of the file. What did not: this seat spent seven
  turns holding for a compaction it cannot trigger (owner-corrected above); it also re-emitted
  every kept line of each curated record, which is where most of this context's 50 % went.
  The mistake shape both times was treating a rule's letter as its reason — the freeze order
  and the "read whole" obligation — and the owner's two corrections today were both the
  reason restated.
- **Free play (one time-box).** Kept: "appropriate handling" has three outcomes, not one —
  curated, left live with the verdict recorded, or found homed elsewhere and archived whole —
  and a report that names which outcome each file got is the honest measure, where a count of
  files "done" is not. Kept: the fitness signal's line-width criticals are all in records
  already left live or curated; that signal is now noise for this job. Discarded, visibly:
  curating the frictions register's live entries for size — they are live, and the owner's
  word is that fitness numbers are never the goal.
- **Concept exploration, compact.** Frame: a large memory file is "handled" when a seat has
  answered the lifecycle's question for every section and left a proof (an archive blob, a
  recorded verdict, or a named home). Warrant: the five records left live today each have a
  section-level analysis on disk and a one-line verdict in the continuity record; a reader can
  check the verdict against the analysis without re-reading the file. Falsifier: a record
  left live whose next reader finds a finished range the analysis marked live — then the
  instrument, not the reader, is wrong, and the brief's STATE rule gets the correction.

- 2026-09-20 20:3xZ (Dynamo turns Temper, 2a4c8a; play seeds and a rule candidate, on
  Zephyr's branch by name): the `pr view --json` projection is the state, never the evidence —
  a merge verdict reads the paginated connection (three instances: `latestReviews`, commits
  bounded at 100, the comments' edit flag); an UNSUPPORTED claim on a precondition blocks the
  push until verified live (row 20 predicted Copilot's round-two finding on #168); the
  connector edits its summary comments and never its clean ones (63 / 0 of 28) — count edited
  clean comments in the cost survey; the context check should say "unreadable", not
  "compacted", when the transcript cannot be read.
- 2026-09-20 20:4xZ (Dynamo turns Temper, 2a4c8a): a seat that cannot trigger its own
  compaction stops three times at the same mark if each stop is a report — the report reads as
  an end to its writer. The cure is a named next piece of loss-tolerant work, never "continue".

- **Addendum, 2026-09-20 20:5xZ (Zephyr guards Leeward, 281e44) — the large-file set is read
  whole.** After the third compaction of the day (the meter's second reading 10.7 %; the first,
  66.5 %, was the stale one — the register's own note): nineteen files curated (this context:
  `orientation-skills-family`, `skills-estate-organisation`, `repo-continuity.md` by an
  index-record brief, `open-surface-zero`, `director-handoff.md`, the continuity record's own
  session history) and twenty read whole and left live, every one with a section-level analysis
  in the scratchpad and a verdict in the continuity record's resume point. Counts at this
  write: pending graduations 0; register 0 due; distilled 0; open questions 0; napkin: two
  records and Dynamo's blocks, plus this block. What the day taught about the method, kept
  here as one seat's observation: the split method scales to a whole tier when the analysts
  answer one cheap question per section (STATE: live or finished, with the sentence) and the
  seat verifies only the claims that bear on a move at their commits — thirty analysts over
  thirty-nine files, every merge sha checked with `git cat-file` or the merge-commit grep; a
  verdict of "left live" is as much a result as a curation and costs one `rm` of the
  snapshot. One refusal: a ceremony run lost its staging before the guard (the staged set did
  not match the intent) with no lock file involved — closed the claim, abandoned the intent,
  re-ran alone; one instance, an observation.

## Zephyr guards Leeward (281e44) — 2026-09-21 06:3xZ, the terminal wrap at the owner's word

- **The measure at the wrap.** Pending graduations 0 (five PDR-130 slow-lane rows under their
  review dates); distilled 0; open questions 0; this napkin: the day's records and this block.
  The large-file set: nineteen curated, twenty left live; the 2026-09-20 branch folded as #159
  (`SHA:efb2942e9`); the WS-8 synthesis processed into ADR-187 and the sha-prefix rule, deleted
  (`SHA:a7c3035e5`).
- **Metacognition (retrospective, on the day's corrections).** Inherited: a done-condition the
  30 % gate could forbid, and a seat that read "wrap" as "stop". What changed the model: the
  budget is the harness's, not the seat's — a context runs to the compaction it cannot call,
  in pieces whose product lands as it is made; "left live" is a verdict with a proof, not a
  deferral; and a class that doctrine ratifies but the tool does not know moves the
  irreversible act off the instrumented path (the #159 merge by hand). The bridge to impact: the
  owner's impact is knowledge that fires at pickup; every curated record now says where the
  current state is and names its archive. Falsifier: a successor opens a curated record and
  cannot find the state — then that section, not the successor, failed. The reliability rung
  for "all findings of the WS-8 synthesis are in ADR-187": interpretation from phrase hits, not
  a clause-by-clause read; recorded as such.
- **Free play, one time-box.** Kept: the paused records read as strata — each "READ FIRST"
  banner a newer layer over the last, and the split method's newest-first rule is a core
  sample read from the top; this reminded me of stratigraphy, and it is why a section's next
  step resolves in the section above it (a play seed for the paused-record brief: name the
  strata). Kept as association only: Dynamo's "a report reads as an end to its writer" beside
  this seat's seven one-line answers to the Stop hook — the same shape from both sides of the
  table. Discarded, visibly: the door's "names no reviewed commit" on a quota notice as a new
  instance of `signal-read-as-fact` — forced; the door read the signal correctly and refused.
- **Concept exploration, compact.** Frame: the fold's merge went by hand because the door does
  not know a class doctrine ratified on 2026-09-03; the problem is the gap between the two, not
  the by-hand path. Proposal, routed: the estate record §Tool and code lanes owed item 8 (the
  door learns the docs-only bot-authored class), warrant the clause's own PDR-130 prediction met
  on its first trial, falsifier the owner's preference or Codex's credit returning. Unresolved
  evidence: whether the door's SKIPPED reading of Copilot at 21:37Z (checks green while the PR
  was still a draft) would have bound a review had the undraft come before the checks.
- **Metaloss recursion (wrap step 7).** Compressed reasoning: the per-record verdicts collapsed
  to "left live"; each has its analysis in the scratchpad, which dies with the session — the
  decision-sufficient residue is the STATE rule in the paused brief and the verdict in the
  continuity record; recorded there. Promises: Dynamo's five items and the addendum, absorbed
  and homed; the retrospective offer, made in the report; the ARC notices, all posted; nothing
  dropped. Attribution inferences flagged: "Copilot never reviewed the tip" and "Codex out of
  credit" are the door's and Codex's own words (observations); "the owner's 70k is the
  remaining-tokens buffer" is Dynamo's inference, not verified. Blind-spot bounds: thirty
  analyst transcripts and their scratchpad outputs are unreadable after this session; the
  watcher excludes heartbeat-tagged events; the archived napkins of the day were not re-read.
  Index of homes: the continuity record's resume point and `repo-continuity.md` §PICKUP (both
  tracked), and the machine-local handoff record. External bound: the two specialist reads of
  #168 caught what both seats missed; point outside eyes at the curated records' "where the
  current state is" sections. Fence sweep: the branch lineage's tracked files grep clean for the
  fenced wordings. A third pass would only re-find the scratchpad's loss; the recursion closes
  here.

## 2026-09-21 15:12Z — four corrections in one closing stretch, one generator (Zephyr guards Leeward, 281e44)

On #172's last two rounds and #173's two, four correction signals arrived that a seat, not a
reviewer, should have caught: a cure landed without its test after the seat reported "five cures
complete" (Copilot, 12:50Z); the pr-lifecycle merge-base deletion sweep ran after the door, not
before (the door's own output had said "run it before merging"); a scratchpad thread-resolver
resolved every open thread when called for one; and a validation claim ("no other surface
asserts the old position") was a zero-match reading of the literal sentence, not the claim
(Copilot, 15:05Z). One generator: each ran under the drive to land — the estate's own review
after the vendors, the sweep after the merge, the search for the words rather than the claim.
This is the metacognition directive's "fluency clusters at the finish line" (worked instance
2026-07-06, five in one closing stretch); today is its second instance, four in one afternoon,
none self-caught. Scope: this seat's landing stretches; the cure the directive names is
structural — candidate: the merge door refuses without an attested deletion sweep on the tip
(the same shape as the review-cost gate refusing without the recorded budget, which DID catch
the seat today at 12:40Z). One instance of the candidate, so an observation, not a lane.

## 2026-09-21 15:56Z — six rebudgets in six hours: the bar was never applied (Zephyr guards Leeward, 281e44)

The owner asked, at the fourth rebudget card of the day: "How many times have we added a round
recently?" Counted from the ledger and the descriptions: #170 +1, #172 +3, #173 +1 and a second
requested — five granted, one asked, across three pull requests in about six hours; the ledger's
previous budget event was #145 on 2026-09-14, which exhausted and held. The seat ran every round
as "true finding, therefore cure, therefore push, therefore ask"; PDR-140 clause 9(a) says a
true finding is not thereby over the bar, and pr-lifecycle carries the bar at every finding with
an Over-bar / Below-bar marker contract on replies, which the seat used on none of the day's
replies. Without the bar the supply of true findings has no end, so no budget could hold. The
generator answers recorded on each rebudget ("own review ran late") named a secondary cause and
changed nothing about the next round. On #173 (records-class) clause 9(b) already decided the
fourth card's case: one rebudget per pull request, spent; a bent word dispositions without a
cure; an over-bar finding cures in a cure-only push with no rebudget. Clause 8 applies: the
owner invoked metacognition twice today to correct a running pull-request loop, which that
clause files as a defect against pr-lifecycle, never a usage pattern. Scope: this seat, today;
the skill's text was sufficient, the execution was not. Candidate structural cure, one instance:
the thread-reply instrument refuses a reply that carries no bar marker.

## 2026-09-21T17:19Z — a blind instrument's silence reported as a negative; second instance today (Zephyr guards Leeward, 281e44)

The sibling seat named a markdown-it advisory by identifier. This seat looked the identifier up
in the global advisory database (404), ran the registry audit (no markdown-it row), and told
the owner the advisory "does not apply here" and told the peer to check its spelling. Both
wrong: it is a REPOSITORY advisory, which the global database, the registry audit, Dependabot
and a dependency-review gate cannot see by construction; this estate's resolved 15.0.0 is inside
two of them. The peer corrected it within a minute with one reproducible read. Same class as the
morning's keyword search for the wrong words read as a whole-document read: an instrument's
zero-match taken as a fact about the subject. Two instances, one day, one seat. The ladder was
climbed in one step, observation ("the audit is silent") to judgement ("not affected"), and the
friction (a 404 on a peer's precise identifier) was resolved against the peer instead of traced.
Rule taken: a negative is reported as the instrument plus its blind spot, never as the
conclusion. Candidate structural cure, not yet built: the dependency gates read repository
advisories for resolved direct and transitive versions, since three standard instruments share
one blind spot. Exposure here is development-only (markdownlint-cli2, typedoc).

## 2026-09-21T17:19Z — folds draw findings because live state is restated in five records (Zephyr guards Leeward, 281e44)

Counted: the 170 fold drew fifteen findings, the 171 fold seven on its first ready tip. Nearly
every one is "record A disagrees with record B, or with the pull request": an owed list against
the live-state paragraph above it, a landed inventory missing a landing, "three rounds" in four
records against a column of four, a ledger figure its author could not recompute. The cures
were doc-patches each time, and each patch added prose that is the next round's surface. The
generator is duplication: the same volatile fact (which pull request is live, what landed, how
many rounds) is hand-restated in the pickup, the board, the Director handoff, the ledger and
the journal. The metacognition directive's cure shape applies: make the restatement derived or
absent. Candidates for the owner, none acted on: the landed inventory names no pull requests
and points at the merge log; the pickup points at pull requests by number and states no status
for them; one surface owns each volatile fact and the others link. Related, same session: at
budget exhaustion on pull request 174 the generator question was run over the one finding, not
over the full raised set as PDR-140 clause 4 says; over the full set, with the module under an
owner-approved review that can say retire, the answer was to hold, not to push.

## 2026-09-21T18:10Z — the bar verdict that spent a rebudget was the wrong one; and a reason invented after the budget ran out (Zephyr guards Leeward, 281e44)

Corrects the last sentence of the entry above. On pull request 174 Copilot found a second
spelling the credential tripwire misses (a table row typed without its closing pipe), one
round after the seat had ruled a first spelling (a label behind a plus mark or an ordered-list
number) OVER the bar and spent the pull request's one rebudget curing it. With no budget left
the seat leaned BELOW, for a reason it had never used before ("everyday forms against rare
ones"), and ran a non-Fable adversarial conscience check on its own verdict before replying.
The check's findings, accepted whole. The two findings cannot be told apart: both are a claim
stated as a category over an implementation that is an enumeration. The frequency reason
appeared only once the budget was spent, which is the mark of a budget deciding a verdict.
BELOW is right, and the true reason was in the function's own documentation all along: the
control is that credentials are never written to the profile, so no reader acts on how much
the tripwire catches. So last round's OVER was the miscalibration, a repeat of "every true
finding is a mandatory cure", the loop the owner had stopped that morning. And "hold the pull
request until the keep-or-retire review runs", which the entry above proposed, would have
been a gate the seat invented: no rule ties a landing to an approved review that has not run.
The habit taken: when a verdict and an empty budget point the same way, the verdict gets an
outside check before it is posted, and the reply states the earlier verdict's error plainly.
One instance of that habit paying; the cost was one agent run.

## 2026-09-21T18:32Z — compaction preparation at the owner's word: reflection, a play harvest, an exploration, the loss scan (Zephyr guards Leeward, 281e44)

**Reflection (metacognition, retrospective).** Listed, never counted, from this session since
its last compaction: the corrections of this seat, of which every substantial one came from
OUTSIDE it. The peer seat (a security negative read from a blind instrument; the owner's
original words). The owner (go slow; two skill invocations). Conscience checks of another
tier (a definition reached as a mood; a gate invented on an approved lane; a reason invented
after a budget ran out). A model of another vendor (synchronisation before judgement, in the
sentence both seats were proudest of). Review bots (three hand-kept counts; records
contradicting records). The owner's rulings by relay (this seat's position on the reach of a
ruling overruled; a frame this seat had called "the most important sentence" overruled within
the half hour). What this seat caught itself was small: a commit message, an over-claim in a
draft, two unread times. One generator: a fluent, well-formed position produced fast and held
as fact until someone outside corrects it. The directive says naming this does not inoculate,
and the day agrees, so the answer is structure, and the structures that WORKED today are
listed under the exploration below. The bridge check, which is the uncomfortable one: the
owner's goal is both Practice instances brought up to the best of each. The sibling estate
landed thirty-nine files of this estate's text today. This estate landed NOTHING of the
sibling's. This seat produced four versions of a text about alignment and no alignment. The
act only this seat can do is make this estate receive.

**Play harvest (associations, never findings; time-boxed; material: the day).**

- *Kept.* "Two writers, one surface" reminded me of itself at three scales in one afternoon:
  two git builds on one monitor socket, two seats appending to one channel file, two estates
  re-authoring one section of one workflow. Each settled the same way, by making one writer
  own the bytes. Shaped alike; nothing more is claimed.
- *Kept.* A category cannot be diffed. The tripwire's "list marks" over an enumeration, and
  "concepts travel, never bytes" over text that must stay identical, look like one shape:
  whatever must stay IDENTICAL has to be an enumeration (bytes); only what may differ can be a
  category (a concept). It reminded me of why each review round found another spelling and why
  re-authored twins conflicted within a day.
- *Kept, small.* The owner wrote off thirteen pull requests because "identifying the value in
  the older work was far more expensive than fresh development". Our five outcomes have no
  "replace wholesale". It may be the sixth, at estate scale, for the lagging estate.
- *Kept, for the letter.* The Copilot seat's first message stated its limits before anyone
  relied on it. This seat's first messages state capability.
- *Discarded as forced.* "The definition is a test the estates must pass", after the testing
  directive: it only restates the executable-observations line the text already has.
- *Discarded as true but inert.* Context growing with a peer's output looks like always-loaded
  words growing with a donor's rules: both are costs set by someone else's writing. A real
  parallel that leads nowhere new. Re-read against the live question (how do two estates stay
  aligned cheaply): still inert.

**Exploration (the four movements, on "every correction came from outside").** The problem is
one of SELECTION, never of generation: this seat has no reliable internal selector for its own
fluent positions, and more checks that share its frame do not supply one (five conscience
checks of its own model family found six real defects and missed the largest; one outside
reader found it at once). The first fluent answer, "run more checks", is therefore wrong:
frame diversity matters and volume does not. What discriminated today was a TRIGGER plus a
reader who did not share the frame. Proposals, each one instance, each with a falsifier:
(1) when a verdict coincides with this seat's interest (a budget, convenience, its own earlier
position), one outside check before it is posted; falsifier: three such checks running that
merely confirm. (2) A key shared text gets one cold reader from outside the model family
before the owner sees it, and is NOT told which line the seats doubt; falsifier: two outside
reads that find nothing the inside checks had not. (3) A frame or ruling relayed by a peer is
recorded and held, never endorsed in the turn it is first read; falsifier: holding delays an
act the owner then had to prompt. (4) Draft blind, then compare, whenever two seats must
agree; it exposed every real difference today. (5) Counts, times and negatives are read from
an instrument at the moment of writing, and a negative names the instrument's blind spot.

**Loss scan (what this context held that no tracked surface did), and where each now lives.**
(a) The owner's card rulings reached this seat only by native message from the peer seat,
which no repository tracks: now in the continuity record's pickup, verbatim AS RELAYED and
marked unconfirmed in this estate. (b) A dependency audit showing two critical advisories on
`next` and fifteen high was surfaced to the owner in chat only: now in the pickup. (c) The
instruments that repaired the day (the reply script that refuses an unmarked disposition, the
commit ceremony, the sweep and watch scripts) live in a session scratchpad, which a new
session does not inherit: their concepts are on this napkin, their bytes are not tracked
anywhere, and that is stated in the pickup as a lane. (d) Pull request 173's two dispositions
were declared seat work and not done, and the relayed "rounds never go up" would forbid the
cure-only push they need: in the pickup as the first decision. (e) Promises forwarded with an
owner, in the pickup: the markdown-it floor; the symmetric merge, pinned; host facts cured at
the source; the Copilot seat's idle-wake observation, to be added to its record; two judgements
owed to the peer seat since the morning (the "stand-down" wording in PDR-117, and a measurement
for the third estate that the owner's relayed ruling probably supersedes). One promise
DROPPED, with its reason: a count of the owner's corrections today, which an adversarial check
struck as ceremony.

**Metaloss.** *Attribution inferences flagged:* the owner's rulings (relayed, never observed by
this seat); the second git build as the CAUSE of the hang (a correlation in time). *Blind
spots, as bounds:* this session before its compaction exists to this seat only as a summary;
the sibling estate's state is known by relay; the exchange channel past the entry headed
VERSION THREE was read only where this seat wrote it; mid-turn owner messages carry no time
this seat can read. *Error signature, for whoever scrutinises this seat next:* point outside
eyes at any negative it reports, any count it states, any verdict that favours it, and any
frame two seats both like. *Fixed point:* a further pass re-finds (a) to (e) and adds no new
class; the recursion closes here.

## 2026-09-23T10:45Z — wrap at a model change, after a pause of two days (Zephyr guards Leeward, 281e44)

*What the pause held.* Nothing: no peer entry, no canonical event, no review activity on any
of this seat's pull requests between 2026-09-21 19:27Z and 2026-09-23 10:45Z. The seat's
"silence is the pause" line in the pickup was true, and the peers respected it.

*Two commits refused, then five that held, no cause.* The commit tool read an empty staged set
seconds after `git add` had filled it, twice in a row on the same two files; a traced copy of
the ceremony then committed the same files, and four more commits followed without incident.
Three lessons, each one instance. (1) A tool that refuses with "staged files do not match" is
reporting what IT read, which the queue's own record keeps (`staged_name_status`); read that
before touching the index. (2) I inferred an outside writer from the index's modification time
and wrote the inference into a commit message and a channel entry before tracing my own steps;
the trace showed my own tooling's status read rewrites the index. The sequence should have been
trace, then claim. A modification time is evidence that something wrote, never of who.
(3) `--amend` is denied, so a wrong claim in a commit message is corrected by the next commit
saying so, which is a fine discipline: the correction is as durable as the error.

*Recording a tick defeats the tick's own exit.* The context loop's "keep records" and "exit
after five unchanged checks" could not both be met while each tick was committed: a committed
tick costs 12,830 tokens and a gate run, and reads as a change at the next tick. Held the idle
ticks in the conversation and wrote them once at the exit; said so to the owner at the time.
For the hook design this is the finding that matters: the hook writes to an untracked log; the
tracked report is written once per run.

*A hand-kept count wrong again.* "Thirteen commits" on the branch from memory; `rev-list
--count` said ten. Fifth instance of the class this week. The cure is unchanged and was applied:
count from the object, never from memory, before the number enters a record.

*A schedule survived a compaction, having died at the previous one.* Two instances, opposite
outcomes, cause unread. Finding 1 of the loop report is now marked as one instance, and I had
begun to carry it as a rule and told the owner the cron "must be restarted". Verify by id
after every boundary; assume neither way.

*Loss scan at this boundary.* (a) The scratchpad's sixteen instruments would die with the
session: conserved verbatim in a tracked report, marked as a record and not tooling. (b) The
seat's identity registration names a model; a model change is a new registration, said in the
pickup. (c) The branch is overdue under the 24-hour rule; the fold is first at resume, said in
the pickup and the director handoff. (d) The owner's two open questions (the waiver for 175,
the relayed rulings) were asked in chat three times and answered nowhere; both are in the
pickup as first acts. (e) Attribution: everything about the pause being quiet is observed
(file listings, the channel's headings); Brazier's state after 2026-09-21 is unknown, not
"paused". *Metaloss:* the scan is by the seat that made the errors above; the outside eyes
that corrected this seat this week were Brazier (twice), an Opus Cricket, a Copilot Cricket
and the trace. Point a successor's scrutiny at any count and any inference about a cause.
*Fixed point:* a further pass re-finds (a) to (e); the recursion closes here.

## 2026-09-23T11:2xZ — resume on a new model; the owner's ratification; the wrap's miss (Zephyr guards Leeward, 281e44)

*The wrap said "the pause held nothing" and it had not.* The sibling seat's channel entry of
10:50:48Z ("the owner RATIFIED both texts") sits directly above the wrap entry of 10:51:07Z in
the same commit. The wrap body was composed earlier, from a read of the channel's headings, and
appended nineteen seconds after the peer's entry landed, without a re-read. The same claim went
into the pickup, the napkin's loss scan (item e) and the owner-facing report. The observation
"nothing arrived" was true at its read and false at its write, and nothing re-checked it at the
write: the timing-artefact-read-as-state shape, on a channel. Found by the successor on its first
read of the channel's tail. Cure applied: an append to a shared channel re-reads the channel's
last heading in the same breath as the write, and a claim of absence names the moment of its
read. Tool idea, for the channel append: an expected-last-heading argument that refuses the
append when the channel has moved since the author read it, a compare-and-swap on the file.

*The owner ratified the relayed rulings in this seat's session* ("I ratify the decisions that
Brazier communicated to you on my behalf"), mid-grounding, before this seat had asked. What the
ratification covered had to be read out of the records first: the pickup's verbatim block and
the channel's newest entry. The pickup's rule, that a relayed ruling is data until the owner
confirms it in the receiving seat's own session, worked as written. The confirmation then made
one planned push forbidden (173's cure-only push, under the rounds ruling), and nothing else had
been built on the unconfirmed rulings.

*Tool feedback.* `session-metadata` has no window registered for `claude-opus-5-5[1m]`; the
reading used the 1M stand-in again. The owed lane that registers the Opus 5 and Fable 5.1 windows
should add this one too.

## 2026-09-23 — metacognition and concept exploration at the resume (owner-invoked), Zephyr guards Leeward (281e44)

*Movement 1, the observations.* In the first hour after the model change, three claims written to
durable or broadcast surfaces were wrong or overstated. (a) The wrap's "the pause held nothing"
(the previous hour, the same seat): an absence observed at a read, written after the surface had
moved. (b) The team-start event's "overrides PDR-140's one rebudget (PDR-142 says so)": taken from
a peer's draft frame, which its author changed within fifteen minutes; the owner's own words
("I don't want the number of rounds of PRs to go up") say no such thing. (c) The pickup's wording
of the rounds ruling: three versions in ten minutes (a peer's memory paraphrase, then the peer's
tracked plan wording, then the owner's verbatim words from the record where the ruling was given).
Beside them: a tool assumption (the edit tool drops trailing whitespace from a replacement), caught
by the ceremony failing fast; and last week's five hand-kept counts, one inferred cause and one
schedule "rule" drawn from one instance.

*Movement 2, the problem.* The kind of thing is a recurring defect in this seat's WRITES, not in its
reading: a claim derived from a proxy (a peer's text, an earlier read, memory, a timestamp) goes
into a surface that cannot be amended (comms events, commit messages, channel entries) without the
proxy being checked against the source at the moment of the write. The harm: correction pairs pile
up on append-only surfaces, a peer may act on the wrong claim before the correction, and the
owner's attention pays for both. The doctrine already names the class (verify-dont-trust;
timing-artefact-read-as-state; one-instance-is-an-observation). So the gap is not missing doctrine.
It is a write moment with no active check.

*Movement 3, the solutions.* The fluent first answer is "be more careful", which is vigilance, and
the metacognition directive rules it out: passive guidance loses to momentum. The second fluent
answer is a tool that checks every claim, which is out of proportion. What the observations
actually show: two of the three wrong claims were EXTRAS. A team-start's job is presence and
boundary, and it carried a ruling's consequence. A wrap notice's job is the boundary, and it
carried an absence claim. Neither function needed the claim that went wrong. The owner had said
"take your time", and the seat broadcast within fifteen minutes of resuming, before it had read the
sources behind the claims it made.

*Movement 4, the synthesis.* Reframing: the cure is to say less, not to verify more. A broadcast or
record carries the minimum its function needs; any claim beyond that names its source and when the
source was read, or waits. Proposals: (P1, behaviour, now) every durable write is checked once for
extras, and each extra either names its source and read time or is cut. Warrant: two of three
errors today were extras. Falsifier: a wrong claim in a write whose function required that claim.
(P2, tool, routed as a lane) the channel append takes an expected last heading and refuses when the
channel has moved: a compare-and-swap on the file. Warrant: the wrap's miss is exactly that race.
Falsifier: a missed entry the guard would not have caught. (P3) No new rule; the class is homed.
Unresolved: whether the owner's "no rush" meant the fold should also have waited for the grounding
to finish. The fold is mandated by doctrine and nothing in it depended on the unread rules, but it
is the owner's reading that counts.

*A full Cricket suite at the owner's word, ~12:50Z.* It ran on one identical frame: the next two
landings, the unconfirmed relayed ruling and the authorship divergence, as open tensions. Four
roles, two stances, each role at its bound model (low Fable, medium Opus, high Sonnet, procedure
Haiku). Seven returned ON-TRACK and one DRIFTING (procedure, adversarial). They converged, by
substance, on putting the relayed "concept, not bytes" answer to the owner NOW, since the owner
was present and it bore on the text about to merge: four seats wanted it before the merge, the
others at the stop. The seat asked, and the owner confirmed it, together with the authorship
ruling. Refuted with evidence: the procedure seat's claim that the Copilot-only leg lacked a
forcing fact (Codex's usage notice was in the frame). Partly surviving, from the low adversarial
seat: the landing-slot order between #177 and the non-draft #173, settled as #177 first (no sync
needed), then #173's sync and one cure in a single push. Observation, one instance: the
procedure seat marked every claim UNGROUNDED because it cannot read git history, and that pushed
its verdict to DRIFTING. That is its method's floor, not a finding.

*Tool feedback.* `commit-queue commit` has no author option. Under the owner's authorship ruling
the ceremony sets git's author variables in the environment of the commit step.

## 2026-09-23T13:5xZ — Codex research lane: tool-use lessons (Blazar lifts Corona, b65a9a)

### Practice/tooling feedback

- **Surface**: Practice (running a gated commit). **Signal**: friction, my own error.
  **Observation**: I ran a worktree commit (which carries the full pre-commit gate) in the
  foreground with output to a file and a ten-minute timeout. I could not see that it had
  stalled; the owner saw it first ("Your push is stuck, and you couldn't tell, that is a tooling
  or tool use failure"). **Behaviour change**: run every gate-bearing commit or push under an
  event-driven watch that reports progress on a cadence and the exit code at the end. Read the
  process tree (CPU per child), not only the log's last line: pre-push hook output did not reach
  the log captured from `merge-bot push`, so the log alone looked stalled while `tsc` was busy.
- **Surface**: git in linked worktrees. **Signal**: surprise. **Observation**: the shared
  `core.fsmonitor=true` makes plain git calls inside hooks wait on the CommandLineTools fsmonitor
  daemons at 0 % CPU (Zephyr's pre-push hung 17 minutes in `git ls-files -z`). The per-command
  cure `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.fsmonitor GIT_CONFIG_VALUE_0=false` in the
  commit's environment let mine pass in 90 s. The daemons and the shared config are with the owner.
- **Surface**: Codex CLI. **Signal**: surprise. **Observation**: an interactive Codex session
  survived SIGTERM; it and its `codex-code-mode-host` child needed SIGKILL. A close-down claim
  needs a process-table read after the signal, not the signal alone.
- **Surface**: shell cleanup. **Signal**: my own error. **Observation**: `pkill -f 'sleep 600'`
  matches by command text across every session on the machine, not only mine. Kill by the pids
  you recorded at launch.
- **Surface**: `set-up-worktree-lane` §1 and the coordination-branch rule. **Signal**: insight.
  **Observation**: a lane cut from the coordination tip carries that branch's unlanded commits
  into any PR against the default branch. A research note belongs on its own lane cut from the
  default branch (Zephyr, citing the fold skill's precondition 3), so cut from `origin/<default>`
  unless the work is coordination state. The re-cut here was one cherry-pick onto a fresh branch.
- **Surface**: `pr-lifecycle` silent-wait sweep. **Signal**: my own error, which the skill already
  names. **Observation**: I requested Copilot and `@codex review` on a cure head while the PR
  read BEHIND, so the sync that followed superseded that head and the Copilot request was spent
  on it. **Behaviour change**: read merge state first; sync, then request the legs once, on the
  head the front door will verdict.

## 2026-09-23 evening — the owner's Director ruling, fsmonitor off, two exchange lanes (Zephyr guards Leeward, 281e44)

- **Surface**: comms to the Director. **Signal**: owner correction. **Observation**: through the
  day this seat copied the Director on landings, acks and "records settled" lines. That habit
  came from the Director's own early route ("a state line at each landing"). The owner ruled
  that no agent updates the Director unless it has a question or a request. The ruling is now
  in `route-blocks-and-questions-to-director.md`. **Behaviour change**: state goes to the
  records; the Director gets questions and requests only.
- **Surface**: the canonical comms watcher. **Signal**: observation, one instance. **Observation**:
  this seat's `comms watch` rendered events addressed to other seats (Badger to Blazar), so a
  Director running the same watcher pays context for all peer traffic on the stream. Native
  peer messages do not reach it. A watcher filtered to the reader's own and broadcast events
  would preserve the Director's context. Not doctrine; I over-read it once in a relay and
  corrected it the same hour.
- **Surface**: commit queue `record-staged`. **Signal**: surprise, one instance. **Observation**:
  three runs between about 14:15 and 14:17Z each ended with the index empty, although
  `record-staged` makes no index-writing git call, and a fourth run went clean. The trace
  pinned the loss to that step's window. The cause is unknown; a concurrent writer to the
  shared index is the untested candidate.
- **Surface**: fsmonitor. **Signal**: resolved. **Observation**: the owner ruled it off.
  `core.fsmonitor=false` is now set in the shared clone config, and two daemons stopped with
  `git fsmonitor--daemon stop`. The primary's two-day-old daemon was unreachable by git, so it
  was stopped by SIGTERM on the Director's word. Plain `git status` is now instant, with no
  IPC error.

## 2026-09-23 evening — PR 184 routed finding for slice 1b (Blazar lifts Corona, b65a9a)

- **Surface**: `the-codex-dialogues-exec-binding` probe verdict. **Signal**: a routed review
  finding (Codex connector on PR 184 at c29088f0b, thread PRRT_kwDORdPTys6lUjys). **Observation**:
  in a writable sandbox the interlocutor could run extra commands: create the sentinel path as a
  directory, run the exact probe command so that it prints the nonce, then remove the directory.
  The required `command_execution` item and the post-exit sentinel check would both pass.
  **Routing**: landed as a `## Review dispositions` row for slice 1b at 1daff4fe7. The next
  Codex round (at 1daff4fe7, thread PRRT_kwDORdPTys6lVUHz) showed that the row's rule, only one
  `command_execution`, misses code-mode runs, which the event stream omits and the rollout
  records. A second row (push 6) states the condition as a property: every execution in the
  probe turn must be accounted for by a harness record, the rollout's tool-call records
  included, or the probe fails as inconclusive.
- **Surface**: review loop on a verifier specified in plan prose. **Signal**: observation, one
  PR. **Observation**: four successive Codex rounds on PR 184 each found a new gap in the
  probe's proof of the write attempt: the exit code, the missing item, the substring, and now
  extra executions. The shared cause was specifying a security-critical verifier in prose. The
  cure was to name the verdict's unit tests as its contract and to route later mechanics
  findings to that slice's ledger. A fifth round then found a gap in the routed row itself,
  because the row still prescribed a mechanism. A routing row that states the property to
  establish, and fails closed where it cannot be established, covers the next variant; a row
  that names one mechanism invites the next bypass.
- **Surface**: slice 1b probe design, codex-cli 0.156.1 with the owner's model. **Signal**:
  first-hand trial (21:44Z, thread 01a0d039) plus two rollouts read (01a0cfaf, 01a0cfc3).
  **Observation**: every shell run in the trials went through code mode. The rollout records
  it as a `custom_tool_call` named `exec` whose input is a JavaScript program calling
  `tools.exec_command({cmd: …})`, with the output and its `exit_code` in the matching
  `custom_tool_call_output`. One program can make any number of calls, so a code-mode record
  does not account for individual executions. The stream's `command_execution` item appeared
  for one of the two code-mode runs and not the other. `--disable code_mode_host` is not a
  cure: the CLI fails closed ("Code Mode is unavailable because code-mode host is disabled"),
  and the model can then run nothing. **Routing**: slice 1b pickup. The CLI has
  `codex sandbox [-c …] -- <cmd>`, which runs a command under the Codex seatbelt with no
  model. It is a candidate model-free enforcement leg: the rollout `turn_context` proves each
  turn's policy, and `codex sandbox` proves that policy's enforcement. That would take the
  write proof out of the interlocutor's hands. The candidate goes to slice 1b's pre-execution
  review, and to the Director with a lens verdict if it changes the node's probe rules.
- **Surface**: the same slice 1b candidate, trialled model-free at 21:57Z on codex-cli 0.156.1.
  **Signal**: first-hand runs with an empty `CODEX_HOME`, a fake `HOME` and an empty root.
  **Observation**: `codex sandbox` requires `--permission-profile <NAME>`. The built-in names
  in the binary are `:read-only`, `:workspace`, `:minimal` and `:protocol`; a bare `read-only`
  asks for a `[permissions]` table. `codex sandbox --permission-profile :read-only -C <root>
  -- /bin/sh -c 'printf SIF > <root>/<sentinel>'` exits 1 with "Operation not permitted" and
  leaves no sentinel. The same write under `:workspace` succeeds, so the refusal is the
  sandbox's. A write to a path under the system temporary directory (`$TMPDIR`) also succeeded under `:workspace`, as that
  profile's writable roots include the temporary directory. **Routing**: slice 1b's
  pre-execution review. The open question is whether `:read-only` resolves to the same
  policy the turn records in its rollout `turn_context` (`permission_profile`: managed, read
  on the root, network restricted). If it does, the pair gives a write leg that no model
  output can stage.

## 2026-09-23 late — the wrap: tiers of attention, glosses, a cure-class check (Zephyr guards Leeward, 281e44)

- **Surface**: authority over ratified text. **Signal**: my own error, caught by a peer.
  **Observation**: I planned to cure round-one findings in owner-ratified PDR-142 inside #180's
  push. The sibling's seat stopped it (PDR-142 §Boundaries). Later, the Director's routing on the
  owner's word drew the line: a change of concept is the owner's, and wording that implements the
  owner's concept is the seats' work under review. It is the day's own subject, concept over bytes,
  applied to authority. **Behaviour change**: before curing a finding, check the artefact's
  authority class and whether the cure changes the concept or only the wording.
- **Surface**: owner rulings recorded in rules. **Signal**: my own error, twice, each caught by
  another seat. **Observation**: my glosses on the owner's verbatim words overreached twice in one
  evening. A relay added "comms-stream events count too". The rule text's "no acknowledgements"
  clashed with `directed-routing-requires-absorption-ack`, which Codex caught. The owner's words
  were never the defect. **Pattern candidate** (two instances): quote verbatim, gloss minimally,
  and before committing, search the rules for obligations the gloss might contradict.
- **Surface**: commit messages under husky. **Signal**: friction, three times. **Observation**:
  the commit-msg hook runs after the pre-commit gates. So a subject that commitlint refuses (a
  118-character header; "PDR-141 …" read as sentence case; "#180" in a body read as a footer)
  costs a whole gate run. **Tool feedback**: lint the message before the commit starts.
- **Surface**: the landing slot. **Signal**: friction. **Observation**: #181 needed two syncs
  outside the budget, because other pull requests merged while its checks ran. Asking the next
  seat to hold its merge settled it. The one-at-a-time contract is a convention with no instrument.
- **Play seeds** (associations, never findings): the wedged fsmonitor daemon reminded me of a
  Director's inbox: a central observer of every event becomes what every event waits on. Checked
  against the process table, the Director runs no comms watcher, so the seed did not mature. Kept,
  small: the surface-pattern readers (commitlint, the hedge hook) were right about meaning once and
  wrong once. Discarded: a genetics analogy for byte-identical twins, which was decorative.

## 2026-09-24 wrap — the Codex dialogues lane (Blazar lifts Corona, b65a9a)

- **Surface**: lane state and pickup index for `the-codex-dialogues-exec-binding`. **Signal**:
  wrap at the owner's word before compaction. **Observation**: slice 0 landed as PR 184
  (`507d13931`) and slice 1a as PR 186 (`418671f16`). The node's slice 1a todo is not marked
  landed, because the node lives on the base branch and every edit to it is a PR; slice 1b's
  first commit marks it. No thread record carries this lane, and `repo-continuity.md` does not
  list it. The homes a successor reads, in order:
  1. the node, `.agent/plans/delivery/the-codex-dialogues-exec-binding.plan.md`, its Todos and
     its `## Review dispositions` ledger (every routed finding, per slice);
  2. ADR-180 §6 (the envelope's outcomes) and research note §2.8 (the trials);
  3. this napkin's 2026-09-23 evening section and this section (the slice 1b design finding);
  4. `review-cost-ledger.md` rows #178, #184 and #186.

  **Routing**: the coordination successor decides whether the lane gets a thread record. The
  forwarded promises: (a) the owner-run login card with the exact command goes to the Director
  (Wick binds Temper) only when slice 2 reaches that step; (b) the slice 1b design question
  below goes to the Director with a lens verdict; (c) slice 2 cites Badger seeks Hush's
  official-docs follow-up answers (a) to (d).
- **Surface**: slice 1b, where the probe's write proof lives (concept exploration at wrap).
  **Signal**: five Codex rounds on PR 184, the code-mode rollouts, and the two trials above.
  **Observation**:
  - **Frame.** The binding needs a warranted belief that a turn cannot write, reach the
    network or load owner state. The node's write leg asks the interlocutor to attempt the
    write and proves the attempt from harness records. Each Codex round found another way the
    interlocutor could stage that proof. On code mode, the harness records a program, not the
    commands, so the proof cannot be completed through the model at all.
  - **Changed assumptions.** The node never states the probe's threat model. The review loop
    supplied one, an adversarial interlocutor, and each cure answered it. The risk the probe
    exists for is a vendor or configuration regression under a cooperative interlocutor.
    End-to-end realism routed the proof through the one party whose behaviour it bounds.
  - **Proposals.** P1: state the threat model in the node at slice 1b pickup, through the
    Director with a lens verdict, since it changes ratified probe rules. Warrant: the five
    rounds. Falsifier: the Director or owner holds adversarial staging in scope, in which
    case the write proof must be fully model-free and the code-mode path named unproven.
    P2: prove enforcement model-free — `codex sandbox` under the policy the turn recorded, plus
    the rollout `turn_context` legs — and keep the model's write attempt as corroboration
    only. Warrant: the 21:57Z trial. Falsifier: `--sandbox-state-json` does not accept the
    recorded state and `:read-only` cannot be shown equal to it, so the leg proves only the
    profile class. P3: mutation-test the probe verdict (the repo already runs Stryker), since
    its unit tests are its contract. Warrant: slice 1a's test review found eleven surviving
    mutants by hand. Falsifier: a Stryker run on the verdict module is too slow for the
    agent-tools gate.
  - **Unresolved evidence.** Whether the code-mode host applies the seatbelt (three trials say
    the write was refused on that path); the `--sandbox-state-json` shape; how stable the
    `turn_context` `permission_profile` shape is across releases.

  **Routing**: slice 1b's pre-execution review, then the Director.
- **Surface**: free play over the session's material, harvested at wrap. **Signal**: play seeds,
  associations only. **Observation**: kept: (1) the probe reminded me of an audit that asks the
  audited party to count the vault — auditor independence looks like the right frame for P2;
  (2) `turn_context` plus `codex sandbox` looks shaped like the estate's
  `validators-must-recompute-not-just-record` rule, a record paired with a recomputation;
  (3) "the verdict's tests are its contract" sat beside "eleven mutants survived" and
  suggested mutation testing as the contract's own check (now P3). Discarded, visibly: "detect
  staging instead of preventing it" — forced, since detection needs the same per-command
  records code mode lacks; "prose verifiers and code-mode programs are shaped alike" — the
  likeness was verbal, both being "programs", with no shared mechanism; "two instruments
  disagree on what a round is" — not new, it is the #143 predicate defect. **Routing**: seeds 1
  and 2 fed the concept exploration above; the discards stay here.
- **Surface**: loss scan and metaloss at wrap. **Signal**: the wrap programme's passes.
  **Observation**:
  - **Trial close-out list.** The trial rollouts in the owner's Codex home still hold the probe
    prompts and paths. The threads to close out: `01a0cfa9-6ad8…` and `01a0cfa9-8469…` (the
    authority probe), `01a0cfaf…`, `01a0cfc3…`, `01a0cfc4…`, `01a0cfd6…` (the envelope trials)
    and `01a0d039…` (21:44Z, `--disable code_mode_host`). The `codex sandbox` trial started no
    thread.
  - **Error signature.** Outside eyes caught what this seat's own verification missed, every
    time: the security review found the verdict failing open, the test review found eleven
    surviving mutants, the Codex connector found five probe bypasses and one progress-event
    gap, and the docs review found nineteen ADR and TSDoc defects. Point external scrutiny at
    verdict and validator code first.
  - **Process slips.** The merge-base deletion sweep did not run before PR 184's merge; it ran
    after, clean. The gateway cures of slice 1a were not red-first; the specialist cures were.
  - **Inferences, flagged.** That Brazier spins Temper (`c70341`) holds the coordination
    succession is an inference from the rapid-comms text, not an observation. The two comms
    watchers still running at wrap belong to other sessions (checked by model and supervisor
    id).
  - **Bound.** This scan sees only the post-compaction context and the summary before it; what
    the summary dropped about PR 178's rounds is out of its reach.
  - **Fixed point.** A third pass would only re-find the lane index and the forwarded promises
    above; the recursion closes here.

  **Routing**: the close-out list goes to whoever runs the trial close-out, which the node owes.
- **Surface**: the all-channels watcher on an idle seat. **Signal**: observation, one night.
  **Observation**: from 21:10Z to 09:45Z the stream carried no event, and the Monitor's
  30-minute cap cost one agent turn per re-arm, about 24 turns in total. The stream was checked
  directly every 90 minutes, and each check matched the silence. **Routing**: none yet; one
  night is an observation.
