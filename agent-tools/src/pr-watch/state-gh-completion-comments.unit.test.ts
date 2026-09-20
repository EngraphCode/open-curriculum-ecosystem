import { describe, expect, it } from 'vitest';

import { readPrStateReading } from './state-gh.js';
import type { GhCommandExecutor } from './gh.js';

/**
 * The gh seam reads the second transport of a reviewer's reported result: a
 * completion comment on the conversation, bound to the commit it names.
 * Injected executor, no real gh; the view shape mirrors `gh pr view --json`
 * read live on 2026-09-20 (pull request 167).
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

function viewPayload(comments: readonly unknown[]): string {
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
    comments,
    commits: [{ oid: 'e'.repeat(40) }, { oid: HEAD }],
  });
}

function emptyPage(connection: string): string {
  return JSON.stringify([
    { data: { repository: { pullRequest: { [connection]: { totalCount: 0, nodes: [] } } } } },
  ]);
}

// Every leg answers empty except the view, which carries the given comments.
function executor(comments: readonly unknown[], calls: string[][]): GhCommandExecutor {
  return (_file, args) => {
    calls.push([...args]);
    if (args[0] === 'pr') {
      return viewPayload(comments);
    }
    if (args[0] === 'agent-task') {
      return JSON.stringify([]);
    }
    const query = args.find((arg) => arg.startsWith('query='));
    return emptyPage(query?.includes('reviewThreads') === true ? 'reviewThreads' : 'reviews');
  };
}

const ghSeam = { ghPath: '/usr/bin/gh', exists: () => true };

describe('readPrStateReading — the completion-comment transport', () => {
  it("requests the conversation legs and reads a declared reviewer's completion comment as a review bound to the commit it names", () => {
    const calls: string[][] = [];
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      expectedReviewers: [CODEX],
      execFileSync: executor([CODEX_CLEAN_COMMENT], calls),
    });

    const prView = calls.find((args) => args[0] === 'pr' && args[1] === 'view');
    expect(prView?.at(-1)).toMatch(/,comments,commits$/u);
    expect(reading.completionComments).toStrictEqual({
      reviews: [
        {
          id: 'IC_1',
          author: CODEX,
          state: 'COMMENTED',
          body: CODEX_BODY,
          commitOid: HEAD,
          submittedAt: '2026-07-21T12:10:00Z',
          transport: 'completion-comment',
        },
      ],
      refused: [],
    });
  });

  it("carries a declared reviewer's edited comment as a refusal, never as silence", () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      expectedReviewers: [CODEX],
      execFileSync: executor([{ ...CODEX_CLEAN_COMMENT, includesCreatedEdit: true }], []),
    });

    expect(reading.completionComments.reviews).toStrictEqual([]);
    expect(reading.completionComments.refused).toStrictEqual([
      {
        id: 'IC_1',
        author: CODEX,
        createdAt: '2026-07-21T12:10:00Z',
        precondition: 'edited after creation',
        quote: "Codex Review: Didn't find any major issues.",
      },
    ]);
  });

  it("a completion comment never widens a DEFAULTED expected set: an unrequested author's comment reads as none", () => {
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      execFileSync: executor([CODEX_CLEAN_COMMENT], []),
    });

    expect(reading.expectedDeclared).toBe(false);
    expect(reading.expectedReviewers).not.toContain(CODEX);
    expect(reading.completionComments).toStrictEqual({ reviews: [], refused: [] });
  });
});
