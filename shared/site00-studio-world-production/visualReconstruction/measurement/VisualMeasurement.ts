/**
 * Visual measurement extraction from regions and blueprint geometry.
 */

import type { VisualMeasurement, VisualReferenceRegion } from '../types.js';

export function measureRegions(regions: VisualReferenceRegion[]): VisualMeasurement[] {
  const measurements: VisualMeasurement[] = [];
  for (const region of regions) {
    measurements.push(
      measurement('x', region.regionId, region.bounds.x, null, 0.9),
      measurement('y', region.regionId, region.bounds.y, null, 0.9),
      measurement('width', region.regionId, region.bounds.width, null, 0.92),
      measurement('height', region.regionId, region.bounds.height, null, 0.88),
      measurement(
        'alignment',
        region.regionId,
        'left',
        `${region.regionId}.left = content-rail.left`,
        0.75,
      ),
    );
  }
  return measurements;
}

export function measureTypographyFromRegions(regions: VisualReferenceRegion[]): VisualMeasurement[] {
  return regions
    .filter((r) => r.visualRole === 'HERO' || r.visualRole === 'METHOD_STAGE' || r.visualRole === 'TEXT_BLOCK')
    .flatMap((region) => [
      measurement('fontSize', region.regionId, region.visualRole === 'HERO' ? 18 : 11, null, 0.7),
      measurement('letterSpacing', region.regionId, 0.1, null, 0.65),
      measurement('fontWeight', region.regionId, 700, null, 0.7),
      measurement('textAlign', region.regionId, 'left', null, 0.8),
    ]);
}

function measurement(
  property: VisualMeasurement['property'],
  regionId: string,
  value: number | string,
  relationship: string | null,
  confidence: number,
): VisualMeasurement {
  return {
    measurementId: `m-${regionId}-${property}`,
    referenceRegionId: regionId,
    property,
    measuredValue: value,
    relationship,
    confidence,
    measurementMethod: 'heuristic',
  };
}

export function evaluateLineWrapMatch(
  referenceLines: number,
  renderLines: number,
): { exact: boolean; delta: number } {
  return { exact: referenceLines === renderLines, delta: Math.abs(referenceLines - renderLines) };
}
