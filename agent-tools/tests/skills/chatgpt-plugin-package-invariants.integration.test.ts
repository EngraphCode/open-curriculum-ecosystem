import { posix } from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

import { splitFrontmatter } from '../../src/collaboration-state/test-helpers/frontmatter.js';
import {
  listRepoDirectory,
  readRepoBytes,
  readRepoDocument,
} from '../../src/collaboration-state/test-helpers/repo-doc.js';

/**
 * The ChatGPT/Codex package's shipped invariants, recomputed from the tree.
 *
 * @remarks
 * MCP-692, MCP-766. `chatgpt/plugins/oak-national-academy/` is what OpenAI
 * ingests: since October its portal reads the whole package from one ZIP. This
 * suite recomputes the package's properties on every run: the Codex manifest
 * has exactly the shape the upload accepts (skills, the one Oak MCP server and
 * listing metadata; no hook or app), `interface.capabilities` is the value
 * that passed ingestion, the review block holds exactly the test cases the
 * portal requires and nothing that must stay out of a public repository, the
 * two manifests describe one product, and every shipped skill meets the
 * frontmatter contract exactly: the schema is strict, so a Claude-only field
 * (`argument-hint`, `skills`, `model`) the merge drops cannot return unnoticed.
 *
 * Learned from MCP-509: a guard that reads an absent value asserts nothing.
 * The manifest is parsed through a strict schema so a shape change fails
 * loudly, and the skill scan refuses an empty directory rather than passing
 * vacuously.
 *
 * ADR-078 helper-mediated committed-artefact reads.
 */

const PACKAGE_ROOT = 'chatgpt/plugins/oak-national-academy';
const CODEX_MANIFEST_PATH = `${PACKAGE_ROOT}/.codex-plugin/plugin.json`;
const CLAUDE_MANIFEST_PATH = 'claude/plugins/oak-national-academy/.claude-plugin/plugin.json';
const MCP_CONFIG_PATH = `${PACKAGE_ROOT}/.mcp.json`;
const CLAUDE_MCP_CONFIG_PATH = 'claude/plugins/oak-national-academy/.mcp.json';
const ICON_PATH = './assets/icon.png';
const CANONICAL_LOGO_PATH =
  'packages/design/oak-design-assets/assets/oak-national-academy-logo-512.png';
const SKILLS_ROOT = `${PACKAGE_ROOT}/skills`;

/** Agent Skills specification: the description a host routes on is at most 1024 characters. */
const MAX_DESCRIPTION_LENGTH = 1024;

/** Agent Skills specification: a skill name is kebab-case and at most 64 characters. */
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 64;

/** Agent Skills specification: the compatibility note is at most 500 characters. */
const MAX_COMPATIBILITY_LENGTH = 500;

/**
 * The fields the two manifests describe the same product with; they drift only by mistake.
 *
 * @remarks
 * Both packages are published from oaknational/oak-ai-plugins, so `repository`
 * is shared. `interface.longDescription` is not: it is the ChatGPT listing's
 * own text, where `description` stays the one line both manifests carry.
 */
const SharedManifestFieldsSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().min(1),
  author: z.object({ name: z.string().min(1), url: z.url() }),
  homepage: z.url(),
  repository: z.url(),
  license: z.string().min(1),
  keywords: z.array(z.string().min(1)).min(1),
});

/** OpenAI's directory categories (`plugin_category_unknown` names exactly these). */
const OPENAI_CATEGORIES = [
  'Productivity',
  'Creativity',
  'Developer Tools',
  'Business & Operations',
  'Data & Analytics',
  'Communication',
  'Education & Research',
  'Security',
  'Finance',
  'Healthcare',
  'Travel',
  'Entertainment',
  'Other',
] as const;

/** A positive review test case: a request the plugin should act on, and how. */
const PositiveTestCaseSchema = z
  .object({
    description: z.string().min(1),
    prompt: z.string().min(1),
    tools_triggered: z.string().min(1),
    expected_behavior: z.string().min(1),
  })
  .strict();

/** A negative review test case: a request the plugin should leave alone. */
const NegativeTestCaseSchema = z
  .object({
    description: z.string().min(1),
    prompt: z.string().min(1),
    expected_behavior: z.string().min(1),
  })
  .strict();

/**
 * The OpenAI review and publication block. Strict at every level: OpenAI
 * requires exactly five positive and three negative test cases, and the demo
 * video link and reviewer credentials belong in the portal's review form, never
 * in this public repository, so a `demo_recording_url` here fails the parse.
 */
const OpenAiExtensionsSchema = z
  .object({
    'com.openai': z
      .object({
        review: z
          .object({
            test_cases: z
              .object({
                positive: z.array(PositiveTestCaseSchema).length(5),
                negative: z.array(NegativeTestCaseSchema).length(3),
              })
              .strict(),
          })
          .strict(),
        publication: z.object({ release_notes: z.string().min(1) }).strict(),
      })
      .strict(),
  })
  .strict();

/**
 * The Codex manifest's complete shape. Strict: an unknown top-level key (such
 * as `hooks` or `apps`, which the portal cannot accept) fails the parse, so the
 * package cannot grow a declared surface without this test being revisited.
 */
const CodexManifestSchema = SharedManifestFieldsSchema.extend({
  skills: z.literal('./skills/'),
  mcpServers: z.literal('./.mcp.json'),
  interface: z
    .object({
      displayName: z.string().min(1),
      // The portal refuses a subtitle over 30 characters at submission.
      shortDescription: z.string().min(1).max(30),
      longDescription: z.string().min(1),
      developerName: z.string().min(1),
      category: z.enum(OPENAI_CATEGORIES),
      capabilities: z.array(z.unknown()),
      websiteURL: z.url(),
      privacyPolicyURL: z.url(),
      termsOfServiceURL: z.url(),
      supportURL: z.url(),
      defaultPrompt: z.array(z.string().min(1).max(128)).max(3),
      logo: z.literal(ICON_PATH),
      composerIcon: z.literal(ICON_PATH),
    })
    .strict(),
  extensions: OpenAiExtensionsSchema,
}).strict();

/** The package's MCP configuration: exactly one server, reached over HTTP. */
const McpConfigSchema = z
  .object({
    mcpServers: z.record(
      z.string().min(1),
      z.object({ type: z.string().min(1), url: z.url() }).strict(),
    ),
  })
  .strict();

/** Everything the package ships at its root, with each entry's kind; anything else is a packaging defect. */
const SHIPPED_ROOT_ENTRIES = [
  { name: '.codex-plugin', kind: 'directory' },
  { name: '.mcp.json', kind: 'file' },
  { name: 'README.md', kind: 'file' },
  { name: 'assets', kind: 'directory' },
  { name: 'skills', kind: 'directory' },
] as const;

const MARKETPLACE_PATH = '.agents/plugins/marketplace.json';

/**
 * The Codex local-marketplace file that `codex plugin marketplace add <repo root>`
 * reads: exactly one entry, pointing at this package, with the policy values
 * Codex's marketplace enum accepts (`codex-rs/core-plugins/src/marketplace.rs`).
 */
const MarketplaceSchema = z
  .object({
    name: z.string().min(1),
    interface: z.object({ displayName: z.string().min(1) }).strict(),
    plugins: z
      .array(
        z
          .object({
            name: z.string().min(1),
            source: z.object({ source: z.literal('local'), path: z.string().min(1) }).strict(),
            policy: z
              .object({
                installation: z.enum(['AVAILABLE', 'INSTALLED_BY_DEFAULT', 'NOT_AVAILABLE']),
                authentication: z.enum(['ON_INSTALL', 'ON_USE']),
              })
              .strict(),
            category: z.string().min(1),
          })
          .strict(),
      )
      .length(1),
  })
  .strict();

/**
 * The frontmatter a shipped skill carries (Agent Skills specification fields
 * only). Strict, so no host-specific field ships, and each field is held to the
 * constraint the specification's own reference validator enforces
 * (`.agents/skills/skill-creator/scripts/quick_validate.py`): a skill that
 * passes here is one a host will ingest. Description length has its own test,
 * which reports every offender rather than stopping at the first.
 */
const SkillFrontmatterSchema = z
  .object({
    name: z.string().min(1).max(MAX_NAME_LENGTH).regex(SKILL_NAME),
    description: z
      .string()
      .min(1)
      .refine((text) => !/[<>]/.test(text), {
        message: 'description must not contain angle brackets',
      }),
    license: z.string().min(1),
    compatibility: z.string().min(1).max(MAX_COMPATIBILITY_LENGTH).optional(),
    metadata: z.object({ author: z.string().min(1), version: z.string().min(1) }).strict(),
  })
  .strict();

async function readJson(repoRelativePath: string): Promise<unknown> {
  return JSON.parse(await readRepoDocument(repoRelativePath));
}

async function readCodexManifest() {
  return CodexManifestSchema.parse(await readJson(CODEX_MANIFEST_PATH));
}

/** The Claude manifest: the shared fields, plus the display name Codex carries inside `interface`. */
const ClaudeManifestSchema = SharedManifestFieldsSchema.extend({
  displayName: z.string().min(1),
});

async function readClaudeManifest() {
  return ClaudeManifestSchema.parse(await readJson(CLAUDE_MANIFEST_PATH));
}

/** The frontmatter block of a skill, parsed as YAML and checked against the contract. */
function parseSkillFrontmatter(skill: string, markdown: string) {
  const split = splitFrontmatter(markdown);
  expect(split, `${skill}/SKILL.md has no frontmatter block`).toBeDefined();
  return SkillFrontmatterSchema.parse(parseYaml(split?.frontmatter ?? ''));
}

/** Every entry under `skills/` must be a skill directory; anything else is a packaging defect. */
async function listShippedSkills(): Promise<readonly string[]> {
  const entries = await listRepoDirectory(SKILLS_ROOT);
  const strays = entries.filter((entry) => entry.kind !== 'directory').map((entry) => entry.name);
  expect(
    strays,
    `non-directory entries under ${SKILLS_ROOT} would be ingested as part of the package`,
  ).toStrictEqual([]);
  const skills = entries.map((entry) => entry.name);
  expect(
    skills,
    `${SKILLS_ROOT} holds no skills — this suite would otherwise pass vacuously`,
  ).not.toHaveLength(0);
  return skills;
}

describe('ChatGPT/Codex package invariants', () => {
  it('declares skills, the MCP config and listing metadata only, so the manifest names no hook or app', async () => {
    // A successful strict parse is the assertion: any other key, at any level, is rejected.
    const manifest = await readCodexManifest();

    expect(manifest.skills).toBe('./skills/');
    expect(manifest.mcpServers).toBe('./.mcp.json');
  });

  it('ships exactly the manifest, the MCP config, the README, the icon and the skills at its root, as real entries', async () => {
    const [root, manifestDir, assetsDir] = await Promise.all([
      listRepoDirectory(PACKAGE_ROOT),
      listRepoDirectory(`${PACKAGE_ROOT}/.codex-plugin`),
      listRepoDirectory(`${PACKAGE_ROOT}/assets`),
    ]);

    // Kinds are classified without following links, so a symlinked entry reads as "other" and fails here.
    expect(root).toStrictEqual(
      SHIPPED_ROOT_ENTRIES.map((entry) => ({ ...entry })).sort((a, b) =>
        a.name.localeCompare(b.name, 'en'),
      ),
    );
    expect(manifestDir).toStrictEqual([{ name: 'plugin.json', kind: 'file' }]);
    expect(assetsDir).toStrictEqual([{ name: 'icon.png', kind: 'file' }]);
  });

  it('binds the same Oak MCP server as the Claude plugin, under the same key, over streamable HTTP', async () => {
    const [codex, claude] = await Promise.all([
      readJson(MCP_CONFIG_PATH).then((json) => McpConfigSchema.parse(json)),
      readJson(CLAUDE_MCP_CONFIG_PATH).then((json) => McpConfigSchema.parse(json)),
    ]);
    const codexServers = Object.entries(codex.mcpServers);
    const claudeServers = Object.entries(claude.mcpServers);

    expect(codexServers).toHaveLength(1);
    expect(claudeServers).toHaveLength(1);
    const [codexKey, codexServer] = codexServers[0] ?? [];
    const [claudeKey, claudeServer] = claudeServers[0] ?? [];
    // Claude names the transport `http`; OpenAI's portable format names it `streamable-http`.
    expect(codexKey).toBe(claudeKey);
    expect(codexServer?.url).toBe(claudeServer?.url);
    expect(codexServer?.type).toBe('streamable-http');
  });

  it('ships an icon byte-identical to the canonical Oak logo', async () => {
    const iconPath = posix.join(PACKAGE_ROOT, ICON_PATH);
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

  it('is the one plugin the root marketplace file lists, under the manifest name, with a local path to this package', async () => {
    const marketplace = MarketplaceSchema.parse(await readJson(MARKETPLACE_PATH));
    const manifest = await readCodexManifest();
    const entry = marketplace.plugins[0];

    expect(entry?.name).toBe(manifest.name);
    expect(entry?.source.path).toBe(`./${PACKAGE_ROOT}`);
    // The shipped policy, not merely a value the enum accepts: NOT_AVAILABLE
    // would make the package uninstallable, and ON_INSTALL would ask for
    // authorisation before a tool is ever called.
    expect(entry?.policy).toStrictEqual({ installation: 'AVAILABLE', authentication: 'ON_USE' });
  });

  it('declares no capabilities, the value that passed OpenAI ingestion', async () => {
    const manifest = await readCodexManifest();

    expect(
      manifest.interface.capabilities,
      'capabilities: [] is the value the OpenAI sideload accepted on 2026-09-07 (package README); a non-empty value needs a fresh ingestion result recorded there, not removal of this assertion',
    ).toStrictEqual([]);
  });

  it('describes the same product as the Claude manifest, field for field', async () => {
    const codex = await readCodexManifest();
    const { displayName, ...shared } = await readClaudeManifest();

    expect(SharedManifestFieldsSchema.parse(codex)).toStrictEqual(shared);
    // The two hosts hold the same name in different places; nothing else compares them.
    expect(codex.interface.displayName).toBe(displayName);
  });

  it('gives every shipped skill a frontmatter name matching its directory', async () => {
    const skills = await listShippedSkills();

    const mismatched: string[] = [];
    for (const skill of skills) {
      const frontmatter = parseSkillFrontmatter(
        skill,
        await readRepoDocument(`${SKILLS_ROOT}/${skill}/SKILL.md`),
      );
      if (frontmatter.name !== skill) {
        mismatched.push(`${skill}: name is ${frontmatter.name}`);
      }
    }

    expect(mismatched).toStrictEqual([]);
  });

  it('keeps every shipped skill description within the routing limit', async () => {
    const skills = await listShippedSkills();

    const overLong: string[] = [];
    for (const skill of skills) {
      const frontmatter = parseSkillFrontmatter(
        skill,
        await readRepoDocument(`${SKILLS_ROOT}/${skill}/SKILL.md`),
      );
      if (frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
        overLong.push(`${skill}: ${frontmatter.description.length} characters`);
      }
    }

    expect(
      overLong,
      `descriptions must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
    ).toStrictEqual([]);
  });
});
