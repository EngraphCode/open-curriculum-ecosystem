import { assert, describe, expect, it } from 'vitest';

import {
  baseMismatch,
  classifyCasOutcome,
  classifyRemoteReadback,
  classifyRemoteReread,
  decideRetirement,
  type PlannedDelete,
  type RetireDecision,
  type RetireReadings,
  type TipState,
} from './retire-decision.js';

/**
 * The retire decision: readings in, a refusal, "nothing to retire" or a
 * delete plan out. Written as relations over every combination of the three
 * names a branch can have, so no case is a hand-picked example.
 */

const BASE = { name: 'main', sha: '0'.repeat(39) + '1' };
const TIP_NAMES = ['local', 'tracking', 'remote'] as const;
type TipName = (typeof TIP_NAMES)[number];
type TipCase = 'absent' | 'merged' | 'unmerged';

const shaFor = (tip: TipName): string =>
  ({ local: 'a', tracking: 'b', remote: 'c' })[tip].repeat(40);

function tipState(tip: TipName, state: TipCase): TipState | undefined {
  return state === 'absent' ? undefined : { sha: shaFor(tip), onBase: state === 'merged' };
}

function readingsFor(states: Readonly<Record<TipName, TipCase>>): RetireReadings {
  return {
    branch: 'feat/x',
    base: BASE,
    local: tipState('local', states.local),
    tracking: tipState('tracking', states.tracking),
    remote: tipState('remote', states.remote),
    inUseBy: [],
    caseCollisions: [],
    symbolic: [],
  };
}

type TipStates = Readonly<Record<TipName, TipCase>>;

/** A refusal's reason; any other decision reads as a reason no assertion expects. */
const reasonOf = (decision: RetireDecision): string =>
  decision.kind === 'refused' ? decision.reason : `(not refused: ${decision.kind})`;

const CASES: readonly TipCase[] = ['absent', 'merged', 'unmerged'];

/** Every combination of the three names' cases: 27 rows. */
const COMBINATIONS: readonly TipStates[] = CASES.flatMap((local) =>
  CASES.flatMap((tracking) => CASES.map((remote) => ({ local, tracking, remote }))),
);

/** What each case plans for its tip: only a merged tip is planned, at the sha read. */
const PLANNED: Readonly<Record<TipCase, (tip: TipName) => { expectedSha: string } | undefined>> = {
  absent: () => undefined,
  merged: (tip) => ({ expectedSha: shaFor(tip) }),
  unmerged: () => undefined,
};

/** Every combination with exactly one tip off the default, with that tip's sha: the one the refusal names. */
const REFUSING = TIP_NAMES.flatMap((tip) =>
  COMBINATIONS.filter(
    (states) =>
      states[tip] === 'unmerged' &&
      TIP_NAMES.filter((other) => states[other] === 'unmerged').length === 1,
  ).map((states) => ({ states, sha: shaFor(tip) })),
);

/** Every combination with at least one name, all on the default, with the plan it must produce. */
const PLANNING = COMBINATIONS.filter(
  (states) =>
    TIP_NAMES.every((tip) => states[tip] !== 'unmerged') &&
    TIP_NAMES.some((tip) => states[tip] === 'merged'),
).map((states) => ({
  states,
  plan: {
    local: PLANNED[states.local]('local'),
    tracking: PLANNED[states.tracking]('tracking'),
    remote: PLANNED[states.remote]('remote'),
  },
}));

describe('decideRetirement over every combination of the three names', () => {
  it.each(REFUSING)(
    'refuses when a tip is off the default, naming it: $states',
    ({ states, sha }) => {
      expect(reasonOf(decideRetirement(readingsFor(states)))).toMatch(
        new RegExp(`${sha}.*main@${BASE.sha}`, 'u'),
      );
    },
  );

  it('names the local branch first when every tip is off the default', () => {
    const states = { local: 'unmerged', tracking: 'unmerged', remote: 'unmerged' } as const;

    expect(reasonOf(decideRetirement(readingsFor(states)))).toContain(shaFor('local'));
  });

  it.each(PLANNING)(
    'plans exactly the present names at the shas read: $states',
    ({ states, plan }) => {
      expect(decideRetirement(readingsFor(states))).toMatchObject({ kind: 'plan', plan });
    },
  );

  it('reports nothing to retire when the branch has no name anywhere', () => {
    expect(
      decideRetirement(readingsFor({ local: 'absent', tracking: 'absent', remote: 'absent' })),
    ).toEqual({ kind: 'absent' });
  });

  it('plans the refs by their exact full names', () => {
    const decision = decideRetirement(
      readingsFor({ local: 'merged', tracking: 'merged', remote: 'merged' }),
    );

    expect(decision).toMatchObject({
      kind: 'plan',
      plan: {
        local: { ref: 'refs/heads/feat/x' },
        tracking: { ref: 'refs/remotes/origin/feat/x' },
        remote: { ref: 'refs/heads/feat/x' },
      },
    });
  });
});

describe('decideRetirement refusals decided before the tips', () => {
  const merged = readingsFor({ local: 'merged', tracking: 'merged', remote: 'merged' });

  it.each(['main', 'Main', 'MAIN'])('refuses the default branch in any case: %s', (branch) => {
    expect(decideRetirement({ ...merged, branch })).toMatchObject({ kind: 'refused' });
  });

  it('reads the default branch from the remote, not from a fixed name', () => {
    const engraph = { ...merged, base: { name: 'engraph', sha: BASE.sha } };

    expect(decideRetirement({ ...engraph, branch: 'Engraph' }).kind).toBe('refused');
    expect(decideRetirement({ ...engraph, branch: 'main' }).kind).toBe('plan');
  });

  it.each([
    { field: 'symbolic', value: 'refs/heads/feat/x' },
    { field: 'caseCollisions', value: 'refs/heads/Feat/X' },
    { field: 'inUseBy', value: 'jcnet-wt-x' },
  ] as const)('refuses on $field, naming $value', ({ field, value }) => {
    expect(reasonOf(decideRetirement({ ...merged, [field]: [value] }))).toContain(value);
  });

  it('refuses a symbolic name with every tip absent (a dangling symbolic ref), never "nothing to retire"', () => {
    const dangling = {
      ...readingsFor({ local: 'absent', tracking: 'absent', remote: 'absent' }),
      symbolic: ['refs/heads/feat/x'],
    };

    expect(reasonOf(decideRetirement(dangling))).toContain('refs/heads/feat/x');
  });
});

/** The plan for a branch present only on the remote. */
function remoteOnly(): PlannedDelete {
  const planned = decideRetirement(
    readingsFor({ local: 'absent', tracking: 'absent', remote: 'merged' }),
  );
  assert(
    planned.kind === 'plan' && planned.plan.remote !== undefined,
    'the decision planned a remote delete',
  );
  return planned.plan.remote;
}

describe('classifyRemoteReread', () => {
  it('reads the proven sha as same, a missing ref as absent, and any other sha as moved', () => {
    const remote = remoteOnly();

    expect(classifyRemoteReread(remote, { kind: 'present', sha: remote.expectedSha })).toBe('same');
    expect(classifyRemoteReread(remote, { kind: 'absent' })).toBe('absent');
    expect(classifyRemoteReread(remote, { kind: 'present', sha: 'd'.repeat(40) })).toBe('moved');
  });
});

describe('classifyRemoteReadback', () => {
  const target = remoteOnly();
  const other = 'd'.repeat(40);
  const moved = { kind: 'present', sha: other } as const;
  const unchanged = { kind: 'present', sha: target.expectedSha } as const;

  it.each([
    { accepted: true, readback: { kind: 'absent' } as const, outcome: { kind: 'deleted' } },
    { accepted: false, readback: { kind: 'absent' } as const, outcome: { kind: 'absent' } },
    { accepted: true, readback: unchanged, outcome: { kind: 'unchanged' } },
    { accepted: false, readback: unchanged, outcome: { kind: 'unchanged' } },
    { accepted: true, readback: moved, outcome: { kind: 'replaced', sha: other } },
    { accepted: false, readback: moved, outcome: { kind: 'moved', sha: other } },
  ])(
    'reads $readback.kind after accepted=$accepted as $outcome.kind',
    ({ accepted, readback, outcome }) => {
      expect(classifyRemoteReadback(target, accepted, readback)).toEqual(outcome);
    },
  );
});

describe('baseMismatch', () => {
  it('finds none when the identity repository reads the proven default name and tip', () => {
    expect(baseMismatch(BASE, BASE)).toBeUndefined();
  });

  it.each([
    { read: { name: 'trunk', sha: BASE.sha }, seen: `trunk@${BASE.sha}` },
    { read: { name: 'main', sha: 'e'.repeat(40) }, seen: `main@${'e'.repeat(40)}` },
    { read: undefined, seen: 'no default branch' },
  ])(
    'names what the identity repository read, $seen, against the proven default',
    ({ read, seen }) => {
      const mismatch = baseMismatch(BASE, read);

      expect(mismatch).toContain(seen);
      expect(mismatch).toContain(`main@${BASE.sha}`);
    },
  );
});

describe('classifyCasOutcome', () => {
  const target = remoteOnly();
  const failed = { exitedClean: false, detail: 'cannot lock ref' };

  it('reads a clean exit as deleted, whatever the re-read', () => {
    expect(
      classifyCasOutcome(target, { exitedClean: true, rereadSha: undefined, detail: '' }),
    ).toEqual({ kind: 'deleted' });
  });

  it('reads a failed compare-and-swap by the ref it left: gone is absent, moved is kept at its sha', () => {
    expect(classifyCasOutcome(target, { ...failed, rereadSha: undefined })).toEqual({
      kind: 'absent',
    });
    expect(classifyCasOutcome(target, { ...failed, rereadSha: 'e'.repeat(40) })).toEqual({
      kind: 'kept',
      sha: 'e'.repeat(40),
    });
  });

  it("reads a failure that left the ref at its proven sha as unchanged, with git's words", () => {
    expect(classifyCasOutcome(target, { ...failed, rereadSha: target.expectedSha })).toEqual({
      kind: 'unchanged',
      detail: 'cannot lock ref',
    });
  });
});
