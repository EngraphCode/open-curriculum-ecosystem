---
name: coordination-fold
classification: active
description: >-
  Fold the live coordination branch to main and rotate — the full
  converge-and-rotate ceremony: ownership-aware dirty-file sweep, merge
  main in with a stale-capture probe, bot fold PR carrying the
  product-gravity line, full-condition merge, day-stamped successor cut,
  branch-labelled surface refresh, rotation broadcast, and a
  wrap-not-closeout loss scan. Invoked at the 24h rule's DUE check, at
  owner word ("fold and rotate", "converge the coordination branch"), or
  before any boundary that needs the coordination record durable on main.
---

# Coordination Fold

Executes the converge-and-rotate shape whose doctrine lives in
[`coordination-branch-24h-lifetime`](../../rules/coordination-branch-24h-lifetime.md)
— the rule owns WHAT and WHEN; this skill owns the ceremony's HOW. The
seat running it is normally the Director/principal (the primary checkout
resides on the coordination branch).

## Preconditions

1. Confirm the primary sits on the live coordination branch and no fold
   PR is already open for it (`gh pr list`).
2. **Working-tree survey with ownership.** Classify every dirty and
   untracked path: (a) own work or settled fleet docs — fold them, with
   authorship named in the commit message for peer-authored files;
   (b) a peer's possible mid-edit — check completeness first (a settled
   edit reads whole: closing signature, complete table row, clean diff
   boundaries) and coordinate on their channel when in doubt. Never
   capture a half-state; never delete or revert anything found
   (`never-use-git-to-remove-work`).
3. **The branch carries shared coordination-home state only** — fleet state, doctrine and
   memory surfaces, the class
   [`coordination-branch-24h-lifetime`](../../rules/coordination-branch-24h-lifetime.md)
   clause 4 names. At the DUE check, read the commits since the cut: a work product with its
   own review contract (a report, a source change, a plan under active edit) belongs on its
   own lane, and the Director routes a seat there at claim time. One found already on the
   branch is never re-cut out of history; the fold PR names it in §Scope, declares its intake by
   its own class (a served document is records-class with verification point merge; a source
   change or a plan under active edit takes the class PDR-140 clauses 1–3 give it) and expects
   the rounds it brings. Worked instance, 2026-09-12: a 470-line exploration report committed
   to the coordination branch drew thirty of the fold's thirty-eight findings, and the fold
   took a day.

## Ceremony

3. Commit by explicit pathspec (`stage-by-explicit-pathspec`);
   lowercase-start subjects (commitlint).
4. `git fetch origin main`, then merge `origin/main` INTO the branch.
   Probe the merge for silent stale-capture reverts (a clean merge can
   still revert an approved newer version — marker-probe suspicious
   files against main) before pushing.
   The napkin resolves as a union of both sides' blocks in time order — unless
   the target branch's napkin was ROTATED since the snapshot, in which case keep
   the rotated file and run the semantic-merge skill's archive-coverage check
   (its step 10): diff every incoming block heading against the rotated napkin
   AND the rotation archive, content-grep before declaring a gap, and carry every
   genuinely absent block under a dated union note. Never filter by timestamp
   alone: the rotation's watermark commit is where to start looking, not the
   test, since a block authored on a third branch before the watermark and
   merged after it would be lost (2026-09-07). Two instrument defects caught at the
   2026-09-07 fold: a time key that failed on a heading written "16:xxZ" and
   sorted that block last (a tolerant key cures it), and a dropped blank line at
   one block joint that the markdownlint hook refused (MD032/MD022) — read the
   printed order before committing. Continuity records are edited on the primary
   by every seat while the fold snapshots them: each later edit re-dirties the
   primary, and the post-merge fast-forward of the primary succeeds only when its
   record files are byte-identical to the branch's blobs (`git cat-file` plus
   `cmp`; a DIFFERS line before the fast-forward is the tell), so the closing seat
   commits the continuity records LAST and mirrors any later edit by hand — two
   folds converged that way on 2026-09-06. A settings file the harness rewrites is
   held out of the sweep until its contract is verified or the owner rules on it;
   each hold is its own — a later harness rewrite is a new hold, never a
   continuation of an earlier one — and the hold's outcome (verified, or ruled and
   landed) is recorded on the live snapshot in the Director's handoff, never here.
5. Push with a 600s timeout; exit codes in-band and unpiped — a piped
   `$?` reads the pipe's tail, not the push.
6. Open the fold PR under BOT identity (mint per merge-bot discipline).
   The body carries the **product-gravity line** (rule Action 3):
   `moved for teachers: … / moved for the Practice: …` — honest, no
   quota, drift made glanceable. The description uses the template's §Scope
   with the records-class intake declared
   ([`pr-lifecycle`](../change-custody/pr-lifecycle/SKILL-CANONICAL.md) §Phase 2);
   cures batch into the declared settlement pushes, never one push per finding.
7. Arm a settle watch (Monitor) whose filter is loud on EVERY terminal
   state (`silence-is-never-liveness`). Full condition = the four
   required checks BY NAME (CodeQL, SonarCloud Code Analysis,
   run-quality-gates, Vercel) all green + zero unresolved review
   threads + MERGEABLE.
8. Bot REST merge at the FETCHED full head sha — fetched at merge time,
   never typed from memory, never expanded from an abbreviation — with
   `merge_method=merge`, never squash.
9. Cut the successor coordination branch per
   [`cut-coordination-branch`](../cut-coordination-branch/SKILL-CANONICAL.md):
   resolve post-fold `origin/main` ONCE and pass the same full sha to
   both the mint and the cut — two separate resolutions race a
   concurrent fetch, so the name records one tip while the branch
   starts at another and the lineage the name carries is false from
   birth:

   ```bash
   git fetch origin main
   BASE="$(git rev-parse origin/main)"
   git switch -c "$(pnpm --silent agent-tools coordination successor-name --base "$BASE")" "$BASE"
   git push -u origin HEAD
   ```

   Never mint by transcription (the sha6 suffix is deliberate
   collision policy and the tool is its single source; F-161 records
   the break a hand-carried form caused). The cut is tree-preserving —
   dirty files carry across — and the primary now resides there. GitHub
   auto-deleting the merged head branch is expected, not loss. If main
   moves again during or just after the ceremony (a lane PR merging
   mid-rotation), merge `origin/main` in and rebuild promptly: until
   that merge, the primary's dist and its generated read models run the
   pre-merge contract, so every seat's primary-dist tooling (renders,
   watchers, sends) is one contract behind — cosmetic for render-time
   formats, load-bearing the day a change alters event files (worked
   instance 2026-08-01: cross-branch format skew read as read-model
   drift).
10. **Refresh every branch-labelled surface**: stop and re-arm the
    heartbeat loop with the new `--branch` label; append the fold entry
    (with the same product-gravity line) to the Director seated block AND
    as a dated tenure entry on the tracked estate-coordination thread
    record — the pickup path for any checkout, since the machine-local
    record is finer grain a successor elsewhere cannot read (a reviewer
    found the pickup map unreachable when the journal had stopped two days
    earlier, 2026-09-08); broadcast the rotation on the canonical comms
    stream so every seat re-homes.

## Wrap-not-closeout

11. The ceremony doubles as the durability wrap at a NON-terminal
    boundary: finish with a loss scan — `git status` clean, no unpushed
    refs, napkin and seated block current — with monitors up and the
    seat live. A terminal boundary (seat or session ending) is
    [`wrap`](../wrap/SKILL-CANONICAL.md)'s moment instead, which this
    skill never substitutes for.

## Related surfaces

- [`coordination-branch-24h-lifetime`](../../rules/coordination-branch-24h-lifetime.md)
  — the doctrine: lifetime, DUE check, what rides the branch.
- [`silence-is-never-liveness`](../../rules/silence-is-never-liveness.md)
  — the settle watch and heartbeat re-arm discipline.
- [`stage-by-explicit-pathspec`](../../rules/stage-by-explicit-pathspec.md),
  [`never-use-git-to-remove-work`](../../rules/never-use-git-to-remove-work.md)
  — the sweep's git discipline.
