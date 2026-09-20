---
fitness_line_target: 140
fitness_line_limit: 200
fitness_char_limit: 12000
fitness_line_length: 100
split_strategy: 'Split specialised domains into focused pattern files if this grows.'
---

# Testing Patterns

Reusable testing recipes referenced by the
[testing strategy](../../.agent/directives/testing-strategy.md) and
[ADR-078](../architecture/architectural-decisions/078-dependency-injection-for-testability.md).

`.agent/directives/testing-strategy.md` is the authoritative doctrine.
This file is a governed recipe companion; patterns here must conform to the
directive and to the immediate-fail rules.

For worked Red/Green/Refactor examples, see
[Testing TDD Recipes](./testing-tdd-recipes.md).

---

## In-Process App Construction with Dependency Injection

Code that creates the application in-process (via `createApp()`), whether a
test or an E2E check's harness, must configure it through dependency injection with explicit runtime-config
objects or hermetic test helpers, never by reading or mutating `process.env`.
Do not import production config loaders unless the test is directly proving
the loader; they may read `.env` files as part of the production pipeline.

`request(app)` opens a loopback listener, and a socket is IO: by the owner's
2026-09-14 ruling (tests never use or create IO;
[testing-strategy.md](../../.agent/directives/testing-strategy.md) §Philosophy)
the driving line in the pattern below belongs in an E2E check, not a test, and
the suites that use it in-process are pre-invariant estate for
`no-io-test-boundary-and-di-recovery.plan.md`. The configuration discipline this
section teaches (steps 1 and 2) binds whatever drives the app. See
[Test File Classification](#test-file-classification).

### The Pattern

```typescript
import { createApp } from '../src/application.js';
import request from 'supertest';
import { createMockObservability, createMockRuntimeConfig } from './helpers/test-config.js';

// 1. Build an explicit runtime config — never read or mutate process.env
const runtimeConfig = createMockRuntimeConfig({
  dangerouslyDisableAuth: true,
  env: { OAK_API_KEY: 'test-api-key' },
});

// 2. Create the app with DI — zero global side effects
const app = await createApp({
  runtimeConfig,
  observability: createMockObservability(runtimeConfig),
});

// 3. Drive it (E2E check only: this line opens a loopback listener)
const response = await request(app).get('/healthz');
expect(response.status).toBe(200);
```

### Key Rules

- Do not read or write `process.env` in tests. Build literal runtime
  config objects or use hermetic test helpers that do not read disk.
- Do not import `loadRuntimeConfig` into these tests unless the runtime
  config loader is the direct unit under test.
- For tests needing multiple configurations (e.g. auth enabled
  vs disabled), create **separate config objects** for each case.
- Functions like `enableAuthBypass()` that mutate `process.env`
  must not exist. Use the isolated env pattern instead.

### Subprocess-Spawned Checks

Checks that spawn the application as a **separate process** (e.g.
smoke checks using `spawn('node', [entryPoint], { env })`) are
validation surfaces, never tests. They may pass
environment variables via the spawn `env` option. This is safe
because the variables are scoped to the child process and cannot
leak into the runner.

Vitest smoke suites may load ambient environment in the runner config
composition root, validate it, and pass the resulting object through
`test.provide` / `inject`. Test files and setup files must consume the
injected object; they must not read or write `process.env`.

### Reference Implementations

Templates for the configuration discipline (steps 1 and 2). Their `request(app)`
driving line is pre-invariant estate, as above:

- `apps/oak-curriculum-mcp-streamable-http/e2e-tests/auth-bypass.e2e.test.ts`
- `apps/oak-curriculum-mcp-streamable-http/e2e-tests/web-security-selective.e2e.test.ts`
- `apps/oak-curriculum-mcp-streamable-http/e2e-tests/helpers/create-stubbed-http-app.ts`

---

## Untestable Code Is a Product-Code DI Defect

When adding tests to existing green code would make them audit-shaped, check
whether the untestability is itself the defect: a test that is merely
audit-shaped is deleted or rewritten (`tdd-as-design` §Describe vs. Audit),
while a seam testable only through prohibited mechanisms, or a test that seems
to need real IO, IS the defect. In both of those shapes the product code lacks
a dependency-injection seam (ADR-078):

- **A seam testable only through prohibited mechanisms** (ambient env import,
  a module-level singleton reachable only via `vi.mock`, a non-injectable
  route). The conformant cure is a **fresh TDD cycle** against a
  not-yet-existing injectable seam — genuine RED first — NOT a retrofit and
  NOT abstention (test-expert ruling, 2026-07-01, curriculum-hub search seam:
  extract the core with the service injected + a `createHandler(fn)` factory).
  "Tests would be audit-shaped" is a signal to inspect the product code's
  injectability, never merely a reason to skip.
- **A unit or integration test that seems to need real IO** of any kind,
  a loopback listener included (see [Test File
  Classification](#test-file-classification)). The fix is to refactor the
  product to be testable (route the read/write through an injectable
  dependency, as sibling modules already do) and inject an in-memory fake —
  never to leave the IO in the test, and never to treat the refactor as
  out-of-scope ("if you need to refactor code to make it testable that is a
  good thing — that is surfacing an architectural issue and fixing it";
  owner, 2026-06-13).

## Real-Content Backstops for Transforms

For any generator, transform, extractor, or content firewall, **green
fixtures are not proof**: fixtures encode the cases you already thought
of, and the real source carries the ones you didn't. Add a backstop that
runs on the real source — a generation-time assertion or a real-content
test — and inspect the real output before calling the transform done
(worked instances 2026-06-30: fixtures passed twice while the real
generated body carried a routing coupling and a structure leak that only
grepping the real content caught). For a separation or firewall that
encodes a principle, the real-content check IS the proof.

## Test File Classification

Test classification is based on what the test actually does,
not what the author intends:

- **Module-level state = integration**: any test that touches
  module-level singletons must be `*.integration.test.ts`, even
  if it injects DI fakes for the new behaviour. A singleton that
  performs IO is a product DI defect (above): no test tier admits
  IO, so the file name cures nothing.
- **Classify by boundary, not tool** (owner, 2026-07-29): code
  imported into the test process is under the integration rule;
  a harness driving a separately running black-box system over a
  network interface is an E2E check. The same day's reading that
  `request(app)`'s loopback socket was "tool mechanics" is withdrawn
  by the 2026-09-14 ruling: a socket is IO, so `request(app)` in a
  `*.integration.test.ts` file is pre-invariant estate.
- **Middleware proofs exercise the middleware alone**: a middleware
  is a function of `(req, res, next)`; call it directly with literal
  request and response values and a captured `next`, and never boot
  the full application to prove one middleware decision (review lens
  Q3/Q4). The existing example,
  `apps/oak-curriculum-mcp-streamable-http/src/correlation/middleware.integration.test.ts`,
  mounts the middleware on a bare `express()` app and drives it with
  `request(app)`; its scoping is the lesson, its listener is
  pre-invariant estate.

## Composition Testing

Unit tests and E2E checks can all pass while the integrated
product fails. For features spanning multiple modules (MCP tool →
SDK → host), add a **composition proof** that exercises the
integration seam.

Example: `mcp-app-composition.e2e.test.ts` (an E2E check under its
pre-invariant file name) caught knip/depcruise cleanup that broke
the UI — the composition proof IS the enforcement for multi-module
integration.

## MCP Transport Layer Testing

Supertest tests JSON-RPC but not SSE transport
serialisation. For MCP servers, the transport layer IS part
of the product contract — `_meta` fields, session lifecycle,
and event streaming all happen there. Use MCP client SDK
(`Client` + `StreamableHTTPClientTransport`) for
full-fidelity E2E checks alongside supertest.

## Rendered-Output Assertions

Test a function that returns rendered or string output (a statusline
renderer, a formatter, a layout assembler) by **observable relationships
through the interface** — "the line containing X also contains Y",
relative order, presence/absence — never geometry or exact content.

- Forbid: pinned row indices (`rows[2]`), `toHaveLength` line counts,
  exact ANSI-escape literals, whole-object `.toEqual` on the parsed
  result. A harmless layout reflow or an added field must not break a
  test that proves nothing about behaviour.
- Strip ANSI before asserting visible text; prefer `toMatchObject` over
  `.toEqual` so additive fields don't break unrelated tests.
- Write helpers (line-containing-needle, relative-index, strip-ANSI) and
  assert relationships. Treat any `rows[N]` / line-count / exact-escape
  assertion on rendered output as a coupling smell to remove.

This is the rendered-output specialisation of testing-strategy's "test
behaviour through public interfaces; assert effects, not internal
constants". (Owner-corrected twice in one session, 2026-06-29.)

The same discipline covers **owner-tunable values** (a separator glyph, a
colour, a cosmetic label, a display string): a test that hard-codes one
asserts configuration, not behaviour, and breaks on every free owner
change. The cure is DI-for-testability (ADR-078): make the value a
parameter with a default, have the test **inject a probe value and assert
the probe renders** — default-independent — and keep the default as
editable config no test references. Verify by grepping the tests for the
default value: zero matches (worked instance 2026-06-15: a statusline
separator pinned literally across a suite broke on every glyph change;
the probe-injection cure ended the churn).

## Flaky-Test Disposition

Evaluate a flaky test before silencing it: is it a good test (describes a
system state per `tdd-as-design`)? A good-intent test with a fragile,
environment-coupled assertion gets its **assertion fixed to prove visible
behaviour** (e.g. strip ANSI and assert the visible text — a colour-support
split once made the same source green in a no-colour run and red in a colour
one); a genuinely bad test (proves types, mirrors implementation, tests the
mock) gets **deleted**. Never skip, retry-wrap, or loosen a flake — the
wrapper silences the signal without curing the coupling; the only
dispositions are fix-the-assertion or delete (see
[`testing-strategy`](../../.agent/directives/testing-strategy.md) §Rules).

## Acceptance Value-Proxies

Acceptance value-proxies must compare against independent ground-truth
measures. A value-proxy acceptance criterion ("the new CLI produces a
value within ±N% of the prior baseline") is **tautological** if the
new implementation and the baseline use the same method. Reproducing
the baseline value does not validate correctness; it validates only
internal consistency.

Worked example: a token-count CLI defines acceptance as "the chars/4
output agrees with the prior chars/4 baseline ±5%." The baseline is
itself chars/4. The CLI cannot fail the acceptance check by
construction — chars/4 reproducing chars/4 proves nothing.

The cure is to compare against a **method-independent ground-truth
measure**. For token-count, that is `wc -c` for total characters; the
chars/4 conversion then becomes a mechanical step verified
independently. For other domains, the ground-truth measure is the
authoritative external observation (file size from `stat`, byte count
from the filesystem, response time from a stopwatch, etc.) that the
proxy is supposed to approximate.

Acceptance criteria framed as "agrees with prior baseline ±N%" without
naming an independent ground-truth measure are tautological and fail
under normal churn (any drift looks like baseline error rather than
proxy error). Reject the framing at plan-author time, not at WS
execution.

## Testability Seams Must Not Bypass the Gate Under Test

A convenience seam added to make a guarded surface testable — a CLI
override flag, a mode env var, a directory redirect — can itself become a
bypass of the very gate or backstop the test exists to prove, or a leak
path for ambient disk state (`.env.local` via global `process.env`) into
tests. When adding a testability seam to a protective surface, review it
as product attack surface: can the seam disable the protection in
production invocations, and does the test still prove the gate fires with
the seam present? Inject configuration explicitly (DI) rather than adding
ambient overrides — see `no-global-state-in-tests`.

## Test Configuration Gotchas

- `tsconfig.json` `include` patterns `**/*.test.ts` and `**/*.spec.ts` do NOT match
  test utility files (harness, fixture builder). Add `tests/**/*.ts` to the include
  array when creating non-test utilities in test directories.
- ESLint `projectService: true` uses the nearest `tsconfig.json`, not
  `tsconfig.lint.json`. Files must be included in both for linting to work.
- Stale vitest include globs are silent because of `passWithNoTests: true` — remove
  dead globs promptly after file moves.
- `resolveEnv` suites that pass `'/tmp'` as `startDir`, to stop ambient `.env` files
  satisfying schema requirements, read the filesystem: pre-invariant estate for
  `no-io-test-boundary-and-di-recovery.plan.md`, which establishes the replacement.
- After refactoring entry points (removing `dotenv`, changing `loadRuntimeConfig`
  signature), check the E2E checks that launch the process directly — they break when
  the entry-point contract changes.
- Removing a test (e.g. deleting an audit-shaped constant assertion) can orphan the
  export it referenced — knip then blocks the commit. Un-export or delete the orphan
  in the same change.
- A spread-derived object is a new object (the codegen helper `ensurePathsOnSchema`
  is one): assert structural equality with `toStrictEqual`, never identity with `toBe`.

## Discriminating Fixtures

Pick test inputs that maximally **distinguish** the contract from its plausible
regressions — a fixture that still passes under a wrong implementation is a weak
tripwire.

- **Place a witness value _between_ events, not after them.** For an as-of / `--now`
  filter over time-ordered fixtures (e.g. events at 11:00 and 12:00), a `--now` of
  `11:30` (between) fails loud if the filter couples wrongly and drops an event; a
  `--now` after all events (e.g. `13:00`) passes green even under a broken filter.
- The general rule: choose the input that, under the most likely wrong
  implementation, produces a _different_ observable result from the correct one.

## Test Isolation

- Replace Express `_router` access with a direct call of the handler or middleware
  under test; assertions over HTTP belong to an E2E check.
- Extract repeated setup into scoped helpers inside `describe`.
- Bulk factories accept `startIndex`; do not mutate readonly `_id`.

### Related

- [ADR-078 dependency injection decision][adr-078]
- [Testing strategy directive][testing-strategy]

[adr-078]: ../architecture/architectural-decisions/078-dependency-injection-for-testability.md
[testing-strategy]: ../../.agent/directives/testing-strategy.md
