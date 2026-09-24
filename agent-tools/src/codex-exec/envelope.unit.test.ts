import { describe, expect, it } from 'vitest';

import {
  buildChildEnv,
  buildOpenArgv,
  buildResumeArgv,
  envelopeDigest,
  parseThreadId,
  type ThreadId,
} from './envelope.js';
import { parseModelPins, type ModelPins } from './model-pins.js';
import { parsePassRecord } from './pass-record.js';

const V7_ID = '01a0cfaf-7914-72e2-afe7-fb2d0938eb94';

describe('parseThreadId', () => {
  it.each([
    ['a v7 id, the form Codex thread ids take', V7_ID],
    ['a v4 id', '3f2b8c1e-9d4a-4e6b-8a7c-1b2d3e4f5a6b'],
  ])('accepts %s', (_label, id) => {
    expect(parseThreadId(id)).toStrictEqual({ ok: true, value: id });
  });

  it.each([
    ['an option-shaped value', '--dangerously-bypass-approvals-and-sandbox'],
    ['a thread name', 'my-dialogue'],
    ['an uppercase UUID', V7_ID.toUpperCase()],
    ['a UUID with a leading space', ` ${V7_ID}`],
    ['a UUID with a trailing space', `${V7_ID} `],
    ['a UUID with an option appended', `${V7_ID}--x`],
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

  it('accepts a model name of 64 characters, the longest allowed', () => {
    const model = 'a'.repeat(64);
    expect(parseModelPins(`model = "${model}"`)).toStrictEqual({ ok: true, value: { model } });
  });

  it('reads the lowest effort, none, as a pin', () => {
    expect(parseModelPins('model_reasoning_effort = "none"')).toStrictEqual({
      ok: true,
      value: { effort: 'none' },
    });
  });

  it.each([
    ['a model with a quote', String.raw`model = "gpt\"; rm"`, 'model'],
    ['a model starting with a dash', 'model = "-m"', 'model'],
    ['a model of 65 characters', `model = "${'a'.repeat(65)}"`, 'model'],
    ['a model that is not a string', 'model = 6', 'model'],
    [
      'an effort outside the closed set',
      'model_reasoning_effort = "extreme"',
      'model_reasoning_effort',
    ],
    ['an effort that is not a string', 'model_reasoning_effort = true', 'model_reasoning_effort'],
  ])('fails closed on %s, naming the key', (_label, text, key) => {
    expect(parseModelPins(text)).toStrictEqual({
      ok: false,
      error: { kind: 'invalid-model-pin', key },
    });
  });
});

const SENTINEL =
  'The dialogue call envelope changed. Re-adjudicate the authority envelope ' +
  '(ADR-180 §6) before changing this expectation.';

const THREAD = V7_ID;

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

describe('envelopeDigest', () => {
  const pinned: ModelPins = { model: 'gpt-6-sol', effort: 'xhigh' };

  it('gives the same envelope the same digest every time', () => {
    expect(envelopeDigest(pinned)).toBe(envelopeDigest({ ...pinned }));
  });

  it('gives a digest the pass record accepts', () => {
    const passRecord = {
      cliVersion: '0.156.1',
      executablePath: '/opt/codex/bin/codex',
      envelopeDigest: envelopeDigest(pinned),
      passedAt: '2026-09-24T11:00:00Z',
      evidence: ['rule 9: the nonce, no WRITE-OK'],
    };
    expect(parsePassRecord(passRecord).ok).toBe(true);
  });

  it.each([
    ['another model', { ...pinned, model: 'gpt-6-terra' }],
    ['another effort', { ...pinned, effort: 'high' }],
    ['no model pin', { effort: pinned.effort }],
    ['no effort pin', { model: pinned.model }],
    ['no pins at all', {}],
  ] satisfies readonly (readonly [string, ModelPins])[])(
    'gives an envelope with %s a different digest, so a pass on one model is no pass on another',
    (_label, other) => {
      expect(envelopeDigest(other)).not.toBe(envelopeDigest(pinned));
    },
  );
});
