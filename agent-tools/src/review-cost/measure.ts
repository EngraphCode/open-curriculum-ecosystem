import { extractBodyFindings } from '../pr-tally/findings.js';
import type { RecordedHarvest } from '../pr-tally/harvest.js';
import type { RoundMeasure } from './cost.js';

/**
 * The round measures from a recorded harvest (the pr-tally recording shape)
 * and a diff reader. A round is a head in branch order with a landed review
 * from a declared reviewer; the push that opened it is the diff from the
 * previous reviewed head (the base ref for the opening round).
 */

export interface DiffStat {
  readonly lines: number;
  readonly files: readonly string[];
}

interface MeasureInput {
  readonly harvest: RecordedHarvest;
  readonly expectedReviewers: readonly string[];
  /** The base ref the opening round's push is measured against. */
  readonly baseRef: string;
  readonly diff: (from: string, to: string) => DiffStat;
}

type Review = RecordedHarvest['reviews'][number];

const sameLogin = (left: string, right: string): boolean =>
  left.toLowerCase() === right.toLowerCase();

const MS_PER_HOUR = 60 * 60 * 1000;

function reviewedHeads(input: MeasureInput): { oid: string; committedDate: string }[] {
  return input.harvest.commits.filter((commit) =>
    input.harvest.reviews.some(
      (review) =>
        review.commitOid === commit.oid &&
        review.state !== 'PENDING' &&
        input.expectedReviewers.some((login) => sameLogin(review.author, login)),
    ),
  );
}

function findingsOn(head: string, harvest: RecordedHarvest, bound: readonly Review[]): number {
  const threads = harvest.reviewThreads.filter((thread) => thread.reviewCommitOid === head).length;
  const bodyItems = bound.reduce(
    (sum, review) => sum + extractBodyFindings(review).items.length,
    0,
  );
  return threads + bodyItems;
}

function commentCharsOn(head: string, harvest: RecordedHarvest, bound: readonly Review[]): number {
  const threadChars = harvest.reviewThreads
    .filter((thread) => thread.reviewCommitOid === head)
    .flatMap((thread) => thread.comments)
    .reduce((sum, comment) => sum + comment.body.length, 0);
  return threadChars + bound.reduce((sum, review) => sum + review.body.length, 0);
}

function relatednessOf(current: DiffStat, previous: DiffStat | undefined): number {
  if (previous === undefined || current.files.length === 0) {
    return 0;
  }
  const before = new Set(previous.files);
  return current.files.filter((file) => before.has(file)).length / current.files.length;
}

function hoursBetween(earlier: string | undefined, later: string): number | null {
  if (earlier === undefined) {
    return null;
  }
  const delta = Date.parse(later) - Date.parse(earlier);
  return Number.isFinite(delta) ? Math.max(0, delta / MS_PER_HOUR) : null;
}

/** The measures, one per reviewed head in branch order. */
export function measureRounds(input: MeasureInput): RoundMeasure[] {
  const heads = reviewedHeads(input);
  const measures: RoundMeasure[] = [];
  let previous: { oid: string; committedDate: string; stat: DiffStat } | undefined;
  for (const head of heads) {
    const stat = input.diff(previous?.oid ?? input.baseRef, head.oid);
    const bound = input.harvest.reviews.filter((review) => review.commitOid === head.oid);
    measures.push({
      head: head.oid,
      findings: findingsOn(head.oid, input.harvest, bound),
      commentChars: commentCharsOn(head.oid, input.harvest, bound),
      pushLines: stat.lines,
      pushFiles: stat.files.length,
      relatedness: relatednessOf(stat, previous?.stat),
      hoursSincePrevious: hoursBetween(previous?.committedDate, head.committedDate),
    });
    previous = { ...head, stat };
  }
  return measures;
}
