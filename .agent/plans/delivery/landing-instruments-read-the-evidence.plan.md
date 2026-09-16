---
id: landing-instruments-read-the-evidence
node_type: delivery
name: "Landing instruments: read the evidence that exists, and ask when nobody has"
overview: "The merge door and the review-cost gate verdict on the evidence the surfaces actually produce, refuse loudly on evidence they cannot type, and request a review nobody has asked for."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: coordination-substrate
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-16
---

# Landing instruments: read the evidence that exists, and ask when nobody has

This node absorbs the sketch `review-round-predicates` (2026-09-13, unratified): its two
defects are slices 1 and 2 here, restated with their fixtures. Both are sketches and neither
governs work; at the ratification moment the owner's word retires that node as
`superseded_by: landing-instruments-read-the-evidence`. The `agent-tools-watch-commands` node
keeps the command-surface candidates in its own disposition ledger (the session-script
commands, the deletion-sweep integration); this node owns the readings and the one act.

## Goal

A pull request is never held by evidence the instruments can see and cannot type, and never
landed on evidence that says nothing. When a wait exists only because nobody asked a
reviewer, the door asks, once, and says it did. When an instrument cannot classify what it
is looking at, it refuses loudly and quotes it, rather than reading silence.

## User groups and value

- **The shepherding seat** gets the verdict it would reach by hand from the same four
  surfaces, and a stall that ends with a request instead of an escalation.
- **The owner** is asked only what is genuinely theirs — a vendor outage, a policy choice —
  never "the vendor answered in a shape the tool does not parse". Worked instance,
  2026-09-15: #147 sat green, zero threads, with Codex's completion comment naming the head,
  and the door refused `SILENT-WAIT-NO-REVIEWER`; the decision reached the owner because the
  tool could not read a sentence a human reads in a second.
- **Every later seat** inherits refusals that name what was seen. An unclassified shape is a
  named refusal, so the next vendor change is one typed source, not another silent stall.

## Mechanism

Four readings and one act. Each names the defect it cures and the recorded instance.

**1. One evidence type, two questions.** `pr-watch/reviewer-legs.ts` reads a single shape:
an entry of the `reviews` connection, landed, bound to the tip, whose body is not a skip
marker. The surfaces produce at least five: a review with findings; a review with an empty
body (a thread reply creates one under the replier's identity); an issue comment carrying a
round's findings, each linking a blob URL that names a commit; a completion comment stating
the commit reviewed with no findings, beside a reaction; and a review posted by a seat for
an unavailable vendor under the 2026-09-10 ruling. The cure is a typed reading —
`{ reviewer, source, tipBinding, substance, id, at }` — over which the leg asks two
orthogonal questions instead of one: **did this reviewer look at this tip**, and **did it
say anything that must be dispositioned**. `SATISFIED` needs the first; `substance: empty`
never satisfies; a skip marker keeps today's arms. A body from a declared reviewer that
names the tip and types to nothing is `UNCLASSIFIED`: the verdict refuses and quotes it.
Recorded instances: #147's completion comment (2026-09-15), #142's seven empty tip-bound
reviews (2026-09-12), #143's comment-shaped round (2026-09-13).

**2. The act: request the review nobody asked for.** Copilot binds any head the bot requests
(`POST pulls/{n}/requested_reviewers`); the Codex connector's own text lists its triggers as
open, ready, and an `@codex review` comment — a push is not among them. So a leg can be OWED
with nothing composing and nothing coming. When a leg is OWED, no run is live, and the
reviewer is in the repository's automatic-review configuration, the door issues one request
per tip, records it in the evidence, and keeps polling. It never weakens a verdict: the
request is an act, and settlement still needs evidence. Cures F-167 (a merge-only tip draws
no automatic review) and the #147 shape.

**3. The liveness residue.** The review-runs leg still carries F-166/F-185's tail: the
pull-request pair is validated for null-shape but not for agreement (this PR's URL beside
another PR's number passes), the URL match is exact-string where GitHub's rendering varies,
the view's own id is parsed and never compared with the run requested, and the window is
user-scoped across repositories so foreign runs consume the list limit before this
repository's appear. Each is a narrow guard with a literal-input test.

**4. The cost readings.** `review-cost`: `gitDiffStat` calls a round a sync when the head's
tree equals git's automatic merge of the head's own two parents, without asking whether the
first parent is the previous reviewed head — so a cure pushed beneath a clean base merge
prices zero (#145's third push, 2026-09-15). An upstream carrier's rounds price the import
as the seat's churn (#147: 552.25 then 503.87 against a budget of 40) although a carrier's
findings are on someone else's code and its cure-worthy count is zero by construction; the
carrier is priced by its fork-side resolution diff. And `BUDGET-EXHAUSTED` names the
smallest declared budget that would admit the next push, which the owner and the seat
currently derive by hand from an unstated unit weight.

**5. The watch exit predicate.** `pr-watch --watch` exits ALL-GREEN on a pull request that
is CONFLICTING with a standing change-request (F-162, F-164, three recorded instances). The
exit predicate gains mergeability and review decision; the command's emission and CLI shape
stay with the `agent-tools-watch-commands` node.

Why this produces the goal: the leg's two questions are the distinction every one of the
recorded stalls turns on, and typing the sources makes the next vendor shape an addition
rather than a silence. The act converts the one stall class that no evidence will ever end.
The cost readings make the gate's arithmetic about the seat's own work. Nothing here widens
what may merge: every change either adds evidence the tool can read, or refuses more loudly.

## Acceptance criteria (each with a proof — required)

1. A recorded harvest whose only tip evidence from a declared reviewer is a completion
   comment naming that commit reads `SATISFIED`; the same harvest with the named commit
   changed reads `OWED` — `repo-safe`: `agent-tools/src/pr-watch/reviewer-legs.unit.test.ts`
   over literal inputs, plus a recorded #147 fixture in the settlement suite.
2. A tip-bound landed review with an empty body never satisfies a leg, and the evidence line
   counts the empties — `repo-safe`: the same suite, with the recorded #142 harvest.
3. A comment-shaped round is one round with its findings and head in both the tally rows and
   the cost survey — `repo-safe`: `tests/pr-tally/rows.integration.test.ts` and
   `tests/review-cost/measure.integration.test.ts` over the recorded #143 harvest.
4. A body from a declared reviewer that names the tip and types to no known source produces a
   refusal quoting it, never `OWED` — `repo-safe`: unit test over a literal unknown body.
5. An `OWED` leg with no live run and a configured reviewer issues exactly one request per
   tip, recorded in the evidence, and none when the reviewer is unconfigured or a request
   already exists for that tip — `repo-safe`: integration test over an injected GitHub port;
   `owner-held`: the next landing's timeline shows the bot's request, recorded in that pull
   request's landing premises.
6. The review-runs leg rejects a disagreeing pull-request pair, matches a canonically
   different URL, refuses a view whose id is not the requested run, and reads this
   repository's runs before the limit — `repo-safe`: literal-input unit tests per guard.
7. A settlement push whose head is a merge whose first parent is not the previous reviewed
   head prices the cure it carries; a carrier's round prices its fork-side resolution diff —
   `repo-safe`: unit tests over injected git output; and the ledger's affected rows are
   re-derived with one dated line under the table.
8. `BUDGET-EXHAUSTED` evidence names the smallest declared budget that admits one more push
   — `repo-safe`: unit test over a priced report.
9. `pr-watch --watch` never exits ALL-GREEN while the pull request is CONFLICTING or carries
   a standing change-request — `repo-safe`: unit test over the exit predicate.
10. No test in this node's slices performs or creates IO — `repo-safe`: the pre-commit gate's
    test run; every suite reads literal inputs or recorded fixtures.

## Out of scope

- The session-script commands (comment, ready-with-tally, create-draft, merge-at-pinned-head,
  delete-remote-branch, reply-and-resolve) and integrating the merge-base deletion sweep into
  the door: candidates on `agent-tools-watch-commands`, whose ledger already holds them.
- Granting the App the Actions write permission so a failed job can be re-run: an owner
  decision, routed there; the empty-commit shape stands meanwhile.
- The cost policy's weights: untouched here, and changed only against the review-cost ledger.
- Replacing the declared `--expect` set with one inferred from configuration: the act in
  mechanism 2 reads the configuration to decide whether a reviewer is requestable; the
  declared set stays the verdict's input.
- Any change to what may merge: no new merge path, no widened exception, no auto-merge.

## Todos

Six slices, each a single-story pull request with the default round budget (PDR-132), the
intake declared at open where the changeset carries prose (PDR-140 clause 3). Pickup reads
`## Review dispositions` first — empty at authoring.

1. **The evidence type and the completion source.** The typed reading, the two questions, the
   empty-body clause, the `UNCLASSIFIED` refusal; the quiet-window anchor excludes empty
   bodies and signed self-replies alike. Unblocks #147, which waits on this slice.
2. **The comment-shaped round.** The harvest normaliser (author is a declared reviewer, the
   findings' blob URLs name one commit in the pull request's commits), consumed by the tally
   rows and `measureRounds`; unbound comments appear in the evidence. Needs the #142 and #143
   fixtures recorded after merge, unedited, outside any test.
3. **The act.** One request per tip for a configured, unrequested reviewer on an `OWED` leg
   with no live run, recorded in the evidence and in the verdict's grounds.
4. **The liveness guards.** Pair agreement, canonical URL match, requested-id assertion,
   repository-scoped window.
5. **The cost readings.** First-parent sync test, carrier pricing by the fork-side
   resolution, the refusal naming the admitting budget; then the ledger's re-derivation line.
6. **The watch exit predicate.** Mergeability and review decision in ALL-GREEN.

Sequence: 1 first (it is the live blocker), then 3, then 4, 5 and 6 in any order; 2 lands
when its fixtures are recorded. Slice 5's ledger line lands with slice 5, never ahead of it.

**Recorded during implementation, 2026-09-16 (Zephyr guards Leeward, 281e44).** Slice 1
was split on the Director's verdict and the owner's asleep-hours consultation route. The
TIGHTENING half landed on `lane/reviewer-leg-empty-body-281e44`: an empty-bodied review
satisfies no leg and never anchors the quiet window, with the empties counted in the
leg's detail. The EVIDENCE-WIDENING half — whether a vendor's completion comment may
bind a tip — did not land and is not this node's to decide: it is routed to the owner at
`.agent/reports/merge-door-comment-evidence-decision-2026-09-16.md`, honouring the
out-of-scope line `review-round-predicates` had already drawn. Until the owner rules,
slice 1 is PART-DONE and pull request 147 stays held.

Two follow-ups this node now owns, neither scheduled:

- `agent-tools/src/pr-watch/reviewer-legs.ts` sits at 249 lines against a 250-line
  ceiling; the tightening's own comments were trimmed to fit. The seam the ceiling is
  pointing at is extracting the body-classification predicates (`isSkipMarker`,
  `isSubstantive`, `isSignedSelfReply`) from the leg machine — deferred because
  `state-gh.ts`, `settlement.ts`, `pr-tally/rows.ts` and `pr-tally/dispositions.ts`
  import from that module, which makes it a second story with its own round budget. The
  next edit to this file pays that cost, so it is the next seat's first question, not a
  surprise.
- Line-limit pressure selects against the LONGEST comment, not the least load-bearing
  one. On this change the comment recording that discarded evidence must be counted —
  the clause the whole cure rests on — competed for space against dated instances already
  recorded in the SKILL. Noticed, not cured; no mechanism is proposed here. Two orderings
  that helped at the moment of the trim, from Cauldron herds Lustre (880ff9), 2026-09-16:
  ask which lines a later reader could NOT reconstruct from another surface, and trim
  those last (the dated instances were recoverable from the SKILL, the counted-empties
  invariant was not); and where decomposition is actually available, it beats
  prose-trimming outright — a ceiling breach usually wants a module split, not a shorter
  paragraph. Neither removes the pressure; they only order the queue.

## Prediction and falsifier

With slice 1 landed, #147 lands through the front door with both legs satisfied and no seat
premises carrying a leg. With slice 3 landed, a merge-only tip or a push the connector does
not observe produces a request and then a review, instead of a stall that reaches the owner.
Falsifier for the evidence type: a landing where the door reads `SATISFIED` from a completion
comment whose commit the vendor did not in fact review — the vendor's own statement would
then be unreliable evidence, and the leg needs the review object after all. Falsifier for the
act: a request that produces no review within a quiet window on a vendor the configuration
lists, twice — the request would then be ceremony, and the leg belongs on the timeout arm.

## Review dispositions

One dated row per routed finding (PDR-140 ledger surface). Empty at authoring: this node has
not yet been through a review round.
