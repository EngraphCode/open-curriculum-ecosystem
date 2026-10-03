---
title: "Validation Strategy"
status: active
last_updated: 2026-09-24
fitness_line_target: 330
fitness_line_limit: 400
fitness_char_limit: 24000
fitness_line_length: 100
fitness_rationale: >-
  Sized at the 2026-09-12 merge of the TypeScript practice into this directive;
  substance is never trimmed to fit, and a later curation lane may split by seam.
split_strategy: >-
  Split at the compile-time / runtime seam: the type-flow patterns could become a
  companion reference beside typescript-gotchas.md, leaving the spine, the tiers
  and the gate-integrity doctrine here.
---

# Validation Strategy

> **Seeded stub (2026-06-23).** This file is the formal home the
> [testing-strategy.md](testing-strategy.md) doctrine restructure points to. Its
> spine — test / evaluate / assure — and its assurance tiers are ratified (owner,
> 2026-06-23); the finer internal taxonomy is **deliberately deferred** until the
> skill-evals pilot and the first MCPJam eval suite produce real experience to write
> from (resist premature crystallisation). The reasoning behind everything here lives in
> [`evals-and-assurance-position-2026-06-23.md`](../reports/evals-and-assurance-position-2026-06-23.md).

## The spine: test / evaluate / assure

- **Test** — *deterministic*. Proves code does what its spec says. Binary,
  reproducible; unit of truth is the assertion, and a test uses no IO.
  [testing-strategy.md](testing-strategy.md) defines the tests, and the E2E and
  smoke checks beside them, which are validation surfaces. Mutation testing (Stryker) is the
  meta-quality layer that makes test coverage meaningful; the claim-directed
  method is §Prove the guard bites, below.
- **Evaluate** — *probabilistic*. Measures the value and reliability of a
  judgement-laden capability across realistic inputs, graded relative to a
  baseline. Unit of truth is a graded outcome over a corpus plus a with/without
  delta. Assertions are authored *after* the first run (this inverts test-first).
  For a Practice skill the delta is read from the evidence `agent-tools skill-evals`
  retains under the skill's `evals/results/` (the runner's result per arm, every
  trace and answer, a manifest of the evaluated versions); the instrument is in
  [`agent-tools/README.md`](../../agent-tools/README.md) §`skill-evals`.
- **Assure** — the umbrella trust case: composes test + evaluate + conformance +
  UAT + observability + security review + human review into ongoing evidence that
  the capability is fit for the world.

**Describe the outcome you want; never audit the implementation choice** is the
continuity across all three — the same discipline as "test behaviour, not
implementation" in testing.

## Assurance tiers (risk-tiered, keyed on harm asymmetry)

Rigour is proportionate to the harm of getting it wrong — not uniform, and not
keyed on surface type.

| Tier | Applies to | Assurance floor |
|---|---|---|
| **Critical** | Asymmetric, hard-to-reverse harm to a user — EEF evidence surfacing, pedagogy/curriculum advice, anything that attributes or summarises evidence | Tests + mandatory evals **including a faithfulness assertion** + human review |
| **Standard** | User-facing where errors are visible and correctable — semantic search, browse, the MCP tool surface | Tests + conformance + behavioural evals |
| **Light** | Internal / agent-facing where harm is cheap and self-correcting — formatting, scaffolding, internal tooling | Tests + spot checks; evals optional |

## Gate integrity: a green check proves its own path, nothing more

A green gate is evidence about the path the gate exercised — never about the path
production runs. Worked instance (2026-07-2x): a Vitest unit test passed on a
runtime fact the real build path could not satisfy, because Vite resolves
workspace packages and a `tsx`-driven build script does not — the green unit test
"proved" a resolution the shipped artefact lacked. When a claim is about a RUNTIME
or BUILD property, the check must run on that runtime or build path (a smoke check
on the built artefact, not a unit test on the source graph). Composes with the
`green-parts-red-composition` pattern: per-path checks compose no better than
per-part ones.

### Right tool: a check uses the property's real machinery (owner ruling 2026-08-09)

A validator's subject dictates its instrument. A check about **dependencies** runs
on a dependency **resolver** — dependency-cruiser, AST-based and already in the
blocking chain (group-matched containment via `$1` back-references,
phantom-dependency `dependencyTypes`, first-class dynamic-`import()` and `require`
analysis) — never on textual pattern-matching of source. Regex import-scanning is
the wrong tool: its silent-pass classes (literal dynamic imports, unrecognised
path idioms, comment-stripping bypasses) are the instrument's shape, not bugs to
patch one spelling at a time. Prefer the instrument that exercises the property's
real path over a textual shadow of it.

The module-system policy those rules enforce (owner ruling 2026-08-09): this
estate is **strictly ESM — zero `require` statements**; the presence of a
`require` IS the finding, never a style note. **Dynamic `import()` is strongly
discouraged**: it errors by default, with any sanctioned use carried as a
recorded, per-instance exemption in the rule configuration — never a silent
allowance. Worked instance, in OCE's estate: the workspace-config-isolation
containment leg (2026-08-09), whose replacement with dependency-cruiser rules was ruled
at the owner's word; the isolation lane executes it.

**An observation is an instrument** (owner, 2026-09-14, verbatim: "sometimes
you don't need an automated check @validation-strategy.md sometimes you need
an observation"). Where the property's real machinery cannot run inside a
test (git's own merge semantics, a filesystem, a running vendor, a spawned
process), because tests never use or create IO
([testing-strategy.md](testing-strategy.md) §Philosophy), the property is
exercised once at cure time by hand and the run is recorded on the pull
request and in the records: the commands, the inputs, what was seen. An
observation is dated, first-hand and reproducible from its record; it is
never narrated as a suite's proof, and a suite is never built to replace it
with IO. Worked instance, in OCE's estate (2026-09-14): its review-cost
gate's sync predicate, proven by unit tests over injected git output plus one
recorded run of the real git on its PR #146, a scratch repository exercising
the admitted and refused merge shapes by hand.

## Prove the guard bites: claim-directed mutation checks

When a change's value IS an assertion (a test instrument, a validator, a guard),
each claim the change makes lands with a mutant that negates exactly that claim,
verified killed in the same commit. The binding statement is
[testing-strategy.md §Prove the guard bites](testing-strategy.md); the
checker-level form (a negative control in an isolated fixture, for a checker
whose failure cannot be planted in the live tree) is the pattern
`prove-the-checker-with-a-negative-control` in the patterns tier (a directive names
a pattern, never links it: doctrine cites doctrine, PDR-105);
this is the method:

1. Pick one mutant per failure mode the change claims to close — negate the claim
   itself (invert the predicate, drop the branch, skip the write), never an
   incidental line. A mutant that leaves a syntax error is killed by the parser,
   not by the claim: replace a removed statement with a no-op (`:` in shell,
   `void 0` in TypeScript) so the mutant fails on the claim itself (2026-09-25).
2. Apply it as a temporary forward file edit from a driver script that holds the
   original text (string-replace with a matched-needle assertion; restore by
   writing the original back — never via `git checkout` / `git restore`).
3. Run the narrowest suite that judges the claim; record the outcome; restore;
   re-run green.
4. Read the direction honestly. At unit level a mutant is killed when a cell
   fails. Against a live surface that is already red from a known defect, the
   direction inverts: the mutant must turn the red cell GREEN — that proves the
   new assertion (not some other break) is what catches the defect. "The cell went
   red" alone is evidence a defect surfaced, not evidence the instrument caught it.
5. The durable record is the commit body: which mutants, judged where, with what
   outcome. Driver scripts are throwaway.

A mutation score, where one is ever measured, is evidence, never a gate (owner
doctrine 2026-08-05); promotion to a gate is a separate owner decision with its
own evidence.

## Validators: the fewest processes, never a change to the code, never a build

The owner's words of 2026-09-29, verbatim: "tests are FORBIDDEN to create real IO and child
processes. I don't want excuses or carve outs, we have these rules for a reason", and
"validation scripts can start real processes, but they are to be kept to a MINIMUM, and they
are FORBIDDEN from altering the code or triggering builds".

- **Tests** use no IO and start no process, with no exception
  ([testing-strategy.md](testing-strategy.md) §Philosophy).
- **A validator** may start real processes, and starts only the fewest its property needs.
- **A validator never alters the code**: no formatter or fixer in its writing mode, no repair,
  no code generator, no install, nothing written into this repository's checkouts, worktrees or
  their `node_modules`. A scratch directory under the system temp root is not the code.
- **A validator never triggers a build**: it reads the artefact a separate step built, and
  when that artefact is absent it fails and names the step.
- What a validator cannot prove inside these bounds is proven once, by an observation made at
  cure time and recorded (§Right tool), never by a suite.
- A check whose purpose is a code-altering mode (a repair, a `--write`, a `--fix`) is neither a
  test nor a validator. Its logic is proven in process against injected fakes; the real tool's
  effect is an observation.
- A file's directory or suffix ("smoke", "e2e") never licenses a process; its class follows what
  it does.

Worked instance (2026-09-28 to 2026-09-29): a repair "smoke" ran source through a loader,
started seven processes a run, ran both repair modes, and linked the repository's
`node_modules` into a scratch repository. Three review findings on its process lifecycle were
each cured with more process handling. One run by hand reinstalled through the link and
emptied a worktree's `node_modules`.

## Validation jurisdiction: we validate our own systems

Every validator names whose system it validates, and external-system
content is never in scope — the testing doctrine's existing "NEVER test
external functionality, that is not under our control"
([testing-strategy.md](testing-strategy.md)), applied to the whole
validation estate. A check whose walk crosses territory another system
owns (an external installer's output, a vendor's artifacts) must be
scoped so that territory is invisible to it, never tolerated through an
exemption list: an exemption over foreign territory is a jurisdiction
claim wearing a tolerance, and it converts the other system's normal
output into findings. Class membership derives from the owned system's
own definition — location, recorded derivation, declared membership —
never from name patterns, which are configurable. Worked instance
(2026-08-12): the skills reconciliation sweep adjudicated every entry at
the projection roots, defining the external skills CLI's standard
install layout as a defect tolerated only via a homegrown lock
exemption; cured by recognising Practice projections through their
recorded derivation and leaving everything else untouched (ADR-125
§Skill classes and validation jurisdiction).

## Visibility precedes validation

A validator over a shape nobody has ratified promotes the accidental to the
canonical (owner correction, 2026-07-09, on an audit of agent-facing content
that had evolved organically: "a validator at this time might accidentally
lock in shapes that evolved organically and without intention or oversight").
Before proposing any validator, guard or eval gate, ask whether the surface's
shape has been ratified from first principles. If not, the sequence is: make
the shape visible and reviewable (a registry, a report), let the right people
judge it, ratify the intended shape, and only then guard it. The reflex to
guard drift the moment it is found presupposes that the current shape is
intended.

## Eval home

Evaluation **definitions are always version-controlled in-repo** with the artefact
they grade. Execution home depends on surface:

- **Skills, prompts, sub-agents** → in-repo `evals/evals.json` (agentskills.io
  convention), run in-repo, reviewed in PRs.
- **MCP-server surface** → MCPJam as the *runner* (cross-LLM, scheduled regression,
  headless widget render via `protocol` / `apps` / `eval`); its suite-definition
  JSON is version-controlled in-repo. MCPJam is execution, never the source of truth.

## The real-world loop (non-negotiable closure)

Test / evaluate / assure is an **internal-confidence triad** — every layer grades
against an expectation *we* authored. It only becomes trustworthy when closed
against a real-world signal of value. Near-term signal: **usage telemetry** via the
existing Sentry / OpenTelemetry observability foundation (tool-selection, success,
retry, abandonment as a value proxy), with eval corpora **seeded from real usage
distributions** so the loop is structural, not bolted on. Medium-term: a
**teacher-feedback** channel as the higher-value signal.

## What is not eval-shaped

Diffuse, long-horizon, cultural capability (doctrine, planning discipline,
collaboration) does not decompose into `prompt → graded output`. It takes a
different instrument (retrospective, experience corpus), not a forced
`evals/evals.json`. Forcing eval-shape onto it is the mirror category error of
treating evals as tests.
