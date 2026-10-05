/**
 * P0.VR.1D.9 — PARENT_GEOMETRY_FIRST — child locks blocked until parent shell passes.
 */

import { FAIL_CHILD_LOCKED_BEFORE_PARENT_GEOMETRY } from './constants.js';
import type { ImplementationRegionLock } from '../p0vr1d1/types.js';
import { PARENT_SHELL_REGION_ORDER } from './constants.js';
import { shellGeometryPassesBeforeChildLocks } from './visualShellMatchEvaluation.js';
import type { VisualShellMatchEvaluation } from './types.js';

export const PARENT_GEOMETRY_FIRST = true as const;

export function filterChildLocksUntilParentGeometryPasses(input: {
  locks: ImplementationRegionLock[];
  shellEvaluation: VisualShellMatchEvaluation;
}): { allowedLocks: ImplementationRegionLock[]; blockedRegionIds: string[] } {
  const parentSet = new Set<string>(PARENT_SHELL_REGION_ORDER);
  const parentPass = shellGeometryPassesBeforeChildLocks(input.shellEvaluation);

  if (parentPass) {
    return { allowedLocks: input.locks, blockedRegionIds: [] };
  }

  const blockedRegionIds: string[] = [];
  const allowedLocks = input.locks.map((lock) => {
    if (parentSet.has(lock.regionId)) {
      return lock;
    }
    if (lock.state === 'LOCKED' || lock.state === 'MATCHED') {
      blockedRegionIds.push(lock.regionId);
      return { ...lock, state: 'UNMEASURED' as const, lockedAt: null };
    }
    return lock;
  });

  return { allowedLocks, blockedRegionIds };
}

export function parentGeometryFirstViolation(blockedRegionIds: string[]): string | null {
  if (blockedRegionIds.length === 0) return null;
  return FAIL_CHILD_LOCKED_BEFORE_PARENT_GEOMETRY;
}
