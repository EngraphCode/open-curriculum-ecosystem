import assert from 'node:assert/strict';

import { describe, expect, it } from 'vitest';

import { readHarnessText } from './harness-text.js';
import { execOutputs, refusalRecords } from './test-helpers/seat-fixtures.js';

/** The refusal fixture's one tool output, as the harness wrote it (a string carrier). */
function observedRefusalOutput(): string {
  const [output] = execOutputs(refusalRecords());
  assert(output);
  const text = output.payload['output'];
  assert(typeof text === 'string' && text.length > 0);
  return text;
}

const NONCE = 'nonce-4e21';
const COMPLETED = 'Script completed\nWall time 0.1 seconds\nOutput:\n';
const FAILED = 'Script failed\nWall time 0.0 seconds\nOutput:\n';

/** The router's rendering of a refusal, as the code-mode wrapper appends it after `Script error:`. */
function debugRejected(commandLine: string, justification: string): string {
  const message = `\`${commandLine}\` rejected: ${justification}`;
  const literal = JSON.stringify(message);
  return `exec_command failed: CreateProcess { message: "Rejected(${literal.replaceAll('\\', '\\\\').replaceAll('"', String.raw`\"`)})" }`;
}

describe('readHarnessText reads a refusal by the exec policy', () => {
  it('reads the observed refusal: the judged command line and the justification', () => {
    const read = readHarnessText(observedRefusalOutput());
    assert(read.kind === 'text');
    expect(read.status).toBe('failed');
    expect(read.refusal).toStrictEqual({
      commandLine: "/bin/zsh -lc 'git push origin HEAD'",
      justification:
        'Push with `pnpm agent-tools merge-bot push --branch <branch>`, which refuses force and default branches.',
    });
    expect(read.truncated).toBe(false);
  });

  it.each([
    { name: 'a string', carry: (text: string): unknown => text },
    {
      name: "the harness's parts",
      carry: (text: string): unknown => [{ type: 'input_text', text }],
    },
    {
      name: 'a JSON string holding the parts',
      carry: (text: string): unknown => JSON.stringify([{ type: 'input_text', text }]),
    },
  ])('reads a code-mode refusal from $name carrier', ({ carry }) => {
    const text = `${FAILED}Script error:\n${debugRejected(`git push ${NONCE}`, `because ${NONCE}`)}`;
    const read = readHarnessText(carry(text));
    assert(read.kind === 'text');
    expect(read.refusal).toStrictEqual({
      commandLine: `git push ${NONCE}`,
      justification: `because ${NONCE}`,
    });
  });

  it('reads a function-tool refusal from offset 0, in the bare and the rendered forms', () => {
    const bare = readHarnessText(`\`git push ${NONCE}\` rejected: because ${NONCE}`);
    const rendered = readHarnessText(debugRejected(`git push ${NONCE}`, `because ${NONCE}`));
    for (const read of [bare, rendered]) {
      assert(read.kind === 'text');
      expect(read.status).toBe('none');
      expect(read.refusal?.commandLine).toBe(`git push ${NONCE}`);
    }
  });

  it('reads a refused write_stdin as a refusal with no command line', () => {
    const read = readHarnessText(`write_stdin rejected: ${NONCE}`);
    assert(read.kind === 'text');
    expect(read.refusal).toStrictEqual({ commandLine: '', justification: NONCE });
  });

  it('never reads the program’s own text: the same words under a completed script are no refusal', () => {
    const printed = `${COMPLETED}${debugRejected(`git push ${NONCE}`, NONCE)}`;
    const read = readHarnessText(printed);
    assert(read.kind === 'text');
    expect(read.status).toBe('completed');
    expect(read.refusal).toBeUndefined();
  });

  it('anchors after the last Script error line, not the first thing that looks like one', () => {
    const program = `Script error:\n${debugRejected(`git push ${NONCE}`, NONCE)}\n`;
    const harness = `Script error:\nTypeError: ${NONCE}`;
    const read = readHarnessText(`${FAILED}${program}${harness}`);
    assert(read.kind === 'text');
    expect(read.status).toBe('failed');
    expect(read.refusal).toBeUndefined();
  });
});

describe('readHarnessText reads the wrapper and its truncation', () => {
  it.each([
    { text: `${COMPLETED}{"exit_code":0}`, status: 'completed' },
    { text: `${FAILED}Script error:\nTypeError: x`, status: 'failed' },
    { text: 'Script terminated\nWall time 3.0 seconds\nOutput:\n', status: 'terminated' },
    {
      text: 'Script running with cell ID 7\nWall time 1.0 seconds\nOutput:\npartial',
      status: 'running',
    },
    { text: `Chunk ID: a1\nProcess exited with code 0\nOutput:\n${NONCE}`, status: 'none' },
  ])('reads the status $status', ({ text, status }) => {
    const read = readHarnessText(text);
    assert(read.kind === 'text');
    expect(read.status).toBe(status);
  });

  it('reads a truncation marker after the anchor as truncated', () => {
    const read = readHarnessText(`${FAILED}Script error:\n…153 tokens truncated…`);
    assert(read.kind === 'text');
    expect(read.truncated).toBe(true);
  });

  it('reads a truncation marker in a function-tool output as truncated', () => {
    const read = readHarnessText(`${NONCE}\nWarning: truncated output\n`);
    assert(read.kind === 'text');
    expect(read.truncated).toBe(true);
  });

  it('does not read a truncation marker the program printed under a completed script', () => {
    const read = readHarnessText(`${COMPLETED}…153 tokens truncated…`);
    assert(read.kind === 'text');
    expect(read.truncated).toBe(false);
  });

  it.each([
    { output: 42 },
    { output: { text: 'x' } },
    { output: [{ type: 'input_text' }] },
    { output: null },
  ])('reads an output that is neither text nor parts as malformed: $output', ({ output }) => {
    const read = readHarnessText(output);
    expect(read.kind).toBe('malformed');
  });
});
