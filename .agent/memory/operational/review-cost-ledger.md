# Review Cost Ledger

The record the review cost gate is calibrated against (`agent-tools review-cost`,
landed 2026-09-12 in PR #141 after PR #139 ran seven settlement pushes against a
declared budget of two). The gate's weights are an experiment, not a constant:
every session's wrap runs `review-cost survey --since <session start>` and appends
one row per pull request the session touched, with the seat's reading of where
the loop should have stopped and whether the gate's verdict agreed. The owner
corrects the readings; the weights (`DEFAULT_POLICY` in
`agent-tools/src/review-cost/cost.ts`) change only against this ledger, and every
change is a row in the changes table below. Post-merge reviews and comments are
in the survey's count — the recording GitHub holds is read at survey time, never
at merge time.

Columns: rounds are reviewed heads (opening plus settlement); the settlement cost
excludes the opening round; the verdict is the gate's at survey time; the reading
is the seat's judgement of the stop round, corrected by the owner where they
disagree; agreement says whether the gate would have fired at that round (`agreed`),
before it (`early`), or after it (`late`).

## Pull requests

| Date | PR | Rounds | Settlement cost / budget | Verdict | Seat's stop round | Gate | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-13 | #135 | 5 | 112.22 / 40 | exhausted | after settlement push 1 (the fold's late intake; value at push 1) | agreed — round 2 alone (58.69) crosses | the coordination fold; 38 findings; intake posted late |
| 2026-09-13 | #136 | 10 | 97.3 / 40 | exhausted | after settlement push 3 (the first class fix) | late — would refuse push 6; rounds of 7–15 each accrue slowly | ten rounds of small findings; a sync at round 3 priced 0 |
| 2026-09-13 | #138 | 7 | 155.06 / 40 | exhausted | after settlement push 2 | agreed — refuses push 3 | two rejections at the end were the convergence |
| 2026-09-13 | #139 | 8 | 174.59 / 40 | exhausted | after settlement push 2 (todo 1's value landed there) | agreed — refuses push 3 | the loop that produced the gate; 98 comments; owner stopped it |
| 2026-09-13 | #140 | 3 | 35.11 / 40 | warn | after settlement push 2 (as declared) | agreed — warn at the declared stop, refuses push 3 | reviewer context; round 3 rejected under the spent budget |
| 2026-09-13 | #141 | 4 | 52.11 / 40 | exhausted | after settlement push 2 (as declared) | agreed — the fourth round is the post-merge rejection-only round | the gate itself; priced its own pushes at 16.46 and 33.86 |
| 2026-09-13 | #142 | 2 | 13.99 / 40 | within | after settlement push 1 (vendor round two: zero; the leg's two findings cured in the body and routed) | agreed — within at the stop | Copilot errored twice on the tip then reviewed; the door refused SETTLED-NO-REVIEW correctly on the markers |
| 2026-09-13 | #143 | 1 (survey) / 2 (seat) | 0 / 40 | within | after settlement push 2 (declared; round two carries seven text-conformance findings) | late — the survey counts the settlement head as the opening round because round one was a Codex issue comment (`review-round-predicates`, defect 1); under the corrected predicate: 2 rounds, 10.85 charged | one row, not a class; re-price after PR A |
| 2026-09-14 | #137 | 4 | 48.83 / 60 | warn | after settlement push 3 (the owner raised the budget to three for round three's truth defects in the fold's own cures) | agreed — at the declared two it refused push 3 (41.58 of 40); the raise was a correctness call the numbers cannot see | the 2026-09-12 fold; 24 threads; opening round 74.69, uncharged |
| 2026-09-14 | #143 | 2 (survey) / 3 (seat) | 37.87 / 40 | warn | after settlement push 2 (as declared) | late by one push — the same defect 1 as the 2026-09-13 row: settlement push 1 (1ba34663f) prices as the opening round, so a third push would have passed | merged e474e883e; round three dispositioned without a cure |
| 2026-09-14 | #144 | 4 | 52.26 / 40 | exhausted | after settlement push 2 (as declared) | agreed — no push refused; its fourth round (18bde85f0, 24.18) is the Windows-leg CI cure, which PDR-140 clause 4 places outside the budget and the gate prices as a settlement round | merged 4540dec49; ten suppressed items, five uncured, homed 2026-09-14 |
| 2026-09-14 | #145 | 3 | 61.41 / 40 | exhausted | after settlement push 2 (as declared) | agreed — refuses push 3; it also refused the base sync the door required, the defect #146 cured | open; a mandatory cure (a filesystem-backed unit test push 1 introduced) held for the owner's rebudget ruling |
| 2026-09-14 | #146 | 3 | 27.96 / 40 | warn | after settlement push 1 (round one's three findings); push 2 removed a real-git smoke push 1 added beyond those remedies, at the owner's word | agreed — within throughout | merged 048f377fa; the gate's sync-push pass |
| 2026-09-15 | #145 | 4 | 61.41 / 80 | warn | after settlement push 3 (the owner's one-push raise for a mandatory cure: a unit test that created a temporary directory) | agreed at the gate — refused push 3 at a declared three (61.41 of 60), passed at four; but push 3 itself prices 0, because the survey reads a round whose head is a clean base merge as a sync even when a cure rides beneath it (napkin 2026-09-15), so the total understates the loop | merged 0f3168369; round four (Codex one thread, Copilot one body item) dispositioned without a cure |

Reading of the first six: the gate agrees with the seat's stop round on five and fires late
on one, #136. That is one row, not a class: one policy prices every pull request, and the
calibration reads the numbers in these rows, never labels attached to them. If a class ever
exists it will show as a cluster in the rows before anyone names it (owner, 2026-09-13:
inventing a category before the evidence "would skew all calculations, invite special
cases, and broadly turn this effort into theatre before it has properly begun").

Reading of the 2026-09-14 rows: five agree at the seat's stop; #143 is late by one push for the
defect the 2026-09-13 row already named. #144 is one observation (n = 1) of the gate pricing a
CI cure as a settlement round: PDR-140 clause 4 lists a CI cure beside a sync as outside the
budget, and #146 exempted syncs only. No weight changes; the CI-cure reading waits for rows.

## Weight changes

| Date | Change | Against which rows | By |
| --- | --- | --- | --- |
| 2026-09-12 | Initial policy: floor 3; 0.5 per finding; 0.2 per thousand comment characters; 0.3 per hundred lines; 0.1 per file; relatedness and reactivity weights 1; unit 20 per push; warn at half; converging ratio 0.5 | #136, #138, #139 priced live before landing | Nettle guards Pistil (2de368) |
