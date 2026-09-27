/**
 * The here documents of one shell script. A word `<<EOF` or `<<-EOF`, or a
 * bare `<<` followed by its terminator word, announces one; at the end of that
 * line the first announced body opens and is read line by line as data until
 * its terminator line closes it, then the next announced body, until none is
 * pending. A body yields no word and no segment.
 */

/** A here document announced by `<<` or `<<-`, waiting for its body. */
interface HereDocument {
  readonly terminator: string;
  /** `<<-` strips leading tabs from every body line and the terminator. */
  readonly stripTabs: boolean;
}

/** The here-document state of one script being split. */
export class HereDocuments {
  /** Announced on the current line, bodies still to come. */
  private readonly pending: HereDocument[] = [];
  /** The word after a bare `<<` or `<<-` names the terminator. */
  private awaitingTerminator: HereDocument | undefined = undefined;
  /** The body of the first pending here document is being read, line by line. */
  private bodyLine: string | undefined = undefined;

  /** Whether a body is being read; every character of it is data. */
  get inBody(): boolean {
    return this.bodyLine !== undefined;
  }

  /** `<<EOF`, `<<-EOF`, or a bare `<<` whose next word is the terminator. */
  note(word: string): void {
    if (this.awaitingTerminator !== undefined) {
      this.pending.push({ ...this.awaitingTerminator, terminator: word });
      this.awaitingTerminator = undefined;
      return;
    }
    if (!word.startsWith('<<')) {
      return;
    }
    const stripTabs = word.startsWith('<<-');
    const terminator = word.slice(stripTabs ? 3 : 2);
    if (terminator.length === 0) {
      this.awaitingTerminator = { terminator: '', stripTabs };
    } else {
      this.pending.push({ terminator, stripTabs });
    }
  }

  /** At the end of a line: open the first body announced on it, when any is pending. */
  openBody(): void {
    if (this.pending.length > 0) {
      this.bodyLine = '';
    }
  }

  /** One character of a body line: data until the terminator line closes the document. */
  read(character: string): void {
    if (character !== '\n') {
      this.bodyLine = `${this.bodyLine ?? ''}${character}`;
      return;
    }
    const closed = this.closes(this.bodyLine ?? '');
    this.bodyLine = closed && this.pending.length === 0 ? undefined : '';
  }

  /** Whether a body line is the first pending document's terminator; if so, that document is done. */
  private closes(raw: string): boolean {
    const [current] = this.pending;
    if (current === undefined) {
      return false;
    }
    const line = current.stripTabs ? raw.replace(/^\t+/u, '') : raw;
    if (line !== current.terminator) {
      return false;
    }
    this.pending.shift();
    return true;
  }
}
