import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { resolveTrustedGit } from '../src/core/trusted-git';
import type { GhCommandExecutor } from '../src/pr-watch/gh';
import { isSyncPush } from '../src/review-cost/git';

/**
 * The review-cost gate's sync-push test against the real git — the
 * property is git's own merge semantics (`merge-tree --write-tree` against
 * the pushed merge's tree; `merge-base --is-ancestor` for the base
 * identity), which a scripted runner can only echo. A scratch repository
 * with a base branch and a lane: the one merge the gate must pass, and the
 * four shapes it must refuse. Real IO makes this a smoke; `test:e2e` gates it.
 */

const GIT = resolveTrustedGit();

function git(cwd: string, ...args: readonly string[]): string {
  return execFileSync(GIT, [...args], { cwd, encoding: 'utf8' }).trim();
}

// The executor the gate uses, bound to the scratch repository: the module
// names `git`; the smoke resolves it to the trusted binary in that cwd.
function executorIn(cwd: string): GhCommandExecutor {
  return (_file, args, options) =>
    execFileSync(GIT, [...args], { ...options, cwd, encoding: 'utf8' });
}

async function commitFile(
  cwd: string,
  name: string,
  content: string,
  subject: string,
): Promise<string> {
  await writeFile(join(cwd, name), content);
  git(cwd, 'add', name);
  git(cwd, 'commit', '-q', '-m', subject);
  return git(cwd, 'rev-parse', 'HEAD');
}

interface Repo {
  readonly root: string;
  readonly seed: string;
  readonly baseTip: string;
  readonly laneHead: string;
}

/** main: seed → base change; lane from seed: one commit. */
async function makeRepo(): Promise<Repo> {
  const root = realpathSync(await mkdtemp(join(tmpdir(), 'oak-review-cost-sync-')));
  git(root, 'init', '-q', '--initial-branch=main');
  git(root, 'config', 'user.email', 'review-cost-smoke@test.invalid');
  git(root, 'config', 'user.name', 'Review Cost Smoke');
  git(root, 'config', 'commit.gpgsign', 'false');
  const seed = await commitFile(root, 'README.md', 'seed\n', 'chore: seed');
  git(root, 'checkout', '-q', '-b', 'lane');
  const laneHead = await commitFile(root, 'lane.md', 'lane work\n', 'feat: lane');
  git(root, 'checkout', '-q', 'main');
  const baseTip = await commitFile(root, 'base.md', 'line one\nline two\n', 'docs: base moves');
  git(root, 'checkout', '-q', 'lane');
  return { root, seed, baseTip, laneHead };
}

async function withRepo(prove: (repo: Repo) => Promise<void>): Promise<void> {
  const repo = await makeRepo();
  try {
    await prove(repo);
  } finally {
    await rm(repo.root, { recursive: true, force: true });
  }
}

async function provesTheOneSyncShape(): Promise<void> {
  await withRepo(async (repo) => {
    git(repo.root, 'merge', '-q', '--no-edit', 'main');
    const merge = git(repo.root, 'rev-parse', 'HEAD');
    assert.equal(isSyncPush(repo.laneHead, merge, repo.baseTip, executorIn(repo.root)), true);
    // An older base tip still identifies the base: the second parent descends from it.
    assert.equal(isSyncPush(repo.laneHead, merge, repo.seed, executorIn(repo.root)), false);
  });
}

async function refusesAMergeTimeEditThatKeepsTheLineCounts(): Promise<void> {
  await withRepo(async (repo) => {
    git(repo.root, 'merge', '-q', '--no-commit', '--no-ff', 'main');
    await writeFile(join(repo.root, 'base.md'), 'line one\nline 2 edited at merge time\n');
    git(repo.root, 'add', 'base.md');
    git(repo.root, 'commit', '-q', '--no-edit');
    const merge = git(repo.root, 'rev-parse', 'HEAD');
    assert.equal(isSyncPush(repo.laneHead, merge, repo.baseTip, executorIn(repo.root)), false);
  });
}

async function refusesAMergeOfAnotherBranch(): Promise<void> {
  await withRepo(async (repo) => {
    git(repo.root, 'checkout', '-q', '-b', 'other', repo.seed);
    await commitFile(repo.root, 'other.md', 'other work\n', 'feat: other');
    git(repo.root, 'checkout', '-q', 'lane');
    git(repo.root, 'merge', '-q', '--no-edit', 'other');
    const merge = git(repo.root, 'rev-parse', 'HEAD');
    assert.equal(isSyncPush(repo.laneHead, merge, repo.baseTip, executorIn(repo.root)), false);
  });
}

async function refusesAMergeOverUnpushedCommitsAndAPlainCommit(): Promise<void> {
  await withRepo(async (repo) => {
    const second = await commitFile(repo.root, 'lane-2.md', 'more lane work\n', 'feat: lane 2');
    assert.equal(isSyncPush(repo.laneHead, second, repo.baseTip, executorIn(repo.root)), false);
    git(repo.root, 'merge', '-q', '--no-edit', 'main');
    const merge = git(repo.root, 'rev-parse', 'HEAD');
    // The remote holds laneHead; the merge sits over `second`, which rides along.
    assert.equal(isSyncPush(repo.laneHead, merge, repo.baseTip, executorIn(repo.root)), false);
    assert.equal(isSyncPush(second, merge, repo.baseTip, executorIn(repo.root)), true);
  });
}

await provesTheOneSyncShape();
await refusesAMergeTimeEditThatKeepsTheLineCounts();
await refusesAMergeOfAnotherBranch();
await refusesAMergeOverUnpushedCommitsAndAPlainCommit();
process.stdout.write(
  'review-cost sync-push smoke: the one sync shape passes; four refusals hold\n',
);
