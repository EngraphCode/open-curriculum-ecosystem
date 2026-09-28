/**
 * Operator profile — the merge guard of the push leg. A pull that conflicts
 * leaves the repository mid-merge; the push that concludes it must not stage
 * a document that still holds a conflict marker, and cannot conclude while a
 * path outside the documents is still unmerged.
 *
 * The guard reads the marker lines git writes. A conflict that writes none
 * (a document modified on one side and deleted on the other) is settled by
 * staging, which keeps the document: the union rule's answer.
 */

import { err, ok, type Result } from '@oaknational/result';

import { gitFailure, type GitRunner } from './operator-profile-git.js';

/**
 * Whether a merge is in progress: a conflicting pull leaves `MERGE_HEAD`.
 * `rev-parse -q --verify` exits 1 with nothing on stderr when there is none;
 * any other failure is an error, never "no merge", since the push would go
 * on to stage and clear the record of a conflict it could not see.
 */
function merging(run: GitRunner): Result<boolean, string> {
  const probe = run(['rev-parse', '-q', '--verify', 'MERGE_HEAD']);
  if (probe.ok) {
    return ok(true);
  }
  return probe.stderr === '' ? ok(false) : err(gitFailure('git rev-parse MERGE_HEAD', probe));
}

function lines(text: string): readonly string[] {
  return text.split('\n').filter((line) => line !== '');
}

/**
 * The document paths the merge touches: those that differ between the two
 * sides. A path in conflict always does, and a document the merge leaves
 * alone is never searched, so a marker-like line in an untouched document
 * (a fenced example) never blocks the push. With no documents there is
 * nothing to ask: an empty pathspec would name every path in the merge.
 */
function mergedDocuments(
  run: GitRunner,
  paths: readonly string[],
): Result<readonly string[], string> {
  if (paths.length === 0) {
    return ok([]);
  }
  const changed = run(['diff', '--name-only', 'HEAD', 'MERGE_HEAD', '--', ...paths]);
  return changed.ok ? ok(lines(changed.stdout)) : err(gitFailure('git diff', changed));
}

// The lines git writes to open and close a conflict: seven marker characters
// by default, more under a `conflict-marker-size` attribute. `=======` alone
// is also a Markdown heading underline, so only the two ends are read.
const CONFLICT_MARKER = '^(<{7,}|>{7,})( |$)';

/**
 * The documents that still hold a conflict marker in the worktree. `git grep`
 * exits 1 with nothing on stderr when no line matches; any other failure,
 * a warning on stderr included, is an error, never "no markers".
 */
function markedDocuments(
  run: GitRunner,
  paths: readonly string[],
): Result<readonly string[], string> {
  if (paths.length === 0) {
    return ok([]);
  }
  const found = run(['grep', '-l', '-E', CONFLICT_MARKER, '--', ...paths]);
  if (found.ok) {
    return ok(lines(found.stdout));
  }
  return found.stderr === '' ? ok([]) : err(gitFailure('git grep', found));
}

function markerRefusal(marked: readonly string[]): string {
  return `${marked.join(', ')} still ${marked.length === 1 ? 'holds' : 'hold'} a conflict marker — resolve by union (both sides kept in time order, the later updated date wins), then pnpm profile:sync push`;
}

/**
 * During a merge, refuse a document the merge touches that still holds a
 * conflict marker. It runs before staging: staging would mark the path
 * resolved, and the record of the conflict would be lost.
 *
 * @param run - the git runner bound to the root
 * @param paths - the profile's document paths about to be staged
 * @returns whether a merge is in progress, or the refusal naming each marked document
 */
export function mergeGuard(run: GitRunner, paths: readonly string[]): Result<boolean, string> {
  const inMerge = merging(run);
  if (!inMerge.ok || !inMerge.value) {
    return inMerge;
  }
  const merged = mergedDocuments(run, paths);
  if (!merged.ok) {
    return merged;
  }
  const marked = markedDocuments(run, merged.value);
  if (!marked.ok) {
    return marked;
  }
  return marked.value.length > 0 ? err(markerRefusal(marked.value)) : ok(true);
}

/**
 * After staging the documents during a merge, refuse any path git still
 * holds unmerged: one outside the documents, which a push never stages. The
 * operator resolves it in the profile root, as for any other git furniture.
 *
 * @param run - the git runner bound to the root
 * @returns nothing, or the refusal naming each unmerged path and the cure
 */
export function unmergedRefusal(run: GitRunner): Result<void, string> {
  const unmerged = run(['diff', '--name-only', '--diff-filter=U']);
  if (!unmerged.ok) {
    return err(gitFailure('git diff', unmerged));
  }
  const paths = lines(unmerged.stdout);
  if (paths.length === 0) {
    return ok(undefined);
  }
  return err(
    `${paths.join(', ')} ${paths.length === 1 ? 'is' : 'are'} still unmerged outside the profile documents — in the profile root resolve each and git add -- <path>, then pnpm profile:sync push`,
  );
}
