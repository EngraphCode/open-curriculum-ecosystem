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

- Branch: the pull request's branch `docs/oce-rearchitecting-programme`, three commits over
  `engraph` at the fold of #352; corrections land there, records on the coordination branch.
- Invocation pointer: continue from this record. Treat every live fact as a hypothesis until `gh`
  and `git` confirm it.
- Controlling plan: none ratified. ADR-233 (on the branch) is the accepted direction by the owner's
  commission; the strategic node `oce-rearchitecting-programme` and the fourteen `oce-*` delivery
  nodes are sketches by their own stamps.
- Next safe step, in order: (1) at the resume, read the task list first and re-arm the comms
  watcher only if it is absent (§Re-arm recipe); (2) read Oak pull request 1000 read-only, the
  owner's word of 2026-10-13; (3) reflect on how this planning body is integrated, cohesive and
  cogent across the estate, the pull request and Oak's proposal, and report; (4) plan the review
  with the owner; only then correct. Nothing is pushed to any Oak surface.
- Completed prerequisites: the full grounding; the first-hand read of every line the pull request
  adds or changes; the three reviewer findings on its head read.
- Team expectation: n=1 unless the owner seats others; no Director seat is held in the estate.
- Acceptance bar: #356 merged to `engraph` with its corrections; the adoption gate stated the same
  way in every place the pull request states it; the three reviewer findings dispositioned on the
  pull request; the integration question answered with the owner and recorded where he says.

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

## Lane state

- Owning plan(s): none ratified; ADR-233 and the sketch strategic node on the branch.
- Current objective: the discovery is done and reported; the next act is the Oak pull request read
  and the integration reflection, then planning with the owner.
- Current state: the seat at its compaction boundary at the owner's word; claim `b13d5c39` held.
- Blockers / low-confidence areas: none blocking. The Cardinal Rule collision is constitutively
  the owner's decision when it is reached; prepare the two shapes, do not choose.
- Promotion watchlist: the owner's Oak-access ruling is on the pending-graduations register
  (target: the downstream-checkout rule's read clause).

## Re-arm recipe at the resume

Verify by the task list before anything is armed. The watcher is the canonical block in the comms
all-channels watcher rule: the supervisor pid read from the harness session file matched on this
session's id, the timeout binary the host resolves, the platform and model literals, armed as a
Monitor at its 30-minute cap and re-armed on each expiry notification, each re-arm followed by one
sweep since the last event. No heartbeat (the consumer-absent exemption; no peer on the registry),
no cron, no sub-agent, no commit-queue intent.
