/**
 * The paginated GraphQL harvests of `pr state`. The paginated, slurped
 * `gh api graphql` read walks every page of a connection and wraps the
 * pages into one array. The FULL history is the point — the view's
 * per-connection fields stop at their first page, and a reviewer leg or a
 * named commit prefix cannot be read against a bounded list.
 */

/** The full `reviews` connection: the reviewer-leg source, never `latestReviews`. */
export const REVIEWS_QUERY = `query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviews(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes { author { login } state body submittedAt commit { oid } }
      }
    }
  }
}`;

/** The full `commits` connection: the set a completion comment's named prefix resolves within. */
export const COMMITS_QUERY = `query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      commits(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes { commit { oid } }
      }
    }
  }
}`;

/** The `gh api graphql --paginate --slurp` argv for one harvest query. */
export function harvestArgs(query: string, prNumber: string, repo: string | undefined): string[] {
  const [owner, name] = repo === undefined ? ['{owner}', '{repo}'] : repo.split('/');
  return [
    'api',
    'graphql',
    '--paginate',
    '--slurp',
    '-f',
    `query=${query}`,
    '-F',
    `owner=${owner}`,
    '-F',
    `name=${name}`,
    '-F',
    `number=${prNumber}`,
  ];
}
