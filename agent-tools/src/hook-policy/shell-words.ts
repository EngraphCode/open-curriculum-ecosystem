/**
 * Shell-word segmentation for the argument-aware Bash-guard matcher.
 *
 * Splits a command line into simple-command segments of words the way a
 * shell would read it far enough for option matching. What the words are:
 * the literal text after quote removal (`rm '-rf' dir` gives `rm` the word
 * `-rf`, exactly as the shell does; the ANSI-C `$'…'` form is a quote), with
 * a backslash escaping the next character (inside double quotes only the
 * characters bash lets it escape); a command substitution (`$(…)` or a
 * backtick pair), unquoted or inside double quotes, stays inside its word
 * and its body is carried alongside as a nested command; a comment from an
 * unquoted `#` at a word start is dropped. What ends a segment: the
 * command-list and pipeline operators (`&&`, `||`, `|`, `;`, `&`), a
 * newline, and a bare sub-shell or group parenthesis, so an option is only
 * ever read against the command in its own segment.
 *
 * What the scanner does not do, by design: expand variables or tildes,
 * resolve aliases or shell functions, or read a script arriving on stdin.
 * A word it produces is what a command would see in `argv` only when no
 * expansion intervenes.
 *
 * @packageDocumentation
 */

/**
 * One shell word: its text after quote removal, and the bodies of any command
 * substitutions it carries (from unquoted or double-quoted text; a
 * single-quoted span is literal).
 */
export interface ShellWord {
  readonly text: string;
  readonly nested: readonly string[];
}

interface ScanState {
  readonly segments: ShellWord[][];
  words: ShellWord[];
  word: string;
  inWord: boolean;
  nested: string[];
}

const TWO_CHAR_OPERATORS: readonly string[] = ['&&', '||'];
const ONE_CHAR_OPERATORS: ReadonlySet<string> = new Set(['|', ';', '&', '\n', '(', ')']);

function endWord(state: ScanState): void {
  if (state.inWord) {
    state.words.push({ text: state.word, nested: state.nested });
  }
  state.word = '';
  state.inWord = false;
  state.nested = [];
}

function endSegment(state: ScanState): void {
  endWord(state);
  if (state.words.length > 0) {
    state.segments.push(state.words);
  }
  state.words = [];
}

/** The characters a backslash escapes inside double quotes; before any other it is literal. */
const DOUBLE_QUOTE_ESCAPABLE: ReadonlySet<string> = new Set(['$', '`', '"', '\\', '\n']);

/** Consume one character of a double-quoted span at `index`, honouring bash's escape and substitution rules. */
function readDoubleQuotedAt(command: string, index: number, state: ScanState): number {
  const char = command[index] ?? '';
  if (char === '\\' && DOUBLE_QUOTE_ESCAPABLE.has(command[index + 1] ?? '')) {
    return readEscape(command, index, state);
  }
  if (command.startsWith('$(', index) || char === '`') {
    return readSubstitution(command, index, state);
  }
  state.word += char;
  return index + 1;
}

/**
 * Read a quoted span opened at `start`; returns the index just past the
 * closing quote (or the end of the line when the quote is unterminated). A
 * single-quoted span is literal; inside double quotes a backslash escapes
 * the characters bash lets it escape, and a command substitution is read
 * as it would be unquoted, so its body is carried as a nested command.
 */
function readQuoted(command: string, start: number, quote: string, state: ScanState): number {
  let index = start + 1;
  while (index < command.length && command[index] !== quote) {
    if (quote === '"') {
      index = readDoubleQuotedAt(command, index, state);
    } else {
      state.word += command[index] ?? '';
      index += 1;
    }
  }
  state.inWord = true;
  return index + 1;
}

function readEscape(command: string, index: number, state: ScanState): number {
  state.word += command[index + 1] ?? '';
  state.inWord = true;
  return index + 2;
}

/** The index of the `)` closing a `$(` opened at `start`, honouring nesting; the line's end when unclosed. */
function findSubstitutionClose(command: string, start: number): number {
  let depth = 0;
  for (let index = start; index < command.length; index += 1) {
    if (command[index] === '(') {
      depth += 1;
    } else if (command[index] === ')') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  return command.length;
}

/**
 * Read a command substitution — `$(…)` or a backtick pair — keeping its full
 * text inside the current word and carrying its body as a nested command.
 */
function readSubstitution(command: string, index: number, state: ScanState): number {
  const isDollar = command.startsWith('$(', index);
  const bodyStart = isDollar ? index + 2 : index + 1;
  const close = isDollar
    ? findSubstitutionClose(command, index + 1)
    : (() => {
        const next = command.indexOf('`', bodyStart);
        return next === -1 ? command.length : next;
      })();
  state.nested.push(command.slice(bodyStart, close));
  state.word += command.slice(index, close + 1);
  state.inWord = true;
  return close + 1;
}

function readComment(command: string, index: number): number {
  const newline = command.indexOf('\n', index);
  return newline === -1 ? command.length : newline;
}

/** Consume an operator or a substitution at `index`; `null` when the text there is neither. */
function scanOperator(command: string, index: number, state: ScanState): number | null {
  const char = command[index] ?? '';
  if (TWO_CHAR_OPERATORS.includes(command.slice(index, index + 2))) {
    endSegment(state);
    return index + 2;
  }
  if (command.startsWith('$(', index) || char === '`') {
    return readSubstitution(command, index, state);
  }
  if (ONE_CHAR_OPERATORS.has(char)) {
    endSegment(state);
    return index + 1;
  }
  return null;
}

/** Consume a quoted span (including the ANSI-C `$'…'` form) or an escape at `index`; `null` when the text there is neither. */
function scanQuoting(command: string, index: number, state: ScanState): number | null {
  if (command.startsWith("$'", index)) {
    return readQuoted(command, index + 1, "'", state);
  }
  const char = command[index] ?? '';
  if (char === '"' || char === "'") {
    return readQuoted(command, index, char, state);
  }
  return char === '\\' ? readEscape(command, index, state) : null;
}

/** Consume the text at `index` and return the index of the next unread character. */
function scanAt(command: string, index: number, state: ScanState): number {
  const consumed = scanOperator(command, index, state) ?? scanQuoting(command, index, state);
  if (consumed !== null) {
    return consumed;
  }
  const char = command[index] ?? '';
  if (char === '#' && !state.inWord) {
    return readComment(command, index);
  }
  if (/\s/u.test(char)) {
    endWord(state);
    return index + 1;
  }
  state.word += char;
  state.inWord = true;
  return index + 1;
}

/**
 * Split a shell command line into simple-command segments of words. See the
 * module doc for what a word is and what ends a segment.
 */
export function segmentCommand(command: string): readonly (readonly ShellWord[])[] {
  const state: ScanState = {
    segments: [],
    words: [],
    word: '',
    inWord: false,
    nested: [],
  };
  let index = 0;
  while (index < command.length) {
    index = scanAt(command, index, state);
  }
  endSegment(state);
  return state.segments;
}
