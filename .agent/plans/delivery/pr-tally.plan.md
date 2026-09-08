---
id: pr-tally
node_type: delivery
name: "pr-tally — the review-round tally built by commit binding, with the step-back verdict"
overview: "An agent-tools command that builds the pr-lifecycle review-round tally from a pull request's review threads and review bodies by the commit each review binds to, prints one row per settled round with raised and cure-worthy counts, and prints the mechanical step-back verdict; paired with a pre-push cross-surface read step in the lane-cut skill as its practice half."
status: ratified
ratified_by: Jim Cresswell (owner)
ratified_date: 2026-09-08
ratified_where: "The owner's direct word of 2026-09-08 (11:5xZ, via the Director), verbatim: \"pr-tally, ratified\"; quoted in the body of the pull request that landed this node"
serves: coordination-substrate
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-08
---

# pr-tally — the review-round tally built by commit binding, with the step-back verdict

## Goal

A seat shepherding a pull request reads its review-round tally from one command instead
of building it by hand, and the step-back trigger the pr-lifecycle skill defines fires
from a printed verdict rather than from a seat's memory of it. Every tally the estate has
needed was built late or not at all: eight rounds on one PR ran unnoticed as
non-convergence in July because nothing counted; a seven-round tail on 2026-09-08 fired its
step-back at round four with nobody watching, and the owner invoked two cognitive skills by
hand to stop it — the out-of-band correction PDR-140 clause 8 names as a defect against the
skill.

## User groups and value

- **The shepherding seat**: one command at every settle, the tally row and the verdict in
  one read; the class-fix moment arrives as a printed line, not a realisation.
- **The Director**: the same read across every open PR at a glance, so a routing decision
  rests on counted rounds.
- **The owner**: the review-loop discipline the estate wrote becomes an instrument that runs,
  which is what the owner's 2026-08-31 and 2026-09-08 corrections asked for.
- **Any organisation running this tree**: the command derives the repository from the
  checkout and names none (ADR-228).

## Mechanism

- **The reads**: the GraphQL review-thread harvest the pr-lifecycle skill's Phase 3 specifies
  — each thread's first comment carries its originating review's commit binding — and the
  paged reviews connection with each review's commit and body; both paginated to exhaustion.
  The repository is named explicitly on every call (the downstream-checkout rule).
- **The tally**: one row per commit that reviews bind to, in commit order on the branch,
  never arrival order; the raised count is every finding in threads and review bodies bound
  to that commit, one logical finding counted once (a body finding restating an inline
  thread of the same review is deduplicated by anchor); the cure-worthy count is read from
  the disposition state the seat records — a reply signed by the seat's identity tuple that
  names a cure commit counts as cured, a reply that names a home counts as routed — and the
  seat's own signed replies are excluded from the raised count.
- **The verdict**: the exact predicate from the skill — `c[n] >= c[n-1] AND c[n-1] >= c[n-2]`
  across three settled cure-worthy counts, or four settled rounds in the epoch, either arm
  firing only while the latest settled count is non-zero; the epoch resets at a push the seat
  marks as the class fix; the terminal-success state (a settled round at cure-worthy zero)
  takes precedence.
- **The command**: `pnpm agent-tools pr-tally --pr <n>` prints the table and the verdict as
  text and, with `--json`, as a document the merge-bot front door can consume later (the
  named PDR-140 follow-up: pass disposition state into the merge verdict).
- **The practice half**: a pre-push step in the lane-cut skill — before any push that changes
  a vocabulary, an order or a bound, read every surface that carries it and cure them in the
  same push — the step whose absence cost #82 eight rounds.

## Acceptance criteria (each with a proof)

1. Given recorded harvest fixtures for a PR with reviews bound to three commits, the command
   prints three rows whose raised and cure-worthy counts match the fixtures, in commit order,
   with the seat's signed replies excluded and a body finding that restates an inline thread
   counted once. Proof: `repo-safe` — unit tests over the tally builder with recorded
   fixtures, no IO.
2. The verdict fires on the fixtures that meet either arm and not on the fixtures that meet
   neither, including the terminal-success precedence and the epoch reset. Proof:
   `repo-safe` — unit tests over the verdict function.
3. Against a live PR of this repository, the command's rows equal the tally the shepherd
   recorded on that PR's working-notes comment. Proof: `repo-safe` — one end-to-end check
   in the agent-tools suite, run against a closed PR named in the test.
4. The lane-cut skill carries the pre-push cross-surface read step and its projections are
   regenerated. Proof: `repo-safe` — the skill's projection check and the markdown-links
   validator on the landing PR.

## Todos

1. **The tally builder and the verdict, with fixtures** — criteria 1 and 2; one PR, default
   round budget.
2. **The command and the end-to-end check** — criterion 3 and the `--json` shape; one PR.
3. **The practice half** — the skill step (criterion 4); one small records PR.

Each PR opens with the pr-lifecycle instruments declared at open: the round tally (from this
command once it lands), and the PDR-140 intake contract where the changeset carries prose.

## Out of scope

- Changing the predicate, the tally semantics or the intake contract: those are the
  pr-lifecycle skill's and PDR-140's; this node builds the instrument that runs them.
- Consuming disposition state in the merge-bot verdict: the named PDR-140 follow-up, served
  by this command's `--json` output and landed on its own node.
- Reading review state from `latestReviews`: the skill forbids it for the tally (rows vanish
  when a reviewer posts again); the harvest reads threads and the paged reviews connection.
