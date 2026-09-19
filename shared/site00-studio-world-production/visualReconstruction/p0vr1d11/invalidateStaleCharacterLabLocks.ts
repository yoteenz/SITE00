/**
 * P0.VR.1D.11 — Non-destructive stale lock invalidation for Character Lab rebuild.
 */

export const STALE_AFTER_CHARACTER_LAB_REFERENCE_REBUILD = 'STALE_AFTER_CHARACTER_LAB_REFERENCE_REBUILD' as const;

export function markStaleCharacterLabLocks(
  locks: Array<{ regionId: string; status: string }>,
): Array<{ regionId: string; status: string; priorStatus?: string }> {
  return locks.map((lock) =>
    lock.status === 'MATCHED' || lock.status === 'LOCKED'
      ? { ...lock, priorStatus: lock.status, status: STALE_AFTER_CHARACTER_LAB_REFERENCE_REBUILD }
      : lock,
  );
}

export function staleCharacterLabLockDoesNotBlockRebuild(
  locks: Array<{ status: string }>,
): boolean {
  return !locks.some((l) => l.status === 'LOCKED');
}
