---
name: user-value
classification: active
description: >-
  Define how use value is expressed, implemented and assessed across purposes,
  needs, experiences, capabilities, contracts and delivery work. Use when the
  usefulness of a service, product, tool, API or component, or its contribution
  across levels, is unclear. Good: connect a consumer's purpose to a bounded
  guarantee and appropriate evidence. Bad: rename features as needs or treat
  local correctness as proven wider benefit. For settled implementation,
  statistical evaluation design or scheduling, use specialist methods.
---

# Express and implement use value

Make the connection between intended usefulness, circumstances of use,
capabilities and delivery work explicit enough to design, challenge and improve.
Use value here means what a person or consuming system can use a provision to
accomplish, under stated conditions, costs and limits. A system consumer is a
functional role, not a person with feelings or independent moral standing;
keep affected people's interests visible where consequential.
Use this for a new definition or an audit and repair of existing material.
Preserve useful work and stable identifiers. Do not produce a mandatory stack
of documents or force every kind of use into a human-service journey.

Read [the value model](references/value-model.md) for entity and relationship
semantics, evidence states and the worked example. Read
[journeys and stories](references/journeys-and-stories.md) when mapping
experience, slicing work, or checking readiness. These are reference views of
one method, not separate required outputs.
Read [levels and implementation](references/levels-and-implementation.md) when
connecting value across a product, service, tool, API, component or primitive.

## 1. Establish purpose and authority

Name the intended beneficiary or consumer, situation, desired change, boundary,
owner direction and intended use of the output. Separate the whole service or
system from the part this team can change. Read governing sources before relying on
them; an index is navigation. Preserve existing scope and contrary evidence.

Distinguish:

- the owner's purpose or required constraint;
- a need supported by research in a stated population and context;
- an assumed need or opportunity being explored;
- a proposed response and the value it might offer;
- observed delivery, experienced value and demonstrated impact.

Innovation can offer value people have not previously requested. Describe that
as a proposition to explore, with an honest claim boundary. Do not invent
research to legitimise it or reject it merely for lacking a pre-existing need.

## 2. Inspect before structuring

For existing work, identify each item's current role and source: need, journey,
story, capability, contract, implementation, enabling task, constraint, outcome
claim or evidence. Record
whether it is retained, refined, split, merged or retired, with correspondence
from old IDs to new ones. Do not discard substantive exceptions or reclassify
uncertainty as fact during a rewrite.

Ask whether the problem is missing structure, missing evidence, a contested
value, or an unsuitable response. A polished backlog cannot answer all
four. Use `concept-exploration` for an unformed concept, `parallax-frame` for
materially contested boundaries or perspectives, and `metacognition` at a
point where the inherited shape may be doing the thinking.

## 3. Define needs, offered value and commitments

Select the relevant views and levels first. Purpose, experience, capability,
contract and implementation are different questions, not mandatory rungs in a
single hierarchy. Work down from purpose to needed provision, and back up from
an existing capability to its actual consumers and possible uses. At each
material boundary name who uses what, to accomplish what, under which
conditions, and how that usefulness could be observed. Unknown downstream use
remains unknown; do not fabricate a social-impact chain for a reusable library.

For human use, identify people who use, provide, support or cannot access the
provision. Keep
their needs distinct from organisational targets. Express each material need
as the person's goal and reason in context, without prematurely selecting a
channel or implementation. Record source, scope, evidence status and what
would revise it. Never fabricate participant words, emotions or prevalence.

State the bounded value proposition: for whom, what useful difference,
under which conditions and limits, with what responsibility. Separate what the
provider or component controls from a longer-term outcome it aims to influence. Name
material costs, burdens, rights and adverse effects, including who bears them.
Keep value conflicts visible; a single aggregate metric cannot settle them.

## 4. Map experience across boundaries

Use a journey where a person's experience over time is consequential. For a
technical consumer, use a usage scenario, interaction or composition view
with inputs, state, results, failures and caller obligations. Preserve its
relationship to human experience when known; these views are not interchangeable.

For human journeys, map the person's trigger, before/during/after activity, meaningful ending,
channels, other people, waiting, decisions, help and recovery. Mark the map as
observed, proposed or mixed; on a mixed map label the status at each material
stage. Keep proposed improvements distinct from reported experience.

Attach needs to the stages where they arise. Include exclusion before entry,
unsuccessful endings and effects on support providers. Separate substantially
different journeys when evidence or design consequences warrant it; use shared
stages plus variants where they communicate the differences clearly. Do not
mistake a mode, screen flow or technical call sequence for the whole journey.

## 5. Derive bounded delivery work

Choose changes that let a named actor or consumer accomplish something valuable
in that context. Use stories, capability slices or enabling tasks as appropriate. State actor, change and purpose; the familiar "As a / I need / so
that" form is optional. Link each story to needs and journey stages, or state
the enabling or opportunity rationale when no direct user-need link exists.

Slice by independently observable useful outcomes, preserving a coherent
experience. Do not slice merely by database, API and UI layers when delivering
a human experience. A reusable component can itself be a useful delivery unit
when it has a real consuming role, coherent guarantee and independent acceptance.
Record supporting technical/operational contracts as dependencies or enabling work,
with their own consumers and guarantees. A tiny algorithm does not require an
invented citizen persona or a direct causal promise about national outcomes.

For each candidate include:

- immediate value, scope and relevant starting conditions;
- observable acceptance outcomes, including consequential failure/recovery;
- a proposed proof or observation method and evidence limits;
- dependencies, authority and unresolved choices that affect readiness.

Distinguish candidate, ready, implemented and accepted. A better-written story
is not automatically ready or accepted. Use the existing project's vocabulary
where it already makes these distinctions. Keep broad capabilities as parent
items until useful independently assessable slices are known.

## 6. Connect delivery with outcomes without claiming the bridge

Link implementations to the contracts they realise, contracts to the
capabilities they enable, and capabilities to their uses. This correspondence
may be many-to-many, conditional or partly unknown. Check composition at the
boundary: correct parts can still leave the consuming workflow unusable.
Do not turn refinement, dependency or conformance links into causal claims.

Explain why the proposed provision could produce useful outcomes, under which
assumptions and alternatives. Retain the difference between software
conformance, observable service behaviour, usability, experienced value,
outcome measurement and causal impact. For a consequential bridge, name its
scope, mechanism, uncertainty, possible defeater and suitable evidence.

Trace in both directions: from delivery work to its value rationale, and from each
important need or commitment to coverage or an explicit gap. Use typed links
from the reference, not an unexplained generic "supports" edge. Several needs
can occur in one journey and several stories can address one need. Traceability
is neither a causal proof nor permission to read or change a linked record.

Route unresolved evidence-method design to `parallax-design-inquiry`, controlled
experiments to their specialised skills, and reconciliation of conflicting
evidence to `parallax-synthesise`. Do not invent a sample size, success threshold
or statistical design just to complete a story card.

## 7. Review and return

Challenge the model from the beneficiary or consumer, provider and delivery
perspectives. Ask whose burden or exclusion the happy path hides, whether a
constraint has been disguised as a need, whether a locally accepted story can
still leave the journey or consuming workflow broken, and whether claimed impact exceeds the
evidence. Use `parallax-audit` when consequential reliance warrants a separate
challenge; label same-context review honestly.

Stop when the requested scope has coherent definitions, material relationships,
explicit gaps and a usable next action. Do not force every uncertainty closed
or expand the task into implementation or research recruitment. Return:

1. The user-value model, selected levels and authority/evidence limits.
2. Relevant journeys, usage scenarios, capabilities, contracts or story candidates.
3. Traceability, migration decisions and uncovered needs.
4. Acceptance observations, outcome hypotheses and discriminating next research.
5. Review performed, limitations and reopening conditions.

Update the owning documents and affected navigation once. Hand selected ready
slices to `plan`; preserve unresolved research and authority questions. Reopen
the model when use evidence, a material dependency, the consumer context or
an outcome claim changes. Do not silently rewrite skills from a single use.
