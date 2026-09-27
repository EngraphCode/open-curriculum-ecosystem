import type { JsonRecord } from '../rollout/record-shapes.js';

import { flagSegments } from './command-item.js';
import { readHarnessText, type HarnessText, type Refusal } from './harness-text.js';
import { shellSegments } from './shell-segments.js';
import type { FlaggedCommand } from './summary.js';

/**
 * The exec family of tool calls and what their outputs say happened. A
 * request is `response_item.custom_tool_call` named `exec` (code mode) or
 * `response_item.function_call` named `exec_command`, `write_stdin` or
 * `shell_command` (a legacy alias, source-read). Outputs carry no name, so
 * each `custom_tool_call_output` or `function_call_output` joins its request
 * by `call_id` within the turn. Per call the classes are exclusive and decided
 * in this order: a truncated output is unaccounted; a refusal is refused; a
 * completed wrapper is accounted; a failed, terminated, running or absent
 * wrapper is unaccounted; a request unanswered when the rollout ends is
 * unaccounted. Every turn satisfies `calls === accounted + refused + unaccounted`.
 */

const REQUEST_NAMES: Readonly<Record<string, ReadonlySet<string>>> = {
  custom_tool_call: new Set(['exec']),
  function_call: new Set(['exec_command', 'write_stdin', 'shell_command']),
};
const OUTPUT_TYPES: ReadonlySet<string> = new Set([
  'custom_tool_call_output',
  'function_call_output',
]);

/** How an output accounts for its call. */
export type OutputClass =
  | { readonly kind: 'accounted' }
  | { readonly kind: 'unaccounted' }
  | { readonly kind: 'refused'; readonly refusal: Refusal }
  | { readonly kind: 'malformed'; readonly reason: string };

/** The call id when the payload is an exec-family request; undefined otherwise. */
export function execRequestId(payload: JsonRecord): string | undefined {
  const type = typeof payload.type === 'string' ? payload.type : '';
  const names = REQUEST_NAMES[type];
  if (names === undefined || typeof payload.name !== 'string' || !names.has(payload.name)) {
    return undefined;
  }
  return typeof payload.call_id === 'string' && payload.call_id.length > 0
    ? payload.call_id
    : undefined;
}

/** The call id when the payload is a tool output; undefined otherwise. */
export function outputCallId(payload: JsonRecord): string | undefined {
  if (typeof payload.type !== 'string' || !OUTPUT_TYPES.has(payload.type)) {
    return undefined;
  }
  return typeof payload.call_id === 'string' ? payload.call_id : undefined;
}

/** Classify an exec output by its harness text, in the exclusive order the module documents. */
export function classifyOutput(output: unknown): OutputClass {
  const text: HarnessText = readHarnessText(output);
  if (text.kind === 'malformed') {
    return { kind: 'malformed', reason: text.reason };
  }
  if (text.truncated) {
    return { kind: 'unaccounted' };
  }
  if (text.refusal !== undefined) {
    return { kind: 'refused', refusal: text.refusal };
  }
  return { kind: text.status === 'completed' ? 'accounted' : 'unaccounted' };
}

/** The refused command as a flagged entry when it carried a forbidden shape, or none. */
export function flagRefusal(
  refusal: Refusal,
  line: number,
  turnId: string,
): FlaggedCommand | undefined {
  if (refusal.commandLine.length === 0) {
    return undefined;
  }
  return flagSegments(shellSegments(['sh', '-c', refusal.commandLine]), {
    kind: 'refused',
    line,
    turnId,
  });
}
