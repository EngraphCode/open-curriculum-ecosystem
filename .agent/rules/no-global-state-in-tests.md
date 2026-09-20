# No Global State Manipulation in Tests

Tests MUST NOT read or mutate global state. Prohibited in ALL tests
(unit and integration), and in the check files and setup files of an E2E
or smoke check (its composition root is the one exception, below):

- `process.env.X` reads — inherit ambient shell state and hide missing DI seams
- `process.env.X = 'value'` — mutates global state, causes race conditions
- `vi.stubGlobal('fetch', ...)` — mutates global objects
- `vi.mock('module', ...)` — manipulates module cache, leaks between files
- `vi.doMock('module', ...)` — manipulates module cache, subtle race conditions

Tests also must not touch ambient `.env` files or `process.cwd()`.
Pass configuration as explicit function parameters. Simple fakes are injected
as constructor arguments, not complex mocks.

A validation check's composition root — a smoke or E2E check's runner config
or entry script — may read ambient env, validate it, and inject the result. Test files and setup files
must not read or mutate `process.env`.

See `docs/architecture/architectural-decisions/078-dependency-injection-for-testability.md` for the full ADR.
