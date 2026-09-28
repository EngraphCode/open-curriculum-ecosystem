#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import path from 'node:path';

import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { spawnInheritedProcess } from '../repo-check/repo-check-runtime.js';
import { smokeTestFiles, summariseSmokeRun, type SmokeRunResult } from '../smoke/smoke-suite.js';

/**
 * Run every smoke test in `agent-tools/smoke-tests/`, discovered from the
 * directory (`smoke/smoke-suite.ts` carries the reasoning). Each smoke runs
 * as production invokes it — `tsx` on the file, the same spawn the per-file
 * `smoke:*` scripts use — with the agent-tools package root as its working
 * directory, set explicitly so the run does not depend on how this bin was
 * invoked. Every smoke runs even after a failure, so one run reports the
 * whole suite; a signal death is reported by its signal.
 *
 * The bin takes no arguments: `--help` prints usage and exits 0; anything
 * else is refused with usage on stderr, so a typo can never run the suite as
 * if it had been understood.
 *
 * @packageDocumentation
 */

const SMOKE_DIR = 'smoke-tests';
const USAGE =
  'Usage: node dist/src/bin/run-smoke-tests.js\n' +
  'Runs every agent-tools/smoke-tests/*.smoke.ts; takes no arguments (--help prints this).';

async function runSuite(): Promise<number> {
  // The suite is this checkout's: resolved from this file, never from
  // `CLAUDE_PROJECT_DIR`, which names the primary checkout even when the run
  // is a linked worktree's, and would gate another tree's smokes.
  const packageRoot = path.join(
    resolveRepoRoot(import.meta.url, { projectDir: undefined }),
    'agent-tools',
  );
  const files = smokeTestFiles(readdirSync(path.join(packageRoot, SMOKE_DIR)));

  const results: SmokeRunResult[] = [];
  for (const file of files) {
    writeLine(`smoke run  ${file}`);
    const end = await spawnInheritedProcess(
      'pnpm',
      ['exec', 'tsx', path.join(packageRoot, SMOKE_DIR, file)],
      { cwd: packageRoot },
    );
    results.push({ file, status: end.status, signal: end.signal });
  }

  const summary = summariseSmokeRun(results);
  for (const line of summary.lines) {
    if (summary.ok) {
      writeLine(line);
    } else {
      writeErrorLine(line);
    }
  }
  return summary.ok ? 0 : 1;
}

async function main(argv: readonly string[]): Promise<number> {
  if (argv.length === 1 && (argv[0] === '--help' || argv[0] === '-h')) {
    writeLine(USAGE);
    return 0;
  }
  if (argv.length > 0) {
    writeErrorLine(`run-smoke-tests: unrecognised arguments: ${argv.join(' ')}\n${USAGE}`);
    return 1;
  }
  return runSuite();
}

process.exitCode = await main(process.argv.slice(2));
