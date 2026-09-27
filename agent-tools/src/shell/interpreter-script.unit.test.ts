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

  it('joins the operands of eval, and of ssh after its host, into the one command they run', () => {
    expect(scriptsOf("eval 'git push' 'origin HEAD'")).toStrictEqual(['git push origin HEAD']);
    expect(scriptsOf('eval git push origin HEAD')).toStrictEqual(['git push origin HEAD']);
    expect(scriptsOf("ssh -T host 'git push origin HEAD'")).toStrictEqual(['git push origin HEAD']);
    expect(scriptsOf('ssh host git push origin HEAD')).toStrictEqual(['git push origin HEAD']);
    expect(scriptsOf('ssh host')).toStrictEqual([]);
  });

  it.each([
    { line: 'ssh -p 22 host git push origin HEAD' },
    { line: 'ssh -4 -p 22 host git push origin HEAD' },
    { line: 'ssh -p22 -o StrictHostKeyChecking=no -i key host git push origin HEAD' },
    { line: 'ssh -4p 22 -oStrictHostKeyChecking=no -ikey host git push origin HEAD' },
    { line: 'ssh -- host git push origin HEAD' },
    { line: 'ssh -l user -- host git push origin HEAD' },
  ])('skips the ssh options that take a value before reading the host in "$line"', ({ line }) => {
    expect(scriptsOf(line)).toStrictEqual(['git push origin HEAD']);
  });

  it('reads no command when ssh is given only options and a host', () => {
    expect(scriptsOf('ssh -p 22 host')).toStrictEqual([]);
    expect(scriptsOf('ssh -p 22')).toStrictEqual([]);
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
