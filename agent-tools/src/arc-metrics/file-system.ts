/**
 * Filesystem seam for the `arc-metrics` topic.
 *
 * @remarks
 * Two ports, both read-only, so the composition root reads real transcripts
 * while unit and integration tests inject fakes; only the production adapter
 * (`file-system-node.ts`) touches `node:fs`.
 *
 * The line port streams rather than returning a string: an arc's transcripts
 * run to a hundred megabytes each, and the whole-file read the session-metadata
 * seam uses (one file, its tail) would hold a whole transcript in memory here,
 * one session at a time.
 *
 * @packageDocumentation
 */

/** Read-only filesystem seam for reading a project's session transcripts. */
export interface ArcMetricsFileSystem {
  /**
   * List the transcript files directly inside a project directory.
   *
   * @param directory - Absolute path of the vendor's project directory.
   * @returns Absolute paths of its `.jsonl` files, in any order. A directory
   *   that does not exist yields an empty list rather than an error: a project
   *   key with no sessions is an ordinary state, not a failure.
   */
  readonly listTranscripts: (directory: string) => Promise<readonly string[]>;

  /**
   * Stream one transcript's lines.
   *
   * @param absolutePath - Absolute path of a transcript file.
   * @returns Its lines, without terminators; may reject with any IO error.
   */
  readonly readLines: (absolutePath: string) => AsyncIterable<string>;
}
