# No Unbounded Host Load

The host machine is a shared substrate: the owner's computer, every live
agent session, every gate chain, and every monitor run on it together.
Saturating it is a denial of service against all of them at once — and the
damage is invisible to agents, who watch comms, git, and PRs but not the
host, so the symptoms get misattributed to tooling.

**Owner directive (2026-06-11, maximum severity): this must never happen
again.**

## Rule

1. **No experiment gets host-level load by default.** Before spawning ANY
   synthetic load, ask whether the effect can be provoked in-process —
   fake timers, deterministic interleaving, injected delays. For timer
   races and scheduling flakes the in-process route almost always
   suffices; ambient host load is the wrong instrument and was not shown
   necessary even in the founding instance.
2. **Any spawned process is bounded, owned, and reaped — by construction.**
   - *Bounded*: a lifetime limit built into the invocation — GNU
     `timeout <seconds> <cmd>` where available; on macOS (which ships no
     `timeout` — the founding incident's own platform) use the repo's
     documented substitute `perl -e 'alarm <seconds>; exec @ARGV' -- <cmd>`
     (see `codex-helper` SKILL §timeouts). Never an open-ended loop the
     spawner promises to remember.
   - *Owned*: the spawn is recorded (pid captured) at the moment it
     happens.
   - *Reaped with proof*: the spawning step ends with a process census —
     `ps` evidence of zero survivors — not an assumption. A reaping
     intention that lives only in prose does not count; the day's evidence
     is that prose discipline does not fire under context pressure.
3. **Proportionality if load is genuinely required**: bounded duration,
   `nice`d below interactive priority, never per-core saturation of the
   shared host, and announced (a comms event naming the load, its bound,
   and its purpose) so peers can attribute slowdowns correctly.
4. **Host health is a first-class signal — read it with platform-correct
   signals.** Check host saturation at session bootstrap and before/after any
   load-bearing experiment. A genuinely saturated host is a stop-and-surface
   signal — never background noise to work around. **But read the right signal
   for the platform**, or a healthy host reads as a starved one. On Linux,
   load-average-vs-core-count plus swap pressure is the reading. **On macOS that
   reading over-reads and false-positives**: macOS load-average counts
   I/O-blocked / uninterruptible threads, so it sits well above core count on a
   healthy machine, and a large `vm.swapusage` "used" figure is normal proactive
   paging of inactive pages, not memory exhaustion. The macOS-correct saturation
   signals are **CPU idle %** (`top -l1`, Activity Monitor) and the
   **memory-pressure colour** (green / yellow / red) — not load-avg-vs-cores or
   raw swap-used. Owner-evidenced 2026-06-28: a session-long ~16–22/14 "load" +
   ~5 GB swap-used, read as host pressure by more than one agent, was shown
   healthy by Activity Monitor (CPU idle 67.7 %, memory-pressure green) — a
   Linux-shaped misread. The founding worked instance below was a *genuine*
   host-load DoS, so the rule's force is unchanged; what changes is that on
   macOS load-avg and swap-used alone do not establish saturation, and a related
   symptom — watcher drain-step deaths in a busy multi-agent window — is
   comms-volume cost, not host starvation.

5. **Heavy-chain windows on a shared host: read-then-announce, two
   consecutive readings, diagnose kill-collateral.** When peers serialise
   heavy gate chains through announced windows (the one-heavy-chain-at-a-time
   shape):
   - The load read must COMPLETE before the window-OPEN broadcast is
     composed — announce-after-read, never announce-then-read (a window-OPEN
     posted in the same turn as the `uptime` call read back 26.5 on 8 cores
     and needed a retraction).
   - A single low reading rebounds under active peer chains: require TWO
     consecutive sub-threshold readings ~30 s apart before opening a window
     (three worked instances across two seats, 2026-07-07 — oscillation at
     the bar is real).
   - Killing a shared-host chain kills OTHER chains' gate legs: a directed
     `pkill -f "turbo run"` also killed an innocent in-flight pre-commit's
     turbo gate, producing a phantom red on a one-line commit. Diagnose
     kill-collateral before treating any post-kill red as real.

6. **Concurrent full local gates are bounded at two, ceiling three — by a
   mechanism, never a declaration.** Owner ruling (2026-09-07, verbatim):
   "the local machine can only support two, max three simultaneous full
   local gates because they are compute intensive. None of this is about
   ceremony or declarations, it is ALL about engineering." The commit
   queue exists to stop git operations colliding on one index, which
   separate worktrees do not need; the scarce resource its estate-wide
   FIFO was accidentally protecting is the host's capacity for concurrent
   full gates (four refusals and a sixteen-minute stall across three
   worktrees, 2026-09-06). The bound belongs at the gate's spawn path — a
   host-wide semaphore the full local gate acquires, limit 2, hard ceiling
   3, with a test — never a comms announcement, a claim role, or a
   declared window. Owner ruling (2026-09-20, verbatim): "two parallel
   gate runs are fine as long as they are in different work trees". So
   seats on one host run their gates side by side, each in its own
   worktree, up to this item's bound; inside one worktree gate runs are
   sequential. The general move: when a coordination mechanism
   serialises the wrong resource, ask which resource is actually scarce
   and bound that.

## Worked Instance (founding)

2026-06-11: an agent investigating a timer-race flake spawned 14 per-core
`node -e "for(;;){…}"` busy-loops inline at 08:38Z and never reaped them.
Orphaned to launchd, they pegged every core for seven hours, drove ~26 GB
of swap, degraded every concurrent session, and corrupted the day's
diagnostics — watcher drain-timeout deaths were misattributed to
comms-directory scale until a host audit found the loops. The owner's
review doubts the load was necessary at all: the race class is provocable
in-process. Full analysis: the session operations report
(`graph-team-session-operations-and-experience-2026-06-10-11.md`, host-load
addendum).

## Enforcement

- The innate-immunity hook (`.agent/hooks/policy.json`) blocks the
  unambiguous busy-loop and load-tool shapes in commands (`for(;;)`,
  `while(1)`, fork bombs, `stress-ng`) with a reappraisal pointing here.
  The hook is a tripwire for the worst shapes, not the boundary of the
  rule: bounded-owned-reaped applies to every spawn.
- `start-right` bootstrap includes the host-health check; a hot host at
  session open is surfaced before work starts.
- Monitors and heartbeat loops under platform supervision (`Monitor`,
  cron) are compliant by construction when they sleep between ticks and
  die with the session — this rule does not forbid them; it forbids
  unbounded *load* and unsupervised orphans.

## Related Surfaces

- `never-ignore-signals` (`never-ignore-signals.md`) — a slow host is a
  signal; investigate, never work around.
- [`check-singleton-per-window`](check-singleton-per-window.md) — the
  sibling discipline for the repo's own heavy gate chains.
- The session operations report §7 — host-health tooling considerations.
