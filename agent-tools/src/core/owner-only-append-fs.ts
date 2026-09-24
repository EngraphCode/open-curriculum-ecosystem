/**
 * The file-system port of the owner-only append, and its one real binding.
 *
 * @remarks
 * `appendOwnerOnly` (`owner-only-append.ts`) reaches the file system only
 * through {@link OwnerOnlyAppendFs}, so its behaviour is proven against an
 * in-memory fake (ADR-078). The port returns Results;
 * {@link nodeOwnerOnlyAppendFs} is the single edge where `node:fs` throws
 * become them (ADR-088), keeping each failure's code and dropping its
 * message, which names the path.
 *
 * @packageDocumentation
 */

import { closeSync, fchmodSync, fstatSync, mkdirSync, openSync, writeSync } from 'node:fs';

import { err, ok, type Result } from '@oaknational/result';

import { failureAsError } from './failure-as-error.js';

/** A file-system call's failure: its error code, and nothing else. */
export interface FsFailure {
  readonly code: string;
}

/** What `fstat` reports of an open descriptor: its kind, owner and link count. */
export interface DescriptorFacts {
  readonly isFile: boolean;
  readonly uid: number;
  readonly nlink: number;
}

/**
 * The file-system surface `appendOwnerOnly` needs, injectable for tests
 * (ADR-078). Every call returns a Result rather than throwing; the one real
 * binding, {@link nodeOwnerOnlyAppendFs}, translates `node:fs` throws at that
 * single edge. Stats are reduced to the questions asked of them, so fakes
 * need no `Stats` construction.
 */
export interface OwnerOnlyAppendFs {
  /**
   * The invoking user's uid, against which the append checks the file's
   * owner; `undefined` on a platform without POSIX ownership, where the
   * owner check is skipped and the other file checks still hold.
   */
  readonly uid: number | undefined;
  /** Create the directory and any missing parents at the given mode. */
  mkdir(path: string, mode: number): Result<void, FsFailure>;
  open(path: string, flags: number, mode: number): Result<number, FsFailure>;
  fstat(fd: number): Result<DescriptorFacts, FsFailure>;
  fchmod(fd: number, mode: number): Result<void, FsFailure>;
  /** Write from `data[offset]` for `length` bytes; returns the bytes consumed. */
  write(fd: number, data: Buffer, offset: number, length: number): Result<number, FsFailure>;
  close(fd: number): Result<void, FsFailure>;
}

/** An errno or Node error code, such as `ELOOP` or `ERR_INVALID_ARG_TYPE`. */
const ERROR_CODE_SHAPE = /^[A-Z][A-Z0-9_]*$/u;

/**
 * Translate a thrown `node:fs` failure to its code alone.
 *
 * @remarks
 * A `node:fs` error's message names the path it failed on, so only the code
 * crosses; a code that is not an error-code identifier is withheld as
 * `UNKNOWN`, as is a missing one. A non-Error throwable is a defect and
 * crashes (see {@link failureAsError}).
 *
 * @param failure - The value a `node:fs` call threw.
 * @returns The failure's code, or `UNKNOWN`.
 */
export function fsFailureOf(failure: unknown): FsFailure {
  const error = failureAsError(failure, 'the owner-only append fs boundary');
  const code = 'code' in error ? error.code : undefined;
  return { code: typeof code === 'string' && ERROR_CODE_SHAPE.test(code) ? code : 'UNKNOWN' };
}

/**
 * Run one throwing call at the port's edge, returning its value as `ok` and
 * any throw as `err` through {@link fsFailureOf}.
 *
 * @remarks
 * Every member of {@link nodeOwnerOnlyAppendFs} runs through this, so no
 * `node:fs` throw crosses the port: a caller that discards the Result can
 * never be broken by the file system.
 *
 * @param call - The call to run.
 * @returns The call's value, or the failure's code alone.
 */
export function attempt<T>(call: () => T): Result<T, FsFailure> {
  try {
    return ok(call());
  } catch (failure) {
    return err(fsFailureOf(failure));
  }
}

/**
 * The real binding: synchronous `node:fs` calls, each throw translated by
 * {@link fsFailureOf}, and the process's uid, read when it is asked for,
 * never at import.
 */
export const nodeOwnerOnlyAppendFs: OwnerOnlyAppendFs = {
  get uid() {
    return process.getuid?.();
  },
  mkdir: (path, mode) =>
    attempt(() => {
      mkdirSync(path, { recursive: true, mode });
    }),
  open: (path, flags, mode) => attempt(() => openSync(path, flags, mode)),
  fstat: (fd) =>
    attempt(() => {
      const stats = fstatSync(fd);
      return { isFile: stats.isFile(), uid: stats.uid, nlink: stats.nlink };
    }),
  fchmod: (fd, mode) =>
    attempt(() => {
      fchmodSync(fd, mode);
    }),
  write: (fd, data, offset, length) => attempt(() => writeSync(fd, data, offset, length)),
  close: (fd) =>
    attempt(() => {
      closeSync(fd);
    }),
};
