/**
 * Operator profile — reading a profile root. The IO layer shared by the
 * check CLI and the sync tool: root resolution, presence, listing, document
 * validation and the sync leg. Absence is a first-class outcome, never an
 * error; an unreadable root is an error, never absence.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { collect, err, ok, type Result } from '@oaknational/result';

import { parseOperatorProfileDocument } from './operator-profile-document.js';
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
 * then `~/.practice/profile`.
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
  if (value === undefined || value.startsWith('--')) {
    return err('--root needs a directory argument');
  }
  return ok(path.resolve(value));
}

type Presence = 'directory' | 'absent' | 'not-a-directory';

/** Reports what is at a path; the filesystem one is the default, tests inject a fake. */
export type PresenceProbe = (target: string) => Promise<Result<Presence, string>>;

/**
 * Whether a path is a directory, distinguishing genuine absence (ENOENT,
 * the expected condition) from an operational failure such as EACCES, which
 * is never reported as absence.
 */
async function presence(target: string): Promise<Result<Presence, string>> {
  try {
    return ok((await stat(target)).isDirectory() ? 'directory' : 'not-a-directory');
  } catch (cause) {
    const code = cause instanceof Error && 'code' in cause ? String(cause.code) : 'unknown';
    if (code === 'ENOENT') {
      return ok('absent');
    }
    return err(`cannot read ${target} (${code})`);
  }
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
      isDirectory: entry.isDirectory(),
    })),
  );
}

async function listProfileEntries(root: string): Promise<Result<readonly ProfileEntry[], string>> {
  const levels = await Promise.all(
    [undefined, SCOPES_DIR_NAME, MACHINES_DIR_NAME].map((dirName) => listEntries(root, dirName)),
  );
  const collected = collect(levels);
  return collected.ok ? ok(collected.value.flat()) : collected;
}

/** The root's entries, or `absent`, or the operational failure to report. */
async function readRoot(root: string): Promise<Result<readonly ProfileEntry[] | 'absent', string>> {
  const there = await presence(root);
  if (!there.ok) {
    return err(`${there.error} — an unreadable profile root is a failure, never absence`);
  }
  if (there.value === 'absent') {
    return ok('absent');
  }
  if (there.value === 'not-a-directory') {
    return err(`${root} exists but is not a directory`);
  }
  return listProfileEntries(root);
}

async function documentFailures(root: string, layout: ProfileLayout): Promise<DocumentFailure[]> {
  const failures: DocumentFailure[] = layout.unexpected.map((relPath) => ({
    relPath,
    messages: [
      'not part of the profile layout (index.md, repos/<scope-key>.md, machines/<machine-key>.md and git furniture only)',
    ],
  }));
  for (const expectation of layout.documents) {
    const content = await readFile(path.join(root, expectation.relPath), 'utf8');
    const parsed = parseOperatorProfileDocument(expectation, content);
    if (!parsed.ok) {
      failures.push({ relPath: expectation.relPath, messages: parsed.error });
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
): Promise<
  Result<
    { readonly failures: readonly DocumentFailure[]; readonly info: readonly string[] },
    string
  >
> {
  const state = (await isGitRepository(root))
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
 * @returns `absent`, or the report, or the operational error that stopped the read
 */
export async function readProfileReport(
  root: string,
): Promise<Result<ProfileReport | 'absent', string>> {
  const entries = await readRoot(root);
  if (!entries.ok) {
    return entries;
  }
  if (entries.value === 'absent') {
    return ok('absent');
  }
  const layout = classifyProfileEntries(entries.value);
  const documents = await documentFailures(root, layout);
  const sync = await syncReport(root);
  if (!sync.ok) {
    return sync;
  }
  return ok({
    documentCount: layout.documents.length,
    failures: [...documents, ...sync.value.failures],
    info: sync.value.info,
  });
}
