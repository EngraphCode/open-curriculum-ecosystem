# Designing reports that remain useful

## Executive summary

`design-reports` gives authors a method for explaining warranted current knowledge
and maintaining that explanation when evidence changes. Its distinctive checks
compare consequential claims across prose, tables and summaries, and compare
promised coverage with substantive treatment. Counts and compliant headings alone
cannot establish either. The method also preserves uncertainty, source dependence,
concurrent edits and honest partial-save states.

The canonical method, discovery entry, permission declarations and synthetic
evaluation fixtures are authored. Generated adapters and behavioural evaluation
remain pending on an execution-capable host. This record supports a draft pull
request, not a completed installation or evidence of improved reader comprehension.

## Source and method boundary

The owner commissioned this capability after a digital curriculum report pair.
The inputs were owner-held documents: the adopted living-report editorial standard
of 13 October 2026; `report-design-and-living-report-skill-pr-brief-2026-10-13.md`
r1.1; `digital-curriculum-ecosystem-session-retrospective-2026-10-13.md` r1.0;
the report and summary r1.2; and their creation/maintenance brief r1.4. There is
no public upstream URL for these inputs. This record transfers their procedural
lessons by adaptation; it does not publish their research corpus or private
storage identities. The detailed source-reading record stays with the commission.

Repository grounding used default branch `engraph` at
`efe69ff66182832dabe7f667ea0fa0ea021bc2ba`. The recovered local draft used that
same base. Its temporary generation workflow was never validated and is not part
of this change. The source retrospective is already complete; this session applies
it without reconstructing the research or claiming a new independent audit.

Start Right established the host and input revisions. Metacognition and reason
changed the acceptance target from visible document parts to the warranted
account a reader can obtain. Proportionality kept the work to one method and
the existing evaluation runner. User-value distinguishes author guidance from
experienced reader benefit. A reduced Parallax framing, synthesis and audit pass
compared three questions: whether the explanation is useful, whether its claims
are warranted, and whether its maintained copies agree. These are complementary
views of the same source case, not independent observations.

The serious counterframe is that another skill merely duplicates existing writing
guidance. The overlap check retains faithful export repair in
`.agent/skills/chatgpt-report-normalisation/SKILL-CANONICAL.md` and knowledge
conservation in `.agent/skills/knowledge/consolidate-docs/SKILL-CANONICAL.md`.
Neither owns the creation and continuing synthesis of a reader-facing report.
This is a situational Practice procedure in the `knowledge` family; it does not
add an always-loaded rule, reporting platform or new delivery mechanism.

## Observations, interpretations and predictions

The source retrospective records both useful review and residual defects. A
complete-looking inventory retained obsolete prose and an unexplained core item.
Later review found a relationship table stronger than the qualified narrative
and missing precise records for relationships already described in prose.
Successful saves established persistence, while guarded conflicts and refreshed
merges established only the recovery actually observed. The saved schedule had
not yet run. Unfinished skill drafts were initially absent from the handoff.

The supported process explanation is that separate acceptance checks answered
narrower questions than whether the assembled report fulfilled its promises.
Ordinary residual error in a long report remains a credible alternative; there
is no evidence for a universal failure rate or an author's internal motives.
The correction is a concrete comparison within acceptance, not another mandatory
ledger or an unbounded series of reviews.

| Procedure change | Expected observation | Falsifier |
| --- | --- | --- |
| Trace consequential claims through every affected representation | A qualified body beside an overstrong table is repaired in both summaries too | A purported pass leaves the stronger current assertion anywhere |
| Check promises against treatment and assertions against warrant | An unexplained core item or missing required relationship record is detected | Headings, inventory counts or a prose mention substitute for the promised explanation |
| Keep evidence, authority, maturity and dispute distinct | An official contested draft stays a draft; operational delivery does not prove effects | Authority or announcement is promoted into implementation or benefit |
| Couple report and summary revisions with guarded saving | A failed second save leaves an explicit, recoverable lag | Concurrent work is overwritten or the pair is called complete after a partial save |
| Preserve unfinished work with exact status | A successor reuses accepted work and resumes the first unfinished check | An unsaved candidate or fixture is called current or validated |

These are operational predictions to test. The bridge from a repaired source
report to a generally effective skill is unproved. Model cases can inspect
transfer and failure behaviour; they cannot establish human comprehension,
storage reliability or future scheduled performance.

## Evaluation design and evidence boundary

The eight inline synthetic cases use municipal sensors, transport and canal-data
reports, including unfamiliar cases beyond the source repair. Six positive and
six negative trigger examples probe discovery. No external source corpus is
required by the fixtures.

| Acceptance surface | Cases |
| --- | --- |
| Static explanation; official, contested, unimplemented proposal; no gratuitous monitoring | 1 |
| Accumulated updates; licensing and operating-state contradictions; coherent summaries | 2 |
| Correct headings but misleading table; missing promised substantive treatment and records | 3 |
| Concurrent edits; report succeeds and summary fails; exact recovery | 4 |
| Failed source retrieval and incomplete check without false freshness | 5 |
| Finite inventory, later discovery, identity crosswalk and unexplained core item | 6 |
| Interrupted work, reusable drafts and unexecuted fixtures | 7 |
| Faithful export repair near miss | 8 and negative triggers |

The runner's schema and projection were inspected in `agent-tools/src/skill-evals/`.
Its tested agent has an empty workspace and read/skill tools. Case 4 therefore
tests reasoning over supplied synthetic receipts, not actual persistence. Prompts
request completed report text where substantive output is the acceptance target;
a promise to repair later is insufficient. The existing runner supports a
with/without comparison and retains answers, traces and blob-bound manifests.
A completed runner exit is not a passing case verdict.

## Static review and disposition

Two same-session model reviewers inspected the six-file candidate. The fixture
and prose pass found literal backslash-newline sequences and missing Markdown
table delimiters in cases 2 and 3. Both were corrected so presentation defects
do not confound the intended semantic checks. The documentation, discovery and
skill-integration pass found no material in-scope defect. Optional-companion
wording was clarified without introducing a new obligation. These are correlated
advisory reviews, not independent evidence or executed evaluation.

Static inspection confirmed eight unique behavioural case IDs, six positive and
six negative triggers, the runner's supported fixture keys, the canonical skill
name in `skills_expected`, and a 677-character description. JSON parsing,
repository-path resolution and staged whitespace checks passed. The permission
diff adds only the two `oak-design-reports` entries. A manual outgoing-content
review and deterministic private-identifier/scratch-path check found no private
research payload or credentials. Gitleaks is absent on this host; CI remains the
first mechanical secret scan. No package manager, generator or local test ran.

## Delivery and execution continuation

The repository detector returned `chatgpt-work-cloud`. The governing
`.agent/directives/cloud-environment-routing.md` permits source inspection and
static checks, a task-branch commit and a draft PR. It prohibits local package
managers, generators and tests on this host. No alternative CI workflow or
hand-authored generated adapter is introduced.

The first execution-capable continuation must read the PR's current head and CI
output, reclassify its own host, then generate the adapters using the repository's
`pnpm skills:generate`. Review the generated diff. Exercise the existing suite:

```bash
pnpm agent-tools:skill-evals run --skill .agent/skills/knowledge/design-reports --host-skill oak-design-reports --suite all --ablation with-without --runs 1 --max-cost-usd 40 --judge-model sonnet
```

This is a bounded initial comparison, not a universal reliability estimate. Read
every retained final answer and trace, retain failures and partial runs, and record
the evaluated canonical/adapter blobs, runner/model configuration and actual scope.
Inspect explanation and meaning as well as assertions and invocation. Use the
repository's normal hook/CI route for adapter, permission and full quality gates;
do not duplicate aggregate gates manually. The authoring contract's human read of the
evaluated outputs remains a separate pre-merge requirement. This commission does
not authorise merging.

Keep the PR draft while generation, evaluation or required checks remain
incomplete. The PR body owns the actual URL, head and CI state after submission;
those cannot be claimed from an authored local record. No successful runtime
validation or human benefit is asserted here.

## Appendix. Record history

- **13 October 2026:** Applied the completed source retrospective, recovered the
  earlier method draft, strengthened semantic and treatment checks, and authored
  evaluation cases and integration for the permitted draft-PR route.
