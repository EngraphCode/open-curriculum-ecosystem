import { describe, expect, it } from 'vitest';

import { isAdvertisementRefusal } from './push-attempts.js';

/**
 * Which failed push is GitHub's refusal at the ref advertisement, read from a
 * captured transcript. The retry over a run of attempts is
 * `push-attempts.integration.test.ts`'s; the push itself, minted and
 * transferred, is `push-cli.integration.test.ts`'s.
 */

/** GitHub's refusal as git printed it on 2026-09-28, the repository and bot renamed. */
const REFUSAL =
  'remote: Permission to acme/widgets.git denied to jimbot-oakington-iii[bot].\n' +
  "fatal: unable to access 'https://github.com/acme/widgets.git/': The requested URL returned error: 403\n";

describe('isAdvertisementRefusal', () => {
  it('holds for git exiting 128 on its own with the two refusal lines and nothing else', () => {
    expect(isAdvertisementRefusal(128, null, REFUSAL)).toBe(true);
  });

  it('holds when the lines end with carriage returns or blank lines surround them', () => {
    expect(isAdvertisementRefusal(128, null, `\n${REFUSAL.replaceAll('\n', '\r\n')}\n`)).toBe(true);
  });

  it('does not hold when anything else was printed, such as the pre-push gate', () => {
    expect(isAdvertisementRefusal(128, null, `Running pre-push checks...\n${REFUSAL}`)).toBe(false);
  });

  it('does not hold for a fatal exit that printed nothing', () => {
    expect(isAdvertisementRefusal(128, null, '')).toBe(false);
  });

  it('does not hold for another exit', () => {
    expect(isAdvertisementRefusal(1, null, REFUSAL)).toBe(false);
  });

  it('does not hold when a signal ended the push, which the executor also reports as 128', () => {
    expect(isAdvertisementRefusal(128, 'SIGTERM', REFUSAL)).toBe(false);
  });

  it('does not hold for another failure at the same request', () => {
    const notFound = REFUSAL.replace('error: 403', 'error: 404');
    expect(isAdvertisementRefusal(128, null, notFound)).toBe(false);
    expect(isAdvertisementRefusal(128, null, REFUSAL.split('\n')[1] ?? '')).toBe(false);
  });
});
