import { typeSafeEntries } from '@oaknational/type-helpers';

import type { OutputFormat } from '../types.js';

import { justificationOf, type Hit } from './flag-command.js';

/**
 * One command the harness recorded as run, from its `CommandExecution` item.
 * The status and source sets are codex-cli 0.157.1's closed sets.
 */
export interface CommandRecord {
  readonly line: number;
  readonly turnId: string;
  /** The argv the harness handed the executor; never printed whole. */
  readonly command: readonly string[];
  /** How the harness closed the item. */
  readonly status: 'in_progress' | 'completed' | 'failed' | 'declined';
  /** Which path ran the command. */
  readonly source: 'agent' | 'user_shell' | 'unified_exec_startup' | 'unified_exec_interaction';
  readonly exitCode: number | undefined;
  /** What was typed into a running process, when the item is an interaction. */
  readonly interactionInput: string | undefined;
}

/** An evidence record the reader could not read; the reason never carries the raw value. */
export interface Malformed {
  readonly line: number;
  readonly reason: string;
}

/**
 * A command that carried a forbidden shape of the seat rules: one the harness
 * ran (`executed`) or one typed into a running process (`interaction`).
 */
export interface FlaggedCommand {
  readonly kind: 'executed' | 'interaction';
  readonly line: number;
  readonly turnId: string;
  /** The command by allowlist, one string per shell segment; never the argv. */
  readonly rendered: readonly string[];
  readonly hits: readonly Hit[];
}

/** One turn's counts. */
export interface TurnAccount {
  readonly turnId: string;
  readonly executed: number;
}

/**
 * What a rollout says about the commands its seat ran, as counts and the
 * records that could not be read. Never the command history itself.
 */
export interface CommandRecordsSummary {
  readonly turns: number;
  readonly commands: number;
  /** Every command that carried a forbidden shape, in stream order. */
  readonly flagged: readonly FlaggedCommand[];
  readonly accounts: readonly TurnAccount[];
  /** Every record type seen, counted; types the reader does not read included. */
  readonly recordTypes: Readonly<Record<string, number>>;
  readonly malformed: readonly Malformed[];
  readonly invalidLines: readonly number[];
}

function renderFlagged(entry: FlaggedCommand): string {
  const shapes = entry.hits.map((hit) => `${hit.kind}: ${justificationOf(hit.kind)}`).join(' ');
  const command = entry.rendered.join(' ; ');
  return `flagged: line ${entry.line}: ${entry.kind} in turn ${entry.turnId}: ${command} [${shapes}]`;
}

function renderText(summary: CommandRecordsSummary): string {
  const lines = [
    `command records: ${summary.turns} turn(s), ${summary.commands} executed command(s), ${summary.flagged.length} flagged`,
    ...summary.accounts.map((account) => `turn ${account.turnId}: executed ${account.executed}`),
    ...summary.flagged.map(renderFlagged),
    `record types: ${typeSafeEntries(summary.recordTypes)
      .map(([type, count]) => `${type}=${count}`)
      .join(' ')}`,
    ...summary.malformed.map((entry) => `malformed: line ${entry.line}: ${entry.reason}`),
  ];
  if (summary.invalidLines.length > 0) {
    lines.push(`invalid lines: ${summary.invalidLines.join(', ')}`);
  }
  return lines.join('\n');
}

/** The summary as a reader or a script takes it. */
export function renderSummary(summary: CommandRecordsSummary, format: OutputFormat): string {
  return format === 'json' ? JSON.stringify(summary) : renderText(summary);
}
