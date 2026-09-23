import { describe, expect, it } from 'vitest';

import { parseModelPins, parseThreadId } from '../src/codex-exec/envelope';

describe('parseThreadId', () => {
  it('accepts a lowercase UUID of any version, the v7 thread ids included', () => {
    const id = '01a0cfaf-7914-72e2-afe7-fb2d0938eb94';
    expect(parseThreadId(id)).toStrictEqual({ ok: true, value: id });
  });

  it.each([
    ['an option-shaped value', '--dangerously-bypass-approvals-and-sandbox'],
    ['a thread name', 'my-dialogue'],
    ['an uppercase UUID', '01A0CFAF-7914-72E2-AFE7-FB2D0938EB94'],
    ['a UUID with surrounding space', ' 01a0cfaf-7914-72e2-afe7-fb2d0938eb94'],
    ['an empty value', ''],
  ])('refuses %s', (_label, raw) => {
    expect(parseThreadId(raw).ok).toBe(false);
  });
});

describe('parseModelPins', () => {
  it('reads no pins when there is no configuration', () => {
    expect(parseModelPins(undefined)).toStrictEqual({ ok: true, value: {} });
  });

  it('reads the two top-level keys and nothing else', () => {
    const text = [
      'model = "gpt-6-sol"',
      'model_reasoning_effort = "xhigh"',
      'approval_policy = "on-request"',
      '[mcp_servers.example.env]',
      'TOKEN = "not-read"',
    ].join('\n');
    expect(parseModelPins(text)).toStrictEqual({
      ok: true,
      value: { model: 'gpt-6-sol', effort: 'xhigh' },
    });
  });

  it('reads an absent key as no pin for that key', () => {
    expect(parseModelPins('model = "gpt-6-sol"')).toStrictEqual({
      ok: true,
      value: { model: 'gpt-6-sol' },
    });
  });

  it('never repeats the file text when the configuration cannot be parsed', () => {
    const result = parseModelPins('model = "gpt-6-sol"\nsecret = "abc123\n');
    expect(result).toStrictEqual({ ok: false, error: { kind: 'unparseable-config' } });
  });

  it.each([
    ['a model with a quote', String.raw`model = "gpt\"; rm"`],
    ['a model starting with a dash', 'model = "-m"'],
    ['a model that is not a string', 'model = 6'],
    ['an effort outside the closed set', 'model_reasoning_effort = "extreme"'],
    ['an effort that is not a string', 'model_reasoning_effort = true'],
  ])('fails closed on %s', (_label, text) => {
    expect(parseModelPins(text)).toStrictEqual({ ok: false, error: { kind: 'invalid-model-pin' } });
  });
});
