/**
 * The registry's constraints on a `server.json` document, applied locally.
 *
 * @remarks
 * Every rule here restates a constraint the official registry actually
 * enforces, so a document that would be refused at the API is refused in the
 * gate that built it. Two of them are stricter than the *published JSON
 * Schema* because the registry's own Go validator is stricter, and the
 * validator is what runs.
 *
 * Each constraint was measured against `POST /v0.1/validate` on 2026-09-09
 * (registry build `1.8.1`): a 113-character description returned
 * `422 "expected length <= 100"`, and an `http://` remote returned
 * `valid:false` with `"invalid remote URL"` at `remotes[0].url`.
 *
 * @see {@link https://github.com/modelcontextprotocol/registry/blob/main/internal/validators/validators.go} the name rules
 * @see {@link https://github.com/modelcontextprotocol/registry/blob/main/internal/validators/utils.go} `IsValidRemoteURL`
 */

import { isValidSemver } from '@oaknational/build-metadata';

import type { ServerJsonInputs } from './server-json-types.js';

/** The registry's `description` and `title` cap (`maxLength: 100`). */
export const REGISTRY_DESCRIPTION_MAX_LENGTH = 100;

/** The registry's `name` lower bound (`minLength: 3`). */
const REGISTRY_NAME_MIN_LENGTH = 3;

/** The registry's `name` upper bound (`maxLength: 200`). */
const REGISTRY_NAME_MAX_LENGTH = 200;

/**
 * The namespace half of a registry name: reverse-DNS, no slash.
 *
 * @remarks
 * The published schema's whole-name pattern is the looser
 * `^[a-zA-Z0-9.-]+/[a-zA-Z0-9._-]+$`, but the registry's semantic validator
 * additionally requires each half to start and end alphanumeric, rejecting a
 * trailing dot with *"Namespace must start and end with alphanumeric
 * characters, and may contain dots and hyphens in the middle"*. This half
 * also excludes the underscore the name half allows.
 */
const NAMESPACE_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/;

/** The server-name half of a registry name; same start/end rule, plus `_`. */
const SERVER_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/;

/**
 * The endpoint constraint: HTTPS only.
 *
 * @remarks
 * Stricter than the schema's `^https?://[^\s]+$` and exactly as strict as the
 * registry's `IsValidRemoteURL`, which rejects any non-HTTPS scheme and every
 * loopback hostname. Encoding it here is what makes a local-development
 * origin (`http://localhost:3333/mcp`) unpublishable by construction rather
 * than by remembering.
 */
const PUBLISHABLE_ENDPOINT_PATTERN = /^https:\/\/[^\s]+$/;

/** Composes the registry name from its two halves. */
export function composeRegistryName(inputs: ServerJsonInputs): string {
  return `${inputs.namespace}/${inputs.serverName}`;
}

/** One constraint: the message when the inputs fail it, `undefined` when they pass. */
type Constraint = (inputs: ServerJsonInputs) => string | undefined;

const namespaceIsReverseDns: Constraint = (inputs) =>
  NAMESPACE_PATTERN.test(inputs.namespace)
    ? undefined
    : `namespace ${JSON.stringify(inputs.namespace)} is not a registry namespace: it must ` +
      'start and end alphanumeric and may carry dots and hyphens between; the slash is ' +
      'added here, so it is never part of the namespace';

const serverNameIsANameSegment: Constraint = (inputs) =>
  SERVER_NAME_PATTERN.test(inputs.serverName)
    ? undefined
    : `server name ${JSON.stringify(inputs.serverName)} is not a registry name segment: it ` +
      'must start and end alphanumeric and may carry dots, underscores and hyphens between';

const nameIsWithinLength: Constraint = (inputs) => {
  const name = composeRegistryName(inputs);
  return name.length >= REGISTRY_NAME_MIN_LENGTH && name.length <= REGISTRY_NAME_MAX_LENGTH
    ? undefined
    : `name ${JSON.stringify(name)} is ${String(name.length)} characters; the registry ` +
        `requires ${String(REGISTRY_NAME_MIN_LENGTH)} to ${String(REGISTRY_NAME_MAX_LENGTH)}`;
};

const descriptionFitsTheCap: Constraint = (inputs) =>
  inputs.description.length >= 1 && inputs.description.length <= REGISTRY_DESCRIPTION_MAX_LENGTH
    ? undefined
    : `description is ${String(inputs.description.length)} characters; the registry requires ` +
      `1 to ${String(REGISTRY_DESCRIPTION_MAX_LENGTH)}`;

const titleFitsTheCap: Constraint = (inputs) =>
  inputs.title.length >= 1 && inputs.title.length <= REGISTRY_DESCRIPTION_MAX_LENGTH
    ? undefined
    : `title is ${String(inputs.title.length)} characters; the registry requires 1 to ` +
      String(REGISTRY_DESCRIPTION_MAX_LENGTH);

const versionIsSemantic: Constraint = (inputs) =>
  isValidSemver(inputs.version)
    ? undefined
    : `version ${JSON.stringify(inputs.version)} is not semantic: the registry rejects ` +
      'version ranges and sorts non-semantic versions unpredictably';

const endpointIsPublishable: Constraint = (inputs) =>
  PUBLISHABLE_ENDPOINT_PATTERN.test(inputs.servedMcpUrl)
    ? undefined
    : `endpoint ${JSON.stringify(inputs.servedMcpUrl)} is not a publishable https URL — ` +
      'compose the document from a deployment with CANONICAL_HOST configured, never from ' +
      'a local development origin';

/**
 * Every constraint, in the order a publisher meets them: identity first, then
 * the display fields, then the endpoint the entry actually promises.
 */
const CONSTRAINTS: readonly Constraint[] = [
  namespaceIsReverseDns,
  serverNameIsANameSegment,
  nameIsWithinLength,
  descriptionFitsTheCap,
  titleFitsTheCap,
  versionIsSemantic,
  endpointIsPublishable,
];

/**
 * Finds the first registry constraint the inputs fail.
 *
 * @param inputs - The values a document would be composed from.
 * @returns The failure message, or `undefined` when every constraint passes.
 */
export function firstConstraintFailure(inputs: ServerJsonInputs): string | undefined {
  for (const constraint of CONSTRAINTS) {
    const failure = constraint(inputs);
    if (failure !== undefined) {
      return failure;
    }
  }
  return undefined;
}
