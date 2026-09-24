import { err, ok, type Result } from '@oaknational/result';

import { parsePassRecord, type PassRecord } from './pass-record.js';

/**
 * What the IO edge found where the pass record lives. `rejected` is a file
 * the edge would not read (not a regular file, not the user's, writable by
 * others, over the size cap, or not JSON); its reason is the edge's own
 * fixed text, never the file's.
 */
export type PassRecordRead =
  | { readonly kind: 'absent' }
  | { readonly kind: 'rejected'; readonly reason: string }
  | { readonly kind: 'present'; readonly value: unknown };

/**
 * The binding a dialogue would run on now: the resolved binary's version and
 * real path, and the current envelope's digest.
 */
export interface Binding {
  readonly cliVersion: string;
  readonly executablePath: string;
  readonly envelopeDigest: string;
}

type BindingField = keyof Binding;

/**
 * Why the gate stays shut. Each refusal tells the seat to run the probe;
 * none names the record's own text.
 */
export type GateRefusal =
  | { readonly kind: 'no-pass-record' }
  | { readonly kind: 'pass-record-rejected'; readonly reason: string }
  | { readonly kind: 'invalid-pass-record' }
  | { readonly kind: 'binding-mismatch'; readonly fields: readonly BindingField[] };

const BINDING_FIELDS: readonly BindingField[] = ['cliVersion', 'executablePath', 'envelopeDigest'];

/**
 * The gate's first phase: admit the pass record the edge read, or refuse.
 * It needs nothing about the binary, so it runs before the binary is
 * resolved.
 *
 * @param read - What the IO edge found where the record lives.
 */
export function admitRecord(read: PassRecordRead): Result<PassRecord, GateRefusal> {
  if (read.kind === 'absent') {
    return err({ kind: 'no-pass-record' });
  }
  if (read.kind === 'rejected') {
    return err({ kind: 'pass-record-rejected', reason: read.reason });
  }
  const parsed = parsePassRecord(read.value);
  return parsed.ok ? parsed : err({ kind: 'invalid-pass-record' });
}

/**
 * The gate's second phase: open only when the record was written for exactly
 * this binding. A CLI update, a different binary or an envelope change each
 * demands a fresh probe. Every differing field is named.
 *
 * @param record - The admitted pass record.
 * @param binding - The binding the dialogue would run on now.
 */
export function matchBinding(record: PassRecord, binding: Binding): Result<void, GateRefusal> {
  const fields = BINDING_FIELDS.filter((field) => record[field] !== binding[field]);
  return fields.length === 0 ? ok(undefined) : err({ kind: 'binding-mismatch', fields });
}
