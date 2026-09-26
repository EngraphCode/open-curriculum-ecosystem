# The Practice Skills Corpus

`.agent/skills/` is the Practice skills corpus (owner ruling,
2026-08-02): skills about creating this repository, its contents and
mechanisms, and enabling future mechanisms — not about pedagogy or
Oak curriculum content. The name lands here in doctrine; the path
stays `.agent/skills`.

Each skill's canonical form is its `SKILL-CANONICAL.md`; the platform
adapters under `.claude/skills/` and `.agents/skills/` are generated
by the `agent-tools` skills-adapter generator — edit canonicals,
never adapters. Vendored external skills live only in the adapter
tier, pinned by `skills-lock.json`.

The canonical definitions here group by concern (a family directory per
concern — cognition, change-custody, knowledge, orientation, and so on);
the generated platform adapters stay flat. That is an owner decision
(2026-08-07, verbatim: "I want skills grouped by concern, at least in the
core skills definitions, the vendor specific projections can remain flat.
That is a user decision and I have made it, no debate required"): flat
listings optimise the adapter and runtime layer, and concern-grouping is
the discovery structure for the humans and agents navigating the corpus.

Where a new capability lands — in this corpus, another audience set,
or another lever entirely — is decided by
[the capability landing decision procedure](../rules/capability-landing-decision-procedure.md).

## Audience-set registry

For expressing and implementing use value across needs, journeys, capabilities,
contracts and delivery work, with evidence appropriate to each level,
use [`use-value`](planning/use-value/SKILL-CANONICAL.md). It is a
Practice authoring method for agents and teams building systems; it supplies
no learner-facing pedagogy and does not change the curriculum-skills boundary.

One row per audience set. A capability that fits no existing set
does not stretch one: a new set lands deliberately, through the
landing procedure, as a new row here.

| Audience set | Audience | Home | Delivery mechanism |
| --- | --- | --- | --- |
| Practice skills corpus | agents and humans building this repository and its mechanisms | `.agent/skills/` | generated platform adapters (`.claude/skills/`, `.agents/skills/`) |
| Curriculum and teacher skills | teachers and other users of Oak curriculum content | `.claude-plugin/marketplace.json` | Claude plugin marketplace |

Three corpora share the word "skills" and nothing else (owner, 2026-08-17:
"the current skills lane is ONLY about the Practice skills, it is not about
the user facing skills"): the Practice skills here in `.agent/skills`; the
user-facing product skills under `plugins/oak-open-curriculum` (the Claude
plugin, for any Claude host, never "the Claude Code plugin" — owner, 2026-09-17)
and its ChatGPT and Codex package `plugins/oak-open-curriculum-chatgpt`, with
their own lane and owners; and third-party vendor-managed skills installed with
`pnpm skills` into `.agents/skills` (the
`third-party-skills-require-security-review` rule governs them). Every lane
quantifier — "finish the skill work", "all Practice skills have evals" —
ranges over `.agent/skills` only; conflating any two mis-scopes sweeps,
evals, reviews and lane quantifiers, so when a path, a command or a PR says
"skills", resolve WHICH corpus before acting.
