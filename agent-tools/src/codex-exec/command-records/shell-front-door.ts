/**
 * The shell front door: which argv is a shell running a script, and which of
 * its tokens is the script. `sh`, `bash` and `zsh` by basename; the script is
 * the first token past the shell's options once an option cluster carrying
 * `c` has been seen (`-c`, `-lc`, `-ec`, `-euo pipefail -c`). A shell handed a
 * script file (`bash deploy.sh`) announces no script and passes through.
 */

const SHELLS: ReadonlySet<string> = new Set(['sh', 'bash', 'zsh']);
/** A cluster of the shell's single-letter options; one carrying `c` announces a script. */
const OPTION_CLUSTER = /^-[A-Za-z]+$/;

/** The part of a path after its last slash. */
export function basename(token: string): string {
  const slash = token.lastIndexOf('/');
  return slash === -1 ? token : token.slice(slash + 1);
}

/** Where a shell's options end, and whether a cluster carrying `c` announced a script. */
function shellOptions(rest: readonly string[]): {
  readonly next: number;
  readonly announced: boolean;
} {
  let announced = false;
  let index = 0;
  while (index < rest.length) {
    const token = rest[index] ?? '';
    if (OPTION_CLUSTER.test(token)) {
      announced = announced || token.includes('c');
      // A cluster ending in `o` (`-o`, `-euo`) takes the next token as its value.
      index += token.endsWith('o') ? 2 : 1;
    } else if (token.startsWith('--')) {
      index += 1;
    } else {
      break;
    }
  }
  return { next: index, announced };
}

/**
 * The script an argv hands a shell, when the argv is a shell running one: the
 * first token past the shell's options, once an option cluster carrying `c`
 * has been seen (`-c`, `-lc`, `-ec`, `-euo pipefail -c`).
 */
export function scriptOf(argv: readonly string[]): string | undefined {
  const [program, ...rest] = argv;
  if (program === undefined || !SHELLS.has(basename(program))) {
    return undefined;
  }
  const { next, announced } = shellOptions(rest);
  return announced ? rest[next] : undefined;
}
