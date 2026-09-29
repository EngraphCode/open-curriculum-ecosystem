import { createReadStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

import type { ArcMetricsFileSystem } from './file-system.js';

/**
 * Production filesystem adapter — the only file in this topic that touches
 * `node:fs`.
 *
 * @remarks
 * `readLines` streams through `node:readline` rather than reading the file:
 * a single arc transcript reached 100MB in the measured instance, and the
 * aggregation needs one line at a time. A missing project directory lists as
 * empty, per the seam's contract; any other listing error propagates.
 */
export const nodeArcMetricsFileSystem: ArcMetricsFileSystem = {
  listTranscripts: async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true }).catch((error: unknown) => {
      if (isMissingDirectory(error)) {
        return [];
      }
      throw error;
    });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.jsonl'))
      .map((entry) => join(directory, entry.name));
  },

  readLines: (absolutePath) =>
    createInterface({
      input: createReadStream(absolutePath, { encoding: 'utf8' }),
      crlfDelay: Infinity,
    }),
};

function isMissingDirectory(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }
  return error.code === 'ENOENT';
}
