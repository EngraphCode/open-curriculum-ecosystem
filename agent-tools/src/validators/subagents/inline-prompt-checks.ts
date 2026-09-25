import path from 'node:path';

import { claudeAdapterScopeIssues, inlinePromptParityIssues } from './inline-prompt-parity.js';

/** The file access the inline-prompt checks need, supplied by the validator. */
interface InlinePromptFiles {
  readonly readText: (relPath: string) => Promise<string>;
  readonly exists: (relPath: string) => Promise<boolean>;
}

/**
 * Run both PDR-009 inline-prompt checks: every Claude adapter either points to
 * templates that exist or belongs to a role whose template has a System prompt section,
 * and every such template's block is copied into its Claude adapter verbatim.
 *
 * @returns Every issue found, in adapter order and then template order.
 */
export async function collectInlinePromptIssues(input: {
  readonly claudeWrapperFiles: readonly string[];
  readonly templateFiles: readonly string[];
  readonly claudeDir: string;
  readonly templateDir: string;
  readonly files: InlinePromptFiles;
}): Promise<readonly string[]> {
  const { files } = input;
  const readIfPresent = async (relPath: string): Promise<string | undefined> =>
    (await files.exists(relPath)) ? files.readText(relPath) : undefined;
  const knownTemplates: ReadonlySet<string> = new Set(input.templateFiles);
  const issues: string[] = [];

  for (const adapterPath of input.claudeWrapperFiles) {
    const templatePath = path.posix.join(input.templateDir, path.posix.basename(adapterPath));
    issues.push(
      ...claudeAdapterScopeIssues({
        adapterPath,
        adapter: await files.readText(adapterPath),
        templatePath,
        template: await readIfPresent(templatePath),
        knownTemplates,
      }),
    );
  }

  for (const templatePath of input.templateFiles) {
    const adapterPath = path.posix.join(input.claudeDir, path.posix.basename(templatePath));
    issues.push(
      ...inlinePromptParityIssues({
        templatePath,
        template: await files.readText(templatePath),
        adapterPath,
        adapter: await readIfPresent(adapterPath),
      }),
    );
  }

  return issues;
}
