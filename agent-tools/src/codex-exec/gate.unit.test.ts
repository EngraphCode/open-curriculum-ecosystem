import { describe, expect, it } from 'vitest';

import { admitRecord, matchBinding, type PassRecordRejection } from './gate.js';
import type { Binding, PassRecord } from './pass-record.js';

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
    expect(admitRecord({ kind: 'present', value: record })).toStrictEqual({
      ok: true,
      value: record,
    });
  });

  it('refuses when no record exists, so the seat is told to probe', () => {
    expect(admitRecord({ kind: 'absent' })).toStrictEqual({
      ok: false,
      error: { kind: 'no-pass-record' },
    });
  });

  it.each([
    'not-a-regular-file',
    'not-owned-by-user',
    'writable-by-others',
    'over-size-cap',
    'not-json',
  ] satisfies readonly PassRecordRejection[])(
    'refuses a record file the edge would not read (%s), and says why in its own terms',
    (reason) => {
      expect(admitRecord({ kind: 'rejected', reason })).toStrictEqual({
        ok: false,
        error: { kind: 'pass-record-rejected', reason },
      });
    },
  );

  it('refuses a record that is not a pass record', () => {
    expect(
      admitRecord({ kind: 'present', value: { ...record, envelopeDigest: 'x' } }),
    ).toStrictEqual({
      ok: false,
      error: { kind: 'invalid-pass-record' },
    });
  });
});

describe('matchBinding', () => {
  it('opens when the version, the path and the envelope all match the record', () => {
    expect(matchBinding(record, binding)).toStrictEqual({ ok: true, value: undefined });
  });

  it('opens on a record passed at another time with other evidence, which bind nothing', () => {
    const later: PassRecord = {
      ...record,
      passedAt: '2026-09-25T09:00:00Z',
      evidence: ['another probe run'],
    };
    expect(matchBinding(later, binding)).toStrictEqual({ ok: true, value: undefined });
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
    expect(matchBinding(record, { ...binding, ...change })).toStrictEqual({
      ok: false,
      error: { kind: 'binding-mismatch', fields },
    });
  });
});
