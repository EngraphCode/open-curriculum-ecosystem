import { readFileSync } from 'node:fs';

import type { CostReport } from './cost.js';
import { currentBranch, currentRepo, openPullRequestFor } from './harvest.js';
import { pricePullRequest } from './price.js';
import { runSurvey } from './survey.js';
import { parseArgs, selectors, USAGE, type ParsedArgs } from './args.js';

/**
 * `review-cost gate` — the pre-push guard: the review loop's cost against the
 * budget the pull request declares. Exit 0 within budget, warning or
 * converging; exit 3 (typed refusal, BUDGET-EXHAUSTED) when exhausted; exit 1
 * on an operational failure; exit 2 on usage. `--branch` resolves the open
 * pull request of the current branch and passes silently when there is none
 * (the first push opens it).
 */

export interface ReviewCostCliInput {
  readonly args: readonly string[];
  readonly stdout?: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr?: Pick<NodeJS.WriteStream, 'write'>;
}

function resolveTarget(parsed: ParsedArgs): { number: number; repo: string } | null {
  const repo = parsed.repo ?? currentRepo(parsed.ghPath);
  if (parsed.pr !== undefined) {
    return { number: parsed.pr, repo };
  }
  const number = openPullRequestFor(currentBranch(), repo, parsed.ghPath);
  return number === null ? null : { number, repo };
}

// The hook's ref lines: `<local_ref> <local_sha> <remote_ref> <remote_sha>`; the remote
// ref names the branch that receives the push; a delete has an all-zero local sha.
function pushedBranches(refsFile: string): string[] {
  return readFileSync(refsFile, 'utf8')
    .split('\n')
    .map((line) => line.trim().split(/\s+/u))
    .filter((fields) => fields.length === 4 && !/^0+$/u.test(fields[1] ?? ''))
    .map((fields) => fields[2] ?? '')
    .filter((ref) => ref.startsWith('refs/heads/'))
    .map((ref) => ref.slice('refs/heads/'.length));
}

function render(target: { number: number }, result: CostReport, json: boolean): string {
  if (json) {
    return `${JSON.stringify({ pr: target.number, ...result })}\n`;
  }
  const lines = result.evidence.map((line) => `  ${line}`).join('\n');
  return `review-cost gate: PR #${String(target.number)} ${result.verdict}\n${lines}\n`;
}

function gateOne(
  target: { number: number; repo: string },
  parsed: ParsedArgs,
  stdout: Pick<NodeJS.WriteStream, 'write'>,
): number {
  const result = pricePullRequest({
    number: target.number,
    repo: target.repo,
    expectedReviewers: parsed.expect,
    ghPath: parsed.ghPath,
  });
  stdout.write(render(target, result, parsed.json));
  return result.verdict === 'exhausted' ? 3 : 0;
}

function gate(parsed: ParsedArgs, stdout: Pick<NodeJS.WriteStream, 'write'>): number {
  if (parsed.refsFile !== undefined) {
    const repo = parsed.repo ?? currentRepo(parsed.ghPath);
    const codes = pushedBranches(parsed.refsFile).map((branch) => {
      const number = openPullRequestFor(branch, repo, parsed.ghPath);
      if (number === null) {
        stdout.write(`review-cost gate: ${branch} has no open pull request — nothing to price\n`);
        return 0;
      }
      return gateOne({ number, repo }, parsed, stdout);
    });
    return codes.includes(3) ? 3 : 0;
  }
  const target = resolveTarget(parsed);
  if (target === null) {
    stdout.write('review-cost gate: no open pull request for this branch — nothing to price\n');
    return 0;
  }
  return gateOne(target, parsed, stdout);
}

function usageError(parsed: ParsedArgs): string | undefined {
  if (parsed.error !== undefined) {
    return parsed.error;
  }
  if (parsed.command === 'survey') {
    return parsed.since === undefined || selectors(parsed) > 0
      ? 'survey takes --since <YYYY-MM-DD> and no selector'
      : undefined;
  }
  return selectors(parsed) === 1 ? undefined : 'pass exactly one of --pr, --branch, --refs-file';
}

function guarded(
  parsed: ParsedArgs,
  stdout: Pick<NodeJS.WriteStream, 'write'>,
  stderr: Pick<NodeJS.WriteStream, 'write'>,
): number {
  try {
    return parsed.command === 'survey'
      ? runSurvey({
          since: parsed.since ?? '',
          repo: parsed.repo,
          expectedReviewers: parsed.expect,
          ghPath: parsed.ghPath,
          json: parsed.json,
          stdout,
        })
      : gate(parsed, stdout);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    stderr.write(`review-cost gate: operational failure — ${message}\n`);
    return 1;
  }
}

export function runReviewCostCli(input: ReviewCostCliInput): number {
  const stdout = input.stdout ?? process.stdout;
  const stderr = input.stderr ?? process.stderr;
  const parsed = parseArgs(input.args);
  if (parsed.help) {
    stdout.write(`${USAGE}\n`);
    return 0;
  }
  const error = usageError(parsed);
  if (error !== undefined) {
    stderr.write(`review-cost: ${error}\n${USAGE}\n`);
    return 2;
  }
  return guarded(parsed, stdout, stderr);
}
