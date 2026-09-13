import { describe, expect, it } from 'vitest';

import { runReviewCostCli } from '../../src/review-cost/cli.js';

// A sink that records output; no gh, no git — every case here is refused before either runs.
const run = (args: readonly string[]) => {
  const out: string[] = [];
  const err: string[] = [];
  const exitCode = runReviewCostCli({
    args,
    stdout: {
      write: (chunk: string) => {
        out.push(chunk);
        return true;
      },
    },
    stderr: {
      write: (chunk: string) => {
        err.push(chunk);
        return true;
      },
    },
  });
  return { exitCode, stdout: out.join(''), stderr: err.join('') };
};

describe('review-cost gate — malformed invocations are refused as usage, never priced', () => {
  it('prints usage on --help', () => {
    const result = run(['gate', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('review-cost gate');
  });

  it('refuses a value flag with no value: --expect at the end never empties the reviewer set', () => {
    const result = run(['gate', '--branch', '--expect']);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('--expect needs a value');
  });

  it('refuses a flag-shaped value', () => {
    expect(run(['gate', '--pr', '--branch']).exitCode).toBe(2);
  });

  it('refuses a --pr that is not a positive integer', () => {
    const result = run(['gate', '--pr', 'abc']);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('positive integer');
  });

  it('refuses two selectors, and none', () => {
    expect(run(['gate', '--pr', '7', '--branch']).exitCode).toBe(2);
    expect(run(['gate']).exitCode).toBe(2);
    expect(run(['gate']).stderr).toContain('exactly one of');
  });

  it('refuses a survey without a date, with a malformed date, or with a selector', () => {
    expect(run(['survey']).exitCode).toBe(2);
    expect(run(['survey', '--since', '12/09/2026']).exitCode).toBe(2);
    expect(run(['survey', '--since', '2026-09-12', '--pr', '7']).exitCode).toBe(2);
  });

  it('refuses an unknown subcommand and an unknown flag', () => {
    expect(run(['price', '--pr', '7']).exitCode).toBe(2);
    expect(run(['gate', '--pr', '7', '--verbose']).exitCode).toBe(2);
  });
});
