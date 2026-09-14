#!/usr/bin/env node

/**
 * Operator Profile Check
 *
 * Validates the operator profile on this machine — the Practice's one
 * surface outside a repository (the operator-profile PDR) — against the
 * family-1 enforcement schema: `<root>/index.md`, every
 * `<root>/repos/<scope-key>.md` and every `<root>/machines/<machine-key>.md`,
 * where `<root>` is `${PRACTICE_HOME:-~/.practice}/profile` or the
 * `--root <dir>` argument. A root that is itself a git repository (the
 * operator syncing the profile between machines) is expected; its git
 * furniture is not a finding.
 *
 * The profile is strictly optional. A missing root exits 0 with one line
 * saying so: absence is the expected condition on any machine without a
 * profile, and nothing may fail or warn on it. A PRESENT profile must
 * conform: exit 1 names every document and every failure.
 *
 * This check is not part of the commit or push gates by design — the
 * profile is per person, and nothing in the repository may depend on it.
 * Run it at session open (the start-right grounding names it) and after
 * editing the profile: `pnpm profile:check`.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collect, err, ok, type Result } from '@oaknational/result';

import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import { parseOperatorProfileDocument } from './operator-profile-document.js';
import {
  classifyProfileEntries,
  type ProfileEntry,
  type ProfileLayout,
} from './operator-profile-layout.js';
import {
  MACHINES_DIR_NAME,
  OPERATOR_PROFILE_CONTRACT_REL_PATH,
  SCOPES_DIR_NAME,
} from './operator-profile-schema.js';

interface DocumentFailure {
  readonly relPath: string;
  readonly messages: readonly string[];
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

async function collectFailures(root: string, layout: ProfileLayout): Promise<DocumentFailure[]> {
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

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

// Plain text throughout: `writeLine` sanitises escape characters by design,
// so ANSI styling would render as literal fragments.
function reportFailures(root: string, failures: readonly DocumentFailure[]): void {
  writeLine(`✗ ${plural(failures.length, 'document')} at ${root} refused:\n`);
  for (const failure of failures) {
    writeLine(`  ${failure.relPath}`);
    for (const message of failure.messages) {
      writeLine(`    - ${message}`);
    }
    writeLine('');
  }
  writeLine(
    `Remediation: fix the document in place. The contract is ${OPERATOR_PROFILE_CONTRACT_REL_PATH}.\n`,
  );
}

/** The root's entries, or `absent` (exit 0), or the operational failure to report (exit 1). */
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

async function checkRoot(root: string): Promise<number> {
  const entries = await readRoot(root);
  if (!entries.ok) {
    writeErrorLine(`✗ ${entries.error}`);
    return 1;
  }
  if (entries.value === 'absent') {
    writeLine(`✓ No operator profile at ${root} — absence is the expected condition.\n`);
    return 0;
  }
  const layout = classifyProfileEntries(entries.value);
  const failures = await collectFailures(root, layout);
  if (failures.length > 0) {
    reportFailures(root, failures);
    return 1;
  }
  const count = layout.documents.length;
  writeLine(
    `✓ ${plural(count, 'document')} at ${root} conform${count === 1 ? 's' : ''} to the family-1 schema.\n`,
  );
  return 0;
}

async function main(argv: readonly string[]): Promise<number> {
  const root = resolveProfileRoot(argv, process.env, homedir());
  if (!root.ok) {
    writeErrorLine(`✗ ${root.error}`);
    return 1;
  }
  writeLine('\nOperator Profile Check (family 1)');
  writeLine('═════════════════════════════════\n');
  return checkRoot(root.value);
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFilePath) {
  const exitCode = await main(process.argv.slice(2));
  process.exit(exitCode);
}
