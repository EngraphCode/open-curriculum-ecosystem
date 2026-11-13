# Security review: SonarQube Claude Code plugin (2026-11-13)

First-hand review under
`.agent/rules/third-party-skills-require-security-review.md`, performed
at the Hydra holds Lightyear seat (d827c5) before the project enables
`sonarqube@claude-plugins-official` in `.claude/settings.json`. The
owner installed the plugin mid-session on 2026-11-13; the rule covers
that case, and this record is the review it requires before the
project-level enablement lands.

## Provenance reviewed

- Source: `https://github.com/SonarSource/sonarqube-agent-plugins`,
  published by Sonar through the `claude-plugins-official` marketplace.
- Version `2.6.0`, source SHA
  `5a9356d957db063e4d2cf87511b44cc1ba88dc99` (the `gitCommitSha` the
  harness recorded at install).
- Licence: SSAL-1.0 (Sonar Source-Available License v1.0). It is
  source-available, not open source. Nothing from the plugin is copied
  into this repository; the project setting only names it.
- Content hashes (SHA-256) of the executable surface at that SHA:
  - `claude-hooks/hooks.json`:
    `ca69a9b5a1f3f0b5bc07b29490743c66ce69ed022e0717700743cc2084946fdf`
  - `scripts/setup.js`:
    `b96ca90e1ee30db9b629224418c9345abe5a56f1496f026dcca321a641bd49d0`
  - `mcp.json`:
    `2b3827a30692ba8d188040e90f4d51bf10c0de900ab3889a7fe2fce4ee66ef0d`

## Executable surface (all of it read)

The payload is 41 files. Three can cause code to run; the rest are
manifests for other harnesses, images, and markdown (ten skills, one
subagent, one rules file).

- **`claude-hooks/hooks.json`** registers one hook: `SessionStart`,
  empty matcher, `node "${CLAUDE_PLUGIN_ROOT}/scripts/setup.js"`,
  timeout 30 seconds. It runs at the start of every session in a
  project that enables the plugin.
- **`scripts/setup.js`** (165 lines, read in full). It imports only
  `node:fs`, `node:path` and `node:os`. It reads `PATH` to see whether a
  `sonar` binary exists, and reads
  `~/.sonar/sonarqube-cli/state.json`. It writes one JSON line with a
  `systemMessage` to stdout and exits 0. It spawns no process, opens no
  network connection, and writes, deletes or modifies no file. The
  message text is built from fixed strings and from hook names in the
  state file, a file the user's own Sonar CLI writes.
- **`mcp.json`** declares one MCP server, `sonar run mcp`. The plugin
  ships no server code: the command runs the user's installed Sonar
  CLI, which starts a container from the `mcp/sonarqube` image.

Markdown that directs execution:

- Nine skills restrict themselves by `allowed-tools` to `sonar`
  commands, container `ps` checks, and read or edit tools.
- `skills/sonar-integrate/SKILL.md` instructs, when the CLI is absent,
  installing it by piping a script from the `master` branch of
  `SonarSource/sonarqube-cli` into a shell, after explicit user
  confirmation. It also runs `sonar integrate claude`, which writes
  secrets-detection hooks and an MCP entry into the user's own
  `~/.claude` configuration, not into this repository.

## Findings

- No injection, exfiltration or persistence vector in the plugin's own
  code at the reviewed SHA.
- **Unpinned install script.** The `sonar-integrate` skill's install
  path fetches from a moving branch. It runs only on a user's explicit
  confirmation, and not at all when the CLI is already installed.
- **Out of scope, and not reviewed here:** the Sonar CLI binary, the
  `mcp/sonarqube` container image, and the hooks `sonar integrate`
  installs at user level. Each is a separate adoption by the user who
  runs it. The MCP server reaches SonarQube Cloud with the user's own
  token.
- **No version pin, by the owner's decision (2026-11-13).** The
  project setting names the plugin without a version, and the official
  marketplace auto-updates by default. The owner wants the vendor's
  automatic security updates and does not want a pin. So this review
  is a point-in-time record of version 2.6.0, not a gate on later
  releases. The hashes above let anyone compare a later release's
  `hooks.json`, `scripts/` and `mcp.json` against what was read here.
  The rule's wording assumes a pinned SHA; whether it should carve out
  auto-updating plugins from an official marketplace is an open
  question for the rule's owner.

## Installing

Committing the `enabledPlugins` entry turns the plugin on for the
project but does not download it. Each collaborator runs this once
per clone:

```bash
claude plugin install sonarqube@claude-plugins-official --scope project
```

The skills then need the Sonar CLI (`/sonarqube:sonar-integrate`
installs and authenticates it) and, for the MCP tools, a running
container runtime.

## Verdict

Safe to enable at SHA `5a9356d957db063e4d2cf87511b44cc1ba88dc99`. The
auto-run surface is one read-only session-start script. The review
does not extend to the Sonar CLI, the MCP container image, or any
later plugin release; later releases arrive by auto-update, by the
owner's decision above.
