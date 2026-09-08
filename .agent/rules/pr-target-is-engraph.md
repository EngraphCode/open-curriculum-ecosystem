# PR Target Is engraph

On the EngraphCode fork, `main` mirrors the upstream `oaknational` line and
receives no fork work. All fork work lands on `engraph`: every pull request's
base branch is `engraph`, never `main`.

## Trigger

A pull request is about to be created in
`EngraphCode/oak-open-curriculum-ecosystem`, or any tool is about to choose a
base branch by default.

## Action

Set the base branch to `engraph` explicitly. Never rely on the default:
`main` is this fork's GitHub default branch, so every surface that infers a
base — the GitHub UI, `gh pr create`, MCP `create_pull_request`, compare
links — infers the wrong one unless told otherwise.

The fork's reach stops at its own surfaces. Owner ruling (verbatim, 2026-09-06): "This is
the Engraph fork, do not access the Oak repo without permission and NEVER write to the Oak
repo, to Linear, or any other Oak surface". A read of the `oaknational` repository needs
owner permission first; a write to it, to Linear, or to any other Oak surface is forbidden
without exception. Every `gh` call names the fork explicitly: `--repo
EngraphCode/open-curriculum-ecosystem` on the commands that take the flag (`pr`, `issue`,
`run`, `release`); for `gh api`, which has no `--repo` flag, the full
`repos/EngraphCode/open-curriculum-ecosystem/...` endpoint or `GH_REPO` in the
environment (read from `gh api --help`, 2026-09-07).

## Failure Mode Prevented

Worked instance (2026-08-23): PR #7 was opened with `base: main` and merged
there, putting fork-only work on the mirror branch. The change was
retargeted to `engraph` as PR #8; the owner ruled the stray `main` merge is
left as-is rather than force-pushed away. This rule exists so the default
branch stops being a trap.

Second instance, one level up from the base branch (2026-09-06): `gh pr list` with no
`--repo`, on a checkout carrying `origin` (EngraphCode), `upstream` (oaknational) and a
read-only mirror, resolved to the remote named `upstream` and read the Oak repository's PR
list — the read the ruling above forbids without permission. Cure applied: `gh repo
set-default EngraphCode/open-curriculum-ecosystem`, which is machine-local and protects one
machine only, and an explicit fork target on every `gh` call — the flag where the command
takes it, the endpoint or `GH_REPO` for `gh api`, the positional for `gh repo view` — which
travels with the practice.

## The landing slot (Director routing 2026-09-06; refined 2026-09-07)

`engraph`'s ruleset requires branches to be up to date, so every merge knocks every other
open PR to BEHIND; each knocked PR must sync and push again, and every push opens a fresh
review round (ADR-204 makes the re-sync one push). So one non-draft PR holds the `engraph`
landing slot at a time: the slot-holder syncs ONCE, pushes, settles and merges; every other
seat may open its PR, gather reviews and disposition threads, but does NOT sync or merge
until the slot-holder's merge-landed event, then takes the slot, syncs once and lands. Slot
order is the Director's call — the default is the oldest non-draft PR, and the slot goes to
whichever PR is green and clean first rather than being held empty. The fold takes the slot
at the UTC rollover. Worked instance (2026-09-06): #58 was knocked BEHIND twice in one evening
by other seats' merges, and its round five came from a sync push, not a cure.

## Related Surfaces

- [`never-commit-to-main`](never-commit-to-main.md) — local commits to
  `main` are separately prohibited; this rule covers the PR base choice.
