import type { Site00LoaderStage } from './site00LoaderConfig';

/** Upper bound for synthetic progress while a stage is still in flight (stay below next milestone). */
export function resolveLoaderProgressCreepCeiling(stages: Site00LoaderStage[], floor: number): number {
  if (stages.length === 0) return 100;

  const p = Math.min(100, Math.max(0, floor));
  const next = stages.find((stage) => stage.progress > p);
  if (!next) return 100;

  return Math.max(p, next.progress - 0.01);
}

/** ~8% of remaining gap per second — keeps the bar and stage subtitle feeling live between milestones. */
export function creepLoaderProgress(current: number, ceiling: number, deltaSeconds: number): number {
  if (current >= ceiling) return current;
  const gap = ceiling - current;
  const step = Math.max(0.08, gap * 0.08 * deltaSeconds * 60);
  return Math.min(ceiling, current + step);
}
