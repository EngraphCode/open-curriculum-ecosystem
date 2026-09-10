import type { ShellWord } from './shell-words.js';

/**
 * The nested commands a shell segment carries for the argument-aware
 * matcher: the bodies of its command substitutions, and the script a shell
 * interpreter in it is given. Each is re-read as a command of its own, to a
 * bounded depth.
 *
 * @packageDocumentation
 */

/** Re-reads one nested command text at the given depth. */
export type NestedMatcher = (command: string, depth: number) => boolean;

/** The last path segment of a command word (`/bin/rm` is `rm`). */
export function basename(text: string): string {
  const slash = text.lastIndexOf('/');
  return slash === -1 ? text : text.slice(slash + 1);
}

/** Shell interpreters whose quoted argument is a script and so is read as a nested command. */
const SHELL_INTERPRETERS: ReadonlySet<string> = new Set([
  'sh',
  'bash',
  'zsh',
  'dash',
  'ksh',
  'eval',
  'ssh',
]);

/** Interpreters that read every operand as their script (`eval a b`, `ssh host cmd`). */
const SCRIPT_OPERAND_INTERPRETERS: ReadonlySet<string> = new Set(['eval', 'ssh']);

/** How deep a quoted script is re-read (`sh -c "bash -c '…'"`). */
const MAX_NESTED_SCAN_DEPTH = 2;

/** A word with whitespace in it can only come from quoting or escaping: handed to an interpreter, it is a script. */
function isScriptWord(word: ShellWord): boolean {
  return /\s/u.test(word.text);
}

/** Whether a command substitution in the segment carries a matching command. */
export function substitutionInSegment(
  words: readonly ShellWord[],
  depth: number,
  matches: NestedMatcher,
): boolean {
  return (
    depth < MAX_NESTED_SCAN_DEPTH &&
    words.some((word) => word.nested.some((body) => matches(body, depth + 1)))
  );
}

/**
 * The words an interpreter in the segment reads as its script: for the
 * sh-like shells, the first operand after an option cluster carrying `c`
 * (`-c`, `-lc`, `-ec`); for `eval` and `ssh`, every later operand. A path
 * handed to `bash` without `-c` is a file, not source text.
 */
function interpreterScriptWords(words: readonly ShellWord[]): readonly ShellWord[] {
  const interpreterIndex = words.findIndex((word) => SHELL_INTERPRETERS.has(basename(word.text)));
  if (interpreterIndex === -1) {
    return [];
  }
  const rest = words.slice(interpreterIndex + 1);
  if (SCRIPT_OPERAND_INTERPRETERS.has(basename(words[interpreterIndex]?.text ?? ''))) {
    return rest.filter((word) => !word.text.startsWith('-'));
  }
  const commandFlag = rest.findIndex((word) => /^-[A-Za-z]*c[A-Za-z]*$/u.test(word.text));
  const script = rest.slice(commandFlag + 1).find((word) => !word.text.startsWith('-'));
  return commandFlag === -1 || script === undefined ? [] : [script];
}

/** Whether a script handed to a shell interpreter in the segment carries a matching command. */
export function interpreterScriptInSegment(
  words: readonly ShellWord[],
  depth: number,
  matches: NestedMatcher,
): boolean {
  return (
    depth < MAX_NESTED_SCAN_DEPTH &&
    interpreterScriptWords(words).some(
      (word) => isScriptWord(word) && matches(word.text, depth + 1),
    )
  );
}
