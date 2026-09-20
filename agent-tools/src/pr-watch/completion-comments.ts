/**
 * The second transport of a reviewer's reported result: a completion comment.
 *
 * @remarks
 * The Codex connector, when it files no findings, posts its result as a
 * comment on the conversation ("Didn't find any major issues", naming the
 * commit it read under the label "Reviewed commit") rather than as a review
 * object; Copilot posts a review object either way. By the owner's ruling of
 * 2026-09-16 (`.agent/reports/merge-door-comment-evidence-decision-2026-09-16.md`)
 * a zero-findings result is a positive result. This reads such a comment as
 * a {@link HarvestedReview} bound to the commit it names, on that ruling's
 * preconditions: the author is an expected reviewer; the comment is
 * unedited; the labelled prefix resolves to exactly one of the pull
 * request's commits; and (checked at settlement, against the tip) that
 * commit is the current tip. An expected reviewer's comment that fails a
 * precondition is never read as silence: it is returned as REFUSED, naming
 * the precondition and quoting the comment, so the verdict can say what it
 * saw. A comment by anyone else is not a reviewer's report and is not read.
 * Pure: the caller supplies the comments, the commits and the reviewers.
 */

import { sanitiseTerminalLine } from '../core/terminal-output.js';
import { normaliseLogin } from './reviewer-legs.js';
import type { HarvestedReview } from './reviewer-legs.js';

/** A conversation comment as the view carries it. */
export interface CompletionComment {
  readonly id: string;
  readonly author: string;
  readonly body: string;
  readonly createdAt: string;
  /** True when the comment was edited after creation; an edit is not the report. */
  readonly edited: boolean;
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
  | 'edited after creation'
  | 'names no reviewed commit'
  | 'names several reviewed commits'
  | 'names a commit that is not in the pull request'
  | 'names a prefix matching several commits of the pull request';

/** An expected reviewer's comment that fails a precondition: named and quoted, never silent. */
export interface RefusedCompletionComment {
  readonly id: string;
  readonly author: string;
  readonly createdAt: string;
  readonly precondition: RefusedPrecondition;
  /** The comment's first non-empty line, bounded. */
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
const QUOTE_LENGTH = 120;

/**
 * The comment's first non-empty line, cut to {@link QUOTE_LENGTH} characters,
 * with terminal control characters stripped: the quote reaches the operator's
 * terminal in the verdict, and a reviewer's comment is not this tool's text.
 */
export function quoteOf(body: string): string {
  const line = body
    .split('\n')
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate !== '');
  return sanitiseTerminalLine(line ?? '').slice(0, QUOTE_LENGTH);
}

type Resolution = { readonly commitId: string } | { readonly refused: RefusedPrecondition };

function resolveNamedCommit(body: string, commits: readonly string[]): Resolution {
  const prefixes = [...body.matchAll(REVIEWED_COMMIT)]
    .map((match) => match[1])
    .filter((prefix): prefix is string => prefix !== undefined);
  const [prefix] = prefixes;
  if (prefix === undefined) {
    return { refused: 'names no reviewed commit' };
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

function resolve(comment: CompletionComment, commits: readonly string[]): Resolution {
  return comment.edited
    ? { refused: 'edited after creation' }
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
        createdAt: comment.createdAt,
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
      submittedAt: comment.createdAt,
      transport: 'completion-comment',
    });
  }
  return { reviews, refused };
}
