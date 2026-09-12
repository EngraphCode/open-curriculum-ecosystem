import type { Tally, TallyRow } from './rows.js';

/**
 * The step-back verdict exactly as the pr-lifecycle state machine's item 2
 * states it: over the settled cure-worthy counts of the current epoch,
 * `c[n] >= c[n-1] AND c[n-1] >= c[n-2]` or four settled rounds, either arm
 * firing only while the latest settled count is non-zero; a settled round at
 * cure-worthy zero is the terminal success state and takes precedence; a
 * push the seat marks as the class fix opens a new epoch. A latest round the
 * machine cannot count — a signed disposition with no marker, or findings
 * with no signed disposition — is surfaced as such, never read as zero.
 */

type VerdictKind =
  | 'terminal-success'
  | 'step-back'
  | 'converging'
  | 'open'
  | 'manual-tally-required'
  | 'no-settled-round';

export interface Verdict {
  readonly kind: VerdictKind;
  /** 1-based; increments at each class-fix head. */
  readonly epoch: number;
  /** The settled cure-worthy counts of the current epoch, in branch order. */
  readonly counts: readonly number[];
  readonly evidence: readonly string[];
}

export interface VerdictOptions {
  /** Heads (full or prefix) the seat marked as class-fix pushes; each opens a new epoch at its round. */
  readonly classFixHeads?: readonly string[];
}

function isClassFix(row: TallyRow, options: VerdictOptions): boolean {
  return (options.classFixHeads ?? []).some((head) => row.head.startsWith(head));
}

function currentEpoch(
  rows: readonly TallyRow[],
  options: VerdictOptions,
): { epoch: number; rows: TallyRow[] } {
  let epoch = 1;
  let current: TallyRow[] = [];
  for (const row of rows) {
    if (isClassFix(row, options) && current.length > 0) {
      epoch += 1;
      current = [];
    }
    current.push(row);
  }
  return { epoch, rows: current };
}

const at = (counts: readonly number[], fromEnd: number): number =>
  counts[counts.length - fromEnd] ?? 0;

// `c[n] >= c[n-1] AND c[n-1] >= c[n-2]` — two consecutive non-decreasing transitions.
function nonDecreasingTwice(counts: readonly number[]): boolean {
  return counts.length >= 3 && at(counts, 1) >= at(counts, 2) && at(counts, 2) >= at(counts, 3);
}

function stepBackArmed(counts: readonly number[]): boolean {
  if (at(counts, 1) === 0) {
    return false;
  }
  return nonDecreasingTwice(counts) || counts.length >= 4;
}

function uncountedEvidence(rows: readonly TallyRow[]): string[] {
  return rows
    .filter((row) => row.undispositioned > 0 || row.manual > 0)
    .map(
      (row) =>
        `${row.head.slice(0, 9)}: ${row.undispositioned} undispositioned, ${row.manual} manual — cure-worthy ${row.cureWorthy} is a floor`,
    );
}

/** The verdict over settled rows alone (pure over the row shape; the tally builder supplies them). */
export function verdictFromRows(rows: readonly TallyRow[], options: VerdictOptions): Verdict {
  const { epoch, rows: epochRows } = currentEpoch(rows, options);
  const counts = epochRows.map((row) => row.cureWorthy);
  const latest = epochRows.at(-1);
  const evidence = uncountedEvidence(rows);
  if (latest === undefined) {
    return { kind: 'no-settled-round', epoch, counts, evidence };
  }
  if (latest.manual > 0) {
    return { kind: 'manual-tally-required', epoch, counts, evidence };
  }
  if (latest.undispositioned > 0) {
    return { kind: 'open', epoch, counts, evidence };
  }
  if (latest.cureWorthy === 0) {
    return { kind: 'terminal-success', epoch, counts, evidence };
  }
  return { kind: stepBackArmed(counts) ? 'step-back' : 'converging', epoch, counts, evidence };
}

/** The verdict over a built tally: its settled rows, in branch order. */
export function verdict(tally: Tally, options: VerdictOptions): Verdict {
  return verdictFromRows(tally.rows, options);
}
