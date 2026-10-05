import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { spawnInheritedProcess } from '../src/repo-check/repo-check-runtime';

/**
 * The one sanctioned spawn-topology contract: how an inherited-stdio child's
 * end is reported. Real spawns of the running Node binary with `-e`, no git,
 * no global state (`process.execPath` passes through the trusted-target
 * resolver unchanged).
 */

describe('spawnInheritedProcess', () => {
  it('reports an exit status with no signal', async () => {
    await expect(
      spawnInheritedProcess(process.execPath, ['-e', 'process.exit(3)']),
    ).resolves.toStrictEqual({
      status: 3,
      signal: null,
    });
  });

  it('reports a signal death by its signal, with no status', async () => {
    await expect(
      spawnInheritedProcess(process.execPath, ['-e', 'process.kill(process.pid, "SIGTERM")']),
    ).resolves.toStrictEqual({ status: null, signal: 'SIGTERM' });
  });

  it('runs the child in the requested working directory', async () => {
    // The child compares real paths itself, since process.cwd() reports the
    // resolved path. The directory is this test's own, read from no ambient
    // environment.
    const cwd = fileURLToPath(new URL('.', import.meta.url));
    const probe =
      `const { realpathSync } = require('node:fs');` +
      `process.exit(realpathSync(process.cwd()) === realpathSync(${JSON.stringify(cwd)}) ? 0 : 5)`;
    await expect(
      spawnInheritedProcess(process.execPath, ['-e', probe], { cwd }),
    ).resolves.toStrictEqual({
      status: 0,
      signal: null,
    });
  });

  it('gives the child the extra environment variables it is handed', async () => {
    const probe = `process.exit(process.env.GATE_TOPOLOGY_PROBE === 'handed' ? 0 : 7)`;
    await expect(
      spawnInheritedProcess(process.execPath, ['-e', probe], {
        extraEnv: { GATE_TOPOLOGY_PROBE: 'handed' },
      }),
    ).resolves.toStrictEqual({ status: 0, signal: null });
  });

  it('hands the caller a kill for its group that ends the child by the signal it names', async () => {
    const blocked = 'setTimeout(() => process.exit(9), 30_000)';
    const answers: string[] = [];
    await expect(
      spawnInheritedProcess(process.execPath, ['-e', blocked], {
        processGroup: { onSpawn: (killGroup) => answers.push(killGroup('SIGHUP')) },
      }),
    ).resolves.toStrictEqual({ status: null, signal: 'SIGHUP' });
    expect(answers).toStrictEqual(['signalled']);
  });
});
