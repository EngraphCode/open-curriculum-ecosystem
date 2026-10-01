---
name: CLI Writer Boundary Discipline
polarity: pattern
use_this_when: A command-line tool or hook is about to write a file whose path, name or content comes from a caller, a flag, an environment variable or another process — apply the three cells before the first pull request, not after review finds them
category: code
proven_in: agent-tools (the collaboration-state and comms writers cured at PR #55 rounds four and five), 2026-09-13
proven_date: 2026-09-13
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: "A file writer under a caller-supplied name ships with a truncating write that destroys the file it was meant to update on a crash, or follows a symbolic link the caller planted and writes through it, and each is found one review round at a time"
  stable: true
---

## Principle

A writer that puts caller-supplied bytes at a caller-influenced path sits on a trust boundary,
and three properties are decided there or never: the name is validated at the boundary, the
write is atomic, and no link is followed. Each was found separately in review (PR #55, rounds
four and five, 2026-09-13), so the pattern states them together for the next writer to carry in
its first pull request.

## The three cells

1. **Validate names at the boundary.** A path segment from a flag, an event body or an
   environment variable is checked against a closed grammar before it joins a path: no
   separators, no traversal, no empty segment, a bounded character class. The refusal names the
   rejected value. (The `security-expert` and `code-expert` templates already carry this cell.)
2. **Write atomically.** Compose the whole content, write it to a sibling temporary file in the
   same directory, `fsync`, then rename over the target. A truncating `writeFile` on the target
   leaves an empty or half-written file when the process dies mid-write, which broke
   resumability of a state file once (round four).
3. **Never follow links.** Before writing, `lstat` the target and refuse a symbolic link (and
   refuse to create through a linked parent); an `O_NOFOLLOW`-shaped seam in the writer is the
   test-injectable form. A planted link makes a benign writer a write-through to any path the
   process can reach (round five).

## Shape in agent-tools

- The three cells live in one writer module the CLIs share, with the `lstat` and rename seams
  injectable so the behaviour is proved in process without real IO
  (`tests-prove-behaviour-no-io-no-spawn`).
- A new CLI that writes files under a caller-supplied name cites this pattern in its TSDoc and
  ships the three cells in its first pull request; the reviewer templates check for them.

## Relationship

- `security-expert` §Input handling and injection risk and `code-expert` §Security: the
  boundary-validation cell, already stated there; this pattern adds the two write-time cells.
- `important-state-not-in-temp-files`: what the writer protects is state that matters.
- `exit-codes-in-band-never-piped`: the writer's refusal is an exit code the caller reads.
