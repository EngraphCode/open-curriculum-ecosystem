import { describe, expect, it } from 'vitest';

import { basename, interpreterScriptWords, isScriptWord } from './interpreter-script.js';
import { segmentCommand } from './shell-words.js';

/** The script texts an interpreter in the one segment of a command line is given. */
function scriptsOf(line: string): readonly string[] {
  const [segment] = segmentCommand(line);
  return interpreterScriptWords(segment ?? []).map((word) => word.text);
}

describe('interpreterScriptWords', () => {
  it.each([
    { line: "sh -c 'git push origin HEAD'" },
    { line: "bash -lc 'git push origin HEAD'" },
    { line: "/bin/zsh -lc 'git push origin HEAD'" },
    { line: "sh -ic 'git push origin HEAD'" },
    { line: "bash -euo pipefail -c 'git push origin HEAD'" },
    { line: "bash --norc -c 'git push origin HEAD'" },
    { line: "sudo bash -c 'git push origin HEAD'" },
  ])('reads the script a shell is given past its options in "$line"', ({ line }) => {
    expect(scriptsOf(line)).toStrictEqual(['git push origin HEAD']);
  });

  it.each([
    { line: 'bash deploy.sh' },
    { line: 'bash -e deploy.sh' },
    { line: 'git push origin HEAD' },
    { line: 'echo "sh -c x"' },
  ])('reads no script in "$line"', ({ line }) => {
    expect(scriptsOf(line)).toStrictEqual([]);
  });

  it('reads every operand of eval and ssh as a script', () => {
    expect(scriptsOf("eval 'git push' 'origin HEAD'")).toStrictEqual(['git push', 'origin HEAD']);
    expect(scriptsOf("ssh -T host 'git push origin HEAD'")).toStrictEqual([
      'host',
      'git push origin HEAD',
    ]);
  });
});

describe('isScriptWord', () => {
  it('is true only for a word with whitespace in it, which only quoting or an escape can produce', () => {
    expect(isScriptWord({ text: 'git push', nested: [] })).toBe(true);
    expect(isScriptWord({ text: 'push', nested: [] })).toBe(false);
  });
});

describe('basename', () => {
  it.each([
    { text: '/bin/rm', name: 'rm' },
    { text: String.raw`C:\tools\git.exe`, name: 'git' },
    { text: 'git', name: 'git' },
  ])('reads $text as $name', ({ text, name }) => {
    expect(basename(text)).toBe(name);
  });
});
