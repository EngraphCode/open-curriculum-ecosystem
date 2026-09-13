/**
 * The widget address is a published contract, not a build artefact.
 *
 * Clients keep the widget address from the tool list they were given, and a
 * published plugin's tool metadata is fixed in its published snapshot, so the
 * server must keep answering at the one address it has advertised. Widget
 * changes ship as compatible content behind it (ADR-141, widget URI identity
 * amendment, MCP-489).
 *
 * Designed sentinel (testing-strategy, "Prove behaviour, never config or
 * content"): the value is pinned because a named decision attaches to it
 * changing. A failure here is a prompt to re-adjudicate that decision, never
 * to update the expectation to match.
 *
 * @see cross-domain-constants.ts — source of truth for widget constants
 */

import { describe, it, expect } from 'vitest';
import { BASE_WIDGET_URI } from './cross-domain-constants.js';

describe('BASE_WIDGET_URI', () => {
  it('is the published widget address', () => {
    expect(
      BASE_WIDGET_URI,
      'Serving a different widget address breaks every client holding an earlier tool ' +
        'list, and a published plugin needs a new reviewed version first. Re-adjudicate ' +
        'against ADR-141 (widget URI identity amendment, MCP-489) before changing this ' +
        'expectation; ship widget changes as compatible content behind the same address.',
    ).toBe('ui://widget/oak-curriculum-app.html');
  });
});
