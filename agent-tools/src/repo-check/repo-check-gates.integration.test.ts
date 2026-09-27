/**
 * Integration tests for the tracked gates' process edge, through a literal
 * runtime: git's answers are stubbed by the read asked for, the tool runs
 * answer with scripted exit statuses, and each test asserts the gate's own
 * exit status only (never which calls were made).
 */
import { describe, expect, it } from 'vitest';

import { runMarkdownlintTracked, runPrettierTracked } from './repo-check-gates.js';
import type { RepoCheckCommandResult, RepoCheckRuntime } from './repo-check-types.js';

const passed = (stdout: string): RepoCheckCommandResult => ({
  status: 0,
  signal: null,
  stdout,
  stderr: '',
});

/** A runtime whose git reads answer from the listing and whose tool runs exit with `statuses` in turn. */
function runtimeOver(input: {
  readonly tracked: RepoCheckCommandResult;
  readonly statuses?: readonly number[];
}): RepoCheckRuntime {
  const statuses = [...(input.statuses ?? [])];
  return {
    runCaptured: (_command, args) => {
      if (args.includes('-s')) {
        return passed('');
      }
      return args[0] === 'diff-files' ? passed('') : input.tracked;
    },
    runInherited: () => Promise.resolve(statuses.shift() ?? 0),
  };
}

/** A NUL-separated listing of `count` Markdown paths of about a hundred bytes each. */
function largeListing(count: number): string {
  return Array.from(
    { length: count },
    (_, index) => `docs/${String(index).padStart(90, '0')}.md\u0000`,
  ).join('');
}

describe('the tracked gates', () => {
  it('fail when git cannot list the tracked tree, whatever the tools would say', async () => {
    const broken = runtimeOver({
      tracked: { status: 128, signal: null, stdout: '', stderr: 'fatal: not a git repository' },
    });
    await expect(runPrettierTracked('check', broken)).resolves.toBe(1);
    await expect(runMarkdownlintTracked('check', broken)).resolves.toBe(1);
  });

  it('fail when git lists no tracked file, rather than pass having checked nothing', async () => {
    const empty = runtimeOver({ tracked: passed('') });
    await expect(runPrettierTracked('check', empty)).resolves.toBe(1);
  });

  it('fail when any chunk of a large tree fails, and pass when every chunk passes', async () => {
    // Six thousand hundred-byte paths overflow the 256 KiB budget into three runs.
    const listing = passed(largeListing(6000));
    await expect(
      runMarkdownlintTracked('check', runtimeOver({ tracked: listing, statuses: [0, 1, 0] })),
    ).resolves.toBe(1);
    await expect(
      runMarkdownlintTracked('check', runtimeOver({ tracked: listing, statuses: [0, 0, 0] })),
    ).resolves.toBe(0);
  });

  it('refuse a tracked Markdown path a glob reader would skip, rather than pass it unlinted', async () => {
    const globbed = runtimeOver({ tracked: passed('docs/a.md\u0000docs/[draft].md\u0000') });
    await expect(runMarkdownlintTracked('check', globbed)).resolves.toBe(1);
  });

  it('pass with nothing to run when the tree holds no file the gate reads', async () => {
    const noMarkdown = runtimeOver({ tracked: passed('src/a.ts\u0000') });
    await expect(runMarkdownlintTracked('check', noMarkdown)).resolves.toBe(0);
  });
});
