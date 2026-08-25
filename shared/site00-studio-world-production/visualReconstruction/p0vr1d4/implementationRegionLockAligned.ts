/**
 * P0.VR.1D.4 — Region lock rules requiring mapping + real measurement.
 */

import type { ImplementationRegionLock, ImplementationRegionLockState } from '../p0vr1d1/types.js';
import type { MappedDomDeltaEntry, MappedReferenceDomDelta, ReferenceDomRegionMap } from './types.js';

export const FAIL_REGION_LOCK_WITHOUT_MEASUREMENT = 'FAIL_REGION_LOCK_WITHOUT_MEASUREMENT' as const;

export function updateRegionLocksFromMappedDomDelta(input: {
  locks: ImplementationRegionLock[];
  mappedDelta: MappedReferenceDomDelta;
  regionMap: ReferenceDomRegionMap;
  tolerancePx?: number;
}): { locks: ImplementationRegionLock[]; invalidLocks: string[]; unmappedLocked: string[] } {
  const tolerance = input.tolerancePx ?? 3;
  const mappedCanonical = new Set(
    input.regionMap.entries.map((e) => e.canonicalRegionId),
  );
  const measuredCanonical = new Set<string>();
  for (const entry of input.mappedDelta.entries as MappedDomDeltaEntry[]) {
    measuredCanonical.add(entry.canonicalRegionId);
  }
  if (input.mappedDelta.mappedRegionCount > 0 && input.mappedDelta.entries.length === 0) {
    input.regionMap.entries.forEach((e) => measuredCanonical.add(e.canonicalRegionId));
  }

  const invalidLocks: string[] = [];
  const unmappedLocked: string[] = [];

  const locks = input.locks.map((lock) => {
    const { canonicalRegionId } = normalizeLockRegionId(lock.regionId);
    const hasMapping = mappedCanonical.has(canonicalRegionId) || mappedCanonical.has(lock.regionId);
    const regionEntries = (input.mappedDelta.entries as MappedDomDeltaEntry[]).filter(
      (e) => e.canonicalRegionId === canonicalRegionId || e.regionId === lock.regionId,
    );
    const hasMeasurement = measuredCanonical.has(canonicalRegionId) || regionEntries.length > 0;

    if (!hasMapping || !hasMeasurement) {
      if (lock.state === 'LOCKED' || lock.state === 'MATCHED') {
        unmappedLocked.push(lock.regionId);
        invalidLocks.push(lock.regionId);
      }
      return { ...lock, state: 'UNMEASURED' as ImplementationRegionLockState, lockedAt: null };
    }

    const drifting = regionEntries.some((d) => Math.abs(Number(d.delta)) > tolerance);
    if (drifting) {
      return { ...lock, state: 'DRIFTING' as ImplementationRegionLockState, lockedAt: null };
    }

    if (lock.state === 'LOCKED') {
      return lock;
    }

    if (lock.state === 'MATCHED') {
      return {
        ...lock,
        state: 'LOCKED' as ImplementationRegionLockState,
        lockedAt: lock.lockedAt ?? new Date().toISOString(),
      };
    }

    return {
      ...lock,
      state: 'MATCHED' as ImplementationRegionLockState,
      lockedAt: new Date().toISOString(),
    };
  });

  return { locks, invalidLocks, unmappedLocked };
}

function normalizeLockRegionId(regionId: string): { canonicalRegionId: string } {
  if (regionId.startsWith('ndx.')) return { canonicalRegionId: regionId };
  const legacy: Record<string, string> = {
    'ndx-header': 'ndx.header',
    'ndx-metrics': 'ndx.overview.metrics',
    'ndx-production': 'ndx.production.row',
    'ndx-radar': 'ndx.radar.list',
    'ndx-bottom-nav': 'ndx.bottom-nav',
    'ndx-project-menu': 'ndx.project.menu',
    'ndx-overview-heading': 'ndx.overview.hero',
    DESKTOP_COMPOSITE_OVERVIEW: 'ndx.overview.desktop-composite',
  };
  return { canonicalRegionId: legacy[regionId] ?? regionId };
}

export function regionLockRequiresRealMeasurement(invalidLocks: string[]): boolean {
  return invalidLocks.length === 0;
}
