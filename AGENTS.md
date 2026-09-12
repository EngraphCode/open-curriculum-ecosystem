# AGENTS.md

Read [AGENT.md](.agent/directives/AGENT.md)

See [RULES_INDEX.md](RULES_INDEX.md) for the canonical rules list.

## Code review

Review against the pull request description's `## Scope` section. A finding whose remedy
falls outside the declared scope is reported as an out-of-scope observation with no
proposed change; do not propose additions the scope does not ask for. On a records- or
prose-class changeset, grade against the declared intake (artefact class, verification
point, bar) rather than against completeness.

<!-- CODEX_TEAM_ALERT_BOOTSTRAP_GENERATED_START -->

## Codex team-session alert bootstrap

For coordinated Codex work, load `$oak-start-right-team` before claiming and
keep the root watcher live. Then follow the Codex relay procedure at
`.agent/rules/use-monitor-for-event-driven-wake.md#codex-notify-session-relay`.
The relay is an ACTIVE-TURN ALERT, not idle wake: `collaboration.send_message`
reaches a root mid-turn but does not start a turn on an idle root, so bounded
foreground polling plus the post-restart gap sweep are a named requirement of
Codex participation, with or without the relay. Watcher liveness is not proof
of reasoning wake, and canonical comms monitoring does not cover file-only ARC
or standards channels.
<!-- CODEX_TEAM_ALERT_BOOTSTRAP_GENERATED_END -->
