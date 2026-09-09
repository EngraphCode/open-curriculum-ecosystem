---
id: fork-diff-manifest
node_type: delivery
name: "The fork's deliberate divergence from upstream is a tracked manifest a validator checks"
overview: >-
  A tracked list of the paths this fork deliberately diverges from its
  upstream, with a validator that diffs it against the real tree
  difference, so the cross-fork integration's landing proof becomes a
  check instead of a read of a count.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: organisational-identity-below-the-tree
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-09
---

# The fork's deliberate divergence from upstream is a tracked manifest a validator checks

## Goal

The cross-fork integration skill's last proof is that the landed default branch's
tree is upstream's tip plus the enumerated fork diff. On both syncs so far
(2026-09-09) nothing in the tree enumerated what the fork deliberately diverges, so
the proof reduced to a count (586 files, +7,622/−66,304) read against what the seat
remembered. When this lands, a tracked manifest names every fork-only path class
and every shared file the fork amends, and a validator proves at each sync that the
tree difference against the fetched upstream tip is exactly that set — a surplus
path or a missing one fails by name.

## User groups and value

- **The seat landing a sync** proves the tree in one command and reads a named
  surplus instead of a number; the skill's step 9 becomes a check.
- **The Director** reads a green validator as the landing fact and a red one as a
  named divergence to route.
- **The owner** sees the fork's identity as an enumerated, regenerable diff — the
  ratified `organisational-identity-below-the-tree` stance made observable — and the
  October re-integration inherits the list rather than re-deriving it.

## Mechanism

- A manifest at a tracked path lists divergence by class, each entry a path
  pattern and one line of why it diverges (generated adapters for the fork's
  platforms, the merge-bot example, the plans estate, fork-only governance pages,
  shared files carrying a fork-added paragraph); classes name a generator where
  one regenerates the paths.
- A validator, run by hand at each sync and in the repo-validators chain when an
  upstream mirror ref is present, computes `git diff --name-only <upstream-tip>
  <fork-default>` against the fetched mirror and partitions the result by the
  manifest: every path matches exactly one entry, or the validator exits non-zero
  naming the unmatched paths (a new divergence to add with its why, or a stray to
  remove) and the manifest entries that matched nothing (a divergence that ended).
- The cross-fork integration skill's step 9 names the validator as its proof, and
  the count-until-manifest sentence it carries today is retired in the same PR.

## Acceptance criteria (each with a proof — required)

1. The validator partitions the live tree difference against the fetched upstream
   tip with no unmatched path and no dead entry. Proof: `repo-safe` — the
   validator green on the default branch after the mirror fetch (run by the landing
   seat; recorded on the sync PR).
2. An added stray file and a removed manifest entry each fail the validator by name.
   Proof: `repo-safe` — unit tests over an in-memory diff listing and manifest
   fixtures, no IO.
3. The skill's step 9 names the validator and no longer carries the count sentence.
   Proof: `repo-safe` — the skill's projection check and a read on the landing PR.

## Todos (optional; proofs on todos optional)

1. The manifest, seeded from the measured 2026-09-09 diff, with the validator and
   its fixtures; one PR.
2. The skill's step 9 re-pointed; rides todo 1's PR or the next skill amendment.

## Out of scope

- Reducing the divergence: the manifest records what diverges and why; removing a
  hand-carried divergence is the identity node's own work.
- Running the validator without an upstream mirror ref: the check needs the
  fetched tip and is skipped, loudly, where none is configured.
