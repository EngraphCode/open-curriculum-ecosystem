import { posix } from 'node:path';

import { collect, ok, type Result } from '@oaknational/result';

import {
  manifestText,
  type ManifestInput,
  type ManifestSkill,
  type SuiteRecord,
} from './manifest.js';
import { hashDirectory, RESULTS_PREFIX, type LoadedSuite } from './plugin.js';
import { adapterDir } from './plugin-skill.js';
import type { PluginSkill } from './project.js';
import type { SkillEvalsSeams } from './seams.js';
import { RUNNER_COMMAND } from './suite.js';

/**
 * The manifest a run writes beside its evidence: the evaluated versions by
 * blob id, the repository state and the suites that ran.
 *
 * @packageDocumentation
 */

/** What the manifest is composed from. */
export interface ManifestContext {
  readonly repoRoot: string;
  readonly agentToolsVersion: string;
  readonly model: string | undefined;
  readonly judgeModel: string | undefined;
  readonly seams: SkillEvalsSeams;
  readonly loaded: LoadedSuite;
  readonly outDir: string;
  readonly startedAt: Date;
  readonly suites: readonly SuiteRecord[];
}

/** One carried skill's canonical and adapter files by blob id, earlier runs' evidence left out. */
function hashSkill(
  repoRoot: string,
  skill: PluginSkill,
  seams: SkillEvalsSeams,
): Result<ManifestSkill, Error> {
  const canonicalDir = posix.join(repoRoot, skill.canonicalRelativeDir);
  const canonicalFiles = hashDirectory(canonicalDir, seams, RESULTS_PREFIX);
  if (!canonicalFiles.ok) {
    return canonicalFiles;
  }
  const adapterFiles = hashDirectory(
    posix.join(repoRoot, adapterDir(skill.hostSkill)),
    seams,
    RESULTS_PREFIX,
  );
  if (!adapterFiles.ok) {
    return adapterFiles;
  }
  return ok({
    hostSkill: skill.hostSkill,
    canonicalRelativeDir: skill.canonicalRelativeDir,
    canonicalFiles: canonicalFiles.value,
    adapterFiles: adapterFiles.value,
  });
}

/** Hash the evaluated versions, read the repository state, and write the manifest. */
export function writeManifest(context: ManifestContext): Result<void, Error> {
  const { seams, repoRoot } = context;
  const { skill, carried } = context.loaded.projection;
  const hashed = hashSkill(repoRoot, skill, seams);
  if (!hashed.ok) {
    return hashed;
  }
  const carriedHashed = collect(carried.map((each) => hashSkill(repoRoot, each, seams)));
  if (!carriedHashed.ok) {
    return carriedHashed;
  }
  const git = seams.gitState(repoRoot);
  if (!git.ok) {
    return git;
  }
  const manifest: ManifestInput = {
    startedAt: context.startedAt.toISOString(),
    repoHead: git.value.head,
    worktreeClean: git.value.clean,
    agentToolsVersion: context.agentToolsVersion,
    skill: hashed.value,
    carried: carriedHashed.value,
    runner: RUNNER_COMMAND,
    model: context.model,
    judgeModel: context.judgeModel,
    suites: context.suites,
  };
  return seams.writeText(
    posix.join(context.outDir, 'manifest.json'),
    manifestText(manifest),
    false,
  );
}
