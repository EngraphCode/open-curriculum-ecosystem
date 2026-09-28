/**
 * The smoke suite, derived from the directory rather than listed.
 *
 * A hand-kept chain of `smoke:*` scripts in a package manifest drifts
 * silently: a new `smoke-tests/*.smoke.ts` that nobody adds to the chain is
 * never run by the gate and reads as covered. The suite is therefore every
 * file in the smoke directory that carries the suffix, in a stable order, and
 * the gate's verdict is the conjunction of every run.
 *
 * Pure: the discovery and the summary map values to values; the composition
 * root in `bin/run-smoke-tests.ts` owns the directory read and the spawns.
 *
 * @packageDocumentation
 */

/** The suffix a smoke test file carries. */
const SMOKE_TEST_SUFFIX = '.smoke.ts';

/**
 * The smoke test files among a directory's entries, in a stable order.
 *
 * @param entries - The directory's entry names.
 * @returns The entries ending in the smoke suffix, sorted.
 */
export function smokeTestFiles(entries: readonly string[]): readonly string[] {
  return entries.filter((entry) => entry.endsWith(SMOKE_TEST_SUFFIX)).toSorted(byCodePoint);
}

/** Code-point order: the same on every machine, whatever its locale. */
function byCodePoint(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  return left > right ? 1 : 0;
}

/**
 * One smoke test's outcome: an exit status, or the signal that killed it
 * (`status` null). A signal death is never folded into an exit code, so the
 * report distinguishes a crash from a finding.
 */
export interface SmokeRunResult {
  readonly file: string;
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
}

/** The suite's verdict and the lines that report it. */
export interface SmokeSuiteSummary {
  readonly ok: boolean;
  readonly lines: readonly string[];
}

function passed(result: SmokeRunResult): boolean {
  return result.status === 0;
}

function describeEnd(result: SmokeRunResult): string {
  if (result.signal !== null) {
    return `killed by ${result.signal}`;
  }
  return `exit ${String(result.status ?? 1)}`;
}

/**
 * Summarise a suite run: one line per smoke and a verdict line. The suite is
 * green only when every smoke exited 0; an empty suite is a defect, never a
 * pass, because a gate over nothing proves nothing.
 *
 * @param results - Every smoke's outcome, in run order.
 * @returns The verdict and its report lines.
 */
export function summariseSmokeRun(results: readonly SmokeRunResult[]): SmokeSuiteSummary {
  if (results.length === 0) {
    return {
      ok: false,
      lines: ['smoke suite: no smoke tests found — an empty suite is not a pass'],
    };
  }
  const failed = results.filter((result) => !passed(result));
  const lines = results.map(
    (result) => `smoke ${passed(result) ? 'ok  ' : 'FAIL'} ${result.file} (${describeEnd(result)})`,
  );
  const verdict =
    failed.length === 0
      ? `smoke suite: ${String(results.length)} passed`
      : `smoke suite: ${String(failed.length)} of ${String(results.length)} failed`;
  return { ok: failed.length === 0, lines: [...lines, verdict] };
}
