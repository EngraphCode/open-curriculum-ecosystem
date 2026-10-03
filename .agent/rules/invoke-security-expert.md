---
classification: situational
description: Invoke `security-expert` when changes touch headers, CSP, secrets, env loading, middleware, proxies, dependencies, auth or the public attack surface.
trigger: surface:headers, CSP, secrets, env loading, middleware, proxy, dependencies, auth, public attack surface
---

# Invoke Security Reviewer

Invoke `security-expert` when changes touch headers, secrets, env loading, proxies, middleware,
dependencies, auth, or public attack-surface behaviour. Use it for any change that could widen the
security posture.

See `.agent/sub-agents/templates/security-expert.md` for the full reviewer brief.
