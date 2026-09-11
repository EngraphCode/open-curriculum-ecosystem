import { noConditionalTestsRule } from './no-conditional-tests.js';
import { ruleTester } from '../test-support/rule-tester.js';

ruleTester.run('no-conditional-tests', noConditionalTestsRule, {
  valid: [
    // Deterministic enumeration over a literal dataset registers every row on
    // every host, which is what the dividing line actually asks for.
    {
      code: "it.each([1, 2])('doubles %i', (n) => {\n  expect(n * 2).toBe(n + n);\n});",
    },
    {
      code: "describe.each(['a', 'b'])('case %s', (letter) => {\n  it('holds', () => {});\n});",
    },
    // The member name alone is not the offence — it has to hang off a test callee.
    {
      code: 'const scheduler = { skipIf: () => undefined };\nscheduler.skipIf();',
    },
    {
      code: "it('runs everywhere', () => {\n  expect(true).toBe(true);\n});",
    },
  ],
  invalid: [
    // The exact shape a succession record handed a seat on 2026-09-11.
    {
      code: "it.skipIf(process.platform === 'win32')('writes 0600', () => {});",
      errors: [{ messageId: 'conditionalTestBanned' }],
    },
    {
      code: "test.skipIf(process.env.CI)('local only', () => {});",
      errors: [{ messageId: 'conditionalTestBanned' }],
    },
    {
      code: "describe.runIf(hasNetwork)('live calls', () => {});",
      errors: [{ messageId: 'conditionalTestBanned' }],
    },
    // Chained forms bottom out at the same callee and must not slip through.
    {
      code: "it.each([1])('case %i', (n) => {});\nit.concurrent.skipIf(slow)('later', () => {});",
      errors: [{ messageId: 'conditionalTestBanned' }],
    },
  ],
});
