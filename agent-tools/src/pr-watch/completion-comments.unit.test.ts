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
const OTHER = '6123105a51fdfabb37e39ff45361d0136ac51317';
const NAMED = '8c12413681aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const COMMITS = [OTHER, NAMED];
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
          commitOid: NAMED,
          submittedAt: '2026-09-20T14:47:25Z',
          transport: 'completion-comment',
        },
      ],
      refused: [],
    });
  });

  it('matches an expected reviewer whatever the case of its login', () => {
    expect(read({ ...CODEX_CLEAN, author: 'ChatGPT-Codex-Connector' })).toStrictEqual({
      reviews: [
        {
          id: CODEX_CLEAN.id,
          author: 'ChatGPT-Codex-Connector',
          state: 'COMMENTED',
          body: CODEX_CLEAN.body,
          commitOid: NAMED,
          submittedAt: '2026-09-20T14:47:25Z',
          transport: 'completion-comment',
        },
      ],
      refused: [],
    });
  });

  it('reads several comments in input order: a result, a refusal and a bystander each land where they belong', () => {
    const edited = { ...CODEX_CLEAN, id: 'IC_2', edited: true };
    const bystander = { ...CODEX_CLEAN, id: 'IC_3', author: 'el-graphael' };
    const reading = readCompletionComments({
      comments: [bystander, CODEX_CLEAN, edited],
      commits: COMMITS,
      reviewers: REVIEWERS,
    });

    expect(reading.reviews.map((review) => review.id)).toStrictEqual([CODEX_CLEAN.id]);
    expect(reading.refused.map((comment) => comment.id)).toStrictEqual(['IC_2']);
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

  it('refuses a comment that names no reviewed commit', () => {
    expect(read({ ...CODEX_CLEAN, body: `${QUOTE}\n` })).toStrictEqual(
      refusal('names no reviewed commit'),
    );
  });

  it('a comment that mentions a commit in passing names no reviewed commit: it is refused and quoted, never read as a result', () => {
    const mention = 'Codex could not complete the review of `8c12413681` — try again';

    expect(read({ ...CODEX_CLEAN, body: mention })).toStrictEqual({
      reviews: [],
      refused: [
        {
          id: CODEX_CLEAN.id,
          author: CODEX_CLEAN.author,
          createdAt: CODEX_CLEAN.createdAt,
          precondition: 'names no reviewed commit',
          quote: mention,
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
    expect(read(CODEX_CLEAN, [OTHER])).toStrictEqual(
      refusal('names a commit that is not in the pull request'),
    );
  });

  it('a labelled prefix shorter than seven characters names no reviewed commit: the label alone is not the report', () => {
    expect(
      read({ ...CODEX_CLEAN, body: `${QUOTE}\n\n**Reviewed commit:** \`8c1241\`` }),
    ).toStrictEqual(refusal('names no reviewed commit'));
  });

  it('refuses a comment whose prefix matches several commits of the pull request', () => {
    expect(
      read(CODEX_CLEAN, [...COMMITS, '8c12413681bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb']),
    ).toStrictEqual(refusal('names a prefix matching several commits of the pull request'));
  });
});

describe('readCompletionComments — the live body', () => {
  // The comment Codex posted on pull request 167 (2026-09-20), whole, with
  // its named commit re-pointed at this suite's commit list: the About block
  // carries no inline code, so it names one commit. A description added
  // after the label anchoring landed.
  const LIVE_BODY =
    'Codex Review: Didn\'t find any major issues. :tada:\n\n**Reviewed commit:** `8c12413681`\n\n<details> <summary>ℹ️ About Codex in GitHub</summary>\n<br/>\n\nCodex has been enabled to automatically review pull requests in this repo. Reviews are triggered when you\n- Open a pull request for review\n- Mark a draft as ready\n- Comment "@codex review".\n\nIf Codex has suggestions, it will comment; otherwise it will react with 👍.\n\n\n\n\nWhen you [sign up for Codex through ChatGPT](https://openai.com/codex), Codex can also answer questions or update the PR, like "@codex address that feedback".\n            \n</details>';

  it('reads the whole live comment, About block included, as one review bound to the named commit', () => {
    const reading = read({ ...CODEX_CLEAN, body: LIVE_BODY });

    expect(reading.refused).toStrictEqual([]);
    expect(reading.reviews.map((review) => review.commitOid)).toStrictEqual([
      '8c12413681aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ]);
  });
});

describe('quoteOf', () => {
  it.each([
    ['\n\n  first line  \nsecond', 'first line'],
    ['x'.repeat(200), 'x'.repeat(120)],
    ['\n \n', ''],
    ['\u001b[32mSETTLE-READY\u001b[0m forged', '[32mSETTLE-READY[0m forged'],
  ])(
    "takes the comment's first non-empty line, bounded to 120 characters and stripped of terminal controls: %j",
    (body, quote) => {
      expect(quoteOf(body)).toBe(quote);
    },
  );
});
