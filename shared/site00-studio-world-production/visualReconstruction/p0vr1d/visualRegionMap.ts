/**
 * VisualRegionMap — spatial arrangement map for reconstruction.
 */

import { randomUUID } from 'node:crypto';
import type { PageVisualDecomposition } from './types.js';
import type { RegionCorrectionStatus, VisualRegionMap, VisualRegionMapEntry } from './types.js';

export function buildVisualRegionMap(decomposition: PageVisualDecomposition): VisualRegionMap {
  const entries: VisualRegionMapEntry[] = decomposition.layoutRegions.map((layout) => {
    return {
      regionId: layout.regionId,
      mapRole: layout.role,
      bounds: {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
      },
      normalizedBounds: {
        x: layout.relativeX,
        y: layout.relativeY,
        width: layout.relativeWidth,
        height: layout.relativeHeight,
      },
      correctionStatus: 'NEEDS_ADJUSTMENT' as RegionCorrectionStatus,
      lockState: 'UNRESOLVED',
    };
  });

  return {
    mapId: randomUUID(),
    referenceAssetId: decomposition.referenceAssetId,
    entries,
  };
}

export function lockMatchedRegions(
  map: VisualRegionMap,
  matchedRegionIds: string[],
): VisualRegionMap {
  return {
    ...map,
    entries: map.entries.map((entry) =>
      matchedRegionIds.includes(entry.regionId)
        ? { ...entry, correctionStatus: 'LOCKED', lockState: 'LOCKED' }
        : entry,
    ),
  };
}

export function regionsNeedingCorrection(map: VisualRegionMap): VisualRegionMapEntry[] {
  return map.entries.filter((e) => e.correctionStatus === 'NEEDS_ADJUSTMENT');
}
