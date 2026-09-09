#!/usr/bin/env node

/**
 * Composes the official MCP Registry entry for this deployment and proves it
 * before writing it (MCP-637).
 *
 * @remarks
 * The composition root for `src/mcp-registry/`: the only place that reads
 * `process.env`, reaches the network, or touches the filesystem. Everything
 * it decides is decided by pure functions the suites describe.
 *
 * Four steps, in this order, because each one makes the next one meaningful:
 *
 * 1. **Resolve** every field from the home that owns it
 *    (`resolveServerJsonInputs`) — the endpoint from the same
 *    `resolveServedMcpUrl` derivation the request path uses.
 * 2. **Compose and validate locally** (`buildServerJsonDocument`), so a
 *    document that breaks a published registry constraint fails here.
 * 3. **Measure the deployment.** Read the RFC 9728 protected-resource
 *    metadata from the address the document advertises and require the
 *    `resource` it publishes to be exactly the endpoint in the document. This
 *    is the step that makes the entry true of a running server rather than
 *    true of an environment variable.
 * 4. **Ask the registry.** `POST /v0.1/validate` is public, unauthenticated
 *    and non-mutating, so the registry's own verdict is available before any
 *    credential exists. A published version is immutable — correcting a bad
 *    entry costs a new version number — so the cheap dry run always runs.
 *
 * This script **never publishes.** Publication is `mcp-publisher publish`,
 * which needs a namespace decision and an ownership proof; the procedure is
 * in `docs/mcp-registry-publication.md`.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SERVER_JSON_ARTEFACT_RELATIVE_PATH,
  assertRemoteMatchesServedResource,
  buildServerJsonDocument,
} from '../src/mcp-registry/server-json.js';
import {
  resolveServedOriginInputs,
  resolveServerJsonInputs,
} from '../src/mcp-registry/server-json-inputs.js';
import {
  REGISTRY_VALIDATE_URL,
  describeValidationFailure,
  readServedResource,
  readValidationVerdict,
} from '../src/mcp-registry/registry-validation.js';
import { resolveServedPrmUrl } from '../src/served-origin.js';

/** Fails the run with a message, rather than writing a document nobody proved. */
function fail(message: string): never {
  process.stderr.write(`generate-server-json: ${message}\n`);
  process.exit(1);
}

const inputs = resolveServerJsonInputs(process.env);
if (!inputs.ok) {
  fail(inputs.error);
}

const built = buildServerJsonDocument(inputs.value);
if (!built.ok) {
  fail(built.error);
}
const document = built.value;

const advertised = document.remotes[0]?.url;
if (advertised === undefined) {
  fail('the composed document carries no remote endpoint');
}

/**
 * Where the deployment publishes its protected-resource metadata, resolved
 * from the same environment reading as the endpoint in the document — so the
 * probe cannot end up interrogating a different host than the document
 * describes.
 */
const prmUrl = resolveServedPrmUrl(resolveServedOriginInputs(process.env));

const prmResponse = await fetch(prmUrl, { headers: { accept: 'application/json' } });
if (!prmResponse.ok) {
  fail(
    `the deployment did not serve protected-resource metadata at ${prmUrl} ` +
      `(HTTP ${String(prmResponse.status)}) — a registry entry must name a running server`,
  );
}

const servedResource = readServedResource(await prmResponse.json());
if (!servedResource.ok) {
  fail(`${prmUrl}: ${servedResource.error}`);
}

const proven = assertRemoteMatchesServedResource(document, servedResource.value);
if (!proven.ok) {
  fail(proven.error);
}

const validateResponse = await fetch(REGISTRY_VALIDATE_URL, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(document),
});
const verdict = readValidationVerdict(await validateResponse.json());
if (!verdict.ok) {
  fail(`could not read the registry's verdict: ${verdict.error}`);
}
const rejection = describeValidationFailure(verdict.value);
if (rejection !== undefined) {
  fail(rejection);
}

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));
const artefact = path.join(workspaceRoot, SERVER_JSON_ARTEFACT_RELATIVE_PATH);
await mkdir(path.dirname(artefact), { recursive: true });
await writeFile(artefact, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

process.stdout.write(
  `wrote ${SERVER_JSON_ARTEFACT_RELATIVE_PATH} for ${document.name} v${document.version}\n` +
    `  endpoint ${advertised} — confirmed as the resource served at ${prmUrl}\n` +
    `  registry validation: accepted by ${REGISTRY_VALIDATE_URL}\n` +
    `  not published; see docs/mcp-registry-publication.md\n`,
);
