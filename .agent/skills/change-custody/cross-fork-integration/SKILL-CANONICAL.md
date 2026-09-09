---
name: cross-fork-integration
classification: active
description: >-
  Integrate an upstream lineage's default branch into this fork's as a semantic
  event, never a text merge: verify the mirror and carrier, merge-tree against
  the live tip, one two-parent merge with an ordinary message, regenerate the
  generated surfaces, reconcile memory files by concept, sweep the fork's
  documents and plans for premises the change refutes, resolve numbering
  collisions, land by merge commit under the required checks.
  Use when a sync carrier exists or is due, when GitHub calls a sync dirty that
  git merges cleanly, or when a fork-only document reads stale after an upstream
  change. Not for two branches of one lineage (complex-merge), memory files
  alone (semantic-merge), or curing upstream code here (route it upstream).
  Right: one carrier, one merge commit, docs re-trued in the same landing, the
  tree diff against upstream equal to the enumerated fork diff. Wrong: squash or
  rebase; a release-commit head that runs no check; hand-edited generated
  pages; plans still asserting what upstream refuted.
---

# Cross-fork integration

## Why this exists

This line is a fork that syncs from its upstream by merge, forever. Each sync
leaves a merge commit upstream never sees, so the fork's tree is upstream's
tree plus a deliberate, enumerated, regenerable diff — and the check that it
still is so is a tree diff, never an ancestry test. Git proves that the text of
two histories combines. It has no conception of meaning, and an integration
changes meaning in four places git cannot see:

| Layer | What changes | What proves it | Who does it |
| --- | --- | --- | --- |
| Code | signatures, contracts, imports | type-check, tests, the required checks on a combined candidate | the gates |
| Generated surfaces | anchored excerpts, adapters, corpora, codegen | each generator's own check (byte equality, `--check`) | the generators |
| Memory and state files | narratives, registers, thread records with a `merge_class` | concept-level reconciliation | semantic-merge |
| Documents and plans | premises stated as fact | a premise sweep by reading | this skill, §6 |

The fourth row is the one this skill adds. On 2026-09-09 an upstream change
that touched no plan file left three delivery plans and one research record on
this fork asserting that Oak's within-thread unit order was published on no
surface, the day after upstream began serving it. Every one of those files
merged cleanly. The owner's word that day: "plans and all documentation always
need to be kept up to date, and that always requires semantic analysis, git has
no conception of meaning."

## Authority frame

- **Upstream's mechanism is authoritative for shared mechanism.** A reviewer
  finding about upstream code is never cured on the fork; it is routed as an
  upstream report or a fork lane, and the thread is resolved on that route.
- **The fork holds its own product authority.** An upstream product decision
  arriving through a sync is a fact about upstream, not a constraint here,
  unless the owner adopts it.
- **Fork diffs are deliberate, enumerated and regenerable.** Organisational
  identity lives below the tree (ADR-228); a hand-carried prose divergence that
  upstream also edits conflicts at every sync and is a defect to remove.
- **Numbering across lineages.** ADRs, PDRs and plan ids are minted
  sequentially from the highest existing record on the lineage being edited.
  When a sync reveals that upstream has taken a number the fork also used, the
  fork's record is renumbered to the next free number in the sync's own commit,
  with every citation updated; the fork never reserves a block, because a block
  is estate identity carried in the tree.

## The procedure

### 1. Verify the mirror and the carrier before touching anything

- Live identities: the fork's repository id, its parent's id, and the default
  branch name — read from the repository service, never assumed.
- The upstream tip: fetched read-only (`git fetch upstream <default>`; the
  remote's push URL is disabled). Compare with the carrier's head: a newer
  upstream tip queues as the NEXT carrier; a reviewed head is not moved.
- The carrier: exactly one open sync pull request. A second carrier for the
  same lineage is a defect; close it on the record.
- Exclusive counts both ways, from fetched history, and the merge base.

### 2. Recompute the merge against the live tip, not the PR's cached base

`git merge-tree --write-tree --name-only <default-tip> <carrier-head>` is the
truth. GitHub's `mergeable` reads the pull request's cached base and does not
recognise renames the fork made (a file moved into a `paused/` folder that
upstream appended to reports as modify/delete there and merges cleanly here).
Record both readings; act on the local one; say why they differ in the PR.

### 3. Carry the snapshot on one two-parent merge with an ordinary message

Work in a dedicated worktree on the carrier branch (set-up-worktree-lane:
explicit start point, inherited bot identity verified, dependencies installed,
the local env file carried). Merge the default branch INTO the carrier with the
owner as author and the bot as committer, `--no-ff`, and a message that names
the situation without spelling the CI-skip token anywhere in the message — the
host scans the whole head message, and a head that is upstream's release commit
runs no workflow at all. The head that lands must be a commit whose checks ran.

### 4. Make every generated surface true again

Run the generators, never edit their output: the MCP content workspace
(`build-mcp-content-workspace`, checked by byte equality), the skills adapters,
SDK codegen when the spec moved, corpus data when the bulk moved. Then the
repository validators. A generated page that drifted is regenerated whole; a
generator that refuses is a defect to cure in the generator.

### 5. Reconcile memory and state files by concept

Any file carrying a `merge_class` follows the semantic-merge skill: the union is
read as concepts (a thread's identity table, its newest-section witness, its
link targets), and a clean auto-merge is not evidence of a correct one.

### 6. Sweep the fork's documents and plans for refuted premises

Derive the sweep terms from the incoming change's claims, never from its file
list and never from the reviews:

- upstream's own retraction list (its thread record, ADR amendments, changelog
  and PR body name the wording it withdrew);
- the new facts the diff introduces (a version, a shape, a served field, a
  count);
- the old facts those replace (the negations: "unordered", "published on no
  surface", "not yet", the previous version string).

Search the surfaces upstream's sweep could not reach, because they exist only
here: delivery and strategic plans, runbooks, research and report records,
executive memory, fork-only governance pages. For every hit choose one
disposition and write it down in the PR:

- **re-true** — a permanent document (a plan body, an authority index) gets the
  true statement, dated where the schema dates it;
- **narrow** — a plan whose request or scope is partly overtaken keeps the
  residue that is still true and says what overtook the rest;
- **archive as overtaken** — a plan whose whole premise upstream delivered
  moves to the archive with the overtaking change named;
- **addendum** — a dated record (a report with reopening triggers, a review
  record) is never rewritten; it gains a dated section stating which trigger
  fired and what stands.

The sweep is complete when a second pass over the same terms finds nothing new.
Its cost is a read; its absence is a fork estate that lies about upstream.

### 7. Resolve numbering and naming collisions

ADRs, PDRs, plan ids, generated file names: renumber the fork's own record per
the authority frame, in this commit, with citations. Confirm the index rows.

### 8. Open the round, settle, land

Undraft; declare the review tally at open (pr-lifecycle §review-round state
machine); harvest every thread. Findings about the sync itself are cured here;
findings about upstream code are routed and resolved on the route. Settle at
green by name (`run-quality-gates`, `CodeQL`) and clean (zero unresolved,
`CLEAN`, the quiet window). Merge by MERGE COMMIT with the head pinned, as the
bot; squash or rebase would diverge the history from upstream and make the next
sync a conflict.

### 9. Prove the landing and close the carrier

- The merge commit's second parent is the carrier head; the default branch's
  tree differs from upstream's tip only by the enumerated fork diff
  (`git diff --stat <default> <upstream-tip>` read against the list).
- Post-merge reviews harvested; the carrier branch deleted after the ancestry
  proof; the worktree removed.
- The landing recorded where the fork's continuity lives; the next upstream tip,
  if any, becomes a new carrier named for its own sha.

## Failure shapes this skill exists to prevent

- A head that is upstream's release commit, so the required checks never run
  and the pull request reads pending forever.
- Trusting GitHub's dirty verdict over a clean local merge-tree, or the reverse
  without saying which was read.
- Curing an upstream finding on the fork, diverging the tree at the next sync.
- Regenerating one page by hand because "only the excerpt changed".
- Merging a memory file on the conflict count.
- Plans and reports left asserting the state before the sync — the class this
  skill was written for.
- A reserved fork block of ADR numbers.
- Squash or rebase on a sync.
- Moving a reviewed carrier head to a newer upstream tip mid-review.

## Related surfaces

- `.agent/rules/pre-merge-divergence-analysis.md` and
  `docs/engineering/pre-merge-analysis.md` — the cascade classes; §4i is the
  premise cascade this skill runs.
- `.agent/skills/change-custody/semantic-merge/SKILL-CANONICAL.md` — layer 3.
- `.agent/skills/change-custody/complex-merge/SKILL-CANONICAL.md` — two
  branches of one lineage.
- `.agent/plans/runbooks/sync-default-branch-past-a-skip-ci-upstream-tip.plan.md`
  — the empty-commit recipe when the carrier head must stay upstream's tip.
- `.agent/skills/set-up-worktree-lane/SKILL-CANONICAL.md` — the worktree.
- `docs/architecture/architectural-decisions/228-organisational-identity-below-the-tree.md`
  — why the fork diff is enumerated and identity-free.
