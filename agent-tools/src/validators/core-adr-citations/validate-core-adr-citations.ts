#!/usr/bin/env node

/**
 * Core ADR-citation validator: no file under `.agent/practice-core/` carries
 * an ADR identifier (PDR-105's portability axis; the `practice-core-portability`
 * rule).
 *
 * Scans every tracked Core file for the written ADR citation and refuses each
 * one it finds (see the helpers module for what counts as a citation). The gate
 * is strict: nothing exempts a citation.
 *
 * Wired into root `docs-validators:check`, which runs in `pnpm check`,
 * `pnpm check:docs` and CI. Exit 0 = clean; 1 = findings; 2 = refusal (no
 * tracked Core file, or a Core file unreadable or not scannable as text). The
 * status is returned from `main` and set on `process.exitCode`, so buffered
 * diagnostics reach a pipe before the process ends.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import { describeGitReadFailure, listTrackedFiles } from '../../core/repository-paths.js';
import { readScanFiles } from '../../core/tracked-file-scan.js';

import {
  findCoreCitations,
  isCorePath,
  type CoreCitation,
  type ScanFile,
} from './validate-core-adr-citations-helpers.js';

const NAME = 'validate-core-adr-citations';

function refuse(reason: string): number {
  writeErrorLine(`${NAME}: ${reason}`);
  return 2;
}

/** The tracked Core files as text; a refusal reason when any cannot be listed or read as text. */
function readCore(repoRoot: string): Result<ScanFile[], string> {
  const listing = listTrackedFiles(repoRoot);
  if (!listing.ok) {
    // A scan over a listing git could not give would pass over files it never saw.
    return err(`cannot list tracked files — ${describeGitReadFailure(listing.error)}`);
  }
  const corePaths = listing.value.filter(isCorePath);
  if (corePaths.length === 0) {
    return err('zero tracked Core files found — refusing a vacuous pass');
  }
  const scan = readScanFiles(repoRoot, corePaths);
  if (!scan.ok) {
    return err(
      `cannot read tracked file '${scan.error.relativePath}' — fix the file or its permissions; ` +
        `the scan must not skip a tracked file (${String(scan.error.cause)})`,
    );
  }
  if (scan.value.length !== corePaths.length) {
    const read = new Set(scan.value.map((file) => file.path));
    const dropped = corePaths.filter((corePath) => !read.has(corePath));
    return err(
      `tracked Core file(s) not scannable as text, so the scan cannot vouch for them: ` +
        dropped.join(', '),
    );
  }
  return ok(scan.value);
}

/** Every citation as `path:line:column  text`, then the cure. */
function reportCitations(citations: readonly CoreCitation[]): void {
  writeErrorLine(`✖ ${String(citations.length)} ADR citation(s) in the Core:`);
  for (const citation of citations) {
    writeErrorLine(
      `  ${citation.file}:${String(citation.line)}:${String(citation.column)}  ${citation.text}`,
    );
  }
  writeErrorLine('');
  writeErrorLine(
    'The Core travels to repositories where the ADR does not exist (PDR-105; the ' +
      'practice-core-portability rule). Name the concept the ADR records in place of its ' +
      'number, and never delete the sentence (PDR-079).',
  );
}

function main(): number {
  // projectDir is explicitly disabled: this validator reads the tree it runs
  // inside. The CLAUDE_PROJECT_DIR leg would rebind a worktree invocation to
  // the primary checkout and report the wrong estate green.
  const repoRoot = resolveRepoRoot(import.meta.url, { projectDir: undefined });
  const core = readCore(repoRoot);
  if (!core.ok) {
    return refuse(core.error);
  }
  const citations = findCoreCitations(core.value);
  if (citations.length > 0) {
    reportCitations(citations);
    return 1;
  }
  writeLine(`✓ no ADR citations in ${String(core.value.length)} Core files`);
  return 0;
}

process.exitCode = main();
