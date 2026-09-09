/**
 * P0.VR.6R2 — Reference visual region registry from decomposition.
 */

import type { DesignReferenceDecomposition } from '../p0vr7/types.js';
import type { ReferenceVisualRegion, ReferenceVisualRegionRole } from './types.js';

const ROLE_MAP: Record<string, ReferenceVisualRegionRole> = {
  HEADER: 'HEADER',
  PROJECT_SWITCHER: 'HEADER',
  PAGE_TITLE: 'HEADER',
  HERO_OBJECT: 'HERO',
  TAB_BAR: 'TAB_BAR',
  VIEWPORT_CONTROL: 'VIEWPORT_SELECTOR',
  STEPPER: 'STEPPER',
  UPLOAD_CARD: 'PRIMARY_CONTENT',
  ACTIVITY_ROW: 'UTILITY_ROWS',
  BOTTOM_NAV: 'BOTTOM_NAV',
};

function regionId(referenceId: string, componentId: string): string {
  return `region-${referenceId}-${componentId}`;
}

export function buildRegionRegistryFromDecomposition(input: {
  referenceId: string;
  decomposition: DesignReferenceDecomposition;
}): ReferenceVisualRegion[] {
  const { referenceId, decomposition } = input;
  const w = decomposition.globalGeometry.referenceWidth;
  const h = decomposition.globalGeometry.referenceHeight;

  const shell: ReferenceVisualRegion = {
    regionId: regionId(referenceId, 'shell'),
    referenceId,
    semanticRole: 'SHELL',
    parentRegionId: null,
    x: 0,
    y: 0,
    width: w,
    height: h,
    normalizedX: 0,
    normalizedY: 0,
    normalizedWidth: 1,
    normalizedHeight: 1,
    dynamicContent: false,
    maskDuringDiff: false,
    priority: 1,
    expectedAssetSlot: null,
  };

  const regions: ReferenceVisualRegion[] = [shell];

  for (const comp of decomposition.components) {
    const role = ROLE_MAP[comp.semanticRole] ?? 'PRIMARY_CONTENT';
    const dynamicContent =
      comp.semanticRole === 'ACTIVITY_ROW' ||
      comp.semanticRole === 'PAGE_TITLE' ||
      comp.semanticRole === 'PROJECT_SWITCHER';

    regions.push({
      regionId: regionId(referenceId, comp.componentId),
      referenceId,
      semanticRole: role,
      parentRegionId: comp.parentId ? regionId(referenceId, comp.parentId) : shell.regionId,
      x: comp.x,
      y: comp.y,
      width: comp.width,
      height: comp.height,
      normalizedX: comp.x / w,
      normalizedY: comp.y / h,
      normalizedWidth: comp.width / w,
      normalizedHeight: comp.height / h,
      dynamicContent,
      maskDuringDiff: dynamicContent,
      priority: role === 'SHELL' ? 1 : role === 'HERO' ? 3 : 5,
      expectedAssetSlot: comp.classification === 'IMAGE_LIKE_ASSET' ? comp.componentId : null,
    });
  }

  return regions;
}

export function getDefaultDynamicMaskRegions(regions: ReferenceVisualRegion[]): ReferenceVisualRegion[] {
  return regions.filter((r) => r.dynamicContent && r.maskDuringDiff);
}
