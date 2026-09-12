import {
  hasLanded,
  isSignedSelfReply,
  isSkipMarker,
  QUIET_WINDOW_MS,
} from '../pr-watch/reviewer-legs.js';
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
 * expected reviewer (at least one is declared; an empty set settles nothing)
 * has a LANDED, SUBSTANTIVE review bound to it — a skip marker ("unable to
 * review") satisfies no leg — and the quiet window after the latest such
 * review has elapsed: the seat's own reply-created review records never
 * anchor that window, and a landed review with no submission time makes the
 * anchor unknowable, holding the head open as `pr-watch` does. A head bound
 * by none is superseded, a head an expected reviewer still owes is unsettled.
 * Timeout and skip settlement need the check-run history a recording does not
 * yet carry, so this builder reads SATISFIED-or-OWED only.
 *
 * THE INVARIANT every case here samples: nothing the recording does not prove
 * settles or counts. An unproven settlement input (no declared reviewer, a
 * skip marker, a missing submission time) reads unsettled; an unreadable
 * disposition (no marker, a marked line with no reference, a batched comment)
 * reads manual; a citation is never a head. A case these rounds did not name
 * is a fixture at pickup, never a mechanism edit.
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

// GitHub logins are case-insensitive (the reviewer-leg comparison does the same).
const sameLogin = (left: string, right: string): boolean =>
  left.toLowerCase() === right.toLowerCase();

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
  // The latest signed line wins, as the last signed thread reply does.
  const named = dispositions.keys.findLast((key) => keyNames(key, item, review));
  if (named !== undefined) {
    return named.marker ?? 'manual';
  }
  const head = review.commitOid ?? '';
  return dispositions.unbound || dispositions.batchedHeads.some((prefix) => head.startsWith(prefix))
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
// latest landed review binding the head. No anchoring review, or one whose
// submission time is missing (it could be the newest), makes the anchor
// unknowable: the head stays open, as `pr-watch`'s quietWindowAnchor holds it.
function quietWindowElapsed(reviews: readonly Review[], now: string | undefined): boolean {
  const times = reviews.map((review) => Date.parse(review.submittedAt));
  if (times.length === 0 || !times.every(Number.isFinite)) {
    return false;
  }
  if (now === undefined) {
    return true;
  }
  return Date.parse(now) - Math.max(...times) > QUIET_WINDOW_MS;
}

// GitHub creates an empty review record for every inline reply; the seat's
// signed replies' records must anchor nothing.
function selfReplyReviewIds(harvest: RecordedHarvest): ReadonlySet<string> {
  return new Set(
    harvest.reviewThreads
      .flatMap((thread) => thread.comments)
      .filter((comment) => comment.reviewId !== null && isSignedSelfReply(comment.body))
      .map((comment) => comment.reviewId ?? ''),
  );
}

function bodyItemDispositions(
  review: Review,
  threads: readonly Thread[],
  dispositions: BodyDispositions,
): Disposition[] {
  const items = extractBodyFindings(review).items;
  return items
    .filter((item) => !restatesThread(item, review, threads))
    .filter((item) => !declaredRestatement(item, review, dispositions, threads, items))
    .map((item) => bodyItemDisposition(item, review, dispositions));
}

function findingsFor(
  head: string,
  harvest: RecordedHarvest,
  landedReviews: readonly Review[],
  dispositions: BodyDispositions,
): { dispositions: Disposition[]; manualBodies: number } {
  const landedIds = new Set(landedReviews.map((review) => review.id));
  // A thread counts only when its originating review landed (a PENDING draft's threads do not).
  // An opening comment is a finding whoever signs it — a signed reviewer's
  // finding is never mistaken for a disposition (only replies disposition).
  const threads = harvest.reviewThreads.filter(
    (thread) =>
      thread.reviewCommitOid === head &&
      (thread.reviewId === null || landedIds.has(thread.reviewId)),
  );
  // A skip marker declares that no review occurred: it carries no finding prose.
  const reviews = landedReviews.filter((review) => !isSkipMarker(review.body));
  const bodyItems = reviews.flatMap((review) =>
    bodyItemDispositions(review, threads, dispositions),
  );
  const manualBodies = reviews.filter((review) => extractBodyFindings(review).manual).length;
  return { dispositions: [...threads.map(threadDisposition), ...bodyItems], manualBodies };
}

function rowFor(
  head: string,
  input: BuildRowsInput,
  dispositions: BodyDispositions,
  selfReviews: ReadonlySet<string>,
): TallyRow {
  const { harvest, expectedReviewers, now } = input;
  const bound = harvest.reviews.filter((review) => review.commitOid === head && landed(review));
  // A skip marker declares that no review occurred; it satisfies no leg.
  const reviewers = expectedReviewers.filter((login) =>
    bound.some((review) => sameLogin(review.author, login) && !isSkipMarker(review.body)),
  );
  const owed = expectedReviewers.filter((login) => !reviewers.includes(login));
  const anchoring = bound.filter((review) => !selfReviews.has(review.id));
  const found = findingsFor(head, harvest, bound, dispositions);
  const counts = tallyDispositions(found.dispositions);
  return {
    head,
    settled: reviewers.length > 0 && owed.length === 0 && quietWindowElapsed(anchoring, now),
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
  const selfReviews = selfReplyReviewIds(input.harvest);
  const rows = input.harvest.commits.map((commit) =>
    rowFor(commit.oid, input, dispositions, selfReviews),
  );
  return {
    heads: input.harvest.commits.map((commit) => commit.oid),
    rows: rows.filter((row) => row.settled),
    unsettled: rows.filter((row) => !row.settled),
  };
}
