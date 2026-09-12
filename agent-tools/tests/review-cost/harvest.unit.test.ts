import { describe, expect, it } from 'vitest';

import { gitDiffStat } from '../../src/review-cost/harvest.js';

// The git seam is injected: no process is spawned.
const runner =
  (parents: string, numstat: string) =>
  (_file: string, args: readonly string[]): string =>
    args[0] === 'rev-list' ? parents : numstat;

describe('gitDiffStat — a push is measured by its own diff; a sync merge measures zero', () => {
  it('sums added and deleted lines and lists the files of an ordinary push', () => {
    const stat = gitDiffStat('a', 'b', runner('b a', '10\t2\tsrc/x.ts\n0\t5\tdocs/y.md\n'));
    expect(stat).toStrictEqual({ lines: 17, files: ['src/x.ts', 'docs/y.md'] });
  });

  it('measures a merge commit as zero: a sync from the base changes no reviewed content', () => {
    const stat = gitDiffStat('a', 'm', runner('m a base', '900\t300\tsrc/x.ts\n'));
    expect(stat).toStrictEqual({ lines: 0, files: [] });
  });
});
