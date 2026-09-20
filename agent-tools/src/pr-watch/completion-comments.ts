/**
 * The second transport of a reviewer's reported result: a completion comment.
 *
 * @remarks
 * A configured reviewer that files no findings posts its result as a comment
 * on the conversation ("Didn't find any major issues", naming the commit it
 * read) rather than as a review object; by the owner's ruling of 2026-09-16
 * a zero-findings result is a positive result. This reads such a comment as
 * a {@link HarvestedReview} bound to the commit it names, on the ruled
 * preconditions: the author is a declared reviewer; the comment is unedited;
 * the named prefix resolves to exactly one of the pull request's commits;
 * and (checked at settlement, against the tip) that commit is the current
 * tip. A reviewer's comment that fails a precondition is never read as
 * silence: it is returned as REFUSED, naming the precondition and quoting
 * the comment, so the verdict can say what it saw. A comment by anyone
 * else is not a reviewer's report and is not read. Pure: the caller supplies
 * the comments, the commits and the reviewers.
 */

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
  /** Full SHAs of the pull request's commits, in any order. */
  readonly commits: readonly string[];
  /** The declared reviewers, by login. */
  readonly reviewers: readonly string[];
}

/** A review read from a completion comment; `transport` says which. */
export type CompletionCommentReview = HarvestedReview & {
  readonly id: string;
  readonly transport: 'completion-comment';
};

/** The precondition a declared reviewer's comment failed, in the ruling's words. */
export type RefusedPrecondition =
  | 'edited after creation'
  | 'names no commit'
  | 'names several commits'
  | 'names a commit that is not in the pull request'
  | 'names a prefix matching several commits of the pull request';

/** A declared reviewer's comment that fails a precondition: named and quoted, never silent. */
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

// The reviewer writes the commit it read as an inline-code prefix of at least
// seven hex characters.
const NAMED_COMMIT = /`([0-9a-f]{7,40})`/g;
const QUOTE_LENGTH = 120;

function normaliseLogin(login: string): string {
  return login.toLowerCase().replace(/\[bot\]$/, '');
}

/** The comment's first non-empty line, cut to {@link QUOTE_LENGTH} characters. */
export function quoteOf(body: string): string {
  const line = body
    .split('\n')
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate !== '');
  return (line ?? '').slice(0, QUOTE_LENGTH);
}

type Resolution = { readonly commitId: string } | { readonly refused: RefusedPrecondition };

function resolveNamedCommit(body: string, commits: readonly string[]): Resolution {
  const prefixes = [...body.matchAll(NAMED_COMMIT)].map((match) => match[1] ?? '');
  if (prefixes.length === 0) {
    return { refused: 'names no commit' };
  }
  if (prefixes.length > 1) {
    return { refused: 'names several commits' };
  }
  const prefix = prefixes[0] ?? '';
  const matches = commits.filter((sha) => sha.startsWith(prefix));
  if (matches.length === 0) {
    return { refused: 'names a commit that is not in the pull request' };
  }
  const commitId = matches[0];
  if (matches.length > 1 || commitId === undefined) {
    return { refused: 'names a prefix matching several commits of the pull request' };
  }
  return { commitId };
}

function resolve(comment: CompletionComment, commits: readonly string[]): Resolution {
  return comment.edited
    ? { refused: 'edited after creation' }
    : resolveNamedCommit(comment.body, commits);
}

/** Every declared reviewer's completion comment: a review bound to one commit, or a named refusal. */
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
