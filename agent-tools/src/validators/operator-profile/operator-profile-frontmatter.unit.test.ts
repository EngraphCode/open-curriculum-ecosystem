import { unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  PROFILE_FIXTURES,
  VALID_INDEX_DOCUMENT,
  VALID_MACHINE_DOCUMENT,
  VALID_SCOPE_DOCUMENT,
} from './operator-profile-fixtures.js';
import { parseOperatorProfileDocument } from './operator-profile-document.js';
import {
  deriveMachineKey,
  deriveScopeKey,
  findCredentialLikeLines,
  machineKeyFromRelPath,
  scopeKeyFromRelPath,
} from './operator-profile-keys.js';
import { classifyProfileEntries } from './operator-profile-layout.js';

function messagesOf(result: ReturnType<typeof parseOperatorProfileDocument>): readonly string[] {
  return result.ok ? [] : result.error;
}

const INDEX_POSITION = { relPath: 'index.md', expectedKind: 'index' } as const;
const SCOPE_POSITION = {
  relPath: 'repos/engraphcode--open-curriculum-ecosystem.md',
  expectedKind: 'scope',
  expectedKey: 'engraphcode--open-curriculum-ecosystem',
} as const;
const MACHINE_POSITION = {
  relPath: 'machines/studio-laptop.md',
  expectedKind: 'machine',
  expectedKey: 'studio-laptop',
} as const;

describe('parseOperatorProfileDocument', () => {
  it('accepts a conforming index document', () => {
    const parsed = unwrap(parseOperatorProfileDocument(INDEX_POSITION, VALID_INDEX_DOCUMENT));
    expect(parsed.frontmatter.kind).toBe('index');
    expect(parsed.frontmatter.ratified).toBe(false);
  });

  it('accepts a conforming scope document whose key matches its file name', () => {
    const parsed = unwrap(parseOperatorProfileDocument(SCOPE_POSITION, VALID_SCOPE_DOCUMENT));
    expect(parsed.frontmatter.kind).toBe('scope');
  });

  it('accepts a conforming machine document whose key matches its file name', () => {
    const parsed = unwrap(parseOperatorProfileDocument(MACHINE_POSITION, VALID_MACHINE_DOCUMENT));
    expect(parsed.frontmatter.kind).toBe('machine');
  });

  it.each(PROFILE_FIXTURES.filter((fixture) => !fixture.frontmatterValid))(
    'refuses the non-conforming fixture "$name" with a frontmatter message',
    (fixture) => {
      const result = parseOperatorProfileDocument(
        { relPath: fixture.relPath, expectedKind: fixture.kind },
        fixture.content,
      );
      expect(result.ok).toBe(false);
      expect(messagesOf(result).some((message) => message.startsWith('frontmatter'))).toBe(true);
    },
  );

  it('refuses a document with no frontmatter block', () => {
    const result = parseOperatorProfileDocument(INDEX_POSITION, '# Just prose\n');
    expect(messagesOf(result)).toEqual([
      'no YAML frontmatter block (every operator-profile document opens with one)',
    ]);
  });

  it('refuses a kind that contradicts the layout position', () => {
    const result = parseOperatorProfileDocument(INDEX_POSITION, VALID_SCOPE_DOCUMENT);
    expect(messagesOf(result)).toContain(
      'frontmatter kind is "scope" but the layout position requires "index"',
    );
  });

  it('refuses a scope key that disagrees with the file name', () => {
    const result = parseOperatorProfileDocument(
      { relPath: 'repos/other--repo.md', expectedKind: 'scope', expectedKey: 'other--repo' },
      VALID_SCOPE_DOCUMENT,
    );
    expect(messagesOf(result)).toContain(
      'frontmatter scope_key "engraphcode--open-curriculum-ecosystem" does not match the file name "other--repo"',
    );
  });

  it('refuses a machine key that disagrees with the file name', () => {
    const result = parseOperatorProfileDocument(
      { relPath: 'machines/other.md', expectedKind: 'machine', expectedKey: 'other' },
      VALID_MACHINE_DOCUMENT,
    );
    expect(messagesOf(result)).toContain(
      'frontmatter machine_key "studio-laptop" does not match the file name "other"',
    );
  });

  it('refuses an empty body', () => {
    const frontmatterOnly = `${VALID_INDEX_DOCUMENT.split('---\n\n')[0]}---\n`;
    const result = parseOperatorProfileDocument(INDEX_POSITION, frontmatterOnly);
    expect(messagesOf(result)).toContain('the body below the frontmatter is empty');
  });

  it('refuses credential-shaped lines by line number without echoing them', () => {
    const leaked = `${VALID_INDEX_DOCUMENT}\nA token: ghp_${'a'.repeat(30)}\n`;
    const messages = messagesOf(parseOperatorProfileDocument(INDEX_POSITION, leaked));
    expect(
      messages.some((message) => message.startsWith('credential-shaped content on line')),
    ).toBe(true);
    expect(messages.join('\n')).not.toContain('ghp_');
  });
});

describe('findCredentialLikeLines', () => {
  it('flags private-key headers, GitHub, OpenAI-style, Slack and AWS token shapes', () => {
    const content = [
      'clean line',
      '-----BEGIN RSA PRIVATE KEY-----',
      `github_pat_${'b'.repeat(24)}`,
      `sk-${'c'.repeat(20)}`,
      `xoxb-${'1'.repeat(12)}`,
      'AKIAABCDEFGHIJKLMNOP',
    ].join('\n');
    expect(findCredentialLikeLines(content)).toEqual([2, 3, 4, 5, 6]);
  });

  it('passes a key path, which names a location, not a credential', () => {
    expect(findCredentialLikeLines('key at ~/.config/el-graphael/private-key.pem')).toEqual([]);
  });
});

describe('deriveScopeKey', () => {
  it('derives owner--repository from https, scp-style and ssh remote forms', () => {
    expect(deriveScopeKey('https://github.com/EngraphCode/open-curriculum-ecosystem.git')).toBe(
      'engraphcode--open-curriculum-ecosystem',
    );
    expect(deriveScopeKey('git@github.com:oaknational/oak-open-curriculum-ecosystem.git')).toBe(
      'oaknational--oak-open-curriculum-ecosystem',
    );
    expect(deriveScopeKey('ssh://git@github.com/Owner/Repo')).toBe('owner--repo');
  });

  it('returns undefined when the URL does not name exactly owner and repository', () => {
    expect(deriveScopeKey('https://github.com/only-owner')).toBeUndefined();
    expect(deriveScopeKey('https://gitlab.example/group/sub/repo.git')).toBeUndefined();
    expect(deriveScopeKey('')).toBeUndefined();
  });
});

describe('key derivation from paths and host names', () => {
  it('reads the stem of repos/<key>.md and machines/<key>.md and nothing else', () => {
    expect(scopeKeyFromRelPath('repos/a--b.md')).toBe('a--b');
    expect(scopeKeyFromRelPath('index.md')).toBeUndefined();
    expect(scopeKeyFromRelPath('repos/nested/a--b.md')).toBeUndefined();
    expect(scopeKeyFromRelPath('repos/a--b.txt')).toBeUndefined();
    expect(machineKeyFromRelPath('machines/studio-laptop.md')).toBe('studio-laptop');
    expect(machineKeyFromRelPath('repos/studio-laptop.md')).toBeUndefined();
    expect(machineKeyFromRelPath('machines/nested/x.md')).toBeUndefined();
  });

  it('derives the lowercase short host name and refuses an unusable one', () => {
    expect(deriveMachineKey('Studio-Laptop.local')).toBe('studio-laptop');
    expect(deriveMachineKey('build01')).toBe('build01');
    expect(deriveMachineKey('')).toBeUndefined();
    expect(deriveMachineKey('-leading-dash')).toBeUndefined();
  });
});

describe('classifyProfileEntries', () => {
  it('maps the named layout to expectations, tolerates git furniture, and reports everything else', () => {
    const layout = classifyProfileEntries([
      { relPath: 'index.md', isDirectory: false },
      { relPath: '.git', isDirectory: true },
      { relPath: '.gitignore', isDirectory: false },
      { relPath: 'repos', isDirectory: true },
      { relPath: 'repos/engraphcode--open-curriculum-ecosystem.md', isDirectory: false },
      { relPath: 'machines', isDirectory: true },
      { relPath: 'machines/studio-laptop.md', isDirectory: false },
      { relPath: 'notes.md', isDirectory: false },
      { relPath: 'repos/stray.txt', isDirectory: false },
      { relPath: 'index.md.bak', isDirectory: false },
      { relPath: 'drafts', isDirectory: true },
    ]);
    expect(layout.documents).toEqual([INDEX_POSITION, SCOPE_POSITION, MACHINE_POSITION]);
    expect(layout.unexpected).toEqual(['notes.md', 'repos/stray.txt', 'index.md.bak', 'drafts']);
  });

  it('treats an empty root as a layout with nothing to validate', () => {
    expect(classifyProfileEntries([])).toEqual({ documents: [], unexpected: [] });
  });
});
