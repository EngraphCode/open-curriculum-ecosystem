import { describe, expect, it } from 'vitest';

import type { GitCommandResult } from './git-executor.js';
import {
  BRANCH,
  gitFake,
  mintFetch,
  PUSHED,
  REFUSED_PUSH,
  REMOTE,
  runPush,
  TOKEN,
} from './test-helpers/push-cli-double.js';

/**
 * `merge-bot push`'s bounded retry at the front door: a push GitHub refused
 * before the pre-push hook ran is tried again with a fresh token, up to three
 * attempts, and anything else is final at once. Which transcript is the
 * refusal, and the retry's clock, are `push-attempts.unit.test.ts`'s.
 */

/**
 * The repository's own pre-push gate chain on a green run, 1,852,962 bytes
 * (measured 2026-08-06, `merge-bot-push-output.smoke.ts` holds the
 * measurement), twice over: R1's proof bar for output this command does not
 * control.
 */
const DRIVE_BYTES = 1_852_962 * 2;

describe('merge-bot push retry', () => {
  it('tries a push GitHub refused before the hook ran again, and reports the push that went through', async () => {
    const run = runPush({
      args: ['--json'],
      git: gitFake({ pushes: [REFUSED_PUSH, PUSHED], viaSink: true }),
      overrides: { sleepImpl: () => Promise.resolve() },
    });

    expect(await run.exit).toBe(0);
    expect(JSON.parse(run.out())).toEqual({ kind: 'pushed', branch: BRANCH, remote: REMOTE });
    expect(run.errText()).toContain('denied to jimbot-oakington-iii[bot]');
    expect(run.errText()).toContain('GitHub refused attempt 1 of 3 before the pre-push hook ran');
    expect(run.errText()).toContain('abc1234..def5678');
    expect(run.errText()).not.toContain(TOKEN);
  });

  it('mints a fresh token for each attempt: the attempt after the refusal carries a new one', async () => {
    const run = runPush({
      git: gitFake({ pushes: [REFUSED_PUSH, PUSHED] }),
      fetch: mintFetch('installation-token-refused', 'installation-token-fresh'),
      overrides: { sleepImpl: () => Promise.resolve() },
    });

    expect(await run.exit).toBe(0);
    // The token store is the output port each attempt writes its token through.
    expect(run.writes.map((write) => write.content)).toEqual([
      'installation-token-refused',
      'installation-token-fresh',
    ]);
    expect(run.errText()).toContain('GitHub refused attempt 1 of 3');
    expect(run.errText()).not.toContain('installation-token');
  });

  it('surfaces the third refusal as an operational failure, each refusal shown', async () => {
    const run = runPush({
      args: ['--json'],
      git: gitFake({ pushes: [REFUSED_PUSH] }),
      overrides: { sleepImpl: () => Promise.resolve() },
    });

    expect(await run.exit).toBe(1);
    expect(run.out()).toBe('');
    expect(run.errText().match(/returned error: 403/gu)).toHaveLength(3);
    expect(run.errText()).toContain(
      'GitHub refused the push 3 times before the pre-push hook ran, each refusal shown above; nothing was pushed',
    );
  });

  it('never tries again a push that failed after the hook ran', async () => {
    const afterGate: GitCommandResult = {
      ...REFUSED_PUSH,
      stderr: `Running pre-push checks...\nPre-push checks completed!\n${REFUSED_PUSH.stderr}`,
    };
    const run = runPush({
      git: gitFake({ pushes: [afterGate, PUSHED], viaSink: true }),
      overrides: { sleepImpl: () => Promise.resolve() },
    });

    expect(await run.exit).toBe(1);
    expect(run.errText().match(/Running pre-push checks/gu)).toHaveLength(1);
    expect(run.errText()).not.toContain('trying again');
  });

  it('streams a failed push that printed twice the measured gate output in full, and never takes it for the refusal (R1)', async () => {
    const loud: GitCommandResult = { ...REFUSED_PUSH, stdout: 'x'.repeat(DRIVE_BYTES) };
    const run = runPush({
      git: gitFake({ pushes: [loud, PUSHED], viaSink: true }),
      overrides: { sleepImpl: () => Promise.resolve() },
    });

    expect(await run.exit).toBe(1);
    expect(run.errText().length).toBeGreaterThan(DRIVE_BYTES);
    expect(run.errText()).not.toContain('trying again');
  });
});
