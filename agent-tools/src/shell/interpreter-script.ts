import type { ShellWord } from './shell-words.js';

/**
 * The script a shell interpreter in a segment is given: for the sh-like
 * shells, the first operand after an option cluster carrying `c` (`-c`,
 * `-lc`, `-ec`); for `eval` and `ssh`, every later operand. Shared by the
 * Claude Bash guard's argument matcher and the Codex seat-rollout reader.
 *
 * @packageDocumentation
 */

/** The last path segment of a command word (`/bin/rm` is `rm`). */
export function basename(text: string): string {
  const separator = Math.max(text.lastIndexOf('/'), text.lastIndexOf('\\'));
  return text.slice(separator + 1).replace(/\.(?:exe|cmd)$/iu, '');
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

/** A word with whitespace in it can only come from quoting or escaping: handed to an interpreter, it is a script. */
export function isScriptWord(word: ShellWord): boolean {
  return /\s/u.test(word.text);
}

/**
 * The words an interpreter in the segment reads as its script: for the
 * sh-like shells, the first operand after an option cluster carrying `c`
 * (`-c`, `-lc`, `-ec`); for `eval` and `ssh`, the later operands joined into
 * the one command they run. A path handed to `bash` without `-c` is a file,
 * not source text.
 */
export function interpreterScriptWords(words: readonly ShellWord[]): readonly ShellWord[] {
  const interpreterIndex = words.findIndex((word) => SHELL_INTERPRETERS.has(basename(word.text)));
  if (interpreterIndex === -1) {
    return [];
  }
  const rest = words.slice(interpreterIndex + 1);
  const interpreter = basename(words[interpreterIndex]?.text ?? '');
  if (SCRIPT_OPERAND_INTERPRETERS.has(interpreter)) {
    return joinedOperands(rest, interpreter === 'ssh');
  }
  const commandFlag = rest.findIndex((word) => isCommandFlagCluster(word.text));
  const script = rest.slice(commandFlag + 1).find((word) => !word.text.startsWith('-'));
  return commandFlag === -1 || script === undefined ? [] : [script];
}

/**
 * The one script `eval` or `ssh` runs: `eval` joins every operand into one
 * command; `ssh` joins every operand after the host. Quoted or not, the
 * operands become one command line, so the words are joined with a blank and
 * their substitution bodies carried together.
 */
function joinedOperands(rest: readonly ShellWord[], skipHost: boolean): readonly ShellWord[] {
  const operands = rest.filter((word) => !word.text.startsWith('-')).slice(skipHost ? 1 : 0);
  if (operands.length === 0) {
    return [];
  }
  return [
    {
      text: operands.map((word) => word.text).join(' '),
      nested: operands.flatMap((word) => word.nested),
    },
  ];
}

/** An option cluster of letters carrying `c` (`-c`, `-lc`, `-ec`), read in one pass so its cost is linear in the word. */
function isCommandFlagCluster(text: string): boolean {
  const letters = text.slice(1);
  return text.startsWith('-') && /^[A-Za-z]+$/u.test(letters) && letters.includes('c');
}
