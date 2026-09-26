import assert from 'node:assert/strict';

import { describe, expect, it } from 'vitest';

import {
  lines,
  object,
  selectAll,
  type FixtureObject,
  type TestRecord,
} from '../rollout/test-helpers/rollout-records.js';

import { readCommandRecords } from './read-command-records.js';
import { commandItems, execRecords, lineOf, turnStarts } from './test-helpers/seat-fixtures.js';

/** Values no reader message may echo back. */
const NONCE = 'nonce-7c1e';
const NUMERIC_NONCE = 424_242;

/** The fixture's first command item and its item object, for a test to edit. */
function firstCommand(records: TestRecord[]): { event: TestRecord; item: FixtureObject } {
  const [event] = commandItems(records);
  assert(event);
  return { event, item: object(event.payload['item']) };
}

describe('readCommandRecords over the recorded seat rollout', () => {
  it('counts the turns started and the commands the harness recorded as run', () => {
    const records = execRecords();
    const summary = readCommandRecords(lines(records));
    expect(summary.turns).toBe(turnStarts(records).length);
    expect(summary.commands).toBe(commandItems(records).length);
    expect(summary.malformed).toStrictEqual([]);
    expect(summary.invalidLines).toStrictEqual([]);
  });

  it('accounts each command to the turn its event names', () => {
    const records = execRecords();
    const [start] = turnStarts(records);
    assert(start);
    const summary = readCommandRecords(lines(records));
    expect(summary.accounts).toStrictEqual([
      { turnId: start.payload['turn_id'], executed: commandItems(records).length },
    ]);
  });

  it('counts every record type it sees, read or not', () => {
    const records = execRecords();
    const summary = readCommandRecords(lines(records));
    expect(summary.recordTypes['response_item.custom_tool_call']).toBe(
      selectAll(records, 'response_item', 'custom_tool_call').length,
    );
    expect(summary.recordTypes['token_usage_record']).toBe(
      selectAll(records, 'token_usage_record').length,
    );
  });

  it('counts a record type outside its vocabulary instead of refusing it', () => {
    const records = execRecords();
    records.push({ type: 'nonce_record', payload: { type: 'later' } });
    const summary = readCommandRecords(lines(records));
    expect(summary.recordTypes['nonce_record.later']).toBe(1);
    expect(summary.malformed).toStrictEqual([]);
  });

  it('reads an empty rollout as zero of everything, not as an error', () => {
    expect(readCommandRecords([])).toStrictEqual({
      turns: 0,
      commands: 0,
      flagged: [],
      accounts: [],
      recordTypes: {},
      malformed: [],
      invalidLines: [],
    });
  });
});

describe('readCommandRecords counts as executed only what the harness ran itself', () => {
  it.each([
    { name: 'a declined item', edit: (item: FixtureObject) => (item['status'] = 'declined') },
    {
      name: 'an interaction with a running process',
      edit: (item: FixtureObject) => {
        item['source'] = 'unified_exec_interaction';
        item['interaction_input'] = 'git status\n';
      },
    },
  ])('does not count $name as executed, and does not read it as malformed', ({ edit }) => {
    const records = execRecords();
    const expected = commandItems(records).length - 1;
    edit(firstCommand(records).item);
    const summary = readCommandRecords(lines(records));
    expect(summary.commands).toBe(expected);
    expect(summary.accounts[0]?.executed).toBe(expected);
    expect(summary.malformed).toStrictEqual([]);
  });
});

describe('readCommandRecords fails closed on the evidence records', () => {
  it.each([
    { name: 'no command', edit: (item: FixtureObject) => Reflect.deleteProperty(item, 'command') },
    { name: 'an empty command', edit: (item: FixtureObject) => (item['command'] = []) },
    {
      name: 'a command that is a string',
      edit: (item: FixtureObject) => (item['command'] = NONCE),
    },
    {
      name: 'a command with a non-string element',
      edit: (item: FixtureObject) => (item['command'] = ['git', NUMERIC_NONCE]),
    },
    { name: 'a status outside its set', edit: (item: FixtureObject) => (item['status'] = NONCE) },
    { name: 'a source outside its set', edit: (item: FixtureObject) => (item['source'] = NONCE) },
    {
      name: 'an exit code that is a string',
      edit: (item: FixtureObject) => (item['exit_code'] = NONCE),
    },
    {
      name: 'an interaction input that is a number',
      edit: (item: FixtureObject) => (item['interaction_input'] = NUMERIC_NONCE),
    },
  ])('reads a CommandExecution item with $name as malformed, not as a command', ({ edit }) => {
    const records = execRecords();
    const expected = commandItems(records).length - 1;
    const { event, item } = firstCommand(records);
    edit(item);
    const summary = readCommandRecords(lines(records));
    expect(summary.commands).toBe(expected);
    expect(summary.malformed).toHaveLength(1);
    const [entry] = summary.malformed;
    assert(entry);
    expect(entry.line).toBe(lineOf(records, event));
    expect(entry.reason).not.toContain(NONCE);
    expect(entry.reason).not.toContain(String(NUMERIC_NONCE));
  });

  it('reads a CommandExecution event without a turn id as malformed', () => {
    const records = execRecords();
    const expected = commandItems(records).length - 1;
    const { event } = firstCommand(records);
    Reflect.deleteProperty(event.payload, 'turn_id');
    const summary = readCommandRecords(lines(records));
    expect(summary.commands).toBe(expected);
    expect(summary.malformed).toStrictEqual([
      { line: lineOf(records, event), reason: 'CommandExecution event has no turn id' },
    ]);
  });

  it('reads a CommandExecution that precedes its turn as malformed', () => {
    const records = execRecords();
    const [start] = turnStarts(records);
    assert(start);
    const { event } = firstCommand(records);
    records.splice(records.indexOf(event), 1);
    records.splice(records.indexOf(start), 0, event);
    const summary = readCommandRecords(lines(records));
    expect(summary.malformed).toStrictEqual([
      { line: lineOf(records, event), reason: 'CommandExecution precedes its turn' },
    ]);
  });

  it('reads a repeated task_started id as malformed and counts the first turn once', () => {
    const records = execRecords();
    const [start] = turnStarts(records);
    assert(start);
    const repeat: TestRecord = { type: start.type, payload: { ...start.payload } };
    records.push(repeat);
    const summary = readCommandRecords(lines(records));
    expect(summary.turns).toBe(turnStarts(execRecords()).length);
    expect(summary.malformed).toStrictEqual([
      { line: lineOf(records, repeat), reason: 'task_started repeats a turn id' },
    ]);
  });
});

describe('readCommandRecords over the lines themselves', () => {
  it('keeps the physical line number past a blank and an invalid line', () => {
    const records = execRecords();
    const expected = commandItems(records).length - 1;
    const { event, item } = firstCommand(records);
    item['status'] = NONCE;
    const serialised = lines(records);
    const at = records.indexOf(event);
    serialised.splice(at, 0, '', '{bad json');
    const summary = readCommandRecords(serialised);
    expect(summary.invalidLines).toStrictEqual([at + 2]);
    expect(summary.malformed.map((entry) => entry.line)).toStrictEqual([at + 3]);
    expect(summary.commands).toBe(expected);
  });

  it('reads a line that is JSON but not an object as invalid', () => {
    const summary = readCommandRecords(['[1, 2]', '"text"']);
    expect(summary.invalidLines).toStrictEqual([1, 2]);
  });

  it('reads a record without a type as malformed', () => {
    const summary = readCommandRecords([JSON.stringify({ payload: {} })]);
    expect(summary.malformed).toStrictEqual([{ line: 1, reason: 'record has no type' }]);
  });
});
