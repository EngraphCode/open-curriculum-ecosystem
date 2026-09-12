import { describe, expect, it } from 'vitest';

import { parseRecordedHarvest } from '../../src/pr-tally/harvest.js';
import type { RecordedHarvest } from '../../src/pr-tally/harvest.js';
import { buildRows } from '../../src/pr-tally/rows.js';
import pr138 from './fixtures/pr-138-harvest.json' with { type: 'json' };

const COPILOT = 'copilot-pull-request-reviewer';
const CODEX = 'chatgpt-codex-connector';
const EXPECTED = [COPILOT, CODEX];
const SIGNATURE = '\n\n— Nettle guards Pistil (2de368)';

const firstHead = (harvest: RecordedHarvest) => harvest.commits[0]?.oid ?? '';

const review = (
  overrides: Partial<RecordedHarvest['reviews'][number]> & { commitOid: string },
): RecordedHarvest['reviews'][number] => ({
  id: 'PRR_synthetic',
  databaseId: 9000001,
  author: COPILOT,
  state: 'COMMENTED',
  submittedAt: '2026-09-12T12:00:00Z',
  body: '',
  ...overrides,
});

const comment = (databaseId: number, body: string) => ({
  databaseId,
  author: 'el-graphael',
  createdAt: '2026-09-12T12:30:00Z',
  body: `${body}${SIGNATURE}`,
});

describe('buildRows — settlement needs a substantive, dated review from a declared reviewer', () => {
  it('never settles any head when the expected reviewer set is empty', () => {
    const tally = buildRows({ harvest: parseRecordedHarvest(pr138), expectedReviewers: [] });
    expect(tally.rows).toStrictEqual([]);
    expect(tally.unsettled).toHaveLength(tally.heads.length);
  });

  it('does not let a tip-bound skip marker from an expected reviewer satisfy its leg', () => {
    const harvest = parseRecordedHarvest(pr138);
    const head = firstHead(harvest);
    const skipped = review({
      id: 'PRR_skip',
      author: CODEX,
      commitOid: head,
      body: 'Unable to review: service unavailable.',
    });
    const withoutCodex = harvest.reviews.filter(
      (candidate) => !(candidate.commitOid === head && candidate.author === CODEX),
    );
    const row = buildRows({
      harvest: { ...harvest, reviews: [...withoutCodex, skipped] },
      expectedReviewers: EXPECTED,
    }).unsettled.find((candidate) => candidate.head === head);
    expect(row?.owed).toStrictEqual([CODEX]);
  });

  it('holds a head open when a landed review binding it carries no submission time', () => {
    const harvest = parseRecordedHarvest(pr138);
    const head = firstHead(harvest);
    const undated = review({
      id: 'PRR_undated',
      author: COPILOT,
      commitOid: head,
      submittedAt: '',
    });
    const tally = buildRows({
      harvest: { ...harvest, reviews: [...harvest.reviews, undated] },
      expectedReviewers: EXPECTED,
      now: '2026-09-13T00:00:00Z',
    });
    expect(tally.rows.some((row) => row.head === head)).toBe(false);
  });

  it('lets the latest signed line for a body item win, as the last thread reply does', () => {
    const harvest = parseRecordedHarvest(pr138);
    const head = firstHead(harvest);
    const codexBody = review({
      id: 'PRR_codexbody',
      databaseId: 9000002,
      author: CODEX,
      commitOid: head,
      body: '**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Name the thing**\n\nBody.',
    });
    const reference = `head SHA:${head.slice(0, 9)} · review 9000002 · \`docs/a.md:1\` · Name the thing ·`;
    const first = comment(9000003, `**Below-bar** · ${reference} Rejected.`);
    const correction = comment(9000004, `**Over-bar** · ${reference} Cured in SHA:deadbeef0.`);
    const rows = (comments: readonly (typeof first)[]) =>
      buildRows({
        harvest: {
          ...harvest,
          reviews: [...harvest.reviews, codexBody],
          comments: [...harvest.comments, ...comments],
        },
        expectedReviewers: EXPECTED,
      }).rows.find((candidate) => candidate.head === head);
    expect(rows([first])?.cureWorthy).toBe(3);
    expect(rows([first, correction])?.cureWorthy).toBe(4);
  });

  it('reads a batched disposition as manual on the heads it names as heads, never on the cure it cites', () => {
    const harvest = parseRecordedHarvest(pr138);
    const [reviewed, cure] = harvest.commits.map((commit) => commit.oid);
    expect(cure, 'fixture has fewer than two heads').toBeDefined();
    const batched = comment(
      9000005,
      `**Over-bar** — the four on head SHA:${(reviewed ?? '').slice(0, 9)}, together. Cured in SHA:${(cure ?? '').slice(0, 9)}.`,
    );
    const rowsByHead = buildRows({
      harvest: { ...harvest, comments: [...harvest.comments, batched] },
      expectedReviewers: EXPECTED,
    }).rows;
    const base = buildRows({ harvest, expectedReviewers: EXPECTED }).rows;
    expect(rowsByHead.find((row) => row.head === reviewed)?.manual).toBe(4);
    expect(rowsByHead.find((row) => row.head === cure)?.manual).toBe(
      base.find((row) => row.head === cure)?.manual,
    );
  });

  it('reads a bulleted, marked line missing its reference as a batched disposition, never silently', () => {
    const harvest = parseRecordedHarvest(pr138);
    const head = firstHead(harvest);
    const malformed = comment(
      9000006,
      `- **Below-bar** · head SHA:${head.slice(0, 9)} · no reference here.`,
    );
    const row = buildRows({
      harvest: { ...harvest, comments: [...harvest.comments, malformed] },
      expectedReviewers: EXPECTED,
    }).rows.find((candidate) => candidate.head === head);
    expect(row?.undispositioned).toBe(0);
    expect(row?.manual).toBe(4);
  });
});

describe('buildRows — the invariant: nothing the recording does not prove settles or counts', () => {
  it('never reads a code-wrapped cure citation as a head a batched disposition names', () => {
    const harvest = parseRecordedHarvest(pr138);
    const [reviewed, cure] = harvest.commits.map((commit) => commit.oid);
    expect(cure, 'fixture has fewer than two heads').toBeDefined();
    const batched = comment(
      9000007,
      `**Over-bar** — the four on ${(reviewed ?? '').slice(0, 9)}, together. Cured in \`SHA:${(cure ?? '').slice(0, 9)}\`.`,
    );
    const rows = buildRows({
      harvest: { ...harvest, comments: [...harvest.comments, batched] },
      expectedReviewers: EXPECTED,
    }).rows;
    const base = buildRows({ harvest, expectedReviewers: EXPECTED }).rows;
    expect(rows.find((row) => row.head === cure)?.manual).toBe(
      base.find((row) => row.head === cure)?.manual,
    );
  });

  it('reads a skip marker from any reviewer as no finding prose, never as manual', () => {
    const harvest = parseRecordedHarvest(pr138);
    const head = firstHead(harvest);
    const skipped = review({
      id: 'PRR_other_skip',
      author: 'some-other-reviewer',
      commitOid: head,
      body: 'Review skipped: unable to review this pull request.',
    });
    const withSkip = buildRows({
      harvest: { ...harvest, reviews: [...harvest.reviews, skipped] },
      expectedReviewers: EXPECTED,
    }).rows.find((row) => row.head === head);
    const base = buildRows({ harvest, expectedReviewers: EXPECTED }).rows.find(
      (row) => row.head === head,
    );
    expect(withSkip?.manual).toBe(base?.manual);
    expect(withSkip?.raised).toBe(base?.raised);
  });

  it('reads a marked line missing its reference as batched even beside a line that parses', () => {
    const harvest = parseRecordedHarvest(pr138);
    const head = firstHead(harvest);
    const codexBody = review({
      id: 'PRR_codexbody',
      databaseId: 9000002,
      author: CODEX,
      commitOid: head,
      body: '**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Name the thing**\n\nBody.',
    });
    const mixed = comment(
      9000008,
      `- **Over-bar** · head SHA:${head.slice(0, 9)} · review 9000002 · \`docs/a.md:1\` · Name the thing · Cured in SHA:deadbeef0.\n- **Below-bar** · head SHA:${head.slice(0, 9)} · the rest, together.`,
    );
    const row = buildRows({
      harvest: {
        ...harvest,
        reviews: [...harvest.reviews, codexBody],
        comments: [...harvest.comments, mixed],
      },
      expectedReviewers: EXPECTED,
    }).rows.find((candidate) => candidate.head === head);
    expect(row?.cureWorthy).toBe(4);
    expect(row?.undispositioned).toBe(0);
    expect(row?.manual).toBe(4);
  });
});
