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

/**
 * One line of the dialogues' cleanup map: a thread an opening turn started,
 * the dialogue it belongs to, and when the turn ran, as an ISO 8601 UTC
 * instant. The map is the owner's record of which threads to delete.
 */
export interface CleanupRow {
  readonly dialogue_id: DialogueId;
  readonly thread_id: ThreadId;
  readonly created_at: string;
}

/**
 * Threads a turn started whose cleanup rows could not be written. It fails
 * the turn, even one that counted, so no thread is left without a row
 * unnoticed; the caller reports the ids for cleanup by hand.
 */
export interface CleanupRowUnwritten {
  readonly kind: 'cleanup-row-unwritten';
  /** Only the threads whose rows were not written. */
  readonly threadIds: readonly [ThreadId, ...ThreadId[]];
  /** Why the first unwritten row was refused. */
  readonly reason: string;
}

/**
 * Append one row per thread to the cleanup map, trying every row even after
 * one is refused.
 *
 * @param dialogueId - The dialogue the threads belong to.
 * @param threadIds - The threads the turn started.
 * @param createdAt - When the turn ran, as an ISO 8601 UTC instant.
 * @param appendCleanupRow - Appends one row to the cleanup map, or says why not.
 */
export function appendCleanupRows(
  dialogueId: DialogueId,
  threadIds: readonly ThreadId[],
  createdAt: string,
  appendCleanupRow: (row: CleanupRow) => Result<void, string>,
): Result<void, CleanupRowUnwritten> {
  const refused = threadIds.flatMap((threadId) => {
    const appended = appendCleanupRow({
      dialogue_id: dialogueId,
      thread_id: threadId,
      created_at: createdAt,
    });
    return appended.ok ? [] : [{ threadId, reason: appended.error }];
  });
  const [first, ...rest] = refused;
  if (first === undefined) {
    return ok(undefined);
  }
  return err({
    kind: 'cleanup-row-unwritten',
    threadIds: [first.threadId, ...rest.map((row) => row.threadId)],
    reason: first.reason,
  });
}
