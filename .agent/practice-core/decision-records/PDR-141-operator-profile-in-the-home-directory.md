---
pdr_kind: governance
---

# PDR-141: The operator profile lives in the home directory — the Practice's first surface outside a repository

**Status**: Proposed (owner-directed 2026-09-14, in-session: the profile is
"strictly optional" and lives "in the home directory so that ALL Practice
repos on the machine can use it … in the same way that the Claude vendor
memory is both in a shared directory and within that scopes some things to
a particular directory or project"; the shape below — the root, the scope
key, the reader contract — is the seat's proposal for the owner to ratify)
**Date**: 2026-09-14
**Related**: [PDR-050](PDR-050-state-memory-substrate-contracts.md)
(substrate contracts), [PDR-067](PDR-067-surface-classification-for-fitness-response.md)
(per-user memory is a buffer), [PDR-105](PDR-105-reference-direction-invariants.md)
(reference direction), [PDR-125](PDR-125-inter-practice-collaboration-protocol.md)
(cross-estate identity)

## Context

Three kinds of fact about the human at a machine were homeless until August
2026 and each was lost at least once: which identity (which bot, which human
account) performs which action class on third-party systems; how the operator
wants agents to write to them and as them; and personal operating
preferences that are neither doctrine nor session state. The host repository
cured this with a machine-local, git-ignored directory inside the checkout
(`.agent/operator-local/profile.md`, 2026-08-18), placed below every tracked
surface in the authority order.

The 2026-09-14 dedicated drain of the Claude per-user memory buffer seeded
that file for the first time and exposed the placement defect. The facts it
holds are properties of the person and the machine, not of one checkout:
this machine carries eight Practice-bearing repositories, and a profile
inside one checkout is invisible to the other seven, to every linked
worktree of the same repository (the tier's own README had to teach
readers to resolve the primary checkout first), and to a second clone of the
same repository. Every vendor memory system already solved this the other
way round: Claude Code keeps its memory under the user's home directory and
scopes part of it to a project. The Practice, which exists to be
vendor-independent, had its only person-and-machine surface inside a repo.

This is the first time the Practice creates and consumes information outside
a repository, so the decision is recorded as a PDR rather than a host-level
convention: it fixes where such information may live, what may live there,
and what may never depend on it.

## Frames considered

Three frames were held apart before deciding (the Parallax discipline at
core depth):

1. **The person-and-machine frame** (the owner's): the operator is one
   person on one machine using many repositories; their profile is one
   surface, shared, with parts scoped to a repository where a fact is true
   of one line only.
2. **The checkout frame** (the August 2026 status quo): a binding such as
   "which bot commits here" is a property of the repository, so the
   profile belongs beside the repository. This frame is not wrong about the
   binding; it is wrong about the container. It duplicates the person's
   facts across every checkout, hides them from worktrees and clones, and
   makes the buffer drain re-seed the same facts once per repository. Its
   valid content survives in frame 1 as the repository-scoped file.
3. **The vendor-memory frame**: leave person-and-machine facts in each
   agent platform's own memory. Rejected on the Practice's founding
   constraint: the Practice is cross-vendor, and per-user vendor memory is
   a buffer that drains by design (PDR-067).

The crosswalk from frame 2 to frame 1 is complete: every fact the checkout
tier could hold has a place in the home-directory layout, and the
authority-order clause (below every tracked surface) transfers unchanged.
The bridge from the vendor precedent to the Practice is partial and named
as such: vendor memory scopes by directory path, which breaks when a
repository moves and duplicates across clones and worktrees; the Practice
scopes by repository identity instead.

## Decision

1. **The root.** The Practice's home-directory root is `~/.practice/`
   (overridable by the environment variable `PRACTICE_HOME`, so validators
   and tests can point elsewhere). Nothing lands under it without a PDR
   naming the surface; this PDR names one.
2. **The profile layout.** `~/.practice/profile/index.md` holds what is true
   of the operator on this machine across every repository. A repository-
   scoped fact lives in `~/.practice/profile/repos/<scope-key>.md`.
3. **The scope key** is the repository's identity, never its path: the
   `origin` remote's owner and repository name, lowercased, joined with
   `--` (for this line, `engraphcode--open-curriculum-ecosystem`). A fork
   and its upstream therefore hold separate scope files, which is correct:
   the facts differ by line. A repository with no `origin` remote has no
   scope file until it has one; readers proceed on the shared index.
4. **Strictly optional.** A missing root, index or scope file is the
   expected condition, not a defect: readers proceed on tracked defaults
   and say nothing. Nothing may fail, warn, block, or make a correctness
   property depend on the profile's presence or content (`principles.md`
   §Any User, Any Machine).
5. **Authority.** The profile sits below every tracked surface. Where it
   conflicts with a directive, ADR, PDR, rule or active plan, the tracked
   surface wins and the profile's clause is stale by construction; only a
   current owner direction displaces tracked governance. The profile is
   authoritative on exactly the machine-local binding a tracked surface
   deliberately declines to name.
6. **Content.** Prose with clear headings, short enough to read whole at
   session open. Identities are named, never their credentials: no tokens,
   keys, passwords or canary values, which live in the keychain, a
   credential helper or `.env.local`. Paths inside the profile are fine; no
   tracked file may resolve through one. Nothing load-bearing for a gate,
   validator or build. Content an agent inferred from observed behaviour is
   marked inferred until the operator ratifies it.
7. **Readers.** The shared start-right grounding reads the index and the
   current repository's scope file, in that order, and is the single tracked
   read pointer. Because the location is the home directory, no primary-
   checkout resolution is needed: a linked worktree, a second clone and a
   session in any other Practice repository read the same files.

   ```bash
   PROFILE_ROOT="${PRACTICE_HOME:-$HOME/.practice}/profile"
   [ -f "$PROFILE_ROOT/index.md" ] && cat "$PROFILE_ROOT/index.md"
   SCOPE="$(git remote get-url origin 2>/dev/null \
     | sed -E 's#^(git@|https?://)([^/:]+)[:/]##; s#\.git$##; s#/#--#' \
     | tr '[:upper:]' '[:lower:]')"
   [ -n "$SCOPE" ] && [ -f "$PROFILE_ROOT/repos/$SCOPE.md" ] \
     && cat "$PROFILE_ROOT/repos/$SCOPE.md"
   ```

8. **The checkout tier is retired.** `.agent/operator-local/profile.md` is
   no longer a home; the host directory keeps a short reference document
   pointing here and its ignore rules so that a stray file placed there
   stays untracked. The per-user vendor memory buffer graduates
   person-and-machine facts into this profile, and this profile graduates
   anything that turns out to be doctrine back into a tracked surface.

## Amendment 2026-09-14 — the contract, the machine kind and the synced root

Owner direction the same day, after the seeding: the profile needs a
versioned schema, validators in the repository, frontmatter in its documents
and a stable in-repo index pointing at the local index while acknowledging
it may not exist; and the root may be a git repository the operator syncs
between machines, provided the estate stays machine-agnostic.

9. **The contract is Core-carried.** `practice-core/schemas/operator-profile.schema.json`
   (family 1.0.0) governs every document's YAML frontmatter: `practice_profile`,
   `schema_version`, `kind`, `updated`, `ratified`, and the kind's key. The
   estate's enforcement surface is the `operator-profile` validator in
   `agent-tools` (`pnpm profile:check`), a strict mirror bound to the contract
   by a conformance smoke in the e2e suite, as the inter-Practice wire
   contract is bound. Within a family, evolution is additive-optional with a
   MINOR bump of the document and every validator together; anything else is
   a new family. The check runs at session open and after edits, never in
   the commit or push gates: decision 4 stands.
10. **A third kind, `machine`.** `machines/<machine-key>.md`, keyed by the
    short host name lowercased, holds what is true of one machine only
    (which CLIs are logged out, where checkouts live). The index holds what
    is true of the operator everywhere; a scope file what is true of one
    line.
11. **The root may be a private git repository the operator syncs.** The
    machine split is what makes this safe: person-level and line-level facts
    travel, machine-level facts stay keyed to their host, and no reader
    assumes any machine. The layout tolerates git furniture (`.git`,
    `.gitignore`, `.gitattributes`) and nothing else beyond the three kinds.
    The Practice reads the repository and validates it; it never
    initialises, commits or pushes it, and it refuses credential-shaped
    lines before anything is synced. The operator's remote is a fact of the
    profile, recorded in its own index, never in a tracked surface.
12. **The stable pointer** is the Practice index's row for the operator
    profile, which names the home-directory path, states that it may not
    exist, links the contract and names the check.

## Boundaries

- This PDR licenses one surface. A second home-directory surface (a cache,
  a registry, a cross-repository state file) is a new decision, recorded by
  amending this PDR or by its own PDR, never by convention.
- The profile is per person per machine. It is not a team surface, not a
  sync target, and nothing another user or CI needs may live in it; a fact
  that matters to more than one person is doctrine and goes to a tracked
  surface.
- Repository-scoped files hold facts true of that line; they never restate
  the shared index.

## Prediction and falsifier

Prediction: within one buffer-drain cycle, person-and-machine facts stop
being re-seeded per repository, and no session in a linked worktree or
second clone reports the profile as absent when the primary has one.
Falsifier: a duplicated or diverged profile across two checkouts on one
machine, or a reader that fails or warns on a missing root. Reopen
conditions: a second out-of-repo surface is requested; a profile grows past
a screen (doctrine leaking into the tier); a credential is found in one.

## Provenance

Owner direction 2026-09-14 at the close of the Claude buffer drain; the
seat (Zephyr guards Leeward, 281e44) authored the layout, scope key and
reader contract. The August 2026 checkout tier and its rationale are in the
host's `orientation.md` §The Operator-Local Profile Tier and the
`bot-identity-on-third-party-systems` rule, which point here for the
binding.
