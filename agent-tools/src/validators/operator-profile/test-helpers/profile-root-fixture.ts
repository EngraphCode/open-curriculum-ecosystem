/**
 * A temporary profile root for tests of the IO layer. The filesystem work
 * lives here, out of the test file, per the no-real-io-in-tests convention
 * (ADR-078): the test imports this helper; the helper owns the directory.
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

export interface ProfileRootFixture {
  /** The absolute temporary root. */
  readonly root: string;
  /** Create an empty document at `relPath`. */
  readonly addFile: (relPath: string) => Promise<void>;
  /** Create an empty directory at `relPath`. */
  readonly addDirectory: (relPath: string) => Promise<void>;
  /** Remove the root and everything under it. */
  readonly remove: () => Promise<void>;
}

/** Create an empty temporary root that is not a git repository. */
export async function makeProfileRootFixture(): Promise<ProfileRootFixture> {
  const root = await mkdtemp(path.join(tmpdir(), 'operator-profile-root-'));
  return {
    root,
    addFile: (relPath) => writeFile(path.join(root, relPath), '', 'utf8'),
    addDirectory: (relPath) => mkdir(path.join(root, relPath)),
    remove: () => rm(root, { recursive: true, force: true }),
  };
}
