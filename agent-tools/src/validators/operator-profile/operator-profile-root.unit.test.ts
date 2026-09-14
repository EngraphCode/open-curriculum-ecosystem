import { unwrap } from '@oaknational/result';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { existingProfilePaths, readProfileReport } from './operator-profile-root.js';
import {
  makeProfileRootFixture,
  type ProfileRootFixture,
} from './test-helpers/profile-root-fixture.js';

/**
 * The IO layer against a temporary root the fixture owns: which document
 * paths a push may stage, and the check's information line for a present
 * profile that is not a repository. Nothing here touches a git repository.
 */
describe('existingProfilePaths and the non-repository sync line', () => {
  let fixture: ProfileRootFixture;

  beforeEach(async () => {
    fixture = await makeProfileRootFixture();
  });

  afterEach(async () => {
    await fixture.remove();
  });

  it('lists only the document paths that exist, so a minimal profile can be pushed', async () => {
    await fixture.addFile('index.md');
    await fixture.addDirectory('machines');
    expect(unwrap(await existingProfilePaths(fixture.root))).toEqual(['index.md', 'machines']);
  });

  it('reports a present profile that is not a repository as information in the check', async () => {
    expect(unwrap(await readProfileReport(fixture.root))).toEqual({
      documentCount: 0,
      failures: [],
      info: ['the profile is not a git repository (first-class; nothing to sync)'],
    });
  });
});
