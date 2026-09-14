/**
 * Operator profile — sync state as findings. Pure.
 *
 * A profile root may not exist, may exist without being a repository, or may
 * be a repository with or without a remote (the operator-profile PDR,
 * decisions 13 to 16). Only a repository with a remote has a sync state to
 * report; everything else is information, never a finding.
 */

export interface SyncStateInput {
  /** The root has a `.git` entry. */
  readonly isRepository: boolean;
  /** `git remote` lists at least one remote. */
  readonly hasRemote: boolean;
  /** The current branch tracks an upstream. */
  readonly hasUpstream: boolean;
  /** `git status --porcelain`, verbatim. */
  readonly porcelain: string;
  /** Commits on the branch the upstream lacks. */
  readonly ahead: number;
  /** Commits on the upstream the branch lacks. */
  readonly behind: number;
}

export interface SyncAssessment {
  /** Failures, each with the one command that cures it. */
  readonly findings: readonly string[];
  /** Facts that are not failures. */
  readonly info: readonly string[];
}

const PUSH_CURE = 'cure: pnpm profile:sync push --message "<seat>: <the fact>"';

/** Non-empty porcelain lines: the dirty paths. */
export function dirtyPaths(porcelain: string): readonly string[] {
  return porcelain
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => line.slice(3));
}

function count(value: number, noun: string): string {
  return `${value} ${noun}${value === 1 ? '' : 's'}`;
}

/** Information for the two states that have nothing to sync; undefined otherwise. */
function nothingToSync(input: SyncStateInput): string | undefined {
  if (!input.isRepository) {
    return 'the profile is not a git repository (first-class; nothing to sync)';
  }
  if (!input.hasRemote) {
    return 'the profile is a git repository with no remote (first-class; nothing to sync)';
  }
  return undefined;
}

function upstreamFindings(input: SyncStateInput): readonly string[] {
  if (!input.hasUpstream) {
    return [
      `the current branch tracks no upstream — ${PUSH_CURE} (it sets the upstream on first push)`,
    ];
  }
  const findings: string[] = [];
  if (input.ahead > 0) {
    findings.push(`${count(input.ahead, 'unpushed commit')} — ${PUSH_CURE}`);
  }
  if (input.behind > 0) {
    findings.push(
      `${count(input.behind, 'commit')} behind the remote — cure: pnpm profile:sync pull`,
    );
  }
  return findings;
}

/**
 * Assess a profile root's sync state.
 *
 * @param input - the facts the git layer read
 * @returns findings with cures, and information
 */
export function assessSyncState(input: SyncStateInput): SyncAssessment {
  const info = nothingToSync(input);
  if (info !== undefined) {
    return { findings: [], info: [info] };
  }
  const dirty = dirtyPaths(input.porcelain);
  const dirtyFindings =
    dirty.length === 0
      ? []
      : [`${count(dirty.length, 'uncommitted change')} (${dirty.join(', ')}) — ${PUSH_CURE}`];
  return { findings: [...dirtyFindings, ...upstreamFindings(input)], info: [] };
}
