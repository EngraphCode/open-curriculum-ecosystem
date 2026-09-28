import { describe, expect, it } from 'vitest';

import { smokeTestFiles, summariseSmokeRun } from './smoke-suite.js';

/**
 * The smoke suite is derived from the directory: every `*.smoke.ts` runs, in
 * a stable order, and the verdict is the conjunction of every run.
 */

describe('smokeTestFiles', () => {
  it('keeps only the smoke files, in code-point order, whatever else the directory holds', () => {
    // 'A' sorts before 'a' by code point; a locale sort would interleave them.
    expect(
      smokeTestFiles(['b.smoke.ts', 'README.md', 'A.smoke.ts', 'a.smoke.ts', 'helper.ts']),
    ).toStrictEqual(['A.smoke.ts', 'a.smoke.ts', 'b.smoke.ts']);
  });

  it('reads an empty directory as no smoke files', () => {
    expect(smokeTestFiles([])).toStrictEqual([]);
  });
});

describe('summariseSmokeRun', () => {
  it('is green only when every smoke exited 0, with one line per smoke and a verdict', () => {
    expect(
      summariseSmokeRun([
        { file: 'a.smoke.ts', status: 0, signal: null },
        { file: 'b.smoke.ts', status: 0, signal: null },
      ]),
    ).toStrictEqual({
      ok: true,
      lines: [
        'smoke ok   a.smoke.ts (exit 0)',
        'smoke ok   b.smoke.ts (exit 0)',
        'smoke suite: 2 passed',
      ],
    });
  });

  it('names every failure and counts them in the verdict', () => {
    expect(
      summariseSmokeRun([
        { file: 'a.smoke.ts', status: 0, signal: null },
        { file: 'b.smoke.ts', status: 2, signal: null },
      ]),
    ).toStrictEqual({
      ok: false,
      lines: [
        'smoke ok   a.smoke.ts (exit 0)',
        'smoke FAIL b.smoke.ts (exit 2)',
        'smoke suite: 1 of 2 failed',
      ],
    });
  });

  it('reports a signal death by its signal, never as an exit code', () => {
    expect(
      summariseSmokeRun([{ file: 'a.smoke.ts', status: null, signal: 'SIGTERM' }]),
    ).toStrictEqual({
      ok: false,
      lines: ['smoke FAIL a.smoke.ts (killed by SIGTERM)', 'smoke suite: 1 of 1 failed'],
    });
  });

  it('reads an empty suite as a failure, never a pass', () => {
    expect(summariseSmokeRun([])).toStrictEqual({
      ok: false,
      lines: [expect.stringContaining('no smoke tests')],
    });
  });
});
