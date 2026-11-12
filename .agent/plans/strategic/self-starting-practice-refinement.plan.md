---
id: self-starting-practice-refinement
node_type: strategic
name: Self-starting Practice refinement
overview: The Practice's refinement and learning steps start without the owner instigating them, and what they produce reaches the owner as work to accept, correct or close.
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
decisions (rotating and draining the capture buffer, deciding what graduates, deciding
predictions at their review dates, reading the records of whether a lesson worked) begin
without the owner asking for them, and their results arrive as work the owner can accept,
correct or close. The owner's attention is spent judging what refinement produced, not on
remembering to begin it.

## User groups and value

- **The owner**: refinement stops being a thing only the owner can start. The owner named the
  present state on 2026-11-12: "that lack of loop automation is the biggest weakness in the
  Practice as it stands today … almost all if it requires the user to instigate the refinement
  and learning process". Offered value; a first experiment tests it.
- **Agents opening a session**: buffers that have been drained and registers whose rows are
  live or decided, so that a session begins from current doctrine and not from a backlog it is
  told about and cannot take up. Hypothesised.
- **The people the estate serves**: a Practice whose lessons are decided on and not only
  recorded. Hypothesised, and claimed only as far as decisions recorded in the repository; whether
  those decisions improve later work is the question of the sibling node
  [`outcome-informed-practice-learning`](outcome-informed-practice-learning.plan.md).

## The bet

Every refinement step in the Practice is started today by the owner's word or by an agent's
recall, and none by a clock, a counter or an event (comparison, section 2.5). The Practice
already keeps six records of whether its lessons worked, and on 2026-11-12 no decision had been
taken from any of them for four weeks, because the workflow that reads them had not been
started (section 2.2). The bet is that the missing part is a starter that also does the work:
an agent with nothing else to do, begun by something other than a person, whose result is
staged for the owner and not applied past them.

The comparison found one worked example of the pattern, in another system, read from its code
and documents and not observed in use. That example starts its refinement from counters and a
timer, stages destructive changes for approval, archives where it could delete, and measures
none of what its automation writes. It is a design to learn from, with a record of what went
wrong, and it is not evidence that the design works.

Deliberately not bet on here:

- **A reminder.** The estate has one automatic start on its learning side, an alert shown to
  every opening session, and the owner's word on its result is "ceremony has been invented, and
  then declared a blocker" (2026-10-14). An alert asks a busy seat for work. This node is about
  the work being done.
- **A new measure.** Six exist. A seventh would wait on the same starter.
- **Minting doctrine unattended.** What a self-started step may write is an open design
  question below; the bet does not assume it may write new rules.
- **Machinery ahead of evidence.** The sibling node
  [`attendant-workflow`](attendant-workflow.plan.md) records the owner's preference for
  start-right, `AGENT.md`, skills and rules over hooks, and that nobody yet knows whether they
  suffice. This node inherits that order of trial where it applies. It differs in one respect
  that the design must face: a step that no session is running cannot be started by text a
  session reads.

## What is settled

1. **This is to be done** (the owner, 2026-11-12: "Yes, we should do that, absolutely").
2. **The experiment's design waits for related research to feed in** (the owner, the same
   message). The design is not written here and is not to be inferred from the comparison's
   proposal.
3. **The first experiment is bounded and can fail.** This is the authoring seat's reading of the
   proposal the owner accepted, not the owner's own words: a small number of runs, a stated
   condition under which it stops, and its result recorded whichever way it falls.

## What feeds the design

Inputs the design step reads before it is written. The list is open; the owner named "related
research sessions" without enumerating them, and this node does not guess which they are.

- The comparison's proposal (section 6.2) and its limits (section 7): a scheduled unattended
  seat for the consolidation's deciding step, with three decisions already owed as a first job.
  It is a proposal with one first-hand observation behind it.
- The Attendant Workflow's research step
  ([`attendant-research`](../delivery/attendant-research.plan.md)), whose central question is
  how a check fires without the working agent judging that it is needed. The two lanes ask the
  same question at different moments: inside a run, and before any run exists.
- The owner's settled words for the Attendant that bear here unless the owner says otherwise:
  that cost "tends to distort the direction the agent moves" when put in front of a running
  agent and is recorded, not used as a success measure; and that a cloud run writes under the
  owner's credential as a distinguished class of session whose writes are marked as an agent's.
  The comparison's proposal named a cost bound as a stop condition. The design step reconciles
  the two and does not assume either.
- The adaptive-capacities research record
  (`.agent/research/agent-capacities-2026-09-09/report.md`), which designs experiments for
  revising a learning policy and for retiring a rule, and asks for an inconclusive outcome
  beside promote and kill.
- The estate's rules for unattended seats (`.agent/rules/unattended-seats-never-prompt.md`) and
  the outcomes the consolidation skill reserves for the owner in person.

## Questions the design must answer

Not answered here. Each is the design step's, with the owner where it is the owner's.

1. What starts a step: a schedule, a signal the estate already computes, or an event such as a
   session's end; and on which platform the start lives.
2. Which step goes first. The comparison proposes the consolidation's deciding step. Capture at
   session end and the review of predictions are the other candidates it names.
3. What a self-started seat may write, and what it must only propose.
4. Where its result is staged, and what the owner sees.
5. What standard its output must meet, and who judges that it did.
6. How a run is bounded, read against the owner's word on cost.
7. What would show the bet wrong, on a clock that does not itself need someone to remember it.

## Success looks like

- The design for a first experiment written from the research that fed in, with the owner's
  decisions on the questions above recorded.
- The experiment run, and its result recorded whichever way it falls: that a refinement step
  was started without the owner and produced work the owner accepted; or that it was not, with
  the reason.
- A decision, from that result, on whether further steps are made self-starting.

Not claimed: that refinement started without the owner is good refinement; that the pattern
read in another system works there or here; that unsupervised working is reached.

## Delivery

Delivery plans serving this node declare `serves: self-starting-practice-refinement`; enumerate
them by search. None exists yet, by the owner's instruction. The first is the experiment's
design. It is authored at the owner's word that the related research has fed in, by the seat
that picks it up, and this node returns to the owner if that research changes the outcome or
the bet.

No owner gate is recorded for that wait. A gate with an expiry would report itself at every
session open, which is the alert this node declines to bet on, and the owner's word of
2026-10-14 on such gates stands.
