/**
 * P0.VR.DIAG.1R5A — Scoped internal structure cache (page + capture + forensics version).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { RegionInternalStructure } from './types.js';

export type StructureCacheKeyInput = {
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string | null;
  captureId: string;
  forensicsVersion: string;
};

type Entry = {
  current: RegionInternalStructure;
  authority: RegionInternalStructure;
};

const byKey = new Map<string, Map<string, Entry>>();

export function structureCacheKey(input: StructureCacheKeyInput): string {
  return `${input.pageId}|${input.viewport}|${input.authorityVersionId ?? 'na'}|${input.captureId}|${input.forensicsVersion}`;
}

export function storeRegionInternalStructures(
  cacheKey: string,
  entries: Array<{ regionId: string; current: RegionInternalStructure; authority: RegionInternalStructure }>,
): void {
  const map = byKey.get(cacheKey) ?? new Map<string, Entry>();
  for (const e of entries) {
    map.set(e.regionId, { current: e.current, authority: e.authority });
  }
  byKey.set(cacheKey, map);
}

/** @deprecated Use structureCacheKey — kept for tests migrating from reportId-only storage. */
export function storeRegionInternalStructuresByReportId(
  reportId: string,
  entries: Array<{ regionId: string; current: RegionInternalStructure; authority: RegionInternalStructure }>,
): void {
  storeRegionInternalStructures(`report:${reportId}`, entries);
}

export function getRegionInternalStructure(cacheKey: string, regionId: string): { current: RegionInternalStructure; authority: RegionInternalStructure } | null {
  return byKey.get(cacheKey)?.get(regionId) ?? null;
}

export function invalidateRegionInternalStructureCache(cacheKey: string): void {
  byKey.delete(cacheKey);
}

export function resetRegionInternalStructureRegistryForTest(): void {
  byKey.clear();
}
