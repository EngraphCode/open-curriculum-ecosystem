import { describe, expect, it } from 'vitest';

import {
  originNamesRepository,
  parseOriginHead,
  refuseTargetBranch,
} from './push-target-branch.js';

describe('parseOriginHead', () => {
  it.each([
    ['refs/remotes/origin/engraph\n', 'engraph'],
    ['refs/remotes/origin/main', 'main'],
    ['refs/remotes/origin/release/2026', 'release/2026'],
  ])('reads the default branch from %j', (stdout, branch) => {
    expect(parseOriginHead(stdout)).toBe(branch);
  });

  it.each([
    ['an empty answer', ''],
    ['the bare prefix', 'refs/remotes/origin/'],
    ['another remote', 'refs/remotes/upstream/main'],
    ['the short form', 'origin/main'],
    ['a local branch', 'refs/heads/main'],
  ])('reads no default branch from %s', (_name, stdout) => {
    expect(parseOriginHead(stdout)).toBeUndefined();
  });
});

describe('originNamesRepository', () => {
  it.each([
    'https://github.com/acme/widgets.git',
    'https://github.com/acme/widgets',
    'https://github.com/Acme/Widgets.git',
    'git@github.com:acme/widgets.git',
    'ssh://git@github.com/acme/widgets.git',
  ])('accepts %s as naming acme/widgets', (url) => {
    expect(originNamesRepository(url, 'acme', 'widgets')).toBe(true);
  });

  it.each([
    'https://github.com/acme/gadgets.git',
    'https://github.com/other/widgets.git',
    'https://gitlab.com/acme/widgets.git',
    'https://github.com/acme/widgets/extra.git',
    'https://github.com.evil.example/acme/widgets.git',
    '/local/mirror/widgets.git',
    '',
  ])('refuses %j as naming acme/widgets', (url) => {
    expect(originNamesRepository(url, 'acme', 'widgets')).toBe(false);
  });
});

describe('refuseTargetBranch', () => {
  it.each(['feat/example', 'engraph-docs', 'release/2026'])(
    'lets %s through when the default branch is engraph',
    (branch) => {
      expect(refuseTargetBranch(branch, 'engraph')).toBeUndefined();
    },
  );

  it.each([
    ['the default branch origin names', 'engraph'],
    ['main, by name', 'main'],
    ['master, by name', 'master'],
  ])('refuses %s as a default branch', (_name, branch) => {
    expect(refuseTargetBranch(branch, 'engraph')).toContain('is a default branch');
  });

  it('refuses a full ref name, which the push would nest under refs/heads/', () => {
    expect(refuseTargetBranch('refs/heads/feat/example', 'engraph')).toContain('full ref');
  });

  it('refuses a detached HEAD', () => {
    expect(refuseTargetBranch('HEAD', 'engraph')).toContain('detached');
  });
});
