---
fitness_line_target: 200
fitness_line_limit: 400
fitness_char_limit: 24000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else graduate, then archive to a dated file proven byte-identical — never before full processing, never split/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---

# Next-Session Record — `oce-rearchitecting-programme`

Thread identity: the review, correction and merge of pull request #356 (the retained-framework
rearchitecting programme, ADR-233) and the integration of that planning body with the estate's
plan nodes, architecture documents and directives. Opened 2026-10-13 at the owner's word; the
session title he set is "Rearchitecting Plan Review and Integration". The claim is `b13d5c39`
(role reviewer).

## Participating agent identities

| agent_name             | platform    | model            | session_id_prefix | role                                                   | first_session | last_session |
| ---------------------- | ----------- | ---------------- | ----------------- | ------------------------------------------------------ | ------------- | ------------ |
| Walrus seeks Maelstrom | claude-code | claude-fable-5-1 | 9585cc            | reviewer at n=1; the owner-interface directly (no Director seat held) | 2026-10-13    | 2026-10-13   |

## Current Continuation

- Branch: the pull request's branch `docs/oce-rearchitecting-programme`. Since 2026-10-17 it carries,
  over the pull request's own head `SHA:5d6af55fd`, the forward merge of `engraph` `SHA:43b444c4e`
  and seven correction commits by concern (`SHA:aa230f5e8` packages node, `SHA:25a832644` ADR-233
  status, `SHA:289fde234` pipeline page and boundary, `SHA:8f894503c` neutral labels,
  `SHA:455d5f2d7` hold wording, `SHA:a43e36ae1` strategy line, `SHA:4188ed7fa` indexes). The seat's
  four earlier local commits and its uncommitted batch of 2026-10-14 were dropped at the owner's
  word of 2026-10-17 and are held on the local ref `archive/pr356-seat-work-2026-10-17`, never
  pushed. Records land on the live coordination branch.
- Invocation pointer: continue from this record. Treat every live fact as a hypothesis until `gh`
  and `git` confirm it.
- Controlling plan: none ratified. ADR-233 (on the branch) is the accepted direction by the owner's
  commission; the strategic node `oce-rearchitecting-programme` and the fourteen `oce-*` delivery
  nodes are sketches by their own stamps.
- Next safe step: none on this lane. Pull request 356 merged on 2026-10-17 at 15:01Z as
  `SHA:493951ad7` on `engraph`, by the bot at SETTLE-READY (the Codex connector's review bound to
  the tip, the quiet window elapsed, GitHub CLEAN, every check green, no open thread). The branch is
  retired on the remote and locally; the lane worktree is removed. What remains is not this lane's:
  the dedicated architecture session on points 1, 2, 3 and 7 of the ADR-233 analysis before any
  adoption; the merge tool's owed-ness derivation (its Copilot leg read OWED on this tip under a
  ruleset that reviews once per pull request; on the register with the instance); the plan-schema
  owner-gate question under PDR-100 (on the register). Two local refs stay on this machine for the
  owner's word: `archive/pr356-seat-work-2026-10-17` (the seat's dropped commits and batch, never
  pushed) and the retired `coordination/2026-10-05-efe69f` carrying `SHA:93363641a`, whose content
  is `SHA:25e898e18` on the successor branch.
- Completed prerequisites: the full grounding; the first-hand read of every line the pull request
  adds or changes; the three reviewer findings on its head read.
- Team expectation: n=1 unless the owner seats others; no Director seat is held in the estate.
- Acceptance bar: #356 merged by the door when clean and green (the owner, 2026-10-17: "Merge has
  never and will never be at my word, if it is clean and green it gets merged"); the hold stated
  as adoption, not merge, wherever the pull request states it; the three reviewer threads
  dispositioned; points 1, 2, 3 and 7 of the ADR-233 analysis carried to a dedicated architecture
  session with the owner before any adoption.

## The owner's words, verbatim (2026-10-13)

- At seating: "take your time to come up to speed on the repo in general, then stop. Do not adopt
  any work yet, do not assume you know what work is happening next."
- At the rename: "We are going to review, correct, and merge [#356]. There is a chance it is
  perfect and does not require correction. That is not likely. As a first step read the PR and the
  content, understand why it exists, what the intended impact is. Reflect, report, then stop. After
  that will will plan further steps. Do not rush to action, we are not acting, or planning yet, we
  are not even synthesising, this is early discovery only."
- After the discovery report: "Merge is not blocked on the corpus being added, but adoption is.
  You are always permitted read-only access to Oak github, write access is forbidden for now,
  that will change at a later date. Read the other PR. Reflect on how we get this planning body
  properly integrated and cohesive and cogent."
- Then: "Before that, prepare for compaction, that is the priority for now. Post compaction we
  will continue."

## The owner's words, verbatim (2026-10-14 and 2026-10-17)

- 2026-10-14: "Oak GitHub is read only, until I say otherwise, obviously you can use GitHub";
  "Reviewing agents are NEVER a source of authority, they are ALWAYS a source of information to
  critically evaluate. ALWAYS"; "Your job is to get the PR into a mergeable state, and make sure
  that the plans make sense in context. Your job is NOT to be altering ADRs or PDRs independently
  of a conversation with me"; "Merge and adoption. I just meant we can merge these files without
  acting on them yet".
- 2026-10-17, on the Cardinal Rule question: "I can't be definite about a thing I know nothing
  about, I cannot distinguish fiction from misunderstanding. What I can say is that ALL Practice
  repos practice 'strict, everywhere, all the time' and 'never disable checks, never disable
  safeguards', and I would never argue to add complexity or 'special cases'"; on the names:
  "Don't name Clef or Dait, not yet, if you need a label you can say something like 'exploratory
  pedagogy project' which is accurate but neutral"; on merging: "Merge has never and will never be
  at my word, if it is clean and green it gets merged"; on numbering: "When we have an ADR
  numbering clash, or anything similar, the numbering from the Oak branch wins and the Engraph
  numbering is updated to accomodate"; on the review tooling: Copilot now triggers once per pull
  request, and merge-tool assumptions coupled to that configuration "are considered design bugs
  to fix".

## What the pull request is (the discovery, compressed)

- Authored on 2026-10-10 by Codex under the owner's account (co-author trailers), executing the
  consolidation brief revision 0.6 in full: desk research, design, review, correction and
  incorporation. Three commits; head `SHA:5d6af55fd`; every check green; the owner marked it ready
  on 2026-10-13 at about 11:00Z and commented that it partners with Oak pull request 1000.
- Its spine is ADR-233, amending ADR-227: OCE stays the full capability innovation framework;
  every mechanism and anything potentially reusable stays in OCE; external apps are
  configuration-only instances over published packages; ordinary behaviour change needs no OCE
  edit or release; CF-first without an all-CF gate; layered curriculum and domain models; integrity
  from source to consumer; Castr integration settled in direction, qualified before reliance;
  search operations separately scoped; the invariant set open.
- It adds five architecture documents (architecture and invariants I01–I21; configuration
  contracts; CF reconstruction with the ten-workspace disposition and the unratified N01–N12
  proposals; integrity and Castr with the Clef C-DATA and C-PRIV obligations; wider capabilities
  B01–B16 with four contract records), an instance guide, three reports (route, review record,
  source dispositions), one strategic node and fourteen `oce-*` delivery sketches.
- It supersedes the extraction-first route: `toolkit-re-architecture` and
  `oak-open-curriculum-mcp-extraction` marked superseded; `toolkit-publish-mechanism` returned to
  sketch; dated amendments on `public-packages-release`, `reliable-atoms-programme`,
  `innovation-kit` and three delivery nodes; the README, VISION, CONTRIBUTING, the architecture
  index and the OpenAPI pipeline page rewritten in part.
- Its own text, in four places, says merge and adoption wait on the Education corpus being
  incorporated and analysed repo-locally. The owner's word of 2026-10-13 settles it: merge is not
  blocked on the corpus; adoption is. Those four places need the corrected statement.
- Its sources: the owner's private library editions (named by title and revision in the CF
  reconstruction §8 and the source dispositions), Engraph at `SHA:efe69ff66`, Oak main at
  `SHA:2a7773837`, Oak pull request 1000 at head `SHA:1af97fbc4` (its proposed Oak ADR-231, a
  five-repository topology), and Castr at `SHA:851c7efee` (specification v0.4.1, draft).

## Reviewer findings on the head

- Codex, P1, on the architecture page's I07 and the OpenAPI pipeline page: contract authorities
  other than the Open Curriculum OpenAPI schema are admitted, which contradicts the Cardinal Rule in
  AGENT.md and principles; the pull request amends neither directive.
- Copilot: `public-packages-release` keeps `status: ratified` and its clock-group outcome while
  the new amendment says one version per repository.
- Copilot: the review record's closing disposition reads as clearing the corpus-first adoption
  gate the same record says governs.

## Hypotheses held for the review (unverified at this block)

- Dait, Clef and TAB appear nowhere in the repository before this pull request and are never
  defined in it; whether those names belong on a public surface is the owner's to say.
- The pull request removes every measured-rate and size instrument from the CF delivery node by the
  brief's "no team measurement"; the estate prices rounds and sizes at routing (PDR-132, PDR-140).
  A tension between the commission and standing doctrine, not an error in either.
- The Cardinal Rule names one authority while the estate already runs the bulk surface against
  upstream's bulk JSON Schema (ADR-222 and the bulk-schema skill); the Codex finding may point at a
  directive already stale on one surface. Verify at ADR-222 before dispositioning.
- Factual claims about the baseline to verify first-hand: the release configuration disables npm
  publication; the root-version read at import in the env package; the hard-coded search aliases;
  no Castr dependency in any manifest or lock; 33 manifests, 32 private.
- The pull request resolves two of the four expired owner gates by superseding the extraction
  plan; the gates on `semantic-search-showcase` and `warranted-means-in-the-operating-environment`
  are untouched.
- Smaller: ADR-233 sits above ADR-001 in the index; the body's review scope and budget do not use
  the estate's intake line; the strategic node serves a strategy choice not yet confirmed to exist;
  the repository README carries Oak's badges and public-beta line above a new Engraph programme
  section.

## Verdict of 2026-10-13 (post-compaction read of the whole body)

Sensible at the direction and design altitudes; incomplete at the integration altitude. The
direction is the owner's own and matches his public reply on Oak pull request 1000 of 2026-10-10.
The design is internally coherent, and every baseline fact it rests on was verified first-hand at
`SHA:efe69ff66`. The corrections, each with its warrant:

The corrections as re-landed on 2026-10-17 from the pull request's own head, each at its word:

1. The hold: adoption, never merge, wherever the pull request states it, the owner quoted in the
   strategic node and the programme entry; README and VISION read the accepted direction, the
   word of ADR-233's status line (`SHA:455d5f2d7`; the pull request body the same at the push).
2. The strategy index: a dated line of 2026-10-10 in ADR-233's own words and the owner's
   (`SHA:a43e36ae1`).
3. The Cardinal Rule: the pull request had rewritten the pipeline page away from the directive
   (regeneration no longer sufficient, consumer changes still required, no type widening gone);
   one generator under the Codex P1, the page and ADR-233's silence on ADR-029/030. The owner's
   word of 2026-10-17 settles the page: the directive governs, the page returns to engraph's
   wording with the pull request's Castr paragraph kept (`SHA:289fde234`). How ADR-233's
   decision 6 and invariant I07 read against ADR-029/030 goes to a dedicated architecture
   session before adoption, with points 1, 2 and 7 of the ADR-233 analysis.
4. The consumer data boundary paragraph: restored at the owner's word of 2026-10-13 ("fix this,
   all Oak systems are no go"), with the two sources the estate already reads beside the API
   under ADR-222 and ADR-157/173, the raw-CDN rule, and his words quoted; nothing the seat
   authored (`SHA:289fde234`).
5. The names: the two projects appear under "the exploratory pedagogy project" and "the
   curriculum infrastructure consumer" on every surface, at the owner's word (`SHA:8f894503c`).
   The owner's naming of 2026-10-14 (Base Clef, TAB Clef, Dait) is held in the napkin only.
6. `public-packages-release`: title and overview match its own amendment; status stands
   (`SHA:aa230f5e8`).
7. ADR-233 in numeric order in both indexes with the pull request's entry text (`SHA:4188ed7fa`);
   its status "Accepted (as direction, …)" (`SHA:25a832644`).
8. The PR1000 crosswalk: dropped 2026-10-14 ("PR 1000 is not some external authority").
9. The "No team measurement" refrain: left as the pull request wrote it; the trim was the seat's
   taste and not needed for the brief.

Routed, with their homes: the downstream-checkout rule's read clause and the plan-schema
owner-gate question (PDR-100) on the graduation register; the owner's rulings of 2026-10-17 on
merging, on ADR numbering and on the merge tool's coupling on the register with their targets;
points 1, 2, 3 and 7 of the ADR-233 analysis to a dedicated architecture session before adoption.
Withdrawn: the seat's earlier proposal of a standalone boundary ADR and a three-scope rule, which
read the owner's access ruling as product architecture; the ruling has two scopes, Oak GitHub
read-only and every other Oak system off limits, and the downstream-checkout rule is its home.

Checked and left alone: the fourteen sketches' frontmatter, serve edges and supersessions (the
validators pass; the two extraction gates expire with the supersession); the removal of the Size
table (the round budget still binds at authoring per PDR-132); the CF page's plan-id provenance
table (pinned, not a moving target); `serves: TOOLS-2`.

## Lane state

- Owning plan(s): none ratified; ADR-233 and the sketch strategic node on the branch.
- Current state (2026-10-17, 15:0xZ): merged and closed as the bullet above says; the claim
  `b13d5c39` closes with the closeout event; the records are on `coordination/2026-10-16-f1e9d3`.
- Blockers / low-confidence areas: none technical. Standing rulings that bind every seat on this
  lane: reviewing agents are never a source of authority; the seat's job is the pull request
  mergeable and the plans coherent in context, never altering ADRs or PDRs outside a conversation
  with the owner; before any sentence lands the test is whether it is the owner's word, the pull
  request's word or the directive's word; the merge is never at the owner's word; the two
  projects are not named; Oak's numbering wins a clash.
- Promotion watchlist: the register entries named above.

## Re-arm recipe at the resume

Verify by the task list before anything is armed. The watcher is the canonical block in the comms
all-channels watcher rule (the supervisor pid read from the harness session file matched on this
session's id, the timeout binary the host resolves, the platform and model literals, a Monitor at
its 30-minute cap, re-armed on each expiry notification with one sweep since the last event). The
heartbeat is the liveness rule's 4-minute Monitor loop on both legs, comms and claims, armed
while a consumer exists (a sibling-estate seat reading this estate's registry counts; one did on
2026-10-14 and 2026-10-16). Format with the worktree's own toolchain, never the principal's;
commit by pathspec with the audit line; commitlint is strict.
