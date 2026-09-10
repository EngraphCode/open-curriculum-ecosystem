import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { request } from '../src/test-helpers/loopback-request.js';
import { createApp } from '../src/application.js';
import { parseSseEnvelope } from './helpers/sse.js';
import { createMockObservability, createMockRuntimeConfig } from './helpers/test-config.js';
import { getScratchStaticRoot } from '../src/test-helpers/static-root-fixture.js';

const ACCEPT = 'application/json, text/event-stream';
const SHARED_ALLOWED_HOSTS = 'localhost,127.0.0.1,::1';

/**
 * MCP-487 — the SERVED boundary, not the schema alone: a host whose bridge
 * sends numeric tool arguments as JSON strings gets the same answer as a
 * spec-compliant client, and the bound still bites for both encodings. The
 * app runs with the stub tool executor so no upstream call is made; the
 * MCP server validates the generated input schema before any handler runs.
 */
async function createStubApp() {
  const runtimeConfig = {
    ...createMockRuntimeConfig({
      dangerouslyDisableAuth: true,
      env: { ALLOWED_HOSTS: SHARED_ALLOWED_HOSTS },
    }),
    useStubTools: true,
  };
  const observability = createMockObservability(runtimeConfig);
  return await createApp({
    staticRoot: await getScratchStaticRoot(),
    runtimeConfig,
    observability,
    getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
    getLandingPageHtml: () =>
      '<!doctype html><html lang="en-GB"><body>test landing page</body></html>',
  });
}

async function callKeywords(app: Awaited<ReturnType<typeof createStubApp>>, limit: unknown) {
  const res = await request(app)
    .post('/mcp')
    .set('Accept', ACCEPT)
    .send({
      jsonrpc: '2.0',
      id: '1',
      method: 'tools/call',
      params: { name: 'get-keywords', arguments: { limit } },
    });
  expect(res.status).toBe(200);
  return parseSseEnvelope(res.text);
}

const ToolResultSchema = z.looseObject({ isError: z.boolean().optional() });

describe('string-encoded numbers at the served boundary (MCP-487)', () => {
  it('serves the bounded number schema for the get-keywords limit', async () => {
    const app = await createStubApp();
    const res = await request(app)
      .post('/mcp')
      .set('Accept', ACCEPT)
      .send({ jsonrpc: '2.0', id: '1', method: 'tools/list' });
    expect(res.status).toBe(200);
    const envelope = parseSseEnvelope(res.text);
    const ToolList = z.looseObject({
      tools: z.array(z.looseObject({ name: z.string(), inputSchema: z.unknown() })),
    });
    const list = ToolList.parse(envelope.result);
    const keywords = list.tools.find((t) => t.name === 'get-keywords');
    expect(keywords).toBeDefined();
    const LimitSchema = z.looseObject({
      properties: z.looseObject({
        limit: z.looseObject({ type: z.literal('number'), maximum: z.literal(300) }),
      }),
    });
    expect(LimitSchema.safeParse(keywords?.inputSchema).error?.message ?? 'conforms').toBe(
      'conforms',
    );
  });

  it('answers a decimal-string limit and a number limit identically', async () => {
    const app = await createStubApp();
    const asString = await callKeywords(app, '25');
    const asNumber = await callKeywords(app, 25);
    expect(asString.error).toBeUndefined();
    expect(asNumber.error).toBeUndefined();
    expect(ToolResultSchema.parse(asString.result).isError).not.toBe(true);
    expect(ToolResultSchema.parse(asNumber.result).isError).not.toBe(true);
    expect(asString.result).toEqual(asNumber.result);
  });

  it.each([['5000'], [5000]])(
    'refuses the out-of-bound limit %j before any handler runs',
    async (limit) => {
      const app = await createStubApp();
      const envelope = await callKeywords(app, limit);
      const refused =
        envelope.error !== undefined || ToolResultSchema.parse(envelope.result).isError === true;
      expect(refused).toBe(true);
    },
  );

  it.each([['abc'], [''], ['0x10'], ['Infinity'], [true]])(
    'refuses the non-decimal argument %j',
    async (limit) => {
      const app = await createStubApp();
      const envelope = await callKeywords(app, limit);
      const refused =
        envelope.error !== undefined || ToolResultSchema.parse(envelope.result).isError === true;
      expect(refused).toBe(true);
    },
  );
});
