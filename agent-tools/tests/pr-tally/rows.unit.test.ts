import { describe, expect, it } from 'vitest';

import { parseRecordedHarvest } from '../../src/pr-tally/harvest.js';
import { buildRows } from '../../src/pr-tally/rows.js';
import pr135 from './fixtures/pr-135-harvest.json' with { type: 'json' };
import pr138 from './fixtures/pr-138-harvest.json' with { type: 'json' };

const COPILOT = 'copilot-pull-request-reviewer';
const CODEX = 'chatgpt-codex-connector';
const EXPECTED = [COPILOT, CODEX];

const short = (oid: string) => oid.slice(0, 9);

describe('buildRows — one row per settled head, in branch order, counts from recorded fields', () => {
  it('reads the #135 corpus: five reviewed heads, two superseded, one owed a reviewer', () => {
    const tally = buildRows({ harvest: parseRecordedHarvest(pr135), expectedReviewers: EXPECTED });
    expect(tally.rows.map((row) => [short(row.head), row.raised, row.cureWorthy])).toStrictEqual([
      ['be6f75c05', 15, 0],
      ['ae0e02f22', 20, 0],
      ['4114e2447', 6, 0],
      ['b50820152', 10, 0],
    ]);
    // Every seat reply in this corpus ends with a role suffix the signature
    // predicate rejects, and its body-only dispositions are batched: nothing
    // is machine-dispositioned, so every finding is undispositioned.
    expect(tally.rows.map((row) => row.undispositioned)).toStrictEqual([15, 20, 6, 10]);
    expect(tally.rows.every((row) => row.manual === 0)).toBe(true);
    expect(tally.unsettled.map((row) => [short(row.head), row.raised, row.owed])).toStrictEqual([
      ['712abe242', 0, EXPECTED],
      ['7f2426877', 0, EXPECTED],
      ['362372eb4', 3, [COPILOT]],
    ]);
  });

  it('reads the #138 corpus: bare signatures disposition every thread; suppressed items only where a one-line disposition names them', () => {
    const tally = buildRows({ harvest: parseRecordedHarvest(pr138), expectedReviewers: EXPECTED });
    expect(
      tally.rows.map((row) => [short(row.head), row.raised, row.cureWorthy, row.undispositioned]),
    ).toStrictEqual([
      ['352ad0ee5', 7, 3, 4],
      ['84dd6291b', 11, 6, 5],
      ['db67da4d5', 10, 10, 0],
      ['a1ec078e2', 9, 9, 0],
      ['33cca25bc', 5, 3, 0],
      ['ebf90ac3b', 3, 1, 2],
      ['fe81ac086', 3, 0, 1],
    ]);
    expect(tally.unsettled.map((row) => short(row.head))).toStrictEqual(['6e2e74bf4']);
  });

  it('counts a body item that restates an inline thread of the same review at the same anchor once', () => {
    const harvest = parseRecordedHarvest(pr138);
    const thread = harvest.reviewThreads.find(
      (candidate) => candidate.reviewCommitOid !== null && candidate.originalLine !== null,
    );
    if (thread === undefined || thread.reviewCommitOid === null || thread.reviewId === null) {
      throw new Error('fixture has no bound thread');
    }
    const restating = {
      id: thread.reviewId,
      databaseId: null,
      author: COPILOT,
      state: 'COMMENTED',
      commitOid: thread.reviewCommitOid,
      submittedAt: '2026-09-12T12:00:00Z',
      body: `### Suppressed comments (1)\n\n**${thread.path}:${thread.originalLine ?? thread.line ?? 1}**\n* ${thread.comments[0]?.body.split('\n')[0] ?? ''}\n`,
    };
    const before = buildRows({ harvest, expectedReviewers: EXPECTED });
    const after = buildRows({
      harvest: { ...harvest, reviews: [...harvest.reviews, restating] },
      expectedReviewers: EXPECTED,
    });
    const raisedFor = (rows: readonly { head: string; raised: number }[]) =>
      rows.find((row) => row.head === thread.reviewCommitOid)?.raised;
    expect(raisedFor([...after.rows, ...after.unsettled])).toBe(
      raisedFor([...before.rows, ...before.unsettled]),
    );
  });

  it('surfaces a signed disposition that carries no bar marker as manual, never counted', () => {
    const harvest = parseRecordedHarvest(pr138);
    const target = harvest.reviewThreads.find((thread) => thread.comments.length > 1);
    if (target === undefined) {
      throw new Error('fixture has no replied thread');
    }
    const stripped = {
      ...harvest,
      reviewThreads: harvest.reviewThreads.map((thread) =>
        thread.id === target.id
          ? {
              ...thread,
              comments: [
                thread.comments[0],
                {
                  ...thread.comments[1],
                  body: 'Looked at it, no change.\n\n— Nettle guards Pistil (2de368)',
                },
              ].filter((comment) => comment !== undefined),
            }
          : thread,
      ),
    };
    const row = buildRows({ harvest: stripped, expectedReviewers: EXPECTED }).rows.find(
      (candidate) => candidate.head === target.reviewCommitOid,
    );
    expect(row?.manual).toBe(1);
  });
});
