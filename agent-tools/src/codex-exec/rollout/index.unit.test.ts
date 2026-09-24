import { describe, expect, it } from 'vitest';

import { readRollout } from './index.js';
import codeMode from './fixtures/observed-code-mode.jsonl?raw';
import codeModeOnly from './fixtures/observed-code-mode-only.jsonl?raw';

/**
 * Redacted structural projections of observed codex-cli 0.156.1 rollouts:
 * 2026-09-23 20:34:22, lines 1, 2, 8, 15, 18, 21, 28, 30, 31, 39;
 * 2026-09-23 20:12:58, lines 1, 2, 8, 15, 18, 19, 24, 26, 32.
 * IDs, paths, prompts, output values and unrelated payload fields were replaced
 * or removed. The record nesting, types, and ordering used by this reader remain.
 */
function fixture(name: string): string[] {
  return (name === 'observed-code-mode' ? codeMode : codeModeOnly).trimEnd().split('\n');
}

describe('readRollout', () => {
  it('reads two recorded contexts and every resumed output record, excluding program input', () => {
    const result = readRollout(fixture('observed-code-mode'));
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.value.threadId).toBe('11111111-1111-4111-8111-111111111111');
    expect(result.value.turns.map((turn) => turn.turnId)).toEqual([
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
    ]);
    expect(result.value.turns[1]?.permissionProfile).toEqual({
      type: 'managed',
      file_system: {
        type: 'restricted',
        entries: [{ path: { type: 'special', value: { kind: 'root' } }, access: 'read' }],
      },
      network: 'restricted',
    });
    expect(result.value.resumedOutputTexts).toHaveLength(2);
    expect(
      result.value.resumedOutputTexts.filter((text) => text.includes('nonce-example')),
    ).toHaveLength(2);
    expect(result.value.resumedOutputTexts.some((text) => text.includes('WRITE-OK'))).toBe(false);
  });

  it('reads the code-mode path when no CommandExecution item exists', () => {
    const result = readRollout(fixture('observed-code-mode-only'));
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.resumedOutputTexts).toHaveLength(1);
    expect(result.value.resumedOutputTexts[0]).toContain('nonce-example');
    expect(result.value.turns[0].effort).toBeUndefined();
  });

  it('fails closed on an unknown top-level record type', () => {
    const lines = fixture('observed-code-mode');
    lines.splice(8, 0, JSON.stringify({ type: 'future_record', payload: {} }));
    expect(readRollout(lines)).toEqual({
      ok: false,
      error: { kind: 'unknown-record-type', line: 9, recordType: 'future_record' },
    });
  });

  it('distinguishes a missing required field from an unknown record type', () => {
    const lines = fixture('observed-code-mode');
    lines[5] = lines[5]?.replace('"permission_profile"', '"renamed_profile"') ?? '';
    expect(readRollout(lines)).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record', line: 6 },
    });
  });

  it('rejects an unknown output subtype and a missing CommandExecution output', () => {
    const unknownType = fixture('observed-code-mode');
    unknownType[8] = unknownType[8]?.replace('"custom_tool_call_output"', '"future_output"') ?? '';
    expect(readRollout(unknownType)).toEqual({
      ok: false,
      error: { kind: 'unknown-record-type', line: 9, recordType: 'response_item.future_output' },
    });

    const missingOutput = fixture('observed-code-mode');
    missingOutput[7] = missingOutput[7]?.replace('"aggregated_output"', '"renamed_output"') ?? '';
    expect(readRollout(missingOutput)).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record', line: 8 },
    });
  });

  it('keeps first-turn tool output out of the resumed evidence', () => {
    const lines = fixture('observed-code-mode');
    lines.splice(3, 0, lines[8]?.replaceAll('nonce-example', 'first-turn-only') ?? '');
    const result = readRollout(lines);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.resumedOutputTexts).not.toContain('first-turn-only');
  });

  it('rejects writable or expanded permission profiles', () => {
    const lines = fixture('observed-code-mode');
    lines[5] = lines[5]?.replace('"access":"read"', '"access":"write"') ?? '';
    expect(readRollout(lines)).toMatchObject({ ok: false, error: { kind: 'invalid-record' } });

    const expanded = fixture('observed-code-mode');
    expanded[5] =
      expanded[5]?.replace('"network":"restricted"', '"network":"restricted","extra":true') ?? '';
    expect(readRollout(expanded)).toMatchObject({ ok: false, error: { kind: 'invalid-record' } });
  });

  it('rejects a third turn and an incomplete turn', () => {
    const extra = fixture('observed-code-mode');
    extra.push(...extra.slice(4, 6), extra[9] ?? '');
    expect(readRollout(extra)).toMatchObject({
      ok: false,
      error: { kind: 'invalid-turn-count', count: 3 },
    });

    const incomplete = fixture('observed-code-mode').slice(0, -1);
    expect(readRollout(incomplete)).toMatchObject({
      ok: false,
      error: { kind: 'invalid-turn-order' },
    });
  });

  it('rejects a malformed tool output rather than silently dropping it', () => {
    const lines = fixture('observed-code-mode');
    lines[8] = lines[8]?.replace('"type":"input_text"', '"type":"future_text"') ?? '';
    expect(readRollout(lines)).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record', line: 9 },
    });
  });

  it('extracts each nested shell result and rejects an unknown wrapper', () => {
    const lines = fixture('observed-code-mode-only');
    lines[7] = JSON.stringify({
      type: 'response_item',
      payload: {
        type: 'custom_tool_call_output',
        output: [
          { type: 'input_text', text: 'Script completed\nWall time 0.1 seconds\nOutput:\n' },
          {
            type: 'input_text',
            text: JSON.stringify({
              chunk_id: 'first',
              wall_time_seconds: 0.1,
              exit_code: 0,
              original_token_count: 1,
              output: 'first-output',
            }),
          },
          {
            type: 'input_text',
            text: JSON.stringify({
              chunk_id: 'second',
              wall_time_seconds: 0.2,
              exit_code: 0,
              original_token_count: 1,
              output: 'second-output',
            }),
          },
        ],
      },
    });
    const result = readRollout(lines);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.resumedOutputTexts).toEqual(['first-output', 'second-output']);

    const unknown = fixture('observed-code-mode-only');
    unknown[7] = unknown[7]?.replace('Script completed', 'Script running') ?? '';
    expect(readRollout(unknown)).toMatchObject({
      ok: false,
      error: { kind: 'invalid-record', line: 8 },
    });
  });
});
