import { generateKeyPairSync } from 'node:crypto';

import { runMergeBotCli, type MergeBotCliInput } from '../cli.js';
import type { GitCommandResult, GitExecutor } from '../git-executor.js';
import type { GithubApiFetch } from '../mint-installation-token.js';
import type { PushGitReads, TokenFileStore } from '../push-git.js';

/**
 * The `merge-bot push` front door's doubles, shared by its integration tests
 * (`push-cli.integration.test.ts`, `push-cli-retry.integration.test.ts`): a
 * value-returning git seam, git's reads, the mint endpoints, a token store
 * that touches no filesystem, and `runPush`, the CLI over all of them with
 * both output streams captured.
 */

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

export const TOKEN = 'sekrit-installation-token';
export const GIT_PATH = '/usr/bin/git';
export const BRANCH = 'jimcresswell/mcp-508-slice';
export const REMOTE = 'https://github.com/acme/widgets.git';
const TRANSFER = `To ${REMOTE}\n   abc1234..def5678  HEAD -> ${BRANCH}\n`;

export function capture(): { text: () => string; sink: Pick<NodeJS.WriteStream, 'write'> } {
  let buffer = '';
  return {
    text: () => buffer,
    sink: {
      write(chunk: string): boolean {
        buffer += chunk;
        return true;
      },
    },
  };
}

interface GitCall {
  readonly file: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string | undefined>>;
}

/** The default branch `origin` names in these fixtures: neither main nor master. */
export const DEFAULT_BRANCH = 'trunk';

export function answered(stdout: string): GitCommandResult {
  return { status: 0, signal: null, stdout, stderr: '' };
}

/**
 * The value-returning git seam (ADR-088) for the one call the executor makes,
 * the push, every call recorded; a non-zero exit is a RESULT, never a throw.
 * `push` answers every push; `pushes` answers successive pushes in order, the
 * last answer standing for any push after it; `viaSink` answers as the real
 * file-backed executor does given an output sink: the output replayed to it, none in the result.
 */
export function gitFake(
  overrides: {
    push?: GitCommandResult;
    pushes?: readonly GitCommandResult[];
    viaSink?: boolean;
  } = {},
): {
  gitExecutor: GitExecutor;
  calls: GitCall[];
} {
  const calls: GitCall[] = [];
  const pushes = [...(overrides.pushes ?? [])];
  const gitExecutor: GitExecutor = (file, args, options) => {
    calls.push({ file, args, cwd: options.cwd, env: options.env });
    const next = pushes.length > 1 ? pushes.shift() : pushes[0];
    const answer = next ??
      overrides.push ?? { status: 0, signal: null, stdout: '', stderr: TRANSFER };
    if (overrides.viaSink !== true || options.onOutput === undefined) {
      return answer;
    }
    options.onOutput(`${answer.stdout}${answer.stderr}`);
    return { ...answer, stdout: '', stderr: '' };
  };
  return { gitExecutor, calls };
}

/** git's answers about HEAD and origin, each a constant. */
export function gitReads(
  answers: {
    readonly currentBranch?: GitCommandResult;
    readonly originHead?: GitCommandResult;
  } = {},
): PushGitReads {
  const currentBranch = answers.currentBranch ?? answered(`${BRANCH}\n`);
  const originHead = answers.originHead ?? answered(`refs/remotes/origin/${DEFAULT_BRANCH}\n`);
  return {
    currentBranch: () => Promise.resolve(currentBranch),
    // Trusted, and spelled unlike REMOTE: the push goes to the configured
    // repository's URL, never to origin's.
    originUrls: () => Promise.resolve(answered('git@github.com:acme/widgets.git\n')),
    originHead: () => Promise.resolve(originHead),
  };
}

/** GitHub's refusal at the ref advertisement, as git printed it on 2026-09-28, renamed to the fixture's repository. */
export const REFUSED_PUSH: GitCommandResult = {
  status: 128,
  signal: null,
  stdout: '',
  stderr:
    'remote: Permission to acme/widgets.git denied to jimbot-oakington-iii[bot].\n' +
    `fatal: unable to access '${REMOTE}/': The requested URL returned error: 403\n`,
};

export const PUSHED: GitCommandResult = { status: 0, signal: null, stdout: '', stderr: TRANSFER };

/**
 * Serves the mint endpoints and records every call URL and body. Successive
 * mints answer `tokens` in order, the last standing for any mint after it.
 */
export function mintFetch(...tokens: readonly string[]): {
  fetchImpl: GithubApiFetch;
  urls: string[];
  bodies: { url: string; body: string }[];
} {
  const urls: string[] = [];
  const bodies: { url: string; body: string }[] = [];
  const answers = tokens.length === 0 ? [TOKEN] : [...tokens];
  const fetchImpl: GithubApiFetch = (url, init) => {
    urls.push(url);
    if (init?.body !== undefined) {
      bodies.push({ url, body: String(init.body) });
    }
    if (url.endsWith('/installation')) {
      return Promise.resolve({ status: 200, json: () => Promise.resolve({ id: 55 }) });
    }
    const token = answers.length > 1 ? answers.shift() : answers[0];
    return Promise.resolve({
      status: 201,
      json: () => Promise.resolve({ token, expires_at: '2026-08-06T10:00:00Z' }),
    });
  };
  return { fetchImpl, urls, bodies };
}

export const BASE_ENV = { PATH: '/usr/bin', HOME: '/test-home' } as const;

export const STORE_DIR = '/fake-secret-store/merge-bot-push-x1';

interface TokenWrite {
  readonly path: string;
  readonly content: string;
  readonly mode: number;
}

/** Records every prefix, write and removal; no filesystem is ever touched. */
export function tokenStoreFake(overrides: Partial<TokenFileStore> = {}): {
  store: TokenFileStore;
  prefixes: string[];
  writes: TokenWrite[];
  removed: string[];
} {
  const prefixes: string[] = [];
  const writes: TokenWrite[] = [];
  const removed: string[] = [];
  return {
    store: {
      mkdtemp: (prefix) => {
        prefixes.push(prefix);
        return STORE_DIR;
      },
      writeFile: (path, content, mode) => {
        writes.push({ path, content, mode });
      },
      remove: (dir) => {
        removed.push(dir);
      },
      ...overrides,
    },
    prefixes,
    writes,
    removed,
  };
}

/** One push run: its exit, both output streams, and what each double recorded. */
interface PushRun {
  readonly exit: Promise<number>;
  readonly out: () => string;
  readonly errText: () => string;
  readonly calls: GitCall[];
  readonly urls: string[];
  readonly bodies: { url: string; body: string }[];
  readonly prefixes: string[];
  readonly writes: TokenWrite[];
  readonly removed: string[];
}

/** `merge-bot push` over the doubles, the given ones or defaults, with both output streams captured. */
export function runPush(input: {
  readonly args?: readonly string[];
  readonly git?: ReturnType<typeof gitFake>;
  readonly reads?: PushGitReads;
  readonly fetch?: ReturnType<typeof mintFetch>;
  readonly store?: ReturnType<typeof tokenStoreFake>;
  readonly overrides?: Partial<MergeBotCliInput>;
}): PushRun {
  const out = capture();
  const errSink = capture();
  const { gitExecutor, calls } = input.git ?? gitFake();
  const { fetchImpl, urls, bodies } = input.fetch ?? mintFetch();
  const { store, prefixes, writes, removed } = input.store ?? tokenStoreFake();
  const exit = runMergeBotCli({
    args: ['push', ...(input.args ?? [])],
    env: { HOME: '/test-home' },
    stdout: out.sink,
    stderr: errSink.sink,
    fetchImpl,
    readFileImpl: () => Promise.resolve(privateKey),
    readConfigFileImpl: () =>
      JSON.stringify({ appSlug: 'jimbot-oakington-iii', appId: '4352989', repo: 'acme/widgets' }),
    repoRoot: '/repo',
    runGitImpl: () => 'worktree /repo\n',
    nowEpochSeconds: () => 1_800_000_000,
    gitExecutor,
    gitPath: GIT_PATH,
    gitReads: input.reads ?? gitReads(),
    refFormatOracle: () => true,
    baseEnv: BASE_ENV,
    tokenFiles: store,
    ...input.overrides,
  });
  return {
    exit,
    out: out.text,
    errText: errSink.text,
    calls,
    urls,
    bodies,
    prefixes,
    writes,
    removed,
  };
}

/** The executor runs only the push; the reads go through the read port. */
export function pushCall(calls: readonly GitCall[]): GitCall | undefined {
  return calls[0];
}
