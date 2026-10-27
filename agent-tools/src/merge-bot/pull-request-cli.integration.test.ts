import { generateKeyPairSync } from 'node:crypto';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  API,
  BODY,
  BODY_FILE,
  CONVERSATION_SCRIPT,
  GRAPHQL,
  MINT_UNREACHED,
  runPullRequest,
  TOKEN,
} from './test-helpers/pull-request-cli-double.js';
import { mintFailing } from './test-helpers/push-cli-double.js';
import { TOKEN_SCOPES } from './token-scopes.js';

/**
 * The `merge-bot pull-request` front door over injected seams: GitHub is a
 * script, the mint a fake, the files a map. It proves the exit map, the
 * `--json` object, that every refusal and usage error reaches GitHub and the
 * mint not at all, that the minted token is the one every call carries, and
 * that the body file travels verbatim. The verbs' own reads, refusals and
 * failures are their modules' tests.
 */

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const COMMENT = ['comment', '--pr', '42', '--body-file', BODY_FILE];

describe('merge-bot pull-request, front door', () => {
  it.each([['--help'], ['-h'], ['comment', '--help'], ['open', '-h']])(
    'prints its usage on %j and exits 0, minting nothing',
    async (...args) => {
      const run = await runPullRequest(args, { mint: MINT_UNREACHED });

      expect(run.exit).toBe(0);
      expect(run.out).toContain('merge-bot pull-request <verb>');
      expect(run.err).toBe('');
    },
  );

  it.each([[], ['merge'], ['ready', '--pr', 'x'], ['comment', '--pr', '42']])(
    'exits 2 on the usage error %j, with the usage text, minting nothing and reaching GitHub not at all',
    async (...args) => {
      const run = await runPullRequest(args, { mint: MINT_UNREACHED });

      expect(run.exit).toBe(2);
      expect(run.out).toBe('');
      expect(run.err).toContain('merge-bot pull-request:');
      expect(run.err).toContain('Exit map');
      expect(run.requests).toHaveLength(0);
    },
  );

  it('fails with exit 1, minting nothing, when no git binary can answer the ref grammar', async () => {
    const run = await runPullRequest(
      ['open', '--branch', 'feat/x', '--title', 't', '--body-file', BODY_FILE, '--wip-limit', '3'],
      { mint: MINT_UNREACHED, branchArgSeams: { pathExists: () => false } },
    );

    expect(run.exit).toBe(1);
    expect(run.err).toContain('No trusted git binary');
  });

  it('exits 2, minting nothing, when the bot identity cannot be read', async () => {
    const unreadable = (): string => {
      throw new Error('ENOENT: no merge-bot.json');
    };
    const run = await runPullRequest(COMMENT, {
      mint: MINT_UNREACHED,
      readConfigFileImpl: unreadable,
    });

    expect(run.exit).toBe(2);
    expect(run.err).toContain('single authority');
  });

  it('fails with exit 1, minting nothing, when the body file cannot be read, naming the path', async () => {
    const run = await runPullRequest(COMMENT, { mint: MINT_UNREACHED, files: {} });

    expect(run.exit).toBe(1);
    expect(run.err).toContain(BODY_FILE);
    expect(run.requests).toHaveLength(0);
  });

  it.each([
    { args: COMMENT, flag: '--body-file' },
    { args: ['close', '--pr', '42', '--reason-file', BODY_FILE], flag: '--reason-file' },
  ])('refuses an empty $flag with exit 3, minting nothing', async ({ args, flag }) => {
    const run = await runPullRequest([...args, '--json'], {
      mint: MINT_UNREACHED,
      files: { [BODY_FILE]: ' \n' },
    });

    expect(run.exit).toBe(3);
    expect(JSON.parse(run.out)).toMatchObject({ kind: 'refused' });
    expect(run.out).toContain(flag);
    expect(run.err).toContain('refused');
    expect(run.requests).toHaveLength(0);
  });

  it('comments as the bot: mints once, carries the minted token, sends the file verbatim', async () => {
    const run = await runPullRequest(COMMENT, { script: CONVERSATION_SCRIPT });

    expect(run.exit).toBe(0);
    expect(run.out).toBe(`commented: #42 comment 9001 ${API}/pull/42#issuecomment-9001\n`);
    expect(run.err).toBe('');
    expect(run.requests).toHaveLength(1);
    expect(run.requests[0]?.authorization).toBe(`Bearer ${TOKEN}`);
    expect(run.requests[0]?.body).toEqual({ body: BODY });
  });

  it('puts exactly the outcome object on stdout under --json', async () => {
    const run = await runPullRequest([...COMMENT, '--json'], { script: CONVERSATION_SCRIPT });

    expect(run.exit).toBe(0);
    expect(run.out.endsWith('\n')).toBe(true);
    expect(run.out.trim().split('\n')).toHaveLength(1);
    expect(JSON.parse(run.out)).toEqual({
      kind: 'commented',
      pr: 42,
      commentId: 9001,
      url: `${API}/pull/42#issuecomment-9001`,
    });
  });

  it.each([
    {
      args: ['reply', '--pr', '42', '--comment', '777', '--body-file', BODY_FILE],
      kind: 'replied',
    },
    { args: ['resolve', '--pr', '42', '--thread', 'PRRT_kwDOAbc'], kind: 'resolved' },
    { args: ['ready', '--pr', '42'], kind: 'ready' },
    { args: ['close', '--pr', '42', '--reason-file', BODY_FILE], kind: 'closed' },
  ])('dispatches $kind with exit 0, every call under the minted token', async ({ args, kind }) => {
    const run = await runPullRequest([...args, '--json'], { script: CONVERSATION_SCRIPT });

    expect(run.exit).toBe(0);
    expect(JSON.parse(run.out)).toMatchObject({ kind, pr: 42 });
    expect(run.requests.length).toBeGreaterThan(0);
    expect(run.requests.every((request) => request.authorization === `Bearer ${TOKEN}`)).toBe(true);
  });

  it('opens a draft through the front door, the body file as the pull request body', async () => {
    const run = await runPullRequest(
      [
        'open',
        '--branch',
        'feat/x',
        '--title',
        'feat: x',
        '--body-file',
        BODY_FILE,
        '--wip-limit',
        '3',
      ],
      {
        script: (request) => {
          const line = `${request.method} ${request.url}`;
          if (line === `GET ${API}`) {
            return { status: 200, body: { default_branch: 'trunk' } };
          }
          if (line === `GET ${API}/branches/feat/x`) {
            return { status: 200, body: { name: 'feat/x' } };
          }
          if (line.startsWith(`GET ${API}/pulls?state=open`)) {
            return { status: 200, body: [] };
          }
          return line === `POST ${API}/pulls`
            ? { status: 201, body: { number: 43, html_url: `${API}/pull/43` } }
            : undefined;
        },
      },
    );

    expect(run.exit).toBe(0);
    expect(run.out).toContain('#43');
    expect(run.requests.at(-1)?.body).toMatchObject({ body: BODY, draft: true, base: 'trunk' });
  });

  it('exits 3 with the refusal object when a verb refuses on what GitHub holds', async () => {
    const notDraft = { number: 42, node_id: 'PR_kwDOXyz', state: 'open', draft: false };
    const run = await runPullRequest(['ready', '--pr', '42', '--json'], {
      script: () => ({ status: 200, body: notDraft }),
    });

    expect(run.exit).toBe(3);
    expect(JSON.parse(run.out)).toMatchObject({ kind: 'refused' });
    expect(run.out).toContain('not a draft');
    expect(run.err).toContain('refused');
  });

  it('exits 1, stdout empty, naming the status and GitHub message on an operational failure', async () => {
    const run = await runPullRequest([...COMMENT, '--json'], {
      script: () => ({ status: 502, body: { message: 'Bad gateway' } }),
    });

    expect(run.exit).toBe(1);
    expect(run.out).toBe('');
    expect(run.err).toContain('merge-bot pull-request comment:');
    expect(run.err).toContain('502');
    expect(run.err).toContain('Bad gateway');
  });

  it('exits 1, reaching GitHub not at all, when the mint fails', async () => {
    const run = await runPullRequest(COMMENT, { mint: mintFailing() });

    expect(run.exit).toBe(1);
    expect(run.err).toContain('the mint is unavailable');
    expect(run.requests).toHaveLength(0);
  });

  it('with its production mint, mints the pull-request-work scope and hands GitHub that token', async () => {
    const keyPath = join('/test-home', '.config', 'jimbot-oakington-iii', 'private-key.pem');
    const run = await runPullRequest(COMMENT, {
      files: { [BODY_FILE]: BODY, [keyPath]: privateKey },
      script: (request) => {
        if (request.url.endsWith('/installation')) {
          return { status: 200, body: { id: 55 } };
        }
        if (request.url.endsWith('/access_tokens')) {
          return { status: 201, body: { token: 'ghs_minted', expires_at: '2026-10-27T15:00:00Z' } };
        }
        return request.url === `${API}/issues/42/comments`
          ? { status: 201, body: { id: 1, html_url: `${API}/pull/42#issuecomment-1` } }
          : undefined;
      },
      overrides: { mintImpl: undefined, nowEpochSeconds: () => 1_800_000_000 },
    });

    expect(run.exit).toBe(0);
    const mint = run.requests.find((request) => request.url.endsWith('/access_tokens'));
    expect(mint?.body).toMatchObject({ permissions: TOKEN_SCOPES['pull-request-work'] });
    const comment = run.requests.at(-1);
    expect(comment?.url).toBe(`${API}/issues/42/comments`);
    expect(comment?.authorization).toBe('Bearer ghs_minted');
    expect(run.requests.some((request) => request.url === GRAPHQL)).toBe(false);
  });
});
