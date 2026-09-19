/**
 * P0.VR.DIAG.1R2 — Type-aware dimension requirements per visual region type.
 */

import type { DimensionImportance, VisualRegionType } from './types.js';

export type DimensionRequirement = {
  dimension: string;
  importance: DimensionImportance;
};

export type RegionMeasurementProfile = {
  regionType: VisualRegionType;
  required: DimensionRequirement[];
  optional: DimensionRequirement[];
};

const HEADER: RegionMeasurementProfile = {
  regionType: 'HEADER',
  required: [
    { dimension: 'height', importance: 'CRITICAL' },
    { dimension: 'width', importance: 'HIGH' },
    { dimension: 'leftInset', importance: 'CRITICAL' },
    { dimension: 'rightInset', importance: 'HIGH' },
    { dimension: 'topOffset', importance: 'HIGH' },
    { dimension: 'bottomEdgeY', importance: 'MEDIUM' },
  ],
  optional: [
    { dimension: 'internalAlignment', importance: 'MEDIUM' },
    { dimension: 'controlSize', importance: 'MEDIUM' },
    { dimension: 'paddingTop', importance: 'LOW' },
  ],
};

const IDENTITY: RegionMeasurementProfile = {
  regionType: 'IDENTITY',
  required: [
    { dimension: 'x', importance: 'HIGH' },
    { dimension: 'y', importance: 'HIGH' },
    { dimension: 'width', importance: 'CRITICAL' },
    { dimension: 'height', importance: 'CRITICAL' },
    { dimension: 'leftInset', importance: 'HIGH' },
    { dimension: 'fontSize', importance: 'MEDIUM' },
    { dimension: 'lineHeight', importance: 'MEDIUM' },
  ],
  optional: [
    { dimension: 'titleBlockWidthPct', importance: 'MEDIUM' },
    { dimension: 'subtitleGap', importance: 'LOW' },
  ],
};

const NAVIGATION: RegionMeasurementProfile = {
  regionType: 'NAVIGATION',
  required: [
    { dimension: 'containerHeight', importance: 'CRITICAL' },
    { dimension: 'leftInset', importance: 'CRITICAL' },
    { dimension: 'rightInset', importance: 'HIGH' },
    { dimension: 'itemGap', importance: 'CRITICAL' },
    { dimension: 'itemCount', importance: 'MEDIUM' },
  ],
  optional: [
    { dimension: 'activeIndicatorWidth', importance: 'HIGH' },
    { dimension: 'activeIndicatorHeight', importance: 'HIGH' },
    { dimension: 'labelFontSize', importance: 'MEDIUM' },
    { dimension: 'verticalAlignment', importance: 'MEDIUM' },
  ],
};

const MEDIA: RegionMeasurementProfile = {
  regionType: 'MEDIA',
  required: [
    { dimension: 'x', importance: 'HIGH' },
    { dimension: 'y', importance: 'HIGH' },
    { dimension: 'width', importance: 'CRITICAL' },
    { dimension: 'height', importance: 'CRITICAL' },
    { dimension: 'aspectRatio', importance: 'CRITICAL' },
    { dimension: 'leftInset', importance: 'HIGH' },
    { dimension: 'rightInset', importance: 'HIGH' },
  ],
  optional: [
    { dimension: 'topOffset', importance: 'MEDIUM' },
    { dimension: 'occupiedAreaPct', importance: 'MEDIUM' },
    { dimension: 'cropScale', importance: 'MEDIUM' },
  ],
};

const HERO: RegionMeasurementProfile = { ...MEDIA, regionType: 'HERO' };

const STATUS_BAND: RegionMeasurementProfile = {
  regionType: 'STATUS',
  required: [
    { dimension: 'bandHeight', importance: 'CRITICAL' },
    { dimension: 'bandWidth', importance: 'HIGH' },
    { dimension: 'padding', importance: 'HIGH' },
    { dimension: 'leftInset', importance: 'HIGH' },
  ],
  optional: [
    { dimension: 'progressTrackHeight', importance: 'MEDIUM' },
    { dimension: 'internalGap', importance: 'MEDIUM' },
    { dimension: 'labelFontSize', importance: 'LOW' },
  ],
};

const METRICS: RegionMeasurementProfile = {
  regionType: 'METRICS',
  required: [
    { dimension: 'containerHeight', importance: 'CRITICAL' },
    { dimension: 'cellCount', importance: 'HIGH' },
    { dimension: 'cellWidth', importance: 'HIGH' },
    { dimension: 'gap', importance: 'CRITICAL' },
    { dimension: 'padding', importance: 'MEDIUM' },
  ],
  optional: [
    { dimension: 'valueFontSize', importance: 'MEDIUM' },
    { dimension: 'labelFontSize', importance: 'MEDIUM' },
  ],
};

const LIST: RegionMeasurementProfile = {
  regionType: 'LIST',
  required: [
    { dimension: 'sectionWidth', importance: 'CRITICAL' },
    { dimension: 'sectionHeight', importance: 'CRITICAL' },
    { dimension: 'rowHeight', importance: 'HIGH' },
    { dimension: 'rowGap', importance: 'HIGH' },
    { dimension: 'leftInset', importance: 'HIGH' },
  ],
  optional: [
    { dimension: 'gutter', importance: 'MEDIUM' },
    { dimension: 'labelColumnWidth', importance: 'MEDIUM' },
  ],
};

const CARD_RAIL: RegionMeasurementProfile = {
  regionType: 'CARD_RAIL',
  required: [
    { dimension: 'railWidth', importance: 'CRITICAL' },
    { dimension: 'cardWidth', importance: 'CRITICAL' },
    { dimension: 'cardHeight', importance: 'HIGH' },
    { dimension: 'cardGap', importance: 'CRITICAL' },
    { dimension: 'railInset', importance: 'HIGH' },
  ],
  optional: [
    { dimension: 'cardCountVisible', importance: 'MEDIUM' },
    { dimension: 'imageAspectRatio', importance: 'MEDIUM' },
  ],
};

const PERSISTENT_NAV: RegionMeasurementProfile = {
  regionType: 'PERSISTENT_NAV',
  required: [
    { dimension: 'height', importance: 'CRITICAL' },
    { dimension: 'width', importance: 'HIGH' },
    { dimension: 'itemCount', importance: 'MEDIUM' },
    { dimension: 'itemWidth', importance: 'HIGH' },
    { dimension: 'leftInset', importance: 'HIGH' },
    { dimension: 'rightInset', importance: 'HIGH' },
  ],
  optional: [
    { dimension: 'topBorderY', importance: 'MEDIUM' },
    { dimension: 'internalPadding', importance: 'MEDIUM' },
    { dimension: 'labelBaseline', importance: 'LOW' },
  ],
};

const DEFAULT: RegionMeasurementProfile = {
  regionType: 'CUSTOM',
  required: [
    { dimension: 'height', importance: 'CRITICAL' },
    { dimension: 'width', importance: 'CRITICAL' },
    { dimension: 'leftOffset', importance: 'HIGH' },
    { dimension: 'topOffset', importance: 'HIGH' },
  ],
  optional: [{ dimension: 'padding', importance: 'MEDIUM' }],
};

const BY_TYPE: Partial<Record<VisualRegionType, RegionMeasurementProfile>> = {
  HEADER,
  IDENTITY,
  NAVIGATION,
  HERO,
  MEDIA,
  STATUS: STATUS_BAND,
  METRICS,
  LIST,
  CARD_RAIL,
  PERSISTENT_NAV,
  FOOTER: PERSISTENT_NAV,
  CONTENT: DEFAULT,
  CONTROLS: DEFAULT,
  CTA: DEFAULT,
  CUSTOM: DEFAULT,
};

export function getRegionMeasurementProfile(regionType: VisualRegionType): RegionMeasurementProfile {
  return BY_TYPE[regionType] ?? DEFAULT;
}

export function allRequirements(profile: RegionMeasurementProfile): DimensionRequirement[] {
  return [...profile.required, ...profile.optional];
}

export function importanceWeight(importance: DimensionImportance): number {
  switch (importance) {
    case 'CRITICAL':
      return 3;
    case 'HIGH':
      return 2;
    case 'MEDIUM':
      return 1;
    default:
      return 0.5;
  }
}
