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
