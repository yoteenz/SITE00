/**
 * P0.VR.DIAG.1R5 — Authority-side internal structure from region crop bounds.
 */

import type { PageRegionLayoutDefinition } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import { geometryMetrics } from '../p0vrDiag1/stackLayout.js';
import type { VisualRegionBounds, VisualRegionType } from '../p0vrDiag1/types.js';
import { extractCurrentRegionStructure } from './currentRegionStructureExtractor.js';
import type { DomRegionMeasurement } from '../p0vrDiag1/types.js';
import type { RegionInternalStructure } from './types.js';

/** Mirror current structure layout on authority bounds (image-side estimate). */
export function extractAuthorityRegionStructure(input: {
  def: PageRegionLayoutDefinition;
  authority: VisualRegionBounds;
}): RegionInternalStructure {
  const g = geometryMetrics(input.authority.geometry);
  const pseudoDom: DomRegionMeasurement = {
    regionId: input.def.regionId,
    actualX: g.x,
    actualY: g.y,
    actualWidth: g.width,
    actualHeight: g.height,
    computedGap: input.def.regionType === 'NAVIGATION' ? '8px' : '12px',
    computedPadding: '8px 12px',
  };

  const structure = extractCurrentRegionStructure({
    def: input.def,
    dom: pseudoDom,
    relatedDom: [],
  });

  for (const anchor of structure.childAnchors) {
    anchor.source = 'AUTHORITY_IMAGE_ESTIMATE';
    if (anchor.confidence === 'HIGH') anchor.confidence = 'MEDIUM';
  }

  return {
    ...structure,
    structureConfidence: structure.status === 'RESOLVED' ? 'MEDIUM' : 'LOW',
  };
}

export function authorityStructureForType(regionType: VisualRegionType): string[] {
  switch (regionType) {
    case 'NAVIGATION':
      return ['CONTAINER', 'ITEM', 'ACTIVE_ITEM', 'ACTIVE_INDICATOR'];
    case 'METRICS':
      return ['CONTAINER', 'CELL', 'DIVIDER'];
    case 'STATUS':
      return ['CONTAINER', 'TRACK', 'FILL', 'LABEL'];
    case 'CARD_RAIL':
      return ['CONTAINER', 'CARD', 'RAIL'];
    default:
      return ['CONTAINER'];
  }
}
