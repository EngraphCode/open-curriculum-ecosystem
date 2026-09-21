import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeErrorLine, writeLine } from '../src/core/terminal-output.js';
import { VALID_INDEX_DOCUMENT } from '../src/validators/operator-profile/operator-profile-fixtures.js';
import { OPERATOR_PROFILE_CONTRACT_REL_PATH } from '../src/validators/operator-profile/operator-profile-schema.js';

/**
 * CLI smoke for the built `validate-operator-profile` entry against a
 * temporary profile root under the OS temp dir (never the home directory):
 * the behaviours only a real filesystem and a real process can show.
 *
 * 1. A symlinked `index.md` pointing outside the root is refused as not a
 *    regular file; the conforming document it points at is never read (were
 *    it read, it would conform and the report would not name it).
 * 2. A report larger than one pipe buffer arrives whole: the entry sets
 *    `process.exitCode` and never calls `process.exit()`, which can end the
 *    process before piped stdout has flushed.
 * 3. An absent root exits 0 with its one line, and an empty `--root` is a
 *    usage error, never the current checkout.
 */

const smokeDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(smokeDir, '..', '..');
const artefactPath = resolve(
  repoRoot,
  'agent-tools/dist/src/validators/operator-profile/validate-operator-profile.js',
);

/** Enough refused documents that the report outgrows one 64 KiB pipe buffer. */
const REFUSED_DOCUMENT_COUNT = 1000;
const PIPE_BUFFER_BYTES = 64 * 1024;

const failures: string[] = [];

function check(condition: boolean, message: string): void {
  if (!condition) {
    failures.push(message);
  }
}

function runCheck(args: readonly string[]): SpawnSyncReturns<string> {
  return spawnSync(process.execPath, [artefactPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

const root = mkdtempSync(join(tmpdir(), 'operator-profile-cli-smoke-'));
try {
  const profile = join(root, 'profile');
  mkdirSync(join(profile, 'repos'), { recursive: true });
  const outside = join(root, 'outside.md');
  writeFileSync(outside, VALID_INDEX_DOCUMENT, 'utf8');
  symlinkSync(outside, join(profile, 'index.md'));
  const refusedPaths = Array.from(
    { length: REFUSED_DOCUMENT_COUNT },
    (_, index) => `repos/owner--repo-${index}.md`,
  );
  for (const relPath of refusedPaths) {
    writeFileSync(join(profile, relPath), '# A document with no frontmatter block\n', 'utf8');
  }

  const refused = runCheck(['--root', profile]);
  check(
    refused.status === 1,
    `a non-conforming profile expected exit 1, got ${String(refused.status)}\n${refused.stderr}`,
  );
  check(
    refused.stdout.includes('index.md is not a regular file or directory'),
    'the symlinked index.md was not refused as not a regular file',
  );
  check(
    refused.stdout.includes(`✗ ${REFUSED_DOCUMENT_COUNT + 1} documents at`),
    'the refusal count does not include the symlink alongside every refused document',
  );
  check(
    refused.stdout.length > PIPE_BUFFER_BYTES,
    `the report is ${refused.stdout.length} bytes; the flush proof needs more than one pipe buffer`,
  );
  const missing = refusedPaths.filter((relPath) => !refused.stdout.includes(relPath));
  check(
    missing.length === 0,
    `${missing.length} refused documents are missing from the piped output (first: ${missing[0] ?? ''}) — the output was cut before it flushed`,
  );
  check(
    refused.stdout.trimEnd().endsWith(`The contract is ${OPERATOR_PROFILE_CONTRACT_REL_PATH}.`),
    'the remediation line, the last thing written, did not arrive',
  );

  const absent = runCheck(['--root', join(root, 'nowhere')]);
  check(
    absent.status === 0 && absent.stdout.includes('absence is the expected condition'),
    `an absent root expected exit 0 with its one line, got ${String(absent.status)}\n${absent.stdout}${absent.stderr}`,
  );

  const blank = runCheck(['--root', '']);
  check(
    blank.status === 1 && blank.stderr.includes('--root needs a directory argument'),
    `an empty --root expected a usage error, got ${String(blank.status)}\n${blank.stdout}${blank.stderr}`,
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}

if (failures.length > 0) {
  for (const failure of failures) {
    writeErrorLine(`operator-profile CLI smoke: ${failure}`);
  }
  process.exitCode = 1;
} else {
  writeLine(
    `operator-profile CLI smoke OK: symlinked index.md refused unread, ${REFUSED_DOCUMENT_COUNT + 1} refusals arrived whole through a pipe, absent root exit 0, empty --root refused`,
  );
}
