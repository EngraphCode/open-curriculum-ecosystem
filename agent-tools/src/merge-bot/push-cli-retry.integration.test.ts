import { describe, expect, it } from 'vitest';

import { gitFake, REFUSED_PUSH, runPush } from './test-helpers/push-cli-double.js';

/**
 * `merge-bot push`'s bounded retry at the front door: a push GitHub refuses
 * before the pre-push hook runs is tried again on the retry's schedule, and
 * the run ends as an operational failure once the schedule is spent. Which
 * transcript is the refusal is `push-attempts.unit.test.ts`'s; the retry over
 * a run of attempts is `push-attempts.integration.test.ts`'s.
 */

describe('merge-bot push retry', () => {
  it('reports a push GitHub refused on every attempt as an operational failure, nothing on stdout, the refusal shown', async () => {
    const run = runPush({ args: ['--json'], git: gitFake(REFUSED_PUSH) });

    expect(await run.exit).toBe(1);
    expect(run.out()).toBe('');
    expect(run.errText()).toContain('denied to jimbot-oakington-iii[bot]');
    expect(run.errText()).toContain('nothing was pushed');
  });
});
