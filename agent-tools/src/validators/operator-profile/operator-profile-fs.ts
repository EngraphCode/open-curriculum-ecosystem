/**
 * Operator profile — the filesystem primitives behind the root reader:
 * probing presence, listing a directory without following links, and
 * reading a document without following a symlink. Absence is a first-class
 * outcome, never an error; an unreadable path is an error, never absence.
 */

import { constants, type Dirent } from 'node:fs';
import { type FileHandle, open, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import { type ProfileEntry, type ProfileEntryKind } from './operator-profile-layout.js';

export type Presence = 'directory' | 'absent' | 'not-a-directory';

/** Reports what is at a path; the filesystem one is the default, tests inject a fake. */
export type PresenceProbe = (target: string) => Promise<Result<Presence, string>>;

function errorCode(cause: unknown): string {
  return cause instanceof Error && 'code' in cause ? String(cause.code) : 'unknown';
}

/**
 * Whether a path is a directory, distinguishing genuine absence (ENOENT,
 * the expected condition) from an operational failure such as EACCES, which
 * is never reported as absence.
 */
export async function presence(target: string): Promise<Result<Presence, string>> {
  try {
    return ok((await stat(target)).isDirectory() ? 'directory' : 'not-a-directory');
  } catch (cause) {
    const code = errorCode(cause);
    if (code === 'ENOENT') {
      return ok('absent');
    }
    return err(`cannot read ${target} (${code})`);
  }
}

/** The three questions a listing entry answers; `Dirent` is one such object. */
export type EntryType = Pick<Dirent, 'isSymbolicLink' | 'isDirectory' | 'isFile'>;

/**
 * The entry's own kind: `readdir` does not follow links, so a symlink reports
 * as one, whatever it points at.
 *
 * @param entry - the listing entry
 * @returns the kind the layout classifies by
 */
export function entryKind(entry: EntryType): ProfileEntryKind {
  if (entry.isSymbolicLink()) {
    return 'symlink';
  }
  if (entry.isDirectory()) {
    return 'directory';
  }
  return entry.isFile() ? 'file' : 'other';
}

/**
 * List one level of the profile root: the root itself, or one of its scoped
 * directories. A scoped directory that is absent or not a directory lists
 * as empty; the layout reports the root entry itself.
 *
 * @param root - the profile root
 * @param dirName - the scoped directory to list, or undefined for the root
 * @returns the entries with their kinds, or the failure to read the directory
 */
async function listEntries(
  root: string,
  dirName: string | undefined,
): Promise<Result<ProfileEntry[], string>> {
  const dir = dirName === undefined ? root : path.join(root, dirName);
  const there = await presence(dir);
  if (!there.ok) {
    return there;
  }
  if (there.value !== 'directory') {
    return ok([]);
  }
  const prefix = dirName === undefined ? '' : `${dirName}/`;
  return ok(
    (await readdir(dir, { withFileTypes: true })).map((entry) => ({
      relPath: `${prefix}${entry.name}`,
      kind: entryKind(entry),
    })),
  );
}

/** Whether the root is a git repository (a `.git` directory or file). */
export async function isGitRepository(root: string): Promise<boolean> {
  try {
    await stat(path.join(root, '.git'));
    return true;
  } catch {
    return false;
  }
}

/**
 * `O_NOFOLLOW` where the platform defines it. Node types it as always
 * present; Windows has no such flag, and there the listing's refusal of
 * symlink entries is the whole guard.
 */
const O_NOFOLLOW: number | undefined = constants.O_NOFOLLOW;

/** The open flags a document is read with: read-only, never through a symlink. */
const DOCUMENT_OPEN_FLAGS: number = constants.O_RDONLY | (O_NOFOLLOW ?? 0);

/** What a read needs of an open file; a `FileHandle` is one. */
export interface DocumentHandle {
  readFile(encoding: 'utf8'): Promise<string>;
  close(): Promise<void>;
}

/** Opens a path with flags; the filesystem one is the default, tests inject a fake. */
export type OpenDocument = (absolute: string, flags: number) => Promise<DocumentHandle>;

const openReal: OpenDocument = async (absolute, flags) => {
  const handle: FileHandle = await open(absolute, flags);
  return handle;
};

/**
 * Read a document without following a symlink at its path. The layout has
 * already refused every symlink entry; opening with `O_NOFOLLOW` closes the
 * window between the listing and the read, so a link planted in between
 * fails (ELOOP) instead of reading a file outside the profile root.
 *
 * @param absolute - the document's absolute path
 * @param openDocument - opens the path (the filesystem by default)
 * @returns the document text, or the failure as a message (never a thrown error)
 */
export async function readDocument(
  absolute: string,
  openDocument: OpenDocument = openReal,
): Promise<Result<string, string>> {
  let handle: DocumentHandle | undefined;
  try {
    handle = await openDocument(absolute, DOCUMENT_OPEN_FLAGS);
    return ok(await handle.readFile('utf8'));
  } catch (cause) {
    return err(
      `cannot read the document (${errorCode(cause)}) — a symlink or an unreadable file is never a profile document`,
    );
  } finally {
    await handle?.close();
  }
}

/** The filesystem the root reader goes through; tests inject a fake. */
export interface ProfileFileSystem {
  readonly presence: PresenceProbe;
  readonly listEntries: (
    root: string,
    dirName: string | undefined,
  ) => Promise<Result<ProfileEntry[], string>>;
  readonly readDocument: (absolute: string) => Promise<Result<string, string>>;
  readonly isGitRepository: (root: string) => Promise<boolean>;
}

export const REAL_PROFILE_FILE_SYSTEM: ProfileFileSystem = {
  presence,
  listEntries,
  readDocument: (absolute) => readDocument(absolute),
  isGitRepository,
};
