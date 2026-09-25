---
fitness_line_target: 400
fitness_line_limit: 525
fitness_char_limit: 35000
fitness_line_length: 115
fitness_line_length_rationale: >-
  Raised 100 → 115 (owner-authorised 2026-06-29) for this append-heavy
  narrative/continuity surface. Marginal prose-width drift on appended prose is
  chronic-cosmetic (99% of breaches were ≤120; median 104) and manual reflow is a
  transient non-cure on a file that grows by append each session; 115 clears the
  noise while still flagging genuine over-runs.
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else graduate, then archive to a dated file proven byte-identical — never before full processing, never split/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---

# Repo Continuity

Repo-level operational index for active thread state. Historical session-close
prose is archived under [`archive/`](archive/): the whole file as it stood before
the 2026-09-19 graduate-then-archive pass is
`archive/repo-continuity-2026-09-19.md` (byte-identical to blob `3ff37a091`), and
the earlier snapshot is
`repo-continuity-current-state-2026-05-31-foamy-docs-consolidation.md`.
Detailed lane histories live in thread records, curator reports, completed
plans, and prior continuity archives; this file should stay a compact pickup
surface.

**Director handoff:** the next Director's single pick-up point — role procedure,
the readiness self-check before claiming authority, current state, and the live
todo list — is [`director-handoff.md`](director-handoff.md).

## Current State

Compact live state only. Finished-session narrative is conserved in its homes
(commits, ADRs, PDRs, patterns, thread records) and in git history, then drained
from here per `continuity-practice.md` §Disposition; only live lanes and live
forward-asks remain.

- **This line's direction — owner words 2026-09-05, verbatim.** (1) "I want to explore
  creating a set of skills around not what to teach but how to teach, pedagogy skills,
  and the EEF work seemed like a good place to start." (2) "For now this is specific to
  the Engraph fork." (3) "Splitting out the Oak apps is the top priority in the Oak
  fork, not necessarily in this fork." The shape that landed 2026-09-06: the pedagogy
  product lives in its own repository (`EngraphCode/pedagogy-library`, the first
  ecosystem visitor, checked out under a gitignored `visitors/` directory — runbook
  [`ecosystem-visitor-checkout`](../../plans/runbooks/ecosystem-visitor-checkout.plan.md));
  this tree gains only the org-neutral EEF corpus markdown projection (delivery node
  [`eef-corpus-markdown-projection`](../../plans/delivery/eef-corpus-markdown-projection.plan.md),
  #58 merged 2026-09-07). The extraction's priority is the Oak line's, not this line's.
- **The Oak line's 2026-09-02 fold and split-plan arc is finished** (#915 `777e9131c`, then
  MCP-661 as #954, then MCP-673): its narrative, the owner's objective and the five split-plan
  rulings live in the estate-coordination thread record §2026-09-02 FOLD LANDED and the
  2026-09-03 handoff block after it.
- **MCP APP FIRST MAJOR RELEASE — THE PRIMARY LIVE EFFORT (2026-07-21→).**
  Canonical state lives in the first-major-release strategic plan (the
  owner-authored decisions register) on `main`, the Linear project, and
  [`director-handoff.md`](director-handoff.md) §CURRENT HANDOFF STATE — never
  this file. Unless its own line says otherwise, every other lane below is
  dormant or buffered behind this effort.

- **OPEN-SURFACE ZERO — the Oak line's owner-PR merge drive (2026-08-11→).** The fork-line integration landing is complete (#945 merged 2026-09-02 as
  `bf8db3a8e`, after the MCP-655 sign-in fix #946 `55f7a457c`; releases 1.175.3 and
  1.176.0). The remainder is the older slice: resume at #805, then the owner-authored
  custodial pair #818/#819. Exact custody, owner directions, instruments and failure
  learnings live in the tracked thread record
  [`threads/open-surface-zero.next-session.md`](threads/open-surface-zero.next-session.md)
  §Lanes. The consolidation that bullet called due ran 2026-09-02 (the napkin-only pass
  on #951) and since.

- **TYPESCRIPT ESTATE CONSOLIDATION REVIEW — PAUSED 2026-09-06 (no fork lane).** Design
  ratified 2026-08-19 on the Oak line; the measurement-foundation tranche's state
  (Revision 2.6, the `typescript-estate-review-019fc3` worktree, the known red
  boundaries) lives in the
  [thread record](threads/paused/typescript-estate-consolidation-review.next-session.md);
  reactivation is owner-directed.
- **RESTATEMENT REMEDIATION and the PLAN-CORPUS / STRATEGY ESTATE — PAUSED 2026-09-06
  (no fork lane).** The gated lane and its plan
  ([`restatement-remediation.plan.md`](../../plans-backlog-2026-07/product-development-governance/active/restatement-remediation.plan.md)),
  the 2026-07-21/22 corpus reshaping (owner-ruled an unratified sketch; ADR-216 the
  doctrine home; decisions register D23) and the superseded-pending-adjudication
  machinery live in the
  [thread record](threads/paused/strategy-and-plan-estate-holistic-review.next-session.md)
  and the decisions register; read them first, this row is a pointer.
- **CRICKET CONSCIENCE-CHECK SUBSTRATE — live, owner-mandated, platform panels.**
  Every active agent invokes its platform panel twice at real cycle boundaries:
  STANCE normal and adversarial; between owner interactions the cadence is
  event-driven, not a bare timer (owner answer 2026-07-30). The cricket skill
  (`.agent/skills/cognition/cricket/`) owns the live roster, invocation contract
  and on-demand triggers; the historical model-labelled tallies are in the
  operating record
  ([`cricket-quartet-tally-2026-07-29.md`](../../reports/agentic-engineering/cricket-quartet-tally-2026-07-29.md)).
  Rule portability and PDR-127 alignment remain metagovernance candidates.
- **Architectural fitness + mutation testing — decision-ready, reports landed
  (2026-07-15); owner ratification pending.** Report-only validator direction
  (counts are not limits) + the mutation dry-run contract; reports:
  [architectural fitness](../../reports/architectural-fitness-functions-concept-exploration-2026-07-15.md),
  [mutation testing](../../reports/mutation-testing-incremental-rollout-concept-exploration-2026-07-15.md).
- **MCP agent-facing content — PAUSED 2026-09-06 (fork ruling).** The 716-item registry
  (#337/#338; MCP-103 delta-refresh #476) and the owner-gated research execution live
  in the [thread record](threads/paused/mcp-agent-facing-content.next-session.md).
- **Inter-Practice exchange — live next: the WS0+WS4 authoring session**
  (portable protocol PDR in both estates + join-ceremony skill; opener
  written) — the
  [AEE thread record](threads/agentic-engineering-enhancements.next-session.md).
  Standing: the untwinned PDR-063/064/125 truings re-twin at the next exchange
  window; frictions F-120 (`git merge` stale-dist guard-brick) structural cure
  unbuilt. The Practice Box was cleared on 2026-09-17 at the owner's word; the
  bundle's carries (castr-bound items for the next window; the four design-shape
  offers for the owner-scoped cross-estate integration session) live in the AEE
  thread record's "Offered by resonance on 2026-07-08" block.
- **Curriculum Hub — PAUSED 2026-09-06 (no fork lane).** Merged 2026-07-06; the remainder
  (§J deploy, the fidelity-register judgments, follow-ups, the ESLint 10 defect) lives
  in the [thread record](threads/paused/curriculum-hub-demo.next-session.md).
- **Upstream API alignment — PAUSED 2026-09-06 (fork ruling).** The RED-gate note, the
  `bulk-types-schema-derivation` future plan, the MCP pagination-header P1 and the
  MCP-130 cached-schema state live in the
  [thread record](threads/paused/upstream-api-alignment.next-session.md).
- **Team-tooling — live next: the SYNTHESIS PHASE** (worktree-per-agent /
  PDR-117 verdict; do-first the F-44 freshness≠liveness defect in
  `active-agents.ts`). Plan:
  [`team-tooling-session-2026-06-28.plan.md`](../../plans-backlog-2026-07/agent-tooling/current/team-tooling-session-2026-06-28.plan.md).
- **Claims model + agent-work-state (LIVE, owner-gated).** The corrected claims model — a claim is an
  optional, advisory, AREA-scoped signal (NOT files; presence/liveness/work-state/seat re-home to
  facets) — is live in `agent-collaboration.md` §Identity vs Liveness (topology-independent area
  identity; absolute-path refusal; claim-is-not-the-seat). **Owner-gated, flagged not edited:**
  PDR-118 (claim-as-anchor superseded by launch-in-worktree, OQ2 amendment); the schema `role` field
  (the one genuine claim-as-seat marker, in tension with "claim is not the seat"); the
  `director-handoff.md` succession liveness gate (safety-critical). **Remaining integration (gated on
  OQ5 composed-liveness):** `collaboration-state-conventions.md` (silent that freshness ≠ liveness); the
  code consumers (`active-agents.ts`, the watcher-gate, the TUI).
- **Spawn-flow tool — ready to build (LIVE pickup).** Launch a session in its worktree → the binding is
  *derived* from cwd; the assert-primitive / registry path is dissolved (PDR-118 OQ2). Owner-approved
  plan with a Pitfalls section:
  [`agent-spawn-flow-tool.plan.md`](../../plans-backlog-2026-07/agent-tooling/current/agent-spawn-flow-tool.plan.md). The
  substrate ([`future/knowledge-distribution-substrate.plan.md`](../../plans-backlog-2026-07/agent-tooling/future/knowledge-distribution-substrate.plan.md))
  is recorded-future, not a prerequisite. Next agent: read it + the `feedback_*` memories it names,
  confirm the cwd fact once, build friction-sliced.
- **Sonar AI-profile → zero — dormant-live.** Phases 1–3 + 5A/5B landed; next
  batches doctrine-first (S7763/S7785/S6594/S7786, then Phase 4 design-MAJORs).
  Thread: `main-sonar-ai-profile-to-zero`.
- **Corpus generalisation — paused at the Phase 0 stable point (owner-directed,
  2026-07-06).** Restart = revision queue + atomic landing set on a NEW branch;
  the self-contained restart brief is the AEE thread record §PHASE 0 + the
  [design record](../../reports/agentic-engineering/large-corpus-analysis-tooling/corpus-generalisation-phase0-design-record-2026-07-05.md).
  Standing forensic items ride with it: **(owner attention)** the
  ~1,707-event untracked-tier removal (unexplained; intact in git at
  `255117a43^` — re-materialise before any pass; P0 weighs a tracked
  watermark manifest), and the single-model-voter measurement.
- **CI / security follow-ons (LIVE forward-asks).** From the CI-hardening landings (#236 dep-review
  gate, #239 CI parallelisation): report the #229 Tier-2/3 security-roadmap items; reconcile the
  widget/a11y pre-push ≠ CI parity gap (ADR-121 matrix, from #230); and the Codex #239 follow-ups to
  investigate against the merged code — (P2) `ci.yml` main-run concurrency may drop an intermediate
  main CI run + its Release `workflow_run` (consider a per-SHA group for non-PR runs); (P3) align the
  ADR-121 Playwright cache-key changelog row with the impl. **DATA-SOURCES governance** (owner-gated)
  gates the under-the-hood/explain user-exposure surface.
- **OWNER ROADMAP (2026-06-12, sequenced "not all at once") — the forward agenda:** (1) comms-research
  follow-ons; (2) naming v3 (DECISION-COMPLETE plan; Phase-1 era-pinning cure first — §Next Safe Steps);
  (3) Sentry production-issue protocols/skills; (4) the Sentry logging improvements those surface;
  (5) refine the PostHog plan; (6) integrate the oak-api repo into this ecosystem; (7) EEF
  data-surfacing follow-ons; (8) high-impact graphs latent in the bulk data; (9) apply the graph-tool
  capabilities to the `oak-curriculum-ontology` sibling repo; (10) the user-facing hybrid-search
  experience (gates the 08-experience-surfaces cluster + the `mcp-app-extension-migration` WS3 rebuild);
  (11) keep the plan-discovery surfaces current and retire `plans/notes/`; (12) the path-sweep
  code-class follow-on (TDD cycles, never a sweep sed). **Open action:**
  `docs/graph-team-direction-2026-06-10` carries two unmerged commits (`ae5372e2c`, `c9ff6bb49`);
  merging it is an open owner/Director action (reconcile the napkin/eef-record content on merge).
- **MCP product analytics — PAUSED 2026-09-06 (fork ruling).** The submission-blocking
  PostHog sink and `@posthog/mcp` integration proceed from the ratified MCP-63 plan (PR #568,
  merge `ccd1c410f`, 2026-07-26) under the owner's PR1-settled → PR2-settled → PR3 order;
  the PR state, the succession and the causal record live in the
  [thread record][mcp-analytics] and the
  [permanent dated record](../../reports/mcp-63-succession-notification-and-focused-delivery-2026-07-26.md).
  MCP-173 separately gates October public-beta enablement.
- **Other decision-complete plans awaiting execution routing.** MCP output
  contracts: owned since 2026-08-19 by the `mcp-output-contracts` strategic
  node + `mcp-served-surface-truth` / `mcp-output-contracts-implementation`
  delivery plans (`.agent/plans/`; the single-envelope
  `composeEnvelopeSchema(payloadSchema)` doctrine was falsified against the
  served wire — three envelope shapes; prior plans archived); the MCP
  test estate + observability-sinks plans (§Next Safe Steps). OAK-PROD MCP
  snagging — next: S0 non-Cursor probe, then S1 to owner.
- **no-throw remediation — RESHAPED, READY (survey-first), PAUSED for the strategy thread.** Controlling
  plan [`no-throw-remediation.plan.md`](../../plans-backlog-2026-07/architecture-and-infrastructure/current/no-throw-remediation.plan.md);
  the ~1000-warning count is an indiscriminate-rule artefact (~6 cause-classes). Investigation-first
  WS0→WS4; 4 conversions landed. Resume from WS0 after the strategy work. **Owner ruling
  2026-09-08** on the 1,227 warnings across 16 packages: "Turn the rule off for now, we can't fix it
  without creating incredible churn, so that needs to wait until the Engraph fork is merged back into
  the upstream. However, in any workspace with no current warnings and in any new workspace, leave it
  on as an error." The rule is binary: off where the debt lives, error everywhere else and for every
  new workspace; the migration lane waits for the merge-back. The merge-back is planned for October
  2026 and has no plan node by the owner's word the same day ("do not worry about the October
  re-integration, I have some thoughts, but we do not need a plan yet, and we should not let the
  intention overly influence the decisions we make now"); Oak-line delivery sketches not pending on
  the fork are left as they are until then. The same cards ratified six of 25 delivery sketches
  (consolidation-induction, consolidation-ledger, consolidation-signal,
  director-continuity-surface-redesign, commit-queue-local-ephemera,
  code-quality-binding-per-checkout) and held the other nineteen until October, the Director's
  recommended `codex-app-server-idle-wake` among them: route fresh seats under the ratified set and
  do not re-raise the Codex wake before October.
- **Practice↔IDE integration plane** — feasibility report landed; **owner decisions pending** (§Open
  Owner-Decision Items); a HARD deep-docs-read prerequisite before any build.
- **Onboarding-improvement arc** — PR #199 merged; follow-ons open (B2/B3 risk-register seeding; the
  ask-the-repo search decision — B1 awaits owner cost bands, B6 at the M2 gate). **2026-07-28: the
  dev-facing guide LANDED** — `docs/engineering/working-with-this-repo-for-devs.md` (owner-authored)
  plus discoverability wiring via #603, and the wrap-closes-every-session doctrine re-truing via
  #604 (ADR-150/PDR-011 amended; follow-ons MCP-310/311/312); detail in the
  `orientation-skills-family` and `agentic-engineering-enhancements` thread records.
- **Evals pickup — QUEUED, owner-directed**
  ([`skill-evals-pilot-start-right-quick.plan.md`](../../plans-backlog-2026-07/agentic-engineering-enhancements/current/skill-evals-pilot-start-right-quick.plan.md));
  the assurance regime is homed in `principles.md` §Agentic Quality + `validation-strategy.md`.
- **AX first-class** — PDR-111 + the `agent-experience-review-lens` rule landed; the live home is
  [`agent-experience-improvement.plan.md`](../../plans-backlog-2026-07/agent-tooling/current/agent-experience-improvement.plan.md)
  (next: WS-1 CLI-ergonomics conformance guard — §Next Safe Steps; WS-4 is the structural drain-fix).
- **Fitness-system doctrine (agentic lane)** — the Closure & Role-Routing findings record + backbone
  plan landed (`547d889c9`); next is the plan's WS0 (PDR-106 + ADR-144 amendment) and the §11
  comparison. Detail in
  `.agent/plans-backlog-2026-07/agentic-engineering-enhancements/current/fitness-system-closure-and-role-routing.findings.md`
  and the `.plan.md` beside it.
- **Collaboration-state lifecycle**: `.agent/state/` files are live signal sources, not long-term
  documentation. **Live tooling gap**: 1,346
  coordination-class events await a curator-disposition INPUT CHANNEL in the
  mover (their knowledge is absorbed; the recording mechanism doesn't exist
  yet) — routed with the comms-watch-storage-redesign lane, which also owns
  the rotation-vs-live-watcher cursor-floor mitigation. **Standing residual:**
  the git-history coordination-tier corpus at `255117a43^` (see the corpus
  bullet above) — re-materialise before any pass over it.

## Active Threads

A **thread** is the continuity unit. Full identity tables and lane state live in
each thread record; this table is the repo-level index.

| Thread | Purpose | Record | Latest identity |
| --- | --- | --- | --- |
| `estate-coordination` | The Director lane's thread record (founded 2026-08-13): journal, board, seat chain; `director-handoff.md` keeps the Brief and the live snapshot. Live state, the boundaries since 2026-09-03 (the Engraph fork; lead/support split) and the owner's standing open-PR-count goal live in the record. | [record](threads/estate-coordination.next-session.md) | claude-code / claude-opus-5-5 / Marten mends Shadow (74fc02) / this estate's exchange seat, stopped at rest at the owner's word / 2026-09-25, claude-code / claude-opus-5 then claude-fable-5-1, then claude-opus-5-5 from 2026-09-23 / Zephyr guards Leeward (281e44) / curator, sole operator until 2026-09-17 15:31Z, then at n = 2 with Dynamo turns Temper (2a4c8a, the Oak integration lane) — #145 landed, the 2026-09-14 branch folded, #147 landed on premises (`0bd321131`), #149 landed (`514bfc06a`), the deep retrospective landed (`940c019a6`), the 2026-09-15 branch folded as #150 (`a07940ac9`), the 2026-09-16 branch as #152 (`cd847a2b3`) and the 2026-09-17 branch as #153 (`SHA:b5b0e70cd`), its successor as #155 (`SHA:65a929d9a`) and the 2026-09-19 branch as #156 (`SHA:44729c98c`) inside the owner-directed consolidation, then the 2026-09-20 branch as #159 (`SHA:efb2942e9`) and the three 2026-09-21 branches as #169, #170 and #171 (the live branch is named once, in Next Safe Steps below, never in this row); from 2026-09-21 09:2xZ at n = 2 with the guest exchange seat Brazier spins Temper (c70341) for the three-estate Practice exchange / 2026-09-21 ← claude-code / claude-fable-5-1 / Flounder turns Estuary (c5cc2c) / lead at n=2 with Buzzard lifts Eyrie (326bcb) in support from ~19:3xZ; earlier solo implementer — owner rulings landed (merge-bot config per-checkout; green-and-clean merges without waiting) / 2026-09-03 ← claude-code / claude-fable-5-1 / Chinook seeks Cloud (661556) / lead at n=2 with Vesta rides Solstice (9e26e6), then solo for the wrap / 2026-09-03 |
| `open-surface-zero` | Oldest-first disposition and merging of Jim-owned open PRs; every feedback surface harvested, all checks green, then immediate merge. 2026-09-01: the fork-line integration landing (#943 → rehomed as #945) runs on this thread | [record](threads/open-surface-zero.next-session.md) | claude-code / claude-fable-5 / Luna seeks Twilight (5c0ddc) / driver — #943 Sonar-gate cure landed via the fork, rehomed as #945 at owner word, driving to the bot merge / 2026-09-01 (prior: codex / GPT-5 / Smith holds Temper (019fef) — #745/#746/#852 merged / 2026-08-11) |
| `design-system-integration` | AIP-137: the Claude-Design-exported design system as a first-class integrated system (ADR-213 — repo home + studio seat, bidirectional sync); kit landing, contrast gate, hub migration, studio sync-back. Lane state, owner rulings and the fidelity register live in the record. | [record](threads/design-system-integration.next-session.md) | claude-code / claude-fable-5-1 / Flounder turns Estuary (c5cc2c) / lead seat — PR #41 (MCP-613 records-truth pass) landed SHA:8b2b5ee03; the seven-item records residue is on the thread record §2026-09-05; claim b627b5af closed; the lane's next pickup (T1a-ii, or the residue) opens from a fresh claim / 2026-09-05 (seat chain: thread record) |
| `agentic-engineering-enhancements` | Practice continuity and temporary curation — the multi-lane doctrine/consolidation thread; this row is the index pointer only. Lane history, the identity table and the latest lane (the 2026-09-02 napkin-only dedicated consolidation and its step-6a synthesis, Kiln holds Slag) live in the record. | [record][agentic] | claude-code / claude-fable-5-1 / Kiln holds Slag (1447f4) / curator — napkin-only dedicated consolidation and the step-6a synthesis / 2026-09-02 (prior lanes: thread record) |
| `oak-slack-assistants` | Internal agentic Slack assistants over Oak's MCPs (Ask Oisín M1; future Ask Oak). 🟢 DECISION-COMPLETE, plan merged 2026-07-08; next: execute (WS-E1 first). Detail: [logging design record](../../research/outreach/slack-assistant-logging-observability-design.md) + the record. | [record](threads/oak-slack-assistants.next-session.md) | claude-code / claude-fable-5 / Salamander weaves Warmth (`4960fe`) / deep review — decision-complete rework / 2026-07-08 (chain: thread record) |
| `continuity-memory-and-knowledge-flow` | Memory/context substrate (PDR-124 landed; the 2026-07-05 per-user buffer drain complete, plan archived; the second dedicated drain complete 2026-09-14 — 495 Claude buffer entries dispositioned, graduation commit `0e4173b43`, 488 retired, the operator profile seeded). PDR-141 (Accepted, owner-ratified 2026-09-14) moves the operator profile to `~/.practice/profile/`; the seeded profile is ratified. The register's twelve directive-bound entries graduated on 2026-09-19 and the four drainable buffers read empty; the graduate-then-archive pass over the large memory files is complete (nineteen curated with dated archives, twenty read whole and left live; on engraph as #159 and #169); what remains is the owner-held decisions the record lists and the directive-tier candidates held below 30 % context; buffer lifecycle continues under `per-user-memory-is-a-buffer` | [record](threads/continuity-memory-and-knowledge-flow.next-session.md) | claude-code / claude-opus-5 then claude-fable-5-1 / Zephyr guards Leeward (281e44) / curator — the dedicated consolidation's second half folded as #153 (`SHA:b5b0e70cd`); its successor folded as #155 (`SHA:65a929d9a`); the buffers drained to empty and that drain folded as #156 (`SHA:44729c98c`); the memory-file pass folded as #159 (`SHA:efb2942e9`) and the consolidation's close as #169 (`SHA:72cab5667`) / 2026-09-21 ← the same seat / curator — second dedicated drain complete / 2026-09-14 |
| `slack-watcher-estate-review` | Owner-commissioned review (2026-08-24) of the Slack Watcher organ — COMPLETE the same day, all six proposals owner-adopted and P1–P5 landed; shepherded 2026-08-25 (OCE PR #17 `c40a4287`, castr PR #53 `e62891ee`); plan archived; report at `.agent/reports/agentic-engineering/slack-watcher-estate-review-2026-08-24.md`. The remaining probe and two recorded deferrals live in the record. | [record](threads/slack-watcher-estate-review.next-session.md) | claude-code (cloud) / claude-fable-5 / Raven stirs Murmur (c4031b) / reviewing + executing seat / 2026-08-24 (prior: Buzzard weaves Airstream 01e90b, plan author) |
| `codex-dialogues` | Codex as an invocable second opinion: the Codex dialogues rebound onto `codex exec` and `codex exec resume` under the node `the-codex-dialogues-exec-binding`. Slices 0, 1a and 1b-0 landed (#184, #186, #188); 1b-i (#189, held on the Codex quota) and 1b-iii (#190, draft) are open. Distinct from first-class Codex support in the Practice, the Director track | [record](threads/codex-dialogues.next-session.md) | platform unknown until it registers / Swallow holds Drift (516619) / successor lane owner, named 2026-09-24 ← claude-code / claude-opus-5-5 / Blazar lifts Corona (b65a9a) / lane owner / 2026-09-24 |

## Paused Threads

Paused threads retain their next-session records and identity history; they are
not the current session-priority lane. Reactivation is owner-directed.

| Thread | Purpose | Record | Latest identity |
| --- | --- | --- | --- |
| `agentic-mechanisms-discovery` | Web-based agent discovery mechanisms for Oak data and tools; moved from Active 2026-07-30 (no identity touch since 2026-06-08); reactivation is owner-directed via §Next Safe Steps. | [record][agentic-mechanisms-discovery] | claude / Opus 4.8 / Zephyrous Buffeting Falcon / skills-lane-relocated-to-educator-end-users / 2026-06-08 (prior identities: thread record) |
| `eslint-no-throw-result-migration` | Migrate every throw to Result (ADR-088) and drive the warnings to zero; RESHAPED survey-first (four conversions landed) and paused for the strategy thread (moved from Active 2026-07-30); the agent-tools warning residue belongs here. | [record](threads/eslint-no-throw-result-migration.next-session.md) | claude / Opus 4.8 (1M) / Siren mends Rudder / execution — observability+graph-core+logger landed (`93beffcfe`,`304b68f8d`,`61bdbc3e4`) / 2026-06-19 (prior: Merlin spins Cirrus `1556b9191`; Vanilla weaves Undergrowth, plan-author) |
| `codex-to-codex-hook-review-experiment` | **RETIRED at owner ruling (2026-08-02).** Fresh-process hook lane RED on configured latency; PR #403 closed unmerged with its state preserved, preservation PR #705 closed, the branch deleted; the record holds the frozen evidence and negative results. | [record](threads/paused/codex-to-codex-hook-review-experiment.next-session.md) | codex / GPT-5 / Lupin herds Bark / closeout owner — full pause handoff, mixed-index state and failed attachment captured / 2026-07-16 ← Zephyr turns Crosswind / terminal handoff / 2026-07-16 |
| `itf-knowledge-graph-spike` | The Inclusive Teaching Framework (Ambition Institute 2026) as a knowledge graph in the graph-corpus design grammar — a candidate data source. Spike COMPLETE, preserved on draft [PR #401](https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/401) (HOLD: the owner's TS-promotion gate); knowledge surfaces conserved on main 2026-07-17. | [record](threads/paused/itf-knowledge-graph-spike.next-session.md) | claude-code / claude-fable-5 / Fern spins Taproot / implementer (solo) — spike landed, full preservation set + closeout / 2026-07-07 |
| `eef` | EEF graph-tooling rebuild — D0–D7 delivered & shipped (v1.16.0); D7 proof dropped as overkill (paused 2026-06-19) | [record][eef] | claude / Fable 5 / Thyme wakes Canopy / record-condensation / 2026-06-12 (prior identities, 30+ seats: thread record) |
| `data-sources-governance` | Author `docs/governance/DATA-SOURCES.md` (suitability / last-reviewed / removal criteria) — **owner-gated**: new governance policy, an owner decision, not agent-resolvable; gates the under-the-hood/explain user-exposure surface | [record](threads/data-sources-governance.next-session.md) | claude / Opus 4.8 / Ferret weaves Nightfall / thread-opener-brief-only / 2026-06-25 |
| `school-data-search` | Oak School Data Search service (POC MVP): deep review complete, build-ready (paused 2026-06-19) | [record][school-data-search] | claude / Opus 4.8 / Fiery Sparking Caldera / deep-review-and-refinement / 2026-06-04 (prior identities: thread record) |
| `semantic-search` | Search data foundations plus paused source-portable curriculum-exploration evidence and planning | [record][semantic-search] | codex / GPT-5 / Codex / reusable-curriculum-architecture search synthesis and closeout / 2026-07-15 |
| `oak-kg-ontology-planning-review` | Plan the `oak-kg`/ontology work via a deep review of the Oak Curriculum Ontology repo (opened, not started; paused 2026-06-19) | [record][oak-kg-ontology] | claude / Opus 4.8 / Twilit Cascading Supernova / thread-opener-brief-only / 2026-06-04 |
| `connecting-oak-resources` | Oak resource graph substrate plus queued source-integration workspaces and paused reusable-curriculum-architecture evidence | [record][connecting] | codex / GPT-5 / Leopard tracks Dewdrop / source-integration concept exploration, plan, and closeout / 2026-07-15 |
| `branch-fitness-and-push-cadence` | Small-PR, push-often, branch-fitness, PR/Sonar protocol substrate | [record][branch-fitness] | Pelagic Snorkelling Sextant / codex / GPT-5 / Cycle 1 substrate capture / 2026-05-24 |
| `observability-sentry-otel` | Sentry/OTel integration | [record][observability] | Umbral Creeping Night / claude-code / opus-4.7 / 2026-05-10 |
| `exploring-open-education-resources` | Third-party OER | [record][oer] | Gnarled / claude-code / 2026-05-01 |
| `sector-engagement` | External adoption | [record][sector] | claude-code / Fable 5 / Forge turns Basalt / dfe-data-sdk-seed-authoring / 2026-06-12 (prior: Squally / cursor / 2026-04-30) |
| `architectural-budget-system` | Cross-scale budgets; proposed report-only directory-concentration validator direction awaits owner ratification | [record][budget] | codex / GPT-5 / Spark seeks Pumice / concept exploration and handoff / 2026-07-15 |
| `cloudflare-mcp-security-and-token-economy-plans` | Cloudflare MCP | [record][cloudflare] | Glassy / codex / 2026-04-28 |
| `mcp-submission-drive` | PAUSED 2026-09-06 — fork ruling: no Oak-surface access. Formerly the Oak line's live priority thread: Oak's MCP app to public beta (publicised 2026-09-06), the Anthropic connector submission of 2026-08-07, landing target MCP-597. Detail in the record. | [record](threads/paused/mcp-submission-drive.next-session.md) | claude / claude-opus-5[1m] / Dormouse turns Footfall (a54547) / director — seated 2026-08-17 LATE evening at owner word, after Skunk stirs Cavern (db8b9b) stood down 17:42Z; resumed 2026-08-18; PR #903/#902 CHANGES_REQUESTED blockers under cure / 2026-08-18 (seat chain: thread record) |
| `workspace-config-isolation` | PAUSED 2026-09-06 — no fork lane; identity row stale. Config-boundary cure lane (the workspace-config package, depcruise boundary rules under three owner rulings, the de-hatch arc, census todos); #836/#865 merged; the de-hatch and census todos are the pickup. | [record](threads/paused/workspace-config-isolation.next-session.md) | claude-code / claude-fable-5 / Wren calls Downdraft (6b29b5) / implementer — #865 closed out, seat closed at owner word / 2026-08-13 |
| `typescript-estate-consolidation-review` | PAUSED 2026-09-06 — no fork lane; identity row stale. Repo-architecture lane whose design was ratified 2026-08-19 on the Oak line (strategic node `toolkit-re-architecture`; the Toolkit Atlas five-change set); execution is not a lane on this line. | [record](threads/paused/typescript-estate-consolidation-review.next-session.md) | claude-code / claude-fable-5 / Poppy lifts Bark (d427b6) / repo-architecture lane — change set + strategic node ratified at owner cards 2026-08-19; claim closed at wrap, fresh pickup next / 2026-08-19 |
| `mcp-product-analytics` | PAUSED 2026-09-06 — fork ruling 2026-09-06: no Oak-surface access. Submission-blocking PostHog sink and MCP analytics integration; October public-beta governance is a separate gate | [record][mcp-analytics] | Cutter hunts Lagoon / codex / GPT-5 / active implementation custody ← Kite seeks Crosswind / handoff complete and retired / 2026-07-26 |
| `first-class-copilot-cli-practice` | PAUSED 2026-09-06 — fork ruling: no Oak-surface access. GitHub Copilot CLI as an equal first-class citizen of the Practice (identity, team join, hook policy, projections, comms and lifecycle, live proof); the CLI-only strategic and four delivery nodes owner-ratified; runtime gated on their replacement record. | [record](threads/paused/first-class-copilot-cli-practice.next-session.md) | codex / GPT-5 / Thistle holds Blossom (019f94) / replacement-plan implementer / 2026-07-24 ← copilot / gpt-5.6-sol / Thistle rides Canopy (494337) / design authority and live evidence author / 2026-07-24 |
| `mcp-agent-facing-content` | PAUSED 2026-09-06 — fork ruling 2026-09-06: no Oak-surface access. Audit + classified registry of repo-controlled content reaching MCP consumers (the effective agent prompt); distinct from `data-sources-governance` (DATA sources). Deliverables + lane history: thread record | [record](threads/paused/mcp-agent-facing-content.next-session.md) | codex / GPT-5 / Smelter rides Temper (019f9f) / implementer — MCP-103 phases (b)/(c), PR #582 shepherd / 2026-07-27 (chain: thread record) |
| `upstream-api-alignment` | PAUSED 2026-09-06 — fork ruling: no Oak-surface access. Realign SDK/MCP and bulk export to the evolving upstream Oak API by a repeatable observable process; the programmes-family instance on PR #291; the process graduated to a permanent runbook. | [record](threads/paused/upstream-api-alignment.next-session.md) | claude-code / claude-fable-5 / Birch holds Seedling (e48fe2) / implementer — the 2026-08-03 upstream update lane (MCP-462/463/464) / 2026-08-03 (chain: thread record) |
| `statusline-enhancements` | PAUSED 2026-09-06 — no fork lane; identity row stale. Claude Code statusline: Oak-mark, session-shape indicators, location rows and rate-limit gauges DELIVERED (2026-06-29, `708cd57fc`); the logo lane paused by the owner; future lanes and the branch state in the record. | [record][statusline] | claude / claude-fable-5 / Magma mends Sulphur / curator — record hygiene at the 2026-07-23 consolidation / 2026-07-23 ← Wyvern seeks Clinker / footer-PR-badge diagnostic / 2026-07-06 (earlier identities: thread record) |
| `agent-naming` | PAUSED 2026-09-06 — no fork lane; identity row stale. PDR-027 display-name derivation: versioned schema registry, session-hook identity surfaces, wordlist eras (v2 landed; v3 + era-pinning cure queued; v3 plan now cross-linked to the knowledge-distribution-substrate direction) | [record][agent-naming] | claude-code / claude-fable-5 / Moss calls Loam (79b433) / identity-lane implementer — MCP-457 + the MCP-145 visual-disambiguator slices all MERGED, both plans archived, LANE COMPLETE / 2026-08-02 (prior identities: thread record) |
| `agent-operability` | PAUSED 2026-09-06 — no fork lane; identity row stale. Agents operable in their own worktrees (launch-in-worktree as the identity→worktree→branch binding, worktree lifecycle, seat-in-the-brief); controlling plan owner-approved 2026-06-28; next: the cwd-confirmation smoke test, then Phase 1A. | [record][agent-operability] | claude / Opus 4.8 (1M) / Tuna stirs Fathom / thread-record orphan-fix + branch reconcile (no build) / 2026-07-01 |
| `strategy-and-plan-estate-holistic-review` | PAUSED 2026-09-06 — no fork lane; identity row stale. Planning-estate rewrite on a living idea-graph (ADR-200/201) with the plan-corpus REFOUNDING inserted first; gated on the restatement-remediation effort. The arc, Director chain, rulings and pickup state live in the record — read it FIRST. | [record](threads/paused/strategy-and-plan-estate-holistic-review.next-session.md) | claude-code / claude-fable-5 / Petrel calls Aether (d4f4b7) / AIP-126 implementer — full closeout / 2026-07-18 (full seat chain: thread record identity table) |
| `orientation-skills-family` | PAUSED 2026-09-06 — fork ruling 2026-09-06: no Oak-surface access. Teaching-surface family: a portable agentic-AI primer (lead-in) plus the **one** repo-bound orientation lens (`/oak-under-the-hood`) across the PDR-112 portability seam | [record][orientation] | claude-code / claude-fable-5 / Juniper holds Tendril (3dfd3b) / implementer — dev-facing guide arc, PRs #603 + #604 owner-merged / 2026-07-28 ← claude-code / Opus 4.8 (1M) / Clover mends Hedgerow / **reframe `/oak-explain`→`/oak-under-the-hood` + MCP pointer projection MERGED via PR #243 (`a0a85f60c`, 2026-06-27); ADR-202 + ADR-205. `oak-under-the-hood.plan.md` DONE→archive; MCP-surfaced discoverability follow-on owned by `current/mcp-tool-taxonomy-and-orientation.plan.md` (decision-incomplete, WS0 not started)** / 2026-06-28 (prior: Zenith lifts Firmament — unification `ca40d98ce`; Swordfish/Seal — reframe build; Skipper tracks Reef, Orbit rides Horizon, Bora lifts Downdraft) |
| `main-sonar-ai-profile-to-zero` | PAUSED 2026-09-06 — fork ruling: no Oak-surface access. Drive `main`'s Sonar AI quality-profile backlog to zero under the owner-ratified disposition bar (fix at source by default); Phases 1–3 + 5A merged, Phase 5B on PR #308; the next batches doctrine-first. Detail in the record. | [record][main-sonar-zero] | claude-code / claude-fable-5 / Katydid seeks Moonbeam / implementer — Phase 5B + the ADR-153 guard arc; PR #308 at the code-owner gate / 2026-07-06; Zenith wakes Perigee (8897eb) / curator — drift-guard follow-on noted in the record / 2026-07-06 (prior: Alder tracks Topsoil #242, Gull tracks Eyrie #246/#249, Junk tracks Moorings #223, Thyme lifts Compost, Aspen tracks Root) |
| `curriculum-hub-demo` | PAUSED 2026-09-06 — no fork lane; identity row stale. Reproduce the Oak Curriculum Hub from the Claude Design canonical export (DoD §A–J); build complete, MERGED 2026-07-06; the live remainder in §Current State and the record. | [record](threads/paused/curriculum-hub-demo.next-session.md) | claude-code / claude-fable-5 / Thyme weaves Hedgerow (762020) / MCP-372 hub-conformance carrier / 2026-07-30 (lane state on the design-system-integration record; prior cast: thread record) |
| `skills-estate-organisation` | PAUSED 2026-09-06 — fork ruling: no Oak-surface access. The standing agentic-skills-and-mechanisms lane; the skills-estate plan (WS0 reflection R1-adopted, rules reclassification ratified and landed); resume from the WS0 working record's last entry. | [record](threads/paused/skills-estate-organisation.next-session.md) | claude-code / claude-fable-5 / Skylark hunts Nimbus (e856d5) / skills-lane implementer — WS0 opened and ruled; #726 merged, #731 generator pair merged after the wrap (`1356579ca`) / 2026-08-03 |

## Next Safe Steps

### PICKUP for the next session — the three-estate Practice exchange (owner's word 2026-09-21)

**CURRENT PICKUP, 2026-09-25 ~15:05Z — Myrtle turns Canopy (bf4957), the exchange seat at the
owner's word.** Read this block first; the 2026-09-24 block below it is the older owed list, still
true where this block does not supersede it, and Marten mends Shadow's handoff record of
2026-09-25 (the handoffs directory of the collaboration state, this machine only) is the pickup
contract, its §Recount run at 14:58Z and matching.

- **The owner's ruling on the exchange (2026-09-25 ~11:00Z, recorded by Geyser rides Pewter),
  verbatim:** "We are prioritising all JC.net Practice innovations being integrated into OCE,
  then we review. This is a fixed process with an end, not an ongoing effort. Once the Practice
  contains the best of both it will be extracted into an installable entity." Where they differ,
  it supersedes the 2026-09-21 framing (three estates, rows owed each way). The delivery node
  `practice-two-way-exchange.plan.md` carries it in the node's own words. The owner's word to
  this seat (about 14:53Z, native), verbatim: "you are now responsible for managing the flow of
  Practice enhancements from JC.net to OCE". The Director's routing of 15:02Z: this seat is the
  receiver for the second estate's rows (Siren's trigger-amendment twin, batch six, the F-200 to
  F-207 twins); rows this estate sends go to that estate's seat, Siren herds Rudder (158275).
- **Claims:** a63a7df8 (the test-doctrine intake) and 141892a7 (the seed branch) adopted from
  Marten mends Shadow at 15:0xZ, premises recomputed live; 9549aec5 opened for the PDR-009 row.
- **In flight:** the PDR-009 joint cure taken by bytes (the second estate's blob bc4612df; its
  event 1592fa3d, this seat's receipt daaa5224): branch `docs/exchange-pdr-009-joint-cure` in
  worktree `oce-wt-pdr-009-joint-cure`, draft PR #213. It merges behind the Director's
  slot order of 15:02Z (PR 212, the watcher twin, the fold 187, PR 211; no lane syncs to engraph
  while another holds the slot). The landed receipt on the stream closes the row.
- **Next:** joint set K4 merged in the second estate at 15:01Z (its merge c523ba81; Siren's
  event of 15:03Z names the eight paths). The intake branch `docs/intake-test-doctrine` takes
  those bytes: the directive hunk (`testing-strategy.md`) waits for this seat's next compaction
  (the Director's ruling of 15:04Z: PDR-052's 30 % floor is a deferral, never a stop), the seven
  other files and Marten's local cure list (his 2026-09-24 record) proceed. Then Marten's
  proposal order, recounted at each step: PR G, J2 (ask the owner A3 first), J3, C7, PR 205's
  follow-ups, batches three and five, batch four's J2 and J3 receipts, the seed branch. Inbound
  and waited for: the trigger-amendment twin, batch six, the F-200 to F-207 twins, the Cricket
  no-inferred-gender line (lands in the second estate first).

**CURRENT PICKUP, 2026-09-24 ~14:0xZ — Marten mends Shadow (74fc02), the owner's named
successor to Zephyr guards Leeward (281e44) on this lane.** Read this block first; the
paragraph below that begins "The 2026-09-23 branch folded as #176" is the older owed list,
still true where this block does not supersede it.

*Update, 2026-09-24 15:3xZ, the same seat after the owner reopened it (supersedes the
paragraphs below where they differ).* The owner's word to this seat at 14:29:27Z (comms event
942fd3b0), verbatim: "Standing rule, with aim for zero open PRs on balance … work is not
delivered until it is merged". It followed this seat's 14:19Z close, which had left PRs 191
and 192 unmerged. The claim-retention fix is K1 and K1(c), signed in cc11b042 and b5c4c077.
They land with the second estate's next joint set: an open pull request keeps its claim at
closeout, and the member closeout templates gain an "Open pull requests owned" line.

- **Landed.** PR 192, joint set G plus the daily prompt's clause, merged as 5de481360 at
  15:19:37Z. The Director ruled that the daily clause is seat work.
- **In flight.** PR 191 holds the landing slot at 0936f14d6, synced to engraph 5de481360. It
  carries joint set F plus J1 to J8 (signed in 00f70644, 47609bab and 0e12282f). Every thread
  is resolved. This seat lands it under the docs-only class and then broadcasts.
- **Read PR 191's state first.** If it is still open, it is the fresh session's first act, and
  claim 43dbafee (still held) is handed on:
  1. recompute the gate by name;
  2. post the premises, prepared in the same form as PR 192's comment;
  3. merge as the bot through the REST endpoint, with a merge commit and the head pinned;
  4. broadcast, and pass the slot to PR 193.
- **The fresh session's order, after PR 191.**
  1. The test-doctrine intake, as described below. It carries the owner's own ruling (6161e95d),
     which binds from the word.
  2. The second estate's batch one. Ten files sit untracked in
     `.agent/practice-core/incoming/jcnet-batch-1/`, acknowledged in ebfe86d8, with every blob
     id listed there. Siren's delivery event, 3727b85b, gives the heads read and each file's
     proposed landing. `pdr-adr-citations.md` comes first, and each file is receipted as
     integrated or rejected with its reason.
  3. H's hunk.
  4. K, when Siren sends it.
- **The exchange count.** Siren and this seat agreed the counting predicate at 15:1xZ, and it
  rides Siren's next exchange PR into the register's §Disposition vocabulary. A row is owed to
  estate E when it sits in the other estate's delta table and its E cell does not begin with
  decline, graduated into, origin, none, local, or records, not portable. It is landed when E
  has a Landings row that is not PARTIAL. At jcnet main 52ad23c902 (register at 43b03b52af):
  0 of 21 owed to OCE are landed, and 5 of 28 owed to jcnet.
- **Unowned.** This estate's governing node, `practice-two-way-exchange.plan.md`, is a sketch
  with no todo list. The fresh session raises that with the Director as a request.

*Resume, 2026-09-24 ~18:36Z: the same seat keeps the lane (supersedes the handover paragraph
below where they differ).* The owner's word came by card, relayed by the Director (Wick binds
Temper, ed7b48) at about 18:35Z: "Marten continues past its handover point", described as
"Marten keeps the OCE lane past 65% and lands batch two itself, naming the reading at each
step". The card had held the Director's turn open since about 17:08Z. So the handover below
ran on its declared default while the word waited, and the Director recorded that as its slip.
The Director confirmed the resume at about 18:40Z, when this session read 12% after
compaction.

- **Stopped at 2026-09-25 ~10:40Z at the owner's word, "prepare for compaction then stop".**
  A compaction landed at 10:24Z while the wrap was running. The wrap finished after it, at 8%
  context. Nothing moved after 04:15Z except the wrap's records, including the review-cost
  ledger rows for PRs 197 to 210. The watcher and the heartbeat loop are stopped. Claims
  141892a7 and a63a7df8 therefore age from their last heartbeat, and they stay attached to the
  handover record. The seat resumes only at the owner's word, re-arming by the recipe in that
  record. The consolidation gate fires, and the Director schedules it:
  - J4 and J18 are closed;
  - the napkin is at 1,361 lines;
  - batches three and five are unprocessed in the Practice Box.
- **State at 2026-09-25 00:25Z, context about 68%; the seat is at rest.** The handover record
  is `.agent/state/collaboration/handoffs/74fc02-marten-mends-shadow-batch-four-handover-2026-09-25.md`.
  **Resumed at 00:35Z** after compaction, at 10% context, under the owner's batch-four word.
  **At rest again at 04:15Z, at 61.8% context (past peak), at a lane boundary.** J18 is landed
  in full (PRs 206 to 209), and so is its hook-quoting follow-up (PR 210, `f08201ab0`). The
  handover record lists what is owed, in order: J2, J3, C7, PR 205's follow-ups, the
  tracked-listing consolidation, and the J18 follow-ups below. Claims 141892a7 and a63a7df8 are
  attached to the handover record. The J18 part B design follows, as record.
  - **Landed:** PRs 197 to 200 (batch two complete), PR 201 (the K Core, `c4174a8cc`), J4 in
    three parts, and J18 part A. The K amendment (2a62905f: the PDR-009 clause as the rule's
    domain) waits on Siren's twin.
    - J4: PR 202 (`9b67670fe`, one tracked-path set in core), PR 203 (`27a8a8e12`, one git
      seam whose listing returns a Result) and PR 205 (`71e822570`). PR 205 makes the
      substrate audit read absent instance-tier surfaces as informational, so a fresh
      worktree exits 0. Its probe is git's index-aware `check-ignore`, a departure from the
      note's `--no-index` design that goes back to Siren as a gain. Its body names six
      follow-ups; wiring the audit into `repo-validators:check` is the first. Claim 8b37f3d1
      is closed.
    - J18 part A: PR 204 (`d0fb0aced`), one owner-only append in core, used by the
      statusline debug log.
    - Every worktree for these is pruned.
  - **J18 part B, the observer (claims 3a3a9280 and 44431f81), redesigned 00:50Z.** The
    B2 pre-execution review asked for changes, and an assumptions review dropped the directory
    hold as disproportionate: the file's own 0o600 mode, owner, link and identity checks protect
    its contents at any directory mode, and only a principal who could already read the log
    could swap the directory. Five pull requests, in order:
    - **B1, PR 206, merged as `b653e3688` (00:59Z):** `appendOwnerOnly` refuses with
      `uid`/`NO_POSIX_OWNERSHIP` before touching anything when Node gives no uid (Windows,
      Android). Codex's P2 on PR 204. Its worktree is pruned.
    - **B1b, a follow-up, not a prerequisite (the seat's decision, 01:00Z):** read the mode
      back after `fchmod`, with the two-reading probe. Security asked for it before the
      observer (WSL with the checkout under `/mnt/c`, CIFS, vfat). The seat's reasons for not
      waiting on it: on such a mount the checkout's own untracked secrets are already exposed to
      the same principals; the observer's log adds low-sensitivity content; and assumptions
      found no such mount in use. Its reviewed shape, if built: one probe in core shared with
      the conformance writer; the port's `fchmod` returns the mode read back; the probe mode is
      0o200, so a stranded probe never locks a persistent log; four docs list the refusal.
    - **B2a, PR 207, merged as `96d49318b` (01:47Z):** the pure modules under
      `agent-tools/src/claude/pre-compact-observe/` (payload read, observation build with the
      byte count, environment snapshot, sibling selection, the two answers), with unit tests.
      The build takes raw measurements and derives the rest. Its worktree is pruned.
    - **B2b:** the orchestration (injected stdin, lstat-based transcript reads, append, clock,
      UUID, env, cwd, argv) and the thin entry, run from built `dist`. The entry takes no
      `failureAsError`, and it tolerates EPIPE on stdout. It writes into its own subdirectory,
      `.claude/logs/pre-compact-observe/observations.jsonl`, which the append's `mkdir` creates
      at 0o700 (a departure from the note's path). An empty or relative `CLAUDE_PROJECT_DIR` is
      unset. ADR-167 rule 1: a recording failure also appends a payload-free line (step and
      code) to `.claude/logs/hook-errors.log`.
    - **B2c:** the registration (`PreCompact`, matcher `*`, timeout 10, both paths quoted,
      because a shell syntax error exits 2, which blocks a compaction); the smoke, symlinking
      `.claude/hooks` and `agent-tools` into a `mkdtemp` project directory whose name holds a
      space, cleaned with `fs.rm`; the turbo inputs; and the activation docs: the hooks README,
      `policy.json`'s notes only, the surface matrix (keep the Hooks row's token order), and
      ADR-167 §Limitations 6.
    - Dropped: the directory hold, its port and fake, and `umask 077` in the wrapper, which moves
      to its own lane under ADR-167.
    - **J18 is landed in full (03:24Z).**
      - B2b, PR 208, merged as `2f2060ab2`. It brought `errorCodeOf` and `invokingUid` into
        core.
      - B2c, PR 209, merged as `17d030cb0`: the entry, the Node bindings, the smoke, the
        `PreCompact` registration and the docs.
      - Claims 3a3a9280 and 44431f81 are closed, and every worktree is pruned.
      - Siren has the landing, the three departures and Codex's re-tighten finding (event
        `2a33cf89`).
    - **Follow-ups the J18 reviews recorded, not yet claimed:**
      - quote the two older wrapper entries in `.claude/settings.json`: done, PR 210
        (`f08201ab0`), with a regression smoke that uses a stub `sonar`;
      - defects in the Sonar-owned secrets scripts, which the Sonar CLI overwrites, so report
        them upstream or wrap them:
        - `prompt-secrets.sh`: `trap "rm -f $temp_file" EXIT` splits on a space in `TMPDIR`,
          leaving the prompt copy on disk;
        - `pretool-secrets.sh`: its `sed` field extraction fails open on a path holding `"` or
          `\`;
      - write the observed PreCompact contract into the surface matrix's §Hook Support after the
        first real compaction, with the harness version;
      - move `compareUtf16` from `typescript-estate/` to `core/` (17 importers; a mechanical PR);
      - owner-only-append hardening, one lane with two parts:
        - B1b, the mode read-back probe;
        - Codex's P2 on PR 209: refuse, or replace, a pre-existing file whose mode admits
          another account, before any byte is written, because `fchmod` does not revoke a
          descriptor already open.

        It changes the statusline debug log's documented retighten contract too;
      - one build instead of six in agent-tools' `test:e2e` chain;
      - the wrapper follows a symlinked `hook-errors.log` with `touch` and `>>`;
      - a test for the `process.stdin` hazard (a late-writing harness gives `EAGAIN`).
  - **J2, six validators on the shared read (not started):**
    - A path-free refusal redactor at the four sites that print an absolute path, plus
      `describeGitReadFailure` (PR 203's gateway review found git's stderr can carry one).
    - Root-anchored scope entries, with the policy file's exemption anchored.
    - The authored-surfaces walker, with stale-script-invocations moved onto it.
    - Cited paths, and cited scripts: each runs over this tree and its findings are cured
      before it is wired.
    - Lineage names. Ask the owner which names to declare first, under the fork-naming rules.
  - **J3, tracked-tree lint and shellcheck (not started).** The Director's verdict (22:2xZ): its
    own pull request, with a merge-landed broadcast naming the one install command. Every seat's
    next commit needs the installer once. 29 tracked shell scripts come to green in the same
    change.
  - **C7 (not started).** The owner ratified "Ratify the concept": bring by default becomes
    PDR-005's default disposition. This seat and Siren author the amendment text, under review,
    in its own lane, and land it in both estates in one window.
  - **Held:** the seed branch (claim 141892a7; the question to Siren is open) and the
    test-doctrine intake (claim a63a7df8; it waits on Siren's K4 draft).
- **The order** from the card:
  1. PR 197.
  2. Batch two, which the owner named for this seat.
  3. The K Core pull request (landed 21:34Z).
  4. Batch four.
  5. Then the handover list's remaining items: C2, D, the test-doctrine intake, G, E and F,
     batch three, and batch five. Batch five (J13, J14, J11) was delivered at 18:03Z and
     acknowledged at 18:4xZ.

*Handover, 2026-09-24 ~17:45Z: Marten mends Shadow (74fc02) hands the exchange seat on at the
owner's two cards' limit.* The cards were "Marten continues past the line" (~15:33Z, batch one)
and "Marten takes it past the line" (~16:31Z, the test-doctrine intake), both relayed by the
Director. Context was 61.2% at 17:23:01Z. The in-flight detail is in the local handover record
`.agent/state/collaboration/handoffs/74fc02-marten-mends-shadow-exchange-seat-handover-2026-09-24.md`,
on this machine only.

- **Landed:** PR 191 (joint set F, `813406e3f`), PR 192 (joint set G, `5de481360`), PR 194
  (`compute-dont-hope`, and `documentation-hygiene` loading as core, `ce5b66249`) and PR 195
  (`record-generalisation-moves`, `7409e5100`, 17:42:47Z). PR 195's merge commit carries the
  rule's first `Practice-Generalisation:` trailer.
- **Open, green, BEHIND:** PR 197 (Cricket dual-scale labels, the channel choice's cost side,
  at `af9e11799`, one settlement push spent). It syncs once at the successor's slot word.
- **Committed, not a PR:** the test-doctrine intake, branch `docs/intake-test-doctrine`
  (`d62e56e27`), the joint text merged three-way. Two reviews found it not landable. Its
  shared-text cures are joint set K4, which the second estate drafts in a fresh session
  (event `06cdeaaa`). Its local cures are in the handover record. It lands after K4 is signed.
- **The queue, in order:**
  1. PR 197, and PR 195's post-merge harvest if it did not run before the handover.
  2. PR C2: the three channel hunks. The Director read the owner's words on ARC as reading A.
  3. PR D: the `.todo` lint gate.
  4. The test-doctrine intake, after K4.
  5. PR G, the `gh` write guard, redesigned as a segment-aware match kind with a closed
     default, the same bytes as the second estate's. Until it lands, mint the bot token by
     hand on every GitHub write; this host's default `gh` credential is the owner's.
  6. PRs E and F: the PDR citation text and its check.
  7. K: K1, K1(c), K2(a) as amended, K2(b) as narrowed, K2(c), and K3(a) to K3(e), all signed (K3(e), the third
     adapter-contract anchor at `practice-bootstrap.md` line 352, signed 17:4xZ), and the two
     `record-generalisation-moves` amendments from JC.net PR 185 (signed ~17:58Z; the text is
     in the handover record). Plus K2(a)'s adapter check
     for the three corpus adapters.
  8. Batch two (three parts) and batch three (two code concepts), both acknowledged and not
     integrated.
- **Numbers**, at register `85d60f27`: to OCE 0 of 21, to jcnet 5 of 28. Row J9, batch one's
  doctrine, counts once 195, 197, C2 and D have merged.

*Boundary, 2026-09-24 ~15:38Z: a compaction at the owner's word, then this seat resumes.*
The owner's word to this seat, verbatim: "please prepare for compaction and stop all
processes". The owner then chose on the Director's card, about 15:33Z, verbatim: "Marten
continues past the line". So the seat that resumes after compaction is this same seat, not a
fresh session, and it runs batch one's intake itself once PR 191 lands. That word covers this
intake and not a further unit, so the seat keeps measuring and names the context reading in
its records.

At the pause:

- PR 191 is open at 0936f14d6, BLOCKED only on its last check (unit-tests). Its threads are all
  resolved. Claim 43dbafee is RETAINED.
- The landing slot yields to PR 193 (Luna stirs Radiance) for the pause. PR 191 syncs again at
  its next slot.
- The coordination branch carries b5d32c95c and this block's commit, and both are pushed.
- Batch one's cover note was re-delivered as blob 324e0fab (correction event 92475eee). All
  ten Box files now pass this estate's markdownlint.
- Both review-cost ledger rows are owed at PR 191's landing, and they cover both pull
  requests.

Nothing survives compaction, so the resume verifies first and re-arms only what is absent:

- Verify: `TaskList` (or the task table), then `claims list` for 43dbafee.
- Re-arm, in this order:
  1. The watcher: `pnpm --silent agent-tools:collaboration-state -- comms watch --platform
     claude-code --model claude-opus-5-5 --supervisor-pid "$PPID" --step-timeout-ms 120000
     --max-events-per-drain 100` under Monitor, 30-minute expiry, re-armed at each expiry.
  2. The heartbeat, a 240 s loop under Monitor, with two legs for claim 43dbafee:
     `comms send --tag heartbeat --title … --claim-id <id> --intent-id joint-sets-f-g-land
     --branch docs/joint-set-f-gate-singleton --current-cycle-label …`, and
     `claims heartbeat --active .agent/state/collaboration/active-claims.json --claim-id
     <id> --now <iso>`, each failing loud.
  3. A compound watch on PR 191: one GraphQL read every 60 s (state, mergeStateStatus, head,
     rollup, unresolved threads, tip reviews) that prints only on change.
- Then land PR 191 as PR 192 landed:
  1. Sync at the slot word.
  2. Run the deletion sweep.
  3. Recompute the gate by name.
  4. Post the premises (draft at the session scratch path `premises-191.md`; rewrite it if
     that path is gone).
  5. Merge through the REST endpoint with the pull-request-merge scope and the head pinned.
  6. Broadcast, then run one post-merge harvest.
- After that: prune both worktrees under the standing prune policy; then batch one's intake.

The order changes from the fresh-session list above:

- The test-doctrine intake edits directive files, and PDR-052 bars directive edits at or
  above 30% context. This seat read 49.6% at 15:30:04Z, so that intake stays with a session
  that starts under 30%.
- Any batch-one file whose landing would edit a directive file waits for that session too.
- The rest of batch one is this seat's, under the owner's card.

*Order of the work.* The owner's order, as Brazier spins Temper (c70341) relayed it at about
13:30Z, verbatim: "Our purpose here is to first make sure that all of our Practice innovations
are integrated into the OCE Practice, our second goal is to bring our Practice up to speed with
their innovations", and "the memories and records of this repo are local to this repo, but the
lessons learned from them are not". Its provenance, in the Director's words: relayed by
Brazier, recorded by the Director (the second estate's Director handoff, `SHA:a57c3a01`),
consistent with the owner's direct words; not confirmed first-hand in this estate. The second
estate's exchange seat is now Siren herds Rudder (158275), from about 13:50Z.

*In flight from this session, each in its own worktree off `engraph`, the pull request
the source of truth for its state:* joint set F, draft pull request 191 (branch
`docs/joint-set-f-gate-singleton`, worktree `oce-wt-joint-set-f`), and joint set G with the
second estate's pull request 171 items, draft pull request 192 (branch
`docs/joint-set-g-director-state`, worktree `oce-wt-joint-set-g`). Both are drafts with no
review leg requested yet. The fresh session makes each ready in turn under the landing-slot
contract, harvests the vendor legs and lands it through the door. Their claims closed at this
seat's wrap. Two shared-text findings on F from this estate's docs review went to the second
estate's next joint set, and Siren accepted both.

*First acts of the fresh session, in order.* PDR-052 moved (1) and (2) out of this session:
it measured 37 % context after grounding, and both edit directive files. The Director
confirmed the placement. The method: `agent-tools session-metadata --vendor claude` with
`claude-opus-4-8[1m]` standing in for `claude-opus-5-5[1m]`, which has no registered window;
both are 1M windows, and the tokens are read from the transcript. The readings were 37.3 % at
13:36Z and 59.3 % at 14:03Z.
(1) The test-doctrine intake. It precedes the J rows because it carries the owner's own
2026-09-24 test ruling, which binds this estate from the word (the "Everywhere for now"
ruling). This estate's §Stubs vs Fakes still licenses call-count assertions, which contradicts
that ruling, so seats here can act on doctrine the owner has overruled until it lands. Take the concept hunks as receiver from the second estate's main
at `SHA:e0e79c07` (its pull request 170, head `SHA:5ce5918f`), never the files whole: the
estates' copies differ far beyond the joint text. Host lines to leave behind: the site's
`jcdotnet/e2e/` paths and suffixes, its recovery node, its testing-patterns examples. The
hunks: testing-strategy §Philosophy (the owner's 2026-09-24 words bullet; the recovery plan's
name out, "existing code that breaks the invariant is a defect" in); §Rules ("Prove
behaviour, never config or content" and "Pinning an absence" lose the designed-sentinel
admission; "a check that needs an external resource"); §Stubs vs Fakes (fakes are simple
functions or objects; which calls were made, how often or in what order is never asserted);
test-immediate-fails item 12 (the same call line), item 4's clock read and item 14's sanctioned
shape retired; the test-expert template's Step 6; tdd-as-design's UI scale and §Why Scales Are
Complementary. The Director confirmed on 2026-09-24 (comms event `6161e95d`) that the owner's
"no excemptions" retires both 2026-08-03 admissions, and the commit names both dates so the
owner can overturn it by a word. The consequence: the Codex dialogues lane's designed-sentinel
tests (Swallow holds Drift, 516619) become defects to cure by mechanism tests once this lands.
Five further gaps were still moving in the second estate at 13:4xZ; take them if landed: the
levels table and cycle text calling E2E a test level; validation-strategy's claim for the
`test` command; no-global-state-in-tests' globs missing smoke locations; the test-expert
template's Step 2 smoke discriminator; the recovery node's import boundary.
(2) H's `agent-collaboration` hunk ("two reads, one write"), the debt declared on #183.
(3) The intake of the second estate's outbound set. Siren herds Rudder delivers it into the
Practice Box after the join ceremony, as untracked files in the primary checkout's
`.agent/practice-core/incoming/` that this estate's seat commits: one file per concept row, text concepts first, code
concepts after, the lessons sweep last. Each file is self-contained, with inline text, and
names Siren's reading of where it lands in this estate, to verify at receipt. The batch's
paired event carries each file's blob ids for the diff proof. Siren measured 21 concept rows
owed (J1 to J23, J12 declined as site-only) plus eight newer concepts. PDR-117's amendment is
already covered by G. With it comes the owner's word to the Director at 13:5xZ, verbatim: "the
labelling of Cricket agents is better in JC.net than in OCE: make sure the Cricket
implementations and other sub-agent details are compared between the repos". A second word
of the same minutes, also to the Director, verbatim: "Crickets judge in the frame provided, we
need them to also judge the frame itself"; Siren carries the wording (the cricket skill and
both base templates gain a frame verdict beside the work verdict). This estate takes those
bytes as receiver. Until they land, a suite run here asks each role to judge the frame as an
artefact as well.

The Practice Box was empty at 13:5xZ.

*The Director's check-ins (owner's cadence, 2026-09-24).* The Director, Wick binds Temper
(ed7b48), checks in with every seat every 45 minutes. Each check-in asks for one state line
(lane, the owner's last word, on track or in a hole, the governing node's todo status
verbatim) and a full Cricket suite: every registered role, normal then adversarial, on one
six-field frame, each role returning a frame verdict beside the work verdict. Act on the
verdicts yourself, and send the Director only a DRIFTING or WRONG-PRIORITY verdict you do not
accept, or a question. From check-in 6 each exchange seat's reply carries a number per
direction, recomputed from source: the second estate's owed rows landed at this estate's head
over their total, and this estate's rows landed in the second estate over their total.

**BOUNDARY, 2026-09-21 18:3xZ — a compaction at the owner's word, then a pause the owner
says may last several days (Zephyr guards Leeward, 281e44).** Read this block first; it is
written for a reader who was not here, possibly a different seat.

**SECOND BOUNDARY, 2026-09-23 10:45Z — the owner changes models.** The pause lasted from
2026-09-21 19:27Z to 2026-09-23 10:45Z with nothing from any peer on the canonical stream. On
the channel, one entry from the sibling seat (2026-09-23T10:50:48Z: the owner ratified both
texts) arrived seconds before this seat's wrap entry, which missed it; the relayed-rulings
paragraph below records it. What changed since the first boundary, all of it landed on this branch and
verified pushed: the retired Copilot seat's final departure facts were written into its
handoff at its request; the context loop ticked once after the compaction, ran five idle
checks and EXITED by its own safety valve, its schedule cancelled by this seat, so it is not
running and is not owed a restart unless the owner re-issues it; the exchange channel carries
this seat's gate-run notices and one correction; the review-cost ledger has rows for 173
and 175. The sixteen scratchpad instruments are conserved verbatim
in `.agent/reports/agentic-engineering/seat-instruments-zephyr-guards-leeward-2026-09-23.md`,
so the lane below starts from bytes. That branch was past its 24-hour lifetime (due 2026-09-22
17:45Z) because the seat paused at the owner's word; its fold, the first act at resume, landed
on 2026-09-23 as #175 (the board's journal). The
successor seat registers its own identity on the thread before anything else (the claims of
this seat carried platform `claude-code` and model `claude-opus-5`; a different model is a
different registration, and the seat's Practice name follows the session, not the model).
One observation with no cause, twice in five runs on 2026-09-21: the commit tool refused a
commit because the staged set it read was empty seconds after `git add` had filled it; the
same files and steps then committed on the next run. If it recurs, the queue's own record
(`commit-queue -- list`, the `staged_name_status` field) shows what the tool read; do not
retry blindly, and do not infer an outside writer from the index's modification time, which
the tool's own status read rewrites.

*Nothing of this seat is running.* A compaction ends every session-scoped process, and a pause
of days means none is re-armed: no comms watcher, no channel tail, no pull-request watch, no
context loop. Silence from this seat is the pause, never liveness. To resume, verify by id
first and re-arm only what is absent: the canonical watcher (`pnpm --silent
agent-tools:collaboration-state -- comms watch --platform claude-code --model <model>
--supervisor-pid "$PPID" --step-timeout-ms 120000 --max-events-per-drain 100 --exclude-tag
heartbeat`), ALWAYS paired with a tail on the exchange channel (`tail -n 0 -F <the channel
file> | grep --line-buffered '^## \['`); monitors expire at thirty minutes and are re-armed at
every expiry notice. On this machine a second git build (a Copilot agent's) has run its own
filesystem-monitor daemon on this checkout, after which plain `git status` blocked for
minutes: if git hangs, prefix the call with `git -c core.fsmonitor=false`, or export
`GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.fsmonitor GIT_CONFIG_VALUE_0=false` for a script.

*What is safe, verified first-hand at this boundary (local tip equal to the remote ref, no
uncommitted file).* This coordination branch, on draft pull request 175. The Core-text branch,
on open pull request 173, held. The credential tripwire landed as pull request 174; the last
fold as 171. `engraph` was at `SHA:047b04f59`.

*Owner rulings RELAYED to this seat by the sibling estate's seat, CONFIRMED by the owner in this
seat's session on 2026-09-23 (received at about 11:00Z), verbatim: "I ratify the decisions that
Brazier communicated to you on my behalf". They bind this estate from that word.* The
confirmation covers the card answers below and the owner's later card answer "Ratify both
texts" (the shared definition and plan), which the sibling seat relayed on the exchange channel
at 2026-09-23T10:50:48Z. That entry sits directly above this seat's wrap entry of 10:51:07Z,
which says the pause held nothing from any peer. That was wrong: the wrap was composed without
re-reading the channel and was appended nineteen seconds after that entry (the second boundary
block above now says what arrived). Among the six rulings that "Everywhere for now" carries here is
the rounds ruling, given in the sibling estate on 2026-09-14 at 15:15Z, verbatim: "I don't want
the number of rounds of PRs to go up." The sibling's PDR-132 Amendment Log (read first-hand at
its main, SHA: 6e576da2) records how it applies there: PDR-132's two rounds bind; after round
two every remaining finding is dispositioned in the same slot turn as the last push (a trivial
cure rides that push, everything else is a signed Rejected line with its rationale or routed
home); a round three is a correctness-defect call only. It nearly coincides with PDR-140 clause
9(b), which it does not simply override; the differences are who decides and 9(b)'s ledger
writes. Its Core home here is owed and judged jointly: proposed as one host-free dated entry in
PDR-132 plus a note in PDR-140 on how clause 4 reads under it, drafted by the sibling seat after
PDR-142 lands, and put to the owner if the reading cannot be made to agree with the owner's
words. The rulings arrived by native message, which
no repository tracks, so this is their only record here. The sibling seat says the owner
answered its cards on 2026-09-21 as follows, verbatim.
On the reading of "best of each Practice" (each estate gets what the other holds, every estate
takes the higher of two, the bad is removed everywhere and the owner's rulings only by the
owner's word): "Yes, that reading". On whether a ruling given in one estate reaches the
others: "Everywhere for now, and later we will explore some kind of centralisation of the
Practice, the distributed model creates too much overhead". On the third estate: "I think
first we move Castr into OCE, then we extract an installable package, and later we review if
we need to break OCE into multiple repos" (this would amend PDR-125 clause 6, "never shared
code"). On its thirteen closed pull requests: "I directed it, it was a point where sunk cost
was causing further loss, it was the economic choice. Castr remains very important, and
development will continue, but identifying the value in the older work was far more expensive
than fresh development. Please feel free to open channels to Poppy" (its seat, named by the
owner as Poppy calls Topsoil). On how much alignment precedes the package: "Full alignment
first, we are defining excellent, this is absolutely the right choice, nothing is delayed or
avoided because of the future extraction". An apparent collision with an earlier answer
(costly rulings "with the package") went back to the owner, who answered: "All six here now",
so nothing in the sibling estate waits for the package. On the definition's home: "New record,
PDR-142", allotted from this estate, byte-identical in both, with PDR-125 clause 6 amended
separately by the owner when the package work begins. And on each estate's own Practice once
the package exists: "both OCE and JC.net contribute to the new definition in the package, and
both adapt their local Practices to use the package, we will still need Practice wide ,
Typescript Practice wide, repo-local and machine-local doctrine, memories, state, so it is
doubtful that everything will be in the Package, although likely all contracts will be". The
sibling seat reads that as the owner's own LAYERS of doctrine, sorted by SCOPE where the
seats' drafts sorted by artefact kind, and means version five to carry both axes.

*First acts at resume, in order (the overdue fold, above, landed first).* (1) DONE
2026-09-23: the owner confirmed the relayed rulings (the paragraph above). (1a) PDR-142 and its
strategic node `best-of-each-practice`, landed byte-identical on their own branch off
`engraph` from the sibling seat's lane, whose frame changed after the first read: land from
its SHA: 2239f93e or later, read whole as receiver first; then the rounds ruling's Core home
(PDR-132 and PDR-140 entries, the paragraph above). LANDED as pull request 177 (SHA:
138e0128f; one round, no push; the committed PDR-142 blob equals the second estate's merged
blob). Two owner card answers in this
seat's session, 2026-09-23 ~13:0xZ. First, "Yes, confirmed": the answer the sibling seat relayed
binds here, verbatim: "the shared concepts are the thing it is important to share, if that
happens to be by exact bytes that is fine... byte for byte transfer is never the goal, concept
transfer is, but where byte for byte transfer achieves concept transfer (and whether it does or
not depends on the rest of the Practice context in that repo) then there is no problem". PDR-142
still lands as identical bytes, because its Practice-wide text carries the concept here, and
PDR-142 ("bytes, identical"; "never re-authors") and PDR-125 ("never bytes") each get one dated
amendment carrying those words, drafted by the sibling seat (SHA: faca1cc8, local on its lane)
and judged here at the Director's route, 2026-09-23 ~14:08Z: PDR-125 signed; PDR-142 signed
with one change (its falsifier's consequence reopens the clause with the owner, never restores a
bytes rule); PDR-141 signed with one change (take the lineage's other two hunks from 173, so the
record is byte-identical). The owner ratified by card at the Director's seat (~14:5xZ); the
sibling took both changes (SHA: 2185dc9f, its PR 155, merged). This estate's twin LANDED as
pull request 180 (SHA: 3a1d47873; two rounds; PDR-142 at the second estate's blob 732632fb,
carrying the owner's second card: the read-through names "never re-authors", and merged text
gets a third remedy). The joint texts (start-right §3a, cures A, B, B2, B3 and D, E's
keep-in-touch sentence moved to a new sketch delivery node practice-two-way-exchange, and the
owner's Director ruling in route-blocks-and-questions-to-director) are pull request 181 (worktree
oce-wt-core-text), LANDED as SHA: 98e059ac5 at 20:30:55Z after three rounds (the third for one correctness defect: the Director section's acknowledgement clash) and two syncs.
THIRD LANE, draft pull request 183 (branch docs/exchange-followups, worktree
oce-wt-credential-guard-twin). It carries PDR-141's missing amendment section (blob 50e3f729,
taken by the second estate) and B5 (start-right-thorough's solo fast path). Still to add: B4
(agent-collaboration.md §Bootstrap Fast-Path) and cure C, both directives, so under the 30%
budget; the practice-two-way-exchange node's mechanism naming all three outcomes, its bound
to this exchange window, and "Not taken" scoped to offered texts only, never to an
owner-ratified one (181's round-two and round-three findings); B6, start-right-quick's register paragraph
("log "no other agents present" through an immutable comms event"), proposed to the sibling
in B's wording; and the follow-up blobs the owner RATIFIED on the Director's card ("the
follow-up wording cures at 2ed0cf71 are ratified; both estates land the same blobs"): from the
sibling's SHA: 2ed0cf71 (PDR-142 superseded by 4bf9b95d at its SHA: 3262d12e, the seats' wording cures and the tie-break grounded in the owner's word, signed by both), PDR-125 e22c7b4b, and the inter-practice-collaboration
skill 80cf1069, taken by bytes with this estate's own changelog entry, after syncing 183 with
engraph. Only then is 183 made ready. Agreed with the sibling in advance: if a reviewer reads
PDR-142's "one of three" as missing a fourth case (the shared contradiction), the answer is
Below-bar and rejected. The three are reasons the bytes fail to carry the concept; a
contradiction both carry is a faithfully carried concept, false in both, which the merged-text
bullet governs; and renumbering would break "the third reason" in both logs. The 2026-09-23 branch folded as #176 (`SHA:f66fd033f`,
2026-09-24 11:05Z); the live branch is the one the director handoff's fold block names. From the
owner's word of 2026-09-24 ("three open PRs to deal with"): #183 landed as `SHA:0d6924427`,
and #179, the Oak line's 1.185.1, as `SHA:fc6aec21a`. The Oak line's 1.185.2 carrier, #212, landed as `SHA:ec4ef1e55` (2026-09-25 15:09Z, by the Director at the owner's word; the record and the proof are on the pull request). Owed, each from a word already given: the host-free adapter line's joint cure
(`<prefix>inter-practice-collaboration`, where the prefix is the estate's configured skill
prefix), signed by both exchange seats, and joint sets F and G, both landing here in one pull
request; H's agent-collaboration hunk ("two reads, one write"), a directive edit for a context
under 30%, declared on #183; the practice-two-way-exchange node naming PDR-142's interim debt
landing (routed from #183's second round) at its next edit. And the owner's test words of 2026-09-24, signed as a joint text by both
exchange seats in the second estate's revision of 12:20Z (a record of what the product sends
out through a port is output; which calls it made is never asserted; the exact bytes are on the
second estate's test-doctrine alignment pull request), for testing-strategy §Philosophy, with
the same line in test-immediate-fails item 12 and the test-expert template's Step 6. In this
estate the ruling also contradicts testing-strategy §Stubs vs Fakes ("enable assertions on call
counts, arguments"), which the cure must reach. The second estate's review found five more
defects in these bytes: the plan named in §Philosophy, no clock read in item 4's IO list,
"External-resource tests must fail fast", tdd-as-design calling the UI scale a check, and
PDR-027's "Four binding rules" over six items. All are directive or Core edits for a context
under 30%. And the intake of the second estate's outbound set: its exchange seat has
classified 126 Practice files as outbound to this estate (the Director's check-in of
2026-09-24), and no seat here has named their intake. It is this estate's work, beside the
symmetric merge in the first acts. Each file is read whole as receiver and landed by bytes where
the bytes carry the concept here (PDR-142).
The second estate's seat sent its consolidated outbound list by native message on 2026-09-24,
which no repository tracks, so this is its record here. Each item is in engraph's bytes too.
(1) Test doctrine, its slice three: the signed call line in item 12, test-expert Step 6 and
§Stubs vs Fakes; the plan name out of §Philosophy; the clock read in item 4; "a check that
needs an external resource"; tdd-as-design's UI scale (component tests are integration, UI at
check scale is browser journeys); and, relayed as the Director's verdict (confirm with the
Director before acting), the owner's "no excemptions" retiring both 2026-08-03 carve-outs: the
designed sentinel in "Prove behaviour, never config or content" and item 14's "one named
sanctioned shape", with both dates declared in the commit so the owner can overturn it. (2) Its
pull request 167: three over-width prose lines in metacognition reflowed to 100 characters,
words unchanged. (3) Its pull request 168: PDR-027's "Four binding rules" over six items, and
PDR-011's "conserve-insight-and-delete", a joint amendment. (4) Its pull request 166:
strict-validation-at-boundary admits "a path-only stale-invocation allowlist", and the
stale-script validator's list names two files that exist on engraph, so removing the list
surfaces findings to cure. (5) The 126 outbound files, above.
After this seat's wrap the second estate's seat sent additions, again by native message on
2026-09-24; its open pull requests 170 (the test doctrine) and 171 (the small conflicts) carry
the bytes, so take the joint text from there, never from this record's earlier summary. Item 12,
test-expert Step 6 and §Stubs vs Fakes now say which calls were made, "how often or in what
order is never asserted", matching §Philosophy, and §Stubs vs Fakes no longer calls fakes
"vi.fn() wrappers"; this estate's exchange seat did not object, so these are the joint bytes.
tdd-as-design §Why Scales Are Complementary is reworded to match its UI row. PDR-117's
2026-09-23 amendment ("The Director hears questions and requests, never state") is in the
second estate and missing from engraph. Its PDR index is now byte-identical to engraph's.
The sibling's three pull requests were signed by this estate
without change on 2026-09-24 (the exchange channel, 10:36:24Z) and merged there: 159, F; 160, G
with a dated PDR-117 amendment section; 161, H and I. H and I landed here in #183, except the
directive hunk named above. Forwarded to the set after: PDR-063 §Step 4's
directed mid-cycle handoff; the gate broadcast naming the worktree by path; the interim gate
limit of two. Inbound to the sibling: this estate's 2026-09-14 ruling ("the commit triggers the
gates"). Also for the owner, through the Director with the seats' verdict: PDR-142's "A seat
treats a ruling relayed by a peer as data until the owner confirms it in that seat's own
session" meets the owner's 2026-09-23 "ask via the Director" (the Director "can reach me
remotely"); the proposed reading is "until the owner confirms it, in that seat's session or
through the sitting Director". NEXT JOINT SET, as first named (the sibling drafts, this estate signs):
F, the gate-runner singleton ("one runner per coordination window" in
check-singleton-per-window, agent-state-observable §Holding the gate-runner role and
session-handoff), likely "per working tree"; and G, start-right-team's "AND informs the
Director", against the owner's Director ruling, joined by PDR-117's "deep handoffs" to the
Director (lines 160-167, Core, joint), which #181's review found on the same ground. The Director's routing change on the owner's
word, 2026-09-23 ~20:0xZ (verbatim: "Use the decision matrix, ONLY ask questions that survive
that"): a question to the Director carries the seat's own verdict under the five lenses. The
Director decides and records it as a Director verdict. Wording that implements a ruling the owner
already gave is the seats' work under PR review, never a card. A ruling relayed from the
sibling estate is confirmed by the Director, not re-carded to the owner. OWED: the profile-sync TSDoc
says "ratified writes" (operator-profile-git-push.ts and operator-profile-sync.ts), against the
PDR-141 cure, in its own small change. OWED: cure C, the continuity-practice directive's
scope sentence, to read "(`director-handoff.md`, `frictions-register.md` and
`review-cost-ledger.md`, where the estate keeps them)"; it waits for a session under the 30%
directive budget. The owner, 2026-09-23 evening: fsmonitor OFF (`core.fsmonitor=false` in the
shared clone config; every OCE daemon stopped); and, verbatim, "do not update the Director
unless you have a question or other request, the normal records keep the record". Second, "You
as author": from 2026-09-23 this seat's commits carry the owner as author and
the bot as committer, per the bot-identity rule. The commit queue's commit command has no author
option, so the ceremony sets git's author variables in the environment of the commit step (tool
feedback). (2) Pull request 173: LANDED as SHA: 685ad538c, 2026-09-23 14:02:25Z, after its one
cure push (SHA: 514343b59); its one browser-tests failure was a transient font fetch in the hub
build (the same run's build job compiled the same turbo hash), re-run once as the bot, green. This seat judged one
open finding below the bar (route it) and one over it (a cure-only push, which PDR-140 clause
9b permitted). The rounds ruling now binds here and 173 is past round two. The seat read the over-bar
finding first-hand at 173's head (SHA: 1e6629dcf): decisions 11 and 14 limit the push to
"ratified" writes while the record's own test says every write is made "on the operator's
word", so a valid unratified write could be left unpushed, a correctness defect in Core text.
The owner's card answer of 2026-09-23 to "May I make that push?" was "Yes, one cure push": ONE
cure-only push after the fold lands, the changelog finding's one-line cure riding it, the text
agreed with the sibling seat first so both estates carry one byte sequence; then 173 lands
through the front door. (3) The markdown-it
floor, small and owed. (4) The symmetric merge, the act only this estate's seat
can do, since this estate has so far received NOTHING of the sibling's: the recipe is in the
sibling seat's channel entry of 17:54:31Z, "theirs" pinned to the sibling's landed
`SHA:6e576da2`, its rule frontmatter stripped and judged as its own offer. (5) Host facts in
this estate's text, cured at the source (the list is in that same entry). (6) Version five of
the shared text was ratified by the owner ("Ratify both texts"); it lands as item (1a) above,
PDR-142 allotted here before the third estate's renumbering. The note to Poppy calls Topsoil
(castr's seat) is owed once PDR-142 has landed; either exchange seat may send it.

*Surfaced to the owner in chat only, until now.* A registry audit on 2026-09-21 reported two
critical advisories on `next` and fifteen high across `sharp`, `js-yaml`, `fast-uri`,
`smol-toml` and `@xmldom/xmldom`; outside this lane, not acted on. That audit cannot see
REPOSITORY advisories at all, which is how the markdown-it one was missed.

*The Codex dialogues rebinding* (node `the-codex-dialogues-exec-binding`). Slices 0 and 1a
landed as #184 and #186. Slice 1b is Blazar lifts Corona's (b65a9a), with Forge herds Vapor
(01a0d2) as the Codex seat on the runtime evidence. Its pickup is the napkin section "2026-09-24
wrap — the Codex dialogues lane" and the node's review-dispositions ledger. Since the 2026-09-24
handover to Swallow holds Drift (516619), the pickup is the thread record
[`codex-dialogues`](threads/codex-dialogues.next-session.md).

*A lane nobody holds.* The instruments that repaired 2026-09-21 live in a session scratchpad,
which a new session does not inherit: a thread-reply script that refuses a disposition with
no bar marker or signature, a commit ceremony, a merge-base deletion sweep, a pull-request
watch. Their concepts are on the napkin. The bytes of the first two are in the instruments record
named in the second boundary; the deletion sweep and the pull-request watch were never scripts
in that record, so only their concepts survive. Landing the reply instrument in the estate's tooling is an offer under
the shared text, and a lane here.

*Owed to peers.* To the sibling seat since the morning: a judgement of the "stand-down"
wording in PDR-117; and a measurement for the third estate that the relayed ruling probably
supersedes. To the Copilot seat Whippoorwill holds Frost: its observation of whether a
waiter's exit wakes its idle session, added to its report under
`.agent/reports/agentic-engineering/` when it sends it. That seat retired at the owner's word
on 2026-09-21 and, holding no commit authority, left a terminal handoff under
`.agent/collaboration/handoffs/` and a formation letter in the experience tier; this seat
landed both as they stood. The handoff's directory is NEW: this estate's handoff tier is under
`.agent/state/collaboration/`, which is untracked by design. Whether a retiring seat's handoff
belongs in a tracked home is a question for the Copilot support encoding, not yet judged.
The shared text reached version five, signed by both seats with two changes of this seat's
applied, and the owner ratified it by card ("Ratify both texts"; relayed 2026-09-23 10:50:48Z,
confirmed in this seat's session the same morning).

The board is `threads/estate-coordination.next-session.md`; its journal's newest entry is the
fold of pull request 176. The live branch is named once, in the director handoff's fold block.

The operator-profile lanes, by pull request number. This record states no tip and no review
state, because those are what went stale here twice; read the pull request. 172, the twin of
the sibling's cures, is on `engraph`. 173, the Core-text cures, is HELD; its path follows the
rounds ruling (first acts, item 2). 174,
the credential tripwire as an engine over an injected vocabulary, landed on `engraph` as
SHA: 047b04f59. The owner approved a STAGED
review of the operator-profile module on both estates behind an owner checkpoint, not yet run;
its load-bearing content (objects, stages, the checkpoint, the caps) is on the board, lane item
4 of `threads/estate-coordination.next-session.md`, and no per-user file is a dependency.

The owner's word to both exchange seats, 2026-09-21 17:2xZ: decide TOGETHER what "best of each
Practice" means, with one shared definition and one shared plan, slowly, alignment before
speed. The work is on the exchange channel, from the entries headed INDEPENDENT DRAFT onward.
The text went through five versions there and the owner ratified the fifth; it lands as
PDR-142 and the strategic node `best-of-each-practice` (first acts, item 1a). Two lanes are
owed HERE from that work, each its own branch off `engraph`,
their inputs in the sibling seat's channel entry of 17:54:31Z: the symmetric three-way merge of
the sibling's post-pin rule and skill text into this estate (the recipe is there; the
sibling's rule frontmatter is an offer, judged as its own row, never merged in silently); and
the host facts in this estate's rule and skill text, cured at the source and stated host-free
(the list by file is there, with seven review findings against this estate's text). Also owed,
small and soon: a markdown-it floor. This estate resolves 15.0.0, which sits inside two
REPOSITORY advisories that no registry audit or dependency gate can see; the sibling's floor is
merged. The seat's replies go out only through a scratchpad instrument that refuses a
disposition without pr-lifecycle's bar marker and signature.

1. the three-estate Practice exchange (this estate, the sibling personal-site estate, castr),
   opened by the owner on 2026-09-21 with the sibling's seat Brazier spins Temper (c70341) as the
   guest exchange seat here (registered `b1c30d15`, adopted `821a3b59`) and this estate's seat
   answering from its records. The dialogue is the ARC channel
   `.agent/collaboration/rapid-comms/2026-09-21-three-estate-practice-exchange-brazier-spins-temper-and-zephyr-guards-leeward.md`
   (tracked here, append-only); the concept register with a disposition per estate is the
   sibling's pull request 139, its rows dispositioned from this side on the channel. Owed HERE,
   each its own lane off engraph, never the coordination branch: the declaration generators
   landed in slices (J1, the frontmatter on 126 rules); the merge door learning the docs-only
   bot-authored class (lane item 8, three instances today); a no-IO defect in a test this
   seat wrote in pull request 172 (`operator-profile-frontmatter.unit.test.ts`, the
   `resolveProfileRoot` test calls `path.resolve` on a relative path, which reads the
   process working directory), found by the estate's own test-expert and present on `engraph`;
   the orientation row routed from pull request 172 (lane item 4 of the board); castr's
   semantic-merge driver (C1); the seven rules of J9 by one records PR; the pr-watch
   reconvergence (two windows). The owner-word rows O1–O3 are PDR clauses and ride their own lane
   with the owner's word recorded;
2. the consolidation's remainder — its memory-file pass (#159, `SHA:efb2942e9`) and its close
   (#169, `SHA:72cab5667`) are on `engraph`; what remains is the owner's word on the open
   decisions `threads/continuity-memory-and-knowledge-flow.next-session.md` lists, and the
   directive-tier candidates held below 30 % context;
3. the remaining half of slice 1;
4. the still-owed items: the operator-profile follow-up PR, the owed-items records PR, and the seven
   local defects from the 1.181.3 sync. Two more belong with that work list. First, re-read the
   carried-code findings of #99 (1.179.0, three threads, no file of their own) and #127 (1.181.1,
   `.agent/reports/upstream-sync/upstream-report-draft-1.181.1-sync-2026-09-11.md`) under the
   peer-fork model, and add the true ones to the list; the cross-fork skill records that neither
   set has been re-read. Second, the names that still carry the withdrawn model: the
   `upstream-sync/` report directory and the `automation/upstream-carrier-*` branch prefix. The
   skill now defines "upstream" only as the Oak fork in its role as a sync source, and the 1.181.3
   list's header records that renaming is a separate change, not yet made. The owner's word
   (2026-09-17): rename both in one small lane with a link sweep, after the carrier #154 lands,
   since its machinery lanes and the carrier branch use the current prefix. A second small lane,
   from F-191: register the Opus 5 and Fable 5.1 window sizes in
   `agent-tools/src/session-metadata/window-registry.ts` so `session-metadata` reads this seat's
   context without a stand-in entry;
4. scheduled maintenance: TypeScript strictness to the owner's target set, after the
   jimcresswell.net strictness slices land. The direction was relayed 2026-09-16 by Cauldron herds
   Lustre; its full substance is in the estate-coordination record's §"Tool and code lanes
   owed" item 7.

The landings of 2026-09-12 to 2026-09-15 (the operator profile's schema as #144, its sync
tool as #145, the review-cost gate's sync pass as #146, then #143 and the fold #137) are
finished;
their open pickups live in the estate-coordination thread record's §"Open items the journal
named, with no other home", their narrative in its archive
(`.agent/memory/operational/archive/estate-coordination-thread-2026-09-20.md`), and the
profile's own landings in the continuity-memory-and-knowledge-flow record.

### Reliable Atoms workspace class — owner rulings recorded (2026-09-14; left uncommitted, then committed in `f24683337` the same day)

**Owner, 2026-09-17, verbatim:** "Reliable Atoms as a concept will be completely removed, this has
not happened yet, but it will, we have a replacement concept that is far more effective and
useful". Read what follows as the concept's standing record until that removal lands; do not
build on it, and do not name or infer the replacement concept from here.

The 2026-09-14 rulings (an owner-directed docs-only session) were committed the same day in
`f24683337`; the surfaces they touched are listed in the paused [budget thread
record][budget] §2026-09-14. Still open from that note: deleting the
unregistered `max-files-per-dir` ESLint rule is the delivery node's first slice, a source
change with gates, not a docs sweep; and no existing core workspace is a reference for the
class.

### Plans estate — superseded-node placement to re-true (2026-09-06)

A 2026-09-06 review round moved a superseded delivery node from `delivery/` into
`delivery/archive/` (commit `0058c2654`); the plans index (`.agent/plans/README.md`
§Layout, amended in `7e7dce9fa`) states the opposite placement — a superseded node keeps
its place and names its successor — and the node schema keeps `superseded` and
`archived` as distinct transitions. One of the two surfaces is re-trued at the next
plans-estate pass; until then the index is the stated authority.

### The operating model (owner-set 2026-07-17) — standing; pickup authority is `director-handoff.md`

The 2026-07-17 cold-pickup queue that lived here is re-owned through the
Director records (its still-live items: the AIP-128/129/130 enforcement
tranche — owner rulings ride the tickets; the compressed v2 cycle,
owner-named critical path — inputs `pr-review-corpus-analysis-2026-07-16.md`
and the F8 report under `.agent/reports/restatement-audit/`; the refounding
restart at its gate; the cricket tally toward the flip). The dedicated
consolidation it queued ran 2026-07-23 (§0a below). The operating-model
paragraph below stays the standing doctrine reference it was.

**The operating model (owner-set 2026-07-17):** the primary checkout lives ON
`coordination/estate-2026-07` with ZERO dirty files; live fleet surfaces
(napkin, continuity, registers, ARC channels) are tracked and committed there;
canary keys stay gitignored (never-in-history); `.agent/state/collaboration/`
runtime incl. `handoffs/*` is gitignored (handoff records are MACHINE-LOCAL).
All PRs target `main`; after every merge, merge `origin/main` back into the
coordination branch and push. Estate roll-ups to main go via SHORT-LIVED
branches cut from the coordination tip (never a PR from the rolling branch —
the merged-PR bot-review treadmill; PR #405 109 threads vs cut-branch #408 at
5), deleted at merge; roll-up trigger is session close or owner word. Ordinary
ticket branches cut from `origin/main` in a worktree (the ticket's
`gitBranchName`), never from the coordination tip. Every push pays the full
pre-push gate (~4–6 min): batch cures, one push per adjudicated round.
Capture-branch hazard: marker-probe captured files against current main before
any merge (stale-capture-wins — see `distilled.md` 2026-07-17).

### Codex-to-Codex hook review — RETIRED at owner ruling (2026-08-02)

The lane is retired: PR #403 closed unmerged (2026-07-20) with its state preserved on the pushed
branch, preservation PR #705 closed and the branch deleted; the report and corpora are landed.
The [thread record](threads/paused/codex-to-codex-hook-review-experiment.next-session.md) holds
the experiment's frozen evidence, verdict and negative results; nothing resumes from here.

### Source integration workspaces — ready, sequenced after the P0 audit (2026-07-15)

Evidence: the [`oak-integrations` report family](../../reports/oak-integrations/README.md).
Executable owner: the
[source integration workspaces plan](../../plans-backlog-2026-07/architecture-and-infrastructure/current/oak-source-integration-workspaces.plan.md)
(optional pinned source checkouts for OpenAPI/Castr/Ontology/Database-Tools;
public-root path complete when submodules absent). `ready-for-execution`,
sequenced after the P0 workspace layer-separation audit; the executor runs the
plan's blocking preflight first (source visibility, branch policy, npm scope,
vendor call shapes).

### Reusable curriculum architecture — evidence complete; promotion owner-directed (2026-07-15)

The [three-report family](../../reports/oak-reusable-curriculum-architecture/README.md)
and the future
[planning brief](../../plans-backlog-2026-07/connecting-oak-resources/reusable-curriculum-architecture/future/reusable-curriculum-architecture-planning.plan.md)
are the durable homes. `connecting-oak-resources` + `semantic-search` stay
paused; no implementation authorised — the next action is the brief's
owner-directed promotion trigger only.

### agent-tools architecture — plan authored; commit + standard deferred (2026-06-29)

`check-encoding` (the permanent UTF-8/encoding scanner) is landed and wired into `pnpm check`
and pre-push. The deferred architectural excellence is a strategic brief —
[`agent-tools-architecture-standard.plan.md`](../../plans-backlog-2026-07/agent-tooling/future/agent-tools-architecture-standard.plan.md)
(WS0 the execution-model fork → ADR + enforcement + encoding-engine→`packages/core` + the
where-supported Write/Edit hook + convergence) — with the analysis at
[`reports/agent-tools-encoding-guard-and-architecture-2026-06-29.md`](../../reports/agent-tools-encoding-guard-and-architecture-2026-06-29.md)
and Callisto's handoff at
[`reports/agentic-engineering/agent-tools-architecture-state-and-check-encoding-handoff-2026-06-29.md`](../../reports/agentic-engineering/agent-tools-architecture-state-and-check-encoding-handoff-2026-06-29.md).
Owner direction 2026-06-29: **working now, excellence later** — the standard is a dedicated future
session (promotion runs the plan's WS0 decision pass first). State trued
2026-07-23: the scanner is LANDED and wired (`pnpm encoding:check` in root
scripts; `corpus-analysis/` is committed code, the old WIP hold is gone); the
architectural standard remains the future brief.

### Comms-Corpus Research — RETIRED 2026-06-14

Thread concluded (WS0–WS7, PR #208 merged `a6b14a8a3`); findings homed in **PDR-094** + **ADR-199** + the
`reports/agentic-engineering/` synthesis + keystone M4. Retired record:
[`threads/retired/agent-collaboration-research.next-session.md`](threads/retired/agent-collaboration-research.next-session.md).
**Standing residual** (not a reopened lane): the coordination-tier curator-pass — the ~1,707-event
residual awaits body-read disposition; work-list + recipe in the retired record's §"WS7 Closeout".
**Substrate correction (2026-07-03):** the events are no longer on live disk (removal unexplained —
corpus-generalisation review R1); re-materialise from the git tree at `255117a43^` before the pass.

### Agent Naming (v3 + era-pinning cure)

Thread [`agent-naming`][agent-naming]; controlling plan
[`agent-naming-schema-v3.plan.md`](../../plans-backlog-2026-07/agent-tooling/current/agent-naming-schema-v3.plan.md)
(DECISION-COMPLETE / QUEUED, `current/`). v2 merged (PR #189). **Next safe
step**: execute **Phase 1 (WS1, era-pinning cure)** off a fresh branch from
`main` — the P1 single-valued-identity fix (hooks pin the era
`OAK_AGENT_NAMING_SCHEMA_ID`, not the rendered name). It ships independently and
is the owner-ordered prerequisite for v3 activation. Phases 2 (C wordlist
curation, owner taste review BLOCKING) and 3 (v3 registry entry + activation)
follow. Orientation: read the thread record, then the plan, then re-grep the
`OAK_AGENT_IDENTITY_OVERRIDE` consumer set (plan-body first-principles check).

### Agent Experience (AX) Improvement — WS-3 F-41 LANDED; next highest-impact item

Umbrella plan
[`agent-experience-improvement.plan.md`](../../plans-backlog-2026-07/agent-tooling/current/agent-experience-improvement.plan.md)
(`current/`), evidence
[report](../../reports/agent-experience-cause-class-analysis-2026-06-21.md), doctrine PDR-111.
**WS-3 (F-41 path-safety) is DONE** (`b5408291d`+`c90150ffa`+`4fd640089`): `resolveCoordinationHome`
resolves the **primary checkout** via `git worktree list`, so any worktree seat shares one coordination
home. **Next safe step (owner-chosen 2026-06-22): WS-1 — the CLI-ergonomics conformance guard.** Execute
[`agent-tools-cli-ergonomics.plan.md`](../../plans-backlog-2026-07/agent-tooling/current/agent-tools-cli-ergonomics.plan.md)
from **Phase 0** (the convention-audit + scope-ratification gate) → WS6 (the PDR-055 cl.10 conformance
guard); retires the largest cause-class (~19 frictions, Class A). Subsequent AX items: **WS-4** (the
`frictions-register` drain validator that recomputes integrity against fs/git → **WS-6** disposition
ledger — the systemic spine); **WS-2** (watcher liveness + canonicalisation); **WS-3 B2** (the deferred
F-41 CLI tail).

### Agentic Mechanisms Discovery

1. Treat the parent plan
   [`agentic-mechanisms-discovery.plan.md`](../../plans-backlog-2026-07/discovery/future/agentic-mechanisms-discovery.plan.md)
   as the layer map for skills, MCP Server Cards, MCP runtime discovery, A2A,
   registry metadata, and generic AI discovery proposals.
2. Resume executable work from
   [`agent-readiness-discovery-hub.plan.md`](../../plans-backlog-2026-07/discovery/current/agent-readiness-discovery-hub.plan.md),
   starting with `ar1-refresh-standards-and-live-estate`.
3. Keep Web Bot Auth in Phase 1 as a decision-ledger and security-evidence
   bridge; the future child plan owns any later enabled-control rollout.
4. Do not implement gated `future/` endpoints or metadata until the owner
   explicitly promotes the relevant child plan.

### Agentic-Engineering Curation

0. Corpus generalisation: Phase 0 paused at a stable point (2026-07-05/06). The
   self-contained restart brief, with the branch-and-merge sequencing, is the AEE thread
   record §CORPUS GENERALISATION (its PHASE 0 block).
0a. **Deep-consolidation carried work (the only part a next curator needs).** The
   ordinary triggers govern when the next pass fires; there is no inherited debt
   beyond these named items:
   - **Comms-event rotation (`consolidate-docs` step 3a)** ran on the primary
     checkout on 2026-09-07 under the recorded 2026-08-14T06:16:28Z watermark
     and the provenance gate (heartbeats past 48 h by the harness; substantive
     events at or before the watermark by hand). Moves are facts about the
     checkout that ran them (PDR-094): recompute the live and archive counts
     before trusting them elsewhere. The 2026-08-14 → 2026-09-07 window's
     absorption sweep is not yet declared, so no newer watermark exists. Events
     younger than their class window are the live coordination stream and are
     never moved. The curator-disposition input-channel tooling gap rides the
     comms-watch-storage-redesign lane.
   - **`director-handoff.md` live-file curation LANDED 2026-09-08** (the
     Director's 2026-09-07 ruling): the live file keeps the Brief, the fold block
     and a live snapshot; every prior `CURRENT HANDOFF STATE` block is verbatim in
     `.agent/memory/operational/archive/director-handoff-current-handoff-state-2026-09-08.md`,
     so no binding owner word was drained. What remains is a bounded sitting over
     THAT archive: the ~42 numbered owner rulings its blocks mark binding each need
     a homed-or-not check (ruling by ruling against the rule, PDR or skill that
     should carry it); a successor sizes it by checking rulings 1–42 against their
     homes, and the archive stays as the literal record either way.
   - **The tiered-sight / multi-machine PDR candidate** (machine-local vs
     repo-bound state classes; the nothing-load-bearing-on-one-machine invariant;
     the standing pipeline replacing one-off rescue) is a doctrine seed on the
     Director's map, reconciling with PDR-094 / ADR-199 rather than duplicating
     them. Its substance is the comms-corpus discovery report §Tiered sight.

2. The relative-link integrity item is accepted as a future validator lane, not
   implemented tooling; promote the plan only on its recorded trigger.
2a. `agent-collaboration.md` is hard-over on lines (380/360) after the injected-asymmetry doctrine
   and the ws1b sidebar-preference clause landed (justified substance; the file was already at
   359). The named remediation is its own `split_strategy`: create
   `agent-collaboration-channels.md` and extract the per-channel protocol detail — a focused
   future extraction, not a trim.
2b. **Post-ws1b hard-fitness remediation lane (2026-07-03).** The ws1b graduations pushed four
   further surfaces marginally past hard — `testing-strategy.md` (459/450 lines),
   `docs/engineering/testing-patterns.md` (232/200), `docs/governance/development-practice.md`
   (286/280), `collaboration-state-conventions.md` (12045/12000 chars) — each from
   correctly-placed substance, never to be trimmed. Structural responses per each file's own
   `split_strategy` at the next natural boundary (testing-patterns' gotcha lists are the natural
   extraction; development-practice's markdown-authoring bullets likewise). Acceptance: the
   substance survives verbatim in a home at least as read-proximate, and the source returns
   within hard. `principles.md` and this file's char pressure pre-date the pass.
3. Comms-event rotation is the retention-gated curator-pass (ADR-199 / PDR-094): archive-move events past
   their class window, gated on absorption + provenance. Analysis is never gated; fitness is routing
   evidence only — never archive, split, shard, or rename unprocessed content to improve scores.
4. **Practice Box dispositioned 2026-07-23 (owner card)** — see the
   §Current State inter-Practice bullet for the disposition. Still queued,
   owner-scoped: the dedicated cross-estate integration session for the
   resonance bundle's four design-shape offers (carried since 2026-09-17 in the
   AEE thread record's "Offered by resonance on 2026-07-08" block; proof-ladder claim-typing,
   refusals-list, posture-selection procedure, obligation-family) plus the
   earlier-noted recomputable-plan-state / worker-class / protocol-PDR
   candidates; a further PDR-117 host-indirection tightening landed
   2026-07-23 (the literal path removed from the portable body).

0d. **`~/.claude/plans` (machine-local, per-user) was triaged in full on 2026-08-14**:
   all 26 files then present were read and classified — 18 landed or superseded (homes
   verified at file:line), 7 foreign-estate (left in place; deletion is an owner call),
   1 valuable-unlanded whose two residues landed at `35d9bca74`. The per-file verdicts
   are conserved at the 2026-08-14 ~07:3xZ entry of
   `.agent/memory/active/archive/napkin-2026-09-02.md`. A later pass reads only files
   dated after 2026-08-14.

### Connecting-Oak / PR History

The [thread record][connecting] holds the lane's standing decisions and grounding. Before
resuming paused graph-substrate work, re-check current PR, CI, Sonar,
CodeQL, active claims, commit queue, and git state. Do not rely on historical
issue counts in archived prose.

### MCP Test Estate + Observability Sinks (both DECISION-COMPLETE 2026-06-06)

Both plans are `🟢 DECISION-COMPLETE`, execution owner-scheduled. Neither has a
dedicated thread record yet — the session-level home is the § Current State entry +
this section; create a thread record when execution is scheduled.

1. **Test estate** —
   [`unified-mcp-server-test-harness.plan.md`](../../plans-backlog-2026-07/sdk-and-mcp-enhancements/current/unified-mcp-server-test-harness.plan.md):
   WS0 (built-server smoke harness) + WS3 (network-free e2e rebalance) are
   EEF-independent and executable now; WS1 (= EEF D7) is gated on EEF D6 landing.
   Cross-plan: sequence WS3's live-executor consolidation BEFORE the MCP slice of
   `no-io-test-boundary-and-di-recovery.plan.md` (collision risk, per the plan's
   §Cross-Plan Coordination).
2. **Observability sinks** —
   [`observability-sinks-decoupling.plan.md`](../../plans-backlog-2026-07/observability/current/observability-sinks-decoupling.plan.md):
   C1+C2 (atomic: forcing-function test + standalone OTel `NodeTracerProvider`, adds
   `@opentelemetry/sdk-trace-node` + amends ADR-171) → C2b (build the `SENTRY_MODE`
   bridge in env-resolution + reconcile the sink-enum) → C3 (migrate consumers) → C4
   (renames) → C5 (close). Execution gated on the relevant feature branch(es) merging.

## Open Owner-Decision Items

1. MCP product analytics has no open implementation-shape decision. MCP-63
   proceeds from the ratified plan on PR #568; the remaining owner-held decision
   is October public-beta enablement after MCP-173's evidence is complete.
2. Monorepo workspace topology is held by owner decision (2026-05-09) until after
   the graph MVP implementation tranche, unless the owner reopens it.
3. MCP launch-readiness: ratify the impact-first Stage 1–4 ladder (assessment report §8) →
   promote the launch-readiness-and-milestone-redefinition stub. K1–K3 keystones are ratified
   and absorbed by the strategy corpus.
4. External-facing capability corpus: decide source-of-truth topology and first-tranche scope
   — these gate Direction A `t0` / plugin-package `w0`
   ([`external-facing-capability-distribution.plan.md`](../../plans-backlog-2026-07/user-experience/educator-end-users/current/external-facing-capability-distribution.plan.md)).
5. Native-MCP-auth build-vs-buy: adopt / adopt-partial decision on the
   [spike](../../plans-backlog-2026-07/security-and-privacy/future/native-mcp-sdk-auth-build-vs-buy.md).
6. Upstream/SDK forks: endpoint-style cross-refs in MCP tool descriptions; Q-010 (repair vs
   retire the orphaned `oak-curriculum-sdk` typedoc estate).
7. Curriculum graph estate — single-team proposal: whether to bring the Open Curriculum Ecosystem,
   the Open Curriculum API, the Curriculum Ontology, and Atomic Concepts under one team for ~6 months.
   See [`curriculum-graph-estate-synthesis-2026-06-22.md`](../../reports/curriculum-graph-estate-synthesis-2026-06-22.md);
   an SLT brief is held local (reference-local, not version-controlled).
8. **Corpus-generalisation Phase 0 scheduling** (posed 2026-07-03): when/what shape — recommended
   soon, fresh-seat, allowed to span multiple sittings (seventeen-question agenda; absorbs salvage
   ws2). The plan's promotion trigger; nothing else blocks on it.
9. **Comms forensics depth + live-event PII posture** (posed 2026-07-03): (a) how much further
   effort on the unexplained untracked-tier removal — recommended accept-and-rely-on-the-watermark-
   cure (data recoverable at `255117a43^`); (b) the 21+ live comms events embedding machine-local
   paths — recommended rely on the mandatory pre-fan-out PII screen rather than mutating immutable
   event records (a redact and/or write-time-guard option was offered).
10. **Estate-wide markdown→graph inversion ADR timing** (posed 2026-07-03): a Proposed ADR
    generalising ADR-200 + PDR-119 (surface-class taxonomy; PDR-122-bound reconciler) —
    recommended a dedicated authoring session soon; alternatives: after Phase 0, or after ADR-200
    WS2/WS4. Evidence: the research report §Further research (markdown→graph subsection). Decision
    input landed 2026-07-05: ADR-173 §"The estate is plural by design" carries the owner-corrected
    graphs-are-a-method doctrine (data-layer SSOT; deliberate plurality above; integration at
    source and surface) that the authoring session must honour.

## Repo-Wide Invariants / Non-Goals

Each invariant below has a canonical home; this section is a resume aid, not the
authority.

- Comms-log rotation is paused until a dedicated comms research plan exists.
- No compatibility layers; replace, do not bridge.
- Distinct architectural layers live in distinct workspaces.
- TDD at all levels; tests prove product behaviour, not file presence.
- Owner word 2026-09-03, in force until 2026-10-06: internal Oak systems are not accessed
  from this checkout ("we should not access any INTERNAL Oak systems, we will still access
  public services such as the curriculum api/downloads etc"). Private Oak GitHub
  repositories are internal systems under that word — a read of `oaknational/oak-skills`
  on 2026-09-05 was recorded as a mistake. The public upstream repository was the one
  permitted Oak repository read under that word until the owner's 2026-09-06 ruling
  (verbatim in `downstream-checkout-never-writes-upstream-surfaces`, which replaced the
  retired pr-target-is-engraph rule on 2026-09-08: "do not access the Oak repo without
  permission"),
  under which a read of the public upstream also needs owner permission first; the
  2026-09-06 ruling governs. The disconnection mechanics stay checkout-local.
- Strict validation happens only at boundaries.
- No `process.env` read/write in test files or setup files.
- `--no-verify` requires fresh per-invocation owner authorisation.
- No warning toleration.
- Owner direction beats plan.
- Curriculum data in this monorepo comes through the published Oak Open
  Curriculum HTTP API and generated SDK.
- Knowledge preservation is absolute; fitness warnings route work, not deletion.
- Shared memory/state files are always writable and commit-includable when dirty.
- No machine-local paths anywhere in the repo, ever (PII) — enforced by the
  `validate-no-machine-local-paths` repo-validator + the `machine-local-path`
  write-hook (shapes: `docs/governance/safety-and-security.md`
  §Machine-local paths).

[main-sonar-zero]: threads/paused/main-sonar-ai-profile-to-zero.next-session.md
[mcp-analytics]: threads/paused/mcp-product-analytics.next-session.md
[observability]: threads/paused/observability-sentry-otel.next-session.md
[agentic]: threads/agentic-engineering-enhancements.next-session.md
[connecting]: threads/paused/connecting-oak-resources.next-session.md
[oer]: threads/paused/exploring-open-education-resources.next-session.md
[budget]: threads/paused/architectural-budget-system.next-session.md
[cloudflare]: threads/paused/cloudflare-mcp-security-and-token-economy-plans.next-session.md
[sector]: threads/paused/sector-engagement.next-session.md
[eef]: threads/paused/eef.next-session.md
[oak-kg-ontology]: threads/paused/oak-kg-ontology-planning-review.next-session.md
[school-data-search]: threads/paused/school-data-search.next-session.md
[semantic-search]: threads/paused/semantic-search.next-session.md
[agentic-mechanisms-discovery]: threads/agentic-mechanisms-discovery.next-session.md
[branch-fitness]: threads/paused/branch-fitness-and-push-cadence.next-session.md
[statusline]: threads/paused/statusline-enhancements.next-session.md
[agent-naming]: threads/paused/agent-naming.next-session.md
[agent-operability]: threads/paused/agent-operability.next-session.md
[orientation]: threads/paused/orientation-skills-family.next-session.md
