/**
 * The shape of one option in the argument-aware matcher's tables. Its own
 * module so the command tables and the git subcommand tables can both name
 * it without importing each other.
 *
 * @packageDocumentation
 */

/**
 * One option a command accepts. `name` is the canonical name (the long
 * spelling, or the letter of a `shortOnly` option); `short` lists every
 * short letter that means the same option; `arg` says whether the option
 * takes a value — `required` (attached, `=`-joined, or the next token) or
 * `optional` (only an `=`-joined value counts); `implies` names the
 * canonical options this spelling stands for, so a pattern and an invocation
 * meet on the same set whichever spelling either uses.
 */
export interface OptionSpec {
  readonly name: string;
  readonly short?: string;
  readonly arg?: 'required' | 'optional';
  /** The option has no long spelling (`git clean -d`): long-option lookups never resolve to it. */
  readonly shortOnly?: true;
  /** The option is a spelling of these canonical options (`git branch -D` is `--delete --force`). */
  readonly implies?: readonly string[];
}
