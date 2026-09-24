import { err, ok, type Result } from '@oaknational/result';

declare const dialogueIdBrand: unique symbol;

/**
 * A dialogue's own id, known to be a lowercase slug of 1 to 64 characters.
 *
 * It names the dialogue in the cleanup map; it never reaches Codex's argv.
 * The slug admits no path separator, whitespace or option syntax.
 */
export type DialogueId = string & { readonly [dialogueIdBrand]: true };

const DIALOGUE_ID_MAX_LENGTH = 64;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isDialogueId(value: string): value is DialogueId {
  return value.length <= DIALOGUE_ID_MAX_LENGTH && SLUG_PATTERN.test(value);
}

/**
 * Accept a dialogue id only when it is a lowercase slug of 1 to 64
 * characters: lowercase letters and digits, in groups joined by single
 * hyphens.
 */
export function parseDialogueId(raw: string): Result<DialogueId, string> {
  return isDialogueId(raw)
    ? ok(raw)
    : err('a dialogue id must be a lowercase slug of 1 to 64 characters');
}
