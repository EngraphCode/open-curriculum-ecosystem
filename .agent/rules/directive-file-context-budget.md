# Directive-File Work Requires <30% Context Budget

Operationalises
[PDR-052 (Directive-File Context Budget)](../practice-core/decision-records/PDR-052-directive-file-context-budget.md).

Editing any file under `.agent/directives/` requires the agent's
session context-usage to be below 30%. If context is at or above
30%, finish current-step work, write a session-handoff opener, and
queue the directive work for a fresh session.

## The Rule

Files under `.agent/directives/` (`AGENT.md`, `principles.md`,
`tdd-as-design.md`, `testing-strategy.md`,
`schema-first-execution.md`, `orientation.md`,
`agent-collaboration.md`, `user-collaboration.md`,
`continuity-practice.md`, `operationalisation-contract.md`) are:

- Deep, dense, and structurally load-bearing.
- Read by every agent at every session open.
- The surface where mistakes compound across the entire Practice.

The error rate of editing operations rises sharply under context
pressure. The disposition that produces *"I'll just be careful"*
under context pressure is exactly the rounding-off failure mode the
`eager-rounding-off-on-partial-structures` pattern
names — partial structures get filled by inference rather than by
reading, and the resulting damage is invisible until the next
session reads the affected directive.

The cure is structural, not behavioural: directive-file edits are
sequenced as the **final step** of any consolidation pass, with the
30% context-budget check at the boundary before directive work.

## Sequencing Within a Consolidation Pass

A consolidation pass runs through capture surfaces in order:

1. `napkin.md` (capture)
2. Other capture surfaces (comms events, plan bodies)
3. `distilled.md` (refinement)
4. `pending-graduations.md` (queue)
5. **directives** (permanent doctrine) — gated on the 30% check

Directive-file work is the final step. Earlier-stage work happens
first; if the agent reaches the directive boundary at or above 30%
context, finish the in-flight step, write a handoff, and queue
the directive edits for a fresh session.

The gate covers directive-file work as PDR-052 defines it: direct editing of a
directive's content, restructuring its sections or cross-references, and
authoring new sections (owner, 2026-09-20: "don't attempt to rewrite directives
with low context"). Reading a directive as input to other work, citation
updates and frontmatter-only edits are ordinary work at any figure; a directive
does its job by being read.

A context that carries other heavy work first (a branch fold with review rounds,
a long raw-source read) reads the figure again after that work's last step and
before its first directive edit; at or above the line, the edits belong to the
next context. Worked instance (2026-09-17 to 2026-09-19): one seat read 13 % at
open, declared "fold here, directives here", and stood at 51 % at the directive
step with no edit made; the edits landed in a later context opened at 11 %. For a successor whose owed
work opens with directive edits, the grounding and the directive session are one
budget: read the pickup block, not the whole continuity file, before the first
edit (a full team grounding stood at 37 % before any edit, 2026-09-24). Before a
budget-gated edit, read every pending input that touches the same passage: one
paragraph edited at 25 % was rewritten by a pull request read at 37 %
(2026-09-24).

## Reading the Figure

`pnpm --silent agent-tools session-metadata --vendor <vendor> --model <id>
--session-id <id>` reads the latest assistant turn's occupancy from the
session transcript, so the rule gates on a reading, not an estimate. The first
reading after a compaction can be the compaction call's own usage line (69 %
read, then 11 % one turn later, 2026-09-19); read it again after one more turn
before acting on it.

## The 30% Threshold Is Load-Bearing

30% is not a tidy number; it is the headroom required for:

- Full-depth reading of the directive file end-to-end.
- Comprehension of the existing structure and cross-references.
- Editing without crowding-out (every Edit/Write call consumes
  context for the diff and the surrounding excerpt).

Below 30%, all three are achievable. At or above 30%, one or more
gets compressed, and rounding-off begins.

## Owner Direction Beats Plan, Not Standing Rules

If owner direction asks for directive-file edits in a session that
is over 30%, surface the conflict explicitly:

- Name the rule and the current context-usage estimate.
- Offer to do all non-directive graduation work in this session
  and queue the directive edits for a fresh session.
- Proceed with directive edits only if the owner expressly
  authorises overriding this rule for the current session.

This is the standard surface-the-conflict discipline from
`principles.md` §Owner Direction Beats Plan applied to a standing
rule.

## Doctrinal Anchors

- principles.md §Owner Direction Beats Plan (conflict surfacing)
- pattern: `eager-rounding-off-on-partial-structures`
- Owner-stated standing authority: *"this is always true"* (2026-05-05)
