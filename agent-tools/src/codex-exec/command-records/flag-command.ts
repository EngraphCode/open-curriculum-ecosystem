import { SHAPES, type ForbiddenShape, type ShapeKind } from './forbidden-shapes.js';
import { basename } from '../../shell/interpreter-script.js';

import type { Command } from './shell-commands.js';

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
  /** The rule's own token (a cluster carrying the rule's letter reports that letter's option), or the subcommand: never a value. */
  readonly token: string;
}

const ASSIGNMENT = /^[A-Za-z_]\w*=/;
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
function afterWrapperOptions(segment: Command, from: number): number {
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
function programIndex(segment: Command): number {
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
function gitSubcommandIndex(segment: Command, from: number): number | undefined {
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
function placesOf(segment: Command): { program: number; subcommand: number | undefined } {
  const program = programIndex(segment);
  const isGit = basename(segment[program] ?? '') === 'git';
  return { program, subcommand: isGit ? gitSubcommandIndex(segment, program + 1) : undefined };
}

/** The rule token an option-shaped token matches: itself when it is one, the letter's option when a short-option cluster carries the shape's letter, else none. */
function optionToken(shape: ForbiddenShape, token: string): string | undefined {
  if (token.startsWith('-') && shape.tokens.includes(token)) {
    return token;
  }
  if (
    shape.clusterLetter !== undefined &&
    CLUSTER.test(token) &&
    token.includes(shape.clusterLetter)
  ) {
    return `-${shape.clusterLetter}`;
  }
  return undefined;
}

/** Whether a token is one of the shape's pathspec tokens (the whole tree, `.`). */
function matchesPathspec(shape: ForbiddenShape, token: string): boolean {
  return !token.startsWith('-') && shape.tokens.includes(token);
}

/** The shape's rule token in the arguments after the subcommand: an option before the first bare `--`, or a pathspec anywhere. */
function tokenOf(shape: ForbiddenShape, rest: readonly string[]): string | undefined {
  const dashes = rest.indexOf('--');
  const options = dashes === -1 ? rest : rest.slice(0, dashes);
  for (const candidate of options) {
    const token = optionToken(shape, candidate);
    if (token !== undefined) {
      return token;
    }
  }
  return rest.find((candidate) => matchesPathspec(shape, candidate));
}

/** The forbidden shape a git segment carries, at most one hit per segment. */
export function flagCommand(segment: Command): readonly Hit[] {
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

/** The flags a summary prints by name: the rules' own tokens and no other. */
const NAMED_FLAGS: ReadonlySet<string> = new Set(
  SHAPES.flatMap((shape) => shape.tokens.filter((token) => token.startsWith('-'))),
);

/** A token after the program: a rule's flag by name, any other long flag as `--<flag>`, any other short option or cluster as `-<flag>`, or nothing. */
function renderTrailing(token: string): string {
  if (token === '--') {
    return token;
  }
  const name = token.split('=')[0] ?? token;
  if (NAMED_FLAGS.has(name)) {
    return name;
  }
  if (token.startsWith('--')) {
    return '--<flag>';
  }
  return token.startsWith('-') && token.length > 1 ? '-<flag>' : '<arg>';
}

/**
 * A segment by allowlist: the program's basename, git's subcommand, the
 * rules' own flags by name, every other long flag as `--<flag>` and every
 * other short option or cluster as `-<flag>`, and `<arg>` for every other
 * token, including every token after a bare `--`. A value shaped like a flag
 * (a message beginning `-` or `--`) prints as a flag placeholder too. No
 * value, path, message, URL or letter of one that a seat typed is printed.
 */
export function renderSegment(segment: Command): string {
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
