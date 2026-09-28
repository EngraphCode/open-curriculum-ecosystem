import { describe, expect, it } from 'vitest';

import {
  discoverAuthoredFiles,
  readOptionalFile,
  type AuthoredSurfaceFs,
} from './authored-surfaces.js';

/**
 * An in-memory tree: a directory maps to its entry names, a file to its
 * text. Absolute paths are POSIX under `/repo`, the fake repository root.
 */
type Tree = ReadonlyMap<string, string | readonly string[]>;

function enoent(): Error {
  return Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
}

function fakeFs(tree: Tree): AuthoredSurfaceFs {
  return {
    readdir: async (absoluteDir) => {
      const listing = tree.get(absoluteDir);
      if (listing === undefined || typeof listing === 'string') {
        throw enoent();
      }
      return listing.map((name) => {
        const child = tree.get(`${absoluteDir}/${name}`);
        return {
          name,
          isDirectory: () => child !== undefined && typeof child !== 'string',
          isFile: () => typeof child === 'string',
        };
      });
    },
    readFile: async (absolutePath) => {
      const content = tree.get(absolutePath);
      if (typeof content !== 'string') {
        throw enoent();
      }
      return content;
    },
  };
}

const REPO = '/repo';

const tree: Tree = new Map<string, string | readonly string[]>([
  [`${REPO}/.agent/rules`, ['a.md', 'notes.txt', 'archive', 'nested']],
  [`${REPO}/.agent/rules/a.md`, 'rule a'],
  [`${REPO}/.agent/rules/notes.txt`, 'not scanned'],
  [`${REPO}/.agent/rules/archive`, ['old.md']],
  [`${REPO}/.agent/rules/archive/old.md`, 'archived'],
  [`${REPO}/.agent/rules/nested`, ['b.md', 'CHANGELOG.md']],
  [`${REPO}/.agent/rules/nested/b.md`, 'rule b'],
  [`${REPO}/.agent/rules/nested/CHANGELOG.md`, 'history'],
  [`${REPO}/AGENTS.md`, 'entry point'],
]);

const universe = new Set([
  '.agent',
  '.agent/rules',
  '.agent/rules/a.md',
  '.agent/rules/notes.txt',
  '.agent/rules/archive',
  '.agent/rules/archive/old.md',
  '.agent/rules/nested',
  '.agent/rules/nested/b.md',
  '.agent/rules/nested/CHANGELOG.md',
  'AGENTS.md',
]);

const spec = {
  roots: ['.agent/rules', '.agent/missing'],
  rootFiles: ['AGENTS.md', 'MISSING.md'],
  extensions: new Set(['.md']),
  excludedPathFragments: ['/archive/', 'nested/CHANGELOG.md'],
  universe,
};

describe('discoverAuthoredFiles', () => {
  it('walks the roots depth-first, reads only scanned extensions, and appends present root files', async () => {
    const files = await discoverAuthoredFiles(REPO, spec, fakeFs(tree));

    expect(files).toStrictEqual([
      { path: '.agent/rules/a.md', content: 'rule a' },
      { path: '.agent/rules/nested/b.md', content: 'rule b' },
      { path: 'AGENTS.md', content: 'entry point' },
    ]);
  });

  it('skips a missing root and a missing root file without failing', async () => {
    const files = await discoverAuthoredFiles(
      REPO,
      { ...spec, roots: ['.agent/missing'], rootFiles: ['MISSING.md'] },
      fakeFs(tree),
    );

    expect(files).toStrictEqual([]);
  });

  it('prunes an excluded directory before entering it and an excluded file before reading it', async () => {
    const reads: string[] = [];
    const recording: AuthoredSurfaceFs = {
      readdir: fakeFs(tree).readdir,
      readFile: async (absolutePath) => {
        reads.push(absolutePath);
        return fakeFs(tree).readFile(absolutePath);
      },
    };

    await discoverAuthoredFiles(REPO, { ...spec, rootFiles: [] }, recording);

    expect(reads).toStrictEqual([`${REPO}/.agent/rules/a.md`, `${REPO}/.agent/rules/nested/b.md`]);
  });

  it('propagates a file-system error that is not a missing path', async () => {
    const failing: AuthoredSurfaceFs = {
      readdir: async () => {
        throw Object.assign(new Error('EACCES'), { code: 'EACCES' });
      },
      readFile: fakeFs(tree).readFile,
    };

    await expect(discoverAuthoredFiles(REPO, spec, failing)).rejects.toThrow('EACCES');
  });
});

describe('readOptionalFile', () => {
  it('returns the text of a present file and undefined for a missing one', async () => {
    await expect(readOptionalFile(`${REPO}/AGENTS.md`, fakeFs(tree))).resolves.toBe('entry point');
    await expect(readOptionalFile(`${REPO}/MISSING.md`, fakeFs(tree))).resolves.toBeUndefined();
  });
});

describe('discoverAuthoredFiles universe', () => {
  it('never enters a directory or reads a file outside the universe, however the tree looks', async () => {
    const treeWithIgnored: Tree = new Map<string, string | readonly string[]>([
      ...tree,
      [`${REPO}/.agent/rules`, ['a.md', 'notes.txt', 'archive', 'nested', 'local', 'stray.md']],
      [`${REPO}/.agent/rules/local`, ['secret.md']],
      [`${REPO}/.agent/rules/local/secret.md`, 'never read'],
      [`${REPO}/.agent/rules/stray.md`, 'untracked'],
    ]);
    const reads: string[] = [];
    const recording: AuthoredSurfaceFs = {
      readdir: fakeFs(treeWithIgnored).readdir,
      readFile: async (absolutePath) => {
        reads.push(absolutePath);
        return fakeFs(treeWithIgnored).readFile(absolutePath);
      },
    };

    const files = await discoverAuthoredFiles(REPO, { ...spec, rootFiles: [] }, recording);

    expect(files.map((file) => file.path)).toStrictEqual([
      '.agent/rules/a.md',
      '.agent/rules/nested/b.md',
    ]);
    expect(reads).not.toContain(`${REPO}/.agent/rules/local/secret.md`);
    expect(reads).not.toContain(`${REPO}/.agent/rules/stray.md`);
  });
});
