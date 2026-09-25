import { z } from 'zod';

/**
 * A code-mode tool output, as the rollout records it: the harness's preamble
 * for a completed script, then whatever the model's own program printed. The
 * program chooses what it prints (a result object, one field of it, or
 * nothing), so its text is authored by the model and is never evidence; the
 * harness's `CommandExecution` item carries each command's output instead.
 * The reader checks only the wrapper the harness writes.
 */

const outputItemsSchema = z.array(
  z.strictObject({ type: z.literal('input_text'), text: z.string() }),
);

/** The harness's preamble for a script that completed (codex-cli 0.156.1 and 0.157.0). */
const completedPreamble = /^Script completed\nWall time \d+(?:\.\d+)? seconds\nOutput:\n$/u;

/** Why a code-mode output's wrapper is not the one the harness writes. */
export type CodeModeOutputRefusal =
  | 'custom_tool_call_output.output items are not input_text'
  | 'custom_tool_call_output.output has no completed-script preamble';

/**
 * The refusal for a code-mode output's wrapper, or undefined when it is the
 * harness's: every item is input text, and the first is the completed-script
 * preamble. The program's printed items after it are not read.
 *
 * @param value - The output record's `output` field.
 */
export function codeModeOutputRefusal(value: unknown): CodeModeOutputRefusal | undefined {
  const parsed = outputItemsSchema.safeParse(value);
  if (!parsed.success) {
    return 'custom_tool_call_output.output items are not input_text';
  }
  const [preamble] = parsed.data;
  return preamble !== undefined && completedPreamble.test(preamble.text)
    ? undefined
    : 'custom_tool_call_output.output has no completed-script preamble';
}
