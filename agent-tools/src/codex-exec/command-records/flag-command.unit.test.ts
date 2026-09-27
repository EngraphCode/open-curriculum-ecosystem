import assert from 'node:assert/strict';

import { describe, expect, it } from 'vitest';

import { flagCommand, renderSegment } from './flag-command.js';
import { commandsOfText } from './shell-commands.js';
import { HOME_PATH } from './test-helpers/seat-fixtures.js';

/** The one segment a single command line yields. */
function segmentOf(line: string): readonly string[] {
  const [segment, ...rest] = commandsOfText(line);
  assert(segment);
  assert(rest.length === 0, 'one command line, one segment');
  return segment;
}

describe('flagCommand finds the forbidden shapes of the seat rules', () => {
  it.each([
    { line: 'git add -A', kind: 'stage-whole-tree' },
    { line: 'git add .', kind: 'stage-whole-tree' },
    { line: 'git add --all', kind: 'stage-whole-tree' },
    { line: 'git add -An', kind: 'stage-whole-tree' },
    { line: 'git add -- README.md .', kind: 'stage-whole-tree' },
    { line: 'git add -- .', kind: 'stage-whole-tree' },
    { line: 'git commit --amend --no-edit', kind: 'commit-rewrites-or-skips-hooks' },
    { line: 'git commit --no-verify -F message.txt', kind: 'commit-rewrites-or-skips-hooks' },
    { line: 'git commit -F message.txt --no-verify', kind: 'commit-rewrites-or-skips-hooks' },
    { line: 'git commit -n', kind: 'commit-rewrites-or-skips-hooks' },
    { line: 'git commit -an', kind: 'commit-rewrites-or-skips-hooks' },
    { line: 'git push origin feat/example', kind: 'push-outside-the-bot' },
    { line: 'git push --force origin feat/example', kind: 'push-outside-the-bot' },
    { line: 'git push', kind: 'push-outside-the-bot' },
    { line: 'KEY=v git push', kind: 'push-outside-the-bot' },
    { line: 'env git push', kind: 'push-outside-the-bot' },
    { line: 'env KEY=v git push', kind: 'push-outside-the-bot' },
    { line: 'sudo git push', kind: 'push-outside-the-bot' },
    { line: 'sudo -u root git push', kind: 'push-outside-the-bot' },
    { line: 'nice -n 5 git push', kind: 'push-outside-the-bot' },
    { line: 'time git push', kind: 'push-outside-the-bot' },
    { line: 'command git push', kind: 'push-outside-the-bot' },
    { line: '/usr/bin/git push', kind: 'push-outside-the-bot' },
    { line: 'sudo --user root git push', kind: 'push-outside-the-bot' },
    { line: '{ git push', kind: 'push-outside-the-bot' },
    { line: '! git push', kind: 'push-outside-the-bot' },
    { line: 'if git push', kind: 'push-outside-the-bot' },
    { line: 'do git push $b', kind: 'push-outside-the-bot' },
    { line: 'git -C x commit --amend', kind: 'commit-rewrites-or-skips-hooks' },
    { line: 'git --git-dir=.git -c user.name=x commit -n', kind: 'commit-rewrites-or-skips-hooks' },
  ])('flags $line', ({ line, kind }) => {
    expect(flagCommand(segmentOf(line)).map((hit) => hit.kind)).toStrictEqual([kind]);
  });

  it.each([
    { line: 'git add -- README.md' },
    { line: 'git add -- -A' },
    { line: 'git add -- --all' },
    { line: 'git commit -- --amend' },
    { line: 'git commit -F message.txt -- -n' },
    { line: 'git add -n README.md' },
    { line: 'git add -p' },
    { line: 'git commit -F message.txt' },
    { line: 'git commit -m "git push"' },
    { line: 'git commit -am "a && b"' },
    { line: 'pnpm agent-tools merge-bot push --branch feat/example' },
    { line: 'pnpm agent-tools merge-bot merge --pr 1' },
    { line: 'echo "git push"' },
    { line: 'git status' },
    { line: 'git -C x status' },
    { line: 'git' },
    { line: 'git --version' },
    { line: 'gitk push' },
  ])('leaves $line clear', ({ line }) => {
    expect(flagCommand(segmentOf(line))).toStrictEqual([]);
  });

  it('reports the token that matched, never a value', () => {
    expect(flagCommand(segmentOf('git commit -F secret.txt --no-verify'))).toStrictEqual([
      { kind: 'commit-rewrites-or-skips-hooks', token: '--no-verify' },
    ]);
    expect(flagCommand(segmentOf('git commit -an'))).toStrictEqual([
      { kind: 'commit-rewrites-or-skips-hooks', token: '-an' },
    ]);
  });

  it('reports at most one hit for a segment, however many rule tokens it carries', () => {
    expect(flagCommand(['git', 'add', '-A', '--all', '.'])).toStrictEqual([
      { kind: 'stage-whole-tree', token: '-A' },
    ]);
    expect(flagCommand(['git', 'commit', '--amend', '--no-verify'])).toStrictEqual([
      { kind: 'commit-rewrites-or-skips-hooks', token: '--amend' },
    ]);
  });
});

describe('renderSegment prints a command by allowlist', () => {
  it('keeps the program, the git subcommand and the flag names, and elides every value', () => {
    const rendered = renderSegment([
      '/usr/bin/git',
      'commit',
      `-C${HOME_PATH}`,
      `--cwd=${HOME_PATH}`,
      '-m',
      'the secret message',
      '--no-verify',
      'git@github.com:org/repo.git',
      '~/notes',
    ]);
    expect(rendered).toBe('git commit -C --cwd -m <arg> --no-verify <arg> <arg>');
  });

  it('elides an assignment value and a wrapper argument, keeping their names', () => {
    const segment = [`KEY=${HOME_PATH}`, 'sudo', '-u', 'root', 'git', 'push', 'origin', 'main'];
    expect(renderSegment(segment)).toBe('KEY=<value> sudo -u <arg> git push <arg> <arg>');
  });

  it('prints a program that is not git with every argument elided', () => {
    expect(renderSegment(['pnpm', 'agent-tools', 'merge-bot', 'push'])).toBe(
      'pnpm <arg> <arg> <arg>',
    );
  });

  it('elides every token after a bare --, a dash-prefixed positional included', () => {
    expect(renderSegment(['git', 'commit', '--amend', '--', '--secret-file-name', 'x'])).toBe(
      'git commit --amend -- <arg> <arg>',
    );
  });

  it('elides the argument of a long wrapper option', () => {
    expect(renderSegment(['sudo', '--user', 'root', 'git', 'push'])).toBe(
      'sudo --user <arg> git push',
    );
  });

  it('elides a git subcommand token that is not shaped like one', () => {
    expect(renderSegment(['git', 'Deadbeef01', 'status'])).toBe('git <arg> <arg>');
  });
});
