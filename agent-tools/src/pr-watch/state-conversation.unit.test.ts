import { describe, expect, it } from 'vitest';

import { parseCommitsHarvest, parseConversation } from './state-conversation.js';

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

function livePayload(comments: readonly LiveComment[] = [CODEX_COMMENT]): unknown {
  return { number: 167, comments };
}

function commitsPage(oids: readonly string[]): unknown {
  return {
    data: {
      repository: {
        pullRequest: { commits: { nodes: oids.map((oid) => ({ commit: { oid } })) } },
      },
    },
  };
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
    ['a null comments leg', { number: 167, comments: null }, /comments/u],
    [
      'a comment without its edited flag',
      {
        number: 167,
        comments: [{ ...CODEX_COMMENT, includesCreatedEdit: undefined }],
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

describe('parseCommitsHarvest', () => {
  it('flattens the slurped pages into the full SHAs in the connection order', () => {
    const older = '51f81abea574121babf5f82ea8b2205304238b7b';

    expect(parseCommitsHarvest([commitsPage([older]), commitsPage([HEAD])])).toStrictEqual([
      older,
      HEAD,
    ]);
  });

  it('fails loud on an empty page array: an empty harvest must be a real empty page', () => {
    expect(() => parseCommitsHarvest([])).toThrow();
  });
});
