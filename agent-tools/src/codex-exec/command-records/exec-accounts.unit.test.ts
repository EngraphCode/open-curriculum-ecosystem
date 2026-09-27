import assert from 'node:assert/strict';

import { describe, expect, it } from 'vitest';

import { lines, object, type TestRecord } from '../rollout/test-helpers/rollout-records.js';

import { readCommandRecords } from './read-command-records.js';
import type { CommandRecordsSummary, TurnAccount } from './summary.js';
import {
  commandItems,
  execCalls,
  execOutputs,
  execRecords,
  lineOf,
  refusalRecords,
  turnStarts,
} from './test-helpers/seat-fixtures.js';

const NONCE = 'nonce-7a3d';
const FAILED = 'Script failed\nWall time 0.0 seconds\nOutput:\n';

/** The one turn's account of a one-turn rollout. */
function onlyAccount(summary: CommandRecordsSummary): TurnAccount {
  const [account, ...rest] = summary.accounts;
  assert(account);
  assert(rest.length === 0, 'one turn');
  return account;
}

/** The first exec output of a rollout, for a test to edit. */
function firstOutput(records: TestRecord[]): TestRecord {
  const [output] = execOutputs(records);
  assert(output);
  return output;
}

/** Every account of a summary satisfies the call invariant. */
function expectInvariant(summary: CommandRecordsSummary): void {
  expect(summary.accounts.length).toBeGreaterThan(0);
  for (const account of summary.accounts) {
    expect(account.calls).toBe(account.accounted + account.refused + account.unaccounted);
  }
}

describe('readCommandRecords accounts for every exec call of a turn', () => {
  it('reads the recorded seat rollout as every call accounted and none refused', () => {
    const records = execRecords();
    const calls = execCalls(records).length;
    const account = onlyAccount(readCommandRecords(lines(records)));
    expect(account).toMatchObject({
      calls,
      accounted: calls,
      refused: 0,
      unaccounted: 0,
      executed: commandItems(records).length,
    });
  });

  it('reads the refused seat rollout as one call refused, nothing run, the shape flagged as refused', () => {
    const records = refusalRecords();
    const [output] = execOutputs(records);
    const [start] = turnStarts(records);
    assert(output);
    assert(start);
    const summary = readCommandRecords(lines(records));
    expect(onlyAccount(summary)).toStrictEqual({
      turnId: start.payload['turn_id'],
      calls: execCalls(records).length,
      accounted: 0,
      refused: 1,
      unaccounted: 0,
      executed: 0,
      declined: 0,
    });
    expect(summary.commands).toBe(0);
    const [entry] = summary.flagged;
    assert(entry);
    expect(entry).toMatchObject({
      kind: 'refused',
      line: lineOf(records, output),
      turnId: start.payload['turn_id'],
      rendered: ['git push <arg> <arg>'],
      hits: [{ kind: 'push-outside-the-bot', token: 'push' }],
    });
    expect(entry.justification).toContain('refuses force and default branches');
    for (const word of ['agent-tools', 'merge-bot', '<branch>']) {
      expect(entry.justification).not.toContain(word);
    }
    expect(entry.justification).toContain('pnpm <arg>');
    expect(summary.malformed).toStrictEqual([]);
  });

  it.each([
    {
      name: 'a failed script with no refusal',
      text: `${FAILED}Script error:\nTypeError: ${NONCE}`,
    },
    { name: 'a terminated script', text: 'Script terminated\nWall time 9.0 seconds\nOutput:\n' },
    {
      name: 'a script still running',
      text: 'Script running with cell ID 3\nWall time 1.0 seconds\nOutput:\n',
    },
    { name: 'a truncated error', text: `${FAILED}Script error:\n…12 tokens truncated…` },
    {
      name: 'a truncated refusal',
      text: `${FAILED}Script error:\n\`git push\` rejected: x\nWarning: truncated output`,
    },
    { name: 'a preamble the harness does not write', text: `${NONCE}\nOutput:\n` },
  ])('reads $name as one unaccounted call', ({ text }) => {
    const records = execRecords();
    const calls = execCalls(records).length;
    object(firstOutput(records).payload)['output'] = text;
    const summary = readCommandRecords(lines(records));
    expect(onlyAccount(summary)).toMatchObject({
      calls,
      accounted: calls - 1,
      unaccounted: 1,
      refused: 0,
    });
    expect(summary.flagged).toStrictEqual([]);
    expectInvariant(summary);
  });

  it('reads an exec call whose output never came as unaccounted', () => {
    const records = execRecords();
    const calls = execCalls(records).length;
    const output = firstOutput(records);
    records.splice(records.indexOf(output), 1);
    const summary = readCommandRecords(lines(records));
    expect(onlyAccount(summary)).toMatchObject({ calls, accounted: calls - 1, unaccounted: 1 });
    expectInvariant(summary);
  });

  it('reads an exec output that is neither text nor parts as malformed and unaccounted', () => {
    const records = execRecords();
    const output = firstOutput(records);
    object(output.payload)['output'] = 424_242;
    const summary = readCommandRecords(lines(records));
    expect(onlyAccount(summary).unaccounted).toBe(1);
    expect(summary.malformed).toStrictEqual([
      {
        line: lineOf(records, output),
        reason: "exec output is neither text nor the harness's parts",
      },
    ]);
    expectInvariant(summary);
  });

  it('reads a function-tool exec refusal and a refused write_stdin as refused', () => {
    const records = execRecords();
    const calls = execCalls(records).length;
    const [start] = records.filter(
      (record) => record.type === 'event_msg' && record.payload['type'] === 'task_started',
    );
    assert(start);
    const at = records.indexOf(start) + 1;
    records.splice(
      at,
      0,
      {
        type: 'response_item',
        payload: { type: 'function_call', name: 'exec_command', call_id: 'fc-1' },
      },
      {
        type: 'response_item',
        payload: {
          type: 'function_call_output',
          call_id: 'fc-1',
          output: `\`git push ${NONCE}\` rejected: ${NONCE}`,
        },
      },
      {
        type: 'response_item',
        payload: { type: 'function_call', name: 'write_stdin', call_id: 'fc-2' },
      },
      {
        type: 'response_item',
        payload: {
          type: 'function_call_output',
          call_id: 'fc-2',
          output: `write_stdin rejected: ${NONCE}`,
        },
      },
    );
    const summary = readCommandRecords(lines(records));
    expect(onlyAccount(summary)).toMatchObject({ calls: calls + 2, refused: 2, accounted: calls });
    expect(summary.flagged.map((entry) => entry.kind)).toStrictEqual(['refused']);
    expect(summary.flagged[0]?.justification).toBe(NONCE);
    expectInvariant(summary);
  });

  it('ignores a tool call that is not of the exec family, and its output', () => {
    const records = execRecords();
    const calls = execCalls(records).length;
    records.push(
      {
        type: 'response_item',
        payload: { type: 'function_call', name: NONCE, call_id: 'other-1' },
      },
      {
        type: 'response_item',
        payload: { type: 'function_call_output', call_id: 'other-1', output: 424_242 },
      },
    );
    const summary = readCommandRecords(lines(records));
    expect(onlyAccount(summary).calls).toBe(calls);
    expect(summary.malformed).toStrictEqual([]);
    expectInvariant(summary);
  });

  it('ignores an output whose call id matches no pending exec call', () => {
    const records = execRecords();
    records.push({
      type: 'response_item',
      payload: { type: 'custom_tool_call_output', call_id: NONCE, output: 424_242 },
    });
    const summary = readCommandRecords(lines(records));
    expect(summary.malformed).toStrictEqual([]);
    expectInvariant(summary);
  });

  it('reads an exec request before any turn as malformed', () => {
    const summary = readCommandRecords([
      JSON.stringify({
        type: 'response_item',
        payload: { type: 'custom_tool_call', name: 'exec', call_id: 'x' },
      }),
    ]);
    expect(summary.malformed).toStrictEqual([
      { line: 1, reason: 'exec request precedes its turn' },
    ]);
  });

  it('holds the call invariant over both recorded rollouts', () => {
    expectInvariant(readCommandRecords(lines(execRecords())));
    expectInvariant(readCommandRecords(lines(refusalRecords())));
  });
});
