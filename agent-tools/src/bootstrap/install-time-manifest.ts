/**
 * Read the fields of a workspace manifest that the install-time closure needs:
 * the files under `dist/` its entry points name, and the workspace packages it
 * declares. Pure, and importing nothing from the workspace, for the reason
 * `install-time-closure.ts` gives; the manifest is validated with zod at the
 * boundary (ADR-032).
 *
 * @packageDocumentation
 */

import { z } from 'zod';

/** An `exports` value: a target, `null` (a hidden subpath), or a nested condition map or array. */
type ExportValue = string | null | readonly ExportValue[] | { readonly [key: string]: ExportValue };

const ExportValueSchema: z.ZodType<ExportValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.null(),
    z.array(ExportValueSchema),
    z.record(z.string(), ExportValueSchema),
  ]),
);

const DependencyRecordSchema = z.record(z.string(), z.string()).optional();

/** The `package.json` fields the derivation reads; everything else is ignored. */
export const ManifestSchema = z.object({
  name: z.string().min(1),
  main: z.string().optional(),
  types: z.string().optional(),
  exports: ExportValueSchema.optional(),
  scripts: z.object({ build: z.string().optional() }).optional(),
  dependencies: DependencyRecordSchema,
  devDependencies: DependencyRecordSchema,
  peerDependencies: DependencyRecordSchema,
});

export type Manifest = z.infer<typeof ManifestSchema>;

const DIST_DIR = 'dist/';

/**
 * The files under `dist/` the manifest's entry points name, in declaration
 * order without repeats. A leading `./` is optional (`dist/x` and `./dist/x`
 * are the same file); targets outside `dist/`, such as a `./package.json`
 * self-export, and `null` targets are not build output.
 */
export function distArtifacts(manifest: Manifest): readonly string[] {
  const targets = [
    ...(manifest.exports === undefined ? [] : exportTargets(manifest.exports)),
    ...(manifest.main === undefined ? [] : [manifest.main]),
    ...(manifest.types === undefined ? [] : [manifest.types]),
  ];
  const inDist = targets
    .map((target) => (target.startsWith('./') ? target.slice(2) : target))
    .filter((target) => target.startsWith(DIST_DIR))
    .map((target) => target.slice(DIST_DIR.length));
  return [...new Set(inDist)];
}

/** Every target string of an `exports` value, whatever its nesting. */
function exportTargets(value: ExportValue): readonly string[] {
  if (value === null) {
    return [];
  }
  if (typeof value === 'string') {
    return [value];
  }
  if (isExportArray(value)) {
    return value.flatMap((item) => exportTargets(item));
  }
  return recordEntries(value).flatMap(([, nested]) => exportTargets(nested));
}

function isExportArray(value: ExportValue): value is readonly ExportValue[] {
  return Array.isArray(value);
}

/** The workspace package names a manifest declares, in any dependency field, without repeats. */
export function workspaceDependencies(manifest: Manifest): readonly string[] {
  const declared = [
    ...recordEntries(manifest.dependencies ?? {}),
    ...recordEntries(manifest.devDependencies ?? {}),
    ...recordEntries(manifest.peerDependencies ?? {}),
  ];
  return [
    ...new Set(
      declared.filter(([, range]) => range.startsWith('workspace:')).map(([name]) => name),
    ),
  ];
}

/**
 * Typed own-entry iteration over a zod-validated record. A deliberate local
 * copy of the helper `@oaknational/type-helpers` exports, and an exception to
 * consolidating at the second consumer: that package is in the closure this
 * module computes, so it cannot be imported before it is built.
 */
function recordEntries<T>(record: Readonly<Record<string, T>>): readonly (readonly [string, T])[] {
  const entries: (readonly [string, T])[] = [];
  for (const key in record) {
    const value = record[key];
    if (value !== undefined) {
      entries.push([key, value]);
    }
  }
  return entries;
}
