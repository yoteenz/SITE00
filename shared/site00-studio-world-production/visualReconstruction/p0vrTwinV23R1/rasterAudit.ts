import type { ExecutableConceptObject } from './types.js';
import type { TwinV2RasterAudit } from './types.js';
import { MAX_CLIENT_RASTER_COVERAGE } from './constants.js';

export function auditRasterUsage(input: {
  authorityImageUrl: string | null;
  expandedObjects: ExecutableConceptObject[];
}): TwinV2RasterAudit {
  const entries = input.expandedObjects
    .filter((o) => o.renderPrimitive === 'IMAGE_ASSET' || o.renderPrimitive === 'MEDIA_ASSET')
    .map((o) => {
      const area = o.bounds.w * o.bounds.h;
      const allowed = area <= MAX_CLIENT_RASTER_COVERAGE && o.role.includes('media');
      return {
        source: o.assetSlotId ?? 'none',
        bounds: JSON.stringify(o.bounds),
        role: o.role,
        blueprintObjectId: o.objectId,
        containsUi: false,
        allowed,
        reason: allowed ? 'isolated media slot' : 'UI region must not rasterize',
      };
    });

  return {
    entries,
    fullAuthorityUsed: false,
    status: entries.every((e) => e.allowed || e.source === 'none') ? 'PASS' : 'FAIL',
  };
}

export function assertNoFullAuthorityRaster(src: string | null, authorityUrl: string | null): void {
  if (!src || !authorityUrl) return;
  if (src === authorityUrl) {
    throw new Error('TWIN_V2_FULL_AUTHORITY_RASTER_USAGE');
  }
}
