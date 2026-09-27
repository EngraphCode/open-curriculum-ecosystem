/**
 * Integration tests for the skill-evals orchestration.
 *
 * @remarks
 * Each test describes what one run must leave behind, driving run.ts and
 * the modules it composes through the in-memory seams: the temporary plugin
 * the runner is pointed at, the arguments the runner receives per suite, and
 * the evidence retained under the skill's results directory with every
 * machine-local path scrubbed. No real filesystem, subprocess or clock.
 */

import { unwrapErr, unwrapOrThrow } from '@oaknational/result';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { getJsonValue, isJsonObject, parseJsonText, type JsonObject } from '../core/json.js';
import { projectSkillEvals, runSkillEvals, type RunOptions } from './run.js';
import type { GitState } from './seams.js';
import {
  harness,
  PLUGIN,
  REPO,
  SCAFFOLD,
  standInBlobId,
  type RecordedRun,
} from './test-helpers/in-memory-seams.js';

const options: RunOptions = {
  repoRoot: REPO,
  skill: '.agent/skills/planning/user-value',
  hostSkill: 'oak-user-value',
  also: [],
  suite: 'all',
  ablation: 'with-without',
  runs: 1,
  maxTurns: 12,
  triggerMaxTurns: 4,
  timeoutSeconds: 600,
  maxCostUsd: 40,
  judgeModel: 'sonnet',
  model: undefined,
  caseGlob: undefined,
  keepPlugin: false,
  agentToolsVersion: '0.1.0',
};

const OUT = `${REPO}/.agent/skills/planning/user-value/evals/results/2026-09-27T11-05-00Z`;
/** The repository state the harness reports, as the manifest must record it. */
const recordedGit: GitState = { head: 'deadbeef', clean: false };
const manifestFilesSchema = z.array(
  z.object({ path: z.string(), blob: z.string().regex(/^[0-9a-f]{40}$/u) }),
);
const manifestCarriedSchema = z.array(
  z.object({
    host_skill: z.string(),
    canonical_dir: z.string(),
    canonical_files: manifestFilesSchema,
    adapter_files: manifestFilesSchema,
  }),
);
const manifestSuitesSchema = z.array(
  z.object({
    suite: z.string(),
    cases: z.array(z.string()),
    ran: z.array(z.string()),
    command: z.array(z.string()),
  }),
);

function manifestOf(files: Map<string, string>): JsonObject {
  const manifest = parseJsonText(files.get(`${OUT}/manifest.json`) ?? '', 'manifest');
  expect(isJsonObject(manifest)).toBe(true);
  return isJsonObject(manifest) ? manifest : {};
}

describe('runSkillEvals', () => {
  it('writes the plugin the runner is pointed at: manifest, the skill as adapter frontmatter over the canonical body, references beside, and the projected cases', () => {
    const h = harness();
    unwrapOrThrow(runSkillEvals(options, h.seams));
    expect(h.files.get(`${PLUGIN}/.claude-plugin/plugin.json`)).toContain(
      '"name": "oak-user-value-evals"',
    );
    const skill = h.files.get(`${PLUGIN}/skills/oak-user-value/SKILL.md`) ?? '';
    expect(skill.startsWith('---\nname: oak-user-value\n')).toBe(true);
    expect(skill).toContain('# User Value\n\nThe method');
    expect(skill).not.toContain('Read and follow');
    expect(skill).not.toContain('classification');
    expect(h.files.get(`${PLUGIN}/skills/oak-user-value/references/value-model.md`)).toBe(
      '# Value model\n',
    );
    expect(h.files.get(`${PLUGIN}/evals/case-01/prompt.md`)).toContain('Rework the backlog.');
    expect([...h.files.keys()].some((path) => path.endsWith('scaffold.sh'))).toBe(false);
    expect(h.modes.get(`${PLUGIN}/evals/case-01/prompt.md`)).toBe(false);
  });

  it('carries each --also skill the same way and hashes it into the manifest', () => {
    const h = harness();
    const also = [{ skill: './.agent/skills/planning/plan/', hostSkill: 'oak-plan' }];
    unwrapOrThrow(runSkillEvals({ ...options, also }, h.seams));
    const plan = h.files.get(`${PLUGIN}/skills/oak-plan/SKILL.md`) ?? '';
    expect(plan.startsWith('---\nname: oak-plan\n')).toBe(true);
    expect(plan).toContain('The planning method.');
    expect(h.files.get(`${PLUGIN}/evals/case-01/graders/skill-files-readable.md`)).toContain(
      '(oak-user-value|oak-plan)',
    );
    const carried = manifestCarriedSchema.parse(
      getJsonValue(manifestOf(h.files), 'carried_skills'),
    );
    expect(carried.map((skill) => [skill.host_skill, skill.canonical_dir])).toEqual([
      ['oak-plan', '.agent/skills/planning/plan'],
    ]);
    expect(carried[0]?.canonical_files.map((file) => file.path)).toEqual(['SKILL-CANONICAL.md']);
  });

  it('refuses a case that expects a skill not carried, before any runner invocation', () => {
    const h = harness();
    h.files.set(
      `${REPO}/.agent/skills/planning/user-value/evals/evals.json`,
      JSON.stringify({
        skill_name: 'user-value',
        evals: [
          {
            id: 1,
            prompt: 'Define the value, then plan.',
            expected_output: 'Handed to the plan.',
            assertions: ['The plan consumes it'],
            skills_expected: ['plan'],
          },
        ],
      }),
    );
    expect(unwrapErr(runSkillEvals(options, h.seams)).message).toContain("expects skill 'plan'");
    expect(h.runs).toEqual([]);
  });

  it('refuses a canonical or an adapter without a frontmatter block, naming it', () => {
    const h = harness();
    h.files.set(
      `${REPO}/.agent/skills/planning/user-value/SKILL-CANONICAL.md`,
      '# No frontmatter\n',
    );
    expect(unwrapErr(runSkillEvals(options, h.seams)).message).toContain(
      '.agent/skills/planning/user-value/SKILL-CANONICAL.md carries no frontmatter block',
    );
    expect(h.runs).toEqual([]);
  });

  it('runs the cases with the ablation and the triggers without one, from the plugin directory', () => {
    const h = harness();
    unwrapOrThrow(runSkillEvals(options, h.seams));
    const recorded: readonly RecordedRun[] = h.runs;
    expect(recorded.map((run) => run.command)).toEqual(['claude', 'claude']);
    expect(recorded.every((run) => run.cwd === PLUGIN)).toBe(true);
    const [cases, triggerRun] = recorded;
    expect(cases?.args).toEqual([
      'plugin',
      'eval',
      PLUGIN,
      '--keep-temp',
      '--no-publish',
      '--trust-plugin',
      '--threshold',
      '0',
      '--ablation',
      'with-without',
      '--runs',
      '1',
      '--case',
      'case-*',
      '--json',
      `${PLUGIN}/result-cases.json`,
      '--max-cost-usd',
      '40',
      '--judge-model',
      'sonnet',
    ]);
    expect(triggerRun?.args).toContain('none');
    expect(triggerRun?.args).toContain('trigger-*');
  });

  it.each([
    { key: 'canonical_files', dir: `${REPO}/${options.skill}` },
    { key: 'adapter_files', dir: `${REPO}/.claude/skills/oak-user-value` },
  ])('names each file in $key by the blob id git gives it', ({ key, dir }) => {
    const h = harness();
    unwrapOrThrow(runSkillEvals(options, h.seams));
    const files = manifestFilesSchema.parse(getJsonValue(manifestOf(h.files), key));
    expect(files.length).toBeGreaterThan(0);
    expect(files.map((file) => file.blob)).toEqual(
      files.map((file) => standInBlobId(h.files.get(`${dir}/${file.path}`) ?? '')),
    );
  });

  it('retains the scrubbed result, trace and answer, and a manifest naming the evaluated versions', () => {
    const h = harness();
    const summary = unwrapOrThrow(runSkillEvals(options, h.seams));
    expect(summary.outDir).toBe(OUT);
    expect(h.files.get(`${OUT}/result-cases.json`)).toContain('<scaffold>/out/trace.jsonl');
    expect(h.files.get(`${OUT}/traces/case-01.with.1.jsonl`)).toContain('"cwd":"<workspace>"');
    expect(h.files.get(`${OUT}/answers/case-01.with.1.md`)).toBe('done in <plugin>\n');
    expect(h.files.get(`${OUT}/traces/trigger-01-fires.with.1.jsonl`)).toBeDefined();
    const manifest = manifestOf(h.files);
    expect(getJsonValue(manifest, 'repo_head')).toBe(recordedGit.head);
    expect(getJsonValue(manifest, 'worktree_clean')).toBe(recordedGit.clean);
    const canonicalPaths = manifestFilesSchema
      .parse(getJsonValue(manifest, 'canonical_files'))
      .map((file) => file.path);
    expect(canonicalPaths).toHaveLength(3);
    expect(canonicalPaths).toEqual(
      expect.arrayContaining([
        'SKILL-CANONICAL.md',
        'evals/evals.json',
        'evals/trigger-validation.json',
      ]),
    );
    expect(canonicalPaths).not.toContain('evals/results/old/manifest.json');
    const suites = manifestSuitesSchema.parse(getJsonValue(manifest, 'suites'));
    expect(suites.map((suite) => [suite.suite, suite.cases, suite.ran])).toEqual([
      ['cases', ['case-01'], ['case-01']],
      ['triggers', ['trigger-01-fires'], ['trigger-01-fires']],
    ]);
    expect(suites[0]?.command).toContain('<plugin>');
    expect(suites[1]?.command).toContain('none');
    expect(suites.every((suite) => suite.command.every((arg) => !arg.includes(PLUGIN)))).toBe(true);
    expect(h.removed).toEqual([SCAFFOLD, SCAFFOLD, PLUGIN]);
  });

  it('accepts the skill directory with a leading ./ or a trailing slash, and records it normalised', () => {
    const h = harness();
    const summary = unwrapOrThrow(
      runSkillEvals({ ...options, skill: './.agent/skills/planning/user-value/' }, h.seams),
    );
    expect(summary.outDir).toBe(OUT);
    expect(getJsonValue(manifestOf(h.files), 'canonical_dir')).toBe(
      '.agent/skills/planning/user-value',
    );
  });

  it('with --case, invokes only the suites the glob reaches and names only the cases it matched', () => {
    const h = harness();
    const summary = unwrapOrThrow(runSkillEvals({ ...options, caseGlob: 'case-0?' }, h.seams));
    expect(summary.suites.map((suite) => [suite.suite, suite.cases])).toEqual([
      ['cases', ['case-01']],
    ]);
    expect(h.runs).toHaveLength(1);
    expect(h.runs[0]?.args).toContain('case-0?');
  });

  it('refuses a --case glob that matches nothing, naming the glob', () => {
    const h = harness();
    const error = unwrapErr(runSkillEvals({ ...options, caseGlob: 'nothing-*' }, h.seams));
    expect(error.message).toContain("--case 'nothing-*'");
    expect(h.runs).toEqual([]);
  });

  it('runs only the cases for a skill that declares no trigger examples', () => {
    const h = harness();
    h.files.delete(`${REPO}/.agent/skills/planning/user-value/evals/trigger-validation.json`);
    const summary = unwrapOrThrow(runSkillEvals(options, h.seams));
    expect(summary.suites.map((suite) => suite.suite)).toEqual(['cases']);
    expect(h.runs).toHaveLength(1);
  });

  it('refuses --suite triggers for a skill that declares no trigger examples', () => {
    const h = harness();
    h.files.delete(`${REPO}/.agent/skills/planning/user-value/evals/trigger-validation.json`);
    const error = unwrapErr(runSkillEvals({ ...options, suite: 'triggers' }, h.seams));
    expect(error.message).toContain('declares no trigger examples');
    expect(h.runs).toEqual([]);
  });

  it('keeps the plugin when asked, and records a cost-ceiling exit as partial', () => {
    const h = harness(2);
    const summary = unwrapOrThrow(
      runSkillEvals({ ...options, keepPlugin: true, suite: 'cases' }, h.seams),
    );
    expect(summary.suites.map((suite) => suite.partial)).toEqual([true]);
    expect(h.removed).toEqual([SCAFFOLD]);
  });

  it('refuses when the runner fails, naming the suite, the exit code and the kept plugin, and runs no further suite', () => {
    const h = harness(1);
    const message = unwrapErr(runSkillEvals(options, h.seams)).message;
    expect(message).toContain('the cases suite: claude exited 1');
    expect(message).toContain(PLUGIN);
    expect(h.runs).toHaveLength(1);
    expect(h.removed).toEqual([]);
  });

  it('refuses a skill that declares no evals', () => {
    const h = harness();
    h.files.delete(`${REPO}/.agent/skills/planning/user-value/evals/evals.json`);
    expect(unwrapErr(runSkillEvals(options, h.seams)).message).toContain('declares no evals');
  });

  it('refuses a host skill without an adapter', () => {
    const h = harness();
    expect(
      unwrapErr(runSkillEvals({ ...options, hostSkill: 'oak-missing' }, h.seams)).message,
    ).toContain('.claude/skills/oak-missing/SKILL.md');
  });
});

describe('projectSkillEvals', () => {
  it('writes the whole plugin to the requested directory without running anything', () => {
    const h = harness();
    const projected = unwrapOrThrow(
      projectSkillEvals({ ...options, out: '/scratch/inspect' }, h.seams),
    );
    const written = [...h.files.keys()].filter((path) => path.startsWith('/scratch/inspect/'));
    expect(projected.files).toBe(written.length);
    expect(written).toContain('/scratch/inspect/.claude-plugin/plugin.json');
    expect(written).toContain('/scratch/inspect/skills/oak-user-value/SKILL.md');
    expect(written).toContain('/scratch/inspect/evals/trigger-01-fires/prompt.md');
    expect(h.files.get('/scratch/inspect/evals/trigger-01-fires/graders/skill-fired.md')).toContain(
      'oak-user-value',
    );
    expect(h.runs).toEqual([]);
  });
});
