import { posix } from 'node:path';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  listRepoDirectory,
  readRepoBytes,
  readRepoDocument,
} from '../../src/collaboration-state/test-helpers/repo-doc.js';

/**
 * The Claude plugin's directory listing agrees with the files it restates.
 *
 * @remarks
 * MCP-760. The plugin directory reads the plugin folder as committed, so its
 * README and icon are copies of facts held elsewhere: the manifests, the MCP
 * config, the shipped skill folders and the canonical Oak logo. Each copy is
 * recomputed against its source here, so a change to one side fails until the
 * other follows — the same checked-copy approach as the ChatGPT package.
 *
 * ADR-078 helper-mediated committed-artefact reads.
 */

const PLUGIN_ROOT = 'claude/plugins/oak-national-academy';
const README_PATH = `${PLUGIN_ROOT}/README.md`;
const CLAUDE_MANIFEST_PATH = `${PLUGIN_ROOT}/.claude-plugin/plugin.json`;
const MCP_CONFIG_PATH = `${PLUGIN_ROOT}/.mcp.json`;
const CODEX_MANIFEST_PATH = 'chatgpt/plugins/oak-national-academy/.codex-plugin/plugin.json';
const CANONICAL_LOGO_PATH =
  'packages/design/oak-design-assets/assets/oak-national-academy-logo-512.png';
const SKILL_ROOTS = [`${PLUGIN_ROOT}/skills`, `${PLUGIN_ROOT}/workflows`] as const;

/**
 * The public repository the plugin directory lists the Claude plugin from.
 *
 * @remarks
 * This repository is too large for the directory to read, so each release is
 * copied to oaknational/oak-ai-plugins and listed from there. Nothing else in
 * this repository records that, so this test is the authority for the value.
 */
const PUBLISHED_REPOSITORY = 'https://github.com/oaknational/oak-ai-plugins';

/** The listing fields the plugin directory reads from the Claude manifest. */
const ClaudeManifestSchema = z.object({
  description: z.string().min(1),
  repository: z.literal(PUBLISHED_REPOSITORY),
  icon: z.string().startsWith('./'),
  privacyPolicyUrl: z.url(),
  termsOfServiceUrl: z.url(),
  supportUrl: z.url(),
  documentationUrl: z.url(),
});

const CodexManifestSchema = z.object({
  interface: z.object({ privacyPolicyURL: z.url(), termsOfServiceURL: z.url() }),
});

const McpConfigSchema = z.object({
  mcpServers: z.record(z.string(), z.object({ url: z.url() })),
});

async function readJson(repoRelativePath: string): Promise<unknown> {
  return JSON.parse(await readRepoDocument(repoRelativePath));
}

/** The first paragraph after the README's title. */
function openingParagraph(readme: string): string | undefined {
  return /^# .+\n\n(.+)\n/.exec(readme)?.[1];
}

/** The targets of Markdown links whose text mentions privacy. */
function privacyLinks(readme: string): string[] {
  return [...readme.matchAll(/\[([^\]]*privacy[^\]]*)\]\(([^)]+)\)/gi)].map((m) => m[2] ?? '');
}

/** Every MCP endpoint URL the README names. */
function mcpUrls(readme: string): string[] {
  return [...readme.matchAll(/https:\/\/[^\s)>]+\/mcp\b/g)].map((m) => m[0]);
}

/** The skill names in the README's table, one per row that opens with a code span. */
function tabledSkills(readme: string): string[] {
  return [...readme.matchAll(/^\| `([a-z0-9-]+)`/gm)].map((m) => m[1] ?? '');
}

async function listShippedSkills(): Promise<string[]> {
  const perRoot = await Promise.all(SKILL_ROOTS.map((root) => listRepoDirectory(root)));
  return perRoot
    .flat()
    .filter((entry) => entry.kind === 'directory')
    .map((entry) => entry.name);
}

const sorted = (values: readonly string[]) => [...values].sort((a, b) => a.localeCompare(b, 'en'));

describe('Claude plugin listing', () => {
  it('ships an icon byte-identical to the canonical Oak logo', async () => {
    const { icon } = ClaudeManifestSchema.parse(await readJson(CLAUDE_MANIFEST_PATH));
    const iconPath = posix.join(PLUGIN_ROOT, icon);
    const [iconBytes, canonical] = await Promise.all([
      readRepoBytes(iconPath),
      readRepoBytes(CANONICAL_LOGO_PATH),
    ]);

    expect(canonical.length, 'the canonical logo is empty').toBeGreaterThan(0);
    expect(
      iconBytes.equals(canonical),
      `${iconPath} has drifted from ${CANONICAL_LOGO_PATH}; copy the canonical file over it`,
    ).toBe(true);
  });

  it('links one privacy policy from both manifests and the README', async () => {
    const claude = ClaudeManifestSchema.parse(await readJson(CLAUDE_MANIFEST_PATH));
    const codex = CodexManifestSchema.parse(await readJson(CODEX_MANIFEST_PATH));
    const readme = await readRepoDocument(README_PATH);

    expect(codex.interface.privacyPolicyURL).toBe(claude.privacyPolicyUrl);
    expect(privacyLinks(readme)).toStrictEqual([claude.privacyPolicyUrl]);
  });

  it('links one terms of service from both manifests', async () => {
    const claude = ClaudeManifestSchema.parse(await readJson(CLAUDE_MANIFEST_PATH));
    const codex = CodexManifestSchema.parse(await readJson(CODEX_MANIFEST_PATH));

    expect(codex.interface.termsOfServiceURL).toBe(claude.termsOfServiceUrl);
  });

  it('names the public repository the directory lists the plugin from', async () => {
    const { repository } = ClaudeManifestSchema.parse(await readJson(CLAUDE_MANIFEST_PATH));

    expect(repository).toBe(PUBLISHED_REPOSITORY);
  });

  it('sets the support and documentation links the listing shows', async () => {
    const { supportUrl, documentationUrl } = ClaudeManifestSchema.parse(
      await readJson(CLAUDE_MANIFEST_PATH),
    );

    expect(new URL(supportUrl).protocol).toBe('https:');
    expect(new URL(documentationUrl).protocol).toBe('https:');
  });

  it('names the MCP endpoints the plugin declares, and no others', async () => {
    const config = McpConfigSchema.parse(await readJson(MCP_CONFIG_PATH));
    const declared = Object.values(config.mcpServers).map((server) => server.url);
    const readme = await readRepoDocument(README_PATH);

    expect(declared.length, 'the plugin declares no MCP servers').toBeGreaterThan(0);
    expect(sorted(mcpUrls(readme))).toStrictEqual(sorted(declared));
  });

  it('opens the README with the manifest description, word for word', async () => {
    const { description } = ClaudeManifestSchema.parse(await readJson(CLAUDE_MANIFEST_PATH));
    const readme = await readRepoDocument(README_PATH);

    expect(openingParagraph(readme)).toBe(description);
  });

  it('tables exactly the skills the plugin ships', async () => {
    const shipped = await listShippedSkills();
    const readme = await readRepoDocument(README_PATH);

    expect(shipped.length, 'no shipped skills found').toBeGreaterThan(0);
    expect(sorted(tabledSkills(readme))).toStrictEqual(sorted(shipped));
  });
});
