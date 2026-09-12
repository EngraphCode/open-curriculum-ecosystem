import { describe, expect, it } from 'vitest';

import { parseRecordedHarvest } from '../../src/pr-tally/harvest.js';
import { reviewCost } from '../../src/review-cost/cost.js';
import { measureRounds } from '../../src/review-cost/measure.js';
import type { DiffStat } from '../../src/review-cost/measure.js';
import pr138 from '../pr-tally/fixtures/pr-138-harvest.json' with { type: 'json' };

const EXPECTED = ['copilot-pull-request-reviewer', 'chatgpt-codex-connector'];

// A recording carries no diffs; the reader is injected. Each push here is a
// modest edit to the same two files, the fix-push signature.
const sameFiles: DiffStat = { lines: 120, files: ['a.ts', 'b.ts'] };

describe('measureRounds — one measure per reviewed head of the #138 recording', () => {
  it('measures every head a declared reviewer reviewed, in branch order, with the diff reader', () => {
    const harvest = parseRecordedHarvest(pr138);
    const calls: [string, string][] = [];
    const rounds = measureRounds({
      harvest,
      expectedReviewers: EXPECTED,
      baseRef: 'origin/engraph',
      diff: (from, to) => {
        calls.push([from, to]);
        return sameFiles;
      },
    });
    expect(rounds.length).toBeGreaterThan(3);
    expect(calls[0]?.[0]).toBe('origin/engraph');
    expect(calls[1]?.[0]).toBe(rounds[0]?.head);
    expect(rounds[0]?.hoursSincePrevious).toBeNull();
    expect(rounds[0]?.relatedness).toBe(0);
    expect(rounds.slice(1).every((round) => round.relatedness === 1)).toBe(true);
    expect(rounds.every((round) => round.findings > 0 && round.commentChars > 0)).toBe(true);
  });

  it('reads the #138 loop — seven reviewed heads of fix-pushes — as exhausted against a budget of two', () => {
    const harvest = parseRecordedHarvest(pr138);
    const rounds = measureRounds({
      harvest,
      expectedReviewers: EXPECTED,
      baseRef: 'origin/engraph',
      diff: () => sameFiles,
    });
    expect(reviewCost(rounds, 2).verdict).toBe('exhausted');
  });
});
