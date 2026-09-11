# Next-Session Record — estate-coordination (the Director lane)

The Director lane's thread record: journal, lane state, and seat chain for
the estate-coordination thread (the thread name every Director claim since
2026-07 has carried). Founded 2026-08-13 by the
`director-continuity-surface-redesign` plan: before this record existed, the
Director was the one lane with no thread record, and
[`director-handoff.md`](../director-handoff.md) absorbed the journal job —
the accretion that plan cures. The handoff file keeps the role brief and the
single live snapshot block; **this record carries the journal and lane
state**, under the same conventions as every other thread.

## Current Continuation — MAKE-SAFE PAUSE (owner word 2026-08-13 ~19:40Z; multi-day quiet; NOT a closeout)

> **Pointer (2026-09-08, Flounder turns Estuary c5cc2c, at the fold of
> `coordination/2026-09-08-68d53d`): the CURRENT board is the live snapshot in
> `director-handoff.md` under "Current handoff state", replaced in place at each fold; the
> last journal section here, §2026-09-08 ~03:2xZ — DIRECTOR TENURE JOURNAL, is the tenure
> journal for 2026-09-06 → 2026-09-08 and is history where the snapshot disagrees. The block
> below is the 2026-08-13 pause, kept as history; every section between is journal.**

- State at pause: fleet wind-down executed at owner word ("no work will
  happen over the next few days … everything safe and trivial to pick back
  up"). The coordination branch folded to main (fold PR referenced in the
  Journal's wind-down entry); successor branch cut from post-fold main;
  the primary resides there.
- Invocation pointer at pickup: `oak-start-right-team continue
  estate-coordination` from this record. Read the
  [rulings ledger](../director-rulings-ledger.md) §Homing queue +
  §Census addenda before S3.
- Controlling plan:
  [`director-continuity-surface-redesign`](../../../plans/delivery/director-continuity-surface-redesign.plan.md)
  serving
  [`coordination-substrate`](../../../plans/strategic/coordination-substrate.plan.md)
  (ratified 2026-08-07). Plan status at pause: check its frontmatter —
  sketch unless the ratification stamp landed at the wind-down card; a
  sketch governs no work, so S3–S6 open only after the stamp.
- Next safe steps at pickup, in order: (1) re-ground per start-right (live
  claims, comms, git — this record is a hypothesis, not truth); (2) if the
  plan is unstamped, present it (the assumptions-expert verdict is recorded
  in the Journal wind-down entry if it landed, else re-run); (3) S3 homing
  queue (six unhomed + census addenda first-hand reads); (4) S4
  one-live-block rebuild with byte-conserved relocation; (5) S5 validator
  lane PR; (6) S6 consolidation routing.
- Claims at pause: `a2286c53` (Director) retained stopped-seat-held — the
  successor adopts via `claims adopt` per the brief's readiness gate.
  `dd3f640f` closed 2026-08-13 (premise complete as PDR-136).
- Fleet at pause: Skua (e2b222) was live driving #846 at the wind-down
  write — their close broadcast is the authoritative record of their exit;
  Nautilus (c6d48b) cold-paused, claim `95a0678d` retained, survey
  owner-HELD (gates expire 2026-09-02).
- Open-PR disposition at pause: #846 owner-worded to merge (Skua drove);
  #774 illustrative never-merge (owner verbatim); #772/#761 Clerk-stack
  gated on the production promotion settling; #867 and #750 are draft
  lanes owned by their threads (sentry-docs truing; docs-pnpm setup) —
  pickup at those threads' next touch; #880–#883 emgeebot (Matt's agent)
  lanes — never ours to chase.
- Acceptance bar: the controlling plan's six acceptance criteria.

## Standing tenure posture (owner words, 2026-08-13)

- "Question the assumptions and authority of decisions handed to you by the
  previous seats and plans" — issued to this seat twice (emphasis) and to
  the design seat the same evening. Inherited decisions are hypotheses
  until their authority is traced (whose word, dated, competent for the
  claim class).
- "Make sure knowledge is conserved at all times, and properly homed" —
  the governing constraint of the redesign; additive before subtractive.
- Fleet concurrency: at most two subagents at a time while the
  tighter-quota constraint stands (owner, 2026-08-13, "for now").
- Warden arrangement (2026-08-13 morning, joint on the design arc channel,
  root-caused from the three-writer index collision): the Director is sole
  commit-warden of the primary checkout's `git:index/head`; implementers
  hand commit intents via channel or directed events; worktrees stay
  implementer-owned.

## The live board (authoritative restatement, adopted 2026-08-13 from Plover's closeout)

1. Design lane: ratified plan governs, W1→W2. At the wind-down write Skua
   (e2b222) was live driving #846 to merge at owner word; their close
   broadcast (or its absence) is the authoritative close record —
   re-ground from the claims registry and comms at pickup, never this row
   (Copilot thread on fold PR #884 caught the earlier
   anticipatory/adopted-verbatim incoherence here).
2. MCP-590 tail: error-envelope PR (`formatError` + two callers,
   `{code,message,upstreamMessage}` via `structuredContent.error` +
   `content[1]` mirror, NOT `_meta`; contract test). Question A1 first.
3. MCP-590 tail: operational rebuild stage→verify→promote — PROBE ENV
   ACCESS FIRST (A2).
4. MCP-590 tail: demo-default flip to primary (2 lines:
   `demos/oak-curriculum-hub/.env.example` + README) — sequenced after (3);
   verify A3 first.
5. Route Swordfish's five-item non-design-lane handoff (directed event
   2026-08-13 14:33Z; synthesis at
   `.agent/reports/governance/development-practice-review-2026-08-13/`) —
   A9: the ordering is expert-synthesis, not owner word.
6. Route skills groups 2–6.
7. Route authority-class tagging as a plan-schema candidate
   (`new-rule-vs-pdr-clause`, at a lull) — A10 applies.
8. Estate expect-then-if sweep + test-expert §Diagnosis-5 true-up — A15:
   re-read both texts before sweeping.
9. Comms archive sweep (5,600+ events, drain-cost class).
10. Route the 19 outgoing-identity carriers via the rename plan's slices —
    A8: census first.
11. Route the lowest-effective-level principle as a doctrine candidate —
    A10 applies.
12. Route the pds-rename prose-tail doc drift (Skua's routing event
    2026-08-13 19:16Z, belongs to the `public-digital-service-identity`
    plan's estate-prose tail, not the design lane): (a)
    `packages/design/oak-design-system/studio-source/whitelabel/pds/BRAND.md`
    still titled with the outgoing identity name, stating
    distance-maximisation as the design goal — mis-weighted under owner ruling R15 (fidelity to GDS
    is the brief, distance a consequence); `DECISIONS.md` ~line 35 carries
    the same stale name. (b) The design-system-usage skill canonical still
    names the outgoing counter-brand directory (whats-where reference
    likewise, unverified).
13. Cure the `practice-index.md` §"Rules cited by Practice Core" framing —
    owner verdict 2026-08-14 (verbatim: "wow, that is deeply incorrect"):
    the section asserts portable Practice-Core PDRs cite host-local rule
    files as their enforcement, which inverts the reference-direction law
    (host surfaces cite the portable doctrine they operationalise, never
    the reverse; kin: the PDR-117 host-indirection truing). Cure shape:
    restate the section as host-rules-operationalising-core AND
    first-hand-audit the named PDR bodies (014, 028, 038, 003, 091, 138)
    for host-path citations — each found citation is its own truing.
    Bounded fix on the coordination branch; not absorbed into PR #886.
14. ADR-225 acceptance gate (critical-pass finding, PR #886, 2026-08-14):
    the §Supported-independent-compositions MUST binds EVERY provider a
    host profile selects — at acceptance this retroactively covers the
    existing estate (hosting, auth, search, telemetry) with no exercised
    compositions and no transition story. Safe while Proposed; the
    transition/scope decision is the owner's at the acceptance moment.
    Recorded on the PR at merge.

HELD STATES (not tasks): survey lane owner-HELD (machine-readable gates
expire 2026-09-02; Nautilus cold-paused, claim `95a0678d`); #774 =
ILLUSTRATIVE spike (owner verbatim 2026-08-13; content tracks MCP-143's
landing shape; migration waits on the Clerk production promotion);
pr-846-review-fleet node RATIFIED and W1-executed (MCP-591; report at
`.agent/reports/design/pr-846-review-fleet/report.md`) — W2+
owner-sequenced (A11: inference, verify the node body before acting).

## Assumptions register (A1–A15, owner-instructed; question each at pickup)

Adopted verbatim-in-substance from the 2026-08-13 closeout; dispositions
recorded as they are questioned:

- A1 error-envelope shape rests on a 2026-08-12 probe — re-probe against
  the CURRENT SDK before building. OPEN.
- A2 rebuild env access unverified from any live seat — probe first. OPEN.
- A3 demo-flip safety rests on owner word (consuming-app search read-only)
  — verify no other ES write path. OPEN.
- A4 Bucket-1 tail shape is ratified-plan-derived — re-derive warrant per
  item at pickup. OPEN (standing).
- A5 channels to d0274e dead; design contact is Skua — DISCHARGED
  2026-08-13 ~18:1xZ: ListAgents verified Skua live; Skua adopted claim
  `645b9e0b` at 18:08Z and acknowledged Director routing at 18:17Z.
- A6 worktree-isolation cure encodes current platform behaviour, not
  version-pinned — re-verify at any Claude Code update. OPEN (standing).
- A7 bot mint-token yields the bot only from primary-root cwd — echo
  `.user.login` in-band on every identity-bearing write. OPEN (standing
  tripwire).
- A8 the 19-carrier count is a census read, not first-hand — census before
  routing. OPEN.
- A9 five-item handoff ordering is expert-synthesis, not owner word. OPEN.
- A10 both doctrine candidates are seat framing, not owner asks — drop
  either if warrant fails. OPEN (one of them — lowest-effective-level — was
  since ratified by the owner 2026-08-13 per per-user memory; verify at
  routing).
- A11 "846-fleet W2+ owner-sequenced" is shape-inference — read the node
  body before acting. OPEN.
- A12 comms-drain tuning fits today's ~5,600-file stream — recompute after
  the archive sweep. OPEN.
- A13 R12/R13 verbatims are relayed; durable provenance is the ratified
  plan's rulings table — cite the plan. OPEN (standing citation rule).
- A14 "Vesta hunts Expanse" agent authorship is self-declared — verify if
  it matters. OPEN.
- A15 expect-then-if sweep presumes both texts still read as remembered —
  re-read before sweeping. OPEN.

## Inheritance audit outcomes (2026-08-13, fleet run `wf_c5bddb5d-466` — 81 rows, all homes opened first-hand)

Rulings verdicts live in the
[Director rulings ledger](../director-rulings-ledger.md). Lane-state
verdicts (board, held states, assumptions, plan-handed decisions):

- **Claim `dd3f640f` CLOSED at this audit** — its premise (author the
  MCP-491 step-2 PDR) completed 2026-08-04 as PDR-136 (owner-ratified),
  verified first-hand; the claim had been stale-held through three freeze
  blocks. Board consequence: the gate-ledger lane needs no routing.
- **BOARD-4 (demo-default flip)**: the underlying 2026-08-13 owner ruling
  has NO repo/ticket record — single-seat attestation only. Conservation
  act at S3: land the ruling on its ticket/thread before execution, or
  re-confirm at the execution card.
- **BOARD-8 + A15 (expect-then-if sweep)**: the presumed stale test-expert
  reading finds no file text — the board item reshapes to "verify the two
  texts first; drop the true-up half if nothing is stale". A15 moves to
  QUESTIONED with that finding.
- **HELD-3 (846-fleet "W2+ owner-sequenced")**: no gate exists in the node;
  the qualifier is inference — the plan's own owner card sits after W2
  synthesis. A11 vindicated.
- All other board items, held states, and A-rows: authority CONFIRMED and
  classified (owner-verbatim/paraphrase vs seat-inference recorded per row
  in the fleet output; decision-relevant classifications carried in the
  ledger and this section).
- Critic census-holes queued in the ledger §Census addenda (lines 342–371;
  line 971 "self-limits are gated on ASKING, never silent"; line 357 ESM
  ruling; the 690–1100 graph-tools scope fence; brief-embedded rulings).

## Journal

### 2026-08-13 ~18:2xZ–19:0xZ — Smith hunts Obsidian (e98f17): adoption and the redesign arc

Seat adopted from Plover lifts Troposphere (b10c37) via stopped-seat-held
claims after their owner-worded closeout (their heartbeat-end declaration
was the stand-down evidence; readiness gate run with the mechanical check
pasted). Owner mandate for the tenure: question inherited assumptions and
authority — the seat's opening assumption audit caught two false working
beliefs before any authority act ("Plover is dark": false; "no Moment-1
event exists": recall-gapped grep). The director-handoff accretion was
measured (daily commits since 2026-07-14; 174 banners; 1,631 lines against
a 320-line budget), diagnosed (three jobs in one volatile section; no
Director thread record; no drain ritual), and the redesign plan authored
and presented. Rulings inventory complete; verification fleet running under
the two-at-a-time throttle after a session-limit event killed 7 of 12 legs
(5 banked, resume from cache). This record founded as plan S1.

### 2026-08-13 ~20:3xZ — Smith hunts Obsidian (e98f17): wind-down fold executed

Owner wind-down word executed within the hour: fold PR **#884** (bot-authored,
jimbot label) merged to main at `c8586f477` — full condition held (four
required checks green by name; Copilot's seven-thread round read in full,
replied and resolved at the boundary; claude leg org-overage quota-skip,
recorded exclusion). Successor branch `coordination/2026-08-13-c8586f` cut
from post-fold main; primary resides there. moved for teachers: no
live-service change in the fold (the day's teacher-facing motion, the #871
lesson-search freshness slice, landed earlier). moved for the Practice: the
Director continuity-surface redesign S1/S2 durable on main — thread record,
81-row rulings ledger with authority classes, inheritance-audit outcomes
(stale claim closed against PDR-136), live-state banner, make-safe pause
state, formation letter. The plan-readiness verdict (READY-WITH-EDITS, 8
before-stamp findings) is conserved as bot comment 5285713690 on #884 —
applying findings 1–8 is the FIRST pickup act, before the ratification card.
Finding 1's claim-side cure executed at this entry: the Director claim
re-threaded to `estate-coordination` (close+reopen, new claim id in the
registry) so the claim→record path resolves. Copilot's three tonight-cures
landed in this commit (fleet-state truing, two plan `last_updated` fields,
one report label). #846 was in CI at Skua's seat at this write.

### 2026-08-14 ~06:3xZ — Smith hunts Obsidian (e98f17): COMPACTION FREEZE mid-PR-886 drive; seat continues

Owner word "prepare for compaction" (no stop-processes word — the #886
settle watch stays armed; the canonical comms watcher was deliberately not
re-armed this morning under the n=1 exemption). Drive state, durable and
resumable from the PR alone:

- PR #886 (owner-agent docs: capability architecture) at tip `d6f664036` —
  conflicts resolved, PDR renumbered 138→139 (main took 138 overnight),
  Copilot round-1 findings cured, my false be4ec15ba reply citations
  CORRECTED on both threads (staged-vs-worktree divergence: a git mv had
  staged pre-cure content, my pathspec omitted the file, verification read
  the tree — Copilot's re-round caught it; verify the INDEX, not the tree).
- Owner-ordered adversarial panel (2 legs, opus, max-different lenses):
  BOTH returned FINDINGS-BLOCK-MERGE, near-disjoint findings. Reports
  conserved verbatim as PR comments 5290506438 (assumptions lens) and
  5290514095 (failure-modes lens). Waves 2–3 deliberately held: verdict
  settled; fresh lenses go to the CURED text.
- THREE OWNER RULINGS (in-session, 2026-08-14): MUST forward-scoped +
  priors named (ADR-074/076, 219, 162 not retroactively bound); the
  no-vendor-structural-dependence constraint IS the owner's, ESTABLISHED
  in ADR-225 (owner-declared at review) — ledger row XPLAT-2; full cure
  in this PR now, acceptance residue on the checklist, fresh adversarial
  leg on cured text before merge.
- Cure state: NOT YET APPLIED — the first cure script died on a stale
  anchor BEFORE its write (all-or-nothing protected the tree; worktree
  verified clean). The full cure map + acceptance checklist is PR comment
  5290518682. Resume lesson: re-derive every anchor from LIVE file text.
- Resume order: (1) re-ground; (2) apply the cure map in the worktree
  `.claude/worktrees/pr-886-capability-architecture` (built, deps in);
  (3) commit+push; (4) fresh adversarial leg (architecture-expert-fred —
  both reviewers recommended it) on the cured text + Copilot re-request;
  (5) settle per the state machine; (6) bot merge at the fetched oid
  (owner word "fix and merge" stands, post-panel); (7) Phase 8 harvest;
  (8) worktree removal; (9) board items 13/14 remain routed, untouched.

## 2026-08-14 ~07:4xZ — three-body comparison recorded and homed (Smith hunts Obsidian, e98f17)

- Owner-invoked comparison of the PR-886 capability architecture, the
  web-app-deconstruction corpus, and the survey programme delivered and
  owner-agreed ("Thank you, I agree"), with the direction to record the
  findings everywhere they matter. Permanent home:
  `.agent/research/capability-deconstruction-survey-comparison.md`
  (six findings; stitches routed). Survey-design inputs banked at
  `survey-machinery-deconstruction.plan.md` §Banked inputs (pointer-carry,
  no scope change). Ledger row DECON-5 records the placement-doctrine
  scope verdict. Napkin harvest at `2ef203c1b` preceded this.
- RESUME-ORDER ADDENDUM for the PR-886 drive (extends step 2 above,
  owner-agreed 2026-08-14): during the cure application, also add one
  Related line to the PR's research doc
  (`.agent/research/provider-independent-capability-architecture.md`)
  citing the deconstruction meta-analysis's provider rows (negative-space
  "tested semantic portability, exit, restoration and retained options" +
  lens 30) — the convergence stitch. Conserved on the PR as a bot comment
  at this entry's commit.
- Deconstruction-side stitch deliberately deferred: log ADR-225/PDR-139
  as an evidence event in the deconstruction hypothesis register per its
  own review rule only AFTER #886 merges — Proposed doctrine is not yet
  evidence.

## Participating agent identities

| platform | model | session_id_prefix | agent_name | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| claude-code | claude-fable-5 | e98f17 | Smith hunts Obsidian | Director — record founder, redesign executor | 2026-08-13 | 2026-08-13 |

Prior Director seats predate this record; their identities and tenures are
carried in the seat chain below and their full identity tuples in the
handoff file's historical blocks (relocating byte-conserved to the
operational archive at plan S4 — that archive is the provenance source, not
this table).

## Seat chain (reconstructed from the handoff record's block census, 2026-07-26 → 2026-08-13)

Squall wakes Apex → Moon rides Penumbra → Lynx → Bora → Falcon hunts Flight
→ Magnetar binds Oblivion → [Firefly ← vacant interval] → Petrel holds
Turbulence / Wisteria → Spark weaves Paraffin → Panther rides Midnight →
Plover lifts Troposphere (b10c37, closed 2026-08-13 18:13Z) → Smith hunts
Obsidian (e98f17, adopted 2026-08-13 ~18:2xZ). Numbered owner-ruling series
ran continuously across tenures (1–42 Falcon-era, 43–51 Spark-era) — the
instinct the rulings ledger (plan S2) formalises.

## Standing decisions this thread carries forward

- The rulings ledger (plan S2) is the capture-to-homing proof surface;
  rulings home in their proper durable surfaces, never inline in volatile
  blocks.
- Every append-accepting surface acquires its drain ritual at birth —
  doctrine candidate, routes via `new-rule-vs-pdr-clause` (A10 discipline
  applies to it too).
- The owner directs through the Director; blocking owner asks are cards,
  never prose; lens-gate before owner-surface.

## 2026-08-14 ~11:5xZ — PR-886 drive COMPLETE (Smith hunts Obsidian, e98f17)

- MERGED by the owner directly (jimCresswell, 2026-08-14T11:39:49Z, merge
  commit c0a6c08d3, branch tip ab608269b). Task 9 closed. Thirteen review
  rounds ran (adversarial panel x2 lenses, architecture-expert-fred,
  Copilot x10 content rounds, round 13 clean); 55 findings harvested
  including every suppressed comment; per-round dispositions are PR
  comments 5290506438 through 5292754030. Owner rulings in-drive beyond
  the original three: the provider-quantified invariant restatement
  (ledger XPLAT-3) and the hour-idle cold-pause policy (ledger
  COLD-PAUSE). The owner-directed comment-record audit found and cured
  the attribution-drift defect (owner-ruling heading over review-derived
  sentences; split at d3a9fa269) and restated checklist items as
  decision pointers.
- Board item 14 (ADR-225 acceptance gate) now carries the full
  acceptance checklist: original residue (cure-map comment 5290518682)
  plus ADR-042 amend/supersede/retain decision, PDR-139-first-or-joint
  ordering, and the constraint-wording residue — all owner decisions at
  the Proposed-to-Accepted flip, none predetermined.
- Post-merge follow-on executing at this entry: the deconstruction
  hypothesis-register evidence event (per its own review rule, deferred
  until merge). Worktree pr-886-capability-architecture removed after
  this entry's commit.

## 2026-08-17 ~11:0xZ — COMPACTION FREEZE (Smith hunts Obsidian, e98f17): fold mid-ceremony, 890 round conserved, two new owner directives routed

Owner word at the freeze: "prepare for compaction then stop all processes."
All monitors stopped; every in-flight surface conserved below. RESUME MAP,
in priority order (the owner's SKILLS-FIRST ruling governs):

- (a) FOLD PR #896 is OPEN mid-ceremony (branch coordination/2026-08-13-c8586f
  merged main in at 98a607bcc with the napkin union-resolved — 113/116
  branch-side entries verified in archive/napkin-2026-08-14.md, three carried
  under the fold-merge union note; Nautilus's staged research doc rode at
  their own 16c3a4e0c). Resume: settle per the four named checks, bot REST
  merge at the FETCHED sha (merge method merge), cut successor
  coordination/estate-<date> from post-fold main per the skill, refresh
  branch-labelled surfaces, broadcast rotation. The freeze commits below
  ride this PR.
- (b) SKILLS LANE FIRST (owner priority, ledger SKILLS-FIRST): PR #890 cure
  round conserved as PR comment 5314990205 (dead-SKILL.md-filename class x9
  plus three live-surface paths; sweep lesson: filename class, not only
  directory class); then wave 2 per PR #890 comments 5293457222 (link
  ledger) + 5293529733 (config additions) + task #10; then the eval
  programme to EVERY Practice skill (plan WS8 + pilot convention
  estate-wide). mantagen re-review stands requested; Copilot re-request at
  the cured tip.
- (c) PROFANITY-FILTER in-repo plan node to AUTHOR (ledger PROF-FILTER,
  owner verbatim there): validator with fixed-hash target-word list (hashes
  so the repo never carries the wordlist; not secrecy), no Linear ticket.
  Author as born sketch AFTER the skills lane per SKILLS-FIRST; sequence
  its execution behind the evals completion.
- (d) PR-CLASH COMPARISON (owner ask 2026-08-17, NOT yet executed):
  compare our open PRs vs other contributors' new PRs for clashes.
  Inventory banked at the freeze: ours #890 (skills wave 1), #889
  (census, Nautilus), #774 (illustrative, never merges); theirs #891
  luke-arnold-oak NATIVE-WINDOWS ESTATE FIX — intersects the ratified
  cross-platform node's research-first rider (XPLAT row); FLAG at the
  comparison, verdict needed on rider-vs-contribution; #892 plugin skill
  feedback DRAFT — touches BUNDLED SKILL COPIES, direct WS7 clash
  candidate; #895 conformance DRAFT; #888 WSL docs; #883/#881/#880/#867
  emgeebot lanes; #772/#768/#761/#750 older gated lanes. Comparison =
  changed-file overlap + semantic clash verdicts, report to owner.
- (e) Redesign S3-S6 (task #7) queued behind the above.
- (f) Instrument notes: the claims CLI answered "unknown topic: claims" at
  2026-08-17 — its command surface changed over the gap; re-derive the
  liveness-check invocation from the CLI help at resume, never from
  memory. The worktree-isolation guard pins sessions by cwd: keep the
  shell at the primary root, use git -C for worktree git, plain commands
  (no pipes) for guarded operations, tokens via short-lived files with
  the wc -c length tripwire (an empty mint WAS caught by it this
  session).
- (g) Watch scripts .watch-890.sh (wave worktree) and .watch-896.sh
  (primary root) deleted at the freeze; re-create from the resume map's
  needs, actionable-transitions-only per COLD-PAUSE.

## 2026-08-17 ~11:2xZ — freeze addendum: three owner answers true the map (Smith hunts Obsidian, e98f17)

- XPLAT sequencing corrected by owner word: "I intended our Windows work
  to go in first in order to support the manual windows work" — the
  research-first rider is SUPPORT-SEQUENCING, not a contribution fence.
  Resume treatment of #891: supportive review, no rider adjudication; the
  cross-platform research node gains urgency behind SKILLS-FIRST.
- Resume-map (d) corrected: #892 is NOT a WS7 clash — verified against
  its file list, it touches only plugins/oak-open-curriculum/skills/oak-*
  (bundled PRODUCT skills), zero overlap with the Practice corpus; it
  even adds an evals/evals.json, consistent with the all-skills-evals
  ruling. Consistency glance at review only.
- Freeze-note (f) sharpened: the CLI's `claims` topic is absent from
  today's topic list (agent-identity, collaboration-state, commit-queue,
  branch-touched-files, context-cost, session-metadata, codex-exec,
  merge-bot, pr, pr-watch, spawn) — renamed/absorbed over the gap,
  likely into collaboration-state; re-derive the liveness invocation
  from `--help` at resume. No other agent-tools surface misbehaved this
  session.

## 2026-08-17 ~11:5xZ — resume: XPLAT-4 head discharged (Smith hunts Obsidian, e98f17)

Owner resume order (ledger XPLAT-4) executed ahead of the freeze map's (a)/(b):

- REGROUND facts that moved over the freeze: the owner worked this branch
  directly — `ac23efc66` (workspace basis panel, his authorship) and
  `234450771` (the survey-lane landscape-survey born sketch; his authorship,
  bot committer, pushed 11:23Z from this checkout while this seat was
  resuming — the file this seat found staged and left untouched). Comms
  quiet since 2026-08-16; Nautilus's claims fresh (heartbeat 10:21Z);
  claims topic confirmed absorbed into `collaboration-state` (invocations
  re-derived from `--help`). Fold PR #896 checks re-running at the new tip;
  fold completes at a stable moment (owner mid-activity on the branch is
  not one).
- LUKE'S PRs reviewed warmly per the order (both reviews bot-posted,
  author echo verified): #891 review 4951157320 — centrepiece is
  first-hand macOS proof at his tip `299a33f1b` (Apple Silicon, macOS
  26.6, APFS case-insensitive default: `pnpm install --frozen-lockfile`
  clean; `pnpm check` green end to end, main turbo run 142/142), closing
  his named macOS-untested risk; plus goal-alignment (the ratified
  strategic node declines WSL-as-answer, so his "merge both" option is
  the doctrine-aligned path — final disposition the owner's). #888 review
  4951133339 — verified his tip cures the two unresolved threads; one
  real defect remains (the gitleaks `go install` route: module declares
  `zricethezav`, verified at source) and it is INHERITED FROM OUR OWN
  `.husky/pre-push:13` — generator fix is estate-side (micro-PR queued);
  Copilot's suppressed-comments were harvested and verified (the
  env-vars no-op claim REFUTED at pinned versions: turbo 2.10.9 reads
  `TURBO_CONCURRENCY`, vitest 4.1.10 reads `VITEST_MAX_WORKERS`; the
  nvm-before-clone ordering defect real; build-before-lint claim is a
  main-README matter taken estate-side).
- XPLAT RESEARCH NODE authored:
  `.agent/plans/delivery/cross-platform-research.plan.md` (status
  `sketch` per the plan-corpus enum — Nautilus corrected this seat's
  out-of-enum `active` in place, broadcast 11:42Z, absorbed; execution
  state rides ticket MCP-607, created this seating, related
  MCP-602/MCP-600, moved In Progress). Four research questions (census
  delta over #891; platform verification; guard design;
  support-sequencing decision briefs — `.gitattributes`, Windows CI
  leg, gate settings). Assumptions-expert pass absorbed pre-commit
  (blocking finding cured: briefs tranche never queues behind census).
- SCOPE CORRECTION to freeze-map (b), superseding its wording: every
  skills-lane quantifier — including the eval programme phrase "pilot
  convention estate-wide" — ranges over the Practice corpus
  `.agent/skills` ONLY, per the owner's 2026-08-17 word (ledger
  SKILLS-FIRST routing cell trued this entry). `plugins/oak-open-curriculum`
  is another lane's.
- Validation-worktree residue to clean at fold: `pr-891-macos-validation`
  (detached, untracked logs only) — prune after the #891 lane settles.

## 2026-08-17 ~12:3xZ — FOLD COMPLETE; rotation to coordination/estate-2026-08-17 (Smith hunts Obsidian, e98f17)

- PR #896 MERGED at `d64bf082f` (bot REST merge at the frozen tip
  `3f006ca87`; merge method merge). The tip was FROZEN by ARC broadcast
  after the fold reviewer refused a moving diff (it grew 61→64 files
  under live lane commits) — freeze honoured by all lanes. Two review
  rounds from mantagen (owner-confirmed this hour: Matt's BOT on his
  account) were both correct, both cured (round 1: description rewritten
  to the actual diff-vs-main claim; round 2: XPLAT-4 authority split +
  frozen-tip description truing), then DISMISSED under the owner's
  conditional grant ("if you can honestly say that the requested changes
  are made then dismiss") — honesty condition verified per round before
  dismissal.
- moved for teachers: nothing directly — coordination records only.
  moved for the Practice: four days of decision/ruling/research records
  durable on main; the cross-platform research lane opened; the
  workspace-basis reground citable; PR #897 (gitleaks install-suggestion
  fix, hook + CONTRIBUTING) merged at `fa0604aa3` same hour.
- SUCCESSOR: `coordination/estate-2026-08-17` cut from post-fold
  `origin/main`, pushed, primary resides there. Rotation broadcast on
  the canonical stream follows this entry's commit. Old branch
  auto-delete by GitHub is expected, not loss.
- Loss scan at rotation: working tree carries only this entry (committed
  with it), the untracked `.watch-comms.sh` (session instrument), and
  the untracked superseded `workspace-basis-settled-statement-2026-08-17.md`
  (NOT this seat's — superseded by the regrounding record; left for its
  author's disposition). No unpushed refs.
- Windows lane next steps (XPLAT-4 order continues): decision briefs
  (`.gitattributes`, Windows CI leg, gate settings) → owner card; then
  the fold of Luke's cure rounds as they land (macOS re-validation
  offer stands, worktree kept); skills lane (task #10, scope
  `.agent/skills` only) queues behind per SKILLS-FIRST.

## 2026-08-17 ~16:0xZ — COMPACTION FREEZE 2 (Smith hunts Obsidian, e98f17): MCP-612 mid-landing, quota wall

Owner word: prepare for compaction, then stop all processes. The
builder subagent died on the session limit (resets 19:30 London) mid
ENOENT-cure — resume respects quota. RESUME MAP, priority order:

- (a) MCP-612 LANDING (task #15, plan `commit-queue-local-ephemera`,
  ticket In Progress). The INTERIM SPLIT IS LIVE and stable
  (active-claims.json 4KB, both readers validated; legacy blob at the
  gitignored `archive/commit-queue-legacy-2026-08-17.json` until the
  landing's verification read). Worktree
  `.claude/worktrees/mcp-612-queue-ephemera` holds the ENTIRE delivery
  UNCOMMITTED (81 files: builder's re-shape 4690/4690 green at its
  report, my 11 practice-doc true-ups + seed 1.4.0, adapters
  regenerated) PLUS a PARTIAL builder cure (ENOENT skip-as-absent —
  its last state: new `smoke-tests/commit-queue-store.smoke.ts`
  created, `tests/test-helpers/temp-collaboration-state.ts` mid-edit).
  Resume: (1) read the worktree diff first-hand before anything;
  (2) finish the ENOENT cure (plural reader skips-as-absent, corrupt
  stays loud, pin with a test); (3) apply the test-expert cures —
  IMMEDIATE-FAIL: the git-spawning check-ignore test moves out of
  vitest to a validator/smoke (the new smoke file is likely the
  builder's start on exactly this); UNPINNED: TTL-from-updated_at
  fixture (queued_at ≠ updated_at), unparseable-legacy-row loud
  failure, 1.2.0-with-queue NOT migrated, "byte-preserved" wording →
  value+key-order parity; minors optional (3600s boundary, absent-dir
  view parity, --now honouring). Code-expert's two suggestions
  non-blocking (legacy-TTL resurrection window; unreachable expired
  branches). (4) full suite + gates green, atomic commit (code+tests+
  docs+adapters, stage by pathspec), push, PR (References MCP-612,
  incident caveat if the hold stands), merge at trustworthy checks,
  then acceptance 2+3 (live verification at rebuilt primary;
  legacy-blob verification read → owner disposition).
- (b) PR #899 (MCP-609 branch-mint tool + cut-coordination-branch
  skill, pushed at owner word during the GitHub incident): merge at
  trustworthy checks + review round; then merge main into
  coordination/estate-2026-08-17 and resolve the KNOWN fold-skill
  step-9 divergence to the PR's delegation form (one conflict,
  deliberate, this seat authored both sides).
- (c) GitHub incident hold (owner order 13:54Z relayed by Nautilus):
  no all-clear broadcast observed by this freeze — verify status at
  resume before any GitHub op beyond what the owner's push exception
  covered (#899, #774 close, #898 merge all completed under his word).
- (d) Standing queue behind (a)/(b): skills lane task #10 (#890 is
  CONFLICTING with post-fold main + cure round at PR comment
  5314990205 — main-merge + filename-class cures are the opener; scope
  `.agent/skills` ONLY); then wave 2, Practice evals, PROF-FILTER plan
  authoring, S3-S6 (task #7). XPLAT tranche B research (census delta,
  platform verification, guard design) continues alongside; Windows CI
  leg authoring gates on #891 merge; Luke cure-round macOS
  re-validation offer stands (worktree pr-891-macos-validation kept).
- (e) Estate map at freeze: Nautilus round-1b fleet running (launched
  14:57Z, 1-3h, bounded, no GitHub ops); Yarrow holds design-lane
  claim 645b9e0b on a records-truth pass (their design-system journal
  edit rides this shared checkout UNCOMMITTED — theirs, do not stage);
  the untracked `workspace-basis-settled-statement-2026-08-17.md`
  remains peer-owned residue (superseded record, author's
  disposition). Quota note: TUI may switch models silently at
  exhaustion — verify lineage at resume per the standing memory.
- (f) Instruments at freeze: comms watcher STOPPED at this freeze
  (re-arm from `cut-coordination-branch`-era recipe: the watch script
  is deleted; recreate with `--exclude-tag heartbeat`, supervisor pid,
  bounded drain). No pr-watch monitors (stopped at the incident hold;
  F-162 records the exit-condition defect). No crons. Bot tokens
  deleted.

## 2026-08-17 ~16:5xZ — DIRECTOR SUCCESSION BEGUN (Smith hunts Obsidian → Ocelot binds Tunnel)

Owner word ~16:39Z: "please begin the handover to Ocelot." Deliberate
succession (PDR-063 §Deliberate succession / PDR-064 two moments):
Moment 1 pre-positioning broadcast `91a18b86` sent 16:42Z; directed
pickup event `89eadc78` to Ocelot binds Tunnel (c28ad9); claim
`b1d00d68` carries `handoff_record_path` →
`.agent/state/collaboration/handoffs/b1d00d68-director-succession-2026-08-17.md`
— AUTHORITATIVE for current edit state, in-flight reasoning, decisions
made/deferred, and the pickup contract. Authority remains with e98f17
until Ocelot's Moment 2 acknowledgement referencing `91a18b86` lands;
the outgoing instruments stand down at that broadcast (or die with the
session — the PDR-064 grace window covers the gap; the record and git
carry the substance either way).

Consumed from the freeze-2 map above, this session: MCP-612 landed
LOCALLY at `a8600f2a3` on `feat/mcp-612-commit-queue-local-ephemera`
(all reviewer cures applied and verified first-hand, TTL pin falsified
both directions, collect failure path-labelled; whole-tree pre-commit
green; push, PR, merge, acceptances 2–3 remain — queued behind the
GitHub hold). #899 still open. The hold STANDS (incident `zkxwbgr0cnmx`
investigating/critical; the owner's order terminates on incident
RESOLUTION — verify at githubstatus, then broadcast the all-clear,
which releases every seat's queued pushes). MCP-615 RATIFIED at the
owner card (Yarrow, lane commit `afae5c663`). Survey round 1b complete,
harvest `5a04ce910`, round-2 shape with the owner as a card. The dead
MCP-612 builder subagent is NOT needed — do not resume it.

## 2026-08-17 ~16:4xZ — DIRECTOR SUCCESSION COMPLETE: Ocelot binds Tunnel holds the seat (Moment 2)

Written by the incoming seat. Sequence, all events on the canonical
stream: Ocelot registered standby 16:07Z (`4b736731`, grounded
first-hand incl. the readiness gate's mechanical liveness check);
Moment 1 + directed pickup per the entry above; Ocelot read the handoff
record end to end, recomputed premises at pickup (a8600f2a3 verified at
the mcp-612-queue-ephemera tip, tree clean; Nautilus ACTIVE with the
1a+1b harvest committed — the record's peer-STAGED-file caution is
superseded; hold verified still major/critical at 16:46Z), adopted
claim `b1d00d68` in place, armed the heartbeat pair (240s, one `--now`
per tick), and broadcast Moment 2 (`a91c1177`) 16:44Z in-response-to
`91a18b86`. Authority transferred at that broadcast; directed
absorption ack `46e553f5`; Smith's heartbeat-end + team-member closeout
landed 16:47Z — tenure complete, nothing retained. Successor ARC
channels opened at owner word and announced (`4eef465b` design-lane
with Yarrow; `e331bff4` survey-lane with Nautilus); the prior pairings'
channels stand as record. Instruments at this seat: canonical watcher
(heartbeat-excluded F-146 shape) + F-75 delta poll (600s) + heartbeat
pair + two ARC tails + a GitHub resolution watch (300s; incident
`zkxwbgr0cnmx`; at indicator none/minor verify `resolved_at`, broadcast
the all-clear, then run the handoff record's hold-release order). The
freeze-2 map remains the work queue; item (a) is at the push/PR stage.

## Participating agent identities (succession addendum)

| platform | model | session_id_prefix | agent_name | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| claude-code | claude-fable-5 | c28ad9 | Ocelot binds Tunnel | Director — adopted b1d00d68 at Moment 2 `a91c1177` | 2026-08-17 | 2026-08-17 |
| claude-code | claude-fable-5-1 | 661556 | Chinook seeks Cloud | implementer, lead at n=2 — MCP-673 corpus truing: PR A (#959, owner-word amendments) and PR B (factual true-ups), claim ed9ec042 | 2026-09-03 | 2026-09-03 |
| claude-code | claude-fable-5-1 | 9e26e6 | Vesta rides Solstice | second seat at n=2 (Chinook seeks Cloud 661556 leads) — MCP-673 corpus truing; boundary set by the lead | 2026-09-03 | 2026-09-03 |
| claude-code | claude-fable-5-1 | c5cc2c | Flounder turns Estuary | lead from ~19:3xZ at owner word (Buzzard lifts Eyrie 326bcb joins in support): custody of the strategic node PR and the compaction records; earlier solo implementer — checkout operations, the merge-bot per-checkout config lane, the census report, the Sonar access; claims 2778f573, 442de9ff closed. Director from 2026-09-06 12:5xZ (owner-named; claim 8109015d) to 2026-09-09 15:11:49Z, when the seat passed at PDR-064 Moment 2 to Nettle guards Pistil (2de368); closed out 15:13Z, no claim retained | 2026-09-03 | 2026-09-09 |
| claude-code | claude-opus-5[1m] | 2de368 | Nettle guards Pistil | Director — owner-named successor 2026-09-09 ~15:00Z; standby from the 15:03Z registration; adopted claim 8109015d at Moment 2 15:11:49Z (ack event c3e76199, in response to pre-positioning 67c04dd2); landed #97 and #92, ran the fold of coordination/2026-09-09-f5d02c. Model switched `claude-fable-5-1` → `claude-opus-5[1m]` on 2026-09-11 at the owner's word; one continuous seat, so this row's `model` moves rather than a row being added (PDR-027 Amendment Log, 2026-07-08) | 2026-09-09 | 2026-09-11 |
| claude-code | claude-fable-5-1 | 326bcb | Buzzard lifts Eyrie | support seat at owner word ~19:3xZ; adopted by claim 691d26b3: the census report PR's closeout — two dispositions, the CI re-run watch, gate, merge as the bot (81ca79913), harvest, prune — as the lead's handoff record states it | 2026-09-03 | 2026-09-03 |

## 2026-08-17 ~20:0xZ — OVERNIGHT STAND-DOWN (Ocelot binds Tunnel, c28ad9): both lanes down clean; Director down last at owner word

Owner overnight order (ledger OVN-1): lanes run owner-independent work,
stand down when they need him, Director last; operationalised in
broadcast `651c4dfa`. The evening after the two successions
(Smith→Ocelot Director; Nautilus→Poppy lane, Moment 2 19:33:59Z):
Poppy delivered the five-point brief's Phase 1 (Toolkit Atlas baseline
repo-canonical at `.agent/reports/repo-architecture/oak-toolkit-atlas.html`
and published; survey post-mortem; salvage register — `6ba9e93c3`,
`2379d4000`); Yarrow landed T1a-i (`cd84e490c`, MCP-616), the MCP-615
trail (`843bb4ac8`: ratified node, P6 corrected ontology, R4 re-class),
and design continuity (`7a28c7fa3`). Round-2 CANCELLED at owner ruling
(ledger NAUT-1); the five-point brief governs the repo-architecture
lane (per-user memory `repo-architecture-brief-toolkit-five-points`).

STAND-DOWNS, both clean with heartbeat-ends (the 10-minute retirement
rule must not fire on either): Poppy 20:00:15Z — claims `95a0678d` +
`875f1508` retained-with-reason; morning pickup = #889 FIRST at the
all-clear (owner merge word, ledger OVN-2, canonical mirror `5e012461`:
"safely" includes a content-truing check against the fleet outcomes),
then the MCP-619 phase-2 warrant card. Yarrow 20:03:28Z (closeout
`7c8b57b6`) — claim `645b9e0b` retained; morning = T1a-ii
(pack-contract authoring, held on a stated quality trade-off, no card
needed); three-push queue (MCP-613, MCP-615 at `843bb4ac8`, MCP-616 at
`cd84e490c`) at the all-clear.

GITHUB HOLD STANDS at this write (incident `zkxwbgr0cnmx`
investigating/critical through the 19:32Z recompute). The ALL-CLEAR
duty is the Director's and sleeps with this seat: the resuming morning
seat verifies `resolved_at` first-hand, broadcasts the all-clear ONCE,
then runs the release order — (1) coordination push (this parcel + the
nine-plus lane commits ahead of origin); (2) MCP-612
fetch/main-merge/gates/push/PR/merge at trustworthy checks (worktree
`mcp-612-queue-ephemera` at `a8600f2a3`); (3) #899 merge + fold-skill
step-9 delegation-form resolution + coordination main-merge; (4) lane
queues per the closeouts above. Post-incident CI flakiness =
park-and-card, never force.

MORNING CARDS (assembly): (1) MCP-619 phase-2 opening warrant (solo
seat, evidence collected, per-change diagrams, no fleet — Poppy's
framing endorsed); (2) three `scrap/*-mis-based` branch deletions
(owner one-click; EnterWorktree base-ref mis-cut ×3, napkin carries
the pattern); (3) MCP-612 acceptance-3 legacy-blob disposition (fires
only post-merge); (4) read-if-chosen: Poppy's survey post-mortem
(carries a fleet-design-review warrant-gate amendment candidate);
(5) micro: disposition of the untracked peer residue
`workspace-basis-settled-statement-2026-08-17.md` (author retired).

FRICTIONS for the register at morning: the watcher hourly-backstop +
turn-notification-lag blind-window pattern (Yarrow's routed
observation; this seat ran the same recycles benignly — cursor made
them lossless); F-162 pr-watch ALL-GREEN exit defect still open.

INSTRUMENTS at this stand-down (stop-loop-first): heartbeat pair
stopped then heartbeat-end broadcast; ARC tails, F-75 poll, GitHub
resolution watch, canonical watcher stopped last (COLD-PAUSE — with
every seat down, nothing could act on an overnight resolution anyway).
Claim `b1d00d68` RETAINED-WITH-REASON: same seat resumes at the
owner's morning word; silence past the heartbeat-end is intentional
stand-down, never retirement.

## 2026-08-18 ~11:0xZ — COMPACTION FREEZE (Ocelot binds Tunnel, c28ad9): demo delivered, review rounds mid-ceremony; seat continues

Owner word: prepare for compaction, then stop all monitors. The seat
CONTINUES at resume; silence past the freeze broadcast is intentional.
RESUME MAP, priority order:

- (a) DEMO DELIVERED inside the window: MCP-620 both workstreams
  demo-ready and witnessed (W1 EMC² amplification `0cd8906ad`, W2
  /tokens page `e0a85e842`, committed on lane branch
  `jimcresswell/mcp-620-emc-amplification-token-reference-page-demo-motion`,
  UNPUSHED by design). The OWNER VIEWED the demo and gave feedback
  DIRECT at Yarrow's seat (his word at this seat ~10:5xZ: "I have
  given feedback to Yarrow") — the feedback substance lives at their
  seat; the Director relay was PENDING at this freeze. Yarrow's
  resume: fold the feedback, then the review/land parcel and the
  node's resume order (three-push queue MCP-613/615/616 → amendment
  parcel → demo-work land → T1a-ii with the motion-axis + loop-arm
  feed → T1b → T2). Plan node ratified at `d19101de6` (pushed).
- (b) PR #899 (MCP-609): round-2 cures at `7968d28be` (pushed:
  single-resolution cut, probabilistic sha6 wording in four carriers,
  24h rule now prescribes the minted form + parse contract — the
  rule's stale estate-form prescription was an F-161 recreation risk,
  cured). Round 2 DISMISSED at honest cure; mantagen ROUND 3
  RE-REQUESTED — at its arrival: harvest full, disposition, then
  `merge-bot merge --pr 899 --expect mantagen` at SETTLE-READY (the
  state machine refused a premature merge with
  SILENT-WAIT-NO-REVIEWER: a review must BIND the current tip; a
  dismissed round binds nothing).
- (c) PR #905 (MCP-612; bot-authored replacement of mis-authored #904
  — ambient-credential breach cured, failure-mode event `5472dbad`):
  checks 17/17 green, Sonar passed; mantagen FIVE-FINDING
  CHANGES_REQUESTED round OUTSTANDING (split-write crash-atomicity;
  NaN-timestamp silent deletion; FIFO order change; claim-open
  TOCTOU; worktree-decoy validation — file:line in the review). ROUTE
  a verification+cure round to an implementer seat: each finding
  reproduced-or-refuted FIRST-HAND at the cited site before cure;
  goal-alignment note rides finding 3 (QUEUE-LOCAL grades the queue
  legacy-use). Acknowledged on the PR, NO dismissal. MCP-612
  acceptances 2+3 (primary rebuild verification; legacy-blob owner
  card) fire only post-merge.
- (d) Poppy (repo-architecture): #889 under both OVN-2 riders, in
  progress, "start slowly" — no outcome report by this freeze; then
  support posture. MCP-619 phase 2 stays behind the short-term goal
  and its owner-seen warrant card.
- (e) Instruments at this freeze: ALL STOPPED (heartbeat pair with
  heartbeat-end; the #899 round-3 poll; design ARC tail; F-75;
  canonical watcher last). Re-arm at resume per the canonical
  recipes; review-arrival polls key on the reviews ARRAY only (the
  mergeStateStatus field flaps, and pr-watch's ALL-GREEN exit cannot
  hold through green-but-blocked — F-162). Bot token file DELETED at
  this freeze; mint per write-window (merge-bot mint-token, wc -c
  tripwire, author echo BEFORE the first identity-bearing write).
- (f) Push discipline standing (owner word 2026-08-18): every push's
  output to an untracked scratch log; background pushes carry the
  push's OWN exit code — a `; echo` wrapper false-greened one failed
  push this morning and the log told the truth.

## 2026-08-18 ~13:5xZ — RESUME COMPLETE (Ocelot binds Tunnel, c28ad9): #899 merged and folded back; #905 routed; instruments green

Seat resumed post-compaction at owner word (~12:4xZ). Instruments
re-armed per the canonical recipes and verified (F-95 both gates;
registry read-back; the watcher's hourly-backstop recycle at ~13:5xZ
re-armed on the exit notification). Freeze-map disposition:

- (d→done) #889 MERGED 09:22:47Z `daf56ccad` under both OVN-2 riders —
  absorbed from Poppy's correction `57167e44`; nothing remains.
- (c→routed) #905 five-finding verification+cure round routed to Poppy
  (directive `3eda8a27`, absorption ack in full; verify-first contract,
  QUEUE-LOCAL legacy-use grading on finding 3, MCP-620 support standby
  keeps precedence). Post-merge acceptances 2+3 stay on this board.
- (b→done) #899: mantagen round 3 (two blockers) cured at `eaa75e6e7`
  (fold step 9 single-BASE resolution; probabilistic sha6 wording in
  the cut skill + both adapters; carrier sweep clean), dismissed at
  honest cure, round 4 APPROVED binding the tip, MERGED `791266135`
  via merge-bot (an external stop killed the first settle run; owner
  card answered "merge now"). Round-4 tally: zero findings. The
  fold-skill step-9 delegation-form question is RESOLVED-BY-CURE:
  step 9 carries the single-resolution block inline plus the pointer.
- Coordination main-merge `386d3b7e9`: one conflict (fold skill),
  resolved to main's four-round-reviewed step 9 (the coordination-side
  interim hand-patch it superseded carried no unique substance);
  marker-probed both directions; dist rebuilt green after the merge.
- (a unchanged) Yarrow: feedback-fold relay still pending; three-push
  queue + node resume order stand. Nothing owed from this seat.

Instruments live at this write: canonical watcher (bqzj6q3kt),
heartbeat pair, F-75 delta poll, design ARC tail. Next wakes: round
report from Poppy (#905), Yarrow relay, owner word.

## 2026-08-18 ~21:2xZ — COMPACTION FREEZE 2 (Ocelot binds Tunnel, c28ad9): drift signal fixed as PR #911; seven PRs at cured heads; seat continues

Owner word: fix the broken CI drift signal, then prepare for compaction
and stop all processes. The seat CONTINUES at resume; silence past the
freeze broadcast is intentional. RESUME MAP, priority order:

- (a) PR #911 (MCP-626 signal arm, fix/mcp-626-schema-drift-status at
  8c43a9c2d, bot-authored, jimbot): the schema-drift verdict now
  renders on VISIBLE surfaces — pure report builder (25 tests; every
  outcome incl. skipped; injection-escaped versions; verdict-first
  truncation), stderr/stdout stream contract, and a DEDICATED
  schema-drift CI job publishing an informational commit status via gh
  api (fork-guarded, retried, target_url). The pre-execution review
  VERIFIED that statuses:write on the build job would let build-time
  code mint a green run-quality-gates (both attribute to app 15368) —
  the dedicated job is the cure; never move the token back. Awaits
  Copilot + mantagen rounds; merge leg at settled. MCP-626's OTHER arm
  (schema-cache refresh 0.7.0→0.11.0, pnpm sdk-codegen:refresh) is a
  separate slice, untouched. MCP-627 (new): live ruleset has
  strict_required_status_checks OFF vs ADR-204's ratified ON.
- (b) #888 (57ca43b5b) / #891 (6f073346f) / #905 (ef0742759): all at
  cured heads, every review round dismissed-at-verified-cure, fresh
  Copilot rounds harvested and dispositioned (incl. one REFUTED with
  vitest-source evidence: VITEST_MAX_WORKERS IS read by v4), awaiting
  BINDING rounds — dismissed rounds bind nothing and Copilot never
  approves, so mantagen's cadence (NOT on-demand, owner calibration)
  or human approval settles them; merge-bot recomputes at any try.
  MCP-625 carries the deferred owner-only-write symlink bug (verified
  pre-existing on main) + two small residues.
- (c) Yarrow (claim 645b9e0b): froze 18:34Z after closing round 1 on
  all four design PRs, resumed 20:49Z, and was LIVE at this freeze;
  their round-2 harvest owns
  #907's red CI (Sonar+browser+aggregate on 62df2091c) and the landed
  Copilot rounds on #907/#909; #908/#910 wait as in (b). Merge legs
  for #907-#910 at this seat at settled. Their board facts are on the
  ARC channel (20:5xZ entry).
- (d) Host-portability programme (MCP-624, node ratified 2026-08-18):
  item 3 DONE (macOS gate green on #891); items 2/4 = the merges in
  (b); items 1, 5-9 queued as delivery slices (principles clause,
  LF-generator + spawnSync residue, static ratchet, the REQUIRED basic
  Windows + macOS CI legs, docs, research-child re-true).
- (e) Instruments at this freeze: ALL STOPPED (heartbeat pair first
  with heartbeat-end; ARC tail; F-75; canonical watcher last). The
  owner's evening stop of the PR watches is SUPERSEDED by this freeze;
  fresh watches are the resume seat's call. Bot tokens deleted; mint
  per write-window (echo author BEFORE the first identity-bearing
  write). Push discipline standing: output to an untracked log, the
  push is the guarded command.
- (f) This freeze's parcel pushes the evening's HELD ahead-2
  (7bee8b676 Yarrow round-1 + bb62015c3 ARC rider) with the freeze
  entry — the compaction order's conserve supersedes the evening
  stop-work hold. Napkin carries the day-2 lessons: the
  sensor-into-the-void generator, the FETCH_HEAD single-slot race,
  the worktree-binary home-registry hazard (until #905 merges +
  primary rebuild). Routed at the freeze edge: MCP-628 (e2e
  static-root fixture races copyOakDs staging dir; named one-guard
  cure) — Yarrow's finding, homed as a ticket, liftable by any seat.

## 2026-08-19 ~11:4xZ — WRAP (Ocelot binds Tunnel, c28ad9): output-contracts lane complete and RATIFIED; fold-to-main is the next leg; seat continues at owner word

Session outcome (owner-directed, four-part): the output-schema truth
lane ran end to end in one sitting — 14-leg verification fleet (report:
`.agent/reports/output-schema-truth-fleet-2026-08-19.md`, the durable
evidence record), documentation trued (testing-strategy absence-pin
rule; schema-first §Output Contracts; index/continuity sweeps), the
`mcp-output-contracts` plan family authored, twice-reviewed
(assumptions HOLD cured in full; docs must-fixes cured), RATIFIED by
the owner (stamps at `9f20ed3d0`, pushed, remote-verified), and the
advertisement ruling folded (measure $defs dedup first, lean accept).
MCP-630 minted (served-surface truth; the live changelog-tool 404
defect). Prior plans archived with banners. RESUME MAP, priority order:

- (a) COORDINATION FOLD TO MAIN — the branch is OVERDUE per
  coordination-branch-24h-lifetime (stamp 08-17; now 08-19). The route
  (rule §Action 3, converge-and-rotate): AFTER Yarrow's design merge
  drive settles (their merges move main), merge origin/main into the
  coordination branch (pre-merge divergence analysis), push, land the
  branch through its fold PR at full condition (archival/record class;
  product-gravity line in the body; binding review; bot REST-merge,
  never squash), then cut the fresh day-stamped successor with the
  cut-coordination-branch skill's tool and broadcast the rotation.
  This fold is how the ratified plan family — and everything else on
  the branch — reaches main.
- (b) mcp-served-surface-truth (MCP-630) pickup: HELD at owner word
  2026-08-19 ("first pick up not yet") — route ONLY at his word; it
  sequences after PR #911 lands regardless.
- (c) This seat's PR board: #911 awaiting binding rounds + the CodeQL
  inline finding needs a dispositioned round (targets the sanitised
  path; likely refutable with evidence); #905 19/19 green awaiting a
  binding round; merge legs at settled. Matt active today — rounds may
  land on his cadence.
- (d) Yarrow (owner word at their seat): finish AND MERGE the design
  PRs (#907-#910, then #912 at stack dissolution) — merge legs at
  THEIR seat this sitting; the T1a-ii+T1e owner card routes through
  the Director when surfaced; MCP-628 liftable by any seat.
- (e) Poppy: MCP-619 change set COMPLETE as design at owner lens-4
  sweep (seam centrepiece); next = owner review, then migration cards
  in dependency order (seam first). Atlas at 3d2cdd848.
- (f) Follow-ups with named homes: testing-strategy.md is over its
  fitness char-limit (pre-existing; its own split_strategy is the
  cure, own lane); plan-node-schema needs a dated short-lived-
  strategic reconciliation clause (owner-word exception exists in the
  mcp-output-contracts node); MCP-627 ruleset drift open; MEMORY.md
  index still ~19KB (curator pass).
- (g) Instruments at this wrap: heartbeat pair stopped first with
  heartbeat-end, then F-75 poll, canonical watcher last. Lane claim
  (output-schema truth) CLOSED — work complete. Director claim
  b1d00d68 RETAINED-WITH-REASON: same seat resumes at the owner's
  word; silence past the heartbeat-end is intentional stand-down.
  Shared-checkout disciplines now standing: stage AND commit by
  explicit pathspec; the push is a task's FINAL command (the
  false-green echo wrapper recurred 2026-08-19 and is napkin-recorded);
  three same-window push races say fold windows want quiet branches.

## 2026-08-19 ~12:3xZ — COMPACTION FREEZE 3 (Ocelot binds Tunnel, c28ad9): FOLD COMPLETE — plans on main, successor branch live; seat continues

Owner word: fold to main, cut the successor, prepare for compaction,
stop all processes. The seat CONTINUES at resume. RESUME MAP:

- (a) FOLD COMPLETE: convergence merge bb4e4110c (clean; stale-capture
  probe green), fold PR #914 bot-merged at full condition — merge
  commit 1651ad2db on main. The mcp-output-contracts family, the fleet
  evidence report, both directive amendments, and all day records are
  ON MAIN. Successor coordination/2026-08-19-1651ad cut
  tree-preservingly from post-fold main, pushed, tracking; the primary
  resides there. Rotation broadcast 625eb128; the d4855c11 hold lifted.
- (b) AT RESUME, FIRST: check whether main moved (Yarrow's design
  merges land there); if so, merge origin/main into the successor and
  REBUILD promptly — until then the primary's dist runs a stale
  contract (skill step-9 note; worked instance 2026-08-01).
- (c) Board: #911 awaiting binding rounds + the CodeQL inline finding
  needs a dispositioned round; #905 19/19 green awaiting a binding
  round; merge legs at this seat at settled. Design merge legs
  (#907-#910, #912) at Yarrow's seat under owner word; the T1a-ii+T1e
  card routes through this seat when surfaced. MCP-627/628 open.
- (d) MCP-630 pickup HELD at owner word ("not yet") — route ONLY at
  his word; sequences after #911. Implementation todos 1-8 start-safe
  whenever he opens the lane.
- (e) Poppy: mid-parcel at owner word (principles.md gradient
  amendment, atlas extraction refinement, lane thread record, untracked
  toolkit-re-architecture plan node) — commits on the successor at the
  rotation; their word, their lane. Yarrow: design merge drive live.
- (f) Instruments at this freeze: ALL STOPPED (heartbeat first with
  heartbeat-end, watcher last). Contract note, self-caught: this
  window's watcher ran --exclude-tag heartbeat WITHOUT the paired F-75
  poll (both peers were demonstrably live on directed events; the gap
  was real but unconsequential — re-arm the full triple at resume).
  Bot token DELETED at window close. Director claim b1d00d68
  RETAINED-WITH-REASON: same seat resumes at the owner's word.
- (g) Carried follow-ups: testing-strategy.md split (over char limit);
  plan-node-schema short-lived-strategic reconciliation clause;
  MEMORY.md index curation; MCP-627 ruleset drift.

## 2026-08-19 ~13:1xZ — DIRECTOR SUCCESSION (Ocelot binds Tunnel c28ad9 → Avocet guards Updraft 44e2ca): Moment 1 executed; seat ends at Moment 2

Owner-initiated deliberate succession (PDR-063 §Deliberate succession:
the lane is AT-REST post-freeze-3, so the handover is
tracked-surfaces-only — NO claim adoption). Avocet guards Updraft
(44e2ca) owner-seated ~13:03Z, standby team-start 4d077b1b (foundation
complete; watcher + F-75 pair live). The claim contract, settled here:
b1d00d68 CLOSED at Moment 1 with this succession as its summary;
Avocet opens their OWN Director claim (--role director) at Moment 2 —
adoption is for in-flight cycle claims, and none exists.

Facts refreshed at Moment 1 (deltas since freeze-3 broadcast 00d07c87):

- main moved to cacf23149 — #907 AND #909 are MERGED (Yarrow's drive);
  #910 reads DIRTY under the moved base; #912/#908 BLOCKED in settle
  windows; a NEW PR #913 exists (rules: "a reviewer never stands down
  leaving an ownerless…") — provenance unverified at this seat, verify
  at pickup. The successor branch (ecfe11dd1) is BEHIND main: the
  merge-origin/main-in + REBUILD first-move now binds harder.
- Everything else stands as the freeze-3 map: #911/#905 binding rounds
  and merge legs; MCP-630 pickup HELD at owner word; MCP-627/628 open;
  T1a-ii/T1e unblocked at the design seat (card yes ×3, record
  c17a4bd7); Poppy's seat DOWN, lane complete and ratified.

Moment 2 requirements on Avocet (PDR-064): pass the director-handoff.md
readiness gate, broadcast the active-acknowledgement referencing the
Moment-1 event, open the Director claim, arm the heartbeat pair. Until
that broadcast lands, routing authority remains with Ocelot's record;
the owner is conducting and present, so the between-moments detection
path is owner-held (cadence stays down per the standing stop order).

## 2026-08-19 ~14:2xZ — SUCCESSION COMPLETE (Avocet guards Updraft, 44e2ca, Director): Moment 2, main merged in, primary rebuilt

Moment 2 broadcast 84e31e6e (13:18Z) in response to Ocelot's Moment-1
adc480c2; readiness gate pasted inside it (registry: Ocelot's b1d00d68
ABSENT/closed; peer-liveness: Ocelot's heartbeat stopped by intent at
12:49Z). Own Director claim f04cd57b opened `--role director` on the
successor branch; heartbeat pair armed on it (comms + claims legs,
240s, both read back advancing); canonical watcher (heartbeat-excluded)
paired with the F-75 delta poll. Ocelot's directed ask 1e9f10f9 is
discharged (their d20bd0a92 + succession commit reached the remote via
Yarrow's 5da80c1b9 push); their closeout broadcast is outstanding at
this write.

First leg done: origin/main (cacf23149, release 1.175.0, #909) is IN
`coordination/2026-08-19-1651ad` — the merge commit is `d2dd64b69`
(parents e701d7869 + cacf23149; 14 files = Yarrow's two design records
plus main's 12). Attribution note for the record: the merge landed under
Yarrow's `docs(design): final tips at the handoff cut` message because
my merge wrote the shared index while their as-is commit sat in its
pre-commit hook and my own merge commit stopped at commitlint; git's
post-hook re-read of index + MERGE_HEAD made theirs the merge commit.
Content and ancestry correct; no undo attempted (risk-of-loss against a
peer's staged files). Pushed at 14:15Z, remote tip read back; primary
`pnpm install && pnpm build` green 14:17Z (FULL TURBO — the pre-push
gate had built the tree). Broadcasts: window 08e99990, done (in reply).

Estate at this write: Yarrow CLOSED OUT 14:13Z at owner word (handoff to
a successor; claim 645b9e0b RETAINED with handoff record
`645b9e0b-design-lane-merge-drive-2026-08-19.md`, pickup by adoption);
design merge legs #908/#910/#912 at SETTLE-READY fall to the design
successor (or this seat at settled under the owner's standing
"green and clean → merged" word); their post-cut 4c3bebac7 rides the
next push. Poppy DOWN. #913 provenance verified: emgeebot (Matt's
warden seat), +39-line amendment to `pr-comments-resolve-and-recheck`,
all checks green, unreviewed — a Practice-rule amendment awaiting a
review round (route to an Implementer when one frees). #911: CodeQL
FAILURE to disposition + binding rounds; #905: green, binding round.
MCP-630 HELD at owner word. Board otherwise as the succession entry.

## 2026-08-19 ~15:5xZ — WEEK-SLEEP FREEZE (Avocet guards Updraft, 44e2ca, Director): estate dormant at owner word; seat frozen, claim retained

Owner word (card answer ~15:4xZ): broadcast TEAM-SLEEP, then freeze this
seat; the owner's second clone is left as-is (his call later). TEAM-SLEEP
broadcast `bbc33e91` (stand-down order: heartbeat-end first, F-75 poll,
watcher LAST); Poppy stood down on it (15:52Z). Yarrow closed out earlier
(14:13Z, claim 645b9e0b retained for a design successor). Ocelot's seat is
idle with NO closeout broadcast on the stream at this write (their claim
closed at Moment 1; nothing of theirs is unpushed). The week-sleep SWEEP is
the record `.agent/reports/week-sleep-sweep-2026-08-19.md` (on this branch,
in draft fold PR #915): every worktree branch pushed-and-PR'd or contained
in main; drafts #916 (MCP-103 workspace) / #917 (MCP-475 build gate) opened
at this seat; #918 (w01-census scaffold) by the design lane; two red WIP
fragments preserved verbatim in the record; peer-fleet and closed-PR
branches reported, untouched.

RESUME MAP (wake-first seat — this seat at the owner's word, or a
successor adopting claim f04cd57b by PDR-063 adoption after the
director-handoff.md readiness gate):

- (a) FIRST: `git fetch`; if main moved, merge origin/main into
  `coordination/2026-08-19-1651ad` on a QUIET tree (no peer commits in
  flight — a clean tree is not a free index), push via
  `pnpm agent-tools merge-bot push`, REBUILD the primary. Then the 24h
  fold rule is overdue by construction: mark draft #915 ready and land it
  through the converge-and-rotate ceremony; cut the successor branch.
- (b) Seat-owned merge legs: #911 (CodeQL FAILURE needs a dispositioned
  round; binding rounds pending), #905 (green, binding round pending; then
  MCP-612 acceptances 2/3 — acceptance 3 = ONE owner card on the two
  archive blobs). Merge at SETTLE-READY via
  `merge-bot merge --pr <n> --expect <reviewer>`.
- (c) Design merge legs #908 (`9d811d463`) / #910 (`0c30a6932`) / #912
  (`cbdbda76b`) at SETTLE-READY under the owner's standing "green and clean
  → merged" word — the design successor's if one is seated, else this seat
  after harvesting each bound round; #910 reads DIRTY (main-merge first).
  Claim 645b9e0b + handoff record
  `645b9e0b-design-lane-merge-drive-2026-08-19.md` carry the design lane.
- (d) #913 (emgeebot, +39 lines on `pr-comments-resolve-and-recheck`): a
  Practice-rule amendment from Matt's fleet, all checks green, unreviewed —
  route a review round to an Implementer. #916/#917/#918 are visibility
  drafts — the lanes decide.
- (e) MCP-630 pickup HELD at owner word ("not yet") — route ONLY at his
  word. MCP-627 (ruleset drift) / MCP-628 (copyOakDs e2e race — reds a
  parallel full gate intermittently; read before trusting a red
  `pnpm check`) open.
- (f) Instruments at this freeze: heartbeat loop stopped explicitly with a
  heartbeat-end event, then the F-75 poll, the canonical watcher LAST
  after the freeze broadcast. Director claim f04cd57b RETAINED-WITH-REASON:
  the estate sleeps; silence past the heartbeat-end is intentional. No bot
  token held (mint per write-window). Worktree residue left as found: a
  stale staged report copy in design-plan-truings, the vcw oak-eslint edit
  staged by this seat's refused commit attempt, the mcp-567 test edit, the
  pr-891 runner script.
- (g) Carried follow-ups (unchanged): testing-strategy.md split;
  plan-node-schema short-lived-strategic clause; MEMORY.md curation;
  MCP-627; the napkin rotation recorded DUE; the shared-index race generator
  (per-seat worktrees for coordination writes, or a warden singleton) as a
  concept-exploration seed.

## 2026-09-02 ~13:xxZ — FOLD LANDED (Finch calls Pinnacle, c91bd4): #915 to main; board re-cut at owner rule; no successor branch; no Director seated

Seat: Finch calls Pinnacle (`c91bd4`, claude-code / claude-fable-5), implementer at
direct owner word (no Director seated; the week-sleep ended at owner word 2026-09-02).

- **The fold.** `coordination/2026-08-19-1651ad` (draft PR #915, frozen 2026-08-19 at the
  week-sleep, 14 commits, 19 files) reconciled against main and landed by merge commit.
  Semantic merges per the semantic-merge skill: `napkin.md` as an append-only union
  (1267 base + 156 branch + 1602 main = 3025 lines; heading set-diff empty both ways;
  era witnesses present; git's own `--union` read 3024 because it hoisted the shared
  blank line — the deterministic construction was used and git's union kept as the
  cross-check); `repo-continuity.md` as main's body carrying the branch's
  `typescript-estate-consolidation-review` row (616 lines; numstat 1/1 against main,
  34/7 against the branch). The other seventeen files were untouched on main since the
  base and landed as written. Validators green on the merged tree (plan corpus 106
  conformant; markdownlint 0 issues). Reconciliation merge commit `099f13e5e`.
- **Owner sequence, verbatim (2026-09-02):** "we will merge 946, 945, 908 then we will
  look at the plan consolidation -- do not start yet"; "if 915 is workspace topology
  related it should be in the same list as 908"; after #908 landed: "fix the issues as
  part of the 915 work. Plan the 915 work before starting". Executed in that order:
  #946 (55f7a457c), #948 (995eb0aa6), #945 (bf8db3a8e), #908 (a8aa13da1, on this seat's
  merged head 5e5ff75f8), then this fold.
- **Board re-cut at owner rule, verbatim (2026-09-02 morning):** "If it is relevant to
  the workspace topology work it stays, everything else moves or is closed. I don't want
  any pointers." Executed: #905, #911, #912, #910, #916, #917, #890 moved under the
  owner's custody and closed on oaknational under the bot with their branches deleted;
  #918 closed and its branch deleted; #915 and #908 stayed as workspace-topology work.
- **Three owner plan-gate answers at this fold (2026-09-02):** (1) no successor
  coordination branch after the fold — `handoff/jim-september` (draft PR #951) is the
  consolidation home at owner word; the coordination-fold skill's step 9 (the successor
  cut) is therefore set aside for this fold by owner word, and the skill's own dated
  amendment routes to the plan-consolidation session; (2) the tango node's T2/AC4 re-scope
  reads "Fixture consumer first light"; (3) the retained claims of retired seats,
  `f04cd57b` (Avocet, Director) and `645b9e0b` (Yarrow, design lane), close at the fold
  landing with closure summaries.
- **The #908 post-merge round, carried here at owner word.** Copilot's 12:24Z review on
  the merged tango node re-raised two 19 August suppressed comments never dispositioned:
  the T1d deferral amendment had not been consolidated through §Mechanism, AC2, AC4 and
  T2, and the deferral was a scope change the 19 August stamp did not cover. Cured in this
  fold's third commit (the node re-trued and re-stamped; the readiness record carries the
  addendum; DDR-012's `informed_by` edges made artefact pointers); the design lane's
  thread record §Session update 2026-09-02 is the `ratified_where` target.
- **Owner objective and rulings for the repo-split work, verbatim (2026-09-02
  ~13:1xZ, at this seat; the durable home for the split plan's authoring).** Objective:
  "our objective here is to merge 915, then provide a plan, then make sure that the repo
  strategy is consistent and cohesive around that plan." The purpose, earlier the same
  hour: "to hand over a maintainable surface for the 'MCP App' to a squad, without
  burdening them with the agentic engineering material or the libraries etc. It is not
  quite as straightforward as it sounds, the new repo must be functional, if devs need to
  come to this repo to make significant changes that is a problem. We are in no way
  constrained to the workspaces we happen to have today, I am expected multiple
  workspaces to be split, including non-app workspaces" (sic). Five rulings on the
  seat's decision list: (1) "yes the search app is effectively part of the MCP app";
  (2) "the published packages will be on the @oaknational org scope, public, code is
  MIT, content OGL, any included Oak branding is covered by the Oak branding usage
  guidelines... so same as everywhere else"; (3) "releases: up to the implementing
  person, I would go with one release version per repo for now"; (4) "oak-under-the-hood,
  leave it as an open question for whomever picks up the plan, maybe we split it into two
  separate skills/tours"; (5) "all Oak work is public and open by default, the name will
  be oak-open-curriculum-mcp in the oaknational github org". Sequence the objective sets:
  this fold → the split delivery plan (serving `toolkit-re-architecture`, self-contained
  for a fresh session, the extraction as the product: the MCP app and the Oak-leaf
  workspaces it needs building in `oaknational/oak-open-curriculum-mcp` from registry
  dependencies alone) → the strategy corpus made consistent and cohesive around that plan.
- **Estate shape after this fold.** The primary checkout sits on `handoff/jim-september`
  (Kiln holds Slag, `1447f4`, curator, claim `d88ab157`: napkin-only consolidation; every
  uncommitted change from the 2026-09-02 wrapping seats was committed there at owner
  word). Next at the owner's word: Kiln merges main into `handoff/jim-september` (the
  napkin is rotated on that branch and appended on main — the semantic-merge skill's
  named dangerous shape; Kiln acknowledged the carry-across plan on the stream at 12:59Z);
  then the split plan; then the strategy consolidation on that branch. Grounding already
  delivered at this seat for both: the catalogue of every repo-shape plan, research and PR
  by authority tier, and the 2026-09-02 dependency map of the MCP app (22 workspace
  packages in its closure: 8 generic foundations, 7 mixed, 7 Oak-leaf; nothing published;
  a dozen root-level couplings; Practice content reaching the product through the
  `oak-under-the-hood` tool) — both in owner chat and the seat's per-user memory; the
  plan re-derives from the corpus and a fresh map, never from the chat.
- **Review-round routings for the consolidation session (Copilot round on #915,
  2026-09-02 13:19Z; dispositioned on the PR, recorded here as the session's input).**
  (1) `toolkit-re-architecture` has no "User groups and value" section — the template
  requirement (owner ruling 2026-08-31) postdates the node's ratification; the node
  carries the ledger row; the section is authored at the consolidation session as a
  dated amendment for the owner's word. (2) The pattern
  `classification-instrument-is-a-symptom` declares `proven_by_implementation: true` on
  the strength of an owner-ruled design sweep, while the patterns README defines that
  barrier as "real shipped code"; the corpus admits decision-move patterns on executed
  decisions, so the README's barrier wording versus decision patterns is the question
  for the session, never a landing-seat re-grade. (3) The Castr fixture-pack README says
  ADR-108's step ordering "is amended by the seam migration" while ADR-108 is unchanged:
  a sequenced deferral, named, not a hidden one — the ADR amendment lands with the
  seam-migration delivery plan (ADRs state should-be; means live in plans). (4) Second
  round, 13:33Z: the Atlas text names four `oak/` pack classes (identity · content ·
  config · experience-tuning) while its seam diagram renders three — a rendered
  artefact's diagram edit needs a rendered re-verification, so it is the session's;
  the tango node's restatement was corrected to four in this fold. Also noted, not
  cured: the week-sleep sweep report's headline worktree total (47) disagrees with its
  44 + 5 rows; a dated archival report of a retired seat.
- **Retired seats' claims.** `f04cd57b` and `645b9e0b` closed at this landing; their
  handoff records stay on disk under `.agent/state/collaboration/handoffs/` as the
  instance-tier record of what those seats froze.
- **LANDED, and the lane that follows (2026-09-02 ~14:2xZ, same seat).** #915 merged as
  `777e9131c` (the PR's merge commit, owner-merged 14:05:45Z on this seat's final head
  `475a8193d`). Four Copilot rounds settled (raised 9 → 3 → 2 → 0 open); rounds 3 and 4 were
  re-raises and housekeeping. Owner word mid-loop, verbatim: "keep 915 tight" (with the
  pr-lifecycle and proportionality skills invoked — read as this seat's loop checkpoint having
  failed: no PDR-140 intake declaration or tally at PR-open; failure-mode event `9874ce04`;
  the curator conserved it as recurrence-despite-home, the declaration clause already living
  in `review-feedback-defaults-to-triage` §Trigger). Owner word after the merge, verbatim:
  "for the post-merge routings, take any unaddressed 915 comments as well, then all of that
  goes into the same branch as the delivery plan, to minimise the total number of prs."
  Claims `6ce14377` (this seat), `f04cd57b` and `645b9e0b` closed; the #908 Copilot thread
  replied to and resolved. Kiln merged main into `handoff/jim-september` at `ba7e37d78`
  (their event 14:24Z; the fold's 156 napkin lines carried and processed).
  **The lane: MCP-661**, branch `jimcresswell/mcp-661-split-delivery-plan` from main at
  `777e9131c`, claim `188c28b1`, one PR carrying (a) these record true-ups, (b) the uncured
  #915 items, (c) the split delivery plan node `oak-open-curriculum-mcp-extraction`
  (serving `toolkit-re-architecture`). Dispositions of the routings above on that branch:
  (1) the "User groups and value" section authored on the toolkit node as a dated additive
  amendment presented for the owner's word (moved off "the consolidation session" at the
  one-branch word); (2) the patterns README barrier row gains a dated clause admitting
  decision-move patterns proven by an executed, owner-ruled decision; (3) the Castr README
  names the amending instrument by id (the delivery plan carries the ADR-108 amendment as a
  slice; ADR-108 stands until it lands); (4) the Atlas diagram gains `experience-tuning`
  with a rendered proof in the plan's readiness record; the sweep report gains a dated
  addendum stating that its 44 + 5 rows cannot re-derive the headline 47. Round 3's cures
  landed on #915 itself (`475a8193d`: the tango node's `ratified_date`, §Mechanism item 2,
  AC3; the toolkit node's `last_updated`). Fresh dependency map at this seat (manifests at
  `777e9131c`): 33 members; the two apps' runtime closure 17 packages, 25 with dev-time
  deps; 8 outside; nothing published — the delivery plan carries the table.

## 2026-09-03 ~10:2xZ — HANDOFF to the implementing session (Finch calls Pinnacle, c91bd4): MCP-661 landed; MCP-673 node on draft PR #959; the next session implements it

- **Objective state.** The owner's three-step objective of 2026-09-02 ("merge 915, then
  provide a plan, then make sure that the repo strategy is consistent and cohesive around
  that plan"): step 1 landed (#915, `777e9131c`); step 2 landed (#954, merge `c844bcf60`,
  released 1.177.1 — the delivery nodes `oak-open-curriculum-mcp-extraction` and
  `toolkit-publish-mechanism`, both sketches awaiting the owner's ratification; the
  readiness record with two suites and three PR rounds dispositioned by ID; round-3
  routings on MCP-661); step 3 is MCP-673, whose delivery node
  `intent-corpus-truing-around-the-extraction-plan` (third draft, `9aa5e011e`) sits on draft
  PR #959 under the bot. The owner said the next session is the last of the objective and
  sized the work at 30 to 90 minutes; the node carries per-todo estimates (85 minutes of
  authoring plus two gates) and a named drop candidate.
- **Where the seat-facing state is.** The primary checkout is on
  `jimcresswell/mcp-673-strategy-corpus-consistency` at `9aa5e011e` = origin, clean, at the
  owner's word ("We can work in the primary checkout for this one"); the MCP-661 worktree is
  removed and its branch deleted (merged). Claim `2c11756e` (this seat, the corpus files)
  closes with this handoff; the next session opens its own. No Director seated; n=1.
- **Reviews on the node.** Two Opus readiness reviews (assumptions, docs), then an
  owner-invoked full Cricket suite (eight seats, all ON-TRACK) with an adversarial
  assumptions review on Fable, two-lens refutation and a cross-examiner, recorded in
  `.agent/reports/agentic-engineering/cricket-quartet-tally-2026-09-03-mcp-673-intent-corpus-truing.md`.
  Every accepted finding is cured in the third draft; the rejected ones are named in the
  tally's adjudication.
- **Assumptions the next session should investigate before or while executing** (each
  with its check):
  1. *Coverage of the sweep.* The pinned scan plus the judged list finds every surface that
     states a superseded or false-today position. The Fable adversary found two the
     second draft had missed (the vision; the engineering and SDK pages on publishing).
     Check: run the pinned scan and, once, the same pattern over `docs/engineering`,
     `docs/operations`, `packages/**/README.md` and `apps/**/README.md`; read every hit.
  2. *The registry state.* The node says the curriculum SDK is not on the registry. That
     was verified by subagents (`npm view @oaknational/curriculum-sdk version` returning
     not-found), not by this seat. Check first-hand before editing the publishing pages.
  3. *One word over a numbered list is the owner's act.* The gate rests on the estate's
     precedent ("Ratify both" over an enumerated scope). Check: the owner's answer form on
     PR A; if he answers per item, record each; if he declines by number, revert that item
     before merge.
  4. *The in-place form for the ratified node.* The schema's "smaller amendments are made
     in place with dated notes" is read as covering a reversal of the banked delivery
     order because the outcome and bet are unchanged. Check: the owner may read the
     ordering item as a scope change; the node's fallback (revert, banked order stands)
     is written for that.
  5. *The parent node.* Two Opus reviewers disagreed; the adversary, both refuters and the
     cross-examiner settled `serves: toolkit-re-architecture` on the lane's own
     enumeration rule. Check: nothing, unless the owner re-points it.
  6. *The estimate.* 85 minutes of authoring is this seat's estimate, untested. Check: time
     T1 and T2; if over pace, take the drop candidate (the three publishing-truth pages to
     a third small PR).
  7. *The Atlas amendments block.* No precedent in the file; the form is stated in the
     node and covered by the owner's word. Check: keep the ruled prose intact; do not
     touch the diagrams (the seam diagram's text line must stay identical).
  8. *The extraction plan's ordering thesis is still presented, not ruled.* The truing
     propagates it as the one decision item on the list. Check: it is marked as such in
     the PR body; the confirmations cite rulings 2, 3, 5 and 10.
  9. *The last session.* PR A waits on the owner's word; if he is not live, PR A stays open
     past the session and "the last session" fails on the calendar, not the work. Check:
     sequence PR B (no word needed) first when the owner is absent; leave PR A ready.
  10. *The owner's local-only priority ruling* (2026-09-03) exists only in this seat's local
      memory at his word and must not reach any repository surface, including the
      strategy index's reading-path line, which names the structural commitment and
      nothing about ranking.
- **What the owner holds.** Ratification of the three sketch nodes (the two from #954, the
  truing node on #959); the extraction plan's gate 1 (the D0a design record) and gate 2
  (repository creation; the error-reporting project of the same name in ADR-159/163); the
  publish node's publish-rights gate; the numbered list on PR A.
- **Instruments this seat learned this window:** commitlint caps commit subjects and body
  lines at 100 characters; `git grep -E` does not honour `\b`; the merge tool's review-run
  liveness probe can fail and exit early — arm a bind-wait around it; Copilot's on-push
  review does not fire for `.agent` plan paths, request it explicitly.

## 2026-09-03 ~11:5xZ — OBJECTIVE STEP 3 AT THE OWNER'S WORD (Chinook seeks Cloud, 661556, lead at n=2 with Vesta rides Solstice, 9e26e6): PR #959 ratified "all thirteen"; PR #961 open; PR C to follow

- **Objective state.** The owner's three-step objective of 2026-09-02: steps 1 (#915) and 2
  (#954) landed earlier; step 3 (MCP-673) is on two pull requests plus a closer. PR A (#959,
  this seat): ADR-227 as the extraction decision's durable home, the ten owner-word
  amendments of the truing node, and the node itself — ratified at the owner's card word
  "Ratify all thirteen" (~11:4xZ, no declines); the stamps land in this entry's commit and the
  bot merges at settled (`merge-bot merge --pr 959 --expect claude`). PR B (#961, Vesta): the
  eight factual true-ups, open under the bot, its Copilot round being cured, bot-merge at
  settled. PR C (Vesta, cut from post-merge main after both): archive the completed truing
  node, point the plan nodes at ADR-227, true the extraction plan's decision-log sentence
  (the ADR is the home; the log is the contemporaneous capture), carry the second-seat tally.
  MCP-673 closes at PR C's merge. Nothing else is deferred.
- **Owner rulings this window, verbatim.** (1) ~09:3xZ: "this session will complete the
  planning corpus alignment with the priority of splitting out new, thin apps as the plan
  describes … All of the work needs doing, the target is one hour, we will assess in about 45
  minutes"; (2) "there are no leftovers, as I said, all of the work needs to be done, that is
  the invariant"; (3) card: "Extraction first. That change of priority is the point of this
  planning work"; (4) card: "Also state it as the current priority"; (5) ~10:10Z
  start-right-team: "Vesta rides Solstice (9e26e6) will join you, making this an n=2 session,
  you are the lead, split the work as appropriate. All team members should use cognitive and
  planning skills as appropriate at all times"; (6) to the second seat ~10:1xZ: "plans are not
  durable, plans are ephemeral … Durable homes for decisions are ADRs"; (7) ~10:30Z: "for quick
  questions it makes sense to use the native inter-agent communication, for anything that
  might eventually be or lead to institutional knowledge, the comms and ARC systems are
  appropriate"; (8) ~10:35Z: "I think we need to stop using tail, it causes this same issue
  over and over and over"; (9) ~10:42Z: the PR A push tool call refused, then "run a full
  Cricket suite"; (10) card: "Fold ADR-227 into PR A and re-point"; (11) card: "Ratify all
  thirteen".
- **What landed on #959.** 3175e9a30 (the eight surfaces + identity rows); dc65c204f (the
  second read's two cures: the truing node trued to the card rulings, the alignment note
  re-formed); 753cdf455 (ADR-227 cherry-picked from Vesta's 2130c0a93; the vision, the three
  strategy pages, the Atlas block and the strategic node's note cite the ADR — the refusal's
  reason, found by the adversarial fable Cricket seat and verified against
  `no-moving-targets-in-permanent-docs` §Citation directionality); this entry's commit (the
  stamps; ADR Accepted; the thread record; the napkin; the Cricket tally; the ARC channel).
- **Cricket.** Two owner-invoked suites, eight legs each: this seat's (tally
  `cricket-quartet-tally-2026-09-03-mcp-673-truing-execution.md`) converged on asking the
  refusal reason, with the fable adversarial seat supplying the hypothesis that held; Vesta's
  (tally `…-second-seat.md`) 8/8 ON-TRACK. Both tallies record a haiku procedure seat acting
  outside its lens.
- **Instruments learned** (napkin carries the detail): zsh `pipestatus`; pnpm's literal `--`
  on `check-commit-message` (feed stdin); a wildcard-staging hook false positive on a bare
  `.`; `git mv` then `git add` of the deleted path refuses; enqueue output swallowed by
  `tail`; a stale enqueue blocks a peer's guard ("multiple fresh matching intents") until
  phased `abandoned`; commitlint subject-case rejects an uppercase token after the type;
  the automatic reviewer that binds a docs-only bot PR is `claude`, Copilot binds late or
  not at all.
- **What the owner holds after this.** The extraction plan's gate 1 (the D0a design record)
  and gate 2 (the repository's creation; the error-reporting project sharing its name,
  ADR-159/163); the publish node's publish-rights gate. The ordering and the public priority
  are ruled and landed; no owner item remains on MCP-673.
- **Claims.** ed9ec042 (this seat, the corpus files) closes at wrap; Vesta's claims cover
  #961's and PR C's files. The seat chain gains Chinook seeks Cloud (lead) and Vesta rides
  Solstice (second seat), both 2026-09-03.

## 2026-09-03 ~12:1xZ — COMPACTION BOUNDARY (Chinook seeks Cloud, 661556, lead): rulings landed; three PRs open at green, merge is the next act; Vesta paused at owner word

- **Owner rulings this stretch, verbatim.** "I don't want a third PR. PRs are SLOW. I see no
  reason the wrap cannot be part of PR B"; "We don't HAVE to do what copilot says, apply some
  critical awareness and thinking"; "Give me all outstanding owner questions as cards, right
  now"; "You are the lead, you are responsible for stopping Vesta from being dumb"; cards:
  merge policy "Change the merge policy instead" (docs-only bot PRs merge at checks-green with
  threads resolved and the Claude Code Review's standing verdict, no Copilot leg — the merge
  tool must learn the class, follow-up ticket owed); publish rights "Yes we have the rights, no
  we do not need them yet…"; skills scan "No install, anywhere" / "Harvest mechanisms, never
  vendor" / "Drop the scan: archive the plan"; design item 14 "strict everywhere, all the time,
  and long-term architectural excellence, run it through the decision matrix via the
  principles.md file and the cognitive skills" (ruling being derived by a design-system-expert
  subagent, `item14-lenses`; result lands on the design plan's gate — the ONE gate still
  alerting); liveness "Slack is the right answer, but the config must be left to the person
  who does the final implementation, not a now thing"; skills estate "Ratify the annotated
  corpus"; override contingency "Archive the plan"; directions "Ratify the shape and all five
  triggers"; then "prepare for compaction … wrap then stop all non-agent processes".
- **PR #959 (this seat)** — tip after this entry's commit; all checks green on the previous
  tip; Copilot round 1 on ed0f353: two threads, both cured here (the truing node's
  `last_updated` instruction qualified; the Atlas block's intro no longer names plan ids) and
  the strategy index no longer names a plan node by id (PDR-105; owner: plans are ephemeral).
  Carries: ADR-227 Accepted; the ten amendments; the truing node ARCHIVED with its stamps and
  disposition; the two MCP-661 nodes ratified; the publish node's gate discharged with the
  owner's words; the skills-scan and override plans archived with dispositions; liveness,
  skills-estate and directions gates discharged with the owner's words (directions stamped
  ratified). NEXT ACT: verify checks green by name and zero unresolved threads, then merge as
  the bot through the sanctioned REST endpoint (the pulls/959/merge endpoint, merge method,
  sha pinned, under a pull-request-merge token) — the new policy; the merge tool refuses
  SETTLED-NO-REVIEW by name until it learns the docs-only class.
- **PR #962 (this seat, consolidation)** — four rule/skill homes plus the merge-policy clause
  on the pr-lifecycle skill; Copilot round 1: three threads, all cured (the estate's remaining
  `tail` pipes in codex-helper, complex-merge and the commit skill trued; the strategic-node
  "exception" removed from the no-moving-targets row; the channels paragraph re-formed to
  behaviours 2 and 6). Same NEXT ACT as #959.
- **PR #961 (Vesta, PAUSED at the owner's word after compaction)** — tip 81c21278e, checks
  green, Copilot round 4 posted 11:37Z (two threads, four suppressed, untouched). Vesta's
  claim 01e418de stays open, paused not abandoned; her worktree
  `../oak-open-curriculum-ecosystem-worktrees/mcp-673-true-ups` has nothing uncommitted. The
  closer folds into #961 at the owner's word: plan-node pointers at ADR-227, the extraction
  plan's decision-log sentence, Vesta's tally file (untracked in the PRIMARY at
  `.agent/reports/agentic-engineering/cricket-quartet-tally-2026-09-03-mcp-673-second-seat.md`
  — do not lose it; it rides #961). Round-4 threads: triage on the merits under the ratchet
  rule (three look like real false-today claims per Vesta), reply-and-resolve the rest, merge
  at green as the bot. Whoever resumes first (Vesta at owner word, or this seat taking the
  index at Vesta's standing offer) does it.
- **Open follow-ups, owned:** (1) merge tool: accept the docs-only bot class at timeout-settled
  (ticket to mint at resume, MCP team); (2) the design plan's item-14 gate: land the subagent's
  ruling (gate row removed or renewed with the precondition); (3) the strategy index still
  names `innovation-kit` by id — a pre-existing PDR-105 defect to retire in a later true-up;
  (4) the bot cannot request Copilot (collaborator refusal) — moot under the new policy, noted.
- **Processes at this boundary:** the two Monitors (ARC tail, comms watch) and no background
  shells; claim ed9ec042 open; worktrees `mcp-673-consolidation` (mine, #962) and
  `mcp-673-true-ups` (Vesta) live; the local memory block carries the resume map.

## 2026-09-03 ~12:3xZ — MCP-673 CLOSED (Chinook seeks Cloud, 661556, lead; Vesta rides Solstice, 9e26e6, second seat): three pull requests merged, zero additional; the owner's handoff

- **2026-09-03 ~12:3xZ MCP-673 CLOSED (Chinook seeks Cloud 661556, lead; Vesta rides Solstice
  9e26e6, second seat).** Owner word 12:0xZ: "I want those three PRs merged, and I want ZERO
  additional PRs … this is my handoff." #962 merged b3c9742f8 (release 1.178.1 followed); #959
  merged ec7cb3fa8 (cure tip 0274984f6: the design plan's item-14 gate discharged at the card
  word, the closure-check ruling and its slice recorded, zero expired gates on live plans); #961
  merges last — by the lead, REST as the bot, sha pinned, at the owner's later word handing the
  second seat's tail to the lead ("with this little left the overhead of coordinating two agents
  is greater than the benefit"). Docs-only bot-PR merge policy lives in pr-lifecycle §5; the
  merge tool must still learn the class (named follow-up, no ticket minted: tickets mint at owner
  word). Primary checkout left on the merged #959 branch (never switch the primary); worktrees
  mcp-673-consolidation and mcp-673-true-ups pruned at close. Linear MCP-673 → Done at the last
  merge.
- **The second seat's additions.** #961 carries the eight factual true-ups, four Copilot rounds
  dispositioned (tally rows 7/5, 3/3, 7/3, 6/4 raised/cure-worthy), and the closer: plain-id
  pointers at ADR-227 on `public-packages-release`, `toolkit-publish-mechanism` and the
  extraction plan's decision-log opening (the ADR is the home; the log and this record are the
  contemporaneous captures), the second-seat Cricket tally, this entry, the handoff record and
  both seats' formation letters; `origin/main` at ec7cb3fa8 merged in as c0e0aac35, the
  publish node's frontmatter conflict resolved as the union (the gate row discharged,
  `last_updated` today). Follow-ups without a carrier until a lane takes them: the publish
  node's P4 proof row for its runbook leg (MCP-661 comment R4-1, beside R3-1 and R3-2); the
  strategy index naming `innovation-kit` by id (a pre-existing PDR-105 defect); two seat-state
  gaps for the consolidation pass — a named PAUSED state for the liveness rule's owner-input
  clause (claim held, watchers down at owner word, resume only on owner word) and a
  work-shape trigger for `start-right-team` §6's self-dissolution test (when the remaining work
  serialises onto one seat, the other proposes its own dissolution before the owner has to).
  Instruments: the commit-queue ceremony and merge-bot push run cleanly from a linked worktree
  with the registry at the primary; `gh api --jq` takes no `--arg` (bind inside jq with
  `. as $x`); an installation token answers 403 on `/user` and 401 on `/app`, neither an
  identity failure; `git merge-tree --write-tree` predicted the one conflict two hours before
  the merge. Claim 01e418de is handed to the lead by record-plus-adoption (PDR-063 §Deliberate
  succession; record at `.agent/state/collaboration/handoffs/`, name prefixed `01e418de-`);
  worktree `mcp-673-adr` pruned by the second seat (its one commit rode #959 as 753cdf455).

## 2026-09-03 ~13:0xZ — WRAP PR after the close (Chinook seeks Cloud, 661556, solo): the consolidation's carrier, at the owner's card word

- **The instance, recorded plainly.** The owner said three times that #961 was the last pull
  request and that anything bound for the remote must ride it. The lead launched the wrap
  workflow while #961 was open and then merged #961 at green (c616a354c, 12:39Z) before the
  workflow returned, so its consolidation had no carrier. The owner's correction ("how do you
  expect the workflow results to persist?") and his card word ("One docs-only wrap PR") produced
  this pull request. The generator: merge-at-green applied as a default without checking that
  every pending output had a carrier; the cure at the boundary: before merging a PR the owner has
  named as the last, enumerate every in-flight output that needs the remote and hold the merge
  until each has ridden or been explicitly released.
- **What this pull request carries.** The wrap workflow's consolidation entry on the napkin
  (eight surface readers, three verification lenses per candidate, a free-play harvest and a
  concept exploration on gate classification); the item-14 closure residue as a repo report
  (`.agent/reports/design/item-14-closure-residue-2026-09-03.md`: the enumerated frozen sets,
  evidence anchors, the check's mechanism, and the five open points) with a pointer from the
  design plan's W0.2(b); this entry. Nothing else. Merged as the bot under pr-lifecycle §5 with
  no owner action.
- **Attribution corrected at the wrap.** GitHub records #959 as merged by jimCresswell at
  12:16:23Z after his APPROVED review; the lead's REST merge call at the same moment returned
  `merged: true` with the same sha (ec7cb3fa8), so the earlier entries' "REST as the bot" for #959
  is an inference the API refutes — the owner merged #959 by hand. #962 (b3c9742f8) and #961
  (c616a354c) are recorded by GitHub as merged by the bot app.
- **State at this entry.** Linear MCP-673 Done; claims 01e418de and ed9ec042 closed, a new claim
  for this pull request's files open until its merge; worktrees `mcp-673-consolidation` and
  `mcp-673-true-ups` pruned; `mcp-673-wrap` (this branch) pruned at its merge; the primary
  checkout still on the merged #959 branch; the local branch
  `jimcresswell/mcp-673-adr-oak-product-extraction` left in place (a peer's surface; the owner
  refused its removal by the lead).

## 2026-09-03 ~15:xxZ — OWNER RULINGS LANDED FROM A SOLO SEAT (Flounder turns Estuary, c5cc2c, implementer)

- **Two owner rulings, verbatim where the words are his.** (1) The merge-bot identity file
  is per-checkout: "this is per-checkout config, it should not be in version control" —
  `.github/merge-bot.json` leaves version control, `.github/merge-bot.json.example` is the
  tracked template, and the tools read the file at the clone's primary checkout so every
  linked worktree shares one copy (lane `chore/merge-bot-config-per-checkout`, two commits;
  the first bot push from the worktree proved the topic dispatcher's explicit root had
  short-circuited the resolution, and the second commit separates the two roots). (2) "green
  and clean PRs get merged, they don't wait on me unless I explicitly say so, somewhere the
  wrong behaviour is recorded" — the pr-lifecycle skill's self-authored-PR grant clause was
  that record; cured in this seat's landing branch with the ruling quoted at the site.
- **Lane state.** The config lane is at review; its code-expert review did not run (three
  API-overload deaths in twenty minutes across two model tiers) and is the next act before
  its merge. The seat's other operations are checkout-local and live in its per-user memory
  and the machine-local handoff record, not in tracked surfaces, by the same per-checkout
  principle the first ruling states.
- **Correction recorded on the napkin (this date):** the seat ran three owner asks before
  grounding; cured mid-session at the owner's word.

## 2026-09-03 ~19:xxZ — A STRATEGIC NODE SKETCHED, A REVIEW LOOP STOPPED (Flounder turns Estuary, c5cc2c, implementer)

- **Owner direction, verbatim:** "making the repo more readily usable by other orgs, so
  accidentally pinned Oak specific config should be replaced with non-pinned config, and
  example files"; "I think we need a new strategic node for this". Sketched as
  `organisational-identity-below-the-tree` (serves FRAME-2) with the owner-named first slice
  `code-quality-binding-per-checkout`, both born sketch, PR #51; the node presents six owner
  decisions rather than absorbing them, among them the adapter prefix's home, which subsumes
  the pending `oak-` to `e-` ask. Grounded by a parallax inquiry run as a workflow.
- **Owner correction by skill invocation** (`/oak-pr-lifecycle /oak-proportionality
  /oak-metacognition`): the census report PR #50 had run eleven cure rounds; the lifecycle
  skill's PDR-140 reading (disposition-and-route by default, one settlement push, step back at
  four rounds) binds and was breached by this seat; a step-back is posted on the PR and the
  lesson is on the napkin and in the seat's memory.
- **Lane state after the second compaction boundary (trued at this landing's round one).**
  PR #50 (the census report): the support seat's by claim 691d26b3 — merged into `engraph` as
  81ca79913 by the bot at 19:56Z after the two Codex dispositions; harvest and prune its own.
  PR #51 (the strategic node and its first slice): the round-one cures and the last
  acceptance-criteria edit landed as one settlement commit a7750418c with the `engraph` sync
  merged in; next, reply to and resolve the fourteen threads citing it, merge at green as the
  bot. PR #52 (this landing): six round-one threads,
  all correct, cured in one push (the support seat's model id, the pointer at the head of
  this record, the repo-continuity estate row, the napkin's overflow marker, this bullet);
  round two's two truings land in one further push; then reply to and resolve its threads,
  merge at green as the bot, harvest, prune worktree `continuity-flounder-2` and its branches. The seven pre-estate PRs #38–#44 (re-homed
  from upstream on 2026-09-02, none merged there) are evaluated first-hand by the lead and the
  verdicts carded to the owner before any close; the merge-track ones become owned lanes. The
  four tracked files the Sonar CLI's login step had rewritten on the primary checkout (the
  two sonar-secrets hook scripts, their hook lines in the harness settings, the SonarLint
  block in the IDE settings) were restored from HEAD at the owner's word ("discard the
  overwrite"); the lesson, that a vendor CLI's integrate step overwrites tracked estate
  customisations in place, is a second kind of pin for the strategic node's residue list.
  The merge mechanics every lane uses are the pr-lifecycle skill's and the merge-bot doc's;
  the lead's machine-local handoff record adds nothing a pickup needs beyond this bullet.

## 2026-09-08 ~03:2xZ — DIRECTOR TENURE JOURNAL, 2026-09-06 12:5xZ → 2026-09-08 (Flounder turns Estuary, c5cc2c, Director): two folds, sixteen landings, the tracked pickup for a successor on any checkout

Written because this journal ended at 2026-09-03 while the Director's fine-grained map lived on a
machine-local handoff record (the handoffs directory is untracked by design). A successor on
another checkout rehydrates from the tree alone with this entry plus the surfaces it names —
this entry as the tenure JOURNAL (dated 03:2xZ; its board is the state at that hour and is not
refreshed) and, for the CURRENT board, the live snapshot in `director-handoff.md` under
"Current handoff state", replaced in place at each fold (at the 2026-09-08 23:2xZ fold: Altair
spins Umbra live on #95, the day's landings through #89, #94 and #95 in flight). Where the two
disagree, the live snapshot is current and this entry is history.

- **Seat and chain.** Flounder turns Estuary (c5cc2c) took the Director seat 2026-09-06 12:5xZ
  (claim `8109015d`, retained across six compaction boundaries). Seats in the window: Finch binds
  Sundog (47f9d2), Jackal wakes Nocturne (3484b6), Cricket weaves Burrow (f8f302) — retired on
  2026-09-07 with full handoffs; Juno seeks Apogee (a693fb) — the dedicated consolidation seat,
  cold-paused and resumed at the owner's word, closing 2026-09-08 after #80; Altair spins Umbra
  (05a180) — a fresh implementer 2026-09-07 20:37Z, retired by silence 2026-09-08 (last
  heartbeat 00:39Z; retirement-detection event on the stream).
- **Folds.** `coordination/2026-09-06-f1a142` → `engraph` via #69 as `dfe924927` (2026-09-07
  01:32Z); `coordination/2026-09-07-dfe924` → `engraph` via #79 as `68d53d778` (2026-09-08
  01:00Z); the live coordination branch is `coordination/2026-09-08-68d53d`; the next fold is
  due at the 2026-09-09 UTC rollover. The napkin was rotated on `engraph` by #74 (archive
  `napkin-2026-09-07.md`); folds meet a rotated napkin with the semantic-merge skill's
  archive-coverage check, never a time-ordered union.
- **Landings, 2026-09-07 → 08, all by the bot at green, clean and sensible:** #58, #69, #68,
  #66 (the tuition collection, its reviews and `AUTHORITY.md`), #73 (the owner's upstream sync,
  1.178.5), #67, #71, #75, #74, #76 (the consolidation drain and the skills follow-on), #72
  and #70 (the owner's research pair: the graph foundations pack and the non-graph survey —
  two tiers of one atoms inquiry; every direction a proposal), #78, #77 (PDR-140 Decision
  clause 9, the records-class ratchet), #79, #81. `engraph` at this entry: `3fdf51d0c` with
  #80 (the director-handoff.md disposition) landing behind it.
- **Standing rulings of the window and their homes.** "No prs are blocked on me, green and clean
  and sensible, those are the requirements" (owner 2026-09-07) — pr-lifecycle §Phase 7. The
  commit queue serialises the shared primary only; the host bound is two, at most three,
  simultaneous full local gates (owner 2026-09-07 12:24Z) — the commit skill. The landing-slot
  contract (one non-draft PR syncs and merges at a time; the slot to whichever is green first;
  the fold takes it at the rollover) — the pr-lifecycle skill §Phase 7 (re-homed there by
  PR #87 on 2026-09-08, which retired `pr-target-is-engraph`). Settled
  directions are proposals (owner 2026-09-07 13:2xZ) — the tuition collection's `AUTHORITY.md`.
  Questions route to the Director as their own event with the question in the subject, never
  in prose (owner 2026-09-07). The Engraph fork never reads the Oak repository without
  permission and never writes to it, Linear or any Oak surface (owner 2026-09-06) —
  `downstream-checkout-never-writes-upstream-surfaces` (the general rule PR #87 landed on
  2026-09-08 in place of `pr-target-is-engraph`). A PDR amendment gets the Director's
  first-hand read before merge; a
  cure that changes no clause's meaning lands without a re-read.
- **Guiding plans.** The estate's current structural commitment is the MCP app's extraction on
  the Oak line (ADR-227; the plan estate's index is the entry point). On this fork the live
  work is the consolidation and continuity programme Juno carried (`platform-memory-
  consolidation.plan.md` and the records under `.agent/memory/operational/`), the owner's
  research imports under `.agent/research/`, and the tuition review node
  (`public-service-ai-tuition-review.plan.md`, sketch, one owner gate to 2026-09-27).
- **Open at this entry, with owners.** The directives item (principles.md and
  testing-strategy.md fitness criticals under the 30-percent context gate; bounds: principles.md
  restructures only per its own split_strategy, elaborated guidance to governance docs and the
  principles verbatim; testing-strategy recipes to the two engineering pages; one PR per
  directive, the Director reads each) — UNOWNED, for the next fresh seat. The two thread-record
  criticals (agentic-engineering-enhancements; paused/mcp-submission-drive) — measured by Juno,
  for a fresh seat. Owner-only items re-derive at their action moments, never queued: the
  scanning ratification; the chapter-13 programme node gate (2026-09-27); the retrospective
  offer on the PR 66 records tail; the expired plan gate on
  `external-skills-library-review-framework`.
- **Rehydration surfaces for any checkout.** This entry; `director-handoff.md` (the Brief; the
  §FOLD LANDED block; after #80 the §LIVE SNAPSHOT and the dated archive of prior state);
  `repo-continuity.md`; the napkin and `archive/napkin-2026-09-07.md`; the comms stream. The
  Director's machine-local handoff record (`2778f573-…`) holds the finer grain and is not
  required for pickup.

## 2026-09-09 00:52Z — FOLD OF coordination/2026-09-08-68d53d (Flounder turns Estuary, c5cc2c, Director): PR #84 merged as SHA:f5d02c38a; successor coordination/2026-09-09-f5d02c

- **The fold.** PR #84, opened as a draft by the lane seat at the owner's word of 2026-09-08
  11:07Z and undrafted by the owner at 21:13Z, merged as `SHA:f5d02c38a` after seven review rounds
  (8, 4, 1, 1, 2, 2, 1 findings; nineteen cured, two routed): the retired rule's citations
  repointed in the two pickup surfaces, the settings-file sentences and the tenure count trued,
  the napkin's fitness marker added, the two onboarding surfaces told that this fork's settings
  activate no plugin, the babysitter recipe corrected, the coordination-fold skill's hold
  reduced to its rule, the live snapshot replaced in place as the class fix, and the pickup map
  named as the tracked snapshot. The successor `coordination/2026-09-09-f5d02c` was cut from
  post-fold `engraph` by the coordination tool; the wrap-24 napkin block sweeps on it.
- **The day.** Landed on `engraph` 2026-09-08 by the bot: #83, #85, #87, #88 (the lane seat's
  train), #86 (the owner's merge), #93, #91, #89 (the Director's). In flight at the fold: #94
  (the owner's Work-cloud routing practice, five rounds, terminal) and #95 (the lane seat's
  twelve-rulings records PR, eight rounds, terminal), in that order. The owner's tomorrow: #92's
  two clauses, #90, the #94 read's structural notes.
- **Lessons homed.** Any tool call can hold a seat at an unseen prompt (twice on one seat, once
  on the Director's at a nested command substitution) — the cure is the Director's
  deadline-and-default and one plain call at a time; the geometric review tail on prose PRs
  ends only by a class fix that states the invariant and demotes cases to fixtures (four PRs
  tonight); stamp records from the clock, never from the feel of elapsed time.

## 2026-09-09 15:0xZ — FULL HANDOFF of the Director seat (Flounder turns Estuary, c5cc2c → Nettle guards Pistil, 2de368, owner-named): the day of the first upstream integration and the held-seat cure

- **The day.** #90 (upstream 1.178.6) landed on the owner's word after the merge of `engraph`,
  the regenerated content workspace and a premise sweep of the fork's plans and records —
  the founding run of the `cross-fork-integration` skill, drafted the same morning at the
  owner's word (#97, three review rounds, the four-round arm, terminal). #98 landed by the
  Director's recorded deadline-and-default while its lane seat was held at a permission prompt
  for four hours; the owner's screenshot of that prompt became the held-seat fix (#100: no
  `ask` rules in the tracked settings, the Bash guard denies `rm -rf`, a rule). The owner
  ruled eight cards; #92's last clauses were applied (keep both, sorted by question); the
  external-skills framework stayed archived after a stale card exposed that owner-facing state
  must be computed against the default tip. The sync maintainer's next carrier arrived as #99.
- **The handoff.** Seven PRs open, every one with a landing path in the live snapshot
  (director-handoff.md §LIVE SNAPSHOT, replaced in place at this handoff); the claim
  `8109015d` carries a handoff pointer to the machine-local record and is adopted by the
  successor; Altair spins Umbra holds #101 and #102; the coordination branch
  `coordination/2026-09-09-f5d02c` (draft #96) folds at the 00:07Z wake.
- **Lessons homed.** A seat cannot see its own hold, so the cure has two halves that both hold:
  remove the block points (asks become denies) and let a second party with a clock supply the
  observation (the deadline-and-default). Five corrections of one shape in one day — act only
  on a state recomputed against its source by the check that costs nothing (`date -u`,
  `origin/engraph`, a predicate walked with one input, the rule's text, the lens over the
  card). A new rule is five files and the portability validator is the check. Integration is
  a semantic event, and a re-truing narrows to the claim refuted, never wider.

## 2026-09-09 17:16Z — FOLD OF coordination/2026-09-09-f5d02c (Nettle guards Pistil, 2de368, Director): PR #96 merged as SHA:31e3711c8; successor coordination/2026-09-09-31e371

- **The fold.** Run in the branch's landing slot after #97 and #92, ahead of the 00:07Z
  rollover wake, because the owner undrafted #96 for the count to zero. Five review rounds
  (6, 1, 3, 3, 3): the step-back arm fired at round four on one generator — the live snapshot
  narrating open pull requests and their next actions, which went stale under every landing
  during the fold itself — and the class fix made the snapshot record landings and lanes only,
  with the board computed live from the repository service; the same push put the seat's
  standing processes and their arming commands on the tracked brief, and round five trued
  those commands to the liveness and watcher rules (the two-leg heartbeat, the peer-liveness
  delta poll, the worktree-literal watcher arm). Merged as the bot at green, clean and
  sensible with the head pinned; premises comment 5605873882.
- **The successor.** `coordination/2026-09-09-31e371`, cut tree-preservingly from post-fold
  `engraph` at SHA:31e3711c8 by the coordination tool, published as the bot with a draft PR at
  first push; this seat's first wrap block rode across dirty and sweeps in its first commit.
- **Seat and chain.** Nettle guards Pistil (2de368) holds the Director seat since the
  PDR-064 Moment 2 of 15:11:49Z (from Flounder turns Estuary, c5cc2c); claim 8109015d adopted.
  Lanes at the cut: #100 (the Director's, next in the slot), #99, #101, #102 (Altair spins
  Umbra, 05a180), #103 (a Codex seat's research import at the owner's request, unregistered
  on the stream). Landed by this seat today: #97, #92, #96.

## 2026-09-10 02:0xZ — FOLD OF coordination/2026-09-09-31e371 (Nettle guards Pistil, 2de368, Director): PR #104 merged as SHA:2d17c6e46; successor coordination/2026-09-10-2d17c6

- **The fold.** Run in the branch's landing slot after #101, with the branch DUE under the
  24-hour rule since the 00:00Z rollover (the slot was serial: #102 and #101 held it across
  the rollover). The sync of `engraph` at SHA:3712eefb4 made once at the slot word as
  SHA:55736f697, its tree equal to the merge-tree preview. Three review rounds (2, 1, 1): the
  stale lane map on the live snapshot and a backwards merge-tree diagnosis on the napkin
  cured in the settlement push; the snapshot's tense (its own fold named as landed) through
  the one 9(b) door; the bare-SHA sweep routed to the successor's first commit and resolved
  on that route. Merged through the merge-bot front door (`--expect chatgpt-codex-connector`,
  the reviewer that bound the tip; the liveness leg reported the null-field defect #109
  cures) as SHA:2d17c6e46; premises comment 5611512457.
- **The successor.** `coordination/2026-09-10-2d17c6`, cut tree-preservingly from post-fold
  `engraph` at SHA:2d17c6e46 by the coordination tool, published as the bot; its first commit
  carries this entry, the handoff's fold block and the SHA-prefix sweep; the draft PR opens
  with it.
- **The window between the cuts (17:16Z → 02:0xZ).** The owner's word at 19:2xZ: "I want ALL
  PRs merged, including those currently in draft." Seven landings, each in the slot under the
  landing-slot contract with the yielding rule (a slot-holder that cannot land inside the
  quiet window yields to the next PR ready at the tip; ran on #105 and #100): #99 (upstream
  1.179.0, Altair), #107, #105, #106 (the curator Vanilla lifts Nectar, e1dced, three records
  PRs from one consolidation), #102 and #101 (Altair), this fold. The merge-bot front door
  (`merge-bot merge --pr <n> --expect <reviewer>`) is the sanctioned merge from #106 on. The
  compaction at 19:1xZ killed every session process; the seat re-armed from the brief.
- **Seat and chain.** Nettle guards Pistil (2de368) holds the Director seat; claim 8109015d.
  Lanes at the cut: #103 (the Director, next in the slot; the import README's recorded owner
  authority for the private-origin exports is flagged on the premises), #108 and #110 (Altair,
  cures held for the slot word), #109 (Vanilla, the front door's liveness-leg fix) and the
  drain PR from this tip, #100 (the Director; the two blanket deny lines are an owner edit the
  classifier refuses to the seat — held since 19:2xZ). Owner items held: the upstream report
  on three routed #99 threads; the App's Actions write permission; the refused fold-wake
  cron; the repeating gate alert; the #100 edit; the #103 exports flag; a test-file rename.

## 2026-09-10 11:2xZ — THE TEAM'S CLOSEOUT (Nettle guards Pistil, 2de368, Director): every task passed to the Director, analysed and organised at the owner's word

Owner word (2026-09-10 11:1xZ, verbatim): "the rest of the team is closing out, they are passing
you tasks, you do not necessarily have to pick them up, but do analyse and organise them please
… this is not session end". Seats closed at the owner's word in their own sessions: Vanilla
lifts Nectar (e1dced; #117 and #113 landed; #118 handed over; claim closed), Efreet guards
Patina (ade27f; the directives tier review delivered read-only; no claim ever). Altair spins
Umbra (05a180) still live on #116 at this writing. The board is computed live, never from this
record; this section records DISPOSITIONS and HOMES, per `follow-up-registers-need-disposition`
and `owner-items-are-rederived-never-carried`.

### A. The Director lands these itself (nothing blocks; no fresh context needed)

1. **#118** — the review-legs ruling records PR (docs-only, bot-authored), READY at
   SHA:2a6f85332 on the tip SHA:94377dac5; legs: the docs-adr-expert review posted
   (5617471721) and Copilot's round dispositioned; terminal for fix pushes. Recipe: Vanilla's
   handoff event 219e2b18 (sync only if the tip moved; Copilot POST on the verdict tip as the
   bot; front door `--expect copilot-pull-request-reviewer`; the worktree `records-e1dced`
   stays at the head for the landing and is removed under the grant after the ancestry proof).
   ORDER: AFTER #116 — under a per-tip Copilot leg and a require-up-to-date ruleset, landing
   anything while the slot holder waits for its bind flips the holder BEHIND, voids its leg,
   and costs a sync push plus a fresh request: a livelock shape. The holder is never flipped.
2. **#112** — this coordination branch's fold at the 2026-09-11 UTC rollover by the
   coordination-fold ceremony (assert `.git/MERGE_HEAD` before any resolution commit; the
   rotated napkin recipe if the tip rotates it again). No fold wake exists (the classifier
   refused the one-shot cron); the Director folds by hand.

### B. Lanes that wait for a word or a fresh seat (not picked up now)

3. **The upstream-sync producer** (the owner's added task 09:0xZ): proposals P1–P5 in
   `.agent/research/upstream-sync-automation-concept-exploration-2026-09-10.md`. Blocked on
   the owner's two below-the-tree decisions (C.9). Then one code lane: the workflow on
   `engraph`, a dispatch proof before the schedule, the cross-fork skill's step 1 re-trued.
4. **The upstream carrier** — executed on 2026-09-10 as the sync of fork `main` at
   SHA:216e64c15 (release 1.181.1; 33 non-merge upstream commits, 49 with merges, over four
   releases, not the twelve of the 1.179.1 reading) into `engraph` by the cross-fork skill in the lane worktree
   `sync-2de368`: the merge, the regenerated content-audit inventory and model-behaviour
   workspace, the ADR-229 collision (the fork's foundations record is ADR-230), and the
   premise sweep recorded on the carrier. Nothing waits here.
5. **Directives tier, step 1 of five** (Efreet's order, smallest first): the cheap defects in
   one PR with no doctrine change — the eight citations, the dead template path, the stale
   header, the dangling pattern name, orientation l.24 and l.29, fitness frontmatter on four
   files, AGENT.md's metacognition trigger line. A FRESH seat under the
   `directive-file-context-budget` rule (<30% context at the edit); line numbers re-verified
   against the live tip (they were read at SHA:064f42093). Read of the lane's opening: Efreet's
   read-only ruling was that seat's; the owner's "pass the lane to the Director" opens step 1
   for scheduling; steps 2–5 wait on the owner's decisions in C.8. Findings conserved verbatim:
   `.agent/research/directives-tier-review-2026-09-10-efreet-findings.md`.
6. **Altair's follow-ups from #116** (pointers, not specs; Altair's record names them): the
   policy migration onto `match: 'argv'` entry by entry, each pricing its false positives (an
   `rm -rf` entry also blocks `pnpm rm -r --force <pkg>`; the wrapper-operand shape
   `xargs -a git rm -rf`); the table-drift net (an on-demand script diffing `git help <cmd>`
   against the argv tables). Home: the hook-policy work's plan node (Altair's record and #116's
   body name it); no lane until a seat is allocated (the matcher landed at SHA:002860f46).
   Altair's two candidates ride the same home: a timing-growth probe as a repo instrument
   beside the matcher (two sizes and a ratio, never an absolute — a fast machine hides a
   quadratic), and "the landing mechanic" as a named class in pr-lifecycle's merge boundary
   (one vendor request on the verdict tip; its findings replies-only).
7. **#100** — the Director's no-prompts fix at its second step-back; the split cure is in the
   worktree `no-prompts` and the scratchpad; the two blanket deny lines are the OWNER's edit
   (C.10). Nothing moves until then.

### C. The owner's decisions (routed as questions, never decided here)

8. **Directives placement** (from Efreet): whether `cloud-environment-routing` and
   `editorial-tone` move to the rules tier under situational triggers; whether
   `validation-strategy` is a stub, a directive, or a decision record; and the queued
   principles.md fitness decision that gates its stance/contract separation (graduation
   downward, never trimming).
9. **Upstream sync**: the bot app's private key into the fork's Actions secrets (custody: the
   key lives only on the owner's machine today) and the `UPSTREAM_SYNC_ENABLED` variable; and
   retiring the Codex OCE task as producer once the workflow runs (two producers = the
   duplicate-carrier defect).
10. **#100**: the two blanket deny lines `Bash(git reset:*)` and `Bash(git revert:*)` replacing
    the nine targeted entries — the classifier refused the seat three times; or the word "sed it".
11. **A retrospective on the merge train's arc** (Vanilla's offer at 07:1xZ and 11:1xZ; the
    Director concurs): nineteen landings in one Director tenure, the review-tail lessons, the
    ruling's first proofs. Routed, never auto-run.
12. Held owner items from the record, unchanged: (a) the upstream report of three routed #99
    findings (the fork never writes upstream); (b) the App cannot re-run workflow jobs; (c) the
    fold-wake cron refused by the classifier; (d) the external-skills-library gate alert
    repeats; (f) #103's private-origin exports on the recorded authority; (g) the
    `state-gh.unit.test.ts` rename.

### D. Signals, closed here with a named home (no lane)

13. The SHARED ESLint ignore `**/tsup.config.*` hides hand-written tsup config modules from
    lint (the #117 config-expert finding): a row on the quality-gate-ledger node; a
    config-expert-reviewed PR at the generator when a seat is there.
14. The front door verifies only the declared vendor legs (`computeReviewerLegs` reads the
    `--expect` logins; an empty set is refused): the subagent leg is the seat's recomputation on
    the premises, invisible to the tool. #118 names the predicate beside the rule; the
    machine-checked subagent-leg input is a watch-commands node row for slice 1's owner.
15. A subagent review leg on the SAME model as the author is weaker decorrelation than a second
    vendor (Efreet's own caveat about five lenses on one model applies to every adversarial leg
    this window). The ruling stands — the leg counts — and its weight is a fact for the promise
    column, not a reason to wait.

### E. Closed this window

The Codex leg question (the owner's ruling and #118); the tsup transient-lint flake for the two
self-bootstrap configs (#117); the review-run liveness leg (#113); the crossed-push lesson and
the pathspec-of-untracked lesson (napkin WRAP 8).

### F. The worktree safety sweep (owner word 2026-09-10 11:5xZ: "No work is considered safe until it has been committed and pushed and is in a PR, draft PRs are acceptable. Please scan all worktrees")

Forty-one worktrees scanned (`git worktree list --porcelain`; per worktree: dirty files, the
remote branch, exclusive commits against `origin/engraph` tested by `git cherry` for patch
equivalence, the pull request by head branch). Thirty-one were safe (clean, every commit on the
tip, or an open pull request already). Ten were unsafe; the procedure is now the runbook node
`worktree-safety-sweep` (sketch). Outcomes, each as a draft unless named otherwise:

| Worktree | Branch | Held | Outcome |
| --- | --- | --- | --- |
| no-prompts | fix/unattended-seats-never-prompt-2026-09-09 | the #100 split cure, uncommitted | committed SHA:d08ab1af8, pushed to #100 |
| pr-943-engraph | chore/continuity-kiln-2026-09-02 | four kiln-session records of 2026-09-02, staged | SHA:f9d423bdc; draft #124 (two bare URLs wrapped for MD034) |
| design-plan-truings | jimcresswell/design-plan-ratification-and-truings | one report of 2026-08-05, staged | SHA:4e030a535; draft #119 |
| fix-pnpm-path | jimcresswell/jim-next-2026-08-04 | one commit, the jim-next return map | pushed; draft #120 |
| pr-888-cure | docs/windows-via-wsl | four README commits, Windows via WSL | pushed; draft #121 |
| w01-census | jimcresswell/design-w01-census | one commit, the W0.1 census artefacts | pushed; draft #122 |
| pr-891-macos-validation | claude/objective-nightingale-b4ba25 | fifteen windows-support commits + an untracked runner | SHA:5dd76c612; draft #123 |
| mcp-567-vendor-symlinks | jimcresswell/mcp-567-vendor-skill-symlinks | one modified integration test (MCP-567) | REFUSED by the pre-commit gate: six of its cases fail on that tree; patch conserved |
| vitest-config-workspace | jimcresswell/vitest-config-workspace | two staged eslint config changes | REFUSED by the pre-commit gate: the relative-packages error fires in three workspaces; patch conserved |
| mcp-487-sanitise | jimcresswell/mcp-487-sanitise-numeric-input | one commit (MCP-487), local only | REFUSED by the pre-push validators (the MCP content-source validator fails on that August tree); format-patch conserved |

The three refusals are NOT safe by the owner's definition. Their diffs are conserved as patch
files beside the Director's seat record (`instruments-2de368/refused-*.patch`, machine-local) —
recoverable, not yet on the remote. The bypass (`--no-verify`) needs fresh owner authorisation
(`no-verify-requires-fresh-authorisation`); the alternative safe home is a fresh branch off the
tip carrying the same diff as a commit whose gate can pass (the MCP-567 test needs the current
adapter code; the eslint change needs its three workspaces' cures; the MCP-487 change needs
re-basing onto the current sdk-codegen surface) — each a small lane, not a sweep step. The
owner's word decides which.

Every draft opened by the sweep carries a body naming what it holds and the disposition to
decide at pickup (land, semantic merge, or close with the landing named); none is a request to
merge as it stands. The board after the sweep: #100, #112, #118 (the Director's landing in
flight), and the six drafts #119–#124.

### G. The owner's rulings on the three refused items, and the worktree removal (2026-09-10 12:5xZ–13:2xZ)

Owner words (verbatim): "567 we can drop"; "the eslint enhancement we should land"; "487 sounds
like it should merge, but only with ironclad local proof that it does not break the relevant MCP
operations"; "Once all work is safe, remove all of the worktrees except the primary checkout";
"on the auto sync with the upstream, we need two. One to automatically sync the upstream main to
our fork main, and one to create PRs from our main to our engraph."

- MCP-567: dropped; its patch discarded with the worktree; the test file restored to its tree's
  HEAD before removal.
- The eslint enhancement: lane `fix/eslint-tsup-ignore-relative-packages-2026-09-10` cut from
  the tip (SHA:2bc77f840), the patch applied clean, the full pre-commit gate green (the six
  relative imports the August tree flagged already import the workspace-config package on the
  tip), draft **#125**; config-expert leg APPROVE WITH FINDINGS (five: two cured in the
  follow-on push, three routed to `workspace-config-isolation.plan.md` §Review dispositions).
- MCP-487: lane `fix/mcp-487-string-encoded-numbers-2026-09-10` from the tip; the August commit
  applied with `git am -3` (two content-audit surfaces taken from the tip by `git show`, never
  a destructive checkout); the generator's output equals the patch's generated files
  (`pnpm sdk-codegen` left a clean tree); proof recorded on draft **#126**: sdk-codegen 102
  files / 1064 tests, the nine-case unit test on the real generated schema, the served-boundary
  e2e with the stub executor (9/9), the MCP server's unit (1226) and e2e (140) suites, the served
  JSON schema unchanged (`number`, `maximum 300`), the content audit re-attested at the six new
  semantic hashes with the anchors refreshed and `validate-current-source: OK (728)`. Code-expert
  and security-expert legs dispatched; Copilot on the final tip; front door after.
- The upstream producer is TWO delivery nodes (sketch): `upstream-mirror-workflow` and
  `upstream-carrier-workflow`; the exploration record carries the ruling as an addendum;
  `mcp-487-string-encoded-numbers` is the third node (SHA:44c3166f0).
- Worktrees: thirty-nine removed under the owner's word by `git worktree remove` without force after
  each read clean (the two dirty ones restored to HEAD by writing tracked content first);
  registrations pruned. Three remain: the primary and the two live lanes, which go at their
  landings. The `.claude/worktrees/*` platform-managed set was included on the owner's explicit
  word of this day, which supersedes the July prune policy's exclusion for this instance.

### H. The two lanes landed (2026-09-10 12:5xZ–13:1xZ)

- **#125** LANDED SHA:26dbc8eaf — the eslint enhancement; config-expert leg (five findings: two
  cured in f80698062, three routed to `workspace-config-isolation.plan.md`); Copilot on the tip.
- **#126** LANDED SHA:f3a839a8f — MCP-487 with the owner's proof bar met: both adversarial legs
  (security-expert, code-expert) found the same real defect beneath their P1s — metadata chained
  outside the `z.preprocess` wrapper is dropped by the server's `io: 'input'` conversion, so the
  served `tools/list` had lost twelve authored examples while the August record denied it —
  cured in one class-fix push 224bbe822 with nine smaller cures; five findings routed to the plan
  node `mcp-487-string-encoded-numbers` §Review dispositions (the nine hand-written numeric
  params, spec-declared bounds, `.int()` for integer types, the e2e taxonomy, numeric enums);
  the sync 8ea154cfa; Copilot's one thread replied with first-hand facts and resolved.
- Twenty-three landings this tenure. Worktrees: the primary checkout alone. Open: #100, #112
  (fold at the rollover), the six safety drafts #119–#124.

### I. The safety drafts dispositioned first-hand (2026-09-10 13:2xZ–13:4xZ)

Each of the six drafts checked by PATH against the tip (`git cat-file -e`, `git cherry`), never
by name search — the lesson of #119:

- **#119** CLOSED as overtaken: the capability-floor report landed through #783 and was revised
  three times; the staged copy equals the first landed version. (The Director's first
  disposition said "land" from a name search that matched the citing files; corrected on the PR.)
- **#124** CLOSED as overtaken: all four kiln records reached the tip by the kiln session's own
  later commits (the letter's day-two text, the MCP-655 COMPLETE thread section, the continuity
  facts, the napkin block in the 2026-09-02 archive).
- **#122** (the W0.1 census artefacts, absent by path): synced, docs-adr-expert leg (one MAJOR —
  no status header on a plan whose gates were ruled and whose governing plan is archived —
  cured with a dated-historical-artefact block; renamed with the date suffix; the archived plan
  named; the design thread record points at both), Copilot on the tip, front door running.
- **#121** (the Windows-via-WSL README path, absent by path and word): synced, docs-adr-expert
  and onboarding-expert legs (the Go install fallback named the wrong module path — cured via
  CONTRIBUTING §5; the pnpm prerequisite asserted the corepack route the hooks cannot resolve —
  re-trued at its home for every platform; `gh` added; Windows readers routed from the top of
  Prerequisites; per-step checks; the Linux home; exported caps), three follow-ups routed to
  `cross-platform-research.plan.md` §Review dispositions, Copilot on the tip, front door running.
- **#120** (the owner's jim-next return map) and **#123** (the windows changeset: fifteen commits,
  146 files, no patch-equivalent on `engraph` or upstream `main`; a re-implementation lane, not a
  sync) hold for the owner's word, dispositions posted on each.

### J. The two docs drafts landed (2026-09-10 13:4xZ–14:1xZ)

- **#121** LANDED SHA:db87442d4 — the Windows-via-WSL README path, re-trued by the
  docs-adr-expert and onboarding-expert legs and two Copilot threads across three cure pushes
  (the Go install fallback's module path; the pnpm prerequisite at its home for every platform;
  `gh`; Windows readers routed from Prerequisites; per-step checks; the Linux home and exported
  caps; never re-point `PNPM_HOME`; Playwright browsers for the pre-push hook). Three follow-ups
  on `cross-platform-research.plan.md` §Review dispositions.
- **#122** LANDED SHA:190787e6f — the W0.1 census artefacts as dated historical reports
  (`w01-census-cycle-plan-v2-2026-08-19.md`, `w01-census-types-scaffold-2026-08-19.md`), the
  archived plan named, the design-system-integration thread record pointing at both with the
  provenance review note. Two further Copilot design findings on the preserved scaffold
  (`grantedAgainst` optional on every disposition; no ledger arm for the seven hardcoded
  rotation instances) are recorded here for any re-sanctioned cycle — replies-only on the PR.
- Twenty-five landings this tenure. The primary checkout is the only worktree. Open: #100 (the
  owner's two settings lines), #112 (fold at the rollover), #120 and #123 (owner decisions,
  dispositions posted on each).

## 2026-09-10 16:4xZ — HANDOVER: the Director seat passes to the same seat on a lower-powered model

- #127, the 1.181.1 upstream carrier, LANDED at SHA:96057d8e8 (second parent SHA:d2762651f;
  upstream tip SHA:216e64c15 an ancestor of `engraph`; `main` 0 ahead). Lane B.4 above is done.
- The pickup contract is the machine-local succession record
  `.agent/state/collaboration/handoffs/8109015d-nettle-guards-pistil-fable-to-lower-tier-succession-2026-09-10.md`
  (claim 8109015d's `handoff_record_path`): adopt the claim, recompute its safety table, sync and
  land #128 (this branch's docs tail), re-arm nothing at n=1, touch neither the windows lane
  (§COMPACTION BOUNDARY 4 of the seat record) nor any Oak surface.
- Owner-held after this handover: the windows lane's next step; the mirror workflow's variable;
  the carrier workflow's two secrets and variable, and retiring the Codex OCE task; one upstream
  report of six routed Copilot findings from #127; the directives-tier placement questions.

## 2026-09-11 09:2xZ — the owner's cards: the sync nodes ratified, their gates cleared, the upstream report drafted

- The owner ratified `upstream-mirror-workflow` and `upstream-carrier-workflow` by card ("Ratify
  both"); both nodes carry the stamp. Gates cleared the same hour: `UPSTREAM_MIRROR_ENABLED`,
  `UPSTREAM_CARRIER_ENABLED`, `UPSTREAM_CARRIER_APP_CLIENT_ID` and `UPSTREAM_CARRIER_APP_PRIVATE_KEY`
  are set on the fork through the owner's `gh` (the bot's scopes carry no variables or secrets
  permission). The workflow files are the next lane (the nodes pin their text); until they land
  nothing runs.
- `windows-basic` stays advisory until 2026-09-17 or later (owner card); the ruleset act is the
  owner's.
- The upstream report of the six routed #127 findings is drafted for the owner's review at
  `.agent/reports/upstream-sync/upstream-report-draft-1.181.1-sync-2026-09-11.md` (owner card:
  "Draft the report now, and write it to this checkout for my review"); sending it is the
  owner's act.
- 09:4xZ, the remaining cards: the Codex OCE task is already retired (the carrier workflow is the
  only producer once it lands); the fstat verification of the owner-only write is a small lane
  now, folding in the two dispositioned #128 findings (todos 1–3 marked landed; item 9 pending);
  the older held items (§C: directives-tier placement; #100's two deny lines) wait for a session
  with their context. The lower-powered seat's two lanes are on the succession record §Revision 4.
- 10:0xZ, owner word: native Windows is PROVEN in use — a developer on the estate works on Windows
  machines; the carrier node's value statement holds beyond the hosted runner. The high-powered
  Director seat stops; the lower-powered seat picks up Lanes A and B (succession record §Revision 4).

## 2026-09-11 13:5xZ — the seat continues on Opus 5: both succession lanes run

Model switch inside one continuous seat (PDR-027: the row's `model` changes, no row is added).
Claim 8109015d adopted at `claude-opus-5[1m]`; thorough grounding run; the safety table recomputed
clean before any edit.

- **#130 LANDED SHA:0d6a9769c** — the predecessor's records. Copilot reviewed the first tip (five
  findings, four cured, one routed) and never bound the second after two requests that both fired,
  so the front door settled `SETTLED-NO-REVIEW`. Landed under the owner's 2026-09-03 docs-only
  bot-authored exception with the class recomputed by name at the boundary. Codex reviewed both
  tips; its continuity-commit finding is dispositioned with the shape lesson on the seat record.
- **#131 LANDED SHA:ad64f3cd5** — `upstream-mirror.yml` and `upstream-carrier.yml`, from the
  nodes the owner ratified. THREE DEFECTS IN THE RATIFIED TEXT were cured at authoring time
  because the files did not run: a plain-scalar `run:` value carrying a colon-space in each node,
  so neither parsed, and `gh api --arg`, which is not a flag. Codex found the third independently.
  Both reviewers bound the final tip; seven threads dispositioned.
- **#132 OPEN** — the fstat verification of the owner-only write (the carrier node's todo 5) with
  the records fold. The handed `it.skipIf` shape was refused by `no-conditional-tests`; the four
  real-filesystem tests moved to an e2e suite instead, so the unit suite the Windows leg runs is
  identical on every host.
- **Both workflows read `state: active`** with no `gh workflow enable` needed — the mirror node's
  decision 10 answered for a workflow added to a fork after creation.

### Owner-held after this window

1. **DONE, and a correction.** An earlier draft of this record said the first workflow dispatch was
   an owner-only act, because the bot answered 403 `Resource not accessible by integration` on
   `POST .../dispatches`. That was WRONG and the owner caught it. The `el-graphael` installation
   holds `actions: write` (read from `GET /orgs/{org}/installations`); the 403 meant the merge-bot
   token-scope table requested no such permission, and that table's own header states that an
   ungranted permission fails the MINT with 422, so a 403 is always a wrong-scope symptom. A
   `workflow-dispatch` scope now exists (PR #132) and the BOT dispatched both workflows on
   2026-09-11: mirror run 34614449174 logged "In sync", carrier run 34614457898 logged "Nothing to
   carry", which are the two lines that had carried the YAML parse defects. Nothing here is
   owner-held. **The generator lesson: verify a capability against the GRANT, never against one
   token's refusal.**
2. **Four carried findings on the two sync workflows.** Each is real, none stops a workflow
   running, and each changes behaviour in text the owner ratified, so each is the owner's call.
   Recorded in full here rather than as labels, because the node rows for two of them ride on
   PR #132, which is HELD (item 6), and a finding must not be recoverable only from a held branch.
   Each shape below was verified read-only against the live fork on 2026-09-11.

   - **The carrier does not check the mirror against the parent** (Copilot, PR #131; the strongest
     of the four). *Scenario:* a commit that did not come from upstream reaches the fork's mirror
     branch. The carrier's only comparison is `{default}...{mirror}`, so that commit counts toward
     `mirror_ahead_by`, the carrier is cut at it, and the receipt calls it "upstream's snapshot" —
     a false statement in the artefact the integrating seat trusts. *Remedy:* compare the mirror
     with the parent BEFORE comparing it with the default branch, and fail unless the mirror is
     identical to or behind the parent (an older valid snapshot is acceptable). *Gate:* bounded
     today because the mirror workflow's only write is a `force=false` fast-forward to the parent's
     tip, so automation cannot create the condition, and the mirror workflow already fails loud
     when it exists. Reopen if anyone gains a direct push to the mirror branch.
   - **The mirror's comparison window** (Codex, PR #131). *Scenario:* the parent advances between
     the compare call and the `parent_tip` read; the stale `identical` means the fast-forward never
     fires and the mirror stays behind until the next slot — across a Friday slot, a weekend, since
     the schedule is Monday to Friday. *Remedy:* read `parent_tip` FIRST and compare against that
     immutable sha; the compare endpoint accepts a sha on the head side. *Gate:* latency only,
     never a wrong write; the next slot self-heals.
   - **The carrier's comparison window** (Codex, PR #131). *Scenario:* the mirror advances between
     the compare and the `mirror_tip` read, so the carrier is cut at the new tip while its receipt's
     merge base and exclusive counts describe the old one. *Remedy:* the same ordering swap — read
     `mirror_tip` first, compare `{default}...{mirror_tip}`. *Gate:* a stale receipt on a draft a
     seat reads before integrating, never a wrong merge.
   - **The duplicate guard reads one page** (Copilot on PR #131 and Codex on PR #130 — two
     reviewers independently). *Scenario:* more than one hundred open pull requests against the
     default branch hides an existing carrier, and a second one opens, against the node's promise
     of exactly one. *Remedy:* `--paginate --slurp` with the filter across the flattened pages;
     `--paginate` alone applies the `--jq` program per page and emits one result per page. *Gate:*
     unreachable on this fork, whose open count is a handful; reachable in the deployment context
     the node designs for, since the file is written to be inherited by the parent.
3. **The upstream report** at `.agent/reports/upstream-sync/` is still the owner's to send.
4. **`windows-basic` required** on or after 2026-09-17.
5. The older held items (§C: directives-tier placement; #100's two deny lines) still wait for a
   session with their context.
6. **PR #132 is HELD, not abandoned.** Its security change is complete and correct and its POSIX
   suites are green, but `windows-basic` fails on it, reproducibly and by design: the verification
   refuses when the descriptor does not read 0600, and Node on Windows reports every writable file
   as 0666, so the four tests that write through the real adapter ask for a guarantee NTFS cannot
   give. That is a permanent red rather than flakiness, so the advisory window is not a licence to
   land it. The owner's decision is where a real-filesystem proof of a library function lives when
   all four taxonomy categories exclude it; three candidate answers are on
   `native-windows-support-carrier.plan.md`, and the third — that the real-IO tests may be
   REDUNDANT rather than homeless, since the ordered-operations constant already proves at the seam
   what three of them assert — would be a deletion, which is not a lone seat's call.

## 2026-09-11 16:0xZ — COMPACTION BOUNDARY 6 (Nettle guards Pistil, 2de368, Director, Opus 5)

Owner word: reflect, prepare for compaction, run a Cricket suite without Fable members.

- **Cricket suite (6 dispatches).** The quartet's Fable member dropped at the owner's word; the
  other three roles ran both stances. `judgement-medium` normal ON-TRACK and adversarial ON-TRACK;
  `judgement-high` normal ON-TRACK, adversarial **DRIFTING**; `procedure-xhigh` normal ON-TRACK,
  adversarial **DRIFTING**. Non-unanimous, so it routes to the sitting Director, which is this seat.
  Cost: 6 dispatches, ~190k subagent tokens, 17s–125s each.
  - The `judgement-high` adversarial DRIFTING was the useful one and its redirection was ACTED ON
    before this entry: it said to verify that neither open pull request still carried a corrected
    error. One did — this record and the napkin both still asserted the bot could not dispatch a
    workflow. Both corrected; owner-held item 1 above now records the correction instead.
  - The `procedure-xhigh` adversarial DRIFTING was a frame-discipline complaint: "compaction
    records" was not cited by rule id in the prompt. The governing surfaces are
    `continuity-surface-commits-as-orphans`, ADR-150 and PDR-011, plus the owner's own instruction.
  - Consistent with the standing ruling that Cricket is a lens and not an authority: four legs
    passed the frame, and the one that changed behaviour did so by naming a specific unverified
    claim rather than by disagreeing about priority.

- **State.** #130 LANDED SHA:0d6a9769c; #131 LANDED SHA:ad64f3cd5; both workflows dispatched by the
  bot and green. #132 OPEN at SHA:97b54611b with the Windows red resolved by construction (5155
  tests, zero IO, no platform guard). #133 OPEN. Worktrees: primary and `fstat-2de368`.

- **Mechanical cures, and the one still outstanding.** The owner's correction at the boundary was
  that this seat "described mechanical fixes, but what you have implemented is prose". Of the
  window's three failures:
  1. *A handed `it.skipIf` that no gate would have refused* — CURED MECHANICALLY on #132.
     `@oaknational/no-conditional-tests` reports `skipIf`/`runIf` on `it`/`test`/`describe`,
     including chained forms, leaving `.each` over a literal dataset alone. Proven with a negative
     control: the probe file that passed lint at exit 0 now fails at exit 1 naming the rule, while
     `it.skip` was already caught by `vitest/no-disabled-tests`. The rule document now names its
     enforcement and says which clauses stay reviewer-enforced and why.
  2. *Tests performing filesystem IO* — CURED STRUCTURALLY on #132 for this module: `mkdir` joined
     the `OwnerOnlyWriteOps` seam, so no filesystem call on a retention path sits outside it and
     the tests cannot reach for one. Repo-wide the `@oaknational/no-real-io-in-tests` rule already
     enforces the prohibition; its `**/test-helpers/**` allowlist is the remaining escape hatch and
     is a repo-wide contract, not this lane's to narrow.
  3. *A capability asserted from a 403* — NOT YET CURED, and specified rather than hand-waved. The
     mechanism should be a `merge-bot grants` command that PRINTS the installation's actual granted
     permissions beside the scope table, so "what can the bot do" is read rather than inferred.
     Everything it needs exists: `signAppJwt`, `sendGithubRequest`, `readJsonBody` and
     `resolveInstallationId` in `agent-tools/src/merge-bot/mint-installation-token.ts` already call
     `GET /repos/{owner}/{repo}/installation`, whose response carries `permissions`;
     `INSTALLATION_SCHEMA` parses only `.id` today and needs that field added. It is NOT built,
     deliberately: it wants its own pull request with its own tests, not a fifth concern bolted onto
     #132 at the end of a long window. Until it exists, the standing practice is the memory line —
     verify a capability against the grant, never against one token's refusal.

- **The window's generator, for whoever reads this next.** Three owner corrections, one cause:
  reasoning forward from the nearest symptom or the handed text instead of reading what governs it.
  The full account is the napkin's COMPACTION BOUNDARY 6 block and the per-user memory
  `read-the-governing-document-before-naming-a-mechanism`. The short form: a handoff transmits
  INTENT with authority and MECHANISM without it; verify a capability against the grant, never
  against one token's refusal; and a prohibition is the premise a design obeys, never a need the
  design serves.
