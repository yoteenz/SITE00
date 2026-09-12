/**
 * P0.VR.DIAG.1R5 — Per-report internal structure cache (invalidated on recovery).
 */

import type { RegionInternalStructure } from './types.js';

type Entry = {
  current: RegionInternalStructure;
  authority: RegionInternalStructure;
};

const byReport = new Map<string, Map<string, Entry>>();

export function storeRegionInternalStructures(
  reportId: string,
  entries: Array<{ regionId: string; current: RegionInternalStructure; authority: RegionInternalStructure }>,
): void {
  const map = new Map<string, Entry>();
  for (const e of entries) {
    map.set(e.regionId, { current: e.current, authority: e.authority });
  }
  byReport.set(reportId, map);
}

export function getRegionInternalStructure(
  reportId: string,
  regionId: string,
): { current: RegionInternalStructure; authority: RegionInternalStructure } | null {
  return byReport.get(reportId)?.get(regionId) ?? null;
}

export function invalidateRegionInternalStructureCache(reportId: string): void {
  byReport.delete(reportId);
}

export function resetRegionInternalStructureRegistryForTest(): void {
  byReport.clear();
}
