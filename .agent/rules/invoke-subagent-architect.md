---
classification: situational
description: Route reviewer roster, invoke rule, skill, entry-point, and adapter-estate changes through subagent-architect
trigger: surface:reviewer roster, .agent/sub-agents/, invoke-* rules, .agent/skills/, platform agent, rule and skill adapters, platform entry points
globs:
  - .agent/**/*
  - .cursor/**/*
  - .claude/**/*
  - .codex/**/*
  - .github/**/*
  - .agents/**/*
---

# Invoke Subagent Architect

Invoke `subagent-architect` when the reviewer roster, the sub-agent templates, the `invoke-*`
rules, skills, the platform agent, rule and skill adapters, or the platform entry points
(`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `skills.md`) change. Use it to validate canonical-first
architecture, thin wrappers, and the overall specialist landscape.

See `.agent/sub-agents/templates/subagent-architect.md` for the full reviewer brief.
