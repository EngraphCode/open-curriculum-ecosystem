import { currentRepo, pullRequestsSince } from './harvest.js';
import { pricePullRequest } from './price.js';

/**
 * `review-cost survey`: every pull request updated since a date, any state,
 * priced as the gate prices it — one line per pull request, a table for the
 * review-cost ledger the wrap appends to, never a refusal. Post-merge reviews
 * and comments are in the count: the recording is read at survey time.
 */

export interface SurveyInput {
  readonly since: string;
  readonly repo?: string;
  readonly expectedReviewers: readonly string[];
  readonly ghPath?: string;
  readonly json: boolean;
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
}

export function runSurvey(input: SurveyInput): number {
  const repo = input.repo ?? currentRepo(input.ghPath);
  const rows = pullRequestsSince(input.since, repo, input.ghPath).map((pull) => ({
    pr: pull.number,
    state: pull.state,
    mergedAt: pull.mergedAt,
    title: pull.title,
    ...pricePullRequest({
      number: pull.number,
      repo,
      expectedReviewers: input.expectedReviewers,
      ghPath: input.ghPath,
    }),
  }));
  if (input.json) {
    input.stdout.write(`${JSON.stringify(rows)}\n`);
    return 0;
  }
  input.stdout.write(
    '| PR | state | rounds | settlement cost | budget | verdict | round costs |\n',
  );
  input.stdout.write('| --- | --- | --- | --- | --- | --- | --- |\n');
  for (const row of rows) {
    const costs = row.rounds
      .map((round) => `${round.head.slice(0, 9)} ${String(round.cost)}`)
      .join(', ');
    input.stdout.write(
      `| #${String(row.pr)} | ${row.state} | ${String(row.rounds.length)} | ${String(row.total)} | ${String(row.budget)} (${String(row.budgetPushes)} pushes) | ${row.verdict} | ${costs} |\n`,
    );
  }
  return 0;
}
