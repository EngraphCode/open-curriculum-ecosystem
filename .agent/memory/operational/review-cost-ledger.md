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
| 2026-09-15 | #148 | 3 | 47.18 / 40 | exhausted | after settlement push 2 (as declared; rounds one and two were fifteen true record defects, all cured) | agreed — 28 of 40 at push 2, so a third push would have been refused; round three (one Codex thread, five Copilot suppressed items) arrived after the owner merged by hand at green checks, and its six true items are cured on the successor branch | the 2026-09-14 fold, merged 4786abb7f; every finding was in the seat's own records |
| 2026-09-16 | #147 | 2 | 503.87 / 40 | exhausted | no settlement push is owed at all: an upstream carrier's rounds are findings on upstream's code, routed to the owner-held report, cure-worthy 0 | the gate cannot read this class — it prices the round by upstream's 56-file import (552.25 then 503.87), so the verdict is arithmetic about someone else's changeset. The seat pushed once, to carry the integration merge, and the gate's exhausted verdict did not bind it because the push was the merge itself | open at the wrap: green, zero threads, held by the front door's Codex leg (the zero-finding completion it cannot read); the owner ruled the tool is fixed first |
| 2026-09-16 | #147 | 2 | 503.87 / 40 | exhausted | re-read after merge (0bd321131, landed on premises at the owner's word). The earlier row's reading — "cure-worthy 0, upstream's code" — is withdrawn by the owner's same-day correction (two peer forks, no upstream). Seven of the eight carried-code findings were cure-worthy here (one was withdrawn at #150's review: the ADR-141 paragraph it named is preserved history), and their cures belong in local lanes (now a local work list), not in the carrier's rounds, so the honest stop round is still round two, the push that carried the integration merge (15de4bc69) | the gate still cannot read this class. Only the pricing half of the earlier reading survives: it prices the seat by an import the seat did not author. The corrected disposition makes the verdict no less wrong, because the cures belong in their own lanes, not in the carrier's rounds | numbers unchanged by the merge; no post-merge reviews |
| 2026-09-16 | #149 | 2 | 7.81 / 40 | within | after settlement push 1 (round one's three cures, including the phantom OWED leg the change itself introduced; round two was two Copilot observations and a Codex zero-findings result, dispositioned without a push) | agreed — within at the stop | merged 514bfc06a. The opening round is the base sync f8fa232da, priced 0: the draft carried no review before it. The gate's sync test reads the live base tip (`baseRef.target.oid` in `harvest.ts`); whether it classed that push as a sync is not printed on a within verdict |
| 2026-09-16 | #150 | 0 | 0 / 40 | within | no review round yet: a draft coordination pull request that carried the retrospective's records push (940c019a6) with no vendor review bound | agreed — within at the pre-push gate for that push | open, draft, `DIRTY` against engraph (one napkin conflict); its fold is the consolidation session's item 2 |
| 2026-09-16 | #150 | 3 | 33.94 / 40 | warn | after settlement push 2 (as declared): rounds one and two were eight true records findings, all cured (`00fe8819e`, `744b7a6dc`); round three (one Codex thread, three Copilot suppressed items) was dispositioned without a cure, the budget spent | agreed — warn at the stop; round three took no push, so the gate was never asked about a third | merged `a07940ac9` through the front door. The opening round is the engraph merge `7ccc8dd2e`, priced 43.12 and uncharged as the opening; the settlement rounds cost 22.5 and 11.44 |
| 2026-09-17 | #152 | 0 | 0 / 40 | within | no review round yet: the draft carrying the 2026-09-16 coordination branch (the dedicated consolidation's first half) | agreed — within at the pre-push gate for each of its pushes | open, draft, `CLEAN` at `da479374f`; the branch is DUE at the 2026-09-17 rollover, and readying it is the next session's first act |
| 2026-09-17 | #152 | 3 | 52.93 / 40 | exhausted | after settlement push 2 (as declared). Before publication a context-free claim pass over 34 files raised 31 claim errors, all true, cured in the opening push `fd82a7e4e`. Round one raised 6 (5 over-bar, cured in `6d07d7f5d`), round two 8 (6 cured in `979abe968`, one below-bar typo cured with them, one rejected), round three 7, dispositioned without a cure and its true findings routed to the successor branch (cured in `49b6c3ae9`) | agreed — exhausted at the stop; both declared pushes were spent, and round three took no push | merged `cd847a2b3` through the front door at 15:09:09Z. The opening round priced 28.83 and uncharged; the settlement rounds cost 32.37 and 20.56. For pr-lifecycle's claim-table prediction: claim-class findings did not become rare in round one after the pass (three of round one's five over-bar findings were the cured-text consistency class) |
| 2026-09-17 | #153 | 3 | 32.75 / 40 | warn | after settlement push 2 (as declared). Before publication a context-free claim pass raised 33 claim errors, all true, cured in the opening push `56f42807e`. Round one raised 4 (all cured in `a1aa47c6b`); round two raised 3 distinct findings from 4 items, one of them suppressed and one raised by both reviewers (two cured in `8e7d37824`, one dispositioned: a folding branch's pickup cannot record its own landing); round three raised 6 (1 Codex thread and 5 Copilot suppressed items, two of them one stale-index-cell class), all true, dispositioned without a cure and cured on the successor's first records commit. Thirteen distinct findings in all: six cured, one dispositioned, six routed | agreed — warn at the stop; both declared pushes were spent, and round three took no push | merged `b5b0e70cd` through the front door at 20:17:05Z, folded on its cut date at the owner's word. The opening round priced 17.06 and uncharged; the settlement rounds cost 12.44 and 20.31. For the claim-table prediction: round one's four findings were all cured-text consistency or mechanism-claim classes the pass had not reached (a decision's surviving phrase, a gates comment over a mixed list, a directive contradicting a ruling, a plan criterion over an excluded query) |

Reading of the first six: the gate agrees with the seat's stop round on five and fires late
on one, #136. That is one row, not a class: one policy prices every pull request, and the
calibration reads the numbers in these rows, never labels attached to them. If a class ever
exists it will show as a cluster in the rows before anyone names it (owner, 2026-09-13:
inventing a category before the evidence "would skew all calculations, invite special
cases, and broadly turn this effort into theatre before it has properly begun").

Reading of the 2026-09-14 rows: four agree at the seat's stop (#137, #144, #145, #146); #143 is late by one push for the
defect the 2026-09-13 row already named. #144 is one observation (n = 1) of the gate pricing a
CI cure as a settlement round: PDR-140 clause 4 lists a CI cure beside a sync as outside the
budget, and #146 exempted syncs only. No weight changes; the CI-cure reading waits for rows.

## Weight changes

| Date | Change | Against which rows | By |
| --- | --- | --- | --- |
| 2026-09-12 | Initial policy: floor 3; 0.5 per finding; 0.2 per thousand comment characters; 0.3 per hundred lines; 0.1 per file; relatedness and reactivity weights 1; unit 20 per push; warn at half; converging ratio 0.5 | #136, #138, #139 priced live before landing | Nettle guards Pistil (2de368) |
