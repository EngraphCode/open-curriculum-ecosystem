/**
 * Smoke test: owner-only retention against a REAL POSIX filesystem.
 *
 * `writeOwnerOnly` promises that a retained conformance artefact — which on an
 * attended run can carry a bearer token — is owner-only BEFORE any content
 * lands, and it now verifies that on the descriptor rather than assuming
 * `fchmod` worked. The in-process suites prove the requested operations and
 * their order through an injected ops seam. Only a real filesystem can prove
 * the resulting BYTES ON DISK: the mode actually stored, the content, and a
 * planted symbolic link replaced rather than followed.
 *
 * Why this is a smoke test and not a vitest suite. The repository's
 * testing-strategy classifies by behaviour shape, not by filename: a test that
 * imports the product into its own process is an integration test whatever it
 * is called, integration tests must not touch the filesystem, and E2E tests
 * must drive a separately running system over a protocol channel. Real on-disk
 * proof fits none of those, and it is exactly what the smoke tier is for — the
 * shipped form, invoked as production invokes it. (Two reviewers raised the
 * mislabelling on PR #132; this is the cure.)
 *
 * Why it is POSIX-bound. The write refuses when the descriptor does not read
 * 0600, and NTFS reports every writable file as 0666, so these expectations
 * describe a filesystem with POSIX permission semantics. The `test:e2e` chain
 * that runs this executes on Linux in CI; the Windows leg runs the in-process
 * suites, whose behaviour is identical on every host. Nothing is skipped
 * anywhere: this file refuses to pretend on a host that cannot answer.
 *
 * Requires the workspace to be built (the turbo `test:e2e` task depends on
 * `build`).
 */
import {
  lstatSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { retainOwnerOnlyAt, writeRunSummary } from '../dist/src/mcp-conformance/node-io.js';

const POSIX: NodeJS.Platform = 'linux';
const failures: string[] = [];
const roots: string[] = [];

function check(label: string, condition: boolean, detail: string): void {
  if (!condition) {
    failures.push(`${label}: ${detail}`);
  }
}

function sandbox(): string {
  const root = mkdtempSync(join(tmpdir(), 'owner-only-smoke-'));
  roots.push(root);
  return root;
}

if (process.platform === 'win32') {
  process.stderr.write(
    'SMOKE FAILED (owner-only-write-posix): this proof needs POSIX permission semantics; ' +
      'NTFS reports every writable file as 0666. Run it on Linux or macOS — the CI job that ' +
      'runs the test:e2e chain does.\n',
  );
  process.exit(1);
}

// 1. A summary written under a relative report dir lands where the caller was
//    told it did, with the content it was given, at mode 0600 on disk.
const summaryRoot = sandbox();
const summaryOutcome = writeRunSummary(
  summaryRoot,
  join('tmp', 'reports'),
  '{"verdict":"pass"}',
  undefined,
  POSIX,
);
check(
  'summary retention succeeds',
  summaryOutcome.ok,
  summaryOutcome.ok ? '' : summaryOutcome.error,
);
check(
  'summary reported path is caller-shaped',
  summaryOutcome.ok && summaryOutcome.reportedPath === join('tmp', 'reports', 'summary.json'),
  summaryOutcome.ok ? summaryOutcome.reportedPath : 'no path',
);
const summaryPath = join(summaryRoot, 'tmp', 'reports', 'summary.json');
check(
  'summary content is verbatim',
  readFileSync(summaryPath, 'utf8') === '{"verdict":"pass"}',
  readFileSync(summaryPath, 'utf8'),
);
const summaryMode = statSync(summaryPath).mode & 0o777;
check(
  'summary is owner-only ON DISK',
  summaryMode === 0o600,
  `expected 0600, got 0${summaryMode.toString(8)}`,
);

// 2. An absolute destination gets the same guarantee, and a planted symbolic
//    link at that destination is REPLACED, never followed: following it would
//    truncate a file outside the report directory.
const linkRoot = sandbox();
const target = join(linkRoot, 'target.txt');
const destination = join(linkRoot, 'reviewer-pack.md');
writeFileSync(target, 'original', 'utf8');
symlinkSync(target, destination);

const packOutcome = retainOwnerOnlyAt(destination, 'fresh', undefined, POSIX);
check('pack retention succeeds', packOutcome.ok, packOutcome.ok ? '' : packOutcome.error);
check(
  'the link target is untouched',
  readFileSync(target, 'utf8') === 'original',
  'target changed',
);
check(
  'the destination is a regular file, not a link',
  !lstatSync(destination).isSymbolicLink(),
  'destination is still a symbolic link',
);
check(
  'the destination holds the new content',
  readFileSync(destination, 'utf8') === 'fresh',
  readFileSync(destination, 'utf8'),
);
const packMode = statSync(destination).mode & 0o777;
check(
  'the replaced destination is owner-only ON DISK',
  packMode === 0o600,
  `expected 0600, got 0${packMode.toString(8)}`,
);

// 3. No temporary file survives a successful write: the directory holds the
//    two files it should and nothing else.
const linkRootEntries = readdirSync(linkRoot).sort((a, b) => a.localeCompare(b));
check(
  'no temporary file survives',
  linkRootEntries.length === 2 &&
    linkRootEntries[0] === 'reviewer-pack.md' &&
    linkRootEntries[1] === 'target.txt',
  linkRootEntries.join(', '),
);

for (const root of roots) {
  rmSync(root, { recursive: true, force: true });
}

if (failures.length > 0) {
  process.stderr.write(`SMOKE FAILED (owner-only-write-posix):\n${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(
  'SMOKE OK (owner-only-write-posix): on-disk mode 0600, verbatim content, symbolic link replaced not followed\n',
);
