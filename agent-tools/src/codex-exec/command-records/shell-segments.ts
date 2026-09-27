/**
 * The shell front door and POSIX word splitting with quote removal.
 *
 * A command the harness ran is an argv. When its program is a shell running a
 * script (`sh -c`, `bash -lc`, `bash -euo pipefail -c`, `/bin/zsh -lc`), the
 * script is the command the seat meant, so it is split into words as the
 * shell would, with quotes removed, and into segments at the unquoted
 * separators `&&`, `||`, `;`, `|`, `&`, newline and the parentheses of a
 * subshell or a `$(…)` substitution. Each segment goes through the front door
 * again, so a shell nested in a shell is lifted too. A separator or a program
 * name inside quotes is one word and never a segment; the body of a here
 * document is data and yields no segment; a `#` that begins a word starts a
 * comment dropped to the end of its line. A redirection operator (`>`, `>>`,
 * `<`, `2>&1`, `>&2`, `&>`) is one word with the digits before it and any
 * target glued to it, and it delimits the word before it, so `&` separates
 * only outside an operator and a flag after a redirection is still read.
 *
 * Nothing is expanded, and the reader lifts no more than the shell's own
 * words: `$HOME` and a backtick stay as the characters they are, so a shape
 * hidden behind `eval` or inside a backticked command, in `$'…'` quoting,
 * behind `xargs` or `find -exec`, under a git alias, or spelt as an
 * abbreviated long option is a residual of this reader, not a segment. An
 * argv that is not a shell script passes through as one segment.
 */

import { scriptOf } from './shell-front-door.js';
import { HereDocuments } from './shell-here-document.js';

/** Inside double quotes a backslash escapes these alone; before any other character it stays. */
const DOUBLE_QUOTE_ESCAPES = '"\\$`';
const QUOTES: ReadonlySet<string> = new Set(['"', "'"]);
const BLANKS: ReadonlySet<string> = new Set([' ', '\t']);
/** `&&` and `||` read as two separators; the empty segment between them opens nothing. */
const SEPARATORS: ReadonlySet<string> = new Set(['\n', ';', '|', '(', ')']);
/** The characters a redirection operator is made of; `&` is also a separator outside one. */
const OPERATORS: ReadonlySet<string> = new Set(['<', '>', '&']);
/** A word that `<` or `>` continues: nothing or digits before it, a lone `&`, or an operator so far. */
const OPERATOR_HEAD = /^(?:\d*|&|.*[<>])$/u;

/** One command of a shell script: its words after quote removal. */
export type Segment = readonly string[];

/** Folds one script into words and segments, one character at a time. */
class Splitter {
  private readonly segments: string[][] = [];
  private words: string[] = [];
  private word = '';
  /** A word is being built, so an empty pair of quotes still yields a word. */
  private building = false;
  private quote: '"' | "'" | undefined = undefined;
  private escaped = false;
  /** Inside a `#` comment, dropped to the end of its line. */
  private comment = false;
  private readonly hereDocuments = new HereDocuments();
  private readonly script: string;

  constructor(script: string) {
    this.script = script;
  }

  run(): readonly Segment[] {
    const characters = [...this.script];
    for (const [index, character] of characters.entries()) {
      this.step(character, characters[index + 1]);
    }
    this.endWord();
    this.endSegment();
    return this.segments;
  }

  private step(character: string, next: string | undefined): void {
    if (this.hereDocuments.inBody) {
      this.hereDocuments.read(character);
    } else if (this.comment) {
      this.inComment(character);
    } else if (this.escaped) {
      this.escapedCharacter(character);
    } else if (this.quote === "'") {
      this.inSingleQuotes(character);
    } else if (this.quote === '"') {
      this.inDoubleQuotes(character);
    } else {
      this.unquoted(character, next);
    }
  }

  /** A comment runs to the end of its line; the newline then separates as usual. */
  private inComment(character: string): void {
    if (character === '\n') {
      this.comment = false;
      this.separator('\n');
    }
  }

  /** The character after a backslash: a newline is a continuation, the rest is literal. */
  private escapedCharacter(character: string): void {
    this.escaped = false;
    if (character === '\n') {
      return;
    }
    if (this.quote === '"' && !DOUBLE_QUOTE_ESCAPES.includes(character)) {
      this.take('\\');
    }
    this.take(character);
  }

  private inSingleQuotes(character: string): void {
    if (character === "'") {
      this.quote = undefined;
    } else {
      this.take(character);
    }
  }

  private inDoubleQuotes(character: string): void {
    if (character === '"') {
      this.quote = undefined;
    } else if (character === '\\') {
      this.escaped = true;
    } else {
      this.take(character);
    }
  }

  private unquoted(character: string, next: string | undefined): void {
    if (this.startsComment(character)) {
      this.comment = true;
    } else if (character === '\\') {
      this.escaped = true;
    } else if (QUOTES.has(character)) {
      this.quote = character === '"' ? '"' : "'";
      this.building = true;
    } else if (BLANKS.has(character)) {
      this.endWord();
    } else if (OPERATORS.has(character)) {
      this.operator(character, next);
    } else if (SEPARATORS.has(character)) {
      this.separator(character);
    } else {
      this.take(character);
    }
  }

  /** A `#` begins a comment only where a word would begin. */
  private startsComment(character: string): boolean {
    return character === '#' && !this.building;
  }

  /** `<` or `>` continues an operator word or, after an ordinary word, delimits it and opens one; `&` is read on its own. */
  private operator(character: string, next: string | undefined): void {
    if (character === '&') {
      this.ampersand(next);
      return;
    }
    if (!OPERATOR_HEAD.test(this.word)) {
      this.endWord();
    }
    this.take(character);
  }

  /** `>&` and `<&` continue an operator, `&>` opens one, and any other `&` separates. */
  private ampersand(next: string | undefined): void {
    const last = this.word.at(-1);
    if (last === '>' || last === '<') {
      this.take('&');
    } else if (next === '>') {
      this.endWord();
      this.take('&');
    } else {
      this.separator('&');
    }
  }

  /** A separator closes the segment; a newline then opens any here-document body announced on the line. */
  private separator(character: string): void {
    this.endWord();
    this.endSegment();
    if (character === '\n') {
      this.hereDocuments.openBody();
    }
  }

  private take(character: string): void {
    this.word += character;
    this.building = true;
  }

  private endWord(): void {
    if (!this.building) {
      return;
    }
    this.words.push(this.word);
    this.hereDocuments.note(this.word);
    this.word = '';
    this.building = false;
  }

  /** A separator with no words before it (`&&` read as two `&`) opens no segment. */
  private endSegment(): void {
    if (this.words.length > 0) {
      this.segments.push(this.words);
      this.words = [];
    }
  }
}

/**
 * The commands an argv means: the argv itself as one segment, or, when it is
 * a shell running a script, every command of that script with quotes removed,
 * lifted through as many nested shells as it carries.
 */
export function shellSegments(argv: Segment): readonly Segment[] {
  const script = scriptOf(argv);
  if (script === undefined) {
    return argv.length === 0 ? [] : [argv];
  }
  return new Splitter(script).run().flatMap((segment) => shellSegments(segment));
}
