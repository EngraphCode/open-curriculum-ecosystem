import { describe, expect, it } from 'vitest';

import type { PrStateReading } from '../pr-watch/state-types.js';
import type { GithubApiFetch } from './mint-installation-token.js';
import { ReadingUnavailableError, runMergeExecution } from './merge.js';
import { makeInput } from './test-helpers/merge-execution-input.js';
import { settledReading } from './test-helpers/pr-state-reading.js';

const makeReading = settledReading;

/**
 * The records class at the execution level: the class is read from the diff
 * only on a verdict where it decides, a records fold merges while its vendor
 * leg is still owed, a code diff on the same verdict stays at the door, and a
 * settled verdict reads no files at all.
 */
describe('runMergeExecution — the records class (the owner ruling of 2026-09-03)', () => {
  /** A fetch port that also serves the changed files, the base ref and the base branch's rules. */
  function makeClassPort(
    files: readonly { filename: string }[],
    options: {
      readonly required?: readonly string[];
      readonly failing?: string;
      /** Rules served by page; absent, one page carrying `required`. */
      readonly rulesPages?: readonly (readonly unknown[])[];
    } = {},
  ): { fetchImpl: GithubApiFetch; calls: { url: string }[] } {
    const calls: { url: string }[] = [];
    const required = options.required ?? ['run-quality-gates', 'CodeQL'];
    const defaultRules = [
      {
        type: 'required_status_checks',
        parameters: { required_status_checks: required.map((context) => ({ context })) },
      },
    ];
    const rulesAnswer = (url: string): unknown => {
      const page = Number(/[&?]page=(\d+)/u.exec(url)?.[1] ?? '1');
      if (options.rulesPages === undefined) {
        return page === 1 ? defaultRules : [];
      }
      return options.rulesPages[page - 1] ?? [];
    };
    const answer = (url: string): unknown => {
      if (url.includes('/pulls/42/files')) {
        return files;
      }
      if (url.endsWith('/pulls/42/merge')) {
        return { merged: true, sha: 'mergesha1' };
      }
      if (url.endsWith('/pulls/42')) {
        return { base: { ref: 'main' } };
      }
      return url.includes('/rules/branches/main') ? rulesAnswer(url) : { allow_merge_commit: true };
    };
    const fetchImpl: GithubApiFetch = (url) => {
      calls.push({ url });
      if (options.failing !== undefined && url.includes(options.failing)) {
        return Promise.resolve({ status: 502, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ status: 200, json: () => Promise.resolve(answer(url)) });
    };
    return { fetchImpl, calls };
  }

  /** The refusal's verdict state, or undefined when the outcome was not a refusal. */
  const refusedState = (
    outcome: Awaited<ReturnType<typeof runMergeExecution>>,
  ): string | undefined =>
    outcome.ok && outcome.value.kind === 'refused' ? outcome.value.verdictState : undefined;
  /** The refusal's evidence lines, or none when the outcome was not a refusal. */
  const refusedEvidence = (
    outcome: Awaited<ReturnType<typeof runMergeExecution>>,
  ): readonly string[] =>
    outcome.ok && outcome.value.kind === 'refused' ? outcome.value.evidence : [];

  /**
   * The bot's own pull request (the ruling's class), the vendor leg owed: no
   * review binds the tip, and the required contexts went green by name two
   * minutes ago.
   */
  const owedLegReading = (): PrStateReading =>
    makeReading({
      author: 'app/acme-bot',
      reviews: [],
      checksGreenAt: '2026-08-06T08:58:00Z',
      namedChecks: [
        { name: 'run-quality-gates', bucket: 'passed' },
        { name: 'CodeQL', bucket: 'passed' },
      ],
      checks: { total: 2, passed: 2, failed: 0, pending: 0 },
    });

  /**
   * The same owed leg on a tip that has reported only a check the rules do
   * not name: no check run exists yet for either required context, so the
   * verdict ladder reads every reported check green.
   */
  const requiredUnreportedReading = (): PrStateReading =>
    makeReading({ author: 'app/acme-bot', reviews: [], checksGreenAt: '2026-08-06T08:58:00Z' });

  /** The real fold shape: required checks green, the vendor's own review run still pending. */
  const vendorRunPendingReading = (): PrStateReading =>
    makeReading({
      author: 'app/acme-bot',
      reviews: [],
      checksGreenAt: null,
      namedChecks: [
        { name: 'run-quality-gates', bucket: 'passed' },
        { name: 'CodeQL', bucket: 'passed' },
        { name: 'copilot-pull-request-reviewer', bucket: 'pending' },
      ],
      checks: { total: 3, passed: 2, failed: 0, pending: 1 },
    });

  const recordsFiles = [
    { filename: '.agent/memory/active/napkin.md' },
    { filename: '.agent/memory/operational/repo-continuity.md' },
  ];

  it('merges a records fold at checks green while the vendor leg is still owed, naming the ground', async () => {
    const { fetchImpl, calls } = makeClassPort(recordsFiles);

    const outcome = await runMergeExecution(makeInput(owedLegReading(), fetchImpl));

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.value.kind).toBe('merged');
      expect(
        outcome.value.evidence.some((line) => line.startsWith('records-class (2 changed paths')),
      ).toBe(true);
    }
    const urls = calls.map((call) => call.url);
    expect(urls.findIndex((url) => url.includes('/pulls/42/files'))).toBeLessThan(
      urls.findIndex((url) => url.endsWith('/pulls/42/merge')),
    );
    expect(urls.some((url) => url.includes('/rules/branches/main'))).toBe(true);
  });

  it('holds a records fold on an owed leg until every REQUIRED context has reported on the tip, naming the missing ones', async () => {
    const { fetchImpl, calls } = makeClassPort(recordsFiles);

    const outcome = await runMergeExecution(makeInput(requiredUnreportedReading(), fetchImpl));

    expect(refusedState(outcome)).toBe('CHECKS-RUNNING');
    expect(
      refusedEvidence(outcome).some(
        (line) => line.includes('not reported') && line.includes('(run-quality-gates, CodeQL)'),
      ),
    ).toBe(true);
    expect(calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
    expect(calls.some((call) => call.url.includes('/pulls/42/files'))).toBe(false);
  });

  it("merges a records fold whose only pending check is the vendor's own review run, naming what was set aside", async () => {
    const { fetchImpl, calls } = makeClassPort(recordsFiles);

    const outcome = await runMergeExecution(makeInput(vendorRunPendingReading(), fetchImpl));

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.value.kind).toBe('merged');
      expect(
        outcome.value.evidence.some((line) =>
          line.includes('set aside (copilot-pull-request-reviewer)'),
        ),
      ).toBe(true);
    }
    expect(calls.some((call) => call.url.includes('/rules/branches/main'))).toBe(true);
  });

  it('keeps a code diff at the door on the same pending vendor run and sends no merge', async () => {
    const { fetchImpl, calls } = makeClassPort([
      { filename: '.agent/memory/active/napkin.md' },
      { filename: 'agent-tools/src/merge-bot/merge.ts' },
    ]);

    const outcome = await runMergeExecution(makeInput(vendorRunPendingReading(), fetchImpl));

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.value.kind).toBe('refused');
      if (outcome.value.kind === 'refused') {
        expect(outcome.value.verdictState).toBe('CHECKS-RUNNING');
      }
    }
    expect(calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
    expect(calls.some((call) => call.url.includes('/pulls/42/files'))).toBe(true);
  });

  it('holds a records fold while a REQUIRED context is pending, whatever else is set aside', async () => {
    const { fetchImpl, calls } = makeClassPort(recordsFiles, {
      required: ['run-quality-gates', 'CodeQL', 'secret-scan'],
    });

    const outcome = await runMergeExecution(makeInput(vendorRunPendingReading(), fetchImpl));

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.value.kind).toBe('refused');
      if (outcome.value.kind === 'refused') {
        expect(outcome.value.verdictState).toBe('CHECKS-RUNNING');
      }
    }
    expect(calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
  });

  it('keeps a code diff at the door on an owed leg and names the code paths', async () => {
    const { fetchImpl, calls } = makeClassPort([
      { filename: '.agent/memory/active/napkin.md' },
      { filename: 'agent-tools/src/merge-bot/merge.ts' },
    ]);

    const outcome = await runMergeExecution(makeInput(owedLegReading(), fetchImpl));

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.value.kind).toBe('refused');
      if (outcome.value.kind === 'refused') {
        expect(outcome.value.verdictState).toBe('SILENT-WAIT-NO-REVIEWER');
        expect(outcome.value.reason).toContain('agent-tools/src/merge-bot/merge.ts');
      }
    }
    expect(calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
  });

  it('reads no files on a settled verdict: a failing files port cannot stop the merge there', async () => {
    const { fetchImpl } = makeClassPort([{ filename: 'agent-tools/src/merge-bot/merge.ts' }], {
      failing: '/pulls/42/files',
    });

    const outcome = await runMergeExecution(makeInput(makeReading(), fetchImpl));

    expect(outcome.ok && outcome.value.kind === 'merged').toBe(true);
  });

  it('reports a failed rules or files read on an owed leg as a retryable reading failure, never a merge', async () => {
    const rules = makeClassPort(recordsFiles, { failing: '/rules/branches/' });
    const files = makeClassPort(recordsFiles, { failing: '/pulls/42/files' });

    const onRules = await runMergeExecution(makeInput(owedLegReading(), rules.fetchImpl));
    const onFiles = await runMergeExecution(makeInput(owedLegReading(), files.fetchImpl));

    for (const [outcome, surface] of [
      [onRules, 'branch rules read answered 502'],
      [onFiles, 'changed files read answered 502'],
    ] as const) {
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) {
        expect(outcome.error).toBeInstanceOf(ReadingUnavailableError);
        expect(outcome.error.message).toContain(surface);
      }
    }
    expect(rules.calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
    expect(files.calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
  });

  it('keeps CHECKS-RUNNING as read, naming the reason, when the rules or the files cannot be read this poll', async () => {
    const rules = makeClassPort(recordsFiles, { failing: '/rules/branches/' });
    const files = makeClassPort(recordsFiles, { failing: '/pulls/42/files' });

    const onRules = await runMergeExecution(makeInput(vendorRunPendingReading(), rules.fetchImpl));
    const onFiles = await runMergeExecution(makeInput(vendorRunPendingReading(), files.fetchImpl));

    for (const outcome of [onRules, onFiles]) {
      expect(outcome.ok).toBe(true);
      if (outcome.ok) {
        expect(outcome.value.kind).toBe('refused');
        if (outcome.value.kind === 'refused') {
          expect(outcome.value.verdictState).toBe('CHECKS-RUNNING');
          expect(
            outcome.value.evidence.some((line) =>
              line.startsWith('records-class narrowing unavailable this poll:'),
            ),
          ).toBe(true);
        }
      }
    }
    expect(rules.calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
    expect(files.calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
  });

  it('reads every rules page: a required context on the second page still binds', async () => {
    const filler = Array.from({ length: 100 }, () => ({ type: 'deletion' }));
    const secondPage = [
      {
        type: 'required_status_checks',
        parameters: {
          required_status_checks: [{ context: 'run-quality-gates' }, { context: 'CodeQL' }],
        },
      },
    ];
    const { fetchImpl, calls } = makeClassPort(recordsFiles, { rulesPages: [filler, secondPage] });

    const outcome = await runMergeExecution(makeInput(vendorRunPendingReading(), fetchImpl));

    expect(outcome.ok && outcome.value.kind).toBe('merged');
    expect(calls.filter((call) => call.url.includes('/rules/branches/main'))).toHaveLength(2);
  });

  it('closes the records door on a pull request a person authored, whatever its paths', async () => {
    const pending = makeClassPort(recordsFiles);
    const owed = makeClassPort(recordsFiles);
    const human = { author: 'jimCresswell' };

    const onPending = await runMergeExecution(
      makeInput({ ...vendorRunPendingReading(), ...human }, pending.fetchImpl),
    );
    const onOwed = await runMergeExecution(
      makeInput({ ...owedLegReading(), ...human }, owed.fetchImpl),
    );

    expect(refusedState(onPending)).toBe('CHECKS-RUNNING');
    expect(refusedState(onOwed)).toBe('SILENT-WAIT-NO-REVIEWER');
    for (const outcome of [onPending, onOwed]) {
      expect(
        refusedEvidence(outcome).some((line) =>
          line.startsWith('records-class door closed: the author jimCresswell'),
        ),
      ).toBe(true);
    }
    for (const port of [pending, owed]) {
      expect(port.calls.some((call) => call.url.includes('/pulls/42/files'))).toBe(false);
      expect(port.calls.some((call) => call.url.includes('/rules/branches/'))).toBe(false);
    }
  });

  it('reads no files while a code-class pull request waits on its own required checks', async () => {
    const { fetchImpl, calls } = makeClassPort([
      { filename: 'agent-tools/src/merge-bot/merge.ts' },
    ]);
    const requiredPending = makeReading({
      reviews: [],
      checksGreenAt: null,
      namedChecks: [
        { name: 'run-quality-gates', bucket: 'pending' },
        { name: 'CodeQL', bucket: 'passed' },
      ],
      checks: { total: 2, passed: 1, failed: 0, pending: 1 },
    });

    const outcome = await runMergeExecution(makeInput(requiredPending, fetchImpl));

    expect(outcome.ok && outcome.value.kind === 'refused' && outcome.value.verdictState).toBe(
      'CHECKS-RUNNING',
    );
    expect(calls.some((call) => call.url.includes('/pulls/42/files'))).toBe(false);
  });
});
