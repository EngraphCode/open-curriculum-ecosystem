# Downstream Checkout Never Writes Upstream Surfaces

Operationalises
[ADR-228](../../docs/architecture/architectural-decisions/228-organisational-identity-below-the-tree.md)
(organisational identity is held below the tree: mechanism names no
organisation; the default branch is derived, never a literal).

A checkout that runs this repository downstream of another (a fork, a
mirror, an organisation running the tree as its own) has exactly one set
of surfaces of its own: its repository, its tracker, its chat, its
code-quality and error-reporting projects — the identity held below the
tree. The upstream's surfaces are someone else's. A seat on a downstream
checkout never reads the upstream repository's surfaces without the
owner's permission and never writes to them at all.

## Trigger

Any repository-scoped `gh` call, any tracker or chat write, any API
call whose target repository, organisation or project is inferred rather
than named; any read of the upstream repository (its pull requests,
issues, branches, files) or of an upstream organisation's private
repositories. Calls with no repository target (a `users/...` endpoint, a
`gh auth` command) are outside this rule.

## Action

- **Reads of the upstream repository need the owner's permission first,
  each time.** The one standing grant: a read-only `git fetch` of the
  upstream remote for comparison (owner verbatim, 2026-09-08: "you have
  standing permission to fetch the upstream remote for the purposes of
  read-only comparison"). Nothing else is standing.
- **Writes to the upstream's surfaces are forbidden without exception**:
  no pull request, comment, review, issue, label, tracker ticket or chat
  message on the upstream's repository, tracker or chat.
- **Every repository-scoped call names its repository explicitly** —
  the checkout's own by default; the upstream's only under an
  owner-permitted read, and named explicitly then too. `gh` takes
  `--repo <owner>/<name>` where the command has the flag (`pr`, `issue`,
  `run`, `release`); `gh api` has no flag, so the full
  `repos/<owner>/<name>/...` endpoint or `GH_REPO` in the environment
  names it; `gh repo view` takes the positional. `gh repo set-default`
  is machine-local and protects one machine only; the explicit target
  travels with the practice.
- **The base branch of a pull request is the repository's default
  branch, derived at the moment of use, never a literal.** Two reads
  agree and either serves; both are verified here (2026-09-08):
  `git remote set-head origin --auto` refreshes the cached remote HEAD
  from the remote (a plain `git fetch` does not, so a clone made before a
  default-branch change would otherwise keep the old name), then
  `git symbolic-ref --short refs/remotes/origin/HEAD` prints
  `origin/<branch>`, and the bare name is the part after `origin/` (a
  single-branch clone has no remote-tracking ref for the default branch
  to point at, so it fetches `<default>:refs/remotes/origin/<default>`
  first, then runs `set-head --auto`); or
  `gh repo view <owner>/<name> --json defaultBranchRef --jq
  .defaultBranchRef.name` with the repository named — never the bare
  `gh repo view`, which infers the repository from the directory and on
  a checkout with an `upstream` remote can answer for the wrong one.

## Failure Mode Prevented

A checkout carrying `origin` (its own repository), `upstream` (the line
it forked from) and a read-only mirror gives every inferring surface
three candidates, and the tools infer the wrong one silently. Worked
instance, the Engraph fork of Oak's repository (2026-09-06): the owner's
ruling, verbatim, "This is the Engraph fork, do not access the Oak repo
without permission and NEVER write to the Oak repo, to Linear, or any
other Oak surface"; the same day `gh pr list` with no `--repo`, on a
checkout with those three remotes, resolved to the remote named
`upstream` and read the upstream repository's pull-request list — the
read the ruling forbids. Cure applied: the explicit target on every
call, as above. A later instance one level down, on the same fork
(2026-08-23): a pull request opened against the fork's then-default
branch, which mirrored the upstream, and merged there; the retarget cost
a second pull request, and the default branch has since been set to the
fork's working branch, which is why the base is derived and never
written down.

## Related Surfaces

- [ADR-228](../../docs/architecture/architectural-decisions/228-organisational-identity-below-the-tree.md)
  — the identity this rule protects is configuration below the tree; the
  mechanism above names no organisation.
- [`bot-identity-on-third-party-systems`](bot-identity-on-third-party-systems.md)
  — the identity every write carries on the checkout's own surfaces.
- [`never-commit-to-main`](never-commit-to-main.md) — local commits to
  the default branch are separately prohibited.
