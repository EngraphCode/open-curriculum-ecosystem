/**
 * Unit tests for the pure halves of the ignore probe, over literal inputs and
 * literal git outputs (tests never use or create IO: `testing-strategy.md`
 * §Philosophy). The live probe's behaviour against a real scratch repository
 * was observed once, when it was built, and recorded in the pull request that
 * added it.
 */
import { describe, expect, it } from 'vitest';

import { ignoreProbeInput, isInstanceTier, parseIgnoredPaths } from './ignore-probe.js';

describe('ignoreProbeInput', () => {
  it('sends a directory candidate with its probe child and a file candidate alone, each record NUL-terminated', () => {
    expect(ignoreProbeInput(['comms/', 'a b.json'], 'child')).toBe(
      'comms/\u0000comms//child\u0000a b.json\u0000',
    );
  });
});

describe('parseIgnoredPaths', () => {
  it('reads a candidate git lists as ignored, and only that candidate', () => {
    expect(
      parseIgnoredPaths(['active-claims.json', 'README.md'], 'child', {
        status: 0,
        stdout: 'active-claims.json\u0000',
        stderr: '',
      }),
    ).toStrictEqual({ ok: true, value: new Set(['active-claims.json']) });
  });

  it('reads a file candidate as ignored only through its own name, never through a child path under it', () => {
    expect(
      parseIgnoredPaths(['comms', 'README.md'], 'child', {
        status: 0,
        stdout: 'comms/child\u0000',
        stderr: '',
      }),
    ).toStrictEqual({ ok: true, value: new Set() });
  });

  it('reads no candidate as ignored when git exits 1', () => {
    expect(
      parseIgnoredPaths(['README.md', 'docs'], 'child', { status: 1, stdout: '', stderr: '' }),
    ).toStrictEqual({ ok: true, value: new Set() });
  });

  it("refuses a probe git failed, carrying git's own standard error", () => {
    const stderr = 'fatal: not a git repository (or any of the parent directories): .git\n';
    expect(
      parseIgnoredPaths(['README.md'], 'child', { status: 128, stdout: '', stderr }),
    ).toStrictEqual({
      ok: false,
      error: { kind: 'git-failed', status: 128, stderr },
    });
  });

  it('refuses a probe from a git that exited without a status', () => {
    const stderr = 'spawnSync git ENOENT';
    expect(
      parseIgnoredPaths(['README.md'], 'child', { status: null, stdout: '', stderr }),
    ).toStrictEqual({
      ok: false,
      error: { kind: 'git-failed', status: null, stderr },
    });
  });

  it('keeps a listed path with a space or a newline whole', () => {
    expect(
      parseIgnoredPaths(['a b.json', 'a', 'odd\nname.json', 'odd'], 'child', {
        status: 0,
        stdout: 'a b.json\u0000odd\nname.json\u0000',
        stderr: '',
      }),
    ).toStrictEqual({ ok: true, value: new Set(['a b.json', 'odd\nname.json']) });
  });

  it('reads a directory candidate as ignored through the exact probe child it sent', () => {
    expect(
      parseIgnoredPaths(['comms/', 'comms'], 'child', {
        status: 0,
        stdout: 'comms//child\u0000',
        stderr: '',
      }),
    ).toStrictEqual({ ok: true, value: new Set(['comms/']) });
  });
});

describe('isInstanceTier', () => {
  const tracked = new Set([
    '.agent/state/collaboration/.gitignore',
    '.agent/state/collaboration/comms-archive/.gitkeep',
    '.agent/state/collaboration/comms-archive',
    '.agent/state/collaboration',
    '.agent/state',
    '.agent',
  ]);

  it('holds for a path the rules ignore and git does not track', () => {
    expect(
      isInstanceTier('.agent/state/collaboration/active-claims.json', {
        tracked,
        ignored: new Set(['.agent/state/collaboration/active-claims.json']),
      }),
    ).toBe(true);
  });

  it('does not hold for a path the rules ignore but git tracks: tracked beats ignored', () => {
    expect(
      isInstanceTier('.agent/state/collaboration/.gitignore', {
        tracked,
        ignored: new Set(['.agent/state/collaboration/.gitignore']),
      }),
    ).toBe(false);
  });

  it('does not hold for a path the rules do not ignore', () => {
    expect(
      isInstanceTier('.agent/state/collaboration/shared-comms-log.md', {
        tracked,
        ignored: new Set(),
      }),
    ).toBe(false);
  });

  it('counts an implied directory as tracked when it is probed with a trailing slash', () => {
    expect(
      isInstanceTier('.agent/state/collaboration/comms-archive/', {
        tracked,
        ignored: new Set(['.agent/state/collaboration/comms-archive/']),
      }),
    ).toBe(false);
  });

  it('holds for an ignored, untracked directory probed with a trailing slash', () => {
    expect(
      isInstanceTier('.agent/state/collaboration/comms/', {
        tracked,
        ignored: new Set(['.agent/state/collaboration/comms/']),
      }),
    ).toBe(true);
  });
});
