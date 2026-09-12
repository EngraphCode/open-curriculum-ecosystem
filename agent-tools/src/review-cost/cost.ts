/**
 * The review cost function — the seat-side guard the owner asked for after
 * PR #139 (2026-09-12: seven settlement pushes against a declared budget of
 * two, 98 comments, every finding correct, none exercised by a recorded
 * input, stopped only by the owner). An on/off round count would have fired
 * too; a cost function fires EARLIER the more expensive the loop is: more
 * findings, more comment volume, bigger and more frequent pushes, and pushes
 * that keep touching the same files (the signature of sampling one surface)
 * all raise a round's cost. The verdict is deterministic — thresholds, never
 * probabilities — because an agent that rolls dice at a gate is a timing
 * dependence. Every weight lives in the policy, calibrated against recorded
 * loops, never in the code path.
 */

export interface RoundMeasure {
  readonly head: string;
  /** Findings raised in reviews bound to this head: threads plus body items. */
  readonly findings: number;
  /** Reviewer and seat comment characters on this head's threads and review bodies. */
  readonly commentChars: number;
  /** Lines changed by the push that opened this round. */
  readonly pushLines: number;
  /** Files changed by that push. */
  readonly pushFiles: number;
  /** Share of this push's files the previous push also touched, 0..1 (0 for the opening round). */
  readonly relatedness: number;
  /** Hours since the previous reviewed head; null for the opening round. */
  readonly hoursSincePrevious: number | null;
}

export interface CostPolicy {
  readonly perFinding: number;
  readonly perThousandChars: number;
  readonly perHundredLines: number;
  readonly perFile: number;
  /** Multiplier weight on relatedness: cost × (1 + weight × relatedness). */
  readonly relatednessWeight: number;
  /** Multiplier weight on reactive pushing: cost × (1 + weight × max(0, 1 − hours / reactiveHours)). */
  readonly reactiveWeight: number;
  readonly reactiveHours: number;
  /** The fixed cost of any settlement round (a review run, a harvest, a disposition pass), before its findings. */
  readonly baseRound: number;
  /** The cost one settlement push is budgeted; the budget is declared pushes × this. */
  readonly unitRound: number;
  /** The share of the budget at which the verdict turns to warn. */
  readonly warnShare: number;
  /** The ratio the latest round must fall to, against the round before, to earn the one converging extension. */
  readonly convergingRatio: number;
}

export const DEFAULT_POLICY: CostPolicy = {
  perFinding: 0.5,
  perThousandChars: 0.2,
  perHundredLines: 0.3,
  perFile: 0.1,
  relatednessWeight: 1,
  reactiveWeight: 1,
  reactiveHours: 1,
  baseRound: 3,
  unitRound: 20,
  warnShare: 0.5,
  convergingRatio: 0.5,
};

type CostVerdict = 'within' | 'warn' | 'converging' | 'exhausted';

interface RoundCost {
  readonly head: string;
  readonly cost: number;
}

export interface CostReport {
  readonly rounds: readonly RoundCost[];
  readonly total: number;
  readonly budget: number;
  readonly budgetPushes: number;
  readonly verdict: CostVerdict;
  readonly evidence: readonly string[];
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** One round's cost under the policy. */
export function roundCost(measure: RoundMeasure, policy: CostPolicy): number {
  const base =
    policy.baseRound +
    policy.perFinding * measure.findings +
    policy.perThousandChars * (measure.commentChars / 1000) +
    policy.perHundredLines * (measure.pushLines / 100) +
    policy.perFile * measure.pushFiles;
  const related = 1 + policy.relatednessWeight * measure.relatedness;
  const hours = measure.hoursSincePrevious;
  const reactive =
    hours === null ? 1 : 1 + policy.reactiveWeight * Math.max(0, 1 - hours / policy.reactiveHours);
  return round2(base * related * reactive);
}

// The one converging extension: the budget was crossed by THIS round, and this
// round cost no more than the converging ratio of the round before it.
function converging(costs: readonly number[], budget: number, policy: CostPolicy): boolean {
  let running = 0;
  let crossedAt = -1;
  costs.forEach((cost, index) => {
    running += cost;
    if (crossedAt === -1 && running >= budget) {
      crossedAt = index;
    }
  });
  const latest = costs.at(-1);
  const previous = costs.at(-2);
  return (
    crossedAt === costs.length - 1 &&
    latest !== undefined &&
    previous !== undefined &&
    latest <= policy.convergingRatio * previous
  );
}

function verdictFor(
  total: number,
  budget: number,
  costs: readonly number[],
  policy: CostPolicy,
): CostVerdict {
  if (total >= budget) {
    return converging(costs, budget, policy) ? 'converging' : 'exhausted';
  }
  return total >= budget * policy.warnShare ? 'warn' : 'within';
}

/**
 * The report over the reviewed rounds in branch order. The opening round
 * measures the pull request's size, not the loop's waste, so it is priced
 * and shown but never charged; the settlement rounds after it accrue against
 * `budgetPushes` × the policy's unit.
 */
export function reviewCost(
  rounds: readonly RoundMeasure[],
  budgetPushes: number,
  policy: CostPolicy = DEFAULT_POLICY,
): CostReport {
  const costs = rounds.map((measure) => ({ head: measure.head, cost: roundCost(measure, policy) }));
  const settlement = costs.slice(1).map((entry) => entry.cost);
  const total = round2(settlement.reduce((sum, cost) => sum + cost, 0));
  const budget = round2(budgetPushes * policy.unitRound);
  const verdict = verdictFor(total, budget, settlement, policy);
  const evidence = [
    `rounds ${String(costs.length)} (opening plus ${String(Math.max(0, costs.length - 1))} settlement), budget ${String(budgetPushes)} settlement pushes`,
    `settlement cost ${String(total)} of ${String(budget)}; rounds: ${costs.map((entry) => `${entry.head.slice(0, 9)} ${String(entry.cost)}`).join(', ')}`,
    ...(verdict === 'exhausted'
      ? [
          'BUDGET-EXHAUSTED: no further settlement push; every remaining finding is dispositioned without a cure, or the budget is raised on the pull request by the owner',
        ]
      : []),
    ...(verdict === 'converging'
      ? [
          'over budget but converging: this round crossed it at no more than half the round before — one more push',
        ]
      : []),
  ];
  return { rounds: costs, total, budget, budgetPushes, verdict, evidence };
}
