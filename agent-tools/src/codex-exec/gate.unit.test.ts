import { describe, expect, it } from 'vitest';

import { admitRecord, matchBinding, type Binding } from './gate.js';
import type { PassRecord } from './pass-record.js';

const record: PassRecord = {
  cliVersion: '0.156.1',
  executablePath: '/opt/codex/releases/0.156.1/bin/codex',
  envelopeDigest: 'a'.repeat(64),
  passedAt: '2026-09-24T11:00:00Z',
  evidence: ['rule 9: the nonce, no WRITE-OK'],
};

/** The binding the record above was written for. */
const binding: Binding = {
  cliVersion: record.cliVersion,
  executablePath: record.executablePath,
  envelopeDigest: record.envelopeDigest,
};

describe('admitRecord', () => {
  it('admits a record that is present and well formed', () => {
    expect(admitRecord({ kind: 'present', value: record })).toEqual({ ok: true, value: record });
  });

  it('refuses when no record exists, so the seat is told to probe', () => {
    expect(admitRecord({ kind: 'absent' })).toEqual({
      ok: false,
      error: { kind: 'no-pass-record' },
    });
  });

  it('refuses a record file the edge would not read, and says why', () => {
    expect(admitRecord({ kind: 'rejected', reason: 'the record is group-writable' })).toEqual({
      ok: false,
      error: { kind: 'pass-record-rejected', reason: 'the record is group-writable' },
    });
  });

  it('refuses a record that is not a pass record', () => {
    expect(admitRecord({ kind: 'present', value: { ...record, envelopeDigest: 'x' } })).toEqual({
      ok: false,
      error: { kind: 'invalid-pass-record' },
    });
  });
});

describe('matchBinding', () => {
  it('opens when the version, the path and the envelope all match the record', () => {
    expect(matchBinding(record, binding)).toEqual({ ok: true, value: undefined });
  });

  it.each([
    ['a CLI update', { cliVersion: '0.157.0' }, ['cliVersion']],
    ['a different codex binary', { executablePath: '/usr/local/bin/codex' }, ['executablePath']],
    ['an envelope change', { envelopeDigest: 'b'.repeat(64) }, ['envelopeDigest']],
    [
      'a CLI update that also moved the binary',
      { cliVersion: '0.157.0', executablePath: '/opt/codex/releases/0.157.0/bin/codex' },
      ['cliVersion', 'executablePath'],
    ],
  ] as const)('refuses after %s, naming each field that differs', (_label, change, fields) => {
    expect(matchBinding(record, { ...binding, ...change })).toEqual({
      ok: false,
      error: { kind: 'binding-mismatch', fields },
    });
  });
});
