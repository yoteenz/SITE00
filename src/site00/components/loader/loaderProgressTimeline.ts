/** Wait until immersive loader environment animation signals ready/playing. */
export function waitForLoaderAnimationStart(getReady: () => boolean, timeoutMs = 8000): Promise<void> {
  if (getReady()) return Promise.resolve();
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (getReady()) {
        resolve();
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve();
        return;
      }
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });
}

export function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

type RunLoaderStageTimelineOptions = {
  stageIds: string[];
  completeStage: (stageId: string) => void;
  animationStartedAt: number;
  minGeometryPlayMs: number;
  minCinematicMs: number;
  isCancelled: () => boolean;
};

/**
 * Advance loader progress stages after animation has begun.
 * Spreads stage completions across the minimum geometry play window.
 */
export async function runLoaderStageTimeline({
  stageIds,
  completeStage,
  animationStartedAt,
  minGeometryPlayMs,
  minCinematicMs,
  isCancelled,
}: RunLoaderStageTimelineOptions): Promise<void> {
  if (stageIds.length === 0) return;

  const stageIntervalMs =
    stageIds.length > 1 ? Math.max(280, Math.floor(minGeometryPlayMs / (stageIds.length - 1))) : 0;

  for (let index = 0; index < stageIds.length; index += 1) {
    if (isCancelled()) return;
    completeStage(stageIds[index]);
    if (index < stageIds.length - 1 && stageIntervalMs > 0) {
      await sleepMs(stageIntervalMs);
    }
  }

  const geometryElapsed = Date.now() - animationStartedAt;
  if (geometryElapsed < minGeometryPlayMs) {
    await sleepMs(minGeometryPlayMs - geometryElapsed);
  }
  if (isCancelled()) return;

  const cinematicElapsed = Date.now() - animationStartedAt;
  if (cinematicElapsed < minCinematicMs) {
    await sleepMs(minCinematicMs - cinematicElapsed);
  }
}
