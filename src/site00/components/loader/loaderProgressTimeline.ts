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

export type LoaderStageTask = {
  stageId: string;
  task: Promise<unknown>;
};

/** Advance each stage only after its backing asset/task promise settles. */
export async function advanceLoaderStagesFromTasks(
  tasks: LoaderStageTask[],
  completeStage: (stageId: string) => void,
  isCancelled: () => boolean,
): Promise<void> {
  for (const { stageId, task } of tasks) {
    await task;
    if (isCancelled()) return;
    completeStage(stageId);
  }
}

/** Hold on the final animation loop before revealing the destination page. */
export async function waitForMinCinematicHold(
  animationStartedAt: number,
  minGeometryPlayMs: number,
  minCinematicMs: number,
  isCancelled: () => boolean,
): Promise<void> {
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
