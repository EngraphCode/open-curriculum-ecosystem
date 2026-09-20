import { z } from 'zod';

import type { CompletionComment } from './completion-comments.js';
import { authorLogin } from './state-fields.js';

/**
 * Boundary parser for the conversation legs of the `pr state` view: the
 * top-level (issue) comments — the surface the Codex connector's completion
 * comment lands on — and the pull request's commits (the set a comment's
 * named commit prefix must resolve within). Both ride the same
 * `gh pr view --json` call as the state view — `parseStateView` reads its
 * fields from that payload and this reads these. Zod at the external
 * boundary; misshapen input fails loud. Shapes follow the call as read on
 * pull request 167 on 2026-09-20 (that pull request's description records
 * the read).
 */

/** The `--json` fields this parser reads, requested beside the state view's. */
export const PR_STATE_CONVERSATION_JSON_FIELDS = ['comments', 'commits'] as const;

// A deleted account's comment is by 'unknown' (state-fields.ts), a login this
// tool never declares, so it reads as no review unless an operator declares
// that literal.
const commentSchema = z.object({
  // The GraphQL node id, as `pr view` emits it (never the REST integer).
  id: z.string(),
  author: authorLogin,
  body: z.string(),
  createdAt: z.string(),
  // The field `pr view --json comments` exposes for "edited after creation".
  includesCreatedEdit: z.boolean(),
});

// gh emits arrays for both, empty when there is nothing: a null or a missing
// leg is a misshapen payload, never an empty one. Without the commit list a
// named prefix would resolve nowhere, and every completion comment would be
// refused as naming a commit outside the pull request. gh back-fills every
// page of comments for `--json comments` but bounds the commit list at the
// pull request's first hundred; the reading seam puts the tip beside it.
const conversationSchema = z.object({
  comments: z.array(commentSchema),
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
