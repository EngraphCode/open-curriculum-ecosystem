/**
 * Review bodies a vendor posts when its review run failed. Such a review
 * object says that no review occurred, whatever its state, so it satisfies no
 * leg and carries no finding to tally. Each entry is a body recorded
 * first-hand, compared whole (trimmed, whitespace collapsed), so a finding
 * that quotes the wording is never read as one. A wording is added here when
 * it is first recorded; until then the skip-marker pattern in
 * `reviewer-legs.ts` is the second net.
 *
 * The Copilot body is recorded five times, each state COMMENTED: three on
 * 2026-09-13 and two on 2026-09-28.
 *
 * This module imports nothing, so both estates carry the same bytes.
 *
 * @packageDocumentation
 */

/** The recorded vendor error bodies, each as the vendor posted it. */
const VENDOR_ERROR_BODIES: readonly string[] = [
  'Copilot encountered an error and was unable to review this pull request. You can try again by re-requesting a review.',
];

function collapsed(body: string): string {
  return body.trim().replaceAll(/\s+/gu, ' ');
}

const KNOWN = new Set(VENDOR_ERROR_BODIES.map(collapsed));

/**
 * Whether a review body is a recorded vendor error body: the vendor could not
 * review.
 *
 * @param body - The review's body.
 */
export function isVendorErrorReview(body: string): boolean {
  return KNOWN.has(collapsed(body));
}

/**
 * The leg-detail note that counts the vendor error reviews among a tip's
 * review bodies, or an empty string when there are none: discarded evidence
 * is counted, never dropped silently.
 *
 * @param bodies - The bodies of the reviews that stand for the tip.
 */
export function vendorErrorNote(bodies: readonly string[]): string {
  const errors = bodies.filter(isVendorErrorReview).length;
  return errors === 0
    ? ''
    : `; ${String(errors)} tip-bound vendor error review${errors === 1 ? '' : 's'} ignored (the vendor could not review this tip)`;
}
