/** The recorded policy shape accepted by codex-cli 0.156.1's SandboxState. */
export interface RecordedPermissionProfile {
  readonly type: 'managed';
  readonly file_system: {
    readonly type: 'restricted';
    readonly entries: readonly [
      {
        readonly path: { readonly type: 'special'; readonly value: { readonly kind: 'root' } };
        readonly access: 'read';
      },
    ];
  };
  readonly network: 'restricted';
}

/** A turn's recorded execution context, independent of the turn composition context. */
export interface RecordedTurnContext {
  readonly turnId: string;
  readonly cwd: string;
  readonly approvalPolicy: 'never';
  readonly sandboxPolicy: { readonly type: 'read-only' };
  readonly permissionProfile: RecordedPermissionProfile;
  readonly model: string;
  /** Absent when the execution did not pin a reasoning effort. */
  readonly effort: string | undefined;
}

export interface RolloutEvidence {
  readonly threadId: string;
  readonly turns: readonly [RecordedTurnContext, RecordedTurnContext];
  /** Shell output from each resumed harness record; tool-call program input is excluded. */
  readonly resumedOutputTexts: readonly string[];
}

export type RolloutReadError =
  | { readonly kind: 'invalid-json'; readonly line: number }
  | { readonly kind: 'unknown-record-type'; readonly line: number; readonly recordType: string }
  | { readonly kind: 'invalid-record'; readonly line: number; readonly reason: string }
  | { readonly kind: 'invalid-turn-order'; readonly line: number; readonly reason: string }
  | { readonly kind: 'invalid-turn-count'; readonly count: number }
  | { readonly kind: 'invalid-session-count'; readonly count: number };
