import { describe, expect, it } from 'vitest';

import {
  closePullRequest,
  commentOnPullRequest,
  replyToReviewComment,
} from './pull-request-github.js';
import {
  connectionRefused,
  requestLines,
  scriptedGithub,
  type GithubScript,
} from './test-helpers/github-fetch-double.js';
import { refusalReason } from './test-helpers/refusal-reason.js';
import { failureMessage } from './test-helpers/result-failure.js';

/**
 * The REST writes on an existing pull request, against a scripted GitHub:
 * comment, reply and close, the refusal the close raises before writing, and
 * the failure a status other than the expected one raises. No network, no IO.
 */

const REPO = { owner: 'acme', repoName: 'widgets' };
const API = 'https://api.github.com/repos/acme/widgets';
const TOKEN = 'ghs_pull_request_token';

describe('commentOnPullRequest', () => {
  /** The pull request read the verb probes first, then the comment write. */
  const commentScript =
    (post: { status: number; body: unknown } | undefined): GithubScript =>
    (request) => {
      const line = `${request.method} ${request.url}`;
      if (line === `GET ${API}/pulls/42`) {
        return { status: 200, body: pullRequest('open') };
      }
      return line === `POST ${API}/issues/42/comments` ? post : undefined;
    };

  it('POSTs the body verbatim as an issue comment and reads back the id and URL', async () => {
    const github = scriptedGithub(
      commentScript({
        status: 201,
        body: { id: 9001, html_url: `${API}/pull/42#issuecomment-9001` },
      }),
    );

    const result = await commentOnPullRequest(github.fetchImpl, TOKEN, REPO, 42, 'Hello "there"\n');

    expect(result).toEqual({
      ok: true,
      value: {
        kind: 'commented',
        pr: 42,
        commentId: 9001,
        url: `${API}/pull/42#issuecomment-9001`,
      },
    });
    expect(github.requests.at(-1)?.body).toEqual({ body: 'Hello "there"\n' });
    expect(github.requests.at(-1)?.authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('refuses a number that is not a pull request, writing nothing: the issues endpoint would take an issue', async () => {
    // Only the probe is scripted: a reached write would answer the double's
    // failure status and the outcome would not be this refusal.
    const github = scriptedGithub((request) =>
      `${request.method} ${request.url}` === `GET ${API}/pulls/42`
        ? { status: 404, body: { message: 'Not Found' } }
        : undefined,
    );

    const result = await commentOnPullRequest(github.fetchImpl, TOKEN, REPO, 42, 'x');

    expect(refusalReason(result)).toBe('#42 is not a pull request');
  });

  it('fails naming the status and message when the probe answers anything but 200 or 404', async () => {
    const github = scriptedGithub(() => ({ status: 403, body: { message: 'Forbidden' } }));

    const result = await commentOnPullRequest(github.fetchImpl, TOKEN, REPO, 42, 'x');

    expect(failureMessage(result)).toContain('403');
    expect(failureMessage(result)).toContain('Forbidden');
  });

  it('fails naming the status and message when the write answers anything but a 201', async () => {
    const github = scriptedGithub(commentScript({ status: 500, body: { message: 'boom' } }));

    const result = await commentOnPullRequest(github.fetchImpl, TOKEN, REPO, 42, 'x');

    expect(failureMessage(result)).toContain('500');
    expect(failureMessage(result)).toContain('boom');
  });
});

describe('replyToReviewComment', () => {
  it('POSTs the body as a reply on the review comment and reads back the id and URL', async () => {
    const github = scriptedGithub((request) =>
      `${request.method} ${request.url}` === `POST ${API}/pulls/42/comments/777/replies`
        ? { status: 201, body: { id: 778, html_url: `${API}/pull/42#discussion_r778` } }
        : undefined,
    );

    const result = await replyToReviewComment(github.fetchImpl, TOKEN, REPO, 42, 777, 'Fixed.');

    expect(result).toEqual({
      ok: true,
      value: { kind: 'replied', pr: 42, commentId: 778, url: `${API}/pull/42#discussion_r778` },
    });
    expect(github.requests[0]?.body).toEqual({ body: 'Fixed.' });
  });

  it('fails naming the status and message when the comment is not on that pull request', async () => {
    const github = scriptedGithub(() => ({ status: 404, body: { message: 'Not Found' } }));

    const result = await replyToReviewComment(github.fetchImpl, TOKEN, REPO, 42, 777, 'x');

    expect(failureMessage(result)).toContain('404');
    expect(failureMessage(result)).not.toContain(TOKEN);
  });
});

/** GitHub's REST reading of pull request 42. */
function pullRequest(state: 'open' | 'closed'): unknown {
  return { number: 42, node_id: 'PR_kwDOXyz', state, draft: false };
}

/** A script answering the pull request read, the reason comment and the close PATCH. */
function closeScript(
  read: unknown,
  patch: { status: number; body: unknown } = { status: 200, body: { state: 'closed' } },
): GithubScript {
  return (request) => {
    const line = `${request.method} ${request.url}`;
    if (line === `GET ${API}/pulls/42`) {
      return { status: 200, body: read };
    }
    if (line === `POST ${API}/issues/42/comments`) {
      return { status: 201, body: { id: 9003, html_url: `${API}/pull/42#issuecomment-9003` } };
    }
    return line === `PATCH ${API}/pulls/42` ? patch : undefined;
  };
}

describe('closePullRequest', () => {
  it('reads the pull request, posts the reason, then closes it', async () => {
    const github = scriptedGithub(closeScript(pullRequest('open')));

    const result = await closePullRequest(
      github.fetchImpl,
      TOKEN,
      REPO,
      42,
      'Superseded by #43.\n',
    );

    expect(result).toEqual({ ok: true, value: { kind: 'closed', pr: 42, commentId: 9003 } });
    expect(requestLines(github.requests)).toEqual([
      `GET ${API}/pulls/42`,
      `POST ${API}/issues/42/comments`,
      `PATCH ${API}/pulls/42`,
    ]);
    expect(github.requests[1]?.body).toEqual({ body: 'Superseded by #43.\n' });
    expect(github.requests[2]?.body).toEqual({ state: 'closed' });
  });

  it('refuses before either write when the pull request is not open', async () => {
    const github = scriptedGithub(closeScript(pullRequest('closed')));

    const result = await closePullRequest(github.fetchImpl, TOKEN, REPO, 42, 'x');

    expect(refusalReason(result)).toContain('not open');
    expect(github.requests).toHaveLength(1);
  });

  it('fails naming the posted comment when the close PATCH is refused after the reason landed', async () => {
    const github = scriptedGithub(
      closeScript(pullRequest('open'), { status: 422, body: { message: 'Validation Failed' } }),
    );

    const result = await closePullRequest(github.fetchImpl, TOKEN, REPO, 42, 'x');

    expect(result.ok).toBe(false);
    expect(failureMessage(result)).toContain('9003');
    expect(failureMessage(result)).toContain('422');
    expect(failureMessage(result)).toContain('Validation Failed');
  });

  it('fails naming the status when the pull request cannot be read', async () => {
    const github = scriptedGithub(() => ({ status: 404, body: { message: 'Not Found' } }));

    const result = await closePullRequest(github.fetchImpl, TOKEN, REPO, 42, 'x');

    expect(failureMessage(result)).toContain('404');
    expect(github.requests).toHaveLength(1);
  });

  it('fails as a value, never a throw, when the connection drops', async () => {
    const result = await closePullRequest(connectionRefused, TOKEN, REPO, 42, 'x');

    expect(result.ok).toBe(false);
    expect(failureMessage(result)).toContain('connection reset');
  });
});
