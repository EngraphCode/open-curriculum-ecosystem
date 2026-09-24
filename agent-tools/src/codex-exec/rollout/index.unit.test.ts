import assert from 'node:assert/strict';

import { describe, expect, it } from 'vitest';

import { readRollout, type RecordedTurnContext, type RolloutEvidence } from './index.js';
import codeMode from './fixtures/observed-code-mode.json';
import codeModeOnly from './fixtures/observed-code-mode-only.json';

type TestRecord = { type: string; payload: Record<string, unknown> };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function object(value: unknown): Record<string, unknown> {
  assert(isObject(value));
  return value;
}

function isTextParts(value: unknown): value is { type: string; text: string }[] {
  return (
    Array.isArray(value) &&
    value.every(
      (part) =>
        isObject(part) && typeof part['type'] === 'string' && typeof part['text'] === 'string',
    )
  );
}

function textParts(value: unknown): { type: string; text: string }[] {
  assert(isTextParts(value));
  return value;
}

/**
 * Redacted JSON projections sampled from codex-cli 0.156.1 rollouts recorded
 * on 2026-09-23 at 20:34:22 and 20:12:58.
 * IDs, paths, prompts, output values and unrelated payload fields were replaced
 * or removed. The record nesting, types, and ordering used by this reader remain.
 */
function records(name: 'observed-code-mode' | 'observed-code-mode-only'): TestRecord[] {
  return structuredClone(name === 'observed-code-mode' ? codeMode : codeModeOnly);
}

function lines(recordsToRead: readonly TestRecord[]): string[] {
  return recordsToRead.map((record) => JSON.stringify(record));
}

function select(recordsToRead: readonly TestRecord[], type: string, subtype?: string): TestRecord {
  const record = recordsToRead.find(
    (candidate) =>
      candidate.type === type && (subtype === undefined || candidate.payload['type'] === subtype),
  );
  assert(record, `missing ${type}.${subtype ?? '*'}`);
  return record;
}

function commandEvent(recordsToRead: readonly TestRecord[]): TestRecord {
  const record = recordsToRead.find(
    (candidate) =>
      candidate.type === 'event_msg' &&
      candidate.payload['type'] === 'item_completed' &&
      isObject(candidate.payload['item']) &&
      candidate.payload['item']['type'] === 'CommandExecution',
  );
  assert(record, 'missing CommandExecution item_completed event');
  return record;
}

function resumedContext(recordsToRead: readonly TestRecord[]): Record<string, unknown> {
  const contexts = recordsToRead.filter((record) => record.type === 'turn_context');
  assert.equal(contexts.length, 2);
  return contexts[1].payload;
}

function nestedResult(recordsToRead: readonly TestRecord[]): {
  result: Record<string, unknown>;
  save: () => void;
} {
  const output = select(recordsToRead, 'response_item', 'custom_tool_call_output').payload;
  const parts = textParts(output['output']);
  const result = object(JSON.parse(parts[1].text));
  return {
    result,
    save: () => {
      parts[1].text = JSON.stringify(result);
    },
  };
}

function expectRead(recordsToRead: readonly TestRecord[]): RolloutEvidence {
  const result = readRollout(lines(recordsToRead));
  assert(result.ok, `rollout rejected: ${result.ok ? 'none' : result.error.kind}`);
  return result.value;
}

const shellText = 'operation not permitted\nnonce-example\nPATH\nCODEX_HOME\n';
const shortShellText = 'operation not permitted\nnonce-example';

describe('readRollout', () => {
  it('reads the two turn contexts and every resumed output, excluding program input', () => {
    const evidence = expectRead(records('observed-code-mode'));
    const resumed: RecordedTurnContext = evidence.turns[1];
    expect(evidence.threadId).toBe('11111111-1111-4111-8111-111111111111');
    expect(evidence.turns.map((turn) => turn.turnId)).toEqual([
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
    ]);
    expect(resumed.permissionProfile).toEqual({
      type: 'managed',
      file_system: {
        type: 'restricted',
        entries: [{ path: { type: 'special', value: { kind: 'root' } }, access: 'read' }],
      },
      network: 'restricted',
    });
    expect(evidence.resumedOutputTexts).toEqual([shellText, shellText]);
  });

  it('reads the code-mode path without a CommandExecution event', () => {
    const evidence = expectRead(records('observed-code-mode-only'));
    expect(evidence.resumedOutputTexts).toEqual([shortShellText]);
    expect(evidence.turns[0].effort).toBeUndefined();
  });

  it('rejects an unknown top-level type and an invalid session id', () => {
    const unknownType = records('observed-code-mode');
    unknownType.splice(8, 0, { type: 'future_record', payload: {} });
    expect(readRollout(lines(unknownType))).toEqual({
      ok: false,
      error: { kind: 'unknown-record-type', line: 9, recordType: 'future_record' },
    });

    const invalidId = records('observed-code-mode');
    select(invalidId, 'session_meta').payload['id'] = 'not-a-thread';
    expect(readRollout(lines(invalidId))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record', line: 1 },
    });
  });

  it('reports invalid JSON and a repeated session header', () => {
    const malformed = lines(records('observed-code-mode'));
    malformed.splice(1, 0, '{invalid');
    expect(readRollout(malformed)).toEqual({
      ok: false,
      error: { kind: 'invalid-json', line: 2 },
    });

    const repeated = records('observed-code-mode');
    repeated.push(structuredClone(select(repeated, 'session_meta')));
    expect(readRollout(lines(repeated))).toEqual({
      ok: false,
      error: { kind: 'invalid-session-count', count: 2 },
    });
  });

  it('rejects missing or unknown context and output fields', () => {
    const missingProfile = records('observed-code-mode');
    delete resumedContext(missingProfile)['permission_profile'];
    expect(readRollout(lines(missingProfile))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record' },
    });

    const unknownOutput = records('observed-code-mode');
    select(unknownOutput, 'response_item', 'custom_tool_call_output').payload['type'] =
      'future_output';
    expect(readRollout(lines(unknownOutput))).toMatchObject({
      ok: false,
      error: { kind: 'unknown-record-type', recordType: 'response_item.future_output' },
    });

    const missingEventOutput = records('observed-code-mode');
    const event = commandEvent(missingEventOutput).payload;
    delete object(event['item'])['aggregated_output'];
    expect(readRollout(lines(missingEventOutput))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record' },
    });
  });

  it('keeps a paired first-turn output out of resumed evidence', () => {
    const source = records('observed-code-mode-only');
    const call = structuredClone(select(source, 'response_item', 'custom_tool_call'));
    const output = structuredClone(select(source, 'response_item', 'custom_tool_call_output'));
    call.payload['call_id'] = 'call_first_turn';
    output.payload['call_id'] = 'call_first_turn';
    const parts = textParts(output.payload['output']);
    const nested = object(JSON.parse(parts[1].text));
    nested['output'] = 'first-turn-only';
    parts[1].text = JSON.stringify(nested);
    const completion = source.findIndex(
      (record) => record.type === 'event_msg' && record.payload['type'] === 'task_complete',
    );
    source.splice(completion, 0, call, output);
    expect(expectRead(source).resumedOutputTexts).toEqual([shortShellText]);
  });

  it('records changed policy values when settings and turn context agree', () => {
    const changed = records('observed-code-mode');
    const context = resumedContext(changed);
    const profile = object(structuredClone(context['permission_profile']));
    const fileSystem = object(profile['file_system']);
    const entries = fileSystem['entries'];
    assert(Array.isArray(entries));
    object(entries[0])['access'] = 'write';
    context['permission_profile'] = profile;
    context['approval_policy'] = 'on-request';
    context['sandbox_policy'] = { type: 'workspace-write' };
    for (const record of changed.filter(
      (candidate) => candidate.payload['type'] === 'thread_settings_applied',
    )) {
      const settings = object(record.payload['thread_settings']);
      settings['permission_profile'] = structuredClone(profile);
      settings['approval_policy'] = 'on-request';
    }
    const evidence = expectRead(changed);
    expect(evidence.turns[1].permissionProfile).toMatchObject({
      file_system: { entries: [{ access: 'write' }] },
    });
    expect(evidence.turns[1].approvalPolicy).toBe('on-request');
    expect(evidence.turns[1].sandboxPolicy.type).toBe('workspace-write');
  });

  it('rejects mismatched or missing applied settings', () => {
    const mismatch = records('observed-code-mode');
    const settings = object(
      select(mismatch, 'event_msg', 'thread_settings_applied').payload['thread_settings'],
    );
    settings['approval_policy'] = 'on-request';
    expect(readRollout(lines(mismatch))).toMatchObject({
      ok: false,
      error: {
        kind: 'applied-settings-mismatch',
      },
    });

    const absent = records('observed-code-mode').filter(
      (record) => record.payload['type'] !== 'thread_settings_applied',
    );
    expect(readRollout(lines(absent))).toMatchObject({
      ok: false,
      error: {
        kind: 'invalid-turn-order',
        reason: 'resumed turn_context lacks applied thread settings',
      },
    });

    const foreignThread = records('observed-code-mode');
    select(foreignThread, 'event_msg', 'thread_settings_applied').payload['thread_id'] =
      '99999999-9999-4999-8999-999999999999';
    expect(readRollout(lines(foreignThread))).toMatchObject({
      ok: false,
      error: { kind: 'settings-thread-id-mismatch' },
    });
  });

  it('rejects a duplicate turn context and a command from another thread', () => {
    const duplicate = records('observed-code-mode');
    const firstContext = select(duplicate, 'turn_context');
    duplicate.splice(duplicate.indexOf(firstContext) + 1, 0, structuredClone(firstContext));
    expect(readRollout(lines(duplicate))).toMatchObject({
      ok: false,
      error: {
        kind: 'invalid-turn-order',
        reason: 'turn_context has no active turn or is duplicated',
      },
    });

    const foreignCommand = records('observed-code-mode');
    commandEvent(foreignCommand).payload['thread_id'] = '99999999-9999-4999-8999-999999999999';
    expect(readRollout(lines(foreignCommand))).toMatchObject({
      ok: false,
      error: { kind: 'command-thread-id-mismatch' },
    });
  });

  it('rejects an unknown permission profile and unsupported approval policy', () => {
    const unknownProfile = records('observed-code-mode');
    const profile = object(resumedContext(unknownProfile)['permission_profile']);
    profile['extra'] = true;
    expect(readRollout(lines(unknownProfile))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record' },
    });

    const unsupportedApproval = records('observed-code-mode');
    resumedContext(unsupportedApproval)['approval_policy'] = 'on-failure';
    expect(readRollout(lines(unsupportedApproval))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record' },
    });
  });

  it('rejects an extra turn and an incomplete turn', () => {
    const extra = records('observed-code-mode');
    const extraId = '44444444-4444-4444-8444-444444444444';
    const context = structuredClone(resumedContext(extra));
    context['turn_id'] = extraId;
    extra.push(
      { type: 'event_msg', payload: { type: 'task_started', turn_id: extraId } },
      { type: 'turn_context', payload: context },
      { type: 'event_msg', payload: { type: 'task_complete', turn_id: extraId } },
    );
    expect(readRollout(lines(extra))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-turn-count', count: 3 },
    });

    const incomplete = records('observed-code-mode').slice(0, -1);
    expect(readRollout(lines(incomplete))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-turn-order' },
    });
  });

  it('pairs each completed exec call with exactly one output', () => {
    const orphan = records('observed-code-mode-only');
    select(orphan, 'response_item', 'custom_tool_call_output').payload['call_id'] = 'call_other';
    expect(readRollout(lines(orphan))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-turn-order', reason: 'tool output has no matching custom tool call' },
    });

    const unanswered = records('observed-code-mode-only');
    unanswered.splice(
      unanswered.findIndex((record) => record.payload['type'] === 'custom_tool_call_output'),
      1,
    );
    expect(readRollout(lines(unanswered))).toMatchObject({
      ok: false,
      error: {
        kind: 'invalid-turn-order',
        reason: 'task_complete has unanswered custom tool calls',
      },
    });

    const duplicate = records('observed-code-mode-only');
    const output = select(duplicate, 'response_item', 'custom_tool_call_output');
    duplicate.splice(duplicate.indexOf(output), 0, structuredClone(output));
    expect(readRollout(lines(duplicate))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-turn-order', reason: 'tool output has no matching custom tool call' },
    });

    const wrongName = records('observed-code-mode-only');
    select(wrongName, 'response_item', 'custom_tool_call').payload['name'] = 'future_exec';
    expect(readRollout(lines(wrongName))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record', reason: 'custom_tool_call is not a completed exec call' },
    });

    const incompleteCall = records('observed-code-mode-only');
    select(incompleteCall, 'response_item', 'custom_tool_call').payload['status'] = 'in_progress';
    expect(readRollout(lines(incompleteCall))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record', reason: 'custom_tool_call is not a completed exec call' },
    });
  });

  it('rejects malformed code-mode output and extracts each nested shell result', () => {
    const malformed = records('observed-code-mode-only');
    const parts = textParts(
      select(malformed, 'response_item', 'custom_tool_call_output').payload['output'],
    );
    parts[0].type = 'future_text';
    expect(readRollout(lines(malformed))).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record' },
    });

    const multiple = records('observed-code-mode-only');
    const output = select(multiple, 'response_item', 'custom_tool_call_output').payload;
    const results = textParts(output['output']);
    const extra = structuredClone(results[1]);
    const nested = object(JSON.parse(extra.text));
    nested['output'] = 'second-output';
    extra.text = JSON.stringify(nested);
    results.push(extra);
    expect(expectRead(multiple).resumedOutputTexts).toEqual([shortShellText, 'second-output']);
  });

  it.each(['Warning: truncated output', 'Total output lines: 200'])(
    'treats event marker %s as inconclusive',
    (marker) => {
      const candidate = records('observed-code-mode');
      const event = commandEvent(candidate).payload;
      object(event['item'])['aggregated_output'] = marker;
      expect(readRollout(lines(candidate))).toMatchObject({
        ok: false,
        error: { kind: 'truncated-output' },
      });
    },
  );

  it.each(['…153 tokens truncated…', '…153 chars truncated…'])(
    'treats nested marker %s as inconclusive',
    (marker) => {
      const candidate = records('observed-code-mode-only');
      const nested = nestedResult(candidate);
      nested.result['output'] = marker;
      nested.save();
      expect(readRollout(lines(candidate))).toMatchObject({
        ok: false,
        error: { kind: 'truncated-output' },
      });
    },
  );
});
