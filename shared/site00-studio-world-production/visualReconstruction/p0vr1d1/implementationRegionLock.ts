/**
 * P0.VR.1D.1 — ImplementationRegionLock states.
 */

import type { ImplementationRegionLock, ImplementationRegionLockState, ReferenceDomDelta } from './types.js';

export function createInitialImplementationRegionLocks(regionIds: string[]): ImplementationRegionLock[] {
  return regionIds.map((regionId) => ({
    regionId,
    state: 'UNMEASURED',
    lockedAt: null,
  }));
}

export function updateRegionLocksFromDomDelta(input: {
  locks: ImplementationRegionLock[];
  domDelta: ReferenceDomDelta;
  tolerancePx?: number;
}): ImplementationRegionLock[] {
  const tolerance = input.tolerancePx ?? 3;

  return input.locks.map((lock) => {
    const regionDeltas = input.domDelta.entries.filter((e) => e.regionId === lock.regionId);
    if (regionDeltas.length === 0) {
      if (lock.state === 'UNMEASURED') {
        return { ...lock, state: 'MATCHED' as ImplementationRegionLockState, lockedAt: new Date().toISOString() };
      }
      if (lock.state === 'MATCHED') {
        return { ...lock, state: 'LOCKED' as ImplementationRegionLockState, lockedAt: lock.lockedAt ?? new Date().toISOString() };
      }
      return lock;
    }

    const drifting = regionDeltas.some((d) => typeof d.delta === 'number' && Math.abs(d.delta) > tolerance);
    if (drifting) {
      return { ...lock, state: 'DRIFTING', lockedAt: null };
    }
    return lock;
  });
}

export function lockedRegionIds(locks: ImplementationRegionLock[]): string[] {
  return locks.filter((l) => l.state === 'LOCKED' || l.state === 'MATCHED').map((l) => l.regionId);
}

export function matchedRegionsRewrittenDuringOtherFixes(
  locks: ImplementationRegionLock[],
  patchedRegionIds: string[],
): boolean {
  const locked = new Set(locks.filter((l) => l.state === 'LOCKED').map((l) => l.regionId));
  return patchedRegionIds.some((id) => locked.has(id));
}

export function implementationRegionLockImplemented(locks: ImplementationRegionLock[]): boolean {
  return locks.length > 0 && locks.every((l) => ['UNMEASURED', 'DRIFTING', 'MATCHED', 'LOCKED'].includes(l.state));
}
