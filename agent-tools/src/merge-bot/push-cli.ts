import { delay } from '../core/delay.js';

import type { GitExecutor } from './git-executor.js';
import { parsePushArgs, PUSH_USAGE, type PushArgs } from './push-args.js';
import {
  isAdvertisementRefusal,
  PUSH_RETRY_WAITS_MS,
  pushWithRetry,
  type PushAttempt,
  type PushRetry,
} from './push-attempts.js';
import {
  describeGitChildEnd,
  gitReadsFrom,
  pushCommit,
  resolveGitContext,
  type GitContext,
  type PushGitReads,
  type TokenFileStore,
} from './push-git.js';
import { mintPushToken, type PushMint } from './push-mint.js';
import { writePushed, writeRefusal } from './push-report.js';
import { settleCommit, settleTargetBranch } from './push-target-branch.js';
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
 * binary provides: the bot identity, the credential injection, the typed
 * refusals, and the bounded retry of GitHub's refusal before the hook runs
 * (`push-attempts.ts`). Which is also why there is no force flag and no `--no-verify`
 * pass-through: a bypass would be built value, and this one is never built.
 */

/** The action's composition surface; cli.ts forwards its injection seams and composes the mint. */
export interface PushActionInput {
  readonly identityInput: MergeBotResolveInput;
  /** The invoking repository's root — the cwd every git call runs in. */
  readonly repoRoot: string;
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
  /** The mint the push's one token comes from (`push-mint.ts`). */
  readonly mint: PushMint;
  /** The wait before a refused push is tried again. */
  readonly sleepImpl?: (ms: number) => Promise<void>;
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

/** Everything settled before a token is minted: identity, git, the target branch, the commit and the child env. */
type Prepared =
  | {
      readonly kind: 'ready';
      readonly identity: BotIdentity;
      readonly git: GitContext;
      readonly branch: string;
      readonly commit: string;
      readonly env: Readonly<Record<string, string | undefined>>;
    }
  | { readonly kind: 'failed'; readonly exit: number; readonly message: string }
  | { readonly kind: 'refused'; readonly reason: string };

type Ready = Extract<Prepared, { kind: 'ready' }>;

/** An attempt that failed for a reason other than GitHub's refusal: final. */
const FAILED: PushAttempt = { kind: 'ended', exit: 1 };

/** The retry's schedule, its wait (the real clock unless injected) and its stream. */
function retryFrom(input: PushActionInput): PushRetry {
  return { waitsMs: PUSH_RETRY_WAITS_MS, sleep: input.sleepImpl ?? delay, stderr: input.stderr };
}

/**
 * Identity, git, the target branch and the commit — all of it BEFORE the
 * mint, so a refusal never mints a token it will not use.
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
  if (target.value.kind === 'refused') {
    return { kind: 'refused', reason: target.value.reason };
  }
  const commit = settleCommit(await reads.headCommit());
  return commit.ok
    ? {
        kind: 'ready',
        identity: identity.value,
        git: git.value,
        branch: target.value.branch,
        commit: commit.value,
        env,
      }
    : { kind: 'failed', exit: 1, message: commit.error.message };
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

/** Mint the push's one token (`push-mint.ts`), then run the transfer with it on the retry's schedule. */
async function mintAndPush(
  prepared: Ready,
  parsed: PushArgs,
  input: PushActionInput,
): Promise<number> {
  const token = await mintPushToken(prepared.identity, input.mint);
  if (!token.ok) {
    input.stderr.write(`merge-bot push: ${token.error.message}\n`);
    return 1;
  }
  return pushWithRetry(
    () => transferAndReport(prepared, parsed, input, token.value),
    retryFrom(input),
  );
}

/**
 * One attempt: the transfer of the settled commit with the push's token, and
 * its reporting. The output streams to stderr in full as it arrives (R1), and
 * the whole transcript is classified once. A warning that the token directory
 * could not be removed joins that transcript, so an attempt whose cleanup
 * warned is never taken for the refusal: it fails closed, never a second run
 * of the gate.
 */
async function transferAndReport(
  prepared: Ready,
  parsed: PushArgs,
  input: PushActionInput,
  token: string,
): Promise<PushAttempt> {
  const { identity, git, branch, commit, env } = prepared;
  const remote = `https://github.com/${identity.owner}/${identity.repoName}.git`;
  let transcript = '';
  const pushed = await pushCommit(git, {
    remote,
    branch,
    commit,
    cwd: input.repoRoot,
    token,
    baseEnv: env,
    tokenFiles: input.tokenFiles,
    // git's transfer output — and the gate chain's underneath — arrives in
    // full on completion: files, never a Node pipe or sized buffer (R1; F-112).
    onOutput: (chunk) => {
      transcript += chunk;
      input.stderr.write(chunk);
    },
  });
  // A failure to STAGE the credential file (full temp root, unwritable) is an
  // operational failure: no push was attempted.
  if (!pushed.ok) {
    input.stderr.write(`merge-bot push: ${pushed.error.message}\n`);
    return FAILED;
  }
  const result = pushed.value;
  // The file-backed executor replays everything through the sink, so this
  // forwards only what an executor captured instead. Stderr either way:
  // stdout stays free for the outcome object a machine parses.
  const captured = `${result.stdout}${result.stderr}`;
  input.stderr.write(captured);
  if (result.status !== 0) {
    input.stderr.write(`merge-bot push: git push ${describeGitChildEnd(result)}\n`);
    return isAdvertisementRefusal(result.status, result.signal, `${transcript}${captured}`)
      ? { kind: 'refused' }
      : FAILED;
  }
  writePushed({ kind: 'pushed', branch, remote }, parsed.json, input);
  return { kind: 'ended', exit: 0 };
}
