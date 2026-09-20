import { z } from 'zod';

import type { CompletionComment } from './completion-comments.js';

/**
 * Boundary parser for the conversation legs of the `pr state` view: the
 * top-level comments (the surface a reviewer's completion comment lands on)
 * and the pull request's commits (the set a comment's named commit prefix
 * must resolve within). Both ride the same `gh pr view --json` call as the
 * state view — `parseStateView` reads its fields from that payload and this
 * reads these. Zod at the external boundary; misshapen input fails loud.
 */

/** The `--json` fields this parser reads, requested beside the state view's. */
export const PR_STATE_CONVERSATION_JSON_FIELDS = ['comments', 'commits'] as const;

// Author can be null on GitHub (deleted account); 'unknown' is a login no
// declared reviewer set holds, so such a comment reads as no review.
const authorLogin = z
  .object({ login: z.string() })
  .nullish()
  .transform((value) => value?.login ?? 'unknown');

const commentSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  author: authorLogin,
  body: z.string(),
  createdAt: z.string(),
  // gh's name for "edited after creation" on the `pr view` surface.
  includesCreatedEdit: z.boolean(),
});

const conversationSchema = z.object({
  comments: z
    .array(commentSchema)
    .nullish()
    .transform((value) => value ?? []),
  // Strict: a pull request always has commits, and without the list a named
  // prefix resolves nowhere — a silent empty would read every completion
  // comment as no review.
  commits: z.array(z.object({ oid: z.string() })),
});

export interface ParsedConversation {
  readonly comments: readonly CompletionComment[];
  /** Full SHAs of the pull request's commits, in the view's order. */
  readonly commits: readonly string[];
}

/**
 * Parse the conversation legs out of the `gh pr view --json` payload.
 *
 * @throws a ZodError when the payload is not the expected gh shape (strict
 *   validation at the external-input boundary).
 */
export function parseConversation(raw: unknown): ParsedConversation {
  const parsed = conversationSchema.parse(raw);
  return {
    comments: parsed.comments.map((comment) => ({
      id: comment.id,
      author: comment.author,
      body: comment.body,
      createdAt: comment.createdAt,
      edited: comment.includesCreatedEdit,
    })),
    commits: parsed.commits.map((commit) => commit.oid),
  };
}
