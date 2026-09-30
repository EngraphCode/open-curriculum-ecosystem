import type { GitExecutor } from './git-executor.js';
import { mintForConfig, type MintSeams } from './mint-for-config.js';
import type { GithubApiFetch } from './mint-installation-token.js';
import { parsePushArgs, PUSH_USAGE, type PushArgs } from './push-args.js';
import {
  describeGitChildEnd,
  gitReadsFrom,
  pushHead,
  resolveGitContext,
  type GitContext,
  type PushGitReads,
  type TokenFileStore,
} from './push-git.js';
import { settleTargetBranch } from './push-target-branch.js';
import { RefFormatOracleUnavailableError, type RefFormatOracle } from './ref-format.js';
import {
  resolveBotIdentity,
  type BotIdentity,
  type MergeBotResolveInput,
} from './resolve-identity.js';

/**
 * The `merge-bot push` action: the bot-identity push at the front door (argv
 * contract in `push-args.ts`, git plumbing and credential discipline in
 * `push-git.ts`). Exit map: 0 pushed, 1 operational failure, 2 usage, 3 typed
 * refusal.
 *
 * Build-vs-pass-through (owner principle 2026-08-06, recorded in
 * `merge-cli.ts`'s header): the push IS the git binary — every byte of
 * transfer behaviour, hook execution and non-fast-forward detection is git's,
 * and this command re-implements none of it. What is built here is what no
 * binary provides: the bot identity, the credential injection, and the typed
 * refusals. Which is also why there is no force flag and no `--no-verify`
 * pass-through: a bypass would be built value, and this one is never built.
 */

/** The action's composition surface; cli.ts forwards its own injection seams. */
export interface PushActionInput {
  readonly identityInput: MergeBotResolveInput;
  /** The invoking repository's root — the cwd every git call runs in. */
  readonly repoRoot: string;
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
  readonly fetchImpl?: GithubApiFetch;
  readonly readFileImpl?: (path: string) => Promise<string>;
  readonly nowEpochSeconds?: () => number;
  /** Git seams: the executor, and the binary path (defaults to the trusted absolute path). */
  readonly gitExecutor?: GitExecutor;
  readonly gitPath?: string;
  /**
   * Base environment for the git child. Defaults to `process.env` at the leaf
   * (the default-seam pattern `merge.ts`'s `readEnv` records): Node
   * REPLACES a provided child env rather than merging it, so injecting the
   * token-file path forces constructing the whole environment, and git needs
   * PATH and friends underneath.
   */
  readonly baseEnv?: Readonly<Record<string, string | undefined>>;
  /** The token file's lifecycle (mkdtemp/write/remove); tests inject a recording fake. */
  readonly tokenFiles?: TokenFileStore;
  /** git's answers about HEAD and origin; defaults to the git binary's. */
  readonly gitReads?: PushGitReads;
  /** Branch-name legality for --branch; defaults to asking the git binary. */
  readonly refFormatOracle?: RefFormatOracle;
}

/** The outcome a machine reads under --json. */
type PushOutcome =
  | { readonly kind: 'pushed'; readonly branch: string; readonly remote: string }
  | { readonly kind: 'refused'; readonly reason: string };

/** Everything settled before a token is minted: identity, git, the target branch and the child env. */
type Prepared =
  | {
      readonly kind: 'ready';
      readonly identity: BotIdentity;
      readonly git: GitContext;
      readonly branch: string;
      readonly env: Readonly<Record<string, string | undefined>>;
    }
  | { readonly kind: 'failed'; readonly exit: number; readonly message: string }
  | { readonly kind: 'refused'; readonly reason: string };

function mintSeamsFrom(input: PushActionInput): MintSeams {
  return {
    ...(input.fetchImpl === undefined ? {} : { fetchImpl: input.fetchImpl }),
    ...(input.readFileImpl === undefined ? {} : { readFileImpl: input.readFileImpl }),
    ...(input.nowEpochSeconds === undefined ? {} : { nowEpochSeconds: input.nowEpochSeconds }),
  };
}

/**
 * Identity, git, and the target branch — all of it BEFORE the mint, so a
 * refusal never mints a token it will not use.
 */
async function prepare(parsed: PushArgs, input: PushActionInput): Promise<Prepared> {
  const identity = resolveBotIdentity({}, input.identityInput);
  if (!identity.ok) {
    return { kind: 'failed', exit: 2, message: identity.error.message };
  }
  const git = resolveGitContext(input);
  if (!git.ok) {
    return { kind: 'failed', exit: 1, message: git.error.message };
  }
  const env = input.baseEnv ?? process.env;
  const reads = input.gitReads ?? gitReadsFrom(git.value, { cwd: input.repoRoot, env });
  const target = await settleTargetBranch(parsed.branch, reads, identity.value);
  if (!target.ok) {
    return { kind: 'failed', exit: 1, message: target.error.message };
  }
  return target.value.kind === 'refused'
    ? { kind: 'refused', reason: target.value.reason }
    : { kind: 'ready', identity: identity.value, git: git.value, branch: target.value.branch, env };
}

function writeRefusal(reason: string, json: boolean, input: PushActionInput): void {
  if (json) {
    input.stdout.write(`${JSON.stringify({ kind: 'refused', reason } satisfies PushOutcome)}\n`);
  }
  input.stderr.write(`merge-bot push: refused: ${reason}\n`);
}

function writePushed(
  outcome: Extract<PushOutcome, { kind: 'pushed' }>,
  json: boolean,
  input: PushActionInput,
): void {
  if (json) {
    input.stdout.write(`${JSON.stringify(outcome)}\n`);
    return;
  }
  input.stdout.write(`pushed: ${outcome.branch} to ${outcome.remote}\n`);
}

export async function runPushAction(
  rest: readonly string[],
  input: PushActionInput,
): Promise<number> {
  // The most likely first command a new operator types — it must reach the
  // usage text on stdout, never the unknown-argument path.
  if (rest[0] === '--help' || rest[0] === '-h') {
    input.stdout.write(PUSH_USAGE);
    return 0;
  }
  const parsed = parsePushArgs(
    rest,
    input.refFormatOracle === undefined ? {} : { refFormatOracle: input.refFormatOracle },
  );
  if (!parsed.ok) {
    input.stderr.write(`merge-bot push: ${parsed.error.message}\n`);
    // A missing git binary is an operational failure, never a usage mistake.
    return parsed.error instanceof RefFormatOracleUnavailableError ? 1 : 2;
  }
  const prepared = await prepare(parsed.value, input);
  if (prepared.kind === 'failed') {
    input.stderr.write(`merge-bot push: ${prepared.message}\n`);
    return prepared.exit;
  }
  if (prepared.kind === 'refused') {
    writeRefusal(prepared.reason, parsed.value.json, input);
    return 3;
  }
  return mintAndPush(prepared, parsed.value, input);
}

/** Mint, then hand the whole transfer to git. Split for the size gate. */
async function mintAndPush(
  prepared: Extract<Prepared, { kind: 'ready' }>,
  parsed: PushArgs,
  input: PushActionInput,
): Promise<number> {
  // Scope is the whole landing span: a push can carry `.github/workflows`
  // changes, which GitHub refuses without `workflows: write` (the scope table
  // carries that observation's provenance).
  const minted = await mintForConfig(
    { ...prepared.identity, scope: 'pull-request-work' },
    mintSeamsFrom(input),
  );
  if (!minted.ok) {
    input.stderr.write(`merge-bot push: ${minted.error.message}\n`);
    return 1;
  }
  // The point-of-use backstop. The mint's own response schema already rejects
  // an empty token, so this fires only if that contract ever changes — and
  // HERE is where an empty value stops being a validation detail and becomes
  // an interactive credential prompt answered by the signed-in human.
  if (minted.value.token === '') {
    input.stderr.write(
      'merge-bot push: minted token is empty — refusing before any git call: the credential helper would emit an empty password and git would fall back to prompting the signed-in human\n',
    );
    return 1;
  }
  return transferAndReport(prepared, parsed, input, minted.value.token);
}

/** The transfer and its reporting, split from the mint for the size gate. */
async function transferAndReport(
  prepared: Extract<Prepared, { kind: 'ready' }>,
  parsed: PushArgs,
  input: PushActionInput,
  token: string,
): Promise<number> {
  const { identity, git, branch, env } = prepared;
  const remote = `https://github.com/${identity.owner}/${identity.repoName}.git`;
  const pushed = await pushHead(git, {
    remote,
    branch,
    cwd: input.repoRoot,
    token,
    baseEnv: env,
    tokenFiles: input.tokenFiles,
    // git's transfer output — and the gate chain's underneath — arrives in
    // full on completion: files, never a Node pipe or sized buffer (R1; F-112).
    onOutput: (chunk) => {
      input.stderr.write(chunk);
    },
  });
  // A failure to STAGE the credential file (full temp root, unwritable) is an
  // operational failure: no push was attempted.
  if (!pushed.ok) {
    input.stderr.write(`merge-bot push: ${pushed.error.message}\n`);
    return 1;
  }
  const result = pushed.value;
  // The file-backed executor replays everything through the sink, so this
  // forwards only what an executor captured instead. Stderr either way:
  // stdout stays free for the outcome object a machine parses.
  input.stderr.write(`${result.stdout}${result.stderr}`);
  if (result.status !== 0) {
    input.stderr.write(`merge-bot push: git push ${describeGitChildEnd(result)}\n`);
    return 1;
  }
  writePushed({ kind: 'pushed', branch, remote }, parsed.json, input);
  return 0;
}
