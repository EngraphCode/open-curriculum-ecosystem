import { err, ok, type Result } from '@oaknational/result';

import { parseToolOutput, type JsonRecord } from './record-shapes.js';
import { activeTurnWithContext, type ReaderState } from './reader-state.js';
import { invalid, order, unknown, type RolloutReadError } from './rollout-types.js';

function readCustomToolOutput(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const callId = payload['call_id'];
  if (typeof callId !== 'string' || callId.length === 0) {
    return invalid(line, 'custom_tool_call_output.call_id is missing');
  }
  const active = activeTurnWithContext(state);
  if (active === undefined) {
    return order(line, 'tool output has no active context');
  }
  if (!active.pendingCallIds.has(callId)) {
    return order(line, 'tool output has no matching custom tool call');
  }
  const parsed = parseToolOutput(payload['output']);
  if (parsed.kind === 'invalid') {
    return invalid(line, 'custom_tool_call_output.output has unknown shape');
  }
  if (parsed.kind === 'truncated') {
    return err({ kind: 'truncated-output', line });
  }
  active.pendingCallIds.delete(callId);
  if (state.turns.length === 2) {
    state.outputTexts.push(...parsed.outputs);
  }
  return ok(undefined);
}

function readCustomToolCall(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const callId = payload['call_id'];
  if (
    typeof payload['input'] !== 'string' ||
    payload['name'] !== 'exec' ||
    payload['status'] !== 'completed' ||
    typeof callId !== 'string' ||
    callId.length === 0
  ) {
    return invalid(line, 'custom_tool_call is not a completed exec call');
  }
  const active = activeTurnWithContext(state);
  if (active === undefined) {
    return order(line, 'custom tool call has no active context');
  }
  if (active.pendingCallIds.has(callId)) {
    return order(line, 'custom tool call repeats a pending call id');
  }
  active.pendingCallIds.add(callId);
  return ok(undefined);
}

export function readResponse(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const type = payload['type'];
  if (typeof type !== 'string') {
    return invalid(line, 'response_item.type is missing');
  }
  if (type === 'custom_tool_call_output') {
    return readCustomToolOutput(payload, state, line);
  }
  if (type === 'custom_tool_call') {
    return readCustomToolCall(payload, state, line);
  }
  if (['message', 'reasoning'].includes(type)) {
    return ok(undefined);
  }
  return unknown(line, `response_item.${type}`);
}
