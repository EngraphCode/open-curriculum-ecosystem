import assert from 'node:assert/strict';

import {
  commandEvents,
  recordsOf,
  selectAll,
  type TestRecord,
} from '../../rollout/test-helpers/rollout-records.js';
import observedExec from '../fixtures/observed-seat-exec-0-157-1.json';

/**
 * A seat-shaped rollout recorded on codex-cli 0.157.1 on 2026-09-26 by one
 * sandboxed `codex exec` run (workspace-write, stdin closed, no full-access
 * flag) in Paginated history mode, then projected for the reader's tests:
 * every record kept in order with its type, payload type and item type; for
 * `CommandExecution` items the harness argv, `status`, `source`, `exit_code`
 * and the event's `turn_id` and `thread_id`; tool calls keep their `name`
 * and `call_id`, tool outputs their harness text with the machine path
 * replaced. Ids are fixed UUIDs; `cwd`, program text, stdout and every other
 * field were dropped.
 *
 * The run: a throwaway repository, four plain commands through code mode.
 * Three ran and left items; the fourth (a write under the read-only `.git`)
 * was denied at startup and returned into the program, leaving none.
 *
 * The run carries no interaction (`source: unified_exec_interaction`,
 * `interaction_input`) and no declined item: those shapes are source-read and
 * exercised by edited copies only.
 */

/** A fresh copy of the four-command seat rollout. */
export function execRecords(): TestRecord[] {
  return recordsOf(observedExec);
}

/** Every `task_started` event, in order; at least one, or the fixture is wrong. */
export function turnStarts(recordsToRead: readonly TestRecord[]): TestRecord[] {
  const starts = selectAll(recordsToRead, 'event_msg', 'task_started');
  assert(starts.length > 0, 'the fixture starts no turn');
  return starts;
}

/** Every `CommandExecution` item-completed event, in order; at least one, or the fixture is wrong. */
export function commandItems(recordsToRead: readonly TestRecord[]): TestRecord[] {
  const items = commandEvents(recordsToRead);
  assert(items.length > 0, 'the fixture recorded no command');
  return items;
}
