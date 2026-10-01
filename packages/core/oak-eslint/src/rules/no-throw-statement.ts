import { createMessage, type RuleWithReappraisingMessages } from '../reappraising-message.js';

/**
 * ESLint rule that bans `throw` statements in favour of the Result pattern.
 *
 * @remarks
 * Repository doctrine (ADR-088 / `use-result-pattern`) is that errors are part
 * of the type signature: a function that can fail returns `Result<T, E>`, and
 * the compiler forces every caller to handle both arms. A `throw` re-introduces
 * the invisible control-flow edge the Result pattern exists to remove. Genuine
 * boundary translations — re-expressing an error from a library that cannot
 * return a `Result` — belong at a single named edge, translated to a `Result`
 * there, not scattered through the call graph.
 *
 * Severity: `error` in `configs/recommended.ts`. The owner's ruling of
 * 2026-09-08 (quoted there) turns the rule off in each workspace that holds
 * throw debt, in that workspace's own flat config, until the merge-back into
 * the upstream lets the no-throw-remediation plan migrate the debt; every
 * other workspace, and every new workspace, holds it at `error`.
 */
const noThrowStatementRule: RuleWithReappraisingMessages<'throwBanned'> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ban throw statements so errors flow through the Result pattern (ADR-088) and stay in the type signature.',
    },
    schema: [],
    messages: {
      throwBanned: createMessage({
        prohibition: 'Throwing is banned: a thrown error is invisible to the type system.',
        reappraisal:
          'Return a Result<T, E> (err(...)) from a Result-typed function (ADR-088 / use-result-pattern); where a library that cannot return Result must be wrapped, translate the error to a Result at that single boundary.',
      }),
    },
  },
  defaultOptions: [],

  create(context) {
    return {
      ThrowStatement(node) {
        context.report({
          node,
          messageId: 'throwBanned',
        });
      },
    };
  },
};

export { noThrowStatementRule };
