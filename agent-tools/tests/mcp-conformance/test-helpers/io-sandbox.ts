/**
 * Hermetic filesystem sandbox for the mcp-conformance integration tests:
 * real IO on behalf of tests, homed on the `test-helpers/` surface per the
 * no-real-io-in-tests structural allowlist. Each sandbox is a fresh temp
 * directory; `cleanupSandboxes` removes everything a test file created.
 *
 * The read-back helpers this module used to carry — file reads, symbolic-link
 * planting, link detection, directory listing — left with the tests that used
 * them. Those tests assert what LANDS ON DISK, which is a smoke-tier concern
 * under `.agent/directives/testing-strategy.md`, and they now live in
 * `smoke-tests/owner-only-write-posix.smoke.ts` reading the real filesystem
 * directly. What remains here is what the in-process suites still need: a
 * tracked temporary directory, and a way to occupy a path before a test runs.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const created: string[] = [];

/** Create a fresh temp directory, tracked for cleanup. */
export function sandbox(): string {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-conformance-io-'));
  created.push(dir);
  return dir;
}

/** Remove every sandbox created since the last cleanup. */
export function cleanupSandboxes(): void {
  for (const dir of created.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Write a sandbox file as UTF-8. */
export function writeSandboxFile(content: string, ...segments: string[]): void {
  writeFileSync(join(...segments), content, 'utf8');
}
