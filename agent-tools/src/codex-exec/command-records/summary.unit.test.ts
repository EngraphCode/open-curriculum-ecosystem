import { describe, expect, it } from 'vitest';

import { renderSummary, type CommandRecordsSummary } from './summary.js';

const summary: CommandRecordsSummary = {
  turns: 2,
  commands: 3,
  accounts: [
    { turnId: 'turn-a', executed: 1 },
    { turnId: 'turn-b', executed: 2 },
  ],
  recordTypes: { 'event_msg.task_started': 2, 'event_msg.item_completed': 5 },
  malformed: [{ line: 9, reason: 'CommandExecution.status is outside its closed set' }],
  invalidLines: [4],
};

describe('renderSummary as text', () => {
  const text = renderSummary(summary, 'text');
  const textLines = text.split('\n');

  it('names each turn with its executed count on one line', () => {
    const turnB = textLines.find((line) => line.includes('turn-b'));
    expect(turnB).toContain('executed 2');
  });

  it('carries the malformed record with its line and reason on one line', () => {
    const malformed = textLines.find((line) => line.startsWith('malformed'));
    expect(malformed).toContain('line 9');
    expect(malformed).toContain('CommandExecution.status is outside its closed set');
  });

  it('carries the invalid line numbers and the record type counts', () => {
    expect(textLines.find((line) => line.startsWith('invalid lines'))).toContain('4');
    expect(textLines.find((line) => line.startsWith('record types'))).toContain(
      'event_msg.item_completed=5',
    );
  });

  it('omits the invalid-lines line when there are none', () => {
    const clean = renderSummary({ ...summary, invalidLines: [] }, 'text');
    expect(clean).not.toContain('invalid lines');
  });
});

describe('renderSummary as JSON', () => {
  it('round-trips the same summary the text form was rendered from', () => {
    expect(JSON.parse(renderSummary(summary, 'json'))).toStrictEqual(summary);
  });
});
