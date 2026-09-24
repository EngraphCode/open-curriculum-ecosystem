import { z } from 'zod';

import type { RecordedPermissionProfile, RecordedTurnContext } from './rollout-types.js';

export interface JsonRecord {
  readonly type?: unknown;
  readonly payload?: unknown;
  readonly id?: unknown;
  readonly turn_id?: unknown;
  readonly item?: unknown;
  readonly aggregated_output?: unknown;
  readonly output?: unknown;
  readonly input?: unknown;
}

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const permissionProfileSchema = z.strictObject({
  type: z.literal('managed'),
  file_system: z.strictObject({
    type: z.literal('restricted'),
    entries: z.tuple([
      z.strictObject({
        path: z.strictObject({
          type: z.literal('special'),
          value: z.strictObject({ kind: z.literal('root') }),
        }),
        access: z.literal('read'),
      }),
    ]),
  }),
  network: z.literal('restricted'),
});

const turnContextSchema = z.object({
  turn_id: z.string().min(1),
  cwd: z.string().min(1),
  approval_policy: z.literal('never'),
  sandbox_policy: z.strictObject({ type: z.literal('read-only') }),
  permission_profile: permissionProfileSchema,
  model: z.string().min(1),
  effort: z.string().min(1).optional(),
});

const toolOutputSchema = z.array(
  z.strictObject({ type: z.literal('input_text'), text: z.string() }),
);
const nestedExecResultSchema = z.strictObject({
  chunk_id: z.string(),
  wall_time_seconds: z.number(),
  exit_code: z.number(),
  original_token_count: z.number(),
  output: z.string(),
});
const completedPreamble = /^Script completed\nWall time \d+(?:\.\d+)? seconds\nOutput:\n$/u;

/** Do not pass an unrecognised profile through to `codex sandbox`. */
export function parsePermissionProfile(value: unknown): RecordedPermissionProfile | undefined {
  const parsed = permissionProfileSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function parseTurnContext(value: unknown): RecordedTurnContext | undefined {
  const parsed = turnContextSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }
  return {
    turnId: parsed.data.turn_id,
    cwd: parsed.data.cwd,
    approvalPolicy: parsed.data.approval_policy,
    sandboxPolicy: parsed.data.sandbox_policy,
    permissionProfile: parsed.data.permission_profile,
    model: parsed.data.model,
    effort: parsed.data.effort,
  };
}

export function parseToolOutput(value: unknown): readonly string[] | undefined {
  const parsed = toolOutputSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }
  const [preamble, ...results] = parsed.data;
  if (!preamble || !completedPreamble.test(preamble.text) || results.length === 0) {
    return undefined;
  }
  const outputs: string[] = [];
  for (const result of results) {
    let nested: unknown;
    try {
      nested = JSON.parse(result.text);
    } catch {
      return undefined;
    }
    const execResult = nestedExecResultSchema.safeParse(nested);
    if (!execResult.success) {
      return undefined;
    }
    outputs.push(execResult.data.output);
  }
  return outputs;
}
