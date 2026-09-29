/**
 * The graph half of the install-time closure: which workspace packages the
 * bootstrap's own package reaches, and the order the closure's members build
 * in. Pure, and importing nothing from the workspace, for the reason
 * `install-time-closure.ts` gives.
 *
 * @packageDocumentation
 */

/** A workspace package as the graph sees it. */
export interface GraphNode {
  readonly name: string;
  readonly dir: string;
  /** The workspace package names its manifest declares, in any dependency field. */
  readonly workspaceDeps: readonly string[];
}

/** A graph step's outcome; local for the reason the closure's verdict is (ADR-088). */
export type GraphVerdict<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

/**
 * Every package reachable from `rootName` over workspace edges, the root
 * included.
 *
 * @param rootName - The package the walk starts from.
 * @param nodes - Every workspace package, by name.
 * @returns The reached names, or an error naming a declared workspace
 * dependency that no workspace package names.
 */
export function reachableFrom(
  rootName: string,
  nodes: ReadonlyMap<string, GraphNode>,
): GraphVerdict<ReadonlySet<string>> {
  const reached = new Set<string>([rootName]);
  const pending = [rootName];
  for (let name = pending.pop(); name !== undefined; name = pending.pop()) {
    for (const dep of nodes.get(name)?.workspaceDeps ?? []) {
      if (!nodes.has(dep)) {
        return {
          ok: false,
          error: `${name} declares workspace dependency ${dep}, which no workspace package names`,
        };
      }
      if (!reached.has(dep)) {
        reached.add(dep);
        pending.push(dep);
      }
    }
  }
  return { ok: true, value: reached };
}

/**
 * The members in build order: each builds after every member it reaches,
 * through any workspace package, with ties broken by name so the order never
 * depends on how the workspace was read. A cycle among members is refused,
 * because no build order exists for it. A cycle among packages that are not
 * members builds nothing, and pnpm allows one, so it is not refused.
 *
 * @param members - The closure's member names.
 * @param nodes - Every workspace package, by name.
 * @returns The members in build order, or an error naming the members caught
 * in a cycle.
 */
export function orderMembers(
  members: readonly string[],
  nodes: ReadonlyMap<string, GraphNode>,
): GraphVerdict<readonly string[]> {
  const memberSet = new Set(members);
  const waitingOn = new Map(
    members.map((name) => [name, membersReachedFrom(name, memberSet, nodes)] as const),
  );
  const ordered: string[] = [];
  while (waitingOn.size > 0) {
    const next = [...waitingOn]
      .filter(([, deps]) => deps.size === 0)
      .map(([name]) => name)
      .sort(byName)[0];
    if (next === undefined) {
      const caught = [...waitingOn.keys()].sort(byName).join(', ');
      return {
        ok: false,
        error: `workspace dependency cycle among install-time members: ${caught}`,
      };
    }
    ordered.push(next);
    waitingOn.delete(next);
    for (const deps of waitingOn.values()) {
      deps.delete(next);
    }
  }
  return { ok: true, value: ordered };
}

/**
 * The members `start` reaches through any workspace package. `start` itself is
 * among them only when a path leads back to it, which is how a cycle shows.
 */
function membersReachedFrom(
  start: string,
  memberSet: ReadonlySet<string>,
  nodes: ReadonlyMap<string, GraphNode>,
): Set<string> {
  const found = new Set<string>();
  const seen = new Set<string>();
  const pending = [...(nodes.get(start)?.workspaceDeps ?? [])];
  for (let name = pending.pop(); name !== undefined; name = pending.pop()) {
    if (!seen.has(name)) {
      seen.add(name);
      if (memberSet.has(name)) {
        found.add(name);
      }
      pending.push(...(nodes.get(name)?.workspaceDeps ?? []));
    }
  }
  return found;
}

/** UTF-16 code-unit order: the same on every machine, whatever its locale. */
function byName(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  return left > right ? 1 : 0;
}
