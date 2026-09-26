import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { isRecord, type JsonRecord } from '../rollout/record-shapes.js';

import type { CommandRecord, CommandRecordsSummary, Malformed, TurnAccount } from './summary.js';

const COMMAND_REASON = 'CommandExecution.command is not a non-empty list of strings';

/**
 * A `CommandExecution` item's fields as codex-cli 0.157.1 writes them: the
 * closed status and source sets, the argv, and the two optional fields. Other
 * fields of the item (its id, cwd, outputs, duration) are not read. Each check
 * carries the reason it fails, named by field so no reason echoes a value.
 */
const commandItemSchema = z.object({
  command: z
    .array(z.string({ error: COMMAND_REASON }), { error: COMMAND_REASON })
    .min(1, { error: COMMAND_REASON }),
  status: z.enum(['in_progress', 'completed', 'failed', 'declined'], {
    error: 'CommandExecution.status is outside its closed set',
  }),
  source: z.enum(['agent', 'user_shell', 'unified_exec_startup', 'unified_exec_interaction'], {
    error: 'CommandExecution.source is outside its closed set',
  }),
  exit_code: z.number({ error: 'CommandExecution.exit_code is not a number' }).optional(),
  interaction_input: z
    .string({ error: 'CommandExecution.interaction_input is not a string' })
    .optional(),
});

/** One turn while the stream is folded; later cycles add the tool-call join state. */
interface TurnState {
  readonly turnId: string;
  readonly commands: CommandRecord[];
}

/** Internal accumulation; only the summary crosses the module boundary. */
interface ReaderState {
  readonly turns: TurnState[];
  readonly recordTypes: Record<string, number>;
  readonly malformed: Malformed[];
  readonly invalidLines: number[];
}

/** A command the harness ran to completion or failure itself, not a refusal or a keystroke. */
function isExecuted(record: CommandRecord): boolean {
  return record.status !== 'declined' && record.source !== 'unified_exec_interaction';
}

/** The key a record is counted under: its type, then the payload's type when it has one. */
function recordTypeKey(type: string, payload: unknown): string {
  return isRecord(payload) && typeof payload.type === 'string' ? `${type}.${payload.type}` : type;
}

/** Open a turn on `task_started`; a repeated or missing id is malformed and opens nothing. */
function startTurn(payload: JsonRecord, state: ReaderState, line: number): void {
  const turnId = payload.turn_id;
  if (typeof turnId !== 'string' || turnId.length === 0) {
    state.malformed.push({ line, reason: 'task_started has no turn id' });
    return;
  }
  if (state.turns.some((turn) => turn.turnId === turnId)) {
    state.malformed.push({ line, reason: 'task_started repeats a turn id' });
    return;
  }
  state.turns.push({ turnId, commands: [] });
}

/** A `CommandExecution` item as a record, or the first failing field's reason. */
function readCommandItem(
  item: unknown,
  turnId: string,
  line: number,
): Result<CommandRecord, Malformed> {
  const parsed = commandItemSchema.safeParse(item);
  if (!parsed.success) {
    const reason =
      parsed.error.issues[0]?.message ?? 'CommandExecution has a field the reader cannot read';
    return err({ line, reason });
  }
  return ok({
    line,
    turnId,
    command: parsed.data.command,
    status: parsed.data.status,
    source: parsed.data.source,
    exitCode: parsed.data.exit_code,
    interactionInput: parsed.data.interaction_input,
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
  if (read.ok) {
    turn.commands.push(read.value);
  } else {
    state.malformed.push(read.error);
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

/** Count a record's type, then fold it when it is an event. */
function readRecord(record: JsonRecord, state: ReaderState, line: number): void {
  const type = record.type;
  if (typeof type !== 'string') {
    state.malformed.push({ line, reason: 'record has no type' });
    return;
  }
  const payload = record.payload;
  const key = recordTypeKey(type, payload);
  state.recordTypes[key] = (state.recordTypes[key] ?? 0) + 1;
  if (type === 'event_msg' && isRecord(payload)) {
    readEvent(payload, state, line);
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

/**
 * Read a seat's whole rollout as JSONL lines into counts of the commands the
 * harness recorded as run, per turn, with every record type seen and every
 * evidence record that could not be read. Never throws; never keeps the
 * command history beyond the counts it returns.
 */
export function readCommandRecords(lines: readonly string[]): CommandRecordsSummary {
  const state: ReaderState = { turns: [], recordTypes: {}, malformed: [], invalidLines: [] };
  for (const [index, text] of lines.entries()) {
    if (text.trim().length > 0) {
      readLine(text, state, index + 1);
    }
  }
  const accounts: TurnAccount[] = state.turns.map((turn) => ({
    turnId: turn.turnId,
    executed: turn.commands.filter(isExecuted).length,
  }));
  return {
    turns: state.turns.length,
    commands: accounts.reduce((sum, account) => sum + account.executed, 0),
    accounts,
    recordTypes: state.recordTypes,
    malformed: state.malformed,
    invalidLines: state.invalidLines,
  };
}
