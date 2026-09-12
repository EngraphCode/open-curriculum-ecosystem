import { readFileSync } from 'node:fs';

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
  refsFile?: string;
  repo?: string;
  expect: string[];
  json: boolean;
  help: boolean;
  ghPath?: string;
  error?: string;
}

const USAGE = [
  'review-cost gate (--pr <number> | --branch | --refs-file <path>) [--repo <owner/repo>] [--expect <login>]... [--json] [--gh <path>]',
  "  The review loop's cost against the settlement-push budget the pull request declares",
  '  (`budget — N` in its description; two when undeclared). Every reviewed head is a round;',
  '  its cost rises with findings, comment volume, push size, files, pushes to the same files',
  '  and pushes within the hour (weights: DEFAULT_POLICY in cost.ts).',
  '  Exit 0 within budget, warn or converging; exit 3 BUDGET-EXHAUSTED; exit 1 operational;',
  '  exit 2 usage. Exactly one selector:',
  '  --pr: one pull request; --branch: the open pull request of the current branch;',
  '  --refs-file: the ref lines git hands the pre-push hook — every pushed branch with an open',
  '  pull request is priced and any exhausted one refuses the push. No open pull request passes.',
].join('\n');

const POSITIVE_INTEGER = /^[1-9]\d*$/u;

type Value = () => string | undefined;

const FLAG_HANDLERS: Readonly<Record<string, (parsed: ParsedArgs, value: Value) => void>> = {
  '--pr': (parsed, value) => {
    const raw = value();
    if (raw === undefined || !POSITIVE_INTEGER.test(raw)) {
      parsed.error = `--pr needs a positive integer, got '${raw ?? ''}'`;
      return;
    }
    parsed.pr = Number(raw);
  },
  '--branch': (parsed) => {
    parsed.branch = true;
  },
  '--refs-file': (parsed, value) => {
    parsed.refsFile = value();
  },
  '--repo': (parsed, value) => {
    parsed.repo = value();
  },
  '--expect': (parsed, value) => {
    const login = value();
    if (login !== undefined) {
      parsed.expect.push(login);
    }
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

// A value-taking flag must be followed by a value that is not itself a flag.
const VALUE_FLAGS = new Set(['--pr', '--refs-file', '--repo', '--expect', '--gh']);

// The error a flag raises before its handler runs: unknown, or a value flag with no value.
function flagError(flag: string, next: string | undefined): string | undefined {
  if (!Object.hasOwn(FLAG_HANDLERS, flag)) {
    return `unknown argument: ${flag}`;
  }
  if (VALUE_FLAGS.has(flag) && (next === undefined || next.startsWith('-'))) {
    return `${flag} needs a value`;
  }
  return undefined;
}

function parseArgs(args: readonly string[]): ParsedArgs {
  const parsed: ParsedArgs = { branch: false, expect: [], json: false, help: false };
  const rest = [...args];
  if (rest.shift() !== 'gate') {
    parsed.error = 'expected the `gate` subcommand';
  }
  while (rest.length > 0) {
    const flag = rest.shift() ?? '';
    const error = flagError(flag, rest[0]);
    if (error !== undefined) {
      parsed.error = error;
      break;
    }
    FLAG_HANDLERS[flag]?.(parsed, () => rest.shift());
  }
  return parsed;
}

function selectors(parsed: ParsedArgs): number {
  return [parsed.pr !== undefined, parsed.branch, parsed.refsFile !== undefined].filter(Boolean)
    .length;
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
  const lastReviewed = rounds.at(-1)?.head;
  return reviewCost(rounds, readBudget(live.body).pushes, DEFAULT_POLICY, {
    headAdvanced: lastReviewed !== undefined && lastReviewed !== live.harvest.headRefOid,
  });
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
  const result = report(target, parsed);
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
  return selectors(parsed) === 1 ? undefined : 'pass exactly one of --pr, --branch, --refs-file';
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
