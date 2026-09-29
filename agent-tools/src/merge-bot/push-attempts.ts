/**
 * The bounded retry around the bot's push. GitHub has refused a push with a
 * freshly minted installation token at the ref advertisement, the first
 * request git makes, before it runs the pre-push hook; a later push went
 * through each time (four times on 2026-09-28). A push whose whole
 * transcript is that refusal is therefore tried again with a fresh token, up
 * to `PUSH_ATTEMPTS` in all. Any other failure is final at once: a refusal
 * after the hook ran would run the whole gate again, and a gate's own failure
 * is the operator's to read.
 *
 * @packageDocumentation
 */

/** How many times, in all, a refused push is tried. */
export const PUSH_ATTEMPTS = 3;

/**
 * The wait before each further attempt. The two recoveries timed on record
 * went through 20 to 80 seconds and 135 seconds after the refusal, so the
 * attempts start about 0, 30 and 60 seconds in; each retry is named on stderr,
 * so the value can be tuned from what those lines show.
 */
const RETRY_WAIT_MS = 30_000;

/**
 * The refusal's lines, in order, as git prints them: GitHub's reason, then
 * git's own failure. The repository and the bot are whatever the push named.
 */
const REFUSAL_LINES: readonly RegExp[] = [
  /^remote: Permission to \S+ denied to \S+\.$/u,
  /^fatal: unable to access '[^']+': The requested URL returned error: 403$/u,
];

/** git's exit status for a fatal error, the refusal's; the executor also reports a kill as 128, with the signal named. */
const GIT_FATAL = 128;

/**
 * The most of a push's transcript the refusal check keeps. The refusal's two
 * lines, newlines included, were 224 bytes as GitHub printed them for the
 * repository this retry was built in, on 2026-09-28; the bound holds over
 * eighteen times that, for a longer repository or bot name, and a longer
 * transcript cannot be the refusal. The push's output still streams to
 * stderr in full as it arrives, so the check keeps a bounded copy and loses
 * nothing (R1).
 */
export const REFUSAL_TRANSCRIPT_BOUND = 4096;

/**
 * The transcript the refusal check keeps, with the next chunk of the push's
 * output added: the text while it could still be the refusal, and null once
 * it is longer than the refusal can be, from then on.
 *
 * @param kept - What was kept so far, or null once the check stopped keeping.
 * @param chunk - The next output, from either stream.
 */
export function keptForRefusal(kept: string | null, chunk: string): string | null {
  return kept === null || kept.length + chunk.length > REFUSAL_TRANSCRIPT_BOUND
    ? null
    : kept + chunk;
}

/**
 * Whether a failed push is GitHub's refusal at the ref advertisement: git
 * exited 128 on its own, no signal ended it, and its whole transcript is the
 * refusal's two lines, so the pre-push hook never ran.
 *
 * @param status - The push's exit status.
 * @param signal - The signal that ended the push, or null when it exited.
 * @param transcript - What the push printed, both streams, as `keptForRefusal` kept it; null when it outgrew the bound.
 */
export function isAdvertisementRefusal(
  status: number,
  signal: NodeJS.Signals | null,
  transcript: string | null,
): boolean {
  if (transcript === null) {
    return false;
  }
  const lines = transcript
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line !== '');
  return (
    status === GIT_FATAL &&
    signal === null &&
    lines.length === REFUSAL_LINES.length &&
    lines.every((line, index) => REFUSAL_LINES[index]?.test(line) === true)
  );
}

/** One attempt's end: the exit it would report, and whether it was the refusal. */
export interface PushAttempt {
  readonly exit: number;
  readonly refused: boolean;
}

/** A failure that is not GitHub's refusal, so never tried again. */
export const FAILED_ATTEMPT: PushAttempt = { exit: 1, refused: false };

/** Where the retry waits and reports. */
export interface PushRetrySeams {
  readonly sleep: (ms: number) => Promise<void>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
}

/**
 * Run the attempt, and again after a wait each time GitHub refused it at the
 * ref advertisement, up to `PUSH_ATTEMPTS` in all.
 *
 * @param attempt - One whole push: a fresh mint, then the transfer.
 * @param seams - The wait, and the stream each retry and the last refusal are named on.
 * @returns The exit of the last attempt.
 */
export function pushWithRetry(
  attempt: () => Promise<PushAttempt>,
  seams: PushRetrySeams,
): Promise<number> {
  return attemptFrom(1, attempt, seams);
}

async function attemptFrom(
  attemptNumber: number,
  attempt: () => Promise<PushAttempt>,
  seams: PushRetrySeams,
): Promise<number> {
  const outcome = await attempt();
  if (!outcome.refused) {
    return outcome.exit;
  }
  if (attemptNumber >= PUSH_ATTEMPTS) {
    seams.stderr.write(
      `merge-bot push: GitHub refused the push ${String(PUSH_ATTEMPTS)} times before the pre-push hook ran, each refusal shown above; nothing was pushed\n`,
    );
    return outcome.exit;
  }
  seams.stderr.write(
    `merge-bot push: GitHub refused attempt ${String(attemptNumber)} of ${String(PUSH_ATTEMPTS)} before the pre-push hook ran; trying again with a fresh token in ${String(RETRY_WAIT_MS / 1000)} s\n`,
  );
  await seams.sleep(RETRY_WAIT_MS);
  return attemptFrom(attemptNumber + 1, attempt, seams);
}
