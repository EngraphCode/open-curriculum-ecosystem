import { describe, expect, it } from 'vitest';

import { readPrStateReading } from './state-gh.js';
import type { GhCommandExecutor } from './gh.js';

/**
 * The gh seam reads the second transport of a reviewer's reported result: a
 * completion comment on the conversation, bound to the commit it names.
 * Five parsers compose through the gh seam with an injected executor and no
 * real gh; the comments and the commits arrive as the slurped pages of their
 * paginated harvests, shaped as read on pull request 168 (2026-09-20; that
 * pull request's description records the reads).
 */

const HEAD = 'f'.repeat(40);
const OLDER = 'e'.repeat(40);
const CODEX = 'chatgpt-codex-connector';
const CODEX_BODY = `Codex Review: Didn't find any major issues.\n\n**Reviewed commit:** \`${HEAD.slice(0, 10)}\`\n`;

// The completion comment Codex posts for a clean round, naming the commit it
// read as a ten-character prefix.
const CODEX_CLEAN_COMMENT = {
  id: 'IC_1',
  author: { login: CODEX },
  body: CODEX_BODY,
  createdAt: '2026-07-21T12:10:00Z',
  lastEditedAt: null,
};

interface Surfaces {
  /** The comments harvest, as one page. */
  readonly comments: readonly unknown[];
  /** The commits harvest, one inner list per page. */
  readonly commitPages: readonly (readonly string[])[];
  readonly reviewRequests?: readonly unknown[];
}

function viewPayload(surfaces: Surfaces): string {
  return JSON.stringify({
    number: 461,
    url: 'https://github.com/acme/widgets/pull/461',
    state: 'OPEN',
    isDraft: false,
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'BLOCKED',
    headRefOid: HEAD,
    statusCheckRollup: [],
    autoMergeRequest: null,
    reviewRequests: surfaces.reviewRequests ?? [
      { __typename: 'User', login: 'copilot-pull-request-reviewer' },
    ],
  });
}

function emptyPage(connection: string): string {
  return JSON.stringify([
    { data: { repository: { pullRequest: { [connection]: { totalCount: 0, nodes: [] } } } } },
  ]);
}

function commitsPages(pages: readonly (readonly string[])[]): string {
  return JSON.stringify(
    pages.map((oids) => ({
      data: {
        repository: {
          pullRequest: { commits: { nodes: oids.map((oid) => ({ commit: { oid } })) } },
        },
      },
    })),
  );
}

// Every leg answers empty except the view, the comments harvest and the
// commits harvest, which carry the given surfaces.
function executor(surfaces: Surfaces, calls: string[][]): GhCommandExecutor {
  return (_file, args) => {
    calls.push([...args]);
    if (args[0] === 'pr') {
      return viewPayload(surfaces);
    }
    if (args[0] === 'agent-task') {
      return JSON.stringify([]);
    }
    const query = args.find((arg) => arg.startsWith('query=')) ?? '';
    if (query.includes('reviewThreads')) {
      return emptyPage('reviewThreads');
    }
    if (query.includes('comments(')) {
      return JSON.stringify([
        { data: { repository: { pullRequest: { comments: { nodes: surfaces.comments } } } } },
      ]);
    }
    if (query.includes('commits(')) {
      return commitsPages(surfaces.commitPages);
    }
    return emptyPage('reviews');
  };
}

const ghSeam = { ghPath: '/usr/bin/gh', exists: () => true };
const WITH_TIP: Surfaces = { comments: [CODEX_CLEAN_COMMENT], commitPages: [[OLDER, HEAD]] };
const BOUND_TO_HEAD = {
  id: 'IC_1',
  author: CODEX,
  state: 'COMMENTED',
  body: CODEX_BODY,
  commitOid: HEAD,
  submittedAt: '2026-07-21T12:10:00Z',
  transport: 'completion-comment',
};

describe('readPrStateReading — the completion-comment transport', () => {
  it.each(['comments(', 'commits('])(
    'the %s connection is harvested by a paginated read',
    (connection) => {
      const calls: string[][] = [];
      readPrStateReading({
        target: { number: 461 },
        ...ghSeam,
        expectedReviewers: [CODEX],
        execFileSync: executor(WITH_TIP, calls),
      });

      const read = calls.find((args) =>
        args.some((arg) => arg.startsWith('query=') && arg.includes(connection)),
      );
      expect(read).toEqual(expect.arrayContaining(['--paginate', '--slurp']));
    },
  );

  it("reads an expected reviewer's completion comment as a review bound to the commit it names", () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      expectedReviewers: [CODEX],
      execFileSync: executor(WITH_TIP, []),
    });

    expect(reading.completionComments).toStrictEqual({ reviews: [BOUND_TO_HEAD], refused: [] });
  });

  it('a comment naming a commit on a later page of the harvest binds it: the list is the whole history', () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      expectedReviewers: [CODEX],
      execFileSync: executor(
        { comments: [CODEX_CLEAN_COMMENT], commitPages: [[OLDER], [HEAD]] },
        [],
      ),
    });

    expect(reading.completionComments).toStrictEqual({ reviews: [BOUND_TO_HEAD], refused: [] });
  });

  it('a DEFAULTED expected set that holds the commenter (an outstanding request) reads its comment', () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      execFileSync: executor(
        { ...WITH_TIP, reviewRequests: [{ __typename: 'User', login: CODEX }] },
        [],
      ),
    });

    expect(reading.expectedDeclared).toBe(false);
    expect(reading.completionComments).toStrictEqual({ reviews: [BOUND_TO_HEAD], refused: [] });
  });

  it("carries an expected reviewer's edited comment as a refusal, never as silence", () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      expectedReviewers: [CODEX],
      execFileSync: executor(
        {
          ...WITH_TIP,
          comments: [{ ...CODEX_CLEAN_COMMENT, lastEditedAt: '2026-07-21T12:11:00Z' }],
        },
        [],
      ),
    });

    expect(reading.completionComments).toStrictEqual({
      reviews: [],
      refused: [
        {
          id: 'IC_1',
          author: CODEX,
          createdAt: '2026-07-21T12:10:00Z',
          precondition: 'edited after creation',
          quote: "Codex Review: Didn't find any major issues.",
        },
      ],
    });
  });

  it('a completion comment never widens a DEFAULTED expected set: a comment by an author outside it reads as none', () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      execFileSync: executor(WITH_TIP, []),
    });

    expect(reading.expectedDeclared).toBe(false);
    expect(reading.expectedReviewers).not.toContain(CODEX);
    expect(reading.completionComments).toStrictEqual({ reviews: [], refused: [] });
  });
});
