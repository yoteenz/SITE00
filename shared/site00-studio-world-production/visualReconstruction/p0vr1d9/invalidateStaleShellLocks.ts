/**
 * P0.VR.1D.9 — Non-destructive stale lock invalidation after shell reconstruction.
 */

import type { ImplementationRegionLock } from '../p0vr1d1/types.js';
import { PARENT_SHELL_REGION_ORDER } from './constants.js';
import type { ShellRegionLockExtension } from './types.js';

export function markStaleLocksAfterShellReconstruction(
  locks: ImplementationRegionLock[],
  lineage = 'P0.VR.1D.9',
): { staleExtensions: ShellRegionLockExtension[]; refreshedLocks: ImplementationRegionLock[] } {
  const now = new Date().toISOString();
  const parentSet = new Set<string>(PARENT_SHELL_REGION_ORDER);
  const staleExtensions: ShellRegionLockExtension[] = [];

  const refreshedLocks = locks.map((lock) => {
    const wasMatched = lock.state === 'MATCHED' || lock.state === 'LOCKED';
    const isChild = !parentSet.has(lock.regionId);
    if (wasMatched && isChild) {
      staleExtensions.push({
        regionId: lock.regionId,
        priorState: lock.state,
        state: 'STALE_AFTER_SHELL_RECONSTRUCTION',
        invalidatedAt: now,
        reason: `${lineage}: parent shell geometry replaced; child lock invalidated`,
      });
      return { ...lock, state: 'UNMEASURED' as const, lockedAt: null };
    }
    if (wasMatched && parentSet.has(lock.regionId)) {
      staleExtensions.push({
        regionId: lock.regionId,
        priorState: lock.state,
        state: 'STALE_AFTER_SHELL_RECONSTRUCTION',
        invalidatedAt: now,
        reason: `${lineage}: shell region remeasured under new visual authority`,
      });
      return { ...lock, state: 'UNMEASURED' as const, lockedAt: null };
    }
    return lock;
  });

  return { staleExtensions, refreshedLocks };
}

export function staleLockDoesNotBlockRebuild(staleExtensions: ShellRegionLockExtension[]): boolean {
  return staleExtensions.every((e) => e.state === 'STALE_AFTER_SHELL_RECONSTRUCTION');
}
