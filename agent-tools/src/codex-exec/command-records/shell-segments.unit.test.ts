import { describe, expect, it } from 'vitest';

import { shellSegments } from './shell-segments.js';

const PUSH = ['git', 'push', 'origin', 'HEAD'];

describe('shellSegments opens the shell front door', () => {
  it.each([
    { shell: ['sh', '-c'] },
    { shell: ['bash', '-lc'] },
    { shell: ['zsh', '-lc'] },
    { shell: ['/bin/zsh', '-lc'] },
    { shell: ['/bin/bash', '-lc'] },
    { shell: ['sh', '-ic'] },
  ])('reads the script behind $shell as the command', ({ shell }) => {
    expect(shellSegments([...shell, 'git push origin HEAD'])).toStrictEqual([PUSH]);
  });

  it.each([
    { shell: ['bash', '-euo', 'pipefail', '-c'] },
    { shell: ['sh', '-ec'] },
    { shell: ['bash', '--norc', '-c'] },
  ])('reads the script past the shell options $shell', ({ shell }) => {
    expect(shellSegments([...shell, 'git push origin HEAD'])).toStrictEqual([PUSH]);
  });

  it('passes a shell whose options announce no script through as one segment', () => {
    expect(shellSegments(['bash', '-e', 'deploy.sh'])).toStrictEqual([['bash', '-e', 'deploy.sh']]);
  });

  it('lifts a script nested in a second shell', () => {
    expect(shellSegments(['/bin/zsh', '-lc', "bash -c 'git push origin HEAD'"])).toStrictEqual([
      PUSH,
    ]);
  });

  it('passes an argv that is not a shell script through as one segment', () => {
    expect(shellSegments(['git', 'status', '--short'])).toStrictEqual([
      ['git', 'status', '--short'],
    ]);
  });

  it('passes a shell given a script file, not a script, through as one segment', () => {
    expect(shellSegments(['bash', 'deploy.sh'])).toStrictEqual([['bash', 'deploy.sh']]);
  });

  it('reads an empty script as no command', () => {
    expect(shellSegments(['sh', '-c', ''])).toStrictEqual([]);
  });
});

describe('shellSegments splits a script at unquoted separators only', () => {
  it.each([
    { name: '&&', separator: '&&' },
    { name: '||', separator: '||' },
    { name: ';', separator: ';' },
    { name: '|', separator: '|' },
    { name: '&', separator: '&' },
    { name: 'a newline', separator: '\n' },
  ])('splits at $name into two segments', ({ separator }) => {
    const script = `echo one ${separator} git push origin HEAD`;
    expect(shellSegments(['sh', '-c', script])).toStrictEqual([['echo', 'one'], PUSH]);
  });

  it('splits at the parentheses of a subshell', () => {
    expect(shellSegments(['sh', '-c', '(cd sub && git push origin HEAD)'])).toStrictEqual([
      ['cd', 'sub'],
      PUSH,
    ]);
  });

  it('lifts the command inside a substitution as a segment of its own', () => {
    expect(shellSegments(['sh', '-c', 'echo $(git push origin HEAD)'])).toContainEqual(PUSH);
  });

  it('reads a here-document body as data, not as commands', () => {
    const script = "git commit -F - <<'EOF'\ngit push origin HEAD\nEOF\ngit status";
    expect(shellSegments(['sh', '-c', script])).toStrictEqual([
      ['git', 'commit', '-F', '-', '<<EOF'],
      ['git', 'status'],
    ]);
  });

  it('closes a tab-stripping here document at an indented terminator', () => {
    const script = 'cat <<- END\n\tgit push origin HEAD\n\tEND\ngit status';
    expect(shellSegments(['sh', '-c', script])).toStrictEqual([
      ['cat', '<<-', 'END'],
      ['git', 'status'],
    ]);
  });

  it('keeps a separator inside double quotes in one word', () => {
    expect(shellSegments(['sh', '-c', 'git commit -m "a && b"'])).toStrictEqual([
      ['git', 'commit', '-m', 'a && b'],
    ]);
  });

  it('keeps a command inside quotes as one word of the outer command', () => {
    expect(shellSegments(['bash', '-c', 'echo "git push"'])).toStrictEqual([['echo', 'git push']]);
  });

  it('removes quotes as the shell does', () => {
    const script = String.raw`say 'it'\''s' "x\"y" a\ b "keep\d"`;
    expect(shellSegments(['sh', '-c', script])).toStrictEqual([
      ['say', "it's", 'x"y', 'a b', String.raw`keep\d`],
    ]);
  });

  it('keeps an empty quoted word', () => {
    expect(shellSegments(['sh', '-c', 'git commit -m ""'])).toStrictEqual([
      ['git', 'commit', '-m', ''],
    ]);
  });

  it('joins a backslash-newline continuation into one command', () => {
    expect(shellSegments(['sh', '-c', 'git \\\npush origin HEAD'])).toStrictEqual([PUSH]);
  });

  it('drops repeated blanks and a trailing separator', () => {
    expect(shellSegments(['sh', '-c', '  git   push\torigin HEAD ;'])).toStrictEqual([PUSH]);
  });

  it('leaves an expansion as the characters it is', () => {
    expect(shellSegments(['sh', '-c', 'echo $HOME `date`'])).toStrictEqual([
      ['echo', '$HOME', '`date`'],
    ]);
  });
});
