/**
 * P0.VR.DIAG.1R2 — Authority-side geometry from image bounds + shell spec.
 */

import type { PageRegionLayoutDefinition } from './pageRegionLayoutProfiles.js';
import { geometryMetrics } from './stackLayout.js';
import type {
  DimensionMeasurementSource,
  ForensicConfidence,
  VisualRegionBounds,
} from './types.js';

export type AuthorityScalar = {
  value: number;
  display: string;
  unit: 'px' | 'pct' | 'ratio' | 'count';
  source: DimensionMeasurementSource;
  confidence: ForensicConfidence;
  rangeLow?: number;
  rangeHigh?: number;
};

export type AuthorityImageExtraction = {
  scalars: Map<string, AuthorityScalar>;
};

function formatRange(low: number, high: number, unit: string, confidence: ForensicConfidence): string {
  if (confidence === 'HIGH') return `${Math.round(low)}${unit}`;
  if (Math.abs(high - low) <= 1) return `${Math.round(low)}${unit}`;
  return `${Math.round(low)}–${Math.round(high)}${unit}`;
}

export function extractAuthorityImageMeasurements(input: {
  def: PageRegionLayoutDefinition;
  authority: VisualRegionBounds;
  shell?: { headerPaddingX: number; contentPaddingX: number; sectionGap?: number } | null;
  viewportWidth: number;
}): AuthorityImageExtraction {
  const scalars = new Map<string, AuthorityScalar>();
  const auth = geometryMetrics(input.authority.geometry);

  const putExact = (dimension: string, value: number, unit: AuthorityScalar['unit'], confidence: ForensicConfidence = 'MEDIUM') => {
    const suffix = unit === 'pct' ? '%' : unit === 'ratio' ? '' : 'px';
    scalars.set(dimension, {
      value,
      display: unit === 'ratio' ? `${Math.round(value * 100) / 100}` : `${Math.round(value * 10) / 10}${suffix}`,
      unit,
      source: 'AUTHORITY_IMAGE_ESTIMATE',
      confidence,
    });
  };

  const putEstimate = (dimension: string, low: number, high: number, unit: AuthorityScalar['unit'] = 'px') => {
    const mid = (low + high) / 2;
    scalars.set(dimension, {
      value: mid,
      display: formatRange(low, high, unit === 'ratio' ? '' : 'px', 'MEDIUM'),
      unit,
      source: 'AUTHORITY_IMAGE_ESTIMATE',
      confidence: 'MEDIUM',
      rangeLow: low,
      rangeHigh: high,
    });
  };

  putExact('x', auth.x, 'px', 'HIGH');
  putExact('y', auth.y, 'px', 'HIGH');
  putExact('width', auth.width, 'px', 'HIGH');
  putExact('height', auth.height, 'px', 'HIGH');
  putExact('leftOffset', auth.leftOffset, 'px', 'HIGH');
  putExact('topOffset', auth.topOffset, 'px', 'HIGH');
  putExact('bottomEdgeY', auth.y + auth.height, 'px', 'HIGH');
  putExact('aspectRatio', auth.aspectRatio, 'ratio', 'HIGH');
  putExact('occupiedAreaPct', auth.occupiedAreaPct, 'pct', 'MEDIUM');

  const headerPad = input.shell?.headerPaddingX;
  const contentPad = input.shell?.contentPaddingX;
  if (input.def.regionType === 'HEADER' && headerPad != null) {
    putExact('leftInset', headerPad, 'px', 'HIGH');
    putExact('rightInset', headerPad, 'px', 'HIGH');
  } else if (contentPad != null) {
    putExact('leftInset', contentPad, 'px', 'MEDIUM');
    putExact('rightInset', contentPad, 'px', 'MEDIUM');
  } else {
    putExact('leftInset', auth.leftOffset, 'px', 'MEDIUM');
    putExact('rightInset', auth.rightOffset, 'px', 'MEDIUM');
  }

  putExact('containerHeight', auth.height, 'px', 'HIGH');
  putExact('bandHeight', auth.height, 'px', 'HIGH');
  putExact('bandWidth', auth.width, 'px', 'HIGH');
  putExact('sectionWidth', auth.width, 'px', 'HIGH');
  putExact('sectionHeight', auth.height, 'px', 'HIGH');
  putExact('railWidth', auth.width, 'px', 'HIGH');
  putExact('railInset', auth.leftOffset, 'px', 'MEDIUM');

  if (input.def.regionType === 'NAVIGATION') {
    const gap = input.shell?.sectionGap ?? 8;
    putEstimate('itemGap', Math.max(4, gap - 2), gap + 4);
    putEstimate('activeIndicatorWidth', Math.max(24, auth.width * 0.12), Math.max(36, auth.width * 0.18));
    putExact('activeIndicatorHeight', 2, 'px', 'LOW');
    putExact('itemCount', 4, 'count', 'LOW');
  }

  if (input.def.regionType === 'HEADER') {
    putEstimate('controlSize', 28, 36);
  }

  if (input.def.regionType === 'IDENTITY' || input.def.regionType === 'HERO' || input.def.regionType === 'MEDIA') {
    putEstimate('fontSize', Math.max(11, auth.height * 0.08), Math.max(14, auth.height * 0.14));
  }

  if (input.def.regionType === 'METRICS' || input.def.regionType === 'CARD_RAIL') {
    putEstimate('cardGap', 8, 14);
    putEstimate('cellWidth', auth.width * 0.2, auth.width * 0.35);
    putExact('cellCount', 3, 'count', 'LOW');
  }

  if (input.def.regionType === 'PERSISTENT_NAV' || input.def.shellBound === 'bottom-nav') {
    putExact('itemCount', 5, 'count', 'MEDIUM');
    putEstimate('itemWidth', input.viewportWidth / 6, input.viewportWidth / 4);
  }

  putEstimate('padding', 0, 12);

  return { scalars };
}
