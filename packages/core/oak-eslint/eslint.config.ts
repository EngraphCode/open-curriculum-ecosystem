import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver } from 'eslint-plugin-import-x';

import { POSTHOG_VENDOR_IMPORT_PATTERNS } from './src/rules/boundary.js';

export default defineConfig(
  {
    // Self-bootstrap ignores: the shared list cannot be imported here (see above),
    // so the entries that matter to this package are restated. The tsup entries
    // exclude the transient `tsup.config.bundled_<id>.mjs` that tsup writes and
    // deletes while bundling its config: `eslint .` enumerates it as a lint
    // target during a parallel turbo build and fails with ENOENT on the read
    // (CI runs 2026-09-03 #93 and 2026-09-10 #116). A file tsup owns is never
    // lint input.
    ignores: ['dist', 'node_modules', '**/*.d.ts', '**/tsup.config.*', '**/*.bundled_*.mjs'],
  },
  {
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: import.meta.dirname,
        }),
        createNodeResolver(),
      ],
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          defaultProject: 'tsconfig.eslint.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: POSTHOG_VENDOR_IMPORT_PATTERNS,
        },
      ],
      '@typescript-eslint/no-explicit-any': ['error'],
      '@typescript-eslint/no-deprecated': ['error'],
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'never',
        },
      ],
    },
  },
);
