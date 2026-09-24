import { ok, type Result } from '@oaknational/result';
import { isDeepStrictEqual } from 'node:util';

import {
  parseThreadSettings,
  parseTurnContext,
  type JsonRecord,
  type RecordedTurnContext,
} from './record-shapes.js';
import type { ReaderState } from './reader-state.js';
import { invalid, order, type RolloutReadError } from './rollout-types.js';

function settingsMatchContext(state: ReaderState, context: RecordedTurnContext): boolean {
  const comparable = {
    cwd: context.cwd,
    model: context.model,
    effort: context.effort,
    approvalsReviewer: context.approvalsReviewer,
    approvalPolicy: context.approvalPolicy,
    permissionProfile: context.permissionProfile,
    workspaceRoots: context.workspaceRoots,
  };
  return (
    state.resumedSettings.length > 0 &&
    state.resumedSettings.every((settings) => isDeepStrictEqual(settings, comparable))
  );
}

export function readContext(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  const context = parseTurnContext(payload);
  if (context === undefined) {
    return invalid(line, 'turn_context has an unknown or missing required field');
  }
  const active = state.active;
  if (active === undefined || active.complete || active.context !== undefined) {
    return order(line, 'turn_context has no active turn or is duplicated');
  }
  if (context.turnId !== active.turnId) {
    return order(line, 'turn_context turn id differs from task_started');
  }
  if (state.turns.length === 2 && !settingsMatchContext(state, context)) {
    return order(line, 'resumed turn_context differs from applied thread settings');
  }
  active.context = context;
  return ok(undefined);
}

export function readThreadSettings(
  payload: JsonRecord,
  state: ReaderState,
  line: number,
): Result<void, RolloutReadError> {
  if (payload['thread_id'] !== state.threadId) {
    return order(line, 'thread settings id differs from session_meta');
  }
  if (state.turns.length !== 1 || !state.active?.complete) {
    return order(line, 'thread settings were not applied between turns');
  }
  const settings = parseThreadSettings(payload['thread_settings']);
  if (settings === undefined) {
    return invalid(line, 'thread_settings_applied has unknown required settings');
  }
  state.resumedSettings.push(settings);
  return ok(undefined);
}
