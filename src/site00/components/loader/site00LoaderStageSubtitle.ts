import type { Site00LoaderStage } from './site00LoaderConfig';

/**
 * Gray subtitle for the loader — reflects work in progress for the current band.
 * The final "ready" line appears only when progress reaches 100%.
 */
export function resolveActiveStageSubtitle(stages: Site00LoaderStage[], progress: number): string {
  if (stages.length === 0) return '';

  const p = Math.min(100, Math.max(0, progress));
  if (p >= 100) return stages[stages.length - 1]?.subtitle ?? '';

  const nextIdx = stages.findIndex((stage) => p < stage.progress);
  if (nextIdx === -1) return stages[stages.length - 1]?.subtitle ?? '';
  if (nextIdx === 0) return stages[0]?.subtitle ?? '';

  // Below 100% but approaching the ready milestone — keep the prior stage copy.
  if (nextIdx === stages.length - 1) {
    return stages[nextIdx - 1]?.subtitle ?? stages[0]?.subtitle ?? '';
  }

  return stages[nextIdx]?.subtitle ?? stages[0]?.subtitle ?? '';
}
