---
fitness_line_target: 250
fitness_line_limit: 400
fitness_char_limit: 30000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else graduate, then archive to a dated file proven byte-identical — never before full processing, never split/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---
# Next-Session Record — `codex-dialogues`

Thread identity: **`codex-dialogues`** is Codex as an invocable second opinion. It rebinds the
Codex dialogues onto `codex exec` and `codex exec resume`, under the ratified node
`.agent/plans/delivery/the-codex-dialogues-exec-binding.plan.md` on `engraph`. It is distinct
from first-class Codex support in the Practice (a Codex seat as a team member), which is the
Director's track. The owner, 2026-09-24: the two use cases "are not necessarily the same thing".

Opened 2026-09-24 at the handover from Blazar lifts Corona to Swallow holds Drift. Before this
record, the lane's pickup was the napkin section "2026-09-24 wrap — the Codex dialogues lane".

## Participating agent identities

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| Blazar lifts Corona | claude-code | claude-opus-5-5 | b65a9a | lane owner, slices 0 to 1b-i; custodian of 1b-iii's landing | 2026-09-23 | 2026-09-24 |
| Forge herds Vapor | codex | GPT-5 | 01a0d2 | Codex seat: slice 1b-iii's reader; stood down 2026-09-24 | 2026-09-24 | 2026-09-24 |
| Swallow holds Drift | claude-code | claude-opus-5-5 | 516619 | lane owner from 2026-09-24 13:44Z (adopted claim `372ac08b`; claim `2368c96b` over `rollout/**`) | 2026-09-24 | 2026-09-24 |
| Luna stirs Radiance | codex | GPT-5 | 01a0d3 | Codex seat, the lane owner's partner at the owner's word 2026-09-24; takes accepted cures under `rollout/**` | 2026-09-24 | 2026-09-24 |
| Titan turns Ether | codex | GPT-5 | 01a0d8 | Codex partner; wake-bridge todo 1 probe preparation with Swallow holds Drift | 2026-09-25 | 2026-09-25 |

## Current Continuation

- **Invocation pointer**: continue `codex-dialogues` from this record. Treat every live fact
  below as a hypothesis until `gh` and `git` confirm it.
- **Controlling plan**: the node above: its `## Todos` (slices 1b-ii, 1b-iv, 2 and 3) and its
  `## Review dispositions` ledger.
- **Completed**: slice 0, PR 184 (`507d13931`); slice 1a, PR 186 (`418671f16`); slice 1b-0,
  the node's threat model and slicing, PR 188 (`fcbaa9bf5`, merged 2026-09-24 13:22Z through the
  merge door); slice 1b-i, the gate, PR 189 (`a0a2fead4`, merged 2026-09-24 14:59:44Z through
  the merge door, merge-landed event `4b4a0cab`); slice 1b-iii, the rollout reader, PR 190
  (`45c838297`, merged 2026-09-24 about 17:14Z through the merge door, both legs SATISFIED on
  the synced head `17cd699a1`; 2 rounds, 0 settlement pushes); slice 1b-ii, the cleanup row,
  PR 196 (`1a4450a69`, merged 2026-09-25 about 11:14Z through the merge door, both legs SATISFIED
  on the synced head `1f1b2d4bb`; 1 round, 0 settlement pushes; merge-landed event `ae8a8c07`).
  The node's Todos on `engraph` mark 1b-0, 1b-i and 1b-iii landed; 1b-ii's own mark rides the
  next node edit.
- **OVERRULED BY THE OWNER at about 13:00Z, 2026-09-25**, verbatim: "ALL seats need to STOP
  stopping mid session because of some ambiguous and made up "rules" about context. ALL you
  have achieved is stopping. Prepare for compaction then stop". So this seat is PAUSED FOR
  COMPACTION, not handed over. After the compaction it RESUMES this lane in the same session,
  claim `372ac08b`, with the next steps below, and it never stops again on a context threshold.
  The owner's word went to all seats (comms `6292fda0`) and to the Director, for the doctrine
  amendment (PDR-063's triggers and the start-right-team retirement triggers).
- **Superseded: "HANDED OVER AT REST at 12:40Z, 2026-09-25, under PDR-063"** (context 51.3% at 12:27:33Z;
  the owner away, the Director routing; surfacing event `cc536fae`). Claim `372ac08b` carries
  the handover record (local state, attached to the claim), written for either this seat's
  resumed session or a successor. Its next steps:
  - the wake bridge's todo 2: a pre-execution code-expert review of the sink first. Its gate is
    the node's text, "if any finding breaks the mechanism", which is about the findings, not
    PR 211's merge. No finding breaks it. The daemon mode is a named gap.
  - the owed Cricket-clause edit;
  - this lane's call-inspection PR.

  The Codex config split is routed to Titan turns Ether as its item after PR 211. The cited
  source reading is in the pairing channel at 12:29Z. Check-in 11's Cricket suite: 8 ON-TRACK,
  0 DRIFTING; 7 frame verdicts, 1 missing.
- **Todo 1's daemon-mode run** (this seat, 12:24:40Z, at Titan's go, from a shell outside any
  Codex sandbox). A healthy managed daemon started, but the TUI exited within 25 s with no
  rollout and an uncaptured exit message. Stopped, with no retry. Cleanup verified.
- **NOW (2026-09-25, from about 11:14Z): the wake bridge's todo 1 is open.** The owner paired
  this seat with Titan turns Ether (01a0d8, Codex), Luna stirs Radiance's successor, at about
  10:45Z ("you are now partnering with Titan turns Ether (01a0d8)"). The pairing channel is
  `.agent/collaboration/rapid-comms/2026-09-25-codex-dialogues-swallow-holds-drift-and-titan-turns-ether.md`.
  The probe protocol agreed there:
  - Titan runs the TUI legs, driven through a terminal multiplexer, in the owner's Codex home. A
    fresh disposable home reports "Not logged in" on 0.157.0. The session gets a scratch cwd,
    read-only sandbox, approval `never`, `--no-daemon`, plugins off and the user MCP servers
    overridden off. Cleanup compares process sets taken before and after the run.
  - The tmux run is recorded as the TUI client only. The editor-terminal host stays unproven
    until the owner-held acceptance run.
  - The desktop legs need an owner step (the owner at the keyboard, or the owner's word for a
    computer-use seat), which this seat puts to the owner.
  - The findings are a dated addendum to the concept note, in a small PR of Titan's under
    Titan's claim, reviewed by this seat.
  - The Cricket-clause edit is still owed, and is not a gate. The call-inspection PR in this
    lane (the `dialogue-turn` and `run-turn` integration tests' remaining `.calls` assertion)
    comes after the owner's test-doctrine retirement lands.
  - **TUI legs run by Titan at about 11:26Z** (0.157.0, one run each, tmux, a disposable Codex
    home linked to the owner's login):
    - idle wake;
    - typed input first, then queued;
    - a queue during an active turn ran after the turn completed;
    - a queue to a killed TUI was accepted and ran only on an explicit resume.
    None breaks the mechanism. The desktop and editor-terminal hosts are unproven.
  - **The Director's check-in 10 (11:21Z), answered at about 11:36Z.** Cricket suite 10:
    7 ON-TRACK, 1 DRIFTING, 0 WRONG-PRIORITY, 0 UNDELIVERED. The frame verdicts: 5 sound and
    3 flagged, of which 2 were accepted and 1 rejected.
    - The DRIFTING (high, adversarial) was accepted: the order of the dialogues node's remainder
      (1b-iv, slice 2, slice 3 after the bridge's slice 2, the wake sink) was this seat's reading.
      **DECIDED by the Director at about 11:38Z under lens 5, no card**: the order stands.
      "the inflight work" was the three PRs now merged, and the strategic focus is membership.
      The owner can overturn it with a line; the Director stated the verdict to them.
    - Card A (the owner's, in the Director's report to them with the "not now" alternative) put
      the desktop legs to the owner: the owner at the keyboard, with Titan queuing;
      a computer-use seat not recommended. The desktop killed-session leg is left unrun,
      because Titan's own seat runs inside the desktop app.
    - **Card A CLOSED by the owner's word, about 11:40Z** (relayed by the Director), verbatim:
      "why do we need the ChatGPT desktop host? My interest is Codex CLI". Also, verbatim: "nope!
      They were both started via the terminal with `codex`". So todo 1 is scoped to the Codex
      CLI, and the desktop legs are not run. This seat's claim that Titan runs inside the desktop
      app was an inference from a process name, and it was wrong. First-hand parentage: the
      app-server (pid 35269) was spawned by a `codex` TUI (35243) under zsh in Cursor's terminal
      pty-host. The bridge node's todo 1 and its acceptance criterion are amended to the CLI,
      with a dated disposition. The exchange row to the second estate is owed; the exchange
      seat is unheld until Myrtle turns Canopy takes it. Titan was asked to repeat the
      idle-wake and active-turn legs in the mode seats run, the TUI with its managed
      app-server, because the first legs used `--no-daemon`.
    - A correction to the Director: the two watchers under supervisor pid 35269 are Titan's, not
      Luna's. The app-server started at 10:43:01Z, and the watchers at 10:47:01Z and 10:55:21Z,
      after Luna's 10:34Z closeout.
- **STRATEGIC FOCUS SWITCHED at the owner's word, about 15:27Z on 2026-09-24**, verbatim: "Finish
  the inflight work, but switch strategic focus to making Codex a first class peer in the
  Practice". The Director was told as the downward-direction rule requires. Consequences:
  - **In-flight, to finish to merged**: 1b-ii, PR 190 (1b-iii), and Luna's PR 193.
  - **Sequenced after the wake bridge's slice 2 lands**, by this seat's reading of the owner's
    focus switch (the sequencing is the seat's, not the owner's words), unless the owner
    re-sequences them:
    1b-iv, slice 2, slice 3 and the trial close-out.
  - **The new strategic work**: a worked Codex membership programme under
    `agent-platform-citizenship`. Its first step is the sketch
    `.agent/plans/delivery/codex-queue-wake-bridge.plan.md`, authored 2026-09-24 about 15:35Z,
    uncommitted on the coordination branch. It awaits the owner's ratification, and it
    supersedes the `codex-app-server-idle-wake` sketch on ratification. Its sibling nodes, not
    yet authored, are `PreToolUse` guard parity on Codex seats and the live acceptance seat.
  - **The co-owner: Luna stirs Radiance, CONFIRMED by the Director at about 15:35Z.** The Director
    first named Forge herds Vapor, but Forge stood down at 13:18Z (comms `ab6c44af`), and the
    Director accepted the correction. Forge's 10:39Z ask is named as the programme's origin, and
    Luna's seat runs the live acceptance journey. Co-ownership starts with Luna's review of the
    sketch; the questions for it are on the pairing channel at 15:35:43Z.
  - Citizenship text is shared Practice text, so its doctrine lands as the same bytes in both
    estates, carried by Siren herds Rudder as an exchange row once ratified (the Director).
- **Team expectation**: the lane owner is a Claude seat. A Codex seat takes code cures on
  1b-iii when one is live. Questions go to the Director (Wick binds Temper, `ed7b48`) with a
  lens verdict, question first. Do not update the Director except with a question or request.
- **Paused again at the owner's word about 15:36Z on 2026-09-24; resumed at the owner's "carry
  on" at 15:42Z** after compaction, re-armed in the recipe's order by 15:44Z. Since then:
  - The continuity commit `f45c8c7d1` and the sketch's own commit `7e9b2cf7f` landed on the
    coordination branch, pushed at 15:47Z.
  - 1b-ii steps 2 to 4 were committed (see its lane).
  - Luna stirs Radiance reviewed the wake sketch (the pairing channel, 15:54:00Z); all four points
    were accepted and folded in, uncommitted.
  - The host gate question was settled by the Director at about 16:00Z. The cure is
    `no-unbounded-host-load` item 6's semaphore, ruled by the owner on 2026-09-07. Corrected at
    about 16:47Z (the Director, from Siren's first-hand read): it is BUILT in jimcresswell.net by
    that morning's PR 162. It gives pre-push gate slots, host bound 2 and ceiling 3, one gate per
    worktree, and loopback slots the kernel releases on death, with tests. The pre-commit slot is
    PR D of the ratified node `commit-as-the-full-local-gate`. This estate carries none of it at
    `engraph` `07d80ec02`; it arrives through Siren herds Rudder's batch three. Nothing is owed
    from this seat on it.
  - The Director's check-in 8 (16:18Z) was answered at 16:21Z. Its Cricket suite: all eight
    delivered, seven ON-TRACK and one DRIFTING (medium, adversarial). That verdict was on the
    load-average sensor, which `no-unbounded-host-load` item 4 disowns on macOS. It was accepted
    and acted on: holds now read the husky gate count, CPU idle and memory pressure. The frame
    verdicts also accepted:
    - 1b-ii's draft PR needs no landing slot;
    - the Codex-specific gap count is 5, not 7;
    - frames cite quotes as `git show <sha>:<path>`.
  - **REOPENED at the owner's word at 18:36Z.** The owner's card via the Director, answered
    before 18:35Z (the card held the Director's turn from about 17:08Z), verbatim: "Swallow
    continues past the line", described as "Swallow lands PR 190 and PR 196 in this session and
    starts the bridge's first step with Luna, naming the reading at each step". The default below
    had already run; the owner's word overrides it. Claim `372ac08b` was still fresh. Reading:
    65.7% at 18:36:28Z ("mistake-prone" zone).
    - **PAUSED FOR COMPACTION at about 18:38Z**, at the owner's word relayed by the Director:
      "Tell everyone who is over the context limit to prepare for compaction, you all know the
      drill, you've seen it a hundred time". Nothing new started. The four monitors were
      stopped, this record committed, and heartbeat-end posted with claim `372ac08b` retained.
      After the compaction, the card word applies to the resumed session: PR 196 first (sync
      past `engraph` `7409e5100`, add "Landed as PR 190" to 1b-iii's todo, ready, both legs,
      door), then the bridge's todo 1 with Luna stirs Radiance, naming the reading at each step.
  - **HANDED OVER AT REST at about 17:27Z by the default below.** No owner word had arrived by the
    harvest. The seat's lane claim `372ac08b` carries the handover record. Heartbeat-end follows
    this commit.
  - **DECLARED HANDOVER DEFAULT (the Director, 17:08Z, under PDR-063)**: context was 54.6% at
    17:05:06Z. After PR 190 lands, if no owner word has reached this seat, it hands over AT
    REST, with PR 196 (1b-ii) in the successor's queue. The owner has the choice on a card
    beside Marten's successor. An owner word to continue overrides the default.
  - The second membership node, `codex-pretooluse-guard-parity`, is a sketch file in the
    primary checkout, uncommitted. It was read from 0.156.1 hook source: `ask` and a bare `allow`
    both fail open on Codex, so a Codex renderer is required.
- **Paused at the owner's word about 14:33Z on 2026-09-24 ("prepare for compaction and stop all
  processes"); resumed at the owner's "carry on" about 14:45Z**, re-armed in the order below by
  14:48Z. Swallow holds Drift holds claims `372ac08b` and `2368c96b`; the pause record
  `.agent/state/collaboration/handoffs/516619-swallow-holds-drift-codex-dialogues-pause-2026-09-24.md`
  stays attached until the claims close. **The re-arm recipe for any later pause or compaction**
  (no compaction leaves a process alive; verify by id first, the task list and the process
  table):
  1. The all-channels watcher, as a Monitor with `persistent` intent, re-armed on expiry. Its
     command, with the session's own pid read from `~/.claude/sessions/<pid>.json`:
     `cd <primary checkout> || exit 1` then `/opt/homebrew/bin/timeout 3600 pnpm
     agent-tools:collaboration-state -- comms watch --platform claude --model claude-opus-5-5
     --supervisor-pid <pid> --step-timeout-ms 120000 --max-events-per-drain 100 --exclude-tag
     heartbeat`. Then `comms assert-watcher-live`, and one foreground sweep of the stream since
     14:33Z.
  2. The peer-liveness delta poll (the recipe in `liveness-heartbeat-cron`, 300-second
     cadence). It pairs with the heartbeat exclusion.
  3. The heartbeat loop: a shell function `cs() { node agent-tools/dist/src/bin/agent-tools.js
     collaboration-state -- "$@"; }`. Never hold the CLI in a variable: zsh does not word-split
     it. Each 240-second tick runs `comms send --tag heartbeat --title ... --claim-id
     372ac08b-49d2-4322-a535-56044bf2a119 --intent-id slice-1b --branch ... --current-cycle-label
     ...` and `claims heartbeat --active <path> --claim-id <id> --now "$NOW"`, the latter for
     BOTH claims (`372ac08b-49d2-4322-a535-56044bf2a119` and
     `2368c96b-fb3a-437d-a7e2-8052328bc644`). Read `heartbeat_at` back afterwards.
  4. The pairing channel tail with Luna stirs Radiance:
     `.agent/collaboration/rapid-comms/2026-09-24-codex-dialogues-swallow-holds-drift-and-luna-stirs-radiance.md`,
     `tail -n 0 -F` piped through an awk filter that drops this seat's own entries.
  5. The Director's Cricket cadence: every registered role, normal then adversarial, one
     identical frame. The frame carries the todos as a quoted excerpt with file and commit, each
     owner word mapped to its todo, status and receiver (with event ids), ABSORBED and
     ROUTED-AWAY as two lists, the seat's own governing todo, a required FRAME VERDICT from every
     role, the "the rule behind every hold, the sensor that will see its release, and when that
     sensor was last read" table, and the authority for every NEXT item. Check-in 6 ran at
     resume (14:50Z to 14:59Z): six ON-TRACK and two DRIFTING (procedure-xhigh, both on the
     never-read door-classification sensor, already read at 14:52Z). The frame verdicts
     accepted: the owner's 14:29:27Z zero-open-PRs standing rule binds this seat too; owner words
     need event ids; a NEXT item without a cited authority reads as unowned.

## Lanes

### Lane: 1b-i, the gate — PR 189, LANDED 2026-09-24 14:59:44Z as `a0a2fead4`

- Merged through the door (`merge-bot merge --pr 189 --expect copilot-pull-request-reviewer
  --expect chatgpt-codex-connector`, exit 0, kind `merged`). Both legs were SATISFIED on the tip
  `4682907ad`: Copilot's review 5305937645 ("Findings: None") and Codex's completion comment at
  14:38:26Z. Rounds: 3; settlement pushes used: 1 of 2 (the `BINDING_FIELDS` cure). Merge-landed
  event `4b4a0cab`.
- The Codex connector's clean result arrives as an ISSUE COMMENT naming the reviewed commit, not
  a review object. The door classifies it: `agent-tools/src/pr-watch/completion-comments.ts`
  reads an unedited "**Reviewed commit:**" comment by an expected reviewer as a review bound to
  that commit, under the owner's 2026-09-16 comment-evidence ruling
  (`.agent/reports/merge-door-comment-evidence-decision-2026-09-16.md`). A refused comment (a
  quota notice, an edited summary) decides only while that reviewer's leg is OWED or timed out.
- The expected set: the "Copilot review for default branch" ruleset is disabled, so Copilot
  does not review on push; it reviews the first push and any tip the bot requests it on. A
  Copilot leg that was requested and answered on the tip goes in `--expect` beside the Codex
  connector.
- Cleanup done 15:01Z: the merge-base deletion sweep was read before the door (every deleted
  line a move or a reviewed cure); the remote branches `feat/codex-dialogue-gate` and
  `docs/codex-dialogue-probe-threat-model` were deleted as the bot; both worktrees and local
  branches removed after a content check (both tips ancestors of `origin/engraph`).

### Lane: 1b-iii, the rollout reader — PR 190, LANDED 2026-09-24 about 17:14Z as `45c838297`

- Cleanup done at 17:16Z: the remote branch was deleted as the bot, and Forge herds Vapor's
  temp worktree and the local branch were removed after a content check (tip `17cd699a1` is an
  ancestor of `engraph`). Claim `2368c96b` is closed. The post-merge harvest at 17:25:13Z was
  clear: no late reviews or comments, and 0 unresolved threads. `engraph` CI on `45c838297` was
  in progress then (CodeQL and Code Quality green); the successor reads its result. The history
  below is kept for the record.

- **Branch**: `feat/codex-dialogue-rollout-reader`, on origin at `5a0a8d189` (Luna stirs
  Radiance's cure, pushed by Luna through `merge-bot push` at the pause's delegation; verified by
  `git ls-remote` at 14:57Z). The worktree is Forge herds Vapor's temp worktree
  `oce-wt-codex-dialogue-rollout-01a0d2` (find it with `git worktree list`); its upstream is
  `origin/engraph`, so read ahead/behind against the named remote branch. If a reboot clears the
  temp directory, the branch ref and the commit survive in the primary checkout's `.git`.
- **State**: a draft. Forge herds Vapor implemented it (`29ecb5794`, `e78d4ca30`, `e1c310b71`),
  and Blazar lifts Corona synced it and opened the pull request under the custody in comms event
  `ce99302f`. The body declares a settlement budget of two. The lane owner updated the body at
  13:5xZ under the OWNER'S credential, not the bot's; that is recorded on the napkin.
  - A post-execution code-expert review ran at `59364d65d` and is recorded in the body. It found
    no correctness or safety defect. Its accepted findings were cured by Luna in `5a0a8d189`
    (eight paths, 17 tests, pre-commit 129/129 plus depcruise and knip):
    - the truncation test's runtime branch;
    - eight accepted-and-ignored record types pinned by redacted fixture skeletons;
    - TSDoc on the exports;
    - distinct mismatch kinds;
    - the `RecordedTurnContext` re-export, and helper names;
    - tests for `invalid-json`, `invalid-session-count`, a duplicate `turn_context`, and the
      thread-id mismatches.
  - `on-failure` stays rejected as a shape: in 0.156.1 `protocol.rs` it is only a
    deserialisation alias of `on-request`. The reason is now in TSDoc beside the schema.
  - Rule 10's source is routed to 1b-iv in the body.
- **The boundary with a successor Codex seat** (comms `dc7c5491`, written for Blazar lifts
  Corona, now the lane owner's): the lane owner holds every sync, push of a sync, the pull
  request, review requests, thread replies, dispositions and the door. The Codex seat takes code
  cures to `agent-tools/src/codex-exec/rollout/**` that accepted dispositions call for. It
  announces pickup before editing, works in its own worktree, and names each cure commit
  before pushing. When no Codex seat is live, the lane owner cures and records that in the body.
- **Re-reads of `5a0a8d189` (2026-09-24 ~15:05Z), both CHANGES REQUESTED**:
  - security-expert, which read the `rust-v0.156.1` tag:
    - BLOCKING: the truncation check misses Codex's own `... N bytes omitted ...` exec-output
      marker (the 1 MiB cap).
    - IMPORTANT: a late `session_meta` with no `thread_id` passes the thread-id check.
    - Suggestion: the `unknown` special-path kind.
    - Nit: the `on-failure` note should be TSDoc.
  - test-expert: 28 hand mutants, several surviving:
    - unknown nested types;
    - the permissive policy domain;
    - first-turn command output;
    - six ordering guards;
    - the preamble regex.
  - All are accepted, except two routed to 1b-iv, where the verdict consumes them: `network` in
    the turn context, and the reason strings as a closed union. The full list, with file:line
    and vendor-source lines, is on the pairing channel at 15:05:36Z, offered to Luna stirs
    Radiance under `dc7c5491`.
- **The cure commit is `5a695f0f2`** (Luna, named at 15:55:40Z, parent `5a0a8d189`). The lane
  owner verified it at about 16:00Z against all nine items, each with its test, from the shared
  object store. It is bot-authored with no body. Luna's first push failed on one flaky
  `agent-tools#test:e2e` task that passed on its own rerun; the retry follows PR 193's sync.
- **READY since 16:27:11Z.** The dispositions are recorded in the body (a bot write, about
  16:10Z). Copilot was requested automatically when the PR went ready (timeline, 16:27:13Z), so
  the explicit request returned HTTP 422. `@codex review` was posted as the bot at 16:27Z. Both
  legs bind `5a695f0f2`; all its checks are green.
- **Round one**: Copilot's review 16:31:03Z on `5a695f0f2`, "Approval recommended", with one
  Observation (thread `4095991046`, `response-reader.ts:64`). A `call_id` can be reused after
  `readCustomToolOutput` consumes it. Dispositioned as an observation, priced, with no change:
  no fixture or test exercises reuse, and whether codex-cli reuses a `call_id` across a
  rollout's turns is unrecorded. A whole-rollout seen-set would make a legitimate rollout
  inconclusive. ROUTED to slice 1b-iv, where the verdict consumes the reader, gated on a
  recorded rollout showing whether ids repeat. It is owed as a node ledger row at the next node
  edit; it went into PR #196's node row as `f06807bb9`. The bot replied (`4096113093`) and
  resolved the thread. The Codex connector's leg: "Didn't find any major issues" at 16:30:11Z,
  on `5a695f0f2`. Round one is clean on both legs. Rounds used: 1; settlement pushes used: 0 of
  2.
- **Slot order**: PR 193 merged at 16:25:00Z (`07d80ec02`). Marten took the slot for PR 194 at
  16:26:10Z, and this seat yielded, because PR 190 still needed its first review round. A local
  sync merge, `f2cd4797d` in the rollout worktree, is held unpushed; PR 194's landing makes it
  stale.
- **Next safe step**: on PR 194's merge-landed, merge `engraph` into the branch again, with the
  owner as author, and push once through `merge-bot push`, carrying any round-one cure in the
  same push. Re-request both legs on that tip; the door binds legs to the exact head
  (`pr-watch/reviewer-legs.ts` `bindsTip`). Then take the door with `--expect
  copilot-pull-request-reviewer --expect chatgpt-codex-connector`.
- **Do not publish** the original rollouts behind the fixtures; only redacted projections are
  committed. Forge's pickup index (comms broadcast, 13:34Z) names them for local
  re-verification.

### Lane: 1b-ii, the cleanup row — PR 196, LANDED 2026-09-25 about 11:14Z as `1a4450a69`

- **Landed**: synced once past `engraph` `f08201ab0` (merge `cd8466380`, owner-authored), then
  the node edit `1f1b2d4bb`, pushed through the bot, marked ready at 10:57Z. Both legs came back
  on that head by 11:00Z: Copilot recommended approval with no findings, and the Codex
  connector found no major issues. CI passed 21 of 21. The merge-base deletion sweep was read
  before the door. The remote branch was deleted as the bot, and the worktree and local branch
  were removed after a content check (the tip is an ancestor of `origin/engraph`). The history
  below is kept as the record.

- **Where**: worktree `oce-wt-codex-dialogue-cleanup-row` beside the primary checkout, branch
  `feat/codex-dialogue-cleanup-row`, off `engraph` at `a0a2fead4`. Built and installed. No PR yet;
  the draft PR opens with the first push, through `merge-bot push`. The branch is behind `engraph`
  (PRs 191 and 192 landed since); it syncs at its landing slot, after PR 190.
- **Step 1 committed**: `db726e641`, "a dialogue id is a bounded lowercase slug". It adds
  `cleanup-row.ts` (`DialogueId`, `parseDialogueId`) and 16 tests. Slip: it was committed without
  `--author`, so it is bot-authored. The rule calls that outcome fail-safe, and it is corrected
  forward: every later commit passes `--author="Jim Cresswell
  <1314980+jimCresswell@users.noreply.github.com>"`, the value read from `4682907ad`'s author.
- **Steps 2 to 4 committed, owner-authored**, each through the full pre-commit:
  - `10f77553c`: `threadsCreated(run)` and `CodexRun.killed.stdout`, plus killed-stays-killed.
  - `a34b104e6`: the rows on the turn path, including the refused-row failure. It was planned as a
    fourth step, and lands here because no commit may ignore the append's `Result`.
  - `6b5bd7955`: the node edit (the cleanup paragraph, exit 4, 1b-0 and 1b-i landed, the ledger
    row for the rejected resume request).
  - 198 codex-exec tests pass. The post-execution code-expert, test-expert (focused) and
    security-expert (focused) reviews were launched at about 16:05Z.
- **The design, settled by the pre-execution code-expert and test-expert (2026-09-24 ~15:15Z)**:
  - **The rule.** On OPEN only, every distinct thread id named by `thread.started` that parses as
    a `ThreadId` gets one row, whatever the verdict. `unlaunchable` writes none, and an invalid id
    writes none.
  - **Resume writes no row. REJECTED: both reviewers' "amend the node so `--dialogue-id` rides on
    resume".** Codex 0.156.1 source shows a UUID resume never creates a thread:
    `exec/src/lib.rs` `resolve_resume_thread_id` returns the UUID as given, and app-server
    `thread_processor.rs` `thread_resume_inner` errors when `read_stored_thread_for_resume` finds
    no thread. A stray thread on resume already fails as `thread-mismatch`, carrying the id. The
    node's CLI ("exactly one of `--dialogue-id` and `--thread`") stands. Name the limit in TSDoc.
  - **The request.** `TurnRequest` becomes open-carries-`dialogueId`, resume-carries-`thread`.
  - **Killed runs keep their output.** `CodexRun.killed` gains `stdout`: the partial output
    `spawnSync` returns on a timeout, a signal or an overflow. Add one verdict case: a killed run
    whose partial stream reads as a whole reply still fails as `killed`. Document that
    `unlaunchable` means no process started.
  - **Selection is pure.** A pure `threadsCreated(run)` lives in `cleanup-row.ts`, beside
    `DialogueId` and `CleanupRow = {dialogue_id, thread_id, created_at}`. `envelope.ts` stays
    unchanged; it is at 230 of its 250-line cap.
  - **The ports.** `now: () => Date` (the core calls `toISOString`) and `appendCleanupRow: (row)
    => Result<void, string>`. The test fake is an IN-MEMORY MAP, and tests assert its contents.
    The owner's 2026-09-24 test ruling bars call inspection: "never test config or implementation
    (no call inspection, no config pins)".
  - **A failed append.** Attempt every row. Then return `err({kind: 'cleanup-row-unwritten',
    threadIds: <only the unwritten, a non-empty tuple>, reason})`, superseding the verdict.
    Endorsed; losing one reply is cheap. The node's exit-4 list gains "a cleanup-map row that
    cannot be written".
- **The tests still to write** (test-expert's list): the success row's content; the verdict
  kinds `turn-failed`, `malformed-turn` (a stream ending before completion), `nonzero-exit`,
  `unexpected-item`, `unrecognised-output`, `no-agent-message`, and killed with timeout, overflow
  and signal; dedupe (the same id twice gives one row); a mixed valid and invalid id gives one
  row; two distinct ids give two rows; an append failure names only the unwritten ids. In
  `turn-verdict.unit.test.ts`: killed-stays-killed with a whole reply in stdout.
  `run-turn.integration.test.ts`: fixture updates only; the planned runTurn row tests are dropped
  as audit-shaped.
- **Commit order**:
  - step 2: `threadsCreated` plus `killed.stdout`;
  - step 3: the `executeTurn` wiring, the ports and the fixtures;
  - step 4: `cleanup-row-unwritten`, plus the node edit: 1b-0 and 1b-i marked landed, exit 4, a
    ledger row for the resume decision.

  Each commit is a test plus its code, one gate at a time on the host.
- **Reviews after execution**: code-expert (the node: before and after every PR), test-expert,
  focused (the node), and security-expert, focused, recommended by the pre-execution code-expert
  for the slug, the rows as future deletion input, and the fail-closed append.

### Lane: 1b-iv, the probe — not started (trigger: 1b-i, 1b-ii and 1b-iii landed)

- The node's Todos carry its shape. It also settles `apply_patch`'s availability by attempting a
  patch under the exact envelope.
- **Evidence ahead of pickup (2026-09-24 13:51:59Z, Swallow holds Drift, codex-cli 0.156.1, the
  latest release)**: one `codex exec` turn under the envelope's flags and settings with the
  owner's pins (`gpt-6-sol`, `xhigh`), an empty 0700 root and a fake `HOME`, asked for one
  `apply_patch` attempt. The rollout recorded a code-mode `exec` call running
  `tools.apply_patch(...)`, and its output "patch rejected: writing is blocked by read-only
  sandbox; rejected by user approval settings"; the sentinel stayed absent. So the patch tool
  IS offered to this model under the envelope, and its refusal comes from Codex's policy check
  in the tool router, a layer rule 9's `codex sandbox` leg does not exercise. 1b-iv therefore
  adds the second write leg the ledger's 2026-09-24 row names. **Caveat** (Luna stirs Radiance's
  challenge): `CODEX_HOME` was the owner's, not the instrument's own home, so 1b-iv re-runs the
  attempt under the exact envelope once slice 2 creates that home. The re-run is material, not a
  precaution: in `rust-v0.156.1`, `models-manager/src/manager.rs` builds its `FileModelsCache`
  from `codex_home.join(MODEL_CACHE_FILE)`, and `model-provider/src/provider.rs` passes
  `codex_home` to `OpenAiModelsManager::new` when no static catalogue is configured, so the model
  information that gates the patch handler's registration can differ by home (Luna stirs
  Radiance, 14:19Z). That the router refuses on policy before any write is an inference from its
  error text, not read in the router's source. The model's own tool list
  (corroboration only) also named `collaboration.spawn_agent`, `tools.request_plugin_install`,
  `tools.image_gen__imagegen` and the MCP resource tools; the rollout records no tool
  inventory. That bears on rule 10's source, which 1b-iii did not settle and PR 190 routes here.

## Owed

- **The stale-row supersession clause**: owed by the next edit to the node's ledger (the napkin,
  2026-09-24 midday section).
- **The rounds cap versus PDR-140 clause 4**: a doctrine candidate on the napkin. It is not this
  lane's to cure; route it through the Director.
- **The Cricket frame's sixth requirement**, accepted by the Director at about 14:40Z (seat
  wording under review, not a card, overturnable by the owner's word). The clause text is "the
  rule behind every hold, the sensor that will see its release, and when that sensor was last
  read". It goes into the Cricket skill's frame clause (`.agent/skills/cognition/cricket/
  SKILL-CANONICAL.md` §Build one identical frame) as this estate's copy, in a small lane of this
  seat's when the lane resumes. The bytes are the same in both estates, so it is also a goal-one
  exchange row, and Siren herds Rudder (158275) carries that row.
- **The continuity commit**, owed at resume. It lands `napkin.md` (entries from Blazar lifts
  Corona, Marten mends Shadow and this seat, all handed here), this record,
  `review-cost-ledger.md` (the 2026-09-24 rows for #189 and #190), the pairing channel file and
  this seat's formation letter, as a `chore(continuity)` commit on the coordination branch. It
  was not run at the pause, because the owner's word stopped every process.
- **The sketch's own commit**: `.agent/plans/delivery/codex-queue-wake-bridge.plan.md` lands as a
  `docs(practice)` commit on the coordination branch, separate from the continuity commit. It is
  an input to the owner's ratification, which it awaits; it does not become ratified by landing.
- **A host gate lock** (napkin, 15:36Z section): a clear process table is a moment, and this seat's
  pre-commit collided with a peer's pre-push. Route the proposal (a `host:gates` claim area or a
  lockfile the husky gates take) to the Director as a question.
- **The load gate is a workaround.** The pushes' "load below 12" gate (F-197) works around the
  `comms-watch-coordination-home` smoke test's fixed 10-second deadline, which fails under load
  (Blazar lifts Corona's napkin, three instances). This afternoon it held two pull requests'
  pushes for about 35 minutes and hid a defect. The structural cure is the smoke test waiting on
  the watcher's exit signal, already routed to an agent-tools owner. This seat's concept
  exploration asks for its priority to be raised.
- **Luna stirs Radiance's own lane** (Director-routed, not this lane's): the comms-watch `EMFILE`
  hot loop, on `fix/codex-comms-watch-emfile`. Its claim could not open, because F-95 refuses a
  claim without a live watcher and the Director's order forbids the spinning one. Two correct
  interlocks give a degraded seat no lawful claim path; Luna holds custody by comms instead.
- **The trial close-out**: the node owes a close-out of the trial threads in the owner's Codex
  home (the napkin, 2026-09-24 wrap section, "Trial close-out list"). Add the `apply_patch`
  trial's thread `01a0d3af-f4a8-7eb0-b33c-6e121b8c58c8` (2026-09-24 13:51:59Z) to that list.

## Standing constraints

- The owner's permission for Codex experiments (2026-09-23, 13:13Z): run the Codex CLI, close
  every Codex process you start when finished, and never start one with unlimited permissions.
  Always run the latest CLI and record the version tested; it was 0.156.1.
- The owner's goal, relayed by the Director: "bring the Engraph OCE Practice and JC.net Practice
  into alignment". This lane serves it as the invocable second opinion.
- The Director's cadence, at the owner's word (2026-09-24): every 45 minutes, a one-line status
  plus a full Cricket suite. The suite is four roles (cricket-judgement-high, -medium and -low,
  and cricket-procedure-xhigh), each run normal then adversarial on one six-field frame, with no
  model override. Send the Director only a DRIFTING or WRONG-PRIORITY verdict you do not accept,
  or a question.
- Pre-commit and pre-push gates test the working tree, not the index. Freeze a worktree while its
  gate runs.
- **Every third-party write goes out as the bot** (`bot-identity-on-third-party-systems`): pushes
  through `merge-bot push`, merges through `merge-bot merge`, and every `gh` write under a token
  minted with `merge-bot mint-token --scope pull-request-work`, assigned first and checked
  non-empty.
- **Rounds**: the owner's ruling of 2026-09-14 caps review at round two. A later finding gets a
  cure-or-Rejected disposition riding the settlement, never a further round.
- **The landing slot**: one pull request syncs and merges at a time across the estate's seats.
  Read the comms for the current holder before a sync or a door; a ready pull request gathers
  reviews while it waits.
