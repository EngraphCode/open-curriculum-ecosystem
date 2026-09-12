import { isSignedSelfReply } from '../pr-watch/reviewer-legs.js';
import { extractBodyFindings } from './findings.js';
import type { BodyFinding } from './findings.js';
import type { RecordedHarvest } from './harvest.js';
import { readBarMarker } from './markers.js';
import type { BarMarker } from './markers.js';

/**
 * The tally rows the pr-lifecycle state machine's item 2 specifies: one row
 * per SETTLED head in branch order, its raised count every finding bound to
 * that head (threads plus body items, one logical finding once), its
 * cure-worthy count read from the bar markers of the seat's signed
 * dispositions — never from prose. A head no expected reviewer bound is
 * superseded and listed as unsettled; a head an expected reviewer still
 * owes is unsettled too. Timeout and skip settlement need the check-run
 * history a recording does not yet carry, so this builder reads
 * SATISFIED-or-OWED only.
 */

type Thread = RecordedHarvest['reviewThreads'][number];
type Review = RecordedHarvest['reviews'][number];

/** One head's row. `undispositioned` findings have no signed disposition; `manual` ones have a signed disposition with no marker. */
interface TallyRow {
  readonly head: string;
  readonly settled: boolean;
  /** Expected reviewers with a review bound to this head. */
  readonly reviewers: readonly string[];
  /** Expected reviewers with no review bound to this head. */
  readonly owed: readonly string[];
  readonly raised: number;
  readonly cureWorthy: number;
  readonly undispositioned: number;
  readonly manual: number;
}

export interface BuildRowsInput {
  readonly harvest: RecordedHarvest;
  /** The declared expected reviewer set — never inferred from who reviewed. */
  readonly expectedReviewers: readonly string[];
}

export interface Tally {
  /** Settled heads, in branch order. */
  readonly rows: readonly TallyRow[];
  /** Heads with no settled round (superseded or owed), in branch order, with their counts so far. */
  readonly unsettled: readonly TallyRow[];
}

type Disposition = BarMarker | 'manual' | 'undispositioned';

// A body-only disposition line, as the intake contract states it: the marker,
// then `head SHA:<sha> · review <id> · <path>:<line> · <item>`; the anchor may
// sit in a code span, the SHA may be a prefix.
const DISPOSITION_LINE =
  /^-?\s*\*\*[^*\n]+\*\*\s*·\s*head SHA:([0-9a-f]{7,40})\s*·\s*review (\S+)\s*·\s*`?([^`·\n]+?):(\d+)`?\s*·\s*(.+?)\s*·/u;

interface BodyDispositionKey {
  readonly headPrefix: string;
  readonly reviewId: string;
  readonly path: string;
  readonly line: number;
  readonly item: string;
  readonly marker: BarMarker | null;
}

function bodyDispositions(harvest: RecordedHarvest): readonly BodyDispositionKey[] {
  return harvest.comments
    .filter((comment) => isSignedSelfReply(comment.body))
    .flatMap((comment) => comment.body.split('\n'))
    .map((line) => ({ line, match: DISPOSITION_LINE.exec(line) }))
    .filter((entry): entry is { line: string; match: RegExpExecArray } => entry.match !== null)
    .map(({ line, match }) => ({
      headPrefix: match[1] ?? '',
      reviewId: match[2] ?? '',
      path: match[3] ?? '',
      line: Number(match[4]),
      item: (match[5] ?? '').trim(),
      marker: readBarMarker(line.replace(/^-\s*/u, '')),
    }));
}

function threadDisposition(thread: Thread): Disposition {
  const signed = thread.comments.slice(1).filter((comment) => isSignedSelfReply(comment.body));
  const last = signed.at(-1);
  if (last === undefined) {
    return 'undispositioned';
  }
  return readBarMarker(last.body) ?? 'manual';
}

function bodyItemDisposition(
  item: BodyFinding,
  review: Review,
  dispositions: readonly BodyDispositionKey[],
): Disposition {
  const head = review.commitOid ?? '';
  const named = dispositions.find(
    (candidate) =>
      head.startsWith(candidate.headPrefix) &&
      (candidate.reviewId === review.id || candidate.reviewId === String(review.databaseId)) &&
      candidate.path === item.path &&
      candidate.line === item.line &&
      // `thread <id>` is the contract's key for an item the seat declares a
      // restatement of an inline thread at this anchor; it dispositions the item.
      (candidate.item === item.key || candidate.item.startsWith('thread ')),
  );
  if (named === undefined) {
    return 'undispositioned';
  }
  return named.marker ?? 'manual';
}

// ONE LOGICAL FINDING COUNTS ONCE: a body item restating an inline thread of
// the same review at the same anchor with the same substance is that thread.
function restatesThread(item: BodyFinding, review: Review, threads: readonly Thread[]): boolean {
  return threads.some(
    (thread) =>
      thread.reviewId === review.id &&
      thread.path === item.path &&
      (thread.originalLine ?? thread.line) === item.line &&
      item.substance !== '' &&
      (thread.comments[0]?.body ?? '').includes(item.substance),
  );
}

function tallyDispositions(dispositions: readonly Disposition[]): {
  cureWorthy: number;
  undispositioned: number;
  manual: number;
} {
  return {
    cureWorthy: dispositions.filter((disposition) => disposition === 'over-bar').length,
    undispositioned: dispositions.filter((disposition) => disposition === 'undispositioned').length,
    manual: dispositions.filter((disposition) => disposition === 'manual').length,
  };
}

function rowFor(
  head: string,
  input: BuildRowsInput,
  bodyKeys: readonly BodyDispositionKey[],
): TallyRow {
  const { harvest, expectedReviewers } = input;
  const reviews = harvest.reviews.filter(
    (review) => review.commitOid === head && expectedReviewers.includes(review.author),
  );
  const threads = harvest.reviewThreads.filter(
    (thread) =>
      thread.reviewCommitOid === head && !isSignedSelfReply(thread.comments[0]?.body ?? ''),
  );
  const bodyItems = reviews.flatMap((review) =>
    extractBodyFindings(review)
      .items.filter((item) => !restatesThread(item, review, threads))
      .map((item) => bodyItemDisposition(item, review, bodyKeys)),
  );
  const manualBodies = reviews.filter((review) => extractBodyFindings(review).manual).length;
  const dispositions = [...threads.map(threadDisposition), ...bodyItems];
  const reviewers = expectedReviewers.filter((login) =>
    reviews.some((review) => review.author === login),
  );
  const owed = expectedReviewers.filter((login) => !reviewers.includes(login));
  const counts = tallyDispositions(dispositions);
  return {
    head,
    settled: owed.length === 0,
    reviewers,
    owed,
    raised: dispositions.length,
    ...counts,
    manual: counts.manual + manualBodies,
  };
}

/** Build the tally from a recorded harvest: settled rows and unsettled heads, both in branch order. */
export function buildRows(input: BuildRowsInput): Tally {
  const bodyKeys = bodyDispositions(input.harvest);
  const rows = input.harvest.commits.map((commit) => rowFor(commit.oid, input, bodyKeys));
  return {
    rows: rows.filter((row) => row.settled),
    unsettled: rows.filter((row) => !row.settled),
  };
}
