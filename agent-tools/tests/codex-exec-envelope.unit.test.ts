import { describe, expect, it } from 'vitest';

import {
  buildChildEnv,
  buildOpenArgv,
  buildResumeArgv,
  parseModelPins,
  parseThreadId,
  type ThreadId,
} from '../src/codex-exec/envelope';

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

const SENTINEL =
  'The dialogue call envelope changed. Re-adjudicate the authority envelope ' +
  '(ADR-180 §6) before changing this expectation.';

const THREAD = '01a0cfaf-7914-72e2-afe7-fb2d0938eb94';

function threadId(): ThreadId {
  const parsed = parseThreadId(THREAD);
  if (!parsed.ok) {
    return expect.unreachable('fixture thread id must parse');
  }
  return parsed.value;
}

const FLAGS = [
  '--json',
  '--ignore-user-config',
  '--ignore-rules',
  '--skip-git-repo-check',
  '--disable',
  'memories',
  '--disable',
  'shell_snapshot',
];

const SETTINGS = [
  '-c',
  'sandbox_mode="read-only"',
  '-c',
  'approval_policy="never"',
  '-c',
  'web_search="disabled"',
  '-c',
  'project_root_markers=[]',
  '-c',
  'shell_environment_policy.inherit="core"',
  '-c',
  'allow_login_shell=false',
];

const PINS_SLOT = ['-c', 'model="model-slot"', '-c', 'model_reasoning_effort="high"'];

describe('the dialogue call envelope (designed sentinel)', () => {
  it.each([
    ['with model pins', { model: 'model-slot', effort: 'high' } as const, PINS_SLOT],
    ['without model pins', {}, []],
  ])('builds the open argv exactly, %s', (_label, pins, pinArgs) => {
    expect(buildOpenArgv('/root-slot', pins), SENTINEL).toStrictEqual([
      'exec',
      ...FLAGS,
      '-C',
      '/root-slot',
      ...SETTINGS,
      ...pinArgs,
      '-',
    ]);
  });

  it.each([
    ['with model pins', { model: 'model-slot', effort: 'high' } as const, PINS_SLOT],
    ['without model pins', {}, []],
  ])('builds the resume argv exactly, %s', (_label, pins, pinArgs) => {
    expect(buildResumeArgv(threadId(), pins), SENTINEL).toStrictEqual([
      'exec',
      'resume',
      THREAD,
      ...FLAGS,
      ...SETTINGS,
      ...pinArgs,
      '-',
    ]);
  });

  it('builds the child environment exactly, with both homes belonging to the instrument', () => {
    const env = buildChildEnv({
      instrumentHome: '/home-slot',
      instrumentCodexHome: '/codex-home-slot',
      user: 'user-slot',
      lang: 'lang-slot',
      tmpdir: '/tmp-slot',
    });
    expect(env, SENTINEL).toStrictEqual({
      HOME: '/home-slot',
      USER: 'user-slot',
      LOGNAME: 'user-slot',
      LANG: 'lang-slot',
      TMPDIR: '/tmp-slot',
      PATH: '/usr/bin:/bin:/usr/sbin:/sbin',
      CODEX_HOME: '/codex-home-slot',
    });
  });
});
