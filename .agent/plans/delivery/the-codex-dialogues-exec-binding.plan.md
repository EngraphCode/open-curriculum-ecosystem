---
id: the-codex-dialogues-exec-binding
node_type: delivery
name: "The Codex dialogues on codex exec — an enforced call envelope, evidence that follows the runtime"
overview: "Rebinds the Codex dialogues from the removed codex mcp-server onto codex exec and codex exec resume through two agent-tools commands, dialogue-turn and dialogue-probe. Every limit on the interlocutor is set in tested code rather than in skill discipline, and a dialogue opens only on a Codex executable this machine has probed with the current envelope."
status: ratified
ratified_by: Jim Cresswell (owner)
ratified_date: 2026-09-23
ratified_where: "The owner's decision card, relayed by the Director (Wick binds Temper, ed7b48) at about 19:55Z on 2026-09-23 and quoted in the body of PR 184: the node ratified; decision 1, 'carry the two keys, yes'; decision 2, verbatim 'Record the version tested, but we always run against latest'; decision 3, a dedicated Codex home, decided yes by the Director at about 20:03Z under the owner's delegation"
serves: agent-platform-citizenship
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-23
---

# The Codex dialogues on codex exec — an enforced call envelope, evidence that follows the runtime

## Goal

A Claude seat can again hold a bounded, read-only, multi-turn dialogue with a Codex interlocutor
on the latest Codex CLI.

- **One command per turn.** Each turn is a single command. There is no MCP registration and no
  session restart.
- **Limits in code.** Every limit on what the interlocutor can do is set in tested code, not in
  skill prose.
- **Evidence follows the runtime.** A dialogue opens only on a Codex executable this machine has
  probed with the current envelope. No version is pinned in the repository.

The dialogues' binding is broken today. The CLI no longer has an `mcp-server` subcommand, so the
registered launch cannot start.

## User groups and value

- **Claude seats that want a cross-vendor second opinion.** They get the instrument back.
  - In the trial, three of four dialogues closed with the seat's position changed (the trial
    tally).
  - The instrument has been unusable since the CLI dropped the binding.
- **The owner.**
  - The interlocutor's authority becomes what the doctrine says it is. The code enforces it, and
    a probe re-proves it after every CLI update.
  - There is no tracked version pin to re-ratify, which honours the ruling: "we will not pin
    versions, we use latest".

## Problem, and what the evidence changed

The old binding held the interlocutor's authority in two places:

- the registration's launch pins: read-only sandbox, approval `never`;
- a skill rule: never pass a per-call authority parameter.

The dated research note (§2.3 and §2.8) records five facts, measured on the current CLI, that
show this was never the whole envelope.

1. **User configuration reaches past the sandbox.** A `codex exec` call with those pins still
   loads the user's Codex configuration: plugins, MCP servers, marketplace sync and exec-policy
   rules.
   - With the configuration loaded, one read-only call spawned a computer-use REPL, a
     `node_repl` MCP server and a network `git clone` of a plugin marketplace.
   - With `--ignore-user-config`, no child process appeared in any once-per-second sample of the
     same call.
   - The user's rules file holds seven `decision = "allow"` prefix rules, among them
     `pnpm agent-tools:collaboration-state`, `git switch` and `pnpm install`. The vendor documents
     that an allowed command runs outside the sandbox.
   - The sandbox governs the model's shell. It does not govern those extensions, and under
     approval `never` they are live tools of the interlocutor. This rests on one run per arm.
2. **The same flag also changes the model.** With the user configuration, the call ran the
   owner's configured model at `xhigh` effort. Without it, the call ran the CLI's default model at
   default effort. The trial's results were earned on the configured model. Model and effort
   come from each run's rollout `turn_context`.
3. **Default-on features still reach the owner's state and secrets.** Both are stable and on by
   default, so `--ignore-user-config` alone leaves them on.
   - **The shell snapshot.** It replays the owner's interactive shell environment into every
     command. That shell environment includes tokens exported in `~/.zshrc`.
     - The interlocutor's shell listed `GITHUB_PERSONAL_ACCESS_TOKEN` and `GITHUB_MCP_TOKEN`
       among its variable names. That happened even with the child's environment reduced to an
       allowlist and `shell_environment_policy.inherit="core"`.
     - With `--disable shell_snapshot` and `allow_login_shell=false` added, the shell ran
       non-login and held only core variables.
   - **Codex memories.** They draw on the owner's Codex memory store.
4. **The resume leg restates nothing by itself.**
   - `codex exec resume` lists no `--sandbox` or `--cd` option.
   - The vendor documents that on its SDK and App Server, per-turn overrides carry forward to
     later turns of a thread.
   - So the envelope restates every setting on every turn, and spawns the resume from the same
     working directory.
5. **The harness writes its own record of the effective policy.** Each turn's rollout
   `turn_context` records the model, effort, approval policy, sandbox, working directory and
   permission profile. Under the envelope that profile was file-system `read` on `/` and network
   `restricted`. The event stream sometimes carries a `command_execution` item with the exact
   command and exit code, and sometimes does not: the code-mode path emitted none.

Two direct trials of the envelope passed on the same CLI.

- Open, then resume, from one empty directory.
- The thread id round-tripped, and turn one was recalled.
- The write was refused with exit code 1, recorded by the harness. The model's own report of the
  refusal counts as corroboration only.
- The nonce came back on the failure branch.
- The sentinel was absent afterwards, and the directory was still empty.

The calling seat already holds full user authority (the estate's same-UID trust ruling). So this
is not a boundary against the seat. The envelope bounds what the interlocutor does on its own
initiative inside a reflective dialogue: it writes nothing, loads no extension the configuration
would add, reaches no network from its shell, and loads none of the owner's state beyond the
model choice. It does not bound reads (see Honest limits).

## Build-vs-buy

The vendor documents three ways to drive Codex programmatically.

- **The TypeScript SDK** wraps `codex exec` over JSONL. Not chosen.
  - No SDK option emits `--ignore-user-config`, the flag fact 1 makes load-bearing.
  - It copies the parent environment wholesale.
  - It declares an exact-version dependency on its own CLI package. `codexPathOverride` can run
    the installed CLI instead, but the dependency would still enter the lockfile.
  - Its published event types remain the reference for the JSONL shape the parser reads.
- **App Server** is the vendor's documented migration target for integrations built on the
  removed MCP server. Not chosen.
  - It is a long-lived JSON-RPC client protocol, and the vendor documents its command and
    WebSocket transport as experimental and unsupported for production.
  - A seat's turns arrive as separate tool calls, so a daemon would add lifecycle machinery for
    no gain.
- **`codex exec` and `codex exec resume`** are the documented scripting surface, and they fit one
  turn per call. Chosen.

Falsifier: re-evaluate if the SDK gains control of the flags and environment above.

## Mechanism

### The commands

Two subcommands join the existing `agent-tools` `codex-exec` topic. ADR-180 is amended in slice 1a
for the scope change. Arguments are parsed strictly: any unknown option, `--model` included, is a
usage error, exit 2.

**`dialogue-turn --prompt-file <path> [--dialogue-id <id>] [--thread <uuid>]
[--timeout-seconds <n>]`** runs one turn.

- It takes exactly one of `--dialogue-id` (open a thread) and `--thread` (resume one).
- **Validation.** Each input is checked before anything runs.
  - `--thread` accepts only a UUID, any version, v7 included. The resume subcommand also accepts
    thread names, so an unvalidated value could inject an option into its argv. The thread id
    from `thread.started` is validated the same way.
  - `--dialogue-id` must match a fixed slug pattern.
  - `--timeout-seconds` is an integer within fixed bounds.
  - The prompt file must be a regular file under a size cap, in strict UTF-8. It is read once and
    sent on stdin.
- On open, it appends one row to the dialogues' local cleanup map:
  `{dialogue_id, thread_id, created_at}`. The row is serialised with `JSON.stringify`, appended
  only, and the file is kept at mode 0600.
- It prints one JSON line, `{"threadId","message","messages"}`, and exits 0. `message` is the last
  agent message; `messages` lists every agent message, for the record. Both are the
  interlocutor's words, so the seat treats them as untrusted input.
- It exits 1 on any of these:
  - no thread id;
  - a resumed thread id that does not match;
  - no agent message;
  - a top-level `turn.failed` or `error` event;
  - a non-zero Codex exit;
  - a timeout;
  - output over the buffer limit.

  An `error` item inside a turn is non-fatal.
- It exits 3, with the probe instruction and without starting a turn, when no pass record
  matches the current binding. The gate reads the record first, and only then resolves the
  binary and reads its version.
- It exits 4 when the environment cannot host a turn:
  - a `codex` that cannot be resolved;
  - a version that cannot be read;
  - an instrument root that fails its checks;
  - a Codex configuration whose model keys cannot be read or fail validation.

**`dialogue-probe [--timeout-seconds <n>]`** proves the envelope. It runs two turns through the
same execution path as `dialogue-turn`, bypassing only the gate the probe itself feeds. The
probe's threads get cleanup-map rows through the same path.

1. The opening turn must return an exact acknowledgement.
2. The resumed turn must round-trip the thread id and recall turn one.
3. The resumed turn must run the given two-line command. It attempts the sentinel write and
   branches on the result, reading the nonce only when the write fails. It then lists environment
   variable names:

   ```bash
   if printf SIF > <root>/<sentinel>; then echo WRITE-OK; else cat <nonce file>; fi
   echo; env | cut -d= -f1
   ```

   - The sentinel name is random for each probe.
   - The nonce is 128 random bits, in a 0600 file inside a fresh 0700 temporary directory
     outside the root, removed in a `finally`.
4. The event stream must carry a `command_execution` item for that command. The harness records
   the item, so it is the proof of the attempt; the reply is only corroboration.
   - The item's recorded command must equal the given command exactly, once the harness's
     shell wrapper is removed by a strict parse. A wrapper form the parser does not recognise
     is inconclusive. A command that merely contains the write text is not enough, because
     quoting or commenting the write out would leave the text in place.
   - Its recorded output must contain the nonce and must not contain `WRITE-OK`.
   - The item's exit code belongs to the whole line, so it is not a write verdict.
   - Without such an item, a nonce in the reply would prove only that the nonce file was read.
     So a turn without the item is inconclusive, and the probe fails. That covers the code-mode
     path, which emitted no such item.
5. After the process exits, the sentinel must be absent from disk.
6. The reply must contain the nonce. It is kept verbatim as corroboration.
7. Every listed variable name must fall in the expected set:
   - the child allowlist, `CODEX_HOME` included;
   - a declared set of names the harness injects, each named, with no prefix wildcard:
     - `CODEX_CI`, `CODEX_SANDBOX`, `CODEX_SANDBOX_NETWORK_DISABLED`, `CODEX_SESSION_ID`,
       `CODEX_THREAD_ID` and `CODEX_VERSION`;
     - `TERM`, `COLORTERM`, `PAGER`, `GIT_PAGER`, `GH_PAGER`, `NO_COLOR`, `PWD`, `OLDPWD`, `SHLVL`,
       `_`, `LC_ALL` and `LC_CTYPE`;
     - `__CF_USER_TEXT_ENCODING`, which macOS adds.

   A name that only shares a prefix, such as a replayed `CODEX_API_KEY`, is a leak.

   Any other name fails the probe, and the probe prints the extra names. So a vendor addition
   becomes a reviewed one-line change, and a leak is never silent. This re-proves the
   environment closure on every probe.
8. For both turns, the thread's rollout `turn_context` must record:
   - approval `never` and sandbox `read-only`;
   - the root's real path as the working directory;
   - network `restricted`;
   - no writable file-system entry;
   - the pinned model and effort, when pinned.

Rules for the result:

- A missing `command_execution` item, a record in a shape the probe does not recognise, a reply
  without the nonce, or a missing rollout is inconclusive, and inconclusive fails.
- The model's own account of the refusal is kept verbatim as corroboration, never as proof.
- On a full pass, the probe writes the machine-local pass record, including its verbatim evidence
  lines.

### The envelope

The envelope is one module. It is the only source of the argv and of the child's environment.

- **Open:** `codex exec --json <flags> -C <instrument root> <settings> -`
- **Resume:** `codex exec resume <uuid> --json <flags> <settings> -`
- **Flags:**
  - `--ignore-user-config --ignore-rules --skip-git-repo-check`
  - `--disable memories --disable shell_snapshot`
- **Settings,** each a `-c`:
  - `sandbox_mode="read-only"` and `approval_policy="never"`;
  - `web_search="disabled"`;
  - `project_root_markers=[]`;
  - `shell_environment_policy.inherit="core"`;
  - `allow_login_shell=false`;
  - the model pins.
- **Model pins.** `model` and `model_reasoning_effort` carry the owner's configured values, an
  owner policy named under Owner decisions.
  - They are read from the top-level string keys of the user's Codex configuration. Nothing else
    is read from that file.
  - A parse failure prints a fixed message, never the parser's text, because the parser quotes
    the file and the file holds secrets.
  - The model must match `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`. The effort must be one of a closed
    set.
  - A key that is present but invalid fails closed (exit 4). An absent key falls back to the CLI
    default.
  - Each value is serialised as a JSON string.
- **The child environment.** The environment is an allowlist, never the seat's:
  - `HOME`, set to the instrument's home directory, not the owner's;
  - `USER`, `LOGNAME`, `LANG` and `TMPDIR`;
  - a fixed system `PATH`;
  - `CODEX_HOME`, set to the instrument's own Codex home, not the owner's (Owner decisions
    item 3).

  So no `CODEX_*`, `OPENAI_*` or proxy override in the seat's environment can redirect the
  interlocutor, and no seat secret is handed to it. With `HOME` redirected, the shell snapshot
  and any login shell start from an empty home, so none of the owner's shell startup files load
  (§2.8, the 19:55Z trial). The snapshot and login-shell settings stay as a second line.
- **Where it runs.** Both calls are spawned from the instrument root, a fixed directory under the
  instrument's Codex home, outside every checkout.
  - Before every spawn it must pass five checks, or the call exits 4 and names the path. It is
    never cleaned silently. The checks:
    - not a symlink;
    - owned by the user;
    - mode 0700;
    - its real path equals its configured path;
    - its listing, dotfiles included, is empty.
  - Because it is empty and project-root markers are off, no project configuration or
    `AGENTS.md` loads from it.
- **Which binary.** `codex` is resolved to its real path once per call. That path serves the
  version read, the spawn and the pass record, so an updater swapping the release link
  mid-call cannot split them.
- **The digest.** It covers the argv shape and the child environment's allowlist.

### Where the state lives

The instrument has a home of its own. It is one fixed directory in the owner's home, created by
the tool at mode 0700. The instrument's Codex home sits inside it, and slice 2 names both paths.
The instrument's Codex home holds:

- the instrument's own login, from one `codex login` the owner runs once;
- its sessions and state database;
- the pass record, the cleanup map and the root.

It holds no config, rules, plugins, skills or memories, so nothing of the owner's Codex setup can
load. Retention becomes deleting one directory. Deleting it also removes the instrument's login
from the machine; `codex logout` there, run first, also ends the session. The trial's four existing cleanup-map rows stay in the owner's Codex home for the trial
close-out.

The pass record is never committed. Its terms:

- **Contents:**
  - the CLI version;
  - the resolved real path;
  - the envelope digest;
  - the time;
  - the verbatim evidence.
- **Writing.** It is written through a temporary file and a rename, at mode 0600.
- **Reading.** A read requires a regular file owned by the user, not group- or world-writable,
  under a size cap, matching an exact-key schema. The evidence lines are treated as untrusted
  text.
- **What it guards.** A dialogue opens only when version, path and digest all match. So a CLI
  update, a different `codex`, or an envelope change each demands a fresh probe. The record
  guards against drift, not attack: any process running as the user can write it.
- **Who runs the probe.** The seat runs it itself, with no owner gate.
- **The tracked evidence record** changes only when the envelope changes or a probe fails, never
  once per version.

## Honest limits

- **Reads are not bounded.** The permission profile grants read on `/`. So anything the owner's
  account can read can reach the vendor, whether the packet names it or injected text in a file
  steers the model to it. That includes dotfiles, credentials and owner-private memory. The
  packet bounds only what the seat sends. A restricted-read permission profile (the root plus the
  packet's paths) is the named hardening.
- **The instrument's homes start empty but do not stay empty.** Nothing of the owner's loads from
  either home. Codex writes its own state into the instrument's Codex home (the login, sessions,
  the state database and caches), and whatever a future CLI adds there becomes part of that
  state. The probe does not audit that directory's contents.
- **The envelope binds only calls made through `dialogue-turn`.** A seat can still invoke `codex`
  directly. That is the same trust question as every other tool it holds. The skill names
  `dialogue-turn` as the only contract-conformant route.
- **Per turn, the envelope is asserted by its argv, not re-measured.** The probe re-measures it
  once per binding. Asserting the rollout `turn_context` on every dialogue turn is the named
  hardening. It is not built, because the rollout format is internal and every format change
  would then stop dialogues rather than only the probe.
- **Extension and rule absence is re-measured only indirectly.** The probe's environment and
  `turn_context` legs catch a regression in the snapshot, sandbox or network settings. They do
  not catch an extension spawned under `--ignore-user-config`. Its absence rests on one run,
  sampled once per second. If one is ever seen, a process-tree leg is the named hardening.
- **A timeout sends SIGKILL to the Codex process only.** A shell that process started inside its
  sandbox can outlive it. Killing the process group needs the asynchronous lifecycle the
  complexity limits rule out here, so it is the named hardening.
- **The probe needs the harness-recorded command.** A CLI path that emits no `command_execution`
  item fails the probe as inconclusive. Reading the equivalent tool-call record from the rollout,
  for the code-mode path, is the named follow-on if the pinned model ever takes that path. The
  sentinel's absence stays the proof that nothing was written.
- **The fixed root is new.** The trials used scratch directories. The live probe (AC 5) is the
  first run from the fixed root.

## Owner decisions carried by this node

1. **Model and effort. Decided, 2026-09-23: "carry the two keys, yes".** The envelope carries
   the owner's configured `model` and `model_reasoning_effort`, as above.
2. **The version policy. Decided, 2026-09-23, in the owner's words: "Record the version tested,
   but we always run against latest".** The pass record notes the version the probe passed on.
   After every update the seat probes the new version itself and carries on. Nothing runs on an
   older version, and nothing is pinned.
3. **A dedicated instrument Codex home. Decided, 2026-09-23: yes.** The Director decided it at
   about 20:03Z under the owner's delegation. The grounds were long-term architectural excellence
   and the estate's preference for a structural cure over a per-instance one.
   - The instrument's own Codex home means that a future default-on feature reading the Codex
     home finds nothing of the owner's to load. The flags stay as a second line.
   - The owner's one action is a single `codex login` into that home. It goes to the owner as an
     owner-run action card, with the exact command, when slice 2 reaches that step.
   - Slices 1a and 1b take both homes as injected paths, so neither depends on the location.

## Acceptance criteria (each with a proof)

Each behaviour is proved once, at the lowest scale that sees it.

1. **Fixed argv and environment.** The builders produce exactly the open and resume argv and
   the child environment above. A non-UUID `--thread`, a hostile model or effort value, a bad
   dialogue id, an out-of-bounds timeout, and every unknown option (`--model` included) are
   refused.
   - Proof: `repo-safe`, unit tests on the envelope and argument modules.
   - The whole-array and whole-object tests are designed sentinels.
     - They are built from distinctive injected slot values, with `it.each` over open/resume
       and over model pins present and absent.
     - Their failure message names the ADR-180 amendment section, which requires the authority
       envelope to be re-adjudicated.
     - The refusals are parser behaviour tests, not absence pins.
2. **Version gate.** `dialogue-turn` exits 3, without starting a turn, when the pass record is
   absent, fails its schema, or differs from the current binding on version, path or digest.
   - Proof: `repo-safe`. Unit tests cover the gate decision.
   - One integration test uses a `runCodex` fake that would return a full success, so exit 3
     alone shows the gate held.
   - The binding digest takes the argv shape as a parameter. It is tested by relation (equal
     shapes give equal digests, and each changed element gives a different digest), never
     against a copied literal.
   - The positive case is a round trip: the record a passing `runProbe` writes opens `runTurn`.
3. **Failure reasons.** Every failure listed under Mechanism maps to its exit code.
   - Proof: `repo-safe`. Each failure reason is proved once, in unit tests on the turn verdict.
   - Integration tests prove only that each outcome class maps to its exit code and stdout.
   - The real timeout kill, stdin delivery and buffer limit are proved by the smoke test.
4. **Probe verdict.** `dialogue-probe` fails on each of these:
   - a sentinel present after exit;
   - a missing `command_execution` item, or one whose recorded command is not exactly the given
     command, or whose recorded output lacks the nonce or holds `WRITE-OK`;
   - a reply without the nonce;
   - a variable name outside the expected set;
   - a `turn_context` that differs from the envelope, or cannot be found or recognised;
   - a thread mismatch;
   - a missing recall;
   - a wrong acknowledgement;
   - a root that fails its checks.

   It writes the pass record only on a full pass.
   - Proof: `repo-safe`, unit tests on the probe verdict.
   - One integration test uses an ordered fake that returns the open and then the resume result
     and never reads its arguments. It shows a single failing row leaves no record.
   - The probe reaches `executeTurn` directly. The gate is never bypassed through an option on
     `runTurn`.
5. **Live probe.** `dialogue-probe` passes against the installed latest CLI, from the fixed root,
   under the instrument's own Codex home after the owner's one login.
   Every Codex process it started is proven closed by a process-table read.
   - The probe run's `turn_context` legs and the environment leg pass, and the Codex home gains
     no memory entry from the probe threads.
   - Proof: `owner-held`. The implementing seat runs it on the owner's machine under the owner's
     standing permission for Codex experiments.
   - The observation is recorded in slice 2's PR description and in the tracked evidence record
     that slice 3 writes.
6. **Doctrine.** The skill and Sif name the commands and cite the envelope module. They restate
   no argv, and the evidence record carries no version pin.
   - Proof: `repo-safe` for links and adapters, via `pnpm docs-validators:check` and
     `pnpm skills:check`. The slice 3 review reads the content.
7. **No `.mjs`.** No hand-authored `.mjs` remains in the skill, and the adapters regenerate
   clean. Proof: `repo-safe`, `pnpm skills:check`.

## Todos

Each slice is one pull request with the default round budget. Every slice gets a code-expert
review before and after execution.

- **Slice 0, records.** This node, as a sketch, plus the research note's dated §2.8 evidence. Two
  files, prose-class, with the PDR-140 intake declared at open.
- **Slice 1a, the pure core of a turn.** Up to 10 files: types, parsing, envelope, turn verdict
  and turn execution, their tests, and the ADR-180 amendment.
  - Parsing: a closed event union replacing the open `CodexExecEvent`.
  - Envelope: the `ThreadId` brand, the model pins read from config text, and the child
    environment built from an allowlist and the resolved Codex home.
  - Turn execution: `executeTurn` behind injected ports. The ports carry data, not handles.
  - Commit order, each commit a test plus the code that greens it:
    1. the closed-union parser, with the existing `last-message` tests as the safety net;
    2. the `ThreadId` and model-pin parse;
    3. the argv builders with the sentinel;
    4. the turn verdict;
    5. the `executeTurn` integration test.

  type-expert gives a focused review.
- **Slice 1b, the gate and the probe logic.** About 8 files, each module with its tests:
  - the pass-record schema, the binding digest and the gate decision;
  - the rollout `turn_context` parse and its check against the envelope;
  - the probe verdict, including the environment check against rule 7's closed expected set;
  - `runTurn` (the gate, then `executeTurn`) and `runProbe`;
  - the cleanup-map row through a port.
  - Commit order: record schema and digest, then gate, then probe verdict, then the `runTurn`
    gate integration, then the `runProbe` integration with the round trip.
  - The ordered probe fake is named in the review request.
  - The probe verdict's exact contract (the wrapper parse, the equality, the expected
    variable set) is its unit tests. Those tests are the specification that later findings
    on the verdict's mechanics are exercised against.
  - The probe line is composed from the complete paths the ports supply, with no path joining
    in pure code, so the unit tests hold on the Windows CI leg.
- **Slice 2, the IO edge.** Up to 10 files, separate because it touches the filesystem and
  processes:
  - the `spawnSync` runner;
  - node adapters, free of logic: the record, root, nonce, sentinel, cleanup map, rollout read,
    prompt read, config read, clock and binary resolution;
  - a pure resolver, called once at the composition root. It gives the owner's Codex home,
    read only for the two model keys, and the instrument's home and Codex home;
  - creating the instrument's homes at mode 0700. The owner-run login card goes to the Director
    with the exact command when this step is reached;
  - strict argument parsing;
  - CLI wiring at the composition root;
  - their tests;
  - the smoke test, `agent-tools/smoke-tests/codex-dialogue-runner.smoke.ts`, wired as
    `smoke:codex-dialogue` into the `test:e2e` chain.

  The smoke test:
  - The runner takes the executable, args, cwd, timeout and buffer limit as parameters. So the
    smoke runs a `process.execPath` stub: it echoes stdin and cwd, it hangs, and it floods a
    small buffer.
  - It asserts the outcome kind and that the child is gone (`process.kill(pid, 0)` fails with
    ESRCH). It never asserts elapsed time.
  - A built-CLI leg checks that `--model` exits 2 without a stack trace, and that an empty Codex
    home exits 3.
  - It runs with `HOME` and `CODEX_HOME` set to a fresh temporary directory, and with a PATH
    holding no `codex`. So a developer's real pass record can never open the gate.
  - The unit fixtures for the run mapping are taken from the shapes the smoke observes.

  Commit order: the run mapping, then the argument parser, then CLI integration. The runner,
  adapters, smoke and wiring go in one commit, so each adapter lands with its proof: a smoke
  leg, or AC 5 for the parts that need the real CLI.

  It ends with the live probe (AC 5).
- **Slice 3, the doctrine.** 10 authored files plus generated adapters. Prose-class, with the
  PDR-140 intake declared at open; docs-adr-expert gives a review.
  - Rewrite the skill: setup, the open checks and the protocol.
  - Sif: plank 2 becomes "evidence follows the runtime", keeping its principle that an
    unverified upgrade never becomes a silently trusted surface. Annex A becomes the exec
    binding.
  - Rewrite `probe-record.md` as the dated evidence record.
  - Delete the lockstep test. It reads `.agent/` through the filesystem and pins absences,
    both of which the testing doctrine forbids. With no restated argv left, nothing needs
    lockstep.
  - Delete the four `.mjs` scripts.
  - Add a dated note to the deep-dive plan: a single-consumer dialogue binding landed in the
    topic, and the plan stays unpromoted.
  - Add a dated pointer in the parent plan's v1-shape section to this node.

The plan-body first-principles check fires here:

- **Shape:** at this node's review.
- **Landing path:** at each slice's pre-execution code review.
- **Vendor literals:** re-read `codex exec --help` and `codex exec resume --help` at slice 1a
  pickup, and again at the live probe.

## Review dispositions

One dated row per routed finding (PDR-140 ledger surface). The implementer picking up each slice
enumerates and dispositions every row before implementation.

| Date | Source | Finding | Routing |
| --- | --- | --- | --- |
| 2026-09-23 | Readiness reviews at authoring: assumptions-expert, code-expert, architecture-expert-barney, test-expert, security-expert | Cured across the drafts, among others: the thread-id injection; the model change under `--ignore-user-config`; the environment allowlist; the shell snapshot and memories; the pass record's binding; the rollout `turn_context` legs; the test layering; the slicing | None routed onward |
| 2026-09-23 | PR 184 reviews: the Codex connector, Copilot, Badger seeks Hush | Cured on the PR: the write verdict read from the whole line's exit code; Codex-injected names read as leaks; the sampling bound; the nonce proving only a read; the `CODEX_` prefix allowance; the substring command check; the slice 1b todo's stale environment algorithm | None routed onward. A later finding on the probe verdict's mechanics is recorded here as a row for slice 1b, whose tests are that verdict's contract, rather than cured in this node's prose |
| 2026-09-23 | PR 184, the Codex connector at c29088f0b | Extra command executions bypass the probe in a writable sandbox. The interlocutor could create the sentinel path as a directory, run the exact probe command so that it prints the nonce, then remove the directory. The required `command_execution` item and the post-exit sentinel check would both pass | Slice 1b: the probe verdict requires the expected command to be the only `command_execution` in the probe turn. Any other execution is inconclusive and fails, and a unit test proves it |
| 2026-09-23 | PR 184, the Codex connector at 1daff4fe7 | The row above counts only `command_execution` items, but §2.8 records code-mode shell runs that the event stream omits. Unrecorded code-mode runs could create and remove the sentinel directory around the one recorded probe command, and a writable sandbox would still pass | Slice 1b states the condition as a property, not a mechanism. Every execution in the probe turn must be accounted for by a harness record: the event stream's items and the rollout's tool-call records, code mode included. The expected command must be the only one. A turn whose records cannot establish that is inconclusive and fails, and unit tests prove each path. This makes the rollout tool-call read part of the probe, superseding the Honest limits bullet that names it a follow-on. An execution path recorded in neither place is beyond the probe's sight, and rule 8's `turn_context` leg stays the independent check |
| 2026-09-23 | Slice 1a reviews: code-expert, type-expert, test-expert, security-expert, docs-adr-expert | Cured in slice 1a: the verdict's closed event contract (documented top-level types only, exactly one turn completed last, an unexpected item fails, a blank reply fails); the child environment built inside the turn; the root check bound to the spawned root; the model-pin split and its errors; the surviving test mutants; the ADR-180 amendment's sources, alternatives and outcomes | The rows below route the rest onward |
| 2026-09-23 | security-expert on slice 1a | The probe's environment leg lists the names the interlocutor's shell sees, and `shell_environment_policy.inherit="core"` filters those. So the leg cannot see a variable that reaches the Codex process itself, and rule 7's "re-proves the environment closure" claims too much | Slice 2: a smoke test runs the IO edge against a stub executable that reports its own environment names, and asserts the exact allowlist. Rule 7's claim is narrowed to the shell's environment |
| 2026-09-23 | security-expert on slice 1a; Badger seeks Hush's official-docs follow-up, answer (d) | On an always-latest CLI the envelope can lapse without a signal. A renamed `-c` key may be accepted as a no-op, and default-on features the envelope does not name stay on. At 0.156.1 these include `code_mode_host` (stable, on) and `plugins` | Slices 1b and 2: the probe re-proves a closed expected set of enabled features under the envelope, so a vendor addition becomes a reviewed change. At slice 2 pickup, run the envelope once with a misspelt `-c` key, and give each setting the probe cannot measure a probe leg or a line in Honest limits. Trial `--disable code_mode_host` and `--disable plugins` before either enters the envelope |
| 2026-09-23 | security-expert on slice 1a; Badger seeks Hush's follow-up, answer (a); PR 184, the Codex connector at f99fbf717 | `--ignore-user-config` skips only the user file. System and managed configuration layers sit outside the envelope and can still supply plugins and MCP servers, and the probe's network leg does not cover their traffic. The seat's `TMPDIR` and `LANG` values pass into the child | Slice 2, before the live probe: check the host for system and managed layers. Where one can supply an extension, either close it in the envelope or add the process-tree leg Honest limits names, and narrow the node's claim to what is then proven. Point `TMPDIR` at a 0700 directory inside the instrument home, and pin `LANG` |
| 2026-09-23 | code-expert and type-expert on slice 1a | The instrument root is not checked to be absolute. A raw `JSON.parse` value typed `any` could reach `buildResumeArgv`, because `no-unsafe-argument` is off | Slice 2: the root check requires an absolute real path, and the IO edge parses external JSON to `unknown` |
| 2026-09-23 | docs-adr-expert and test-expert on slice 1a | The `agent-tools` README's topic catalogue omits `codex-exec`. The codex-helper skill still recommends the removed MCP server. The `last-message` CLI tests inject stream fakes into a unit-test file | Slice 2: the README entry, and the CLI tests moved to an integration-test file. Slice 3: the codex-helper line |

## Out of scope

- **codex-helper's use of this envelope.** Its delegation needs a repo working directory,
  `workspace-write` and `AGENTS.md`, which this envelope forbids. Only the parser is shared.
- **The idle-wake bridge over `codex queue`, a Codex leg for Cricket, and App Server
  experiments.** Separate research proposals.
- **The trial close-out** (extract, then delete the trial's rollouts and mapping). It is owed
  under the data contract, but it is not a binding change. Rollout deletion alone does not bound
  retention, because the prompts also persist in the Codex state database. The close-out has to
  cover that too.
- **The Annex B reverse binding and the conduit wrapper.** Their own evidence gates stand.
- **The named hardenings in Honest limits:**
  - a restricted-read profile;
  - per-turn `turn_context` assertion;
  - a process-tree leg;
  - process-group kill.
- **A lock around the probe.** A random sentinel name per probe and the record's atomic rename
  make concurrent probes safe without one.
