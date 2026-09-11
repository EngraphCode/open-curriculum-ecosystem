import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

import { createMessage, type RuleWithReappraisingMessages } from '../reappraising-message.js';

/**
 * ESLint rule that bans Vitest's conditional-execution APIs — `skipIf` and
 * `runIf` — on `it`, `test`, `describe` and `suite`, however the file spells
 * them: the exported name under globals mode, a local alias, or a property of
 * a namespace import.
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
 * // Invalid — an alias renames the identifier, not the construct.
 * import { it as spec } from 'vitest';
 * spec.skipIf(isCi)('writes 0600', () => {});
 *
 * // Invalid — reached through a namespace import.
 * import * as vitest from 'vitest';
 * vitest.describe.skipIf(isCi)('live calls', () => {});
 *
 * // Valid — deterministic enumeration of a literal dataset.
 * it.each([1, 2, 3])('doubles %i', (n) => {});
 *
 * WHAT IT REACHES, stated once rather than enumerated. The rule reads the
 * member access where the guard is applied and resolves its root through
 * scope, so every spelling of that expression is in scope — dotted or
 * bracketed, aliased, namespaced, chained — and a local merely sharing a name
 * is not. It does NOT follow a guard extracted into a value first
 * (`const guard = it.skipIf`), which would need type information a syntactic
 * rule does not have. That is a stated limit rather than a gap to chase: the
 * shape it cannot see is not one anybody reaches for by accident, and the
 * directive stays reviewer-enforced there.
 */
const CONDITIONAL_MEMBERS = new Set(['skipIf', 'runIf']);

/**
 * Vitest's test entry points, by their exported names — `suite` included, since
 * it is the canonical alias for `describe` and a rule that missed it would ban
 * one spelling of the same construct.
 */
const TEST_CALLEES = new Set(['it', 'test', 'describe', 'suite']);

/** The module whose test entry points this rule governs. */
const VITEST_MODULE = 'vitest';

/**
 * The LOCAL names a file has bound to Vitest's test entry points.
 *
 * Matching the exported spellings alone is not enough: an alias
 * (`import { it as spec }`) or a namespace (`import * as vitest`) renames the
 * root identifier, and a gate that recognises only three or four literal
 * spellings is bypassed by ordinary, legal import syntax — which would make
 * the enforcement claim in `.agent/rules/no-conditional-tests.md` false.
 */
interface VitestBindings {
  /** Locals bound directly to a test entry point, under any alias. */
  readonly callees: Set<string>;
  /** Locals bound to the whole module, reached as `<local>.it`. */
  readonly namespaces: Set<string>;
}

function collectVitestBindings(body: TSESTree.ProgramStatement[]): VitestBindings {
  const callees = new Set<string>();
  const namespaces = new Set<string>();
  for (const statement of body) {
    if (statement.type !== AST_NODE_TYPES.ImportDeclaration) {
      continue;
    }
    if (statement.source.value !== VITEST_MODULE) {
      continue;
    }
    for (const specifier of statement.specifiers) {
      if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
        namespaces.add(specifier.local.name);
        continue;
      }
      if (
        specifier.type === AST_NODE_TYPES.ImportSpecifier &&
        specifier.imported.type === AST_NODE_TYPES.Identifier &&
        TEST_CALLEES.has(specifier.imported.name)
      ) {
        callees.add(specifier.local.name);
      }
    }
  }
  return { callees, namespaces };
}

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
    let bindings: VitestBindings = { callees: new Set(), namespaces: new Set() };

    /**
     * The statically known property name of a member access, under either
     * spelling: `x.skipIf` and `x['skipIf']` are the same call, so reading only
     * the dotted form would leave the bracketed one — ordinary, legal syntax —
     * outside a gate that claims to ban the construct.
     */
    function staticPropertyName(node: TSESTree.MemberExpression): string | undefined {
      if (!node.computed) {
        return node.property.type === AST_NODE_TYPES.Identifier ? node.property.name : undefined;
      }
      return node.property.type === AST_NODE_TYPES.Literal &&
        typeof node.property.value === 'string'
        ? node.property.value
        : undefined;
    }

    /**
     * Whether `name` at this position is Vitest's, rather than a local of the
     * same spelling.
     *
     * A bare `it` or `test` is Vitest only under globals mode, where nothing
     * declares it — so an identifier that RESOLVES to a declaration in scope is
     * somebody else's (`const test = scheduler; test.skipIf()` is not a test
     * guard, and this rule is error-level for the whole repository). A local
     * bound to a Vitest import is still Vitest, which is what the alias set
     * carries.
     */
    function isVitestIdentifier(node: TSESTree.Identifier): boolean {
      if (bindings.callees.has(node.name)) {
        return true;
      }
      if (!TEST_CALLEES.has(node.name)) {
        return false;
      }
      // Unresolved means no declaration anywhere in scope: the globals-mode case.
      return context.sourceCode.getScope(node).references.every((reference) => {
        return reference.identifier !== node || reference.resolved === null;
      });
    }

    /** `vitest.it` / `vitest['it']`, where `vitest` is a namespace import. */
    function isNamespacedTestCallee(node: TSESTree.MemberExpression): boolean {
      const property = staticPropertyName(node);
      return (
        property !== undefined &&
        node.object.type === AST_NODE_TYPES.Identifier &&
        bindings.namespaces.has(node.object.name) &&
        TEST_CALLEES.has(property)
      );
    }

    /**
     * Walk `it.each(...).skipIf`, `it.concurrent.skipIf` and every other
     * chained form back to what the chain is rooted in, and say whether that
     * is a Vitest test entry point under ANY of its reachable spellings: the
     * exported name (Vitest's globals mode injects it unimported), a local
     * alias, or a property of a namespace import.
     */
    function rootsAtTestCallee(start: TSESTree.Node): boolean {
      let current = start;
      while (
        current.type === AST_NODE_TYPES.CallExpression ||
        current.type === AST_NODE_TYPES.MemberExpression
      ) {
        if (current.type === AST_NODE_TYPES.MemberExpression) {
          if (isNamespacedTestCallee(current)) {
            return true;
          }
          current = current.object;
          continue;
        }
        current = current.callee;
      }
      if (current.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }
      return isVitestIdentifier(current);
    }

    return {
      Program(node) {
        bindings = collectVitestBindings(node.body);
      },
      MemberExpression(node) {
        const property = staticPropertyName(node);
        if (property === undefined || !CONDITIONAL_MEMBERS.has(property)) {
          return;
        }
        if (!rootsAtTestCallee(node.object)) {
          return;
        }
        context.report({ node, messageId: 'conditionalTestBanned' });
      },
    };
  },
};

export { noConditionalTestsRule };
