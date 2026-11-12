# The rules and skills system: design

The design the delivery node
[`rules-and-skills-system-design`](../../../plans/delivery/rules-and-skills-system-design.plan.md)
asks for. It is written in parts, one todo at a time. This file holds parts 1 to 3: the unit
model, the contracts and the budgets. Parts 4 to 7 (projections, build and validation,
processes, and how it will be known to work) follow the spike and are not written yet.

It is a proposal. Nothing here is decided until the owner decides it, and the decisions that
are the owner's are listed at the end as questions, each with a recommendation. It designs the
system and not the content of any rule or skill: which present rule becomes which kind of
unit is not settled here.

## What it stands on

Each line says how it is known.

| Ground | Standing |
| --- | --- |
| Claude Code is the main concern, Codex the second, everything else reasonable efforts | The owner's word, 2026-11-12 |
| Copied text for each platform is acceptable "as long as we don't end up loading things twice" | The owner's word, 2026-11-12 |
| Rules and skills "must describe current requirements, not the evolution that arrived at them" | The owner's ruling, 2026-11-12 |
| "each rule, skill, and the combined total of the relevant parts, should be well within the identified important thresholds" | The owner's word, 2026-11-12 |
| A rule reaches Claude Code as a one-line pointer, and no output carries a rule's body or, outside Cursor, its description | Read in the code: the [audit](pipeline-audit.md), section 2 |
| A skill reaches both platforms as a name and a description, in an adapter that points to its body | Read in the code: the audit, section 3 |
| Claude Code loads an unscoped rule's text at launch and puts it back after a compaction; a path-scoped rule's text loads when a matching file is read or written; a skill's description is listed and its body loaded on use | Anthropic's documentation, in the [Claude Code loading note](../doing-and-dreaming-2026-11/claude-code-rules-and-skills-loading.md). Not observed beyond the two trials |
| Codex loads the `AGENTS.md` chain, a skills listing and hook output, and has no mechanism that loads a rule's text as guidance | OpenAI's documentation, in the [Codex loading note](../doing-and-dreaming-2026-11/codex-rules-and-skills-loading.md). Not observed |
| In thirty short read-only sessions, the rules a session opened were on the subject of its task; rules that state a habit of mind were left unopened | Measured: the [delivery trial](../doing-and-dreaming-2026-11/delivery-trial.md). Why a file was opened was not measured |
| Twenty-eight habit instructions delivered as text were acted on in one task of five and changed no conclusion | Measured: the [habit-text trial](../doing-and-dreaming-2026-11/habit-text-trial.md). One separating instruction against a bar of two |

## 1. The unit model

### The question the model answers

The estate has two containers, rules and skills, because the platforms it started on had
two. The containers are not the same on the two platforms that matter: Codex has skills and
no rules. So a model stated as "rules and skills" cannot be delivered to Codex as stated. The
model here asks a question that has the same answer on every platform: **when must this be in
front of the agent, and what on the platform can put it there?**

That question has five answers in the evidence. Each is a kind of unit.

### The five kinds

| Kind | When it must be in front of the agent | What it needs of a platform |
| --- | --- | --- |
| **Standing instruction** | At all times. No moment in the work marks it | Text in context from the start, kept through a compaction |
| **Situated instruction** | When a particular part of the repository is touched | Text delivered when a matching file is read or written |
| **Procedure** | When a named activity starts: a commit, a pull request, a wrap | A short listing that selects it, and a body loaded on use |
| **Enforced requirement** | Never, as text. It must hold whether or not the agent has it in mind | Code that runs at the act: a hook, a gate, a lint rule |
| **Record** | Never, in a session. A person or a later seat goes to it | Nothing. A file that the unit names |

What each is, in a sentence.

- A **standing instruction** is a habit of mind or a standing constraint: check before
  asserting, scope from the goal, never commit to the default branch. The rules sort found 28
  rules of this kind among 124, and they were the ones left unopened.
- A **situated instruction** is guidance that only matters in one place: how tests in one
  workspace are named, what a generated directory must not be edited by hand. Twenty-one
  rules carry path globs today.
- A **procedure** is the how of an activity with steps and an order. The estate has 78.
- An **enforced requirement** is whatever code can check. The text of such a requirement is
  for explaining a refusal, and the estate's rule on landing a capability already ranks code
  that needs no context above text that must be recalled.
- A **record** is why a unit exists: the owner's ruling, the incidents, the dated history, the
  evidence. Dated lines appear in 110 of 124 rule files today. By the owner's ruling they do
  not belong in a rule or a skill.

### What each may and may not carry

| Kind | Carries | Does not carry |
| --- | --- | --- |
| Standing instruction | One instruction, stated as what to do and when, in a few sentences | Steps, examples, incidents, dates, the argument for it |
| Situated instruction | The instructions for one place, and the paths that define the place | Anything that applies everywhere; history |
| Procedure | A description that says when to use it, and a body of steps | Standing constraints restated; history; another procedure's steps |
| Enforced requirement | The check, and one sentence a refusal can print | A paragraph asking the agent to remember it |
| Record | Everything else: rulings, incidents, evidence, superseded text | Any instruction that is not also in a unit |

### How the kinds relate

1. **Every unit names its record, and no record is loaded.** A unit's declaration holds the
   path of its record. The record may be long. Nothing in a session's start reads it.
2. **An instruction and a procedure may be a pair.** "Commit through the commit procedure" is
   a standing instruction; the steps are the procedure. The instruction is one sentence and
   names the procedure. The procedure does not restate the instruction.
3. **A requirement is enforced or it is advice, and a unit says which.** A unit that code
   enforces names the check. A unit that names no check is advice, and its contract says so.
4. **One home for each instruction.** An instruction lives in one unit. The build copies it to
   each platform. No instruction is written twice by hand, and none reaches one platform
   twice.
5. **A unit of one kind does not grow into another.** A standing instruction that needs steps
   has become a procedure and is moved. A procedure whose steps are always the same and can
   be checked has become an enforced requirement and is moved.

### What the model does to the present estate, in outline only

This is what the kinds imply, and not a sort of the content.

- The 124 rules are of four kinds today, held in one container. The sort found 28 habits of
  mind, 90 tied to a named activity and 6 that only point elsewhere. Under the model the
  first are standing instructions. The second divide among situated instructions, steps of
  a procedure and enforced requirements. The third have no kind and are not units.
- The 78 skills are procedures already. What changes for them is the budget.
- The text that explains and justifies, which is most of the 2.2 million characters, is
  record.

## 2. Contracts

A contract says what a unit of a kind must declare, how long it may be, what it promises a
reader, and what it must not be relied on to do. The lengths are in part 3.

### Standing instruction

- **Declares:** a name; the instruction text; the path of its record; the name of the check
  that enforces it, if one does; the name of its paired procedure, if it has one.
- **Promises:** on Claude Code and on Codex, this text is in context when a session starts,
  once. On Claude Code it is put back after a compaction. Both by the vendors' documentation;
  the spike observes the first on Claude Code.
- **Must not be relied on to:** change what an agent concludes, or fire at a particular
  moment. In the habit-text trial, delivered instructions changed the form of one answer in
  five tasks and no conclusion. A requirement that must hold is an enforced requirement, or
  a step of a procedure the agent is in.

### Situated instruction

- **Declares:** a name; the paths that define its place; the instruction text; the path of
  its record; the check that enforces it, if one does.
- **Promises:** on Claude Code, this text is delivered when a file matching its paths is
  read, written or edited. By the documentation; not observed, since every trial was
  read-only and one turn long.
- **Must not be relied on to:** reach Codex by the same means. Codex has no mechanism for it.
  What Codex gets is a question for part 4, and the least it can be is nothing.

### Procedure

- **Declares:** a name; a description that says when to use it; a body; the path of its
  record.
- **Promises:** on both platforms, the name and description are listed when a session starts,
  and the body is loaded when the procedure is used.
- **Must not be relied on to:** be used. In thirty sessions no session called a skill, on
  tasks that included a commit and a review comment. Whether that is the listing's size, the
  tasks, or the read-only tool set is not known. The description is the only thing that can
  select the procedure, so its budget is the one that matters most.

### Enforced requirement

- **Declares:** the check; where it runs; the sentence it prints on refusal; the path of its
  record.
- **Promises:** the act is refused or reported whether or not any text was read.
- **Must not be relied on to:** explain itself beyond that sentence. The explanation is the
  record.

### Record

- **Declares:** nothing. It is named by the units it stands behind.
- **Promises:** that the reason for a unit can be found from the unit.
- **Must not be relied on to:** be read by a session. An instruction that exists only in a
  record is not delivered to anyone.

## 3. Budgets

### The thresholds, and how each is known

All from the vendors' documentation as the two loading notes record it. None was measured
here except where the last column says so. A token is taken as four characters, which is the
repository's own estimate.

| # | Threshold | Value | Platform | Known how |
| --- | --- | --- | --- | --- |
| T1 | A rule file loaded on demand, each file | 40,000 characters on a 200,000-token window | Claude Code | Documented |
| T2 | A skill's description | 1,536 characters | Claude Code | Documented |
| T3 | A skill's description | 1,024 characters | The Agent Skills specification, which both read | Documented; named in the repository's code |
| T4 | The skills listing, all descriptions together | 1 % of the window by default, about 8,000 characters at 200,000 tokens; this repository sets 3 %, about 24,000 | Claude Code | Fraction documented; the conversion to characters is this seat's arithmetic |
| T5 | The skills listing | 2 % of the window by default, about 16,000 characters at 200,000 tokens; 8,000 characters when the window is unknown; at most 10,000 tokens if set | Codex | Documented; the window Codex runs with was not established |
| T6 | A skill's body kept through a compaction | 5,000 tokens each, 25,000 in all | Claude Code | Documented |
| T7 | One read of a file | 25,000 tokens; a partial view beyond it | Claude Code | Documented |
| T8 | The project documents, `AGENTS.md` from the root down | 32 KiB. One vendor page says together, two say each | Codex | Documented, and unresolved between pages |
| T9 | The documentation's own advice | under 200 lines for a memory file, under 500 for a skill body | Claude Code | Documented, as advice |
| T10 | The context at a session's first call | about 39,300 tokens today | Claude Code | Measured in forty sessions |

No documented threshold limits the total of always-present text on Claude Code short of 4 MiB
a file. The budget for it is therefore set against what a session carries today (T10) and
against the Codex limit (T8), which the same text must also fit.

### What is proposed, beside what is there now

"Well within" is read here as half of a threshold or less, where a threshold exists. The
present measures are computed by the script in the appendix.

| Budget | Proposed | Against | Present measure |
| --- | --- | --- | --- |
| **B1** One standing instruction | 300 characters | none documented; set by B2 | The 28 habit rules' descriptions: median 205, longest 793; 7 are over 300 |
| **B2** All standing instructions together | 8,000 characters, about 2,000 tokens | T8: a quarter of 32 KiB. T10: about 5 % of today's first call | The 28 descriptions total 6,859. The 103 pointers they would replace total 6,780 |
| **B3** One situated instruction | 4,000 characters | T1: a tenth | The 21 path-scoped rules: median 4,249, longest 10,614 as whole files; 93 of all 124 rule files are over 4,000 |
| **B4** One procedure's description | 256 characters | T3: a quarter. T2: a sixth | 78 descriptions: median 429, longest 1,139; 57 are over 256, 38 over 512, 3 over 1,024 |
| **B5** All listed descriptions together, names included, vendor skills included | 12,000 characters | T4 as this repository sets it: half. T5 at a 200,000-token window: three quarters. Over T5's 8,000 for an unknown window | 42,370 across 87 listed skills, of which 9 are vendor skills |
| **B6** One procedure's body | 10,000 characters, about 2,500 tokens | T6: half. T7: a tenth | 78 bodies: median 7,423, longest 156,546; 30 are over 10,000, 12 over 20,000 |
| **B7** The root `AGENTS.md`, everything in it | 16 KiB | T8 on its stricter reading: half | 1,975 bytes. It holds a pointer and no instruction |
| **B8** A record | no limit | none: it is not loaded | The 124 rule files hold 1,073,128 characters, and the 78 skill bodies 1,065,154 |

Three things follow from the table and are stated plainly.

1. **B2 is met today by the text that already exists.** The 28 habit rules' own descriptions
   fit. Seven are over the single-instruction length and would be shortened, which is content
   work and not this design's.
2. **B5 is not met by shortening alone.** At 256 characters each, 78 procedures and 9 vendor
   skills come to about 22,000 characters before names. Meeting 12,000 takes fewer listed
   procedures, shorter descriptions than B4 allows, or both. The owner expects that "some
   existing materials will be redundant or inappropriate or be better expressed more
   succinctly"; this is where that expectation is tested hardest.
3. **B6 moves text out of procedures and into records.** Thirty bodies are over it. The
   largest is fifteen times it.

### What a budget is, in the build

Each budget is a number the build holds and compares, as the one existing size check does.
A unit over its budget fails the build, and so does a total. A budget is changed by changing
the number in one place, by the owner's decision, and the change is visible in a diff. How
the build does this is part 5.

## Questions for the owner

Each is the owner's by the plan. Each has a recommendation. They are put as decision cards
when this part is complete, and are listed here so that the cards have a record.

1. **The five kinds.** Recommended: accept them as the model. The alternative is to keep
   "rule" and "skill" as the kinds and treat Codex as a reduced platform.
2. **"Well within" as half or less.** Recommended: accept, with B5 as the stated exception
   at three quarters of the Codex default.
3. **The listing budget, B5.** Recommended: 12,000 characters. The stricter alternative is
   8,000, which is inside every documented listing budget on both platforms including the
   Codex fallback, and means about half as many listed procedures or descriptions of about
   90 characters.
4. **The standing budget, B2.** Recommended: 8,000 characters. It is close to what the
   pointers cost today, so the first call of a session grows by little or nothing.
5. **Where the decisions are recorded once made.** Recommended: a Practice decision record
   for the kinds and contracts, and the budget numbers in the build's own configuration,
   which the record points to.

## Appendix: the script behind the present measures

A throwaway Node script, kept here as text and not as a tracked script. It reads only tracked
files. It was run from the repository root, with the `yaml` package resolved from
`agent-tools`, at commit `5584f3337`. The habit rules are those marked `H` in the first sort
of the rules,
[`classification.tsv`](../doing-and-dreaming-2026-11/rules-sort/classification.tsv).
Lengths are of parsed values, counted in characters.

```js
// Present measures of the estate's guidance against proposed budgets. Read-only.
// Run from the repository root with the `yaml` package resolvable (copy beside agent-tools/package.json, or run with NODE_PATH).
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
