---
name: find-misconceptions
description: Surface the known pupil misconceptions for a topic, each paired with how the error shows up and how to respond.
argument-hint: <topic> <year or key stage>
---

Find misconceptions for: $ARGUMENTS

Delegate to the **misconception-miner** agent.

The agent must:

1. Resolve the topic to lesson, unit, or thread slugs first (`search` or the browse tools), then pull the misconception set with `get-misconception-graph` anchored by those slugs — it takes corpus slugs, not free text.
2. Corroborate with the authored distractors in related lessons' quizzes, drawn from `get-lessons-quiz` (authored content, not pupil-response telemetry).
3. For each misconception, return: the error in pupil terms, where it typically surfaces in the sequence, and a concrete teacher response.
4. Present in the order returned. `get-misconception-graph` returns each unit's lessons in Oak's authored teaching order, so present the misconceptions as returned, grouped by unit — no `get-units-summary` call and no re-sort. At KS4 a unit node merges every board and tier, so the order is Oak's authored order for the unit, not a specific board's. Do not rank by severity, frequency, or how much later learning depends on the error — the corpus evidences none of these.

Stay grounded in the graph. Do not generalise from intuition about what pupils "probably" get wrong.
