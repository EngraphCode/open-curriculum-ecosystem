import { z } from 'zod';

import { readPreamble, type Preamble, type PreambleStatus } from '../rollout/code-mode-output.js';
import { hasTruncationMarker } from '../rollout/record-shapes.js';

/**
 * The harness's own text in an exec tool output, read for what the harness
 * says happened to the call: the code-mode wrapper's status, a refusal by the
 * exec policy, or a truncation that leaves the outcome inconclusive.
 *
 * The output arrives in one of two carriers, both observed on codex-cli
 * 0.157.1: a string, or an array of `{ type, text }` parts (also as a JSON
 * string holding that array). In a code-mode output the program's own text
 * comes first and the harness appends `Script error:\n…` last, so a refusal
 * or a truncation is read only after the LAST `Script error:` line; text
 * before it is the program's and is never matched. In a function-tool output
 * (`exec_command`, `write_stdin`) the harness's text is the whole text, read
 * from offset 0.
 */

const partsSchema = z.array(z.object({ text: z.string() }));

/** A command the exec policy refused before any process spawned, and why. */
export interface Refusal {
  /** The judged command line as the policy rendered it; empty for a refused `write_stdin`. */
  readonly commandLine: string;
  readonly justification: string;
}

export type HarnessText =
  | { readonly kind: 'malformed'; readonly reason: string }
  | {
      readonly kind: 'text';
      readonly status: PreambleStatus;
      readonly refusal: Refusal | undefined;
      readonly truncated: boolean;
    };

const SCRIPT_ERROR = 'Script error:\n';
/** The router's `Debug` rendering of a rejected exec: the message is a quoted, escaped string. */
const DEBUG_REJECTED =
  /^exec_command failed: CreateProcess \{ message: "Rejected\((.*)\)" \}\s*$/su;
/** The exec policy's own message: the judged command in backticks, then the justification. */
const REJECTED = /^`([^`]*)` rejected: (.*)$/su;
const STDIN_REJECTED = /^write_stdin rejected: (.*)$/su;

/** The text of an output, whichever carrier holds it. */
function textOf(output: unknown): string | undefined {
  if (typeof output !== 'string') {
    const parts = partsSchema.safeParse(output);
    return parts.success ? parts.data.map((part) => part.text).join('') : undefined;
  }
  if (!output.startsWith('[')) {
    return output;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(output);
  } catch {
    return output;
  }
  const parts = partsSchema.safeParse(parsed);
  return parts.success ? parts.data.map((part) => part.text).join('') : output;
}

/**
 * One level of `Debug` escaping undone: the backslash-escaped quotes,
 * backslashes and newlines of a string literal, then the literal's own quotes.
 */
function unescapeOnce(literal: string): string {
  const unescaped = literal.replaceAll(/\\(["\\n])/gu, (_match, escaped: string) =>
    escaped === 'n' ? '\n' : escaped,
  );
  return unescaped.startsWith('"') && unescaped.endsWith('"') ? unescaped.slice(1, -1) : unescaped;
}

/** The refusal the anchored text opens with, in any of its carriers, or none. */
function refusalIn(anchored: string): Refusal | undefined {
  const debug = DEBUG_REJECTED.exec(anchored);
  const message = debug === null ? anchored : unescapeOnce(debug[1] ?? '');
  const rejected = REJECTED.exec(message);
  if (rejected !== null) {
    return { commandLine: rejected[1] ?? '', justification: rejected[2] ?? '' };
  }
  const stdin = STDIN_REJECTED.exec(message);
  return stdin === null ? undefined : { commandLine: '', justification: stdin[1] ?? '' };
}

/** The harness's text after the last `Script error:` line; empty when the script wrote no error. */
function afterLastScriptError(rest: string): string {
  const at = rest.lastIndexOf(SCRIPT_ERROR);
  return at === -1 ? '' : rest.slice(at + SCRIPT_ERROR.length);
}

/**
 * Read an exec tool output's harness text. A carrier that is neither text nor
 * the harness's parts is malformed; otherwise the wrapper status, the refusal
 * the anchored text opens with, and whether the anchored text is truncated.
 */
export function readHarnessText(output: unknown): HarnessText {
  const text = textOf(output);
  if (text === undefined) {
    return { kind: 'malformed', reason: "exec output is neither text nor the harness's parts" };
  }
  const preamble: Preamble = readPreamble(text);
  const anchored = preamble.status === 'none' ? text : afterLastScriptError(preamble.rest);
  return {
    kind: 'text',
    status: preamble.status,
    refusal: refusalIn(anchored),
    truncated: hasTruncationMarker(anchored),
  };
}
