import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { resolveRepoRoot } from '../core/repo-root.js';
import { writeLine, writeErrorLine } from '../core/terminal-output.js';

import { productionWorkspaceDepFsIo } from './bootstrap-helpers-io.js';
import {
  binPathFromManifest,
  interpretSpawnOutcome,
  interpretTscOutcome,
  workspaceDepDistIsStale,
} from './bootstrap-helpers.js';
import { missingDistArtifacts } from './dist-witnesses.js';
import { readWorkspaceManifests, readWorkspacePatterns } from './install-time-closure-io.js';
import { type InstallTimeDep, installTimeClosure } from './install-time-closure.js';

/**
 * Install-time bootstrap, run by the root `postinstall` via `tsx`.
 *
 * Builds `@oaknational/agent-tools` `dist` so the repo's PreToolUse guards
 * (`.claude/settings.json`) and agent CLIs are available immediately after
 * `pnpm install`. It reproduces agent-tools' own build script
 * (`tsc -p tsconfig.build.json` + the executable-bit chmod) by invoking `tsc`
 * directly, so the build orchestrator (`turbo`) and the package manager stay
 * out of the install lifecycle — enforced by the `validate-lifecycle-scripts`
 * validator.
 *
 * agent-tools reaches workspace packages whose entry points name built output
 * under `dist` — there is no source-pointing export condition: the packages it
 * imports, the ESLint plugin its lint config imports, and the config-base
 * package whose `tsup` base their build configs import. Which packages those
 * are is derived from the workspace manifests at run time
 * (`install-time-closure.ts`), never listed here. On a fresh checkout (Vercel,
 * CI, a new worktree) `postinstall` runs before any orchestrated build, so this
 * bootstrap first builds that closure in dependency order with each package's
 * own toolchain (`tsup` for JS, `tsc --emitDeclarationOnly` for types),
 * skipping any dep whose built `dist` is already current for its `src`, and so
 * ESLint's config, which imports the plugin, loads after `pnpm install` alone.
 *
 * `typescript` is a direct dependency of agent-tools, so it is present in dev
 * and `--prod` installs alike; a missing compiler therefore signals a corrupt
 * install and fails loudly rather than silently leaving the fail-open guards
 * without `dist`. Set `OAK_SKIP_AGENT_TOOLS_BOOTSTRAP=1` to opt out deliberately.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);
/** Repo-relative directory of agent-tools: the package running this bootstrap, and the closure's root. */
const AGENT_TOOLS_DIR = 'agent-tools';
const agentToolsDir = path.join(repoRoot, AGENT_TOOLS_DIR);

/**
 * The one build script every closure member must declare, because it is what
 * {@link buildWorkspaceDep} runs (`tsup`, then `tsc --emitDeclarationOnly`
 * over the member's `tsconfig.build.json`). The derivation refuses a member
 * that declares anything else, rather than building it wrongly.
 */
const BUILD_RECIPE = 'tsup && tsc --emitDeclarationOnly --project tsconfig.build.json';

/**
 * The workspace packages built before agent-tools, derived from the workspace
 * manifests: every package agent-tools reaches whose entry points name built
 * output under `dist`, in dependency order (`install-time-closure.ts`).
 * Computed, never kept: a new agent-tools workspace dependency, or a new
 * dependency of one of those, joins the closure without an edit here. The
 * incidents the hand-kept list caused are recorded in that module's TSDoc.
 * Exits loudly, naming the cause, when a read or the derivation refuses.
 */
function readInstallTimeClosure(): readonly InstallTimeDep[] {
  const patterns = readWorkspacePatterns(repoRoot);
  const manifests = patterns.ok ? readWorkspaceManifests(repoRoot, patterns.value) : patterns;
  const closure = manifests.ok
    ? installTimeClosure(manifests.value, { rootDir: AGENT_TOOLS_DIR, buildRecipe: BUILD_RECIPE })
    : manifests;
  if (!closure.ok) {
    writeErrorLine(
      `[bootstrap-agent-tools] cannot derive the install-time closure: ${closure.error}`,
    );
    process.exit(1);
  }
  return closure.value;
}

/** Set the executable bit on every compiled CLI entry, mirroring the build script. */
function markExecutableArtifacts(): void {
  const binDir = path.join(agentToolsDir, 'dist', 'src', 'bin');
  if (existsSync(binDir)) {
    for (const entry of readdirSync(binDir)) {
      if (entry.endsWith('.js')) {
        chmodSync(path.join(binDir, entry), 0o755);
      }
    }
  }
  const statuslinePath = path.join(
    agentToolsDir,
    'dist',
    'src',
    'claude',
    'statusline-identity.js',
  );
  if (existsSync(statuslinePath)) {
    chmodSync(statuslinePath, 0o755);
  }
}

/** Run one build step under the current node binary, exiting loudly on failure. */
function runStep(label: string, binPath: string, args: readonly string[], cwd: string): void {
  const result = spawnSync(process.execPath, [binPath, ...args], { cwd, stdio: 'inherit' });
  const verdict = interpretSpawnOutcome(label, {
    error: result.error,
    signal: result.signal,
    status: result.status,
  });
  if (verdict.failed) {
    const reason = verdict.reason ?? `${label} failed`;
    writeErrorLine(`[bootstrap-agent-tools] ${reason}`);
    process.exit(verdict.exitCode);
  }
}

/**
 * Build one workspace dep with its own toolchain (tsup JS + tsc declarations),
 * unless its built `dist` is already current for the present `src`.
 *
 * Rebuilds on staleness, not mere absence: a warm checkout that pulls new leaf
 * source over an old `dist` must rebuild, or agent-tools' own `tsc` fails
 * against the stale `.d.ts` and bricks the fail-open guards (MCP-472). See
 * {@link workspaceDepDistIsStale}.
 */
function buildWorkspaceDep(dep: InstallTimeDep, tscBin: string): void {
  const depRelDir = dep.dir;
  const depDir = path.join(repoRoot, depRelDir);
  const depName = path.basename(depRelDir);
  if (!workspaceDepDistIsStale(depDir, dep.distArtifacts, productionWorkspaceDepFsIo)) {
    return;
  }
  runStep(`tsup (${depName})`, resolveTsupBin(depDir, depRelDir), [], depDir);
  runStep(
    `tsc declarations (${depName})`,
    tscBin,
    ['--emitDeclarationOnly', '--project', path.join(depDir, 'tsconfig.build.json')],
    depDir,
  );
  exitUnlessWitnessesWritten(dep, depDir);
  writeLine(`[bootstrap-agent-tools] built ${depRelDir}/dist`);
}

/** The dependency's own `tsup` bin, resolved from its directory, exiting loudly when it is missing. */
function resolveTsupBin(depDir: string, depRelDir: string): string {
  const depRequire = createRequire(path.join(depDir, 'package.json'));
  let tsupManifestPath: string;
  try {
    tsupManifestPath = depRequire.resolve('tsup/package.json');
  } catch {
    writeErrorLine(
      `[bootstrap-agent-tools] cannot resolve "tsup" from ${depRelDir} — the install looks incomplete.`,
    );
    process.exit(1);
  }
  const tsupManifest: unknown = JSON.parse(readFileSync(tsupManifestPath, 'utf8'));
  const tsupBin = binPathFromManifest(path.dirname(tsupManifestPath), tsupManifest, 'tsup');
  if (tsupBin === undefined) {
    writeErrorLine(
      `[bootstrap-agent-tools] the resolved tsup manifest for ${depRelDir} has no usable bin entry.`,
    );
    process.exit(1);
  }
  return tsupBin;
}

/** Exit loudly when the build left out a file the dependency's entry points name. */
function exitUnlessWitnessesWritten(dep: InstallTimeDep, depDir: string): void {
  const missing = missingDistArtifacts(depDir, dep.distArtifacts, productionWorkspaceDepFsIo);
  if (missing.length > 0) {
    writeErrorLine(
      `[bootstrap-agent-tools] the build of ${dep.dir} did not write ${missing.join(', ')}, ` +
        'which its package.json entry points name.',
    );
    process.exit(1);
  }
}

function main(): void {
  if (process.env.OAK_SKIP_AGENT_TOOLS_BOOTSTRAP === '1') {
    writeLine('[bootstrap-agent-tools] skipped (OAK_SKIP_AGENT_TOOLS_BOOTSTRAP=1)');
    return;
  }

  let tscBin: string;
  try {
    tscBin = createRequire(path.join(agentToolsDir, 'package.json')).resolve('typescript/bin/tsc');
  } catch {
    writeErrorLine(
      '[bootstrap-agent-tools] cannot resolve "typescript" from agent-tools — the install looks incomplete.',
    );
    writeErrorLine(
      '[bootstrap-agent-tools] Re-run `pnpm install`, or set OAK_SKIP_AGENT_TOOLS_BOOTSTRAP=1 to bypass deliberately.',
    );
    process.exit(1);
  }

  for (const dep of readInstallTimeClosure()) {
    buildWorkspaceDep(dep, tscBin);
  }

  const result = spawnSync(
    process.execPath,
    [tscBin, '-p', path.join(agentToolsDir, 'tsconfig.build.json')],
    { cwd: agentToolsDir, stdio: 'inherit' },
  );
  const verdict = interpretTscOutcome({
    error: result.error,
    signal: result.signal,
    status: result.status,
  });
  if (verdict.failed) {
    writeErrorLine(`[bootstrap-agent-tools] ${verdict.reason ?? 'tsc build failed'}`);
    process.exit(verdict.exitCode);
  }

  markExecutableArtifacts();
  writeLine('[bootstrap-agent-tools] built agent-tools/dist');
}

main();
