/**
 * One owner-only append: text appended to a file held private to the invoking
 * user.
 *
 * @remarks
 * The shared descriptor-level appender for machine-local logs that carry
 * owner-only content (session ids, project paths, raw payloads). It formats
 * nothing: the caller owns the text, and decides what a failure means.
 *
 * {@link appendOwnerOnly} runs these steps, in order, each a possible
 * failure:
 *
 * 1. `mkdir` — create the directory recursively at 0o700 if it is absent. The
 *    mode applies only to a directory it creates: an existing directory, or a
 *    symlink to one, is left as it was;
 * 2. `open` — open the file through {@link OWNER_ONLY_APPEND_OPEN_FLAGS},
 *    creating it at 0o600;
 * 3. `fstat` — refuse the descriptor unless it is a regular file, owned by the
 *    invoking user, with exactly one link. A second link is another name for
 *    the same bytes, in a place and under a mode the caller did not choose.
 *    The owner check holds where the platform has POSIX ownership: where it
 *    has none (the port's `uid` is `undefined`, as on Windows, where POSIX
 *    modes are advisory too), the owner check alone is skipped, and the
 *    regular-file and single-link checks still hold;
 * 4. `fchmod` — set the file to 0o600, retightening a file an earlier writer
 *    left readable by others;
 * 5. `write` — write every byte, then `close` the descriptor, which is closed
 *    on every path after a successful open.
 *
 * The outcome is a Result (ADR-088). A failure names the step and a code:
 *
 * - the errno code of a failed call, or `UNKNOWN` when the failure carried no
 *   error-code identifier;
 * - or one of the refusals `NOT_REGULAR_FILE`, `NOT_OWNER` and `HARD_LINKED`
 *   (all at `fstat`) and `NO_PROGRESS` (at `write`).
 *
 * It never carries a path or an error message, which can name one, so a
 * caller can show it anywhere.
 *
 * @packageDocumentation
 */

import { constants } from 'node:fs';
import { dirname } from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import type { DescriptorFacts, FsFailure, OwnerOnlyAppendFs } from './owner-only-append-fs.js';

/** The step of an owner-only append that failed, named for its call. */
type OwnerOnlyStep = 'mkdir' | 'open' | 'fstat' | 'fchmod' | 'write' | 'close';

/**
 * Why an owner-only append failed: the step, and an error code or refusal
 * code (see the module remarks). Never a path or an error message.
 */
export interface OwnerOnlyFailure {
  readonly step: OwnerOnlyStep;
  readonly code: string;
}

const DIRECTORY_MODE = 0o700;
const FILE_MODE = 0o600;

/**
 * The destination-boundary contract, as flags: write-only append,
 * create-if-absent, `O_NOFOLLOW` so a pre-placed symlink at the destination
 * refuses to open (ELOOP), and `O_NONBLOCK` so a reader-less FIFO at the
 * destination fails fast (ENXIO) instead of hanging the caller. Regular-file
 * writes are unaffected by the nonblocking flag.
 */
const OWNER_ONLY_APPEND_OPEN_FLAGS: number =
  constants.O_WRONLY |
  constants.O_APPEND |
  constants.O_CREAT |
  constants.O_NOFOLLOW |
  constants.O_NONBLOCK;

/**
 * Append text to a file held at 0o600, creating its directory at 0o700 if it
 * is absent.
 *
 * @remarks
 * An existing directory keeps its mode. When the append and the close both
 * fail, the append's failure is returned: it is the cause, and the close
 * failure follows from it. See the module remarks for the steps and the
 * failure codes.
 *
 * @param filePath - The file to append to; its parent directory is created,
 * with any missing parents, if absent.
 * @param text - The text to append, written as UTF-8 exactly as given.
 * @param fs - The file-system surface; pass `nodeOwnerOnlyAppendFs`
 * (`owner-only-append-fs.ts`) outside tests.
 * @returns Success, or the failed step and its code.
 */
export function appendOwnerOnly(
  filePath: string,
  text: string,
  fs: OwnerOnlyAppendFs,
): Result<void, OwnerOnlyFailure> {
  const bytes = Buffer.from(text, 'utf8');
  const created = at('mkdir', fs.mkdir(dirname(filePath), DIRECTORY_MODE));
  if (!created.ok) {
    return created;
  }
  const opened = at('open', fs.open(filePath, OWNER_ONLY_APPEND_OPEN_FLAGS, FILE_MODE));
  if (!opened.ok) {
    return opened;
  }
  const appended = appendThroughDescriptor(opened.value, bytes, fs);
  const closed = at('close', fs.close(opened.value));
  return appended.ok ? closed : appended;
}

/**
 * Refuse the open descriptor unless {@link refusalOfDescriptor} finds nothing,
 * set it to {@link FILE_MODE}, then write every byte. The caller closes it.
 */
function appendThroughDescriptor(
  fd: number,
  bytes: Buffer,
  fs: OwnerOnlyAppendFs,
): Result<void, OwnerOnlyFailure> {
  const inspected = at('fstat', fs.fstat(fd));
  if (!inspected.ok) {
    return inspected;
  }
  const refusal = refusalOfDescriptor(inspected.value, fs.uid);
  if (refusal !== undefined) {
    return err({ step: 'fstat', code: refusal });
  }
  const tightened = at('fchmod', fs.fchmod(fd, FILE_MODE));
  if (!tightened.ok) {
    return tightened;
  }
  return writeAllBytes(fd, bytes, fs);
}

/**
 * Why an open descriptor may not be appended to, if it may not: it must be a
 * regular file with exactly one link, owned by the invoking user wherever the
 * platform has POSIX ownership (`uid` defined).
 */
function refusalOfDescriptor(
  facts: DescriptorFacts,
  uid: number | undefined,
): 'NOT_REGULAR_FILE' | 'NOT_OWNER' | 'HARD_LINKED' | undefined {
  if (!facts.isFile) {
    return 'NOT_REGULAR_FILE';
  }
  if (uid !== undefined && facts.uid !== uid) {
    return 'NOT_OWNER';
  }
  return facts.nlink === 1 ? undefined : 'HARD_LINKED';
}

/**
 * Write the whole buffer through possibly-short writes, resuming from the
 * reported offset; a write that consumes nothing fails rather than spinning.
 */
function writeAllBytes(
  fd: number,
  bytes: Buffer,
  fs: OwnerOnlyAppendFs,
): Result<void, OwnerOnlyFailure> {
  let written = 0;
  while (written < bytes.length) {
    const wrote = at('write', fs.write(fd, bytes, written, bytes.length - written));
    if (!wrote.ok) {
      return wrote;
    }
    if (wrote.value <= 0) {
      return err({ step: 'write', code: 'NO_PROGRESS' });
    }
    written += wrote.value;
  }
  return ok(undefined);
}

function at<T>(step: OwnerOnlyStep, result: Result<T, FsFailure>): Result<T, OwnerOnlyFailure> {
  return result.ok ? result : err({ step, code: result.error.code });
}
