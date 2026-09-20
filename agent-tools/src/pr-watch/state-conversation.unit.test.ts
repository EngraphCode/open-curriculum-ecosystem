import { describe, expect, it } from 'vitest';

import { parseConversation } from './state-conversation.js';

/**
 * The conversation legs of the `pr state` view: the top-level comments (the
 * surface a reviewer's completion comment lands on) and the pull request's
 * commits. Shapes follow `gh pr view --json comments,commits` on pull
 * request 167 (2026-09-20; that pull request's description records the
 * read).
 */

const HEAD = '15d88db6315dae84917d00d0ec7b9b7c6d7e7cd6';

interface LiveComment {
  readonly id: string;
  readonly author: { readonly login: string } | null;
  readonly authorAssociation: string;
  readonly body: string;
  readonly createdAt: string;
  readonly includesCreatedEdit: boolean;
  readonly isMinimized: boolean;
  readonly url: string;
}

const CODEX_COMMENT: LiveComment = {
  id: 'IC_kwDORdPTys8AAAABVs5rKA',
  author: { login: 'chatgpt-codex-connector' },
  authorAssociation: 'NONE',
  body: "Codex Review: Didn't find any major issues.\n\n**Reviewed commit:** `15d88db631`\n",
  createdAt: '2026-09-20T17:13:17Z',
  includesCreatedEdit: false,
  isMinimized: false,
  url: 'https://github.com/acme/widgets/pull/167#issuecomment-5751335720',
};

const COMMITS = [
  { oid: '51f81abea574121babf5f82ea8b2205304238b7b', committedDate: '2026-09-20T16:54:21Z' },
  { oid: HEAD, committedDate: '2026-09-20T17:07:21Z' },
];

function livePayload(comments: readonly LiveComment[] = [CODEX_COMMENT]): unknown {
  return { number: 167, comments, commits: COMMITS };
}

describe('parseConversation', () => {
  it('reads the comments as completion-comment candidates and the commits as their oids', () => {
    expect(parseConversation(livePayload())).toStrictEqual({
      comments: [
        {
          id: 'IC_kwDORdPTys8AAAABVs5rKA',
          author: 'chatgpt-codex-connector',
          body: "Codex Review: Didn't find any major issues.\n\n**Reviewed commit:** `15d88db631`\n",
          createdAt: '2026-09-20T17:13:17Z',
          edited: false,
        },
      ],
      commits: ['51f81abea574121babf5f82ea8b2205304238b7b', HEAD],
    });
  });

  it('reads an edited comment as edited', () => {
    const parsed = parseConversation(
      livePayload([{ ...CODEX_COMMENT, includesCreatedEdit: true }]),
    );

    expect(parsed.comments[0]?.edited).toBe(true);
  });

  it("names a deleted account's comment as by 'unknown'", () => {
    const parsed = parseConversation(livePayload([{ ...CODEX_COMMENT, author: null }]));

    expect(parsed.comments[0]?.author).toBe('unknown');
  });

  it('reads no comments from a view that carries none', () => {
    expect(parseConversation(livePayload([])).comments).toStrictEqual([]);
  });

  it.each([
    ['a missing commits leg', { number: 167, comments: [] }, /commits/u],
    ['a null comments leg', { number: 167, comments: null, commits: COMMITS }, /comments/u],
    [
      'a comment without its edited flag',
      {
        number: 167,
        comments: [{ ...CODEX_COMMENT, includesCreatedEdit: undefined }],
        commits: COMMITS,
      },
      /includesCreatedEdit/u,
    ],
  ])(
    'fails loud naming the leg on %s: a misshapen payload is never an empty one',
    (_name, payload, leg) => {
      expect(() => parseConversation(payload)).toThrow(leg);
    },
  );
});
