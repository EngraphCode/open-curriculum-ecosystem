# TypeScript graph foundations research

Research and recommendations completed on **7 September 2026**. Start with the
report's executive answer and competing approaches. The research evaluates the
best foundations by semantics, composability, assurance, TypeScript usability
and lifecycle cost; current OCE choices carry no preservation requirement or
migration-convenience preference.

| File | Purpose |
| --- | --- |
| [Report](typescript-graph-foundations-report-2026-09-07.md) | Definitions, competing architectures, library and model comparisons, executed findings, and proposed OCE outcomes. |
| [Reproduction guide](typescript-graph-foundations-reproduction-2026-09-07.md) | Environment, extraction, installation, execution and interpretation instructions. |
| [Probe source bundle](typescript-graph-foundations-probes-2026-09-07.json) | Eighteen UTF-8 source files with SHA-256 hashes, including pinned manifests and lockfiles. |
| [Recorded evidence](typescript-graph-foundations-evidence-2026-09-07.json) | Raw observations, timings, compiler diagnostics, source hashes and method limitations. |

## Related general foundations

[PR 70](https://github.com/EngraphCode/open-curriculum-ecosystem/pull/70) carries
the [general data-structure and algorithm survey](https://github.com/EngraphCode/open-curriculum-ecosystem/blob/c5972c61d96f0c2687db5af024936ac83e7b680c/.agent/research/typescript-data-structures-and-algorithms-2026-09-07.md):
research into useful atoms and foundational building blocks for graph and
non-graph consumers, including native collections, sorting, search, selection,
queues, heaps, ordered containers, caches, disjoint sets and persistence.

The [report's non-graph handoff](typescript-graph-foundations-report-2026-09-07.md#12-precise-non-graph-handoff-reconciled-with-pr-70)
contributes graph-specific requirements for those general foundations, including
equality, ordering, ownership, snapshots and resource bounds. General-foundation
findings in turn inform graph design and dependency choices. The two research
efforts inform each other; package boundaries and adoption decisions remain open.
The document link preserves the inspected survey snapshot; PR 70 carries its
subsequent updates and the link back to this research.

## Status and provenance

Repository inclusion does not approve implementation, dependency, policy or ADR
changes. Recommendations remain proposals, with the report's stated evidence
limits and adoption checks.

The research inspected OCE at
[`dfe92492711f8d7c6ac8233735994c8fada45e0e`](https://github.com/EngraphCode/open-curriculum-ecosystem/commit/dfe92492711f8d7c6ac8233735994c8fada45e0e).
Its observations about [PR 70](https://github.com/EngraphCode/open-curriculum-ecosystem/pull/70),
including its draft status and checks, describe the research cutoff and pinned
head in the report. They are historical evidence, not a live status feed.

The commissioned brief and concept-map reference are provenance inputs. The
report includes the governing scope, criteria and definitions needed to read it
independently; reproduction uses the files here and a separate pinned OCE
checkout, with no dependency on the original conversation.

The source bundle and recorded evidence are preserved byte-for-byte. An archived
compiler diagnostic contains original research workspace paths; these are
literal diagnostic text, not paths required to reproduce the probes. The report
has two editorial clarifications for repository inclusion: its authority line
and the wording identifying RDF conformance as a recommendation. One evidence-table
phrase uses "interfaces" in place of "APIs" to avoid a false positive in the
repository's secret scanner; its meaning is unchanged.
Section 12 now provides navigation to the companion research in PR 70.

## Reproduction

Follow the [reproduction guide](typescript-graph-foundations-reproduction-2026-09-07.md)
from a separate working directory containing the companion files. The guide
verifies bundled source hashes before extraction and identifies the original
runtime, dependency versions and OCE source pin. A successful probe run
reproduces recorded observations, including defects; it does not certify an
upstream package or establish universal performance superiority.
