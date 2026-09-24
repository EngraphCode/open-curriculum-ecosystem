import { err, type Result } from '@oaknational/result';

import {
  executeTurn,
  type TurnContext,
  type TurnError,
  type TurnPorts,
  type TurnRequest,
} from './dialogue-turn.js';
import { envelopeDigest } from './envelope.js';
import { admitRecord, matchBinding, type GateRefusal, type PassRecordRead } from './gate.js';
import type { TurnOutcome } from './turn-verdict.js';

/**
 * The `codex` binary as resolved once for this call: its real path and the
 * version it reports. One resolution serves the gate and the spawn, so an
 * updater swapping the release link mid-call cannot split them.
 */
export interface ResolvedBinary {
  readonly realPath: string;
  readonly version: string;
}

/**
 * Why the binary could not be resolved: no `codex` to be found, or a
 * version it would not report.
 */
export interface BinaryUnresolved {
  readonly kind: 'binary-unresolved';
  readonly reason: 'not-found' | 'version-unreadable';
}

/**
 * What a gated turn needs from the composition root. It carries no
 * executable: the gate's own resolution supplies that.
 */
export type GatedTurnContext = Omit<TurnContext, 'codexExecutable'>;

/**
 * The effects a gated turn needs, injected: the turn's own, plus the pass
 * record read and the binary resolution the gate needs.
 */
export interface GatedTurnPorts extends TurnPorts {
  /** Reports what is where the pass record lives. */
  readonly readPassRecord: () => PassRecordRead;
  /** Resolves `codex` to its real path, and reads the version it reports. */
  readonly resolveBinary: () => Result<ResolvedBinary, BinaryUnresolved>;
}

/**
 * Why a gated turn did not run or did not count.
 */
export type GatedTurnError = GateRefusal | BinaryUnresolved | TurnError;

/**
 * Run one dialogue turn, but only on a binding a probe has passed. The pass
 * record is admitted first, so an empty instrument home asks for a probe
 * before anything about the binary is known. Then the binary is resolved
 * once, the binding is matched against the record, and the turn spawns that
 * same resolved path.
 */
export function runTurn(
  request: TurnRequest,
  context: GatedTurnContext,
  ports: GatedTurnPorts,
): Result<TurnOutcome, GatedTurnError> {
  const record = admitRecord(ports.readPassRecord());
  if (!record.ok) {
    return err(record.error);
  }
  const binary = ports.resolveBinary();
  if (!binary.ok) {
    return err(binary.error);
  }
  const match = matchBinding(record.value, {
    cliVersion: binary.value.version,
    executablePath: binary.value.realPath,
    envelopeDigest: envelopeDigest(context.modelPins),
  });
  if (!match.ok) {
    return err(match.error);
  }
  return executeTurn(request, { ...context, codexExecutable: binary.value.realPath }, ports);
}
