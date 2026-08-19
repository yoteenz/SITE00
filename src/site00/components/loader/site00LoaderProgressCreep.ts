import type { Site00LoaderStage } from './site00LoaderConfig';

/** Never creep past this until the gate calls forceComplete (100%). */
export const LOADER_PRE_COMPLETE_PROGRESS_MAX = 98;

/** Target time to fill the final pre-complete band (82 → 98). */
export const LOADER_PROGRESS_SEGMENT_FILL_SEC = 2.8;

/** Linear creep speed — 16pt band / 2.8s ≈ 5.7 pts/s. */
export const LOADER_PROGRESS_CREEP_PTS_PER_SEC = 16 / LOADER_PROGRESS_SEGMENT_FILL_SEC;

/** Upper bound for synthetic progress while a stage is still in flight (stay below next milestone). */
export function resolveLoaderProgressCreepCeiling(stages: Site00LoaderStage[], floor: number): number {
  if (stages.length === 0) return LOADER_PRE_COMPLETE_PROGRESS_MAX;

  const p = Math.min(100, Math.max(0, floor));
  const next = stages.find((stage) => stage.progress > p);
  if (!next) return LOADER_PRE_COMPLETE_PROGRESS_MAX;

  const naturalCeiling = next.progress - 0.01;

  // Hold in the high-90s during cinematic play — 100% only when the gate marks complete.
  if (next.id === 'ready' || next.progress >= 100) {
    return Math.min(naturalCeiling, LOADER_PRE_COMPLETE_PROGRESS_MAX);
  }

  return Math.max(p, naturalCeiling);
}

/** Linear creep toward the ceiling — never sprints (fixed pts/sec). */
export function creepLoaderProgress(current: number, ceiling: number, deltaSeconds: number): number {
  if (current >= ceiling) return current;
  return Math.min(ceiling, current + LOADER_PROGRESS_CREEP_PTS_PER_SEC * deltaSeconds);
}
