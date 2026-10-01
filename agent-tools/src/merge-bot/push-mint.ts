import { err, ok, type Result } from '@oaknational/result';

import type { MintConfig, MintedToken } from './mint-for-config.js';
import type { BotIdentity } from './resolve-identity.js';

/**
 * The one installation token a `merge-bot push` invocation mints, after
 * everything the push settles and before its first attempt. Every attempt
 * carries this token: GitHub refuses a fresh token until it has replicated,
 * so a fresher one would only start that wait again (`push-attempts.ts`).
 *
 * @packageDocumentation
 */

/** The push's mint port: `mintForConfig` over the CLI's seams, supplied by `cli.ts`. */
export type PushMint = (config: MintConfig) => Promise<Result<MintedToken, Error>>;

/**
 * Mint the push's one token, or say why it cannot be used.
 *
 * @param identity - The bot identity the push acts as.
 * @param mint - The mint the token comes from.
 * @returns The token, or the failure to report before any git call.
 */
export async function mintPushToken(
  identity: BotIdentity,
  mint: PushMint,
): Promise<Result<string, Error>> {
  // Scope is the whole landing span: a push can carry `.github/workflows`
  // changes, which GitHub refuses without `workflows: write` (the scope table
  // carries that observation's provenance).
  const minted = await mint({ ...identity, scope: 'pull-request-work' });
  if (!minted.ok) {
    return err(minted.error);
  }
  // The point-of-use backstop. The mint's own response schema already rejects
  // an empty token, so this fires only if that contract ever changes — and
  // HERE is where an empty value stops being a validation detail and becomes
  // an interactive credential prompt answered by the signed-in human.
  return minted.value.token === ''
    ? err(
        new Error(
          'minted token is empty — refusing before any git call: the credential helper would emit an empty password and git would fall back to prompting the signed-in human',
        ),
      )
    : ok(minted.value.token);
}
