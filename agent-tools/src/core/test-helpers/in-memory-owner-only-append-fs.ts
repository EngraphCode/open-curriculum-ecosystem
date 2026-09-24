/**
 * An in-memory file system behind the owner-only append's port, for tests.
 *
 * @remarks
 * Tests read its resulting state (modes, bytes, descriptors left open), never
 * the calls it received. It models the POSIX contract the append relies on
 * and nothing more:
 *
 * - `mkdir` (recursive) creates an absent directory, leaves an existing
 *   directory (or a symlink to one) alone, returns ENOENT for a dangling
 *   symlink and EEXIST for anything else, as Node does;
 * - a parent path follows a symlink; `open` honours `O_NOFOLLOW` at the leaf
 *   (ELOOP), `O_NONBLOCK` for a FIFO with no reader (ENXIO), `O_CREAT` and
 *   `O_APPEND`, and a write without `O_APPEND` lands at the descriptor's
 *   offset. An open without `O_WRONLY`, or with any flag it does not model,
 *   returns EINVAL, so a flag change the fake cannot honour fails loudly
 *   rather than passing unobserved;
 * - `fstat` reports the entry's kind, owner and link count, where a hard link
 *   is one entry object held at several paths.
 *
 * Symlinks resolve one hop. It lives under `test-helpers/` because it reads
 * the flag values from `node:fs` constants; it performs no IO.
 *
 * @packageDocumentation
 */

import { constants } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { err, ok, type Result } from '@oaknational/result';
import { typeSafeEntries } from '@oaknational/type-helpers';

import type { DescriptorFacts, FsFailure, OwnerOnlyAppendFs } from '../owner-only-append-fs.js';

/** The uid the fake file system runs as. */
export const FAKE_OWNER_UID = 501;

/** One entry in the fake file system. */
export type FakeEntry =
  | { readonly kind: 'directory'; mode: number; readonly uid: number }
  | { readonly kind: 'file'; mode: number; readonly uid: number; bytes: Buffer }
  | {
      readonly kind: 'fifo';
      mode: number;
      readonly uid: number;
      readonly hasReader: boolean;
      bytes: Buffer;
    }
  | { readonly kind: 'symlink'; readonly target: string };

/** The fake's port, and the state a test reads after acting through it. */
export interface InMemoryFileSystem {
  readonly fs: OwnerOnlyAppendFs;
  /** Every entry by absolute path. */
  readonly entries: ReadonlyMap<string, FakeEntry>;
  /** The descriptors opened and not yet closed, with the path each resolved to. */
  readonly openDescriptors: ReadonlyMap<number, { readonly path: string }>;
}

interface Descriptor {
  readonly path: string;
  readonly append: boolean;
  offset: number;
}

interface FakeState {
  readonly entries: Map<string, FakeEntry>;
  readonly descriptors: Map<number, Descriptor>;
  nextFd: number;
}

type ByteEntry = Extract<FakeEntry, { bytes: Buffer }>;
type ModeEntry = Exclude<FakeEntry, { kind: 'symlink' }>;

function hasFlag(flags: number, flag: number): boolean {
  return (flags & flag) === flag;
}

function followLink(state: FakeState, path: string): string {
  const entry = state.entries.get(path);
  return entry?.kind === 'symlink' ? entry.target : path;
}

function modeBearing(entry: FakeEntry | undefined): ModeEntry | undefined {
  return entry === undefined || entry.kind === 'symlink' ? undefined : entry;
}

function byteBearing(entry: FakeEntry | undefined): ByteEntry | undefined {
  return entry?.kind === 'file' || entry?.kind === 'fifo' ? entry : undefined;
}

/**
 * A recursive mkdir: an absent directory is created; an existing one, or a
 * link to one, is left alone; a dangling link is ENOENT; anything else is
 * EEXIST.
 */
function fakeMkdir(state: FakeState, path: string, mode: number): Result<void, FsFailure> {
  if (!state.entries.has(path)) {
    state.entries.set(path, { kind: 'directory', mode, uid: FAKE_OWNER_UID });
    return ok(undefined);
  }
  const existing = state.entries.get(followLink(state, path));
  if (existing === undefined) {
    return err({ code: 'ENOENT' });
  }
  return existing.kind === 'directory' ? ok(undefined) : err({ code: 'EEXIST' });
}

/** The open flags this fake honours; any other flag is refused as EINVAL. */
const MODELLED_OPEN_FLAGS =
  constants.O_WRONLY |
  constants.O_APPEND |
  constants.O_CREAT |
  constants.O_NOFOLLOW |
  constants.O_NONBLOCK;

/** EINVAL for an open the fake cannot honour: no `O_WRONLY`, or a flag it does not model. */
function refusalOfFlags(flags: number): FsFailure | undefined {
  const unmodelled = (flags & ~MODELLED_OPEN_FLAGS) !== 0;
  return unmodelled || !hasFlag(flags, constants.O_WRONLY) ? { code: 'EINVAL' } : undefined;
}

/** Why an open of the resolved entry refuses under these flags, if it does. */
function refusalAtOpen(entry: FakeEntry | undefined, flags: number): FsFailure | undefined {
  if (entry === undefined) {
    return hasFlag(flags, constants.O_CREAT) ? undefined : { code: 'ENOENT' };
  }
  const readerless = entry.kind === 'fifo' && !entry.hasReader;
  return readerless && hasFlag(flags, constants.O_NONBLOCK) ? { code: 'ENXIO' } : undefined;
}

function fakeOpen(
  state: FakeState,
  path: string,
  flags: number,
  mode: number,
): Result<number, FsFailure> {
  const invalid = refusalOfFlags(flags);
  if (invalid !== undefined) {
    return err(invalid);
  }
  const named = join(followLink(state, dirname(path)), basename(path));
  if (state.entries.get(named)?.kind === 'symlink' && hasFlag(flags, constants.O_NOFOLLOW)) {
    return err({ code: 'ELOOP' });
  }
  const resolved = followLink(state, named);
  const entry = state.entries.get(resolved);
  const refusal = refusalAtOpen(entry, flags);
  if (refusal !== undefined) {
    return err(refusal);
  }
  if (entry === undefined) {
    const created: FakeEntry = { kind: 'file', mode, uid: FAKE_OWNER_UID, bytes: Buffer.alloc(0) };
    state.entries.set(resolved, created);
  }
  const fd = state.nextFd;
  state.nextFd += 1;
  const append = hasFlag(flags, constants.O_APPEND);
  state.descriptors.set(fd, { path: resolved, append, offset: 0 });
  return ok(fd);
}

function describedEntry(state: FakeState, fd: number): FakeEntry | undefined {
  const descriptor = state.descriptors.get(fd);
  return descriptor === undefined ? undefined : state.entries.get(descriptor.path);
}

/** A hard link is one entry at several paths, so the link count is the paths holding it. */
function linkCount(state: FakeState, entry: FakeEntry): number {
  return [...state.entries.values()].filter((candidate) => candidate === entry).length;
}

function fakeFstat(state: FakeState, fd: number): Result<DescriptorFacts, FsFailure> {
  const entry = modeBearing(describedEntry(state, fd));
  if (entry === undefined) {
    return err({ code: 'EBADF' });
  }
  return ok({ isFile: entry.kind === 'file', uid: entry.uid, nlink: linkCount(state, entry) });
}

/** Copy each entry once, so an entry given at several paths stays one entry: a hard link. */
function copiedEntries(initial: Readonly<Record<string, FakeEntry>>): Map<string, FakeEntry> {
  const copies = new Map<FakeEntry, FakeEntry>();
  return new Map(
    typeSafeEntries(initial).map(([path, entry]) => {
      const copy = copies.get(entry) ?? { ...entry };
      copies.set(entry, copy);
      return [path, copy];
    }),
  );
}

function fakeFchmod(state: FakeState, fd: number, mode: number): Result<void, FsFailure> {
  const entry = modeBearing(describedEntry(state, fd));
  if (entry === undefined) {
    return err({ code: 'EBADF' });
  }
  entry.mode = mode;
  return ok(undefined);
}

function fakeWrite(state: FakeState, fd: number, chunk: Buffer): Result<number, FsFailure> {
  const descriptor = state.descriptors.get(fd);
  const entry = byteBearing(describedEntry(state, fd));
  if (descriptor === undefined || entry === undefined) {
    return err({ code: 'EBADF' });
  }
  const at = descriptor.append ? entry.bytes.length : descriptor.offset;
  entry.bytes = Buffer.concat([
    entry.bytes.subarray(0, at),
    chunk,
    entry.bytes.subarray(at + chunk.length),
  ]);
  descriptor.offset = at + chunk.length;
  return ok(chunk.length);
}

function fakeClose(state: FakeState, fd: number): Result<void, FsFailure> {
  return state.descriptors.delete(fd) ? ok(undefined) : err({ code: 'EBADF' });
}

/**
 * Build a fake file system holding copies of the given entries, running as
 * {@link FAKE_OWNER_UID}.
 *
 * @param initial - Entries by absolute path; copied, so an expectation built
 * from the same literal never moves with the fake's state. One entry object
 * given at two paths is one entry with two links.
 * @returns The port and its readable state.
 */
export function inMemoryFileSystem(
  initial: Readonly<Record<string, FakeEntry>> = {},
): InMemoryFileSystem {
  const state: FakeState = {
    entries: copiedEntries(initial),
    descriptors: new Map(),
    nextFd: 10,
  };
  const fs: OwnerOnlyAppendFs = {
    uid: FAKE_OWNER_UID,
    mkdir: (path, mode) => fakeMkdir(state, path, mode),
    open: (path, flags, mode) => fakeOpen(state, path, flags, mode),
    fstat: (fd) => fakeFstat(state, fd),
    fchmod: (fd, mode) => fakeFchmod(state, fd, mode),
    write: (fd, data, offset, length) =>
      fakeWrite(state, fd, data.subarray(offset, offset + length)),
    close: (fd) => fakeClose(state, fd),
  };
  return { fs, entries: state.entries, openDescriptors: state.descriptors };
}
