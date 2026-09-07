import { describe, expect, it } from 'vitest';

import { normaliseOakClientProduct } from './client-categories.js';
import { isOakClientUserAgent, normaliseOakClientUserAgent } from './client-user-agent.js';
import type { ClientIdentityHeaders } from './event-policy-contract.js';

/** A readable header container carrying exactly these values. */
function readable(...values: readonly unknown[]): ClientIdentityHeaders {
  return { readable: true, values };
}

/** A container the reader could not see into at all. */
const UNREADABLE: ClientIdentityHeaders = { readable: false };

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
      'claude-code/2.1.226 (cli)',
    ],
    ['the Claude connector (observed)', 'Claude-User', 'Claude-User'],
    [
      'Codex, keeping only the digits-and-dots version prefix (observed)',
      'codex-mcp-client/0.147.0-alpha.6.5',
      'codex-mcp-client/0.147.0',
    ],
    [
      'a Claude Code SDK build surface',
      'claude-code/2.1.226 (sdk-ts)',
      'claude-code/2.1.226 (sdk-ts)',
    ],
    [
      'a Claude Code VS Code build surface',
      'claude-code/2.1.226 (claude-vscode)',
      'claude-code/2.1.226 (claude-vscode)',
    ],
    [
      'a Claude Code desktop build surface',
      'claude-code/2.1.226 (claude-desktop)',
      'claude-code/2.1.226 (claude-desktop)',
    ],
    ['a version with no surface', 'claude-code/2.1.226', 'claude-code/2.1.226'],
    ['a product token with no version', 'claude-code (cli)', 'claude-code (cli)'],
    ['client casing folded to the observed spelling', 'CLAUDE-USER/1.0', 'Claude-User/1.0'],
    [
      'a version cut at the first non-version byte',
      'claude-code/2.1.226-rc1+build (cli)',
      'claude-code/2.1.226 (cli)',
    ],
    [
      'an unrecognised build surface omitted, never forwarded',
      'claude-code/2.1.226 (raw-host-name)',
      'claude-code/2.1.226',
    ],
    [
      'trailing free text omitted, never forwarded',
      'claude-code/2.1.226 (cli) raw-host-SENTINEL',
      'claude-code/2.1.226 (cli)',
    ],
    ['a non-numeric version omitted', 'claude-code/raw-version (cli)', 'claude-code (cli)'],
    ['an over-long version omitted', 'claude-code/12345678901234567.1 (cli)', 'claude-code (cli)'],
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

    expect(normaliseOakClientUserAgent(headers)).toBe('claude-code/2.1.226 (cli)');
    expect(normaliseOakClientProduct(headers)).toBe('claude_code');
  });

  it('never carries more bytes than the closed grammar allows', () => {
    const rebuilt = normaliseOakClientUserAgent(
      readable(`claude-code/2.1.226 (cli) ${'x'.repeat(4096)}`),
    );

    expect(rebuilt).toBe('claude-code/2.1.226 (cli)');
    expect(isOakClientUserAgent(rebuilt)).toBe(true);
  });
});

describe('isOakClientUserAgent', () => {
  it.each([
    'Claude-User',
    'Claude-User/1.0',
    'claude-code/2.1.226 (cli)',
    'codex-mcp-client/0.147.0',
    'claude-code (claude-desktop)',
  ])('accepts the rebuilt value %s', (value) => {
    expect(isOakClientUserAgent(value)).toBe(true);
  });

  it.each([
    ['a raw user agent with trailing text', 'claude-code/2.1.226 (cli) raw-host'],
    ['a client-cased product token', 'Claude-Code/2.1.226 (cli)'],
    ['an unlisted build surface', 'claude-code/2.1.226 (raw)'],
    ['a pre-release version', 'codex-mcp-client/0.147.0-alpha.6.5'],
    ['an unrecognised product', 'python-httpx/0.28.1'],
    ['a value over the length bound', `claude-code/${'1.'.repeat(40)}1`],
    ['a non-string', 7],
  ])('rejects %s', (_label, value) => {
    expect(isOakClientUserAgent(value)).toBe(false);
  });
});
