---
classification: situational
description: "Any activity that edits both estates (a consolidation, a skill or rule sync, a Practice exchange or transplant, an edit to a path both estates hold) measures the shared-path divergence at its open and its close, and closes only with both estates more aligned than at the open: neither the differing shared files nor the differing lines more than at the open, at least one fewer (or both zero), every shared file that grew more divergent named in the close record with its reason. Owner, 2026-09-30: all activities involving both estates MUST leave them more aligned and less divergent than they were before those activities."
trigger: ceremony:cross-estate-work — any activity that edits both estates
---

# Cross-Estate Work Must Reduce Divergence

Operationalises the owner's standing word of 2026-09-30 and
[PDR-142 (The Best of Each Practice)](../practice-core/decision-records/PDR-142-the-best-of-each-practice.md);
the discipline is the two-estate form of [`replace-dont-bridge`](replace-dont-bridge.md).

## Trigger

An activity is about to edit both estates, jimcresswell.net (JC.net) and the Open Curriculum
Ecosystem (OCE): a dedicated consolidation, a skill or rule sync, a Practice exchange or
transplant, or an edit to any path that exists at the same relative location in both.

## Action

1. **Measure at the open.** Before the first edit, record the baseline: the shared paths (the
   same relative path present in both estates among the Markdown files under `.agent/rules/`,
   `.agent/skills/`, `.agent/directives/`, `.agent/memory/executive/` and
   `.agent/practice-core/`, plus `agent-tools/README.md` and `docs/engineering/build-system.md`:
   what the measuring script reads that both estates hold), how many differ, and the total
   differing lines (a unified diff with zero context, counting its `+` and `-` lines). Say the
   three numbers in the opening statement.
2. **Write shared changes once, in both.** A change to a shared path lands in both estates in
   the same words and the same wrapping. An estate-specific fact goes into an estate-only
   surface, or into the shared file in both estates worded so it reads true in each: name the
   estate ("in OCE", "in JC.net"), never "this repository", "here" or "the lineage".
   Twin pull requests for one shared change land in sequence. The first copy's review settles
   the bytes and it lands without waiting for its twin; the second estate's copy is cut from the
   settled blobs (the Director's ruling of 2026-09-26; of eleven exchange-lane events applying
   it, four had stated a mutual wait, which holds both copies).
   Before a port in either direction, each thing the destination lacks is read as a decision
   first and a loss second: run `git log -S'<distinctive string>'` in the destination, over its
   whole history and with no path (a path-limited search stops at a rename), and read the commit
   that removed it; no commit in a full clone means it was never there, and the port is an
   addition. A diff shows that the estates differ; only history shows
   who decided (two instances on 2026-10-01: assertions one estate had deleted on purpose were
   restored in the other and removed again at review).
3. **Measure at the close.** The activity closes only when neither number is above the baseline
   and at least one is below it (or both are zero), and every shared file that grew more
   divergent is named in the close record with its reason: phenotype by nature (an
   estate-specific worked instance), or a defect owed to a named seat with its cure.
4. **Say the two measurements** beside the buffer counts in every close report of a two-estate
   activity.

## The owner's word

2026-09-30, verbatim: "All activities involving both estates MUST leave them more aligned and
less divergent than they were before those activities." Earlier the same day, of the six
consolidation skills that differed between the estates: "the divergence itself is a defect to
fix in both estates."

## Worked instance

The two-estate consolidation of 2026-09-30 (Hawthorn binds Bracken, b3f117) measured only at
its retrospective, after the owner's word: 388 shared paths, of which 156 differed by 7,444
lines at the open and 147 by 7,204 lines at the close of the consolidation itself. Eight shared
files had grown more divergent during the day, most through a paragraph written into one
estate only or wrapped differently in the two; the seat unified the text that was its own at
the retrospective and named the residue, with each file's reason, in the retrospective report
[`2026-09-30-two-estate-consolidation-retrospective.md`](../reports/agentic-engineering/2026-09-30-two-estate-consolidation-retrospective.md),
which also carries the measure as a script. The two main branches differed by 210 files and
11,899 lines the same day: the inherited backlog, not the session's.

## Capability parity

Alignment is of capability as well as text. The owner, 2026-10-01, asked whether JC.net adopts two
OCE tooling families, verbatim: "This shouldn't be a question, we are bringing both estates to the
same level of capability, anything useful that one has must make it to the other." When one estate
holds a useful capability the other lacks, the question is how and in what order it travels, never
whether: the exchange register (PDR-125, PDR-142) opens the row and the lane, and the measure above
reports the shared paths while the register reports the capabilities.

## Enforcement

Behavioural at the open and the close; the close report names the two measurements, and a
two-estate activity whose close record lacks them is not closed. Owed: an `agent-tools`
command that computes the measure from two roots, unit-tested on injected file maps and never
on the live trees, so a seat runs one command instead of a script.

The numbers are evidence of alignment, never its goal. A shared file is unified only where the two
estates hold one lesson in two wordings; a lower count bought by stripping an estate's specifics is a
loss, not a gain (owner, 2026-10-01: knowledge preserved, discoverable and accessible is the test, and
ceremony or a count serves it or goes).

## Related surfaces

- [`replace-dont-bridge`](replace-dont-bridge.md): the single-estate form.
- [`consolidate-until-done`](../skills/knowledge/consolidate-until-done/SKILL-CANONICAL.md):
  the completion contract the two measurements join for a two-estate consolidation.
- [`verify-dont-trust`](verify-dont-trust.md): the measurement is computed, never recalled.
