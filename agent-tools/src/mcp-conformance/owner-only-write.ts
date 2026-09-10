/**
 * Owner-only file writing for retained conformance artefacts: a fresh file,
 * created exclusively with mode 0600 beside the destination, tightened on
 * its descriptor before any content lands, and renamed over the destination
 * so a planted link is replaced rather than followed.
 *
 * @remarks
 * OWNER-ONLY, established BEFORE any content lands. Attended runs retain
 * AUTHENTICATED vendor output, and the report shapes constrain none of
 * `error`, `output`, `details` or the captured stderr — a bearer or refresh
 * token reaching any of them lands in these files, so the process default
 * (0644 under a 022 umask) would expose it to every other user on a shared
 * host.
 *
 * ORDER IS THE WHOLE POINT, and write-then-chmod gets it wrong: the `mode`
 * argument applies only when the file is CREATED, so re-writing a report
 * left 0644 by an older build would put the authenticated payload on disk
 * world-readable and only tighten it afterwards.
 *
 * THE DESTINATION IS NEVER OPENED. Opening the destination with `'w'` would
 * follow an existing symbolic link and truncate its target before the
 * descriptor could be tightened, so a stale or planted report link could
 * overwrite and chmod a file outside the report directory (review finding
 * on the upstream lane, 2026-08). Instead a temporary file is created in the
 * destination's directory with `'wx'` (exclusive create, so a pre-existing
 * name of any kind fails loudly) at 0600, `fchmod` tightens it on the
 * descriptor, the content lands, the descriptor closes, and `rename` moves
 * the file over the destination: a link at the destination is replaced by a
 * regular file, never followed, and the old 0644 report is replaced whole
 * rather than truncated in place. A failure at any step unlinks the
 * temporary file best-effort and propagates the true cause; the success-path
 * close sits INSIDE the try (a close failure means the write may not have
 * flushed) and the finally is error-path best-effort only.
 *
 * PLATFORM SCOPE. The ordering discipline delivers owner-only protection on
 * POSIX. On Windows, `fchmod` cannot express owner-only — NTFS access
 * control is ACL-based and the POSIX mode surface reaches only the
 * read-only flag — and callers write under the repository or an arbitrary
 * absolute `--pack-out` path, not necessarily beneath a private profile
 * directory, so the artefact can inherit an ACL readable by other users on
 * a shared checkout. This module therefore REFUSES to retain on `win32`
 * with a typed error naming the reason; the caller's retention outcome
 * carries it, and attended conformance with retained authenticated output
 * runs on POSIX or under WSL (the estate's first-class tiers).
 *
 * @packageDocumentation
 */

import { closeSync, fchmodSync, openSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

/** The filesystem edge the ordered write drives; a fake proves the order. */
export interface OwnerOnlyWriteOps {
  /** Exclusive create of a NEW file at 0600; must fail if the path exists. */
  readonly open: (path: string, flags: 'wx', mode: number) => number;
  readonly fchmod: (fd: number, mode: number) => void;
  readonly write: (fd: number, content: string) => void;
  readonly close: (fd: number) => void;
  /** Atomic replace of the destination by the temporary file. */
  readonly rename: (from: string, to: string) => void;
  /** Best-effort removal of the temporary file on a failed write. */
  readonly unlink: (path: string) => void;
}

const nodeOwnerOnlyWriteOps: OwnerOnlyWriteOps = {
  open: (path, flags, mode) => openSync(path, flags, mode),
  fchmod: (fd, mode) => {
    fchmodSync(fd, mode);
  },
  write: (fd, content) => {
    writeFileSync(fd, content, { encoding: 'utf8' });
  },
  close: (fd) => {
    closeSync(fd);
  },
  rename: (from, to) => {
    renameSync(from, to);
  },
  unlink: (path) => {
    unlinkSync(path);
  },
};

/** The refusal an owner-only retention raises on a platform that cannot establish it. */
export class OwnerOnlyUnavailableError extends Error {
  public constructor(platform: NodeJS.Platform) {
    super(
      `owner-only retention is not establishable on ${platform}: NTFS access control is ` +
        'ACL-based and fchmod cannot set it, so a retained artefact could be readable by other ' +
        'users; retention refused — run attended conformance on POSIX or under WSL',
    );
    this.name = 'OwnerOnlyUnavailableError';
  }
}

/** A temporary sibling name that no other writer will create first. */
function temporaryNameFor(filePath: string): string {
  const stamp = `${String(process.pid)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return join(dirname(filePath), `.${basename(filePath)}.${stamp}.tmp`);
}

/**
 * The ordered owner-only write; production callers omit `ops` and get the real
 * `node:fs` edge, and `platform` defaults to the running host.
 *
 * @throws OwnerOnlyUnavailableError on `win32`, before any file is touched.
 */
export function writeOwnerOnly(
  filePath: string,
  content: string,
  ops: OwnerOnlyWriteOps = nodeOwnerOnlyWriteOps,
  platform: NodeJS.Platform = process.platform,
): void {
  if (platform === 'win32') {
    throw new OwnerOnlyUnavailableError(platform);
  }
  const temporaryPath = temporaryNameFor(filePath);
  let handle: number | undefined;
  let created = false;
  try {
    handle = ops.open(temporaryPath, 'wx', 0o600);
    created = true;
    ops.fchmod(handle, 0o600);
    ops.write(handle, content);
    ops.close(handle);
    handle = undefined;
    ops.rename(temporaryPath, filePath);
    created = false;
  } finally {
    if (handle !== undefined) {
      try {
        ops.close(handle);
      } catch {
        // Descriptor leak at worst — the true failure is already propagating.
      }
    }
    if (created) {
      try {
        ops.unlink(temporaryPath);
      } catch {
        // The temporary file is 0600 and empty or partial; the true failure propagates.
      }
    }
  }
}
