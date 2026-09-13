# One Instance Is an Observation

When a durable record — a ledger row, a plan, a memory, a thread record, a
pull request comment, a decision record — names a pattern, class, tendency,
category or rule derived from observations, the same sentence states the number
of independent instances and the comparator. Fewer than three independent
instances is recorded as an observation, in the words of what was seen, and no
class or category is introduced from it.

## Rule

- **Count before you name.** "Loops like this", "records loops", "this class of
  finding", "the gate fires late on X" each assert a distribution. Write the
  count (`n = 1`), the unit that makes instances independent (a pull request,
  not a round inside one), and what the instances are compared against.
- **Below three, an observation.** One or two instances are recorded as what
  happened, where, and against what, with the strongest alternative explanation
  named. They may motivate a fixture, a probe, or a row; they may not name a
  category, tune a weight, or write a special case.
- **A fit is not a test.** A weight, threshold or rule chosen on a set of
  instances is not evidenced by those instances; it is evidenced by instances it
  was not chosen on. Record which is which.
- **Say what would show it wrong.** Every pattern named carries its falsifier
  in the same record, as PDR-130 requires of every graduation.

## Why

On 2026-09-13 the seat calibrating the review cost gate set a weight so the
gate would fire on one loop, scored the gate against that loop, reported it as
"late on one of six", and proposed a category ("records loops") from that
single row. The owner's word: inventing a category before the evidence "would
skew all calculations, invite special cases, and broadly turn this effort into
theatre before it has properly begun". The foundations this rule applies are in
[`experimental-design-foundations.md`](../research/cognitive-systems/structured-thinking/experimental-design-foundations.md)
and
[`statistical-rigour-foundations.md`](../research/cognitive-systems/structured-thinking/statistical-rigour-foundations.md);
this rule is their smallest always-loaded form, never a restatement.

## Prediction

This rule should make single-instance categories stop appearing in records; if
one appears twice in tracked records with the rule loaded, the rule is not
working and the failure is filed against it.
