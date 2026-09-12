import { describe, expect, it } from 'vitest';

import { parseRecordedHarvest } from '../../src/pr-tally/harvest.js';
import { readBarMarker } from '../../src/pr-tally/markers.js';
import pr135 from './fixtures/pr-135-harvest.json' with { type: 'json' };

describe('readBarMarker — the closed grammar of the opening bold span', () => {
  it.each([
    ['**Over-bar** (prong one). Cured in `SHA:4114e2447`.', 'over-bar'],
    ['**Below-bar** under PDR-140 clause 9(a): no reader is misled.', 'below-bar'],
    ['**In scope, over-bar** (prong two). Cured in SHA:1ca90fece.', 'over-bar'],
    ['**Out of scope, below-bar.** Rejected, no write.', 'below-bar'],
    ['**Over-bar on prong two.** Cured in SHA:4114e2447 the same way.', 'over-bar'],
    ['**over-bar on prong one** — case is not significant.', 'over-bar'],
  ])('reads %s as %s', (body, expected) => {
    expect(readBarMarker(body)).toBe(expected);
  });

  it.each([
    ['**Not over-bar**: the reviewer is mistaken.'],
    ['**Below-bar, not over-bar** — both tokens.'],
    ['**Over-bar, and also urgent** — other words in the span.'],
    ['Over-bar without any bold span.'],
    ['Cured in SHA:4114e2447. **Over-bar** later in the line is not an opening.'],
    [''],
  ])('reads %s as no marker', (body) => {
    expect(readBarMarker(body)).toBeNull();
  });

  it('reads every seat reply in the recorded #135 corpus: fourteen over-bar, three below-bar', () => {
    const harvest = parseRecordedHarvest(pr135);
    const markers = harvest.reviewThreads
      .flatMap((thread) => thread.comments)
      .filter((comment) => comment.author === 'el-graphael')
      .map((comment) => readBarMarker(comment.body));
    expect(markers.filter((marker) => marker === 'over-bar')).toHaveLength(14);
    expect(markers.filter((marker) => marker === 'below-bar')).toHaveLength(3);
    expect(markers).not.toContain(null);
  });
});
