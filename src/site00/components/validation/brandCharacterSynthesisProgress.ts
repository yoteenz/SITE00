/** Composite character synthesis timing — mirrors server stale window (15 min). */
export const BRAND_CHARACTER_SYNTHESIS_STALE_MS = 15 * 60 * 1000;
export const BRAND_CHARACTER_SYNTHESIS_TYPICAL_MS = 2 * 60 * 1000;

export type BrandCharacterSynthesisProgress = {
  elapsedMs: number;
  elapsedLabel: string;
  progressPercent: number;
  likelyStalled: boolean;
  approachingStale: boolean;
};

export function formatElapsedMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function computeBrandCharacterSynthesisProgress(
  synthesisStartedAt: string | null | undefined,
  nowMs: number = Date.now(),
): BrandCharacterSynthesisProgress | null {
  if (!synthesisStartedAt) return null;
  const start = new Date(synthesisStartedAt).getTime();
  if (Number.isNaN(start)) return null;

  const elapsedMs = Math.max(0, nowMs - start);
  const progressPercent = Math.min(98, Math.round((elapsedMs / BRAND_CHARACTER_SYNTHESIS_TYPICAL_MS) * 100));

  return {
    elapsedMs,
    elapsedLabel: formatElapsedMs(elapsedMs),
    progressPercent,
    likelyStalled: elapsedMs >= BRAND_CHARACTER_SYNTHESIS_STALE_MS,
    approachingStale: elapsedMs >= BRAND_CHARACTER_SYNTHESIS_TYPICAL_MS * 1.5,
  };
}
