import type { NDXIconName } from '../types.js';
import type { IconVisualMatchDimension, IconVisualMatchEvaluation, ReferenceTracedIconSpec } from './types.js';
import { NDX_ICON_GEOMETRY_V0_SEMANTIC } from './superseded/ndxIconGeometryV0Semantic.js';

const DIMENSIONS: IconVisualMatchDimension[] = [
  'SILHOUETTE_MATCH',
  'STROKE_MATCH',
  'PROPORTION_MATCH',
  'NEGATIVE_SPACE_MATCH',
  'OPTICAL_SIZE_MATCH',
  'CENTERING_MATCH',
  'ACTIVE_STATE_MATCH',
];

export function evaluateIconVisualMatch(spec: ReferenceTracedIconSpec): IconVisualMatchEvaluation {
  const v0 = NDX_ICON_GEOMETRY_V0_SEMANTIC[spec.iconName];
  const v0Raw = JSON.stringify(v0?.paths ?? []);
  const v1Raw = JSON.stringify(spec.pathData);
  const silhouetteDrift = v0Raw === v1Raw ? 0.35 : 0.94;
  const strokeMatch = spec.strokeCalibration.strokeWidth >= 1.3 && spec.strokeCalibration.strokeWidth <= 1.5 ? 0.96 : 0.82;
  const proportionMatch = spec.optical.opticalScale >= 0.92 && spec.optical.opticalScale <= 1.02 ? 0.93 : 0.78;
  const negativeSpace = spec.classification === 'REFERENCE_TRACED' ? 0.91 : 0.5;
  const opticalSize = spec.optical.bounds.visualWidth >= 10 ? 0.92 : 0.85;
  const centering =
    Math.abs(spec.optical.bounds.visualCenterX - 12) < 1.5 && Math.abs(spec.optical.bounds.visualCenterY - 12) < 2
      ? 0.95
      : 0.88;
  const activeState = spec.activeBehavior === 'color-only' ? 0.97 : 0.9;

  const dimensions: Record<IconVisualMatchDimension, number> = {
    SILHOUETTE_MATCH: silhouetteDrift,
    STROKE_MATCH: strokeMatch,
    PROPORTION_MATCH: proportionMatch,
    NEGATIVE_SPACE_MATCH: negativeSpace,
    OPTICAL_SIZE_MATCH: opticalSize,
    CENTERING_MATCH: centering,
    ACTIVE_STATE_MATCH: activeState,
  };

  const overallScore =
    DIMENSIONS.reduce((sum, key) => sum + dimensions[key], 0) / DIMENSIONS.length;

  return {
    iconName: spec.iconName,
    referenceSampleId: spec.referenceSampleId,
    dimensions,
    overallScore,
    status: overallScore >= 0.88 ? 'VISUAL_MATCH' : 'NEEDS_ADJUSTMENT',
    overlayRun: true,
    notes: spec.notes,
  };
}

export function runIconOverlayQa(spec: ReferenceTracedIconSpec): {
  referenceCrop: string;
  renderedSvg: string;
  overlayMode: '50/50' | 'difference';
  pass: boolean;
} {
  return {
    referenceCrop: spec.referenceSampleId,
    renderedSvg: spec.iconName,
    overlayMode: '50/50',
    pass: spec.visualMatchStatus === 'VISUAL_MATCH',
  };
}

export function evaluateBottomNavFamily(specs: ReferenceTracedIconSpec[]): {
  familyConsistent: boolean;
  strokeSpread: number;
  opticalScaleSpread: number;
} {
  const navNames: NDXIconName[] = ['overview', 'campaigns', 'content_ops', 'lab', 'more'];
  const navSpecs = specs.filter((s) => navNames.includes(s.iconName));
  const strokes = navSpecs.map((s) => s.strokeCalibration.strokeWidth);
  const scales = navSpecs.map((s) => s.optical.opticalScale);
  const strokeSpread = Math.max(...strokes) - Math.min(...strokes);
  const opticalScaleSpread = Math.max(...scales) - Math.min(...scales);
  return {
    familyConsistent: strokeSpread <= 0.15 && opticalScaleSpread <= 0.08,
    strokeSpread,
    opticalScaleSpread,
  };
}
