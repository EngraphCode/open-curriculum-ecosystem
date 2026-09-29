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

## From the napkin rotation of 2026-09-29 (Wick binds Temper, ed7b48)

Each source entry is in `archive/napkin-2026-09-29.md` under its date.

- **Background agents are read, not assumed.** A usage-limit pause ends in-flight subagent
  reviews with no signal (three on PR 239, four on PR 246), and a returned in-process agent stays
  alive until stopped though no process listing shows it (the owner, 2026-09-27: "you have
  several subagents running, stop them then stop again"). After any pause and at every close,
  read the agent list: relaunch the dead, stop the returned.
- **zsh reserves `path` and `status`.** A loop variable named `path` replaced PATH, every later
  command was "not found", and two thread replies did not post (2026-09-26). Never name a shell
  variable `path`, `status`, `argv`, `options` or `cdpath`; read state back after a scripted write.
- **A scratch script is unproven until it guards itself.** Five failures in four days: a lockless
  queue runner admitted a second instance, a door script died on a quote before its cleanup, two
  derived scripts kept their sibling's text or dropped a step, and heartbeat loops failed silently
  into their own logs. The owner's word of 2026-09-29 is the cure: a Monitor or a tracked tool, not
  an ad-hoc script. Where a script is unavoidable, lock it, `bash -n` it, diff it against its
  sibling, and send its failures to the stream.
- **knip refuses an exported type whose only consumer is its own module**, even where the export
  looked necessary (three refusals across two lanes, 2026-09-25 and 09-26). Keep the type local or
  inline it; export it where its second consumer is.
- **A full-command-line process listing can print another tool's credentials** (`pgrep -fl`,
  2026-09-28). List by pid and command name; read the arguments of the seat's own processes only.
- **Slips cluster at the start of the next act as well as at the finish.** Five in one window on
  2026-09-28, one a PDR-052 reading of 61 percent written as allowing directive edits. Before an
  act that takes a slot, cites a number or a sha, or edits a directive, re-read the last stated
  rule and each source, and write the reading with its comparison ("10.1 % < 30 %: pass").
- **A required check that fetches from the network at build time fails on the network, not on the
  head.** The demo hub's `next build` fetched Google fonts inside CI and failed twice in three
  hours on pure syncs, green on re-run (2026-09-28). Vendor the faces (`next/font/local`) so the
  verdict depends only on the head.
