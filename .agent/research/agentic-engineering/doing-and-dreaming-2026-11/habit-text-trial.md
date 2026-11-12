# Habit-text trial: the 28 habit instructions delivered as text

Run 12 November 2026 by the seat Swift holds Aether (Claude Code cloud session `01Duocji`) at
the owner's word: "Carry out the test." It is the test that frame 6 of
[`rules-sort/findings.md`](rules-sort/findings.md) names, and it follows
[`delivery-trial.md`](delivery-trial.md).

**Status of this file.** The design and the prediction below were written before any of the
trial's sessions ran. The results follow them.

## The question

The delivery trial found that a session holds each rule as a one-line pointer and opens the
ones whose file names match the task; the 28 rules that state a habit of mind were the ones
left unopened. Frame 6 asked whether that matters: if the 28 instructions are in the session's
context as text from the start, does what the session does change?

- If behaviour changes, the fault was delivery, and the unit (a pointer to a long file) was
  wrong.
- If it does not, the fault is at the moment of the act, as PDR-098 holds, or the model already
  behaves this way on these tasks without being told.

## Design

- **Treatment.** A copy of the delivery trial's clone (this branch at `44d8f43d8`) in which the
  28 habit rules' adapters under `.claude/rules/` hold the instruction in place of the pointer.
  The instruction is the rule's own `description` field, unedited: 6,859 characters across the
  28. Each adapter then names the rule file as "the record behind this instruction". The other
  96 adapters are untouched. Nothing else differs.
- **Control.** The unchanged clone, run again at the same time. The delivery trial's own ten
  sessions are a second control, so the difference between two control runs measures how much
  the answers vary with nothing changed.
- **Sessions.** As the delivery trial: five tasks, two arms (task alone; task prefixed with
  `/oak-start-right-quick`), model by the `opus` alias, effort `medium`, tools `Read`, `Grep`,
  `Glob` and `Skill`, standard input closed. Ten treatment sessions and ten control sessions.
- **Check that the treatment arrives.** Before the run, one session in each clone was asked,
  with no tool use, to quote what its context held under two of the rule names. The control
  quoted the two pointers and said it did not have the rule text. The treatment quoted the two
  instructions word for word. The text is delivered.
- **Measures.**
  1. Which rule files each session opens, as before.
  2. What each answer does. A reader who has seen none of this seat's reasoning receives the 30
     answers (ten treatment, ten new control, ten old control) under shuffled labels, with the
     28 instructions, and for each answer marks each instruction as not applicable to the
     task, shown, absent, or contradicted, with the line of the answer that shows it. The
     reader does not know which condition an answer came from or that there are three.

## Prediction, written before the run

This seat expects no clear difference in behaviour. The delivery trial's notes record that the
control answers already declined to confirm unrun tests (T4), checked the code before planning
(T5) and advised against the new rule (T3). On tasks this short, the behaviour the habit
instructions ask for was already there. The expected result is therefore the least informative
one: the treatment scores about as the controls do, and the two controls differ from each other
by about as much.

What would count against that: the treatment showing instructions that both controls leave
absent, on the same task, in both arms. Two or more such instructions would be a real effect.

What the test cannot show whatever happens: that an unread rule is broken in long sessions with
a shell and edits. The five tasks were written to test opening, not to tempt a breach.
