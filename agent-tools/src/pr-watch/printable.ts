/**
 * Printable text for the terminal. A refusal quotes the argument it refuses,
 * and a terminal obeys control sequences inside quoted text: an escape
 * sequence recolours or hyperlinks the line, a bell rings, a format character
 * hides text or reverses its direction. The guarantee that what is written is
 * what is read belongs to the writer, so the push's argument parser passes an
 * argument it refuses through {@link printable} where it becomes terminal
 * output.
 *
 * Dropped: every control character (`\p{Cc}`: C0 and C1, so ESC, BEL and the
 * single-byte CSI) and every format character (`\p{Cf}`: the bidi overrides
 * and isolates, zero-width marks, tag characters, the soft hyphen, which a
 * terminal never shows). Combining marks and private-use characters stay: they
 * render as noise, never as commands.
 */

const NON_PRINTABLE = /[\p{Cc}\p{Cf}]/gu;

/** One terminal line with every control and format character dropped. */
export function printable(line: string): string {
  return line.replaceAll(NON_PRINTABLE, '');
}
