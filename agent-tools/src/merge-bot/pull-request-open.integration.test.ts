import { describe, expect, it } from 'vitest';

import { openPullRequest, type OpenInput } from './pull-request-open.js';
import {
  connectionRefused,
  requestLines,
  scriptedGithub,
  type GithubScript,
  type RecordedRequest,
} from './test-helpers/github-fetch-double.js';
import { refusalReason } from './test-helpers/refusal-reason.js';
import { failureMessage } from './test-helpers/result-failure.js';

/**
 * The `open` verb against a scripted GitHub: the reads that precede the
 * write, in order, each refusal they can raise, the draft POST and what it
 * carries, and the failures a status other than the expected one raises.
 * No network, no IO.
 */

const REPO = { owner: 'acme', repoName: 'widgets' };
const API = 'https://api.github.com/repos/acme/widgets';
const TOKEN = 'ghs_pull_request_token';
const INPUT: OpenInput = {
  branch: 'feat/x',
  title: 'feat: x',
  body: 'The body.\n',
  wipLimit: 3,
};

/** An open pull request in a listing, with its head ref. */
function openPr(number: number, ref: string): unknown {
  return { number, head: { ref } };
}

/** GitHub as it reads when the open can proceed: two open lane pull requests and one coordination one. */
function happyScript(overrides: Partial<Record<string, GithubScript>> = {}): GithubScript {
  return (request) => {
    const line = `${request.method} ${request.url}`;
    const override = overrides[line];
    if (override !== undefined) {
      return override(request);
    }
    if (line === `GET ${API}`) {
      return { status: 200, body: { default_branch: 'trunk' } };
    }
    if (line === `GET ${API}/branches/feat/x`) {
      return { status: 200, body: { name: 'feat/x' } };
    }
    if (line === `GET ${API}/pulls?state=open&head=acme:feat/x&per_page=1`) {
      return { status: 200, body: [] };
    }
    if (line === `GET ${API}/pulls?state=open&per_page=100&page=1`) {
      return {
        status: 200,
        body: [
          openPr(7, 'feat/a'),
          openPr(8, 'coordination/2026-10-27-abc123'),
          openPr(9, 'fix/b'),
        ],
      };
    }
    if (line === `POST ${API}/pulls`) {
      return {
        status: 201,
        body: { number: 42, html_url: 'https://github.com/acme/widgets/pull/42' },
      };
    }
    return undefined;
  };
}

describe('openPullRequest', () => {
  it('reads the default branch, the branch, the head and the open count, then POSTs a draft', async () => {
    const github = scriptedGithub(happyScript());

    const result = await openPullRequest(github.fetchImpl, TOKEN, REPO, INPUT);

    expect(result).toEqual({
      ok: true,
      value: { kind: 'opened', number: 42, url: 'https://github.com/acme/widgets/pull/42' },
    });
    expect(requestLines(github.requests)).toEqual([
      `GET ${API}`,
      `GET ${API}/branches/feat/x`,
      `GET ${API}/pulls?state=open&head=acme:feat/x&per_page=1`,
      `GET ${API}/pulls?state=open&per_page=100&page=1`,
      `POST ${API}/pulls`,
    ]);
    const post = github.requests.at(-1);
    expect(post?.body).toEqual({
      title: 'feat: x',
      head: 'feat/x',
      base: 'trunk',
      body: 'The body.\n',
      draft: true,
    });
    expect(github.requests.every((request) => request.authorization === `Bearer ${TOKEN}`)).toBe(
      true,
    );
  });

  it('refuses, writing nothing, when the remote does not hold the branch', async () => {
    const github = scriptedGithub(
      happyScript({
        [`GET ${API}/branches/feat/x`]: () => ({
          status: 404,
          body: { message: 'Branch not found' },
        }),
      }),
    );

    const result = await openPullRequest(github.fetchImpl, TOKEN, REPO, INPUT);

    expect(refusalReason(result)).toContain('feat/x');
    expect(requestLines(github.requests)).not.toContain(`POST ${API}/pulls`);
  });

  it('refuses, naming the existing pull request, when an open one already has that head', async () => {
    const github = scriptedGithub(
      happyScript({
        [`GET ${API}/pulls?state=open&head=acme:feat/x&per_page=1`]: () => ({
          status: 200,
          body: [openPr(31, 'feat/x')],
        }),
      }),
    );

    const result = await openPullRequest(github.fetchImpl, TOKEN, REPO, INPUT);

    expect(refusalReason(result)).toContain('#31');
    expect(requestLines(github.requests)).not.toContain(`POST ${API}/pulls`);
  });

  it('refuses at the limit, counting open pull requests whose head is not a coordination branch', async () => {
    const github = scriptedGithub(happyScript());

    const result = await openPullRequest(github.fetchImpl, TOKEN, REPO, { ...INPUT, wipLimit: 2 });

    expect(refusalReason(result)).toContain('2 lane pull requests');
    expect(requestLines(github.requests)).not.toContain(`POST ${API}/pulls`);
  });

  it('follows the listing to the next page when a page holds 100, so a count past 100 is exact', async () => {
    const page1 = Array.from({ length: 100 }, (_, index) => openPr(index + 1, `lane/${index}`));
    const github = scriptedGithub(
      happyScript({
        [`GET ${API}/pulls?state=open&per_page=100&page=1`]: () => ({ status: 200, body: page1 }),
        [`GET ${API}/pulls?state=open&per_page=100&page=2`]: () => ({
          status: 200,
          body: [openPr(101, 'lane/100'), openPr(102, 'coordination/x')],
        }),
      }),
    );

    const result = await openPullRequest(github.fetchImpl, TOKEN, REPO, {
      ...INPUT,
      wipLimit: 101,
    });

    expect(refusalReason(result)).toContain('101');
    expect(requestLines(github.requests)).toContain(
      `GET ${API}/pulls?state=open&per_page=100&page=2`,
    );
  });

  it('opens when the count is one under the limit', async () => {
    const github = scriptedGithub(happyScript());

    const result = await openPullRequest(github.fetchImpl, TOKEN, REPO, { ...INPUT, wipLimit: 3 });

    expect(result.ok && result.value.kind).toBe('opened');
  });

  it.each([
    { line: `GET ${API}`, status: 403, message: 'Resource not accessible by integration' },
    { line: `GET ${API}/branches/feat/x`, status: 500, message: 'Server Error' },
    {
      line: `GET ${API}/pulls?state=open&head=acme:feat/x&per_page=1`,
      status: 502,
      message: 'Bad',
    },
    { line: `GET ${API}/pulls?state=open&per_page=100&page=1`, status: 422, message: 'Nope' },
    { line: `POST ${API}/pulls`, status: 422, message: 'Validation Failed' },
  ])('fails naming the status and GitHub message when $line answers $status', async (step) => {
    const github = scriptedGithub(
      happyScript({
        [step.line]: () => ({ status: step.status, body: { message: step.message } }),
      }),
    );

    const result = await openPullRequest(github.fetchImpl, TOKEN, REPO, INPUT);

    expect(result.ok).toBe(false);
    expect(failureMessage(result)).toContain(String(step.status));
    expect(failureMessage(result)).toContain(step.message);
    expect(failureMessage(result)).not.toContain(TOKEN);
  });

  it('fails when a body is outside the shape the call documents', async () => {
    const github = scriptedGithub(
      happyScript({
        [`POST ${API}/pulls`]: () => ({ status: 201, body: { number: 'forty-two' } }),
      }),
    );

    const result = await openPullRequest(github.fetchImpl, TOKEN, REPO, INPUT);

    expect(result.ok).toBe(false);
    expect(failureMessage(result)).toContain('POST');
  });

  it('fails as a value, never a throw, when the connection drops', async () => {
    const result = await openPullRequest(connectionRefused, TOKEN, REPO, INPUT);

    expect(result.ok).toBe(false);
    expect(failureMessage(result)).toContain('connection reset');
  });

  it('sends the title and body verbatim, including characters JSON must escape', async () => {
    const github = scriptedGithub(happyScript());
    const body = 'line one\n"quoted" & <tag>\n';

    await openPullRequest(github.fetchImpl, TOKEN, REPO, { ...INPUT, body, title: 'a "b" c' });

    const post: RecordedRequest | undefined = github.requests.at(-1);
    expect(post?.body).toMatchObject({ title: 'a "b" c', body });
  });
});
