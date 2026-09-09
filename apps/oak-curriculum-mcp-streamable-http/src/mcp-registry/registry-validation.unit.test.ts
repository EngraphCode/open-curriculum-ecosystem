import { describe, expect, it } from 'vitest';
import { unwrap, unwrapErr } from '@oaknational/result';
import {
  describeValidationFailure,
  readServedResource,
  readValidationVerdict,
} from './registry-validation.js';

describe('readValidationVerdict', () => {
  it('reads the acceptance the live registry returns for a well-formed document', () => {
    // The exact body observed from POST /v0.1/validate on 2026-09-09.
    expect(unwrap(readValidationVerdict({ valid: true, issues: [] }))).toEqual({
      valid: true,
      issues: [],
    });
  });

  it('reads a rejection with its issues', () => {
    // Also observed: an http:// remote returns exactly this shape.
    const verdict = unwrap(
      readValidationVerdict({
        valid: false,
        issues: [
          {
            type: 'semantic',
            path: 'remotes[0].url',
            message: 'invalid remote URL: http://mcp.thenational.academy/mcp',
            severity: 'error',
            reference: 'invalid-remote-url',
          },
        ],
      }),
    );

    expect(verdict.valid).toBe(false);
    expect(verdict.issues[0]?.path).toBe('remotes[0].url');
    expect(verdict.issues[0]?.reference).toBe('invalid-remote-url');
  });

  it('treats a missing issues array as no issues', () => {
    expect(unwrap(readValidationVerdict({ valid: true })).issues).toEqual([]);
  });

  it.each([
    { shape: 'a body with no verdict', body: { issues: [] } },
    { shape: 'a non-object body', body: 'ok' },
    { shape: 'a null body', body: null },
    { shape: 'a non-boolean verdict', body: { valid: 'yes' } },
    { shape: 'issues that are not a list', body: { valid: false, issues: 'lots' } },
  ])('refuses $shape rather than reading it as a pass', ({ body }) => {
    expect(unwrapErr(readValidationVerdict(body))).toContain('expected shape');
  });
});

describe('describeValidationFailure', () => {
  it('says nothing when the registry accepted the document', () => {
    expect(describeValidationFailure({ valid: true, issues: [] })).toBeUndefined();
  });

  it('names every issue when the registry rejected it', () => {
    const message = describeValidationFailure({
      valid: false,
      issues: [
        { severity: 'error', path: 'body.description', message: 'expected length <= 100' },
        { severity: 'warning', path: '$schema', message: 'schema-version-deprecated' },
      ],
    });

    expect(message).toContain('expected length <= 100');
    expect(message).toContain('schema-version-deprecated');
  });

  it('still fails loudly when a rejection names no issue', () => {
    expect(describeValidationFailure({ valid: false, issues: [] })).toContain('without naming');
  });
});

describe('readServedResource', () => {
  it('reads the resource the deployment publishes for itself', () => {
    // The exact body served by mcp.thenational.academy on 2026-09-09.
    expect(
      unwrap(
        readServedResource({
          resource: 'https://mcp.thenational.academy/mcp',
          authorization_servers: ['https://clerk.thenational.academy'],
          scopes_supported: ['email'],
        }),
      ),
    ).toBe('https://mcp.thenational.academy/mcp');
  });

  it.each([
    { shape: 'metadata with no resource', body: { authorization_servers: [] } },
    { shape: 'a non-string resource', body: { resource: 42 } },
    { shape: 'a non-object body', body: 'https://mcp.thenational.academy/mcp' },
  ])('refuses $shape', ({ body }) => {
    expect(unwrapErr(readServedResource(body))).toContain("no string 'resource'");
  });
});
