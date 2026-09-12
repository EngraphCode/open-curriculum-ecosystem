import { describe, expect, it } from 'vitest';

import { parseRecordedHarvest } from '../../src/pr-tally/harvest.js';
import { buildRows } from '../../src/pr-tally/rows.js';
import { verdict } from '../../src/pr-tally/verdict.js';
import pr135 from './fixtures/pr-135-harvest.json' with { type: 'json' };
import pr136 from './fixtures/pr-136-harvest.json' with { type: 'json' };
import pr138 from './fixtures/pr-138-harvest.json' with { type: 'json' };

// The recorded corpora read end to end — parse, rows, verdict — the seat's
// own tallies as the composed instrument reads them. No IO: the recordings
// are imported. Each unit's own suite proves it in isolation.
const EXPECTED = ['copilot-pull-request-reviewer', 'chatgpt-codex-connector'];

describe('the recorded corpora through the whole instrument', () => {
  it('reads the #135 corpus as open: nothing in it is signed to the predicate, so nothing is dispositioned', () => {
    const result = verdict(
      buildRows({ harvest: parseRecordedHarvest(pr135), expectedReviewers: EXPECTED }),
      {},
    );
    expect(result.kind).toBe('open');
    expect(result.evidence.join('\n')).toMatch(/undispositioned/u);
  });

  it('reads the #138 corpus as open at its final head: one suppressed item without a one-line disposition', () => {
    const result = verdict(
      buildRows({ harvest: parseRecordedHarvest(pr138), expectedReviewers: EXPECTED }),
      { classFixHeads: ['a1ec078e2'] },
    );
    expect(result.kind).toBe('open');
    expect(result.epoch).toBe(2);
    expect(result.counts).toStrictEqual([9, 3, 1, 0]);
  });

  it('reads the #136 corpus as open with the counts of epoch three at 3, 2, 1, 0 — the tally the seat kept', () => {
    const result = verdict(
      buildRows({ harvest: parseRecordedHarvest(pr136), expectedReviewers: EXPECTED }),
      { classFixHeads: ['1ca90fece', 'bc6370624'] },
    );
    expect(result.kind).toBe('open');
    expect(result.epoch).toBe(3);
    expect(result.counts).toStrictEqual([3, 2, 1, 0]);
  });
});
