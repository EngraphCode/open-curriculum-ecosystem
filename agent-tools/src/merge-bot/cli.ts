import type { Result } from '@oaknational/result';

import type { ReadPrStateOptions } from '../pr-watch/state-gh.js';
import type { PrStateReading } from '../pr-watch/state-types.js';
import { MERGE_USAGE } from './merge-args.js';
import { runMergeAction, type MergeActionInput } from './merge-cli.js';
import type { GithubApiFetch } from './mint-installation-token.js';
import { mintForConfig, type MintedToken, type MintSeams } from './mint-for-config.js';
import { PUSH_USAGE } from './push-args.js';
import { runPushAction, type PushActionInput } from './push-cli.js';
import { RETIRE_USAGE } from './retire-args.js';
import { runRetireAction, type RetireActionInput } from './retire-cli.js';
import type { BranchArgSeams } from './branch-arg.js';
import type { GitActionInput } from './git-action-input.js';
import type { GitExecutor } from './git-executor.js';
import type { PushGitReads, TokenFileStore } from './push-git.js';
import type { PushMint } from './push-mint.js';
import type { RetireGitPort } from './retire-git-port.js';
import type { GitRunner } from '../collaboration-state/coordination-home.js';
import { resolveMintTokenConfig } from './resolve-config.js';
import { permissionNamesFor, TOKEN_SCOPE_NAMES } from './token-scopes.js';

/**
 * CLI for the `merge-bot` topic (AIP-158, MCP-508).
 *
 * `merge-bot merge` is the sanctioned landing path: it mints its own token,
 * reads the settlement verdict, and merges ONLY on SETTLE-READY — never
 * squash, the verdicted tip's sha pinned in the call:
 *
 * ```bash
 * pnpm agent-tools merge-bot merge --pr <n> --expect <reviewer>
 * ```
 *
 * `merge-bot push` pushes the invoking worktree's HEAD under the bot
 * identity — the token in a transfer-lifetime 0600 file whose path rides the
 * child environment (never the token itself: hooks inherit that
 * environment), no force, no `--no-verify`, default-branch targets refused
 * by name.
 *
 * `merge-bot retire` deletes a merged branch's names (local, cached
 * tracking, remote) once each is proven an ancestor of the remote default
 * branch's tip: the remote one as the bot by compare-and-swap, under the
 * `branch-retire` scope, minted only when that delete is due.
 *
 * `merge-bot mint-token` prints a short-lived GitHub App installation token
 * to stdout (and nothing else there), for the OTHER bot writes
 * (gh pr create/edit, comments, review replies, thread resolution,
 * update-branch). Assign it, then use it — never the `GH_TOKEN=$(…) gh …`
 * prefix form, which cannot fail fast: a failing mint leaves `GH_TOKEN`
 * empty, `gh` reads empty as UNSET, and the command runs as the signed-in
 * human.
 *
 * ```bash
 * token=$(pnpm --silent agent-tools merge-bot mint-token --scope <scope-name>) || exit 1
 * ```
 *
 * The bot is absent from the protections ruleset's bypass list — its one
 * bypass is the separate code-owner review gate (owner ruling 2026-07-21,
 * verified against the rulesets API 2026-07-31; `docs/engineering/merge-bot.md`
 * carries the split) — so its merges bind to required checks and threads.
 * The sanctioned direct-merge path under the 2026-07-21 owner rulings
 * (`--admin` always banned; direct `--merge` banned on bypass-capable
 * accounts).
 */

interface MergeBotEnvironment {
  readonly HOME?: string;
}

export interface MergeBotCliInput {
  readonly args: readonly string[];
  readonly env: MergeBotEnvironment;
  /** The invoking repository's root: the cwd every git call runs in, and where the primary-checkout resolution starts. */
  readonly repoRoot?: string;
  readonly readConfigFileImpl?: (filePath: string) => string;
  /** The git runner the primary-checkout resolution uses — required; the bin injects the real one, tests a fake. */
  readonly runGitImpl: GitRunner;
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
  /** Injection seams for tests. */
  readonly fetchImpl?: GithubApiFetch;
  readonly readFileImpl?: (path: string) => Promise<string>;
  readonly nowEpochSeconds?: () => number;
  /** Merge-action seams (same discipline as the block above). */
  readonly readReadingImpl?: (options: ReadPrStateOptions) => Result<PrStateReading, Error>;
  readonly sleepImpl?: (ms: number) => Promise<void>;
  readonly nowIsoImpl?: () => string;
  /** Push-action seams: the git binary, its executor, the child's base environment, the token file's lifecycle. */
  readonly gitExecutor?: GitExecutor;
  readonly gitPath?: string;
  readonly baseEnv?: Readonly<Record<string, string | undefined>>;
  readonly tokenFiles?: TokenFileStore;
  /** Push seam: git's answers about HEAD and origin. */
  readonly gitReads?: PushGitReads;
  /** Push and retire seam: the token mint. Unset, each mints with `mintForConfig` over `fetchImpl`, `readFileImpl` and `nowEpochSeconds`; set, the mint's seams never reach them, though `fetchImpl` still carries the retire's GraphQL calls. `mint-token` and `merge` never read it. */
  readonly mintImpl?: PushMint;
  /** Retire-action seam: git as the command asks of it. */
  readonly retireGitPort?: RetireGitPort;
  /** Push and retire seam: the `--branch` check's oracle. */
  readonly branchArgSeams?: BranchArgSeams;
}

const USAGE = `merge-bot mint-token --scope <${TOKEN_SCOPE_NAMES.join('|')}> [--app-id <id>] [--private-key-path <pem-path>] [--repo <owner/name>] [--json]
  Prints a short-lived GitHub App installation token (stdout carries ONLY the
  token unless --json, which bundles the token into the printed object). The
  clone's .github/merge-bot.json is the single authority for the bot identity:
  per-checkout and never tracked (create it from .github/merge-bot.json.example),
  read at the clone's primary checkout so every worktree sees the one copy; the
  private key lives at ~/.config/<appSlug>/private-key.pem, derived from it.
  Flags are explicit operator overrides (cross-repo invocation, tests) — not a
  resolution tier.

  --scope is REQUIRED and has no default: a token carries only the permissions
  its mint requests, so defaulting would make the most privileged scope the
  silent one. Scopes and what each permits are defined in token-scopes.ts.
${TOKEN_SCOPE_NAMES.map((name) => `    ${name}: ${permissionNamesFor(name).join(', ')}\n`).join('')}
  A 403 reading "Resource not accessible by integration" means the wrong
  --scope, not a broken bot: an ungranted permission fails the mint with a 422.
  Other 403s (ruleset refusals, rate limits) are not scope problems.

${MERGE_USAGE}
${PUSH_USAGE}
${RETIRE_USAGE}`;

/** The mint's injection seams, the same for every action that mints. */
function mintSeamsFrom(input: MergeBotCliInput): MintSeams {
  return {
    fetchImpl: input.fetchImpl,
    readFileImpl: input.readFileImpl,
    nowEpochSeconds: input.nowEpochSeconds,
  };
}

/** Forward the CLI's injection seams to the merge action. */
function mergeActionInputFrom(input: MergeBotCliInput): MergeActionInput {
  return {
    identityInput: {
      envHome: input.env.HOME,
      repoRoot: input.repoRoot,
      readConfigFileImpl: input.readConfigFileImpl,
      runGitImpl: input.runGitImpl,
    },
    stdout: input.stdout,
    stderr: input.stderr,
    ...mintSeamsFrom(input),
    readReadingImpl: input.readReadingImpl,
    sleepImpl: input.sleepImpl,
    nowIsoImpl: input.nowIsoImpl,
  };
}

/** Forward the seams the push and retire actions share (`git-action-input.ts`), composing the mint. */
function gitActionInputFrom(input: MergeBotCliInput): GitActionInput {
  return {
    mint: input.mintImpl ?? ((config) => mintForConfig(config, mintSeamsFrom(input))),
    identityInput: {
      envHome: input.env.HOME,
      repoRoot: input.repoRoot,
      readConfigFileImpl: input.readConfigFileImpl,
      runGitImpl: input.runGitImpl,
    },
    repoRoot: input.repoRoot ?? process.cwd(),
    stdout: input.stdout,
    stderr: input.stderr,
    gitExecutor: input.gitExecutor,
    gitPath: input.gitPath,
    baseEnv: input.baseEnv,
    branchArgSeams: input.branchArgSeams,
  };
}

/** Forward the CLI's injection seams to the push action. */
function pushActionInputFrom(input: MergeBotCliInput): PushActionInput {
  return {
    ...gitActionInputFrom(input),
    sleepImpl: input.sleepImpl,
    nowIsoImpl: input.nowIsoImpl,
    tokenFiles: input.tokenFiles,
    gitReads: input.gitReads,
  };
}

/** Forward the CLI's injection seams to the retire action: the shared set, GitHub for its GraphQL calls, its git port. */
function retireActionInputFrom(input: MergeBotCliInput): RetireActionInput {
  return {
    ...gitActionInputFrom(input),
    fetchImpl: input.fetchImpl,
    gitPort: input.retireGitPort,
  };
}

function writeSuccess(outcome: MintedToken, json: boolean, input: MergeBotCliInput): void {
  if (json) {
    input.stdout.write(`${JSON.stringify(outcome)}\n`);
    return;
  }
  input.stdout.write(`${outcome.token}\n`);
  input.stderr.write(`token expires ${outcome.expiresAt}\n`);
}

export async function runMergeBotCli(input: MergeBotCliInput): Promise<number> {
  const [action, ...rest] = input.args;
  if (action === '--help' || action === '-h') {
    input.stdout.write(USAGE);
    return 0;
  }
  if (action === undefined) {
    input.stderr.write(USAGE);
    return 2;
  }
  if (action === 'merge') {
    return runMergeAction(rest, mergeActionInputFrom(input));
  }
  if (action === 'push') {
    return runPushAction(rest, pushActionInputFrom(input));
  }
  if (action === 'retire') {
    return runRetireAction(rest, retireActionInputFrom(input));
  }
  if (action !== 'mint-token') {
    input.stderr.write(`merge-bot: unknown action "${action}"\n${USAGE}`);
    return 2;
  }
  return runMintTokenAction(rest, input);
}

async function runMintTokenAction(
  rest: readonly string[],
  input: MergeBotCliInput,
): Promise<number> {
  const config = resolveMintTokenConfig(rest, {
    envHome: input.env.HOME,
    repoRoot: input.repoRoot,
    readConfigFileImpl: input.readConfigFileImpl,
    runGitImpl: input.runGitImpl,
  });
  if (!config.ok) {
    input.stderr.write(`merge-bot mint-token: ${config.error.message}\n`);
    return 2;
  }

  const outcome = await mintForConfig(config.value, mintSeamsFrom(input));
  if (!outcome.ok) {
    input.stderr.write(`merge-bot mint-token: ${outcome.error.message}\n`);
    return 1;
  }
  writeSuccess(outcome.value, config.value.json, input);
  return 0;
}
