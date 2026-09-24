/**
 * Unit tests for the pure half of the tracked-path set, over literal inputs
 * (tests never use or create IO: `testing-strategy.md` §Philosophy). The
 * `git ls-files` read in `listTrackedFiles` runs git directly, so it has no
 * unit test while it does.
 */
import { describe, expect, it } from 'vitest';

import { withImpliedDirectories } from './repository-paths.js';

describe('withImpliedDirectories', () => {
  it('adds every ancestor directory of a tracked file', () => {
    expect(withImpliedDirectories(['.agent/state/collaboration/.gitignore'])).toStrictEqual(
      new Set([
        '.agent/state/collaboration/.gitignore',
        '.agent/state/collaboration',
        '.agent/state',
        '.agent',
      ]),
    );
  });

  it('adds no entry for the repository root', () => {
    expect(withImpliedDirectories(['README.md', 'package.json'])).toStrictEqual(
      new Set(['README.md', 'package.json']),
    );
  });

  it('keeps one entry for a directory shared by several files', () => {
    expect(withImpliedDirectories(['docs/a.md', 'docs/b.md'])).toStrictEqual(
      new Set(['docs/a.md', 'docs/b.md', 'docs']),
    );
  });

  it('adds each missing intermediate directory when files share only a higher ancestor', () => {
    expect(withImpliedDirectories(['docs/a.md', 'docs/guides/deep/b.md'])).toStrictEqual(
      new Set(['docs/a.md', 'docs', 'docs/guides/deep/b.md', 'docs/guides/deep', 'docs/guides']),
    );
  });

  it('gives an empty set for no tracked files', () => {
    expect(withImpliedDirectories([])).toStrictEqual(new Set());
  });
});
