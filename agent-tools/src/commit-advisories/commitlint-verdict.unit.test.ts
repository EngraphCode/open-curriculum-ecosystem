import { describe, expect, it } from 'vitest';

import { commitlintArgs, exitCodeForCommitlintStatus } from './commitlint-verdict.js';

describe('exitCodeForCommitlintStatus', () => {
  it('reads a clean commitlint run as a conforming message', () => {
    expect(exitCodeForCommitlintStatus(0)).toBe(0);
  });

  it('reads a strict-mode warning as a violation, never as invalid usage', () => {
    // commitlint --strict exits 2 for warnings; this tool reserves 2 for bad usage.
    expect(exitCodeForCommitlintStatus(2)).toBe(1);
  });

  it('reads a strict-mode rule error as a violation', () => {
    expect(exitCodeForCommitlintStatus(3)).toBe(1);
  });

  it('reads status 1 as no verdict: under strict mode it is never a lint result', () => {
    // Strict mode gives every lint result 2 or 3, so 1 is an operational
    // failure (no input, an unreadable message file, a broken runner).
    expect(exitCodeForCommitlintStatus(1)).toBe(2);
  });

  it('reads a commitlint that never ran as no verdict', () => {
    expect(exitCodeForCommitlintStatus(null)).toBe(2);
  });

  it('reads a status outside the lint range as no verdict, never as a violation', () => {
    // commitlint exits 9 when it finds no configuration.
    expect(exitCodeForCommitlintStatus(9)).toBe(2);
  });
});

describe('commitlintArgs', () => {
  it('asks for strict mode, so a warning is a verdict against the message', () => {
    expect(commitlintArgs('MSG')).toContain('--strict');
  });

  it('lints the given message file', () => {
    expect(commitlintArgs('MSG').slice(-2)).toEqual(['--edit', 'MSG']);
  });
});
