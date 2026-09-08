import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for the design-showcase demo (hub precedent).
 *
 * Component tests run under `happy-dom`; tests live beside the code they
 * prove, named by explicit convention (testing-strategy §Pattern 2).
 * Playwright specs under `tests/` are excluded — they run via `test:ui` /
 * `test:a11y`, never under vitest. No `globals`: tests import their vitest
 * API explicitly, so the type-checker sees exactly what the runtime
 * provides.
 *
 * Tests never do IO: happy-dom loads a `<link rel="stylesheet">` for real
 * by default, so a test that appends a link with any href fires an
 * unawaited fetch to the window's default origin (localhost port 3000)
 * whose refusal lands as an unhandled error at random. Stylesheet file
 * loading is therefore disabled for the whole unit suite; a link element
 * here is a DOM node and nothing more.
 */
export default defineConfig({
  test: {
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        settings: {
          disableCSSFileLoading: true,
        },
      },
    },
    setupFiles: ['./vitest.setup.ts'],
    include: ['{app,components,lib,tools}/**/*.{unit,integration}.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests', '**/*.e2e.test.ts'],
  },
});
