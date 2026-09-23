# Codex support in the Practice — concept exploration and latest-CLI experiments (2026-09-23)

- **Seat**: Blazar lifts Corona (b65a9a), claude-code / claude-opus-5-5, owner-directed; the owner
  placed this research in the seat's charge.
- **Kind**: dated research record. Every experimental and counted fact in §2 to §4 carries the
  command or file that proves it. Attributions name the seat and the time. The proposals in §5
  are proposals; none is a decision.
- **Reviewed before landing** by Badger seeks Hush (01a0ce), a Codex seat (codex / GPT-5), who
  checked it first-hand against the installed CLI and upstream source. Four corrections and one
  resolved question were absorbed: the time-bound comms count, the wake-bridge trust
  qualification, the causality wording, the version-binding distinction, and the rules-fallback
  source reading. The same seat's own experiments are §2.7.
- **Where that review lives**: it travelled as directed comms events to this seat between 13:33Z
  and 13:49Z on 2026-09-23. Those events are instance-tier state, not tracked (ADR-199). Each
  correction is recorded, credited, in the section it changed.
- **Scope swept**:
  - first-hand reads: the Sif framework, `the-codex-dialogues`, `codex-helper`, `cricket`,
    ADR-180, `.codex/`, `AGENTS.md`, the Codex capability catalogue (2026-07-25) and divergence
    census (2026-07-31), the idle-wake and citizenship plans, the dialogues tally and probe record,
    the review-methodology report (2026-08-09), and `pr-lifecycle`'s bot-reviewer section;
  - three read-only sweeps, whose load-bearing numbers and quotes were re-checked against source:
    doctrine (PDRs, ADRs, rules, directives, executive memory, skills); all four plan estates plus
    reports and research; and the lived record (git log, comms and comms-archive, the claims
    archive, napkins, experience records, `~/.codex/history.jsonl`);
  - experiments on the installed Codex CLI, run under the owner's in-session permission (§2).

## 1. Owner words recorded this session (verbatim)

- Experiments, about 13:0xZ: "the codex cli is installed, I give you permission to invoke it for
  experiments. Please make sure you close down any Codex processes when you are finished with
  them, and do not start any with unlimited permissions".
- Relayed by the Director (Wick binds Temper, ed7b48) at 13:15Z: "the Codex work is happening now,
  I would not have opened a seat for it otherwise". This lifted the hold of about 2026-09-08
  ("do not re-raise the Codex wake before October", `.agent/memory/operational/repo-continuity.md`).
- About 13:23Z: "we in no way care what older Codex CLI versions did or did not do, only what the
  latest version does, we will not pin versions, we use latest".

Earlier owner words that frame the question:

- "you think very differently from the Claude instances in the team, and that is incredibly
  valuable" (2026-07-30, `~/.codex/history.jsonl`).
- "if you can't communicate without supervision, you can't collaborate in the team" (2026-07-11,
  same source).
- "the end goal is that all messages automatically alert the Codex agent when appropriate"
  (2026-07-31, same source).
- "running the codex dialogues approach is high value" (2026-08-09,
  `.agent/memory/active/archive/napkin-2026-08-14.md`).
- Review policy: "a codex or copilot or external claude review is desirable ... but sometimes
  those options are not available, and development still needs to happen" (2026-09-10, `pr-lifecycle`).

## 2. Experiments on the latest CLI (codex-cli 0.156.1, 2026-09-23)

The CLI updated itself at about 12:52Z. `ls -la ~/.local/bin/codex` shows the symlink's mtime.
It points to `~/.codex/packages/standalone/current`, which now resolves to the 0.156.1 release.

Every Codex process started below ran with a read-only sandbox and approval `never`. All were
closed. A process-table read at 13:23:55Z showed only processes that predated the experiments:
Cursor-extension app-servers, and `codex mcp-server` processes launched by Claude sessions before
the update.

### 2.1 `codex exec` works (one-shot)

```bash
codex exec --json --ephemeral --sandbox read-only --skip-git-repo-check -C "$D" \
  --output-last-message "$D/last.txt" "Reply with exactly the text EXEC-OK ..."
```

The run exited 0 and the last message was `EXEC-OK`. Usage was 22,792 input tokens (12,544 cached)
and 7 output tokens: the ambient context of a trivial one-shot.

### 2.2 `codex mcp-server` no longer exists

- **The help diff.** `codex --help` on the release still on disk
  (`~/.codex/packages/standalone/releases/0.153.4-.../bin/codex`) lists
  "mcp-server  Start Codex as an MCP server (stdio)". On 0.156.1 that line is absent, and
  `codex mcp --help` offers only `list|get|add|remove|login|logout`.
- **The failed launch.** `codex mcp-server -c sandbox_mode=read-only -c approval_policy=never`
  exits 1 with `Error: stdin is not a terminal`: the word is taken as a prompt to the interactive
  UI.
- **The probe fails.** `node .agent/skills/the-codex-dialogues/scripts/probe-codex-mcp-server.mjs
  --candidate` prints `PROBE FAIL: server exited (code 1)`.
- **Consequence.** The Sif Annex A binding (stdio MCP) cannot launch on the latest CLI. A Claude
  session whose MCP server started before the update keeps the older binary only until it
  restarts. `lsof -p <pid>` on those processes names the 0.153.4 binary.

### 2.3 `codex exec` plus `codex exec resume` carries a read-only multi-turn thread

```bash
codex exec --json --skip-git-repo-check -C "$D" \
  -c 'sandbox_mode="read-only"' -c 'approval_policy="never"' "Turn 1 ... reply ACK-1"
codex exec resume "$THREAD_ID" --json --skip-git-repo-check \
  -c 'sandbox_mode="read-only"' -c 'approval_policy="never"' "Turn 2 ... attempt one write"
```

Observed: turn 2 reported the same `thread_id` and restated `ACK-1`. The single write attempt
(`printf 'SENTINEL' > resume-sentinel.txt`) was refused with `zsh:1: operation not permitted`, and
the sentinel was absent on disk afterwards. `exec resume` has no `--sandbox` flag, so the `-c`
settings carry the authority. The user-level default in `~/.codex/config.toml` is
`approval_policy = "on-request"` with no `sandbox_mode`.

### 2.4 `codex queue` starts a turn on an idle interactive session

The design, so it can be re-run:

1. **Start an idle session.** In a disposable directory outside every checkout, start one
   interactive session in a pseudo-terminal:

   ```bash
   (sleep 600) | script -q "$D/tui.log" codex --no-alt-screen -C "$D" -s read-only -a never \
     -c 'projects={ "<dir>" = { trust_level = "trusted" } }' "Reply with exactly READY-1 ..."
   ```

   The inline-table `projects` override avoids the "Trust this folder?" screen without saving a
   trust decision. The dotted-key form `projects."<dir>".trust_level` did not take effect, and the
   session stopped at the trust screen.
2. **Let it go idle.** After `READY-1` the session is idle. Take the thread id from the rollout
   under `~/.codex/sessions/`.
3. **Queue a message:**

   ```bash
   codex queue --thread <id> -s read-only --message "Reply with exactly WAKE-OK ..."
   ```

   It returned at once: `Queued message 01a0ce6e-... for thread 01a0ce6d-...`.

Observed (rollout timestamps):

| Event | Time (UTC) |
| --- | --- |
| queued | 13:22:28 |
| `task_started` | 13:22:33.499 |
| `WAKE-OK` `task_complete` | 13:22:38.393 |

No input reached the session. The queued text appears in the rollout as an ordinary user-role
message.

The shared daemon was absent at both inspections: once with the session idle before queueing
(13:22Z) and once after teardown (13:23:55Z). Each time, `codex app-server daemon version` reported
that `app-server-control.sock` does not exist, and the process table showed no daemon. These are
snapshots; no continuous trace of the wake interval was recorded. The write-ahead log of
`~/.codex/queue_1.sqlite` was updated at queue time.

This is a new primitive. It complements the existing relay; it does not replace it. The estate's
standing position, "an ACTIVE-TURN ALERT, not idle wake", concerns the relay's
`collaboration.send_message`, which this run did not exercise. That position was recorded on
0.146.0 and narrowed on 2026-08-02. It is carried by `use-monitor-for-event-driven-wake.md`, the
generated `AGENTS.md` block and the cross-platform surface matrix, and it still stands for the
relay. Bounded foreground polling stays a named requirement until a queue-based bridge is built
and tested. The Codex review on pull request 178 drew both distinctions in this paragraph.

Not tested in this seat's run. Two of these were later tested by Badger seeks Hush (§2.7):

- queueing while a turn is active, and whether a user's typing takes priority;
- queueing to a session whose process has exited;
- queueing across machines or through a remote endpoint.

### 2.5 Close-down

The interactive Codex session and its `codex-code-mode-host` child survived SIGTERM, and each
needed SIGKILL. Any recipe that closes Codex sessions must check the process table afterwards,
not assume a signal worked.

### 2.6 Present on the latest CLI and not exercised here

- `codex agents` (sessions on the shared local app-server daemon);
- `codex app-server daemon start|stop|proxy|...` and `remote-control`;
- `codex review` and `codex exec review`;
- `codex exec fork`;
- feature flags: stable `sleep_tool`, `goals` and `in_app_local_automation`; under-development
  `agent_message_board` and `send_message_to_user_async`; `multi_agent_v2` stable but off by
  default.

### 2.7 Checks run from a Codex seat (Badger seeks Hush, 01a0ce, 13:44Z to 13:49Z)

Run on the same installed CLI, under the same owner constraints. The seat reported every process
exited and a process-table audit found none left.

Proof: the seat ran its disposable sessions under a separate, disposable Codex home, so the
rollouts are machine-local and untracked; they are named here by session id. The queue checks
used `codex queue --thread <session-id> -s read-only --message "<reply-token prompt>"` against
session `01a0ce81-a2e0-7911-9c6b-28c3c670b18a`, whose rollout records the event times below. The
collaboration-surface reading comes from the `turn_context` of the seat's own session,
`01a0ce73-e40d-74c2-86aa-c73cc8d8a6ba`.

- **Collaboration surface.** `collaboration.send_message` is present and worked in both
  directions with the seat's relay child during an active turn. The seat's rollout
  `turn_context` records `multi_agent_version=v2`, model `gpt-6-sol`, effort `xhigh`. The injected
  PDR-027 identity declares GPT-5, so the declared model and the effective model differ, as the
  2026-07-31 census found.
- **Queue during an active turn.** The message was held, not steered into the running turn.
  The running task completed at 13:44:58.374Z, and a separate queued user-role turn started at
  13:44:58.454Z, replying `ACTIVE-QUEUE-OK` at 13:45:00.815Z.
- **Queue to an exited session.** `codex queue` accepted the message, and no turn ran until an
  explicit resume, which replied `EXITED-QUEUE-OK` at 13:46:26.680Z. This is one run: the message
  survived the clean exit of session `01a0ce81-…` in a disposable Codex home. Other exit modes (a
  killed or crashed process), longer gaps, and other session states were not exercised.
- **Not run:** `exec resume` without the sandbox pin. Under the user configuration it could
  broaden permissions, which the owner's constraint forbids.

Still untested: whether a user's typing takes priority over a queued message at an idle
boundary, and queueing across machines or through a remote endpoint.

## 3. The participation record

- **Claims.** The claims archive holds 378 Codex claims out of 1,709: July 331, August 46,
  September 1. The last was Phoenix tracks Lustre, 2026-09-09. Recomputed from
  `.agent/state/collaboration/closed-claims.archive.json` by `agent_id.platform`.
- **Comms.** At a count taken about 13:20Z on 2026-09-23, there were 1,191 Codex-authored events
  (833 of them heartbeats) from 25 seats, the last at 2026-08-12T05:05:47Z. Recomputed over
  `comms/` and `comms-archive/` by the author's `platform`; the stream is retained from 2026-07-28.
  A Codex seat, Badger seeks Hush (01a0ce), joined at 13:32Z the same day, after this count.
- **Since mid-August**, Codex reaches this estate almost only as the GitHub PR-review connector.
  Its findings hold up: on #77 all fourteen were real and cured
  (`.agent/memory/active/archive/napkin-2026-09-10.md`). It has repeatedly run out of credit:
  - 2026-09-10 to about 09-16 (`pr-lifecycle`);
  - 2026-09-21, the limit lifted at 12:20Z and was back at 13:39Z (the three-estate exchange
    channel);
  - 2026-09-23, from 11:15:42Z to about 13:03Z (comms events `ac698fc9` and the 13:04:46Z
    broadcast).
- **Tool usage.** The skill usage census of 2026-09-03 records `codex-helper` as never invoked
  under the `oak-` prefix. The dialogues trial closed 4 dialogues, all between 08-02 and 08-06,
  with 3 closing `position-changed` (`the-codex-dialogues-trial-tally-2026-08.md`).

## 4. State of the estate's Codex surfaces (2026-09-23)

- **The dialogue trial.**
  - The trial window ended 2026-08-16. Its close-out was never run:
    `~/.codex/sif-dialogue-cleanup-map.jsonl` still holds 4 rows, last modified 2026-08-06.
  - The probe pins 0.146.1 (`references/probe-record.md`).
  - The local `.mcp.json` names the server `codex-dialogues`, while the tracked template and
    check 1 expect `codex`.
  - The stdio binding itself is now gone (§2.2).
- **Version binding of evidence.** Sif's version gate (plank 2) binds a binding's evidence to the
  version its probe tested. Its dialogue-open check re-runs the probe in candidate mode against
  the installed upgrade; it never requires installing an old version. The owner's ruling (§1)
  settles runtime currency: use the latest. It does not by itself remove the rule that
  unverified behaviour cannot open a dialogue. The break today is that the latest CLI fails the
  candidate probe (§2.2). Badger seeks Hush drew this distinction in review.
- **How rules reach a Codex seat.** Upstream `codex-rs/core/src/agents_md.rs` orders
  `AGENTS.override.md`, then `AGENTS.md`, then the configured fallbacks, and takes the first file
  found in each directory. This repository has a root `AGENTS.md`, so `RULES_INDEX.md` never loads
  through `project_doc_fallback_filenames`. It reaches a Codex seat only because `AGENTS.md` links
  it and says to read it. This is a source reading of upstream `main` by Badger seeks Hush, not a
  runtime probe of 0.156.1.
- **`codex-helper`** carries `-m "codex-auto"` (unverified), names `mcp__codex__codex`, and writes
  `/oak-start-right-quick` where Codex takes `$oak-...`. Its grounded template has the invoked
  Codex run start-right and commit, which contradicts Sif's rule that an invoked Codex "never
  registers identity, opens claims" (`sif/SKILL-CANONICAL.md`, "Instrument, not citizen").
- **Cricket.** The Claude panel is four Claude roles and the Codex panel runs only on Codex hosts
  (`cricket/SKILL-CANONICAL.md`). Sif's cell map files "Cricket Codex legs" as cross-vendor one-shot,
  but from a Claude seat Cricket is same-vendor only.
- **ADR-180** says the `run` subcommand is deferred and later refers to "the current `run`
  subcommand". `agent-tools/src/codex-exec/` holds only `last-message`.
- **Guards on Codex seats.** Codex seats run the SessionStart identity hook only, with no
  `PreToolUse` guard (`.codex/config.toml`). The Codex entry in `.agent/hooks/policy.json` carries
  `review_by: 2026-08-24`, now past.
- **Heartbeats.** `liveness-heartbeat-cron.md` names no mechanism for Codex ("the equivalent
  background-task mechanism").
- **Citizenship.** `agent-platform-citizenship` (ratified 2026-08-01) has Copilot CLI as its worked
  instance, with four delivery plans. Codex membership is described only as "live practice".
- **Unbuilt.** `harness-capability-observability` (MCP-456, ratified 2026-08-01) has no
  implementation in `agent-tools`.
- **The review leg that graduated.** On 2026-09-07 the Codex GitHub connector graduated as a review
  leg. The leg the owner rated "high value" on 08-09 was a local dialogue-based leg, which has not
  graduated.

## 5. Synthesis

### Frame

The owner gives one reason for Codex in both modes: a different way of thinking. It reaches the
estate by three routes:

- membership (a Codex seat);
- invocation (Sif tools called from a Claude seat);
- the vendor's PR connector, which Sif's map omits.

Today it arrives almost only through the connector. That route is automatic, but its credits run
out. Codex membership declined after mid-August (§3), and idle wake was its measured obstacle;
why the seats stopped is still open (§6). The invoked tools were unused and then broken.

### Assumptions this changed

1. **One value, several routes.** The question "how do we support Codex" is better asked per job
   (a second opinion, a review, a bounded lane) than per mode. Sif's line between a called tool
   and a team member still holds for authority and records.
2. **First-class means fitting a role, not copying Claude's mechanisms.** Seat support rebuilt
   Claude's machinery for Codex, and it broke exactly where Codex lacked a native primitive: idle
   wake. §2.4 shows the latest CLI has one. That answers the obstacle behind the July
   missed-message failures ("you have new messages, it does not seem like your watcher is alerting
   you"). Whether that obstacle explains the later decline is open.
3. **Currency: run the latest, verify it at the point of use.** The version gates made the tools
   fail safe: they stopped rather than lie. But nothing noticed they had stopped. The owner's ruling
   fixes the runtime to the latest; evidence stays bound to the version it was probed on. The shape
   that fits both is an automatic re-probe against the installed latest at the point of use, which
   keeps the rule that unverified behaviour does not run.
4. **Automatic routes survive; optional tools decay.** The connector is wired into the merge door
   and stayed in use. The optional tools fell to nothing. This matches the estate's pattern
   `passive-guidance-loses-to-artefact-gravity`.

### Proposals (warrant; what would prove it wrong)

1. **Rebind the dialogues to `codex exec` plus `exec resume`, and drop the MCP binding and its
   pin.**
   - *Warrant:* §2.2 and §2.3. This is the tool with the strongest value evidence.
   - *Wrong if:* resumed threads do not keep read-only authority from the `-c` settings across
     releases, which re-probing at the point of use would show.
2. **Run the trial close-out the plan committed to.**
   - Report the tally, compare against the Claude Cricket runs of 08-02 to 08-16, extract what
     the four rollouts teach, then delete them and the cleanup map.
   - *Warrant:* the ratified decision rule, and the data contract's retention clause.
   - *Wrong if:* the comparison cannot be evaluated at four dialogues. It then reports exactly
     that.
3. **Design a wake bridge from the canonical comms watcher to `codex queue`.** §2.4 is evidence
   that a wake is possible. It is not yet a safe event bridge.
   - The queued text arrives as a user-role message. The idle-wake plan, a sketch deferred since
     2026-08-01 and so not ratified authority, names peer-authored event text reaching user-role
     input as a design hazard, and sets as its proposed acceptance bar that it never does
     (`codex-app-server-idle-wake.plan.md`, §Mechanism and §Acceptance). Meeting that bar would
     mean queueing only a fixed, controller-authored notice carrying no event bytes, with the woken
     seat reading the event through its own canonical comms read.
   - *Warrant:* §2.4, and the owner's goal of 2026-07-31.
   - *Wrong if:* a queued notice overrides a user's typing at an idle boundary (untested). The
     active-turn and exited-session runs in §2.7 held once each: a notice waited behind a running
     turn, and one survived a single clean exit. That is not yet a persistence contract. Recovery
     designed around it needs the untested exit modes probed first. Badger seeks Hush raised the
     trust qualification in review.
4. **Once proposal 2 has reported, decide whether Claude's Cricket panel gains one Codex leg**
   (`codex exec --output-schema`, read-only, ephemeral).
   - *Warrant:* assumption 4, so the different view rides the challenge tool seats already use.
   - *Wrong if:* the comparison fails, or connector-style credit outages leave the leg
     undelivered most of the time.
5. **Automate the candidate re-probe against the installed latest at the point of use.** Keep the
   rule that unverified behaviour cannot open a dialogue, so the evidence record follows the
   runtime instead of gating on a remembered version.
   - *Warrant:* the owner's ruling (§1), and the version-binding distinction (§4).
   - *Wrong if:* a silent vendor change passes the re-probe and harms a dialogue.
6. **At `codex-helper`'s migration to Sif, which is already scheduled, make custody explicit.** An
   invoked Codex never claims or commits; its output is a patch that the invoking seat lands.
   - *Wrong if:* the owner wants invoked Codex implementers that commit. That needs an authority
     ruling first.
7. **Give Codex membership a worked citizenship programme** following the Copilot CLI instance:
   success criteria plus a live acceptance seat.
   - *Warrant:* the node's own bet: "First-class citizenship is behavioural".
   - *Wrong if:* the owner does not want Codex seats in this estate.

## 6. Open questions

- Why Codex seats stopped after mid-August: owner choice, credits, a move to other repositories,
  or the cost of supervision.
- Whether CLI use shares the connector's credit pool. This decides proposal 4's reliability, and
  whether `codex review --base <branch>`, posted on the PR, could stand as a leg during connector
  outages (the 2026-09-10 ruling allows posted subagent reviews).
- Whether a user's typing takes priority over a queued `codex queue` message at an idle boundary,
  and how the queue behaves across machines.
- The failure record on Codex seats (over-investigating, ceremony) was gathered by selecting for
  Codex. It does not show those failures are specific to the vendor. Idle wake is the one failure
  measured as Codex-specific.

## 7. Housekeeping seen, not acted on

- Future-stub copies of the completed Codex identity plan remain in `plans-backlog-2026-07/` and
  the frozen-v1 snapshot.
- The retired hook experiment's thread record is still under `threads/paused/`.
- The research note on Codex hook review links an archive path that exists only in git history.
- `codex-mcp-server-compatibility.plan.md` predates the Codex desktop app connecting to the
  production Oak MCP server on 2026-09-07.
