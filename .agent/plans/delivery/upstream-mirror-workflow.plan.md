---
id: upstream-mirror-workflow
node_type: delivery
name: "Upstream mirror workflow — the fork's main kept identical to upstream main, automatically"
overview: "A GitHub Actions workflow on the default branch, off by default, that compares this fork's main with its parent's default branch and fast-forwards the fork's main by a bot push when upstream is ahead, failing loud when the fork's main is ahead or diverged."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: organisational-identity-below-the-tree
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: "The bot app's id and private key are in the fork's Actions secrets and the enable variable is set (the owner's custody decision, 2026-09-10 report)"
    expires: 2026-09-24
last_updated: 2026-09-10
---

# Upstream mirror workflow

## Goal

When upstream moves, this fork's `main` follows within one schedule slot with no seat and no
owner action: `main` is a byte-identical mirror of the parent's default branch, and any state
where the fork's `main` carries a commit upstream lacks is reported as a failure the owner sees.
Today the mirror is kept by a metered vendor task under the owner's credential (dark since
2026-09-10 with a credit outage) — see the concept exploration record of 2026-09-10 and the
owner's ruling that the producer is two workflows, this one and `upstream-carrier-workflow`.

## User groups and value

- **The owner**: the fork's relationship to upstream is observable in the Actions tab and never
  depends on a vendor's credit or on the owner's hands.
- **Seats**: `origin/main` is a trustworthy upstream reference for the cross-fork skill's step 1
  and for comparison, without a per-seat fetch of the parent.
- **The carrier workflow**: reads the fork's own `main`, so it never names or touches upstream.

## Mechanism

- Lives on the default branch (`schedule` fires only there); six-hourly on weekdays plus manual
  dispatch; single concurrency group, never cancelled in flight.
- The job runs only when the repository variable `UPSTREAM_SYNC_ENABLED` is `true`; a copy
  inherited by upstream at the merge-back therefore leaves only skipped runs (the residual cost
  the owner accepts or answers with the second-repository shape).
- Identities from the repository service at run time: the parent (`parent.full_name`) and both
  default branches; variables may override; no parent means exit zero as "not a fork". No
  repository name lives in the file.
- Compare by the REST compare endpoint (base the fork's `main`, head the parent's default
  branch): `identical` → one log line; `ahead` (upstream ahead) → fast-forward push of the fork's
  `main` to the parent's tip as the bot app (`contents: write` through the app's installation
  token minted in the run from two secrets — `GITHUB_TOKEN` can neither push a protected mirror
  nor trigger workflows); `behind` or `diverged` (the fork's `main` ahead) → the run fails with
  the compare link, and pushes nothing.
- Never force; never a merge commit (the platform's merge methods all mint commits, so a pull
  request cannot keep a mirror identical).

## Acceptance criteria (each with a proof)

1. A dispatched run with upstream ahead leaves `main` equal to the parent's tip. Proof
   `repo-safe`: the run's compare step logs `identical` on the next run; `git ls-remote` of both
   repositories agrees.
2. A run on a repository without the variable set performs no push and opens nothing. Proof
   `repo-safe`: the job is skipped in the run's summary.
3. A run on a repository with no parent exits zero with "not a fork". Proof `repo-safe`: a
   dispatch on a non-fork copy (or the step's unit run with the parent field empty).
4. A fork-ahead state fails the run loud. Proof `owner-held`: the owner sees the failure
   notification; recorded on the thread record at the first occurrence.

## Out of scope

The carrier into `engraph` (`upstream-carrier-workflow`); any semantic integration; the
retirement of the Codex OCE task (an owner decision named in the exploration record).

## Todos

1. Author `.github/workflows/upstream-mirror.yml` from the owner's draft: keep its detection,
   failure semantics and concurrency; replace the pull-request remedy with the bot push;
   replace hard-coded names with service reads and variables; add the enable gate.
2. Prove by dispatch with the variable set (criterion 1) before relying on the schedule.
3. Re-true the cross-fork skill's step 1 to name this workflow as the mirror's producer.

## Review dispositions

(none yet)
