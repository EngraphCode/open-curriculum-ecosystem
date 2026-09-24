import { err, ok, type Result } from '@oaknational/result';

import { parseThreadId, type ThreadId } from './envelope.js';
import { readTurnEvents } from './turn-events.js';
import type { CodexRun } from './turn-verdict.js';

declare const dialogueIdBrand: unique symbol;

/**
 * A dialogue's own id, known to be a lowercase slug of 1 to 64 characters.
 *
 * It names the dialogue in the cleanup map; it never reaches Codex's argv.
 * The slug admits no path separator, whitespace or option syntax.
 */
export type DialogueId = string & { readonly [dialogueIdBrand]: true };

const DIALOGUE_ID_MAX_LENGTH = 64;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isDialogueId(value: string): value is DialogueId {
  return value.length <= DIALOGUE_ID_MAX_LENGTH && SLUG_PATTERN.test(value);
}

/**
 * Accept a dialogue id only when it is a lowercase slug of 1 to 64
 * characters: lowercase letters and digits, in groups joined by single
 * hyphens.
 */
export function parseDialogueId(raw: string): Result<DialogueId, string> {
  return isDialogueId(raw)
    ? ok(raw)
    : err('a dialogue id must be a lowercase slug of 1 to 64 characters');
}

/**
 * The threads a run started: each distinct id a `thread.started` event names
 * that parses as a thread id, in the order they started, whatever the turn's
 * verdict. A killed run's partial output counts. A run that never launched
 * started none.
 *
 * Read this only for an opening turn. A resume by thread id never creates a
 * thread in Codex 0.156.1: the CLI passes the id through as given, and the
 * app server refuses a resume whose stored thread it cannot find. A stray
 * thread on resume therefore fails the turn as `thread-mismatch`, carrying
 * its id.
 */
export function threadsCreated(run: CodexRun): readonly ThreadId[] {
  if (run.kind === 'unlaunchable') {
    return [];
  }
  const threadIds = readTurnEvents(run.stdout.split('\n')).threadIds.flatMap((raw) => {
    const parsed = parseThreadId(raw);
    return parsed.ok ? [parsed.value] : [];
  });
  return [...new Set(threadIds)];
}
