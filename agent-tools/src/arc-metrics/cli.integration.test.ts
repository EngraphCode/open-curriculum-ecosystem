import { describe, expect, it } from 'vitest';

import { runArcMetricsCli, type ArcMetricsCliInput } from './cli.js';
import type { ArcMetricsFileSystem } from './file-system.js';

function transcript(sessionSuffix: string): string {
  return [
    JSON.stringify({
      type: 'assistant',
      timestamp: `2026-09-16T10:0${sessionSuffix}:00Z`,
      message: {
        id: `msg_${sessionSuffix}`,
        usage: {
          input_tokens: 10,
          output_tokens: 100,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 90,
        },
      },
    }),
    JSON.stringify({
      type: 'user',
      timestamp: `2026-09-16T10:0${sessionSuffix}:30Z`,
      promptSource: 'typed',
      origin: { kind: 'human' },
      message: { content: 'the owner speaks' },
    }),
  ].join('\n');
}

function fakeFs(files: Readonly<Record<string, readonly string[]>>): ArcMetricsFileSystem {
  return {
    listTranscripts: async (directory) => files[directory] ?? [],
    readLines: async function* (absolutePath) {
      yield* transcript(absolutePath.includes('two') ? '2' : '1').split('\n');
    },
  };
}

const baseInput = (argv: readonly string[], fs: ArcMetricsFileSystem): ArcMetricsCliInput => ({
  argv,
  cwd: '/ws/code/site',
  env: { HOME: '/h' },
  fs,
});

describe('runArcMetricsCli', () => {
  it('measures every transcript in the directory derived from the launch directory', async () => {
    const fs = fakeFs({ '/h/.claude/projects/-ws-code-site': ['/p/one.jsonl'] });

    const result = await runArcMetricsCli(baseInput(['--vendor', 'claude'], fs));

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('sessions 1');
    expect(result.stdout).toContain('owner 1');
  });

  it('measures several named project directories, as a session that moved needs', async () => {
    const fs = fakeFs({
      '/h/.claude/projects/-a': ['/p/one.jsonl'],
      '/h/.claude/projects/-b': ['/p/two.jsonl'],
    });

    const result = await runArcMetricsCli(
      baseInput(
        [
          '--vendor',
          'claude',
          '--project-dir',
          '/h/.claude/projects/-a',
          '--project-dir',
          '/h/.claude/projects/-b',
        ],
        fs,
      ),
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('sessions 2');
  });

  it('measures a directory once, however often and however it is named', async () => {
    const fs = fakeFs({
      '/h/.claude/projects/-a': ['/p/one.jsonl'],
      '/h/.claude/projects/-a/': ['/p/one.jsonl'],
    });

    const result = await runArcMetricsCli(
      baseInput(
        [
          '--vendor',
          'claude',
          '--project-dir',
          '/h/.claude/projects/-a',
          '--project-dir',
          '/h/.claude/projects/-a',
          '--project-dir',
          '/h/.claude/projects/-a/',
        ],
        fs,
      ),
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('sessions 1');
  });

  it("reports each session's cache reads in its own text row", async () => {
    const fs = fakeFs({ '/h/.claude/projects/-ws-code-site': ['/p/one.jsonl'] });

    const result = await runArcMetricsCli(baseInput(['--vendor', 'claude'], fs));

    const row = result.stdout.split('\n').find((line) => line.startsWith('  one '));
    expect(row).toContain('cache-read 90');
  });

  it('emits JSON with the totals and the threshold when asked', async () => {
    const fs = fakeFs({ '/h/.claude/projects/-ws-code-site': ['/p/one.jsonl'] });

    const result = await runArcMetricsCli(
      baseInput(['--vendor', 'claude', '--gap-minutes', '5', '--json'], fs),
    );

    const parsed: unknown = JSON.parse(result.stdout);
    expect(parsed).toMatchObject({
      vendor: 'claude',
      gapSeconds: 300,
      totals: { sessions: 1, apiCalls: 1, ownerMessages: 1 },
    });
  });

  it('refuses an unsupported vendor with exit code 2', async () => {
    const fs = fakeFs({});

    const result = await runArcMetricsCli(baseInput(['--vendor', 'cursor'], fs));

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('unsupported vendor: cursor');
  });

  it('refuses a non-numeric active-time threshold', async () => {
    const fs = fakeFs({});

    const result = await runArcMetricsCli(
      baseInput(['--vendor', 'claude', '--gap-minutes', 'soon'], fs),
    );

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('--gap-minutes');
  });

  it('refuses an empty HOME as an input error rather than reporting from the filesystem root', async () => {
    const fs = fakeFs({ '/.claude/projects/-ws-code-site': ['/p/one.jsonl'] });

    const result = await runArcMetricsCli({
      argv: ['--vendor', 'claude'],
      cwd: '/ws/code/site',
      env: { HOME: '' },
      fs,
    });

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe('');
  });

  it('reports a listing failure as exit code 1 with the directory named', async () => {
    const fs: ArcMetricsFileSystem = {
      listTranscripts: async () => {
        throw new Error('permission denied');
      },
      readLines: async function* () {
        yield '';
      },
    };

    const result = await runArcMetricsCli(baseInput(['--vendor', 'claude'], fs));

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('permission denied');
  });

  it('prints help without reading anything', async () => {
    const fs = fakeFs({});

    const result = await runArcMetricsCli(baseInput(['--help'], fs));

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('arc-metrics --vendor');
  });
});
