/**
 * The second transport of a reviewer's reported result: a completion comment.
 *
 * @remarks
 * The Codex connector reports on the conversation as well as through review
 * objects, in one of two shapes: when it files no findings, a comment per run
 * ("Didn't find any major issues", naming the commit it read under the label
 * "Reviewed commit"); or one summary comment per pull request that the
 * connector rewrites on every run, whose table's completed Code Review row
 * names the commit a code review read, whatever it found (findings arrive as
 * review objects and threads, which the door reads first). Copilot posts a
 * review object either way. By the owner's ruling of 2026-09-16
 * (`.agent/reports/merge-door-comment-evidence-decision-2026-09-16.md`) a
 * zero-findings result is a positive result. This reads such a comment as a
 * {@link HarvestedReview} bound to the commit it names, on the ruling's
 * preconditions as the decision note's 2026-09-28 amendment states them: the
 * author is an expected reviewer; the comment is unedited, or last edited by
 * its author (the summary's rewrite is the author's report, timed at the
 * edit; an edit by any other account is not the reviewer's report); the
 * named prefix resolves to exactly one of the pull request's commits; and
 * (checked at settlement, against the tip) that commit binds the current tip,
 * exactly or by content (`content-binding.ts`).
 * An expected reviewer's comment that fails a
 * precondition is never read as silence: it is returned as REFUSED, naming
 * the precondition and quoting the comment, so the verdict can say what it
 * saw. A comment by anyone else is not a reviewer's report and is not read.
 * Pure: the caller supplies the comments, the commits and the reviewers.
 */

import { sanitiseTerminalLine } from '../core/terminal-output.js';
import { normaliseLogin } from './logins.js';
import type { HarvestedReview } from './reviewer-legs.js';

/** A comment's last edit: when, and by whom (`unknown` for a deleted account). */
interface CommentEdit {
  readonly at: string;
  readonly by: string;
}

/** A conversation comment as the paginated `comments` harvest carries it. */
export interface CompletionComment {
  readonly id: string;
  readonly author: string;
  readonly body: string;
  readonly createdAt: string;
  /** The last edit, or null for a comment never edited. */
  readonly lastEdit: CommentEdit | null;
}

export interface ReadCompletionCommentsInput {
  readonly comments: readonly CompletionComment[];
  /** Full SHAs of the commits a named prefix may resolve to, in any order. */
  readonly commits: readonly string[];
  /** The expected reviewers (declared, or defaulted from the observed surface), by login. */
  readonly reviewers: readonly string[];
}

/** A review read from a completion comment; `transport` says which. */
export type CompletionCommentReview = HarvestedReview & {
  readonly id: string;
  readonly transport: 'completion-comment';
};

/** The precondition an expected reviewer's comment failed, in the ruling's words. */
export type RefusedPrecondition =
  | 'edited by an account other than its author'
  | 'names no reviewed commit'
  | 'names a code review still running'
  | 'names several reviewed commits'
  | 'names a commit that is not in the pull request'
  | 'names a prefix matching several commits of the pull request';

/** An expected reviewer's comment that fails a precondition: named and quoted, never silent. */
export interface RefusedCompletionComment {
  readonly id: string;
  readonly author: string;
  /** When the quoted text was written: the last edit, else the creation. */
  readonly reportedAt: string;
  readonly precondition: RefusedPrecondition;
  /** The comment's Code Review row, else its first non-empty line; bounded. */
  readonly quote: string;
}

export interface CompletionCommentReading {
  readonly reviews: readonly CompletionCommentReview[];
  readonly refused: readonly RefusedCompletionComment[];
}

// The result names the commit it read under this label, as an inline-code
// prefix of at least seven hex characters (ten on every recorded instance). A
// bare inline-code sha elsewhere in a comment's prose is not the report: the
// conversation carries the connector's other messages too, and a comment
// that merely mentions the tip must not read as a review of it.
const REVIEWED_COMMIT = /\*\*Reviewed commit:\*\* `([0-9a-f]{7,40})`/g;
// The summary shape names it in the Commit cell of the table row whose
// review is Code Review and whose status is Completed. A row still Running
// names the commit under review, which is no result yet. Rows are read only
// in a comment that opens with the summary's marker: the connector's other
// comments carry model-written text a requester can steer.
const SUMMARY_MARKER = '<!-- codex-pull-request-review-summary -->';
const SUMMARY_CODE_REVIEW =
  /^\| [^|\n]*\*\*Code Review\*\* \| [^|\n]*\*\*Completed\*\*[^|\n]*\| `([0-9a-f]{7,40})` \|/gm;
const SUMMARY_RUNNING = /^\| [^|\n]*\*\*Code Review\*\* \| [^|\n]*\*\*Running\*\*/m;
const CODE_REVIEW_ROW = /^\| [^|\n]*\*\*Code Review\*\* \|.*$/m;
const STATUS_WORD = /\*\*[^*]+\*\*/;
const QUOTE_LENGTH = 120;

/** Whether a comment is the connector's summary: it opens with the marker. */
function isSummary(body: string): boolean {
  return body.trimStart().startsWith(SUMMARY_MARKER);
}

// A summary row as its cells, the status cell cut to its bold status word:
// the rest of that cell is the connector's time markup, not its report.
function rowQuote(row: string): string {
  const [review, status = '', ...rest] = row
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell !== '');
  const word = STATUS_WORD.exec(status)?.[0] ?? status;
  return [review, word, ...rest].join(' | ');
}

/**
 * What the verdict quotes of a comment: a summary's Code Review row, its
 * status cell cut to the status word (a summary's first line is only its
 * marker), else the comment's first non-empty line; cut to
 * {@link QUOTE_LENGTH} characters, with terminal control characters
 * stripped: the quote reaches the operator's terminal in the verdict, and a
 * reviewer's comment is not this tool's text.
 */
export function quoteOf(body: string): string {
  const matched = isSummary(body) ? CODE_REVIEW_ROW.exec(body)?.[0] : undefined;
  const row = matched === undefined ? undefined : rowQuote(matched);
  const line =
    row ??
    body
      .split('\n')
      .map((candidate) => candidate.trim())
      .find((candidate) => candidate !== '');
  return sanitiseTerminalLine(line?.trim() ?? '').slice(0, QUOTE_LENGTH);
}

type Resolution = { readonly commitId: string } | { readonly refused: RefusedPrecondition };

function resolveNamedCommit(body: string, commits: readonly string[]): Resolution {
  // Each shape names its report one way: a summary only in its completed
  // Code Review row, any other comment only under the label.
  const summary = isSummary(body);
  const named = summary ? body.matchAll(SUMMARY_CODE_REVIEW) : body.matchAll(REVIEWED_COMMIT);
  const prefixes = [...named]
    .map((match) => match[1])
    .filter((prefix): prefix is string => prefix !== undefined);
  const [prefix] = prefixes;
  if (prefix === undefined) {
    return {
      refused:
        summary && SUMMARY_RUNNING.test(body)
          ? 'names a code review still running'
          : 'names no reviewed commit',
    };
  }
  if (prefixes.length > 1) {
    return { refused: 'names several reviewed commits' };
  }
  const [commitId, ...others] = commits.filter((sha) => sha.startsWith(prefix));
  if (commitId === undefined) {
    return { refused: 'names a commit that is not in the pull request' };
  }
  if (others.length > 0) {
    return { refused: 'names a prefix matching several commits of the pull request' };
  }
  return { commitId };
}

// An edit by a deleted account ('unknown') is another account's even when
// the comment's author was deleted too: the two cannot be shown to be one.
function editedByAnother(comment: CompletionComment): boolean {
  return (
    comment.lastEdit !== null &&
    (comment.lastEdit.by === 'unknown' ||
      normaliseLogin(comment.lastEdit.by) !== normaliseLogin(comment.author))
  );
}

function resolve(comment: CompletionComment, commits: readonly string[]): Resolution {
  return editedByAnother(comment)
    ? { refused: 'edited by an account other than its author' }
    : resolveNamedCommit(comment.body, commits);
}

/** Every expected reviewer's completion comment: a review bound to one commit, or a named refusal. */
export function readCompletionComments(
  input: ReadCompletionCommentsInput,
): CompletionCommentReading {
  const reviewers = new Set(input.reviewers.map(normaliseLogin));
  const reviews: CompletionCommentReview[] = [];
  const refused: RefusedCompletionComment[] = [];
  for (const comment of input.comments) {
    if (!reviewers.has(normaliseLogin(comment.author))) {
      continue;
    }
    const resolution = resolve(comment, input.commits);
    if ('refused' in resolution) {
      refused.push({
        id: comment.id,
        author: comment.author,
        reportedAt: comment.lastEdit?.at ?? comment.createdAt,
        precondition: resolution.refused,
        quote: quoteOf(comment.body),
      });
      continue;
    }
    reviews.push({
      id: comment.id,
      author: comment.author,
      state: 'COMMENTED',
      body: comment.body,
      commitOid: resolution.commitId,
      // The author's own edit is the report, so the report is timed at it.
      submittedAt: comment.lastEdit?.at ?? comment.createdAt,
      transport: 'completion-comment',
    });
  }
  return { reviews, refused };
}
