import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

/**
 * The machine-local record a passing probe writes: which Codex binary, on
 * which version, passed with which envelope, when, and the verbatim
 * evidence. The gate opens a dialogue only on a record matching the current
 * binding. It guards against drift, not attack: any process running as the
 * user can write it.
 */
const passRecordSchema = z.strictObject({
  /** The version the probe passed on, as the binary reports it. */
  cliVersion: z.string().min(1),
  /** The resolved real path of the binary the probe passed on. */
  executablePath: z.string().min(1),
  /** The envelope's digest when the probe passed: 64 lowercase hex characters. */
  envelopeDigest: z.string().regex(/^[0-9a-f]{64}$/),
  /** When the probe passed, as an ISO 8601 date-time. */
  passedAt: z.iso.datetime(),
  /** The probe's verbatim evidence lines. Untrusted text, for the record only. */
  evidence: z.array(z.string()).min(1),
});

/**
 * A pass record, known to match the record schema exactly.
 */
export type PassRecord = z.infer<typeof passRecordSchema>;

/**
 * Why a value is not a pass record. It carries no detail, because the
 * detail would quote the file's own text.
 */
export interface PassRecordInvalid {
  readonly kind: 'invalid';
}

/**
 * Accept a value only when it is exactly a pass record: every field present
 * and valid, and no field the record does not define.
 *
 * @param value - The parsed contents of the record file, of unknown shape.
 */
export function parsePassRecord(value: unknown): Result<PassRecord, PassRecordInvalid> {
  const parsed = passRecordSchema.safeParse(value);
  return parsed.success ? ok(parsed.data) : err({ kind: 'invalid' });
}
