import { z } from 'zod';

/**
 * A code-mode tool output, as the rollout records it: the harness's preamble
 * for the script's status, then whatever the model's own program printed. The
 * program chooses what it prints (such as a result object, one field of it,
 * or nothing), so its printed output is authored by the model and is never
 * evidence; the harness's `CommandExecution` item carries each command's
 * output instead. The reader checks only the preamble item the harness writes.
 */

/** The harness's preamble item first; the program's items after it are not parsed. */
const outputSchema = z
  .tuple([z.strictObject({ type: z.literal('input_text'), text: z.string() })])
  .rest(z.unknown());

/**
 * The harness's preamble for a script that completed (codex-cli 0.156.1 and
 * 0.157.0). A script that failed, was terminated or is still running has
 * another status line, and the variant written under
 * `code_mode.experimental_show_cell_overhead` adds the code-mode and overhead
 * times; the reader refuses each, failing closed.
 */
const completedPreamble = /^Script completed\nWall time \d+(?:\.\d+)? seconds\nOutput:\n$/u;

/** Why a code-mode output's wrapper is not the one the harness writes. */
export type CodeModeOutputRefusal =
  | 'custom_tool_call_output.output does not open with an input_text item'
  | 'custom_tool_call_output.output has no completed-script preamble';

/**
 * The refusal for a code-mode output's wrapper, or undefined when it is the
 * harness's: the first item is input text holding the completed-script
 * preamble.
 *
 * @param value - The output record's `output` field.
 */
export function codeModeOutputRefusal(value: unknown): CodeModeOutputRefusal | undefined {
  const parsed = outputSchema.safeParse(value);
  if (!parsed.success) {
    return 'custom_tool_call_output.output does not open with an input_text item';
  }
  const [preamble] = parsed.data;
  return completedPreamble.test(preamble.text)
    ? undefined
    : 'custom_tool_call_output.output has no completed-script preamble';
}
