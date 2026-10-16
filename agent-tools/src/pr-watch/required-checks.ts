import { ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';

/**
 * The status contexts a branch's rules require, parsed from
 * `GET /repos/{owner}/{repo}/rules/branches/{branch}`: every
 * `required_status_checks` rule's contexts, in rule order. The one
 * definition of "checks green by name" the merge door's records class and
 * the coordination fold clock share (consolidated at the second consumer):
 * the fold skill's full condition is exactly the contexts the default
 * branch's rules require, read at run time, and no other name (a door
 * computed from a carried list of names refused a green fold, 2026-10-02).
 */

const rulesSchema = z.array(
  z.object({
    type: z.string(),
    parameters: z
      .object({
        required_status_checks: z.array(z.object({ context: z.string().min(1) })).optional(),
      })
      .optional(),
  }),
);

export function parseRequiredChecks(value: unknown): Result<readonly string[], Error> {
  const parsed = parseWithSchema({ label: 'branch rules', schema: rulesSchema, value });
  if (!parsed.ok) {
    return parsed;
  }
  return ok(
    parsed.value
      .filter((rule) => rule.type === 'required_status_checks')
      .flatMap((rule) => rule.parameters?.required_status_checks ?? [])
      .map((check) => check.context),
  );
}

/** A branch name safe to place in a REST path once encoded: plain segments, no traversal. */
const BRANCH_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/u;

export function isBranchName(ref: string): boolean {
  return BRANCH_NAME_PATTERN.test(ref) && !ref.includes('..');
}
