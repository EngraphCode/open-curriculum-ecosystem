# TypeScript data structures and algorithms: non-graph research

**Recorded:** 2026-09-07  
**Status:** research draft; no dependency or package design selected

## Purpose and scope

This note surveys standard data structures and algorithms available to
TypeScript applications through JavaScript's native runtime and external
packages. It highlights non-graph primitives that could support useful OCE
low-level packages without OCE implementing every underlying mechanism.

The owner's working direction is: "I would still like OCE to have low level
packages, but I am happy for those to defer the very low level primitives to
external packages". That motivates the research; this note does not settle
package boundaries, public APIs or dependency choices.

Graph research is being handled separately by the owner in **Typescript
Graphs**. The owner will update this draft when appropriate. Graph candidates,
comparisons and design proposals are outside this note's scope.

The primary documentation below was checked on 2026-09-07. These are
observations of published documentation, not conformance tests of pinned
releases. No package was installed or benchmarked for this survey. Source
licences are recorded below; release-specific compatibility, maintenance,
security, dependency footprint and performance have not been assessed.

## Native facilities

[TypeScript's types are erased](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#erased-types):
they do not add runtime collections or validation. JavaScript supplies arrays,
typed arrays, keyed collections and operations over them.

The [ECMAScript keyed-collections specification](https://tc39.es/ecma262/multipage/keyed-collections.html)
defines `Map`, `Set` and their weak counterparts. `Map` and `Set` use
`SameValueZero` equality and preserve insertion order. The specification requires
average sublinear access; it does not mandate hash tables or promise a specific
implementation. Weak collections are not enumerable.

Native facilities are a useful baseline for an operation-specific comparison.
They do not offer a dedicated heap, priority queue, deque, ordered tree, trie,
LRU cache or disjoint-set API. Implementing such behaviour with an array or map
still leaves the algorithm and its guarantees to the application.

## Non-graph ecosystem candidates

This is a capability map, not a ranking. A broad catalogue and a small focused
package offer different evaluation starting points; neither proves fitness.

| Candidate | Documented non-graph facilities | Questions to investigate |
| --- | --- | --- |
| [Mnemonist](https://yomguithereal.github.io/mnemonist/) | Modular JavaScript structures with types: heaps, queues, tries, LRU structures, fixed deques and a static disjoint set. | Which focused module fits the required operation? Check comparator/equality behaviour, capacity constraints, mutation and declaration compatibility. |
| [js-sdsl](https://github.com/js-sdsl/js-sdsl) | Priority queues, deques, ordered maps/sets and other containers; individual container packages are available. | Do ordered-container and iterator contracts fit? Check bounds operations, comparator rules and invalidation behaviour. Published benchmarks do not establish OCE workload performance. |
| [data-structure-typed](https://github.com/zrwusa/data-structure-typed) | TypeScript heaps, deques, tries, trees and skip lists; category subpath imports are documented. | Which exact structure and operation are needed? Check semantics and dependency footprint rather than inferring suitability from catalogue breadth. |
| [Immutable.js](https://immutable-js.com/) | Persistent collections including lists, maps, sets and ordered variants, plus lazy sequences; unchanged structure is reused between versions. | Is persistent value semantics required? Check equality, update behaviour, iteration and conversion costs. This is a distinct choice from mutable containers. |

## Documented algorithm operations

These sources provide concrete algorithm operations beyond the container
catalogues. Stated complexity is upstream documentation, not an OCE benchmark.

| Operation | Documented behaviour | Boundary to keep explicit |
| --- | --- | --- |
| [Native array sorting](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort) | `Array.prototype.sort` mutates and returns its receiver; stable sorting is required under a consistent comparator. | The specification does not prescribe a particular sorting algorithm or universal complexity bound. |
| [Native predicate search](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.find) | `Array.prototype.find` visits indices in ascending order, stops at a match and otherwise returns `undefined`. | This is sequential predicate search; a matched value can itself be `undefined`. |
| [Mnemonist heap construction](https://yomguithereal.github.io/mnemonist/heap.html#heapify) | `Heap.heapify` modifies the supplied array into a heap; the documentation states linear time. | Input mutation is part of the operation, and the documented bound has not been measured here. |
| [Mnemonist bounded selection](https://yomguithereal.github.io/mnemonist/heap.html#nsmallest) | `nsmallest` and `nlargest` select a requested number of values from an iterable and accept a comparator. | The documented bounds are `O(N log n)` time and `O(n)` space for input size `N` and selection size `n`; `nlargest` uses the same comparator orientation as `nsmallest`. |

## Structures and the operations they support

These examples identify research directions, not proposed OCE packages or
requirements to build every capability. Candidate availability comes from the
documentation above; the potential uses are general algorithmic interpretations.

| Structure or algorithm family | Operations worth evaluating | Contract questions |
| --- | --- | --- |
| Heap / priority queue | Insert items and repeatedly select an extremum; bounded selection can retain the best candidates seen so far. | Min/max orientation, comparator consistency, equal-priority ordering, empty behaviour and priority updates. |
| Queue / deque | FIFO processing and operations at one or both ends. | Capacity, overflow, empty behaviour, allocation and iterator behaviour during mutation. |
| Ordered map / set and search bounds | Sorted iteration, predecessor/successor and range-bound lookup where the chosen API supplies them. | Comparator equality, duplicate keys, inclusive/exclusive bounds and iterator invalidation. |
| Trie / prefix index | Prefix lookup and enumeration. | String or token representation, Unicode handling, ordering and storage cost. |
| LRU cache | Bounded retention and eviction by recent use. | Which operations update recency, capacity, eviction visibility and whether expiry is a separate concern. |
| Disjoint set / union-find | Merge equivalence classes and ask whether elements share a representative. | Fixed versus growing membership, identity, representative stability and supported update operations. |
| Persistent collections / lazy sequences | Retain earlier values after updates and compose collection transformations. | Value equality, structural sharing, eager/lazy work, retained memory and conversion to native values. |

The data structure is only part of an algorithm choice. Ordering, search,
selection, deduplication and set operations each need a defined observable
result. Complexity claims also need an operation and workload: a benchmark for
one container or input distribution does not establish another algorithm's cost.

## Source licences and attribution

The following notices were checked on 2026-09-07 for the consulted
documentation, following
[PDR-115](../practice-core/decision-records/PDR-115-naming-openly-licensed-external-sources.md).
This note paraphrases documented facts and adds research questions. It imports
no source code or substantial documentation passages. Documentation licensing
is distinct from a future assessment of a selected dependency release.

| Documentation source | Attribution | Verified notice and scope |
| --- | --- | --- |
| TypeScript Handbook | Microsoft and contributors | [CC BY 4.0 for documentation](https://github.com/microsoft/TypeScript-Website/blob/v2/LICENSE); the [legal notice](https://github.com/microsoft/TypeScript-Website#legal-notices) distinguishes it from MIT-licensed code. |
| ECMAScript specification | Ecma International | [Ecma Alternative Copyright Notice and Copyright License](https://tc39.es/ecma262/multipage/copyright-and-software-license.html) for specification prose, distinct from the page's BSD software licence. |
| Mnemonist documentation | Guillaume Plique (Yomguithereal) | [MIT declaration on the documentation site](https://yomguithereal.github.io/mnemonist/#license) and [licence covering associated documentation](https://github.com/Yomguithereal/mnemonist/blob/master/LICENSE.txt). |
| js-sdsl README | Zilong Yao | [MIT, including associated documentation](https://github.com/js-sdsl/js-sdsl/blob/main/LICENSE). |
| data-structure-typed README | Pablo Zeng | [MIT, including associated documentation](https://github.com/zrwusa/data-structure-typed/blob/main/LICENSE). |
| Immutable.js website | Lee Byron and other contributors | [MIT repository licence](https://github.com/immutable-js/immutable-js/blob/main/LICENSE); the repository holds the website and its [explicit MIT footer](https://github.com/immutable-js/immutable-js/blob/main/website/src/SiteFooter.tsx). |

## Open research questions

- Which non-graph primitives are already implemented or consumed in OCE, and
  which concrete operations motivate further investigation?
- Where do native facilities already satisfy the need?
- Where could an external primitive reduce implementation and maintenance work,
  accounting for integration, conversion and dependency costs?
- What useful contract would an OCE package provide, if any, beyond direct use
  of the external API?
- Which exact releases and runtime/module combinations should be compared, and
  what contract checks or representative workloads would discriminate between
  them?

Those questions remain open. This draft adds evidence to the repository without
choosing an implementation, changing architecture guidance or amending a plan.
