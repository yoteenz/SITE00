import type { ImplementationRegionLock } from '../p0vr1d1/types.js';
import { STALE_AFTER_CAMPAIGN_REFERENCE_REBUILD } from './constants.js';

export function invalidateStaleCampaignBoardLocks(
  locks: ImplementationRegionLock[],
  lineage = 'P0.VR.1D.13',
): { staleExtensions: Array<{ regionId: string; state: string; reason: string }>; refreshedLocks: ImplementationRegionLock[] } {
  const staleExtensions: Array<{ regionId: string; state: string; reason: string }> = [];

  const refreshedLocks = locks.map((lock) => {
    const wasMatched = lock.state === 'MATCHED' || lock.state === 'LOCKED';
    if (wasMatched) {
      staleExtensions.push({
        regionId: lock.regionId,
        state: STALE_AFTER_CAMPAIGN_REFERENCE_REBUILD,
        reason: `${lineage}: superseded by CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY`,
      });
      return { ...lock, state: 'UNMEASURED' as const, lockedAt: null };
    }
    return lock;
  });

  return { staleExtensions, refreshedLocks };
}

export function staleCampaignLockDoesNotBlockRebuild(
  staleExtensions: Array<{ state: string }>,
): boolean {
  return staleExtensions.every((e) => e.state === STALE_AFTER_CAMPAIGN_REFERENCE_REBUILD);
}
