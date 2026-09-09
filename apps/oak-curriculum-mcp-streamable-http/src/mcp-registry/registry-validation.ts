/**
 * The registry's own verdict on a document, before anything is published.
 *
 * @remarks
 * The official registry exposes a public, unauthenticated, non-mutating
 * validation endpoint. That makes the question *"would the registry accept
 * this?"* answerable without credentials, without a namespace decision, and
 * without publishing — so the generator asks it every time rather than
 * discovering a rejection at the one moment that is expensive: a published
 * version is immutable, and correcting a bad entry costs a new version.
 *
 * The response is validated to its exact shape at arrival (ADR-032). An
 * unrecognised body is a failure, never an implicit pass: a validation
 * service whose contract has changed must not read as approval.
 */

import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

/** The public validation endpoint, on the current `v0.1` API prefix. */
export const REGISTRY_VALIDATE_URL = 'https://registry.modelcontextprotocol.io/v0.1/validate';

/**
 * One issue the registry reports against a document.
 *
 * @remarks
 * Every field is the registry's to omit — a measured rejection carries
 * `type`, `path`, `message`, `severity` and `reference`, while an acceptance
 * carries an empty list — so the schema requires none of them and reports
 * whatever arrived.
 */
const registryValidationIssueSchema = z.object({
  type: z.string().optional(),
  path: z.string().optional(),
  message: z.string().optional(),
  severity: z.string().optional(),
  reference: z.string().optional(),
});

/**
 * The verdict body.
 *
 * @remarks
 * `valid` is required: it is the entire answer, and a body without it is not
 * a verdict. Measured 2026-09-09 — an accepted document returns
 * `{"valid":true,"issues":[]}`; a plain-HTTP remote returns `valid:false`
 * with one `severity: "error"` issue at `remotes[0].url`.
 */
const registryValidationVerdictSchema = z.object({
  valid: z.boolean(),
  issues: z.array(registryValidationIssueSchema).default([]),
});

/** The registry's validation verdict. */
export type RegistryValidationVerdict = z.infer<typeof registryValidationVerdictSchema>;

/**
 * Validates an arbitrary validation response into a verdict.
 *
 * @param body - The parsed response body, `unknown` as it arrives.
 * @returns The verdict, or a message saying why the body was unusable.
 *
 * @example
 * ```typescript
 * const verdict = readValidationVerdict(await response.json());
 * ```
 */
export function readValidationVerdict(body: unknown): Result<RegistryValidationVerdict, string> {
  const parsed = registryValidationVerdictSchema.safeParse(body);
  if (!parsed.success) {
    return err(
      `the registry's validation response did not match its expected shape: ${parsed.error.message}`,
    );
  }
  return ok(parsed.data);
}

/**
 * Turns a verdict into a pass or a message naming every issue.
 *
 * @param verdict - The registry's verdict.
 * @returns `undefined` on acceptance, or the failure message to report.
 */
export function describeValidationFailure(verdict: RegistryValidationVerdict): string | undefined {
  if (verdict.valid) {
    return undefined;
  }

  const described = verdict.issues.map(
    (issue) =>
      `${issue.severity ?? 'issue'} at ${issue.path ?? '(document)'}: ` +
      `${issue.message ?? '(no message)'}`,
  );
  return described.length === 0
    ? 'the registry rejected the document without naming an issue'
    : `the registry rejected the document: ${described.join('; ')}`;
}

/**
 * The protected-resource metadata the generator measures a document against.
 *
 * @remarks
 * Only `resource` is read — the endpoint the deployment says it is. The rest
 * of the RFC 9728 document is the auth surfaces' concern, not this one's.
 */
const servedResourceMetadataSchema = z.object({ resource: z.string() });

/**
 * Reads the deployment's own answer to "what endpoint am I?".
 *
 * @param body - The parsed protected-resource metadata document.
 * @returns The `resource` value, or a message saying why it was unusable.
 */
export function readServedResource(body: unknown): Result<string, string> {
  const parsed = servedResourceMetadataSchema.safeParse(body);
  if (!parsed.success) {
    return err(`protected-resource metadata carried no string 'resource': ${parsed.error.message}`);
  }
  return ok(parsed.data.resource);
}
