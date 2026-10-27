import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { printable } from '../pr-watch/printable.js';
import { githubJsonHeaders } from './github-fetch.js';
import { readJsonBody, sendGithubRequest, type GithubApiFetch } from './mint-installation-token.js';
import type { PlannedDelete } from './retire-decision.js';
import type { DefaultBranchReading, RemoteRefReading } from './retire-parse.js';

/**
 * The retire command's two calls to GitHub, both GraphQL so the branch name
 * travels in a JSON body and never in a URL path (where git-legal `#` and
 * `%` would be read as something else).
 *
 * The delete is `updateRefs` with `beforeOid`: a server-side compare-and-swap,
 * so a push landing after the proof is kept, not deleted. A stale `beforeOid`
 * is answered by a generic GraphQL error, not a named mismatch (the
 * `branch-retire` scope row records the probe), so the caller never reads the
 * outcome from this answer: it reads the ref back.
 */

const GRAPHQL_URL = 'https://api.github.com/graphql';
const ZERO_OID = '0'.repeat(40);

const REMOTE_REF_QUERY = `query($owner: String!, $name: String!, $ref: String!) {
  repository(owner: $owner, name: $name) {
    id
    defaultBranchRef { name target { oid } }
    ref(qualifiedName: $ref) { target { oid } }
  }
}`;

const DELETE_MUTATION = `mutation($id: ID!, $ref: GitRefname!, $before: GitObjectID!, $after: GitObjectID!) {
  updateRefs(input: { repositoryId: $id, refUpdates: [{ name: $ref, beforeOid: $before, afterOid: $after }] }) { clientMutationId }
}`;

const targetSchema = z.object({ oid: z.string().regex(/^[0-9a-f]{40}$/) });

const remoteRefSchema = z.object({
  data: z.object({
    repository: z.object({
      id: z.string().min(1),
      defaultBranchRef: z.object({ name: z.string().min(1), target: targetSchema }).nullable(),
      ref: z.object({ target: targetSchema }).nullable(),
    }),
  }),
});

const deleteSchema = z.object({ data: z.object({ updateRefs: z.looseObject({}) }) });

const errorsSchema = z.object({ errors: z.array(z.object({ message: z.string() })).min(1) });

/** The repository's node id, its default branch, and the remote ref, as GitHub reads them. */
export interface RemoteRefState {
  readonly repositoryId: string;
  /** Undefined when the repository has no default branch (an empty repository). */
  readonly defaultBranch: DefaultBranchReading | undefined;
  readonly ref: RemoteRefReading;
}

/** The repository the bot identity names. */
export interface IdentityRepo {
  readonly owner: string;
  readonly repoName: string;
}

/** POST one GraphQL document; returns the parsed JSON body of a 200, or a failure naming GitHub's words. */
async function postGraphql(
  fetchImpl: GithubApiFetch,
  token: string,
  label: string,
  document: { readonly query: string; readonly variables: Readonly<Record<string, string>> },
): Promise<Result<unknown, Error>> {
  const sent = await sendGithubRequest(
    fetchImpl,
    GRAPHQL_URL,
    {
      method: 'POST',
      headers: githubJsonHeaders(token),
      body: JSON.stringify(document),
    },
    label,
  );
  if (!sent.ok) {
    return sent;
  }
  const body = await readJsonBody(sent.value, label);
  if (!body.ok) {
    return body;
  }
  const errors = errorsSchema.safeParse(body.value);
  if (errors.success) {
    const messages = errors.data.errors.map((entry) => printable(entry.message)).join('; ');
    return err(new Error(`${label} answered with GraphQL errors: ${messages}`));
  }
  if (sent.value.status !== 200) {
    return err(new Error(`${label} answered ${sent.value.status}`));
  }
  return ok(body.value);
}

/** Read the remote ref, the default branch, and the node id the delete needs, through the identity's own repository. */
export async function readRemoteRefByApi(
  fetchImpl: GithubApiFetch,
  token: string,
  repo: IdentityRepo,
  branch: string,
): Promise<Result<RemoteRefState, Error>> {
  const body = await postGraphql(fetchImpl, token, 'the remote ref read', {
    query: REMOTE_REF_QUERY,
    variables: { owner: repo.owner, name: repo.repoName, ref: `refs/heads/${branch}` },
  });
  if (!body.ok) {
    return body;
  }
  const parsed = remoteRefSchema.safeParse(body.value);
  if (!parsed.success) {
    return err(new Error('the remote ref read answered an unrecognised body'));
  }
  const { id, defaultBranchRef, ref } = parsed.data.data.repository;
  return ok({
    repositoryId: id,
    defaultBranch:
      defaultBranchRef === null
        ? undefined
        : { name: defaultBranchRef.name, sha: defaultBranchRef.target.oid },
    ref: ref === null ? { kind: 'absent' } : { kind: 'present', sha: ref.target.oid },
  });
}

/** Ask GitHub to delete the planned ref only if it is still at the proven sha. */
export async function requestRefDelete(
  fetchImpl: GithubApiFetch,
  token: string,
  repositoryId: string,
  target: PlannedDelete,
): Promise<Result<undefined, Error>> {
  const body = await postGraphql(fetchImpl, token, 'the remote delete', {
    query: DELETE_MUTATION,
    variables: { id: repositoryId, ref: target.ref, before: target.expectedSha, after: ZERO_OID },
  });
  if (!body.ok) {
    return body;
  }
  return deleteSchema.safeParse(body.value).success
    ? ok(undefined)
    : err(new Error('the remote delete answered an unrecognised body'));
}
