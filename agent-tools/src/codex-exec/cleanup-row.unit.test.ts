import { describe, expect, it } from 'vitest';

import { parseDialogueId } from './cleanup-row.js';

describe('parseDialogueId', () => {
  it.each(['a', 'dlg-20260924-ab12', 'probe', 'a'.repeat(64), '0-9-a'])(
    'accepts the lowercase slug %j',
    (raw) => {
      expect(parseDialogueId(raw)).toStrictEqual({ ok: true, value: raw });
    },
  );

  it.each([
    ['the empty string', ''],
    ['65 characters', 'a'.repeat(65)],
    ['an uppercase letter', 'Dlg-1'],
    ['a leading hyphen', '-dlg'],
    ['a trailing hyphen', 'dlg-'],
    ['a double hyphen', 'dlg--1'],
    ['option syntax', '--x'],
    ['a path separator', 'dlg/1'],
    ['a space', 'dlg 1'],
    ['a dot', 'dlg.1'],
    ['a newline', 'dlg\n1'],
  ])('refuses %s', (_label, raw) => {
    expect(parseDialogueId(raw)).toStrictEqual({
      ok: false,
      error: 'a dialogue id must be a lowercase slug of 1 to 64 characters',
    });
  });
});
