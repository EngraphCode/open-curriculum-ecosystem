---
classification: situational
description: After editing TypeScript files, check lint for file/function length violations.
trigger: surface:source-authoring
globs:
  - "**/*.ts"
---

# Lint After Edit

Operationalises [ADR-121 (Quality Gate Surfaces)](../../docs/architecture/architectural-decisions/121-quality-gate-surfaces.md).

After editing TypeScript files, check lint for file/function length violations. Run lint on the changed files (on Cursor, `ReadLints` on the changed files) or run `pnpm lint:fix`. Catch violations early — don't accumulate them. A file you edit is yours to leave clean:
fix its lint findings whatever their provenance, never only the lines you changed
(owner norm, 2026-06).

A records-only change still runs the whole estate check at the push. Four validators refuse
records and nothing else catches them earlier (a retired path named in a record, a directive
linking into the patterns tier, a cited path the host does not own, a pattern index out of
sync): run `pnpm check:docs` before a records push. Three pushes in one hour were refused, one
validator each (2026-09-30).

Lint the fragment before it joins the whole. A commit header is checkable with `wc -c` and a
block about to be appended with markdownlint on the block file, before either joins the record;
a check that runs only on the whole runs late, and each late refusal cost a commit or a gate run
(six in one window, 2026-09-26).

Key ESLint thresholds that bite during refactoring:

- `max-lines`: 250 lines per file
- `max-lines-per-function`: 50 lines per function
- `complexity`: ESLint counts `??` and `?.` as branches

When a violation appears, follow the refactoring rules in `.agent/directives/principles.md`:

- **File too long**: split by groupings of responsibility; for very long files, turn into a directory with an index.ts integration point.
- **Function too long**: extract named helpers as pure functions with unit tests.
- **Too complex**: extract branch-heavy expressions into pure-function helpers with unit tests.
