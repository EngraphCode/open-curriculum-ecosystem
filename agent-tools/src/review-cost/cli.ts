import { readFileSync } from 'node:fs';

import type { CostReport } from './cost.js';
import { currentBranch, currentRepo, isSyncPush, openPullRequestFor } from './harvest.js';
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

export interface PushedRef {
  readonly branch: string;
  readonly localSha: string;
  /** The head the remote holds; undefined when the push creates the branch. */
  readonly remoteSha: string | undefined;
}

const ALL_ZERO = /^0+$/u;

// The hook's ref lines: `<local_ref> <local_sha> <remote_ref> <remote_sha>`; the remote
// ref names the branch that receives the push; a delete has an all-zero local sha and a
// branch creation an all-zero remote sha.
export function parsePushedRefs(content: string): PushedRef[] {
  return content
    .split('\n')
    .map((line) => line.trim().split(/\s+/u))
    .filter((fields) => fields.length === 4 && !ALL_ZERO.test(fields[1] ?? ''))
    .filter((fields) => (fields[2] ?? '').startsWith('refs/heads/'))
    .map((fields) => ({
      branch: (fields[2] ?? '').slice('refs/heads/'.length),
      localSha: fields[1] ?? '',
      remoteSha: ALL_ZERO.test(fields[3] ?? '') ? undefined : fields[3],
    }));
}

const SYNC_PUSH_EVIDENCE =
  'sync push: one merge of the base that changes nothing else — outside the settlement budget (PDR-140 clause 4), passes whatever the verdict';

/** The gate's exit for one priced pull request; a sync push passes an exhausted loop. */
export function gateExit(
  result: CostReport,
  syncPush: boolean,
): { code: number; evidence: readonly string[] } {
  if (result.verdict === 'exhausted' && syncPush) {
    return { code: 0, evidence: [...result.evidence, SYNC_PUSH_EVIDENCE] };
  }
  return { code: result.verdict === 'exhausted' ? 3 : 0, evidence: result.evidence };
}

function render(
  target: { number: number },
  result: CostReport,
  evidence: readonly string[],
  json: boolean,
): string {
  if (json) {
    return `${JSON.stringify({ pr: target.number, ...result, evidence })}\n`;
  }
  const lines = evidence.map((line) => `  ${line}`).join('\n');
  return `review-cost gate: PR #${String(target.number)} ${result.verdict}\n${lines}\n`;
}

function gateOne(
  target: { number: number; repo: string },
  parsed: ParsedArgs,
  stdout: Pick<NodeJS.WriteStream, 'write'>,
  syncPush = false,
): number {
  const result = pricePullRequest({
    number: target.number,
    repo: target.repo,
    expectedReviewers: parsed.expect,
    ghPath: parsed.ghPath,
  });
  const exit = gateExit(result, syncPush);
  stdout.write(render(target, result, exit.evidence, parsed.json));
  return exit.code;
}

// A push that creates the branch is never a sync; one that moves it is a sync when the
// pushed head is one merge of the base over the head the remote holds.
function pushIsSync(ref: PushedRef): boolean {
  return ref.remoteSha !== undefined && isSyncPush(ref.remoteSha, ref.localSha);
}

function gate(parsed: ParsedArgs, stdout: Pick<NodeJS.WriteStream, 'write'>): number {
  if (parsed.refsFile !== undefined) {
    const repo = parsed.repo ?? currentRepo(parsed.ghPath);
    const codes = parsePushedRefs(readFileSync(parsed.refsFile, 'utf8')).map((ref) => {
      const number = openPullRequestFor(ref.branch, repo, parsed.ghPath);
      if (number === null) {
        stdout.write(
          `review-cost gate: ${ref.branch} has no open pull request — nothing to price\n`,
        );
        return 0;
      }
      return gateOne({ number, repo }, parsed, stdout, pushIsSync(ref));
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
  if (parsed.since !== undefined) {
    return '--since is a survey flag; the gate takes exactly one selector';
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
    stderr.write(`review-cost ${parsed.command}: operational failure — ${message}\n`);
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
