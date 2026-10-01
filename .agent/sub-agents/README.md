# Sub-agent Prompt Architecture

This directory uses a three-layer structure to keep prompts simple, DRY, and maintainable.

## Layers

1. `components/` - small, reusable prompt building blocks.
2. `templates/` - assembled workflows composed from components.
3. Consumer prompt files (for example `.cursor/agents/*.md`) - thin adapters that load templates, generated for Cursor, Claude and Codex from each template's declaration (§Declarations below). An inline-prompt role (PDR-009; its template has a `## System prompt` section) has a Claude adapter that carries that block verbatim instead; the generator copies it.

### Components Structure

- `components/principles/` - shared principles and guardrails.
- `components/architecture/` - shared architecture-team guidance.
- `components/behaviours/` - shared execution and review behaviour guidance.
  - includes `subagent-identity.md`, which templates must include so each sub-agent declares name, purpose, and a short purpose summary.

## Declarations

A sub-agent is one authored file: the template, opening with a frontmatter declaration.
`pnpm portability:fix` renders its adapters; `pnpm portability:check` recomputes them and
refuses a hand edit ("drifted from the template's declaration") or a missing declaration.

Every template carries a frontmatter declaration: the one source for its adapters on every
platform. A role declares its `description` and, per platform (`cursor`, `claude`, `codex`,
`gemini`), only what deviates from the standard adapter body: a Claude `tools` list off the
default (`inherit` when the adapter carries none), `disallowedTools`, `permissionMode`, `color`,
`model`, `effort`, `maxTurns`; a Codex `model` or `effort`; a Cursor, Codex or Gemini
`description` where the role's own states what only another platform enforces (the Codex one
also heads the role's registry block); a `note` where the closing prose is not the platform's
standard one; a `pointerTail` where the pointer paragraph continues past the template path
(verbatim, as `cricket-procedure-xhigh` carries ", then execute its procedure exactly."). A
standard role declares its `description`, its `platforms` (an omitted `platforms` renders on
every surface, Gemini included; every declaration here names `cursor`, `claude` and `codex`)
and, per platform, only what deviates. A fan-out (the cricket templates and
`architecture-expert`, whose four personas are its variants) declares `variants`, each an
adapter in its own name with every field, its `title`, its Cursor or Codex `description` where
it differs, and every `note`, because the variants differ by design and are never flattened. The
Gemini block carries only the fields the Gemini CLI subagents reference names; a role that
declares no Gemini `tools` renders the read-only set (the Gemini renderer's one default), a
variant renders what it declares. Every declaration on this estate names `cursor`, `claude` and
`codex`: none names `gemini`, so no `.gemini/agents/` surface exists here. `code-expert`'s
declaration is the whole standard shape, a Claude `color` and a Cursor and a Codex `description`
of their own:

```yaml
---
description: Gateway code review specialist for quality, correctness, and maintainability. Invoke immediately after any code is written or modified — features, bug fixes, refactors, and performance changes. Also responsible for identifying which specialist reviewers (security-expert, type-expert, test-expert, architecture reviewers) are needed.
platforms:
  - cursor
  - claude
  - codex
claude:
  color: orange
cursor:
  description: Expert code review specialist for quality, security, and maintainability. Use proactively and immediately after writing or modifying code, completing features, fixing bugs, or refactoring. Invoke when you need comprehensive feedback on code changes, design patterns, or implementation quality.
codex:
  description: Gateway reviewer for non-trivial changes.
---
```

A role whose Claude adapter must not spend turns reading its template (a workflow role
dispatched with its full task, such as the corpus-analysis stages) declares
`claude.body: system-prompt`: the Claude adapter's body is then the template's System prompt
block (the one blockquote under its `## System prompt` heading, a heading inside a code fence
not counting), verbatim, followed by a generated comment naming the template, in place of
the title and pointer. The block is carried whole or refused: a quote that a non-blank line
runs on from, or a second quote in the section, refuses the template. The block's one
home is the template; the generator copies it. Such an adapter is the role's own prompt,
not the reviewer pointer, so no default is filled: it declares its whole capability envelope,
`tools` included, and carries no `pointerTail` or `note`. `tools: none` is the zero-tool
adapter, rendered as the null-value `tools:` field (the one Claude spelling that grants no
tools; `tools: []` and an absent field grant every tool); it stands alone, carries no
`disallowedTools`, and requires the System prompt body, since a zero-tool agent cannot read
the template a pointer names. Its Cursor and Codex adapters keep the pointer, and declare
their own `description` where the role's names the Claude envelope (a read-only workflow
role's Gemini adapter does the same); its Gemini
adapter has no inlined-body form, so a zero-tool role leaves `gemini` out of its platforms.
A fan-out variant is never zero-tool: its body is the pointer to its shared template. The
schema refuses each broken combination by name.

The shape is `agent-tools/src/subagent-declarations/subagent-declaration.ts`. The
declaration is written by hand at the head of the template; the adapters under
`.cursor/agents/`, `.claude/agents/`, `.codex/agents/` (with the registry tail of
`.codex/config.toml`) and `.gemini/agents/` are generated outputs, never hand-authored:
`pnpm portability:fix` renders them and `pnpm portability:check` recomputes them byte for
byte, refusing on a template without a declaration. A host arriving with hand-kept
adapters writes each template's declaration from what its adapters say, then lets the
generator take the surfaces over. The health probe's adapter parity reads the same
declarations, so a platform a declaration names is the one the probe expects.

## Dependency Rules

- Components are leaf nodes: they MUST NOT depend on other components.
- Templates may depend on components.
- Consumer prompts should prefer templates over direct component wiring.
- If direct component usage is required, keep it explicit and minimal.

## Design Principles

- DRY: keep shared guidance in components/templates, not duplicated across agent prompts.
- YAGNI: only introduce abstractions/components that solve real, current duplication.

## Template Consistency Checklist

Before finalising changes to templates or their declarations:

- [ ] Mandatory reading requirements are explicit where needed for quality and consistency.
- [ ] Templates include the shared identity declaration component (`.agent/sub-agents/components/behaviours/subagent-identity.md`).
- [ ] Shared governance references are present and current (`.agent/directives/AGENT.md`, `.agent/directives/principles.md`).
- [ ] Domain-specific references are explicit and all paths resolve.
- [ ] Legacy generic agent names are not used in active guidance (for example, `architecture-expert`).
- [ ] The `variants` in `architecture-expert.md`'s declaration carry distinct, lens-specific descriptions.
- [ ] Standard quality roster and specialist on-demand roster are clearly separated in coordination docs.
- [ ] A role that must not read its template declares `claude.body: system-prompt`; every other adapter loads the template first (both rendered by the generator).
- [ ] Components remain leaf nodes and templates remain the composition layer.
