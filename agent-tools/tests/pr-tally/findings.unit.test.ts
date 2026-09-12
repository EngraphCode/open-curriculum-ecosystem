import { describe, expect, it } from 'vitest';

import { extractBodyFindings } from '../../src/pr-tally/findings.js';
import { parseRecordedHarvest } from '../../src/pr-tally/harvest.js';
import pr135 from './fixtures/pr-135-harvest.json' with { type: 'json' };
import pr136 from './fixtures/pr-136-harvest.json' with { type: 'json' };
import pr138 from './fixtures/pr-138-harvest.json' with { type: 'json' };

const COPILOT = 'copilot-pull-request-reviewer';
const CODEX = 'chatgpt-codex-connector';

const copilotSuppressed = (items: readonly string[], missed?: number) => `### 🟡 Changes recommended

Two findings.

<details>
<summary>Review details</summary>

### Suppressed comments (${items.length})
${missed === undefined ? '' : `\n**Previously missed (${missed})** — in code that hasn't changed since the last review.\n`}
${items.map((anchor, index) => `**${anchor}**\n* Finding ${index + 1} text.\n\`\`\`\nsnippet\n\`\`\``).join('\n')}

- **Files reviewed:** 3/3 changed files
- **Comments generated:** 0 new
</details>`;

describe('extractBodyFindings — findings from review bodies, by the reviewer’s own markers', () => {
  it('reads each Copilot suppressed item as one finding keyed by its ordinal, with its anchor', () => {
    const body = copilotSuppressed(['docs/a.md:12', 'docs/a.md:12', 'src/b.ts:3'], 1);
    const result = extractBodyFindings({ author: COPILOT, body });
    expect(result.manual).toBe(false);
    expect(result.items.map((item) => [item.key, item.path, item.line])).toStrictEqual([
      ['item 1 of 3', 'docs/a.md', 12],
      ['item 2 of 3', 'docs/a.md', 12],
      ['item 3 of 3', 'src/b.ts', 3],
    ]);
    expect(result.items.map((item) => item.substance)).toStrictEqual([
      'Finding 1 text.',
      'Finding 2 text.',
      'Finding 3 text.',
    ]);
  });

  it('reads a Copilot body with no suppressed block as boilerplate: zero items, never manual', () => {
    const body = `### 🟢 Approval recommended\n\nAll good.\n\n<details>\n- **Comments generated:** 0 new\n</details>`;
    expect(extractBodyFindings({ author: COPILOT, body })).toStrictEqual({
      items: [],
      manual: false,
    });
  });

  it('surfaces a Copilot block whose items do not add up to its declared count as manual', () => {
    const body = copilotSuppressed(['docs/a.md:1']).replace(
      'Suppressed comments (1)',
      'Suppressed comments (2)',
    );
    expect(extractBodyFindings({ author: COPILOT, body }).manual).toBe(true);
  });

  it('reads Codex badge-and-heading items as findings keyed by heading, and its summary as boilerplate', () => {
    const items = [
      '**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Verify before routing**\n\nBody one.',
      '**<sub><sub>![P1 Badge](https://img.shields.io/badge/P1-orange?style=flat)</sub></sub>  Keep doctrine on the branch**\n\nBody two.',
    ].join('\n\n');
    const withItems = extractBodyFindings({ author: CODEX, body: items });
    expect(withItems.manual).toBe(false);
    expect(withItems.items.map((item) => [item.key, item.path, item.line])).toStrictEqual([
      ['Verify before routing', null, null],
      ['Keep doctrine on the branch', null, null],
    ]);
    const summary =
      '\n### 💡 Codex Review\n\nHere are some automated review suggestions for this pull request.\n';
    expect(extractBodyFindings({ author: CODEX, body: summary })).toStrictEqual({
      items: [],
      manual: false,
    });
  });

  it('surfaces an unstructured body from any other reviewer as manual, and an empty one as nothing', () => {
    expect(
      extractBodyFindings({ author: 'claude', body: 'Two issues: the parser and the docs.' }),
    ).toStrictEqual({ items: [], manual: true });
    expect(extractBodyFindings({ author: 'claude', body: '  \n' })).toStrictEqual({
      items: [],
      manual: false,
    });
  });

  it.each([
    ['#135', pr135, 37],
    ['#136', pr136, 8],
    ['#138', pr138, 23],
  ])(
    'reads every Copilot suppressed block in the %s corpus with counts equal to the declared totals',
    (_label, fixture, expectedTotal) => {
      const harvest = parseRecordedHarvest(fixture);
      const copilot = harvest.reviews.filter((review) => review.author === COPILOT);
      const results = copilot.map((review) => extractBodyFindings(review));
      expect(results.every((result) => !result.manual)).toBe(true);
      const declared = copilot
        .map((review) => /Suppressed comments \((\d+)\)/u.exec(review.body))
        .map((match) => (match === null ? 0 : Number(match[1])));
      expect(results.map((result) => result.items.length)).toStrictEqual(declared);
      expect(results.reduce((sum, result) => sum + result.items.length, 0)).toBe(expectedTotal);
    },
  );

  it('reads every Codex review body in the corpora as boilerplate: no body-only Codex item is recorded', () => {
    for (const fixture of [pr135, pr136, pr138]) {
      const codex = parseRecordedHarvest(fixture).reviews.filter(
        (review) => review.author === CODEX,
      );
      expect(codex.length).toBeGreaterThan(0);
      for (const review of codex) {
        expect(extractBodyFindings(review)).toStrictEqual({ items: [], manual: false });
      }
    }
  });
});
