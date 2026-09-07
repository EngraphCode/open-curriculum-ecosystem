# Plan templates

One template per plan type, each opening with its ratification block so
sketch-vs-ratified is visible at the top of every plan from birth. The
contract they instantiate is the
[plan-node schema](../plan-node-schema.md); the `impact_areas` values
come from the [closed registry](../impact-areas.md).

| Template | Use for |
| --- | --- |
| [`strategic-plan-template.md`](strategic-plan-template.md) | A strategic node: the outcome, the bet, success, and the tempo of its subtree |
| [`delivery-plan-template.md`](delivery-plan-template.md) | One step of a lane, authored by its implementer at pickup |
| [`runbook-plan-template.md`](runbook-plan-template.md) | A repeatable operational procedure |

Copy the skeleton from inside the template's fenced block, fill it,
delete the guidance. Every plan is born `status: sketch` and governs no
work until its ratification stamp is complete.

A plan may keep a decision log, and the log is a capture surface only: a
ruling captured there is authored into an ADR (host architecture) or a
PDR (practice governance) before the plan cites it, and the log names
that record — the log is never a ruling's durable home (2026-09-03: an
extraction plan's log declared itself "the durable home" of thirteen
owner rulings; the cure was ADR-227, with the plans citing it).

The pre-D23 authoring templates are dispositioned and conserved in
[`.agent/plans-v0-sketch-2026-07-21/templates/`](../../plans-v0-sketch-2026-07-21/DISPOSITIONS.md);
do not author new plans from them. The `components/` library remains
here as referenced substrate only (PDR phenotypes, thread-continuity
surfaces) — it is retired as authoring doctrine and no D23 template
references it; its disposition completes with the thread-doc migration.
The doctrine home for this structure is
[ADR-216](../../../docs/architecture/architectural-decisions/216-plan-node-estate.md).
