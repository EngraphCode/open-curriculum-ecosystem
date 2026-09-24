# Compute, Don't Hope

Owner ruling (2026-09-13, verbatim): "nothing should be 'hand kept', ever, manual lists
are always going to be wrong eventually, and when they are we have to remember that they
exist, this is a general rule, compute don't hope".

## The Rule

A list whose truth lives somewhere else is never maintained by hand. It is computed from
that truth at the point of use, or it is gated by a validator that recomputes it and
refuses drift ([`validators-must-recompute-not-just-record`](validators-must-recompute-not-just-record.md)
is the gate-shaped half of this rule; this rule is the general form).

The test for "hand-kept": could the entries be derived from something the repository
already declares — a manifest, an ignore rule, a directory, a frontmatter field, the
imports of a file? If yes, the list is a copy of that truth, and a copy drifts the day the
truth moves while nobody remembers the copy exists.

What is **not** hand-kept: declared configuration that is itself the source of truth (a
package manifest, an ignore rule, a host profile, a plan node's frontmatter, a validator's
declared scope). Those are the things lists must be computed from. The line is: a
declaration states an intent; a list restates a fact.

## How to comply

1. **Derive.** Compute the set from its source at run time (the install-time build closure
   from the workspace manifests; the paths a validator may see from the tracked tree and the
   ignore rules; the strategy registry from the stream documents).
2. **Or gate.** Where derivation is genuinely impossible, the list lands with a validator that
   recomputes it from the source and fails on mismatch — the list is then a cache with a
   checker, not a hope.
3. **Never** land a list with a comment saying "keep this in sync with X". The comment is the
   confession that the list should have been computed.

## Worked instances

- 2026-09-13, a transplant's first merge: the postinstall bootstrap built a hand-kept list of
  workspace packages; the ESLint plugin every config file imports was not on it, a warm local
  build output masked the gap, and CI's cold checkout failed dependency-cruise. The lineage
  had hit the same class twice before. Cure: the closure is derived from the workspace
  manifests — every package whose exports resolve only to built output, in
  workspace-dependency order.
- 2026-09-13, the same afternoon: three validators each carried a copy of the same exclusion
  list, including entries that restated the ignore rules. Cure: the walker takes the tracked
  tree as its universe, so the ignore-class entries vanish; what remains is each validator's
  declared scope.
- 2026-09-12: a shared start-right workflow carried a hand-copied gate list, twelve of
  nineteen citations dead after a transplant. Cure: a cited-scripts validator resolves every
  citation against the root package manifest on every run.
