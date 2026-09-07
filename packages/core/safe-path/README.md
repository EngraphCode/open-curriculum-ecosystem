# @oaknational/safe-path

Path-containment guard for the monorepo. `assertPathWithinBase(candidate, baseDir)`
canonicalises both paths with `realpathSync` — resolving `..` segments **and**
symlinks, unlike `path.resolve` — and asserts the candidate resolves inside the
base, returning the canonical contained path for safe use.

Use it to guard filesystem sinks against path-injection from caller-influenced
input (for example a value taken from `process.argv`).

## Usage

```ts
import { assertPathWithinBase } from '@oaknational/safe-path';

const safe = assertPathWithinBase(untrustedPath, baseDir);
const contents = readFileSync(safe, 'utf-8');
```

Single source of truth: consumed by `@oaknational/agent-tools` and the
`oak-search-cli` app. The injectable `realpath` seam keeps tests off real IO.

## Known extension points

A safe file write within a base needs more than path containment (the containment writer
of 2026-09-06, `scripts/write-contained.ts`): open the target `O_WRONLY|O_CREAT|O_NOFOLLOW|
O_NONBLOCK` with no `O_TRUNC`, confirm the `O_NOFOLLOW` constant is present AND nonzero (some
platforms expose it inert as 0), `fstat` the descriptor to confirm a regular file with ONE link (`st_nlink === 1`: a hard
link to an outside file passes every other check and would be truncated through it), then
`ftruncate` and write through the descriptor — a FIFO refuses `ENXIO` instead of hanging, a
directory `EISDIR`, a symlink at the final component `ELOOP`, all in the same operation as
the open. `O_NOFOLLOW` guards the LAST path component only: a process that swaps an
ancestor directory for a symlink between canonicalisation and `open` is still followed,
so the descriptor can name a regular file outside the base and pass `fstat`. The writer
closes the check-then-use race at the leaf and narrows, never closes, the ancestor window
(a directory descriptor walked with `openat` per component is the full cure); the
helper's contract states that boundary and claims no race-freedom. That writer is the third consumer to want "write a file safely
inside a base"; per `consolidate-at-second-consumer`, an `openRegularFileWithin(base,
relative)` helper is the extraction once a second real consumer needs it, not before.
