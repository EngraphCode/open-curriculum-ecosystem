/**
 * Operator profile — the git layer behind an injected runner.
 *
 * Every git act on the profile repository goes through one runner so the
 * mechanics live in one tested place (the operator-profile PDR, decision
 * 16): a seat resident in a linked worktree, whose shell git is confined to
 * that worktree, syncs the profile through this tool like any other seat.
 * The real runner executes the trusted git binary by absolute path with
 * `-C <root>`; tests inject a scripted runner and never touch a repository.
 */

import { spawnSync } from 'node:child_process';

import { err, ok, type Result } from '@oaknational/result';

import { resolveTrustedGit } from '../../core/trusted-git.js';
import { type SyncStateInput } from './operator-profile-sync-state.js';

interface GitOutcome {
  readonly ok: boolean;
  readonly stdout: string;
  readonly stderr: string;
}

/** Runs one git command against the profile root and reports its outcome. */
export type GitRunner = (args: readonly string[]) => GitOutcome;

/** The real runner: the trusted git binary, `-C <root>`, never a shell. */
export function createGitRunner(root: string): GitRunner {
  const git = resolveTrustedGit();
  return (args) => {
    const result = spawnSync(git, ['-C', root, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {
      ok: result.status === 0,
      stdout: result.stdout.trimEnd(),
      stderr: result.stderr.trimEnd(),
    };
  };
}

function firstLine(text: string): string {
  return text.split('\n')[0] ?? '';
}

function parseCounts(leftRight: string): { readonly behind: number; readonly ahead: number } {
  const [behind, ahead] = firstLine(leftRight)
    .split(/\s+/)
    .map((value) => Number.parseInt(value, 10));
  return { behind: Number.isNaN(behind) ? 0 : behind, ahead: Number.isNaN(ahead) ? 0 : ahead };
}

/**
 * Read the sync facts of a profile root that is a repository.
 *
 * @param run - the git runner bound to the root
 * @returns the facts the assessor needs
 */
export function readSyncState(run: GitRunner): SyncStateInput {
  const remotes = run(['remote']);
  const hasRemote = remotes.ok && remotes.stdout.trim() !== '';
  const upstream = run(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const hasUpstream = upstream.ok && upstream.stdout.trim() !== '';
  const status = run(['status', '--porcelain']);
  const counts = hasUpstream
    ? parseCounts(run(['rev-list', '--left-right', '--count', '@{u}...HEAD']).stdout)
    : { behind: 0, ahead: 0 };
  return {
    isRepository: true,
    hasRemote,
    hasUpstream,
    porcelain: status.ok ? status.stdout : '',
    ahead: counts.ahead,
    behind: counts.behind,
  };
}

/**
 * Bring the profile up to date: fetch, fast-forward where possible, a plain
 * merge otherwise (never a rebase). A merge that conflicts is reported with
 * its files and left for a union resolution; nothing is discarded.
 *
 * @param run - the git runner bound to the root
 * @returns what happened, or the failure to surface
 */
function hasUpstream(run: GitRunner): boolean {
  const upstream = run(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  return upstream.ok && upstream.stdout.trim() !== '';
}

/** Fast-forward where possible, else a plain merge; a conflict names its files. */
function mergeUpstream(run: GitRunner): Result<string, string> {
  const fastForward = run(['merge', '--ff-only', '@{u}']);
  if (fastForward.ok) {
    return ok(firstLine(fastForward.stdout) || 'up to date');
  }
  const merged = run(['merge', '--no-edit', '@{u}']);
  if (merged.ok) {
    return ok('merged the remote in (not fast-forwardable; a plain merge, never a rebase)');
  }
  const conflicted = run(['diff', '--name-only', '--diff-filter=U']);
  const files =
    conflicted.stdout.trim() === '' ? 'unknown files' : conflicted.stdout.replaceAll('\n', ', ');
  return err(
    `merge conflict in ${files} — resolve by union (both sides kept in time order, the later updated date wins), then pnpm profile:sync push`,
  );
}

export function pullProfile(run: GitRunner): Result<string, string> {
  const fetched = run(['fetch', '--quiet']);
  if (!fetched.ok) {
    return err(`fetch failed: ${firstLine(fetched.stderr) || 'no detail'}`);
  }
  if (!hasUpstream(run)) {
    return err('the current branch tracks no upstream — push once to set it');
  }
  return mergeUpstream(run);
}

/**
 * Commit and push the operator's ratified writes: stage the profile's
 * documents by pathspec, commit with the seat's message, push (setting the
 * upstream on the first push). The caller runs the profile check first.
 *
 * @param run - the git runner bound to the root
 * @param message - names the seat and the fact
 * @param paths - the profile's document paths to stage
 * @returns what happened, or the failure to surface
 */
/** Stage by pathspec and commit; `committed: false` when there was nothing to commit. */
function stageAndCommit(
  run: GitRunner,
  message: string,
  paths: readonly string[],
): Result<{ readonly committed: boolean }, string> {
  const added = run(['add', '--', ...paths]);
  if (!added.ok) {
    return err(`staging failed: ${firstLine(added.stderr) || 'no detail'}`);
  }
  if (run(['diff', '--cached', '--quiet']).ok) {
    return ok({ committed: false });
  }
  const committed = run(['commit', '--quiet', '-m', message]);
  if (!committed.ok) {
    return err(`commit failed: ${firstLine(committed.stderr) || 'no detail'}`);
  }
  return ok({ committed: true });
}

/** Push to the upstream, setting it on the first push. */
function pushToUpstream(run: GitRunner): Result<string, string> {
  const pushed = hasUpstream(run)
    ? run(['push', '--quiet'])
    : run(['push', '--quiet', '-u', 'origin', 'HEAD']);
  if (!pushed.ok) {
    return err(`push failed (the commit is local): ${firstLine(pushed.stderr) || 'no detail'}`);
  }
  return ok('committed and pushed');
}

export function pushProfile(
  run: GitRunner,
  message: string,
  paths: readonly string[],
): Result<string, string> {
  const commit = stageAndCommit(run, message, paths);
  if (!commit.ok) {
    return commit;
  }
  if (!commit.value.committed) {
    return ok('nothing to commit');
  }
  return pushToUpstream(run);
}
