/** Direction formation timing — mirrors server STALE_FORMING_MS (15 min). */
export const DIRECTION_FORMATION_STALE_MS = 15 * 60 * 1000;
export const DIRECTION_FORMATION_TYPICAL_MS = 5 * 60 * 1000;
export const DIRECTION_FORMATION_PARENT_COUNT = 3;
export const DIRECTION_FORMATION_TOTAL_DIRECTIONS = 9;

export type DirectionFormationProgress = {
  elapsedMs: number;
  elapsedLabel: string;
  progressPercent: number;
  estimatedParentIndex: number;
  likelyStalled: boolean;
  approachingStale: boolean;
};

export function formatElapsedMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function computeDirectionFormationProgress(
  formationStartedAt: string | null | undefined,
  nowMs: number = Date.now(),
): DirectionFormationProgress | null {
  if (!formationStartedAt) return null;
  const start = new Date(formationStartedAt).getTime();
  if (Number.isNaN(start)) return null;

  const elapsedMs = Math.max(0, nowMs - start);
  const progressPercent = Math.min(
    98,
    Math.round((elapsedMs / DIRECTION_FORMATION_TYPICAL_MS) * 100),
  );
  const slice = DIRECTION_FORMATION_TYPICAL_MS / DIRECTION_FORMATION_PARENT_COUNT;
  const estimatedParentIndex = Math.min(
    DIRECTION_FORMATION_PARENT_COUNT,
    Math.max(1, Math.ceil(elapsedMs / slice) || 1),
  );

  return {
    elapsedMs,
    elapsedLabel: formatElapsedMs(elapsedMs),
    progressPercent,
    estimatedParentIndex,
    likelyStalled: elapsedMs >= DIRECTION_FORMATION_STALE_MS,
    approachingStale: elapsedMs >= DIRECTION_FORMATION_TYPICAL_MS * 1.5,
  };
}
