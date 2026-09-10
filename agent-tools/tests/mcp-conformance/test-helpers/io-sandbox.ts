/**
 * Hermetic filesystem sandbox for the mcp-conformance integration tests:
 * real IO on behalf of tests, homed on the `test-helpers/` surface per the
 * no-real-io-in-tests structural allowlist. Each sandbox is a fresh temp
 * directory; `cleanupSandboxes` removes everything a test file created.
 */
import {
  lstatSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
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

/** Read a sandbox file as UTF-8. */
export function readSandboxFile(...segments: string[]): string {
  return readFileSync(join(...segments), 'utf8');
}

/** Write a sandbox file as UTF-8. */
export function writeSandboxFile(content: string, ...segments: string[]): void {
  writeFileSync(join(...segments), content, 'utf8');
}

/** Plant a symbolic link at `linkPath` pointing at `targetPath`. */
export function linkSandboxFile(targetPath: string, linkPath: string): void {
  symlinkSync(targetPath, linkPath);
}

/** Whether the entry at the path is itself a symbolic link (not followed). */
export function isSandboxSymbolicLink(...segments: string[]): boolean {
  return lstatSync(join(...segments)).isSymbolicLink();
}

/** The POSIX permission bits of the file at the path (the link target, if any). */
export function sandboxFileMode(...segments: string[]): number {
  return statSync(join(...segments)).mode & 0o777;
}

/** The entry names directly under a sandbox directory, in a stable order. */
export function listSandboxEntries(...segments: string[]): string[] {
  return readdirSync(join(...segments)).sort((a, b) => a.localeCompare(b));
}
