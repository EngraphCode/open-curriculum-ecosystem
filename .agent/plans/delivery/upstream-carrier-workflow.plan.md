---
id: upstream-carrier-workflow
node_type: delivery
name: "Upstream carrier workflow — a draft pull request from the fork's main into engraph whenever main moves"
overview: "A GitHub Actions workflow on the default branch, off by default, that opens exactly one draft carrier pull request into the default branch at the fork's main tip whenever main is ahead of the default branch and no carrier is open, with the receipt the cross-fork skill's step 1 reads."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: organisational-identity-below-the-tree
impact_areas:
  - practice-and-estate
tickets: []
depends_on:
  - plan: upstream-mirror-workflow
    kind: beneficial
owner_gates:
  - awaiting: owner-decision
    clears_when: "The bot app's id and private key are in the fork's Actions secrets and the enable variable is set (the owner's custody decision, 2026-09-10 report)"
    expires: 2026-09-24
last_updated: 2026-09-10
---

# Upstream carrier workflow

## Goal

Upstream movement is staged for integration without a seat noticing it: whenever the fork's
`main` (the mirror) is ahead of `engraph`, one draft carrier pull request exists at `main`'s
tip carrying the receipt, and seats run the cross-fork skill's semantic integration on it. The
carrier is never merged, moved or duplicated by the workflow. On 2026-09-10 twelve upstream
commits sat uncarried for a day because the previous producer (a Codex task) was dark.

## User groups and value

- **Seats**: the carrier arrives with its receipt (repository ids, both tips, exclusive counts,
  the merge base) — the skill's step 1 evidence — instead of a manual fetch and cut.
- **The owner**: the October merge-back grows no harder while nobody is watching; every
  upstream release is on the board within a slot.

## Mechanism

- Lives on the default branch; schedule and manual dispatch; single concurrency group.
- Gated on the repository variable `UPSTREAM_CARRIER_ENABLED`; identities from the repository
  service (the default branch; the mirror branch name from a variable, default `main`); no
  parent is read — the mirror workflow owns that. A copy inherited upstream leaves skipped runs.
- Compare the default branch with the mirror branch: `identical` or the mirror behind → no
  action. The mirror ahead → if an open pull request into the default branch has a head named
  `automation/oce-upstream-sync-*`, post a notice ("carrier open at X; the mirror is now N
  further ahead") and exit zero; else create the branch `automation/oce-upstream-sync-<mirror
  sha>` at the mirror's tip (a ref create, `contents: write`, as the bot app) and open a DRAFT
  pull request into the default branch with the receipt and the marker `engraph-oce-upstream-sync`.
- The carrier head is upstream's tip exactly; a release commit's CI-skip token means the head
  runs no checks until the seat's slot-word merge gives it a buildable head (the skill's step 3).

## Acceptance criteria (each with a proof)

1. With the mirror ahead and no carrier open, one dispatched run opens exactly one draft at the
   mirror's tip with the receipt. Proof `repo-safe`: `gh pr list --head automation/oce-upstream-sync-<sha>`
   returns one draft; its body carries the receipt fields.
2. With a carrier open, a run opens nothing and posts the notice. Proof `repo-safe`: the run log
   and the unchanged open set.
3. A run with the variable unset performs nothing. Proof `repo-safe`: the job skipped.
4. The Codex OCE task and this workflow never both produce a carrier for one tip. Proof
   `owner-held`: the owner retires the task once criterion 1 is proven; recorded on the thread.

## Out of scope

The semantic integration (steps 3–9 of the cross-fork skill are a seat's); merging anything;
the mirror itself.

## Todos

1. Author `.github/workflows/upstream-carrier.yml` (the receipt, the guard, the ref create, the
   draft); the body shape from the OCE task's receipt (#90, #99).
2. Prove by dispatch (criteria 1 and 2) against the live board.
3. Re-true the cross-fork skill's step 1 (the carrier's producer and the receipt's fields).

## Review dispositions

(none yet)
