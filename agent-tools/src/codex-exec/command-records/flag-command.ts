import { basename } from './shell-front-door.js';
import type { Segment } from './shell-segments.js';

/**
 * The forbidden shapes of `.codex/rules/seat-landing.rules`, matched against
 * one shell segment, and the allowlist rendering of a segment for a summary.
 *
 * Matching is wider than the harness's: the exec policy matches a rule's
 * pattern as a positional prefix, while this reader finds the program after
 * leading assignments and wrappers (`env`, `sudo`, `command`, `exec`, `nice`,
 * `time`), finds git's subcommand past its own options, and then matches the
 * rule's tokens anywhere after the subcommand, a short-option cluster
 * included (`git commit -F m --no-verify`, `git commit -an`). So a shape that
 * the policy would refuse is found even when it ran in a form the policy's
 * prefix never saw.
 *
 * The three shapes are the rules file's forbidden `prefix_rule`s, carried
 * here verbatim with their justifications. Pairing is by pattern: the rules
 * are anonymous. The consolidation validator asserting the file's forbidden
 * patterns equal this table is its own lane.
 */

/** One forbidden shape, named for the summary. */
export type ShapeKind =
  'stage-whole-tree' | 'commit-rewrites-or-skips-hooks' | 'push-outside-the-bot';

/** A shape found in a segment, with the token that matched. */
export interface Hit {
  readonly kind: ShapeKind;
  /** The rule's own token, a short-option cluster of letters, or the subcommand: never a value. */
  readonly token: string;
}

interface ForbiddenShape {
  readonly kind: ShapeKind;
  /** The rule's pattern: `git`, this subcommand, then any of `tokens`. */
  readonly subcommand: string;
  /** The rule's trailing alternatives; empty when the subcommand alone is the shape. */
  readonly tokens: readonly string[];
  /** The letter that carries one of `tokens` inside a short-option cluster such as `-an`. */
  readonly clusterLetter: string | undefined;
  /** The rule's justification, verbatim. */
  readonly justification: string;
}

const SHAPES: readonly ForbiddenShape[] = [
  {
    kind: 'stage-whole-tree',
    subcommand: 'add',
    tokens: ['-A', '--all', '.'],
    clusterLetter: 'A',
    justification: 'Stage by explicit pathspec, never the whole tree.',
  },
  {
    kind: 'commit-rewrites-or-skips-hooks',
    subcommand: 'commit',
    tokens: ['--amend', '--no-verify', '-n'],
    clusterLetter: 'n',
    justification: 'Never skip the hooks and never rewrite a commit: make a new commit instead.',
  },
  {
    kind: 'push-outside-the-bot',
    subcommand: 'push',
    tokens: [],
    clusterLetter: undefined,
    justification:
      'Push with `pnpm agent-tools merge-bot push --branch <branch>`, which refuses force and default branches.',
  },
];

const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;
const CLUSTER = /^-[A-Za-z]+$/;
const SUBCOMMAND = /^[a-z][a-z-]*$/;
const WRAPPERS: ReadonlySet<string> = new Set(['env', 'sudo', 'command', 'exec', 'nice', 'time']);
/** Wrapper options that take the next token as their value. */
const WRAPPER_VALUE_OPTIONS: ReadonlySet<string> = new Set([
  '-u',
  '-g',
  '-n',
  '-C',
  '--user',
  '--group',
  '--chdir',
  '--unset',
  '--adjustment',
]);
/** Shell reserved words that open a compound command in front of the program. */
const RESERVED_WORDS: ReadonlySet<string> = new Set([
  '{',
  '!',
  'if',
  'then',
  'elif',
  'else',
  'while',
  'until',
  'do',
]);
/** git options before the subcommand that take the next token as their value. */
const GIT_VALUE_OPTIONS: ReadonlySet<string> = new Set([
  '-C',
  '-c',
  '--git-dir',
  '--work-tree',
  '--namespace',
  '--exec-path',
]);

/** The index past a wrapper's own options. */
function afterWrapperOptions(segment: Segment, from: number): number {
  let index = from;
  while (index < segment.length) {
    const token = segment[index] ?? '';
    if (WRAPPER_VALUE_OPTIONS.has(token)) {
      index += 2;
    } else if (token.startsWith('-')) {
      index += 1;
    } else {
      break;
    }
  }
  return index;
}

/** The index of the program: past reserved words, leading assignments and wrappers with their options. */
function programIndex(segment: Segment): number {
  let index = 0;
  while (index < segment.length) {
    const token = segment[index] ?? '';
    if (RESERVED_WORDS.has(token) || ASSIGNMENT.test(token)) {
      index += 1;
    } else if (WRAPPERS.has(basename(token))) {
      index = afterWrapperOptions(segment, index + 1);
    } else {
      return index;
    }
  }
  return index;
}

/** The index of git's subcommand: the first token past git's options that is not an option. */
function gitSubcommandIndex(segment: Segment, from: number): number | undefined {
  let index = from;
  while (index < segment.length) {
    const token = segment[index] ?? '';
    if (GIT_VALUE_OPTIONS.has(token)) {
      index += 2;
    } else if (token.startsWith('-')) {
      index += 1;
    } else {
      return index;
    }
  }
  return undefined;
}

/** Where the segment's program and, for git, its subcommand sit. */
function placesOf(segment: Segment): { program: number; subcommand: number | undefined } {
  const program = programIndex(segment);
  const isGit = basename(segment[program] ?? '') === 'git';
  return { program, subcommand: isGit ? gitSubcommandIndex(segment, program + 1) : undefined };
}

function matches(shape: ForbiddenShape, token: string): boolean {
  if (shape.tokens.includes(token)) {
    return true;
  }
  return (
    shape.clusterLetter !== undefined && CLUSTER.test(token) && token.includes(shape.clusterLetter)
  );
}

/** The forbidden shape a git segment carries, at most one hit per segment. */
export function flagCommand(segment: Segment): readonly Hit[] {
  const { subcommand } = placesOf(segment);
  if (subcommand === undefined) {
    return [];
  }
  const name = segment[subcommand] ?? '';
  const shape = SHAPES.find((candidate) => candidate.subcommand === name);
  if (shape === undefined) {
    return [];
  }
  if (shape.tokens.length === 0) {
    return [{ kind: shape.kind, token: name }];
  }
  const token = segment.slice(subcommand + 1).find((candidate) => matches(shape, candidate));
  return token === undefined ? [] : [{ kind: shape.kind, token }];
}

/** The rule's justification for a shape, verbatim. */
export function justificationOf(kind: ShapeKind): string {
  return SHAPES.find((shape) => shape.kind === kind)?.justification ?? '';
}

/** A token before the program: an assignment's name, a wrapper's name, an option's letter, or nothing. */
function renderLeading(token: string): string {
  if (ASSIGNMENT.test(token)) {
    return `${token.slice(0, token.indexOf('=') + 1)}<value>`;
  }
  if (WRAPPERS.has(basename(token))) {
    return basename(token);
  }
  return token.startsWith('-') ? renderTrailing(token) : '<arg>';
}

/** A token after the program: a long flag's name, a short option's letter, or nothing. */
function renderTrailing(token: string): string {
  if (token.startsWith('--')) {
    return token.split('=')[0] ?? token;
  }
  return token.startsWith('-') && token.length > 1 ? token.slice(0, 2) : '<arg>';
}

/**
 * A segment by allowlist: the program's basename, git's subcommand, long flag
 * names left of `=`, short options as their letter alone, and `<arg>` for
 * every other token, including every token after a bare `--`. No value,
 * path, message or URL a seat typed is printed.
 */
export function renderSegment(segment: Segment): string {
  const { program, subcommand } = placesOf(segment);
  const dash = segment.indexOf('--', program + 1);
  const positional = dash === -1 ? segment.length : dash;
  return segment
    .map((token, index) => {
      if (index === subcommand) {
        return SUBCOMMAND.test(token) ? token : '<arg>';
      }
      if (index < program) {
        return renderLeading(token);
      }
      if (index === program) {
        return basename(token);
      }
      return index > positional ? '<arg>' : renderTrailing(token);
    })
    .join(' ');
}
