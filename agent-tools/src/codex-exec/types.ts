export type OutputFormat = 'text' | 'json';

interface LastMessageResult {
  readonly found: true;
  readonly text: string;
}

interface LastMessageNotFound {
  readonly found: false;
}

export type LastMessageOutcome = LastMessageResult | LastMessageNotFound;

/**
 * One shell run the harness recorded, from a completed `command_execution` item.
 */
export interface CommandExecution {
  readonly command: string;
  readonly output: string;
  readonly exitCode: number | undefined;
}

/**
 * A parsed event from `codex exec --json` JSONL output, as a closed union.
 *
 * Only a top-level `turn.failed` or `error` event fails a turn; an `error`
 * item inside a turn is non-fatal and reads as `other`.
 */
export type CodexExecEvent =
  | { readonly kind: 'thread-started'; readonly threadId: string }
  | { readonly kind: 'agent-message'; readonly text: string }
  | ({ readonly kind: 'command-execution' } & CommandExecution)
  | { readonly kind: 'turn-failed'; readonly message: string }
  | { readonly kind: 'stream-error'; readonly message: string }
  | { readonly kind: 'other'; readonly type: string };

/**
 * Everything one turn's JSONL stream says, folded in order.
 */
export interface TurnEvents {
  readonly threadIds: readonly string[];
  readonly agentMessages: readonly string[];
  readonly commandExecutions: readonly CommandExecution[];
  readonly failures: readonly string[];
  readonly unparseableLines: number;
}

export interface CodexExecCliInput {
  readonly command: string | undefined;
  readonly args: readonly string[];
  readonly stdin: NodeJS.ReadableStream;
  readonly stdout: { write(chunk: string): void };
  readonly stderr: { write(chunk: string): void };
}
