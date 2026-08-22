/**
 * Loader environment MP4 playback — play once, pause at opening frame, hold until gate exit.
 * Opening fraction matches geometry brief midpoint (fully constructed / room open).
 */

/** Timeline fraction where the environment reaches the opening frame (~5s of 10s master). */
export const SITE00_LOADER_OPENING_HOLD_FRACTION = 0.5;

/** Minimum dwell on the paused opening frame after playback reaches it. */
export const SITE00_LOADER_MIN_OPENING_HOLD_MS = 1800;

/** Fallback if metadata/timeupdate never reaches opening (slow networks, decode stalls). */
export const SITE00_LOADER_OPENING_HOLD_TIMEOUT_MS = 9000;

export function resolveSite00LoaderOpeningHoldTime(durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return durationSeconds * SITE00_LOADER_OPENING_HOLD_FRACTION;
}
