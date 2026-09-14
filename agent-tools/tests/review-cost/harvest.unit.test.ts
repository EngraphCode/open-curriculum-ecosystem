import { describe, expect, it } from 'vitest';

import { gitDiffStat, isSyncPush } from '../../src/review-cost/harvest.js';

// The git seam is injected: no process is spawned. `answers` maps each git
// argument list (joined) to its output.
const runner =
  (answers: Readonly<Record<string, string>>) =>
  (_file: string, args: readonly string[]): string =>
    answers[args.join(' ')] ?? '';

const BASE_CHANGES = '40\t3\tdocs/base.md\n';

describe('gitDiffStat — a push is measured by its own diff; only a pure base sync measures zero', () => {
  it('sums added and deleted lines and lists the files of an ordinary push', () => {
    const stat = gitDiffStat(
      'a',
      'b',
      runner({
        'rev-list --parents -n 1 b': 'b a',
        'diff --numstat a..b': '10\t2\tsrc/x.ts\n0\t5\tdocs/y.md\n',
      }),
    );
    expect(stat).toStrictEqual({ lines: 17, files: ['src/x.ts', 'docs/y.md'], sync: false });
  });

  it('measures a pure base sync as zero: the merge brings in exactly what the base side carries', () => {
    const stat = gitDiffStat(
      'a',
      'm',
      runner({
        'rev-list --parents -n 1 m': 'm a base',
        'diff --numstat a..m': BASE_CHANGES,
        'diff --numstat a...base': BASE_CHANGES,
      }),
    );
    expect(stat).toStrictEqual({ lines: 0, files: [], sync: true });
  });

  it('prices a merge that carries branch-side changes in full, never as a sync', () => {
    const stat = gitDiffStat(
      'a',
      'm',
      runner({
        'rev-list --parents -n 1 m': 'm a base',
        'diff --numstat a..m': `${BASE_CHANGES}30\t1\tsrc/cure.ts\n`,
        'diff --numstat a...base': BASE_CHANGES,
      }),
    );
    expect(stat).toStrictEqual({ lines: 74, files: ['docs/base.md', 'src/cure.ts'], sync: false });
  });
});

describe('isSyncPush — a push is a sync only when it is one base merge over the head the remote holds', () => {
  it('recognises one merge of the base over the remote head that changes nothing else', () => {
    const run = runner({
      'rev-list --parents -n 1 m': 'm a base',
      'diff --numstat a..m': BASE_CHANGES,
      'diff --numstat a...base': BASE_CHANGES,
    });
    expect(isSyncPush('a', 'm', run)).toBe(true);
  });

  it('refuses a merge whose first parent is not the remote head: other commits ride along', () => {
    const run = runner({
      'rev-list --parents -n 1 m': 'm c base',
      'diff --numstat c..m': BASE_CHANGES,
      'diff --numstat c...base': BASE_CHANGES,
    });
    expect(isSyncPush('a', 'm', run)).toBe(false);
  });

  it('refuses a merge that carries branch-side changes, and a plain commit', () => {
    const merge = runner({
      'rev-list --parents -n 1 m': 'm a base',
      'diff --numstat a..m': `${BASE_CHANGES}30\t1\tsrc/cure.ts\n`,
      'diff --numstat a...base': BASE_CHANGES,
    });
    expect(isSyncPush('a', 'm', merge)).toBe(false);
    expect(isSyncPush('a', 'b', runner({ 'rev-list --parents -n 1 b': 'b a' }))).toBe(false);
  });
});
