import { createMessage, type RuleWithReappraisingMessages } from '../reappraising-message.js';

/**
 * ESLint rule that bans Vitest's conditional-execution APIs — `skipIf` and
 * `runIf` — on `it`, `test` and `describe`.
 *
 * @remarks
 * `.agent/rules/no-conditional-tests.md` names `it.skipIf` FIRST among its
 * forbidden mechanisms, and `testing-strategy.md` requires a suite to produce
 * the same registered test count and the same assertion set on every machine.
 * Until this rule existed that requirement was prose: `vitest/no-disabled-tests`
 * catches `it.skip` and `describe.skip`, and `vitest/no-focused-tests` catches
 * `.only`, but `it.skipIf(...)` passed lint cleanly.
 *
 * That gap had a cost. A succession record instructed a seat to mark four tests
 * `it.skipIf(process.platform === 'win32')` so a host-dependent expectation
 * would not run on Windows (2026-09-11); nothing at the gate would have stopped
 * it, and the correct cure was to remove the host dependency from the product
 * seam instead. A rule a gate cannot see is a rule that survives only as long
 * as everyone remembers it.
 *
 * A conditional test is not a smaller test — it is a test whose absence is
 * invisible on the machine where it matters. When a test needs an environment
 * the host lacks, the answer is to remove the environmental dependency through
 * an injected seam; the directive's own diagnoses cover the rest.
 *
 * @example
 * // Invalid — registration depends on the host.
 * it.skipIf(process.platform === 'win32')('writes 0600', () => {});
 *
 * // Invalid — the same shape inverted.
 * describe.runIf(hasNetwork)('live calls', () => {});
 *
 * // Valid — deterministic enumeration of a literal dataset.
 * it.each([1, 2, 3])('doubles %i', (n) => {});
 */
const CONDITIONAL_MEMBERS = new Set(['skipIf', 'runIf']);
const TEST_CALLEES = new Set(['it', 'test', 'describe']);

const noConditionalTestsRule: RuleWithReappraisingMessages<'conditionalTestBanned'> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ban Vitest skipIf/runIf so every suite registers the same tests on every machine.',
    },
    schema: [],
    messages: {
      conditionalTestBanned: createMessage({
        prohibition:
          'Conditional test execution (skipIf/runIf) is banned: the suite would register a different set of tests depending on the host.',
        reappraisal:
          'Remove the environmental dependency instead — inject the host-specific edge through a seam so the behaviour is describable everywhere. See .agent/rules/no-conditional-tests.md.',
      }),
    },
  },
  defaultOptions: [],

  create(context) {
    return {
      MemberExpression(node) {
        if (node.computed || node.property.type !== 'Identifier') {
          return;
        }
        if (!CONDITIONAL_MEMBERS.has(node.property.name)) {
          return;
        }
        // `it.skipIf`, and the chained forms `it.each(...).skipIf` /
        // `it.concurrent.skipIf`, all bottom out at one of the test callees.
        let root = node.object;
        while (root.type === 'CallExpression' || root.type === 'MemberExpression') {
          root = root.type === 'CallExpression' ? root.callee : root.object;
        }
        if (root.type !== 'Identifier' || !TEST_CALLEES.has(root.name)) {
          return;
        }
        context.report({ node, messageId: 'conditionalTestBanned' });
      },
    };
  },
};

export { noConditionalTestsRule };
