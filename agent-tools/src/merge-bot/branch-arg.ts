import { err, ok, type Result } from '@oaknational/result';

import type { PathExists } from '../core/path-exists.js';
import { printable } from '../pr-watch/printable.js';
import { isLegalBranchName, realRefFormatOracle, type RefFormatOracle } from './ref-format.js';

/**
 * The `--branch <name>` contract of `merge-bot push`: given exactly once,
 * never flag-shaped, and legal by git's own ref grammar (asked of git through
 * the oracle).
 */

/**
 * The default branch names `merge-bot push` never pushes to: the
 * never-commit-to-main rule as behaviour. It compares them in any case,
 * because a case-insensitive filesystem resolves `Main` to `main`.
 */
export const DEFAULT_BRANCH_NAMES: ReadonlySet<string> = new Set(['main', 'master']);

/** The seams the branch check will construct for itself when not supplied one. */
export interface BranchArgSeams {
  readonly refFormatOracle?: RefFormatOracle;
  /** Existence probe for locating the git binary the default oracle asks. */
  readonly pathExists?: PathExists;
}

/**
 * A value that reads as a flag is a forgotten `--branch` argument, never a
 * branch anyone meant: refuse it rather than acting on a branch literally
 * called `--json`. This guard is about argv INTENT; git's ref grammar has no
 * opinion here (the oracle passes the full ref name `refs/heads/--json`), and
 * legality is its question, asked separately.
 */
function readsAsFlag(value: string): boolean {
  return value.startsWith('-');
}

/**
 * Read one `--branch` value. The oracle enters HERE rather than at the
 * parser's head, so an argv with no `--branch` never reaches for a git binary
 * at all. Constructing it can FAIL (a machine with no trusted git has no
 * oracle to ask), and that failure is returned, never thrown.
 *
 * @param current - the branch already read, if any: a repeat is refused, so
 *   which branch a command acts on is never decided by argv order.
 * @param usage - the command's usage text, appended to a refusal.
 */
export function readBranchArg(
  current: string | undefined,
  value: string | undefined,
  seams: BranchArgSeams,
  usage: string,
): Result<string, Error> {
  if (current !== undefined) {
    return err(new Error('--branch given more than once — pass it exactly once'));
  }
  const oracle =
    seams.refFormatOracle === undefined
      ? realRefFormatOracle(seams.pathExists)
      : ok(seams.refFormatOracle);
  if (!oracle.ok) {
    return err(oracle.error);
  }
  if (value === undefined || readsAsFlag(value) || !isLegalBranchName(value, oracle.value)) {
    return err(
      new Error(`--branch needs a git branch name, got "${printable(value ?? '')}"\n${usage}`),
    );
  }
  return ok(value);
}
