import { describe, expect, it } from 'vitest';

import { parseRecordedHarvest } from '../../src/pr-tally/harvest.js';
import { buildRows } from '../../src/pr-tally/rows.js';
import type { TallyRow } from '../../src/pr-tally/rows.js';
import { verdict, verdictFromRows } from '../../src/pr-tally/verdict.js';
import pr135 from './fixtures/pr-135-harvest.json' with { type: 'json' };
import pr138 from './fixtures/pr-138-harvest.json' with { type: 'json' };

const EXPECTED = ['copilot-pull-request-reviewer', 'chatgpt-codex-connector'];

const row = (
  head: string,
  cureWorthy: number,
  extra: Partial<Pick<TallyRow, 'undispositioned' | 'manual'>> = {},
): TallyRow => ({
  head,
  settled: true,
  reviewers: EXPECTED,
  owed: [],
  raised: cureWorthy + (extra.undispositioned ?? 0) + (extra.manual ?? 0),
  cureWorthy,
  undispositioned: extra.undispositioned ?? 0,
  manual: extra.manual ?? 0,
});

const rows = (counts: readonly number[]) =>
  counts.map((count, index) => row(`h${index + 1}`, count));

const kindOf = (settled: readonly TallyRow[], options = {}) =>
  verdictFromRows({ rows: settled }, options).kind;

describe('verdictFromRows — the step-back predicate, the terminal-success precedence, the epoch reset', () => {
  it('reads a settled round at cure-worthy zero as terminal success, even as the fourth round', () => {
    expect(kindOf(rows([3, 2, 1, 0]))).toBe('terminal-success');
  });

  it('arms the step-back on two consecutive non-decreasing transitions', () => {
    expect(kindOf(rows([2, 2, 2]))).toBe('step-back');
    expect(kindOf(rows([1, 2, 3]))).toBe('step-back');
    expect(kindOf(rows([4, 2, 4]))).toBe('converging');
  });

  it('arms the step-back on four settled rounds in the epoch while the latest is non-zero', () => {
    expect(kindOf(rows([3, 2, 1, 1]))).toBe('step-back');
    expect(kindOf(rows([3, 2, 1]))).toBe('converging');
  });

  it('opens a new epoch at a head marked as the class fix: counting and both arms restart there', () => {
    const settled = rows([3, 2, 1, 1]);
    const reset = verdictFromRows({ rows: settled }, { classFixHeads: ['h4'] });
    expect(reset.kind).toBe('converging');
    expect(reset.epoch).toBe(2);
    expect(reset.counts).toStrictEqual([1]);
    const grown = verdictFromRows(
      { rows: [...settled, row('h5', 1), row('h6', 1), row('h7', 1)] },
      { classFixHeads: ['h4'] },
    );
    expect(grown.kind).toBe('step-back');
    expect(grown.counts).toStrictEqual([1, 1, 1, 1]);
  });

  it('opens the epoch at a class-fix head that was superseded before it settled', () => {
    const result = verdictFromRows(
      { rows: [...rows([2, 2]), row('h4', 1)], heads: ['h1', 'h2', 'h3', 'h4'] },
      { classFixHeads: ['h3'] },
    );
    expect(result.epoch).toBe(2);
    expect(result.counts).toStrictEqual([1]);
    expect(result.kind).toBe('converging');
  });

  it('reads any settled row with a signed disposition carrying no marker as manual tally required', () => {
    expect(kindOf([row('h1', 2, { manual: 1 }), row('h2', 0)])).toBe('manual-tally-required');
  });

  it('reads any settled row with undispositioned findings as open — never terminal, never a step-back', () => {
    expect(kindOf([row('h1', 2, { undispositioned: 1 }), row('h2', 0)])).toBe('open');
    expect(kindOf([...rows([2, 2]), row('h3', 2, { undispositioned: 1 })])).toBe('open');
  });

  it('reads a current head that has not settled as open, whatever the last settled row says', () => {
    const result = verdictFromRows(
      { rows: rows([3, 0]), heads: ['h1', 'h2', 'h3'], unsettledHead: 'h3' },
      {},
    );
    expect(result.kind).toBe('open');
    expect(result.evidence[0]).toMatch(/current head h3 is not settled/u);
  });

  it('reads no settled round as exactly that', () => {
    expect(kindOf([])).toBe('no-settled-round');
  });

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
});
