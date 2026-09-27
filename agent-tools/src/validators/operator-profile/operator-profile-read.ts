/**
 * Operator profile — reading one document. A document is opened read-only,
 * never through a symlink at its final component (`O_NOFOLLOW`) and never
 * blocking on a fifo (`O_NONBLOCK`); the descriptor is then proven to be a
 * regular file, and on a host without `O_NOFOLLOW` proven to be the very
 * entry at the path (device and inode), before it is read whole and closed.
 * Each step has its own Result and nothing here throws. The same fused
 * open-verify-read shape as the adapter generator's `read-regular-file.ts`,
 * with this module's injectable handle and close-failure Results.
 *
 * Neither guard reaches a directory above the final component: one swapped
 * for a symlink between the listing and the open is followed. The error code
 * helper lives here so that the filesystem module, which imports this one,
 * shares it.
 */

import { type BigIntStats, constants } from 'node:fs';
import { type FileHandle, lstat, open } from 'node:fs/promises';

import { err, ok, type Result } from '@oaknational/result';

/** The code a filesystem failure carries, or `unknown` when it carries none. */
export function errorCode(cause: unknown): string {
  return cause instanceof Error && 'code' in cause ? String(cause.code) : 'unknown';
}

/**
 * `O_NOFOLLOW` and `O_NONBLOCK` where the platform defines them. Node types
 * both as always present; Windows has neither, so there the post-open
 * identity check below is the no-follow guard (Windows has no fifo to block
 * on).
 */
const hostFlags: Partial<Record<'O_NOFOLLOW' | 'O_NONBLOCK', number>> = {
  O_NOFOLLOW: constants.O_NOFOLLOW,
  O_NONBLOCK: constants.O_NONBLOCK,
};

/** The open flags a document is read with: read-only, never through a symlink, never blocking. */
const DOCUMENT_OPEN_FLAGS: number =
  constants.O_RDONLY | (hostFlags.O_NOFOLLOW ?? 0) | (hostFlags.O_NONBLOCK ?? 0);

/** What the identity check needs of a stat: regular-file flag, device and inode. */
export type EntryIdentity = Pick<BigIntStats, 'isFile' | 'dev' | 'ino'>;

/** What a read needs of an open file; a `FileHandle` is one. */
export interface DocumentHandle {
  stat(options: { readonly bigint: true }): Promise<EntryIdentity>;
  readFile(encoding: 'utf8'): Promise<string>;
  close(): Promise<void>;
}

/**
 * The host's no-follow guard and the path-entry probe; tests inject both to
 * drive the arm a host without `O_NOFOLLOW` takes.
 */
export interface ReadProbes {
  readonly noFollowAtOpen: boolean;
  readonly entryStat: (absolute: string) => Promise<EntryIdentity>;
}

const REAL_PROBES: ReadProbes = {
  noFollowAtOpen: hostFlags.O_NOFOLLOW !== undefined,
  entryStat: (absolute) => lstat(absolute, { bigint: true }),
};

/** Opens a path with flags; the filesystem one is the default, tests inject a fake. */
export type OpenDocument = (absolute: string, flags: number) => Promise<DocumentHandle>;

const openReal: OpenDocument = async (absolute, flags) => {
  const handle: FileHandle = await open(absolute, flags);
  return handle;
};

/**
 * Read a document without following a symlink at its final component, and
 * without waiting on a fifo. The layout has already refused every symlink
 * entry; opening with `O_NOFOLLOW` closes that window at the final
 * component, so a link planted there between the listing and the read fails
 * (ELOOP) instead of reading a file outside the profile root. A fifo or other
 * special file planted there opens at once and is refused before any read.
 * A directory above the final component swapped for a symlink is followed.
 *
 * @param absolute - the document's absolute path
 * @param openDocument - opens the path (the filesystem by default)
 * @param probes - the no-follow guard and path-entry probe (the host's by default)
 * @returns the document text, or the failure as a message (never a thrown error)
 */
export async function readDocument(
  absolute: string,
  openDocument: OpenDocument = openReal,
  probes: ReadProbes = REAL_PROBES,
): Promise<Result<string, string>> {
  let opened: DocumentHandle;
  try {
    opened = await openDocument(absolute, DOCUMENT_OPEN_FLAGS);
  } catch (cause) {
    return err(unreadable(cause));
  }
  let text: string;
  try {
    const identity = await verifyRegularFile(absolute, opened, probes);
    if (identity !== null) {
      return err(withCloseFailure(identity, await closeAfterFailure(opened)));
    }
    text = await opened.readFile('utf8');
  } catch (cause) {
    return err(withCloseFailure(unreadable(cause), await closeAfterFailure(opened)));
  }
  try {
    await opened.close();
  } catch (cause) {
    return err(
      `cannot close the document after reading it (${errorCode(cause)}) — the text read is discarded, never trusted`,
    );
  }
  return ok(text);
}

/**
 * The descriptor must be a regular file; on a host without `O_NOFOLLOW` the
 * path's own entry must also be a regular file that is this very file (same
 * device and inode), so a link at the final component, or a swap of it
 * between the listing and the open, is refused and never read through. Null
 * when it is ours.
 */
async function verifyRegularFile(
  absolute: string,
  opened: DocumentHandle,
  probes: ReadProbes,
): Promise<string | null> {
  const viaHandle = await opened.stat({ bigint: true });
  if (!viaHandle.isFile()) {
    return 'the path is not a regular file — a directory, a fifo or a special file is never a profile document';
  }
  if (probes.noFollowAtOpen) {
    return null;
  }
  const entry = await probes.entryStat(absolute);
  const same = entry.isFile() && entry.dev === viaHandle.dev && entry.ino === viaHandle.ino;
  return same
    ? null
    : 'the path entry is not the file that was opened — a symlink or a swapped entry is never read through';
}

/**
 * Closes a handle whose read already failed. The read's refusal is the
 * outcome; a failure here, thrown or rejected, is contained and returned as
 * its code so the refusal can carry both causes.
 */
async function closeAfterFailure(handle: DocumentHandle): Promise<string | null> {
  try {
    await handle.close();
    return null;
  } catch (cause) {
    return errorCode(cause);
  }
}

/** A refusal, with the close failure that followed it named when there was one. */
function withCloseFailure(refusal: string, closeFailure: string | null): string {
  return closeFailure === null
    ? refusal
    : `${refusal}; the close after it failed too (${closeFailure})`;
}

function unreadable(cause: unknown): string {
  return `cannot read the document (${errorCode(cause)}) — a symlink or an unreadable file is never a profile document`;
}
