import { quoteOf } from './completion-comments.js';
import { normaliseLogin } from './reviewer-legs.js';
import type { BlockingLegVerdict, HarvestedReview, ReviewerLeg } from './reviewer-legs.js';
import type { PrStateReading } from './state-types.js';

/**
 * How the settlement half reads the completion-comment transport: the union
 * of both transports the legs compute over, one evidence line per result
 * that arrived by comment (a review-object result is the leg's default and
 * carries no transport line), and the refusals — an expected reviewer's
 * comment that fails a precondition, or binds a commit that is not the tip,
 * while that reviewer's leg is OWED or timed out
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

/** A refused completion comment: the reviewer it belongs to and the evidence line. */
export interface CompletionRefusal {
  readonly author: string;
  readonly line: string;
}

// A leg the tip has not answered: OWED, or timed out. A SATISFIED leg's other
// comments, whatever their date, are past rounds, and a tip-bound quota
// marker is that reviewer's later word — neither is a near-miss.
function unanswered(leg: ReviewerLeg): boolean {
  return leg.state === 'OWED' || (leg.state === 'SKIPPED' && leg.skipReason === 'timeout');
}

/**
 * One refusal per completion comment of a reviewer whose leg the tip has not
 * answered: the failed precondition and a quote.
 */
export function completionRefusals(
  reading: PrStateReading,
  legs: readonly ReviewerLeg[],
): CompletionRefusal[] {
  const open = new Set(legs.filter(unanswered).map((leg) => normaliseLogin(leg.reviewer)));
  const { reviews, refused } = reading.completionComments;
  const stale = reviews
    .filter((review) => review.commitOid !== reading.headRefOid)
    .filter((review) => open.has(normaliseLogin(review.author)))
    .map((review) => ({
      author: review.author,
      line: `${review.author}: completion comment ${review.id} at ${review.submittedAt} refused — names commit ${review.commitOid.slice(0, 10)}, not the current tip; "${quoteOf(review.body)}"`,
    }));
  const failed = refused
    .filter((comment) => open.has(normaliseLogin(comment.author)))
    .map((comment) => ({
      author: comment.author,
      line: `${comment.author}: completion comment ${comment.id} at ${comment.createdAt} refused — ${comment.precondition}; "${comment.quote}"`,
    }));
  return [...stale, ...failed];
}

/**
 * Whether the refusals decide the verdict: they do when the round is
 * otherwise settled, or when one belongs to the blocking reviewer and no
 * live run is composing that reviewer's result. A refusal on another
 * reviewer rides in the evidence beside the blocking leg's own state, which
 * names the reader's next act.
 */
export function refusalDecides(
  blocking: BlockingLegVerdict,
  refusals: readonly CompletionRefusal[],
): boolean {
  if (refusals.length === 0) {
    return false;
  }
  if (blocking.kind === 'settled') {
    return true;
  }
  return (
    blocking.kind !== 'WAITING-REVIEW-RUN-LIVE' &&
    refusals.some((refusal) => normaliseLogin(refusal.author) === normaliseLogin(blocking.reviewer))
  );
}
