# A cron loop that prepares a seat for compaction: what a working seat measured

**Dates**: 2026-09-19 to 2026-09-20. **Author**: Zephyr guards Leeward (281e44), claude-code, a
one-million-token window. **Status**: one run, ended; the loop was not re-created after the
compaction of 2026-09-20 and the owner was not asked, so restarting or ending it is the owner's.
This is the tracked copy of a machine-local instrument log; the design, the frames and the
refutation conditions were the peer seat's (Dynamo turns Temper, 2a4c8a), whose record is also
machine-local. One seat, one run: every finding below is an observation.

## The owner's rules for the run

Check the context figure every five minutes. At or above 70 %, run the preparation once
(metacognition, free play, concept exploration, wrap); the loop is then complete until a
compaction is observed, when it starts again. Five consecutive no-change checks end the loop (a
safety valve). Auto-compact was set at 80 %.

## Findings

1. **The cron did not fire while the seat worked.** A scheduled job fires only when the session
   is idle, and a working seat's turns ran back to back, so the seat took its rows by hand. Idle
   is also when context is not growing. A hook on turn end, or on every Nth tool call, has no
   such gap.
2. **A working seat spent about 8,000 tokens a minute when it read large files** (41,496 tokens
   in five minutes, most of it one 440-line read). At that rate the 100,000 tokens between 70 %
   and 80 % are about twelve minutes, or three large reads.
3. **A read can be priced before it is made.** The reader refused a 280-line tail at 27,078
   tokens, and the refusal was the best sizing instrument of the session. A seat needs the cost
   of its next act as well as its level; this graduated into `consolidate-until-done` grounding
   step 7 (price the pass at open).
4. **A bare check cost about 900 tokens**, the same order as a heartbeat: about 11,000 tokens an
   hour for an idle seat, 1.1 % of the window.
5. **The safety valve could not tell "finished" from "waiting on a peer".** Four no-change rows
   accrued while the seat waited for a peer's gate run with a commit pending; a fifth would have
   ended the loop mid-task. A valve keyed on token delta alone reads a blocked seat as an
   abandoned one.
6. **The loop ended by its valve at 60.3 %, correctly, and the trigger never fired.** The seat
   had stopped at 60 % on its own pricing of the next acts, ten points under the trigger, so the
   run measured the observer and not the thing observed. A watcher re-arm plus two replies cost
   2,510 tokens and still read "no-change" under the 5,000-token line, so the line sits about
   right for housekeeping.
7. **The preparation's cost, run at the owner's word and not by the trigger (2026-09-20).** The
   three cognition passes written to the napkin, a wrap, one commit and one push: 16,440 tokens
   in about five minutes. A retrospective between two wraps (a ledger read, a 130-line report,
   two skill edits, a register row, a commit and push): 28,596 tokens in about seven minutes. A
   preparation of this shape fits the 100,000-token margin six times over, provided no large
   read is in flight when the trigger fires: one 440-line read costs more than the whole
   preparation.
8. **The first reading after a compaction is stale.** Straight after a compaction the meter read
   69 %, and one turn later 11 %: the latest usage line was the compaction call's own. The
   `directive-file-context-budget` rule carries this beside the meter command.

## Design of the next run

1. Trigger from a hook (turn end, or every Nth tool call), not from an idle cron.
2. Read the harness's own figure (the statusline's `used_percentage`) beside the transcript's,
   and skip a compaction call's usage line.
3. Trigger on the level plus the projected cost of the preparation (about 16,000 tokens; about
   45,000 with a retrospective), and do not start a read that would cross the line.
4. Give the safety valve a second input: a pending-work flag the seat sets, or an open claim.
5. Pre-register the outcome that matters: the resumed seat's first act is right with no owner
   prompt, against a compaction with no preparation as the control. "The preparation ran" is
   not the outcome.
6. Plan one run that deliberately crosses the trigger, so the preparation's cost and the margin
   to auto-compact are measured by the trigger's own firing.
7. Add a column the seat fills saying what happened in each interval, so deltas can be read.
8. Keep the results in a tracked report from the start.

## Log

| Time (UTC) | Context tokens | Of 1M | Delta | State | No-change streak |
| --- | --- | --- | --- | --- | --- |
| 2026-09-19T19:48:44Z | 517,360 | 51.7% | | first | 0 |
| 2026-09-19T19:53:44Z | 558,856 | 55.9% | +41,496 | changed | 0 |
| 2026-09-19T19:55:12Z | 580,995 | 58.1% | +22,139 | changed | 0 |
| 2026-09-19T19:59:58Z | 584,340 | 58.4% | +3,345 | no-change | 1 |
| 2026-09-19T20:04:48Z | 586,753 | 58.7% | +2,413 | no-change | 2 |
| 2026-09-19T20:09:27Z | 587,676 | 58.8% | +923 | no-change | 3 |
| 2026-09-19T20:14:13Z | 588,498 | 58.8% | +822 | no-change | 4 |
| 2026-09-19T20:18:58Z | 594,471 | 59.4% | +5,973 | changed | 0 |
| 2026-09-19T20:23:44Z | 597,572 | 59.8% | +3,101 | no-change | 1 |
| 2026-09-19T20:28:29Z | 598,367 | 59.8% | +795 | no-change | 2 |
| 2026-09-19T20:33:14Z | 600,877 | 60.1% | +2,510 | no-change | 3 |
| 2026-09-19T20:38:00Z | 601,696 | 60.2% | +819 | no-change | 4 |
| 2026-09-19T20:42:46Z | 602,508 | 60.3% | +812 | no-change | 5 (the valve ended the loop) |
| 2026-09-20T10:48:22Z | 605,849 | 60.6% | +3,341 | taken by hand | |
| 2026-09-20T10:53:09Z | 622,289 | 62.2% | +16,440 | the preparation | |
| 2026-09-20T11:00:27Z | 650,885 | 65.1% | +28,596 | the retrospective | |
| 2026-09-20T11:01:25Z | 656,313 | 65.6% | +5,428 | the second wrap | |

## The 2026-09-21 run (Zephyr guards Leeward, 281e44): a compaction crossed with the loop running

The column the earlier design asked for (item 7) is kept here. Times are read from the clock or
from a tool result; a time the seat could not read is marked as bounded.

| Time (UTC) | Context tokens | Of 1M | Delta | What happened in the interval |
| --- | --- | --- | --- | --- |
| about 16:44Z (recorded before the compaction; the exact read did not survive it) | about 631,000 | 63.1% | | a day of pull-request rounds, a plan, a three-leg design review |
| between 16:44Z and 16:55Z | | | | the context was compacted; the seat resumed from a summary |
| 17:13Z | 158,378 | 15.8% | about −473,000 | post-compaction work: two cures, two pushes, seven dispositions |
| 2026-09-21T17:35:14Z | 338,667 | 33.9% | +180,289 | a re-grounding at the owner's word (five long skill and directive files read end to end), then the opening of a two-seat definition exercise |
| 2026-09-21T17:39:54Z | 358,228 | 35.8% | +19,561 | two conscience-check verdicts received and posted verbatim with dispositions; one peer message; a watcher re-armed |
| 2026-09-21T17:49:32Z | 391,795 | 39.2% | +33,567 | three long peer entries read; the fold landed through the front door; the successor cut and its first commit. The row was written after the push exited: a tick that lands during a push's whole-tree checks cannot write a tracked file without racing them |

Findings of this run, each one instance:

1. **The loop did not survive the compaction.** Its schedule is session-only state; after the
   compaction the scheduler listed no jobs, and nothing re-armed it. The seat re-created it
   between 17:16Z and 17:17Z (bounded by the tool results either side, not read from a clock),
   some twenty minutes after resuming, only because it happened to list the jobs. The loop's own text
   says it "must start again" after a compaction; nothing makes that happen. A hook on
   session resume is the candidate instrument, which is what this experiment exists to inform.
2. **Re-grounding is the largest single cost after a compaction**: about 180,000 tokens in 22
   minutes, most of it four files read whole (the team start skill is over a thousand lines).
   A compaction that frees 470,000 tokens and a re-grounding that spends 180,000 of them is a
   net of 290,000. The trigger's arithmetic should price the re-grounding, not only the
   preparation.
3. **The outcome the earlier design pre-registered (item 5) can be read for this run.** The
   resumed seat's first acts were right on mechanical state (the fold, the two pull requests)
   with no owner prompt. They were NOT right on the governing text: the seat applied PDR-140's
   clauses from the summary for half an hour, recording a rebudget, until the owner invoked
   the team start and metacognition skills; re-reading the clause then showed the generator
   question had been run over one finding where the text says the full raised set. A summary
   carries state well and doctrine badly.
