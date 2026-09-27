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
 * document is data and yields no segment. Nothing is expanded: `$HOME` and a
 * backtick stay as the characters they are, so a shape hidden behind `eval` or
 * inside a backticked command is a residual of this reader, not a segment. An
 * argv that is not a shell script passes through as one segment.
 */

import { scriptOf } from './shell-front-door.js';
import { HereDocuments } from './shell-here-document.js';

/** Inside double quotes a backslash escapes these alone; before any other character it stays. */
const DOUBLE_QUOTE_ESCAPES = '"\\$`';
const QUOTES: ReadonlySet<string> = new Set(['"', "'"]);
const BLANKS: ReadonlySet<string> = new Set([' ', '\t']);
/** `&&` and `||` read as two separators; the empty segment between them opens nothing. */
const SEPARATORS: ReadonlySet<string> = new Set(['\n', ';', '&', '|', '(', ')']);

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
  private readonly hereDocuments = new HereDocuments();
  private readonly script: string;

  constructor(script: string) {
    this.script = script;
  }

  run(): readonly Segment[] {
    for (const character of this.script) {
      this.step(character);
    }
    this.endWord();
    this.endSegment();
    return this.segments;
  }

  private step(character: string): void {
    if (this.hereDocuments.inBody) {
      this.hereDocuments.read(character);
    } else if (this.escaped) {
      this.escapedCharacter(character);
    } else if (this.quote === "'") {
      this.inSingleQuotes(character);
    } else if (this.quote === '"') {
      this.inDoubleQuotes(character);
    } else {
      this.unquoted(character);
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

  private unquoted(character: string): void {
    if (character === '\\') {
      this.escaped = true;
    } else if (QUOTES.has(character)) {
      this.quote = character === '"' ? '"' : "'";
      this.building = true;
    } else if (BLANKS.has(character)) {
      this.endWord();
    } else if (SEPARATORS.has(character)) {
      this.separator(character);
    } else {
      this.take(character);
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
