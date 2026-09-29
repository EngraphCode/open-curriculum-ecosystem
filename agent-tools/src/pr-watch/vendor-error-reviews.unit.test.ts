import { describe, expect, it } from 'vitest';

import { isVendorErrorReview } from './vendor-error-reviews.js';

/**
 * A vendor's error review is known by its whole body against the recorded
 * set, whatever the review's state, so a finding that quotes its wording is
 * never read as one.
 */

const COPILOT_ERROR =
  'Copilot encountered an error and was unable to review this pull request. You can try again by re-requesting a review.';

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
