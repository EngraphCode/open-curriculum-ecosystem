import { decodeAnsiCQuoted } from './ansi-c-quotes.js';
import { findBacktickClose, findSubstitutionClose } from './substitution-bounds.js';

/**
 * Redirections for the shell-word scanner: the `&` and `|` that belong to a
 * redirection rather than an operator, and here-documents — the `<<` /
 * `<<-` operator with its delimiter word, and the body lines that follow the
 * command line. A here-document body is data the command reads, never
 * commands the shell runs, so it is dropped; the command substitutions an
 * unquoted-delimiter body carries are the one thing the shell does run in
 * it, and those are kept as nested commands.
 *
 * @packageDocumentation
 */

/**
 * Whether the `&` or `|` at `index` belongs to a redirection (`>&`, `<&`,
 * `&>`, `>|`) rather than to a list or pipeline operator; `previous` is the
 * last character of the word being read, or empty at a word start.
 */
export function isRedirectionPart(command: string, index: number, previous: string): boolean {
  const char = command[index];
  if (char === '&') {
    return previous === '>' || previous === '<' || command[index + 1] === '>';
  }
  return char === '|' && previous === '>';
}

/** One pending here-document, read from its operator until its body is consumed. */
export interface Heredoc {
  readonly delimiter: string;
  /** A quoted or escaped delimiter makes the body literal: no expansion, no substitution. */
  readonly literal: boolean;
  /** `<<-` strips leading tabs from the body lines and from the delimiter line. */
  readonly stripTabs: boolean;
}

/** The characters that end a delimiter word. */
const DELIMITER_END = /[\s;&|<>()]/u;

/** Read one part of a delimiter word at `index` — a quoted span (the ANSI-C `$'…'` form included), an escaped character, or a plain one: its text, whether it was quoted, and the index after it. */
function readDelimiterPart(command: string, index: number): [string, boolean, number] {
  const char = command[index] ?? '';
  if (command.startsWith("$'", index)) {
    const [text, next] = decodeAnsiCQuoted(command, index);
    return [text, true, next];
  }
  if (char === "'" || char === '"') {
    const close = command.indexOf(char, index + 1);
    const end = close === -1 ? command.length : close;
    return [command.slice(index + 1, end), true, end + 1];
  }
  if (char === '\\') {
    return [command[index + 1] ?? '', true, index + 2];
  }
  return [char, false, index + 1];
}

/** Read the delimiter word at `cursor`: its text with quotes and escapes removed, whether any were present, and the index after it. */
function readDelimiterWord(command: string, cursor: number): [string, boolean, number] {
  let delimiter = '';
  let literal = false;
  let index = cursor;
  while (index < command.length && !DELIMITER_END.test(command[index] ?? '')) {
    const [text, quoted, next] = readDelimiterPart(command, index);
    delimiter += text;
    literal = literal || quoted;
    index = next;
  }
  return [delimiter, literal, index];
}

/**
 * Read a here-document operator at `index` — `<<` or `<<-`, never the `<<<`
 * here-string (nor its tail, when the first `<` has already been read) —
 * and its delimiter word; `null` when the text there is not one. Returns
 * the heredoc and the index after the delimiter word.
 */
export function readHeredocOperator(command: string, index: number): [Heredoc, number] | null {
  const hereString = command.startsWith('<<<', index) || command[index - 1] === '<';
  if (!command.startsWith('<<', index) || hereString) {
    return null;
  }
  const stripTabs = command[index + 2] === '-';
  let cursor = index + (stripTabs ? 3 : 2);
  while (command[cursor] === ' ' || command[cursor] === '\t') {
    cursor += 1;
  }
  const [delimiter, literal, next] = readDelimiterWord(command, cursor);
  return [{ delimiter, literal, stripTabs }, next];
}

/** The body of one here-document starting at `start`: its end, and the index after its delimiter line (the end of input when no delimiter line comes). */
function findHeredocBody(command: string, start: number, heredoc: Heredoc): [number, number] {
  let lineStart = start;
  while (lineStart < command.length) {
    const newline = command.indexOf('\n', lineStart);
    const lineEnd = newline === -1 ? command.length : newline;
    const line = command.slice(lineStart, lineEnd);
    if ((heredoc.stripTabs ? line.replace(/^\t+/u, '') : line) === heredoc.delimiter) {
      return [lineStart, Math.min(lineEnd + 1, command.length)];
    }
    lineStart = lineEnd + 1;
  }
  return [command.length, command.length];
}

/** Push the bodies of the command substitutions in a non-literal here-document body. */
function collectSubstitutions(body: string, nested: string[]): void {
  let index = 0;
  while (index < body.length) {
    if (body[index] === '\\') {
      index += 2;
    } else if (body.startsWith('$(', index)) {
      const close = findSubstitutionClose(body, index + 1);
      nested.push(body.slice(index + 2, close));
      index = close + 1;
    } else if (body[index] === '`') {
      const close = findBacktickClose(body, index + 1);
      nested.push(body.slice(index + 1, close));
      index = close + 1;
    } else {
      index += 1;
    }
  }
}

/**
 * Consume the bodies of the pending here-documents that begin after the
 * newline at `index`, in order. Returns the index after the last delimiter
 * line; the substitutions of each non-literal body are pushed to `nested`.
 */
export function skipHeredocBodies(
  command: string,
  index: number,
  pending: readonly Heredoc[],
  nested: string[],
): number {
  let cursor = index + 1;
  for (const heredoc of pending) {
    const [bodyEnd, next] = findHeredocBody(command, cursor, heredoc);
    if (!heredoc.literal) {
      collectSubstitutions(command.slice(cursor, bodyEnd), nested);
    }
    cursor = next;
  }
  return cursor;
}
