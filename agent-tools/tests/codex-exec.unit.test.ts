import { Readable } from 'node:stream';

import { describe, expect, it } from 'vitest';

import { runCodexExecCli } from '../src/codex-exec/cli';
import {
  extractLastAgentMessage,
  parseCodexExecEvent,
  readTurnEvents,
} from '../src/codex-exec/parse-events';

describe('parseCodexExecEvent', () => {
  it('reads thread.started as the thread id', () => {
    const line = JSON.stringify({ type: 'thread.started', thread_id: 'thread-a' });
    expect(parseCodexExecEvent(line)).toStrictEqual({
      kind: 'thread-started',
      threadId: 'thread-a',
    });
  });

  it('reads a completed agent_message item as its text', () => {
    const line = JSON.stringify({
      type: 'item.completed',
      item: { id: 'item_0', type: 'agent_message', text: 'Hello world' },
    });
    expect(parseCodexExecEvent(line)).toStrictEqual({ kind: 'agent-message', text: 'Hello world' });
  });

  it('reads a completed command_execution item as its command, output and exit code', () => {
    const line = JSON.stringify({
      type: 'item.completed',
      item: {
        id: 'item_1',
        type: 'command_execution',
        command: '/bin/zsh -c "printf SIF > s"',
        aggregated_output: 'zsh:1: operation not permitted: s\n',
        exit_code: 1,
        status: 'completed',
      },
    });
    expect(parseCodexExecEvent(line)).toStrictEqual({
      kind: 'command-execution',
      command: '/bin/zsh -c "printf SIF > s"',
      output: 'zsh:1: operation not permitted: s\n',
      exitCode: 1,
    });
  });

  it('reads turn.failed as a turn failure with its message', () => {
    const line = JSON.stringify({ type: 'turn.failed', error: { message: 'quota' } });
    expect(parseCodexExecEvent(line)).toStrictEqual({ kind: 'turn-failed', message: 'quota' });
  });

  it('reads a top-level error event as a stream error', () => {
    const line = JSON.stringify({ type: 'error', message: 'stream broke' });
    expect(parseCodexExecEvent(line)).toStrictEqual({
      kind: 'stream-error',
      message: 'stream broke',
    });
  });

  it('reads an error item inside a turn as a non-fatal other event', () => {
    const line = JSON.stringify({
      type: 'item.completed',
      item: { id: 'item_2', type: 'error', message: 'recoverable' },
    });
    expect(parseCodexExecEvent(line)).toStrictEqual({ kind: 'other', type: 'item.completed' });
  });

  it('reads any other typed event as other', () => {
    expect(parseCodexExecEvent('{"type":"turn.started"}')).toStrictEqual({
      kind: 'other',
      type: 'turn.started',
    });
  });

  it('returns undefined when a recognised event lacks its required field', () => {
    expect(parseCodexExecEvent('{"type":"thread.started"}')).toBeUndefined();
    expect(
      parseCodexExecEvent('{"type":"item.completed","item":{"type":"agent_message"}}'),
    ).toBeUndefined();
    expect(parseCodexExecEvent('{"type":"turn.failed"}')).toBeUndefined();
  });

  it('returns undefined for a malformed JSON line', () => {
    expect(parseCodexExecEvent('{not json')).toBeUndefined();
  });

  it('returns undefined for an empty line', () => {
    expect(parseCodexExecEvent('')).toBeUndefined();
  });

  it('returns undefined when type is missing', () => {
    expect(parseCodexExecEvent('{"item":{}}')).toBeUndefined();
  });
});

describe('readTurnEvents', () => {
  it('folds a resumed turn into its thread ids, agent messages and command runs', () => {
    const lines = [
      JSON.stringify({ type: 'thread.started', thread_id: 'thread-a' }),
      JSON.stringify({ type: 'turn.started' }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Preamble' } }),
      JSON.stringify({
        type: 'item.completed',
        item: { type: 'command_execution', command: 'c', aggregated_output: 'o', exit_code: 0 },
      }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Final' } }),
      JSON.stringify({ type: 'turn.completed', usage: {} }),
    ];
    expect(readTurnEvents(lines)).toStrictEqual({
      threadIds: ['thread-a'],
      agentMessages: ['Preamble', 'Final'],
      commandExecutions: [{ command: 'c', output: 'o', exitCode: 0 }],
      failures: [],
      unparseableLines: 0,
    });
  });

  it('collects turn failures and stream errors as failures', () => {
    const lines = [
      JSON.stringify({ type: 'turn.failed', error: { message: 'quota' } }),
      JSON.stringify({ type: 'error', message: 'stream broke' }),
    ];
    expect(readTurnEvents(lines).failures).toStrictEqual(['quota', 'stream broke']);
  });

  it('counts non-blank lines it cannot parse, and ignores blank ones', () => {
    const lines = ['', '   ', '{bad json', '{"type":"thread.started"}'];
    expect(readTurnEvents(lines).unparseableLines).toBe(2);
  });
});

describe('extractLastAgentMessage', () => {
  it('returns the text of the last agent_message item.completed event', () => {
    const lines = [
      JSON.stringify({ type: 'thread.started' }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'First' } }),
      JSON.stringify({ type: 'item.completed', item: { type: 'command_execution' } }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Final' } }),
      JSON.stringify({ type: 'turn.completed' }),
    ];
    expect(extractLastAgentMessage(lines)).toStrictEqual({ found: true, text: 'Final' });
  });

  it('returns not-found when no agent_message events are present', () => {
    const lines = [
      JSON.stringify({ type: 'thread.started' }),
      JSON.stringify({ type: 'turn.completed' }),
    ];
    expect(extractLastAgentMessage(lines)).toStrictEqual({ found: false });
  });

  it('skips non-item.completed events that have agent_message in item', () => {
    const lines = [
      JSON.stringify({ type: 'item.started', item: { type: 'agent_message', text: 'nope' } }),
    ];
    expect(extractLastAgentMessage(lines)).toStrictEqual({ found: false });
  });

  it('ignores blank lines and malformed JSON', () => {
    const lines = [
      '',
      '{bad json',
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'ok' } }),
    ];
    expect(extractLastAgentMessage(lines)).toStrictEqual({ found: true, text: 'ok' });
  });
});

function makeIo(stdinLines: string[] = []) {
  const stdin = Readable.from(stdinLines.join('\n'));
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
  return {
    stdin,
    stdout: {
      write: (c: string) => {
        stdoutChunks.push(c);
      },
    },
    stderr: {
      write: (c: string) => {
        stderrChunks.push(c);
      },
    },
    get stdoutText() {
      return stdoutChunks.join('');
    },
    get stderrText() {
      return stderrChunks.join('');
    },
  };
}

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
