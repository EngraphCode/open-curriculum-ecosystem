# The rules and skills system: design

The design the delivery node
[`rules-and-skills-system-design`](../../../plans/delivery/rules-and-skills-system-design.plan.md)
asks for. It is written in parts, one todo at a time. This file holds parts 1 to 3: the unit
model, the contracts and the budgets. Parts 4 to 7 (projections, build and validation,
processes, and how it will be known to work) follow the spike and are not written yet.

It is a proposal. Nothing here is decided until the owner decides it, and the decisions that
are the owner's are listed at the end as questions, each with a recommendation. It designs the
system and not the content of any rule or skill. Which present rule or skill becomes what is
not settled here, and where this document uses the present estate it does so to size a
budget and says "if".

A reader that wrote none of it reviewed the first draft and found it ready with corrections.
The model in part 1 is the reviewer's alternative, adopted, and the reason is given there.

## What it stands on

Each line says how it is known.

| Ground | Standing |
| --- | --- |
| Claude Code is the main concern, Codex the second, everything else reasonable efforts | The owner's word, 2026-11-12 |
| Copied text for each platform is acceptable "as long as we don't end up loading things twice" | The owner's word, 2026-11-12 |
| Rules and skills "must describe current requirements, not the evolution that arrived at them" | The owner's ruling, 2026-11-12 |
| "each rule, skill, and the combined total of the relevant parts, should be well within the identified important thresholds" | The owner's word, 2026-11-12 |
| A rule reaches Claude Code as a one-line pointer, and no output carries a rule's body or, outside Cursor, its description | Read in the code: the [audit](pipeline-audit.md), section 2 |
| A skill's adapter carries its name and description and points to its body as another file | Read in the code: the audit, section 3 |
| Claude Code loads an unscoped rule's text at launch and puts it back after a compaction; loads a path-scoped rule's text when a matching file is read, written or edited; lists a skill's description and loads the adapter on use | Anthropic's documentation, in the [Claude Code loading note](../doing-and-dreaming-2026-11/claude-code-rules-and-skills-loading.md). The first was observed in the habit-text trial's check session. The second was observed once by that note's sub-agent and again in the session that wrote this document. Neither was measured |
| Codex loads the `AGENTS.md` chain from the root to the working directory, a skills listing and hook output, and no mechanism that loads a rule's text as guidance was found | OpenAI's documentation, in the [Codex loading note](../doing-and-dreaming-2026-11/codex-rules-and-skills-loading.md). Nothing was observed in a running Codex |
| In twenty sessions that held only pointers, most rules a session opened were on the subject of its task. Of the 28 rules the first sort calls habits of mind, one was opened in the first ten sessions and two in the second ten | Measured: the [delivery trial](../doing-and-dreaming-2026-11/delivery-trial.md) and the control runs of the [habit-text trial](../doing-and-dreaming-2026-11/habit-text-trial.md). Why a file was opened was not measured |
| Twenty-eight habit instructions delivered as text changed the form of two answers, both on one task of five, and changed no conclusion | Measured: the habit-text trial. One separating instruction against a bar of two set beforehand, so its prediction of no clear difference stands |
| The estate already has a procedure for where a capability lands: by the shape of its payload and by when it must be disclosed | The rule `capability-landing-decision-procedure`, steps 2 to 5 |

## 1. The unit model

### Where the model comes from

The first draft of this part proposed five kinds of unit. The reviewer's objection was that
the five were Claude Code's five containers under new names, that enforcement appeared both
as a kind and as a property of other kinds, and that the estate already has the two axes that
matter. The objection holds, and the simpler model is used here.

The estate's rule on landing a capability asks two things of a payload. Is it "a standing
invariant small enough to afford in always-loaded context, or a multi-step procedure that is
not"? And when must it be disclosed: "Always in force, loaded on a trigger, or consulted at
dispatch?" It assigns
"enforcement that must hold with zero context" to a hook or validator, and pairs a procedure
that must always be in force with an invariant that points to it.

That model is sound and is kept. What it lacks is what the audit and the trials found
missing: the invariant's text is not delivered, nothing bounds a unit's size, and a unit's
reasons live in the same file as its instruction. The model below adds those three things and
nothing else.

### Two kinds of unit

| Kind | What it is | How it must reach the agent |
| --- | --- | --- |
| **Instruction** | A requirement stated in a few sentences: what to do, and when | As text, in context without anyone choosing to open it |
| **Procedure** | The steps of a named activity | As a listed name and description that select it, and a body loaded when it is selected |

These are the present rule's "invariant" and "procedure". On Claude Code they are what a rule
and a skill are for. On Codex, by its documentation, a procedure is a skill and an
instruction has one home, the `AGENTS.md` chain.

### Four things a unit declares

| Attribute | Applies to | What it says |
| --- | --- | --- |
| **Record** | every unit, required | Where the unit's reasons are kept: the ruling, the incidents, the evidence, the history. A record is never loaded into a session |
| **Place** | an instruction, optional | The paths where the instruction applies. An instruction with a place is delivered when the place is touched, on a platform that can do that, in place of being present from the start |
| **Check** | any unit, optional | The code that enforces the requirement: a hook, a gate, a lint rule. A unit with no check is advice |
| **Pair** | an instruction and a procedure, optional | That the instruction is the always-present half of a procedure, as the present rule's companion pair is |

### What follows from it

1. **An instruction is text and not a pointer.** Its declared text is what the platform
   delivers. This is the one change to what a rule is.
2. **A unit's reasons leave the unit.** By the owner's ruling history does not belong in a
   rule or a skill. The record is where it goes, with the evidence and the argument. Dated
   lines appear in 110 of 124 rule files today; a dated line is this seat's proxy for
   history, and the ruling is the owner's.
3. **A requirement that must hold has a check.** The habit-text trial is the evidence that
   delivered text is not enough for that. A requirement whose only form is a check, with no
   text beyond the sentence a refusal prints, is code and not a unit of guidance. Building
   checks is outside this plan.
4. **Place narrows presence and is not a third kind.** An instruction that applies in one
   part of the repository is the same kind of thing as one that applies everywhere. Whether
   a platform can deliver it at the moment its place is touched is a fact about the platform,
   and part 4 says what each platform gets.
5. **One home for each instruction.** It is written once. The build copies it to each
   platform, and it reaches no platform twice.

### What the model leaves alone

- **Sub-agents.** The present rule lands "judgement consulted at dispatch" as a sub-agent.
  This design does not change that.
- **Hook output.** A session-start hook prints text into a session on both platforms. It is a
  third always-present surface. This design does not move guidance into it, and part 4 states
  what it carries today so that nothing is counted twice.

### What the sort did and did not establish about the present estate

Stated so that the budgets below are not read as a sort of the content.

- The first sort of the 124 rules, from their descriptions, by one reader, found 28 habits of
  mind, 90 rules tied to a named activity and 6 that only point elsewhere. It is marked
  provisional. A second reader, without sight of the first, found 27, 92 and 5, and the two
  agree that 22 rules are habits.
- Neither sort counted standing constraints, such as a rule against disabling checks. The
  second reader reported that the three categories have no place for one. Under this model
  such a rule is an instruction with no place, like a habit. So the number of always-present
  instructions is not known, and the 28 is a floor.
- No count exists of how much of the 2.2 million characters is record. It is not claimed
  here.

## 2. Contracts

A contract says what a unit must declare, what it promises a reader, and what it must not be
relied on to do. The lengths are in part 3.

### Instruction

- **Declares:** a name; the instruction text; its record; its place, if it has one; its
  check, if it has one; its paired procedure, if it has one.
- **Promises, with no place:** on Claude Code the text is in context when a session starts
  and is put back after a compaction. By the documentation, and observed once at the start of
  a session. On Codex the text is in the root `AGENTS.md`, which Codex loads. By the
  documentation; not observed. That it arrives once on each platform is what the build must
  guarantee and the spike must show.
- **Promises, with a place:** on Claude Code the text is delivered when a file in its place
  is read, written or edited. By the documentation, and observed twice in passing. On Codex
  no mechanism that delivers text when a file is touched was found. Codex's documented
  mechanism bound to a place is an `AGENTS.md` in a directory, loaded when the session's
  working directory is at or below it. What Codex gets is for part 4, and the least it can
  be is nothing.
- **Must not be relied on to:** change what an agent concludes, or act at a particular
  moment. A requirement that must hold has a check, or is a step of a procedure the agent is
  in.

### Procedure

- **Declares:** a name; a description that says when to use it; a body; its record; its
  check, if it has one; its paired instruction, if it has one.
- **Promises:** on both platforms the name and description are listed when a session starts,
  and the body is available when the procedure is selected. By the documentation of both;
  the listing was observed on Claude Code, where each of forty sessions listed the estate's
  78. Both platforms document that descriptions are shortened or left out when the listing is
  over its budget, so the first promise holds only inside the budget.
- **Must not be relied on to:** be selected. In forty sessions no session called a skill, on
  tasks that included a commit and a review comment. Whether that is the listing's size, the
  tasks or the read-only tool set is not known.

### Record

A record is not a unit. It declares nothing and is named by the units it stands behind. It
promises that the reason for a unit can be found from the unit. An instruction that exists
only in a record is delivered to no one.

## 3. Budgets

### The thresholds, and how each is known

From the vendors' documentation, except T10. The two loading notes recorded them, and each
was then re-read at its vendor page on 12 November 2026, as the plan's first-principles check
asks: [`threshold-reread.md`](threshold-reread.md), every quotation fetched raw. Eight were
confirmed as recorded. T2 counted the wrong fields and is corrected below. The character
figure the first draft gave for T4 is not the vendor's. The re-read also changed what window
the thresholds are taken at, which is the paragraph after the table. Where characters are converted to tokens, four characters to a token is
used, which is the repository's own estimate. The habit-text trial measured fewer for
instruction text, about 2.4 to 2.7, and where that matters it is said.

| # | Threshold | Value | Platform | Known how |
| --- | --- | --- | --- | --- |
| T1 | A rule file loaded on demand, each file | 40,000 characters on a 200,000-token window; 150,000 on a 1,000,000-token window for current models | Claude Code | Documented, re-read |
| T2 | One entry of the skills listing: a skill's `description` and `when_to_use` together | 1,536 characters | Claude Code | Documented, re-read. The name is not said to count |
| T3 | A skill's description | 1,024 characters | The Agent Skills specification | Confirmed at the specification's site. Neither vendor's skills page restates it; both link the specification. The repository's code names it in a comment and checks it nowhere |
| T4 | The skills listing, all entries together | 1 % of the window by default, with "a fallback of 8,000 characters". This repository sets 3 %. By this seat's arithmetic at four characters a token: 3 % is about 24,000 characters at 200,000 tokens and about 120,000 at 1,000,000 | Claude Code | The fraction and the fallback are documented, re-read. The vendor gives no conversion to characters. Whether skills from plugins and the harness draw on the same budget is not said |
| T5 | The skills listing, which on Codex also carries each skill's path | 2 % of the window by default; 8,000 characters when the window is unknown; at most 10,000 tokens if set. By this seat's arithmetic: about 16,000 characters at 200,000 tokens and about 40,000 at 500,000 | Codex | Documented, re-read. One model's window is stated, at 500,000 tokens; no figure was found for the others |
| T6 | A skill's body kept through a compaction | 5,000 tokens each, 25,000 in all | Claude Code | Documented |
| T7 | One read of a file | 25,000 tokens, and a partial view beyond it; a whole file over 256 KB is refused | Claude Code | Documented, re-read |
| T8 | The project documents, the `AGENTS.md` chain | 32 KiB. One vendor page says together, one says each file, one says neither | Codex | Documented, and unresolved between pages |
| T9 | The documentation's own advice | under 200 lines for a memory file, under 500 for a skill body | Claude Code | Documented, as advice |
| T10 | The context at a session's first call | 39,300 to 39,600 tokens in twenty headless control sessions with four tools; 42,250 with the 28 habit instructions as text | Claude Code | Measured |
| T11 | A warning when instruction files together pass a combined limit at session start | no value given | Claude Code | Documented without a number |

For the total of always-present text on Claude Code the documentation gives a warning with no
number (T11) and a refusal at 4 MiB a file. So that budget is set against the Codex limit the
same text must fit (T8) and against what a session carries (T10), and the spike records
whether the warning appears.

**The window the thresholds are taken at.** Four thresholds scale with the context window.
The loading notes took them at 200,000 tokens. The re-read found that Claude Code's current
models "run with the 1M window by default", and that one Codex model is stated at 500,000
tokens. So two readings exist, and the budgets below give both: the **smallest documented
case**, a 200,000-token window on either platform, which still applies to older models and to
a model Claude Code does not recognise; and the **current defaults**, 1,000,000 on Claude
Code and 500,000 on the one Codex model stated. Which of the two the owner means by "the
identified important thresholds" is question 3.

### The rule for "well within"

The owner's word is "well within the identified important thresholds". This design reads it
as **half or less of the smallest threshold that applies**. Where a threshold is a platform
default the estate has overridden, the overridden value applies. Where a threshold scales
with the window, the budget is given at both readings and question 3 chooses. Where no
threshold is documented, the budget is marked as this seat's choice.

### What is proposed, beside what is there now

The present measures are computed by the script in the appendix. Medians are the lower middle
value.

| Budget | Proposed | Against | Present measure |
| --- | --- | --- | --- |
| **B1** One instruction with no place | 300 characters | This seat's choice: no threshold. With B2 it allows about 26 instructions at full length, or more that are shorter | If the first sort's 28 habit rules were instructions as their descriptions state them: median 205, longest 793, and 7 over 300 |
| **B2** All instructions with no place, together | 8,000 characters | T8 at its stricter reading: a quarter of 32 KiB. Against T10 the cost is larger than the character count suggests: 6,859 characters measured about 2,900 tokens net, so 8,000 is about 3,400 tokens, 8 to 9 % of a first call | Those 28 descriptions total 6,859, and the 28 pointers they would replace total 1,794. The 28 is a floor: standing constraints are not counted in it |
| **B3** One instruction with a place | 4,000 characters | T1: a tenth. The figure is this seat's choice of a round number well under it | Not measurable without sorting content. For scale: the 21 rule files that carry globs today, record and all, have a median of 4,249 and a longest of 10,614 |
| **B4** One procedure's description | 256 characters | T3: a quarter. T2: a sixth. This seat's choice. B5 binds before B4 does: see below | 78 descriptions: median 429, longest 1,139; 57 are over 256, 38 over 512, 3 over 1,024 |
| **B5** The listing: every name and description in the repository's skill directories | 20,000 characters at the current default windows; 8,000 at the smallest documented case | At current defaults the smallest threshold is T5 at 500,000 tokens, about 40,000 characters, and 20,000 is half of it and a sixth of T4 as this repository sets it. At a 200,000-token window the smallest is T5 at about 16,000, and 8,000 is half of it; 8,000 is also each vendor's fallback figure | 42,370 across 87 skills, 78 the estate's and 9 vendor skills. A floor on what a session carries: each trial session listed 118, and the 31 from outside the repository, and the paths Codex lists, are not counted |
| **B6** One procedure's body | 10,000 characters, about 2,500 tokens | T6: half. T7: a tenth | 78 bodies: median 7,423, longest 156,546; 30 are over 10,000 and 12 over 20,000 |
| **B7** The `AGENTS.md` files from the root to any working directory, together | 16 KiB | T8 at its stricter reading: half | The root file is 1,975 bytes: two pointers, a section of instructions on code review and a generated block for Codex team sessions. It holds no rule text. One other `AGENTS.md` is tracked, under `demos/` |

A record has no budget. It is not loaded. The 124 rule files hold 1,073,128 characters and
the 78 skill bodies 1,065,154; how much of that is record is not counted.

No total is proposed for B3 or B6. No threshold for a total of path-scoped text was found. T6
gives a total of 25,000 tokens for skill bodies kept through a compaction, which concerns how
many procedures one session uses and not the size of the estate.

Three things follow and are stated plainly.

1. **B2 is close to what the 28 habit descriptions already come to, and its cost is known.**
   Delivering them as text was measured at about 2,900 tokens on a first call of about
   39,400. It is not free, and it does not shrink unless other pointers are removed, which is
   a question for part 4. The budget cannot be confirmed as enough until the content is
   sorted, because standing constraints are uncounted.
2. **B5 is the hard one, and B4 does not decide it.** Today's 42,370 characters are already
   about the size of the Codex listing's limit at that platform's one stated window, before
   the paths Codex adds. Names take 1,612 of them. At 20,000 the listing holds about 72
   procedures at B4's full length, or all 87 at about 211 characters each. At 8,000 it holds
   about 29, or all 87 at about 73. The 31 skills a session lists from outside the repository
   are not the estate's to shorten, and whether they share the budget is not documented. The owner expects that "some existing materials will be redundant or
   inappropriate or be better expressed more succinctly"; this is where that is tested
   hardest.
3. **B6 would move text out of procedure bodies.** Thirty are over it. The longest is 15.7
   times it.

### What a budget would be in the build

For part 5 to settle, and stated here only so the budgets can be judged: each budget would be
a number the build holds and compares, as the one existing size check does, changed in one
place by the owner's decision.

## Questions for the owner

Each is the owner's by the plan. Each has a recommendation. They are put as decision cards
once this part has been reviewed, and are listed here so the cards have a record. The exact
text each answer would put into the design is on its card.

1. **The model.** Recommended: two kinds of unit, instruction and procedure, each declaring a
   record and optionally a place, a check and a pair. Alternatives: the five kinds of the
   first draft, which name the same things as kinds; or rules and skills as they are, with
   Codex treated as a reduced platform.
2. **The rule for "well within".** Recommended: half or less of the smallest threshold that
   applies. Accepting it accepts B6 and B7 as derived from it. B1, B3 and B4 have no
   threshold that decides them and are this seat's choices, offered for acceptance with it.
3. **Which windows the thresholds are taken at, and so the listing budget, B5.**
   Recommended: the current defaults, which gives 20,000 characters. That is about 72 listed
   procedures at 256 characters, or all 87 at about 211, and a description of that length can
   still say when to use a procedure. The cost of this choice: on a 200,000-token window, or
   where Codex does not know its window, the listing is over the limit and the platform
   shortens or drops descriptions itself. The alternative is the smallest documented case,
   8,000 characters, which is inside every documented listing limit on both platforms and
   means about 29 procedures, or all 87 at about 73 characters, which is too short to say
   when. Still not known, and stated on the card: the window of any Codex model but one, and
   whether the 31 skills from outside the repository draw on the same budget.
4. **The budget for always-present instructions, B2.** Recommended: 8,000 characters, with
   the cost stated: about 3,400 tokens on a first call of about 39,400, measured at 2,900 for
   the 28 habit descriptions. It is a quarter of the Codex limit. It may prove too small once
   standing constraints are counted, and the design would then come back with the count.
5. **Where the decisions are recorded once made.** Recommended: a Practice decision record
   for the model and the contracts. Where the budget numbers live is part 5's to propose.

## Appendix: the script behind the present measures

A throwaway Node script, kept here as text and not as a tracked script, because the
repository's source is TypeScript and its checks hold every tracked script to the estate's
standard. The plan's first acceptance criterion asks for a script kept with the document
that reproduces the table; this is that script, and it reproduces the present measures and
not the fractions in the "Against" column, which are arithmetic on them. It reads only
tracked files. It was run from the repository root at commit `5584f3337`, as a copy placed
in `agent-tools/` so that its import of the `yaml` package resolves. The reviewer of the
first draft ran it again at the same commit and got the same figures. Its median is the
lower middle value. The habit rules are those marked `H` in the first sort
of the rules,
[`classification.tsv`](../doing-and-dreaming-2026-11/rules-sort/classification.tsv).
Lengths are of parsed values, counted in characters.

```js
// Present measures of the estate's guidance against proposed budgets. Read-only.
// Run from the repository root, as a copy placed in agent-tools/ so that the `yaml` import resolves.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const chars = (s) => [...s].length;
const fm = (text) => { const m = /^---\n([\s\S]*?)\n---\n?/.exec(text); return m ? { data: parse(m[1]) ?? {}, body: text.slice(m[0].length) } : { data: {}, body: text }; };
const stats = (xs) => { const a = [...xs].sort((x, y) => x - y); const n = a.length; return n ? { n, min: a[0], median: a[Math.floor((n - 1) / 2)], max: a[n - 1], total: a.reduce((p, c) => p + c, 0) } : { n: 0 }; };
const over = (xs, t) => xs.filter((x) => x > t).length;
const walk = (d, out = []) => { for (const e of readdirSync(d)) { const p = join(d, e); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };

// Rules
const rules = readdirSync('.agent/rules').filter((f) => f.endsWith('.md')).map((f) => { const t = readFileSync(join('.agent/rules', f), 'utf8'); const { data, body } = fm(t); return { name: f.slice(0, -3), classification: data.classification, globs: (data.globs ?? []).length, desc: chars(String(data.description ?? '')), file: chars(t), body: chars(body) }; });
const sortFile = '.agent/research/agentic-engineering/doing-and-dreaming-2026-11/rules-sort/classification.tsv';
const kinds = new Map(); if (existsSync(sortFile)) { const [h, ...rows] = readFileSync(sortFile, 'utf8').trim().split('\n').map((l) => l.split('\t')); const ni = h.indexOf('name'), ki = h.indexOf('kind'); for (const r of rows) kinds.set(r[ni], r[ki]); }
const habit = rules.filter((r) => kinds.get(r.name) === 'H');

// Skills (canonical)
const canon = walk('.agent/skills').filter((p) => p.endsWith('SKILL-CANONICAL.md')).map((p) => { const t = readFileSync(p, 'utf8'); const { data, body } = fm(t); return { path: p, desc: chars(String(data.description ?? '')), body: chars(body), file: chars(t), lines: t.split('\n').length }; });
// Listed skills per platform root (adapters as written)
const listed = (root) => readdirSync(root).map((d) => join(root, d, 'SKILL.md')).filter((p) => existsSync(p)).map((p) => { const { data } = fm(readFileSync(p, 'utf8')); return { name: String(data.name ?? ''), desc: chars(String(data.description ?? '')) }; });
const cl = listed('.claude/skills'), ag = listed('.agents/skills');
const listingCost = (xs) => xs.reduce((p, x) => p + chars(x.name) + x.desc, 0);
const dirBytes = (d) => walk(d).reduce((p, f) => p + statSync(f).size, 0);
const size = (f) => (existsSync(f) ? statSync(f).size : null);

const out = {
  rules: { count: rules.length, core: rules.filter((r) => r.classification === 'core').length, situational: rules.filter((r) => r.classification === 'situational').length, withGlobs: rules.filter((r) => r.globs > 0).length,
    description: stats(rules.map((r) => r.desc)), descriptionOver: { 300: over(rules.map((r) => r.desc), 300), 400: over(rules.map((r) => r.desc), 400), 600: over(rules.map((r) => r.desc), 600) },
    file: stats(rules.map((r) => r.file)), fileOver: { 4000: over(rules.map((r) => r.file), 4000), 20000: over(rules.map((r) => r.file), 20000), 40000: over(rules.map((r) => r.file), 40000) } },
  habitRules: { count: habit.length, description: stats(habit.map((r) => r.desc)), over300: over(habit.map((r) => r.desc), 300), over400: over(habit.map((r) => r.desc), 400) },
  pathScopedRules: { count: rules.filter((r) => r.globs > 0).length, file: stats(rules.filter((r) => r.globs > 0).map((r) => r.file)), description: stats(rules.filter((r) => r.globs > 0).map((r) => r.desc)) },
  skills: { count: canon.length, description: stats(canon.map((s) => s.desc)), descriptionOver: { 256: over(canon.map((s) => s.desc), 256), 512: over(canon.map((s) => s.desc), 512), 1024: over(canon.map((s) => s.desc), 1024) },
    body: stats(canon.map((s) => s.body)), bodyOver: { 10000: over(canon.map((s) => s.body), 10000), 20000: over(canon.map((s) => s.body), 20000), 100000: over(canon.map((s) => s.body), 100000) }, linesOver500: over(canon.map((s) => s.lines), 500) },
  listing: { claude: { skills: cl.length, descriptionChars: cl.reduce((p, x) => p + x.desc, 0), nameAndDescriptionChars: listingCost(cl) }, agents: { skills: ag.length, descriptionChars: ag.reduce((p, x) => p + x.desc, 0), nameAndDescriptionChars: listingCost(ag) } },
  adapters: { claudeRulesBytes: dirBytes('.claude/rules'), agentsRulesBytes: dirBytes('.agents/rules') },
  entry: { 'AGENTS.md': size('AGENTS.md'), 'CLAUDE.md': size('CLAUDE.md'), 'RULES_INDEX.md': size('RULES_INDEX.md'), '.agent/directives/AGENT.md': size('.agent/directives/AGENT.md') },
};
console.log(JSON.stringify(out, null, 1));
```

Its output at that commit, abridged to the figures the table uses:

```json
{"rules": {"count": 124, "core": 75, "situational": 49, "withGlobs": 21, "description": {"n": 124, "min": 42, "median": 265, "max": 1303, "total": 41630}, "descriptionOver": {"300": 52, "400": 42, "600": 13}, "file": {"n": 124, "min": 456, "median": 6818, "max": 60852, "total": 1073128}, "fileOver": {"4000": 93, "20000": 7, "40000": 3}}}
{"habitRules": {"count": 28, "description": {"n": 28, "min": 58, "median": 205, "max": 793, "total": 6859}, "over300": 7, "over400": 4}}
{"pathScopedRules": {"count": 21, "file": {"n": 21, "min": 1305, "median": 4249, "max": 10614, "total": 105886}, "description": {"n": 21, "min": 46, "median": 345, "max": 899, "total": 8432}}}
{"skills": {"count": 78, "description": {"n": 78, "min": 37, "median": 429, "max": 1139, "total": 38060}, "descriptionOver": {"256": 57, "512": 38, "1024": 3}, "body": {"n": 78, "min": 646, "median": 7423, "max": 156546, "total": 1065154}, "bodyOver": {"10000": 30, "20000": 12, "100000": 1}, "linesOver500": 6}}
{"listing": {"claude": {"skills": 87, "descriptionChars": 40758, "nameAndDescriptionChars": 42370}, "agents": {"skills": 87, "descriptionChars": 40758, "nameAndDescriptionChars": 42370}}}
{"adapters": {"claudeRulesBytes": 9931, "agentsRulesBytes": 8143}}
{"entry": {"AGENTS.md": 1975, "CLAUDE.md": 57, "RULES_INDEX.md": 11876, ".agent/directives/AGENT.md": 14274}}
```
