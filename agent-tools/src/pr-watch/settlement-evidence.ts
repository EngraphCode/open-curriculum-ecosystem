import { reviewConfigurationEvidence } from './review-configuration.js';
import type { ReviewerLeg } from './reviewer-legs.js';
import { runsEvidence } from './run-evidence.js';
import type { PrStateReading } from './state-types.js';

/**
 * The evidence lines every reviewer-leg verdict carries about the reading it
 * was made from: the review configuration the legs were read against, whether
 * the expected set was declared, and the run surface's gaps. One owner, so a
 * settled verdict and a blocked one name the same grounds the same way.
 *
 * @packageDocumentation
 */

function expectedSetEvidence(reading: PrStateReading): string[] {
  return reading.expectedDeclared
    ? []
    : [
        'expected reviewer set DEFAULTED from the observed surface — declare --expect for the first-round guarantee',
      ];
}

/** The configuration, the expected set's source and the run surface, on every reviewer-leg verdict. */
export function readingEvidence(reading: PrStateReading): string[] {
  return [
    reviewConfigurationEvidence(reading.reviewConfiguration),
    ...expectedSetEvidence(reading),
    ...runsEvidence(reading),
  ];
}

/**
 * The first line of a SETTLE-READY verdict. A set DECLARED empty
 * (`--expect none`, expect-flag.ts) has no leg to settle: the seat judged the
 * work needs no pull-request review to be safe and effective (the owner's
 * word of 2026-10-27), and the quiet window ran from checks green. The line
 * names the declaration so the merge record carries the judgement.
 */
export function settledLead(legs: readonly ReviewerLeg[]): string {
  return legs.length === 0
    ? 'no reviewer leg is expected: the set was declared empty (--expect none) — the seat judged this work needs no pull-request review to be safe and effective; quiet window elapsed since checks green'
    : 'every expected reviewer leg settled; quiet window elapsed';
}
