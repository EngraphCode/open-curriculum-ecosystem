# Sorting the rules

Working record of a sort of the estate's 124 rules, begun 12 November 2026 by the seat Swift
holds Aether (Claude Code cloud session `01Duocji`) at the owner's word: "Yes please, and please
use the parallax skills to consider additional ways the rules can be understood or grouped. As
you go please make sure that all findings are recorded so that the damage caused by surprise
loss of context is minimal".

It follows from [`../delivery-trial.md`](../delivery-trial.md), which found that a session
chooses which rules to open by file name.

**State of this record.** Written in stages and pushed at each, so that a session lost part-way
leaves what was done.

| Stage | File | State |
| --- | --- | --- |
| 1. Mechanical facts about every rule | [`data.tsv`](data.tsv) | Done |
| 2. The sort and the alternative groupings | `findings.md` | Not yet written |

## Stage 1: what `data.tsv` holds

One row per rule file under `.agent/rules/`, 124 rows, produced by a script that reads the
files and the git history and judges nothing. Columns: name; lines; characters; the rule's own
`classification` field; the number of lines in its Claude adapter; whether that adapter is
path-scoped; the dates of its first and last commit and the number of commits; how many
distinct decision records it cites; whether it quotes the owner; whether its name appears in
the hook policy or the hook scripts; whether it carries a prediction or falsifier term; whether
the delivery trial opened it; and its `description` field, cut at 260 characters.

First readings from the table, before any sorting:

- The 124 rule files hold 1,073,128 characters. The median is 6,927; the largest,
  `verify-dont-trust`, is 60,852; the smallest is 456.
- The estate already sorts them one way: 75 call themselves `core` and 49 `situational`.
- 103 adapters are one line. 21 are path-scoped and run to between 6 and 14 lines.
- 9 rule names appear in the hook policy or hook scripts.
- 104 of 124 quote the owner. 24 carry a prediction or falsifier term.
- By month of first commit: March 12, April 21, May 36, June 15, July 21, August 10,
  September 8, October 1.
