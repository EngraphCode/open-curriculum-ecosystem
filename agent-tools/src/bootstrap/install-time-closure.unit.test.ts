import { describe, expect, it } from 'vitest';

import { installTimeClosure, type InstallTimeClosureVerdict } from './install-time-closure.js';
import { type WorkspaceManifestInput } from './install-time-manifest.js';

const RECIPE = 'tsup && tsc --emitDeclarationOnly --project tsconfig.build.json';
const ROOT_DIR = 'tools';

interface PackageShape {
  readonly deps?: readonly string[];
  readonly devDeps?: readonly string[];
  readonly peerDeps?: readonly string[];
  readonly exports?: unknown;
  readonly main?: string;
  readonly types?: string;
  /** The build script; `null` declares none. */
  readonly build?: string | null;
}

const DIST_EXPORTS = { '.': { types: './dist/index.d.ts', import: './dist/index.js' } };

function workspaceRecord(names: readonly string[] | undefined) {
  return names === undefined
    ? undefined
    : Object.fromEntries(names.map((name) => [name, 'workspace:*']));
}

/** A workspace package; dist-only and built by the recipe unless the shape says otherwise. */
function pkg(dir: string, name: string, shape: PackageShape = {}): WorkspaceManifestInput {
  const build = shape.build === undefined ? RECIPE : shape.build;
  return {
    dir,
    manifest: {
      name,
      exports: shape.exports ?? DIST_EXPORTS,
      ...(shape.main === undefined ? {} : { main: shape.main }),
      ...(shape.types === undefined ? {} : { types: shape.types }),
      scripts: build === null ? {} : { build },
      dependencies: workspaceRecord(shape.deps),
      devDependencies: workspaceRecord(shape.devDeps),
      peerDependencies: workspaceRecord(shape.peerDeps),
    },
  };
}

/** The package running the bootstrap: its dependencies are where the closure starts. */
function root(shape: PackageShape): WorkspaceManifestInput {
  return pkg(ROOT_DIR, '@x/tools', { exports: { '.': './src/index.ts' }, ...shape });
}

function closure(inputs: readonly WorkspaceManifestInput[]): InstallTimeClosureVerdict {
  return installTimeClosure(inputs, { rootDir: ROOT_DIR, buildRecipe: RECIPE });
}

/** The verdict a closure of exactly these members, in this order, reads as. */
function members(...names: readonly string[]) {
  return { ok: true, value: names.map((name) => ({ name })) };
}

/** Assert the verdict is a refusal whose message names every one of these. */
function expectRefusalNaming(
  verdict: InstallTimeClosureVerdict,
  ...names: readonly string[]
): void {
  expect(verdict).toHaveProperty('ok', false);
  for (const name of names) {
    expect(verdict).toHaveProperty('error', expect.stringContaining(name));
  }
}

describe('installTimeClosure membership', () => {
  it('builds each reached dist-only package, witnessed by every dist file its entry points name', () => {
    const verdict = closure([
      root({ devDeps: ['@x/config'], deps: ['@x/result'] }),
      pkg('core/config', '@x/config', {
        exports: {
          './tsup': { types: './dist/tsup.base.d.ts', import: './dist/tsup.base.js' },
          './vitest': { import: './dist/vitest.base.js', default: './dist/vitest.base.js' },
          './fallback': ['./dist/fallback.js'],
        },
      }),
      pkg('core/result', '@x/result'),
    ]);

    expect(verdict).toStrictEqual({
      ok: true,
      value: [
        {
          dir: 'core/config',
          name: '@x/config',
          distArtifacts: ['tsup.base.d.ts', 'tsup.base.js', 'vitest.base.js', 'fallback.js'],
        },
        { dir: 'core/result', name: '@x/result', distArtifacts: ['index.d.ts', 'index.js'] },
      ],
    });
  });

  it('leaves out a dist-only package the root never reaches, however it is built', () => {
    const verdict = closure([
      root({ deps: ['@x/result'] }),
      pkg('core/result', '@x/result'),
      pkg('libs/graph', '@x/graph'),
      pkg('design/tokens', '@x/tokens', { build: 'tsx src/build.ts && tsup' }),
    ]);

    expect(verdict).toMatchObject(members('@x/result'));
  });

  it('follows workspace edges transitively, whichever dependency field declares them', () => {
    const verdict = closure([
      root({ deps: ['@x/result'] }),
      pkg('core/result', '@x/result', { devDeps: ['@x/config'], peerDeps: ['@x/peer'] }),
      pkg('core/config', '@x/config'),
      pkg('core/peer', '@x/peer'),
    ]);

    expect(verdict).toMatchObject(members('@x/config', '@x/peer', '@x/result'));
  });

  it('follows a workspace:^ range and neither follows nor refuses a registry range', () => {
    const verdict = closure([
      {
        dir: ROOT_DIR,
        manifest: {
          name: '@x/tools',
          exports: { '.': './src/index.ts' },
          dependencies: { '@x/result': 'workspace:^', zod: '^4.0.0' },
        },
      },
      pkg('core/result', '@x/result'),
    ]);

    expect(verdict).toMatchObject(members('@x/result'));
  });

  it('never makes the root a member, even with dist exports and a build the recipe is not', () => {
    const verdict = closure([
      root({ exports: DIST_EXPORTS, build: 'tsc -p tsconfig.build.json', deps: ['@x/result'] }),
      pkg('core/result', '@x/result'),
    ]);

    expect(verdict).toMatchObject(members('@x/result'));
  });

  it('reads dist/x and ./dist/x alike, in main and types as in exports', () => {
    const verdict = closure([
      root({ deps: ['@x/sdk'] }),
      pkg('sdks/sdk', '@x/sdk', { exports: {}, main: 'dist/index.js', types: 'dist/index.d.ts' }),
    ]);

    expect(verdict).toStrictEqual({
      ok: true,
      value: [{ dir: 'sdks/sdk', name: '@x/sdk', distArtifacts: ['index.js', 'index.d.ts'] }],
    });
  });

  it('witnesses only dist targets, skipping a package.json self-export and a null target', () => {
    const verdict = closure([
      root({ deps: ['@x/mixed'] }),
      pkg('core/mixed', '@x/mixed', {
        exports: {
          '.': { import: './dist/index.js' },
          './package.json': './package.json',
          './internal': null,
        },
      }),
    ]);

    expect(verdict).toStrictEqual({
      ok: true,
      value: [{ dir: 'core/mixed', name: '@x/mixed', distArtifacts: ['index.js'] }],
    });
  });

  it('leaves out a reached package whose entry points name no dist file', () => {
    const verdict = closure([
      root({ deps: ['@x/source', '@x/result'] }),
      pkg('libs/source', '@x/source', { exports: { '.': './src/index.ts' } }),
      pkg('core/result', '@x/result'),
    ]);

    expect(verdict).toMatchObject(members('@x/result'));
  });
});

describe('installTimeClosure order', () => {
  it('builds a package after the members it reaches, including through a non-member', () => {
    const verdict = closure([
      root({ deps: ['@x/app-lib'] }),
      pkg('libs/app-lib', '@x/app-lib', { deps: ['@x/bridge'] }),
      pkg('libs/bridge', '@x/bridge', {
        exports: { '.': './src/index.ts' },
        deps: ['@x/base'],
      }),
      pkg('core/base', '@x/base'),
    ]);

    expect(verdict).toMatchObject(members('@x/base', '@x/app-lib'));
  });

  it('builds the config base, then the lint plugin, then what devDepends on both, whatever the names', () => {
    const verdict = closure([
      root({ deps: ['@x/alpha'], devDeps: ['@x/plugin', '@x/zconfig'] }),
      pkg('core/alpha', '@x/alpha', { devDeps: ['@x/plugin', '@x/zconfig'] }),
      pkg('core/plugin', '@x/plugin', { devDeps: ['@x/zconfig'] }),
      pkg('core/zconfig', '@x/zconfig'),
    ]);

    expect(verdict).toMatchObject(members('@x/zconfig', '@x/plugin', '@x/alpha'));
  });

  it('breaks ties by name, never by the order the workspace was read in', () => {
    const verdict = closure([
      root({ deps: ['@x/zeta', '@x/alpha', '@x/mid'] }),
      pkg('core/zeta', '@x/zeta'),
      pkg('core/mid', '@x/mid'),
      pkg('core/alpha', '@x/alpha'),
    ]);

    expect(verdict).toMatchObject(members('@x/alpha', '@x/mid', '@x/zeta'));
  });

  it('refuses a dependency cycle among members, naming them and the members waiting on them', () => {
    const verdict = closure([
      root({ deps: ['@x/a', '@x/c'] }),
      pkg('core/a', '@x/a', { devDeps: ['@x/b'] }),
      pkg('core/b', '@x/b', { devDeps: ['@x/a'] }),
      pkg('core/c', '@x/c', { devDeps: ['@x/a'] }),
    ]);

    expectRefusalNaming(verdict, '@x/a', '@x/b', '@x/c');
  });

  it('tolerates a cycle among packages that are not members, since none of them is built', () => {
    const verdict = closure([
      root({ deps: ['@x/app-lib'] }),
      pkg('libs/app-lib', '@x/app-lib', { deps: ['@x/left'] }),
      pkg('libs/left', '@x/left', { exports: { '.': './src/l.ts' }, devDeps: ['@x/right'] }),
      pkg('libs/right', '@x/right', { exports: { '.': './src/r.ts' }, devDeps: ['@x/left'] }),
    ]);

    expect(verdict).toMatchObject(members('@x/app-lib'));
  });
});

describe('installTimeClosure refusals', () => {
  it('refuses a workspace dependency no workspace manifest names, wherever it is declared', () => {
    const verdict = closure([
      root({ deps: ['@x/result'] }),
      pkg('core/result', '@x/result', { deps: ['@x/ghost'] }),
    ]);

    expectRefusalNaming(verdict, '@x/result', '@x/ghost');
  });

  it('refuses when no workspace package sits at the root directory', () => {
    const verdict = closure([pkg('core/result', '@x/result')]);

    expectRefusalNaming(verdict, ROOT_DIR);
  });

  it('refuses a manifest without a name, naming its file', () => {
    const verdict = closure([root({}), { dir: 'broken', manifest: { exports: {} } }]);

    expectRefusalNaming(verdict, 'broken/package.json');
  });

  it('refuses two workspace packages with the same name, naming both directories', () => {
    const verdict = closure([root({}), pkg('a/result', '@x/result'), pkg('b/result', '@x/result')]);

    expectRefusalNaming(verdict, '@x/result', 'a/result', 'b/result');
  });

  it.each([
    ['no build script', null],
    ['a build that stops short of the declarations', 'tsup'],
    ['a build of its own', 'tsx src/build.ts && tsup'],
  ])('refuses a member with %s, naming it', (_case, build) => {
    const verdict = closure([
      root({ deps: ['@x/tokens'] }),
      pkg('design/tokens', '@x/tokens', { build }),
    ]);

    expectRefusalNaming(verdict, '@x/tokens', 'design/tokens');
  });
});
