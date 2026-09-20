import { describe, expect, it } from 'vitest';

import type { CompletionCommentReview, RefusedCompletionComment } from './completion-comments.js';
import { COPILOT, LATE_NOW, OLD_TIP, settledReading, TIP } from './state-reading-fixture.js';
import { computePrVerdict } from './states.js';

/**
 * The settlement half reads the completion-comment transport
 * (`landing-instruments-read-the-evidence`, slice 1; decision note
 * 2026-09-16): a declared reviewer's completion comment bound to the tip is
 * that reviewer's result, and a comment that fails a precondition on a leg
 * the tip does not satisfy is refused by name and quoted — never read as no
 * comment at all.
 */

const CODEX = 'chatgpt-codex-connector';
const CODEX_BODY =
  "Codex Review: Didn't find any major issues.\n\n**Reviewed commit:** `aaaaaaaaaa`\n";

function codexClean(
  commitOid: string,
  submittedAt = '2026-07-21T12:10:00Z',
): CompletionCommentReview {
  return {
    id: 'IC_1',
    author: CODEX,
    state: 'COMMENTED',
    body: CODEX_BODY,
    commitOid,
    submittedAt,
    transport: 'completion-comment',
  };
}

const EDITED: RefusedCompletionComment = {
  id: 'IC_2',
  author: CODEX,
  createdAt: '2026-07-21T12:10:00Z',
  precondition: 'edited after creation',
  quote: "Codex Review: Didn't find any major issues.",
};

const both = { expectedReviewers: [COPILOT, CODEX] };

describe('computePrVerdict — the completion-comment transport', () => {
  it('a tip-bound completion comment satisfies a declared leg with no review object, and the evidence names the transport', () => {
    const verdict = computePrVerdict(
      settledReading({ ...both, completionComments: { reviews: [codexClean(TIP)], refused: [] } }),
      LATE_NOW,
    );

    expect(verdict.state).toBe('SETTLE-READY');
    expect(verdict.evidence).toContain(
      `${CODEX}: SATISFIED — substantive review binds current tip`,
    );
    expect(verdict.evidence).toContain(
      `${CODEX}: completion comment IC_1 at 2026-07-21T12:10:00Z read as a review of the tip (transport: completion-comment)`,
    );
  });

  it('a tip-bound completion comment anchors the quiet window as a review object does', () => {
    const verdict = computePrVerdict(
      settledReading({
        ...both,
        completionComments: { reviews: [codexClean(TIP, '2026-07-21T12:55:00Z')], refused: [] },
      }),
      LATE_NOW,
    );

    expect(verdict.state).toBe('SETTLING-QUIET-WINDOW');
    expect(verdict.evidence).toContain(
      'quiet window open until more than 10 min after 2026-07-21T12:55:00Z',
    );
  });

  it('a completion comment bound to an older commit, on a leg the tip does not satisfy, is refused by name and quoted — never read as no comment', () => {
    const verdict = computePrVerdict(
      settledReading({
        ...both,
        completionComments: { reviews: [codexClean(OLD_TIP)], refused: [] },
      }),
      LATE_NOW,
    );

    expect(verdict.state).toBe('UNCLASSIFIED-EVIDENCE');
    expect(verdict.evidence).toContain(
      `${CODEX}: completion comment IC_1 at 2026-07-21T12:10:00Z refused — names commit bbbbbbbbbb, not the current tip; "Codex Review: Didn't find any major issues."`,
    );
  });

  it("a declared reviewer's comment that failed a precondition is refused by that precondition, quoted", () => {
    const verdict = computePrVerdict(
      settledReading({ ...both, completionComments: { reviews: [], refused: [EDITED] } }),
      LATE_NOW,
    );

    expect(verdict.state).toBe('UNCLASSIFIED-EVIDENCE');
    expect(verdict.evidence).toContain(
      `${CODEX}: completion comment IC_2 at 2026-07-21T12:10:00Z refused — edited after creation; "Codex Review: Didn't find any major issues."`,
    );
  });

  it('an older completion comment of a reviewer whose leg the tip satisfies is a past round, not a near-miss', () => {
    const verdict = computePrVerdict(
      settledReading({
        ...both,
        reviews: [
          ...settledReading().reviews,
          {
            author: CODEX,
            state: 'COMMENTED',
            body: 'One finding.',
            commitOid: TIP,
            submittedAt: '2026-07-21T12:06:00Z',
          },
        ],
        completionComments: { reviews: [codexClean(OLD_TIP)], refused: [] },
      }),
      LATE_NOW,
    );

    expect(verdict.state).toBe('SETTLE-READY');
    expect(verdict.evidence.join('\n')).not.toContain('refused');
  });

  it("a refused comment never outranks that reviewer's LIVE run inside the window: the result being composed is awaited, the refusal stays in evidence", () => {
    const verdict = computePrVerdict(
      settledReading({
        ...both,
        reviewRequests: [CODEX],
        completionComments: { reviews: [codexClean(OLD_TIP)], refused: [] },
        reviewRuns: {
          kind: 'read',
          runs: [
            {
              id: 'run-1',
              name: 'codex review',
              createdAt: '2026-07-21T12:01:00Z',
              completedAt: null,
            },
          ],
        },
      }),
      '2026-07-21T12:05:00Z',
    );

    expect(verdict.state).toBe('WAITING-REVIEW-RUN-LIVE');
    expect(verdict.evidence.join('\n')).toContain(
      'refused — names commit bbbbbbbbbb, not the current tip',
    );
  });

  it('an outwaited live run with a refused comment refuses by the comment, not by the timeout: the near-miss is what the reader needs', () => {
    const verdict = computePrVerdict(
      settledReading({
        ...both,
        reviewRequests: [CODEX],
        completionComments: { reviews: [codexClean(OLD_TIP)], refused: [] },
        reviewRuns: {
          kind: 'read',
          runs: [
            {
              id: 'run-1',
              name: 'codex review',
              createdAt: '2026-07-21T12:01:00Z',
              completedAt: null,
            },
          ],
        },
      }),
      LATE_NOW,
    );

    expect(verdict.state).toBe('UNCLASSIFIED-EVIDENCE');
    expect(verdict.evidence.join('\n')).toContain(`${CODEX}: SKIPPED — timeout`);
  });
});
