#!/usr/bin/env node

/**
 * Operator Profile Sync
 *
 * `pull`: bring a profile that is a git repository with a remote up to date
 * (fetch, fast-forward, else a plain merge; conflicts are surfaced for a
 * union resolution). `push --message <m>`: run the profile check, then
 * commit and push the operator's ratified writes under the operator's own
 * git identity. Both are no-ops that say so when the root is absent, is
 * not a repository, or has no remote — all first-class states of the
 * operator-profile PDR (decisions 13 to 16).
 *
 * The root is `${PRACTICE_HOME:-~/.practice}/profile` or `--root <dir>`.
 */

import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { err, ok, type Result } from '@oaknational/result';

import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import { isGitRepository } from './operator-profile-fs.js';
import {
  createGitRunner,
  pullProfile,
  remoteNames,
  type GitRunner,
} from './operator-profile-git.js';
import { pushProfile } from './operator-profile-git-push.js';
import {
  existingProfilePaths,
  readProfileReport,
  resolveProfileRoot,
} from './operator-profile-root.js';

type Command = { readonly kind: 'pull' } | { readonly kind: 'push'; readonly message: string };

const USAGE = 'usage: operator-profile-sync <pull | push --message "<text>"> [--root <dir>]';

/** The options each command admits; every option takes exactly one value. */
const OPTIONS = {
  pull: ['--root'],
  push: ['--root', '--message'],
} as const satisfies Readonly<Record<Command['kind'], readonly string[]>>;

type Option = (typeof OPTIONS)[Command['kind']][number];

/** Zero-widening membership: the literal grammar decides, never a `string` view of it. */
function isOption(kind: Command['kind'], flag: string): flag is Option {
  return OPTIONS[kind].some((option) => option === flag);
}

/** The value after a flag; undefined when absent, blank, or itself a flag. */
function valueAfter(rest: readonly string[], index: number): string | undefined {
  const value = rest[index];
  return value === undefined || value.trim() === '' || value.startsWith('--') ? undefined : value;
}

/**
 * The options as one exhaustive grammar: `--flag value` pairs only, each
 * flag known to the command and given once. An argument the grammar does
 * not name is refused by name, never skipped — a typo such as `--rot` must
 * not fall back to the real home profile.
 */
function parseOptions(
  kind: Command['kind'],
  rest: readonly string[],
): Result<ReadonlyMap<Option, string>, string> {
  const seen = new Map<Option, string>();
  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index] ?? '';
    if (!isOption(kind, flag)) {
      return err(`unknown argument "${flag}" — ${USAGE}`);
    }
    if (seen.has(flag)) {
      return err(`${flag} given more than once — ${USAGE}`);
    }
    const value = valueAfter(rest, index + 1);
    if (value === undefined) {
      return err(`${flag} needs a value — ${USAGE}`);
    }
    seen.set(flag, value);
  }
  return ok(seen);
}

/**
 * Parse the sync command line: the command, then its options, nothing else.
 *
 * @param argv - arguments after the script path
 * @returns the command, or a usage error naming what was refused
 */
export function parseSyncArgs(argv: readonly string[]): Result<Command, string> {
  const [command, ...rest] = argv;
  if (command !== 'pull' && command !== 'push') {
    return err(USAGE);
  }
  const options = parseOptions(command, rest);
  if (!options.ok) {
    return options;
  }
  if (command === 'pull') {
    return ok({ kind: 'pull' });
  }
  const message = options.value.get('--message');
  if (message === undefined) {
    return err('push needs --message "<seat>: <the fact>"');
  }
  return ok({ kind: 'push', message });
}

/** Document failures only: the sync leg is what a push is about to cure. */
async function nonConformingDocuments(root: string): Promise<Result<number, string>> {
  const report = await readProfileReport(root);
  if (!report.ok) {
    return report;
  }
  if (report.value === 'absent') {
    return ok(0);
  }
  return ok(report.value.failures.filter((failure) => failure.relPath !== '(sync)').length);
}

function report(outcome: Result<string, string>): number {
  if (!outcome.ok) {
    writeErrorLine(`✗ profile: ${outcome.error}`);
    return 1;
  }
  writeLine(`✓ profile: ${outcome.value}`);
  return 0;
}

async function runPush(root: string, run: GitRunner, message: string): Promise<number> {
  const refused = await nonConformingDocuments(root);
  if (!refused.ok) {
    return report(refused);
  }
  if (refused.value > 0) {
    return report(
      err(
        `the profile does not conform (${refused.value} document${refused.value === 1 ? '' : 's'} refused) — run pnpm profile:check, fix, then push`,
      ),
    );
  }
  const paths = await existingProfilePaths(root);
  if (!paths.ok) {
    return report(paths);
  }
  return report(pushProfile(run, message, paths.value));
}

/**
 * The runner for a root that is a repository with a remote; a message for the
 * two first-class states with nothing to sync; an error when git cannot read
 * the repository (never mistaken for "no remote").
 */
async function syncTarget(root: string): Promise<Result<GitRunner | string, string>> {
  if (!(await isGitRepository(root))) {
    return ok(`profile at ${root} is absent or not a git repository — nothing to sync`);
  }
  const run = createGitRunner(root);
  const remotes = remoteNames(run);
  if (!remotes.ok) {
    return err(`profile at ${root}: ${remotes.error}`);
  }
  if (remotes.value.length === 0) {
    return ok(`profile at ${root} has no remote — nothing to sync`);
  }
  return ok(run);
}

async function main(argv: readonly string[]): Promise<number> {
  const command = parseSyncArgs(argv);
  const root = resolveProfileRoot(argv, process.env, homedir());
  if (!command.ok || !root.ok) {
    const usage = [command, root].flatMap((parsed) => (parsed.ok ? [] : [parsed.error]));
    writeErrorLine(`✗ ${usage.join('; ')}`);
    return 2;
  }
  const target = await syncTarget(root.value);
  if (!target.ok) {
    writeErrorLine(`✗ ${target.error}`);
    return 1;
  }
  if (typeof target.value === 'string') {
    writeLine(`✓ ${target.value}`);
    return 0;
  }
  if (command.value.kind === 'pull') {
    return report(pullProfile(target.value));
  }
  return runPush(root.value, target.value, command.value.message);
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFilePath) {
  // process.exitCode, never process.exit(): exit() can terminate before
  // piped stdout/stderr flush, truncating the output a caller captures.
  // Nothing runs after this assignment; the process ends when the loop drains.
  process.exitCode = await main(process.argv.slice(2));
}
