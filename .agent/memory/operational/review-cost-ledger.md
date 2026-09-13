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
| 2026-09-13 | #135 | 5 | 112.22 / 40 | exhausted | after settlement push 1 (the fold's late intake; value at push 1) | agreed — round 2 alone (58.69) crosses | records fold; 38 findings; intake posted late |
| 2026-09-13 | #136 | 10 | 97.3 / 40 | exhausted | after settlement push 3 (the first class fix) | late — would refuse push 6; rounds of 7–15 each accrue slowly | docs; ten rounds of small findings; a sync at round 3 priced 0 |
| 2026-09-13 | #138 | 7 | 155.06 / 40 | exhausted | after settlement push 2 | agreed — refuses push 3 | records; two rejections at the end were the convergence |
| 2026-09-13 | #139 | 8 | 174.59 / 40 | exhausted | after settlement push 2 (todo 1's value landed there) | agreed — refuses push 3 | the loop that produced the gate; 98 comments; owner stopped it |
| 2026-09-13 | #140 | 3 | 35.11 / 40 | warn | after settlement push 2 (as declared) | agreed — warn at the declared stop, refuses push 3 | reviewer context; round 3 rejected under the spent budget |
| 2026-09-13 | #141 | 4 | 52.11 / 40 | exhausted | after settlement push 2 (as declared) | agreed — the fourth round is the post-merge rejection-only round | the gate itself; priced its own pushes at 16.46 and 33.86 |

Reading of the first six: the gate agrees with the seat on five and fires late on one, #136,
whose loop was many small rounds — the round floor of 3 may be too low for records loops, or
records loops may deserve a budget of one push. Left as recorded: the next records loop is
the test.

## Weight changes

| Date | Change | Against which rows | By |
| --- | --- | --- | --- |
| 2026-09-12 | Initial policy: floor 3; 0.5 per finding; 0.2 per thousand comment characters; 0.3 per hundred lines; 0.1 per file; relatedness and reactivity weights 1; unit 20 per push; warn at half; converging ratio 0.5 | #136, #138, #139 priced live before landing | Nettle guards Pistil (2de368) |
