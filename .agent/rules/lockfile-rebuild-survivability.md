# Lockfile-Rebuild Survivability

Owner rule, verbatim (2026-07-25): **"all updates and overrides must be able
to survive having the lockfile fully deleted and rebuilt."**

`pnpm-lock.yaml` is a DERIVED artefact. A security floor, version hold, or pin
that holds only because the lockfile happens to record a good version is not a
constraint at all — it evaporates the first time anyone regenerates from
scratch, and the regression is silent, because the rebuilt tree still installs
cleanly and every gate stays green. The constraints that survive live in
declarations: `package.json` ranges and the `pnpm-workspace.yaml` `overrides:`
block.

## Trigger

Any dependency landing: a security-floor bump, a version hold, a new or raised
`overrides:` entry, a batch sweep, or a single package bump. No size threshold
— a one-line floor is exactly the case where "it resolves correctly right now"
gets mistaken for "the constraint is expressed".

## Action

Run the rebuild; do not reason about it. Reasoning cannot see an incidental
pin. Run it cold, in an empty directory: pnpm with no lockfile seeds its
resolution from `node_modules/.pnpm/lock.yaml`, so a rebuild beside the
checkout's `node_modules` writes the old lockfile back when the declarations
match the last install, and nothing was resolved (the second estate measured
it on pnpm 12.4.2, under 30 ms, with and without `--lockfile-only`; the same
declarations resolved cold picked up five in-range releases).

```bash
scratch="$(mktemp -d)"                         # empty: no install state to seed from
git ls-files -z -- package.json '*/package.json' pnpm-workspace.yaml \
  | xargs -0 tar -cf - | tar -xf - -C "$scratch"
pnpm --dir "$scratch" install --lockfile-only --ignore-scripts   # resolve from declarations alone; no lifecycle scripts
```

Then assert all four, and read each result rather than the exit code alone.
The first three read `"$scratch/pnpm-lock.yaml"` and run
`pnpm --dir "$scratch" audit`; the fourth runs in the checkout against the
lockfile to be committed, once the cold result is that lockfile:

1. **Floors** — every advisory-carrying package resolves at or above its fixed
   version.
2. **Holds** — every documented major hold still holds (this repo: `typescript`
   on 6.x via manifest ranges, `@types/node` on 24.x via its override; both
   documented in
   [`docs/engineering/build-system.md`](../../docs/engineering/build-system.md)
   §Dependency updates).
3. **Audit** — `pnpm audit` is unchanged, with any deliberate deferral still
   the only residue.
4. **Frozen install** — `CI=true pnpm install --frozen-lockfile` exits 0.

The committed lockfile is untouched until the cold result is the state to
commit; copy it in then, never before.

**A byte-identical cold rebuild is the strongest pass.** A rebuild that merely
satisfies all four assertions is still a pass: newly-published in-range
versions are legitimate drift, not a violation. A byte-identical result
beside `node_modules` proves nothing: it is the seeded lockfile written back. A rebuild that drops a floor,
crosses a hold, or fails the frozen install means the constraint was never
declared — fix the declaration, never re-pin by hand.

## The override-alignment corollary

pnpm `overrides` rewrite the **effective specifier of direct dependencies**,
not just transitive resolution. So an override left lagging behind the
manifests it governs desyncs the lockfile: the lockfile records the override's
specifier while the manifests carry their own.

**This desync is invisible to every local gate** — no local hook runs a frozen
install, so CI's `pnpm install --frozen-lockfile` is the first surface that
sees it, failing with `ERR_PNPM_OUTDATED_LOCKFILE` and taking `install`,
`secret-scan` and `run-quality-gates` down with it.

Keep override and manifest specifiers aligned whenever a sweep moves either.
The two drift directions differ, measured on this estate's pnpm 11.20.0
(2026-09-25, the frozen lockfile check with `--lockfile-only` over a copy of
the tracked manifests and lockfile): an override changed without regenerating
the lockfile fails loudly (`ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`); a manifest
raised under a standing override passes silently, because the override still
rewrites the specifier. So a moved override is caught at the first frozen
install, and a moved manifest is caught by nothing: an override's comment names
the manifests it rewrites, and they move together in one change.

## Worked instances

- **MCP-151 (2026-07-25)**: the security slice (#530, six bounded floors) and
  the estate-wide drift sweep (#531) were each tested by full delete-and-rebuild
  and came back **byte-identical** — every floor, both major holds, and the
  audit state proven declaration-derived rather than lockfile-retained.
  Nobody recorded where those rebuilds ran; beside `node_modules` a
  byte-identical result is the seeded lockfile written back (§Action), so the
  proof stands only for a cold run.
- **The corollary, same lane**: the sweep moved `@types/node` manifests to
  `^24.13.3` while its override still read `^24.13.2`, producing exactly the
  `ERR_PNPM_OUTDATED_LOCKFILE` desync above. Cured by aligning the override —
  the same alignment `21fdff136` made for the esbuild security floor, and the
  same class `docs/operations/troubleshooting.md` records for PR #296.

## Related Surfaces

- [`docs/operations/troubleshooting.md`](../../docs/operations/troubleshooting.md)
  §"Lockfile desync via pnpm overrides" — the diagnostic entry this rule makes
  preventative.
- [ADR-174](../../docs/architecture/architectural-decisions/174-dependency-vulnerability-scanning-quality-gate.md)
  — overrides are temporary controls that must name the vulnerable dependency,
  why the override is safe, and the condition for removal. This rule adds: and
  they must survive a rebuild.
- [`docs/engineering/build-system.md`](../../docs/engineering/build-system.md)
  — security `overrides` and `peerDependencyRules` belong in
  `pnpm-workspace.yaml`; a CVE floor earns an override, a tool-version pin does
  not.
- [`validators-must-recompute-not-just-record`](validators-must-recompute-not-just-record.md)
  — the same principle one layer up: a check that reads recorded state instead
  of recomputing it cannot see the defect.
