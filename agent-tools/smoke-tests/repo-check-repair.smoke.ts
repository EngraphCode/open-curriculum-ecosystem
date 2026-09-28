import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeErrorLine, writeLine } from '../src/core/terminal-output.js';
import { resolveTrustedGit } from '../src/core/trusted-git.js';
import { hermeticGitEnv } from './hermetic-git-env.js';

/**
 * The tracked gates' repair modes against the real tools. A scratch
 * repository under the OS temp directory tracks one Markdown file that
 * neither prettier nor markdownlint accepts. For each gate, the check fails,
 * the repair (`prettier-tracked --write`, `markdownlint-tracked --fix`) runs
 * and leaves the formatted bytes, and the same check then passes.
 *
 * The scratch repository reaches the tools through a link to this
 * repository's `node_modules`, and the entry runs from source under tsx, as
 * the root scripts run it. prettier's `--cache` therefore writes under this
 * repository's `node_modules/.cache`, which is ignored. Failures are
 * collected and reported after the scratch repository is removed, with each
 * failing run's output.
 */

const AGENT_TOOLS_ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO_ROOT = join(AGENT_TOOLS_ROOT, '..');
const ENTRY = join(AGENT_TOOLS_ROOT, 'src', 'repo-check', 'repo-check.ts');
const GIT = resolveTrustedGit();
const TIMEOUT_MS = 120_000;

/** A heading with two spaces after its hash, and a line with trailing spaces. */
const UNFORMATTED = '#  Title\n\nA line with trailing spaces.   \n';

/** What each repair leaves: prettier and markdownlint agree on these bytes. */
const REPAIRED = '# Title\n\nA line with trailing spaces.\n';

function run(
  cwd: string,
  command: string,
  args: readonly string[],
  env?: NodeJS.ProcessEnv,
): SpawnSyncReturns<string> {
  return spawnSync(command, args, { cwd, env, encoding: 'utf8', timeout: TIMEOUT_MS });
}

/** A run's exit status with its output, for a failure message. */
function described(result: SpawnSyncReturns<string>): string {
  return `exit ${String(result.status)}\n${result.stdout}${result.stderr}`;
}

/** Track `doc.md` in the scratch repository, with the tools linked in; the git steps that failed. */
function prepare(root: string): readonly string[] {
  writeFileSync(
    join(root, 'package.json'),
    '{ "name": "repo-check-repair-smoke", "private": true }\n',
  );
  symlinkSync(join(REPO_ROOT, 'node_modules'), join(root, 'node_modules'));
  writeFileSync(join(root, 'doc.md'), UNFORMATTED);
  const env = hermeticGitEnv(root);
  return [
    ['init', '-q'],
    ['add', 'doc.md'],
  ].flatMap((args) => {
    const git = run(root, GIT, args, env);
    return git.status === 0 ? [] : [`git ${args.join(' ')}: ${described(git)}`];
  });
}

/** Check, repair, check for one gate over a fresh unformatted `doc.md`; each way it failed. */
function checkRepairCheck(root: string, gate: string, repair: string): readonly string[] {
  writeFileSync(join(root, 'doc.md'), UNFORMATTED);
  const entry = (args: readonly string[]) =>
    run(root, process.execPath, ['--import', 'tsx', ENTRY, ...args]);
  const before = entry([gate]);
  const repaired = entry([gate, repair]);
  const bytes = readFileSync(join(root, 'doc.md'), 'utf8');
  const after = entry([gate]);
  return [
    ...(before.status === 0 ? [`${gate} passed the unformatted file: ${described(before)}`] : []),
    ...(repaired.status === 0 ? [] : [`${gate} ${repair} failed: ${described(repaired)}`]),
    ...(bytes === REPAIRED
      ? []
      : [`${gate} ${repair} left ${JSON.stringify(bytes)}, not ${JSON.stringify(REPAIRED)}`]),
    ...(after.status === 0 ? [] : [`${gate} failed after ${repair}: ${described(after)}`]),
  ];
}

const failures: string[] = [];
const root = mkdtempSync(join(tmpdir(), 'repo-check-repair-'));
try {
  failures.push(...prepare(root));
  if (failures.length === 0) {
    for (const [gate, repair] of [
      ['prettier-tracked', '--write'],
      ['markdownlint-tracked', '--fix'],
    ] as const) {
      failures.push(...checkRepairCheck(root, gate, repair));
    }
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}

if (failures.length > 0) {
  for (const failure of failures) {
    writeErrorLine(`repo-check repair smoke: ${failure}`);
  }
  process.exitCode = 1;
} else {
  writeLine(
    'repo-check repair smoke OK: prettier-tracked --write and markdownlint-tracked --fix each repaired a tracked file their check refused, to the same formatted bytes',
  );
}
