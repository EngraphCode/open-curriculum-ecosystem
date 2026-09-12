# Copilot Instructions

Read [AGENT.md](../.agent/directives/AGENT.md)

## Code review

Review against the pull request description's `## Scope` section. A finding whose remedy
falls outside the declared scope is reported as an out-of-scope observation with no
proposed change; do not propose additions the scope does not ask for. On a prose- or
records-class changeset, and on the prose findings of a mixed one, grade against the
declared intake (artefact class, verification point, bar) rather than against
completeness; code findings keep the code review's own standard.
