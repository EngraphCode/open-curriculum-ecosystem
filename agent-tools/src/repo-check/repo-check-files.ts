/**
 * The file universe of the root format and markdown gates, as pure functions
 * over what git gave back.
 *
 * @remarks
 * The universe is git's tracked tree, never a walk of the disk. A walk checks
 * whatever this machine happens to carry (a generated read model, an editor's
 * workspace file, build output) and so proves the machine, not the repository:
 * the "green here, red in CI" class. Existence comes from git; ownership (which
 * tracked files a tool formats) stays declared in each tool's own ignore file,
 * which both tools still apply to paths named explicitly.
 *
 * The tracked tree of a large repository does not fit one command line, so the
 * files are run in chunks under a byte budget ({@link argvChunks}).
 *
 * @packageDocumentation
 */

const NUL = '\u0000';

/** The mode prefix of a symbolic link in `git ls-files -s` output. */
const SYMLINK_MODE_PREFIX = '120000 ';

/**
 * Split git's `-z` output into paths, so a space, a tab or a newline inside a
 * path survives.
 *
 * @param stdout - What a `-z` git command wrote.
 * @returns The paths in order, without the empty record after the last NUL.
 */
export function parseNulSeparatedPaths(stdout: string): readonly string[] {
  return stdout.split(NUL).filter((entry) => entry.length > 0);
}

/**
 * The index entries that are symbolic links, read from
 * `git ls-files --cached -s -z` (`<mode> <object> <stage>\t<path>`).
 *
 * @remarks
 * A symlink carries no content of its own to format: its target is checked
 * under its real path, and prettier refuses a symlink path outright. The first
 * tab ends the metadata and the path may itself hold a tab, so the record is
 * split there and nowhere else.
 *
 * @param stageOutput - What `git ls-files --cached -s -z` wrote.
 * @returns The symlink paths.
 */
export function parseSymlinkPaths(stageOutput: string): ReadonlySet<string> {
  const symlinks = new Set<string>();
  for (const record of parseNulSeparatedPaths(stageOutput)) {
    const delimiter = record.indexOf('\t');
    if (record.startsWith(SYMLINK_MODE_PREFIX) && delimiter !== -1) {
      symlinks.add(record.slice(delimiter + 1));
    }
  }
  return symlinks;
}

/** What git says about the tracked tree, read once for one gate run. */
export interface TrackedTreeReading {
  /** Every tracked file (`git ls-files -z`). */
  readonly tracked: readonly string[];
  /** Tracked files deleted or retyped in the working tree and not yet staged. */
  readonly goneFromWorkingTree: ReadonlySet<string>;
  /** Index entries that are symbolic links. */
  readonly symlinks: ReadonlySet<string>;
}

/**
 * The tracked files a gate runs over.
 *
 * @remarks
 * A tracked file deleted from the working tree, or replaced there by a symlink,
 * is still a regular index entry until the change is staged, so `ls-files`
 * names it and the tool would fail on a missing file or refuse the link. Git's
 * own unstaged-diff answer removes those, so the list never comes from probing
 * the disk.
 *
 * @param reading - What git said about the tracked tree.
 * @returns The tracked files, in git's order, without those gone from the
 *   working tree and without symbolic links.
 */
export function trackedCheckFiles(reading: TrackedTreeReading): readonly string[] {
  return reading.tracked.filter(
    (file) => !reading.goneFromWorkingTree.has(file) && !reading.symlinks.has(file),
  );
}

/**
 * The Markdown files among the given paths.
 *
 * @param files - Repo-relative paths.
 * @returns The paths ending in `.md`, in order.
 */
export function markdownOnly(files: readonly string[]): readonly string[] {
  return files.filter((file) => file.endsWith('.md'));
}

/**
 * Split files into chunks that each fit a command line.
 *
 * @remarks
 * A command line's size limit counts each argument's bytes plus its
 * terminator, and the environment shares it (1 MiB on macOS), so the budget is
 * set well under that. A single path larger than the budget cannot be split and
 * takes a chunk of its own.
 *
 * @param files - Repo-relative paths, in the order they run.
 * @param budgetBytes - The most bytes one chunk's paths may cost.
 * @returns The chunks in order; every file appears exactly once.
 */
export function argvChunks(
  files: readonly string[],
  budgetBytes: number,
): readonly (readonly string[])[] {
  const chunks: string[][] = [];
  let current: string[] = [];
  let used = 0;
  for (const file of files) {
    const cost = Buffer.byteLength(file, 'utf8') + 1;
    if (current.length > 0 && used + cost > budgetBytes) {
      chunks.push(current);
      current = [];
      used = 0;
    }
    current.push(file);
    used += cost;
  }
  if (current.length > 0) {
    chunks.push(current);
  }
  return chunks;
}

/**
 * One exit status for a gate that ran its tool several times: the first
 * failure, so every chunk's findings are shown and the gate still fails.
 *
 * @param statuses - Each run's exit status, in run order.
 * @returns 0 when every run passed or none ran; otherwise the first non-zero
 *   status.
 */
export function combinedExitCode(statuses: readonly number[]): number {
  return statuses.find((status) => status !== 0) ?? 0;
}
