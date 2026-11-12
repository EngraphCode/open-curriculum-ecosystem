---
id: self-starting-practice-refinement
node_type: strategic
name: Self-starting Practice refinement
overview: The Practice's refinement and learning steps start without the owner instigating them.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: FRAME-1
impact_areas:
  - practice-and-estate
gate_expiry_default: P21D
depends_on: []
owner_gates: []
tickets: []
last_updated: 2026-11-12
---

# Self-starting Practice refinement

The owner's words are the authority and are quoted, dated, in the
[comparison brief](../../research/agentic-engineering/hermes-practice-comparison-2026-11/brief.md).
The evidence behind this node is in the
[Hermes and Practice comparison](../../research/agentic-engineering/hermes-practice-comparison-2026-11/comparison.md),
sections 2.2, 2.5 and 6.2.

This node is a plan to make a plan. The owner commissioned it on 2026-11-12: "Yes, we should do
that, absolutely. However, related research sessions are ongoing, and I would like them to feed
in before we finalise the experiment design. So I am commissioning a strategic plan but not yet
a detailed implementation plan, effectively a plan to make a plan". It states the outcome, the
bet and what is settled. It holds no experiment design.

## Outcome

Refinement of the Practice starts by itself. The steps that turn captured experience into
decisions begin without the owner asking for them, and the owner's attention is spent on what
refinement produced, not on remembering to begin it.

## User groups and value

- **The owner**: refinement stops being a thing only the owner can start. The owner named the
  present state on 2026-11-12: "In my opinion, that lack of loop automation is the biggest
  weakness in the Practice as it stands today. There are multiple mechanisms, session wrap,
  retrospectives, the napkin, dedicated consolidation sessions, all encoded as skills, but
  almost all if it requires the user to instigate the refinement and learning process."
  Offered value; a first experiment tests it.
- **Agents opening a session**: buffers that have been drained and registers whose rows are
  live or decided, so that a session begins from current doctrine and not from a backlog it is
  told about and cannot take up. Hypothesised.
- **The people the estate serves**: a Practice whose lessons are decided on and not only
  recorded. Hypothesised, and claimed only as far as decisions recorded in the repository.
  Whether those decisions improve later work is the question of the sibling node
  [`outcome-informed-practice-learning`](outcome-informed-practice-learning.plan.md).

## The bet

Nothing in the repository starts a refinement step and does its work. Each step is started by
the owner's word or by an agent's recall; the one automatic start on this ground is a report
shown to an opening session, which does no work (comparison, section 2.5). The bet is that the
missing part is a starter that also does the work.

The comparison found one worked example of that pattern in another system, read from its code
and documents and not observed in use. It is a design to learn from, with a record of what went
wrong, and it is not evidence that the design works.

Deliberately not bet on here:

- **A reminder alone.** A signal that tells a busy seat that refinement is due leaves the
  starting to that seat. The authoring seat reads the estate's record as showing this is not
  enough (comparison, sections 2.4 row P-3 and 6.5); that is a reading, and the design step may
  test it.
- **A new measure of whether lessons work.** The comparison found that the existing records
  wait on the same starter.
- **Machinery ahead of evidence.** The sibling node
  [`attendant-workflow`](attendant-workflow.plan.md) records the owner's preference, given for
  the Attendant, for start-right, `AGENT.md`, skills and rules over hooks, and that nobody yet
  knows whether they suffice. Whether that order of trial applies here is the owner's. One
  difference the design must face either way: a step that no session is running cannot be
  started by text a session reads.

## Where this node departs from what is already ratified

Three delivery nodes the owner ratified on 2026-09-08 stand on the same ground and put
automatic starting out of scope. A seat picking one up reads the opposite of this node, so the
relationship is stated here and is the owner's to confirm at ratification.

- [`consolidation-signal`](../delivery/consolidation-signal.plan.md) computes when a
  consolidation is due: "a noticer, never a nag". Out of scope: "Automation that starts sessions
  from the signal".
- [`consolidation-induction`](../delivery/consolidation-induction.plan.md) makes a dedicated
  consolidation one dispatchable action. Out of scope: "Automatic induction (a signal never
  starts a session by itself — owner/Director word does); scheduling infrastructure".
- [`consolidation-ledger`](../delivery/consolidation-ledger.plan.md). Out of scope: "any
  processing automation".

Read together, those nodes plan the signal and the worker and leave the start with a person.
This node is about the start. It does not amend them: their exclusions bound their own scope,
and they remain inputs the design builds on. If the owner intends the 2026-09-08 position to
stand as a limit on this work, this node returns to sketch.

## What is settled

1. **This is to be done** (the owner, 2026-11-12: "Yes, we should do that, absolutely").
2. **The experiment's design waits for related research to feed in** (the owner, the same
   message). The design is not written here and is not to be inferred from the comparison's
   proposal.

The authoring seat's readings, not the owner's words: that the first experiment is small and
can fail, with its result recorded whichever way it falls; and that this node's own success is
narrower than its outcome (below).

## What feeds the design

Inputs the design step reads before it is written.

- **The related research the owner named.** The owner did not enumerate the sessions, and this
  node does not guess them. Which they are is the one question put to the owner at
  ratification; their records are then named here.
- The comparison's proposal (section 6.2) and its limits (section 7). It is one input with one
  first-hand observation behind it, and it is not the design.
- The three consolidation nodes above, and the curator role in PDR-081 and the `curator-pass`
  skill, which already name conditions under which a curation pass is due.
- The Attendant Workflow's research step
  ([`attendant-research`](../delivery/attendant-research.plan.md)), whose central question is
  how a check fires without the working agent judging that it is needed. The two lanes ask a
  related question at different moments: inside a run, and before any run exists.
- Rulings the owner gave for the Attendant, as inputs whose application here is the owner's:
  on cost in front of a running agent, and on how a cloud run writes. The comparison's proposal
  named a cost bound as a stop condition; the design step puts that difference to the owner.
- The adaptive-capacities research record
  (`.agent/research/agent-capacities-2026-09-09/report.md`), which designs experiments for
  revising a learning policy and for retiring a rule, and asks for an inconclusive outcome
  beside promote and kill.
- The estate's rules for unattended seats (`.agent/rules/unattended-seats-never-prompt.md`),
  and its standing doctrine on who decides a graduation and a merge (PDR-100, PDR-101, the
  merge step of the `pr-lifecycle` skill).

## Questions the design must answer

Not answered here. Each is the design step's, with the owner where it is the owner's.

1. What starts a step: a schedule, a signal the estate already computes, or an event such as a
   session's end; and where the start lives.
2. Which step goes first, and whether it is done by the working session or by a separate one.
3. What a self-started step may write and land, and what it must only propose, read against
   the doctrine that the agent decides a graduation and that clean, green work merges.
4. What the owner sees of the result, and when.
5. What standard its output must meet, and who judges that it did.
6. How a run is bounded.
7. What would show the bet wrong, on a clock that does not itself need someone to remember it.

## Success looks like

- The design for a first experiment written from the research that fed in, with the owner's
  decisions on the questions above recorded.
- The experiment run, and its result recorded whichever way it falls.
- A decision, from that result, on whether further steps are made self-starting.

Not claimed: that the outcome above is reached by this node's first experiment. What the first
experiment can show is whether one refinement step can start without the owner and be done to a
standard the owner accepts. Nor is it claimed that refinement started without the owner is good
refinement, or that the pattern read in another system works there or here.

## Delivery

Delivery plans serving this node declare `serves: self-starting-practice-refinement`; enumerate
them by search. The first is the experiment's design. Its authoring is delegated to the seat
that picks it up, once the research named under "What feeds the design" is recorded; it needs
no further word from the owner to begin. A change to this node's outcome, bet or settled
decisions returns this node to the owner.
