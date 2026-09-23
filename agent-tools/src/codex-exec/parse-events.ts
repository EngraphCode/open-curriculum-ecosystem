import type { CodexExecEvent, CommandExecution, LastMessageOutcome, TurnEvents } from './types.js';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];

interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}

/**
 * Parse one JSONL line into a closed `CodexExecEvent`.
 *
 * Returns undefined for a blank or malformed line, and for a recognised event
 * that lacks its required field, so a vendor shape change surfaces as an
 * unparseable line rather than as a silently empty event.
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

function parseTypedEvent(type: string, event: JsonObject): CodexExecEvent | undefined {
  switch (type) {
    case 'thread.started':
      return withString(event['thread_id'], (threadId) => ({ kind: 'thread-started', threadId }));
    case 'turn.failed':
      return parseTurnFailed(event);
    case 'error':
      return withString(event['message'], (message) => ({ kind: 'stream-error', message }));
    case 'item.completed':
      return parseCompletedItem(event['item']);
    default:
      return { kind: 'other', type };
  }
}

function parseTurnFailed(event: JsonObject): CodexExecEvent | undefined {
  const error = event['error'];
  if (!isJsonObject(error)) {
    return undefined;
  }
  return withString(error['message'], (message) => ({ kind: 'turn-failed', message }));
}

function parseCompletedItem(item: JsonValue | undefined): CodexExecEvent | undefined {
  if (!isJsonObject(item)) {
    return undefined;
  }
  if (item['type'] === 'agent_message') {
    return withString(item['text'], (text) => ({ kind: 'agent-message', text }));
  }
  if (item['type'] === 'command_execution') {
    return parseCommandExecution(item);
  }
  return { kind: 'other', type: 'item.completed' };
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
  const threadIds: string[] = [];
  const agentMessages: string[] = [];
  const commandExecutions: CommandExecution[] = [];
  const failures: string[] = [];
  let unparseableLines = 0;
  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    const event = parseCodexExecEvent(line);
    if (event === undefined) {
      unparseableLines += 1;
      continue;
    }
    foldEvent({ threadIds, agentMessages, commandExecutions, failures }, event);
  }
  return { threadIds, agentMessages, commandExecutions, failures, unparseableLines };
}

interface TurnEventLists {
  readonly threadIds: string[];
  readonly agentMessages: string[];
  readonly commandExecutions: CommandExecution[];
  readonly failures: string[];
}

function foldEvent(lists: TurnEventLists, event: CodexExecEvent): void {
  switch (event.kind) {
    case 'thread-started':
      lists.threadIds.push(event.threadId);
      return;
    case 'agent-message':
      lists.agentMessages.push(event.text);
      return;
    case 'command-execution':
      lists.commandExecutions.push({
        command: event.command,
        output: event.output,
        exitCode: event.exitCode,
      });
      return;
    case 'turn-failed':
    case 'stream-error':
      lists.failures.push(event.message);
      return;
    case 'other':
      return;
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
