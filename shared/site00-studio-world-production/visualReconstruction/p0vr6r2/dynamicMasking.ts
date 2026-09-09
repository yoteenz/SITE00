/**
 * P0.VR.6R2 — Dynamic content masking (geometry stays measurable).
 */

import type { DynamicContentMask, ReferenceVisualRegion, VisualDeltaMeasurement } from './types.js';

function maskId(regionId: string, kind: DynamicContentMask['kind']): string {
  return `mask-${regionId}-${kind}`;
}

export function buildDefaultDynamicMasks(regions: ReferenceVisualRegion[]): DynamicContentMask[] {
  const masks: DynamicContentMask[] = [];
  for (const region of regions) {
    if (!region.dynamicContent || !region.maskDuringDiff) continue;
    if (region.semanticRole === 'PRIMARY_CONTENT' || region.semanticRole === 'CARD_GRID') {
      masks.push({
        maskId: maskId(region.regionId, 'COUNT'),
        regionId: region.regionId,
        kind: 'COUNT',
        description: 'Mask numeric counts (e.g. project count) — geometry still measured',
      });
    }
    if (region.semanticRole === 'HEADER') {
      masks.push({
        maskId: maskId(region.regionId, 'PROJECT_NAME'),
        regionId: region.regionId,
        kind: 'PROJECT_NAME',
        description: 'Mask project name text — layout geometry preserved',
      });
    }
    if (region.semanticRole === 'UTILITY_ROWS') {
      masks.push({
        maskId: maskId(region.regionId, 'DYNAMIC_STATUS'),
        regionId: region.regionId,
        kind: 'DYNAMIC_STATUS',
        description: 'Mask activity status labels',
      });
    }
    if (region.expectedAssetSlot) {
      masks.push({
        maskId: maskId(region.regionId, 'LIVE_IMAGE'),
        regionId: region.regionId,
        kind: 'LIVE_IMAGE',
        description: 'Mask live image pixel content when asset varies',
      });
    }
  }
  return masks;
}

export function applyDynamicMasksToDeltas(
  deltas: VisualDeltaMeasurement[],
  masks: DynamicContentMask[],
): VisualDeltaMeasurement[] {
  const maskedRegionIds = new Set(masks.map((m) => m.regionId));
  return deltas.map((d) => {
    if (!maskedRegionIds.has(d.regionId)) return d;
    if (d.driftType === 'TYPOGRAPHY_DRIFT' && d.description.toLowerCase().includes('text')) {
      return { ...d, masked: true, severity: 'ACCEPTABLE_VARIANCE', description: `${d.description} (dynamic text masked)` };
    }
    return { ...d, masked: true };
  });
}

export function geometryDriftRemainsAfterMasking(deltas: VisualDeltaMeasurement[]): VisualDeltaMeasurement[] {
  return deltas.filter(
    (d) =>
      !d.masked &&
      (d.deltaX != null || d.deltaY != null || d.deltaWidth != null || d.deltaHeight != null) &&
      (Math.abs(d.deltaX ?? 0) > 2 ||
        Math.abs(d.deltaY ?? 0) > 2 ||
        Math.abs(d.deltaWidth ?? 0) > 2 ||
        Math.abs(d.deltaHeight ?? 0) > 2),
  );
}
