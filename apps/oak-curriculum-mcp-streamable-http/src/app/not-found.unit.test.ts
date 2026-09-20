import { describe, expect, it } from 'vitest';

import { mountNotFound, notFoundHandler, type RefusalResponse } from './not-found.js';

/**
 * The refusal is described through its handler, driven with a recording
 * response: no listener, no socket, no filesystem. That the framework's own
 * document no longer answers `GET /` was observed once at cure time through
 * the app's loopback suite and is recorded on the pull request, never
 * re-proven by a test.
 */
describe('the not-found refusal', () => {
  function recordingResponse(): RefusalResponse & {
    readonly statuses: number[];
    readonly bodies: unknown[];
  } {
    const statuses: number[] = [];
    const bodies: unknown[] = [];
    return {
      statuses,
      bodies,
      status(code: number) {
        statuses.push(code);
        return {
          json(body: unknown) {
            bodies.push(body);
            return undefined;
          },
        };
      },
    };
  }

  it('answers an unmatched request with 404 and the host refusal shape as JSON', () => {
    const res = recordingResponse();

    notFoundHandler({}, res);

    expect(res.statuses).toStrictEqual([404]);
    expect(res.bodies).toStrictEqual([{ error: 'Not found' }]);
  });

  it('takes no continuation, so it can never forward a missing route as an error', () => {
    expect(notFoundHandler.length).toBe(2);
  });

  it('mounts that one handler, path-less, on the app it is given', () => {
    const mounted: unknown[] = [];

    mountNotFound({
      use(handler) {
        mounted.push(handler);
      },
    });

    expect(mounted).toStrictEqual([notFoundHandler]);
  });
});
