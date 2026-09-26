import assert from 'node:assert/strict';

import { describe, expect, it } from 'vitest';

import { justificationOf } from './flag-command.js';
import { renderSummary, type CommandRecordsSummary } from './summary.js';

const summary: CommandRecordsSummary = {
  turns: 2,
  commands: 3,
  flagged: [
    {
      kind: 'interaction',
      line: 7,
      turnId: 'turn-b',
      rendered: ['git add -A', 'git push <arg>'],
      hits: [
        { kind: 'stage-whole-tree', token: '-A' },
        { kind: 'push-outside-the-bot', token: 'push' },
      ],
    },
  ],
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

  it('counts the flagged entries in the header line', () => {
    expect(textLines[0]).toContain('1 flagged');
  });

  it('carries a flagged entry on one line: its kind, turn, every segment, every shape and its justification', () => {
    const flagged = textLines.find((line) => line.startsWith('flagged: line 7'));
    const [entry] = summary.flagged;
    assert(entry);
    expect(flagged).toContain(entry.kind);
    expect(flagged).toContain(entry.turnId);
    for (const segment of entry.rendered) {
      expect(flagged).toContain(segment);
    }
    for (const hit of entry.hits) {
      expect(flagged).toContain(hit.kind);
      expect(flagged).toContain(justificationOf(hit.kind));
    }
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
