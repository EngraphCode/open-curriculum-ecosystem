import assert from 'node:assert/strict';

import { describe, expect, it } from 'vitest';

import { lines, object } from '../rollout/test-helpers/rollout-records.js';

import { readCommandRecords } from './read-command-records.js';
import { renderSummary } from './summary.js';
import {
  APPENDED_TURN_ID,
  appendCommandTurn,
  commandItems,
  execRecords,
  HOME_PATH,
  lineOf,
} from './test-helpers/seat-fixtures.js';

describe('readCommandRecords flags the forbidden shapes the harness ran', () => {
  it('reads the recorded seat rollout as carrying no forbidden shape', () => {
    expect(readCommandRecords(lines(execRecords())).flagged).toStrictEqual([]);
  });

  it('flags a command run in a second turn, naming that turn and its line', () => {
    const records = execRecords();
    const base = commandItems(records).length;
    const event = appendCommandTurn(records, ['/bin/zsh', '-lc', 'git commit --amend --no-edit']);
    const summary = readCommandRecords(lines(records));
    expect(summary.flagged).toStrictEqual([
      {
        kind: 'executed',
        line: lineOf(records, event),
        turnId: APPENDED_TURN_ID,
        rendered: ['git commit --amend --no-edit'],
        hits: [{ kind: 'commit-rewrites-or-skips-hooks', token: '--amend' }],
      },
    ]);
    expect(summary.accounts.map((account) => account.executed)).toStrictEqual([base, 1]);
  });

  it('reports two flagged commands in two turns with their lines ascending', () => {
    const records = execRecords();
    const [first] = commandItems(records);
    assert(first);
    object(first.payload['item'])['command'] = ['git', 'push', 'origin', 'HEAD'];
    const second = appendCommandTurn(records, ['git', 'add', '-A']);
    const summary = readCommandRecords(lines(records));
    expect(summary.flagged.map((entry) => entry.line)).toStrictEqual([
      lineOf(records, first),
      lineOf(records, second),
    ]);
    expect(summary.flagged.map((entry) => entry.hits[0]?.kind)).toStrictEqual([
      'push-outside-the-bot',
      'stage-whole-tree',
    ]);
  });

  it('reports two hits on one entry when one script runs two shapes', () => {
    const records = execRecords();
    appendCommandTurn(records, ['bash', '-lc', 'git add -A && git push']);
    const [entry] = readCommandRecords(lines(records)).flagged;
    assert(entry);
    expect(entry.hits.map((hit) => hit.kind)).toStrictEqual([
      'stage-whole-tree',
      'push-outside-the-bot',
    ]);
    expect(entry.rendered).toStrictEqual(['git add -A', 'git push']);
  });

  it('leaves a commit whose message carries a separator and a shape unflagged', () => {
    const records = execRecords();
    const base = commandItems(records).length;
    appendCommandTurn(records, ['sh', '-c', 'git commit -m "a && b" -m "git push"']);
    const summary = readCommandRecords(lines(records));
    expect(summary.flagged).toStrictEqual([]);
    expect(summary.commands).toBe(base + 1);
  });

  it('elides the segments of a script that carry no shape', () => {
    const records = execRecords();
    const script = "git commit -F - <<'EOF'\nFix the auth path\nEOF\ngit push origin HEAD";
    appendCommandTurn(records, ['bash', '-lc', script]);
    const [entry] = readCommandRecords(lines(records)).flagged;
    assert(entry);
    expect(entry.rendered).toStrictEqual(['…', 'git push <arg> <arg>']);
  });

  it('reads a here-document body naming a shape as data, not as a command that ran', () => {
    const records = execRecords();
    const script = "git commit -F - <<'EOF'\ngit push origin HEAD\nEOF";
    appendCommandTurn(records, ['bash', '-lc', script]);
    expect(readCommandRecords(lines(records)).flagged).toStrictEqual([]);
  });

  it('reads a declined item carrying a shape as refused, not as a command that ran', () => {
    const records = execRecords();
    const event = appendCommandTurn(records, ['git', 'push', 'origin', 'HEAD'], {
      status: 'declined',
    });
    const summary = readCommandRecords(lines(records));
    expect(summary.flagged).toStrictEqual([
      {
        kind: 'refused',
        line: lineOf(records, event),
        turnId: APPENDED_TURN_ID,
        rendered: ['git push <arg> <arg>'],
        hits: [{ kind: 'push-outside-the-bot', token: 'push' }],
      },
    ]);
    expect(summary.accounts[1]).toMatchObject({ executed: 0, declined: 1 });
  });
});

describe('readCommandRecords flags what was typed into a running process', () => {
  it('reads a declined interaction carrying a shape as refused: the harness passed nothing on', () => {
    const records = execRecords();
    appendCommandTurn(records, ['git', 'status'], {
      source: 'unified_exec_interaction',
      status: 'declined',
      interaction_input: 'git push\n',
    });
    expect(readCommandRecords(lines(records)).flagged.map((entry) => entry.kind)).toStrictEqual([
      'refused',
    ]);
  });

  it('flags the interaction input, not the startup argv it repeats', () => {
    const records = execRecords();
    const base = commandItems(records).length;
    const event = appendCommandTurn(records, ['git', 'push', 'origin', 'HEAD'], {
      source: 'unified_exec_interaction',
      interaction_input: 'ls -la\n',
    });
    const clean = readCommandRecords(lines(records));
    expect(clean.flagged).toStrictEqual([]);
    expect(clean.commands).toBe(base);

    object(event.payload['item'])['interaction_input'] = 'git push origin HEAD\n';
    const summary = readCommandRecords(lines(records));
    expect(summary.flagged).toStrictEqual([
      {
        kind: 'interaction',
        line: lineOf(records, event),
        turnId: APPENDED_TURN_ID,
        rendered: ['git push <arg> <arg>'],
        hits: [{ kind: 'push-outside-the-bot', token: 'push' }],
      },
    ]);
    expect(summary.commands).toBe(base);
  });
});

describe('the summary never carries the command history', () => {
  const secrets = [
    HOME_PATH,
    '~/notes-nonce-9c04',
    'the secret message nonce-5b21',
    'git@github.com:org/repo-nonce-2d18.git',
    'KEY=nonce-3f7a',
  ];
  const records = execRecords();
  const [first] = commandItems(records);
  assert(first);
  const ownScript = object(first.payload['item'])['command'];
  assert(Array.isArray(ownScript));
  const ownLine = ownScript.at(-1);
  assert(typeof ownLine === 'string' && ownLine.length > 0);
  appendCommandTurn(records, [
    'KEY=nonce-3f7a',
    '/usr/bin/git',
    'commit',
    `-C${HOME_PATH}`,
    `--cwd=${HOME_PATH}`,
    '-m',
    'the secret message nonce-5b21',
    '--no-verify',
    'git@github.com:org/repo-nonce-2d18.git',
    '~/notes-nonce-9c04',
  ]);
  const summary = readCommandRecords(lines(records));
  const text = renderSummary(summary, 'text');
  const json = renderSummary(summary, 'json');

  it.each(secrets.map((secret) => ({ secret })))(
    'renders a flagged command without $secret, in text and in JSON',
    ({ secret }) => {
      expect(text).not.toContain(secret);
      expect(json).not.toContain(secret);
    },
  );

  it('renders a flagged command with its program, subcommand and flag names, in text and in JSON', () => {
    for (const kept of ['git', 'commit', '--no-verify', '-C', 'KEY=<value>']) {
      expect(text).toContain(kept);
      expect(json).toContain(kept);
    }
    expect(text).toContain(APPENDED_TURN_ID);
  });

  it("renders none of an unflagged command's script", () => {
    expect(summary.flagged).toHaveLength(1);
    expect(text).not.toContain(ownLine);
    expect(json).not.toContain(ownLine);
  });
});
