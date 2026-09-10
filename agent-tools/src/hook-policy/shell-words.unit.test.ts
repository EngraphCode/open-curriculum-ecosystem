import { describe, expect, it } from 'vitest';

import { segmentCommand } from './shell-words.js';

/** The words of each segment, as plain text, for assertions that are about structure. */
function texts(command: string): readonly (readonly string[])[] {
  return segmentCommand(command).map((segment) => segment.map((word) => word.text));
}

describe('segmentCommand', () => {
  it('splits a line into simple commands at the list and pipeline operators', () => {
    expect(texts('cd build && rm -rf out; echo done || true | tee log & wait')).toStrictEqual([
      ['cd', 'build'],
      ['rm', '-rf', 'out'],
      ['echo', 'done'],
      ['true'],
      ['tee', 'log'],
      ['wait'],
    ]);
    expect(texts('git fetch\ngit reset --hard')).toStrictEqual([
      ['git', 'fetch'],
      ['git', 'reset', '--hard'],
    ]);
  });

  it('starts a segment at a bare sub-shell or group parenthesis', () => {
    expect(texts('(cd x && rm -rf y)')).toStrictEqual([
      ['cd', 'x'],
      ['rm', '-rf', 'y'],
    ]);
  });

  it('removes quotes and keeps a quoted span inside one word, as the shell hands it to the command', () => {
    expect(texts('rm \'-rf\' "my dir" plain')).toStrictEqual([['rm', '-rf', 'my dir', 'plain']]);
    expect(texts("sh -c $'rm -rf x'")).toStrictEqual([['sh', '-c', 'rm -rf x']]);
  });

  it('keeps operators inside quotes from splitting the line', () => {
    expect(texts('echo "a && b | c"')).toStrictEqual([['echo', 'a && b | c']]);
  });

  it('honours backslash escapes outside and inside double quotes', () => {
    expect(texts(String.raw`echo a\ b \; c`)).toStrictEqual([['echo', 'a b', ';', 'c']]);
    expect(texts(String.raw`echo "say \"hi\""`)).toStrictEqual([['echo', 'say "hi"']]);
    // Inside double quotes a backslash escapes only what bash lets it escape.
    expect(texts(String.raw`echo "a\tb \$x"`)).toStrictEqual([['echo', String.raw`a\tb $x`]]);
  });

  it('keeps a partly quoted word as one word', () => {
    expect(texts('rm -r"f" dir')).toStrictEqual([['rm', '-rf', 'dir']]);
  });

  it('carries a command substitution inside its word and exposes its body as a nested command', () => {
    const [segment] = segmentCommand('git reset $(git merge-base HEAD main) --hard');
    expect(segment?.map((word) => word.text)).toStrictEqual([
      'git',
      'reset',
      '$(git merge-base HEAD main)',
      '--hard',
    ]);
    expect(segment?.[2]?.nested).toStrictEqual(['git merge-base HEAD main']);
  });

  it('reads a substitution inside double quotes, and leaves a single-quoted one literal', () => {
    const [quoted] = segmentCommand('X="$(rm -rf x)" y');
    expect(quoted?.map((word) => word.text)).toStrictEqual(['X=$(rm -rf x)', 'y']);
    expect(quoted?.[0]?.nested).toStrictEqual(['rm -rf x']);
    const [literal] = segmentCommand("echo '$(rm -rf x)'");
    expect(literal?.[1]?.nested).toStrictEqual([]);
  });

  it('reads a backtick substitution the same way, and nested parentheses inside a dollar substitution', () => {
    const [backtick] = segmentCommand('rm -rf `pwd`/build');
    expect(backtick?.map((word) => word.text)).toStrictEqual(['rm', '-rf', '`pwd`/build']);
    expect(backtick?.[2]?.nested).toStrictEqual(['pwd']);

    const [dollar] = segmentCommand('echo $(f $(g x)) tail');
    expect(dollar?.map((word) => word.text)).toStrictEqual(['echo', '$(f $(g x))', 'tail']);
    expect(dollar?.[1]?.nested).toStrictEqual(['f $(g x)']);
  });

  it('removes a backslash-newline continuation, outside and inside double quotes', () => {
    expect(
      texts(String.raw`rm -r \
-f dir`),
    ).toStrictEqual([['rm', '-r', '-f', 'dir']]);
    expect(
      texts(String.raw`echo "a\
b"`),
    ).toStrictEqual([['echo', 'ab']]);
  });

  it('decodes ANSI-C escapes in a $-quoted span', () => {
    expect(texts(String.raw`printf $'a\tb\x41\101\''`)).toStrictEqual([['printf', "a\tbAA'"]]);
    expect(texts(String.raw`bash -c $'echo start\nrm -rf x'`)).toStrictEqual([
      ['bash', '-c', 'echo start\nrm -rf x'],
    ]);
  });

  it('balances a substitution past quoted and escaped parentheses', () => {
    const [segment] = segmentCommand('OUT="$(printf \')\'; rm -rf x)" tail');
    expect(segment?.map((word) => word.text)).toStrictEqual([
      "OUT=$(printf ')'; rm -rf x)",
      'tail',
    ]);
    expect(segment?.[0]?.nested).toStrictEqual(["printf ')'; rm -rf x"]);
  });

  it('drops a comment from an unquoted hash at a word start to the end of the line', () => {
    expect(texts('pnpm build # rm -rf dist first')).toStrictEqual([['pnpm', 'build']]);
    expect(texts('pnpm build # comment\nrm -rf dist')).toStrictEqual([
      ['pnpm', 'build'],
      ['rm', '-rf', 'dist'],
    ]);
    expect(texts('echo a#b "#c"')).toStrictEqual([['echo', 'a#b', '#c']]);
  });

  it('keeps leading variable assignments as words of the segment', () => {
    expect(texts('FLAGS=-rf rm $FLAGS dir')).toStrictEqual([['FLAGS=-rf', 'rm', '$FLAGS', 'dir']]);
  });

  it('terminates on an unterminated quote or substitution, keeping what was read', () => {
    expect(texts('echo "unterminated')).toStrictEqual([['echo', 'unterminated']]);
    expect(texts('echo $(unterminated')).toStrictEqual([['echo', '$(unterminated']]);
    expect(texts('')).toStrictEqual([]);
  });
});
