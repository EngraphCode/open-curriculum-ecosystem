/**
 * Operator profile — reading a profile root. The IO layer shared by the
 * check CLI and the sync tool: root resolution, presence, listing, document
 * validation and the sync leg. Absence is a first-class outcome, never an
 * error; an unreadable root is an error, never absence.
 */

import path from 'node:path';

import { collect, err, ok, type Result } from '@oaknational/result';

import {
  parseOperatorProfileDocument,
  type ProfileDocumentExpectation,
} from './operator-profile-document.js';
import {
  presence,
  type PresenceProbe,
  type ProfileFileSystem,
  REAL_PROFILE_FILE_SYSTEM,
} from './operator-profile-fs.js';
import { createGitRunner, readSyncState } from './operator-profile-git.js';
import {
  classifyProfileEntries,
  type ProfileEntry,
  type ProfileLayout,
} from './operator-profile-layout.js';
import { INDEX_FILE_NAME, MACHINES_DIR_NAME, SCOPES_DIR_NAME } from './operator-profile-schema.js';
import { assessSyncState, type SyncStateInput } from './operator-profile-sync-state.js';

export interface DocumentFailure {
  readonly relPath: string;
  readonly messages: readonly string[];
}

/** What a present root reports: its document count, failures and information. */
export interface ProfileReport {
  readonly documentCount: number;
  readonly failures: readonly DocumentFailure[];
  readonly info: readonly string[];
}

/**
 * Resolve the profile root: `--root <dir>` wins, then `$PRACTICE_HOME/profile`,
 * then `~/.practice/profile`. An empty or blank `--root` value is a missing
 * argument, never the current directory: `--root "$UNSET"` must not act on
 * whatever checkout the shell happens to be in.
 *
 * @param argv - process arguments after the script path
 * @param env - the process environment
 * @param home - the user's home directory
 * @returns the absolute profile root, or a usage error
 */
export function resolveProfileRoot(
  argv: readonly string[],
  env: Readonly<Record<string, string | undefined>>,
  home: string,
): Result<string, string> {
  const rootFlag = argv.indexOf('--root');
  if (rootFlag === -1) {
    const practiceHome = env['PRACTICE_HOME'];
    const base =
      practiceHome === undefined || practiceHome === ''
        ? path.join(home, '.practice')
        : practiceHome;
    return ok(path.join(base, 'profile'));
  }
  const value = argv[rootFlag + 1];
  if (value === undefined || value.trim() === '' || value.startsWith('--')) {
    return err('--root needs a directory argument');
  }
  return ok(path.resolve(value));
}

async function listProfileEntries(
  root: string,
  fs: ProfileFileSystem,
): Promise<Result<readonly ProfileEntry[], string>> {
  const levels = await Promise.all(
    [undefined, SCOPES_DIR_NAME, MACHINES_DIR_NAME].map((dirName) => fs.listEntries(root, dirName)),
  );
  const collected = collect(levels);
  return collected.ok ? ok(collected.value.flat()) : collected;
}

/** The root's entries, or `absent`, or the operational failure to report. */
async function readRoot(
  root: string,
  fs: ProfileFileSystem,
): Promise<Result<readonly ProfileEntry[] | 'absent', string>> {
  const there = await fs.presence(root);
  if (!there.ok) {
    return err(`${there.error} — an unreadable profile root is a failure, never absence`);
  }
  if (there.value === 'absent') {
    return ok('absent');
  }
  if (there.value === 'not-a-directory') {
    return err(`${root} exists but is not a directory`);
  }
  return listProfileEntries(root, fs);
}

/** The findings the layout makes before any document is read. */
function layoutFailures(layout: ProfileLayout): DocumentFailure[] {
  return [
    ...layout.notRegular.map((relPath) => ({
      relPath,
      messages: [
        `${relPath} is not a regular file or directory (a symlink or a special entry) — never read as part of the profile`,
      ],
    })),
    ...layout.unexpected.map((relPath) => ({
      relPath,
      messages: [
        'not part of the profile layout (index.md, repos/<scope-key>.md, machines/<machine-key>.md and git furniture only)',
      ],
    })),
  ];
}

async function documentFailure(
  root: string,
  expectation: ProfileDocumentExpectation,
  fs: ProfileFileSystem,
): Promise<DocumentFailure | undefined> {
  const content = await fs.readDocument(path.join(root, expectation.relPath));
  if (!content.ok) {
    return { relPath: expectation.relPath, messages: [content.error] };
  }
  const parsed = parseOperatorProfileDocument(expectation, content.value);
  return parsed.ok ? undefined : { relPath: expectation.relPath, messages: parsed.error };
}

async function documentFailures(
  root: string,
  layout: ProfileLayout,
  fs: ProfileFileSystem,
): Promise<DocumentFailure[]> {
  const failures = layoutFailures(layout);
  for (const expectation of layout.documents) {
    const failure = await documentFailure(root, expectation, fs);
    if (failure !== undefined) {
      failures.push(failure);
    }
  }
  return failures;
}

/**
 * The document paths a push can stage that exist in the root; an unreadable
 * one is an error, never treated as absent.
 *
 * @param root - the profile root
 * @param probe - what is at a path (the filesystem by default)
 * @returns the existing document paths, in the layout's order
 */
export async function existingProfilePaths(
  root: string,
  probe: PresenceProbe = presence,
): Promise<Result<readonly string[], string>> {
  const present = await Promise.all(
    [INDEX_FILE_NAME, SCOPES_DIR_NAME, MACHINES_DIR_NAME].map(async (relPath) => {
      const there = await probe(path.join(root, relPath));
      return there.ok ? ok(there.value === 'absent' ? [] : [relPath]) : there;
    }),
  );
  const collected = collect(present);
  return collected.ok ? ok(collected.value.flat()) : collected;
}

const NOT_A_REPOSITORY: SyncStateInput = {
  isRepository: false,
  hasRemote: false,
  hasUpstream: false,
  porcelain: '',
  ahead: 0,
  behind: 0,
};

/**
 * The sync leg: findings only for a repository with a remote, information
 * for the other first-class states (PDR decision 16); a git read that fails
 * is an operational error, never a clean state.
 */
async function syncReport(
  root: string,
  fs: ProfileFileSystem,
): Promise<
  Result<
    { readonly failures: readonly DocumentFailure[]; readonly info: readonly string[] },
    string
  >
> {
  const state = (await fs.isGitRepository(root))
    ? readSyncState(createGitRunner(root))
    : ok(NOT_A_REPOSITORY);
  if (!state.ok) {
    return err(`the sync state of ${root} is unreadable — ${state.error}`);
  }
  const assessment = assessSyncState(state.value);
  const failures =
    assessment.findings.length === 0 ? [] : [{ relPath: '(sync)', messages: assessment.findings }];
  return ok({ failures, info: assessment.info });
}

/**
 * Read a profile root in full: layout, documents and sync state.
 *
 * @param root - the profile root
 * @param fs - the filesystem to read through (the real one by default)
 * @returns `absent`, or the report, or the operational error that stopped the read
 */
export async function readProfileReport(
  root: string,
  fs: ProfileFileSystem = REAL_PROFILE_FILE_SYSTEM,
): Promise<Result<ProfileReport | 'absent', string>> {
  const entries = await readRoot(root, fs);
  if (!entries.ok) {
    return entries;
  }
  if (entries.value === 'absent') {
    return ok('absent');
  }
  const layout = classifyProfileEntries(entries.value);
  const documents = await documentFailures(root, layout, fs);
  const sync = await syncReport(root, fs);
  if (!sync.ok) {
    return sync;
  }
  return ok({
    documentCount: layout.documents.length,
    failures: [...documents, ...sync.value.failures],
    info: sync.value.info,
  });
}
