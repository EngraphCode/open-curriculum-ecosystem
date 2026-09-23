import type {
  CodexExecEvent,
  CommandExecution,
  LastMessageOutcome,
  TurnEvents,
  UnusedItemType,
} from './types.js';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];

interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}

/**
 * Parse one JSONL line into a closed `CodexExecEvent`.
 *
 * Returns undefined for a blank or malformed line, for a top-level type
 * outside the documented set, and for a recognised event that lacks its
 * required field. So a vendor addition or shape change surfaces as an
 * unrecognised line, never as a silently ignored or empty event.
 */
export function parseCodexExecEvent(line: string): CodexExecEvent | undefined {
  const trimmed = line.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = safeJsonParse(trimmed);
  if (!isJsonObject(parsed)) {
    return undefined;
  }
  const type = parsed['type'];
  if (typeof type !== 'string') {
    return undefined;
  }
  return parseTypedEvent(type, parsed);
}

type EventParser = (event: JsonObject) => CodexExecEvent | undefined;

/**
 * One parser for each documented top-level type; any other type is
 * unrecognised.
 */
const EVENT_PARSERS: ReadonlyMap<string, EventParser> = new Map<string, EventParser>([
  [
    'thread.started',
    (event) => withString(event['thread_id'], (threadId) => ({ kind: 'thread-started', threadId })),
  ],
  ['turn.started', () => ({ kind: 'turn-started' })],
  ['turn.completed', () => ({ kind: 'turn-completed' })],
  ['turn.failed', (event) => parseTurnFailed(event)],
  [
    'error',
    (event) => withString(event['message'], (message) => ({ kind: 'stream-error', message })),
  ],
  ['item.started', (event) => parseItemProgress(event)],
  ['item.updated', (event) => parseItemProgress(event)],
  ['item.completed', (event) => parseCompletedItem(event['item'])],
]);

function parseTypedEvent(type: string, event: JsonObject): CodexExecEvent | undefined {
  return EVENT_PARSERS.get(type)?.(event);
}

function parseItemProgress(event: JsonObject): CodexExecEvent | undefined {
  return isJsonObject(event['item']) ? { kind: 'item-progress' } : undefined;
}

function parseTurnFailed(event: JsonObject): CodexExecEvent | undefined {
  const error = event['error'];
  if (!isJsonObject(error)) {
    return undefined;
  }
  return withString(error['message'], (message) => ({ kind: 'turn-failed', message }));
}

const UNUSED_ITEM_TYPES: readonly UnusedItemType[] = ['reasoning', 'todo_list', 'error'];

function parseCompletedItem(item: JsonValue | undefined): CodexExecEvent | undefined {
  if (!isJsonObject(item)) {
    return undefined;
  }
  const itemType = item['type'];
  if (typeof itemType !== 'string') {
    return undefined;
  }
  if (itemType === 'agent_message') {
    return withString(item['text'], (text) => ({ kind: 'agent-message', text }));
  }
  if (itemType === 'command_execution') {
    return parseCommandExecution(item);
  }
  const unused = UNUSED_ITEM_TYPES.find((candidate) => candidate === itemType);
  return unused === undefined
    ? { kind: 'unexpected-item', itemType }
    : { kind: 'unused-item', itemType: unused };
}

function parseCommandExecution(item: JsonObject): CodexExecEvent | undefined {
  const command = item['command'];
  const output = item['aggregated_output'];
  const exitCode = item['exit_code'];
  if (typeof command !== 'string' || typeof output !== 'string') {
    return undefined;
  }
  return {
    kind: 'command-execution',
    command,
    output,
    exitCode: typeof exitCode === 'number' ? exitCode : undefined,
  };
}

/**
 * Fold one turn's JSONL lines, in order, into what the turn said.
 */
export function readTurnEvents(lines: readonly string[]): TurnEvents {
  const fold: TurnFold = {
    threadIds: [],
    agentMessages: [],
    commandExecutions: [],
    failures: [],
    unexpectedItems: [],
    turnStarts: 0,
    turnCompletions: 0,
    endsWithCompletion: false,
    unrecognisedLines: 0,
  };
  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    const event = parseCodexExecEvent(line);
    if (event === undefined) {
      fold.unrecognisedLines += 1;
      continue;
    }
    foldEvent(fold, event);
    fold.endsWithCompletion = event.kind === 'turn-completed';
  }
  return fold;
}

interface TurnFold {
  readonly threadIds: string[];
  readonly agentMessages: string[];
  readonly commandExecutions: CommandExecution[];
  readonly failures: string[];
  readonly unexpectedItems: string[];
  turnStarts: number;
  turnCompletions: number;
  endsWithCompletion: boolean;
  unrecognisedLines: number;
}

type ItemEvent = Extract<
  CodexExecEvent,
  {
    readonly kind:
      'item-progress' | 'agent-message' | 'command-execution' | 'unused-item' | 'unexpected-item';
  }
>;

function foldEvent(fold: TurnFold, event: CodexExecEvent): void {
  switch (event.kind) {
    case 'thread-started':
      fold.threadIds.push(event.threadId);
      return;
    case 'turn-started':
      fold.turnStarts += 1;
      return;
    case 'turn-completed':
      fold.turnCompletions += 1;
      return;
    case 'turn-failed':
    case 'stream-error':
      fold.failures.push(event.message);
      return;
    default:
      foldItemEvent(fold, event);
  }
}

function foldItemEvent(fold: TurnFold, event: ItemEvent): void {
  switch (event.kind) {
    case 'agent-message':
      fold.agentMessages.push(event.text);
      return;
    case 'command-execution':
      fold.commandExecutions.push({
        command: event.command,
        output: event.output,
        exitCode: event.exitCode,
      });
      return;
    case 'unexpected-item':
      fold.unexpectedItems.push(event.itemType);
      return;
    case 'item-progress':
    case 'unused-item':
      return;
    default: {
      const unhandled: never = event;
      return unhandled;
    }
  }
}

/**
 * Extract the last agent message from a sequence of JSONL lines.
 *
 * The final assistant text is on `type === "item.completed"` events
 * where `item.type === "agent_message"`, at `item.text`.
 */
export function extractLastAgentMessage(lines: readonly string[]): LastMessageOutcome {
  const lastText = readTurnEvents(lines).agentMessages.at(-1);
  if (lastText === undefined) {
    return { found: false };
  }
  return { found: true, text: lastText };
}

/**
 * Build a value from a JSON field when the field is a string.
 */
function withString<T>(value: JsonValue | undefined, build: (text: string) => T): T | undefined {
  return typeof value === 'string' ? build(value) : undefined;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
