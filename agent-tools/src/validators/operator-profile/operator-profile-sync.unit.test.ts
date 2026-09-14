import { unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { pullProfile, pushProfile, readSyncState, type GitRunner } from './operator-profile-git.js';
import { parseSyncArgs, PROFILE_PATHSPECS } from './operator-profile-sync.js';
import { assessSyncState, dirtyPaths } from './operator-profile-sync-state.js';

const CLEAN = {
  isRepository: true,
  hasRemote: true,
  hasUpstream: true,
  porcelain: '',
  ahead: 0,
  behind: 0,
} as const;

describe('assessSyncState', () => {
  it('treats a non-repository and a repository without a remote as information, never findings', () => {
    expect(assessSyncState({ ...CLEAN, isRepository: false }).findings).toEqual([]);
    expect(assessSyncState({ ...CLEAN, isRepository: false }).info).toHaveLength(1);
    expect(assessSyncState({ ...CLEAN, hasRemote: false }).findings).toEqual([]);
    expect(assessSyncState({ ...CLEAN, hasRemote: false }).info).toHaveLength(1);
  });

  it('is clean when the tree is clean and the branch matches its upstream', () => {
    expect(assessSyncState(CLEAN)).toEqual({ findings: [], info: [] });
  });

  it('names dirty paths, unpushed commits and a behind branch, each with its cure', () => {
    const assessment = assessSyncState({
      ...CLEAN,
      porcelain: ' M index.md\n?? machines/new.md\n',
      ahead: 2,
      behind: 1,
    });
    expect(assessment.findings).toHaveLength(3);
    expect(assessment.findings[0]).toContain('2 uncommitted changes (index.md, machines/new.md)');
    expect(assessment.findings[0]).toContain('pnpm profile:sync push');
    expect(assessment.findings[1]).toContain('2 unpushed commits');
    expect(assessment.findings[2]).toContain('1 commit behind the remote');
    expect(assessment.findings[2]).toContain('pnpm profile:sync pull');
  });

  it('reports a missing upstream once and does not count ahead or behind', () => {
    const assessment = assessSyncState({ ...CLEAN, hasUpstream: false, ahead: 5, behind: 5 });
    expect(assessment.findings).toHaveLength(1);
    expect(assessment.findings[0]).toContain('tracks no upstream');
  });
});

describe('dirtyPaths', () => {
  it('reads the paths off porcelain lines and ignores blanks', () => {
    expect(dirtyPaths(' M a.md\n\n?? b/c.md\n')).toEqual(['a.md', 'b/c.md']);
    expect(dirtyPaths('')).toEqual([]);
  });
});

/** A scripted runner: the first matching prefix answers; unmatched commands fail loudly. */
function scripted(
  answers: readonly {
    readonly prefix: readonly string[];
    readonly stdout?: string;
    readonly ok?: boolean;
  }[],
): { readonly run: GitRunner; readonly calls: string[][] } {
  const calls: string[][] = [];
  const run: GitRunner = (args) => {
    calls.push([...args]);
    const hit = answers.find((answer) =>
      answer.prefix.every((part, index) => args[index] === part),
    );
    if (hit === undefined) {
      return { ok: false, stdout: '', stderr: `unscripted: ${args.join(' ')}` };
    }
    return {
      ok: hit.ok ?? true,
      stdout: hit.stdout ?? '',
      stderr: hit.ok === false ? 'refused' : '',
    };
  };
  return { run, calls };
}

describe('readSyncState', () => {
  it('reads remote, upstream, porcelain and the left-right count', () => {
    const { run } = scripted([
      { prefix: ['remote'], stdout: 'origin' },
      { prefix: ['rev-parse', '--abbrev-ref'], stdout: 'origin/main' },
      { prefix: ['status', '--porcelain'], stdout: ' M index.md' },
      { prefix: ['rev-list', '--left-right'], stdout: '1\t2' },
    ]);
    expect(readSyncState(run)).toEqual({
      isRepository: true,
      hasRemote: true,
      hasUpstream: true,
      porcelain: ' M index.md',
      ahead: 2,
      behind: 1,
    });
  });

  it('does not count when there is no upstream', () => {
    const { run, calls } = scripted([
      { prefix: ['remote'], stdout: 'origin' },
      { prefix: ['rev-parse', '--abbrev-ref'], ok: false },
      { prefix: ['status', '--porcelain'], stdout: '' },
    ]);
    expect(readSyncState(run)).toMatchObject({ hasUpstream: false, ahead: 0, behind: 0 });
    expect(calls.some((call) => call[0] === 'rev-list')).toBe(false);
  });
});

describe('pullProfile', () => {
  it('fast-forwards when it can', () => {
    const { run, calls } = scripted([
      { prefix: ['fetch'] },
      { prefix: ['rev-parse', '--abbrev-ref'], stdout: 'origin/main' },
      { prefix: ['merge', '--ff-only'], stdout: 'Updating 1..2\nFast-forward' },
    ]);
    expect(unwrap(pullProfile(run))).toBe('Updating 1..2');
    expect(calls.map((call) => call[0])).toEqual(['fetch', 'rev-parse', 'merge']);
  });

  it('falls back to a plain merge, never a rebase, when fast-forward is impossible', () => {
    const { run, calls } = scripted([
      { prefix: ['fetch'] },
      { prefix: ['rev-parse', '--abbrev-ref'], stdout: 'origin/main' },
      { prefix: ['merge', '--ff-only'], ok: false },
      { prefix: ['merge', '--no-edit'] },
    ]);
    expect(unwrap(pullProfile(run))).toContain('plain merge, never a rebase');
    expect(calls.some((call) => call[0] === 'rebase')).toBe(false);
  });

  it('surfaces a conflict with its files and the union instruction', () => {
    const { run } = scripted([
      { prefix: ['fetch'] },
      { prefix: ['rev-parse', '--abbrev-ref'], stdout: 'origin/main' },
      { prefix: ['merge', '--ff-only'], ok: false },
      { prefix: ['merge', '--no-edit'], ok: false },
      { prefix: ['diff', '--name-only'], stdout: 'index.md\nmachines/a.md' },
    ]);
    const result = pullProfile(run);
    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.error).toContain('merge conflict in index.md, machines/a.md');
    expect(result.ok ? '' : result.error).toContain('union');
  });

  it('refuses when the branch tracks no upstream', () => {
    const { run } = scripted([{ prefix: ['fetch'] }, { prefix: ['rev-parse'], ok: false }]);
    expect(pullProfile(run).ok).toBe(false);
  });
});

describe('pushProfile', () => {
  it('stages by pathspec, commits with the message, and pushes to the upstream', () => {
    const { run, calls } = scripted([
      { prefix: ['add'] },
      { prefix: ['diff', '--cached', '--quiet'], ok: false },
      { prefix: ['commit'] },
      { prefix: ['rev-parse', '--abbrev-ref'], stdout: 'origin/main' },
      { prefix: ['push', '--quiet'] },
    ]);
    expect(unwrap(pushProfile(run, 'seat: fact', PROFILE_PATHSPECS))).toBe('committed and pushed');
    expect(calls[0]).toEqual(['add', '--', 'index.md', 'repos', 'machines']);
    expect(calls[2]).toEqual(['commit', '--quiet', '-m', 'seat: fact']);
    expect(calls[4]).toEqual(['push', '--quiet']);
  });

  it('sets the upstream on the first push', () => {
    const { run, calls } = scripted([
      { prefix: ['add'] },
      { prefix: ['diff', '--cached', '--quiet'], ok: false },
      { prefix: ['commit'] },
      { prefix: ['rev-parse', '--abbrev-ref'], ok: false },
      { prefix: ['push', '--quiet', '-u'] },
    ]);
    expect(pushProfile(run, 'seat: fact', PROFILE_PATHSPECS).ok).toBe(true);
    expect(calls.at(-1)).toEqual(['push', '--quiet', '-u', 'origin', 'HEAD']);
  });

  it('reports nothing to commit without committing', () => {
    const { run, calls } = scripted([
      { prefix: ['add'] },
      { prefix: ['diff', '--cached', '--quiet'] },
    ]);
    expect(unwrap(pushProfile(run, 'seat: fact', PROFILE_PATHSPECS))).toBe('nothing to commit');
    expect(calls.some((call) => call[0] === 'commit')).toBe(false);
  });

  it('keeps the commit local and says so when the push fails', () => {
    const { run } = scripted([
      { prefix: ['add'] },
      { prefix: ['diff', '--cached', '--quiet'], ok: false },
      { prefix: ['commit'] },
      { prefix: ['rev-parse', '--abbrev-ref'], stdout: 'origin/main' },
      { prefix: ['push'], ok: false },
    ]);
    const result = pushProfile(run, 'seat: fact', PROFILE_PATHSPECS);
    expect(result.ok ? '' : result.error).toContain('the commit is local');
  });
});

describe('parseSyncArgs', () => {
  it('accepts pull, and push with a message', () => {
    expect(unwrap(parseSyncArgs(['pull']))).toEqual({ kind: 'pull' });
    expect(unwrap(parseSyncArgs(['push', '--message', 'seat: fact']))).toEqual({
      kind: 'push',
      message: 'seat: fact',
    });
  });

  it('refuses push without a message, and an unknown command', () => {
    expect(parseSyncArgs(['push']).ok).toBe(false);
    expect(parseSyncArgs(['push', '--message', '--root']).ok).toBe(false);
    expect(parseSyncArgs(['sync']).ok).toBe(false);
    expect(parseSyncArgs([]).ok).toBe(false);
  });
});
