import { hasLanded, isSignedSelfReply, QUIET_WINDOW_MS } from '../pr-watch/reviewer-legs.js';
import { declaredRestatement, keyNames, readBodyDispositions } from './dispositions.js';
import type { BodyDispositions } from './dispositions.js';
import { extractBodyFindings } from './findings.js';
import type { BodyFinding } from './findings.js';
import type { RecordedHarvest } from './harvest.js';
import { readBarMarker } from './markers.js';
import type { BarMarker } from './markers.js';

/**
 * The tally rows the pr-lifecycle state machine's item 2 specifies: one row
 * per SETTLED head in branch order, its raised count every finding bound to
 * that head (threads plus body items of every landed review, one logical
 * finding once), its cure-worthy count read from the bar markers of the
 * seat's signed dispositions — never from prose. A head is settled when every
 * expected reviewer has a LANDED review bound to it and, where a clock is
 * supplied, the quiet window after the latest such review has elapsed; a head
 * bound by none is superseded, a head an expected reviewer still owes is
 * unsettled. Timeout and skip settlement need the check-run history a
 * recording does not yet carry, so this builder reads SATISFIED-or-OWED only.
 */

type Thread = RecordedHarvest['reviewThreads'][number];
type Review = RecordedHarvest['reviews'][number];

/** One head's row. `undispositioned` findings have no signed disposition; `manual` ones have one the machine cannot read. */
export interface TallyRow {
  readonly head: string;
  readonly settled: boolean;
  /** Expected reviewers with a landed review bound to this head. */
  readonly reviewers: readonly string[];
  /** Expected reviewers with no landed review bound to this head. */
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
  /** The evaluation clock (ISO). Absent for a recording of a closed pull request; present on a live read. */
  readonly now?: string;
}

export interface Tally {
  /** Every head in branch order — the epoch boundaries are found over all of them. */
  readonly heads: readonly string[];
  /** Settled heads, in branch order. */
  readonly rows: readonly TallyRow[];
  /** Heads with no settled round (superseded, owed, or inside the quiet window), in branch order, with their counts so far. */
  readonly unsettled: readonly TallyRow[];
}

type Disposition = BarMarker | 'manual' | 'undispositioned';

// The recorded review carries a nullable commit; the pr-watch predicate wants the string form.
const landed = (review: Review): boolean =>
  hasLanded({ ...review, commitOid: review.commitOid ?? '' });

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
  dispositions: BodyDispositions,
): Disposition {
  const named = dispositions.keys.find((key) => keyNames(key, item, review));
  if (named !== undefined) {
    return named.marker ?? 'manual';
  }
  const head = review.commitOid ?? '';
  return dispositions.batchedHeads.some((prefix) => head.startsWith(prefix))
    ? 'manual'
    : 'undispositioned';
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

// The quiet window (state machine item 4): more than QUIET_WINDOW_MS since the
// latest landed review binding the head, when a clock is supplied.
function quietWindowElapsed(reviews: readonly Review[], now: string | undefined): boolean {
  if (now === undefined) {
    return true;
  }
  const latest = reviews.map((review) => Date.parse(review.submittedAt)).filter(Number.isFinite);
  const newest = Math.max(...latest, Number.NEGATIVE_INFINITY);
  return Date.parse(now) - newest > QUIET_WINDOW_MS;
}

function findingsFor(
  head: string,
  harvest: RecordedHarvest,
  dispositions: BodyDispositions,
): { dispositions: Disposition[]; manualBodies: number } {
  const threads = harvest.reviewThreads.filter(
    (thread) =>
      thread.reviewCommitOid === head && !isSignedSelfReply(thread.comments[0]?.body ?? ''),
  );
  const reviews = harvest.reviews.filter(
    (review) => review.commitOid === head && landed(review) && !isSignedSelfReply(review.body),
  );
  const bodyItems = reviews.flatMap((review) =>
    extractBodyFindings(review)
      .items.filter((item) => !restatesThread(item, review, threads))
      .filter((item) => !declaredRestatement(item, review, dispositions, harvest.reviewThreads))
      .map((item) => bodyItemDisposition(item, review, dispositions)),
  );
  const manualBodies = reviews.filter((review) => extractBodyFindings(review).manual).length;
  return { dispositions: [...threads.map(threadDisposition), ...bodyItems], manualBodies };
}

function rowFor(head: string, input: BuildRowsInput, dispositions: BodyDispositions): TallyRow {
  const { harvest, expectedReviewers, now } = input;
  const bound = harvest.reviews.filter((review) => review.commitOid === head && landed(review));
  const reviewers = expectedReviewers.filter((login) =>
    bound.some((review) => review.author === login),
  );
  const owed = expectedReviewers.filter((login) => !reviewers.includes(login));
  const found = findingsFor(head, harvest, dispositions);
  const counts = tallyDispositions(found.dispositions);
  return {
    head,
    settled: owed.length === 0 && quietWindowElapsed(bound, now),
    reviewers,
    owed,
    raised: found.dispositions.length,
    ...counts,
    manual: counts.manual + found.manualBodies,
  };
}

/** Build the tally from a recorded harvest: every head in branch order, split into settled rows and unsettled heads. */
export function buildRows(input: BuildRowsInput): Tally {
  const dispositions = readBodyDispositions(input.harvest);
  const rows = input.harvest.commits.map((commit) => rowFor(commit.oid, input, dispositions));
  return {
    heads: input.harvest.commits.map((commit) => commit.oid),
    rows: rows.filter((row) => row.settled),
    unsettled: rows.filter((row) => !row.settled),
  };
}
