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
 * A YAML fence opener on a line the top-level reader did not take.
 *
 * @remarks
 * THE INVARIANT, stated once instead of enumerated. CommonMark fences nest
 * inside containers, and reading those correctly means tracking container
 * state — a Markdown parser's job, not this file's. The unread case must not
 * be silent, though: a plan node whose pinned YAML sits in a container would
 * sail past a check whose whole purpose is that no pinned YAML goes unparsed.
 *
 * An earlier form of this detector LISTED the containers it knew — blockquote,
 * then list marker, then deep indent — and four review rounds sampled it once
 * each, a new prefix every time. What is unbounded there is the NESTING, not
 * the vocabulary: CommonMark has exactly two container-start markers, the
 * blockquote `>` and the list marker, each optionally indented. So the grammar
 * is closed and can be stated once, and arbitrary nesting is a repetition of
 * it rather than a longer list.
 *
 * A first attempt at that stated it as "any letter-free prefix", on the
 * reasoning that container markers carry no letters. That was complete but too
 * broad in the other direction: it refused ordinary prose whose prefix happens
 * to be punctuation, such as a dated line mentioning a fence spelling, and a
 * gate that rejects valid documents is a worse failure than the one it was
 * closing. The prefix below is the actual grammar — repeat the two markers,
 * allow their indentation, and require the fence immediately after — so
 * `> - `, `> > - ` and any depth match, while `2026-09-11: ` does not, a colon
 * and hyphens being no part of it.
 */
const CONTAINER_MARKER = String.raw` {0,3}(?:>[ \t]?|(?:[-*+]|\d{1,9}[.)])[ \t]+)`;

const UNREAD_YAML_FENCE = new RegExp(
  String.raw`^(?:${CONTAINER_MARKER})*[ \t]*(?:\x60{3,}|~{3,})[ \t]*(?:yaml|yml)\b`,
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
  if (open === undefined && UNREAD_YAML_FENCE.test(line)) {
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
