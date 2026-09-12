import { readBudget } from './budget.js';
import { DEFAULT_POLICY, reviewCost, type CostReport } from './cost.js';
import {
  currentBranch,
  currentRepo,
  gitDiffStat,
  openPullRequestFor,
  readLiveHarvest,
} from './harvest.js';
import { measureRounds } from './measure.js';

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

/** The repository's automatic reviewers — the declared expected set when `--expect` is absent. */
const DEFAULT_EXPECTED_REVIEWERS = ['copilot-pull-request-reviewer', 'chatgpt-codex-connector'];

interface ParsedArgs {
  pr?: number;
  branch: boolean;
  repo?: string;
  expect: string[];
  json: boolean;
  help: boolean;
  ghPath?: string;
  error?: string;
}

const USAGE = [
  'review-cost gate (--pr <number> | --branch) [--repo <owner/repo>] [--expect <login>]... [--json] [--gh <path>]',
  "  The review loop's cost against the settlement-push budget the pull request declares",
  '  (`budget — N` in its description; two when undeclared). Every reviewed head is a round;',
  '  its cost rises with findings, comment volume, push size, files, pushes to the same files',
  '  and pushes within the hour (weights: DEFAULT_POLICY in cost.ts).',
  '  Exit 0 within budget, warn or converging; exit 3 BUDGET-EXHAUSTED; exit 1 operational.',
  '  --branch: the open pull request of the current branch; passes when there is none.',
].join('\n');

const FLAG_HANDLERS: Readonly<
  Record<string, (parsed: ParsedArgs, value: () => string | undefined) => void>
> = {
  '--pr': (parsed, value) => {
    parsed.pr = Number(value());
  },
  '--branch': (parsed) => {
    parsed.branch = true;
  },
  '--repo': (parsed, value) => {
    parsed.repo = value();
  },
  '--expect': (parsed, value) => {
    parsed.expect.push(value() ?? '');
  },
  '--json': (parsed) => {
    parsed.json = true;
  },
  '--gh': (parsed, value) => {
    parsed.ghPath = value();
  },
  '--help': (parsed) => {
    parsed.help = true;
  },
  '-h': (parsed) => {
    parsed.help = true;
  },
};

function parseArgs(args: readonly string[]): ParsedArgs {
  const parsed: ParsedArgs = { branch: false, expect: [], json: false, help: false };
  const rest = [...args];
  if (rest.shift() !== 'gate') {
    parsed.error = 'expected the `gate` subcommand';
  }
  while (rest.length > 0) {
    const flag = rest.shift() ?? '';
    const handler = Object.hasOwn(FLAG_HANDLERS, flag) ? FLAG_HANDLERS[flag] : undefined;
    if (handler === undefined) {
      parsed.error = `unknown argument: ${flag}`;
    } else {
      handler(parsed, () => rest.shift());
    }
  }
  return parsed;
}

function resolveTarget(parsed: ParsedArgs): { number: number; repo: string } | null {
  const repo = parsed.repo ?? currentRepo(parsed.ghPath);
  if (parsed.pr !== undefined && Number.isInteger(parsed.pr) && parsed.pr > 0) {
    return { number: parsed.pr, repo };
  }
  const number = openPullRequestFor(currentBranch(), repo, parsed.ghPath);
  return number === null ? null : { number, repo };
}

function report(target: { number: number; repo: string }, parsed: ParsedArgs): CostReport {
  const live = readLiveHarvest({ number: target.number, repo: target.repo, ghPath: parsed.ghPath });
  const rounds = measureRounds({
    harvest: live.harvest,
    expectedReviewers: parsed.expect.length > 0 ? parsed.expect : DEFAULT_EXPECTED_REVIEWERS,
    // The opening push is measured from the parent of the pull request's first commit,
    // which holds for an open and for a merged pull request alike.
    baseRef: `${live.harvest.commits[0]?.oid ?? live.harvest.headRefOid}^`,
    diff: gitDiffStat,
  });
  return reviewCost(rounds, readBudget(live.body).pushes, DEFAULT_POLICY);
}

function render(target: { number: number }, result: CostReport, json: boolean): string {
  if (json) {
    return `${JSON.stringify({ pr: target.number, ...result })}\n`;
  }
  const lines = result.evidence.map((line) => `  ${line}`).join('\n');
  return `review-cost gate: PR #${String(target.number)} ${result.verdict}\n${lines}\n`;
}

function gate(parsed: ParsedArgs, stdout: Pick<NodeJS.WriteStream, 'write'>): number {
  const target = resolveTarget(parsed);
  if (target === null) {
    stdout.write('review-cost gate: no open pull request for this branch — nothing to price\n');
    return 0;
  }
  const result = report(target, parsed);
  stdout.write(render(target, result, parsed.json));
  return result.verdict === 'exhausted' ? 3 : 0;
}

function usageError(parsed: ParsedArgs): string | undefined {
  if (parsed.error !== undefined) {
    return parsed.error;
  }
  return parsed.pr === undefined && !parsed.branch ? 'pass --pr <number> or --branch' : undefined;
}

function guarded(
  parsed: ParsedArgs,
  stdout: Pick<NodeJS.WriteStream, 'write'>,
  stderr: Pick<NodeJS.WriteStream, 'write'>,
): number {
  try {
    return gate(parsed, stdout);
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
