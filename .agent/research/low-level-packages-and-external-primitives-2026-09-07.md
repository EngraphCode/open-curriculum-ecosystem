# Low-level packages and external primitives

**Recorded:** 2026-09-07  
**Status:** bounded source review; candidate discovery, not dependency selection  
**Decision:** [ADR-228](../../docs/architecture/architectural-decisions/228-low-level-package-ownership-and-external-primitives.md)

## Question and evidence boundary

How can OCE keep excellent low-level packages while delegating underlying
primitives to the ecosystem? ADR-228 owns the policy. This note supplies a
bounded map of candidate capabilities and the questions an implementation
proposal must resolve.

The primary documentation below was checked on 2026-09-07. These are observations
of published documentation, not conformance tests of pinned releases. No package
was installed or benchmarked for this survey. Maintenance, licensing, security,
bundle cost and runtime compatibility remain release-specific adoption checks;
this note makes no comparative judgement about them. Re-verify each relevant
claim against the selected version before relying on it for implementation.

The owner's graph-direction clarification is also dated 2026-09-07: research
continues in the **Typescript Graphs** project, and the answer is likely to be
more involved than adopting Graphology. That is a research-status statement,
not a claim that this survey inspected the separate project's findings. No
project URL or additional findings were supplied. A future selection case must
bring the relevant evidence into the repository so reviewers can assess it.

## Ecosystem evidence

| Surface | Observation from the primary source | Question for OCE |
| --- | --- | --- |
| [TypeScript](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#erased-types) | Type annotations are erased and do not add runtime behaviour. | Which guarantees need runtime implementation or validation? Types alone do not supply them. |
| [ECMAScript keyed collections](https://tc39.es/ecma262/multipage/keyed-collections.html) | `Map` and `Set` use `SameValueZero` equality and preserve insertion order. Average access must be sublinear; a hash table is not the mandated implementation. | Do native identity, equality and ordering satisfy the contract? There is no general graph or priority-queue API in this built-in collection surface. |
| [Mnemonist](https://yomguithereal.github.io/mnemonist/) | Modular JavaScript structures with types include heaps, queues, tries, LRU structures, fixed deques and a static disjoint set. Graph structures are outside its scope. | Does a focused primitive cover the missing operation with acceptable bounds and integration cost? Its recommendation of another graph library does not settle OCE's graph choice. |
| [js-sdsl](https://github.com/js-sdsl/js-sdsl) | Documents priority queues, deques, ordered maps/sets and other containers, with individual container packages. | Which exact container and comparator semantics fit? Published benchmark claims do not establish performance on OCE workloads. |
| [data-structure-typed](https://github.com/zrwusa/data-structure-typed) | Documents TypeScript heaps, deques, tries, trees, skip lists and directed/undirected graphs, with category subpath imports. | Does the required operation meet OCE's contract? Breadth of catalogue does not establish fitness or comparative performance. |
| [Immutable.js](https://immutable-js.com/) | Supplies persistent collections, ordered variants and lazy sequences, reusing unchanged structure between versions. | Is persistent value semantics the actual requirement? It is a distinct contract choice from a mutable container. |
| [Graphology capabilities](https://graphology.github.io/) and [design choices](https://graphology.github.io/design-choices.html) | Supports directed, undirected and mixed graphs, optional self-loops and parallel edges. Keys are string-coerced, insertion order is not guaranteed, and inconsistent operations can throw. | Can identity, ordering and failures meet the required contract? These capabilities do not establish suitability for RDF or OCE's entire graph stack. |
| [RDF/JS dataset contract](https://rdf.js.org/dataset-spec/) | `DatasetCore` defines quad storage, ignores duplicates according to `Quad.equals`, and is unordered. The larger `Dataset` interface is labelled experimental. | Can the external semantic contract itself be adopted? Deterministic presentation would need an additional guarantee. |
| [N3.js](https://github.com/rdfjs/N3.js) | Documents RDF parsing, writing and storage. Its writer trusts supplied terms and can emit invalid documents from invalid values. | Which RDF responsibility fits, and where are term validity and error guarantees established? This is a different capability from a general graph library. |

The distinction between ECMAScript's collections and ecosystem packages matters:
TypeScript does not provide a runtime algorithms library, but that does not
imply OCE must write one. Equally, discovering a capable dependency does not
remove the need for a useful OCE contract above it.

## Questions for graph research

The unresolved decision is broader than choosing a graph container. A useful
selection case should separate the following responsibilities and show where
one implementation can cover several without obscuring their differences.

| Responsibility | Evidence needed before selecting an implementation |
| --- | --- |
| Model and identity | Required directedness, parallel edges, n-ary relationships, RDF terms, named graphs, equality and provenance; preserve distinctions consumers need. |
| Algorithms and queries | Named operations and their observable results, deterministic tie-breaking where promised, stopping/cancellation and resource bounds. |
| Storage and mutation | Required persistence, updates, consistency, dataset scale and access patterns; distinguish an in-memory container from a durable store. |
| Projection and interchange | Round-trip requirements, explicit semantic loss, ordering/canonicalisation and conversion cost between models or serialisations. |
| Package boundaries | Which contract OCE owns, which standard it consumes, which machinery a dependency supplies, and whether an adapter has a concrete responsibility. |

These are research questions, not requirements to build every capability.
Different responsibilities may use different dependencies; a single integrated
implementation may also win if the evidence supports it. Neither outcome is
selected here. ADR-173 and ADR-179 remain the accepted graph architecture until
explicitly amended by a subsequent decision.

## Relationship to the tuition import and review

[PR 66](https://github.com/EngraphCode/open-curriculum-ecosystem/pull/66) imports
dated research. Its [engineering chapter at the reviewed revision](https://github.com/EngraphCode/open-curriculum-ecosystem/blob/2db74f5bbc9b3b3c1afe2bf95a7c556cad6295fa/.agent/research/public-service-ai-tuition/08-oce-audit-and-engineering-findings.md)
distinguishes semantic responsibilities, algorithms, reusable modules and
physical workspaces, and discusses conditional ecosystem adoption. That is
supporting analysis; import placement does not decide policy.

[PR 68](https://github.com/EngraphCode/open-curriculum-ecosystem/pull/68) records
an independent review of that import. Its [review at the inspected revision](https://github.com/EngraphCode/open-curriculum-ecosystem/blob/820c69030945bbfab71dc065771b016c43b475ae/.agent/reports/public-service-ai-tuition/pr-66-independent-review-2026-09-06.md)
is evidence about the import and its claims, rather than an architecture
decision. The independent ADR can land before either PR, without relying on
files available only on those branches.

Their follow-up work should cite ADR-228, distinguish historical findings from
operative policy, and reassess any conclusion that assumes either wholly owned
primitives or a predetermined graph dependency. Preserve imported source bytes
under ADR-226; place the reconciliation in maintained review or integration
material. Their existing review holds and separate programme decisions are not
released by this policy.

## What remains to establish

The survey establishes that native and external building blocks are credible
options for a contract-led evaluation. It does not establish which library,
combination, projection or owned module OCE should ship. That requires a bounded
proposal with a named consumer need, a version-specific contract comparison,
integration evidence and a losing condition under ADR-228. The reliable-atoms
programme can carry that implementation work when a tranche is approved.
