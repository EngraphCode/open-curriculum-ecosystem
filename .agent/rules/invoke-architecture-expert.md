---
classification: situational
description: invoke architecture expert
trigger: surface:workspace boundaries, import direction, module structure, dependency injection, public APIs
---

# Invoke Architecture Reviewer

Invoke `architecture-expert` when changes touch workspace boundaries, import direction between
`apps/*`, `packages/*`, `demos/*` and `agent-tools`, module structure, dependency injection, or a public API.
Use it for structural review across the workspaces, and invoke the lens whose concern the change
also touches (`.agent/sub-agents/components/reviewer-team.md`).

See `.agent/sub-agents/templates/architecture-expert.md` for the full reviewer brief.
