# Worktree Residency

**Owner directive (2026-07-31, verbatim substance):** when an agent is
working on a worktree, they must change their cwd to that worktree, and
it must be stable until the agent changes it — never bouncing back to
the principal checkout at the harness's discretion.

An agent working a worktree lane RESIDES in that worktree: its working
directory, its doctrine load, and the arm-time context of everything it
starts all point at the worktree. Residency is established by a
session-level mechanism, never by shell `cd` — on this platform a bare
`cd` between checkouts is not residency and does not survive.

## Trigger

Taking up a worktree lane (at claim-open, before the first lane
action); any observed `Shell cwd was reset` line; launching or
re-arming background tasks from a lane session.

## Action

**This rule is the standing project instruction that directs worktree
use** (the `EnterWorktree` tool acts on explicit instruction from the
user or from project instructions — this rule is that instruction): an
agent taking up a worktree lane establishes residency before its first
lane action by one of the two mechanisms below — or, when neither
applies (the owner may be away and the session was not launched
resident), operates the lane NON-RESIDENT from the principal within
the bounds clause 1 sets — and never by shell `cd`.

**The platform fact every clause below rests on** (the
[Claude Code worktrees documentation](https://code.claude.com/docs/en/worktrees),
section "Ask Claude to create a worktree", read 2026-09-08 against
2.1.263)**:** entering a path outside the repository's
`.claude/worktrees/` directory asks the human for approval first,
"because the move takes the session's working directory, write access,
and project configuration such as `CLAUDE.md` and settings to that
location. An `EnterWorktree` permission rule or choosing 'don't ask
again' doesn't suppress this prompt; only `bypassPermissions` mode
skips it. Before v2.1.206, Claude could enter any existing worktree
path without asking." New-worktree creation and paths under
`.claude/worktrees/` do not prompt. This estate's lanes live in the
sibling `-worktrees/` directory (§Platform mechanics says why), so a
mid-session entry is an owner-present step by design, not a defect to
configure away.

1. **Mid-session entry — `EnterWorktree` from the principal, only
   with the owner at the prompt.** The typical estate workflow (owner
   word, 2026-07-31) launches sessions in the principal checkout and
   routes the lane afterwards. The sequence: create the worktree per
   `worktree-hygiene` conventions (`git worktree add`, branch freshly
   cut from the base branch, sibling `-worktrees/` directory), install
   and build it, then — and only when the owner is known to be at the
   keyboard — issue `EnterWorktree` with `path`. **Before issuing it,
   say so** — a directed event to the Director naming the exact
   invocation where a Director is live; in a solo session, the same
   sentence in the reply the owner is reading, immediately before the
   call — because the announcement is for whoever can see the prompt,
   and the seat cannot: a seat cannot see its own prompt,
   and a prompt nobody answers holds the seat indefinitely while its
   heartbeat loop, a separate process, keeps reading fresh. Worked
   instance 2026-09-07/08: an Implementer issued the entry at 21:08Z
   with the owner away; the batch returned at 06:31Z the next morning,
   nine hours later, against a worktree the Director had by then
   removed after landing the lane by a declared default. When the
   owner may be away, do not issue the entry: operate the lane
   NON-RESIDENT from the principal instead (Director ruling
   2026-09-08 — every git command carries `-C <worktree>`, every edit
   an absolute worktree path, one plain command per call), or have the
   lane launched resident (clause 2). Non-resident operation is not
   residency: the session's cwd and doctrine load stay the
   principal's, and the residency-dependent guarantees (arm-time
   context at the worktree, isolation enforcement) do not apply — so
   it is the bounded owner-away alternative to a held prompt, named as
   such in the lane's team-start broadcast, never the lane's default
   shape. The 2026-07-31 probe on 2.1.220 recorded "no approval friction"
   for the same entry because the owner was present and answered it;
   the seat recorded the absence of a prompt it could not see.
   Fresh-cut-from-the-base matters doubly under residency: the
   worktree becomes the session's working context, so a stale branch
   means stale doctrine. **Never let `EnterWorktree` fresh mode CREATE
   the lane worktree**: fresh mode documents branching from the
   remote's default branch, but a `worktree.baseRef` of `"head"` in
   any settings layer bases the new branch on the launching checkout's
   HEAD — on this estate a coordination-branch tip — so lane PRs ship
   with coordination commits riding under the story (PR #673 lost a
   close-and-succeed cycle to exactly this; #674 is its clean
   successor; 2026-07-31, twice at one seat). Create with the explicit
   start point — `git fetch origin && git worktree add <path> -b
   <branch> origin/<base>` — regardless of any setting. A lane found
   mis-cut (three instances in one day, 2026-08-17, all from
   coordination-lineage tips) is fixed forward: rename the mis-based
   branch `scrap/<name>-mis-based`, `git switch -c <ticket-branch>
   origin/<base>`, verify with `git merge-base --is-ancestor`; scrap
   branches await the owner's deletion.
2. **Residency at launch — the prompt-free shape.** When the lane is
   known before the session starts, launch inside the worktree: the
   platform's own recipe for a worktree outside `.claude/worktrees/`
   is the lane-cut skill's steps 1 to 3 in order — `git fetch origin`,
   the cut from `origin/<base>`, the identity check, then
   `pnpm --dir <path> install` and `pnpm --dir <path> build` (BEFORE
   the launch: a worktree built after its session opens shows no
   statusline for that session) — then `cd <path> && claude`; the skill
   owns that ordering, this clause does not restate it. No entry
   happens, so nothing prompts, and isolation enforcement is on from
   the first turn. A coordinated lane launched resident arms its
   canonical watcher INSIDE the worktree by the resident arm clause 4
   verifies (the `cd` rooted at the worktree, the supervisor pid passed
   as a literal), so the route is prompt-free for coordinated and
   uncoordinated lanes alike; nothing in it exits to the principal or
   re-enters. `claude --worktree
   <name>` also launches resident but creates under
   `.claude/worktrees/` on the `worktree.baseRef` base unless a
   `WorktreeCreate` hook replaces creation (the hook receives the
   `name` and must print the created directory; it may place the
   worktree anywhere that is not reached through a symlink inside the
   repository); without such a hook, `--worktree` is the nested,
   setting-based shape §Platform mechanics rejects, so check for the
   hook in the settings before choosing the flag.
3. **`Shell cwd was reset` is a residency-violation signal, never
   noise.** Bash cwd persists only inside the project directory and
   additional working directories; a `cd` into a sibling-directory
   worktree is reset to the project directory by design (documented
   behaviour; reproduced first-hand 2026-07-31 on Claude Code 2.1.220).
   On seeing the line, stop and establish residency properly rather
   than routing around it with repeated `cd` or `-C` improvisation.
4. **Arm monitors where you reside, and verify every one after any
   residency switch.** Background tasks and monitors capture their
   working directory at arm time (documented), so the arm-time
   directory decides what they watch. A principal-resident session arms
   with the watcher rule's canonical block (its first line
   `cd <repo-root> || exit 1`). A worktree-resident session arms the
   same watcher as the fully literal two-line block the watcher rule
   carries under "Worktree residency changes the arm's shape" — its
   `cd` rooted at the WORKTREE, the timeout binary named by the name it
   resolves to (`timeout` or `gtimeout`, read first as a plain command),
   the supervisor pid passed as a literal — VERIFIED 2026-09-08 on
   Claude Code 2.1.263: the arm ran, drained the canonical primary
   stream, and `assert-watcher-live` run from the worktree was green.
   The guard refuses runtime-computed values in the arm: the canonical
   `--supervisor-pid "$PPID"` was refused verbatim as "runs pnpm with a
   value computed at runtime (the variable PPID) inside a construct too
   complex to verify", naming the expansion, not the `cd`; whether the
   canonical block's `$(command -v …)` and `"$@"` scaffolding passes is
   unverified, which is why the resident block is literal throughout.
   So a resident seat reads its own pid first, as a plain
   command, from the harness's session file (`~/.claude/sessions/<pid>.json`
   carries `sessionId`; match it to the session identifier the identity
   hook exported), and writes the number into the arm. The primary
   comms home stays writable through the CLI from a resident session —
   `comms send`, `comms reply`, `claims heartbeat` all wrote from the
   worktree that day — because the guard blocks the `Edit`/`Write`
   TOOLS on main-checkout paths and git redirects, not a Node process
   writing files. After ANY residency switch, verify each monitor
   first-hand (heartbeat mtime, pid, the exit notification) and re-arm
   what died from where you now reside; never exit and re-enter to
   re-arm, since the re-entry prompts (clause 1).

   **Platform-isolation refinement (owner-worded fleet cure,
   2026-08-06):** Claude Code v2.1.223 landed worktree isolation
   mid-fleet-day — worktree-RESIDENT seats refused Monitor arms and
   principal-checkout git while primary-resident monitors passed the
   whole time. Residency determines the guard, not the command. The
   documented checks (worktrees documentation, "How Claude Code
   enforces isolation"): a resident session's `Edit`/`Write` to a
   main-checkout path, a Bash or Monitor command whose working
   directory resolves to the main checkout, any git redirected into
   the main checkout (`git -C`, `--git-dir`, `GIT_DIR`, a `cd` before
   git), and any command shape the guard cannot parse. The 2026-08-06
   refusals were of arms that opened with `cd <repo-root>` — the
   principal's working directory, which the second check blocks — and
   carried `$PPID`, the runtime value the fourth check refuses; the
   worktree-rooted, literal-pid arm above passes both. The CLI is the
   front door; recurring watches belong in agent-tools (the
   watch-commands backlog).

   **A residency switch can kill a primary-armed monitor (observed
   2026-09-01, Claude Code 2.1.25x):** `EnterWorktree` killed a comms
   watcher Monitor armed at the primary — the re-armed watcher exited
   124 within ~30 s of the switch while the first had lived its full
   3600 s backstop — so the arm-time-capture sentence above did not
   hold that day. The 2026-09-08 entry could not re-test it: the
   primary watcher had already died on its hourly backstop while the
   entry prompt waited, so the switch met a dead watcher. After ANY
   residency switch, verify each monitor first-hand and re-arm inside
   the worktree by the resident arm above; an n=1 seat covers the gap
   with `comms list --since <boundary>` sweeps at boundaries. A session
   RESTORE is the harsher sibling: it resets cwd to the primary and
   removes every background task (watcher, pr-watch alike), so re-arm
   before reading the stream (2026-09-02).
5. **Residency never re-homes coordination surfaces.** Comms, claims,
   and the commit queue stay resolved to the PRIMARY coordination home
   with explicit absolute paths, per `worktree-hygiene` clause 8 and
   ADR-197. A resident agent reads and writes the shared stream, not a
   worktree-local decoy.
6. **The Director/principal seat resides in the principal checkout.**
   Residency binds lane implementers (PDR-117): isolate the doing in
   worktrees, centralise the awareness in the principal. A principal
   seat reaching into a worktree for a read uses `git -C <worktree>`
   and absolute paths — reads may roam; residency is declared.
7. **Subagents of a resident session start at the worktree** (a
   subagent's Bash starts at the session's project directory, which
   for a resident session is the worktree). `isolation: worktree`
   pins a subagent to its OWN fresh worktree — a deliberate, different
   choice; verify a spawned worktree's HEAD before trusting it (the
   parallel-dispatch anti-pattern).
8. **Pre-PR contamination check.** Before opening any lane PR:
   `git log --oneline origin/<base>..HEAD` must list exactly the
   story's own commits (`<base>` is the repository's default branch, derived from
   `git symbolic-ref refs/remotes/origin/HEAD`, never a literal; a
   check against the wrong base lists every commit since the mirror
   point as contamination). Anything else is a contaminated base —
   re-cut (`git switch -c <branch>-v2 origin/<base>`, cherry-pick the story
   commits across; history rewrite is hook-blocked on this estate),
   close the contaminated PR with a pointer, and open its successor.

## Platform mechanics (version-pinned)

Verified against Claude Code 2.1.263 and its tools reference,
worktrees, and hooks documentation, 2026-09-08 (superseding the
2026-07-31 read against 2.1.220): cwd persistence boundary and reset
line; background-task arm-time capture; subagent project-directory
start; `EnterWorktree`/`ExitWorktree` session-level switch semantics
and the `.claude/worktrees/` restriction; the approval prompt on any
entry outside `.claude/worktrees/` (since v2.1.206, not suppressible
by permission rules); the isolation checks a resident session is
under; the `--worktree` launch flag and `worktree.baseRef` (`"fresh"`
= the remote's default branch, `"head"` = the launching checkout's
HEAD); the `WorktreeCreate` hook contract. Re-verify from the
platform's current documentation when the CLI major-versions or this
rule's mechanics disagree with observation
(`capability-questions-from-original-sources`) — and remember that a
seat cannot observe a prompt shown to the human: "no friction" seen
from inside a session is evidence about the human's presence, never
about the platform.

Three considered-and-rejected mechanics, recorded so they are not
re-proposed: adding the sibling `-worktrees/` directory to
`additionalDirectories` (the documentation says it grants file access
only, and it would make a bare `cd` silently persist, hiding exactly
the residency violations this rule exists to surface); relocating the
lane convention into `.claude/worktrees/` (that directory is NESTED
inside the principal checkout, and nested worktrees give false-clean
dependency runs — Node resolution walks up into the parent's
`node_modules`, the proven leak `worktree-hygiene` clause 8 records);
and pre-approving `EnterWorktree` in `permissions.allow` (ineffective
by the platform's design — the documentation states that neither a
permission rule nor "don't ask again" suppresses the entry prompt;
this estate carries the entry in its allow list and was held nine
hours at that prompt regardless, 2026-09-07/08). `worktree.baseRef`
is not a cure for fresh-mode's base: a `"head"` value in any settings
layer bases every platform-created worktree on the launching
checkout's HEAD, which is why Action clause 1's explicit start point
holds regardless of configuration. A `WorktreeCreate` hook that
places and bases worktrees by the estate's conventions is the one
configuration-shaped cure the documentation supports for launch-time
creation; it does not change the entry prompt, which belongs to the
`EnterWorktree` tool.

The worktree-isolation guard (Claude Code 2.1.25x, observed 2026-09-01,
2026-09-02 and 2026-09-08) refuses a command it cannot prove stays
inside the worktree: runtime-computed values (`$(…)`, a variable such
as `$PPID`, heredocs carrying them), `env VAR=… cmd`, `--dir`, and a
`cd` into the principal; a two-line arm of `cd <worktree> || exit 1`
followed by one command with literal arguments passes (2026-09-08),
so "multi-line" and "compound" were never the trigger — the
unprovable value was. It also refuses primary-path Write/Edit from a
worktree-resident session. A second fingerprint (two instances, 2026-09-05 and 2026-09-06)
fires on the CONTENT of a script written to the scratchpad when it spells
a machine-local absolute path: derive paths at runtime (`git worktree
list`, `git rev-parse`, `mktemp -d`) and pass them as arguments. The working shapes: one plain command per call; a scratch shell
wrapper, run as one plain command, for env-prefixed commands; and the
Edit tool for edits — a Bash-hook workaround must never generalise into
scripted file editing (owner correction 2026-09-02, verbatim: "why are
you writing python to edit files?").

## Why a rule, not a PDR clause

A discrete operational invariant with one trigger (taking up a lane)
and one action (establish and hold residency), platform mechanics
attached; `worktree-hygiene` owns the lane lifecycle and points here
from its operate-from-a-worktree clause.

## Related surfaces

- [`worktree-hygiene`](worktree-hygiene.md) — lane lifecycle; clause 8
  operating mechanics.
- [PDR-117](../practice-core/decision-records/PDR-117-director-and-implementer-roles.md)
  — the Director/Implementer split residency binds to.
- [ADR-197](../../docs/architecture/architectural-decisions/197-coordination-home-owns-registry-state.md)
  — the coordination home residency never re-homes.
- `.agent/memory/active/patterns/parallel-worktree-dispatch-unreliable.md`
  — the spawned-worktree HEAD verification discipline.

## Why residency also protects the commit path

The primary checkout's pre-commit and pre-push hooks gate the WHOLE working
tree, so any seat's dirty or failing file blocks every seat's commits and
pushes from the primary — a resident lane commits and pushes from its own
worktree instead, and the contention class disappears. Operational note for
worktree pushes: give the push a 600s timeout — the 120s default kills the
hook suite mid-run and produces an ambiguous write.

## Enforcement

Behavioural, with a mechanical tell and an observable surface: the
harness's own `Shell cwd was reset` line marks every violation of
clause 3 at the moment it happens, and the statusline renders the
session's residency live (owner-observed 2026-07-31: during the
residency probe it displayed both the entered worktree and the
principal's coordination branch — where a session lives is glanceable,
per `agent-state-observable`). Lane team-start broadcasts name the
residency (worktree path) alongside the claim. A mid-session entry is
announced on the stream before it is issued (Action clause 1), so a
held prompt is visible to the Director within one check rather than
inferred hours later from a fresh heartbeat; the Director's declared
deadline and default on a progress-dark lane
(`ping-before-escalate`) is the backstop that landed the 2026-09-08
instance. A future hardening candidate, pointer-grade: a non-blocking
PostToolUse alert on the reset line, in the drift-alert taste.
