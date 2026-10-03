---
classification: situational
description: invoke config expert
trigger: surface:tsconfig, ESLint, Vitest, Prettier, markdownlint, Turbo, knip, dependency-cruiser, Husky, package.json scripts, lockfile, env handling, Playwright config, Vercel settings, deployment tooling
---

# Invoke Config Reviewer

Invoke `config-expert` when changes touch TypeScript, ESLint, Vitest, Prettier, markdownlint,
Turbo, knip, dependency-cruiser or Husky configuration, `package.json` scripts, locks, env
handling, the apps' Playwright or Vercel settings, or deployment-relevant tooling. Use
it whenever platform behaviour might change because configuration changed.

See `.agent/sub-agents/templates/config-expert.md` for the full reviewer brief.
