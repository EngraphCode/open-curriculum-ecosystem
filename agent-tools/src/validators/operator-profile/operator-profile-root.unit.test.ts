import path from 'node:path';

import { err, ok, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { VALID_INDEX_DOCUMENT } from './operator-profile-fixtures.js';
import {
  type DocumentHandle,
  entryKind,
  type Presence,
  type PresenceProbe,
  type ProfileFileSystem,
  readDocument,
} from './operator-profile-fs.js';
import { type ProfileEntry } from './operator-profile-layout.js';
import { existingProfilePaths, readProfileReport } from './operator-profile-root.js';

// The probe is injected: nothing here touches a filesystem. The fake answers
// by the path's last segment, as the real probe answers by what is on disk.
const ROOT = path.join('profile-root');

type Present = Readonly<Record<string, Exclude<Presence, 'absent'>>>;

function probeOf(present: Present): PresenceProbe {
  return (target) => Promise.resolve(ok(present[path.basename(target)] ?? 'absent'));
}

describe('existingProfilePaths — the document paths a push may stage', () => {
  it('lists only the paths that exist, in layout order, so a minimal profile can be pushed', async () => {
    const probe = probeOf({ 'index.md': 'not-a-directory', machines: 'directory' });
    expect(unwrap(await existingProfilePaths(ROOT, probe))).toEqual(['index.md', 'machines']);
  });

  it('lists nothing for an empty root and everything for a full one', async () => {
    expect(unwrap(await existingProfilePaths(ROOT, probeOf({})))).toEqual([]);
    const full = probeOf({
      'index.md': 'not-a-directory',
      repos: 'directory',
      machines: 'directory',
    });
    expect(unwrap(await existingProfilePaths(ROOT, full))).toEqual([
      'index.md',
      'repos',
      'machines',
    ]);
  });

  it('reports an unreadable path as an error, never as absent', async () => {
    const probe: PresenceProbe = (target) =>
      Promise.resolve(
        path.basename(target) === 'repos' ? err(`cannot read ${target} (EACCES)`) : ok('absent'),
      );
    const result = await existingProfilePaths(ROOT, probe);
    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.error).toContain('EACCES');
  });
});

describe('entryKind', () => {
  it('reports a symlink as a symlink whatever it points at, then a directory, a file, or other', () => {
    const answers = (symlink: boolean, directory: boolean, file: boolean) => ({
      isSymbolicLink: () => symlink,
      isDirectory: () => directory,
      isFile: () => file,
    });
    expect(entryKind(answers(true, false, false))).toBe('symlink');
    expect(entryKind(answers(true, true, false))).toBe('symlink');
    expect(entryKind(answers(false, true, false))).toBe('directory');
    expect(entryKind(answers(false, false, true))).toBe('file');
    expect(entryKind(answers(false, false, false))).toBe('other');
  });
});

/** A fake filesystem: a fixed listing, a fixed document text, and the reads it was asked for. */
function fakeFileSystem(
  entries: readonly ProfileEntry[],
  text: string,
): { readonly fs: ProfileFileSystem; readonly reads: string[] } {
  const reads: string[] = [];
  const fs: ProfileFileSystem = {
    presence: () => Promise.resolve(ok('directory')),
    listEntries: (_root, dirName) => Promise.resolve(ok(dirName === undefined ? [...entries] : [])),
    readDocument: (absolute) => {
      reads.push(absolute);
      return Promise.resolve(ok(text));
    },
    isGitRepository: () => Promise.resolve(false),
  };
  return { fs, reads };
}

describe('readProfileReport — entries that are not regular files', () => {
  it('reads a regular index.md and reports it as one conforming document', async () => {
    const { fs, reads } = fakeFileSystem(
      [{ relPath: 'index.md', kind: 'file' }],
      VALID_INDEX_DOCUMENT,
    );
    expect(unwrap(await readProfileReport(ROOT, fs))).toMatchObject({
      documentCount: 1,
      failures: [],
    });
    expect(reads).toEqual([path.join(ROOT, 'index.md')]);
  });

  it('refuses a symlinked index.md as not a regular file and never reads through it', async () => {
    // The fake would answer the read with a conforming document; a report
    // that names no document and asked for no read proves the link was
    // refused by kind, not read and validated.
    const { fs, reads } = fakeFileSystem(
      [{ relPath: 'index.md', kind: 'symlink' }],
      VALID_INDEX_DOCUMENT,
    );
    expect(unwrap(await readProfileReport(ROOT, fs))).toMatchObject({
      documentCount: 0,
      failures: [
        {
          relPath: 'index.md',
          messages: [
            'index.md is not a regular file or directory (a symlink or a special entry) — never read as part of the profile',
          ],
        },
      ],
    });
    expect(reads).toEqual([]);
  });

  it("reports a document the reader refuses as that document's failure, never a thrown error", async () => {
    const { fs } = fakeFileSystem([{ relPath: 'index.md', kind: 'file' }], VALID_INDEX_DOCUMENT);
    const refusing: ProfileFileSystem = {
      ...fs,
      readDocument: () =>
        Promise.resolve(
          err(
            'cannot read the document (ELOOP) — a symlink or an unreadable file is never a profile document',
          ),
        ),
    };
    expect(unwrap(await readProfileReport(ROOT, refusing))).toMatchObject({
      failures: [{ relPath: 'index.md', messages: [expect.stringContaining('(ELOOP)')] }],
    });
  });
});

describe('readDocument — reading without following a symlink', () => {
  const handleOf = (text: string, closed: string[]): DocumentHandle => ({
    readFile: () => Promise.resolve(text),
    close: () => {
      closed.push('closed');
      return Promise.resolve();
    },
  });

  it('reads the text through the opened handle and closes it', async () => {
    const closed: string[] = [];
    const read = await readDocument('index.md', () => Promise.resolve(handleOf('text', closed)));
    expect(unwrap(read)).toBe('text');
    expect(closed).toEqual(['closed']);
  });

  it('turns an open the platform refuses (ELOOP on a symlink) into a message, never a throw', async () => {
    const refusal = Object.assign(new Error('ELOOP: too many symbolic links'), { code: 'ELOOP' });
    const read = await readDocument('index.md', () => Promise.reject(refusal));
    expect(read).toEqual({
      ok: false,
      error:
        'cannot read the document (ELOOP) — a symlink or an unreadable file is never a profile document',
    });
  });
});
