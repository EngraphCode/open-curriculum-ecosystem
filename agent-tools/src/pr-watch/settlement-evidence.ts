import { reviewConfigurationEvidence } from './review-configuration.js';
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
