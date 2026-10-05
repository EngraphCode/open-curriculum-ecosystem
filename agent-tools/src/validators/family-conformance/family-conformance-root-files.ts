import { err, ok, type Result } from '@oaknational/result';

import { isJsonObject } from '../../core/json.js';

/**
 * The presence of the formatter's root files, as pure readings: which
 * failure of a presence check is the file's absence and which is an input the
 * validator could not read, and how the readings collect into the set the
 * formatter check consumes.
 *
 * @packageDocumentation
 */

/** One root file's presence reading: present, absent, or unreadable. */
export type RootFilePresence = Result<'absent' | 'present', Error>;

/**
 * Classifies a failed presence check on a root file. Only `ENOENT` is the
 * file's absence, the expected state for a forbidden formatter file; any
 * other failure (a permission refusal, an I/O error) is an input the
 * validator could not read and surfaces as such, since reading it as absence
 * would let an unreadable forbidden file pass the formatter check.
 *
 * @param name - The root file whose presence was checked.
 * @param failure - What the presence check threw.
 * @returns `absent` for `ENOENT`; otherwise the failure as the validator's input error.
 */
export function classifyRootFileAbsence(name: string, failure: unknown): Result<'absent', Error> {
  if (isJsonObject(failure) && failure.code === 'ENOENT') {
    return ok('absent');
  }
  const reason = failure instanceof Error ? failure.message : String(failure);
  return err(new Error(`${name} could not be checked for presence at the root: ${reason}`));
}

/**
 * Collects the present root files from each name's reading, in the names'
 * order; the first unreadable file ends the collection as the validator's
 * input error.
 *
 * @param names - The root file names, in the order their readings were taken.
 * @param readings - One presence reading per name.
 * @returns The names read as present, or the first reading that failed.
 */
export function collectPresentRootFiles(
  names: readonly string[],
  readings: readonly RootFilePresence[],
): Result<ReadonlySet<string>, Error> {
  const present = new Set<string>();
  for (const [index, reading] of readings.entries()) {
    if (!reading.ok) {
      return reading;
    }
    const name = names[index];
    if (reading.value === 'present' && name !== undefined) {
      present.add(name);
    }
  }
  return ok(present);
}
