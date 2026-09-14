import path from 'node:path';

import { err, ok, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { existingProfilePaths, type PresenceProbe } from './operator-profile-root.js';

// The probe is injected: nothing here touches a filesystem. The fake answers
// by the path's last segment, as the real probe answers by what is on disk.
const ROOT = path.join('profile-root');

type Present = Readonly<Record<string, 'directory' | 'not-a-directory'>>;

function probeOf(present: Present): PresenceProbe {
  return (target) => Promise.resolve(ok(present[path.basename(target)] ?? 'absent'));
}

describe('existingProfilePaths — the document paths a push may stage', () => {
  it('lists only the paths that exist, in layout order, so a minimal profile can be pushed', async () => {
    const probe = probeOf({ 'index.md': 'not-a-directory', machines: 'directory' });
    expect(unwrap(await existingProfilePaths(ROOT, probe))).toEqual(['index.md', 'machines']);
  });

  it('lists nothing for an empty root and everything for a full one', async () => {
    expect(unwrap(await existingProfilePaths(ROOT, probeOf({})))).toEqual([]);
    const full = probeOf({
      'index.md': 'not-a-directory',
      repos: 'directory',
      machines: 'directory',
    });
    expect(unwrap(await existingProfilePaths(ROOT, full))).toEqual([
      'index.md',
      'repos',
      'machines',
    ]);
  });

  it('reports an unreadable path as an error, never as absent', async () => {
    const probe: PresenceProbe = (target) =>
      Promise.resolve(
        path.basename(target) === 'repos' ? err(`cannot read ${target} (EACCES)`) : ok('absent'),
      );
    const result = await existingProfilePaths(ROOT, probe);
    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.error).toContain('EACCES');
  });
});
