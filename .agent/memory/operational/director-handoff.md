---
fitness_line_target: 200
fitness_line_limit: 320
fitness_char_limit: 20000
fitness_line_length: 115
fitness_line_length_rationale: >-
  Raised 100 → 115 (owner-authorised 2026-06-29) for this append-heavy
  narrative/continuity surface. Marginal prose-width drift on appended prose is
  chronic-cosmetic (99% of breaches were ≤120; median 104) and manual reflow is a
  transient non-cure on a file that grows by append each session; 115 clears the
  noise while still flagging genuine over-runs.
fitness_content_role: reference
overflow_disposition: 'the Director Brief stays; in CURRENT HANDOFF STATE, leave-if-live, else graduate, then archive to a dated file proven byte-identical — never before full processing (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative
---

# Director Handoff — Central Pick-Up Point

The single in-repo file an agent reads to **become the Director** of a
multi-session, multi-agent effort, and the one place the current Director
**hands off** from. It has two layers held apart by their change-rate:

- a durable **Director Brief** (sections below up to `CURRENT HANDOFF STATE`) —
  plan-agnostic, the operational instance of the role doctrine: how to take the
  seat, the readiness gate, the standing lessons, the routing contract. It does
  not change between handoffs.
- a volatile **`CURRENT HANDOFF STATE`** section that the sitting Director
  refreshes at every handoff — who is live, what is open, what is owner-gated.

The role doctrine itself is
[PDR-117](../../practice-core/decision-records/PDR-117-director-and-implementer-roles.md);
this file is its operational entry point — read PDR-117 alongside, do not
duplicate it here. The **work** the Director directs lives in a guiding plan
(see _The work you direct_ below); this file carries the role, never the
work-TODO.

This file exists because succession kept relying on a scattered, half-uncommitted
rehydration path (a thread-specific plan seed plus a per-user memory plus a comms
snapshot). On 2026-06-25 a successor broadcast a Moment-2 acknowledgement,
immediately retracted it as "premature/erroneous", and stood down — the takeover
had nothing solid to land on. This file is that solid thing: the brief is what a
successor lands on; the readiness gate is what the failed takeover lacked.

## The work you direct

The Director directs a **guiding plan**, not this file. The current effort's plan
is named in `CURRENT HANDOFF STATE`. The strategic root is the
worktree-per-agent transition (move from one-dev-many-agents on a single shared
checkout to many-checkouts / variable-agent-density with an author-agnostic
substrate); the operating model under trial is the Director + ephemeral-Implementer
contract itself. The current effort's **adjudication obligation, if any** — for
example whether this arc's acceptance must test the operating model rather than
merely whether the lanes shipped — is stated in the guiding plan named in
`CURRENT HANDOFF STATE`, not here; this brief stays plan-agnostic so it sticks to
the seat, not to any one pilot.

## How to take the Director seat

1. **Read this brief end to end**, then PDR-117 (minimum-action; route, do not
   execute; single owner-interface; the Implementer→Director→owner routing
   contract) and the Standing Lessons below.
2. **Rehydrate the live state** from the `CURRENT HANDOFF STATE` section and the
   surfaces it names — the guiding plan (work detail), the comms stream (recent
   events), `active-claims.json`, `repo-continuity.md`, and the napkin's recent
   entries.
3. **Readiness gate — BEFORE you claim authority** (the gate the failed takeover
   lacked). The five questions below are the context you must be able to answer
   from rehydration, not assumption — but **answering them in prose is not the
   gate; the mechanical liveness check is.** You may only broadcast a Moment-2
   acknowledgement after BOTH (a) you can answer all five and (b) you have run the
   mechanical liveness check and pasted its output.
   - Who are the live implementers, what lane is each on, and which claims do
     they hold? (If the team is dissolved, who — if anyone — is operating, and
     under what direction?)
   - What open verdicts do you own, and what is each one's pre-merge / acceptance
     condition?
   - What is owner-gated versus team-doable right now?
   - What is the single next safe step?
   - **Is the outgoing Director actually standing down** — an explicit written
     stand-down (its pre-positioning event naming you, or its retirement event),
     or the owner's word? A stopped heartbeat is not one (PDR-117 §Takeover
     verification, amended 2026-09-17).

   **Mechanical liveness check (MANDATORY — paste its output before Moment-2).**
   Do NOT compute the outgoing Director's last-event age by hand and do NOT read
   any local clock. Run the tool and let it compute the age in UTC against a UTC
   `--now`:

   ```bash
   # The tool parses claimed_at (bumped on every heartbeat) and --now as UTC
   # epoch-ms and emits age_seconds + freshness_status itself — no local clock,
   # no mental arithmetic. Source: claim-reports.ts age_seconds = nowMs −
   # Date.parse(claimed_at), both UTC.
   pnpm agent-tools:collaboration-state -- claims active-agents \
     --active .agent/state/collaboration/active-claims.json \
     --now "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
   ```

   Read the outgoing Director's `freshness_status` and `fresh_until` from the
   tool's output. Neither reading licenses the takeover: a `stale` row, or a
   heartbeat you have confirmed stopped, does not show a stand-down (a heartbeat
   can be suspended under PDR-078 §4 while the seat is live), and a `fresh` row
   is a reason not to act. Moment 2 rests on the outgoing Director's explicit
   written stand-down (its pre-positioning or retirement event) or the owner's
   word (PDR-117 §Takeover verification, amended 2026-09-17). If you ever need a single claim's age,
   `claims status --active <path> --now <utc-iso>` prints the same UTC-computed
   `age_seconds` / `fresh_until` per claim. **Never** compare a `…Z` timestamp
   against a local wall-clock: on 2026-06-25 a successor read a `07:52Z`
   pre-position against an `~08:50` local-BST clock, computed a false 58-minute
   coordinator-less gap, and broadcast a premature Moment-2 — yet `07:52Z` _is_
   `08:52` BST. The tool's UTC-to-UTC computation makes that error structurally
   impossible; mental arithmetic does not.

   If you cannot answer all five questions, or the check is not pasted, you are
   **not ready** — keep rehydrating; do not acknowledge. A premature
   acknowledgement is worse than a slow one, and an authority/coordination action
   gets the **highest** verification bar: ground the load-bearing fact first-hand
   before acting, most strictly when the premise conveniently licenses the action.
4. **Take authority (PDR-064 Moment 2).** Open your own Director claim (replacing
   the retained one named in `CURRENT HANDOFF STATE`), broadcast the
   active-acknowledgement, and re-arm awareness: the all-channels comms watcher
   as **move 1, before any coordination** (it is constitutive team-membership,
   not discretionary — it recurs on a drain-timeout, so keep a foreground-sweep
   fallback), and a heartbeat loop **with an exit criterion**. The outgoing
   Director's heartbeat legitimately runs until this moment (PDR-064: the seat
   never goes dark between the two moments) and the outgoing Director stops it
   after transfer (step 7); stop it yourself only as a backstop if it is still
   emitting well after authority has transferred.
5. **Operate the seat.** Live routing is the seat's first duty: a monitor
   event carrying an implementer team-start, routing request, or decision is a
   **pre-emption signal, not background** — pause the current process-task and
   route (or at least acknowledge with a next step) before continuing.
   Continuity paperwork (seeds, task lists, consolidation) happens in the gaps
   between live coordination, never ahead of it; if you cannot keep up, that
   is the hand-off-to-a-fresh-Director signal, not a push-through. Route
   durable **lanes**; do not choreograph individual pickups (implementers
   self-organise faster than fine-grained routing — and that routing races
   them). Before routing to a specific agent, **verify its current
   state right then** (its claim freshness via the same mechanical check above),
   not the state from minutes prior. Route **nothing** to an agent that has been
   told to close out or is high-context — route to its successor; check "has this
   agent been told to close out / is it high-context?" before routing anything to
   it. Own verdicts and verify them first-hand — including a PR's **inline review
   comments**, not just `gh pr checks`. Lens-resolve Implementer questions;
   escalate to the owner only when the lenses genuinely fail or the call is
   constitutively the owner's.
6. **Owner-away: keep going until ALL work is complete, then pause** — not a
   stand-down at the first stable point. "Complete" = every lane landed or cleanly
   parked with a durable handoff, every team-doable item done, only owner-gated
   items remaining. At completion, pause and **wind down your own heartbeat
   explicitly** — its exit is COMPLETION, not N-idle.
7. **Hand off when your context deepens — and hand off BEFORE your own
   closeout, never after** (owner direction 2026-06-28: optimise for team
   continuity and health, not any one session's tidiness — a sequencing and
   altitude instruction, not a speed one). When the PDR-063 80% /
   post-commit re-evaluation fires, the FIRST wind-down move is to start the
   handover: refresh `CURRENT HANDOFF STATE` below; pre-position your
   successor (PDR-064 Moment 1); require the successor's readiness gate
   (step 3, including the pasted mechanical check) before its Moment-2; and
   keep your own heartbeat running until the successor's Moment-2 lands —
   the seat never goes dark between the two moments (PDR-064; the liveness
   rule) — stopping it only once authority has transferred. **Handover
   artefacts on tracked surfaces (this brief's refresh, napkin entries,
   continuity rows) are written locally and land BATCHED into the next
   substantive or consolidation PR — NEVER a dedicated handover branch or
   PR (owner ruling 2026-07-15). The handoff record itself is instance-tier
   coordination state, untracked-by-design (ADR-199/PDR-094): it is
   preserved on the primary checkout's disk and never lands in git at
   all.** The handoff is complete when the record is written, the comms
   events are posted, and the successor acknowledges; the successor reads
   the record from the filesystem, not from a merge. (The comms stream
   carries the pointers, so nothing load-bearing rides on the landing
   latency.) Only AFTER the successor holds authority
   do you run your own team-member closeout; do not begin closeout
   housekeeping (consolidation, final summary) while still holding the live
   seat with no successor landed. At a genuine arc-end where the whole cast
   dissolves there is no successor — closeout is the terminal act.

## Standing processes of the seat (arming commands, on any checkout)

Every one of these dies at a compaction or a seat change; the successor arms each from here,
from the repository root, with plain calls (no command substitution at the call site — the
owner's standing word for unattended seats). The monitors run under the platform's
background-process tool; the two scheduled prompts run under the platform's scheduler (each
platform names its own). Instrument scripts that restate these as one-liners are session
conveniences, never the only home.

1. **The all-channels comms watcher**, persistent, re-armed on its hourly exit — on the PRINCIPAL checkout:
   `timeout 3600 pnpm --silent agent-tools:collaboration-state -- comms watch --platform <platform> --model <model>
   --supervisor-pid "$PPID" --step-timeout-ms 120000 --max-events-per-drain 100 --exclude-tag heartbeat`, then
   `pnpm --silent agent-tools:collaboration-state -- comms assert-watcher-live --platform <platform> --model
   <model>`. A seat RESIDENT IN A LINKED WORKTREE cannot pass `$PPID` (the platform's worktree isolation refuses
   the runtime expression): it arms the fully literal form in the `comms-all-channels-watcher` rule's
   worktree-isolation section — the `cd` rooted at the worktree, the timeout binary by its resolved name, the
   supervisor pid written as a literal. That rule is canonical for both forms.
2. **The liveness heartbeat**, a persistent loop every 240 seconds bumping BOTH surfaces each tick, per the
   `liveness-heartbeat-cron` rule's canonical invocation: the comms heartbeat event (`comms send --tag heartbeat`
   with `--title` and the four typed state arguments `--claim-id`, `--intent-id`, `--branch`,
   `--current-cycle-label`) and the registry heartbeat `date -u +%Y-%m-%dT%H:%M:%SZ | xargs -I{} pnpm --silent
   agent-tools:collaboration-state -- claims heartbeat --active .agent/state/collaboration/active-claims.json
   --claim-id <claim-id> --now {}`, each leg with its own `|| echo` so a half-dead heartbeat reports itself; read
   `heartbeat_at` back off the claim row after arming. The registry-only hourly loop (the second leg alone, `sleep
   3600`) is NOT this heartbeat: it is the PDR-078 §4 consumer-absent form — n=2 owner-visible per PDR-082, or a
   claimless standby — and a seat running it declares that exemption on the stream and re-arms the full loop the
   moment a consuming peer appears.
3. **The peer-liveness poll**: the `comms peer-liveness` delta poll against the PRIMARY
   coordination home's comms directory, per the heartbeat rule's F-75 recipe (`active` under
   four minutes, `offline` to ten, `retired` past ten — input to verify, never a verdict). The
   watcher's heartbeat exclusion REQUIRES this pairing. A 20-minute read of
   `.agent/state/collaboration/active-claims.json` with jq's `now` builtin (emitting on a change
   in the peer set or a peer quiet past 90 minutes) is only the coarse fallback while every peer
   runs under the exemption above and emits no heartbeat; claim freshness cannot see a silent
   retirement.
4. **The PR poll**, every two minutes over the open set — number, draft flag, `mergeStateStatus`,
   head, unresolved review threads, check rollup (the pr-lifecycle state machine's item-1
   selection) — emitting only lines that changed.
5. **The wrap cadence**: a recurring scheduled prompt at `41 1-23/2 * * *` (local time; 41 past
   odd hours) whose text names the non-terminal wrap — `date -u` first; work safety (status,
   fetch, unpushed refs, the queue); the seat's continuity sweep by pathspec, owner-authored with
   the session trailers; a retrospective paragraph on the napkin; the board recomputed
   first-hand; the processes verified by id; owner items held for the record while the owner is
   absent; then drive on.
6. **The fold wake**: a one-shot scheduled prompt seven minutes past the next UTC rollover
   (`7 0 <day> <month> *` when the scheduler runs in UTC, else the local equivalent) whose text
   names the coordination branch and its pull request, says `date -u` first and recompute before
   acting, and runs the `coordination-fold` skill's ceremony from the primary with plain calls;
   when the fold has already run earlier in the branch's landing slot, the wake only verifies
   that the successor branch, its draft PR and the next wake exist.
7. **A settle watch on the landing-slot holder**: required checks green by name
   (`run-quality-gates`, `CodeQL`), then a ten-minute quiet window with zero unresolved review
   threads, then `CLEAN`; it stops loud on every terminal state (closed, head moved, a check
   failed, threads unresolved, not clean) and never merges — the merge is the seat's own act at
   the recomputed gate (pr-lifecycle §Phase 7).

## Standing lessons (this Director lineage)

Each lesson is the cure for a churn cause observed in the pilot.

**Drive, never coordinate** (a seat's reading of the owner's repeated corrections
of 2026-07-01, recorded in per-user memory that day; the owner's words were not
quoted). The Director decides what the decision lenses can settle and surfaces
only constitutive residue (product intent, values, external commitments); an
"owner-approval step" is manufactured ceremony, and "the team is awaiting
approval" is a fluent frame to test. The Director drives to a checkable
Definition of Done, authoring one when the plan lacks it; never parks or
retires a lane mid-session while work remains (a context-limited seat hands
to a successor who picks up at once); and cuts owner-facing narration, since
the owner should see the team delivering, not the Director reporting.

**The durable role doctrine has graduated to
[PDR-117](../../practice-core/decision-records/PDR-117-director-and-implementer-roles.md)
§The Director role** — minimum-action / context-economy (stay silent on routine
signals), routing craft (verify-state-before-routing, durable-lanes-not-pickups,
never route to a closing-out agent), and takeover verification (registry-freshness
≠ comms-liveness; the highest verification bar for authority actions). Read PDR-117
for those; the lessons below are the **operational craft** of running the seat in
this repo that PDR-117 does not carry.

Seven of the pilot's lessons now live in rules and are read there, not here: arm the
comms watcher as move 1 (`comms-all-channels-watcher`, with the reserve-seat
`--exclude-tag heartbeat` filtering under its sanctioned tag exclusion); stop your own
heartbeat at stand-down (`liveness-heartbeat-cron` §Loop hygiene); verify a PR's inline
review comments first-hand, not just `gh pr checks` (`pr-comments-resolve-and-recheck`);
for an artefact open weeks, "what has been decided since this was written?" comes before
its merits (`verify-dont-trust`); closeout is serial mutation verified first-hand at the
instant — content check before `git worktree remove`, archive-not-delete, patch-id before
pruning, never line-merge memory files (`worktree-hygiene` §6); and the auto-update-branch
babysitter for the landing-slot holder (the pr-lifecycle skill §Phase 7). The lessons below
have no other home.

- **Re-spinning a deep-context session does not reset its budget** — security- or
  quality-critical work wants a genuinely fresh seat, not a re-spin of a spent one.
- **Curate, don't mechanically slice, prose-not-written-to-be-sliced**, and
  drift-guard the projection against source.
- **Ground in the homed plan before designing — most "design" is crosswalk +
  activation, not greenfield.** Read the plan estate first; launching a design
  workflow over an already-homed plan risks forking an SSOT.
- **Director-run workflows (ultracode): flat output schemas** (a nested matrix
  schema hit the StructuredOutput retry-cap and failed silently), **never seed a
  contested call as "settled" in a brief** (the agents reflect it and the
  adversarial verifier cannot catch what you marked settled), and **critically
  assess every result AND its cited sources first-hand** (a cited SHA was not in
  main; an "unmeasured 10:1" was a measured 1.59:1).
- **Reject either/or — climb to the third option / the both.** A binary handed to
  the Director is the signal to climb (filter-vs-derive dissolved into one object
  that was both relief and structural cure). Run the five decision lenses before
  surfacing ANY question; surface only the constitutively-owner one.

The experiential source for the last several lessons is the Trawler-tenure how-to brief
([`director-howto-and-pdr117-gaps-2026-06-29.md`](../../reports/agentic-engineering/director-howto-and-pdr117-gaps-2026-06-29.md)).
Its **Part B (PDR-117 missing axes)** is a queued doctrine-design task — context-budget economy as a first-class
axis, takeover-verification doctrine, owner-interaction modes, Director-as-orchestrator,
arc-closeout-as-responsibility, the loss-scan axis — to be authored on fresh context (owner-directed), with PDR-117
as the surface to amend.

## Known friction (route to tooling, not to the brief or the plan)

These are tooling gaps, not doctrine gaps — they belong in the frictions register
(`.agent/memory/operational/frictions-register.md`), named here only so a successor
recognises them rather than rediscovers them. The three the pilot found are its entries
F-96 (a continuity-buffer handoff commit blocked by markdownlint), F-160 (the comms
watcher's drain step dies at its deadline on a large event directory) and F-97 (no PR
monitor covers inline review comments and PR terminal state together); read their
current state there. (`claims adopt`, `claims set-handoff` and the watcher-presence gate
on `claims open` exist since PR #225: frictions F-94 and F-95.)

## CURRENT HANDOFF STATE

**§STATE, 2026-10-02 15:1xZ (Crucible binds Slag, `7b999c`, the Director seat re-taken at the
owner's word).** The owner, verbatim, 15:0xZ: "for the team, and for each agent, including yourself,
define what the goals are, we need a definition of done, so that we know when the work is finished.
We need to get the Practice work complete so we can plan the extraction, and we need to get into a
position where development work on OCE makes sense." Claims: 302e8307 here and 726da755 in JC.net
(`estate-coordination`, role director); the inherited J2 claim 4b82394b is routed below. Processes:
the two watchers, the two heartbeat loops, the pull-request poll over both open sets, the
peer-liveness poll; the fold wakes for #332 and 286; each armed for the finish below and stopped at
it. Roster at 15:1xZ, both live by their reports in this seat's session and their beats: Hazel
tracks Trunk (7d8b9d), JC.net implementer (claims 009bbaea there, 08f94e2a here; 291 merged
`54a219d50` at 15:06Z; slice s opening); Efreet lifts Scorch (7adb15), OCE implementer (claim
006c79ad; #333's one ceremony running on the go word of 15:0xZ). The mode is the full protocol at
n = 3.

**Goal 1: the Practice work complete, so the extraction can be planned.** "Complete" is already
ratified: `best-of-each-practice` §Outcome in both estates (a dry-run merge of the shared text
changes no file, conflicts nowhere, leaves no file waiting; each judged standard has one
observation every estate passes; every offer has an answer and each adopted capability is
demonstrated where adopted; the removals judged are carried out). The finish below is that outcome
made countable at the two default tips, plus the inputs the extraction's plan needs. Goal 1 is done
when every line holds, each proof read first-hand by the Director:

1. Nothing of the Practice lives outside a default branch: no open Practice pull request in either
   estate; no local-only slice branch (JC.net: s, u, x, y, z; OCE: nb, r, v, w, u, q, s, y; the
   stale `docs/consolidation-2-routed-cures` in each lane proved merged by content or removed on the
   owner's word); the J2 docs-validators port committed on its branch and opened as one pull request
   that runs here at its slot, or removed by the owner's decision with its handoff record as the
   account. Proof: the open sets, `git branch -v` in both lanes, the J2 branch. Receivers: Hazel
   (JC.net), Efreet (OCE).
2. The consolidation's finish list is empty (Hazel's eighth entry, 14:48Z, seven items): the JC.net
   slices; the OCE slices; the records commit after the lock; the three unconsolidated napkins
   archived by proof after the owner's one line; the three OCE owner cards raised; the two directive
   lines and the monitor rule's one-shot clause edited; the napkin rotated. Counts first in the
   closeout: pending graduations 0 and buffers 0 in both estates. Proof: the counts and the merged
   pull requests by SHA. Receivers: Hazel; Efreet for OCE's slices; the Director for the cards.
3. The exchange reads N of N: the register's count line (16 of 32 at 2026-09-29, not refreshed
   since) recomputed at the current heads, every row landed or declined with its reason, and the
   plan's finish test met: a computed path delta over `agent-tools/src`, `agent-tools/smoke-tests`,
   `.agent/skills`, `.agent/rules` and `.agent/directives` between the two default tips shows no
   one-estate-only file on any port line. Proof: the delta's run recorded in the register with both
   heads. Receiver: one JC.net-resident lane (Hazel after item 2); each port line found is a twin
   lane under the limit.
4. Capability parity, both ways, inventoried and landed or decided (the owner, 2026-10-01: "anything
   useful that one has must make it to the other"): the rows the consolidation record names (L7, L8
   into JC.net; OCE's commit queue; JC.net's `check:docs` pre-flight; the divergence measure as an
   agent-tools command with tests; the visual-regression harness where it applies) and the twins
   the day found (the 309 twin, the 333 twin, the GitHub-port seam) are register rows, each landed
   in both estates, declined with its reason, or carded to the owner. Proof: the register.
   Receivers: twin lanes, one per capability, routed by the Director as slots free.
5. The residual divergence is classified: the measure run at both default tips; every differing
   shared path is the same bytes or named in the retrospective's table with its reason as a
   repo-local binding (PDR-143 §1's split), none as "divergent by nature" without the reason.
   Proof: the measure's output and the table. Receiver: one lane after items 1 to 4.
6. The agent-tools test census exists and is sized in both estates (the no-IO plan's first
   acceptance criterion: a row per test, helper or setup file that uses the filesystem, a process,
   the network or the clock). The conversion itself (53 smokes in JC.net, 40 here) is sequenced by
   the owner: the Director's verdict is after OCE's first product lane opens, because its cost is
   days and it blocks neither goal; the owner can place it inside Goal 1 instead. Proof: the census
   tables. Receiver: one lane per estate.
7. PDR-143 is before the owner for ratification or amendment, with §5's items carded once (name,
   home, licence, publishing route, version scheme; the fork relation). Owner-gated; no other line
   waits on it.

Not in Goal 1: the extraction plan itself (the next bounded task, whose first step is the scope
inventory of every Practice artefact against PDR-143 §1 and §2); the language-separation sketch (an
input to that plan); any Reliable Atoms rename (the external Capability Foundations pull request is
intake on arrival).

**Goal 2: a position where development work on OCE makes sense.** Development work makes sense when
a product lane can open in OCE's fix slot on a stable substrate, with a named target and a free seat.
Done when:

1. OCE's fix slot holds no Practice pull request (Goal 1 item 1 for OCE: #333, the eight slices, J2)
   and #332 is folded at the rollover. Proof: the open set; the fold's merge SHA. Receiver: Efreet.
2. The first product lane is named: a delivery node serving `reliable-atoms-programme`, its premise
   recomputed against the tree, its definition of done written by its implementer at pickup, and an
   implementer seat free under the limit. The Director's verdict on the target: the programme's
   first target as ratified (BinaryTreeIndices with its admission and outcome prerequisites; the
   composed BinaryHeap as the first endpoint) under the adoption profile
   `docs/architecture/foundations/capability-foundations-adoption.md` as the contract; the owner
   confirms or redirects on one card. Receiver: Efreet at the slot.
3. The owner's gating decisions are carded once and gate nothing else: the three OCE cards (items
   1 to 4, 5 to 8, 9 to 10 of the re-trued decision items); the first-lane card; the no-IO
   sequencing; the lock. The ten re-trued items stay listed in `repo-continuity.md` §Open
   Owner-Decision Items and gate nothing in the first lane. Receiver: the Director.
4. The gates a product lane runs are bounded: the census of Goal 1 item 6 done here, and the
   pre-push gate's run time measured once on a product-shaped change and recorded. Receiver: Efreet
   at the first lane's first push.
5. Capability Foundations: the external pull request is team intake on arrival (checked out,
   gated, evaluated, counted toward the limit); its absence gates nothing, since the adoption
   profile exists; the Reliable Atoms residue (43 files) is cured in that pull request's wake,
   never before.

**Each seat.** Crucible binds Slag, the Director (route, never execute; PDR-117): goal, both
definitions hold in both estates with the owner's decisions carded once and the records aligned;
done when (a) this definition is recorded in both estates and acknowledged by each seat, (b) every
line has a receiver and a proof, (c) each proof is read first-hand at its landing, (d) PDR-143 and
the first-lane card are before the owner, (e) the inherited J2 claim is with Efreet at its slot or
closed on its record, (f) the handoff is written; then the seat stops, or pauses when only
owner-gated lines remain. Hazel tracks Trunk, JC.net implementer: goal, the consolidation's finish
list on the JC.net side and the JC.net fold while the lock stands; done when 291 is merged (done,
`54a219d50`), s, y, x, u, z are merged one at a time, the records commit and the fold of 286 land
once the owner clears the lock (or at the rollover DUE, the fold waiting on the lock the same way),
the three napkins are archived by proof after the owner's line, the two directive lines and the
monitor clause are edited, the napkin is rotated, and the counts read 0 and 0; then the exchange
recount (Goal 1 item 3) and the twin lanes in JC.net's slot as routed. Efreet lifts Scorch, OCE
implementer: goal, OCE's fix slot drained of Practice work, then OCE's first product lane; done
when #333 is merged at green, nb, r, v, w, u, q, s and y are merged one at a time (u takes
`origin/engraph` by merge, never rebase), J2 is opened as one pull request that runs here or
removed by the owner's decision, the stale routed-cures branch is proved or removed, and #332 is
folded at the rollover; then the first product lane's node and its own definition of done at
pickup.

**The owner's cards, raised once in the Director's report of 15:2xZ:** the lock (the owner's
command, given in chat); PDR-143 (ratify as written, amend, or hold; §5's items); Goal 2's first
lane (BinaryTreeIndices under the adoption profile, or another target); the no-IO conversion's
place (after the first product lane, or inside Goal 1); the three OCE cards from Hazel's re-trued
file, verbatim; Hazel's four items of 14:1xZ as her record names them (the monitor rule's one-shot
clause; "homes twin, buffers do not"; the privacy line; the test-expert gate's cost); the one line
on the 2026-03-08 napkin (per-user memory, chat only).

**§BOARD, 2026-10-02 16:4xZ (the wrap cadence's first recomputation against the definition
above).** Work safety: both primaries equal their remotes; this estate clean; JC.net's ten dirty
paths are records behind the lock (zero bytes, 10:56Z, standing at 16:42Z). Goal 1 line 1: JC.net
has five of Hazel's six slices on `main` (291 `54a219d50`, 292 `a1b4e393f`, 293 `4a9a0d04c`, 294
`541fb1981`, 295 `9365ab74a`, each read first-hand), u opening last with `main` merged in, the
stale routed-cures and the merged 2a branches still local; here, #333 `134c2fb6f`, #334 (nb)
`f45aaeca4` and #335 (r) `576d8924d` are on `engraph`, #336 (v) is open at its second round, w, u,
q, s and y are local on their lane branches, the stale routed-cures branch stands, and the J2 port
is uncommitted (five paths). Lines 2 to 6: in progress or not started (the consolidation's list
lands slice by slice; the exchange recount, the parity rows, the divergence classification and the
test census open after it). Line 7: PDR-143 is before the owner since the report of 15:2xZ,
unanswered. Goal 2: line 1 in progress (three Practice pull requests landed here this hour, six
slices and J2 to go; #332 reads BEHIND and folds at the rollover by merge); lines 2 and 3 carded
at 15:2xZ, unanswered; lines 4 and 5 not started. Routes given in the hour: z before u in JC.net,
u by merge from `main` with no wait on the fold (Hazel's question, 16:0xZ, absorbed); the two
Codex cures from #334 back to JC.net as one small slice after u. Processes verified by id at the
cadence: two watchers (re-armed at their expiry), two heartbeat loops (paused per peer push window
under F-219 and re-armed at each push-done, eleven windows this hour), two polls, two scheduled
prompts (the fold wake at the rollover, this cadence). Owner items held for the record, unchanged
from the report of 15:2xZ: the lock; PDR-143; the first product lane; the no-IO conversion's
place; the ten re-trued OCE items; Hazel's items; the one private line.

The §STATE block of 14:4xZ below stands as the record of the stop; its routes are absorbed above.

**§STATE, 2026-10-02 14:4xZ (Crucible binds Slag, `7b999c`, the Director seat stopped at the
owner's word).** The owner, verbatim: "Please prepare compaction … then stop all processes -- and
remember, you are working on a bounded task, not open ended, we must always understand the goal so
that we are able to finish". Every standing process of this seat is stopped and its claims are
closed (6a4b11b1 here, 8b346894 and cab726a6 in JC.net); 4b82394b (the J2 lane, NOT READY,
uncommitted in `oce-wt-j2-docs-validators`, `repo-continuity.md` §Next Safe Steps line 2) carries a
handoff pointer for the next implementer seat here. No Director seat exists after this block; the
routes below stand until an owner-seated Director adopts them, and each implementer's own session
is the owner interface meanwhile.

The finish of the day's Director task, stated: (a) JC.net's 286 folded — held by a zero-byte
`.git/index.lock` in JC.net's primary (10:56:56Z, no holder; the commit skill's foreign-lock section
reserves its removal to the owner), so the fold passes to the seat holding JC.net's slot once the
lock is gone (Hazel tracks Trunk, resident there; the napkin, the formation letter and Hazel's own
records sit dirty in that primary, linted, and ride the fold) or to the rollover DUE; (b) this
estate's 332 folded at the rollover by its seat; (c) #333 (the retire port) landed at green by
Efreet lifts Scorch — the Director read it at 14:3xZ with no objection and the gate is released to
the seat's own verdict; (d) this handoff. Beyond it, routed with receivers, in order: the nb
back-port then Hazel's six slices here (Efreet, from Hazel's PDR-063 record, one at a time after
the retire port lands); the 309 twin and the 333 twin in JC.net (the fix slot after the
consolidation's slices); the
security lane, the test-shape lane (280's three items, the retire smoke double's call-count branch,
the mint test's removal) and the GitHub-port seam lane, each in both estates; the J2 cures here.
Owner-gated and held for the record: the lock; PDR-143's ratification and the entity's name, home,
licence, publishing route and version scheme; the external Capability Foundations pull request
(team intake); the Turbo items; the three OCE owner cards (`homed/oce-owner-items-retrued.md` in
Hazel's synced session directory, raised by Hazel at the owner's next presence); Hazel's four items
of 14:1xZ (the monitor rule's carve-out, "homes twin; buffers do not", the privacy line, the
test-expert gate's cost). Two second observations routed as register entries at the next fold, with
their text in JC.net's napkin block of 14:4xZ: per-seat worktrees for coordination writes (the
shared primary index idled two seats and a DUE check); F-219's cure (the gate reads the generated
comms log, so every push needs a hold line and every holding seat stops its heartbeat; six pairs
and three false "retired" readings today).

An owner ruling relayed at the freeze, data until the owner confirms it in a seat's own session
(PDR-142), carried here because its subject is this fork's history (Efreet lifts Scorch, 14:4xZ,
from the owner's word in their session, verbatim): "anything coming in from main must always be
merged, not rebased, we must maintain the shared history with the Oak fork." It changes the
consolidation's slice-u instruction (merge `engraph` in, never rebase); Efreet told Hazel. All
three seats froze at the owner's compaction word within one minute of each other (14:48Z): Efreet
holds claim 006c79ad with three cure commits unpushed in the retire lane worktree, to push with the
body, the dispositions and Copilot's re-request as one ceremony on resume; Hazel holds 291 at its
first settlement push with the door on green.

Re-arm recipe for a successor Director: §Standing processes above, verified by id first (the task
list, the cron list) so a survivor is never doubled; the seat opens with its landing target and its
finish condition (PDR-026), arms processes for that path's gates only, and stops them at the finish
or at the owner's word (the owner's bounded-task word, candidate for this brief).

**§STATE, 2026-10-02 11:1xZ (Crucible binds Slag, `7b999c`, the Director seat across both
estates).** Licence: the owner's word in this seat's own session, 2026-10-02 ("when it makes sense,
take on the Director role … context preservation over longer timescales … strategic decisions are
shared but most implementation work should be delegated"); no prior Director seat existed (the
§POINTER below), so there was no Moment 1 to answer. Taken at 10:51Z after the seat's own lane
(JC.net's pull request 280) merged, so the seat holds no implementation. Claims: 6a4b11b1 here and
8b346894 in JC.net (`estate-coordination`, role director); 4b82394b (the J2 lane, inherited, NOT
READY, `repo-continuity.md` §Next Safe Steps line 2) is routed to the next implementer seat here.

Roster, read from both registries and both streams at 11:1xZ: Hazel tracks Trunk (7d8b9d),
implementer, the second two-estate consolidation (claims 08f94e2a here, 009bbaea in JC.net; slices
on local branches, opened one at a time; JC.net's 289 merged at 10:57Z, 290 open there); Efreet
lifts Scorch (7adb15), implementer, this estate's fold of #327 (merged 11:07Z as `9fd05ecf7`) and
the cross-fork check (claim f9c5a8ce; no lane work). The owner's limit (10:3xZ): one coordination
and one fix pull request per estate. Here: #332 (coordination, cut 11:10Z), no fix pull request.
JC.net: 286 (coordination, folds at 12:00Z by this seat; a stale `index.lock` in its primary, the
owner's to clear, holds every commit there until it is gone) and 290.

Verdicts owned: the fold of JC.net's 286; PDR-143's landing here on `coordination/2026-10-02-9fd05e`
(the same bytes as JC.net's, where two sub-agent reviews read them); 290 read first-hand, no
objection. Owner-gated: the Turbo items (`repo-continuity.md` §Next Safe Steps); the Capability
Foundations pull request the owner will have an external agent raise here (team intake when it
arrives); PDR-143's ratification and the entity's name, home, licence and publishing route; JC.net's
lock and 290's re-run. Team-doable, in order, each to an implementer seat as its slot frees: the #309
twin in JC.net; the security lane; the `retire` port into this estate carrying 280's two settlement
cures; the push-tests lane in both estates (280's three routed items; the mint test's removal); the
J2 port's cures here; the arc-metrics follow-ons (§Next Safe Steps line 1).

Processes of this seat: the all-channels watcher in each estate; the heartbeat loop under the
Director label on both registries; the PR poll over both estates' open sets; the peer-liveness
delta poll; the fold wake; the wrap cadence. Each is re-armed from §Standing processes above at any
boundary.

**§POINTER, 2026-09-29 13:4xZ (Wick binds Temper, `ed7b48`, the Director seat, at the owner's
word).** The Director lane closed on 2026-09-29; the owner handed the work to one seat (n=1) across
both estates. That seat's handoff is the `estate-coordination` thread record's journal entry
"2026-09-29T13:4xZ — HANDOFF to the n=1 seat", with the retrospective
`.agent/reports/agentic-engineering/why-five-days-of-landings-closed-nine-stories-2026-09-29.md`.
This role brief stays for any future Director seat.

The state blocks of 2026-09-19 that stood here are archived byte-identical in
`archive/director-handoff-current-handoff-state-2026-09-19.md`.
