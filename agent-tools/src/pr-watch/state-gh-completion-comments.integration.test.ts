import { describe, expect, it } from 'vitest';

import { readPrStateReading } from './state-gh.js';
import type { GhCommandExecutor } from './gh.js';

/**
 * The gh seam reads the second transport of a reviewer's reported result: a
 * completion comment on the conversation, bound to the commit it names.
 * Four parsers compose through the gh seam with an injected executor and no
 * real gh; the view carries only the fields the parsers read, shaped as
 * `gh pr view --json` emits them on pull request 167 (2026-09-20; that pull
 * request's description records the read).
 */

const HEAD = 'f'.repeat(40);
const CODEX = 'chatgpt-codex-connector';
const CODEX_BODY = `Codex Review: Didn't find any major issues.\n\n**Reviewed commit:** \`${HEAD.slice(0, 10)}\`\n`;

// The completion comment Codex posts for a clean round, naming the commit it
// read as a ten-character prefix.
const CODEX_CLEAN_COMMENT = {
  id: 'IC_1',
  author: { login: CODEX },
  body: CODEX_BODY,
  createdAt: '2026-07-21T12:10:00Z',
  includesCreatedEdit: false,
};

interface ViewShape {
  readonly comments: readonly unknown[];
  readonly commits: readonly { readonly oid: string }[];
  readonly reviewRequests?: readonly unknown[];
}

function viewPayload(view: ViewShape): string {
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
    reviewRequests: [{ __typename: 'User', login: 'copilot-pull-request-reviewer' }],
    ...view,
  });
}

function emptyPage(connection: string): string {
  return JSON.stringify([
    { data: { repository: { pullRequest: { [connection]: { totalCount: 0, nodes: [] } } } } },
  ]);
}

// Every leg answers empty except the view, which carries the given shape.
function executor(view: ViewShape, calls: string[][]): GhCommandExecutor {
  return (_file, args) => {
    calls.push([...args]);
    if (args[0] === 'pr') {
      return viewPayload(view);
    }
    if (args[0] === 'agent-task') {
      return JSON.stringify([]);
    }
    const query = args.find((arg) => arg.startsWith('query='));
    return emptyPage(query?.includes('reviewThreads') === true ? 'reviewThreads' : 'reviews');
  };
}

const ghSeam = { ghPath: '/usr/bin/gh', exists: () => true };
const WITH_TIP: ViewShape = {
  comments: [CODEX_CLEAN_COMMENT],
  commits: [{ oid: 'e'.repeat(40) }, { oid: HEAD }],
};
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
  it('the view request names the conversation legs', () => {
    const calls: string[][] = [];
    readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      expectedReviewers: [CODEX],
      execFileSync: executor(WITH_TIP, calls),
    });

    const prView = calls.find((args) => args[0] === 'pr' && args[1] === 'view');
    expect(prView?.at(-1)?.split(',')).toEqual(expect.arrayContaining(['comments', 'commits']));
  });

  it("reads an expected reviewer's completion comment as a review bound to the commit it names", () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      expectedReviewers: [CODEX],
      execFileSync: executor(WITH_TIP, []),
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

  it("a comment naming the tip binds it even when the view's commit list stops short of the tip (gh lists a pull request's first hundred)", () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      expectedReviewers: [CODEX],
      execFileSync: executor(
        { comments: [CODEX_CLEAN_COMMENT], commits: [{ oid: 'e'.repeat(40) }] },
        [],
      ),
    });

    expect(reading.completionComments).toStrictEqual({ reviews: [BOUND_TO_HEAD], refused: [] });
  });

  it("carries an expected reviewer's edited comment as a refusal, never as silence", () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      expectedReviewers: [CODEX],
      execFileSync: executor(
        { ...WITH_TIP, comments: [{ ...CODEX_CLEAN_COMMENT, includesCreatedEdit: true }] },
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
