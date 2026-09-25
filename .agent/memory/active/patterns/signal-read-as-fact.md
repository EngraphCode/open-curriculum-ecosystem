---
name: signal-read-as-fact
polarity: anti-pattern
category: process
use_this_when: "About to act on, or write into a record, an instrument's verdict, a reviewer's finding, a single instance, or a fit to the data at hand — without having stated what it is a signal of, why it is present, against what, and what would show it wrong."
proven_in: >-
  One day, 2026-09-12 to 13, seven instances at one seat: every verified-correct
  review finding cured as if correctness were relevance (PR #139, seven
  settlement pushes against a budget of two, 98 comments); a front door's
  SILENT-WAIT verdict waited on with the settled state visible (a skip-marker
  predicate misreading a substantive review); "no recorded instance" read as
  "does not occur" until one arrived within the hour; a category ("records
  loops") from one ledger row; cost-gate weights fit on three loops and scored
  on the same three; "the gate agrees on five of six" where the seat wrote the
  labels; signals narrated in status lines and treated as processed. Owner's
  words in the thread record for 2026-09-12/13. Independent instances: n = 2
  (the proving day is one seat, one pull-request arc, two days, and its seven
  events share the seat and the reviewers; two earlier instances at another
  seat, 2026-08-13 and 2026-08-17, are in §Earlier instances). Comparator: the same seat's acts
  on the same days where a stop existed at the point of action (the merge front
  door, the review cost gate at the push), which held. By the rule this pattern
  names, that is an observation and a cure shape, admitted under the barrier's
  amended proven-by-implementation criterion (an executed decision: the owner's
  ruling of 2026-09-13); it claims nothing about frequency.
proven_date: 2026-09-13
related_pattern: timing-artefact-read-as-state
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: >-
    The cure is a stop at the point of action or of writing, never a label on
    the work: the rule one-instance-is-an-observation, the verify-dont-trust
    clause on instrument verdicts, the reason warrant's count-and-comparison,
    the review cost gate's refusal at the push, and the survey the wrap runs
    so a claim about the gate is checked by the instrument rather than by the
    seat's own labels.
  stable: true
---

> **POLARITY: ANTI-PATTERN.** The failure shape is acting on a signal — a
> reviewer's "correct", an instrument's verdict, one instance, a fit — as the
> fact it stands for, without the stop that asks what it stands for, against
> what, and what would show it wrong.
>
> See [`patterns/README.md` § Polarity](README.md#polarity-required-every-pattern).

# Signal read as fact

## The failure

A fluent seat always has a cheap next action available. A signal arrives — a
reviewer says "correct", a tool says OWED, one row disagrees, a weight fits —
and the seat acts on it as the fact it stands for. Rigour is a stop: what does
this stand for, why is it here, compared with what, how much is unresolved,
what would show it wrong. Nothing in the seat's loop imposes that stop except a
mechanism at the point of action; on the proving day, where there was none the
signal was acted on each time it arrived, and reflection written into a status
line counted as having stopped.

## The cure

Stops at the point, never labels on the work:

- **Actions**: hooks and gates that refuse (the merge front door, the review
  cost gate at the push). These held throughout the proving day.
- **Records with a shape**: fields the record shape requires — a count and a
  comparator beside any named pattern, a falsifier beside any graduation or
  weight change (PDR-130), a marker on every disposition (pr-tally).
- **Repeated judgements**: an instrument that computes the same judgement from
  the artefacts (the tally, the gate, the survey), so the seat's claim and the
  instrument's can disagree visibly.
- **Free prose**: the reason warrant states its count and its comparison; the
  owner remains the reader.

## Earlier instances, found at the 2026-09-20 consolidation

Two instances from another seat and lane, three weeks before the proving day,
read out of the `mcp-submission-drive` thread record when it was curated: on
2026-08-13 five of a ticket's eight declared blockers were already Done while the
board implied otherwise, and one discharged gate was read as the top launch risk;
on 2026-08-17 a `CHANGES_REQUESTED` flag was read as a work signal and nearly
staffed an implementer lane against work finished for four days (the cure commit
post-dated the review by thirteen minutes). Both were caught by a first-hand
recount of the artefacts, which is the cure this pattern names. With the proving
day that makes independent seats n = 2; the record's own words were "board state
is not work state".

## Falsifier

If a seat with this pattern loaded acts on an instrument's verdict it could
have checked against the state, or names a class from one instance in a
tracked record, the pattern has not taken and the instance is filed against it.
