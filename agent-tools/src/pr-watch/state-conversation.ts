import { z } from 'zod';

import type { CompletionComment } from './completion-comments.js';
import { authorLogin } from './state-fields.js';

/**
 * Boundary parsers for the conversation legs of `pr state`: the top-level
 * (issue) comments — the surface the Codex connector's completion comment
 * lands on — which ride the same `gh pr view --json` call as the state view
 * (gh back-fills every page of them), and the pull request's commits (the
 * set a comment's named commit prefix must resolve within), harvested in
 * FULL by a paginated GraphQL read like the reviews — the view's own
 * `commits` field stops at the first hundred, and a bounded list cannot
 * prove a prefix unique. Zod at the external boundary; misshapen input
 * fails loud. Shapes follow the calls as read on pull request 167 on
 * 2026-09-20 (that pull request's description records the read).
 */

/** The `--json` fields this parser reads from the view, requested beside the state view's. */
export const PR_STATE_CONVERSATION_JSON_FIELDS = ['comments'] as const;

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

// gh emits an array, empty when there is nothing: a null or a missing leg is
// a misshapen payload, never an empty one.
const conversationSchema = z.object({
  comments: z.array(commentSchema),
});

export interface ParsedConversation {
  readonly comments: readonly CompletionComment[];
}

/**
 * Parse the conversation leg out of the `gh pr view --json` payload.
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
  };
}

// One page of the paginated `commits` connection as `gh api graphql
// --paginate --slurp` returns it.
const commitsPageSchema = z.object({
  data: z.object({
    repository: z.object({
      pullRequest: z.object({
        commits: z.object({
          nodes: z.array(z.object({ commit: z.object({ oid: z.string() }) })),
        }),
      }),
    }),
  }),
});

const commitsPagesSchema = z.array(commitsPageSchema).min(1);

/**
 * Parse the slurped multi-page `commits` harvest into the pull request's
 * full SHAs, in the connection's order.
 *
 * @throws a ZodError when the input is not the expected slurped page-array
 *   shape (never a silent empty — a named prefix would then resolve nowhere,
 *   and every completion comment would be refused as naming a commit outside
 *   the pull request).
 */
export function parseCommitsHarvest(raw: unknown): string[] {
  return commitsPagesSchema
    .parse(raw)
    .flatMap((page) => page.data.repository.pullRequest.commits.nodes)
    .map((node) => node.commit.oid);
}
