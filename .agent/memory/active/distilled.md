---
fitness_line_target: 120
fitness_line_limit: 180
fitness_char_limit: 12000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs (ADRs, PDRs, governance, READMEs, patterns)"
merge_class: curated-learning-register
fitness_content_role: drainable-buffer
fitness_rationale: >-
  Lowered 2026-05-25 after owner-requested processing through `oak-consolidate-docs`.
  The active file carries the conservation role and graduation pointers.
  Falsifiability: if a napkin rotation adds high-signal learning that has no
  stable permanent home, preserve it first and revise the envelope by substance
  rather than trimming the lesson.
---

# Distilled Cross-Session Lessons

A brief staging surface for cross-session lessons between a napkin rotation and
their promotion to a permanent home. An entry lands here only when a rotation
surfaces a lesson that is not immediately homed; it is **promoted on the next
consolidation by judgment** — to a `patterns/` file, a rule, a PDR/ADR, or a
governance doc.

**Promote on the first instance.** We do not hold a lesson here waiting for a
second sighting; we promote it and trust the Practice to invalidate a wrong
promotion through experience (owner direction, 2026-06-27). A lesson sitting in
this buffer does not fire when the next agent needs it — graduation is the whole
point. Apply judgment about *which* home, not about *whether* the lesson has
earned promotion.

New napkin rotations append below; the next consolidation promotes them out.

## Memory surfaces grow because their lifecycles are incomplete (2026-09-17)

Owner, 2026-09-17, verbatim: "we have missing rotation definitions and mechanisms", with the
priorities "drainable buffers to EMPTY, then memory files to an optimised soft" and "the goal is
always to preserve knowledge, never to move towards numerical targets".

**A frame that separates the gaps.** A memory surface's lifecycle has four parts: a *role* (what
the file is for), a *disposition* (what happens to content whose work is finished), a *trigger*
(the moment and the skill step that performs the disposition), and a *proof* (the check that the
act lost nothing). The napkin has all four: capture; rotation to a dated archive; consolidate-docs
step 6; `cmp` against the committed blob. Other surfaces lack one or more.

Read first-hand on 2026-09-17 (the informational fitness readout over the working tree, and the
files):

- **Continuity surfaces have role, disposition and proof, and no trigger.**
  `continuity-practice.md` §Disposition of Continuity Surfaces covers `repo-continuity.md` and
  `threads/*.next-session.md`. Live work stays verbatim; finished work has its insight conserved
  and its residue deleted. The section forbids archive, split, rotate and shard, and embeds a
  runbook with a mechanical losslessness check. No skill or rule invokes that runbook (a grep of
  `.agent/skills` and `.agent/rules` finds no reference), and the fitness signal takes no action,
  so the files grow. By the readout's own counts, `repo-continuity.md` is 806 lines and 73.6 KB
  (critical), the agentic-engineering-enhancements thread record 1,014 lines and 117 KB
  (critical), and the paused mcp-submission-drive record 765 lines (critical).
- **Some surfaces have no disposition note and no instrument coverage.** The
  estate-coordination thread record (3,659 lines by `wc`) and the continuity-memory thread record
  carry no fitness frontmatter and no `overflow_disposition`, so the largest continuity surface is
  invisible to the readout. `frictions-register.md` (4,371 lines by `wc`) has neither, and no
  lifecycle is defined for a friction once cured. `director-handoff.md` (400 lines, hard) has a
  role and no disposition note.
- **"Live or finished?" is asked per entry, with no definition of which parts of a thread record
  are journal.** A thread record mixes live state (the resume point, the board, open work) with
  journal (boundary blocks, landing narratives, session history). Journal blocks are finished by
  construction and their insight is often already homed, so every seat that curates re-derives
  the call; none has an owning moment (a fold's landing, a thread pausing, a consolidation).

**The open design question (the owner's, not settled here).** The directive forbids rotation for
continuity surfaces ("Moving its content elsewhere is not the same as conserving its insight"),
while napkin history rotates to an archive. So either journal-shaped history in thread records
and registers gains an archive disposition with a proof, or curate-and-delete stays the
disposition and gains its trigger and coverage. Either way the missing parts are the same:
per-surface role and disposition notes, a trigger owned by a named skill step, instrument
coverage for every surface that grows, and a proof the act runs.

Candidate homes when promoted: `continuity-practice.md` §Disposition (a directive: careful
analysis first, by the owner's word) with the owning skill step; and a concept node for the
four-part lifecycle (PDR-134 / ADR-221 concept nodes are a graduation target).
