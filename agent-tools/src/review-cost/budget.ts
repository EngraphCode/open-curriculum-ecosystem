/**
 * The declared settlement-push budget, read from the pull request
 * description's intake line (`budget — 2`, `budget: 2`), as the PR template
 * records it. Undeclared reads as PDR-132's two.
 */

const DEFAULT_BUDGET_PUSHES = 2;

const BUDGET_LINE = /budget\s*[—–:-]\s*(\d{1,2})\b/iu;

interface DeclaredBudget {
  readonly pushes: number;
  readonly declared: boolean;
}

export function readBudget(body: string): DeclaredBudget {
  const match = BUDGET_LINE.exec(body);
  if (match === null) {
    return { pushes: DEFAULT_BUDGET_PUSHES, declared: false };
  }
  return { pushes: Number(match[1]), declared: true };
}
