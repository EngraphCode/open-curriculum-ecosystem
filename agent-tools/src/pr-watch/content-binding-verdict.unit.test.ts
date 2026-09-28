import { describe, expect, it } from 'vitest';

import type { CompletionCommentReview } from './completion-comments.js';
import type { ContentLeg, PatchId } from './content-binding.js';
import { syntheticPatchId } from './content-fixture.js';
import type { HarvestedReview } from './reviewer-legs.js';
import { COPILOT, OLD_TIP, settledReading, TIP } from './state-reading-fixture.js';
import type { PrStateReading, PrVerdict } from './state-types.js';
import { computePrVerdict } from './states.js';

/**
 * A pull request synced with its base after its reviews: the reviews name
 * the commit before the sync, and the head is the sync merge. When the two
 * carry the same patch against the base, the reviews bind the head by
 * content and the verdict reads the tip reviewed; otherwise the leg stays
 * owed and says why. The patch-ids are synthetic; `content-reader.ts` reads
 * real ones.
 */

const CODEX = 'chatgpt-codex-connector';
const PATCH = syntheticPatchId('1');
const OTHER_PATCH = syntheticPatchId('f');
// Checks went green on the sync merge at 12:00Z; the reviews came before it.
const FIRST_GREEN = '2026-07-21T12:01:00Z';

function synced(reviewedPatch: PatchId): ContentLeg {
  return {
    kind: 'read',
    head: PATCH,
    reviewed: [{ oid: OLD_TIP, content: { kind: 'id', id: reviewedPatch } }],
  };
}

const beforeTheSync: HarvestedReview = {
  author: COPILOT,
  state: 'COMMENTED',
  body: 'Reviewed 2 of 2 files.',
  commitOid: OLD_TIP,
  submittedAt: '2026-07-21T11:30:00Z',
};

function verdictOf(overrides: Partial<PrStateReading>): PrVerdict {
  return computePrVerdict(settledReading(overrides), FIRST_GREEN);
}

/** The reviewer's leg line: its state, then its detail. */
function legLine(verdict: PrVerdict, reviewer: string): string {
  return (
    verdict.evidence.find(
      (line) => /^\S+: (SATISFIED|OWED|SKIPPED)/u.test(line) && line.startsWith(`${reviewer}: `),
    ) ?? ''
  );
}

function namesTheInference(line: string): boolean {
  return (
    line.includes('bound by content') &&
    [PATCH, OLD_TIP, TIP].every((id) => line.includes(id.slice(0, 10)))
  );
}

describe('computePrVerdict — reviews bound by content', () => {
  it('reads a review of the commit before a pure sync as a review of the tip, settling at first green', () => {
    const verdict = verdictOf({ reviews: [beforeTheSync], content: synced(PATCH) });
    expect(verdict.state).toBe('SETTLE-READY');
    const leg = legLine(verdict, COPILOT);
    expect(leg.startsWith(`${COPILOT}: SATISFIED`) && namesTheInference(leg)).toBe(true);
    expect(
      verdict.evidence.some(
        (line) =>
          line.startsWith(`tip-bound review body present: ${COPILOT}`) && namesTheInference(line),
      ),
    ).toBe(true);
  });

  it.each<[string, ContentLeg, string]>([
    [
      'the sync changed the content the review saw',
      synced(OTHER_PATCH),
      'carries content that differs from the head',
    ],
    [
      'the head’s content could not be read',
      { kind: 'unread', reason: 'the compare diff could not be read' },
      'is not bound by content: the compare diff could not be read',
    ],
  ])('leaves the leg owed, and says why, when %s', (_why, content, why) => {
    const verdict = verdictOf({ reviews: [beforeTheSync], content });
    expect(verdict.state).toBe('SILENT-WAIT-NO-REVIEWER');
    expect(legLine(verdict, COPILOT)).toBe(
      `${COPILOT}: OWED — no substantive review binds the current tip; the review at ${OLD_TIP.slice(0, 10)} ${why}`,
    );
  });

  it('holds a leg bound by content while a round is requested on the tip', () => {
    const verdict = verdictOf({
      reviews: [beforeTheSync],
      content: synced(PATCH),
      reviewRequests: [COPILOT],
    });
    expect(verdict.state).not.toBe('SETTLE-READY');
    expect(legLine(verdict, COPILOT)).toContain(
      'is bound by content and waits for the round requested on the tip',
    );
  });

  it('names the content inference on a satisfied leg that also holds an empty reply on the tip', () => {
    const reply: HarvestedReview = {
      ...beforeTheSync,
      body: '',
      commitOid: TIP,
      submittedAt: '2026-07-21T11:45:00Z',
    };
    const leg = legLine(
      verdictOf({ reviews: [beforeTheSync, reply], content: synced(PATCH) }),
      COPILOT,
    );
    expect(leg.startsWith(`${COPILOT}: SATISFIED`) && namesTheInference(leg)).toBe(true);
    expect(leg).toContain('1 tip-bound empty-bodied review ignored');
  });

  it('reads a quota marker on the commit before a pure sync as the tip’s, naming the inference', () => {
    const marker: HarvestedReview = {
      ...beforeTheSync,
      body: 'Review skipped: the spend limit was reached.',
    };
    const verdict = verdictOf({ reviews: [marker], content: synced(PATCH) });
    expect(verdict.state).toBe('QUOTA-SKIPPED');
    expect(namesTheInference(legLine(verdict, COPILOT))).toBe(true);
  });
});

describe('computePrVerdict — completion comments bound by content', () => {
  function comment(id: string, body: string): CompletionCommentReview {
    return {
      id,
      author: CODEX,
      state: 'COMMENTED',
      body,
      commitOid: OLD_TIP,
      submittedAt: '2026-07-21T11:40:00Z',
      transport: 'completion-comment',
    };
  }

  function withComment(review: CompletionCommentReview, content: ContentLeg): PrVerdict {
    return verdictOf({
      expectedReviewers: [COPILOT, CODEX],
      reviews: [{ ...beforeTheSync, commitOid: TIP }],
      completionComments: { reviews: [review], refused: [] },
      content,
    });
  }

  const refusalOf = (verdict: PrVerdict, id: string) =>
    verdict.evidence.filter(
      (line) => line.startsWith(`${CODEX}: completion comment ${id}`) && line.includes('refused'),
    );

  it('reads a completion comment on the commit before a pure sync as a review of the tip, never refusing it as stale', () => {
    const clean = comment('IC_1', '**Reviewed commit:** `bbbbbbbbbb`');
    const bound = withComment(clean, synced(PATCH));
    expect(
      bound.evidence.some(
        (line) =>
          line.includes('IC_1') &&
          line.includes('read as a review of the tip') &&
          namesTheInference(line),
      ),
    ).toBe(true);
    expect(refusalOf(bound, 'IC_1')).toStrictEqual([]);
    expect(refusalOf(withComment(clean, synced(OTHER_PATCH)), 'IC_1')).toHaveLength(1);
  });

  it('never refuses a skip marker bound by content as naming a stale commit, while its leg waits', () => {
    const marker = comment('IC_2', '**Reviewed commit:** `bbbbbbbbbb` — unable to review');
    const bound = withComment(marker, synced(PATCH));
    expect(
      legLine(bound, CODEX).startsWith(
        `${CODEX}: OWED — tip-bound skip marker with unevaluable scope`,
      ),
    ).toBe(true);
    expect(refusalOf(bound, 'IC_2')).toStrictEqual([]);
    expect(refusalOf(withComment(marker, synced(OTHER_PATCH)), 'IC_2')).toHaveLength(1);
  });
});
