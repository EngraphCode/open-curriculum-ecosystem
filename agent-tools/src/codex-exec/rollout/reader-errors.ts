import { err, type Result } from '@oaknational/result';

import type { RolloutReadError } from './rollout-types.js';

export function invalid(line: number, reason: string): Result<void, RolloutReadError> {
  return err({ kind: 'invalid-record', line, reason });
}

export function order(line: number, reason: string): Result<void, RolloutReadError> {
  return err({ kind: 'invalid-turn-order', line, reason });
}

export function unknown(line: number, recordType: string): Result<void, RolloutReadError> {
  return err({ kind: 'unknown-record-type', line, recordType });
}
