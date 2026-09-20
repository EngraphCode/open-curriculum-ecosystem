import { quoteOf } from './completion-comments.js';
import { normaliseLogin } from './reviewer-legs.js';
import type { HarvestedReview, ReviewerLeg } from './reviewer-legs.js';
import type { PrStateReading } from './state-types.js';

/**
 * How the settlement half reads the completion-comment transport: the union
 * of both transports the legs compute over, one evidence line per result
 * that arrived by comment (a review-object result is the leg's default and
 * carries no transport line), and the refusals — an expected reviewer's
 * comment that fails a precondition, or binds a commit that is not the tip,
 * while that reviewer's leg is unsatisfied
 * (`landing-instruments-read-the-evidence`, slice 1; decision note
 * 2026-09-16: a near-miss never reads as silence).
 */

/** Both transports of a reviewer's reported result, as the legs read them. */
export function allReviews(reading: PrStateReading): readonly HarvestedReview[] {
  return [...reading.reviews, ...reading.completionComments.reviews];
}

/** One line per completion comment bound to the tip, naming the transport. */
export function completionTransportEvidence(reading: PrStateReading): string[] {
  return reading.completionComments.reviews
    .filter((review) => review.commitOid === reading.headRefOid)
    .map(
      (review) =>
        `${review.author}: completion comment ${review.id} at ${review.submittedAt} read as a review of the tip (transport: completion-comment)`,
    );
}

/**
 * One line per refused completion comment of a reviewer whose leg is not
 * SATISFIED: the failed precondition and a quote. A reviewer whose leg the
 * tip already satisfies has nothing to refuse — its older comments are past
 * rounds, not near-misses.
 */
export function completionRefusalEvidence(
  reading: PrStateReading,
  legs: readonly ReviewerLeg[],
): string[] {
  const unsatisfied = new Set(
    legs.filter((leg) => leg.state !== 'SATISFIED').map((leg) => normaliseLogin(leg.reviewer)),
  );
  const { reviews, refused } = reading.completionComments;
  const staleLines = reviews
    .filter((review) => review.commitOid !== reading.headRefOid)
    .filter((review) => unsatisfied.has(normaliseLogin(review.author)))
    .map(
      (review) =>
        `${review.author}: completion comment ${review.id} at ${review.submittedAt} refused — names commit ${review.commitOid.slice(0, 10)}, not the current tip; "${quoteOf(review.body)}"`,
    );
  const refusedLines = refused
    .filter((comment) => unsatisfied.has(normaliseLogin(comment.author)))
    .map(
      (comment) =>
        `${comment.author}: completion comment ${comment.id} at ${comment.createdAt} refused — ${comment.precondition}; "${comment.quote}"`,
    );
  return [...staleLines, ...refusedLines];
}
