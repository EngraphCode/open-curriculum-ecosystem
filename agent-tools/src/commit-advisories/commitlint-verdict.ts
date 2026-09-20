/**
 * How `check-commit-message` asks commitlint for a verdict and reads the answer.
 *
 * @remarks
 * Pure: no process is spawned here. The caller spawns commitlint with
 * {@link commitlintArgs} and maps its exit status with
 * {@link exitCodeForCommitlintStatus}. Kept apart from the CLI's IO so the
 * two decisions that make a warning fail (strict mode is asked for; a strict
 * warning status is read as a violation) are each held by a test.
 */

/** commitlint's lint verdicts: 1 errors (non-strict), 2 warnings and 3 errors (strict). */
const COMMITLINT_VIOLATION_STATUSES: readonly number[] = [1, 2, 3];

/**
 * This tool's exit code for a commitlint exit status.
 *
 * @remarks
 * Strict mode exits 2 for warnings and 3 for errors (1 for errors without it).
 * This tool reserves 2 for "no verdict", so a lint verdict maps to 1, and
 * anything that is not a verdict maps to 2: a commitlint that never ran
 * (`null`), or a status outside the lint range such as a missing config.
 */
export function exitCodeForCommitlintStatus(status: number | null): 0 | 1 | 2 {
  if (status === 0) {
    return 0;
  }
  return status !== null && COMMITLINT_VIOLATION_STATUSES.includes(status) ? 1 : 2;
}

/**
 * The arguments that lint one message file: strict mode, so a warning is a
 * verdict against the message exactly as in `.husky/commit-msg`.
 */
export function commitlintArgs(messageFile: string): readonly string[] {
  return ['exec', 'commitlint', '--strict', '--edit', messageFile];
}
