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
 * operator syncing the profile between machines) is expected: its git
 * furniture is not a finding, and when it has a remote its sync state is
 * reported — a dirty tree, unpushed commits or a branch behind its remote
 * are findings, each with the one command that cures it.
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

import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import {
  readProfileReport,
  resolveProfileRoot,
  type DocumentFailure,
} from './operator-profile-root.js';
import { OPERATOR_PROFILE_CONTRACT_REL_PATH } from './operator-profile-schema.js';

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

const SYNC_REL_PATH = '(sync)';

// Plain text throughout: `writeLine` sanitises escape characters by design,
// so ANSI styling would render as literal fragments.
function reportDocumentFailures(root: string, failures: readonly DocumentFailure[]): void {
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

/** Sync findings carry their own cure each; they are not document failures. */
function reportSyncFindings(root: string, findings: readonly string[]): void {
  writeLine(`✗ the profile at ${root} is out of sync with its remote:\n`);
  for (const finding of findings) {
    writeLine(`    - ${finding}`);
  }
  writeLine('');
}

function reportFailures(root: string, failures: readonly DocumentFailure[]): void {
  const documents = failures.filter((failure) => failure.relPath !== SYNC_REL_PATH);
  const sync = failures.filter((failure) => failure.relPath === SYNC_REL_PATH);
  if (documents.length > 0) {
    reportDocumentFailures(root, documents);
  }
  if (sync.length > 0) {
    reportSyncFindings(
      root,
      sync.flatMap((failure) => failure.messages),
    );
  }
}

async function checkRoot(root: string): Promise<number> {
  const report = await readProfileReport(root);
  if (!report.ok) {
    writeErrorLine(`✗ ${report.error}`);
    return 1;
  }
  if (report.value === 'absent') {
    writeLine(`✓ No operator profile at ${root} — absence is the expected condition.\n`);
    return 0;
  }
  for (const line of report.value.info) {
    writeLine(`  · ${line}`);
  }
  if (report.value.failures.length > 0) {
    reportFailures(root, report.value.failures);
    return 1;
  }
  const count = report.value.documentCount;
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
