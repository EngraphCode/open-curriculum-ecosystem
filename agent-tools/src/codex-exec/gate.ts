import { err, mapErr, ok, type Result } from '@oaknational/result';

import { BINDING_FIELDS, parsePassRecord, type Binding, type PassRecord } from './pass-record.js';

/**
 * Why the IO edge would not read the record file, in the edge's own terms.
 * A closed set, never the file's text, since a parser's message can quote
 * the file, and the file holds the interlocutor's untrusted evidence.
 */
export type PassRecordRejection =
  | 'not-a-regular-file'
  | 'not-owned-by-user'
  | 'writable-by-others'
  | 'over-size-cap'
  | 'not-json'
  | 'unreadable';

/**
 * What the IO edge found where the pass record lives: nothing, a file it
 * would not read, or the parsed contents of one it did. A present value
 * carries the record's evidence, untrusted interlocutor text, so a read is
 * never logged.
 */
export type PassRecordRead =
  | { readonly kind: 'absent' }
  | { readonly kind: 'rejected'; readonly reason: PassRecordRejection }
  | { readonly kind: 'present'; readonly value: unknown };

type BindingField = (typeof BINDING_FIELDS)[number];

/**
 * The `codex` binary as resolved once for a call: the version it reports and
 * its real path, named as the pass record names them. One resolution serves
 * the gate, the spawn and, for the probe, the record it writes, so an updater
 * swapping the release link mid-call cannot split them.
 */
export type ResolvedBinary = Pick<Binding, 'cliVersion' | 'executablePath'>;

/**
 * Why the gate's first phase refused: no record, a record file the edge
 * would not read, or a value that is not a pass record.
 */
export type RecordRefusal =
  | { readonly kind: 'no-pass-record' }
  | { readonly kind: 'pass-record-rejected'; readonly reason: PassRecordRejection }
  | { readonly kind: 'invalid-pass-record' };

/**
 * Why the gate's second phase refused: the record was written for another
 * binding. Every differing field is named.
 */
export interface BindingMismatch {
  readonly kind: 'binding-mismatch';
  readonly fields: readonly [BindingField, ...BindingField[]];
}

/**
 * Why the gate stays shut. Each refusal tells the seat to run the probe;
 * none names the record's own text.
 */
export type GateRefusal = RecordRefusal | BindingMismatch;

/**
 * The gate's first phase: admit the pass record the edge read, or refuse.
 * It needs nothing about the binary, so it runs before the binary is
 * resolved.
 *
 * @param read - What the IO edge found where the record lives.
 */
export function admitRecord(read: PassRecordRead): Result<PassRecord, RecordRefusal> {
  if (read.kind === 'absent') {
    return err({ kind: 'no-pass-record' });
  }
  if (read.kind === 'rejected') {
    return err({ kind: 'pass-record-rejected', reason: read.reason });
  }
  return mapErr(parsePassRecord(read.value), () => ({ kind: 'invalid-pass-record' }));
}

/**
 * The gate's second phase: open only when the record was written for exactly
 * this binding. A CLI update, a different binary or an envelope change each
 * demands a fresh probe.
 *
 * @param record - The admitted pass record.
 * @param binding - The binding the dialogue would run on now.
 */
export function matchBinding(record: PassRecord, binding: Binding): Result<void, BindingMismatch> {
  const fields = BINDING_FIELDS.filter((field) => record[field] !== binding[field]);
  return isNonEmpty(fields) ? err({ kind: 'binding-mismatch', fields }) : ok(undefined);
}

function isNonEmpty<T>(items: readonly T[]): items is readonly [T, ...T[]] {
  return items.length > 0;
}
