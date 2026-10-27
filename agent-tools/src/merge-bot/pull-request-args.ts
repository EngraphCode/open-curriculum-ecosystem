import { err, map, ok, type Result } from '@oaknational/result';
import { typeSafeHasOwn } from '@oaknational/type-helpers';

import { printable } from '../pr-watch/printable.js';
import { isUrlSafeBranchName, readBranchArg, type BranchArgSeams } from './branch-arg.js';
import {
  PULL_REQUEST_VERBS,
  VALUE_FLAGS,
  type PullRequestRequest,
  type PullRequestVerb,
} from './pull-request-request.js';
import { PULL_REQUEST_USAGE } from './pull-request-usage.js';

/**
 * The argv contract for `merge-bot pull-request`: a closed grammar of six
 * verbs, each with its own closed flag set (`pull-request-request.ts`),
 * parsed to a typed request. Nothing the grammar does not name passes
 * through: an unknown verb or flag, a missing or repeated flag, a value
 * outside its grammar, each is a refusal that names what was expected and
 * carries the usage text.
 */

/** The flags read so far: each value flag's value, and whether `--json` was given. */
interface Collected {
  readonly values: ReadonlyMap<string, string>;
  readonly json: boolean;
}

function isVerb(value: string): value is PullRequestVerb {
  return typeSafeHasOwn(VALUE_FLAGS, value);
}

function usageError(message: string): Error {
  return new Error(`${message}\n${PULL_REQUEST_USAGE}`);
}

/** A value that reads as a flag is a forgotten argument, never a value anyone meant. */
function readsAsFlag(value: string): boolean {
  return value.startsWith('-');
}

/** One value flag's reading: an unknown flag, a repeat and a missing value each refuse. */
function readValue(
  verb: PullRequestVerb,
  flag: string,
  next: string | undefined,
  values: ReadonlyMap<string, string>,
): Result<string, Error> {
  const flags: readonly string[] = VALUE_FLAGS[verb];
  if (!flags.includes(flag)) {
    return err(
      usageError(
        `unknown argument "${printable(flag)}" for ${verb}; its flags are ${flags.join(', ')} and --json`,
      ),
    );
  }
  if (values.has(flag)) {
    return err(usageError(`${flag} given more than once — pass it exactly once`));
  }
  return next === undefined || readsAsFlag(next)
    ? err(usageError(`${flag} needs a value, got "${printable(next ?? '')}"`))
    : ok(next);
}

/** Walk the verb's argv: each flag once, each value flag with a value that is not a flag. */
function collectFlags(verb: PullRequestVerb, rest: readonly string[]): Result<Collected, Error> {
  const values = new Map<string, string>();
  let json = false;
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index] ?? '';
    if (flag === '--json') {
      if (json) {
        return err(usageError('--json given more than once — pass it exactly once'));
      }
      json = true;
      continue;
    }
    const value = readValue(verb, flag, rest[index + 1], values);
    if (!value.ok) {
      return value;
    }
    values.set(flag, value.value);
    index += 1;
  }
  return ok({ values, json });
}

/** The value a required flag was given, or the refusal naming it. */
function required(collected: Collected, flag: string): Result<string, Error> {
  const value = collected.values.get(flag);
  return value === undefined ? err(usageError(`${flag} is required`)) : ok(value);
}

const POSITIVE_INTEGER = /^[1-9][0-9]*$/;

/** A positive integer flag: a pull request number, a comment id, a limit. */
function positiveInteger(collected: Collected, flag: string): Result<number, Error> {
  const value = required(collected, flag);
  if (!value.ok) {
    return value;
  }
  return POSITIVE_INTEGER.test(value.value)
    ? ok(Number(value.value))
    : err(usageError(`${flag} needs a positive integer, got "${printable(value.value)}"`));
}

/** A flag whose value is text that must not be blank: a title, a file path. */
function nonBlank(collected: Collected, flag: string): Result<string, Error> {
  const value = required(collected, flag);
  if (!value.ok) {
    return value;
  }
  return value.value.trim() === '' ? err(usageError(`${flag} must not be empty`)) : value;
}

/** A GraphQL node id: the characters GitHub's ids are made of, and nothing else. */
const NODE_ID = /^[A-Za-z0-9_=-]+$/;

function nodeId(collected: Collected, flag: string): Result<string, Error> {
  const value = required(collected, flag);
  if (!value.ok) {
    return value;
  }
  return NODE_ID.test(value.value)
    ? value
    : err(usageError(`${flag} needs a GraphQL node id, got "${printable(value.value)}"`));
}

/**
 * The branch to open from: legal by git's own ref grammar (the oracle), and
 * URL-safe on top, since the name travels in a REST path and a query.
 */
function branchName(collected: Collected, seams: BranchArgSeams): Result<string, Error> {
  const value = required(collected, '--branch');
  if (!value.ok) {
    return value;
  }
  const legal = readBranchArg(undefined, value.value, seams, PULL_REQUEST_USAGE);
  if (!legal.ok) {
    return legal;
  }
  return isUrlSafeBranchName(legal.value)
    ? legal
    : err(
        usageError(
          `--branch "${printable(legal.value)}" holds characters outside ASCII letters, digits and . _ / -`,
        ),
      );
}

/** The `open` request: four required values. */
function openRequest(
  collected: Collected,
  seams: BranchArgSeams,
): Result<PullRequestRequest, Error> {
  const branch = branchName(collected, seams);
  if (!branch.ok) {
    return branch;
  }
  const title = nonBlank(collected, '--title');
  if (!title.ok) {
    return title;
  }
  const bodyFile = nonBlank(collected, '--body-file');
  if (!bodyFile.ok) {
    return bodyFile;
  }
  return map(positiveInteger(collected, '--wip-limit'), (wipLimit) => ({
    verb: 'open',
    branch: branch.value,
    title: title.value,
    bodyFile: bodyFile.value,
    wipLimit,
    json: collected.json,
  }));
}

/** A request on an existing pull request, built from its number and the verb's own flags. */
type ExistingBuilder = (pr: number, collected: Collected) => Result<PullRequestRequest, Error>;

/** The `reply` request's two flags beyond `--pr`. */
const replyRequest: ExistingBuilder = (pr, collected) => {
  const comment = positiveInteger(collected, '--comment');
  if (!comment.ok) {
    return comment;
  }
  return map(nonBlank(collected, '--body-file'), (bodyFile) => ({
    verb: 'reply',
    pr,
    comment: comment.value,
    bodyFile,
    json: collected.json,
  }));
};

/** The five verbs that act on an existing pull request, each from `--pr` and its own flags. */
const EXISTING_REQUESTS: Readonly<Record<Exclude<PullRequestVerb, 'open'>, ExistingBuilder>> = {
  comment: (pr, collected) =>
    map(nonBlank(collected, '--body-file'), (bodyFile) => ({
      verb: 'comment',
      pr,
      bodyFile,
      json: collected.json,
    })),
  reply: replyRequest,
  resolve: (pr, collected) =>
    map(nodeId(collected, '--thread'), (thread) => ({
      verb: 'resolve',
      pr,
      thread,
      json: collected.json,
    })),
  ready: (pr, collected) => ok({ verb: 'ready', pr, json: collected.json }),
  close: (pr, collected) =>
    map(nonBlank(collected, '--reason-file'), (reasonFile) => ({
      verb: 'close',
      pr,
      reasonFile,
      json: collected.json,
    })),
};

/**
 * Parse the argv after `pull-request` into a typed request.
 *
 * @param rest - The verb and its flags.
 * @param seams - The `--branch` check's oracle; the real git binary unless injected.
 */
export function parsePullRequestArgs(
  rest: readonly string[],
  seams: BranchArgSeams = {},
): Result<PullRequestRequest, Error> {
  const [verb, ...flags] = rest;
  if (verb === undefined || !isVerb(verb)) {
    return err(
      usageError(
        `${verb === undefined ? 'a verb is required' : `unknown verb "${printable(verb)}"`}; the verbs are ${PULL_REQUEST_VERBS.join(', ')}`,
      ),
    );
  }
  const collected = collectFlags(verb, flags);
  if (!collected.ok) {
    return collected;
  }
  if (verb === 'open') {
    return openRequest(collected.value, seams);
  }
  const pr = positiveInteger(collected.value, '--pr');
  return pr.ok ? EXISTING_REQUESTS[verb](pr.value, collected.value) : pr;
}
