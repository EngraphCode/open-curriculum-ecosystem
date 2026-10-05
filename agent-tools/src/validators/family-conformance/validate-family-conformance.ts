#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';
import { typeSafeEntries, typeSafeKeys } from '@oaknational/type-helpers';

import { failureAsError } from '../../core/failure-as-error.js';
import { isJsonObject, parseJsonTextResult } from '../../core/json.js';
import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';

import {
  compileFamilySchemas,
  FAMILY_CONFORMANCE_SCHEMA_REL_PATH,
  FAMILY_HOOKS_REL_DIR,
  FAMILY_MANIFEST_REL_PATH,
  FAMILY_NAME,
  HOST_VALUES_REL_PATH,
  LIVE_HOOKS_REL_DIR,
  validateWithSchema,
  type FamilyManifest,
  type HostValues,
} from './family-conformance-manifest.js';
import {
  computeDrifts,
  type ConformanceReading,
  type RootPackage,
  type TreeSnapshot,
} from './family-conformance-tree-helpers.js';

/**
 * Standalone validator asserting this repository conforms to its tooling
 * family's declared Practice operations: the family conformance check, the
 * instrument of the Practice's family layer (PDR-143). The manifest at
 * `.agent/family/<family>/practice-operations.json` declares the root
 * scripts, the `check` skeleton and its two host slots, the family prefix
 * of each aggregate, the hook bodies, the CI fan-in, the compiler base
 * flags, the formatter and the package manager; every item is recomputed
 * from the live tree at every run (validators must recompute, never just
 * record) with the host's placeholder values read from
 * `.agent/family/host.json`. Exit 1 names every drift; exit 2 means an
 * input could not be read or a declaration failed its schema.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);

const ROOT_PACKAGE_REL_PATH = 'package.json';
const TSCONFIG_BASE_REL_PATH = 'tsconfig.base.json';

async function readJsonFile(relPath: string): Promise<Result<unknown, Error>> {
  let text: string;
  try {
    text = await fs.readFile(path.join(repoRoot, relPath), 'utf8');
  } catch (failure) {
    const reason = failureAsError(failure, `reading ${relPath}`).message;
    return err(new Error(`${relPath} is unreadable: ${reason}`));
  }
  return parseJsonTextResult(text, relPath);
}

async function readOptionalText(relPath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(path.join(repoRoot, relPath), 'utf8');
  } catch {
    return undefined;
  }
}

async function readOptionalBytes(relPath: string): Promise<Uint8Array | undefined> {
  try {
    return new Uint8Array(await fs.readFile(path.join(repoRoot, relPath)));
  } catch {
    return undefined;
  }
}

async function readHookBodies(
  relDir: string,
  names: readonly string[],
): Promise<ReadonlyMap<string, Uint8Array>> {
  const bodies = new Map<string, Uint8Array>();
  await Promise.all(
    names.map(async (name) => {
      const bytes = await readOptionalBytes(`${relDir}/${name}`);
      if (bytes !== undefined) {
        bodies.set(name, bytes);
      }
    }),
  );
  return bodies;
}

async function presentRootFiles(names: readonly string[]): Promise<ReadonlySet<string>> {
  const present = new Set<string>();
  await Promise.all(
    names.map(async (name) => {
      try {
        await fs.access(path.join(repoRoot, name));
        present.add(name);
      } catch {
        // absent: the expected state for a forbidden file
      }
    }),
  );
  return present;
}

interface Declarations {
  readonly manifest: FamilyManifest;
  readonly host: HostValues;
}

async function loadDeclarations(): Promise<Result<Declarations, Error>> {
  const [schemaDocument, manifestDocument, hostDocument] = await Promise.all([
    readJsonFile(FAMILY_CONFORMANCE_SCHEMA_REL_PATH),
    readJsonFile(FAMILY_MANIFEST_REL_PATH),
    readJsonFile(HOST_VALUES_REL_PATH),
  ]);
  if (!schemaDocument.ok) {
    return schemaDocument;
  }
  if (!manifestDocument.ok) {
    return manifestDocument;
  }
  if (!hostDocument.ok) {
    return hostDocument;
  }
  const validators = compileFamilySchemas(schemaDocument.value);
  if (!validators.ok) {
    return validators;
  }
  const manifest = validateWithSchema(
    validators.value.manifest,
    manifestDocument.value,
    FAMILY_MANIFEST_REL_PATH,
  );
  if (!manifest.ok) {
    return manifest;
  }
  const host = validateWithSchema(validators.value.host, hostDocument.value, HOST_VALUES_REL_PATH);
  if (!host.ok) {
    return host;
  }
  if (manifest.value.family !== FAMILY_NAME) {
    return err(
      new Error(
        `${FAMILY_MANIFEST_REL_PATH} declares family \`${manifest.value.family}\`; this validator belongs to \`${FAMILY_NAME}\``,
      ),
    );
  }
  return ok({ manifest: manifest.value, host: host.value });
}

function readRootPackage(document: unknown): Result<RootPackage, Error> {
  if (!isJsonObject(document) || !isJsonObject(document.scripts)) {
    return err(new Error(`${ROOT_PACKAGE_REL_PATH} has no scripts map`));
  }
  const scripts: Record<string, string> = {};
  for (const [name, body] of typeSafeEntries(document.scripts)) {
    if (typeof body === 'string') {
      scripts[name] = body;
    }
  }
  return ok({ scripts, packageManager: document.packageManager });
}

async function readTree(manifest: FamilyManifest): Promise<Result<TreeSnapshot, Error>> {
  const rootFileNames = [manifest.formatter.config_file, ...manifest.formatter.forbidden];
  const [packageDocument, tsconfig, workflowText, liveHooks, familyHooks, present] =
    await Promise.all([
      readJsonFile(ROOT_PACKAGE_REL_PATH),
      readJsonFile(TSCONFIG_BASE_REL_PATH),
      readOptionalText(manifest.ci.workflow),
      readHookBodies(LIVE_HOOKS_REL_DIR, manifest.hooks),
      readHookBodies(FAMILY_HOOKS_REL_DIR, manifest.hooks),
      presentRootFiles(rootFileNames),
    ]);
  if (!packageDocument.ok) {
    return packageDocument;
  }
  if (!tsconfig.ok) {
    return tsconfig;
  }
  const rootPackage = readRootPackage(packageDocument.value);
  if (!rootPackage.ok) {
    return rootPackage;
  }
  return ok({
    rootPackage: rootPackage.value,
    tsconfig: tsconfig.value,
    workflowText,
    hooks: { live: liveHooks, family: familyHooks },
    presentRootFiles: present,
  });
}

function formatSlot(legs: readonly string[]): string {
  return legs.length === 0 ? 'empty' : legs.join(' && ');
}

function reportOk(manifest: FamilyManifest, reading: ConformanceReading): void {
  const counts =
    `${String(typeSafeKeys(manifest.scripts).length)} scripts, ` +
    `${String(typeSafeKeys(manifest.aggregates).length)} aggregates, ` +
    `${String(manifest.hooks.length)} hooks, the CI fan-in, ` +
    `${String(typeSafeKeys(manifest.compiler_base_flags).length)} compiler flags, ` +
    `the formatter and ${manifest.package_manager.name}@${String(manifest.package_manager.major)}`;
  writeLine(
    `validate-family-conformance: OK (${FAMILY_NAME} family: ${counts}; ` +
      `check slot before build: ${formatSlot(reading.skeleton.slotBeforeBuild)}; ` +
      `slot after tests: ${formatSlot(reading.skeleton.slotAfterTests)})`,
  );
}

async function main(): Promise<void> {
  const declarations = await loadDeclarations();
  if (!declarations.ok) {
    writeErrorLine(`validate-family-conformance: ${declarations.error.message}`);
    process.exit(2);
  }
  const tree = await readTree(declarations.value.manifest);
  if (!tree.ok) {
    writeErrorLine(`validate-family-conformance: ${tree.error.message}`);
    process.exit(2);
  }
  const reading = computeDrifts(declarations.value.manifest, declarations.value.host, tree.value);
  if (reading.drifts.length === 0) {
    reportOk(declarations.value.manifest, reading);
    return;
  }
  const formatted = reading.drifts.map((entry) => `  [${entry.area}] ${entry.message}`).join('\n');
  writeErrorLine(
    `validate-family-conformance: ${String(reading.drifts.length)} drift(s) from the ` +
      `${FAMILY_NAME} family manifest (${FAMILY_MANIFEST_REL_PATH}).\n\n${formatted}\n\n` +
      `Every repository of the family carries the same Practice operations. Align the tree with ` +
      `the manifest, or change the manifest in every repository of the family together.`,
  );
  process.exit(1);
}

await main();
