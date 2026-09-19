/**
 * P0.VR.DIAG.1R5A — Structure result versioning + history.
 */

import type { RegionInternalStructureSummary } from '../p0vrDiag1/types.js';
import type { RegionInternalStructure } from './types.js';
import { structureCacheKey, type StructureCacheKeyInput } from './regionInternalStructureRegistry.js';

export type RegionStructureVersion = {
  structureVersionId: string;
  regionId: string;
  forensicsVersion: string;
  authorityVersionId: string | null;
  captureId: string;
  createdAt: string;
  status: RegionInternalStructureSummary['status'];
  summary: RegionInternalStructureSummary;
};

type HistoryEntry = {
  version: RegionStructureVersion;
  current: RegionInternalStructure;
  authority: RegionInternalStructure;
};

const historyByKey = new Map<string, HistoryEntry[]>();

let versionCounter = 0;
export function resetRegionStructureVersionsForTest(): void {
  historyByKey.clear();
  versionCounter = 0;
}

export function recordRegionStructureVersion(input: {
  cacheKeyInput: StructureCacheKeyInput;
  regionId: string;
  forensicsVersion: string;
  summary: RegionInternalStructureSummary;
  current: RegionInternalStructure;
  authority: RegionInternalStructure;
}): RegionStructureVersion {
  const key = `${structureCacheKey(input.cacheKeyInput)}::${input.regionId}`;
  versionCounter += 1;
  const version: RegionStructureVersion = {
    structureVersionId: `rsv_${input.regionId}_${versionCounter}`,
    regionId: input.regionId,
    forensicsVersion: input.forensicsVersion,
    authorityVersionId: input.cacheKeyInput.authorityVersionId,
    captureId: input.cacheKeyInput.captureId,
    createdAt: new Date().toISOString(),
    status: input.summary.status,
    summary: input.summary,
  };
  const list = historyByKey.get(key) ?? [];
  list.push({ version, current: input.current, authority: input.authority });
  historyByKey.set(key, list);
  return version;
}

export function listRegionStructureHistory(
  cacheKeyInput: StructureCacheKeyInput,
  regionId: string,
): RegionStructureVersion[] {
  const key = `${structureCacheKey(cacheKeyInput)}::${regionId}`;
  return (historyByKey.get(key) ?? []).map((e) => e.version);
}
