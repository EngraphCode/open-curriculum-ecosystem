import { afterEach, describe, expect, it } from 'vitest';

/**
 * The guard that bites: the unit suite must never load a stylesheet file.
 *
 * The package's vitest config disables happy-dom's stylesheet file loading
 * and handles a disabled load as success, because a `<link rel="stylesheet">`
 * with any href otherwise fires an unawaited fetch to the window's default
 * origin whose refusal lands as an unhandled error at random. That is a
 * configuration property, and a configuration property proves itself only
 * at its own boundary: this test appends an href-bearing link and asserts
 * the behaviour the settings guarantee — the link reports a synthetic load
 * and no error. That synthetic load is dispatched only on the disabled path;
 * with the settings gone, happy-dom's loader (which does not go through the
 * window's `fetch`, so a spy on it sees nothing) reaches for the network, the
 * link gets an `error` event once the connection is refused, and this test
 * fails deterministically instead of the suite failing at random. Proven both
 * ways on 2026-09-08: green under the config, red under a control config
 * without the settings, with the refused connection in the control's output.
 */

const flush = async (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

afterEach(() => {
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    link.remove();
  }
});

describe('unit-suite environment: stylesheet links never load files', () => {
  it('an href-bearing stylesheet link reports a synthetic load and no error', async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/guard.css';
    let loaded = false;
    let errored = false;
    link.addEventListener('load', () => {
      loaded = true;
    });
    link.addEventListener('error', () => {
      errored = true;
    });
    document.head.append(link);
    await flush();
    expect(loaded).toBe(true);
    expect(errored).toBe(false);
  });
});
