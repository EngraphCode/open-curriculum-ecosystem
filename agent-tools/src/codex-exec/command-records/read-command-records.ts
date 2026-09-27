import { isRecord, type JsonRecord } from '../rollout/record-shapes.js';

import { flagRecord, isExecuted, readCommandItem } from './command-item.js';
import {
  classifyOutput,
  execRequest,
  flagRefusal,
  outputCallId,
  type ExecRequest,
} from './exec-calls.js';
import { recordTypeKey } from './record-type-key.js';
import type {
  CommandRecord,
  CommandRecordsSummary,
  FlaggedCommand,
  Malformed,
  TurnAccount,
} from './summary.js';

/** One turn while the stream is folded. */
interface TurnState {
  readonly turnId: string;
  readonly commands: CommandRecord[];
  /** Exec requests awaiting their output, by call id. */
  readonly pending: Set<string>;
  calls: number;
  accounted: number;
  refused: number;
  unaccounted: number;
}

/** Internal accumulation; only the summary crosses the module boundary. */
interface ReaderState {
  readonly turns: TurnState[];
  readonly flagged: FlaggedCommand[];
  readonly recordTypes: Map<string, number>;
  readonly malformed: Malformed[];
  readonly invalidLines: number[];
}

/** A turn id as the summary may print it: word characters and dashes, bounded; anything else is untrusted text. */
const TURN_ID = /^[\w-]{1,64}$/u;

/** Open a turn on `task_started`; a repeated, missing or ill-formed id is malformed and opens nothing. */
function startTurn(payload: JsonRecord, state: ReaderState, line: number): void {
  const turnId = payload.turn_id;
  if (typeof turnId !== 'string' || !TURN_ID.test(turnId)) {
    state.malformed.push({ line, reason: 'task_started has no well-formed turn id' });
    return;
  }
  if (state.turns.some((turn) => turn.turnId === turnId)) {
    state.malformed.push({ line, reason: 'task_started repeats a turn id' });
    return;
  }
  state.turns.push({
    turnId,
    commands: [],
    pending: new Set(),
    calls: 0,
    accounted: 0,
    refused: 0,
    unaccounted: 0,
  });
}

/** Fold an `item_completed` event: only a `CommandExecution` item is evidence. */
function readItemCompleted(payload: JsonRecord, state: ReaderState, line: number): void {
  const item = payload.item;
  if (!isRecord(item) || item.type !== 'CommandExecution') {
    return;
  }
  const turnId = payload.turn_id;
  if (typeof turnId !== 'string') {
    state.malformed.push({ line, reason: 'CommandExecution event has no turn id' });
    return;
  }
  const turn = state.turns.find((candidate) => candidate.turnId === turnId);
  if (turn === undefined) {
    state.malformed.push({ line, reason: 'CommandExecution precedes its turn' });
    return;
  }
  const read = readCommandItem(item, turnId, line);
  if (!read.ok) {
    state.malformed.push(read.error);
    return;
  }
  turn.commands.push(read.value);
  const flagged = flagRecord(read.value);
  if (flagged !== undefined) {
    state.flagged.push(flagged);
  }
}

/** An exec request opens a pending call on the current turn; one with no call id, or repeating a pending one, is malformed and unaccounted. */
function readExecRequest(request: ExecRequest, state: ReaderState, line: number): void {
  const turn = state.turns.at(-1);
  if (turn === undefined) {
    state.malformed.push({ line, reason: 'exec request precedes its turn' });
    return;
  }
  turn.calls += 1;
  const { callId } = request;
  if (callId === undefined) {
    turn.unaccounted += 1;
    state.malformed.push({ line, reason: 'exec request has no call id' });
    return;
  }
  if (turn.pending.has(callId)) {
    turn.unaccounted += 1;
    state.malformed.push({ line, reason: 'exec request repeats a pending call id' });
    return;
  }
  turn.pending.add(callId);
}

/** An output joins its pending call and settles it; an output for no pending exec call is ignored. */
function readExecOutput(
  payload: JsonRecord,
  callId: string,
  state: ReaderState,
  line: number,
): void {
  const turn = state.turns.at(-1);
  if (!turn?.pending.has(callId)) {
    return;
  }
  turn.pending.delete(callId);
  const outcome = classifyOutput(payload.output);
  if (outcome.kind === 'accounted') {
    turn.accounted += 1;
    return;
  }
  if (outcome.kind === 'refused') {
    turn.refused += 1;
    const flagged = flagRefusal(outcome.refusal, line, turn.turnId);
    if (flagged !== undefined) {
      state.flagged.push(flagged);
    }
    return;
  }
  turn.unaccounted += 1;
  if (outcome.kind === 'malformed') {
    state.malformed.push({ line, reason: outcome.reason });
  }
}

/** Fold a `response_item` payload: an exec request, a tool output, or nothing to read. */
function readResponseItem(payload: JsonRecord, state: ReaderState, line: number): void {
  const request = execRequest(payload);
  if (request !== undefined) {
    readExecRequest(request, state, line);
    return;
  }
  const callId = outputCallId(payload);
  if (callId !== undefined) {
    readExecOutput(payload, callId, state, line);
  }
}

/** Fold an `event_msg` payload by its type; other event types are counted only. */
function readEvent(payload: JsonRecord, state: ReaderState, line: number): void {
  if (payload.type === 'task_started') {
    startTurn(payload, state, line);
  } else if (payload.type === 'item_completed') {
    readItemCompleted(payload, state, line);
  }
}

/** Count a record's type, then fold it when it is an event or a response item. */
function readRecord(record: JsonRecord, state: ReaderState, line: number): void {
  const type = record.type;
  if (typeof type !== 'string') {
    state.malformed.push({ line, reason: 'record has no type' });
    return;
  }
  const payload = record.payload;
  const key = recordTypeKey(type, payload);
  state.recordTypes.set(key, (state.recordTypes.get(key) ?? 0) + 1);
  if (!isRecord(payload)) {
    return;
  }
  if (type === 'event_msg') {
    readEvent(payload, state, line);
  } else if (type === 'response_item') {
    readResponseItem(payload, state, line);
  }
}

/** Parse one line; anything that is not a JSON object is an invalid line, never a throw. */
function readLine(text: string, state: ReaderState, line: number): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    state.invalidLines.push(line);
    return;
  }
  if (!isRecord(parsed)) {
    state.invalidLines.push(line);
    return;
  }
  readRecord(parsed, state, line);
}

/** A turn's counts once the rollout ends; a request still pending is unaccounted. */
function accountOf(turn: TurnState): TurnAccount {
  return {
    turnId: turn.turnId,
    calls: turn.calls,
    accounted: turn.accounted,
    refused: turn.refused,
    unaccounted: turn.unaccounted + turn.pending.size,
    executed: turn.commands.filter(isExecuted).length,
    declined: turn.commands.filter((command) => command.status === 'declined').length,
  };
}

/**
 * Read a seat's whole rollout as JSONL lines into counts of the commands the
 * harness recorded as run and of the exec calls it accounted, refused or left
 * unaccounted, per turn, with every record type seen, every evidence record
 * that could not be read, and every command that carried a forbidden shape of
 * the seat rules, rendered by allowlist. Never throws; never returns the
 * command history: counts, and the flagged entries alone.
 */
export function readCommandRecords(lines: readonly string[]): CommandRecordsSummary {
  const state: ReaderState = {
    turns: [],
    flagged: [],
    recordTypes: new Map(),
    malformed: [],
    invalidLines: [],
  };
  for (const [index, text] of lines.entries()) {
    if (text.trim().length > 0) {
      readLine(text, state, index + 1);
    }
  }
  const accounts = state.turns.map(accountOf);
  return {
    turns: state.turns.length,
    commands: accounts.reduce((sum, account) => sum + account.executed, 0),
    unaccounted: accounts.reduce((sum, account) => sum + account.unaccounted, 0),
    flagged: state.flagged,
    accounts,
    recordTypes: Object.fromEntries(state.recordTypes),
    malformed: state.malformed,
    invalidLines: state.invalidLines,
  };
}
