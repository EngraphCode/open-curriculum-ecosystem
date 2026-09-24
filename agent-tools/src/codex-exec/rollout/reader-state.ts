import type { ThreadId } from '../envelope.js';
import type { RecordedThreadSettings, RecordedTurnContext } from './record-shapes.js';

/** Internal state while the two-turn JSONL stream is folded. */
export interface TurnState {
  readonly turnId: string;
  context?: RecordedTurnContext;
  complete: boolean;
  readonly pendingCallIds: Set<string>;
}

/** Internal accumulation; only RolloutEvidence crosses the public API. */
export interface ReaderState {
  threadId?: ThreadId;
  sessionCount: number;
  readonly turns: TurnState[];
  active?: TurnState;
  readonly outputTexts: string[];
  readonly resumedSettings: RecordedThreadSettings[];
}

/** The turn eligible to receive tool output, if one has a recorded context. */
export function activeTurnWithContext(state: ReaderState): TurnState | undefined {
  const active = state.active;
  return active !== undefined && !active.complete && active.context !== undefined
    ? active
    : undefined;
}
