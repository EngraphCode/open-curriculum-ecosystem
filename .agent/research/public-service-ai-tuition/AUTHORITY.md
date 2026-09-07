# Authority and status (OCE-side)

This file is authored in this repository and is not part of the imported collection. It states
what the collection's location confers, records the owner's rulings that bear on it, and lists
every delta between the imported bytes and the files in this directory. The collection's README
and chapters are the author's record and keep their source bytes except as listed below.

## What placement confers

- The collection is imported research under ADR-226: a faithful public projection of an
  externally completed record. Placement in `.agent/research/` confers no ratification of the
  work programme chapter 13 proposes, of the kernel-and-profile architecture chapter 01 files
  under its governing constraints, or of any direction the README calls settled; strategy
  authority lives in `docs/strategy/`, plan authority in `.agent/plans/`.
- Two dated reviews qualify the collection and are the record of its known corrections: the
  author-lineage review
  [`pr-66-review-2026-09-06.md`](../../reports/public-service-ai-tuition/pr-66-review-2026-09-06.md)
  (R1 to R7) and the independent review
  [`pr-66-independent-review-2026-09-06.md`](../../reports/public-service-ai-tuition/pr-66-independent-review-2026-09-06.md)
  (F1 to F9, with the mapping of R1 to R7: five accepted, two narrower than published, none
  refuted). Read the affected passages with those qualifications.
- Supersession pointer (R4): chapter 08 Appendix G preserves the 29 August Eve investigation; its
  successor in this repository is
  [`eve-mcp-agentic-chat-experience-2026-08-30.md`](../innovation-kit/eve-mcp-agentic-chat-experience-2026-08-30.md),
  which reframes that experiment as one member of a portfolio.
- Reading route (F9): chapter 13 links every substantive chapter except 05 (inclusion and human
  service) and 06 (state, rights and context); a builder following chapter 13's routes reaches
  the access, safeguarding and rights conditions only through those two chapters.

## Owner rulings that bear on the collection (2026-09-07)

- The historical probe runner follows the standing policy (ADR-226 clause 4 and the
  TypeScript-only rule): "Apply the standing policy", with no research-record exemption class.
  Applied as reduction to data; see the deltas below.
- The nine `oaknational` repositories the collection permalinks into are all public (read once at
  the owner's permission; `oak-dspy-mcq-eval` is archived), so every permalink stays live under
  ADR-226 clause 2; the 26 unpinned links remain a pinning concern for the source.
- Whether the directions the README calls settled are settled at the owner's word is not yet
  answered; until it is, chapter 12 §14's own grading (relayed continuity excerpts) is the
  standing reading.

## Deltas from the imported bytes

Imported at PR 66 head `2db74f5bbc9b3b3c1afe2bf95a7c556cad6295fa`. The collection's files are
byte-identical to that revision except:

| File | Imported blob | Delta | Why |
| --- | --- | --- | --- |
| `assets/oce-core-graphs-atoms-probes-2026-09-06.mjs` | `795808186a4c215909aee2fa7994803d63302612` | removed as an executable; its exact text is preserved as [`assets/oce-core-graphs-atoms-probes-2026-09-06.md`](assets/oce-core-graphs-atoms-probes-2026-09-06.md) | ADR-226 clause 4 and the TypeScript-only rule; owner ruling 2026-09-07 |
| `README.md` | `75b33edf1e960205abc2eb5b93989b7bad6a7187` | the assets-table row for the runner links the listing and names it a listing | the link must resolve (the markdown-links gate) |
| `08-oce-audit-and-engineering-findings.md` | `f16705455d1f91a2ffa49f7c3bad382d6f6c3d26` | §7's "original runner" link points at the listing; the fenced rerun command is unchanged | the link must resolve; the command is the historical instruction the listing explains |

Everything else in this directory is the imported byte. A later revision of the source collection
enters as a new import, never by editing these files in place.
