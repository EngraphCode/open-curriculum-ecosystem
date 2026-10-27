import { describe, expect, it } from 'vitest';

import { isScopeDeclaredSkip, isSkipMarker } from './skip-markers.js';

/**
 * A skip phrase outside quotation declares that no review occurred; the same
 * phrase inside a double-quoted span or a code span is a reviewer reporting
 * what was said. A vendor's blockquoted marker is still a marker.
 */

describe('isSkipMarker', () => {
  it.each([
    'Unable to review: service unavailable.',
    'Review skipped: unable to review this pull request.',
    '⚠️ **Code review skipped** — overage spend limit reached.',
    '> [!IMPORTANT]\n> ## Review skipped\n> Auto reviews are disabled on this repository.',
  ])('reads %j as a skip marker', (body) => {
    expect(isSkipMarker(body)).toBe(true);
  });

  it.each([
    'The body "Unable to review: service unavailable" must satisfy no leg.',
    'The summary quotes “review skipped” from the vendor.',
    'The parser matches `unable to review` in every body.',
    '🟢 No findings. Reviewed 2 of 2 files.',
  ])('never reads %j as a skip marker', (body) => {
    expect(isSkipMarker(body)).toBe(false);
  });
});

describe('isScopeDeclaredSkip', () => {
  it('reads a marker that names its quota scope as scope-declared, and a bare marker as not', () => {
    expect(isScopeDeclaredSkip('⚠️ **Code review skipped** — overage spend limit reached.')).toBe(
      true,
    );
    expect(isScopeDeclaredSkip('Unable to review: service unavailable.')).toBe(false);
    expect(isScopeDeclaredSkip('The body "Review skipped: quota reached" is quoted.')).toBe(false);
  });
});
