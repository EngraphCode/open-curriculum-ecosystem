/**
 * The terminal not-found refusal: the end of the route chain.
 *
 * @remarks
 * Without it Express's own final handler answers an unmatched path with an
 * HTML "Cannot GET" document, and this host serves no HTML over HTTP (owner
 * ruling, 2026-08-20). The refusal is the last middleware, never an error:
 * `/` and every other unmatched path still have no route; this answers
 * them itself and calls nothing onward, so a missing route reaches neither
 * Sentry nor the enriched error logger, and it is mounted after every
 * route so a route's own error still does. The body takes the shape of this
 * host's other refusals (`{ error }` as JSON). Express sends no body for
 * HEAD.
 */

import type { Express, Request, Response } from 'express';

/** The body every unmatched path receives. */
const NOT_FOUND_BODY = { error: 'Not found' } as const;

/** Mounts the refusal; call it after the last route and before the error handlers. */
export function mountNotFound(app: Express): void {
  app.use((_req: Request, res: Response): void => {
    res.status(404).json(NOT_FOUND_BODY);
  });
}
