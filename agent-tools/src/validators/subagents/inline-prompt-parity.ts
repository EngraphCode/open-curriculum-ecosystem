/**
 * The PDR-009 inline-prompt check: a role whose Claude adapter carries its
 * prompt in place of a pointer keeps that copy verbatim.
 *
 * @remarks
 * A role that cannot read files, or whose bounded turns belong to its task,
 * carries its template's System prompt block in its Claude adapter (PDR-009,
 * 2026-09-24). The template stays the prompt's one home, so the scope is read
 * from the templates: every template with a `## System prompt` section is
 * such a role, and its Claude adapter's body must equal the block word for
 * word, with nothing beside it but the one pairing comment. Line wrapping and
 * paragraph breaks are not compared: the template's quote markers shift its
 * wrap, and a formatter may rewrap either file. A changed or added word, an
 * extra comment, and a pointer in place of the copy are all caught.
 *
 * @packageDocumentation
 */

const SYSTEM_PROMPT_HEADING = /^## system prompt\s*$/iu;
const NEXT_SECTION_PREFIX = '## ';
const QUOTE_LINE = /^ {0,3}> ?/u;
const FRONTMATTER = /^---\n[\s\S]*?\n---\n/u;
const PAIRING_COMMENT = /<!--\s*Paired with the canonical definition in[\s\S]*?-->/u;
const WHITESPACE_RUN = /\s+/gu;
const CRLF = /\r\n/gu;

/** The System prompt section of a template, when it has one. */
type SystemPromptSection =
  { readonly kind: 'absent' } | { readonly kind: 'present'; readonly block: string };

/** The text's words, one space apart: a comparison that ignores wrapping. */
function words(text: string): string {
  return text.replaceAll(WHITESPACE_RUN, ' ').trim();
}

/**
 * The System prompt section of a template: `absent` when there is no such
 * heading, otherwise the first run of consecutive quoted lines under it with
 * the quote markers removed (an empty block when it quotes nothing).
 */
function systemPromptSection(template: string): SystemPromptSection {
  const lines = template.replaceAll(CRLF, '\n').split('\n');
  const start = lines.findIndex((line) => SYSTEM_PROMPT_HEADING.test(line));
  if (start === -1) {
    return { kind: 'absent' };
  }
  const section = lines.slice(start + 1);
  const end = section.findIndex((line) => line.startsWith(NEXT_SECTION_PREFIX));
  const body = end === -1 ? section : section.slice(0, end);
  const first = body.findIndex((line) => QUOTE_LINE.test(line));
  if (first === -1) {
    return { kind: 'present', block: '' };
  }
  const run = body.slice(first);
  const stop = run.findIndex((line) => !QUOTE_LINE.test(line));
  const quoted = (stop === -1 ? run : run.slice(0, stop)).map((line) =>
    line.replace(QUOTE_LINE, ''),
  );
  return { kind: 'present', block: quoted.join('\n').trim() };
}

/**
 * The substantive body of a Claude adapter: its text after the frontmatter,
 * with the one pairing comment removed and outer whitespace trimmed. Any other
 * comment stays in the body, so it fails the comparison.
 */
function claudeAdapterBody(adapter: string): string {
  return adapter
    .replaceAll(CRLF, '\n')
    .replace(FRONTMATTER, '')
    .replace(PAIRING_COMMENT, '')
    .trim();
}

/**
 * The parity issues for one template and its Claude adapter.
 *
 * @param input - The template and adapter paths (for the messages), the
 * template's Markdown, and the adapter's Markdown or `undefined` when no
 * adapter file exists.
 * @returns One message per defect; empty when the template has no System
 * prompt section or the adapter's body is its block word for word.
 */
export function inlinePromptParityIssues(input: {
  readonly templatePath: string;
  readonly template: string;
  readonly adapterPath: string;
  readonly adapter: string | undefined;
}): readonly string[] {
  const section = systemPromptSection(input.template);
  if (section.kind === 'absent') {
    return [];
  }
  if (section.block === '') {
    return [`${input.templatePath}: has a System prompt heading but no quoted block under it`];
  }
  if (input.adapter === undefined) {
    return [
      `${input.templatePath}: has a System prompt block but no Claude adapter at ${input.adapterPath} to carry it`,
    ];
  }
  if (words(claudeAdapterBody(input.adapter)) !== words(section.block)) {
    return [
      `${input.adapterPath}: its prompt is not a verbatim copy of the System prompt block in ${input.templatePath} (PDR-009 inline-prompt role); copy the template block into the adapter and put nothing else outside the pairing comment`,
    ];
  }
  return [];
}

const TEMPLATE_DIR_PREFIX = '.agent/sub-agents/templates/';
const TEMPLATE_POINTER = /\.agent\/sub-agents\/templates\/[\w.-]+\.md/gu;
const COMMENT_OPEN = '<!--';
const COMMENT_CLOSE = '-->';

/**
 * The text outside HTML comments. A comment left open runs to the end of the
 * text, as it does in HTML, so nothing after an unclosed `<!--` counts.
 */
function textOutsideComments(text: string): string {
  const parts: string[] = [];
  let from = 0;
  while (from < text.length) {
    const open = text.indexOf(COMMENT_OPEN, from);
    if (open === -1) {
      parts.push(text.slice(from));
      break;
    }
    parts.push(text.slice(from, open));
    const close = text.indexOf(COMMENT_CLOSE, open + COMMENT_OPEN.length);
    from = close === -1 ? text.length : close + COMMENT_CLOSE.length;
  }
  return parts.join('');
}

/**
 * The scope issues for one Claude adapter. An adapter that names template
 * paths outside any comment points to its template, and every path it names
 * must be a template file that exists. An adapter that names none must belong
 * to a role whose template has a System prompt section, so a template that
 * loses its section cannot leave an inline copy unchecked.
 *
 * @param input - The adapter's path and Markdown, its template's path and
 * Markdown or `undefined` when no template file exists, and the template files
 * that exist.
 * @returns One message per pointer to a missing template, or one message when
 * the adapter is neither a pointer nor an inline copy in scope; empty
 * otherwise.
 */
export function claudeAdapterScopeIssues(input: {
  readonly adapterPath: string;
  readonly adapter: string;
  readonly templatePath: string;
  readonly template: string | undefined;
  readonly knownTemplates: ReadonlySet<string>;
}): readonly string[] {
  const body = textOutsideComments(input.adapter.replaceAll(CRLF, '\n').replace(FRONTMATTER, ''));
  const pointers = body.match(TEMPLATE_POINTER) ?? [];
  if (pointers.length > 0) {
    return pointers
      .filter((pointer) => !input.knownTemplates.has(pointer))
      .map(
        (pointer) =>
          `${input.adapterPath}: points to ${pointer}, which is not a template file in ${TEMPLATE_DIR_PREFIX}`,
      );
  }
  if (input.template !== undefined && systemPromptSection(input.template).kind === 'present') {
    return [];
  }
  return [
    `${input.adapterPath}: neither points to a template in ${TEMPLATE_DIR_PREFIX} nor belongs to a role whose template has a System prompt section (PDR-009 inline-prompt role)`,
  ];
}
