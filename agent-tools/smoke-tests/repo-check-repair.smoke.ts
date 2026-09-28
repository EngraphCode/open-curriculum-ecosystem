import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The tracked gates' repair modes against the real tools. A scratch
 * repository tracks one Markdown file that neither prettier nor markdownlint
 * accepts. For each gate, the check fails, the repair
 * (`prettier-tracked --write`, `markdownlint-tracked --fix`) runs, and the
 * same check then passes. The scratch repository reaches the tools through a
 * link to this repository's `node_modules`, and the entry runs from source
 * under tsx, as the root scripts run it.
 */

const AGENT_TOOLS_ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO_ROOT = join(AGENT_TOOLS_ROOT, '..');
const ENTRY = join(AGENT_TOOLS_ROOT, 'src', 'repo-check', 'repo-check.ts');

/** A heading with two spaces after its hash, and a line with trailing spaces. */
const UNFORMATTED = '#  Title\n\nA line with trailing spaces.   \n';

function fail(message: string): never {
  process.stderr.write(`repo-check repair smoke: ${message}\n`);
  process.exit(1);
}

function run(cwd: string, command: string, args: readonly string[]): SpawnSyncReturns<string> {
  return spawnSync(command, args, { cwd, encoding: 'utf8' });
}

/** A scratch repository tracking `doc.md` as {@link UNFORMATTED}, with the tools linked in. */
function scratchRepository(): string {
  const root = mkdtempSync(join(tmpdir(), 'repo-check-repair-'));
  writeFileSync(
    join(root, 'package.json'),
    '{ "name": "repo-check-repair-smoke", "private": true }\n',
  );
  symlinkSync(join(REPO_ROOT, 'node_modules'), join(root, 'node_modules'));
  writeFileSync(join(root, 'doc.md'), UNFORMATTED);
  for (const args of [
    ['init', '-q'],
    ['add', 'doc.md'],
  ]) {
    const git = run(root, 'git', args);
    if (git.status !== 0) {
      fail(`git ${args.join(' ')} failed: ${git.stderr}`);
    }
  }
  return root;
}

/** Check, repair, check: the statuses in order. */
function checkRepairCheck(root: string, gate: string, repair: string): readonly (number | null)[] {
  writeFileSync(join(root, 'doc.md'), UNFORMATTED);
  return [[gate], [gate, repair], [gate]].map(
    (args) => run(root, process.execPath, ['--import', 'tsx', ENTRY, ...args]).status,
  );
}

const root = scratchRepository();
try {
  for (const [gate, repair] of [
    ['prettier-tracked', '--write'],
    ['markdownlint-tracked', '--fix'],
  ] as const) {
    const [before, repaired, after] = checkRepairCheck(root, gate, repair);
    if (before === 0 || repaired !== 0 || after !== 0) {
      fail(
        `${gate}: expected the check to fail, ${repair} to exit 0 and the check then to pass; got ${String(before)}, ${String(repaired)}, ${String(after)}`,
      );
    }
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}

process.stdout.write(
  'repo-check repair smoke OK: prettier-tracked --write and markdownlint-tracked --fix each repaired a tracked file their check refused\n',
);
