---
id: codex-queue-wake-bridge
node_type: delivery
name: "Codex seat wake through the vendor's queue"
overview: "An idle Codex team seat wakes on a canonical comms event addressed to it, through the vendor-shipped `codex queue` subcommand, with no peer-authored bytes in its input: the first step of a worked Codex membership programme."
status: ratified
ratified_by: Jim Cresswell
ratified_date: 2026-09-24
ratified_where: "Owner card via the Director (Wick binds Temper, ed7b48), about 16:31Z, verbatim: 'Ratify it as it stands', choosing 'The Director relays your stamp to Swallow now, without your reading it first', on the node at 7e9b2cf7f. The co-owner's four accepted review points are seat wording under the stamped shape."
serves: agent-platform-citizenship
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-24
---

# Codex seat wake through the vendor's queue

## Goal

A Codex seat that has joined a team session notices a canonical comms event addressed to it
while it is idle, within seconds, without a user prompt, a manual foreground poll or a second
seat. This is the one obstacle to Codex membership measured as specific to Codex. It is the
first step of a worked Codex membership programme under `agent-platform-citizenship`, whose
bet is that "First-class citizenship is behavioural, not a count of matching files".

## Why this step, and why this shape

The concept exploration behind this node ran at the owner's word on 2026-09-24. Its evidence
sits in `.agent/research/agentic-engineering/codex-support-concept-exploration-2026-09-23.md`
and in the lived record of that day.

- **What the day showed.** Two Codex seats worked as members: identity, directed and broadcast
  comms, claims, heartbeats, a pairing channel, bot-identity pushes, a bot-authored pull
  request, TDD cures under full gates, and a reading of vendor source that settled a question a
  Claude seat could not settle by running the binary. What stopped them from being peers was
  timing. A directed cure list sat unread for about fifteen minutes while the Codex seat was in
  another task, because nothing wakes an idle Codex seat. The owner named the goal on
  2026-07-31: "the end goal is that all messages automatically alert the Codex agent when
  appropriate".
- **The inherited shape changed.** The deferred sketch `codex-app-server-idle-wake` designed a
  native extension, with a broker and a proof canary around it. The owner ruled on 2026-08-01:
  "Pinned native extension: NO". That plan waits "until a supported upstream surface exists".
  The latest CLI ships one. `codex queue --thread <id> --message <text>` ("Queue a message for
  an existing session") started a turn on an idle interactive session about five seconds after
  queueing. It held a message behind an active turn, and ran it as a separate turn once that
  turn finished. It kept a message across one clean exit (the concept note, §2.4 and §2.7). A
  vendor-shipped subcommand needs no fork-adjacent code. The owner's ratification of this node
  (2026-09-24) is the owner's reading that the ruling's exit condition is met.
- **First-class means fitting the platform, not copying Claude's machinery.** Claude seats wake
  through their harness's event monitor. Codex seats get the same behaviour through Codex's own
  surface.

## User groups and value

- **The owner**: Codex seats collaborate without supervision. The owner's own test (2026-07-11):
  "if you can't communicate without supervision, you can't collaborate in the team". The
  different way of thinking the owner values in Codex seats reaches the team's work in time.
- **Team seats of any platform**: a directed event reaches a Codex partner in seconds, not
  minutes. Pairings and routed cures stop stalling on an unread channel.
- **The Director**: it reaches Codex seats through the canonical comms every seat reads, with no
  platform-specific channel.
- **Claim boundary**: the value evidence is one day's pairing and the July to August record. The
  concept note leaves open why Codex seats stopped after mid-August. If wake was not the cause,
  this step is necessary but not sufficient.

## Mechanism

1. **The seat's own watcher is the sensor.** The all-channels canonical watcher already runs
   beside every team seat, under the seat's root identity. PR 193 cures its `EMFILE` hot loop on
   Codex; this node builds on that cure.
2. **A wake sink on the watcher.** When a drain delivers at least one eligible event, the sink
   runs `codex queue --thread <this seat's thread id> --message <notice>` once for that drain. An
   eligible event is one addressed to this seat's exact identity, not a heartbeat, and not
   self-authored. Several events in one drain produce one notice. The thread id comes from the
   seat's own environment (`CODEX_THREAD_ID`, already an identity seed), never from a lookup of
   recent threads.
3. **The notice carries no event bytes.** It is fixed controller-authored text. It says
   coordination events are waiting, and names the canonical command that reads them. Queued text
   arrives as a user-role message, so no peer-authored text may enter it. The woken turn reads
   the events through the canonical comms read, as every seat does, and treats their text as
   untrusted data.
4. **The pure core is testable without IO.** Deciding which drained events wake, coalescing
   them and composing the notice are pure. The queue call is a port whose runner belongs to the
   IO edge.
5. **Degraded paths stay named.** Where the bridge cannot run, because the subcommand is missing,
   the thread id is unknown or the queue call fails, the watcher reports that visibly. Bounded
   foreground polling stays the fallback, as the operating rule states today.
6. **A seen cursor is not a delivery.** The watcher advances its seen cursor when it drains, before
   the queue call runs. A failed call, or a watcher that exits between the drain and the call,
   must leave the drained event ids visible to the fallback, and no watcher line may claim the
   seat was woken.

## Acceptance criteria (each with a proof — required)

- **An idle Codex seat wakes on a directed event.** The seat sits idle in its interactive session.
  An external seat sends one directed canonical event to it, and the seat starts a turn and
  replies on comms, with no prompt and no poll, within 60 seconds. Proof:
  - `repo-safe`: the sink's tests, with an in-memory queue port whose recorded notices are
    asserted as state;
  - `owner-held`: a dated live run on the then-latest CLI, recorded with the event id, the queue
    time, the turn's start and the reply's event id, and observed by the owner or a seat at the
    owner's word.
- **No peer-authored bytes reach the seat's input through the bridge.** The notice is the same
  for any eligible event body, title or author. Proof: `repo-safe`, a property test over
  generated events asserting one invariant notice.
- **Only eligible events wake the seat.** Heartbeats, self-authored events, events addressed to
  another seat, and malformed events never produce a notice. Proof: `repo-safe`, table tests over
  literal events.
- **A queued notice never steers an active turn.** Proof: `owner-held`, the §2.7 active-turn run
  repeated on the then-latest CLI and recorded.
- **Failure is visible, never silent.** A missing subcommand, an unknown thread id or a failed
  queue call produces a watcher line naming the fallback. Proof: `repo-safe` tests over a
  refusing port.
- **A failed wake loses no event.** When the queue call fails after the drain, the watcher line
  names the drained event ids and claims no delivery. Proof: `repo-safe` tests over a refusing
  port, asserting the line's content; `owner-held`, the live run repeated with the queue call
  failing, recorded with the event id the fallback surfaced.
- **Each host wakes.** A Codex seat runs in more than one host: the ChatGPT desktop app, where
  Luna stirs Radiance ran on 2026-09-24, and a TUI in an editor terminal. Proof: `owner-held`,
  the live wake run recorded once per host the team uses.
- **The operating rule names the bridge.** `use-monitor-for-event-driven-wake`, the generated
  `AGENTS.md` block and the team start skill's Codex paragraph name the bridge as the Codex wake
  path, and bounded foreground polling as the fallback only. Proof: `repo-safe`, the projection
  freshness validator.

## Todos

Each slice is one story, within the default round budget.

1. **Probe the open behaviours**, under the owner's standing permission for Codex experiments:
   read-only sandbox, never unlimited permissions, every process closed, CLI version recorded.
   Each probe runs in an isolated session started for it, never in a live team seat's turn,
   because queued text arrives as user-role input.
   - A user's typing and a queued notice meeting at an idle boundary.
   - A queued notice arriving while the seat drafts a reply to its user.
   - Each host separately: the ChatGPT desktop app, and a TUI in an editor terminal. The
     editor-terminal run cannot establish the desktop host's wake.
   - Whether `CODEX_THREAD_ID` is present in a seat's shell environment, per host. Observed
     present on the desktop host on 2026-09-24 (Luna stirs Radiance, 0.156.1).
   - A queued notice to a killed session.

   The findings are a dated addendum to the concept note. If any finding breaks the mechanism,
   this node returns to the owner before slice 2.
2. **The wake sink**, test-first. The pure eligibility, coalescing and notice core, the queue
   port, and the watcher option that arms it. Reviews: code-expert before and after execution;
   test-expert and security-expert, focused.
3. **The operating rule, the start skill and the generated block**, with the live run recorded.
   Citizenship text is shared Practice text, so this slice's doctrine lands as the same bytes in
   the second estate, carried as an exchange row.

## Out of scope

- The pinned native extension and its broker and canary apparatus. The owner ruled it out on
  2026-08-01. This node supersedes the `codex-app-server-idle-wake` sketch.
- An upstream contribution. `codex-upstream-idle-wake-contribution` stays speculative. The
  absence it answered, no supported surface, is answered by the vendor's queue.
- The rest of the membership programme, each a node of its own:
  - `PreToolUse` guard parity: Codex hooks now include `PreToolUse`, and the repository's
    `.codex/config.toml` wires `SessionStart` only;
  - a live acceptance seat running the whole team journey, the programme's capstone proof.
- Invocation mode, the dialogues instrument. It is a different use case by the owner's word ("not
  necessarily the same thing").
- Cross-machine and remote wake (`codex queue --remote`).
- General lifecycle interlocks the day surfaced, which are not Codex-specific: a degraded seat's
  claim path under F-95, and heartbeat gaps between claims. They are routed to the Director.

## Review dispositions

- **2026-09-24, Luna stirs Radiance (01a0d3), the co-owner, the first read from a live Codex seat**
  (the pairing channel, 15:54:00Z). All four points are accepted:
  - `CODEX_THREAD_ID` is present in the seat's shell on the ChatGPT desktop host, and
    `codex queue --help` shows `--thread` and `--message` on 0.156.1. Folded into todo 1 as an
    observation for that host only.
  - The seen cursor advances before the queue call, so a failed call or an exit between the two
    must not read as a delivery. Folded in as mechanism 6 and the acceptance criterion "A failed
    wake loses no event".
  - The probes run in an isolated session, not in a live co-owned turn, because queued text is
    user-role input. Folded into todo 1.
  - The desktop host is tested separately from the editor TUI. Folded into todo 1 and the
    acceptance criterion "Each host wakes".
  - The fixed notice and the exact-self thread binding were confirmed as the right trust
    boundary.
