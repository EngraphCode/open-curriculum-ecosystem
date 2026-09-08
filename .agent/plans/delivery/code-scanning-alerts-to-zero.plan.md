---
id: code-scanning-alerts-to-zero
node_type: delivery
name: "Code-scanning alerts to zero on the resting branch, and held there"
overview: "Every open code-scanning alert on the resting branch is FIXED in the tree — never dismissed, never an accepted risk — with one owner-ruled, dated exception (missing rate limiting on the MCP server's routes, grounded in the two sets of edge WAFs, dismissed once per site in each analyser's own record and explained by a comment at each route, never by a path exclusion or a rule filter), and the pull-request gate keeps the count at zero."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: reliable-atoms-programme
impact_areas:
  - practice-and-estate
  - analytics-and-observability
  - served-surface
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-08
---

# Code-scanning alerts to zero on the resting branch, and held there

## Goal

The repository's code-scanning surface reads zero open alerts on the resting branch, and
stays there: each alert is FIXED in the tree with a test that pins the cure (owner ruling 2026-09-08, verbatim: "We don't dismiss issues, we fix them."). Where an analyser is factually wrong about the code, the cure is still a tree change — a
restructure, or an analyser configuration change tracked in the tree — and no state lives in the
hosting service that the tree cannot explain. ONE owner-ruled exception, dated 2026-09-08: the
missing-rate-limiting findings on the MCP server's routes are dismissed once per site in each
analyser's own record, each dismissal explained by the comment at its route, on the ground that the two sets of edge WAFs are regarded as sufficient
for safety for now (owner word 2026-09-08, verbatim: "we are going to pause that for now, and leave comments in the code that recognise that additional in-process rate limiting would provide defence in depth, but that we regard the two sets of edge WAFs to be sufficient for safety for now. And in this ONE case we can dismiss the findings in Sonar, and preferably find a way to keep them dismissed instead of revisiting this same issue every few weeks."). A reader of
the security tab, an auditor of the release, or an agent picking up a lane sees a surface
whose every line is a fact about the code, not an unread signal.

## User groups and value

- **The owner and release readiness.** A zero surface is a release property that can be
  read at a glance; a non-zero surface with unreviewed findings cannot be told apart from a
  real vulnerability. Value: one number that means what it says.
- **Agents working the estate.** Every seat that opens the security tab today meets
  twenty-seven findings it cannot tell from the last seat's backlog; each re-reads them. Value: the
  backlog is gone and the gate keeps it gone, so the next seat reads only what its own change
  introduced.
- **Consumers of the atoms the findings sit in** — the agent-tools runtime, the logger's
  trace derivation, the server's correlation id, the schema cache and the drift check. Value:
  primitives whose security-sensitive behaviour is deliberate and tested rather than
  incidental.

## Problem

Twenty-seven alerts are open on the resting branch (the hosting service's alerts query for
that branch, read 2026-09-06) from two analysers whose findings both land in the hosting
service's code-scanning surface: nine from CodeQL and eighteen from the code-quality
analyser's security rules, uploaded alongside its own quality gate. They fall into eight
classes:

| Class | Rule | Sites | What the rule sees |
| --- | --- | --- | --- |
| Network data written to a file | `js/http-to-file-access` | 3 | a fetched document, or text derived from it, reaches a file write: two writes in the schema cache, one in the drift check |
| Executable searched on PATH | `S4036` | 9 | `spawn`/`exec` of `git`, `pnpm`, `node` and others by bare name, in the runtime, the server's bundler configuration and tooling |
| Pseudo-random number generator | `S2245` | 3 | `Math.random` in a correlation id, a retry backoff, a chunking helper |
| Weak hash | `S4790` | 1 | MD5 deriving a trace id from a correlation id |
| Clear-text protocol literal | `S5332` | 4 | `http://` literals in test configuration and helpers |
| Polynomial regular expression | `js/polynomial-redos` | 2 | a lazy match inside a bracketed quantifier over untrusted HTML, and the report generator's keyword pattern matched over fetched definitions |
| Missing rate limiting | `js/missing-rate-limiting` | 4 | route handlers on the MCP server (two in the authorisation routes, one in the proxy's routes, one registered by the bootstrap helpers) with no in-process limiter, by decision: ADR-219 places the control at the edge |
| Unsafe code construction | `js/bad-code-sanitization` | 1 | the type generator inlines serialised values into generated source through a JSON serialiser |

The two analysers are independent instruments over the same tree; both keep reporting on
every pull request, so the surface only reads zero if the resting branch is cleared and the
gate refuses new findings.

## Mechanism

One disposition per class: a finding is FIXED in the tree — code, or an analyser
configuration change tracked in the tree where the analyser is factually wrong about the code
— with the cure pinned by a test where a test can hold it. Nothing is excluded by path in the
general case, no rule is narrowed, and no accepted-risk state exists; the one owner-ruled
exception (missing rate limiting, below) is a per-site dismissal in each analyser's own record,
with its grounds recorded here and in a comment at each site — never a path exclusion or a rule
filter, which would silence the rule on files and routes the exception does not name.

- **Network data written to a file.** The drift check writes a status description derived
  from the upstream document to the workflow's output file; the schema cache writes the
  validated document itself. The drift check's cure makes the written bytes independent of
  upstream text: the description becomes a closed enumeration plus counts computed from the
  validated parse. The schema cache already writes the structural validator's re-serialised
  output (`packages/sdks/oak-sdk-codegen/code-generation/schema-cache.ts`, whose comment
  names these alerts), and its alert stands because validation returns the fetched document,
  so the analyser's taint path runs through the validator to the write; no rewrite of that
  write which keeps the cache's contract can end the path. Its cure is the analyser's
  documented barrier model (its JavaScript library-model guide, read 2026-09-06): a tracked
  data extension naming the validator's return value as a barrier for this rule's taint
  kind, with the rationale at the site (a constant path, and the written value is the
  validated document, which is the cache's contract). The alert closes on the next analysis
  of the resting branch or the model is wrong; if the rule's own configuration consults no
  barrier kind, the unit records that finding on this node rather than dismissing the alert
  in the hosting service.
- **Executable searched on PATH.** Fix-only under the policy, tooling included: every site
  resolves its executable to an absolute path without consulting PATH, and each binary
  resolves by its own existing mechanism — `git` through the trusted-git atom (the fixed
  allowlist of well-known directories that atom already carries), `pnpm` through the
  existing `agent-tools/src/spawn/pnpm-path.ts` resolver, `gitleaks` through the existing
  `agent-tools/src/refounding/refound-gitleaks.ts` resolver (a standalone binary — CI
  installs it pinned to `/usr/local/bin` with no `pnpm install`, and no workspace carries a
  `node_modules/.bin/gitleaks`), and the node-run tools `typedoc` and `tsx` through the
  owning workspace's `node_modules/.bin` absolute path or `process.execPath` with the
  script. The trusted-git allowlist is never extended to per-user installs to cover the
  other binaries. Each resolver is unit-tested for the refusal of an unresolved name.
- **Pseudo-random number generator.** The correlation id takes its random part from the
  platform's cryptographic generator; the backoff jitter and the chunking helper take a
  cryptographic integer where the analyser requires it, since the cost is nil and the cure
  is smaller than the argument.
- **Weak hash.** The trace-id derivation states its purpose — a stable sixteen-byte
  identifier, not a secret — and moves to a current hash truncated to the identifier's width,
  with a test that pins the width and the stability of the mapping.
- **Clear-text protocol literal.** Fixtures that never dial their host take an `https`
  literal, a fix. A localhost loopback in a test helper or test-runner configuration is a
  code cure per site: the literal leaves the source — configuration, or a helper shape the
  analyser accepts — recorded per site (the earlier SAFE disposition is withdrawn under the
  2026-09-08 ruling).
- **Polynomial regular expression.** The script body is located by an index scan for the
  opening tag and the closing tag, or by a linear-time expression, with a test over a long
  pathological input; the report generator's keyword pattern is rewritten linear-time with
  the same test shape.
- **Missing rate limiting — the one owner-ruled exception (2026-09-08).** ADR-219 (2026-07-30)
  stands unchanged: rate limiting is at the edge and an in-process limiter is not built. The
  owner paused the class on 2026-09-08 (the verbatim word is in the Goal): a code comment at each
  of the four routes states that in-process limiting would add defence in depth and that the
  two sets of edge WAFs are regarded as sufficient for safety for now, citing ADR-219 and naming
  the two WAFs from the deployment facts; the four findings are dismissed once per site in each
  analyser's own record — the code-quality analyser's per-issue status (its automatic analysis
  reads no file-based rule ignore: the disposition policy §File-Based Configuration) and the
  code-scanning per-alert dismissal citing ADR-219 (the ADR's own shape) — each act citing the
  route's comment, so the tree explains every dismissed state and each persists per site
  without repetition. Never a path exclusion or a query filter: both silence the rule on files
  and routes the exception does not name, and the ADR requires the rule to re-fire on a
  genuinely new route, which then takes a fix or the same comment-and-dismissal pair. The ADR's
  falsifier stands: the edge configuration is load-bearing, and if it weakens the exception is
  wrong and the class returns to a fix.
- **Unsafe code construction.** The type generator emits its inlined values through a
  code-safe serialiser that escapes the line-separator characters a JSON serialiser leaves
  raw, with a test over a value carrying them; the generated output is byte-identical for
  every value the generator inlines today.
- **The gate.** The pull-request workflow already runs both analysers as required checks;
  this node adds the proof that a new alert of any of the eight classes blocks a merge, and
  the reading command that shows the resting branch at zero.

Why this produces the outcome: each class is cured at its root (the atom, the fixture, the
regex) rather than at its symptom, so the same site cannot re-trip a sibling rule; each
configured answer is a tracked change with its rationale, so a reviewer can refute it; and
the gate turns "zero" from a snapshot into an invariant.

## Acceptance criteria (each with a proof — required)

1. The resting branch's open code-scanning alert list is empty for both analysers. Proof:
   `owner-held` — the hosting service's alerts query for the resting branch is that service's
   own record; the landing seat reads it at closing and records the reading, dated, on the
   lane's closing event as an observation, never as a corpus fact.
2. Every cured site has a test that fails on the previous behaviour: the refusal of a
   non-absolute executable, the cryptographic source of the random part, the trace-id width
   and stability, the linear-time extraction over a pathological input, the output description's closed vocabulary, the generator's escaping of a line separator. Proof: `repo-safe` — the tests, named in each unit.
3. No alert on the resting branch carries a dismissed, accepted-risk or won't-fix state except the four missing-rate-limiting findings, whose dismissal is explained by the code comment at each route citing ADR-219 and the two edge WAFs. Proof: `repo-safe` for the four comments; `owner-held` for the dismissed state itself — the alerts query's dismissal-reason field for exactly those four, read at closing and recorded as a dated observation.
4. A pull request introducing one new instance of each class is blocked by a required check.
   Proof: `repo-safe` — one probe pull request per analyser, closed unmerged, cited by number
   on the lane's closing event.

## Out of scope

- Snoozing, marking "won't fix" or dismissing in the hosting service or the analyser's own console: no state lives there that the tree cannot explain; the one dismissal this node takes (missing rate limiting) is owner-ruled, dated, made once per site in each analyser's own record, and explained by the comment at each route.
- The code-quality analyser's non-security quality backlog (its own quality profile), which
  has its own tracking thread and plan lineage; this node touches only findings that reach
  the code-scanning surface.
- Rewriting the drift check's or the schema cache's purpose; both keep their contracts.
- Raising or lowering the analysers' rule sets, or excluding any path from them; this node
  clears what they report today.

## Todos

Eight PR-shaped units, each a single story inside the small-PR bands and its round budget,
independent unless stated:

1. **Random and hash primitives.** The correlation id, the backoff jitter, the chunking
   helper and the trace-id derivation, with their tests: about eight files, no
   configuration.
2. **The regular expressions.** The script-body extraction and the report generator's
   keyword pattern rewritten linear-time, each with its pathological-input test: four files.
3. **Network data written to a file.** The drift check's closed-vocabulary description with
   its test, and the schema cache's tracked barrier model with its site rationale; the
   cache's validated write already exists and does not change. The drift check takes the
   same model only if the closed vocabulary leaves its alert standing, with its reason:
   about five files.
4. **Executables on PATH — the runtime and server sites.** Each binary resolves by its own
   existing mechanism, never by a system-directory allowlist extended to per-user installs:
   `git` through the trusted-git atom; `pnpm` through the existing
   `agent-tools/src/spawn/pnpm-path.ts` resolver; node-run tools through the workspace's
   `node_modules/.bin` absolute path, or `process.execPath` with the script. The refusal
   test covers each resolver's unresolved case; adopted at the runtime sites: about six
   files.
5. **Executables on PATH — the tooling sites, and clear-text literals.** The remaining
   spawn sites take the same per-binary resolution (fix-only, no exception for tooling:
   `gitleaks` through its existing standalone resolver `refound-gitleaks.ts`, the CI-pinned
   binary having no `node_modules/.bin` entry; `typedoc` and `tsx` through the owning
   workspace's `node_modules/.bin` or `process.execPath`);
   fixture literals switch to `https` where the host is never dialled; the localhost helper
   sites take a code cure each — the literal leaves the source, as configuration or a helper
   shape the analyser accepts — recorded per site: about seven files.
6. **Rate limiting: the owner-ruled pause.** A code comment at each of the four routes (defence in depth acknowledged; the two edge WAFs regarded as sufficient for now; ADR-219 cited; the two WAFs named from the deployment facts), then one dismissal per site in each analyser's own record — the code-quality analyser's per-issue status and the code-scanning per-alert dismissal citing ADR-219 — each citing the route's comment; no configuration-file change (a path exclusion or query filter would silence the rule beyond the four sites). The acts are the owner's, or the bot's under a scope that permits them, once per site. ADR-219 is not amended. About four files.
7. **The generator's code-safe serialiser.** The inlined values escaped, with the
   line-separator test: two files.
8. **The gate proof.** The two probe pull requests and the reading command, recorded on the
   lane's closing event, plus one tree change this unit always makes: the ADR-121 amendment
   recording the repository's trust model (a collaborator with push rights already holds
   every permission a `pull_request` workflow can declare, so a compute/publish job split is
   not a security boundary against a same-repository collaborator — the dispositions row of
   2026-09-06 carries it until then). A required check found missing is a second change in
   the same unit.

## First-principles check

The six clauses of the plan-body first-principles check, applied at authoring:

- **Shape.** The tests prove behaviour the estate owns — a refusal, a source of randomness,
  a width, a linear bound, a closed vocabulary — never that an analyser's rule fires.
- **Landing path.** Tests take the estate's existing tier names so the existing runners
  include them; configuration changes live in the analysers' tracked configuration files; the
  one service-side state this node takes (the four per-site dismissals) is explained by a
  comment at each site.
- **Vendor literal.** No rule id or analyser name in this body is a mechanism; each names a
  finding class to disposition. The capability locus for the gate is the hosting service's
  required-check setting, already in force, so the gate unit proves rather than builds.
- **Optionality surface.** No open choice is left to the implementer beyond the one class
  test the Mechanism states; each unit names its cure shape and its fallback.
- **Record consumer.** The lane's closing event is the only accounting surface added, and
  the alerts query is its consumer.
- **Rules tier.** The node presupposes only standing doctrine — the Sonar disposition policy as amended 2026-09-08 (every finding is fixed in the tree; the one owner-ruled exception named there); ADR-219 for the rate-limiting class; checks are never disabled; validation is strict at the
  boundary; no escape hatches in enforcement — and adds none.

## Review dispositions

One row per finding; "applied" means folded into this node before ratification.

| Date | Source | Finding | Disposition |
| --- | --- | --- | --- |
| 2026-09-06 | PR #56 round one (Codex) | The executable-on-PATH arm proposed a tooling exception and an accepted-risk state that the Sonar disposition policy excludes. | Applied: the mechanism follows the policy's two-outcome rule — fix-only for that class through the trusted-git shape, site-rationalised SAFE only where the policy's class criteria hold, no path exclusions. |
| 2026-09-06 | PR #56 round two (Codex) | Unit 3's cache arm proposed the validated write that `schema-cache.ts` already performs, so the arm could not clear the alert. | Applied: the mechanism and unit 3 state the fact and take the analyser's documented barrier model, with the no-model outcome recorded on the node rather than a dismissal. |
| 2026-09-06 | PR #56 round three (Codex) | The census summed to nineteen sites against twenty alerts. | Applied: the census re-read from the hosting service's alerts query for the resting branch — twenty-seven alerts in eight classes; two classes and three sites were missing, and the table, mechanism, criteria and units now carry them. |
| 2026-09-06 | PR #56 round four (Codex) | The rate-limiting cure prescribed middleware that accepted ADR-219 forbids; the ADR already dispositions the class. | Applied: the class takes the ADR's per-alert false-positive dismissal citing the ADR; the node's dismissal clauses (goal, out of scope, criterion 3) re-trued to permit exactly that shape and nothing else. |
| 2026-09-06 | PR #56 round five (Codex) | Units 5 and 6 carry owner UI acts (the Sonar SAFE dispositions; the four CodeQL dismissals) with no owner gate declared on the node. | Applied at the consolidation fold: `owner_gates` declares the two gates as facts with absolute expiries; the status field is untouched (ratification is the owner's act). |
| 2026-09-06 | PR #56 round five (Codex) | Units 4–5 named "the atom" without saying how each binary resolves, leaving a system-directory allowlist extended to per-user installs as a reading. | Applied at the consolidation fold: units 4–5 state the resolution per binary — `git` via the trusted-git atom, `pnpm` via `pnpm-path.ts`, `gitleaks` via `refound-gitleaks.ts`, `typedoc` and `tsx` via `node_modules/.bin` or `process.execPath` — and exclude the allowlist reading. |
| 2026-09-06 | PR #59 round one (Codex, Copilot) | The per-binary wording in units 4–5 contradicted the Mechanism bullet, which still prescribed one fixed allowlist for every binary. | Applied: the Mechanism bullet carries the same per-binary resolution; one design. |
| 2026-09-06 | PR #59 round two (Codex) | `gitleaks` was filed under `node_modules/.bin`, which no workspace provides; CI installs a pinned standalone binary and `refound-gitleaks.ts` already resolves it. | Applied: `gitleaks` resolves through that existing resolver at the Mechanism bullet, unit 5 and the row above; `typedoc` and `tsx` keep the workspace bin or `process.execPath` path. |
| 2026-09-06 | consolidation sweep (a review finding on PR #39, comms event ba2a02c1) | A collaborator with push rights already holds every permission a `pull_request` workflow can declare, so splitting a workflow into compute and publish jobs is not a security boundary against a same-repository collaborator; it is the repository's trust model. | Carried: unit 8 (the gate proof) authors this as an ADR-121 amendment inside its PR; until then any "split the job for security" proposal is checked against the fact here. |
| 2026-09-08 | Owner ruling (cards at the Director seat) | "We don't dismiss issues, we fix them": the node's non-fix outcomes (SAFE for the localhost literals; false-positive dismissals for the ADR-219 class) are withdrawn; then the owner paused the rate-limiting class with code comments and a dismissal kept per site. | Applied: the overview, goal, mechanism, criterion 3, out of scope, units 5 and 6 and the rules tier re-trued; both owner gates removed as discharged by the word; ADR-219 stands. |
| 2026-09-08 | PR #95 round one (Copilot, Codex) | The pause mechanism named a Sonar issue-ignore block and a CodeQL query filter or path exclusion: automatic analysis reads no file-based rule ignore, and both CodeQL shapes silence the rule beyond the four sites, against ADR-219; criteria 1 and 3 filed the hosting service's alert state as `repo-safe` against the boundary-of-certainty amendment. | Applied: the dismissal is once per site in each analyser's own record, explained by the route comments, never a path exclusion or query filter; criteria 1 and 3 split into `repo-safe` (the comments) and `owner-held` (the service's alert state, read as a dated observation). |

Round five's two findings were dispositioned on PR #56's replies under the PDR-140 step-back and
named only on the lane-closed comms event of 2026-09-06 until the consolidation fold the same day
mirrored them here.
