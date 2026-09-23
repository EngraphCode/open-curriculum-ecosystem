import { err, ok, type Result } from '@oaknational/result';

import {
  createTopLevelTomlBasicStringReader,
  type TopLevelTomlBasicStringReader,
} from '../core/toml-top-level-basic-string.js';

declare const threadIdBrand: unique symbol;

/**
 * A Codex thread id, known to be a lowercase UUID.
 *
 * `codex exec resume` also accepts thread names, so only a UUID-shaped value
 * may reach its argv; anything else could inject an option.
 */
export type ThreadId = string & { readonly [threadIdBrand]: true };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function isThreadId(value: string): value is ThreadId {
  return UUID_PATTERN.test(value);
}

/**
 * Accept a thread id only when it is a lowercase UUID of any version.
 */
export function parseThreadId(raw: string): Result<ThreadId, string> {
  return isThreadId(raw) ? ok(raw) : err('a thread id must be a lowercase UUID');
}

/**
 * The reasoning efforts the CLI accepts, as a closed set; an effort outside
 * it fails closed rather than reaching the argv.
 */
const REASONING_EFFORTS = [
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
  'ultra',
  'persistent',
] as const;

type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

/**
 * The owner's configured model and effort, carried into every dialogue call.
 * An absent key means the CLI default for that key.
 */
export interface ModelPins {
  readonly model?: string;
  readonly effort?: ReasoningEffort;
}

/**
 * Why the owner's configuration could not supply the model pins. It never
 * carries the configuration's text, which can hold secrets.
 */
export type ModelPinsError =
  { readonly kind: 'unparseable-config' } | { readonly kind: 'invalid-model-pin' };

const MODEL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

/**
 * Read `model` and `model_reasoning_effort` from the owner's Codex
 * configuration text, and nothing else from it.
 *
 * @param configText - The configuration file's text, or undefined when it does not exist.
 */
export function parseModelPins(configText: string | undefined): Result<ModelPins, ModelPinsError> {
  if (configText === undefined) {
    return ok({});
  }
  const reader = readConfigQuietly(configText);
  if (reader === undefined) {
    return err({ kind: 'unparseable-config' });
  }
  const model = readPin(reader, 'model', (value) =>
    MODEL_PATTERN.test(value) ? value : undefined,
  );
  const effort = readPin(reader, 'model_reasoning_effort', (value) =>
    REASONING_EFFORTS.find((candidate) => candidate === value),
  );
  if (!model.ok || !effort.ok) {
    return err({ kind: 'invalid-model-pin' });
  }
  return ok({
    ...(model.value === undefined ? {} : { model: model.value }),
    ...(effort.value === undefined ? {} : { effort: effort.value }),
  });
}

function readConfigQuietly(configText: string): TopLevelTomlBasicStringReader | undefined {
  try {
    return createTopLevelTomlBasicStringReader(configText);
  } catch {
    return undefined;
  }
}

/**
 * Read one optional top-level string key through a validator. A missing key
 * is no pin; a present key that is not a valid string fails closed.
 */
function readPin<T>(
  reader: TopLevelTomlBasicStringReader,
  key: string,
  validate: (value: string) => T | undefined,
): Result<T | undefined, 'invalid'> {
  const state = reader.inspect(key);
  if (state.kind === 'missing') {
    return ok(undefined);
  }
  const valid = state.kind === 'string' ? validate(state.value) : undefined;
  return valid === undefined ? err('invalid') : ok(valid);
}
