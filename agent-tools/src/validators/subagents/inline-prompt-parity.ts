/**
 * The PDR-009 exception's check: a role whose Claude adapter carries its
 * prompt in place of a pointer keeps that copy verbatim.
 *
 * @remarks
 * A role that cannot read files, or whose bounded turns belong to its task,
 * carries its template's System prompt block in its Claude adapter (PDR-009,
 * 2026-09-24). The template stays the prompt's one home, so the scope is read
 * from the templates: every template with a `## System prompt` section is
 * such a role, and its Claude adapter's body must equal the block word for
 * word, with nothing else substantive beside it. Line wrapping is not
 * compared: the template's quote markers shift its wrap, and a formatter may
 * rewrap either file.
 *
 * @packageDocumentation
 */

const SYSTEM_PROMPT_HEADING = /^## System prompt\s*$/u;
const NEXT_SECTION_HEADING = /^## /u;
const QUOTE_LINE = /^>(?: |$)/u;
const FRONTMATTER = /^---\n[\s\S]*?\n---\n/u;
const HTML_COMMENT = /<!--[\s\S]*?-->/gu;
const WHITESPACE_RUN = /\s+/gu;

/** The text's words, one space apart: a comparison that ignores wrapping. */
function words(text: string): string {
  return text.replaceAll(WHITESPACE_RUN, ' ').trim();
}

/**
 * The System prompt block of a template: the blockquote under its
 * `## System prompt` heading, with the quote markers removed.
 *
 * @param template - The template's Markdown.
 * @returns The block's text, or `undefined` when the template has no such
 * section or the section quotes nothing.
 */
function systemPromptBlock(template: string): string | undefined {
  const lines = template.split('\n');
  const start = lines.findIndex((line) => SYSTEM_PROMPT_HEADING.test(line));
  if (start === -1) {
    return undefined;
  }
  const section = lines.slice(start + 1);
  const end = section.findIndex((line) => NEXT_SECTION_HEADING.test(line));
  const quoted = (end === -1 ? section : section.slice(0, end))
    .filter((line) => QUOTE_LINE.test(line))
    .map((line) => line.replace(QUOTE_LINE, ''));
  const block = quoted.join('\n').trim();
  return block === '' ? undefined : block;
}

/**
 * The substantive body of a Claude adapter: its text after the frontmatter,
 * with HTML comments (the pairing note) removed and outer whitespace trimmed.
 */
function claudeAdapterBody(adapter: string): string {
  return adapter.replace(FRONTMATTER, '').replaceAll(HTML_COMMENT, '').trim();
}

/**
 * The parity issues for one template and its Claude adapter.
 *
 * @param input - The template and adapter paths (for the messages), the
 * template's Markdown, and the adapter's Markdown or `undefined` when no
 * adapter file exists.
 * @returns One message per defect; empty when the template has no System
 * prompt block or the adapter's body is that block word for word.
 */
export function inlinePromptParityIssues(input: {
  readonly templatePath: string;
  readonly template: string;
  readonly adapterPath: string;
  readonly adapter: string | undefined;
}): readonly string[] {
  const block = systemPromptBlock(input.template);
  if (block === undefined) {
    return [];
  }
  if (input.adapter === undefined) {
    return [
      `${input.templatePath}: has a System prompt block but no Claude adapter at ${input.adapterPath} to carry it`,
    ];
  }
  if (words(claudeAdapterBody(input.adapter)) !== words(block)) {
    return [
      `${input.adapterPath}: its prompt is not a verbatim copy of the System prompt block in ${input.templatePath} (PDR-009 exception)`,
    ];
  }
  return [];
}
