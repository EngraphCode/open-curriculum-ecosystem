import { join, resolve } from 'node:path';

import { unwrapErr } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  buildMcpConformanceNodeIo,
  retainOwnerOnlyAt,
  writeRunSummary,
  writeUnder,
} from '../../src/mcp-conformance/node-io.js';
import {
  OwnerOnlyModeNotHeldError,
  OwnerOnlyUnavailableError,
  writeOwnerOnly,
  type OwnerOnlyWriteOps,
} from '../../src/mcp-conformance/owner-only-write.js';

/**
 * A recorder over the whole retention seam — directory creation, the ordered
 * descriptor write, and the rename — capturing both the ORDER of the requested
 * operations and their SUBJECTS: which directory, which path was opened, what
 * content was handed over, and what was renamed where.
 *
 * No test in this file touches a filesystem, because tests are NOT PERMITTED
 * to (`testing-strategy.md` §Test Types; the `no-real-io-in-tests` rule). That
 * is the starting point, not an outcome of how these happened to be written.
 *
 * Nothing is lost by it. Everything worth describing here is a property of OUR
 * code — the path it resolves, the content it hands over, the order it asks
 * for, and the fact that it never opens the destination. Whether the operating
 * system's `rename` replaces a symbolic link is a property of the operating
 * system; asserting it here would have been testing Node rather than the
 * product, which is why its former test is absent rather than relocated.
 *
 * `statMode` is what the descriptor reports back after the tightening: the
 * default is an owner-only regular file, and a test that wants the refusal
 * passes something else.
 */
function recordingOps(statMode = 0o100600): {
  readonly calls: string[];
  readonly madeDirs: string[];
  readonly opened: string[];
  readonly written: string[];
  readonly renames: { readonly from: string; readonly to: string }[];
  readonly ops: OwnerOnlyWriteOps;
} {
  const calls: string[] = [];
  const madeDirs: string[] = [];
  const opened: string[] = [];
  const written: string[] = [];
  const renames: { from: string; to: string }[] = [];
  const ops: OwnerOnlyWriteOps = {
    mkdir: (path) => {
      calls.push('mkdir');
      madeDirs.push(path);
    },
    open: (path, flags, mode) => {
      calls.push(`open:${flags}:${mode.toString(8)}`);
      opened.push(path);
      return 17;
    },
    fchmod: (fd, mode) => {
      calls.push(`fchmod:${String(fd)}:${mode.toString(8)}`);
    },
    fstat: (fd) => {
      calls.push(`fstat:${String(fd)}`);
      return statMode;
    },
    write: (fd, content) => {
      calls.push(`write:${String(fd)}`);
      written.push(content);
    },
    close: (fd) => {
      calls.push(`close:${String(fd)}`);
    },
    rename: (from, to) => {
      calls.push('rename');
      renames.push({ from, to });
    },
    unlink: () => {
      calls.push('unlink');
    },
  };
  return { calls, madeDirs, opened, written, renames, ops };
}

/**
 * The POSIX platform label every non-Windows test injects: the owner-only
 * contract is proven on any host, while the win32 refusal has its own tests.
 */
const POSIX: NodeJS.Platform = 'linux';

const ORDERED_OWNER_ONLY_WRITE = [
  'mkdir',
  'open:wx:600',
  'fchmod:17:600',
  'fstat:17',
  'write:17',
  'close:17',
  'rename',
];

describe('retainRawReport — verbatim retention with caller-shaped paths', () => {
  it('a relative report dir resolves under the repo root while the reported path stays caller-shaped', () => {
    const { madeDirs, renames, written, ops } = recordingOps();
    const io = buildMcpConformanceNodeIo('/repo', join('tmp', 'reports'), ops, POSIX);

    const outcome = io.retainRawReport('protocol', '{"raw":"bytes"}');

    expect(outcome).toEqual({ ok: true, reportedPath: join('tmp', 'reports', 'protocol.json') });
    expect(madeDirs).toEqual([resolve('/repo', join('tmp', 'reports'))]);
    expect(renames.map((move) => move.to)).toEqual([
      join(resolve('/repo', join('tmp', 'reports')), 'protocol.json'),
    ]);
    expect(written).toEqual(['{"raw":"bytes"}']);
  });

  it('an absolute report dir stands as given — written there and reported verbatim', () => {
    const elsewhere = resolve('/evidence', 'run-1');
    const { madeDirs, renames, written, ops } = recordingOps();
    const io = buildMcpConformanceNodeIo('/repo', elsewhere, ops, POSIX);

    const outcome = io.retainRawReport('oauth', 'verbatim');

    expect(outcome).toEqual({ ok: true, reportedPath: join(elsewhere, 'oauth.json') });
    expect(madeDirs).toEqual([elsewhere]);
    expect(renames.map((move) => move.to)).toEqual([join(elsewhere, 'oauth.json')]);
    expect(written).toEqual(['verbatim']);
  });

  it('a directory that cannot be created is a loud retention failure, never a throw', () => {
    const { calls, ops } = recordingOps();
    const blocked: OwnerOnlyWriteOps = {
      ...ops,
      mkdir: () => {
        throw new Error('ENOTDIR: a file where a directory must go');
      },
    };
    const io = buildMcpConformanceNodeIo('/repo', 'blocked', blocked, POSIX);

    const outcome = io.retainRawReport('protocol', 'content');

    expect(outcome).toEqual({ ok: false, error: 'ENOTDIR: a file where a directory must go' });
    expect(calls).not.toContain('open:wx:600');
  });

  it('the aggregate summary lands beside the raw reports with the caller-shaped path', () => {
    const { madeDirs, renames, written, ops } = recordingOps();

    const outcome = writeRunSummary(
      '/repo',
      join('tmp', 'reports'),
      '{"verdict":"pass"}',
      ops,
      POSIX,
    );

    expect(outcome).toEqual({ ok: true, reportedPath: join('tmp', 'reports', 'summary.json') });
    expect(madeDirs).toEqual([resolve('/repo', join('tmp', 'reports'))]);
    expect(renames.map((move) => move.to)).toEqual([
      join(resolve('/repo', join('tmp', 'reports')), 'summary.json'),
    ]);
    expect(written).toEqual(['{"verdict":"pass"}']);
  });

  it('a retained report is owner-only by construction — created at 0600, descriptor tightened and verified before any content lands', () => {
    // Attended runs carry credentials in vendor output. The ordering is the
    // whole guarantee: `mode` applies at creation only, and a chmod AFTER the
    // write would expose the payload in the window between them.
    const { calls, ops } = recordingOps();
    const io = buildMcpConformanceNodeIo('/repo', join('tmp', 'reports'), ops, POSIX);

    const outcome = io.retainRawReport('protocol', '{"raw":"bytes"}');

    expect(outcome.ok).toBe(true);
    expect(calls).toEqual(ORDERED_OWNER_ONLY_WRITE);
  });

  it('the destination is never opened — a temporary sibling is opened and renamed over it', () => {
    // Opening the destination would FOLLOW a symbolic link planted there and
    // truncate its target before the descriptor could be tightened. The
    // module's protection is that the destination is only ever a rename
    // target, which is a property of this code rather than of the OS.
    const { opened, renames, madeDirs, ops } = recordingOps();
    const destination = resolve('/packs', 'reviewer-pack.md');

    const outcome = retainOwnerOnlyAt(destination, 'pack', ops, POSIX);

    expect(outcome).toEqual({ ok: true, reportedPath: destination });
    expect(madeDirs).toEqual([resolve('/packs')]);
    expect(opened).toHaveLength(1);
    expect(opened[0]).not.toBe(destination);
    expect(opened[0]).toMatch(/[\\/]\.reviewer-pack\.md\..*\.tmp$/u);
    expect(renames).toEqual([{ from: opened[0], to: destination }]);
  });

  it('a chmod failure is a loud retention failure before any content lands; the descriptor still closes and no temporary file survives', () => {
    const { calls, ops } = recordingOps();
    const failing: OwnerOnlyWriteOps = {
      ...ops,
      fchmod: () => {
        throw new Error('EPERM: fchmod refused');
      },
    };
    const io = buildMcpConformanceNodeIo('/repo', join('tmp', 'reports'), failing, POSIX);

    const outcome = io.retainRawReport('protocol', 'secret');

    expect(outcome).toEqual({ ok: false, error: 'EPERM: fchmod refused' });
    expect(calls).not.toContain('write:17');
    expect(calls).not.toContain('rename');
    expect(calls).toContain('close:17');
    expect(calls).toContain('unlink');
  });

  it('a filesystem that does not honour the tightening is a loud refusal before any content lands', () => {
    // `fchmod` returns success on mounts that carry no POSIX permission bits,
    // so a successful call is not evidence the file is owner-only. Reading the
    // descriptor back turns a silent false claim into a refusal.
    const { calls, written, ops } = recordingOps(0o100644);
    const io = buildMcpConformanceNodeIo('/repo', join('tmp', 'reports'), ops, POSIX);

    const outcome = io.retainRawReport('protocol', 'secret');

    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.error).toContain('0644');
    expect(written).toEqual([]);
    expect(calls).not.toContain('rename');
    expect(calls).toContain('close:17');
    expect(calls).toContain('unlink');
  });

  it('the mode refusal is typed, so a caller can tell it from an IO failure', () => {
    const { ops } = recordingOps(0o100666);

    expect(() => {
      writeOwnerOnly(resolve('/repo', 'summary.json'), 'secret', ops, POSIX);
    }).toThrow(OwnerOnlyModeNotHeldError);
  });

  it('on Windows the owner-only write is refused before any file is touched, with a typed error naming the reason', () => {
    // NTFS access control is ACL-based; fchmod cannot set it, so "owner-only"
    // would be a false claim there. The refusal precedes every filesystem
    // operation, so no artefact — protected or not — is ever created.
    const { calls, ops } = recordingOps();

    expect(() => {
      writeOwnerOnly(resolve('/repo', 'summary.json'), 'secret', ops, 'win32');
    }).toThrow(OwnerOnlyUnavailableError);
    expect(calls).toEqual([]);
  });

  it('on Windows every retention entry point yields a failed outcome naming the Windows refusal, and nothing is written', () => {
    const viaAbsolutePath = recordingOps();
    const viaReportDir = recordingOps();

    const packOutcome = retainOwnerOnlyAt(
      resolve('/packs', 'reviewer-pack.md'),
      'pack',
      viaAbsolutePath.ops,
      'win32',
    );
    const reportOutcome = writeUnder(
      '/repo',
      join('tmp', 'reports'),
      'protocol.json',
      'secret',
      viaReportDir.ops,
      'win32',
    );

    for (const outcome of [packOutcome, reportOutcome]) {
      expect(outcome.ok).toBe(false);
      expect(!outcome.ok && outcome.error).toContain('win32');
      expect(!outcome.ok && outcome.error).toContain('ACL');
    }
    // Both entry points create their directory before reaching the refusal,
    // and neither writes anything.
    expect(viaAbsolutePath.calls).toEqual(['mkdir']);
    expect(viaReportDir.calls).toEqual(['mkdir']);
    expect(viaAbsolutePath.written).toEqual([]);
    expect(viaReportDir.written).toEqual([]);
  });
});

// The resolve-and-spawn happy path is deliberately NOT proven here: test code
// must not spawn child processes (testing-strategy §Rules), and the real bin
// under the real install is exercised live by the scheduled unattended CI
// workflow on every run. This block describes OUR half of the seam only —
// the spawn-free resolution-failure branch.
describe('runMcpjam — bin-resolution failure is loud and spawn-free', () => {
  it('a root without the dependency yields a launch error naming pnpm install', () => {
    const io = buildMcpConformanceNodeIo(resolve('/no-such-root'), 'tmp/unused');
    const error = unwrapErr(io.runMcpjam(['--version']));
    expect(error.message).toContain('pnpm install');
  });
});
