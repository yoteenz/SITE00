import type { Site00LoaderStage } from './site00LoaderConfig';

/**
 * Gray subtitle for the loader — reflects the stage currently in progress
 * (first milestone not yet reached), not the last completed stage.
 */
export function resolveActiveStageSubtitle(stages: Site00LoaderStage[], progress: number): string {
  if (stages.length === 0) return '';

  const p = Math.min(100, Math.max(0, progress));
  if (p >= 100) return stages[stages.length - 1]?.subtitle ?? '';

  const active = stages.find((stage) => p < stage.progress);
  return active?.subtitle ?? stages[stages.length - 1]?.subtitle ?? '';
}
