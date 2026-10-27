---
id: open-pull-requests-to-zero
node_type: delivery
name: "The open pull requests landed or closed, and the merge-bot command that opens one"
overview: "Every open pull request on this repository is landed through the front door or closed with its reason, each after a full-surface harvest, a triage of every finding and a usefulness verdict; then the merge-bot gains the one write it lacks, opening a draft pull request as the bot, so no seat reaches for a shell idiom again."
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
last_updated: 2026-10-27
---

# The open pull requests landed or closed, and the merge-bot command that opens one

## Goal

The forge's open pull-request count for this repository, the coordination pull request excluded,
reads zero, reached by landing or closing (owner, 2026-10-27, verbatim: "start merging the open
PRs, draft and non-draft, keep it all minimal please ... triage all comments before deciding
whether or not to act on them and to what degree, review work for usefulness, if it is not
genuinely useful close the PR instead"). Then the merge-bot opens a draft pull request as the bot
through one command, the affordance whose absence sent a seat to an ad-hoc script (owner,
2026-10-27: "why are you using an arbitrary script instead of the agent tools?"; the chosen cure:
build the agent tool first).

## User groups and value

- **The owner.** A forge that reads zero and means it: each pull request either merged through
  the door or closed with its reason on the record, none left as decaying inventory.
- **Seats.** The work-in-progress limit (`pr-lifecycle` §The work-in-progress limit) stops
  refusing every new lane, and the next lane opens its pull request with one built command.

## Problem

On 2026-10-27 the forge holds four open pull requests beside the coordination pull request, read
first-hand from every surface (threads, reviews, issue comments, checks):

| Pull request | Shape | State read |
| --- | --- | --- |
| #362 (3 files, non-draft) | An owner-commissioned research report with its index row and three napkin commits | Every check green; one unresolved Copilot thread (a present-tense sentence now false) and two nits in the review body; the Codex review failed on usage limits |
| #358 (44 files, non-draft) | The merge-bot's records-class door and the coordination fold clock, with their doctrine | BEHIND; four unresolved threads, one Codex P1 and three Copilot (one high), all on the door's required-checks path: a fail-open on malformed branch rules, an early return that keeps non-required checks blocking, a branch-rules read the merge token may not be permitted, and a merge state that skips required-context verification |
| #361 (12 files, draft) | The bot's upstream carrier at mirror `386f3f8` | The mirror has moved to `4e9d49a2f`, so the carrier is stale by its own receipt |
| #357 (6 files, draft) | A new knowledge skill, `design-reports`, authored on a non-executing host | CI red on missing generated adapters; the skill's evaluations unrun; its body says "No merge is authorised" |

A seat the owner names alone holds one open pull request (`pr-lifecycle`), so nothing new opens
until these land or close. And agent-tools has no command that opens a pull request as the bot:
`merge-bot` carries mint-token, merge, push and retire; the documented route is a shell idiom the
worktree guard refuses.

## Mechanism

Each pull request takes the same five steps, in slot order (smallest first unless a landing
unblocks the others): the full-surface harvest (done above, redone after every push); the
three-way triage of every finding (incorrect → rejected with evidence; correct, relevant and
proportionate → cured at source with its paired test; else → routed and the thread closed), each
disposition a signed reply on the pull request; a usefulness verdict in one paragraph on the pull
request (land, or close with the reason); for a landing, one sync of the default branch at the
slot word, the cures pushed once through `merge-bot push`, the settle read through `pr state`,
and `merge-bot merge` by merge commit; for a close, the bot closes it and the branch retires.
Then the command: `merge-bot open-pr --branch <name> --title <text> --body-file <path>` opens a
DRAFT pull request as the bot against the default branch through the REST pulls endpoint under the
`pull-request-work` scope, refusing a branch the remote does not hold, a base that is not the
default branch, or an open pull request already on that head; it reads the forge's open count first
and refuses when the work-in-progress limit is met. Why this produces the outcome: the door and the
reservation are the rules already written; this node only runs them to the end, and the command
removes the one step that had no tool.

## Acceptance criteria (each with a proof — required)

1. Each of the four pull requests is merged or closed, and its last comment is the seat's signed
   usefulness verdict with every finding dispositioned. Proof: `repo-safe` — the forge's open list
   (`gh pr list --state open`) names only the coordination pull request, and each pull request's
   timeline carries the verdict.
2. No merge was made with an unresolved thread, a red required check or a missing expected
   reviewer leg. Proof: `repo-safe` — `merge-bot merge` is the only merge path and refuses every
   such state by name.
3. `merge-bot open-pr` opens a draft pull request as the bot and refuses the three named shapes
   and the met limit, each refusal typed. Proof: `repo-safe` — its unit and integration tests; the
   first real use is the pull request of the analyser plan's unit 1.

## Todos

1. **#362.** Cure the one thread (qualify the sentence at the report's line 601 as the state at
   the time of writing); triage the two nits in the review body (the index's date and recent
   additions; the Windsurf inventory) by reading the index and the repository, curing what is true;
   push once; resolve the thread with the signed disposition; settle and merge. One worktree,
   about two files.
2. **#358.** Triage the four threads with evidence: RUN the branch-rules read under a token of the
   merge scope to settle the permission finding; READ the fail-open, the early return and the
   owed-leg path against the code, and cure each that holds with its paired test (fail closed on
   a malformed rule; recompute when the set-aside list is non-empty; verify required contexts on
   every records-class merge state). Sync the default branch once at the slot word; push once;
   settle and merge. The records-class door then serves every records pull request after it.
3. **#357.** Read the skill for usefulness against the estate's existing report and prose
   surfaces; land it (generate the adapters, run the suite the authoring contract requires, mark
   ready, merge) or close it with the reason.
4. **#361.** The mirror has moved past the carrier's head: the `cross-fork-integration` skill's
   step 1 replaces the carrier, then integrates it (the two-parent merge, the generated surfaces,
   the premise sweep, the round, the door). If the replacement opens a new carrier, the stale one
   closes with its receipt.
5. **The coordination pull request #360** folds by the `coordination-fold` skill, its own
   ceremony, after the lanes above so the fold carries their records.
6. **`merge-bot open-pr`.** TDD in `agent-tools/src/merge-bot/` (args, the GitHub call, the
   refusals, the limit read), TSDoc, the README row, the merge-bot reference's bot-writes section
   re-pointed at the command; its own pull request, about six files, opened with itself.

## Out of scope

- New work inside any landed pull request beyond what its findings and its landing need.
- The analyser plan's units: `quality-analyser-security-reliability-to-zero`, which starts after
  todo 6.
- Closing a pull request as a preservation move: a close is a worth verdict, and the branch goes
  with it (`worktree-hygiene`).

## First-principles check

- **Shape.** Every step is a rule already written (`pr-lifecycle` Phases 1 to 7, the triage
  ruling, the work-in-progress limit, `worktree-hygiene`); this node is the record that runs them
  to zero, not a new procedure.
- **Instrument.** One seat, one pull request at a time, the built tools (`pr state`, `merge-bot
  push`, `merge-bot merge`), a reviewer fleet nowhere: the owner asked for minimal.
- **Level.** The usefulness verdicts are the seat's, delegated by the owner's word above; a close
  of the owner's own pull request is still reported to him with its reason.

## Review dispositions

None yet.
