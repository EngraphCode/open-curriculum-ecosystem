import { request } from './test-helpers/loopback-request.js';
import { describe, it, expect, beforeEach } from 'vitest';
import type { Express } from 'express';
import type { Logger } from '@oaknational/logger';

import { createApp } from './application.js';
import { createFakeHttpObservability } from './test-helpers/observability-fakes.js';
import { createMockRuntimeConfig } from './test-helpers/auth-error-test-helpers.js';
import { getScratchStaticRoot } from './test-helpers/static-root-fixture.js';
import { createFakeLogger } from './test-helpers/logger-fakes.js';

/** What a browser sends on a document navigation. */
const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

/**
 * This host serves the MCP protocol and its assets. It serves no HTML over
 * HTTP — the MCP App widget is HTML, but it reaches a client as an MCP
 * resource, never as a document this app answers a browser with. That
 * distinction is the subject: this suite forbids the second, not the first.
 *
 * @remarks
 * Owner instruction, 2026-08-20: `mcp.thenational.academy` becomes ONLY the
 * MCP server; anything serving HTML for this product comes from
 * Oak-Web-Application instead. Until then the app answered `GET /` with a
 * rendered document and forked `GET /mcp` between that document and the
 * protocol, and `mcp-html-negotiation.integration.test.ts` described the
 * fork.
 *
 * This suite replaces it, and inherits the four cases from it whose subject
 * was never the document: the protocol refusals the fork sat in front of and
 * had to leave alone. Those cases are the reason this file is a replacement
 * rather than a deletion — in particular the HEAD-with-protocol-Accept case,
 * which is the estate's only pin on Express's HEAD-via-GET routing reaching
 * the 405 instead of the SSE leg that used to hang there (MCP-545).
 *
 * The rest is the new state stated positively, because "no HTML" is a claim
 * that has to be measurable to be kept: a future contributor mounting a
 * status page, an error page, or a directory index at `/` fails here.
 */
describe('the served surface carries no HTML (owner instruction 2026-08-20)', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createApp({
      staticRoot: await getScratchStaticRoot(),
      runtimeConfig: createMockRuntimeConfig({
        dangerouslyDisableAuth: true,
        env: { ALLOWED_HOSTS: 'localhost,127.0.0.1,::1' },
      }),
      observability: createFakeHttpObservability(),
      getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
    });
  });

  it('has no route at the root, so a browser navigation there is a 404', async () => {
    const res = await request(app).get('/').set('Host', 'localhost').accept(BROWSER_ACCEPT);

    expect(res.status).toBe(404);
  });

  it('answers a browser navigation to /mcp with the protocol gate, not a document', async () => {
    const res = await request(app).get('/mcp').set('Host', 'localhost').accept(BROWSER_ACCEPT);

    expect(res.status).toBe(406);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toStrictEqual({ error: 'Accept header must include text/event-stream' });
  });

  it('answers a HEAD navigation to /mcp the same way, with no body', async () => {
    const res = await request(app).head('/mcp').set('Host', 'localhost').accept(BROWSER_ACCEPT);

    expect(res.status).toBe(406);
    expect(res.text ?? '').toBe('');
  });

  it('serves no document at the root even to a client that asks for nothing else', async () => {
    // `Accept: text/html` exactly, with no wildcard to fall back on: the
    // narrowest possible request for a document, and there is none to give.
    const res = await request(app).get('/').set('Host', 'localhost').set('Accept', 'text/html');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toStrictEqual({ error: 'Not found' });
  });

  it('answers a browser navigation to a path it has no route for with the same refusal', async () => {
    // The root is one instance of the class: any unmatched path meets the
    // terminal not-found handler, never the framework's HTML document.
    const res = await request(app)
      .get('/no-such-path')
      .set('Host', 'localhost')
      .accept(BROWSER_ACCEPT);

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toStrictEqual({ error: 'Not found' });
  });

  it('answers a HEAD to an unmatched path with the refusal and no body', async () => {
    const res = await request(app)
      .head('/no-such-path')
      .set('Host', 'localhost')
      .accept(BROWSER_ACCEPT);

    expect(res.status).toBe(404);
    expect(res.text ?? '').toBe('');
  });

  /**
   * The protocol refusals the deleted negotiation suite sat in front of.
   *
   * @remarks
   * Their subject is the accept gate and the stream refusal, not the
   * document, so they moved here intact rather than dying with the fork they
   * bounded. Each also carries a "never HTML" assertion, which used to
   * discriminate the fork's two legs and now states this file's whole point.
   */
  describe('the protocol refusals are unchanged', () => {
    const STREAM_REFUSAL_BODY = {
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    };

    it('GET /mcp with text/event-stream draws the 405 stream refusal, never HTML', async () => {
      const res = await request(app)
        .get('/mcp')
        .set('Host', 'localhost')
        .set('Accept', 'text/event-stream');

      expect(res.status).toBe(405);
      expect(res.headers['allow']).toBe('POST');
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.headers['content-type']).not.toMatch(/text\/html/);
      expect(res.body).toStrictEqual(STREAM_REFUSAL_BODY);
    });

    it('GET /mcp with */* alone stays a 406 protocol refusal', async () => {
      const res = await request(app).get('/mcp').set('Host', 'localhost').set('Accept', '*/*');

      expect(res.status).toBe(406);
    });

    it('POST /mcp with a browser Accept stays a 406 protocol refusal', async () => {
      const res = await request(app)
        .post('/mcp')
        .set('Host', 'localhost')
        .set('Accept', 'text/html')
        .send({});

      expect(res.status).toBe(406);
    });

    it('HEAD /mcp with a protocol Accept draws the 405 stream refusal with no body', async () => {
      // The accept gate requires application/json AND text/event-stream on
      // non-GET methods; this is the gate-passing shape that once rode
      // Express's HEAD-via-GET routing into the hanging SSE leg (MCP-545).
      const res = await request(app)
        .head('/mcp')
        .set('Host', 'localhost')
        .set('Accept', 'application/json, text/event-stream');

      expect(res.status).toBe(405);
      expect(res.headers['allow']).toBe('POST');
      expect(res.text ?? '').toBe('');
    });
  });
});

/**
 * The not-found refusal is the end of the route chain and nothing more: it
 * sits after every route, so a route's own error still reaches the error
 * logger, and it answers an unmatched path itself, so a missing route is
 * never logged as an error.
 */
describe('the not-found refusal ends the chain and is not an error', () => {
  const SECRET = 'no-html-suite-secret-0123456789';

  async function buildApp(log: Logger): Promise<Express> {
    return createApp({
      staticRoot: await getScratchStaticRoot(),
      runtimeConfig: createMockRuntimeConfig({
        dangerouslyDisableAuth: true,
        env: { ALLOWED_HOSTS: 'localhost,127.0.0.1,::1', TEST_ERROR_SECRET: SECRET },
      }),
      observability: createFakeHttpObservability(),
      logger: log,
      getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
    });
  }

  it('leaves an error a route forwards to the error logger', async () => {
    const log = createFakeLogger();
    const app = await buildApp(log);

    const res = await request(app)
      .post('/test-error?mode=unhandled&token=tok-order')
      .set('Host', 'localhost')
      .set('x-test-error-secret', SECRET)
      .send({});

    expect(res.status).toBe(500);
    expect(log.error).toHaveBeenCalledTimes(1);
  });

  it('logs nothing as an error for a path it has no route for', async () => {
    const log = createFakeLogger();
    const app = await buildApp(log);

    const res = await request(app).get('/no-such-path').set('Host', 'localhost');

    expect(res.status).toBe(404);
    expect(log.error).not.toHaveBeenCalled();
  });
});
