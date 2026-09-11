/**
 * Markdown fenced-code-block scanning, narrowed to the YAML blocks a plan node
 * pins.
 *
 * @remarks
 * Read as FENCES rather than as one literal spelling. A regex looking only for
 * a three-backtick block tagged `yaml` finds nothing in a node that writes
 * `yml`, opens with tildes, indents the fence, or uses a longer backtick run —
 * all ordinary Markdown an author reaches for without thinking, and the last of
 * them is what someone pinning a file that itself contains a fence must use.
 * Each of those would restore the false green the parse check exists to remove,
 * so this scanner tracks the opening delimiter, closes on a matching run, and
 * strips the opener's own indentation from the content as CommonMark does.
 *
 * FAIL-CLOSED at the edge of what it reads. Fences nest inside blockquotes and
 * list items, and following them there means tracking container state, which is
 * a Markdown parser's job. Rather than narrow the promise to "most blocks", the
 * scanner REFUSES a YAML fence it finds in a position it cannot read, so the
 * unread case is loud instead of a silent false green — the same move as the
 * mode probe in `owner-only-write.ts`.
 *
 * Its own home because it is a Markdown concern, not a plan-schema one; the
 * plan validator consumes {@link scanYamlFences} and knows nothing of fences.
 *
 * @packageDocumentation
 */

/** An open code fence: what will close it, and whether its content is YAML. */
interface OpenFence {
  /** The run of backticks or tildes that opened it; the closer matches or exceeds it. */
  readonly delimiter: string;
  /** Leading spaces on the opening line; the same count is stripped from content. */
  readonly indent: number;
  /** Whether the info string names YAML, under either of its two spellings. */
  readonly isYaml: boolean;
}

const FENCE_LINE = /^(?<indent> {0,3})(?<delimiter>`{3,}|~{3,})[ \t]*(?<info>.*)$/u;

/** The two info strings that name YAML; both are ordinary and both must be read. */
const YAML_INFO_STRINGS = new Set(['yaml', 'yml']);

/**
 * The language an info string names: its first token, lowercased, with any
 * trailing attributes (a title, a highlight range) discarded.
 */
function languageOf(info: string): string {
  return (
    info
      .trim()
      .split(/[\s,{]/u)[0]
      ?.toLowerCase() ?? ''
  );
}

/** A fence opener, or `undefined` when the line is not one. */
function openFenceAt(line: string): OpenFence | undefined {
  const groups = FENCE_LINE.exec(line)?.groups;
  if (groups === undefined) {
    return undefined;
  }
  const { indent = '', delimiter = '', info = '' } = groups;
  // CommonMark: a backtick fence's info string may not itself contain a
  // backtick, which is what keeps inline code from opening a block.
  if (delimiter.startsWith('`') && info.includes('`')) {
    return undefined;
  }
  return {
    delimiter,
    indent: indent.length,
    isYaml: YAML_INFO_STRINGS.has(languageOf(info)),
  };
}

/** Whether `line` closes `open`: same character, no shorter, nothing but the run. */
function closesFence(line: string, open: OpenFence): boolean {
  const groups = FENCE_LINE.exec(line)?.groups;
  if (groups === undefined || groups.info !== '') {
    return false;
  }
  const delimiter = groups.delimiter ?? '';
  return delimiter[0] === open.delimiter[0] && delimiter.length >= open.delimiter.length;
}

/** How many of the first `limit` characters of `line` are spaces. */
function countLeadingSpaces(line: string, limit: number): number {
  let count = 0;
  while (count < limit && line[count] === ' ') {
    count += 1;
  }
  return count;
}

/**
 * The three ways a line can sit inside a CommonMark container: a blockquote
 * marker, a list marker (bullet or ordered, the fence beginning on the same
 * line), or indentation past the four columns that end top-level content.
 *
 * All three are listed because a detector that catches only some of them is
 * worth less than it appears: it reports the containers it knows and stays
 * silent on the rest, which is the same false green in a smaller box. The
 * list-marker case was missing until a review found it (Copilot, PR #132).
 */
const CONTAINER_PREFIX = String.raw`(?:[ \t]*>[ \t>]*|[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+|[ \t]{4,})`;

/**
 * A line that OPENS a YAML fence in a position this scanner does not read.
 *
 * CommonMark fences nest inside containers, and reading those correctly means
 * tracking container state — a Markdown parser's job, not this file's. The
 * unread case must not be a silent one, though: a plan node whose pinned YAML
 * sits in a blockquote or a list item would sail past a check whose whole
 * purpose is that no pinned YAML goes unparsed. So an unreadable position is
 * REFUSED by name rather than skipped, and the author moves the block to the
 * top level, which is where a pinned file belongs anyway.
 */
const CONTAINED_YAML_FENCE = new RegExp(
  String.raw`^${CONTAINER_PREFIX}(?:\x60{3,}|~{3,})[ \t]*(?:yaml|yml)\b`,
  'iu',
);

/** What one scan of a document found: the blocks it read, and what it could not. */
export interface YamlFenceScan {
  /** Every fenced YAML block read, in document order, ready for a YAML parser. */
  readonly blocks: string[];
  /** 1-based line numbers of YAML fences in positions this scanner cannot read. */
  readonly unreadableAt: number[];
}

/**
 * Read one line while NO fence is open: it may open one, or it may be a YAML
 * fence in a container this scanner will not guess at, which is recorded.
 */
function readOutsideFence(
  line: string,
  lineNumber: number,
  unreadableAt: number[],
): OpenFence | undefined {
  const open = openFenceAt(line);
  if (open === undefined && CONTAINED_YAML_FENCE.test(line)) {
    unreadableAt.push(lineNumber);
  }
  return open;
}

/** Every fenced YAML block in `content`, plus any this scanner refuses to guess at. */
export function scanYamlFences(content: string): YamlFenceScan {
  const blocks: string[] = [];
  const unreadableAt: number[] = [];
  let open: OpenFence | undefined;
  let current: string[] = [];
  let lineNumber = 0;
  for (const rawLine of content.split('\n')) {
    lineNumber += 1;
    const line = rawLine.replace(/\r$/u, '');
    if (open === undefined) {
      open = readOutsideFence(line, lineNumber, unreadableAt);
      current = [];
    } else if (closesFence(line, open)) {
      if (open.isYaml) {
        blocks.push(`${current.join('\n')}\n`);
      }
      open = undefined;
    } else {
      current.push(line.slice(countLeadingSpaces(line, open.indent)));
    }
  }
  // CommonMark closes an unterminated block at the end of the document.
  if (open?.isYaml === true) {
    blocks.push(`${current.join('\n')}\n`);
  }
  return { blocks, unreadableAt };
}
