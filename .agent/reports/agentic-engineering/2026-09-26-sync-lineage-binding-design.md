# The sync-lineage binding cure: design note (2026-09-26)

Swallow holds Drift (516619). Status: ready-to-build, deferred by the Director's ruling of 12:5xZ until the review-cost survey shows sync-only tip moves costing rounds (the measured datum on 2026-09-26: one sync-only move in seven across the reviewed tips of PRs 241, 216, 227 and 229). The exec-binding plan node's toolkit item points here. Written in a seat's session and graduated here at the compaction boundary.


Problem. `pr-watch` binds a review leg to the head by EXACT commit oid (`reviewer-legs.ts`
`bindsTip`; `settlement.ts` quietWindowAnchor and bodyTallyEvidence; `completion-evidence.ts`
filters). Every sync merge moves the head, so a leg that reviewed the content must be re-requested
and re-run on unchanged content: the self-inflicted rounds (six on 241, five on 216, one each on
227 and 229 in one evening).

Cure, one behavioural claim. A review binds the head when the head's CONTENT against the default
branch is the content the reviewer saw. Content = the patch of `merge-base(base, C)..C`, compared
by `git patch-id --stable` (whitespace-stable, sha-independent). If patch-id(reviewed commit) ==
patch-id(head), the review binds; otherwise it does not (UNPROVEN, as now). A pure sync lineage
(one or more merges of the default branch into the branch, resolving nothing that changes the
PR's own diff) has equal patch-ids by construction; a conflict resolution that changes the PR's
diff does not, and correctly re-opens the leg. No merge-commit structure is inspected, so the
claim does not depend on how the sync was made (local merge, GitHub's branch update, rebase).

Where. A new pure module `content-lineage.ts` in `pr-watch`: `contentIdOf(git, base, commit)`
returning the patch-id (or UNPROVEN when the merge-base or diff cannot be read); `bindsContent(
review, head, contentIdOf)`. `bindsTip` keeps the exact match as the fast path and falls back to
content binding. The three call sites read through the one predicate. The git reads use the
trusted git (`core/trusted-git.ts`) on the seat's clone, fetching the reviewed commit if absent.
Base is the PR's `baseRefName` at origin. Evidence line on the verdict names the binding kind:
`bound by content (patch-id ab12…, reviewed at 62b2d41, head bf4ceb2)` so a reader sees the
inference.

Not in scope. Re-requesting legs (the seat tooling stops re-requesting once binding holds; a
docs line in pr-lifecycle §Phase 7). The GitHub ruleset's own "dismiss stale reviews" setting
(the owner's; the bot merge reads the verdict, the ruleset reads approvals; Copilot and Codex
post COMMENTED reviews, not approvals, so the ruleset is not the binding surface).

Tests describe behaviour: a review at C binds head H after a clean sync merge; does not bind
after a resolution that changes the PR's diff; does not bind when the reviewed commit is not in
the clone (UNPROVEN, never a wildcard); the exact-oid path still binds; whitespace-only
reformatting by the sync does not unbind (stable patch-id). Smoke on real git (test:e2e), unit
tests on the pure predicate with fixture patch-ids.

Falsifier for the design. If patch-id equality holds while a semantic change slipped in (a sync
that changed a file the PR also touches, with the PR's hunks re-applied identically), the
reviewer's verdict was on the same hunks against different context; the checks on the new head
cover the context. Recorded as the residual.

## Revision after the pre-execution code-expert review (12:55Z)

Verdict: REVISE FIRST. The findings, each taken:

1. The cited cost is not in the data. The reviewer harvested the bot reviews on PRs 241, 216, 227
   and 229 and hashed each reviewed tip's `merge-base..tip` diff: of seven tip moves across
   eleven reviewed tips, ONE was sync-only (227, `b83f019a` to `fd1bc548`, equal ids); the others
   carried content (241's sync `2458002c` also carried the edit `ee622fd7`; 216 and 229 had no
   sync at all). The landing slot already bounds syncs to one per PR. So the mechanism is sound
   and the yield is unproven: re-ground on measured rounds before building
   (`verify-data-supports-shape-before-building`). Decision: the cure waits until the survey
   shows sync-only tip moves at a rate that costs rounds; today's datum is 1 of 7.
2. `git patch-id --stable` ignores whitespace (a dedent hashes the same); use `--verbatim`, which
   still ignores index lines and hunk numbers. The "whitespace does not unbind" test inverts.
3. An empty diff (a PR whose content is already on base) hashes to nothing with exit 0; empty
   output is UNPROVEN, never a match.
4. The reader has no clone: `state-gh.ts` composes only a gh executor and `--repo` may be foreign;
   a fetch is a network write from a reader. Route: the compare endpoint's diff
   (`Accept: application/vnd.github.diff`, `compare/{base}...{oid}`) piped into `git patch-id
   --verbatim` as a stdin hash only; verified equal to local ids on PR 245's three tips. Add
   `baseRefName` to the state view fields; validate the oid and base ref before interpolation;
   any error, size limit or empty diff reads UNPROVEN.
5. Five call sites, not three (reviewer-legs `bindsTip`; settlement's anchor and body tally;
   completion-evidence's two filters). Shape: `state-gh.ts` computes a typed content leg per
   distinct landed expected-reviewer oid inside the tip-consistent loop; a pure
   `bindsHead(review, reading)` in `content-binding.ts` returns `exact | content(id) |
   unbound(reason)`; every evidence string derives from it; Result, never a nullable.
6. Quiet window: a content-bound review predates the head, so a synced PR reads SETTLE-READY at
   first green; state it as the intent in the design and in the SKILL's items 3 and 4
   ("tip-bound"), which the code cites as canonical.
7. Wording: the context-change limit is a decision, not a residual; gh plus git is network IO, so
   the proof is one recorded observation and the tests inject fake executors.

Tests (behaviour, from the review): exact binds; content-equal binds with both shas in the
evidence; content-different OWED; oid missing OWED with reason; empty commit oid never binds; head
unproven falls back to exact only; a content-bound review anchors the window; a content-equal
completion comment is not refused; adapter: gh failure and empty diff read unproven, a malformed
oid never reaches the executor. Mutation-check each. The merge bot is unaffected (`putMerge` pins
the head sha; `--expect` gates the set).
