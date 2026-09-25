import assert from 'node:assert/strict';

import { describe, expect, it } from 'vitest';

import { readRollout } from './index.js';
import {
  expectRead,
  lines,
  records,
  resumedCommandOutputsIn,
  RESUMED_TURN_ID,
  select,
  selectAll,
  textParts,
  type TestRecord,
} from './test-helpers/rollout-records.js';

/**
 * The code-mode calls and their outputs. A code-mode output holds the
 * harness's completed-script preamble and then whatever the model's own
 * program printed, so the reader validates the wrapper and pairs it with its
 * call, but never takes the program's text as evidence: the evidence is the
 * harness's `CommandExecution` output alone.
 */

/** The resumed turn's code-mode outputs, in order. */
function resumedOutputs(recordsToRead: readonly TestRecord[]): TestRecord[] {
  const started = selectAll(recordsToRead, 'event_msg', 'task_started').find(
    (record) => record.payload['turn_id'] === RESUMED_TURN_ID,
  );
  assert(started);
  return selectAll(
    recordsToRead.slice(recordsToRead.indexOf(started)),
    'response_item',
    'custom_tool_call_output',
  );
}

function firstResumedOutput(recordsToRead: readonly TestRecord[]): TestRecord {
  const [output] = resumedOutputs(recordsToRead);
  assert(output);
  return output;
}

describe('code-mode output: never evidence', () => {
  it('keeps text only the program printed out of the evidence', () => {
    const sentinel = 'printed-by-the-program-only';
    const candidate = records();
    const [, printed] = textParts(firstResumedOutput(candidate).payload['output']);
    assert(printed);
    printed.text = sentinel;

    const evidence = expectRead(candidate);
    expect(evidence.resumedCommandOutputs).toEqual(resumedCommandOutputsIn(candidate));
    expect(evidence.resumedCommandOutputs.join('\n')).not.toContain(sentinel);
  });

  it.each([
    { name: 'a JSON exec result the program returned', text: '{"exit_code":0,"output":"x"}' },
    { name: 'a truncation marker the program printed', text: '…153 tokens truncated…' },
  ])('accepts $name as program text, still not evidence', ({ text }) => {
    const candidate = records();
    const [, printed] = textParts(firstResumedOutput(candidate).payload['output']);
    assert(printed);
    printed.text = text;

    expect(expectRead(candidate).resumedCommandOutputs).toEqual(resumedCommandOutputsIn(candidate));
  });

  it('accepts a program that printed nothing', () => {
    const candidate = records();
    const output = firstResumedOutput(candidate);
    output.payload['output'] = textParts(output.payload['output']).slice(0, 1);

    expect(expectRead(candidate).resumedCommandOutputs).toEqual(resumedCommandOutputsIn(candidate));
  });
});

describe('code-mode output: the wrapper', () => {
  it('rejects an output whose items are not input text', () => {
    const candidate = records();
    const [preamble] = textParts(firstResumedOutput(candidate).payload['output']);
    assert(preamble);
    preamble.type = 'future_text';

    expect(readRollout(lines(candidate))).toMatchObject({
      ok: false,
      error: {
        kind: 'invalid-record',
        reason: 'custom_tool_call_output.output items are not input_text',
      },
    });
  });

  it.each([
    {
      name: 'a different preamble',
      output: [{ type: 'input_text', text: 'a different preamble' }],
    },
    { name: 'no items at all', output: [] },
  ])('rejects an output with $name', ({ output }) => {
    const candidate = records();
    firstResumedOutput(candidate).payload['output'] = output;

    expect(readRollout(lines(candidate))).toMatchObject({
      ok: false,
      error: {
        kind: 'invalid-record',
        reason: 'custom_tool_call_output.output has no completed-script preamble',
      },
    });
  });

  it('rejects an output of an unknown type', () => {
    const candidate = records();
    select(candidate, 'response_item', 'custom_tool_call_output').payload['type'] = 'future_output';

    expect(readRollout(lines(candidate))).toMatchObject({
      ok: false,
      error: { kind: 'unknown-record-type', recordType: 'response_item.future_output' },
    });
  });
});

describe('code-mode calls: each answered exactly once', () => {
  it('rejects an output with no matching call', () => {
    const candidate = records();
    select(candidate, 'response_item', 'custom_tool_call_output').payload['call_id'] = 'call_other';

    expect(readRollout(lines(candidate))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-turn-order', reason: 'tool output has no matching custom tool call' },
    });
  });

  it('rejects a call left unanswered when its turn completes', () => {
    const candidate = records();
    candidate.splice(
      candidate.indexOf(select(candidate, 'response_item', 'custom_tool_call_output')),
      1,
    );

    expect(readRollout(lines(candidate))).toMatchObject({
      ok: false,
      error: {
        kind: 'invalid-turn-order',
        reason: 'task_complete has unanswered custom tool calls',
      },
    });
  });

  it('rejects a call answered twice', () => {
    const candidate = records();
    const output = select(candidate, 'response_item', 'custom_tool_call_output');
    candidate.splice(candidate.indexOf(output), 0, structuredClone(output));

    expect(readRollout(lines(candidate))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-turn-order', reason: 'tool output has no matching custom tool call' },
    });
  });

  it('rejects a repeated pending call id', () => {
    const candidate = records();
    const call = select(candidate, 'response_item', 'custom_tool_call');
    candidate.splice(candidate.indexOf(call) + 1, 0, structuredClone(call));

    expect(readRollout(lines(candidate))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-turn-order', reason: 'custom tool call repeats a pending call id' },
    });
  });

  it.each([
    { name: 'another tool', field: 'name', value: 'future_exec' },
    { name: 'an unfinished call', field: 'status', value: 'in_progress' },
  ])('rejects $name', ({ field, value }) => {
    const candidate = records();
    select(candidate, 'response_item', 'custom_tool_call').payload[field] = value;

    expect(readRollout(lines(candidate))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record', reason: 'custom_tool_call is not a completed exec call' },
    });
  });
});
