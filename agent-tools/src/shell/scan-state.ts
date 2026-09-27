import type { Heredoc } from './redirections.js';

/**
 * The scanner's state while it reads one command line: the segments closed
 * so far, the words of the open segment, the word being read with the
 * substitution bodies it carries, and the here-documents announced on the
 * line.
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

export interface ScanState {
  readonly segments: ShellWord[][];
  words: ShellWord[];
  word: string;
  inWord: boolean;
  nested: string[];
  heredocs: Heredoc[];
}

export function endWord(state: ScanState): void {
  if (state.inWord) {
    state.words.push({ text: state.word, nested: state.nested });
  }
  state.word = '';
  state.inWord = false;
  state.nested = [];
}

export function endSegment(state: ScanState): void {
  endWord(state);
  if (state.words.length > 0) {
    state.segments.push(state.words);
  }
  state.words = [];
}
