---
id: quality-analyser-security-reliability-to-zero
node_type: delivery
name: "Code-quality analyser security and reliability findings to zero, and held there by the lint gate"
overview: "Every open BLOCKER, HIGH or MEDIUM security or reliability issue the code-quality analyser reports on the resting branch is FIXED in the tree, the six analyser rules with a lint twin are locked at error so the class cannot regrow, and the adjacent defects the triage found (one shared fence model, author-bound signed replies, a validated correlation header, a scroll region that is a tab stop only when it scrolls) are cured in the same lane."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: maintenance
impact_areas:
  - practice-and-estate
  - analytics-and-observability
  - auth-and-access
  - served-surface
  - design-system
tickets: []
depends_on:
  - plan: code-quality-binding-per-checkout
    kind: beneficial
owner_gates: []
last_updated: 2026-10-27
---

# Code-quality analyser security and reliability findings to zero, and held there by the lint gate

## Goal

The code-quality analyser's issue list for this checkout's project on the resting branch, filtered
to BLOCKER, HIGH and MEDIUM impact on the SECURITY and RELIABILITY qualities with status OPEN or
CONFIRMED, reads zero. It stays there because the commit-time lint gate refuses the six rules behind
33 of the 34 findings; the 34th rule (S6845) has no lint twin in the estate and is held by the
specimen's keyboard tests and the analyser's own pull-request analysis. Every finding is FIXED in
the tree (owner ruling 2026-09-08, verbatim: "We don't dismiss issues, we fix them."). The defects
the triage found beside the findings are cured in the same lane, not parked: ten disagreeing
code-fence detectors become one model, a signed self-reply is bound to its author, and the server
stops accepting an unbounded correlation header.

## User groups and value

- **The owner and release readiness.** One analyser view that means what it says: zero, held by a
  gate, so a new finding is a fact about a new change.
- **Agents working the estate.** The backlog regrows today: super-linear-regex findings were
  created on 2026-09-12, 09-29, 10-03 and 10-05. With the twins at error a seat meets the defect at
  its own commit, in its own diff, instead of inheriting it months later.
- **Seats driving pull requests.** The review-cost gate runs on every push and parses review bodies;
  after unit 1 no review body can slow a push by seconds, and after unit 13 no outsider can forge a
  seat's signed disposition.
- **Consumers of the MCP server's logs and traces.** Correlation ids and trace ids come from a
  cryptographic source and a current hash, and a client cannot inject an arbitrary-length id into
  logs and error reports.
- **Keyboard users of the design showcase.** The specimen's data table is a tab stop exactly when
  it scrolls, with the design system's focus ring.

## Problem

Thirty-four issues are open in the filter (the analyser's issue query for the resting branch,
2026-10-27; its last analysis is the commit `493951ad7`). The analyser holds one weak-hash finding
in any status and zero security hotspots in any status: this project reports hotspot-class rules
as issues. Every site was read first-hand, and every flagged regex was timed on adversarial input,
doubling its size three times: all are super-linear, `pr-tally/dispositions.ts:40` roughly cubic
(x6.8 per doubling).

| Rule | Count | Sites | Exposure |
| --- | --- | --- | --- |
| S8786 super-linear regex | 25 | agent-tools validators and PR tools (16), sdk-codegen generator (7), search-cli (1), a smoke test (1) | Three read third-party text. Two run live on every push through the review-cost gate (`.husky/pre-push`, no timeout): `pr-watch/skip-markers.ts:20` over every review body from any author (about 8 s per 64 KiB body) and `pr-tally/findings.ts:35` over the Codex connector's bodies. `pr-tally/dispositions.ts:40` is latent until pr-tally's command lands. The rest read repo files, upstream-controlled data or the tool's own output. |
| S2245 pseudo-random | 3 | `correlation/index.ts:37` (MCP server), `sitemap-scanner.ts:125`, `bulk-chunk-utils.ts:183` | No security use: a correlation id and two retry jitters. |
| S4790 weak hash | 1 | `logger/src/otel-format.ts:83` | MD5 derives a fallback 32-hex trace id from a correlation id; no security use (the owner's reading, confirmed first-hand). |
| S7737 object-literal default | 2 | `process-runner.ts:20`, `mcp-auth-clerk.ts:65` | Clarity. |
| S2310 loop counter reassigned | 1 | `field-readback-audit-cli.ts:140` | Clarity. |
| S3923 identical branches | 1 | `logger/src/node.ts:52` | The adapter silently ignores its `encoding` argument. |
| S6845 tabIndex on non-interactive | 1 | `oak-design-showcase/app/identity-switchboard/specimen/resources.tsx:64` | Deliberate: the table's scroll region is focusable for WCAG 2.1.1 (commit `fd27de13a`), and a tab stop at widths where nothing scrolls. |

Six of the seven rules have a lint twin in the `eslint-plugin-sonarjs` 4.2.0 and
`eslint-plugin-unicorn` 73 the shared config already registers (`cjs/plugin-rules.js`:
`sonarjs/super-linear-regex`, `pseudo-random`, `hashing`, `updated-loop-counter`,
`no-all-duplicated-branches`; S7737 is `unicorn/no-object-as-default-parameter`); none needs type
information. The shared config enables four sonarjs rules today (`recommended.ts:70-73`). S6845 has
no twin: `eslint-plugin-jsx-a11y` is not in the estate. An in-memory run of the six twins over the
4,650 tracked TypeScript files (2026-10-27) found every analyser site plus 18 the analyser does not
analyse: 15 more super-linear regexes (8 in test files, 7 in three skill eval scripts), 2
object-literal defaults and 1 identical-branch conditional in test files. The lock therefore cures
51 twin sites, and S6845 is the 52nd.

Adjacent defects the triage found, each cured here:

- Ten code-fence detectors in agent-tools disagree. Three track the CommonMark closer rule
  (`validators/core-host-names/markdown-headings.ts`, `validators/plan-schema/yaml-fence-blocks.ts`,
  `subagent-declarations/system-prompt-block.ts`); seven toggle on any fence-like line
  (`validators/cited-paths/extract-path-citations.ts`, `validators/cited-scripts/extract-script-citations.ts`,
  `validators/markdown-links/validate-markdown-links-helpers.ts:72`,
  `practice-fitness/markdown.ts`, `practice-fitness/item-count.ts`'s strip regex,
  `refounding/refound-inventory-nets.ts` (backticks only), `hook-policy/matchers.ts:73` (backticks
  only)). The validators and the Bash guard therefore disagree about what is inside a fence.
- `isSignedSelfReply` (`pr-watch/reviewer-legs.ts:107`) reads only the body's last line, so any
  commenter can sign as a seat, and pr-tally would read such a comment as the seat's disposition.
  The pr-lifecycle skill already requires self-AUTHORED signed replies; the check falls short of it.
- The correlation middleware (`correlation/middleware.ts:111`) accepts any non-empty
  `X-Correlation-ID` into logs, error-report tags and the response header.
- The `mcp-router.ts` TSDoc examples call `createMcpAuthClerk(logger)`, a signature that no longer
  exists (`allowedHosts` is required).
- The shared lint config's activation comment points at a plan directory that no longer exists.

## Mechanism

One outcome per site, FIXED in the tree. Each cure is pinned by a test that passes before and after
it (characterisation first, per `tdd-for-refactoring`), except the named behaviour changes below,
each pinned by a test that is red before its cure. The class is then held by the lint twins at
error.

- **Super-linear regexes.** Each site takes the linear form named in its unit: a negated class that
  excludes the opener (`“[^“”\n]*”`, `\[[^\][]*\]`, `\(([^()]+)\)`), `[ \t]` in place of `\s` where a
  multiline pattern must not cross lines, an anchored or lookbehind-started run, or a string
  operation (split on a separator, `lastIndexOf`, a trailing-character trim). If a named regex form
  still trips its twin, that site takes the string-operation form; there is no third choice.
- **Pseudo-random.** `node:crypto`: `randomBytes(3).toString('hex')` keeps the correlation id's
  6-hex part; `randomInt` gives both jitters the ranges they have now.
- **Weak hash.** The trace id becomes the first 32 hex characters of SHA-256 over the correlation id
  (the disposition policy's S4790 cure).
- **Clarity cures.** Destructured parameter defaults over an empty-object default
  (`{ stdout = process.stdout, stderr = process.stderr }: Partial<…> = {}`), a `while` loop with an
  explicit cursor, the dead conditional removed.
- **Generator first.** The sdk-codegen regexes are fixed in the generator, and regenerating from
  the tracked cached schema produces byte-identical tracked output.
- **One fence model.** A string-operation CommonMark fence-line model in agent-tools, adopted by all
  ten detectors; the seven toggling detectors change behaviour only for nested, longer or tilde
  fences, measured over the whole tracked corpus.
- **Author-bound signatures.** A self-reply is signed AND authored by a self login. The self set is
  the run's authenticated GitHub login, read through pr-watch's existing `gh` runner (`gh api user`)
  as a `Result` that refuses the run when it cannot be read (never an empty set), plus the merge
  bot's app slug when the per-checkout merge-bot config resolves (`merge-bot/resolve-identity.ts`).
  GraphQL harvests record a bot without its `[bot]` suffix (the recorded corpus carries the merge
  bot's login that way), so a new `selfLoginKey` in `pr-watch/logins.ts` strips a trailing `[bot]` and
  lowercases both sides; `normaliseLogin` is unchanged. Harvested comments already carry author
  logins (`pr-tally/harvest.ts:165,223`), so no recorded corpus changes.
- **Validated correlation header.** An incoming id is accepted only if it matches
  `^[\w.:-]{1,128}$`; anything else gets a freshly generated id.
- **A scroll region that is a tab stop only when it scrolls.** The specimen table's region takes its
  `tabIndex` from observed overflow rather than a constant: WCAG 2.1.1 holds at narrow widths, and
  the tab stop goes where nothing scrolls.
- **The lock.** The six twins go to `error` in `packages/core/oak-eslint/src/configs/recommended.ts`
  in the unit that lands after every cure, with one pathogen fixture per rule, so the commit hook
  (changed workspaces) and `pnpm check` (all workspaces) refuse the class from then on.

Named behaviour changes (each red-first): nested curly quotes mark only the inner span (unit 1); an
invalid incoming correlation header is replaced, and trace-id values change (unit 2); the
parenthetical synonym capture is the innermost span (unit 5); inline-link alt text cannot contain
`[` (unit 7); nested, longer and tilde fences (units 9a, 9b); signed replies from a non-self author
(units 13a, 13b); no tab stop where nothing scrolls (unit 14).

Why this produces the outcome: each finding is cured at its root (the generator, the shared model,
the parser), so a sibling rule cannot re-trip the site; the twins turn "zero" into an invariant at
commit time rather than a reading after merge; and the adjacent defects share files with the cures,
so curing them in the same lane costs no extra context.

Warrants and their falsifiers:

- *The twins have parity with the analyser.* Warrant: one in-memory run in which every analyser site
  was among the twins' hits (one observation, against the analyser's own list). Falsifier: a finding
  of one of the six rules appears on the resting branch, in a linted workspace, after unit 12 has
  merged; the parity claim is then wrong for that shape, and the site is cured and the shape recorded
  in the disposition policy.
- *The toggling fence detectors are wrong only on nested, longer or tilde fences.* Warrant: their
  patterns, read. Falsifier: a corpus diff in unit 9a or 9b shows a difference of any other kind;
  that unit then stops and the difference is explained before it lands.
- *No consumer depends on the trace id's MD5 value.* Warrant: the derived trace id is a fallback,
  used per log record only when no active span exists, from a per-request correlation id
  (`otel-format.ts:111-126`). Falsifier: a test or a stored fixture pins an MD5-derived trace id; it
  is then re-derived in unit 2, not kept.

## Acceptance criteria (each with a proof — required)

1. The analyser's issue list for this checkout's project on the resting branch, in the goal's
   filter, is empty. Proof: `owner-held` — the analyser is the record of its own state; the closing
   seat reads it after the last unit's merge has been analysed and records the dated reading on the
   lane's closing comms event.
2. The six twins are at `error` in the shared config, each with a pathogen fixture that surfaces its
   error, and the aggregate gate is green with them on. Proof: `repo-safe` — the new
   `packages/core/oak-eslint/src/configs/recommended.unit.test.ts` and `pnpm check` on unit 12's
   pull request.
3. No file a workspace lints breaks a twin, and the skill eval scripts' formerly flagged patterns
   live in the showcase's linted tools module. Proof: `repo-safe` — the lint gate on unit 12; unit
   11's diff and the tools module's unit tests.
4. Every cured site's behaviour is pinned by a test that passes before and after its cure, except
   the named behaviour changes, each pinned by a test that is red before its cure; the pr-tally
   recorded-corpus suites are unchanged; the regenerated SDK output is byte-identical. Proof:
   `repo-safe` — the tests named in each unit; `git diff --exit-code` over
   `packages/sdks/oak-sdk-codegen/src/types/generated` after `pnpm sdk-codegen`, in unit 5's body.
5. The skip-marker, disposition-line and Codex-item parsers each classify an adversarial body
   within an explicit 1,000 ms per-test timeout; each input is sized so the current regex takes at
   least ten times that on the authoring host (measured, and recorded in the test's TSDoc), so each
   test is red before its cure. Proof: `repo-safe` — unit 1's tests.
6. The correlation id carries a 6-hex cryptographic part; an invalid or oversize incoming header
   yields a fresh id; the trace id is 32 hex, stable for one input, and equal to a pinned SHA-256
   vector. Proof: `repo-safe` — unit 2's tests.
7. All ten fence detectors use the one model; each of the seven changed detectors has a test with a
   four-backtick fence containing a three-backtick line; each detector's output over the tracked
   corpus before and after is identical apart from differences listed and explained in units 9a and
   9b's bodies. Proof: `repo-safe`.
8. A signed body from a non-self login is not a self-reply in pr-watch or pr-tally, and from a self
   login (with or without a `[bot]` suffix, in any case) it is; an unreadable authenticated login
   refuses the run. Proof: `repo-safe` — units 13a and 13b's tests.
9. The specimen's lesson-breakdown region is a tab stop exactly while its table overflows (present
   at 320px, absent at 1280px), keyboard scrolling works at 320px, and the specimen's accessibility
   matrix and 320px reflow cells stay green. Proof: `repo-safe` —
   `pnpm --filter @oaknational/oak-design-showcase test:a11y` with unit 14's three tests.
10. `code-scanning-alerts-to-zero` no longer carries the pseudo-random and weak-hash sites in any
    section, and `pr-tally`'s ledger names units 1, 13a and 13b. Proof: `repo-safe` — both nodes'
    text after unit 0.

## Todos

Seventeen single-story pull requests, each inside the small-PR bands (about five files, ten at most)
and the default round budget of two (PDR-132); each opens with the round tally declared in a
working-notes comment. Each unit cuts its own worktree from the default branch and re-derives its
premises at pickup: the coordination branch carries review-cost changes not yet on the default
branch, so units 1, 13a and 13b re-read the push path first.

0. **Records.** Land this node and the `maintenance` strategic node it serves (both born sketch;
   the owner's ratifying word quoted on this pull request and stamped). In
   `code-scanning-alerts-to-zero`, re-point `serves` from the retired Reliable Atoms node to
   `maintenance`, and move the pseudo-random and weak-hash sites here in every section that carries
   them: its user groups, the S2245 and S4790 rows of its problem table, its mechanism bullets, its
   criterion 2 and its unit 1, with a dated review-dispositions row. In `pr-tally`'s review
   dispositions, a row naming unit 1 (its two body parsers) and units 13a and 13b (the signature's
   missing author check), to land before pr-tally's command. Four files.
1. **Parsers of third-party review text.** `pr-watch/skip-markers.ts:20` → `“[^“”\n]*”` in the curly
   branch; `pr-tally/dispositions.ts:40` → a field-wise parse that checks the bullet and bold label,
   splits the rest on the `·` separator, and reads the head SHA, the review id, the anchor (path and
   line split at `lastIndexOf(':')`) and the text; `pr-tally/findings.ts:35` → a string parse (badge
   prefix, first `</sub></sub>`, trailing `**`). Tests per criterion 5; the recorded-corpus suites
   unchanged. About six files. First after unit 0: the live exposure.
2. **Request correlation and trace identity.** `correlation/index.ts` (`randomBytes(3)`),
   `correlation/middleware.ts` (the header grammar), `logger/src/otel-format.ts` (SHA-256, the first
   32 hex). Tests per criterion 6. Six files.
3. **Retry jitter from the cryptographic source.** `sitemap-scanner.ts:125`
   (`baseDelay * 2 ** attempt + randomInt(baseDelay)`), `bulk-chunk-utils.ts:183`
   (`randomInt(Math.max(1, Math.floor(exponentialDelay)))`, the same range). The existing bound
   tests hold. Four files.
4. **Clarity cures.** `logger/src/node.ts:52` (the ternary removed; the adapter writes UTF-8, said in
   its TSDoc); `field-readback-audit-cli.ts:140` (`while` with an explicit cursor);
   `process-runner.ts:20` and `mcp-auth-clerk.ts:65` (destructured defaults); the two test-file
   object defaults (`pr-watch/content-reader.integration.test.ts:26`,
   `practice-fitness/decision-debt-report.unit.test.ts:9`); the identical-branch helper in
   `document-transform-helpers.unit.test.ts:132` (collapses to `(year) => [String(year)]`); the
   `mcp-router.ts` TSDoc examples given `allowedHosts`. Eight files.
5. **The SDK generator's regexes.** `codegen-core.ts:183–187` (`[ \t]` for `\s` at the line-start and
   line-end positions under the `m` flag), `verify-docs.ts:55` (`\[[^\][]+\]\(\.\/([^()]+)\)`),
   `analysis-report-generator.ts:123` (`\(([^()]+)\)`). A characterisation test for
   `postProcessTypesSource` over every JSDoc shape it rewrites, written first and green on the
   current code; a red-first unit test pinning the innermost-parenthetical capture; regeneration
   byte-identical (criterion 4). About five files.
6. **Trailing-run trims and slugs.** A string-operation `trimEndWhile(text, predicate)` in
   `agent-tools/src/core/` with its unit test, used by `extract-path-citations.ts:53` and `:116`,
   `mcp-content-workspace/render-workspace.ts:28` and `practice-fitness/item-count.ts:123`;
   `core/agent-identity/derive.ts:197` and search-cli `reference-document-builders.ts:178` take
   `/^-|-$/g` (the collapse before each leaves runs of one). About eight files.
7. **Link, flag, field and alt-text parsers.** A shared `stripLinkTitle(target)` (the title is the
   last whitespace-preceded quoted span, found from the end) used by
   `validate-markdown-links-helpers.ts:141` and `validate-reference-direction-helpers.ts:139`;
   `shell-command-citations.ts:23` → `/^-[A-Za-bd-z]*c[A-Za-z]*$/`; the provenance repo line
   (`validate-no-host-names-in-core-headings-helpers.ts:53`) → `^\s*(?:-\s*)?repo:`;
   `practice-fitness/markdown.ts:108` → `[^\][]*` in the alt text. About seven files.
8. **One fence model, part one.** `agent-tools/src/core/markdown/fence-line.ts` (string operations:
   up to three spaces of indent, a run of three or more backticks or tildes, the info string; a
   closer is the same character, at least as long, with nothing after) with its unit test, adopted
   by the three CommonMark detectors; `markdown-headings.ts` also takes the ATX form
   `^ {0,3}(#{1,6})[ \t]+([^ \t].*)?$`. No behaviour change. About seven files.
9. **One fence model, parts two and three** (after units 6, 7 and 8, which share their files):
   - **9a. Citation and link validators.** `extract-path-citations.ts`,
     `extract-script-citations.ts` and `validate-markdown-links-helpers.ts` adopt the model, each
     with a nested-fence test and its corpus diff (criterion 7). Six files.
   - **9b. Fitness, refounding and the Bash guard.** `practice-fitness/markdown.ts`,
     `practice-fitness/item-count.ts` (its strip becomes a line walk), `refound-inventory-nets.ts`
     and `hook-policy/matchers.ts` adopt the model, each with a nested-fence test; the guard's
     change reviewed against `hook-policy-substring-discipline`. Eight files.
10. **Regexes in test files.** `spawn/cli.unit.test.ts:345` (`/^[ \t]*Director: forged/mu`),
    `tests/health-probe.unit.test.ts:156` (`/\b[a-z]+-consolidate-docs/u`),
    `tests/mcp-conformance/render-reviewer-pack.unit.test.ts:122` (`\[[^\][]*…\]`),
    `tests/skills/plugin-listing-invariants.integration.test.ts:74` (match every link with
    `\[([^\][]*)\]\(([^()]*)\)`, then filter labels for "privacy"),
    `build-scripts/copy-oak-ds.integration.test.ts:66` (`url\(([^)]*)\)`, then trim and unquote in
    code), `components/framework/framework-animation.test.ts:51` (`/\d\.\d{3}/`),
    `code-generation/typegen/search/completion-context-alignment.unit.test.ts:47` and
    `code-generation/typegen/search/field-alignment.unit.test.ts:31` (`^[ \t]+`), and
    `smoke-tests/gate-slot-cli.smoke.ts:117` (`/^[ \t]+at /mu`). Nine files.
11. **The skill eval scripts' patterns move into the showcase tools module.** The CSS-fence walker
    (a line walk, used by `grade-page.ts` and `grade-no-invented-values.ts`), the declaration test
    (`/[a-z-]\s*:/i`), the attribute and custom-property patterns (lookbehind-started) and the
    theme-rule walk (split on braces) from `grade-theming.ts` land in
    `demos/oak-design-showcase/tools/`, beside `css-literal-values.ts` that both scripts already
    import, each with a unit test; the three scripts import them. Each script's grade over its own
    fixtures is unchanged. About six files.
12. **The lock.** The six twins at `error` in `recommended.ts`; the new `recommended.unit.test.ts`
    with one pathogen fixture per rule, in the shape of `strict.unit.test.ts`; the activation
    comment re-pointed at `docs/governance/sonar-disposition-policy.md`; the policy's S8786, S2245,
    S4790, S2310, S3923 and S7737 classes record their commit-time twin. After units 1–11 have
    merged. Sites added since `493951ad7` surface at this unit's push gate: up to five are cured in
    this unit; more insert a unit 11b before it. About four files.
13. **Signed self-replies bound to their author** (after unit 1):
    - **13a. pr-watch.** `isSignedSelfReply(body, author, selfLogins)`; `selfLoginKey` in
      `pr-watch/logins.ts`; the self-login resolver (the authenticated login through `gh.ts`, the
      app slug from the merge-bot config when it resolves); the wiring in `state-compose.ts`; the
      callers in `pr-watch/settlement.ts` and `pr-watch/expected-reviewers.ts`; tests in
      `reviewer-legs.unit.test.ts` and `expected-reviewers.unit.test.ts`. About eight files.
    - **13b. pr-tally.** The callers in `pr-tally/settlement.ts`, `pr-tally/rows.ts` and
      `pr-tally/dispositions.ts` take the self set; the corpus, rows and settlement integration
      suites inject a self set that holds the recorded bot login and stay green, with a
      non-self signed reply added to each. About six files.
14. **The specimen's scroll region is a tab stop only while it scrolls.** A small client component
    wraps the lesson-breakdown `<section>` (the named region kept): a `ResizeObserver` on both the
    section and the table (a web font widens the table without resizing the section) sets a state
    value used as `tabIndex={scrollTabIndex}`: `0` while the content overflows, absent otherwise,
    and kept while the region holds focus so a resize never drops focus to the body. No inline
    ternary: the analyser evaluates a conditional's consequent and still fires.
    `.table-scroll:focus-visible` takes the design system's focus ring in place of the browser
    default. Tests in `specimen-a11y.spec.ts`: at 320px, before axe runs, the region has
    `tabindex="0"` (the assertion waits for hydration); at 1280px it has none; tabbing to it and
    pressing ArrowRight moves `scrollLeft` above zero. The alternatives were ruled out on evidence:
    fitting the table at 320px is infeasible (about 250px of minimum content against 208px before
    any cell padding, in the tightest identity), and a stacked narrow layout loses table semantics
    on older WebKit and changes the design system for four rows. About four files.

Order: 0, then 1. Units 2–8, 10, 11, 13a and 14 have no file dependency on each other and run at
most three at a time (the estate's lane cap), unit 2 first among them as the server-side change;
9a and 9b after 6, 7 and 8; 13b after 13a; 12 after 1–11 (9a and 9b included). Cost: seventeen pull
requests at about one seat-hour each including review, so about seventeen seat-hours; with three
lanes about seven wall hours. Re-estimate at each merge; past thirty-four seat-hours, stop and
reshape.

## Out of scope

- The nine LOW-impact security findings (six S4036, three S5332) and every CodeQL class: outside the
  owner's filter, and already units 4 and 5 (and the CodeQL units) of `code-scanning-alerts-to-zero`.
- Maintainability-only findings: the analyser's quality-profile backlog, not this filter.
- Linting the skill eval scripts themselves: they sit outside every workspace by design; unit 11
  moves their flagged patterns into a linted module.
- The runtime-only scripts' separate lint config (`eslint.runtime-only.config.mjs`, core rules only):
  the analyser reports no finding there.
- Any analyser-side state change: the one-outcome rule.
- Changing the `SimpleWriteStream` interface or `createMcpAuthClerk`'s positional `canonicalOrigin`:
  neither is a finding; each would be a public-API change of its own.
- Binding the analyser project per checkout: `code-quality-binding-per-checkout` (ratified, its own
  pull request). Without it the closing seat reads the project from the operator profile's repo scope
  file (PDR-141).
- The other delivery nodes that still serve the retired Reliable Atoms node: they belong to other
  lanes; only `code-scanning-alerts-to-zero`, which unit 0 amends anyway, is re-pointed here.

## First-principles check

- **Shape.** The tests prove behaviour the estate owns: a classification, a parse, an id's format, a
  header's acceptance, a fence's extent, an author's standing, a tab stop's presence. The lint
  fixtures prove the estate's own config refuses a pathogen, not that the vendor's rule works.
- **Landing path.** The twins land in the shared config every workspace extends, so the commit hook
  (changed workspaces) and `pnpm check` (all) both run them; the skill eval scripts and the
  runtime-only scripts are named as outside that path. Tests take the estate's tier names so the
  runners include them; the new config test sits beside `strict.unit.test.ts`.
- **Vendor literal.** The twin rule names were read from the installed plugins' rule maps
  (`eslint-plugin-sonarjs` 4.2.0 `cjs/plugin-rules.js`, `eslint-plugin-unicorn` 73); the analyser
  keys from its own issue query; `randomBytes`, `randomInt` and `createHash('sha256')` are
  `node:crypto`'s current API; the bot's login form was read from the recorded corpus.
- **Optionality surface.** Every site names its cure and its single fallback (the string
  operation); every unit names its files and order; the scroll region's cure was chosen by the
  decision lenses on an accessibility review's evidence (unit 14), so no choice is left open.
- **Record consumer.** The lane's closing comms event is the only accounting surface; criterion 1's
  reading is its consumer. Unit 0's ledger rows are read by those nodes' next pickups.
- **Rules tier.** Fix-only (the one-outcome rule and its single CodeQL exception, untouched); checks
  are never disabled, rules only added; generated code is fixed at the generator; small pull
  requests; TDD for refactoring; one helper at the second consumer (`trimEndWhile`,
  `stripLinkTitle`, the fence model, the eval patterns in the shared tools module).

## Review dispositions

One row per finding; "applied" means folded into this node before ratification.

| Date | Source | Finding | Disposition |
| --- | --- | --- | --- |
| 2026-10-27 | Cricket panel on the triage (eight seats, both stances) | The weak-hash finding was presented as an open question although the one-outcome policy already rules on it; the owner's plural "most of the weak hash findings" against one finding. | Applied: S4790 is a cure in unit 2; the problem section records one weak-hash finding in any status and zero hotspots. |
| 2026-10-27 | Accessibility review of the scroll-region options (read-only, at authoring) | Ranked a tab stop only while overflowing first; fitting at 320px infeasible by arithmetic; a stacked layout loses table semantics on older WebKit and restoring roles trips the redundant-role rule; an inline ternary still fires the analyser rule; observe the table as well as the section; keep focus through a resize; add the design system's focus ring; assert the attribute before axe because the suite does not wait for hydration. | Applied: unit 14 and criterion 9. |
| 2026-10-27 | Assumptions review (read-only, at authoring), blocking | "Seven twins" where six exist; S6845 has no twin, so the goal over-claimed. | Applied: six twins throughout; the goal names S6845's holders. |
| 2026-10-27 | Assumptions review, blocking | Unit 14 was a placeholder while the node declared no owner gate. | Applied: unit 14 written; no gate needed. |
| 2026-10-27 | Assumptions review, blocking | GraphQL records the bot without `[bot]` (as the recorded corpus shows), so `<appSlug>[bot]` would make every recorded signed reply non-self; the authenticated login's source was unnamed. | Applied: `selfLoginKey` strips `[bot]` and lowercases; the login read through `gh.ts` as a refusing `Result`; verified first-hand in `pr-138-harvest.json`. |
| 2026-10-27 | Assumptions review | Ten fence detectors, not eight (`validate-markdown-links-helpers.ts:72`, `hook-policy/matchers.ts:73`); unit 9 over the bands. | Applied: ten detectors; units 9a and 9b. Verified first-hand. |
| 2026-10-27 | Assumptions review | The eval scripts already import the showcase tools module, so a per-script walker breaks consolidation at the second consumer and its stated reason was false. | Applied: unit 11 moves the patterns into that module. Verified first-hand. |
| 2026-10-27 | Assumptions review | Unit 13 over the bands. | Applied: units 13a and 13b. |
| 2026-10-27 | Assumptions review | The vocabulary report is gitignored and needs gitignored bulk data, so its regeneration cannot prove unit 5. | Applied: a red-first unit test pins the innermost-parenthetical capture. |
| 2026-10-27 | Assumptions review | Criterion 4 contradicted the deliberate behaviour changes. | Applied: the named behaviour changes are listed in the mechanism and excepted in criterion 4. |
| 2026-10-27 | Assumptions review | Criterion 5's timing margin was thin and two of its tests made no red claim. | Applied: 1,000 ms explicit timeouts, inputs at ten times the margin, each red-first. |
| 2026-10-27 | Assumptions review | Unit 12's scope moves with other lanes; a root ESLint run uses every strict rule. | Applied: new sites surface at unit 12's push gate, up to five cured in-unit, more insert a unit 11b; the root run is dropped (the plugins do not resolve from the root; verified) in favour of unit 11's move. |
| 2026-10-27 | Assumptions review | Unit 0 missed sections of `code-scanning-alerts-to-zero` that carry the moved sites. | Applied: every section named in unit 0. |
| 2026-10-27 | Owner, at plan review | "The reliable atoms concept is retired, this is just fixing defects"; asked which node a defect-fix plan serves: "Maintenance". | Applied: `serves: maintenance`, a new strategic node landed by unit 0 (serving TOOLS-1); `code-scanning-alerts-to-zero` re-pointed in the same unit. |
| 2026-10-27 | Assumptions review, nits | Unit 2 has no file dependency; `findings.ts` also runs live; the pr-tally row should name unit 1; the LOW findings are the sibling's units 4 and 5; name the typegen tests; `recommended.unit.test.ts` is new. | Applied, each. |
