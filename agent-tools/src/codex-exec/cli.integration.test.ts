import { describe, expect, it } from 'vitest';

import { runCodexExecCli } from './cli.js';
import { makeIo } from './test-helpers/cli-io.js';

/**
 * The `codex-exec` command line, driven end to end through injected streams:
 * a JSONL stdin in, the exit code and the two output streams out.
 */

describe('runCodexExecCli — last-message', () => {
  it('writes the final agent message to stdout', async () => {
    const io = makeIo([
      JSON.stringify({ type: 'thread.started' }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Done!' } }),
    ]);
    const code = await runCodexExecCli({ command: 'last-message', args: [], ...io });
    expect(code).toBe(0);
    expect(io.stdoutText).toBe('Done!\n');
  });

  it('exits 0 silently when no message found and --strict not set', async () => {
    const io = makeIo([JSON.stringify({ type: 'turn.completed' })]);
    const code = await runCodexExecCli({ command: 'last-message', args: [], ...io });
    expect(code).toBe(0);
    expect(io.stdoutText).toBe('');
  });

  it('exits 1 with stderr message when no message found and --strict is set', async () => {
    const io = makeIo([JSON.stringify({ type: 'turn.completed' })]);
    const code = await runCodexExecCli({ command: 'last-message', args: ['--strict'], ...io });
    expect(code).toBe(1);
    expect(io.stderrText).toContain('no agent_message found');
  });

  it('emits JSON when --format json is set', async () => {
    const io = makeIo([
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Hi' } }),
    ]);
    const code = await runCodexExecCli({
      command: 'last-message',
      args: ['--format', 'json'],
      ...io,
    });
    expect(code).toBe(0);
    expect(JSON.parse(io.stdoutText)).toStrictEqual({ text: 'Hi' });
  });

  it('exits 2 when --format has an invalid value', async () => {
    const io = makeIo([
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Hi' } }),
    ]);
    const code = await runCodexExecCli({
      command: 'last-message',
      args: ['--format', 'xml'],
      ...io,
    });
    expect(code).toBe(2);
    expect(io.stderrText).toContain('--format must be text or json, got: xml');
  });

  it('exits 2 when --format is given without a value', async () => {
    const io = makeIo([
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Hi' } }),
    ]);
    const code = await runCodexExecCli({
      command: 'last-message',
      args: ['--format'],
      ...io,
    });
    expect(code).toBe(2);
    expect(io.stderrText).toContain('--format requires a value');
  });
});

describe('runCodexExecCli — help and errors', () => {
  it('prints usage for the help command', async () => {
    const io = makeIo();
    const code = await runCodexExecCli({ command: 'help', args: [], ...io });
    expect(code).toBe(0);
    expect(io.stdoutText).toContain('last-message');
  });

  it('prints usage and exits 0 when command is undefined', async () => {
    const io = makeIo();
    const code = await runCodexExecCli({ command: undefined, args: [], ...io });
    expect(code).toBe(0);
  });

  it('exits 2 for an unknown command', async () => {
    const io = makeIo();
    const code = await runCodexExecCli({ command: 'frobnicate', args: [], ...io });
    expect(code).toBe(2);
    expect(io.stderrText).toContain('unknown command: frobnicate');
  });
});
