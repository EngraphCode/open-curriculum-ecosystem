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
 *
 * The types are the narrowest the two functions read, so a test drives them
 * with a recording response and a recording app: no listener, no socket.
 */

/** What the refusal writes to: a status, then a JSON body. */
export interface RefusalResponse {
  status(code: number): { json(body: unknown): unknown };
}

/** Where the refusal is mounted: anything that takes a path-less handler. */
export interface RefusalMount {
  use(handler: (req: unknown, res: RefusalResponse) => void): unknown;
}

/** The body every unmatched path receives. */
const NOT_FOUND_BODY = { error: 'Not found' } as const;

/** Answers an unmatched request; two parameters, so it can never call onward. */
export function notFoundHandler(_req: unknown, res: RefusalResponse): void {
  res.status(404).json(NOT_FOUND_BODY);
}

/** Mounts the refusal; call it after the last route and before the error handlers. */
export function mountNotFound(app: RefusalMount): void {
  app.use(notFoundHandler);
}
