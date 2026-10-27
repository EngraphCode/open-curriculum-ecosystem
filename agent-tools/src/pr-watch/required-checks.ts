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
 *
 * The parse fails closed. Every rule names its type; a rule of type
 * `required_status_checks` is then held to its full shape — `parameters`
 * carrying `required_status_checks`, at least one context, each named — so
 * a truncated or malformed rule is a parse error the caller sees, never a
 * rule that reads as requiring nothing (a door would then outrun the
 * contexts the branch really requires). An empty contexts list is refused
 * on the same ground: a rule of this type that names nothing is read as
 * truncation, never as a branch requiring nothing. Rules of every other
 * type keep their parameters unread.
 */

const REQUIRED_STATUS_CHECKS = 'required_status_checks';

/** Every rule names its type; the rest of the body is kept for the rule's own schema. */
const ruleHeadSchema = z.looseObject({ type: z.string() });

const requiredStatusChecksRuleSchema = z.object({
  type: z.literal(REQUIRED_STATUS_CHECKS),
  parameters: z.object({
    required_status_checks: z.array(z.object({ context: z.string().min(1) })).min(1),
  }),
});

export function parseRequiredChecks(value: unknown): Result<readonly string[], Error> {
  const rules = parseWithSchema({ label: 'branch rules', schema: z.array(ruleHeadSchema), value });
  if (!rules.ok) {
    return rules;
  }
  const contexts: string[] = [];
  for (const [index, rule] of rules.value.entries()) {
    if (rule.type === REQUIRED_STATUS_CHECKS) {
      const parsed = parseWithSchema({
        label: `branch rules: the ${REQUIRED_STATUS_CHECKS} rule at index ${index}`,
        schema: requiredStatusChecksRuleSchema,
        value: rule,
      });
      if (!parsed.ok) {
        return parsed;
      }
      contexts.push(
        ...parsed.value.parameters.required_status_checks.map((check) => check.context),
      );
    }
  }
  return ok(contexts);
}

/** A branch name safe to place in a REST path once encoded: plain segments, no traversal. */
const BRANCH_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/u;

export function isBranchName(ref: string): boolean {
  return BRANCH_NAME_PATTERN.test(ref) && !ref.includes('..');
}
