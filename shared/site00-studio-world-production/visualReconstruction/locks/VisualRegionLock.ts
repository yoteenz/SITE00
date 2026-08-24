/**
 * Region locking — prevent fix-one-break-another oscillation.
 */

import type {
  RegionLockState,
  RegionMatchScore,
  ReconstructionPass,
  VisualRegionLock,
} from '../types.js';

export function createInitialRegionLocks(regionIds: string[]): VisualRegionLock[] {
  return regionIds.map((regionId) => ({
    regionId,
    state: 'UNRESOLVED' as RegionLockState,
    lockedAtIteration: null,
    matchScoreAtLock: null,
    invalidatedReason: null,
    passLockedAt: null,
  }));
}

export function updateRegionLocksFromScores(
  locks: VisualRegionLock[],
  scores: RegionMatchScore[],
  iteration: number,
  pass: ReconstructionPass,
  threshold = 0.94,
): VisualRegionLock[] {
  return locks.map((lock) => {
    if (lock.state === 'LOCKED') return lock;
    const score = scores.find((s) => s.regionId === lock.regionId);
    if (!score) return lock;
    if (score.passed && score.structuralSimilarity >= threshold) {
      return {
        ...lock,
        state: 'LOCKED',
        lockedAtIteration: iteration,
        matchScoreAtLock: score.structuralSimilarity,
        passLockedAt: pass,
      };
    }
    return { ...lock, state: 'MATCHING' };
  });
}

export function isRegionLocked(lock: VisualRegionLock): boolean {
  return lock.state === 'LOCKED';
}

export function invalidateRegionLock(
  lock: VisualRegionLock,
  reason: string,
): VisualRegionLock {
  return {
    ...lock,
    state: 'INVALIDATED',
    invalidatedReason: reason,
  };
}

export function detectLockedRegionRegression(
  locks: VisualRegionLock[],
  previousScores: RegionMatchScore[],
  currentScores: RegionMatchScore[],
  toleranceDrop = 0.03,
): VisualRegionLock[] {
  return locks.map((lock) => {
    if (lock.state !== 'LOCKED' || lock.matchScoreAtLock == null) return lock;
    const prev = previousScores.find((s) => s.regionId === lock.regionId);
    const curr = currentScores.find((s) => s.regionId === lock.regionId);
    if (!curr) return lock;
    if (curr.structuralSimilarity < lock.matchScoreAtLock - toleranceDrop) {
      return invalidateRegionLock(lock, 'LOCK_INVALIDATED_BY_DEPENDENCY');
    }
    if (prev && curr.structuralSimilarity < prev.structuralSimilarity - toleranceDrop) {
      return invalidateRegionLock(lock, 'LOCK_INVALIDATED_BY_DEPENDENCY');
    }
    return lock;
  });
}

export function lockedRegionIds(locks: VisualRegionLock[]): string[] {
  return locks.filter((l) => l.state === 'LOCKED').map((l) => l.regionId);
}
