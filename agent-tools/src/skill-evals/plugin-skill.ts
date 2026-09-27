import { posix } from 'node:path';

import { collect, err, ok, type Result } from '@oaknational/result';

import type { PluginSkill, ProjectedFile } from './project.js';
import type { SkillEvalsSeams } from './seams.js';

/**
 * One skill's directory in the temporary plugin.
 *
 * @remarks
 * A plugin skill is the host adapter's frontmatter, so discovery is tested
 * on the projected description, over the canonical's body, so the Skill
 * tool itself delivers the method; the adapter's carried references sit
 * beside it, where the agent can read them (verified first-hand on
 * 2026-09-27: reads inside the plugin succeed and the runner substitutes
 * the plugin root variable in skill content). Nothing is placed in the
 * workspace, so the without-arm has no route to the method.
 *
 * @packageDocumentation
 */

/** The host adapter's directory, relative to the repository root. */
export function adapterDir(hostSkill: string): string {
  return posix.join('.claude', 'skills', hostSkill);
}

/** A file that must exist; one that reads as absent is an error naming it. */
function readRequired(path: string, label: string, seams: SkillEvalsSeams): Result<string, Error> {
  const text = seams.readText(path);
  if (!text.ok) {
    return text;
  }
  return text.value === undefined ? err(new Error(`${label} reads as absent`)) : ok(text.value);
}

/** A markdown document's frontmatter block, delimiters included, and the body after it. */
function splitFrontmatter(
  text: string,
  label: string,
): Result<{ readonly frontmatter: string; readonly body: string }, Error> {
  const close = text.startsWith('---\n') ? text.indexOf('\n---\n', 4) : -1;
  if (close === -1) {
    return err(new Error(`${label} carries no frontmatter block`));
  }
  const end = close + '\n---\n'.length;
  return ok({ frontmatter: text.slice(0, end), body: text.slice(end) });
}

/** The plugin's SKILL.md for one skill: the adapter's frontmatter over the canonical's body. */
function inlinedSkillFile(
  repoRoot: string,
  skill: PluginSkill,
  seams: SkillEvalsSeams,
): Result<string, Error> {
  const adapterLabel = `the adapter .claude/skills/${skill.hostSkill}/SKILL.md`;
  const adapterPath = posix.join(repoRoot, adapterDir(skill.hostSkill), 'SKILL.md');
  const adapter = readRequired(adapterPath, adapterLabel, seams);
  if (!adapter.ok) {
    return adapter;
  }
  const canonicalLabel = `${skill.canonicalRelativeDir}/SKILL-CANONICAL.md`;
  const canonicalPath = posix.join(repoRoot, skill.canonicalRelativeDir, 'SKILL-CANONICAL.md');
  const canonical = readRequired(canonicalPath, canonicalLabel, seams);
  if (!canonical.ok) {
    return canonical;
  }
  const head = splitFrontmatter(adapter.value, adapterLabel);
  if (!head.ok) {
    return head;
  }
  const method = splitFrontmatter(canonical.value, canonicalLabel);
  return method.ok ? ok(`${head.value.frontmatter}${method.value.body}`) : method;
}

/** One adapter file placed where the plugin's skill lives; a listed file that reads as absent is an error. */
function adapterFile(
  dir: string,
  hostSkill: string,
  path: string,
  seams: SkillEvalsSeams,
): Result<ProjectedFile, Error> {
  const text = readRequired(posix.join(dir, path), `the adapter file ${path}`, seams);
  return text.ok
    ? ok({ path: `skills/${hostSkill}/${path}`, content: text.value, executable: false })
    : text;
}

/** One skill's files in the plugin: the inlined SKILL.md and the adapter's other files beside it. */
export function pluginSkillFiles(
  repoRoot: string,
  skill: PluginSkill,
  seams: SkillEvalsSeams,
): Result<readonly ProjectedFile[], Error> {
  const dir = posix.join(repoRoot, adapterDir(skill.hostSkill));
  const listed = seams.listFiles(dir);
  if (!listed.ok) {
    return listed;
  }
  if (!listed.value.includes('SKILL.md')) {
    return err(new Error(`no host adapter at .claude/skills/${skill.hostSkill}/SKILL.md`));
  }
  const inlined = inlinedSkillFile(repoRoot, skill, seams);
  if (!inlined.ok) {
    return inlined;
  }
  const others = collect(
    listed.value
      .filter((path) => path !== 'SKILL.md')
      .map((path) => adapterFile(dir, skill.hostSkill, path, seams)),
  );
  if (!others.ok) {
    return others;
  }
  const skillFile: ProjectedFile = {
    path: `skills/${skill.hostSkill}/SKILL.md`,
    content: inlined.value,
    executable: false,
  };
  return ok([skillFile, ...others.value]);
}
