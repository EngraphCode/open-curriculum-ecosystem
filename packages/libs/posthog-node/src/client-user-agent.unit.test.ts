import { describe, expect, it } from 'vitest';

import { CLIENT_PRODUCT_TOKEN_RULES, normaliseOakClientProduct } from './client-categories.js';
import { isOakClientUserAgent, normaliseOakClientUserAgent } from './client-user-agent.js';
import type { ClientIdentityHeaders } from './event-policy-contract.js';

/** A readable header container carrying exactly these values. */
function readable(...values: readonly unknown[]): ClientIdentityHeaders {
  return { readable: true, values };
}

/** A container the reader could not see into at all. */
const UNREADABLE: ClientIdentityHeaders = { readable: false };

const BUILD_SURFACES = ['cli', 'sdk-ts', 'claude-vscode', 'claude-desktop'] as const;

/**
 * PostHog's harness labelling for a user-agent-only event, transcribed from
 * `products/mcp_analytics/backend/mcp_harness.py` in PostHog/posthog (the
 * `_UA_PRODUCT` / `_UA_TOKEN` extraction and the label `multiIf`, at the commit
 * cited in ADR-218's 2026-09-07 amendment). It is the contract the rebuilt
 * value is shaped for, held here so a change to the shape is judged against the
 * label it will actually receive rather than against a guess. It is Oak's copy
 * of the vendor's rule, not the rule: a vendor change is caught by the
 * post-deploy check, never by this test.
 */
const POSTHOG_HARNESS_RULES: readonly (readonly [(token: string) => boolean, string])[] = [
  [(token) => token === 'claude-code claude-desktop', 'Claude Desktop'],
  [(token) => token === 'claude-code claude-vscode', 'Claude Code (VS Code)'],
  [(token) => token.startsWith('claude-code sdk'), 'Claude Agent SDK'],
  [(token) => token.startsWith('claude-code'), 'Claude Code'],
  [(token) => ['claude-ai', 'anthropic/claudeai', 'claude-user'].includes(token), 'Claude.ai'],
  [(token) => token.startsWith('codex'), 'OpenAI Codex'],
];

function postHogHarnessLabel(userAgent: string): string {
  const product = /^([^/]+)/u.exec(userAgent)?.[1] ?? '';
  const surface = /[(]([^,)]+)/u.exec(userAgent)?.[1] ?? '';
  const token = `${product} ${surface}`.trim().toLowerCase();
  return POSTHOG_HARNESS_RULES.find(([matches]) => matches(token))?.[1] ?? 'Other';
}

/**
 * MCP-687: the value PostHog's own harness column reads is REBUILT from closed
 * pieces, so every row here states the exact bytes that may leave the process.
 * The raw header is the input column; nothing else from it survives.
 */
describe('normaliseOakClientUserAgent', () => {
  it.each([
    [
      'Claude Code with its build surface (observed)',
      'claude-code/2.1.226 (cli)',
      'claude-code/2 (cli)',
    ],
    ['the Claude connector (observed)', 'Claude-User', 'Claude-User'],
    [
      'Codex, keeping only the major version (observed)',
      'codex-mcp-client/0.147.0-alpha.6.5',
      'codex-mcp-client/0',
    ],
    ['a Claude Code SDK build surface', 'claude-code/2.1.226 (sdk-ts)', 'claude-code/2 (sdk-ts)'],
    [
      'a Claude Code VS Code build surface',
      'claude-code/2.1.226 (claude-vscode)',
      'claude-code/2 (claude-vscode)',
    ],
    [
      'a Claude Code desktop build surface',
      'claude-code/2.1.226 (claude-desktop)',
      'claude-code/2 (claude-desktop)',
    ],
    [
      "PostHog's own documented SDK shape, with trailing comma-separated detail",
      'claude-code/2.1.0 (sdk-ts, agent-sdk/0.3)',
      'claude-code/2 (sdk-ts)',
    ],
    ['a full semver reduced to its major', 'claude-code/2.1.226', 'claude-code/2'],
    ['a two-digit major kept whole', 'claude-code/12.0.1 (cli)', 'claude-code/12 (cli)'],
    ['client casing folded to the observed spelling', 'CLAUDE-USER/1.0', 'Claude-User/1'],
    [
      'a pre-release suffix never reaching the value',
      'claude-code/2.1.226-rc1+build (cli)',
      'claude-code/2 (cli)',
    ],
    [
      'an unrecognised build surface omitted, never forwarded',
      'claude-code/2.1.226 (raw-host-name)',
      'claude-code/2',
    ],
    [
      'trailing free text omitted, never forwarded',
      'claude-code/2.1.226 (cli) raw-host-SENTINEL',
      'claude-code/2 (cli)',
    ],
    [
      'the first bracketed segment deciding the surface, never a later one',
      'claude-code/2.1.226 (raw) (cli)',
      'claude-code/2',
    ],
    // Without a version PostHog would read the bracket as part of the product,
    // so the surface is dropped with it and the value labels by product prefix.
    [
      'a product token with no version, its surface dropped too',
      'claude-code (cli)',
      'claude-code',
    ],
    [
      'a non-numeric version omitted, and its surface with it',
      'claude-code/raw (cli)',
      'claude-code',
    ],
    [
      'a three-digit major omitted rather than truncated',
      'claude-code/100.0.1 (cli)',
      'claude-code',
    ],
    [
      'a numeric installation id in the version slot omitted, never truncated',
      'claude-code/8123456789012345 (cli)',
      'claude-code',
    ],
    [
      'a zero-padded major omitted, so the slot holds exactly 0–99',
      'claude-code/01.2 (cli)',
      'claude-code',
    ],
    ['a doubled zero omitted for the same reason', 'claude-code/00 (cli)', 'claude-code'],
    ['a bare zero kept', 'claude-code/0.9 (cli)', 'claude-code/0 (cli)'],
    ['a fullwidth-digit version omitted', 'claude-code/２.1 (cli)', 'claude-code'],
    ['a homoglyph build surface omitted', 'claude-code/2.1.226 (ｃｌｉ)', 'claude-code/2'],
  ])('rebuilds %s', (_label, header, expected) => {
    expect(normaliseOakClientUserAgent(readable(header))).toBe(expected);
  });

  it.each([
    ['an unrecognised product', 'python-httpx/0.28.1'],
    ['a product name buried mid-string', 'RAW-SENTINEL Claude-User (claude-code/1.0)'],
    ['a product token adjoined by a hyphen at product granularity', 'claude-user-agent/1.0'],
    ['a non-string value', 42],
    ['an undefined value', undefined],
    ['an empty string', ''],
    ['an all-whitespace value', '   '],
    [
      'a product pushed past the scan window by padding, since no read exceeds it',
      `${' '.repeat(300)}claude-code/2 (cli)`,
    ],
  ])('omits the property for %s', (_label, header) => {
    expect(normaliseOakClientUserAgent(readable(header))).toBeUndefined();
  });

  it('omits the property when the header container is unreadable', () => {
    expect(normaliseOakClientUserAgent(UNREADABLE)).toBeUndefined();
  });

  it('takes the first header value that names a product, matching the product axis', () => {
    const headers = readable('anthropic-internal/1.0', 'claude-code/2.1.226 (cli)');

    expect(normaliseOakClientUserAgent(headers)).toBe('claude-code/2 (cli)');
    expect(normaliseOakClientProduct(headers)).toBe('claude_code');
  });

  it('never carries more bytes than the closed grammar allows', () => {
    const rebuilt = normaliseOakClientUserAgent(
      readable(`claude-code/2.1.226 (cli) ${'x'.repeat(4096)}`),
    );

    expect(rebuilt).toBe('claude-code/2 (cli)');
    expect(isOakClientUserAgent(rebuilt)).toBe(true);
  });
});

describe('the rebuilt value under PostHog harness labelling', () => {
  it.each([
    ['the Claude Code CLI (observed)', 'claude-code/2.1.226 (cli)', 'Claude Code'],
    ['the Claude connector (observed)', 'Claude-User', 'Claude.ai'],
    ['Codex (observed)', 'codex-mcp-client/0.147.0-alpha.6.5', 'OpenAI Codex'],
    ['the Claude Agent SDK', 'claude-code/2.1.0 (sdk-ts, agent-sdk/0.3)', 'Claude Agent SDK'],
    [
      'Claude Code in VS Code',
      'claude-code/2.1.0 (claude-vscode, agent-sdk/0.3)',
      'Claude Code (VS Code)',
    ],
    ['Claude Desktop', 'claude-code/2.1.0 (claude-desktop, agent-sdk/0.3)', 'Claude Desktop'],
    ['Claude Code with an unparseable version', 'claude-code/next (cli)', 'Claude Code'],
  ])('labels %s the same as the raw header would', (_label, header, expectedLabel) => {
    const rebuilt = normaliseOakClientUserAgent(readable(header));

    expect(rebuilt).toBeDefined();
    expect(postHogHarnessLabel(rebuilt ?? '')).toBe(expectedLabel);
    expect(postHogHarnessLabel(header)).toBe(expectedLabel);
  });
});

describe('isOakClientUserAgent', () => {
  // The relation the barrier depends on: whatever the table can produce, the
  // validator admits, and re-parsing a rebuilt value is the identity. A new
  // table row therefore cannot silently vanish at the barrier.
  it('admits every value the table, a major version and a build surface can produce', () => {
    for (const [token, , spelling] of CLIENT_PRODUCT_TOKEN_RULES) {
      for (const surface of BUILD_SURFACES) {
        for (const header of [
          `${token}/7.3.1 (${surface})`,
          `${token}/42 (${surface})`,
          `${token} (${surface})`,
          `${token}/7.3.1`,
          token,
        ]) {
          const rebuilt = normaliseOakClientUserAgent(readable(header));

          expect(rebuilt).toBeDefined();
          expect(rebuilt?.startsWith(spelling)).toBe(true);
          expect(isOakClientUserAgent(rebuilt)).toBe(true);
          expect(normaliseOakClientUserAgent(readable(rebuilt))).toBe(rebuilt);
        }
      }
    }
  });

  it.each([
    ['a full semver version', 'claude-code/2.1.226 (cli)'],
    ['a three-digit major', 'claude-code/123'],
    ['a zero-padded major', 'claude-code/01'],
    ['a doubled-zero major', 'claude-code/00'],
    ['a surface without a version', 'claude-code (claude-desktop)'],
    ['a raw user agent with trailing text', 'claude-code/2 (cli) raw-host'],
    ['a client-cased product token', 'Claude-Code/2 (cli)'],
    ['an unlisted build surface', 'claude-code/2 (raw)'],
    ['a pre-release version', 'codex-mcp-client/0.147.0-alpha.6.5'],
    ['an unrecognised product', 'python-httpx/0.28.1'],
    ['surrounding whitespace', ' claude-code/2 (cli)'],
    ['a non-string', 7],
    ['undefined', undefined],
  ])('rejects %s', (_label, value) => {
    expect(isOakClientUserAgent(value)).toBe(false);
  });
});
