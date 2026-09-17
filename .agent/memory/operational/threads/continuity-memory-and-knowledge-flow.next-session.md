# Next-Session Record — `continuity-memory-and-knowledge-flow`

Thread identity: **`continuity-memory-and-knowledge-flow`** — the knowledge-flow
substrate work: per-user platform memory as a drainable buffer (PDR-124, the
amended `per-user-memory-is-a-buffer` lifecycle), definition-surface context
economy, and the session-open context budget. Distinct from
`agentic-engineering-enhancements` (Practice curation broadly) — this thread
owns the *memory/context substrate* lane it spawned from the 2026-07-03
"exploring context usage" session.

## Current Continuation

- **Branch**: `feat/corpus_research_enhancements` (shared with the corpus
  salvage lane; no branch of its own).
- **Invocation pointer**: continue `continuity-memory-and-knowledge-flow` from
  this record.
- **Controlling plan**:
  `claude-memory-buffer-drain.plan.md` (`../../../plans/agentic-engineering-enhancements/archive/completed/claude-memory-buffer-drain.plan.md`)
  — **COMPLETED and archived 2026-07-05**; its §Closeout carries the
  honest verdict (complete).
- **Next safe step** (2026-09-14, after the resume): PR #144 (the
  operator-profile JSON Schema, validator, fixtures, tests, contract smoke,
  `pnpm profile:check`, the Practice-index pointer) MERGED as `4540dec49`;
  engraph merged into the coordination branch; PDR-141's amendment (the
  contract, the `machine` kind, the optional git-synced root) and the
  start-right and README updates landed. The profile at
  `~/.practice/profile/` is the owner's private git repository, pushed
  (its remote is recorded in the profile's own index, never here — PDR-141
  decision 11). The sync tool (`pnpm profile:sync pull` and `push`, the check's
  sync leg, PDR-141 decisions 13 to 16) landed 2026-09-15 as PR #145
  (`0f3168369`), after the owner's one-push raise for the IO cure `318a2ea21`.
  The Practice index's operator-profile row names `pnpm profile:sync pull` at
  session open and `push` after a write; start-right §3a runs the pull ahead of
  the check since `c9abf6ce9` (2026-09-15). Its homed follow-ups (round three and four findings,
  #144's suppressed items) are the operator-profile follow-up PR, the
  estate-coordination LANDINGS pickup 3. The gate defect that held
  it (a settled pull request behind a moved base) is cured by #146,
  `048f377fa`. Remaining: (1) the
  directive-bound entries in `pending-graduations.md` (twelve at 2026-09-17,
  including the orientation re-point to PDR-141 and the owner's two 2026-09-14
  rulings) land in the directive pass the resume point below orders;
  (2) done 2026-09-14 at PR #143's landing (`e474e883e`): the last held buffer
  memory (`verified-correct-is-not-a-proportionality-test`) deleted; (3) done
  the same day: PDR-141 Accepted (owner-ratified, `dd813b6ef`) and the
  seeded profile ratified with three owner additions (Castr and
  jimcresswell.net as consumers, British English always, Oak systems off
  limits on Engraph forks always); (4) the three pickup fixtures posted on
  #144 become tests when a recorded input reaches them. The first drain (2026-07-05) was complete end-to-end
  (all strata; index empty, live-only, untruncated; every entry file
  terminally marked). The per-user buffer lifecycle
  continues under `per-user-memory-is-a-buffer`: the buffer accretes again
  in normal use and drains when its index grows, using the completed
  plan's proven loop shape. Two named descendants of the drain live
  elsewhere: the ADR-200 intent-layer build (the eight seed statements sit
  in the `mechanism-without-legible-intent` pattern §Intent-Layer Seed
  Material) and the OQ-10 markdown-to-graph inversion ADR authoring
  session (repo-continuity §Open Owner-Decision Items #10, now citing
  ADR-173 §The estate is plural by design as decision input) — both
  belong to the strategy-and-plan-estate lane, not this thread.
- **Completed prerequisites**: PDR-124 landed + 15 agent descriptions
  converged (`6b7c496ab`); drain plan + Loop 0 landed (`d0003293b`) — index
  reconciled to whole (17 orphan lines appended; directory listing is the
  authoritative census); no-fallback reconciliation landed (`c14866649`);
  F-112 commit-workflow fix landed and archived (unblocks per-loop commits);
  **Stratum A complete 2026-07-03** — 8 graduated entries verified in their
  homes first-hand, index lines retired, index at 232 lines / 240 files;
  **Stratum B complete 2026-07-03** — all 28 `project_*`/`reference_*` entries
  dispositioned first-hand: 13 duplicates (homes verified), 6 superseded
  (evidence read at delete-stakes), 8 enriched/re-homed (PDR-124 §Context 80k
  budget definition; PDR-119 family-scope owner direction; collab-protocol
  plan §Status M4-crosswalk note; pr-lifecycle Phase 4/7 merge-gate and
  CI-diagnosis clauses; shared-credentials rule forensics clause; AEE thread
  Lane E specialist-overhaul re-home; agent-operability four-facet collation
  re-home), 27 index lines retired (memory-side retirement executed
  immediately after the batch commit landed, per the order-of-operations
  standing decision); **1 kept live**:
  `feedback`-adjacent `project_oak_three_strategic_pillars` → its home is
  `.agent/directives/editorial-tone.md` (a directive; PDR-052 defers the fold
  to a fresh-context <30% moment — first fold action of a fresh loop);
  **Stratum B fully closed 2026-07-04**: the pillars fold landed
  (`46ff52892`, editorial-tone §"The strategic frame — imply, never state")
  and the entry retired; **Stratum C C-1 complete 2026-07-04** (`8f788c837`
  plus one clause via `558f046af` — peer staging race, lossless, provenance
  in comms): 12 entries dispositioned, 7 duplicates verified, 6 enrichments
  landed (session-handoff 6e.1 upstream-ref craft;
  dont-break-build fix-regardless-of-location; testing-patterns flaky-test
  disposition; stage-by-explicit-pathspec run-the-fix-freely; napkin skill
  never-withhold; build-system run-vs-construction-verified),
  docs-adr-expert reviewed pre-commit; index at 192 lines / 234 files, zero
  unmarked orphans.
- **Acceptance bar**: the drain plan's five acceptance criteria (every entry
  file dispositioned; index live-only and untruncated; substance conserved;
  per-loop commits green; honest value-and-impact closeout).
- **Team expectation**: single-owner lane by default; check for a live
  `git:index/head` claim from the corpus-salvage lane (shared branch) before
  staging.

### 2026-09-16 — the owner's dedicated consolidation session, IN PROGRESS: the resume point

Zephyr guards Leeward (281e44), mode dedicated-knowledge-curation; curator claim `47cfcbeb` in the
second context. Owner goal verbatim: "the goal is knowledge curation, not chasing fitness numbers
… Done means empty pending graduations and empty buffers." Owner priorities, 2026-09-17,
verbatim: "the priorities are drainable buffers to EMPTY, then memory files to an optimised soft";
"Directives and other doctrine documents I am less concerned about, and they need very careful
analysis anyway"; "the goal is always to preserve knowledge, never to move towards numerical
targets".

**Landed.** The first context (2026-09-16) folded #150, graduated the napkin, comms and letters
(`63b544464`, three governing texts cured), and rotated the napkin (`8c48a6669`). The second
(2026-09-17) folded #152 (`cd847a2b3`) after a pre-publication claim pass and three rounds, then
on `coordination/2026-09-17-cd847a`: the CodeQL exception re-trued to the tracked exclusion
(`f073db95f`); the Practice Box cleared with its carries in the agentic-engineering-enhancements
record's exchange lane, and the drained-memory citation sweep (`9cdeace24`); PDR-117 and PDR-141
amended, frictions F-189 and F-190, the fold's routed findings, consolidate-until-done's
directive-shape step and the distilled lifecycle entry (`49b6c3ae9`); then the records, the
napkin's graduations and its rotation. The third (2026-09-17, after compaction) opened the ARC
channel with Dynamo turns Temper, ran #153's pre-publication claim pass (four verifiers, 33
findings, every one true at its source) and committed the cures, including F-191's correction:
`agent-tools session-metadata` reads context usage.

**Buffers.** `open-questions.md` and `distilled.md` are empty. `pending-graduations.md` holds twelve
directive-bound entries: the eleven carried, and the owner's lifecycle decision below. The napkin
was rotated (`2c81c5d22`) and holds the second and third contexts' wraps. Of the
other assistants' memory, read on 2026-09-16: the Claude per-user buffer holds five strictly local
entries, Cursor is unchanged since 2026-06-04, Gemini has none, and Codex's `MEMORY.md` OCE groups
were read with no recorded disposition, which the next pass confirms first-hand.

**Owner decision taken, 2026-09-17.** Finished history in continuity records and registers is
graduated, then archived ("Graduate, then archive"), like the napkin: behaviour-changing entries
graduate first, finished history moves to a dated archive proven byte-identical, live state stays,
a named skill step triggers it, and every growing surface carries fitness coverage. Registered as
a due entry in `pending-graduations.md`, because `continuity-practice.md` still says "never
archive" until its directive text changes.

**Owner decisions open.** (1) PDR-008 (F-189): the host renames its gate scripts, or the Core drops
Rule 4's `check` exception. (2) The upstream-sync naming lane (repo-continuity pickup item 3),
where this seat's verdict is to rename.

**A second seat and a sequencing constraint.** Dynamo turns Temper (2a4c8a, claim `35006027`) runs
the Oak integration lane (owner-approved 2026-09-17): a fresh carrier of Oak main into `engraph`
in its own worktree, superseding #151. Owner's word, in its team-start event `852e7764`: that lane
merges nothing until this consolidation's `coordination/2026-09-17-cd847a` fold lands on
`engraph`. So the fold of #153 gates it, and #153 already carries a complete set of work.

**Next, in the owner's order.**

1. Fold #153 on 2026-09-17, before the rollover, with its own pre-publication claim pass,
   because the integration lane's slot waits on it (this seat's decision after the second
   context's compaction, reported to the owner); later consolidation work rides the next
   successor. Tell Dynamo turns Temper when it lands, on the ARC channel and in the rotation
   broadcast. State at the third context's wrap: the pass is done and its cures are committed;
   next are the description (a new bullet for the cure commit, "ten rules" not nine, and the
   pass result under Validation), ready, the review rounds under budget 2, and the front door.
   At resume, re-arm the comms watcher and the ARC tail, and read the comms stream from 16:04Z
   (the watcher's expiry gap) and the ARC channel from its last entry.
2. The directive pass in a fresh context below 30 %, with careful analysis: the twelve entries in
   `pending-graduations.md`, the IO invariant and the lifecycle decision first among them. The
   30 % is read, not estimated: `agent-tools session-metadata --vendor claude --model <id>
   --session-id <id>`, with the same-size `claude-opus-4-8[1m]` entry standing in for Opus 5
   until F-191's window-registry lane lands.
3. Memory files to an optimised soft, once the lifecycle's directive text and trigger step have
   landed: graduate, then archive, the finished history of `repo-continuity.md`, the
   agentic-engineering-enhancements and estate-coordination thread records,
   `director-handoff.md`, the paused mcp-submission-drive record and `frictions-register.md`.
4. Carried from the first context and not yet homed: knip's "Remove from ignoreBinaries" hints
   (`lsof`, `ps`), a configuration cure in its own lane; and the Claude per-user RESUME HEADS
   pointers, re-trued at each wrap.
5. The remaining pickups in repo-continuity (slice 1's other half, the owed PRs and the 1.181.3
   work list, TypeScript strictness).

Rulings that hold: directive edits below 30 % context; the 24-hour branch lifetime (the successor
is stamped 2026-09-17 and falls due at 2026-09-18 00:00Z); the commit is the gate.

## Standing decisions this thread carries forward

- **No ledger**: the reconciled index IS the work-list (line retires only on
  disposition). The plan skill's apply-all-of-X ledger clause is deliberately
  not followed (`permanent-doc-is-the-consolidation-record` supremacy clause).
- **Order of operations**: repo home lands and commits BEFORE the memory-side
  marker/retirement (the memory dir is unversioned — deletion is
  irreversible).
- **PDR-098 recurrence check on every duplicate.** Known live instance:
  `feedback_validate_specialist_findings_before_acting` — the owner re-raised
  "critically assess subagent results" on 2026-07-03 while the entry sat in
  the buffer; recurrence treatment, not silent duplicate-retire.
- **PDR-052 guard**: graduations editing `.agent/directives/*` defer to a
  fresh-context moment with the <30% check.

## Promotion watchlist (Stratum C forward notes)

- **`feedback_validate_specialist_findings_before_acting` carries a DECIDED recurrence
  verdict**: the ws1b pass (Vega mends Oblivion, 2026-07-03 napkin entry "ninth-reinforcement
  question DECIDED") concluded no new clause is needed — `verify-dont-trust` already carries the
  multi-clause subagent-output discipline and the gap is firing, not text. When Stratum C reaches
  this entry, disposition against THAT verdict (recurrence-checked duplicate), not a fresh
  analysis.
- **The index may still truncate at injection until Stratum C progresses** (205 lines /
  ~39KB is near the harness threshold) — the read-from-disk standing decision covers
  correctness; expect the injected copy to be partial.

- `feedback_no_cheap_cure_option` and `feedback_opus_team_quota_ceiling`
  carry in-body graduation/home mentions WITHOUT index markers (old
  2026-05-02 graduation note to `principles.md §Architectural Excellence Over
  Expediency`; incidental rule mentions). Treat as verify-and-enrich against
  the named homes — the no-cheap-cure entry's later "unless-tell" addition
  (2026-06-06) may not be in principles.md yet.
- The drain plan's `todos:` frontmatter is the batch tracker; keep it current
  per loop.

## Session history

- **2026-09-14 — Zephyr guards Leeward (claude-code / claude-fable-5-1 / 281e44), THE SECOND
  DEDICATED DRAIN OF THE CLAUDE BUFFER, COMPLETE** (owner's ask: load the full Claude memory,
  disposition it to permanent cross-vendor homes, leave only what strictly belongs local; n=1,
  no Director seated). Corpus: 495 files, 1.5 MB, read first-hand in ten batches; nine Sonnet
  general-purpose mappers wrote per-batch corroboration reports and one Fable validator
  resampled 25 files against them (the owner's mid-turn addition). Dispositions: graduated
  (a clause written into an existing home), already carried (home verified, file retired),
  refuted (stale, e.g. the lifted Linear write freeze; the worktree-entry grant contradicted by
  `worktree-residency`), strictly local (owner-sensitive), directive-bound (queued). Landed:
  `f24683337` (Kinkajou's docs-only block swept at the owner's word, attributed) and
  `0e4173b43` (62 files: 33 rules, PDR-026/027/117, owner-signal-interpretation, seven skills,
  six docs, two plans, the ledger, frictions F-184, six pending-graduations entries,
  repo-continuity's no-throw and October rulings, two new files — the Workflow tool operating
  notes and Forge's delight reflection). Buffer side: 488 files retired after the commit; the
  index rewritten to seven survivors; the resume-heads file reduced to pointers (its 205 KB of
  TAIL blocks were handovers already in thread records; full text in the backup tarball); the
  operator profile seeded at `.agent/operator-local/profile.md`, untracked, every item marked
  inferred for ratification. Held in the buffer by design: the first-major-release T0 rulings,
  the fork-naming ruling, the progression strand, the licensing handling residue, and the
  verified-correct memory until PR #143 lands. Next: a fresh seat under the 30% budget lands
  the six due entries in pending-graduations (editorial-tone, principles ×2, testing-strategy
  ×2, validation-strategy); the owner ratifies or amends the profile; at #143's landing the
  last held memory is deleted.
- **2026-07-05 — Hedgehog stirs Rime (claude-code / fable-5 / da727a), STRATUM D COMPLETE —
  DRAIN COMPLETE, PLAN ARCHIVED** (second session at this seat, post-compaction head): the full
  Stratum D queue landed in five commits. `7f4988c63` — user-collaboration split_strategy
  executed (owner-signal-interpretation.md is the new executive-memory companion carrying
  hedged-statement, demonstrated-action, and the full depth of direction-is-a-stream +
  direction-scope) plus the three deferred folds; `b10d90dc0` — principles.md §Decision Lenses
  either/or coda; `35cf09bf9` — design-from-impact-not-the-cowpath rule authored (four-entry
  design-agency unit + adapters + RULES_INDEX; the owner-named term "cowpath" carried; the rule
  NAME is open to owner re-ratification); `b839fe03d` — the intent-and-mechanism doctrine
  (mechanism-without-legible-intent pattern with the eight assertions as ADR-200 seed; PDR-038
  §Un-communicated intent bidirectional amendment; owner-working-style.md RETIRED per the
  owner's reframe — the home pre-decision resolved by dissolution; user-collaboration §Owner
  Signals Express Practice Intent carries the interpretive residue); `7d424cc9d` — crosswalk +
  derive-controlled-surface patterns, build_vs_buy into plan-skill §Build-vs-Buy Before
  Build-Shape + invoke-code-experts reviewer-scheduling, graphs_as_method into ADR-173 §The
  estate is plural by design (OQ-10 cites it). Final census exact (three marker generations;
  zero unmarked; index at zero lines). Batches 1-2 docs-adr-expert-reviewed; the reviewer died
  on the org monthly spend limit at batch 3 — batches 3-4 grounded first-hand per the
  classifier-unavailable clause. PDR-105 reference-direction validator caught one
  doctrine→ephemeral link pre-commit (cure: cite the durable home). Plan archived to
  `archive/completed/` with the closeout verdict: complete.
- **2026-07-05 — Hedgehog stirs Rime (claude-code / fable-5 / da727a), STRATUM C COMPLETE**:
  the completion goal landed. All 212 `feedback_*` files dispositioned first-hand across the
  session's 12 commits (`b21bafa39` head fold; `7920215df`…`d3e1b6fed` C-2..C-15;
  `e8b3eb986` the nine PDR-052-deferred directive folds at the post-compaction fresh
  boundary; `74eaecd6b`…`46b50e24e` C-16..C-25 plus the waypoint refreshes). Index at 12
  live-only lines mapping ONE-TO-ONE to the ROUTED-TO-D/DEFERRED files; final orphan
  reconciliation exact; every batch docs-adr-expert-reviewed pre-commit except C-25, whose
  reviewer died on the org monthly spend limit carrying the classifier-unavailable note —
  per the just-folded doctrine its partial verdict was not folded, every claim was
  independently grounded first-hand, and its one recovered finding was confirmed and
  applied. Spend-limit fact surfaced to the owner. The owner-working-style extraction's
  home choice (executive memory vs per-user) remains surfaced as a reversible
  pre-decision. Stratum D queue and the deferred directive folds are the Next safe step
  above.
- **2026-07-04 — Hedgehog stirs Rime (claude-code / fable-5 / da727a), MID-SESSION WAYPOINT 2
  (post-compaction; session continues)**: Stratum C completion seat. Landed: the session-head
  principles.md unless-tell fold (`b21bafa39`), loops C-2…C-15 (`7920215df`…`d3e1b6fed`, 107
  entries), then post-compaction ALL NINE PDR-052-deferred directive folds executed at the
  fresh boundary (`e8b3eb986` — metacognition §Stance Under Correction; user-collaboration
  gained four folds with §Owner Working Style extracted to
  `.agent/memory/executive/owner-working-style.md` (home choice surfaced to the owner as a
  reversible pre-decision per the decomposition plan's flagged M2 call); agent-collaboration
  claims-model residual; repo-continuity repoint; channels-card platform-orchestrator handoff
  with Cursor 3.2 re-verification) plus loops C-16…C-21 (`74eaecd6b`, `d39bd05bc`,
  `04fe9944c`, `5447a3e82`, `3ec41b8ed`, `aba5b72cd`), 41 more entries dispositioned
  first-hand; index at 62 lines; **52 `feedback_*` files remain unmarked** — resume at the
  alphabetically-first unmarked file (work-list = disk scan for files without
  LINE-ANCHORED case-insensitive markers `^\*\*(disposition|duplicate|rejected|routed-to-d|`
  `graduated|deferred)` — a bare-word grep false-matches prose and under-counts).
  Docs-adr-expert reviewed every batch pre-commit. **Routing constraints**:
  user-collaboration.md sits 7 content-lines under its fitness hard limit — the NEXT fold
  targeting it executes its split_strategy first; deferred-to-that-fold-set entries (DEFERRED
  markers, lines live): no_ritual_framing, owner_direction_is_a_stream,
  owner_direction_scope. **Stratum-D queue** (ROUTED-TO-D markers, lines live): build_vs_buy;
  the cowpath + design_from_substrate + inherited_separation rule unit; crosswalk pattern;
  derive_controlled_surface pattern; graphs_as_method (feeds the OQ-10 markdown-to-graph
  inversion ADR). Coordination: solo window, curator claim open (refresh if past its
  fresh_until), watcher live (re-armed twice at the 3600s backstop, same seen-file;
  re-verify with assert-watcher-live after any boundary), heartbeat under the PDR-078 s4
  consumer-absent exemption.

- **2026-07-04 — Mistral holds Cumulus (claude-code / fable-5 / 3cfe8f)**:
  Stratum C opened (n=2 window with Otter hunts Jetty on the disjoint ws1d
  tier-E lane, sharing the branch). PDR-052 pillars fold executed as first
  post-grounding action (`46ff52892`); batch C-1 dispositioned 12 entries
  (`8f788c837`; one clause landed via the peer's `558f046af`). Coordination
  notes for successors: a peer's live commit-intent naming a path is a hold
  on new edits to that path; an intent file-list built from `git status`
  does not re-check content arriving before `git add` (re-diff `--cached`
  on shared docs between add and record-staged); one transient `index.lock`
  cleared itself under the no-contact posture.
- **2026-07-03 — Ginger guards Xylem (claude-code / fable-5 / 563bfb)**:
  Stratum B executed (n=2 window with Gust hunts Headwind on the disjoint
  salvage lane; Gust closed out mid-session at `2b57fff52`). All 28
  project_*/reference_* entries read and dispositioned first-hand; 8
  repo-side enrichments/re-homes landed in one batch commit; 6 live
  dangling memory-pointer references repaired (repo-continuity, AEE record,
  eef record, main-sonar record, two plans); 27 memory entries + index
  lines retired after the commit; pillars entry deliberately kept live
  (PDR-052 gate).
- **2026-07-03 — Sardine spins Estuary (claude-code / fable-5 / 69af8c)**:
  thread opened. PDR-124 + agent-description convergence + lifecycle
  amendment; drain plan authored (plan-mode + assumptions-expert readiness
  review, 17-orphan blocker caught and cured); Loop 0 (reconciliation +
  verified inventory: Codex/Cursor/Gemini surfaces present, owner-scoped out;
  both registers verified empty); F-112 surfaced → fix plan authored →
  fixed by peers; no-fallback owner correction reconciled into the commit
  skill + F-112 register entry; Stratum A drained (n=2 window with Gust hunts
  Headwind, memory-side only).

## Participating agent identities

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| Zephyr guards Leeward | claude-code | claude-opus-5 (was claude-fable-5-1 until 2026-09-15) | 281e44 | curator (claim 9119d251; n=1, no Director) — the owner-launched second dedicated drain of the Claude per-user buffer, 2026-09-14: 495 files read first-hand, ten corroborating agents, graduation commit `0e4173b43`, 488 buffer files retired, the operator profile seeded; then the owner-launched dedicated consolidation of 2026-09-16/17 (curator claim c16450da): the raw sources and the whole napkin read first-hand, three governing texts cured and the graduations landed (`63b544464`), the napkin rotated (`8c48a6669`), the directive and Core passes queued for a fresh context | 2026-09-14 | 2026-09-17 |
| Sardine spins Estuary | claude-code | fable-5 | 69af8c | curator | 2026-07-03 | 2026-07-03 |
| Ginger guards Xylem | claude-code | fable-5 | 563bfb | curator | 2026-07-03 | 2026-07-04 |
| Mistral holds Cumulus | claude-code | fable-5 | 3cfe8f | curator | 2026-07-04 | 2026-07-04 |
| Hedgehog stirs Rime | claude-code | fable-5 | da727a | curator | 2026-07-04 | 2026-07-05 |
| Corsair guards Channel | claude-code | claude-fable-5 | ecdd12 | curator — 2026-07-08 dedicated consolidation (R0-arc window): register drained to zero, PDR-126 + PDR-027 amendment, practice box cleared, napkin rotated; see repo-continuity §Next Safe Steps 0a | 2026-07-08 | 2026-07-08 |
| Gull lifts Nimbus | claude | claude-fable-5 | 3da0ae | curator + consolidator (claim de328d24) — 2026-08-07 curator pass (16/27 MCP-455 rows homed, pending-graduations drained then re-registered directive-gated) then the owner-launched whole-goal dedicated consolidation: napkin corpus processed to homes across four checkpoint commits, 7c thread-register audit + index cures under Director scope extension, step 3a first archive batch (6,045 events under the recorded PDR-094 gates) + the 995-event post-watermark absorption sweep, resonance practice-box bundle receipted, napkin rotated | 2026-08-07 | 2026-08-07 |
| Juno seeks Apogee | claude | fable-5.1 | a693fb | implementer (consolidation seat, claim 38ec1aaf; Director Flounder turns Estuary c5cc2c) — the owner-named dedicated consolidation on the Engraph fork, mode dedicated-knowledge-curation, bottom-up: raw sources (comms window after Kiln's 2026-08-14T06:16Z watermark, handoffs, experience, platform memories) then the napkin, distilled, the registers and the homes; lane `chore/consolidation-2026-09-06` | 2026-09-06 | 2026-09-06 |
| Vanilla lifts Nectar | claude-code | claude-fable-5-1 | e1dced | curator (claim f8a2daca; Director Nettle guards Pistil 2de368) — the owner-launched dedicated consolidation of 2026-09-09 on the Engraph fork, mode dedicated-knowledge-curation, bottom-up by hand: the napkin window 2026-09-07 16:5xZ → 2026-09-09 read whole, distilled, the registers, the per-user and platform memories, the comms bodies; homes on PRs #107 (plan units), #105 (skills) and #106 (rules, PDR-027, the gotchas); the front-door liveness defect found at source and routed as a fix (#109, then its successor #113, held as an owner item at the drain); the napkin rotated from the post-fold tip 2d17c6e46 on the drain PR | 2026-09-09 | 2026-09-10 |
