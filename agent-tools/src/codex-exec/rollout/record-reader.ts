import { err, ok, type Result } from '@oaknational/result';

import { isRecord, parseToolOutput, parseTurnContext, type JsonRecord } from './record-shapes.js';
import type { RecordedTurnContext, RolloutReadError } from './rollout-types.js';

export interface TurnState {
  readonly turnId: string;
  context?: RecordedTurnContext;
  complete: boolean;
}

export interface ReaderState {
  threadId?: string;
  sessionCount: number;
  readonly turns: TurnState[];
  active?: TurnState;
  readonly outputTexts: string[];
}

function invalid(line: number, reason: string): Result<void, RolloutReadError> {
  return err({ kind: 'invalid-record', line, reason });
}

function order(line: number, reason: string): Result<void, RolloutReadError> {
  return err({ kind: 'invalid-turn-order', line, reason });
}

function unknown(line: number, recordType: string): Result<void, RolloutReadError> {
  return err({ kind: 'unknown-record-type', line, recordType });
}

function readSession(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  if (typeof payload['id'] !== 'string' || payload['id'].length === 0) {
    return invalid(line, 'session_meta.id is missing');
  }
  state.sessionCount += 1;
  state.threadId = payload['id'];
  return ok(undefined);
}

function readContext(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const context = parseTurnContext(payload);
  if (context === undefined) {
    return invalid(line, 'turn_context has an unknown or missing required field');
  }
  const active = state.active;
  if (active === undefined || active.complete || active.context !== undefined) {
    return order(line, 'turn_context has no active turn or is duplicated');
  }
  if (context.turnId !== active.turnId) {
    return order(line, 'turn_context turn id differs from task_started');
  }
  active.context = context;
  return ok(undefined);
}

function readItemCompleted(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const item = payload['item'];
  if (!isRecord(item) || typeof item['type'] !== 'string') {
    return invalid(line, 'item_completed.item.type is missing');
  }
  if (item['type'] === 'CommandExecution') {
    return readCommandExecution(payload, item, state, line);
  }
  return ['UserMessage', 'AgentMessage', 'Reasoning'].includes(item['type'])
    ? ok(undefined)
    : unknown(line, `event_msg.item_completed.${item['type']}`);
}

function readCommandExecution(
  payload: JsonRecord,
  item: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  if (typeof item['aggregated_output'] !== 'string' || typeof payload['turn_id'] !== 'string') {
    return invalid(line, 'CommandExecution output or turn id is missing');
  }
  if (
    state.active?.turnId !== payload['turn_id'] ||
    state.active.complete ||
    !state.active.context
  ) {
    return order(line, 'CommandExecution has no matching active context');
  }
  if (state.turns.length === 2) {
    state.outputTexts.push(item['aggregated_output']);
  }
  return ok(undefined);
}

function startTurn(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const turnId = payload['turn_id'];
  if (typeof turnId !== 'string' || turnId.length === 0) {
    return invalid(line, 'task_started.turn_id is missing');
  }
  if (state.active !== undefined && !state.active.complete) {
    return order(line, 'a turn is already active');
  }
  const turn: TurnState = { turnId, complete: false };
  state.turns.push(turn);
  state.active = turn;
  return ok(undefined);
}

function completeTurn(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  if (typeof payload['turn_id'] !== 'string') {
    return invalid(line, 'task_complete.turn_id is missing');
  }
  if (
    state.active?.turnId !== payload['turn_id'] ||
    state.active.complete ||
    !state.active.context
  ) {
    return order(line, 'task_complete has no matching active context');
  }
  state.active.complete = true;
  return ok(undefined);
}

function readEvent(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const type = payload['type'];
  if (typeof type !== 'string') {
    return invalid(line, 'event_msg.type is missing');
  }
  if (type === 'task_started') {
    return startTurn(payload, state, line);
  }
  if (type === 'task_complete') {
    return completeTurn(payload, state, line);
  }
  if (type === 'item_completed') {
    return readItemCompleted(payload, state, line);
  }
  if (['token_count', 'thread_settings_applied'].includes(type)) {
    return ok(undefined);
  }
  return unknown(line, `event_msg.${type}`);
}

function readCustomToolOutput(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const texts = parseToolOutput(payload['output']);
  if (texts === undefined) {
    return invalid(line, 'custom_tool_call_output.output has unknown shape');
  }
  if (state.active === undefined || state.active.complete || !state.active.context) {
    return order(line, 'tool output has no active context');
  }
  if (state.turns.length === 2) {
    state.outputTexts.push(...texts);
  }
  return ok(undefined);
}

function readResponse(
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
    if (typeof payload['input'] !== 'string') {
      return invalid(line, 'custom_tool_call.input is missing');
    }
    return ok(undefined);
  }
  if (['message', 'reasoning'].includes(type)) {
    return ok(undefined);
  }
  return unknown(line, `response_item.${type}`);
}

type RecordHandler = (
  payload: JsonRecord,
  state: ReaderState,
  line: number,
) => Result<void, RolloutReadError>;

const RECORD_HANDLERS: ReadonlyMap<string, RecordHandler> = new Map([
  ['session_meta', readSession],
  ['turn_context', readContext],
  ['event_msg', readEvent],
  ['response_item', readResponse],
]);

export function readRecord(
  record: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const type = record['type'];
  if (typeof type !== 'string') {
    return invalid(line, 'record.type is missing');
  }
  const payload = record['payload'];
  if (!isRecord(payload)) {
    return invalid(line, `${type}.payload is missing`);
  }
  const handler = RECORD_HANDLERS.get(type);
  if (handler !== undefined) {
    return handler(payload, state, line);
  }
  if (type === 'world_state' || type === 'token_usage_record') {
    return ok(undefined);
  }
  return unknown(line, type);
}
