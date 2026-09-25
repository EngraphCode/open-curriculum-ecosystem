import { describe, expect, it } from 'vitest';

import type { GitCommandResult } from './git-executor.js';
import type { PushGitReads } from './push-git.js';
import { settleTargetBranch } from './push-target-branch.js';

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
    { name: 'a branch the default branch prefixes', branch: `${DEFAULT_BRANCH}-docs` },
    { name: 'a branch whose default is nested', branch: 'release/2026-docs' },
  ])('pushes $name', async ({ branch }) => {
    expect(await settleTargetBranch(branch, reads(), REPOSITORY)).toEqual({
      ok: true,
      value: { kind: 'target', branch },
    });
  });

  it.each([
    { url: 'https://github.com/acme/widgets' },
    { url: 'https://github.com/Acme/Widgets.git' },
    { url: 'git@github.com:acme/widgets.git' },
    { url: 'ssh://git@github.com/acme/widgets.git' },
  ])('trusts origin at $url', async ({ url }) => {
    const settled = await settleTargetBranch(
      'feat/example',
      reads({ originUrls: answered(`${url}\n`) }),
      REPOSITORY,
    );

    expect(settled).toEqual({ ok: true, value: { kind: 'target', branch: 'feat/example' } });
  });
});

describe('settleTargetBranch: refusals', () => {
  it.each([
    { branch: 'main' },
    { branch: 'master' },
    { branch: 'MAIN' },
    { branch: DEFAULT_BRANCH },
    { branch: 'Engraph' },
  ])('refuses $branch as a default branch', async ({ branch }) => {
    const settled = await settleTargetBranch(branch, reads(), REPOSITORY);

    expect(settled.ok && settled.value.kind).toBe('refused');
    expect(settled.ok && settled.value.kind === 'refused' && settled.value.reason).toContain(
      branch,
    );
  });

  it('refuses the default branch when HEAD is on it', async () => {
    const settled = await settleTargetBranch(
      undefined,
      reads({ currentBranch: answered(`${DEFAULT_BRANCH}\n`) }),
      REPOSITORY,
    );

    expect(settled.ok && settled.value.kind).toBe('refused');
  });

  it('refuses the default branch origin names under a nested name', async () => {
    const settled = await settleTargetBranch(
      'release/2026',
      reads({ originHead: answered('refs/remotes/origin/release/2026\n') }),
      REPOSITORY,
    );

    expect(settled.ok && settled.value.kind).toBe('refused');
  });

  it('refuses a full ref name, which the push would nest under refs/heads/', async () => {
    const settled = await settleTargetBranch('refs/heads/feat/example', reads(), REPOSITORY);

    expect(settled.ok && settled.value.kind === 'refused' && settled.value.reason).toContain(
      'refs/heads/feat/example',
    );
  });

  it.each([
    { name: 'a detached HEAD', named: undefined, currentBranch: answered('\n') },
    { name: 'a branch named HEAD', named: 'HEAD', currentBranch: answered('feat/example\n') },
  ])('refuses $name as detached', async ({ named, currentBranch }) => {
    const settled = await settleTargetBranch(named, reads({ currentBranch }), REPOSITORY);

    expect(settled.ok && settled.value.kind === 'refused' && settled.value.reason).toContain(
      'detached',
    );
  });

  it.each([
    { name: 'a detached HEAD', named: undefined, currentBranch: answered('') },
    { name: 'main by name', named: 'main', currentBranch: answered('feat/example\n') },
  ])(
    'refuses $name without reading origin, so a clone with no origin HEAD still refuses',
    async ({ named, currentBranch }) => {
      const settled = await settleTargetBranch(
        named,
        reads({ currentBranch, originUrls: failed(2), originHead: failed(1) }),
        REPOSITORY,
      );

      expect(settled.ok && settled.value.kind).toBe('refused');
    },
  );
});

describe('settleTargetBranch: failures, each naming its cure', () => {
  it('fails when git cannot name the branch HEAD is on, with git own words', async () => {
    const settled = await settleTargetBranch(
      undefined,
      reads({ currentBranch: failed(128, 'fatal: not a git repository\n') }),
      REPOSITORY,
    );

    expect(settled.ok).toBe(false);
    expect(!settled.ok && settled.error.message).toContain('not a git repository');
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
    { name: 'origin is a local mirror', originUrls: answered('/local/mirror/widgets.git\n') },
    {
      name: 'origin has a second URL',
      originUrls: answered(`${ORIGIN}\nhttps://github.com/other/widgets.git\n`),
    },
  ])(
    'fails when $name, naming the configured repository to point origin at',
    async ({ originUrls }) => {
      const settled = await settleTargetBranch('feat/example', reads({ originUrls }), REPOSITORY);

      expect(settled.ok).toBe(false);
      expect(!settled.ok && settled.error.message).toContain(
        `https://github.com/${REPOSITORY.owner}/${REPOSITORY.repoName}.git`,
      );
    },
  );

  it.each([
    { name: 'origin HEAD is unset', originHead: failed(1) },
    {
      name: 'origin HEAD names another remote',
      originHead: answered('refs/remotes/upstream/main\n'),
    },
    { name: 'origin HEAD names no branch', originHead: answered('refs/remotes/origin/\n') },
  ])('fails when $name, naming set-head as the cure', async ({ originHead }) => {
    const settled = await settleTargetBranch('feat/example', reads({ originHead }), REPOSITORY);

    expect(settled.ok).toBe(false);
    expect(!settled.ok && settled.error.message).toContain('git remote set-head origin --auto');
  });

  it('fails with git own words when reading origin HEAD fails another way', async () => {
    const settled = await settleTargetBranch(
      'feat/example',
      reads({ originHead: failed(128, 'fatal: bad object\n') }),
      REPOSITORY,
    );

    expect(!settled.ok && settled.error.message).toContain('bad object');
  });
});
