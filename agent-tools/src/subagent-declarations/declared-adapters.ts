/**
 * The adapters the declarations say exist: every template's declaration reduced to its
 * adapter names with the platforms each names. The health probe's adapter parity reads
 * this, so the declarations are the one platform truth.
 *
 * The reduction is pure (`declaredAdaptersFrom`, over the templates' names and texts) and
 * the read is a thin synchronous wrapper over it, as the probe reads its other surfaces.
 * Both refuse whole rather than return a partial truth: an empty template set (the adapter
 * leg refuses it too, so an inert estate never reads healthy), an entry that is not a
 * template (a name a path cannot carry, a regular file without the `.md` suffix, a leaf
 * that is a link or is not a regular file), a template that cannot be read, a declaration
 * that refuses, a template with none, and an adapter name two templates render (the
 * generator refuses that set as unrenderable).
 *
 * Each template is opened once and classified and read through that descriptor, so the
 * file read is the file classified. The open's flags copy the estate's no-follow read
 * (`skills-adapter-generate/read-regular-file.ts`): `O_NOFOLLOW` and `O_NONBLOCK` where the
 * host has them, so a link at the final component fails the open. What this read does not
 * do, stated plainly: on a host without `O_NOFOLLOW` (Windows) a link at the leaf is
 * followed; the templates directory and its ancestors are never classified, so a link at
 * or above the directory is followed by the listing and the open. The estate's fd-anchored
 * no-follow reader with ancestor classification
 * (`validators/portability/rule-surface-fs.ts`) is asynchronous where this probe is
 * synchronous; moving the probe's read onto it is the named follow-on, and until then the
 * adapter leg (`portability:check`), which reads through that seam, is the guard against a
 * linked template, this probe a mirror of what the leg admits.
 *
 * @packageDocumentation
 */

import { closeSync, constants, fstatSync, openSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import { TEMPLATES_DIR, specsOf } from './adapter-spec.js';
import type { SubagentPlatform } from './declaration-scalars.js';
import { readSubagentDeclaration } from './read-subagent-declaration.js';
import { templateNameRefusal } from './template-name.js';

/**
 * The open flags as the host has them: Node's types declare `O_NOFOLLOW` and `O_NONBLOCK`
 * everywhere, but Windows has neither at runtime, so each is read as possibly absent and
 * drops to 0 there (`skills-adapter-generate/read-regular-file.ts` models the same truth).
 */
const hostFlags: Partial<Record<'O_NOFOLLOW' | 'O_NONBLOCK', number>> = {
  O_NOFOLLOW: constants.O_NOFOLLOW,
  O_NONBLOCK: constants.O_NONBLOCK,
};
const TEMPLATE_OPEN_FLAGS =
  constants.O_RDONLY | (hostFlags.O_NOFOLLOW ?? 0) | (hostFlags.O_NONBLOCK ?? 0);

/** One adapter name and the platforms its declaration renders it on. */
export interface DeclaredAdapter {
  readonly name: string;
  readonly platforms: readonly SubagentPlatform[];
}

/** One template as read: its basename without `.md` and its full text. */
export interface TemplateText {
  readonly name: string;
  readonly text: string;
}

/**
 * The declared adapters of the given templates, in the order given.
 *
 * @param templates - Each template's name and text.
 * @returns The declared adapters, or the first refusal: no templates, a declaration that
 *   does not read, a template with none, or an adapter name two templates render.
 */
export function declaredAdaptersFrom(
  templates: readonly TemplateText[],
): Result<readonly DeclaredAdapter[], string> {
  if (templates.length === 0) {
    return err(`${TEMPLATES_DIR}: no templates, so no adapter is declared`);
  }
  const declared: DeclaredAdapter[] = [];
  const renderedBy = new Map<string, string>();
  for (const template of templates) {
    const head = readSubagentDeclaration(template.name, template.text);
    if (!head.ok) {
      return err(`${TEMPLATES_DIR}/${template.name}.md: ${head.error}`);
    }
    if (head.value.kind === 'undeclared') {
      return err(`${TEMPLATES_DIR}/${template.name}.md: no declaration in its frontmatter`);
    }
    for (const spec of specsOf(head.value.declaration)) {
      const other = renderedBy.get(spec.name);
      if (other !== undefined) {
        return err(
          `${TEMPLATES_DIR}/${template.name}.md: renders ${spec.name}, which ${TEMPLATES_DIR}/${other}.md also renders; the generator refuses that set`,
        );
      }
      renderedBy.set(spec.name, template.name);
      declared.push({ name: spec.name, platforms: spec.platforms });
    }
  }
  return ok(declared);
}

/**
 * The template name an entry of the templates directory carries, or the refusal: every
 * entry is validated before any suffix filter, so a stray regular file is refused as the
 * adapter leg refuses it, and a name a path cannot carry never reaches an open.
 */
function templateNameOf(entry: string): Result<string, string> {
  if (!entry.endsWith('.md')) {
    return err(
      `${TEMPLATES_DIR}/${entry}: not a template (the templates directory admits .md templates only)`,
    );
  }
  const name = entry.slice(0, -'.md'.length);
  const refusal = templateNameRefusal(name);
  return refusal === undefined ? ok(name) : err(`${TEMPLATES_DIR}/${entry}: ${refusal}`);
}

/**
 * Every declared adapter under the repository's templates directory, in name order.
 *
 * @param repoRoot - Absolute path to the repository root.
 * @returns The declared adapters, or the first refusal: the directory unlistable, an entry
 *   that is not a template, a template that is not a regular file or cannot be read, or a
 *   refusal of `declaredAdaptersFrom`.
 */
export function readDeclaredAdapters(repoRoot: string): Result<readonly DeclaredAdapter[], string> {
  const dir = join(repoRoot, TEMPLATES_DIR);
  let entries: string[];
  try {
    entries = readdirSync(dir).sort((a, b) => a.localeCompare(b));
  } catch (cause) {
    return err(`${TEMPLATES_DIR}: cannot list the templates (${describe(cause)})`);
  }
  const templates: TemplateText[] = [];
  for (const entry of entries) {
    const name = templateNameOf(entry);
    if (!name.ok) {
      return name;
    }
    const text = readTemplateText(join(dir, entry));
    if (!text.ok) {
      return err(`${TEMPLATES_DIR}/${entry}: ${text.error}`);
    }
    templates.push({ name: name.value, text: text.value });
  }
  return declaredAdaptersFrom(templates);
}

/**
 * A template's text, opened once and classified and read through the one descriptor.
 *
 * @param file - Absolute path to one entry of the templates directory.
 * @returns The text, or the refusal: `not a regular file` when the open fails with `ELOOP`
 *   (under `O_NOFOLLOW`, a link at the leaf) or `fstat` does not find a regular file;
 *   otherwise the failure's code, never its message.
 */
function readTemplateText(file: string): Result<string, string> {
  let fd: number;
  try {
    fd = openSync(file, TEMPLATE_OPEN_FLAGS);
  } catch (cause) {
    return err(isLinkRefusal(cause) ? 'not a regular file' : unreadable(cause));
  }
  try {
    if (!fstatSync(fd).isFile()) {
      return err('not a regular file');
    }
    return ok(readFileSync(fd, 'utf8'));
  } catch (cause) {
    return err(unreadable(cause));
  } finally {
    closeSync(fd);
  }
}

function isLinkRefusal(cause: unknown): boolean {
  return cause instanceof Error && 'code' in cause && cause.code === 'ELOOP';
}

function unreadable(cause: unknown): string {
  return `cannot read the template (${describe(cause)})`;
}

/** The error's code or kind, never its message (which carries the working copy's absolute path). */
function describe(cause: unknown): string {
  if (cause instanceof Error) {
    const code = 'code' in cause ? cause.code : undefined;
    return typeof code === 'string' && code.length > 0 ? code : cause.name;
  }
  return 'unknown';
}
