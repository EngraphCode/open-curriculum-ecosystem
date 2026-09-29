/**
 * Composition root for the `arc-metrics` topic.
 *
 * @remarks
 * Vendor and project directories in, an arc's measures out. Parses argv,
 * resolves the project directories (the launch directory's own when none is
 * named; a directory named twice is measured once), lists each one's
 * transcripts, aggregates them, and emits text or JSON. The pure pieces do the
 * work; this layer wires them and translates failures into exit codes — no
 * throw escapes (ADR-088).
 *
 * The arc is every transcript in the directories measured, so the report grows
 * as sessions are added there: the directories named are what bound an arc.
 *
 * @packageDocumentation
 */

import { resolve } from 'node:path';

import { projectDirectoryFor } from '../session-metadata/transcript-locator.js';
import { aggregateSession, type SessionMetrics } from './aggregate.js';
import { ARC_METRICS_HELP_TEXT, parseArgs, type ArcMetricsOptions } from './cli-options.js';
import type { ArcMetricsFileSystem } from './file-system.js';
import { nodeArcMetricsFileSystem } from './file-system-node.js';
import { formatJson, formatText, type ArcMetricsReport } from './format.js';
import { sessionIdOf } from './session-id.js';

/** Inputs for {@link runArcMetricsCli}. */
export interface ArcMetricsCliInput {
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly env: { readonly HOME?: string };
  readonly fs?: ArcMetricsFileSystem;
  readonly stdout?: Pick<NodeJS.WritableStream, 'write'>;
  readonly stderr?: Pick<NodeJS.WritableStream, 'write'>;
}

/** Result of {@link runArcMetricsCli}. */
export interface ArcMetricsCliResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

/**
 * Execute the `arc-metrics` CLI.
 *
 * @param input - argv, cwd, env, and optional injected fs / streams.
 * @returns Exit code and captured stdout/stderr.
 */
export async function runArcMetricsCli(input: ArcMetricsCliInput): Promise<ArcMetricsCliResult> {
  const parsed = parseArgs(input.argv);
  if (!parsed.ok) {
    return emit(input, { exitCode: 2, stdout: '', stderr: `${parsed.error}\n` });
  }
  if (parsed.options.help) {
    return emit(input, { exitCode: 0, stdout: `${ARC_METRICS_HELP_TEXT}\n`, stderr: '' });
  }
  if (parsed.options.vendor !== 'claude') {
    return emit(input, {
      exitCode: 2,
      stdout: '',
      stderr: `unsupported vendor: ${parsed.options.vendor} (supported: claude)\n`,
    });
  }

  const directories = resolveDirectories(parsed.options, input);
  if (directories.length === 0) {
    return emit(input, {
      exitCode: 2,
      stdout: '',
      stderr: 'no project directory: pass --project-dir, or run with HOME set\n',
    });
  }

  const fs = input.fs ?? nodeArcMetricsFileSystem;
  const measured = await measure({ directories, fs, gapSeconds: parsed.options.gapMinutes * 60 });
  if (!measured.ok) {
    return emit(input, { exitCode: 1, stdout: '', stderr: `${measured.error}\n` });
  }

  const report: ArcMetricsReport = {
    vendor: parsed.options.vendor,
    gapSeconds: parsed.options.gapMinutes * 60,
    projectDirectories: directories,
    sessions: measured.sessions,
  };
  const text = parsed.options.json ? formatJson(report) : formatText(report);
  return emit(input, { exitCode: 0, stdout: text, stderr: '' });
}

function resolveDirectories(
  options: ArcMetricsOptions,
  input: ArcMetricsCliInput,
): readonly string[] {
  if (options.projectDirs.length > 0) {
    return [...new Set(options.projectDirs.map((directory) => resolve(input.cwd, directory)))];
  }
  const home = input.env.HOME;
  if (home === undefined || home.length === 0) {
    return [];
  }
  return [projectDirectoryFor({ home, cwd: input.cwd })];
}

type MeasureOutcome =
  | { readonly ok: true; readonly sessions: readonly SessionMetrics[] }
  | { readonly ok: false; readonly error: string };

async function measure(input: {
  readonly directories: readonly string[];
  readonly fs: ArcMetricsFileSystem;
  readonly gapSeconds: number;
}): Promise<MeasureOutcome> {
  const sessions: SessionMetrics[] = [];
  for (const directory of input.directories) {
    const listed = await list(input.fs, directory);
    if (!listed.ok) {
      return listed;
    }
    for (const path of listed.paths) {
      const aggregated = await aggregate(input.fs, path, input.gapSeconds);
      if (!aggregated.ok) {
        return aggregated;
      }
      sessions.push(aggregated.session);
    }
  }
  return {
    ok: true,
    sessions: [...sessions].sort((left, right) => left.firstAt.localeCompare(right.firstAt)),
  };
}

type ListOutcome =
  | { readonly ok: true; readonly paths: readonly string[] }
  | { readonly ok: false; readonly error: string };

async function list(fs: ArcMetricsFileSystem, directory: string): Promise<ListOutcome> {
  try {
    return { ok: true, paths: await fs.listTranscripts(directory) };
  } catch (cause) {
    return { ok: false, error: `failed to list ${directory}: ${describe(cause)}` };
  }
}

type AggregateOutcome =
  | { readonly ok: true; readonly session: SessionMetrics }
  | { readonly ok: false; readonly error: string };

async function aggregate(
  fs: ArcMetricsFileSystem,
  path: string,
  gapSeconds: number,
): Promise<AggregateOutcome> {
  try {
    const session = await aggregateSession({
      sessionId: sessionIdOf(path),
      lines: fs.readLines(path),
      gapSeconds,
    });
    return { ok: true, session };
  } catch (cause) {
    return { ok: false, error: `failed to read ${path}: ${describe(cause)}` };
  }
}

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function emit(input: ArcMetricsCliInput, result: ArcMetricsCliResult): ArcMetricsCliResult {
  if (result.stdout.length > 0) {
    input.stdout?.write(result.stdout);
  }
  if (result.stderr.length > 0) {
    input.stderr?.write(result.stderr);
  }
  return result;
}
