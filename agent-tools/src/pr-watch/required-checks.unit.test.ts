import { describe, expect, it } from 'vitest';

import { isBranchName, parseRequiredChecks } from './required-checks.js';

describe('parseRequiredChecks', () => {
  it('names the contexts of every required_status_checks rule and no other rule', () => {
    const required = parseRequiredChecks([
      { type: 'deletion' },
      { type: 'pull_request', parameters: { required_approving_review_count: 0 } },
      {
        type: 'required_status_checks',
        parameters: {
          required_status_checks: [{ context: 'run-quality-gates' }, { context: 'CodeQL' }],
          strict_required_status_checks_policy: false,
        },
      },
    ]);

    expect(required).toStrictEqual({ ok: true, value: ['run-quality-gates', 'CodeQL'] });
  });

  it('reads an unprotected branch as requiring nothing, and refuses a body that is not a rules list', () => {
    expect(parseRequiredChecks([])).toStrictEqual({ ok: true, value: [] });
    expect(parseRequiredChecks({ message: 'Not Found' }).ok).toBe(false);
  });
});

describe('isBranchName', () => {
  it('accepts plain branch names and refuses traversal or a leading separator', () => {
    expect(isBranchName('main')).toBe(true);
    expect(isBranchName('coordination/2026-10-10-f436b6')).toBe(true);
    expect(isBranchName('../main')).toBe(false);
    expect(isBranchName('/main')).toBe(false);
    expect(isBranchName('main..x')).toBe(false);
    expect(isBranchName('')).toBe(false);
  });
});
