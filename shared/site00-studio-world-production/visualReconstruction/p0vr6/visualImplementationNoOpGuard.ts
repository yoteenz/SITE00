/**
 * Detects visual implementation sprints that claim correction but produce no material delta.
 */

export const VISUAL_NO_OP_FAILURE_CODE = 'VISUAL_IMPLEMENTATION_NO_OP' as const;

export type VisualDeltaSample = {
  label: string;
  /** Normalized perceptual hash or pixel diff ratio 0–1 */
  deltaRatio: number;
};

export function evaluateVisualImplementationDelta(input: {
  before: VisualDeltaSample;
  after: VisualDeltaSample;
  /** Minimum delta ratio to count as material change (default 0.02 = 2%) */
  threshold?: number;
}): {
  materialVisualDelta: boolean;
  deltaRatio: number;
  failureCode: typeof VISUAL_NO_OP_FAILURE_CODE | null;
} {
  const threshold = input.threshold ?? 0.02;
  const deltaRatio = Math.max(input.before.deltaRatio, input.after.deltaRatio);
  const materialVisualDelta = deltaRatio >= threshold;
  return {
    materialVisualDelta,
    deltaRatio,
    failureCode: materialVisualDelta ? null : VISUAL_NO_OP_FAILURE_CODE,
  };
}

/** Compare two same-size RGBA buffers — returns changed pixel ratio. */
export function computePixelDeltaRatio(before: Uint8Array, after: Uint8Array): number {
  if (before.length !== after.length || before.length === 0) return 0;
  let changed = 0;
  const pixels = before.length / 4;
  for (let i = 0; i < before.length; i += 4) {
    const dr = Math.abs(before[i]! - after[i]!);
    const dg = Math.abs(before[i + 1]! - after[i + 1]!);
    const db = Math.abs(before[i + 2]! - after[i + 2]!);
    if (dr + dg + db > 24) changed++;
  }
  return changed / pixels;
}
