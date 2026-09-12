import { isSignedSelfReply } from '../pr-watch/reviewer-legs.js';
import type { BodyFinding } from './findings.js';
import type { RecordedHarvest } from './harvest.js';
import { readBarMarker } from './markers.js';
import type { BarMarker } from './markers.js';

/**
 * The seat's signed body-only dispositions, as the intake contract records
 * them: one line per finding — the marker, then
 * `head SHA:<sha> · review <id> · <path>:<line> · <item>` — in a signed issue
 * comment. A signed, marked comment carrying no parseable line is a batched
 * disposition: the heads it names read as manual for their body items.
 */

type Review = RecordedHarvest['reviews'][number];
type Thread = RecordedHarvest['reviewThreads'][number];

interface BodyDispositionKey {
  readonly headPrefix: string;
  readonly reviewId: string;
  readonly path: string;
  readonly line: number;
  readonly item: string;
  readonly marker: BarMarker | null;
}

export interface BodyDispositions {
  readonly keys: readonly BodyDispositionKey[];
  /** SHA prefixes named by a signed, marked comment carrying NO parseable line. */
  readonly batchedHeads: readonly string[];
}

// The anchor may sit in a code span; the SHA may be a prefix.
const DISPOSITION_LINE =
  /^-?\s*\*\*[^*\n]+\*\*\s*·\s*head SHA:([0-9a-f]{7,40})\s*·\s*review (\S+)\s*·\s*`?([^`·\n]+?):(\d+)`?\s*·\s*(.+?)\s*·/u;
// A head reference is the format's `head SHA:<sha>`; a cure citation is its
// `Cured in SHA:<sha>` (bare or in a code span) and names no head. Any other
// mention is read as a head only when the comment carries no head reference
// at all (conservatively).
const HEAD_REFERENCE = /head SHA:([0-9a-f]{7,40})/gu;
const SHA_MENTION = /(?<!Cured in `?)SHA:([0-9a-f]{7,40})/gu;
const THREAD_KEY = /^thread (\S+)$/u;
const BULLET = /^-\s*/u;

function headsNamed(body: string): string[] {
  const references = [...body.matchAll(HEAD_REFERENCE)].map((match) => match[1] ?? '');
  if (references.length > 0) {
    return references;
  }
  return [...body.matchAll(SHA_MENTION)].map((match) => match[1] ?? '');
}

function parseKey(line: string): BodyDispositionKey | null {
  const match = DISPOSITION_LINE.exec(line);
  if (match === null) {
    return null;
  }
  return {
    headPrefix: match[1] ?? '',
    reviewId: match[2] ?? '',
    path: match[3] ?? '',
    line: Number(match[4]),
    item: (match[5] ?? '').trim(),
    marker: readBarMarker(line.replace(BULLET, '')),
  };
}

const isMarked = (line: string): boolean => readBarMarker(line.replace(BULLET, '')) !== null;

/** Read every signed body-only disposition in the harvest's issue comments. */
export function readBodyDispositions(harvest: RecordedHarvest): BodyDispositions {
  const signed = harvest.comments.filter((comment) => isSignedSelfReply(comment.body));
  const keys = signed.flatMap((comment) =>
    comment.body
      .split('\n')
      .map(parseKey)
      .filter((key): key is BodyDispositionKey => key !== null),
  );
  // A marked line that does not parse is a batched disposition, whether or
  // not a sibling line parses: the heads its comment names read as manual.
  const batchedHeads = signed
    .filter((comment) =>
      comment.body.split('\n').some((line) => parseKey(line) === null && isMarked(line)),
    )
    .flatMap((comment) => headsNamed(comment.body));
  return { keys, batchedHeads };
}

function sameReview(key: BodyDispositionKey, review: Review): boolean {
  const head = review.commitOid ?? '';
  return (
    head.startsWith(key.headPrefix) &&
    (key.reviewId === review.id || key.reviewId === String(review.databaseId))
  );
}

function sameAnchor(key: BodyDispositionKey, item: BodyFinding): boolean {
  return item.path === null || (key.path === item.path && key.line === item.line);
}

/** Whether a key names this item of this review: same head and review; same anchor unless the item has none; same key. */
export function keyNames(key: BodyDispositionKey, item: BodyFinding, review: Review): boolean {
  return sameReview(key, review) && sameAnchor(key, item) && key.item === item.key;
}

/**
 * Whether a signed line declares this item a restatement of a named inline
 * thread OF THE SAME REVIEW at the same anchor (the state machine's dedup
 * rule) — then the item is that thread and counts once. The declaration binds
 * only when it is unambiguous: exactly one body item of the review sits at
 * that anchor.
 */
export function declaredRestatement(
  item: BodyFinding,
  review: Review,
  dispositions: BodyDispositions,
  threads: readonly Thread[],
  siblings: readonly BodyFinding[],
): boolean {
  const atAnchor = siblings.filter(
    (sibling) => sibling.path === item.path && sibling.line === item.line,
  );
  if (atAnchor.length !== 1) {
    return false;
  }
  return dispositions.keys.some((key) => {
    const named = THREAD_KEY.exec(key.item);
    if (named === null || !sameReview(key, review) || !sameAnchor(key, item)) {
      return false;
    }
    const id = named[1] ?? '';
    return threads.some(
      (thread) =>
        thread.id === id &&
        thread.reviewId === review.id &&
        thread.path === item.path &&
        (thread.originalLine ?? thread.line) === item.line,
    );
  });
}
