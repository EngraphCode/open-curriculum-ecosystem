# ADR-228: Own low-level contracts and adopt external primitives where they fit

- **Status:** Accepted (owner direction, 2026-09-07)
- **Date:** 2026-09-07
- **Scope:** Ownership and adoption policy for low-level OCE packages
- **Related:** [ADR-041](041-workspace-structure-option-a.md),
  [ADR-154](154-separate-framework-from-consumer.md),
  [ADR-173](173-graph-stack-topology.md),
  [ADR-179](179-transport-agnostic-graph-substrate.md)

## Context

OCE's foundations-first strategy calls for excellent low-level building blocks.
Package ownership and implementation ownership are separate decisions: a useful
OCE package can own a stable contract while an external library supplies its
underlying data structure or algorithm. Treating minimal dependencies as a
requirement to implement every primitive increases the correctness and
maintenance burden that foundations are meant to reduce.

The owner's direction is: "I would still like OCE to have low level packages,
but I am happy for those to defer the very low level primitives to external
packages". This decision records that policy independently of research imports
and implementation proposals.

## Decision

### Keep coherent OCE low-level packages

OCE retains and develops low-level packages where they provide a coherent,
useful public contract. Those contracts may be domain-neutral: collection or
graph semantics, deterministic behaviour, identity, ordering, explicit failure,
serialisation, or cross-runtime guarantees can warrant ownership without being
specific to curriculum or practice.

An OCE package owns its promised behaviour, documentation and assurance even
when it delegates implementation. It need not own the heap, tree, index,
traversal or storage engine underneath that promise. A semantic responsibility,
an algorithm, a module and a physical workspace are distinct units; identifying
one does not automatically justify creating all the others.

### Choose the smallest sufficient implementation

Start with the required contract and existing authorities. Use native runtime
facilities when they satisfy it. Evaluate established external implementations
for missing primitives before creating an owned implementation. Adopt when the
candidate meets the contract with less total design, integration, assurance and
maintenance cost; implement locally when evidence supports that choice.

Direct use is appropriate when the external contract is already the desired
contract. Add an OCE boundary when it provides a named semantic guarantee or
meaningfully contains implementation coupling. A package that only renames or
re-exports a dependency does not acquire an ownership warrant from its name.
Do not build a universal collection facade or a speculative multi-backend
framework to accommodate hypothetical replacements.

Assess dependency cost rather than imposing a zero-dependency default. A small,
declared, provider-neutral runtime dependency may belong in core. Runtime
orchestration, product policy and provider coupling still belong at the layers
specified by ADR-041 and ADR-154. This decision does not change their dependency
direction, workspace admission or framework/consumer separation rules.

### Make adoption reviewable at the contract boundary

A proposal to introduce or replace a primitive records, at a depth proportionate
to its reach and risk:

- the required behaviour and consumer need; the OCE-owned guarantees and the
  native or external responsibilities;
- alternatives considered, including direct use and a small owned implementation,
  with reasons for the chosen boundary;
- the exact dependency version evaluated, applicable standard, runtime and
  module compatibility, licence, maintenance and security evidence;
- relevant semantic differences, including identity/equality, ordering,
  mutation, failure, serialisation and resource bounds;
- evidence for claimed benefits, including conversion and integration costs,
  plus an explicit condition that would reject or reopen the choice.

Verify OCE's observable contract against the selected implementation, including
negative cases and meaningful laws. Exercise the shipped package boundary and
dependency integration. Benchmark where performance is a selection reason or
public promise. Do not duplicate an upstream implementation's internal tests
or claim that package reputation proves OCE's guarantees. Dependency upgrades
must preserve the contract or explicitly change it through the normal review
process. Existing dependency and supply-chain gates continue to apply.

### Graph direction remains open

This policy selects no graph library, storage model or replacement topology.
On 2026-09-07 the owner confirmed that graph research continues in the
**Typescript Graphs** project and is likely to require more than adopting
Graphology. Graphology is a candidate, not a default or an approved substrate.
The repository's selection case must be self-contained when a proposal lands.

Graph modelling, generic graph algorithms, RDF terms and datasets, query,
persistence and transport are separate capability decisions. They may require
different implementations and explicit projections between models. Research
must account for semantic loss and conversion costs before treating one model
as a substitute for another. Accepted graph decisions in ADR-173 and ADR-179
remain in force unless a subsequent decision explicitly revises them.

## Consequences

- OCE can offer excellent low-level packages while delegating commodity
  implementation and reducing the code it must independently maintain.
- External implementation does not transfer responsibility for OCE's public
  guarantees. Dependencies bring integration, upgrade and supply-chain costs
  that must be weighed alongside avoided implementation work.
- Zero dependencies is an available outcome, not the default measure of
  excellence. Dependency budgets record justified choices.
- Existing packages are not mandated to migrate, and candidate lists do not
  authorise new workspaces or dependencies. Each implementation proposal must
  justify its own scope and satisfy the existing admission gates.
- Research preserves its dated findings. A research import or review does not
  ratify a library choice, a package programme or a replacement graph stack.

## Supporting evidence

The [bounded research note](../../../.agent/research/low-level-packages-and-external-primitives-2026-09-07.md)
records the ecosystem survey, unresolved questions and implications for the
tuition research review. It supports this decision; the policy is owned here.
