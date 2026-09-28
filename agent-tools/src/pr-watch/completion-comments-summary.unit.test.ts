import { describe, expect, it } from 'vitest';

import { readCompletionComments } from './completion-comments.js';
import type { CompletionComment } from './completion-comments.js';

/**
 * The connector's second completion shape: one summary comment per pull
 * request, which the connector itself rewrites on every run; the completed
 * Code Review row of its table names the commit a code review read. An edit
 * by the comment's own author is that author's report, timed at the edit; an
 * edit by any other account is not the reviewer's report. Fixture: the
 * summary Codex kept on pull request 264, whole, as read on 2026-09-28
 * (created 00:14:53Z, last edited by the connector at 00:47:53Z), and the
 * Running row from the same comment's edit of 00:43:33Z. The other commit and
 * the Security Review row are synthetic.
 */

const CODEX = 'chatgpt-codex-connector';
const TIP = '1f97bfc2f53387ea8a2cbdfb9ea584c262fabcb6';
const OTHER = '6123105a51fdfabb37e39ff45361d0136ac51317';
const REVIEWERS = [CODEX, 'copilot-pull-request-reviewer'];
const COMPLETED_ROW =
  '| 📝 **Code Review** | ✅ **Completed** <relative-time datetime="2026-09-28T00:47:52.135326Z">2026-09-28T00:47:52.135326Z</relative-time> | `1f97bfc` | New commits |';
const COMPLETED_QUOTE =
  '| 📝 **Code Review** | ✅ **Completed** 2026-09-28T00:47:52.135326Z | `1f97bfc` | New commits |';
const RUNNING_ROW =
  '| 📝 **Code Review** | 🔄 **Running** since <relative-time datetime="2026-09-28T00:43:32.416902Z">2026-09-28T00:43:32.416902Z</relative-time> | `1f97bfc` | New commits |';

function summaryBody(rows: readonly string[]): string {
  return [
    '<!-- codex-pull-request-review-summary -->',
    '',
    '## Codex Review Summary',
    '',
    'This comment shows the latest Codex review activity on this pull request.',
    '',
    '| Review | Status | Commit | Review trigger |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
    '',
    '',
    '<details> <summary>ℹ️ About Codex in GitHub</summary>',
    '<br/>',
    '',
    '[Your team has set up Codex to review pull requests in this repo](https://chatgpt.com/codex/cloud/settings/general). Reviews are triggered when you',
    '- Open a pull request for review',
    '- Mark a draft as ready',
    '- Comment "@codex review" or "@codex security review".',
    '',
    'Codex reacts with 👀 while any review is running, comments if it has suggestions, and reacts with 👍 once all reviews finish with no findings.',
    '',
    '</details>',
  ].join('\n');
}

const SUMMARY: CompletionComment = {
  id: 'IC_kwDORdPTys8AAAABXVoEAw',
  author: CODEX,
  body: summaryBody([COMPLETED_ROW]),
  createdAt: '2026-09-28T00:14:53Z',
  lastEdit: { at: '2026-09-28T00:47:53Z', by: CODEX },
};

function read(comment: CompletionComment) {
  return readCompletionComments({
    comments: [comment],
    commits: [OTHER, TIP],
    reviewers: REVIEWERS,
  });
}

function refusal(precondition: string, reportedAt: string, quote: string) {
  return {
    reviews: [],
    refused: [{ id: SUMMARY.id, author: CODEX, reportedAt, precondition, quote }],
  };
}

describe("readCompletionComments — the connector's per-pull-request summary", () => {
  it('reads the summary its author last edited as a review of the commit its completed Code Review row names, at the edit', () => {
    expect(read(SUMMARY)).toStrictEqual({
      reviews: [
        {
          id: SUMMARY.id,
          author: CODEX,
          state: 'COMMENTED',
          body: SUMMARY.body,
          commitOid: TIP,
          submittedAt: '2026-09-28T00:47:53Z',
          transport: 'completion-comment',
        },
      ],
      refused: [],
    });
  });

  it("matches the editor to the author whatever the case of the editor's login", () => {
    const reading = read({
      ...SUMMARY,
      lastEdit: { at: '2026-09-28T00:47:53Z', by: 'ChatGPT-Codex-Connector' },
    });

    expect(reading.reviews.map((review) => review.commitOid)).toStrictEqual([TIP]);
  });

  it.each(['octocat', 'unknown'])(
    "refuses the summary when %s made the last edit, at that edit: an edit by another account is not the reviewer's report",
    (editor) => {
      expect(
        read({ ...SUMMARY, lastEdit: { at: '2026-09-28T00:50:00Z', by: editor } }),
      ).toStrictEqual(
        refusal(
          'edited by an account other than its author',
          '2026-09-28T00:50:00Z',
          COMPLETED_QUOTE,
        ),
      );
    },
  );

  it('refuses a summary whose Code Review row is still running as such, quoting the row', () => {
    const running = { ...SUMMARY, body: summaryBody([RUNNING_ROW]) };

    expect(read(running)).toStrictEqual(
      refusal(
        'names a code review still running',
        '2026-09-28T00:47:53Z',
        '| 📝 **Code Review** | 🔄 **Running** since 2026-09-28T00:43:32.416902Z | `1f97bfc` | New commits |',
      ),
    );
  });

  it('a completed row of another review names no reviewed commit: only the Code Review row is the report', () => {
    const security =
      '| 🔒 **Security Review** | ✅ **Completed** 2026-09-28T00:48:00Z | `6123105` | Comment |';
    const both = { ...SUMMARY, body: summaryBody([COMPLETED_ROW, security]) };

    expect(read(both).reviews.map((review) => review.commitOid)).toStrictEqual([TIP]);
  });

  it("reads a Code Review row only in the summary: another of the connector's comments quoting one names no reviewed commit", () => {
    const reply = {
      ...SUMMARY,
      body: `Here is the table you asked for:\n\n${COMPLETED_ROW}\n`,
      lastEdit: null,
    };

    expect(read(reply).refused.map((comment) => comment.precondition)).toStrictEqual([
      'names no reviewed commit',
    ]);
  });

  it('refuses an edit by a deleted account even on a comment whose author was deleted too', () => {
    const orphan = {
      ...SUMMARY,
      author: 'unknown',
      lastEdit: { at: '2026-09-28T00:50:00Z', by: 'unknown' },
    };
    const reading = readCompletionComments({
      comments: [orphan],
      commits: [OTHER, TIP],
      reviewers: ['unknown'],
    });

    expect(reading.refused.map((comment) => comment.precondition)).toStrictEqual([
      'edited by an account other than its author',
    ]);
  });

  it('refuses a summary with two completed Code Review rows as naming several reviewed commits', () => {
    const second = COMPLETED_ROW.replace('`1f97bfc`', '`6123105`');
    const twice = { ...SUMMARY, body: summaryBody([COMPLETED_ROW, second]) };

    expect(read(twice).refused.map((comment) => comment.precondition)).toStrictEqual([
      'names several reviewed commits',
    ]);
  });
});
