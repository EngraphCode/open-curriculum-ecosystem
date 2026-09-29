/**
 * Read the workspace for the install-time closure: the `packages` patterns
 * `pnpm-workspace.yaml` declares, and every workspace package's manifest.
 *
 * Runs before any workspace package is built, so it uses `node:fs` and
 * external dependencies (`yaml`, `tinyglobby`, `zod`) and nothing from the
 * workspace. It reads the filesystem, never git: an install can run where no
 * repository exists (a deploy's tarball) and must see a workspace package that
 * is not yet committed. The patterns are matched the way pnpm matches them, as
 * globs for each package's `package.json`. The pure derivation is
 * `install-time-closure.ts`.
 *
 * @packageDocumentation
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { globSync } from 'tinyglobby';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

import { type WorkspaceManifestInput } from './install-time-closure.js';

type Read<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

const WorkspaceFileSchema = z.object({ packages: z.array(z.string()).min(1) });

/**
 * The `packages` patterns `pnpm-workspace.yaml` declares.
 *
 * @param repoRoot - Absolute path of the repository root.
 * @returns The patterns, or an error when the file declares none.
 */
export function readWorkspacePatterns(repoRoot: string): Read<readonly string[]> {
  const workspaceFile = path.join(repoRoot, 'pnpm-workspace.yaml');
  const parsed = WorkspaceFileSchema.safeParse(parseYaml(readFileSync(workspaceFile, 'utf8')));
  if (!parsed.success) {
    return {
      ok: false,
      error: `${workspaceFile} declares no workspace packages: ${parsed.error.message}`,
    };
  }
  return { ok: true, value: parsed.data.packages };
}

/**
 * Every workspace package's directory, relative to the repository root with
 * `/` separators, paired with its parsed manifest, in path order.
 *
 * @param repoRoot - Absolute path of the repository root.
 * @param patterns - The `pnpm-workspace.yaml` patterns.
 * @returns The manifests, or an error naming a manifest that is not JSON.
 */
export function readWorkspaceManifests(
  repoRoot: string,
  patterns: readonly string[],
): Read<readonly WorkspaceManifestInput[]> {
  const manifestPaths = globSync(
    patterns.map((pattern) => `${pattern}/package.json`),
    { cwd: repoRoot, ignore: ['**/node_modules/**'] },
  ).sort((left, right) => left.localeCompare(right));
  const inputs: WorkspaceManifestInput[] = [];
  for (const manifestPath of manifestPaths) {
    const text = readFileSync(path.join(repoRoot, manifestPath), 'utf8');
    try {
      const manifest: unknown = JSON.parse(text);
      inputs.push({ dir: path.posix.dirname(manifestPath), manifest });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      return { ok: false, error: `${manifestPath} is not JSON: ${reason}` };
    }
  }
  return { ok: true, value: inputs };
}
