import { describe, expect, it } from 'vitest';

import {
  exitCodeFor,
  renderPullRequestOutcome,
  type PullRequestOutcome,
} from './pull-request-report.js';

/**
 * The pull-request outcome as the two streams carry it. Pure: an outcome in,
 * the text for stdout and stderr out. `--json` puts exactly the outcome
 * object on stdout; a refusal always reaches stderr.
 */

const DONE: readonly PullRequestOutcome[] = [
  { kind: 'opened', number: 42, url: 'https://github.com/acme/widgets/pull/42' },
  { kind: 'commented', pr: 42, commentId: 9001, url: 'https://github.com/acme/widgets/pull/42#i' },
  { kind: 'replied', pr: 42, commentId: 9002, url: 'https://github.com/acme/widgets/pull/42#r' },
  { kind: 'resolved', pr: 42, thread: 'PRRT_kwDOAbc' },
  { kind: 'ready', pr: 42 },
  { kind: 'closed', pr: 42, commentId: 9003 },
];

const REFUSED: PullRequestOutcome = { kind: 'refused', reason: '#42 is not a draft' };

describe('renderPullRequestOutcome', () => {
  it.each(DONE)('renders exactly the $kind object on stdout under --json', (outcome) => {
    const rendered = renderPullRequestOutcome(outcome, true);

    expect(JSON.parse(rendered.stdout)).toEqual(outcome);
    expect(rendered.stderr).toBe('');
  });

  it.each(DONE)('renders a $kind line on stdout alone, naming the pull request', (outcome) => {
    const rendered = renderPullRequestOutcome(outcome, false);

    expect(rendered.stdout).toContain(outcome.kind);
    expect(rendered.stdout).toContain('42');
    expect(rendered.stderr).toBe('');
  });

  it('renders a refusal on stderr, and under --json the object on stdout too', () => {
    const plain = renderPullRequestOutcome(REFUSED, false);
    const json = renderPullRequestOutcome(REFUSED, true);

    expect(plain.stdout).toBe('');
    expect(plain.stderr).toContain('refused: #42 is not a draft');
    expect(JSON.parse(json.stdout)).toEqual(REFUSED);
    expect(json.stderr).toContain('refused');
  });
});

describe('exitCodeFor', () => {
  it.each(DONE)('maps $kind to 0', (outcome) => {
    expect(exitCodeFor(outcome)).toBe(0);
  });

  it('maps a refusal to 3', () => {
    expect(exitCodeFor(REFUSED)).toBe(3);
  });
});
