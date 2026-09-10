---
id: native-windows-support-carrier
node_type: delivery
name: "Native Windows support — land upstream's set-down changeset on engraph with its cures and a CI leg"
overview: "Merge upstream PR #891's head (native Windows support across agent-tools, thirteen commits by Luke Arnold plus review closes) into engraph in a feature lane, cure the two open security findings on the owner-only write, add the basic Windows CI leg the 2026-08-18 ruling requires, and close the fork's stale snapshot #123 as superseded."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: cross-platform-compatibility
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: "The owner says native Windows lands on the fork now (the tier ruling calls it a non-vital goal). Making the windows-basic leg a required check once it is green is the owner's later ruleset act, outside this plan, tracked on the estate-coordination thread record"
    expires: 2026-09-24
last_updated: 2026-09-10
---

# Native Windows support — the carrier of upstream's changeset

## Goal

`engraph` runs natively on Windows for the agent-tools surface — path separators and drive
letters, trusted `git` and `gh` resolution, LF normalisation, pnpm resolution for spawned
processes, worktree matching under drive-letter casing — proven by a basic Windows CI leg, with
the work's authorship preserved and its two open security findings cured. Upstream set the
work down on 2026-09-10; the comparison record
`.agent/research/windows-changeset-comparison-2026-09-10.md` carries the analysis.

## User groups and value

- **A native-Windows contributor or agent host**: the estate's tooling works without WSL —
  offered value under the tier ruling's "goal", proven by the CI leg rather than assumed.
- **The owner**: the required Windows CI leg exists and reports the truth; the October
  merge-back carries a cured changeset instead of a rotted branch.
- **Upstream's author**: the work is not lost; the fork's copy carries the review closes.

## Mechanism

A feature lane off the tip merges the fetched head SHA:a57b89418 with `--no-ff` (four
conflicts: two test files reconciled by hand; two research-package files the fork deleted
stay deleted); two cure commits on the owner-only write (exclusive temp file plus rename;
the Windows ACL stance) with regression tests; one CI commit adding a `windows-basic` job
(checkout, pnpm, install, build, unit tests on `windows-latest`); the estate's legs
(code-expert, security-expert, test-expert) and Copilot; the front door.

## Acceptance criteria (each with a proof)

1. The merge carries every commit of upstream's head and nothing else. Proof `repo-safe`:
   `git merge-base --is-ancestor a57b89418 <merge>`; the merge's diff against the tip equals the
   branch's diff against the merge-base plus the four resolutions.
2. POSIX behaviour is unchanged. Proof `repo-safe`: the estate's full gate green on the lane
   (the pre-commit and pre-push gates; CI on the PR).
3. The symlink finding is cured. Proof `repo-safe`: a test plants a symlink at the destination
   and asserts the target is untouched and the destination is a fresh owner-only regular file.
4. The Windows ACL finding is cured. Proof `repo-safe`: on `win32` the write refuses before
   touching any file, with a typed error that both retention entry points carry in their failed
   outcome (no caller assertion can waive it); tests pin the refusal at the writer and at both
   entry points with the platform injected.
5. The Windows CI leg reports. Proof `repo-safe`: the `windows-basic` job runs on the PR; green
   is the goal, and a red run names the lane's next cures first-hand.
6. #123 is closed as superseded, its disposition naming this lane. Proof `owner-held` (the
   platform's pull-request state is external): the Director closes it as the bot with a comment
   naming this lane; the owner verifies on #123; the closure is recorded on the
   estate-coordination thread record.

## Out of scope

Making the Windows leg a required check (owner-held); the WSL path (landed as #121); any
cure on upstream-authored lines beyond the two open findings; the merge-back itself.

## Todos

1. Merge, resolve, gate, commit (owner as author, Luke's commits preserved by the merge).
2. Cure the two findings with tests; commit.
3. Add the `windows-basic` job; commit; push as the bot; draft PR with the provenance and the
   comparison; close #123 as superseded.
4. Legs (code-expert, security-expert, test-expert), Copilot on the final tip, front door.

## Review dispositions

(none yet)
