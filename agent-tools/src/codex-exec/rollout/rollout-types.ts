import type { ThreadId } from '../envelope.js';
import type { RecordedTurnContext } from './record-shapes.js';

/** Harness evidence needed by the probe's policy and output verdicts. */
export interface RolloutEvidence {
  readonly threadId: ThreadId;
  readonly turns: readonly [RecordedTurnContext, RecordedTurnContext];
  /** Output text from resumed rollout records, including program-emitted code-mode content. */
  readonly resumedOutputTexts: readonly string[];
}

/** Closed reasons a rollout cannot support a pass verdict. */
export type RolloutReadError =
  | { readonly kind: 'invalid-json'; readonly line: number }
  | { readonly kind: 'unknown-record-type'; readonly line: number; readonly recordType: string }
  | { readonly kind: 'invalid-record'; readonly line: number; readonly reason: string }
  | { readonly kind: 'truncated-output'; readonly line: number }
  | { readonly kind: 'invalid-turn-order'; readonly line: number; readonly reason: string }
  | { readonly kind: 'invalid-turn-count'; readonly count: number }
  | { readonly kind: 'invalid-session-count'; readonly count: number };
