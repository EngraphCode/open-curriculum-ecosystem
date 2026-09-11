import { join } from 'node:path';

import { unwrapErr } from '@oaknational/result';
import { afterEach, describe, expect, it } from 'vitest';

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
import { cleanupSandboxes, sandbox, writeSandboxFile } from './test-helpers/io-sandbox.js';

afterEach(() => {
  cleanupSandboxes();
});

/**
 * A pure recorder over the descriptor-ordered write operations. On-disk mode
 * bits are a POSIX observable (NTFS reports every writable file identically),
 * so the owner-only guarantee is proven at the level the product actually
 * controls: WHAT it requested and IN WHAT ORDER — a fresh file created
 * exclusively at 0600, descriptor tightened before any content, closed, then
 * renamed over the destination (never opened by path).
 */
function recordingOps(statMode = 0o100600): {
  readonly calls: string[];
  readonly ops: OwnerOnlyWriteOps;
} {
  const calls: string[] = [];
  const ops: OwnerOnlyWriteOps = {
    open: (_path, flags, mode) => {
      calls.push(`open:${flags}:${mode.toString(8)}`);
      return 17;
    },
    fchmod: (fd, mode) => {
      calls.push(`fchmod:${String(fd)}:${mode.toString(8)}`);
    },
    fstat: (fd) => {
      calls.push(`fstat:${String(fd)}`);
      return statMode;
    },
    write: (fd) => {
      calls.push(`write:${String(fd)}`);
    },
    close: (fd) => {
      calls.push(`close:${String(fd)}`);
    },
    rename: () => {
      calls.push('rename');
    },
    unlink: () => {
      calls.push('unlink');
    },
  };
  return { calls, ops };
}

/**
 * The POSIX platform label every non-Windows test injects: the owner-only
 * ordering contract is proven on any host, while the running host's own
 * platform (a Windows leg refuses by design) is covered by the win32 tests.
 */
const POSIX: NodeJS.Platform = 'linux';

const ORDERED_OWNER_ONLY_WRITE = [
  'open:wx:600',
  'fchmod:17:600',
  'fstat:17',
  'write:17',
  'close:17',
  'rename',
];

describe('retainRawReport — verbatim retention with caller-shaped paths', () => {
  it('an unwritable target is a loud retention failure, never a throw', () => {
    const root = sandbox();
    // Occupy the report-dir path with a FILE so mkdir cannot create it.
    writeSandboxFile('a file where a directory must go', root, 'blocked');
    const io = buildMcpConformanceNodeIo(root, 'blocked', undefined, POSIX);
    const outcome = io.retainRawReport('protocol', 'content');
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.error.length > 0).toBe(true);
  });

  it('a retained report is owner-only by construction — created at 0600, descriptor tightened before any content lands', () => {
    // Attended runs carry credentials in vendor output. The ordering is the
    // whole guarantee: `mode` applies at creation only, and a chmod AFTER the
    // write would expose the payload in the window between them — so the
    // contract proven here, THROUGH the production retention surface, is
    // open(0600, exclusive) → fchmod(0600) → write → close on one descriptor
    // → rename over the destination, never a path re-open of the
    // destination. (On-disk mode bits are a POSIX observable NTFS cannot
    // express, so the requested-operations ordering is the invariant.)
    const root = sandbox();
    const { calls, ops } = recordingOps();
    const io = buildMcpConformanceNodeIo(root, join('tmp', 'reports'), ops, POSIX);

    const outcome = io.retainRawReport('protocol', '{"raw":"bytes"}');

    expect(outcome.ok).toBe(true);
    expect(calls).toEqual(ORDERED_OWNER_ONLY_WRITE);
  });

  it('the aggregate summary is owner-only through the same ordered write', () => {
    const root = sandbox();
    const { calls, ops } = recordingOps();

    const outcome = writeRunSummary(root, join('tmp', 'reports'), '{"verdict":"pass"}', ops, POSIX);

    expect(outcome.ok).toBe(true);
    expect(calls.indexOf('fchmod:17:600')).toBeGreaterThan(calls.indexOf('open:wx:600'));
    expect(calls.indexOf('fchmod:17:600')).toBeLessThan(calls.indexOf('write:17'));
  });

  it('an already-resolved absolute destination gets the same ordered owner-only write', () => {
    // The reviewer pack (`--pack-out`) embeds vendor failure text from authed
    // runs — the same content class the summary protects — so the absolute
    // path entry point must carry the identical ordering contract.
    const root = sandbox();
    const { calls, ops } = recordingOps();

    const outcome = retainOwnerOnlyAt(join(root, 'packs', 'reviewer-pack.md'), 'pack', ops, POSIX);

    expect(outcome.ok).toBe(true);
    expect(calls).toEqual(ORDERED_OWNER_ONLY_WRITE);
  });

  it('a chmod failure is a loud retention failure before any content lands; the descriptor still closes and no temporary file survives', () => {
    const root = sandbox();
    const { calls, ops } = recordingOps();
    const failing: OwnerOnlyWriteOps = {
      ...ops,
      fchmod: () => {
        throw new Error('EPERM: fchmod refused');
      },
    };
    const io = buildMcpConformanceNodeIo(root, join('tmp', 'reports'), failing, POSIX);

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
    // descriptor back is what turns a silent false claim into a refusal: the
    // recorder reports a world-readable 0644, and nothing is written.
    const root = sandbox();
    const { calls, ops } = recordingOps(0o100644);
    const io = buildMcpConformanceNodeIo(root, join('tmp', 'reports'), ops, POSIX);

    const outcome = io.retainRawReport('protocol', 'secret');

    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.error).toContain('0644');
    expect(calls).not.toContain('write:17');
    expect(calls).not.toContain('rename');
    expect(calls).toContain('close:17');
    expect(calls).toContain('unlink');
  });

  it('the mode refusal is typed, so a caller can tell it from an IO failure', () => {
    const root = sandbox();
    const { ops } = recordingOps(0o100666);

    expect(() => {
      writeOwnerOnly(join(root, 'summary.json'), 'secret', ops, POSIX);
    }).toThrow(OwnerOnlyModeNotHeldError);
  });

  it('on Windows the owner-only write is refused before any file is touched, with a typed error naming the reason', () => {
    // NTFS access control is ACL-based; fchmod cannot set it, so "owner-only"
    // would be a false claim there. The refusal precedes every filesystem
    // operation, so no artefact — protected or not — is ever created.
    const root = sandbox();
    const { calls, ops } = recordingOps();

    expect(() => {
      writeOwnerOnly(join(root, 'summary.json'), 'secret', ops, 'win32');
    }).toThrow(OwnerOnlyUnavailableError);
    expect(calls).toEqual([]);
  });

  it('on Windows every retention entry point yields a failed outcome naming the Windows refusal, and nothing is written', () => {
    const root = sandbox();
    const viaAbsolutePath = recordingOps();
    const viaReportDir = recordingOps();

    const packOutcome = retainOwnerOnlyAt(
      join(root, 'packs', 'reviewer-pack.md'),
      'pack',
      viaAbsolutePath.ops,
      'win32',
    );
    const reportOutcome = writeUnder(
      root,
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
    expect(viaAbsolutePath.calls).toEqual([]);
    expect(viaReportDir.calls).toEqual([]);
  });
});

// The resolve-and-spawn happy path is deliberately NOT proven here: test code
// must not spawn child processes (testing-strategy §Rules), and the real bin
// under the real install is exercised live by the scheduled unattended CI
// workflow on every run. This block describes OUR half of the seam only —
// the spawn-free resolution-failure branch.
describe('runMcpjam — bin-resolution failure is loud and spawn-free', () => {
  it('a root without the dependency yields a launch error naming pnpm install', () => {
    const emptyRoot = sandbox();
    const io = buildMcpConformanceNodeIo(emptyRoot, 'tmp/unused');
    const error = unwrapErr(io.runMcpjam(['--version']));
    expect(error.message).toContain('pnpm install');
  });
});
