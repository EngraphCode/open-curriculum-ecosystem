# Findings ledger: the 1.181.3 → 1.185.0 sync (carrier #154, 2026-09-17)

**Review contract.** Purpose: record every issue found while integrating Oak main
`d9138c8b9` (release 1.185.0) into `engraph`, from any source — the seat's own reading during
conflict resolution, regeneration and the premise sweep; the fork's quality gates; the review
rounds on the carrier. Owner's word (2026-09-17): quality cures of Oak-authored code never ride
the sync and each becomes its own pull request later; a cure that a failing fork gate forces is
made on the carrier and recorded here as gate-forced; issues in the fork's own sync machinery are
fixed in their own lanes and recorded here for the record. Each item cites the file and line
against the tree at `d9138c8b9` (Oak-authored) or at the carrier head (fork-authored), the
standard it misses, and the finding in the finder's words; no cure text beyond that. A reader
verifies each item reproduces at the cited tip before opening its lane.

## A. Oak-authored code and prose: quality findings (cure in their own PRs, never on the carrier)

The Oak line's landing-page teardown (#928, 1.183.0) removed the page and left the repository's
own documentation describing it. Each passage below is byte-identical to the Oak line's tip
(`git diff d9138c8b9 -- <file>` shows no text added on this line), so by the owner's constraint it
is cured on this line in its own PR, never on the sync, and the two lines carry the cure together
when they rejoin (owner, 2026-09-17: one repository temporarily diverged). Prose authored on this
line about the same subject was re-trued on the carrier. Standard for all of A1–A4: principles
§Misleading docs are blocking; §Target-architecture wording needs consuming-runtime evidence.

1. `apps/oak-curriculum-mcp-streamable-http/docs/deployment-architecture.md` lines 374, 398, 400,
   450–451, 462–463: the phase diagram lists "DNS Rebinding Protection" under Phase 2 and
   "Phase 5: Static Assets & Landing Page" with a "Landing Page Handler (/)", and the snippet
   calls `mountStaticContentRoutes(app, dnsRebindingMiddleware, …)`. Source at the same tip:
   `src/app/static-content.ts` says `/` has no route and returns 404;
   `src/app/bootstrap-security.ts` no longer constructs `dnsRebindingProtection`;
   `application.ts` calls `mountStaticContentRoutes(app, log, {...})` after
   `mountAgentDiscoveryLinkHeader(app)`.
2. `.agent/rules/confident-seats-proceed-and-report.md` line 34: "freeze-bound surfaces (served
   surface, auth path, landing page — …)" names a surface the app no longer has.
3. `.agent/skills/README.md` line 37 (the audience registry row): the curriculum skills' home is
   given as `.claude-plugin/marketplace.json` alone; the tree now also lists
   `plugins/oak-open-curriculum-chatgpt` through `.agents/plugins/marketplace.json` (Oak #968).
   The fork-authored sentence below the table was re-trued on the carrier.
4. (Moved to C2: the generator source is fork-only, so the premise was the fork's own.)
5. `agent-tools/src/workspace-census/subjects.ts` line 86 (identical on Oak's tip):
   `PLUGIN_MANIFEST_SUFFIX = '/.claude-plugin/plugin.json'` is the census's only plugin-manifest
   arm, so `plugins/oak-open-curriculum-chatgpt/`, whose manifest is `.codex-plugin/plugin.json`
   (Oak #968), is never a census subject; Oak's own tree carries both the package and the
   unchanged rule. The fork's census plan gains a dated amendment on the carrier; widening the
   rule is a code change for its own PR. Standard: principles §Strict and Complete (a
   classifier that silently misses a member of its class).
6. `.agent/reports/mcp-agent-facing-content-audit/registry.json`, item C355's purpose (identical
   on Oak's tip): "Determines the endpoint URL shown in the connection snippet: HTTPS on the
   Vercel host when present, else the localhost:3333/mcp dev default." The snippet went with the
   landing page; `served-origin.ts` lines 7–8 at the same tip say it fed the page "until that
   page was removed on 2026-08-20". Standard: §Misleading docs are blocking; the generated
   pedagogy page repeats it and is not hand-edited.
7. `docs/architecture/architectural-decisions/217-*` (server-rendered HTML in the MCP app) still
   reads `Status: Accepted` on Oak's tip after #928 removed the surface it decides; the ADR index
   rows repeat it. Oak's own ADR status, left as Oak's; recorded so the merge-back carries the
   question. Standard: §Misleading docs are blocking.
8. `apps/oak-curriculum-mcp-streamable-http/docs/vercel-environment-config.md` lines 29 and 84
   (identical on Oak's tip): "names extra hosts for the DNS-rebinding guard" and "automatically
   included in the allowed hosts for DNS rebinding protection" — `dnsRebindingProtection` has been
   mounted on no route since 2026-08-20 (MCP-650); `ALLOWED_HOSTS` still feeds `deriveSelfOrigin`.
   Standard: §Misleading docs are blocking.
9. `.agent/practice-index.md` line 367 (identical on Oak's tip): the `.agents/` row reads
   "Portable skill, command, and rule adapters" and omits the new `.agents/plugins/marketplace.json`
   (Oak #968). Minor. Standard: §Documentation Is Infrastructure (stable indexes point and must not
   drift).
11. Oak's ADR-125 amendments of 2026-09-08 and its ChatGPT package README qualify
    `plugins/oak-open-curriculum/` as "(Claude Code)" and call the ChatGPT package's source "the
    Claude plugin". Owner ruling on this line (2026-09-17, verbatim): "it is a Claude plugin, it
    is in no way constrained to Claude Code only". The fork's `development-practice.md` definition
    ("never write 'Claude Code plugin' for the Oak plugin") stands; Oak's qualifier is the
    misstatement, and fork prose never copies it (two rehearsal edits that had were corrected).
    Standard: §Consistent Naming (one concept, one name); §Misleading docs are blocking.
10. `.github/actions/setup/action.yml` line 13 (identical on Oak's tip): `pnpm/action-setup` pinned
    at v6.0.9 while Oak bumped its own `ci.yml` to v6.1.0 (#980) and left the composite action
    behind. Standard: principles §Consistent Naming's one-concept-one-value spirit for pins; the
    dependency-currency lane's SHA-pinned-actions leg.

## B. Gate-forced cures made on the carrier (owner constraint 4)

_None so far: the merged tree type-checked after one integration cure (C1)._

## C. Integration cascades cured on the carrier (fork-authored files meeting the change)

1. `apps/oak-curriculum-mcp-streamable-http/e2e-tests/string-encoded-numbers.e2e.test.ts`
   (line 64 at `engraph` `cd847a2b3`): a fork-only test passed `getLandingPageHtml` to
   `createApp`, an option Oak #928 removed; `type-check` failed with TS2353 on the merged tree.
   The same class Oak cured on its own side in #987. Cured by dropping the option (the test's
   subject is string-encoded numbers, not the landing page). Standard: the divergence rule's
   "signature mismatches in auto-merged files".
2. `agent-tools/src/mcp-content-workspace/content-workspace-config.ts` line 49 (fork-only): the
   ux-accessibility domain description read "Human-facing surfaces — the landing page, the
   widget, and authorisation and consent copy", and the generated governance README and
   ux-accessibility page carried it. Re-trued at the source and the pages regenerated. Standard:
   the cross-fork skill's §6 premise sweep (a generated page is regenerated, never hand-edited).

## D. Fork sync machinery (fixed in their own lanes)

1. **A bot-dispatched mirror run cannot move the mirror.** `.github/workflows/upstream-mirror.yml`
   fast-forwards `main` with the run's own token; scheduled runs succeed, but run 35240876819
   (dispatched by the bot under the `workflow-dispatch` scope, `actions: write` alone) failed the
   reference update with 403 while its reads succeeded — a dispatched run's token is capped at the
   dispatching token's permissions. Lane `fix/upstream-mirror-dispatch-token-scope`: the scope
   carries `contents: write`; run 35241924531 under it moved `main` by 19 commits. Standard:
   principles §Target-architecture wording needs consuming-runtime evidence (the node's
   "dispatch works" rested on two runs that never reached the write).
2. **An unworked carrier goes stale and blocks its replacement.** The carrier workflow's duplicate
   guard keeps one open carrier regardless of how far the mirror has moved; #151 (1.181.4) sat 76
   commits stale until closed by hand. Lane `fix/upstream-carrier-supersede-unworked-stale`: a
   draft carrier whose head is still the sha in its name and that carries no
   `upstream-carrier-taken` label is closed on its record and re-cut at the mirror tip; a seat
   labels the carrier at pickup. Standard: the carrier node's own goal ("one draft carrier
   pull request exists at `main`'s tip").
3. **The merge-bot doc's scope table lacked the `workflow-dispatch` row and claimed the App holds
   no Actions permission** (`docs/engineering/merge-bot.md`, lines 107–111 and 197 at
   `cd847a2b3`). Re-trued in lane D1. Standard: principles §Misleading docs are blocking.
4. **git sleeps on the file-system-monitor IPC socket on this host** (observed, cause unproven):
   three instances in about 75 minutes on 2026-09-17 — a `git commit` in a fresh worktree slept 12
   minutes with no hook child (15:48Z); a peer seat's `git add` on the primary held `index.lock`
   about ten minutes (~15:58Z); the primary's `git status` answered `error: could not read IPC
   response` (16:13Z). Five `fsmonitor--daemon` processes ran, one per worktree of the one clone;
   `-c core.fsmonitor=false` avoids the socket. Not a code defect on either fork; a host and
   worktree-topology finding for the harness-shell pattern and the worktree-hygiene rule.
   Standard: `one-instance-is-an-observation` (three instances, two seats: now a finding).

   **Probe, 2026-09-19 15:52Z–15:59Z (owner-approved; this seat; the trial worktree; read-only
   `GIT_OPTIONAL_LOCKS=0 git status --porcelain` under a 60-second alarm with trace2 timing; no
   commit, add, config write or daemon stop). Reproduced, with a dose-response.**

   | Condition | monitor on | monitor off |
   | --- | --- | --- |
   | Quiet (primary / trial / carrier) | 0.08s / 0.22s / 0.06s | 0.04s / 0.11s / 0.07s |
   | Run 1: 3 bursts of 100,000 files created then deleted in `node_modules/.fsmonitor-probe/` (5s per burst) | worst 9.79s, of which 9.60s inside the client's daemon query; others 1.8–4.1s | 0.08–0.14s on every sample |
   | Run 2: 4 bursts of 400,000 files (about 21s to create each) | 22.10s, 23.01s, 24.49s, 18.64s, one per burst; 0.2–3.5s between | 0.08–0.15s on every sample |

   The client's block lasts about as long as the burst of file events does, and the whole wait
   sits in the trace2 region for the daemon query; with `-c core.fsmonitor=false` the same
   command never exceeded 0.15s under the same load. The directory is git-ignored, so ignored
   churn is enough. A forced install was not run: the stop rule (reproduced under the synthetic
   load) fired. Not varied: two installs at once, commit hooks, a daemon dying mid-query (the
   trial's daemon was born 16:05:58Z on 09-17, after its hung commit, and the primary's at
   15:50:57Z on 09-19, so daemons here do die and respawn). The carrier worktree's daemon token
   reads `builtin:22.…`, 22 forced resyncs since its start. The 12-minute sleeps of 09-17 are
   consistent with this mechanism under minutes-long installs in several watched roots; that
   step is an extrapolation of the measured dose-response, not a reproduction of 12 minutes.
   Benefit side: with the monitor off, status is as fast or faster in all three worktrees, so
   the monitor buys this clone nothing measurable. Verdict for the owner: unset
   `core.fsmonitor` in the clone's local config and stop the five daemons; one line undoes it.
   After the probe: the trial worktree's status count is 986 as before, `MERGE_HEAD` is
   `cd847a2b3`, the probe directory is gone, no `index.lock` exists. Raw logs and the two
   scripts: the integrating seat's handoff instruments (`fsmonitor-probe-*`), which ride the coordination branch's records.
   **Cured 2026-09-19 ~19:42Z** at the owner's word, after the decision lenses and a second
   opinion from the curator seat (comms events a924faaf, c82ce1de): the monitor unset in the
   clone's shared configuration, five daemons stopped, none respawned, status 0.04s. Added
   datum from that seat: its read-only command on the primary slept ten minutes while this
   probe's churn ran in a different worktree, so the event backlog is host-wide; the probe's
   notice should have named the primary as exposed. The guard and the bounded enumeration are
   the sketch node `warranted-means-in-the-operating-environment`.
5. **Hardening follow-ups from the security review of lane D1** (not in that PR): a self-revoking
   dispatch token after use (an installation token can revoke itself); a ruleset on the mirror
   branch with `deletion` and `non_fast_forward` only (owner's admin act); a validator coupling
   each dispatchable job's `permissions:` to the scope that dispatches it. Standard: least
   privilege by construction (merge-bot doc §scopes).
6. **The host's shared browser cache did not hold the Chromium revision the lockfile's
   Playwright needs** (observed 2026-09-19, lane D1's first push): every browser test in two
   workspaces failed in 0ms with `Executable doesn't exist … chromium_headless_shell-1234`
   while the user cache held only revision 1243; `playwright install chromium` fetched 1234 and
   in the same act removed 1243. The cache is one per user, shared by every checkout and every
   other project on the host, and an install in any of them garbage-collects revisions the
   others need. Nothing in the repository declares or checks it. A candidate second instance
   for the sketch node `warranted-means-in-the-operating-environment`'s enumeration (ambient
   state a ceremony depends on, invisible to review); one instance, recorded as an observation.
7. **Two commit messages of this seat carry a commitlint `footer-leading-blank` warning**
   (`67330f696`, `e1fe4438b`): a wrapped body line beginning `word: ` parses as a footer
   token. The hook passes on a warning, so nothing stopped it; an amend to reflow the first
   was declined by the owner's permission layer and both are pushed. Practice since: each
   message is linted before the commit. Candidate cure for its own pull request: the
   commit-msg hook treats warnings as errors (`no-warning-toleration`).
8. **The carrier workflow's open-carrier listing reads one page of 100**
   (`.github/workflows/upstream-carrier.yml`, the `Find an open carrier` step, `per_page=100`
   with no pagination; present on `engraph` before lane D2): with more than 100 open pull
   requests into the default branch a carrier, or a duplicate, on a later page is not seen.
   Raised by Copilot on pull request 158, round seven, as an observation on unchanged code.
   Standard: principles §Strict and Complete (a guard that silently reads part of its set).
   Own pull request: `--paginate` with a slurped filter.
