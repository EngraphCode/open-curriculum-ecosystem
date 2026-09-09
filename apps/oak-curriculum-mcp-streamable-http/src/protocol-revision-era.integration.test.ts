/**
 * The protocol-revision era contract (MCP-644, ADR-228).
 *
 * This app implements the `2025-11-25` revision — a **legacy-era** server in
 * the vocabulary of the current `2026-07-28` revision, which moved the core
 * to per-request metadata and eliminated the `initialize` handshake.
 *
 * That is a safe place to stand only because of one specific behaviour, and
 * this suite is its tripwire. Per `2026-07-28` Streamable HTTP, Backward
 * Compatibility, a dual-era client that meets an HTTP `400` **inspects the
 * body before falling back**:
 *
 * "If the body contains a recognized modern JSON-RPC error, the server
 * speaks a modern version of MCP — retry using the advertised `supported`
 * versions or correct the request, rather than falling back. If the body is
 * empty or is not a recognized modern JSON-RPC error, fall back to
 * `initialize` and continue with the legacy version for subsequent
 * requests."
 *
 * So this app's refusal MUST NOT carry a recognized modern error code. The
 * versioning page's compatibility matrix then places it on the "Dual-era
 * client / Legacy server → Works" row, and production bears that out:
 * MCP-497 measured 754 refusals against 6,757 successful `initialize` calls
 * and 62,963 successful `tools/call` calls over the same 14 days — clients
 * negotiating down, not clients locked out.
 *
 * **What would break it.** If a future SDK release renumbered this refusal
 * to `-32022` (`UnsupportedProtocolVersionError`), dual-era clients would
 * stop falling back and start retrying versions this app's legacy lane
 * cannot serve. The refusal would look *more* spec-shaped and behave
 * *worse*. That regression is silent on every other gate, so it is asserted
 * here.
 *
 * These tests describe the served endpoint's answers, driven over loopback
 * HTTP through the production composition (`initializeCoreEndpoints` →
 * `createMcpHandler`), not the SDK in isolation.
 *
 * @see ADR-228 — the revision posture and the conditions for migrating
 * @see ADR-112 — the per-request transport this composition reuses
 */

import { request } from './test-helpers/loopback-request.js';
import { beforeAll, describe, expect, it } from 'vitest';
import express, { type Express } from 'express';
import { initializeCoreEndpoints } from './app/core-endpoints.js';
import { createMcpHandler } from './mcp-handler.js';
import { createFakeLogger, createFakeHttpObservability } from './test-helpers/fakes.js';
import { createMockRuntimeConfig } from './test-helpers/auth-error-test-helpers.js';

/**
 * JSON-RPC error codes the `2026-07-28` revision defines. A client that sees
 * any of these in a `400` body concludes the server speaks a modern revision
 * and does NOT fall back to `initialize`.
 */
const RECOGNISED_MODERN_ERROR_CODES = [
  -32020, // HeaderMismatch
  -32021, // MissingRequiredClientCapability
  -32022, // UnsupportedProtocolVersionError
];

/** The modern per-request `_meta` envelope, as the current revision defines it. */
const MODERN_META = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': { name: 'EraProbe', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': {},
};

const MCP_ACCEPT = 'application/json, text/event-stream';

describe('protocol-revision era contract (MCP-644)', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // The production composition: the real per-request factory behind the
    // real handler. Auth middleware is deliberately absent — this suite is
    // about protocol-era answers, and in production auth settles first
    // (ADR-113), which is why a wire probe of the deployed app cannot
    // measure any of this.
    const { mcpFactory } = initializeCoreEndpoints(
      app,
      {
        runtimeConfig: createMockRuntimeConfig(),
        observability: createFakeHttpObservability(),
        resourceUrl: 'https://probe.test/mcp',
        getWidgetHtml: () => '<!doctype html><html><body>test</body></html>',
      },
      createFakeLogger(),
    );
    const handler = createMcpHandler(mcpFactory, createFakeHttpObservability());
    app.post('/mcp', (req, res) => void handler(req, res));
  });

  it('refuses a modern-envelope server/discover without a recognised modern error code', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Accept', MCP_ACCEPT)
      .set('MCP-Protocol-Version', '2026-07-28')
      .set('Mcp-Method', 'server/discover')
      .send({
        jsonrpc: '2.0',
        id: 'discover-1',
        method: 'server/discover',
        params: { _meta: MODERN_META },
      });

    expect(res.status).toBe(400);
    // The load-bearing assertion: not a modern code, so a dual-era client
    // falls back to `initialize` rather than retrying modern versions.
    expect(RECOGNISED_MODERN_ERROR_CODES).not.toContain(res.body.error.code);
    // And the refusal still names what this server does speak, so the
    // fallback is informed rather than blind.
    expect(res.body.error.message).toContain('2025-11-25');
  });

  it('drives that refusal from the declared version, not the method — so no handler could answer server/discover', async () => {
    const discover = await request(app)
      .post('/mcp')
      .set('Accept', MCP_ACCEPT)
      .set('MCP-Protocol-Version', '2026-07-28')
      .set('Mcp-Method', 'server/discover')
      .send({ jsonrpc: '2.0', id: 'd', method: 'server/discover', params: { _meta: MODERN_META } });
    // CONTROL: a method this server certainly implements, at the same
    // declared version. An identical answer proves the transport rejects on
    // the version before any method dispatch — which is why registering a
    // `server/discover` handler on this SDK line would be unreachable code.
    const toolsList = await request(app)
      .post('/mcp')
      .set('Accept', MCP_ACCEPT)
      .set('MCP-Protocol-Version', '2026-07-28')
      .set('Mcp-Method', 'tools/list')
      .send({ jsonrpc: '2.0', id: 't', method: 'tools/list', params: { _meta: MODERN_META } });

    expect(toolsList.status).toBe(discover.status);
    expect(toolsList.body).toStrictEqual(discover.body);
  });

  it('has no server/discover handler at a version it does support', async () => {
    // CONTROL for the assertion above: with the version check passed, the
    // method itself is absent. Pins the 0-hit grep behind MCP-644 as a
    // served fact rather than a source-tree observation.
    const res = await request(app)
      .post('/mcp')
      .set('Accept', MCP_ACCEPT)
      .set('MCP-Protocol-Version', '2025-11-25')
      .set('Mcp-Method', 'server/discover')
      .send({ jsonrpc: '2.0', id: 'legacy-discover', method: 'server/discover', params: {} });

    expect(res.status).toBe(200);
    expect(res.text).toContain('-32601');
  });

  it('still negotiates the legacy revision through initialize — the lane clients fall back to', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Accept', MCP_ACCEPT)
      .send({
        jsonrpc: '2.0',
        id: 'init-1',
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'EraProbe', version: '1.0.0' },
        },
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain('"protocolVersion":"2025-11-25"');
  });
});
