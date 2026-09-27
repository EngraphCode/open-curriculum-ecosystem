import { createHash } from 'node:crypto';

/**
 * The manifest a run writes beside its evidence: what was evaluated, by
 * blob id, and how.
 *
 * @remarks
 * Appendix E of the specification framework note asks for retained evidence
 * of the actual skill versions delivered: versions, runtime configuration
 * and the cases that ran. The manifest names files by the blob id git would
 * give them, so a reader can tie a result to a committed version without
 * trusting the run's word for the repository state. Pure.
 *
 * @packageDocumentation
 */

/** The blob id git would give these bytes, so a manifest names a file the way the repository does. */
export function gitBlobId(bytes: Uint8Array): string {
  const hash = createHash('sha1');
  hash.update(`blob ${bytes.byteLength}\0`);
  hash.update(bytes);
  return hash.digest('hex');
}

/** One evaluated file and its blob id. */
export interface ManifestFile {
  readonly path: string;
  readonly blob: string;
}

/** One skill the plugin carried: its host name, its canonical directory and both file sets by blob id. */
export interface ManifestSkill {
  readonly hostSkill: string;
  readonly canonicalRelativeDir: string;
  readonly canonicalFiles: readonly ManifestFile[];
  readonly adapterFiles: readonly ManifestFile[];
}

/** What the manifest records about one suite invocation. */
export interface SuiteRecord {
  readonly suite: string;
  readonly ablation: string;
  readonly runs: number;
  /** The cases the runner was asked for. */
  readonly cases: readonly string[];
  /** The cases the runner's result names; a difference from `cases` is a finding. */
  readonly ran: readonly string[];
  /** The runner's argv, the plugin directory as `<plugin>`. */
  readonly command: readonly string[];
  readonly resultFile: string;
  readonly costUsd: number;
  readonly claudeVersion: string | undefined;
  readonly partial: boolean;
}

/** The inputs a manifest is composed from. */
export interface ManifestInput {
  readonly startedAt: string;
  readonly repoHead: string;
  readonly worktreeClean: boolean;
  readonly agentToolsVersion: string;
  /** The skill under evaluation. */
  readonly skill: ManifestSkill;
  /** The skills carried beside it for a case that exercises a handoff. */
  readonly carried: readonly ManifestSkill[];
  readonly runner: string;
  readonly model: string | undefined;
  readonly judgeModel: string | undefined;
  readonly suites: readonly SuiteRecord[];
}

/**
 * How the plugin presents each skill to the agent under test; recorded so a
 * reader of the evidence knows what the with-arm had and the without-arm
 * did not.
 */
const PLUGIN_SKILL_FORM =
  "the adapter's frontmatter over the canonical body, references carried beside; nothing placed in the workspace";

function skillRecord(skill: ManifestSkill) {
  return {
    host_skill: skill.hostSkill,
    canonical_dir: skill.canonicalRelativeDir,
    canonical_files: skill.canonicalFiles,
    adapter_files: skill.adapterFiles,
  };
}

/** The manifest text, keys in a fixed order, one trailing newline. */
export function manifestText(input: ManifestInput): string {
  const manifest = {
    schema_version: '1.2.0',
    started_at: input.startedAt,
    repo_head: input.repoHead,
    worktree_clean: input.worktreeClean,
    agent_tools_version: input.agentToolsVersion,
    ...skillRecord(input.skill),
    carried_skills: input.carried.map(skillRecord),
    plugin_skill_form: PLUGIN_SKILL_FORM,
    runner: {
      command: input.runner,
      model: input.model ?? 'the runner default',
      judge_model: input.judgeModel ?? 'the runner default',
    },
    suites: input.suites,
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
