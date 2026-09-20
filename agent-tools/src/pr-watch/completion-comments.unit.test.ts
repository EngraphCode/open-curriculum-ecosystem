import { describe, expect, it } from 'vitest';

import { quoteOf, readCompletionComments } from './completion-comments.js';
import type { RefusedPrecondition } from './completion-comments.js';

/**
 * A reviewer's reported result has two transports: the review object and a
 * completion comment on the conversation. This describes the second: a
 * comment by an expected reviewer, unedited, naming under "Reviewed commit"
 * a prefix resolving to exactly one of the pull request's commits, is a
 * review bound to that commit; an expected reviewer's comment failing one of
 * those preconditions is refused by name and quoted, never read as no
 * comment (decision note 2026-09-16). Fixture: shaped on the comment Codex
 * posted on pull request 160, round three (2026-09-20); the commit list is
 * synthetic.
 */
const CODEX_CLEAN = {
  id: 'IC_kwDORdPTys8AAAABVpbXsA',
  author: 'chatgpt-codex-connector',
  body: "Codex Review: Didn't find any major issues. Swish!\n\n**Reviewed commit:** `8c12413681`\n",
  createdAt: '2026-09-20T14:47:25Z',
  edited: false,
};
const COMMITS = [
  '6123105a51fdfabb37e39ff45361d0136ac51317',
  '8c12413681aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
];
const REVIEWERS = ['chatgpt-codex-connector', 'copilot-pull-request-reviewer'];
const QUOTE = "Codex Review: Didn't find any major issues. Swish!";

function read(comment: typeof CODEX_CLEAN, commits: readonly string[] = COMMITS) {
  return readCompletionComments({ comments: [comment], commits, reviewers: REVIEWERS });
}

function refusal(precondition: RefusedPrecondition) {
  return {
    reviews: [],
    refused: [
      {
        id: CODEX_CLEAN.id,
        author: CODEX_CLEAN.author,
        createdAt: CODEX_CLEAN.createdAt,
        precondition,
        quote: QUOTE,
      },
    ],
  };
}

describe('readCompletionComments', () => {
  it('reads an unedited completion comment by an expected reviewer as a review bound to the named commit', () => {
    expect(read(CODEX_CLEAN)).toStrictEqual({
      reviews: [
        {
          id: CODEX_CLEAN.id,
          author: 'chatgpt-codex-connector',
          state: 'COMMENTED',
          body: CODEX_CLEAN.body,
          commitOid: '8c12413681aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          submittedAt: '2026-09-20T14:47:25Z',
          transport: 'completion-comment',
        },
      ],
      refused: [],
    });
  });

  it('matches an expected reviewer whatever the case of its login', () => {
    const reading = read({ ...CODEX_CLEAN, author: 'ChatGPT-Codex-Connector' });

    expect(reading.reviews).toHaveLength(1);
  });

  it("a comment by an author who is not an expected reviewer is not a reviewer's report: neither read nor refused", () => {
    expect(read({ ...CODEX_CLEAN, author: 'el-graphael' })).toStrictEqual({
      reviews: [],
      refused: [],
    });
  });

  it("refuses an edited comment by name: an edit is not the reviewer's report", () => {
    expect(read({ ...CODEX_CLEAN, edited: true })).toStrictEqual(refusal('edited after creation'));
  });

  it('refuses a comment that names no reviewed commit, even one that mentions a commit in passing', () => {
    expect(read({ ...CODEX_CLEAN, body: `${QUOTE}\n` })).toStrictEqual(
      refusal('names no reviewed commit'),
    );
    expect(
      read({
        ...CODEX_CLEAN,
        body: `Codex could not complete the review of \`8c12413681\` — try again`,
      }),
    ).toStrictEqual({
      ...refusal('names no reviewed commit'),
      refused: [
        {
          ...refusal('names no reviewed commit').refused[0],
          quote: 'Codex could not complete the review of `8c12413681` — try again',
        },
      ],
    });
  });

  it('refuses a comment that names several reviewed commits', () => {
    expect(
      read({
        ...CODEX_CLEAN,
        body: `${QUOTE}\n\n**Reviewed commit:** \`8c12413681\`\n**Reviewed commit:** \`6123105a51\``,
      }),
    ).toStrictEqual(refusal('names several reviewed commits'));
  });

  it('refuses a comment whose named commit is not in the pull request', () => {
    expect(read(CODEX_CLEAN, [COMMITS[0] ?? ''])).toStrictEqual(
      refusal('names a commit that is not in the pull request'),
    );
  });

  it('refuses a comment whose prefix matches several commits of the pull request', () => {
    expect(
      read(CODEX_CLEAN, [...COMMITS, '8c12413681bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb']),
    ).toStrictEqual(refusal('names a prefix matching several commits of the pull request'));
  });
});

describe('quoteOf', () => {
  it("takes the comment's first non-empty line, bounded to 120 characters", () => {
    expect(quoteOf('\n\n  first line  \nsecond')).toBe('first line');
    expect(quoteOf('x'.repeat(200))).toHaveLength(120);
    expect(quoteOf('\n \n')).toBe('');
  });
});
