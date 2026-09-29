import { describe, expect, it } from 'vitest';

import {
  installTimeClosure,
  type InstallTimeClosureVerdict,
  type WorkspaceManifestInput,
} from './install-time-closure.js';

const RECIPE = 'tsup && tsc --emitDeclarationOnly --project tsconfig.build.json';
const ROOT_DIR = 'tools';

interface PackageShape {
  readonly deps?: readonly string[];
  readonly devDeps?: readonly string[];
  readonly peerDeps?: readonly string[];
  readonly exports?: unknown;
  readonly main?: string;
  readonly build?: string;
}

const DIST_EXPORTS = { '.': { types: './dist/index.d.ts', import: './dist/index.js' } };

function workspaceRecord(names: readonly string[] | undefined) {
  return names === undefined
    ? undefined
    : Object.fromEntries(names.map((name) => [name, 'workspace:*']));
}

/** A workspace package; dist-only and built by the recipe unless the shape says otherwise. */
function pkg(dir: string, name: string, shape: PackageShape = {}): WorkspaceManifestInput {
  return {
    dir,
    manifest: {
      name,
      exports: shape.exports ?? DIST_EXPORTS,
      ...(shape.main === undefined ? {} : { main: shape.main }),
      scripts: { build: shape.build ?? RECIPE },
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

function namesOf(verdict: InstallTimeClosureVerdict): readonly string[] {
  if (!verdict.ok) {
    throw new Error(verdict.error);
  }
  return verdict.value.map((dep) => dep.name);
}

describe('installTimeClosure membership', () => {
  it('builds each reached dist-only package, witnessed by every dist file its entry points name', () => {
    const verdict = closure([
      root({ devDeps: ['@x/config'], deps: ['@x/result'] }),
      pkg('core/config', '@x/config', {
        exports: {
          './tsup': { types: './dist/tsup.base.d.ts', import: './dist/tsup.base.js' },
          './vitest': { import: './dist/vitest.base.js', default: './dist/vitest.base.js' },
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
          distArtifacts: ['tsup.base.d.ts', 'tsup.base.js', 'vitest.base.js'],
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

    expect(namesOf(verdict)).toStrictEqual(['@x/result']);
  });

  it('follows workspace edges transitively, whichever dependency field declares them', () => {
    const verdict = closure([
      root({ deps: ['@x/result'] }),
      pkg('core/result', '@x/result', { devDeps: ['@x/config'], peerDeps: ['@x/peer'] }),
      pkg('core/config', '@x/config'),
      pkg('core/peer', '@x/peer'),
    ]);

    expect(namesOf(verdict)).toStrictEqual(['@x/config', '@x/peer', '@x/result']);
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

    expect(namesOf(verdict)).toStrictEqual(['@x/result']);
  });

  it('never makes the root a member, even when its own exports resolve to dist', () => {
    const verdict = closure([
      root({ exports: DIST_EXPORTS, deps: ['@x/result'] }),
      pkg('core/result', '@x/result'),
    ]);

    expect(namesOf(verdict)).toStrictEqual(['@x/result']);
  });

  it('reads dist/x and ./dist/x alike', () => {
    const verdict = closure([
      root({ deps: ['@x/sdk'] }),
      pkg('sdks/sdk', '@x/sdk', { exports: {}, main: 'dist/index.js' }),
    ]);

    expect(verdict).toStrictEqual({
      ok: true,
      value: [{ dir: 'sdks/sdk', name: '@x/sdk', distArtifacts: ['index.js'] }],
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

    expect(namesOf(verdict)).toStrictEqual(['@x/result']);
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

    expect(namesOf(verdict)).toStrictEqual(['@x/base', '@x/app-lib']);
  });

  it('breaks ties by name, never by the order the workspace was read in', () => {
    const verdict = closure([
      root({ deps: ['@x/zeta', '@x/alpha', '@x/mid'] }),
      pkg('core/zeta', '@x/zeta'),
      pkg('core/mid', '@x/mid'),
      pkg('core/alpha', '@x/alpha'),
    ]);

    expect(namesOf(verdict)).toStrictEqual(['@x/alpha', '@x/mid', '@x/zeta']);
  });

  it('refuses a dependency cycle among members, naming them', () => {
    const verdict = closure([
      root({ deps: ['@x/a'] }),
      pkg('core/a', '@x/a', { devDeps: ['@x/b'] }),
      pkg('core/b', '@x/b', { devDeps: ['@x/a'] }),
    ]);

    expect(verdict).toStrictEqual({
      ok: false,
      error: 'workspace dependency cycle among install-time members: @x/a, @x/b',
    });
  });

  it('tolerates a cycle among packages that are not members, since none of them is built', () => {
    const verdict = closure([
      root({ deps: ['@x/app-lib'] }),
      pkg('libs/app-lib', '@x/app-lib', { deps: ['@x/left'] }),
      pkg('libs/left', '@x/left', { exports: { '.': './src/l.ts' }, devDeps: ['@x/right'] }),
      pkg('libs/right', '@x/right', { exports: { '.': './src/r.ts' }, devDeps: ['@x/left'] }),
    ]);

    expect(namesOf(verdict)).toStrictEqual(['@x/app-lib']);
  });
});

describe('installTimeClosure refusals', () => {
  it('refuses a declared workspace dependency that no workspace manifest names', () => {
    const verdict = closure([
      root({ deps: ['@x/result', '@x/ghost'] }),
      pkg('core/result', '@x/result'),
    ]);

    expect(verdict).toStrictEqual({
      ok: false,
      error: '@x/tools declares workspace dependency @x/ghost, which no workspace package names',
    });
  });

  it('refuses when no workspace package sits at the root directory', () => {
    const verdict = closure([pkg('core/result', '@x/result')]);

    expect(verdict).toStrictEqual({
      ok: false,
      error: 'no workspace package at tools, the package running the bootstrap',
    });
  });

  it('refuses a manifest without a name, naming its file', () => {
    const verdict = closure([root({}), { dir: 'broken', manifest: { exports: {} } }]);

    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.error).toMatch(/^broken\/package\.json is not a readable manifest/);
    }
  });

  it('refuses two workspace packages with the same name', () => {
    const verdict = closure([root({}), pkg('a/result', '@x/result'), pkg('b/result', '@x/result')]);

    expect(verdict).toStrictEqual({
      ok: false,
      error: 'two workspace packages are named @x/result: a/result and b/result',
    });
  });

  it('refuses a member whose build is not the recipe the bootstrap runs, naming it', () => {
    const verdict = closure([
      root({ deps: ['@x/tokens'] }),
      pkg('design/tokens', '@x/tokens', { build: 'tsx src/build.ts && tsup' }),
    ]);

    expect(verdict).toStrictEqual({
      ok: false,
      error:
        '@x/tokens (design/tokens) is an install-time member, but its build script is ' +
        `"tsx src/build.ts && tsup", not "${RECIPE}"; the bootstrap can only run that recipe`,
    });
  });
});
