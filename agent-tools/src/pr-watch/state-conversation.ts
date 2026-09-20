import { z } from 'zod';

import type { CompletionComment } from './completion-comments.js';
import { authorLogin } from './state-fields.js';

/**
 * Boundary parsers for the conversation legs of `pr state`, each harvested
 * in FULL by a paginated GraphQL read like the reviews (`harvests.ts`): the
 * top-level (issue) comments — the surface the Codex connector's completion
 * comment lands on — with the edit timestamp the ruling's precondition
 * needs, which the `pr view` surface does not expose; and the pull
 * request's commits, the set a comment's named prefix must resolve within
 * — the view's own field stops at the first hundred, and a bounded list
 * cannot prove a prefix unique. Zod at the external boundary; misshapen
 * input fails loud. Shapes follow the reads on pull request 168 on
 * 2026-09-20 (that pull request's description records them).
 */

// A deleted account's comment is by 'unknown' (state-fields.ts), a login this
// tool never declares, so it reads as no review unless an operator declares
// that literal. `lastEditedAt` is null until the comment is edited.
const commentNodeSchema = z.object({
  id: z.string(),
  author: authorLogin,
  body: z.string(),
  createdAt: z.string(),
  lastEditedAt: z.string().nullable(),
});

// One page of a paginated connection as `gh api graphql --paginate --slurp`
// returns it; a slurped harvest is never empty (an empty connection is one
// page with no nodes), so an empty array is misshapen input, never "none".
const commentsPagesSchema = z
  .array(
    z.object({
      data: z.object({
        repository: z.object({
          pullRequest: z.object({ comments: z.object({ nodes: z.array(commentNodeSchema) }) }),
        }),
      }),
    }),
  )
  .min(1);

const commitsPagesSchema = z
  .array(
    z.object({
      data: z.object({
        repository: z.object({
          pullRequest: z.object({
            commits: z.object({
              nodes: z.array(z.object({ commit: z.object({ oid: z.string() }) })),
            }),
          }),
        }),
      }),
    }),
  )
  .min(1);

/**
 * Parse the slurped multi-page `comments` harvest into completion-comment
 * candidates, in the connection's order.
 *
 * @throws a ZodError when the input is not the expected slurped page-array
 *   shape (strict validation at the external-input boundary).
 */
export function parseCommentsHarvest(raw: unknown): CompletionComment[] {
  return commentsPagesSchema
    .parse(raw)
    .flatMap((page) => page.data.repository.pullRequest.comments.nodes)
    .map((node) => ({
      id: node.id,
      author: node.author,
      body: node.body,
      createdAt: node.createdAt,
      edited: node.lastEditedAt !== null,
    }));
}

/**
 * Parse the slurped multi-page `commits` harvest into the pull request's
 * full SHAs, in the connection's order.
 *
 * @throws a ZodError when the input is not the expected slurped page-array
 *   shape (a named prefix would otherwise resolve nowhere, and every
 *   completion comment would be refused as naming a commit outside the pull
 *   request).
 */
export function parseCommitsHarvest(raw: unknown): string[] {
  return commitsPagesSchema
    .parse(raw)
    .flatMap((page) => page.data.repository.pullRequest.commits.nodes)
    .map((node) => node.commit.oid);
}
