/**
 * The pure core of a Codex seat's wake companion: which comms events wake
 * the seat, and when a fixed notice may be queued into its thread. The
 * companion runs beside the seat, outside any Codex sandbox, so every
 * decision here is made on the seat's identity and on time alone, never on
 * an event's text. See the plan node `codex-queue-wake-bridge`.
 *
 * @packageDocumentation
 */
import { classifyEventForAgent } from './comms-relevant-events.js';
import type { CollaborationAgentId, CommsEvent } from './types.js';

/**
 * The events of one pass, parted by whether they wake the seat. Every event
 * lands in exactly one part, in the order it came.
 */
interface WakeSelection {
  /** Events addressed to the seat: they wake it once a notice is queued. */
  readonly wake: readonly string[];
  /** Events that never wake the seat, so the companion marks them at once. */
  readonly never: readonly string[];
}

/**
 * Part a pass's events into those that wake the seat and those that never
 * will. An event wakes the seat only when the canonical classifier puts it
 * in the seat's directed or group view, which excludes the seat's own
 * events, and it carries no heartbeat tag. Broadcasts, observed and
 * lifecycle events never wake.
 *
 * @param events - The events the pass examined, none yet marked.
 * @param self - The seat's identity, derived from its thread id.
 */
export function selectWakeEvents(
  events: readonly CommsEvent[],
  self: CollaborationAgentId,
): WakeSelection {
  const wake: string[] = [];
  const never: string[] = [];
  for (const event of events) {
    (wakesTheSeat(event, self) ? wake : never).push(event.event_id);
  }
  return { wake, never };
}

function wakesTheSeat(event: CommsEvent, self: CollaborationAgentId): boolean {
  const view = classifyEventForAgent({ event, self });
  return (view === 'directed' || view === 'group') && !isHeartbeat(event);
}

function isHeartbeat(event: CommsEvent): boolean {
  return event.tags?.includes('heartbeat') === true;
}
