import { SHAPES, type ForbiddenShape, type ShapeKind } from './forbidden-shapes.js';
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
 * rule's tokens after the subcommand, a short-option cluster included
 * (`git commit -F m --no-verify`, `git commit -an`). So a shape that the
 * policy would refuse is found even when it ran in a form the policy's
 * prefix never saw. Git's grammar puts options before a bare `--` and
 * pathspecs after it, so an option-shaped token is matched before the first
 * bare `--` only (a pathspec literally named `-A` is a file), while the
 * whole-tree pathspec `.` is found on either side of it. The shapes
 * themselves live in the forbidden-shapes module.
 */

/** A shape found in a segment, with the token that matched. */
export interface Hit {
  readonly kind: ShapeKind;
  /** The rule's own token, a short-option cluster of letters, or the subcommand: never a value. */
  readonly token: string;
}

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

/** Whether a token is one of the shape's option tokens or a short-option cluster carrying its letter. */
function matchesOption(shape: ForbiddenShape, token: string): boolean {
  if (token.startsWith('-') && shape.tokens.includes(token)) {
    return true;
  }
  return (
    shape.clusterLetter !== undefined && CLUSTER.test(token) && token.includes(shape.clusterLetter)
  );
}

/** Whether a token is one of the shape's pathspec tokens (the whole tree, `.`). */
function matchesPathspec(shape: ForbiddenShape, token: string): boolean {
  return !token.startsWith('-') && shape.tokens.includes(token);
}

/** The shape's token in the arguments after the subcommand: an option before the first bare `--`, or a pathspec anywhere. */
function tokenOf(shape: ForbiddenShape, rest: readonly string[]): string | undefined {
  const dashes = rest.indexOf('--');
  const options = dashes === -1 ? rest : rest.slice(0, dashes);
  return (
    options.find((candidate) => matchesOption(shape, candidate)) ??
    rest.find((candidate) => matchesPathspec(shape, candidate))
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
  const token = tokenOf(shape, segment.slice(subcommand + 1));
  return token === undefined ? [] : [{ kind: shape.kind, token }];
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
