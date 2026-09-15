import { describe, expect, it } from 'vitest';

import { readBudget } from '../../src/review-cost/budget.js';

describe('readBudget — the declared settlement-push budget from the description', () => {
  it('reads the template intake line with an em dash', () => {
    expect(readBudget('bar — PDR-140 clause 9; budget — 2 settlement pushes.')).toStrictEqual({
      pushes: 2,
      declared: true,
    });
  });

  it('reads a colon form and a longer budget', () => {
    expect(readBudget('Settlement-push budget: 3 (owner rebudget)').pushes).toBe(3);
  });

  it('defaults to two when no line declares it', () => {
    expect(readBudget('A description with no intake.')).toStrictEqual({
      pushes: 2,
      declared: false,
    });
  });
});
