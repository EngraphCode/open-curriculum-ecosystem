/**
 * Unit tests for the tracked-tree gates' pure core, over literal git outputs
 * and literal file lists (tests never use or create IO: `testing-strategy.md`
 * §Philosophy). The process edge that runs git and the tools has no test here;
 * its run against this repository is recorded in the pull request that added it.
 */
import { describe, expect, it } from 'vitest';

import {
  argvChunks,
  combinedExitCode,
  markdownOnly,
  parseNulSeparatedPaths,
  parseSymlinkPaths,
  trackedCheckFiles,
} from './repo-check-files.js';

describe('parseNulSeparatedPaths', () => {
  it('splits git -z output into paths in order', () => {
    expect(parseNulSeparatedPaths('a.md\u0000b/c.ts\u0000')).toStrictEqual(['a.md', 'b/c.ts']);
  });

  it('keeps a space, a tab and a newline inside a path', () => {
    expect(parseNulSeparatedPaths('a b.md\u0000c\td.md\u0000e\nf.md\u0000')).toStrictEqual([
      'a b.md',
      'c\td.md',
      'e\nf.md',
    ]);
  });

  it('gives no paths for empty output', () => {
    expect(parseNulSeparatedPaths('')).toStrictEqual([]);
  });
});

describe('parseSymlinkPaths', () => {
  it('names the index entries whose mode is a symbolic link', () => {
    const stage = [
      '100644 aaaa 0\tREADME.md',
      '120000 bbbb 0\t.claude/skills/tool',
      '100755 cccc 0\tscripts/run.sh',
    ].join('\u0000');
    expect(parseSymlinkPaths(`${stage}\u0000`)).toStrictEqual(new Set(['.claude/skills/tool']));
  });

  it('keeps a tab inside a symlink path, splitting only at the first tab', () => {
    expect(parseSymlinkPaths('120000 bbbb 0\tlinks/a\tb\u0000')).toStrictEqual(
      new Set(['links/a\tb']),
    );
  });

  it('names none when the index holds no symbolic link', () => {
    expect(parseSymlinkPaths('100644 aaaa 0\tREADME.md\u0000')).toStrictEqual(new Set());
  });
});

describe('trackedCheckFiles', () => {
  it('drops tracked paths gone from the working tree and symbolic links, keeping order', () => {
    expect(
      trackedCheckFiles({
        tracked: ['a.md', 'deleted.ts', 'link', 'b.ts', 'retyped.md'],
        goneFromWorkingTree: new Set(['deleted.ts', 'retyped.md']),
        symlinks: new Set(['link']),
      }),
    ).toStrictEqual(['a.md', 'b.ts']);
  });
});

describe('markdownOnly', () => {
  it('keeps the Markdown paths in order', () => {
    expect(markdownOnly(['a.md', 'b.ts', 'docs/c.md', 'd.mdx'])).toStrictEqual([
      'a.md',
      'docs/c.md',
    ]);
  });
});

describe('argvChunks', () => {
  it('gives no chunk for no files', () => {
    expect(argvChunks([], 100)).toStrictEqual([]);
  });

  it('keeps every file in one chunk when all fit the budget', () => {
    expect(argvChunks(['a.md', 'b.md'], 100)).toStrictEqual([['a.md', 'b.md']]);
  });

  it('splits in order, each chunk within the budget, each file exactly once', () => {
    // Each path costs its UTF-8 bytes plus one terminator: 'aaaa' costs 5.
    const files = ['aaaa', 'bbbb', 'cccc', 'dddd', 'eeee'];
    const chunks = argvChunks(files, 10);
    expect(chunks).toStrictEqual([['aaaa', 'bbbb'], ['cccc', 'dddd'], ['eeee']]);
    expect(chunks.flat()).toStrictEqual(files);
  });

  it('counts UTF-8 bytes, not characters', () => {
    // 'é' is two bytes in UTF-8, so 'éé' costs 5 and two of them overflow 9.
    expect(argvChunks(['éé', 'éé'], 9)).toStrictEqual([['éé'], ['éé']]);
  });

  it('gives a path longer than the budget a chunk of its own', () => {
    expect(argvChunks(['a', 'a-very-long-path', 'b'], 4)).toStrictEqual([
      ['a'],
      ['a-very-long-path'],
      ['b'],
    ]);
  });
});

describe('combinedExitCode', () => {
  it('passes when every run passed', () => {
    expect(combinedExitCode([0, 0, 0])).toBe(0);
  });

  it('gives the first failing status when any run failed', () => {
    expect(combinedExitCode([0, 2, 1])).toBe(2);
  });

  it('passes when nothing ran', () => {
    expect(combinedExitCode([])).toBe(0);
  });
});
