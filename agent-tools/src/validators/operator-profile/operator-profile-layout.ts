/**
 * Operator profile — the root layout. Pure: the CLI lists the root and the
 * scoped directories, this module says what each entry must be.
 */

import { type ProfileDocumentExpectation } from './operator-profile-document.js';
import { machineKeyFromRelPath, scopeKeyFromRelPath } from './operator-profile-keys.js';
import { INDEX_FILE_NAME, MACHINES_DIR_NAME, SCOPES_DIR_NAME } from './operator-profile-schema.js';

/** One entry of a profile root listing, as the CLI reads it. */
export interface ProfileEntry {
  /** Path relative to the profile root, `/`-separated. */
  readonly relPath: string;
  readonly isDirectory: boolean;
}

export interface ProfileLayout {
  /** Documents to validate, with their layout expectations. */
  readonly documents: readonly ProfileDocumentExpectation[];
  /** Entries the layout does not name (a finding each). */
  readonly unexpected: readonly string[];
}

/**
 * Entries a git-synced profile root carries that are not profile documents.
 * The Practice never creates them; it only refrains from calling them
 * unexpected.
 */
const GIT_FURNITURE: ReadonlySet<string> = new Set(['.git', '.gitignore', '.gitattributes']);

const SCOPED_DIRS: ReadonlySet<string> = new Set([SCOPES_DIR_NAME, MACHINES_DIR_NAME]);

type EntryClass =
  | { readonly kind: 'document'; readonly expectation: ProfileDocumentExpectation }
  | { readonly kind: 'furniture' }
  | { readonly kind: 'unexpected' };

function classifyDirectory(relPath: string): EntryClass {
  return SCOPED_DIRS.has(relPath) || GIT_FURNITURE.has(relPath)
    ? { kind: 'furniture' }
    : { kind: 'unexpected' };
}

function classifyFile(relPath: string): EntryClass {
  if (relPath === INDEX_FILE_NAME) {
    return { kind: 'document', expectation: { relPath, expectedKind: 'index' } };
  }
  if (GIT_FURNITURE.has(relPath)) {
    return { kind: 'furniture' };
  }
  const scopeKey = scopeKeyFromRelPath(relPath);
  if (scopeKey !== undefined) {
    return {
      kind: 'document',
      expectation: { relPath, expectedKind: 'scope', expectedKey: scopeKey },
    };
  }
  const machineKey = machineKeyFromRelPath(relPath);
  if (machineKey !== undefined) {
    return {
      kind: 'document',
      expectation: { relPath, expectedKind: 'machine', expectedKey: machineKey },
    };
  }
  return { kind: 'unexpected' };
}

/**
 * Classify a profile root listing against the layout the PDR names:
 * `index.md`, `repos/<scope-key>.md` and `machines/<machine-key>.md`, plus
 * the git furniture a synced root carries. Anything else is unexpected. The
 * listing is shallow for the root and one level deep for `repos/` and
 * `machines/`; the caller supplies every level.
 *
 * @param entries - the root's entries and the scoped directories' entries, relative paths
 * @returns the documents to validate and the unexpected entries
 */
export function classifyProfileEntries(entries: readonly ProfileEntry[]): ProfileLayout {
  const documents: ProfileDocumentExpectation[] = [];
  const unexpected: string[] = [];
  for (const entry of entries) {
    const classified = entry.isDirectory
      ? classifyDirectory(entry.relPath)
      : classifyFile(entry.relPath);
    if (classified.kind === 'document') {
      documents.push(classified.expectation);
    } else if (classified.kind === 'unexpected') {
      unexpected.push(entry.relPath);
    }
  }
  return { documents, unexpected };
}
