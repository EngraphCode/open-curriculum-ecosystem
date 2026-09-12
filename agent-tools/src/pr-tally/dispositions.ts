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
const SHA_MENTION = /SHA:([0-9a-f]{7,40})/gu;

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
    marker: readBarMarker(line.replace(/^-\s*/u, '')),
  };
}

/** Read every signed body-only disposition in the harvest's issue comments. */
export function readBodyDispositions(harvest: RecordedHarvest): BodyDispositions {
  const signed = harvest.comments.filter((comment) => isSignedSelfReply(comment.body));
  const keys = signed.flatMap((comment) =>
    comment.body
      .split('\n')
      .map(parseKey)
      .filter((key): key is BodyDispositionKey => key !== null),
  );
  const batchedHeads = signed
    .filter((comment) => comment.body.split('\n').every((line) => parseKey(line) === null))
    .filter((comment) => comment.body.split('\n').some((line) => readBarMarker(line) !== null))
    .flatMap((comment) => [...comment.body.matchAll(SHA_MENTION)].map((match) => match[1] ?? ''));
  return { keys, batchedHeads };
}

/** Whether a key names this item of this review: same head and review; same anchor unless the item has none. */
export function keyNames(key: BodyDispositionKey, item: BodyFinding, review: Review): boolean {
  const head = review.commitOid ?? '';
  const sameReview =
    head.startsWith(key.headPrefix) &&
    (key.reviewId === review.id || key.reviewId === String(review.databaseId));
  const sameAnchor = item.path === null || (key.path === item.path && key.line === item.line);
  return sameReview && sameAnchor && key.item === item.key;
}

/**
 * Whether a signed line declares this item a restatement of a named thread
 * (`thread <id>`) that exists on the item's file — the line may have moved
 * between the thread's push and this one — then the item is that thread and
 * counts once.
 */
export function declaredRestatement(
  item: BodyFinding,
  review: Review,
  dispositions: BodyDispositions,
  threads: readonly Thread[],
): boolean {
  return dispositions.keys.some((key) => {
    if (!key.item.startsWith('thread ') || !keyNames({ ...key, item: item.key }, item, review)) {
      return false;
    }
    const id = key.item.slice('thread '.length).trim();
    return threads.some((thread) => thread.id === id && thread.path === item.path);
  });
}
