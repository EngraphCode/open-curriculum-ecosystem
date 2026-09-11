---
id: upstream-carrier-workflow
node_type: delivery
name: "Upstream carrier workflow — a draft pull request from the fork's main into the default branch whenever main moves"
overview: "A GitHub Actions workflow on the default branch, off by default behind one repository variable, that opens exactly one draft carrier pull request into the default branch at the mirror branch's tip whenever the mirror carries commits the default branch lacks and no carrier is open, with the receipt the cross-fork skill's step 1 reads; it opens as the bot app so the pull request is a first-class pull request on the platform."
status: ratified
ratified_by: "Jim Cresswell (owner)"
ratified_date: 2026-09-11
ratified_where: "Owner card answer of 2026-09-11 09:2xZ in the Director session (Nettle guards Pistil, 2de368): \"Ratify both\"; recorded on the seat record §COMPACTION BOUNDARY 5 and the estate-coordination thread record"
serves: organisational-identity-below-the-tree
impact_areas:
  - practice-and-estate
tickets: []
depends_on:
  - plan: upstream-mirror-workflow
    kind: beneficial
owner_gates: []
last_updated: 2026-09-11
---

# Upstream carrier workflow

## Goal

Upstream movement is staged for integration without a seat noticing it: whenever the fork's
`main` (the mirror) carries commits the default branch lacks, one draft carrier pull request
exists at `main`'s tip carrying the receipt, and seats run the cross-fork skill's semantic
integration on it. The carrier is never merged, moved or duplicated by the workflow. On
2026-09-10 forty-nine upstream commits sat uncarried for a day because the previous producer (a
Codex task) was dark; a seat cut that carrier by hand.

Under the owner's standing rule (2026-09-10: upstream history is never rewritten; the
merge-back is a fast-forward of upstream's commits with the fork's added on top), the carrier
head is upstream's tip exactly, and the seat's integration is a two-parent merge.

## User groups and value

- **Seats**: the carrier arrives with its receipt (repository ids, both tips, exclusive counts,
  the merge base) — the skill's step 1 evidence — instead of a manual fetch and cut.
- **The owner**: the merge-back grows no harder while nobody is watching; every upstream
  release is on the board within a slot.

Minimum shippable shape without the mirror workflow (the `beneficial` dependency): the carrier
reads whatever the mirror branch holds, however it got there — a hand-moved `main` produces a
carrier just the same.

## Decisions (decision-complete, 2026-09-10)

| # | Decision | Verdict and warrant |
| --- | --- | --- |
| 1 | Where the file lives | `.github/workflows/upstream-carrier.yml` on the default branch, for the same `schedule` reason as the mirror. |
| 2 | Off by default | Job-level `if: vars.UPSTREAM_CARRIER_ENABLED == 'true'`. An unset variable evaluates to the empty string, so a copy inherited by upstream at the merge-back runs a skipped job per slot: zero minutes, no write, no notification, the token step never executed. The residual is the skipped-run row in upstream's Actions tab, named for the owner at the merge-back with the mirror's. |
| 3 | No identity in the tree | The default branch from `GET /repos/{owner}/{repo}` (`default_branch`); the mirror branch derived from the same record as `parent.default_branch` (the mirror is by construction the fork's branch of that name; no variable, per the mirror node's decision 3); a repository with `fork=false` exits zero with a notice. The parent's name is read from the same record for the receipt only. The carrier prefix is `automation/upstream-carrier-` and the marker is `<!-- upstream-carrier -->`: neither names an organisation or a product (the previous producer's `engraph-oce-upstream-sync` marker and `automation/oce-upstream-sync-` prefix carried estate identity, ADR-228). |
| 4 | The compare | `GET /repos/{owner}/{repo}/compare/{default}...{mirror}` (both branches of this repository; verified live 2026-09-10: `diverged`, `ahead_by 49`, `behind_by 698` with the default branch 698 ahead and the mirror 49 ahead). A carrier is due when `ahead_by > 0` — status `ahead` or `diverged`; `identical` or `behind` means the mirror is already integrated. The merge base is `.merge_base_commit.sha`; the default tip `.base_commit.sha`; the mirror tip from `GET /repos/{owner}/{repo}/branches/{mirror}` → `.commit.sha`. |
| 5 | The duplicate guard | `GET /repos/{owner}/{repo}/pulls?state=open&base={default}&per_page=100`, filtered to heads in THIS repository (`.head.repo.full_name == env.GITHUB_REPOSITORY`, read from the runner environment inside the `--jq` program because `gh api` carries no `--arg` flag, so a fork-of-the-fork's branch cannot suppress the carrier) matching `^automation/.*upstream` — which also matches the previous producer's prefix, so a race with the Codex task (should it wake with its credit) is harmless. One match → a `::notice` naming it and how far the mirror has moved since, exit 0; never a second carrier, never a moved head. |
| 6 | The writes | Two, both as the bot app: `POST /repos/{owner}/{repo}/git/refs` with `ref=refs/heads/automation/upstream-carrier-{mirrorTip}` and `sha={mirrorTip}` (docs read 2026-09-10; 201, 422 on a name already taken); then `POST /repos/{owner}/{repo}/pulls` with `title`, `head`, `base`, `body`, `draft=true` (the owner's draft's call). |
| 7 | The token | The bot app's installation token minted in the run by `actions/create-github-app-token` pinned at `1b10c78c7865c340bc4f6099eb2f838309f1e8c3` (v3.1.1; inputs `client-id`, `private-key`; output `token`) — the same action, pin and input shape as the estate's `release.yml`, verified in-tree 2026-09-10. Not `GITHUB_TOKEN`: on the fork "Allow GitHub Actions to create and approve pull requests" is off (exploration record observation 5), and a pull request opened by the app is authored by the estate's bot identity, which the merge tooling already recognises. Secrets: `UPSTREAM_CARRIER_APP_CLIENT_ID`, `UPSTREAM_CARRIER_APP_PRIVATE_KEY` (the owner's gate). The app already holds `contents: write` and `pull-requests: write` on the fork — it pushes lane branches and opens pull requests today. |
| 8 | The head and its checks | The carrier head is the mirror's tip exactly; a release tip carries the CI-skip token, so no check runs on it until the seat's slot-word merge gives it a buildable head (the skill's step 3). The workflow does no merge and requests no review: both belong to the seat's integration round. |
| 9 | The receipt (the body) | Marker line; the parent's full name and the mirror branch at its tip; the default branch at its tip; the merge base; `mirror_ahead_by` and `default_ahead_by`; the workflow run URL; the instruction that the head is upstream's snapshot and the seat's merge lands on top. The title is `chore(upstream): carry the mirror at <sha7> into <default>`. Built with `printf`, never a heredoc (a heredoc inside a YAML block scalar carries the file's indentation into the body). |
| 9a | Failure semantics | Nothing to carry → one log line, exit 0. A carrier open → the notice, exit 0. The ref step is idempotent: `GET git/ref/heads/{branch}` → reuse when it already sits at the mirror's tip (an earlier run's pull-request step failed after the ref was created), `::error` and exit 1 when it sits elsewhere (a hand-moved branch: a human decides), create otherwise. Any API refusal under `set -euo pipefail` fails the run; the failure is the notification, and the next slot retries from the reuse path, so a one-off refusal never wedges the producer. |
| 10 | Schedule and concurrency | `30 0,6,12,18 * * 1-5` — thirty minutes after the mirror's slots, so a mirror move in the same slot is carried in the same slot; `workflow_dispatch` retained; concurrency group `upstream-carrier`, `cancel-in-progress: false`. |
| 11 | Formatting and validators | As the mirror: Prettier formats the file; `validate-check-ci-parity` is unaffected. |

### The file (authored verbatim by todo 1)

```yaml
name: Upstream carrier

# Opens one draft carrier pull request into this repository's default branch
# at the mirror branch's tip whenever the mirror carries commits the default
# branch lacks and no carrier is open. It never merges, moves or duplicates a
# carrier: the integration is a seat's work on the carrier. Off by default:
# the job runs only where the repository variable UPSTREAM_CARRIER_ENABLED is
# the string 'true', so a copy inherited by the parent at a merge-back is
# inert there. No repository, organisation or branch is named here: the
# default branch and the mirror branch (this repository's branch of the
# parent's default name) are read from the API at run time.
#
# The compare reports from the HEAD side (the mirror): `ahead` or `diverged`
# with ahead_by > 0 means the mirror carries commits the default branch lacks.

on:
  schedule:
    # Thirty minutes after the mirror workflow's slots, UTC, Monday to Friday.
    - cron: '30 0,6,12,18 * * 1-5'
  workflow_dispatch:

concurrency:
  group: upstream-carrier
  cancel-in-progress: false

permissions: {}

jobs:
  carrier:
    name: Open one draft carrier from the mirror branch into the default branch
    if: vars.UPSTREAM_CARRIER_ENABLED == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
    env:
      CARRIER_PREFIX: automation/upstream-carrier-
      CARRIER_MARKER: '<!-- upstream-carrier -->'
    steps:
      # The bot app's installation token: the run's own token cannot open a
      # pull request here, and a pull request opened by the app is authored
      # by the estate's bot identity.
      - name: Mint the bot app token
        id: app-token
        uses: actions/create-github-app-token@1b10c78c7865c340bc4f6099eb2f838309f1e8c3 # v3.1.1
        with:
          client-id: ${{ secrets.UPSTREAM_CARRIER_APP_CLIENT_ID }}
          private-key: ${{ secrets.UPSTREAM_CARRIER_APP_PRIVATE_KEY }}

      - name: Compare the default branch with the mirror branch
        id: compare
        env:
          GH_TOKEN: ${{ steps.app-token.outputs.token }}
        run: |
          set -euo pipefail
          repo="$(gh api "repos/${GITHUB_REPOSITORY}")"
          if [ "$(jq -r '.fork' <<<"$repo")" != "true" ]; then
            echo "::notice title=Not a fork::${GITHUB_REPOSITORY} has no parent; nothing to carry."
            echo "mirror_ahead_by=0" >>"$GITHUB_OUTPUT"
            exit 0
          fi
          default_branch="$(jq -r '.default_branch' <<<"$repo")"
          parent="$(jq -r '.parent.full_name' <<<"$repo")"
          # The mirror is this repository's branch of the parent's default name.
          MIRROR_BRANCH="$(jq -r '.parent.default_branch' <<<"$repo")"
          comparison="$(gh api "repos/${GITHUB_REPOSITORY}/compare/${default_branch}...${MIRROR_BRANCH}")"
          mirror_tip="$(gh api "repos/${GITHUB_REPOSITORY}/branches/${MIRROR_BRANCH}" --jq '.commit.sha')"
          {
            echo "default_branch=${default_branch}"
            echo "mirror_branch=${MIRROR_BRANCH}"
            echo "parent=${parent}"
            echo "status=$(jq -r '.status' <<<"$comparison")"
            echo "mirror_ahead_by=$(jq -r '.ahead_by' <<<"$comparison")"
            echo "default_ahead_by=$(jq -r '.behind_by' <<<"$comparison")"
            echo "merge_base=$(jq -r '.merge_base_commit.sha' <<<"$comparison")"
            echo "default_tip=$(jq -r '.base_commit.sha' <<<"$comparison")"
            echo "mirror_tip=${mirror_tip}"
          } >>"$GITHUB_OUTPUT"
          echo "compare ${default_branch}...${MIRROR_BRANCH} => $(jq -r '.status' <<<"$comparison") (mirror ahead by $(jq -r '.ahead_by' <<<"$comparison"))"

      - name: Report when the mirror is already integrated
        if: steps.compare.outputs.mirror_ahead_by == '0'
        env:
          MIRROR_BRANCH: ${{ steps.compare.outputs.mirror_branch }}
        run: |
          echo "Nothing to carry: ${MIRROR_BRANCH} holds no commit the default branch lacks."

      - name: Find an open carrier
        id: existing
        if: steps.compare.outputs.mirror_ahead_by != '0'
        env:
          GH_TOKEN: ${{ steps.app-token.outputs.token }}
          DEFAULT_BRANCH: ${{ steps.compare.outputs.default_branch }}
          MIRROR_AHEAD_BY: ${{ steps.compare.outputs.mirror_ahead_by }}
        run: |
          set -euo pipefail
          number="$(gh api "repos/${GITHUB_REPOSITORY}/pulls?state=open&base=${DEFAULT_BRANCH}&per_page=100" \
            --jq '[.[] | select(.head.repo.full_name == env.GITHUB_REPOSITORY and (.head.ref | test("^automation/.*upstream")))] | .[0].number // empty')"
          echo "number=${number}" >>"$GITHUB_OUTPUT"
          if [ -n "$number" ]; then
            echo "::notice title=Carrier already open::PR #${number} is the open carrier; the mirror is now ${MIRROR_AHEAD_BY} commit(s) ahead of the default branch. No new carrier opened."
          fi

      - name: Cut the carrier branch and open the draft pull request
        if: steps.compare.outputs.mirror_ahead_by != '0' && steps.existing.outputs.number == ''
        env:
          GH_TOKEN: ${{ steps.app-token.outputs.token }}
          DEFAULT_BRANCH: ${{ steps.compare.outputs.default_branch }}
          MIRROR_BRANCH: ${{ steps.compare.outputs.mirror_branch }}
          DEFAULT_TIP: ${{ steps.compare.outputs.default_tip }}
          MIRROR_TIP: ${{ steps.compare.outputs.mirror_tip }}
          MERGE_BASE: ${{ steps.compare.outputs.merge_base }}
          MIRROR_AHEAD_BY: ${{ steps.compare.outputs.mirror_ahead_by }}
          DEFAULT_AHEAD_BY: ${{ steps.compare.outputs.default_ahead_by }}
          PARENT: ${{ steps.compare.outputs.parent }}
        run: |
          set -euo pipefail
          branch="${CARRIER_PREFIX}${MIRROR_TIP}"
          # Idempotent: a branch left by an earlier run whose pull-request step
          # failed is reused, so the workflow self-heals instead of answering
          # 422 on the same name at every later slot.
          if existing_sha="$(gh api "repos/${GITHUB_REPOSITORY}/git/ref/heads/${branch}" --jq '.object.sha' 2>/dev/null)"; then
            if [ "$existing_sha" != "$MIRROR_TIP" ]; then
              echo "::error title=Carrier branch at the wrong commit::${branch} exists at ${existing_sha}, not ${MIRROR_TIP}. Delete or move it by hand; this run writes nothing."
              exit 1
            fi
            echo "Reusing ${branch} at ${MIRROR_TIP}."
          else
            gh api --method POST "repos/${GITHUB_REPOSITORY}/git/refs" \
              -f "ref=refs/heads/${branch}" -f "sha=${MIRROR_TIP}" --jq '.ref'
          fi

          body="$(printf '%s\n' \
            "${CARRIER_MARKER}" \
            "" \
            "## Receipt" \
            "" \
            "- Parent: ${PARENT}" \
            "- Mirror: \`${MIRROR_BRANCH}\` at \`${MIRROR_TIP}\`" \
            "- Default branch: \`${DEFAULT_BRANCH}\` at \`${DEFAULT_TIP}\`" \
            "- Merge base: \`${MERGE_BASE}\`" \
            "- Exclusive counts: mirror ahead by ${MIRROR_AHEAD_BY}, default branch ahead by ${DEFAULT_AHEAD_BY}" \
            "- Producer: ${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}" \
            "" \
            "The head is the mirror's tip exactly, upstream's snapshot. A seat integrates it under the" \
            "cross-fork-integration skill: a two-parent merge of the default branch into this branch at" \
            "the slot word, the generated surfaces regenerated, the premise sweep recorded here, then the" \
            "review round and the front door. Merge by merge commit only; never squash or rebase, so the" \
            "snapshot stays in the default branch's ancestry. This workflow opens the carrier and does" \
            "nothing else: it never merges, moves or duplicates it.")"

          number="$(gh api --method POST "repos/${GITHUB_REPOSITORY}/pulls" \
            -f "title=chore(upstream): carry the mirror at ${MIRROR_TIP:0:7} into ${DEFAULT_BRANCH}" \
            -f "head=${branch}" -f "base=${DEFAULT_BRANCH}" -f "body=${body}" -F draft=true --jq '.number')"
          echo "::notice title=Draft carrier opened::PR #${number} at ${branch} (mirror ahead by ${MIRROR_AHEAD_BY})."
```

## Acceptance criteria (each with a proof)

1. With the mirror ahead and no carrier open, one dispatched run opens exactly one draft at the
   mirror's tip with the receipt. Proof `repo-safe`: `gh pr list --head automation/upstream-carrier-<sha>`
   returns one draft; its body carries every receipt field of decision 9; its author is the bot.
2. With a carrier open, a run opens nothing and posts the notice. Proof `repo-safe`: the run log
   and the unchanged open set.
3. A run with the variable unset performs nothing. Proof `repo-safe`: the job skipped.
4. A run with nothing to carry (`mirror_ahead_by` 0) writes nothing. Proof `repo-safe`: the
   "Nothing to carry" line and no ref created.
5. The Codex OCE task and this workflow never both produce a carrier for one tip. Proof
   DISCHARGED 2026-09-11: the owner retired the task ahead of this workflow landing (card
   answer, "I have already retired the Codex task"), so no interval exists in which two
   producers are live and this workflow is the only producer from its first run. The guard's
   prefix match, which also matches the retired producer's prefix, is now belt and braces
   rather than the interval's cover.

## Out of scope

The semantic integration (steps 3–9 of the cross-fork skill are a seat's); merging anything;
requesting reviews; the mirror itself.

## Todos

Gate cleared 2026-09-11: `UPSTREAM_CARRIER_APP_CLIENT_ID` (the app's public client id) and
`UPSTREAM_CARRIER_APP_PRIVATE_KEY` are in the fork's Actions secrets and `UPSTREAM_CARRIER_ENABLED=true`
is set, all through the owner's `gh` at the owner's word (the bot's token scopes carry no secrets
or variables permission). The workflow is inert until the file lands.

1. Author `.github/workflows/upstream-carrier.yml` with the file above; format with Prettier;
   land it on the default branch through the ordinary lane.
2. After the file lands, read the workflow state as the mirror node's todo 2 does, then one
   dispatch against the live board (criteria 1, 2 and 4 as the board allows). Nothing here waits
   on the owner: the gate above is already cleared.
3. Re-true the cross-fork skill's step 1 (the carrier's producer, the new prefix and marker, the
   receipt's fields) and the pr-lifecycle references to the previous producer's marker.

## Review dispositions

Assumptions-expert subagent review, 2026-09-10 (verdict at review time NOT YET, with a shortest path of three items; every item applied below, so the node is decision-complete on the review's own terms; read-only):

| Finding | Disposition |
| --- | --- |
| No failure-semantics decision; the ref/pull-request pair was not idempotent (an orphan branch would wedge every later run at that tip) | Cured: decision 9a and the reuse-or-create ref step; a branch at the wrong commit fails loud for a human. |
| An expression interpolated into a `run:` string in the "Find an open carrier" step | Cured: moved to that step's `env:` (the estate's own convention; CodeQL's remedy shape). |
| `UPSTREAM_MIRROR_BRANCH` with no second instance | Cured: derived from `parent.default_branch`; a non-fork exits zero with a notice. |
| The duplicate guard matched `head.ref` only, so a fork-of-the-fork's branch name could suppress the carrier | Cured: the guard also requires `.head.repo.full_name == $repo`. |
| Decision 2 said less than the mirror's about the merge-back residual | Cured: the same sentence. |
| The gate (the private key's custody) | Confirmed legitimate; unchanged. |

Authoring-time validation, 2026-09-11 (the successor seat at todo 1, as for the mirror node):

| Finding | Disposition |
| --- | --- |
| The "Report when the mirror is already integrated" step's single-line `run:` value is a plain YAML scalar carrying a colon-space (`echo "Nothing to carry: ...`). The file does not parse. | Cured in §The file: a `run: \|` block scalar, matching every other step. The shell command is byte-identical. Same evidence as the mirror node's row. |
| The "Find an open carrier" step passes `--arg repo` to `gh api`. `--arg` is a jq flag and `gh api` has no such flag, so under `set -euo pipefail` the step fails and no carrier is ever opened. The flag entered with the disposition above that added the `.head.repo.full_name` guard. | Cured in §The file and decision 5: the repository is read inside the existing `--jq` program as `env.GITHUB_REPOSITORY`, which the runner always sets. The guard is preserved exactly. Evidence: `gh` 2.97.0 answers `unknown flag: --arg`; the cured call was run read-only against this fork and returned empty, with a control query proving the repository filter matches this fork's one open head and the `^automation/.*upstream` test correctly excludes it. |

Codex review on PR #130, 2026-09-11, carried to the owner rather than actioned:

| Finding | Disposition |
| --- | --- |
| The duplicate guard requests `per_page=100` without `--paginate`, so on a repository with more than one hundred open pull requests targeting the default branch an open carrier outside the first page is invisible and the run opens a second one, against decision 5's promise of exactly one carrier. Unreachable on this repository (a handful of open pull requests); reachable in the deployment context this node designs for, since the file is written to be inherited by the parent at the merge-back. | Carried to the owner with a recommended shape rather than cured, because the node is ratified and this is a design choice, not a transcription defect with one correct form. The shape: `--paginate --slurp` with the filter applied across the flattened pages, since `--paginate` alone applies the `--jq` program per page and would emit one result per page. Until the owner's word the guard holds on this repository and the risk is bounded by its open-pull-request count. |
| The same step's `--arg` flag | Cured at authoring time; see the row above. Codex reached this defect independently of the seat's own parser pass, on the same day. |

Review round on PR #131, 2026-09-11, at the workflow files' landing. Both configured reviewers
bound the tip. Cured: nothing in the file — see the authoring-time table above for the three
defects cured before the first push. Carried to the owner:

| Finding | Disposition |
| --- | --- |
| The comparison and the mirror tip are two separate authenticated requests, so a mirror move between them yields a carrier cut at the new tip whose receipt (merge base, exclusive counts) describes the old one. The mirror and carrier workflows hold separate concurrency groups, so a delayed or manual run can interleave. (Codex, P2) | Carried, not cured: the receipt is wrong only in a race whose window is the gap between two calls seconds apart, and the fix changes which commit the carrier is cut at, which is a behaviour change on ratified text. Recommended shape, verified read-only on 2026-09-11: read `mirror_tip` FIRST, then compare `{default}...{mirror_tip}` — the compare endpoint accepts an immutable sha on the head side (proven against this repository), so both reads describe one snapshot and the second call disappears. There is no field on the compare response that carries the head tip: `commits` is paginated and capped, so `.commits[-1]` is not it. |
| The duplicate guard reads one page of one hundred open pull requests. (Copilot at this tip, and Codex on PR #130 — two independent reviewers, which is why this row now names both) | Carried, not cured, with the recommended shape `--paginate --slurp` and the filter applied across the flattened pages, since `--paginate` alone applies the `--jq` program per page and emits one result per page. |

The two findings compound: a carrier opened in either failure mode is a draft a seat reads before
integrating, so neither can merge anything by itself. That bounds the cost of carrying them to
the owner rather than diverging further from the ratified text in one landing.

Landed 2026-09-11 via PR #131 (merge SHA:ad64f3cd5). Facts established at the landing, recorded
here so the next reader does not re-derive them:

- Both workflows read `state: active` from `GET /repos/{owner}/{repo}/actions/workflows`
  immediately after the file landed, so no `gh workflow enable` was needed. That answers the
  mirror node's decision 10 for a workflow added to a fork AFTER the fork was created, which the
  platform documents nowhere: it behaves like an inherited one.
- **The first dispatch is an OWNER act.** `POST .../actions/workflows/{id}/dispatches` as the bot
  answers 403 `Resource not accessible by integration`: the bot app holds no `actions` permission
  and the token-scope table mints none. The action map in
  `.agent/rules/bot-identity-on-third-party-systems.md` routes every other POST to the bot and
  forbids reaching for the operator's credential outside its listed rows, so the seat cannot
  dispatch under the owner's `gh` either. Either the owner dispatches, or the schedule delivers
  the first run unaided — 18:00 UTC for the mirror and 18:30 UTC for the carrier on the landing
  day.

Second review round on PR #131, 2026-09-11. Carried to the owner:

| Finding | Disposition |
| --- | --- |
| The carrier never checks the mirror against the parent. A commit on the mirror that did not come from upstream still counts toward `mirror_ahead_by`, so the carrier is cut at it and the receipt calls it "upstream's snapshot" — a false statement in the artefact the integrating seat trusts. (Copilot; the reviewer called it mandatory) | Carried, not cured, and the strongest finding this lane carried. Bounded by two facts: the mirror workflow's only write is a `force=false` fast-forward to the parent's tip, so it cannot itself create the condition, and when the condition exists the mirror workflow already fails loud with the compare link, so the estate detects it. What is missing is a gate on the carrier, not the detection. Recommended shape, the reviewer's own: compare the mirror with the parent before comparing it with the default branch, and fail unless the mirror is identical to or behind the parent, an older valid snapshot being acceptable. |
