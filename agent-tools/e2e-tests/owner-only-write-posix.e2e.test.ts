import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  buildMcpConformanceNodeIo,
  retainOwnerOnlyAt,
  writeRunSummary,
} from '../src/mcp-conformance/node-io.js';
import {
  cleanupSandboxes,
  isSandboxSymbolicLink,
  linkSandboxFile,
  listSandboxEntries,
  readSandboxFile,
  sandbox,
  writeSandboxFile,
} from '../tests/mcp-conformance/test-helpers/io-sandbox.js';

/**
 * Owner-only retention against the REAL filesystem.
 *
 * These describe what lands on disk when the production `node:fs` adapter runs:
 * the resolved path, the file's content, and a planted symbolic link replaced
 * rather than followed. They live in the e2e suite because they need a
 * filesystem with POSIX permission semantics, and that is an environment
 * resource rather than a property of the code.
 *
 * The reason is specific. `writeOwnerOnly` reads the descriptor's mode back
 * after `fchmod(0600)` and refuses when it is anything else, so on a filesystem
 * that cannot express owner-only — NTFS reports every writable file as 0666 —
 * the production write correctly refuses and these expectations cannot hold.
 * Their sibling unit suite proves the ordering, the verification and both
 * refusals through the recorded ops seam, with no filesystem at all, so it runs
 * identically on every host including the Windows CI leg.
 *
 * Nothing here is conditional: every test registers and runs unconditionally
 * wherever this suite is invoked, and the suite is invoked by `test:e2e`
 * (`.agent/rules/no-conditional-tests.md` §Diagnosis 3 — an absent environment
 * resource moves the suite, never guards the test).
 */

afterEach(() => {
  cleanupSandboxes();
});

/**
 * The POSIX platform label these tests inject: the win32 entry-point refusal is
 * proven in the unit suite, and here the platform argument simply selects the
 * path whose on-disk effects are the subject.
 */
const POSIX: NodeJS.Platform = 'linux';

describe('owner-only retention on a real POSIX filesystem', () => {
  it('a relative report dir writes under the repo root and reports the relative path', () => {
    const root = sandbox();
    const io = buildMcpConformanceNodeIo(root, join('tmp', 'reports'), undefined, POSIX);
    const outcome = io.retainRawReport('protocol', '{"raw":"bytes"}');
    expect(outcome).toEqual({ ok: true, reportedPath: join('tmp', 'reports', 'protocol.json') });
    expect(readSandboxFile(root, 'tmp', 'reports', 'protocol.json')).toBe('{"raw":"bytes"}');
  });

  it('an absolute report dir stands as given — written there and reported verbatim', () => {
    const root = sandbox();
    const elsewhere = join(sandbox(), 'evidence');
    const io = buildMcpConformanceNodeIo(root, elsewhere, undefined, POSIX);
    const outcome = io.retainRawReport('oauth', 'verbatim');
    expect(outcome).toEqual({ ok: true, reportedPath: join(elsewhere, 'oauth.json') });
    expect(readSandboxFile(elsewhere, 'oauth.json')).toBe('verbatim');
  });

  it('the aggregate summary lands beside the raw reports with the caller-shaped path', () => {
    const root = sandbox();
    const outcome = writeRunSummary(
      root,
      join('tmp', 'reports'),
      '{"verdict":"pass"}',
      undefined,
      POSIX,
    );
    expect(outcome).toEqual({ ok: true, reportedPath: join('tmp', 'reports', 'summary.json') });
    expect(readSandboxFile(root, 'tmp', 'reports', 'summary.json')).toBe('{"verdict":"pass"}');
  });

  it('a symbolic link planted at the destination is replaced by an owner-only regular file; its target is left untouched', () => {
    // A stale or planted report link must never be FOLLOWED: opening the
    // destination for writing would truncate and overwrite the link's target
    // (a file outside the report directory) before any descriptor could be
    // tightened. The real `node:fs` adapter is exercised here, so the on-disk
    // state is the observable; the requested 0600 mode is proven by the ordered
    // recorder tests, because NTFS reports no POSIX mode bits to read back.
    const root = sandbox();
    const target = join(root, 'target.txt');
    const destination = join(root, 'reviewer-pack.md');
    writeSandboxFile('original', target);
    linkSandboxFile(target, destination);

    const outcome = retainOwnerOnlyAt(destination, 'fresh', undefined, POSIX);

    expect(outcome).toEqual({ ok: true, reportedPath: destination });
    expect(readSandboxFile(target)).toBe('original');
    expect(isSandboxSymbolicLink(destination)).toBe(false);
    expect(readSandboxFile(destination)).toBe('fresh');
    expect(listSandboxEntries(root)).toEqual(['reviewer-pack.md', 'target.txt']);
  });
});
