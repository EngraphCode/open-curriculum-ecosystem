import { describe, expect, it } from 'vitest';

import { NO_CONTENT } from './content-binding.js';
import { computeReviewerLegs, type HarvestedReview } from './reviewer-legs.js';
import { COPILOT, LATE_NOW, settledReading, TIP } from './state-reading-fixture.js';
import { computePrVerdict } from './states.js';
import { isVendorErrorReview } from './vendor-error-reviews.js';

/**
 * A vendor's error review says its review run failed: the review object is
 * real, and no review occurred. It is known by its whole body against the
 * recorded set, whatever the review's state, so it satisfies no leg, and a
 * finding that quotes its wording is still a review.
 */

const COPILOT_ERROR =
  'Copilot encountered an error and was unable to review this pull request. You can try again by re-requesting a review.';

function review(overrides: Partial<HarvestedReview>): HarvestedReview {
  return {
    author: COPILOT,
    state: 'COMMENTED',
    body: COPILOT_ERROR,
    commitOid: TIP,
    submittedAt: '2026-07-21T12:05:00Z',
    ...overrides,
  };
}

function legsOver(reviews: readonly HarvestedReview[], checksGreenAt: string) {
  return computeReviewerLegs({
    headRefOid: TIP,
    content: NO_CONTENT,
    checksGreenAt,
    roundRequests: [],
    expectedReviewers: [COPILOT],
    reviews,
    reviewRequests: [],
    now: '2026-07-21T12:10:00Z',
  });
}

const ONE_ERROR_NOTE =
  '; 1 tip-bound vendor error review ignored (the vendor could not review this tip)';

describe('isVendorErrorReview', () => {
  it('reads the recorded Copilot error body as an error review', () => {
    expect(isVendorErrorReview(COPILOT_ERROR)).toBe(true);
  });

  it('reads the same body through changed whitespace as the same error review', () => {
    const rewrapped =
      '\n  Copilot encountered an error and was unable to review\nthis pull request.  You can try again by re-requesting a review.\n\n';
    expect(isVendorErrorReview(rewrapped)).toBe(true);
  });

  it('never reads a clean review, or a finding that quotes the wording, as an error review', () => {
    expect(isVendorErrorReview('🟢 No findings. Reviewed 2 of 2 files.')).toBe(false);
    // The skip phrase's recorded false positive: a finding quoting it.
    expect(
      isVendorErrorReview('The body "Unable to review: service unavailable" must satisfy no leg.'),
    ).toBe(false);
    expect(isVendorErrorReview(`The vendor posted "${COPILOT_ERROR}" on the old tip.`)).toBe(false);
  });
});

describe('computeReviewerLegs over a vendor error review', () => {
  it.each(['COMMENTED', 'APPROVED', 'CHANGES_REQUESTED'])(
    'an error review under %s satisfies no leg, and the detail counts it',
    (state) => {
      expect(legsOver([review({ state })], '2026-07-21T12:04:00Z')).toStrictEqual([
        {
          reviewer: COPILOT,
          state: 'OWED',
          detail: `no substantive review binds the current tip${ONE_ERROR_NOTE}`,
        },
      ]);
    },
  );

  it('two error reviews and then a content review satisfy the leg, as on the recorded pull request', () => {
    const legs = legsOver(
      [
        review({ submittedAt: '2026-07-21T12:01:00Z' }),
        review({ submittedAt: '2026-07-21T12:03:00Z' }),
        review({ body: 'Reviewed 2 of 2 files.', submittedAt: '2026-07-21T12:05:00Z' }),
      ],
      '2026-07-21T12:00:00Z',
    );
    expect(legs).toStrictEqual([
      {
        reviewer: COPILOT,
        state: 'SATISFIED',
        detail:
          'substantive review binds current tip; 2 tip-bound vendor error reviews ignored (the vendor could not review this tip)',
      },
    ]);
  });

  it('an error review alone resolves through the timeout arm, never SATISFIED', () => {
    expect(legsOver([review({})], '2026-07-21T11:40:00Z')).toStrictEqual([
      {
        reviewer: COPILOT,
        state: 'SKIPPED',
        skipReason: 'timeout',
        detail: `timeout: no substantive tip-bound review one quiet window after checks green (2026-07-21T11:40:00Z)${ONE_ERROR_NOTE}`,
      },
    ]);
  });
});

describe('computePrVerdict over a tip whose only review is a vendor error review', () => {
  it('settles NO-REVIEW, with no body to tally', () => {
    const verdict = computePrVerdict(settledReading({ reviews: [review({})] }), LATE_NOW);

    expect(verdict.state).toBe('SETTLED-NO-REVIEW');
    expect(
      verdict.evidence.filter((line) => line.startsWith('tip-bound review body present')),
    ).toStrictEqual([]);
  });
});
