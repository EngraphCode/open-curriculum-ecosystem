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
    ['a full semver reduced to its major', 'claude-code/2.1.226', 'claude-code/2'],
    ['a two-digit major kept whole', 'claude-code/12.0.1 (cli)', 'claude-code/12 (cli)'],
    ['a product token with no version', 'claude-code (cli)', 'claude-code (cli)'],
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
    ['a non-numeric version omitted', 'claude-code/raw-version (cli)', 'claude-code (cli)'],
    [
      'a three-digit major omitted rather than truncated',
      'claude-code/100.0.1 (cli)',
      'claude-code (cli)',
    ],
    [
      'a numeric installation id in the version slot omitted, never truncated',
      'claude-code/8123456789012345 (cli)',
      'claude-code (cli)',
    ],
    ['a fullwidth-digit version omitted', 'claude-code/２.1 (cli)', 'claude-code (cli)'],
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
