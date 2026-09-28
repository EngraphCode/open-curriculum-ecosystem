/**
 * Unit tests for reading the tracked tree from literal git outputs (tests never
 * use or create IO: `testing-strategy.md` §Philosophy). Every read fails
 * closed: a git failure is the gate's failure, never an empty list.
 */
import { describe, expect, it } from 'vitest';

import { trackedTreeReading } from './repo-check-universe.js';

const ok = (stdout: string) => ({ status: 0, stdout, stderr: '' });

describe('trackedTreeReading', () => {
  it('reads the tracked files, those gone from the working tree, and the symlinks', () => {
    const result = trackedTreeReading({
      tracked: ok('a.md\u0000gone.ts\u0000link\u0000'),
      gone: ok('gone.ts\u0000'),
      stage: ok('100644 aaaa 0\ta.md\u0000100644 bbbb 0\tgone.ts\u0000120000 cccc 0\tlink\u0000'),
    });
    expect(result).toStrictEqual({
      ok: true,
      value: {
        tracked: ['a.md', 'gone.ts', 'link'],
        goneFromWorkingTree: new Set(['gone.ts']),
        symlinks: new Set(['link']),
      },
    });
  });

  it('reads nothing gone and no symlinks as empty sets', () => {
    const result = trackedTreeReading({
      tracked: ok('a.md\u0000'),
      gone: ok(''),
      stage: ok('100644 aaaa 0\ta.md\u0000'),
    });
    expect(result).toStrictEqual({
      ok: true,
      value: { tracked: ['a.md'], goneFromWorkingTree: new Set(), symlinks: new Set() },
    });
  });

  it("fails in git's own words when listing the tracked files fails", () => {
    const result = trackedTreeReading({
      tracked: { status: 128, stdout: '', stderr: 'fatal: not a git repository' },
      gone: ok(''),
      stage: ok(''),
    });
    expect(result).toStrictEqual({
      ok: false,
      error: { kind: 'git-failed', status: 128, stderr: 'fatal: not a git repository' },
    });
  });

  it('refuses a listing that names no tracked file', () => {
    const result = trackedTreeReading({ tracked: ok(''), gone: ok(''), stage: ok('') });
    expect(result).toStrictEqual({ ok: false, error: { kind: 'empty-listing' } });
  });

  it('fails when reading the working tree changes fails', () => {
    const result = trackedTreeReading({
      tracked: ok('a.md\u0000'),
      gone: { status: 129, stdout: '', stderr: 'error: unknown option' },
      stage: ok(''),
    });
    expect(result).toStrictEqual({
      ok: false,
      error: { kind: 'git-failed', status: 129, stderr: 'error: unknown option' },
    });
  });

  it('fails when reading the index modes fails, rather than treating no file as a symlink', () => {
    const result = trackedTreeReading({
      tracked: ok('a.md\u0000'),
      gone: ok(''),
      stage: { status: null, stdout: '', stderr: 'git was killed by SIGTERM' },
    });
    expect(result).toStrictEqual({
      ok: false,
      error: { kind: 'git-failed', status: null, stderr: 'git was killed by SIGTERM' },
    });
  });
});
