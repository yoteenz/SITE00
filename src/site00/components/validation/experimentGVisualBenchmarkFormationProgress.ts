/** Visual benchmark formulation timing — mirrors server stale window (15 min). */
export const VISUAL_BENCHMARK_FORMATION_STALE_MS = 15 * 60 * 1000;
export const VISUAL_BENCHMARK_FORMATION_TYPICAL_MS = 4 * 60 * 1000;
export const VISUAL_BENCHMARK_FORMATION_TOTAL = 6;

export type VisualBenchmarkFormationProgress = {
  elapsedMs: number;
  elapsedLabel: string;
  progressPercent: number;
  estimatedBenchmarkIndex: number;
  likelyStalled: boolean;
  approachingStale: boolean;
};

export function formatElapsedMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function computeVisualBenchmarkFormationProgress(
  formationStartedAt: string | null | undefined,
  benchmarksSaved: number,
  nowMs: number = Date.now(),
): VisualBenchmarkFormationProgress | null {
  if (!formationStartedAt) return null;
  const start = new Date(formationStartedAt).getTime();
  if (Number.isNaN(start)) return null;

  const elapsedMs = Math.max(0, nowMs - start);
  const progressPercent = Math.min(
    98,
    Math.max(
      benchmarksSaved > 0
        ? Math.round((benchmarksSaved / VISUAL_BENCHMARK_FORMATION_TOTAL) * 100)
        : Math.round((elapsedMs / VISUAL_BENCHMARK_FORMATION_TYPICAL_MS) * 100),
      Math.round((elapsedMs / VISUAL_BENCHMARK_FORMATION_TYPICAL_MS) * 100),
    ),
  );
  const slice = VISUAL_BENCHMARK_FORMATION_TYPICAL_MS / VISUAL_BENCHMARK_FORMATION_TOTAL;
  const estimatedBenchmarkIndex = Math.min(
    VISUAL_BENCHMARK_FORMATION_TOTAL,
    Math.max(benchmarksSaved || 1, Math.ceil(elapsedMs / slice) || 1),
  );

  return {
    elapsedMs,
    elapsedLabel: formatElapsedMs(elapsedMs),
    progressPercent,
    estimatedBenchmarkIndex,
    likelyStalled: elapsedMs >= VISUAL_BENCHMARK_FORMATION_STALE_MS,
    approachingStale: elapsedMs >= VISUAL_BENCHMARK_FORMATION_TYPICAL_MS * 1.5,
  };
}
