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

describe('verdictFromRows — the step-back predicate, the terminal-success precedence, the epoch reset', () => {
  it('reads a settled round at cure-worthy zero as terminal success, even as the fourth round', () => {
    expect(verdictFromRows(rows([3, 2, 1, 0]), {}).kind).toBe('terminal-success');
  });

  it('arms the step-back on two consecutive non-decreasing transitions', () => {
    expect(verdictFromRows(rows([2, 2, 2]), {}).kind).toBe('step-back');
    expect(verdictFromRows(rows([1, 2, 3]), {}).kind).toBe('step-back');
    expect(verdictFromRows(rows([4, 2, 4]), {}).kind).toBe('converging');
  });

  it('arms the step-back on four settled rounds in the epoch while the latest is non-zero', () => {
    expect(verdictFromRows(rows([3, 2, 1, 1]), {}).kind).toBe('step-back');
    expect(verdictFromRows(rows([3, 2, 1]), {}).kind).toBe('converging');
  });

  it('opens a new epoch at a head marked as the class fix: counting and both arms restart there', () => {
    const settled = rows([3, 2, 1, 1]);
    const reset = verdictFromRows(settled, { classFixHeads: ['h4'] });
    expect(reset.kind).toBe('converging');
    expect(reset.epoch).toBe(2);
    expect(reset.counts).toStrictEqual([1]);
    const priorEpochKept = verdictFromRows([...settled, row('h5', 1), row('h6', 1), row('h7', 1)], {
      classFixHeads: ['h4'],
    });
    expect(priorEpochKept.kind).toBe('step-back');
    expect(priorEpochKept.counts).toStrictEqual([1, 1, 1, 1]);
  });

  it('reads a latest round with a signed disposition carrying no marker as manual tally required', () => {
    expect(verdictFromRows([row('h1', 2), row('h2', 0, { manual: 1 })], {}).kind).toBe(
      'manual-tally-required',
    );
  });

  it('reads a latest round with undispositioned findings as open — never terminal, never a step-back', () => {
    expect(verdictFromRows([row('h1', 2), row('h2', 0, { undispositioned: 1 })], {}).kind).toBe(
      'open',
    );
    expect(
      verdictFromRows(rows([2, 2]).concat(row('h3', 2, { undispositioned: 1 })), {}).kind,
    ).toBe('open');
  });

  it('reads no settled round as exactly that', () => {
    expect(verdictFromRows([], {}).kind).toBe('no-settled-round');
  });

  it('reads the #135 corpus as open: every finding undispositioned under the current signature predicate', () => {
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
