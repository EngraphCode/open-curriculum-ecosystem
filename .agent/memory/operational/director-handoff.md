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

1. **The all-channels comms watcher**, persistent, re-armed on its hourly exit — on the
   PRINCIPAL checkout:
   `timeout 3600 pnpm --silent agent-tools:collaboration-state -- comms watch --platform <platform> --model <model> --supervisor-pid "$PPID" --step-timeout-ms 120000 --max-events-per-drain 100 --exclude-tag heartbeat`,
   then `pnpm --silent agent-tools:collaboration-state -- comms assert-watcher-live --platform <platform> --model <model>`.
   A seat RESIDENT IN A LINKED WORKTREE cannot pass `$PPID` (the platform's worktree isolation
   refuses the runtime expression): it arms the fully literal form in the
   `comms-all-channels-watcher` rule's worktree-isolation section — the `cd` rooted at the
   worktree, the timeout binary by its resolved name, the supervisor pid written as a literal.
   That rule is canonical for both forms.
2. **The liveness heartbeat**, a persistent loop every 240 seconds bumping BOTH surfaces each
   tick, per the `liveness-heartbeat-cron` rule's canonical invocation: the comms heartbeat
   event (`comms send --tag heartbeat` with `--title` and the four typed state arguments
   `--claim-id`, `--intent-id`, `--branch`, `--current-cycle-label`) and the registry heartbeat
   `date -u +%Y-%m-%dT%H:%M:%SZ | xargs -I{} pnpm --silent agent-tools:collaboration-state -- claims heartbeat --active .agent/state/collaboration/active-claims.json --claim-id <claim-id> --now {}`,
   each leg with its own `|| echo` so a half-dead heartbeat reports itself; read `heartbeat_at`
   back off the claim row after arming. The registry-only hourly loop (the second leg alone,
   `sleep 3600`) is NOT this heartbeat: it is the PDR-078 §4 consumer-absent form — n=2
   owner-visible per PDR-082, or a claimless standby — and a seat running it declares that
   exemption on the stream and re-arms the full loop the moment a consuming peer appears.
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

The experiential source for the last several lessons is the Trawler-tenure how-to
brief ([`director-howto-and-pdr117-gaps-2026-06-29.md`](../../reports/agentic-engineering/director-howto-and-pdr117-gaps-2026-06-29.md)).
Its **Part B (PDR-117 missing axes)** is a queued doctrine-design task — context-budget
economy as a first-class axis, takeover-verification doctrine, owner-interaction modes,
Director-as-orchestrator, arc-closeout-as-responsibility, the loss-scan axis — to be
authored on fresh context (owner-directed), with PDR-117 as the surface to amend.

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

> **§FOLD, 2026-09-19 (Zephyr guards Leeward, `281e44`, curator; no Director seated) — supersedes the
> 2026-09-12 fold block (#135, SHA:69a537717), which is verbatim in
> `archive/director-handoff-2026-09-19.md` and narrated in the archived thread record
> `archive/estate-coordination-thread-2026-09-20.md`, under its heading "2026-09-12 12:5xZ — FOLD
> LANDED".** The last fold is #171 (SHA:56bd4de6a, 2026-09-21 17:45Z), the third 2026-09-21
> branch, landed by the merge door itself with both review legs bound to the tip; the live branch
> is `coordination/2026-09-21-56bd4d`, which was DUE 2026-09-22 17:45Z and is OVERDUE since the
> seat paused at the owner's word (2026-09-21 19:27Z to 2026-09-23); the fold is the first act at
> resume, and the second boundary block in `repo-continuity.md` says why. A fold's rounds, findings and price
> live in the estate-coordination record's journal and the review-cost ledger, never in this
> block. _moved for teachers:_ nothing. _moved for the Practice:_ the #170 fold's records, the
> operator-profile twin's landing, the first day of the three-estate exchange. The folds before
> it: #170 (SHA:1a125f65d, 2026-09-21 10:12Z), the #169 fold's records and the exchange channel
> tracked; #169
> (SHA:72cab5667, 2026-09-21 09:09Z), the consolidation's close and the citation line; #159
> (SHA:efb2942e9, 2026-09-21 00:03Z), the memory-file pass — every large memory file says where its
> current state is, with its narrative whole in a dated archive; #156 (SHA:44729c98c, 2026-09-20
> 12:44Z), the twelve directive-bound graduations and the graduate-then-archive lifecycle.

---

> **§LIVE SNAPSHOT, 2026-09-19 ~19:5xZ (Zephyr guards Leeward, `281e44`, inside the owner-directed
> consolidation; first written 2026-09-16) — replaces the 2026-09-17 snapshot in place (verbatim in
> `archive/director-handoff-2026-09-19.md`).** THE BOARD IS NEVER READ FROM THIS SNAPSHOT: the open set and each pull request's
> head, state and threads are computed from the repository service at the moment of reading; this
> snapshot records what LANDED and who holds which LANE.
>
> **Seats.** No Director is seated. From 2026-09-20 20:36Z the estate ran at n = 1 (Zephyr guards
> Leeward, the dedicated consolidation, whose curator claim closed at its terminal wrap, 2026-09-21
> 06:33Z); from 2026-09-21 09:2xZ it runs at n = 2: Zephyr guards Leeward as this estate's seat of
> the three-estate Practice exchange (no claim open; one opens when the first inbound row lands)
> and the guest exchange seat Brazier spins Temper (`c70341`, from the sibling estate; registered
> `b1c30d15`, adopted `821a3b59`; comms, one ARC channel and the Practice Box only, no claim on
> this tree). Dynamo turns
> Temper (`2a4c8a`, the owner-approved Oak integration lane) closed out at 20:36Z with the lane
> complete — Oak `main` `d9138c8b9` (1.185.0) an ancestor of `engraph`, #160–#168 landed — and
> handed its remaining responsibilities to the curator (five items, absorbed; recorded in the
> estate-coordination record and the continuity record's owner decisions). The two seats coordinated on the ARC channel
> `.agent/collaboration/rapid-comms/2026-09-17-fold-and-carrier-zephyr-guards-leeward-and-dynamo-turns-temper.md`.
>
> **Landed since the 2026-09-12 snapshot:** the folds #137, #148, #150, #152, #153, #155, #156
> #159, #169, #170 and #171 (`56bd4de6a`, 2026-09-21 17:45Z; successor `coordination/2026-09-21-56bd4d`) and the
> lanes #139, #143–#147, #149, #157, #158, #160–#168 and the operator-profile twin, pull request
> 172 (`272910f1d`, 2026-09-21 14:45Z). Each is in the estate-coordination record's
> journal by merge commit, and in git; the list as it stood is in
> `archive/director-handoff-2026-09-20.md`.
>
> **Owner-held,** carried from the 2026-09-12 snapshot and not re-verified at this boundary: the four
> sync-workflow findings, to be cured in ONE lane; the mirror-provenance route, the owner's choice; the
> directives-tier placement; #100's two deny lines.
>
> **Withdrawn by the owner on 2026-09-16:** the upstream-report item. There are two peer forks and no
> upstream, so nothing under `.agent/reports/upstream-sync/` is sent to anyone. Its drafts are local
> work lists: the 1.181.3 draft is re-headed as seven local defects, and the 1.181.1 draft carries a
> header saying its six findings wait to be re-read under the peer-fork model.
>
> **A successor's first moves, on any checkout:**
>
> - start-right-team;
> - the mechanical liveness check and the readiness gate in this file's brief;
> - adoption only from a pre-positioning event;
> - the all-channels watcher, from the `comms-all-channels-watcher` rule's arming command;
> - the heartbeat cron stays dropped while n=1 (PDR-082);
> - the fold wake and its ceremony, from the `coordination-fold` skill;
> - the settle and merge boundary, from the `pr-lifecycle` skill §Phase 7.
>
> **THE PICKUP MAP** is `repo-continuity.md` §PICKUP, which points at the estate-coordination thread
> record §"2026-09-16 ~15:0xZ — COMPACTION BOUNDARY"; the tenure journal stays in that record.
>
> **Three standing rulings the archived blocks carried, conserved here with their homes.**
> (1) _Queue scope_ (owner, 2026-09-07 12:24Z via the Director): the commit queue serves the
> shared primary only; a worktree lane commits by plain pathspec with an audit line in the
> message — homed in the commit skill, `register-active-areas-at-session-open` and the shared
> start-right workflow. (2) _The landing-slot contract_ (Director routing, comms `6bd4fe0d`,
> 2026-09-06 20:04Z; refined 2026-09-07 20:44Z): one non-draft PR holds the `engraph` landing
> slot at a time, because the up-to-date ruleset knocks every other open PR to BEHIND at each
> merge; the slot-holder syncs ONCE, pushes, settles and merges; every other seat may open, gather
> reviews and disposition threads but does not sync or merge until the slot-holder's merge-landed
> event; slot order is the Director's call, the slot going to whichever PR is green and clean
> first rather than held empty; the fold takes the slot at the UTC rollover — homed in the
> pr-lifecycle skill §Phase 7, the landing-slot clause (moved there 2026-09-08 from the retired
> pr-target-is-engraph rule; this snapshot is replaceable). (3) _Settled directions are proposals_ (owner, comms `18109484`, 2026-09-07 13:2xZ:
> "No, they are proposals"): nothing in the tuition collection is ratified by its own README; the
> review tests every direction, including those labelled settled, against the estate's ratified
> structure — homed in that collection's `AUTHORITY.md` §Owner rulings.
>
> **Prior state blocks** — every §FOLD, §LIVE-STATE POINTER, §FREEZE, §CLOSEOUT and §INSTRUMENT
> block from the 2026-09-07 01:32Z banner back to 2026-07-30 — are ARCHIVED VERBATIM at
> `.agent/memory/operational/archive/director-handoff-current-handoff-state-2026-09-08.md`
> (continuity-practice §Disposition of Continuity Surfaces, disposition 2: the work they describe
> is finished and landed; the insight they carried is homed; git retains the literal record).
> Losslessness was proven at the move by a byte comparison of the moved range against the archive
> body. The next Director REPLACES this snapshot in place — one live snapshot, per this file's
> refresh contract above — and journals in the estate-coordination thread record; a fold block
> supersedes the one above it the same way. Nothing accumulates here again.
