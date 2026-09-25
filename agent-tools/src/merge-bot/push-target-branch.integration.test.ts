import type { Result } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import type { GitCommandResult } from './git-executor.js';
import type { PushGitReads } from './push-git.js';
import { settleTargetBranch, type TargetBranch } from './push-target-branch.js';

/**
 * `settleTargetBranch` over git's answers, each a constant injected through
 * the read port: the branch a push writes, the refusals, and the failures
 * with their cures.
 */

const REPOSITORY = { owner: 'acme', repoName: 'widgets' } as const;
const ORIGIN = 'https://github.com/acme/widgets.git';
const DEFAULT_BRANCH = 'engraph';

function answered(stdout: string): GitCommandResult {
  return { status: 0, signal: null, stdout, stderr: '' };
}

function failed(status: number, stderr = ''): GitCommandResult {
  return { status, signal: null, stdout: '', stderr };
}

/** git's answers, each a constant; a test overrides only the one it is about. */
function reads(
  answers: {
    readonly currentBranch?: GitCommandResult;
    readonly originUrls?: GitCommandResult;
    readonly originHead?: GitCommandResult;
  } = {},
): PushGitReads {
  const currentBranch = answers.currentBranch ?? answered('feat/example\n');
  const originUrls = answers.originUrls ?? answered(`${ORIGIN}\n`);
  const originHead = answers.originHead ?? answered(`refs/remotes/origin/${DEFAULT_BRANCH}\n`);
  return {
    currentBranch: () => Promise.resolve(currentBranch),
    originUrls: () => Promise.resolve(originUrls),
    originHead: () => Promise.resolve(originHead),
  };
}

/** The settled outcome as one line, the way the push reports it. */
function outcomeLine(settled: Result<TargetBranch, Error>): string {
  if (!settled.ok) {
    return `failed: ${settled.error.message}`;
  }
  return settled.value.kind === 'refused'
    ? `refused: ${settled.value.reason}`
    : `target: ${settled.value.branch}`;
}

/** origin cannot be read at all: no URL, no origin HEAD. */
const UNREADABLE_ORIGIN = { originUrls: failed(2), originHead: failed(1) } as const;

describe('settleTargetBranch: the branch a push writes', () => {
  it('pushes the branch HEAD is on', async () => {
    expect(await settleTargetBranch(undefined, reads(), REPOSITORY)).toEqual({
      ok: true,
      value: { kind: 'target', branch: 'feat/example' },
    });
  });

  it('pushes the named branch even when git cannot name the branch HEAD is on', async () => {
    const settled = await settleTargetBranch(
      'other-lane',
      reads({ currentBranch: failed(128, 'fatal: not a git repository\n') }),
      REPOSITORY,
    );

    expect(settled).toEqual({ ok: true, value: { kind: 'target', branch: 'other-lane' } });
  });

  it.each([
    {
      name: 'a branch the default branch prefixes',
      branch: `${DEFAULT_BRANCH}-docs`,
      head: DEFAULT_BRANCH,
    },
    {
      name: 'a branch a nested default prefixes',
      branch: 'release/2026-docs',
      head: 'release/2026',
    },
  ])('pushes $name', async ({ branch, head }) => {
    const settled = await settleTargetBranch(
      branch,
      reads({ originHead: answered(`refs/remotes/origin/${head}\n`) }),
      REPOSITORY,
    );

    expect(settled).toEqual({ ok: true, value: { kind: 'target', branch } });
  });

  it.each([
    { name: 'an scp-style origin', url: 'git@github.com:acme/widgets.git', repository: REPOSITORY },
    {
      name: 'a host in capitals',
      url: 'https://GitHub.com/acme/widgets.git',
      repository: REPOSITORY,
    },
    {
      name: 'a configured repository in capitals',
      url: ORIGIN,
      repository: { owner: 'Acme', repoName: 'Widgets' },
    },
  ])('trusts $name', async ({ url, repository }) => {
    const settled = await settleTargetBranch(
      'feat/example',
      reads({ originUrls: answered(`${url}\n`) }),
      repository,
    );

    expect(settled).toEqual({ ok: true, value: { kind: 'target', branch: 'feat/example' } });
  });
});

describe('settleTargetBranch: refusals', () => {
  it.each([
    { branch: 'main' },
    { branch: 'master' },
    { branch: 'MAIN' },
    { branch: 'refs/heads/feat/example' },
    { branch: 'HEAD' },
    { branch: 'head' },
  ])('refuses $branch by name, even when origin cannot be read', async ({ branch }) => {
    const settled = await settleTargetBranch(branch, reads(UNREADABLE_ORIGIN), REPOSITORY);

    expect(outcomeLine(settled)).toMatch(/^refused: /u);
    expect(outcomeLine(settled)).toContain(`"${branch}"`);
  });

  it('refuses a detached HEAD, even when origin cannot be read', async () => {
    const settled = await settleTargetBranch(
      undefined,
      reads({ currentBranch: answered('\n'), ...UNREADABLE_ORIGIN }),
      REPOSITORY,
    );

    expect(outcomeLine(settled)).toMatch(/^refused: /u);
    expect(outcomeLine(settled)).toContain('detached');
  });

  it.each([
    { name: 'the default branch origin names', branch: DEFAULT_BRANCH, head: DEFAULT_BRANCH },
    { name: 'the default branch in another case', branch: 'Engraph', head: DEFAULT_BRANCH },
    { name: 'a default origin names in another case', branch: 'trunk', head: 'Trunk' },
    { name: 'a nested default branch', branch: 'release/2026', head: 'release/2026' },
  ])('refuses $name', async ({ branch, head }) => {
    const settled = await settleTargetBranch(
      branch,
      reads({ originHead: answered(`refs/remotes/origin/${head}\n`) }),
      REPOSITORY,
    );

    expect(outcomeLine(settled)).toMatch(/^refused: /u);
    expect(outcomeLine(settled)).toContain(`"${branch}"`);
  });

  it('refuses the default branch when HEAD is on it', async () => {
    const settled = await settleTargetBranch(
      undefined,
      reads({ currentBranch: answered(`${DEFAULT_BRANCH}\n`) }),
      REPOSITORY,
    );

    expect(outcomeLine(settled)).toMatch(/^refused: /u);
  });
});

describe('settleTargetBranch: failures, each naming its cure', () => {
  const repoint = `https://github.com/${REPOSITORY.owner}/${REPOSITORY.repoName}.git`;

  it('fails when git cannot name the branch HEAD is on, with git own words', async () => {
    const settled = await settleTargetBranch(
      undefined,
      reads({ currentBranch: failed(128, 'fatal: not a git repository\n') }),
      REPOSITORY,
    );

    expect(outcomeLine(settled)).toMatch(/^failed: /u);

    expect(outcomeLine(settled)).toContain('not a git repository');
  });

  it.each([
    { name: 'origin has no URL', originUrls: failed(2, "error: No such remote 'origin'\n") },
    {
      name: 'origin is another owner',
      originUrls: answered('https://github.com/other/widgets.git\n'),
    },
    {
      name: 'origin is another repository',
      originUrls: answered('https://github.com/acme/gadgets.git\n'),
    },
    {
      name: 'origin is on another host',
      originUrls: answered('https://gitlab.com/acme/widgets.git\n'),
    },
    {
      name: 'origin is a look-alike host',
      originUrls: answered('https://github.com.evil.example/acme/widgets.git\n'),
    },
    { name: 'origin is a host alias', originUrls: answered('git@github-work:acme/widgets.git\n') },
    { name: 'origin is a local path', originUrls: answered('github.com/acme/widgets\n') },
    {
      name: 'origin has a second URL',
      originUrls: answered(`${ORIGIN}\nhttps://github.com/other/widgets.git\n`),
    },
  ])(
    'fails when $name, naming the configured repository to point origin at',
    async ({ originUrls }) => {
      const settled = await settleTargetBranch('feat/example', reads({ originUrls }), REPOSITORY);

      expect(outcomeLine(settled)).toMatch(/^failed: /u);

      expect(outcomeLine(settled)).toContain(repoint);
    },
  );

  it('fails with git own words when reading origin fails another way', async () => {
    const settled = await settleTargetBranch(
      'feat/example',
      reads({ originUrls: failed(128, 'fatal: not a git repository\n') }),
      REPOSITORY,
    );

    expect(outcomeLine(settled)).toMatch(/^failed: /u);

    expect(outcomeLine(settled)).toContain('not a git repository');
  });

  it('never repeats a credential that origin URL carries', async () => {
    const sentinel = 'ghs_sentinel_never_echoed';
    const settled = await settleTargetBranch(
      'feat/example',
      reads({
        originUrls: answered(`https://x-access-token:${sentinel}@github.com/other/widgets.git\n`),
      }),
      REPOSITORY,
    );

    expect(outcomeLine(settled)).toMatch(/^failed: /u);
    expect(outcomeLine(settled)).not.toContain(sentinel);
  });

  it.each([
    { name: 'origin HEAD is unset', originHead: failed(1) },
    {
      name: 'origin HEAD names another remote',
      originHead: answered('refs/remotes/upstream/main\n'),
    },
    { name: 'origin HEAD names no branch', originHead: answered('refs/remotes/origin/\n') },
  ])('fails when $name, naming set-head as the cure', async ({ originHead }) => {
    const settled = await settleTargetBranch('feat/example', reads({ originHead }), REPOSITORY);

    expect(outcomeLine(settled)).toMatch(/^failed: /u);

    expect(outcomeLine(settled)).toContain('git remote set-head origin --auto');
  });

  it('fails with git own words when reading origin HEAD fails another way', async () => {
    const settled = await settleTargetBranch(
      'feat/example',
      reads({ originHead: failed(128, 'fatal: bad object\n') }),
      REPOSITORY,
    );

    expect(outcomeLine(settled)).toMatch(/^failed: /u);

    expect(outcomeLine(settled)).toContain('bad object');
  });
});
