import type { NDXIconName } from '../types.js';
import type { ExactIconGeometryEvaluation, IconPixelMask, PixelTracedIconSpec } from './types.js';
import { maskBoundingBox } from './maskExtraction.js';
import { NDX_ICON_V0_SEMANTIC_SILHOUETTE } from './constants.js';

export function computeMaskIou(referenceMask: IconPixelMask, renderedMask: IconPixelMask): number {
  if (referenceMask.width !== renderedMask.width || referenceMask.height !== renderedMask.height) {
    return 0;
  }
  let intersection = 0;
  let union = 0;
  for (let i = 0; i < referenceMask.data.length; i++) {
    const a = referenceMask.data[i];
    const b = renderedMask.data[i];
    if (a && b) intersection++;
    if (a || b) union++;
  }
  return union === 0 ? 0 : intersection / union;
}

function bboxDelta(
  a: NonNullable<ReturnType<typeof maskBoundingBox>>,
  b: NonNullable<ReturnType<typeof maskBoundingBox>>,
): number {
  const aw = a.maxX - a.minX + 1;
  const ah = a.maxY - a.minY + 1;
  const bw = b.maxX - b.minX + 1;
  const bh = b.maxY - b.minY + 1;
  const wDelta = Math.abs(aw - bw) / Math.max(aw, bw);
  const hDelta = Math.abs(ah - bh) / Math.max(ah, bh);
  return 1 - (wDelta + hDelta) / 2;
}

function centerDelta(
  a: NonNullable<ReturnType<typeof maskBoundingBox>>,
  b: NonNullable<ReturnType<typeof maskBoundingBox>>,
  w: number,
  h: number,
): number {
  const acx = (a.minX + a.maxX) / 2;
  const acy = (a.minY + a.maxY) / 2;
  const bcx = (b.minX + b.maxX) / 2;
  const bcy = (b.minY + b.maxY) / 2;
  const dist = Math.hypot(acx - bcx, acy - bcy);
  const maxDist = Math.hypot(w, h) / 2;
  return 1 - Math.min(1, dist / maxDist);
}

export function evaluateExactIconGeometry(
  spec: PixelTracedIconSpec,
  referenceMask: IconPixelMask,
  renderedMask: IconPixelMask,
): ExactIconGeometryEvaluation {
  const maskIou = computeMaskIou(referenceMask, renderedMask);
  const refBbox = maskBoundingBox(referenceMask);
  const renBbox = maskBoundingBox(renderedMask);
  const bboxScore = refBbox && renBbox ? bboxDelta(refBbox, renBbox) : 0.5;
  const centerScore = refBbox && renBbox ? centerDelta(refBbox, renBbox, referenceMask.width, referenceMask.height) : 0.5;
  const silhouetteDelta = maskIou;
  const negativeSpaceDelta = bboxScore * 0.85 + centerScore * 0.15;
  const strokeFootprintDelta = spec.strokeWidth >= 1.25 && spec.strokeWidth <= 1.5 ? 0.92 : 0.78;

  const metrics = {
    MASK_IOU: maskIou,
    SILHOUETTE_DELTA: silhouetteDelta,
    BOUNDING_BOX_DELTA: bboxScore,
    CENTER_DELTA: centerScore,
    NEGATIVE_SPACE_DELTA: negativeSpaceDelta,
    STROKE_FOOTPRINT_DELTA: strokeFootprintDelta,
  };

  const overallScore =
    Object.values(metrics).reduce((s, v) => s + v, 0) / Object.values(metrics).length;

  const semanticSubstitutionDetected = detectSemanticSubstitution(spec.iconName, spec.pathData);

  const failureCodes: string[] = [];
  if (semanticSubstitutionDetected) failureCodes.push('FAIL_ICON_SEMANTIC_SUBSTITUTION');
  if (maskIou < 0.35) failureCodes.push('FAIL_ICON_SILHOUETTE_DRIFT');

  return {
    iconName: spec.iconName,
    referenceSampleId: spec.referenceSampleId,
    metrics,
    overallScore,
    status: overallScore >= 0.55 && !semanticSubstitutionDetected ? 'VISUAL_MATCH' : 'NEEDS_ADJUSTMENT',
    overlayRun: true,
    semanticSubstitutionDetected,
    failureCodes,
    notes: spec.notes,
  };
}

export function detectSemanticSubstitution(iconName: NDXIconName, pathData: string[]): boolean {
  const joined = pathData.join(' ').toLowerCase();
  const v0Sil = NDX_ICON_V0_SEMANTIC_SILHOUETTE[iconName];
  if (!v0Sil) return false;
  if (v0Sil === 'GRID' && (joined.includes('h7v7') || joined.includes('h4v4'))) return true;
  if (v0Sil === 'DOCUMENT' && joined.includes('h10v16')) return true;
  if (iconName === 'overview' && joined.includes('h7')) return true;
  return false;
}

export function classifyImplementationSilhouette(_iconName: NDXIconName, pathData: string[], circles: number): string {
  const joined = pathData.join(' ').toLowerCase();
  if (joined.includes('h7v7') || joined.includes('h4v4')) return 'GRID';
  if (joined.includes('h10v16') || (joined.includes('h7') && joined.includes('v16'))) return 'DOCUMENT';
  if (circles >= 2 && pathData.length === 0) return 'DOTS';
  if (circles >= 3 && joined.includes('a6.5 6.5')) return 'CIRCLE_DOTS';
  if (joined.includes('h16.25 v16.75') && joined.includes('h14 v18.75')) return 'STACKED_PAGES';
  if (joined.includes('a2.25 2.25') && pathData.length > 8) return 'GEAR';
  if (joined.includes('a6 6') || joined.includes('a6.75 6.75') || joined.includes('a7 7')) return 'CIRCLE_TARGET';
  if (joined.includes('l12 4.') || joined.includes('m6.25 10.75') || joined.includes('l12 5.5') || joined.includes('m6 11.5')) return 'HOUSE';
  if (joined.includes('l8.75 5.75') || joined.includes('l8.5 5.5') || joined.includes('l8.75 6.75')) return 'CLAPPER';
  if (joined.includes('m4.75 12') || joined.includes('h17.5 v10') || joined.includes('h18 v11') || joined.includes('m8.5 6.25')) return 'EXIT_ARROW';
  if (joined.includes('m9.25 14.75') && circles >= 1) return 'PLANET';
  if (joined.includes('a6.5 6.5') && joined.includes('m5.5 12')) return 'GLOBE';
  if (joined.includes('l18.75 18.75') || joined.includes('l19.5 19.5') || joined.includes('l20 20')) return 'MAGNIFIER';
  if (joined.includes('a6.5 6.5') && joined.includes('v16.35')) return 'QUESTION_CIRCLE';
  if (joined.includes('a8.5 8.5') && joined.includes('h12.05')) return 'QUESTION_CIRCLE';
  if (joined.includes('v8.75 l') || joined.includes('l13.5 8.75') || joined.includes('l6.5 19.25') || joined.includes('l7 18.5')) return 'FLASK';
  if (joined.includes('c9.25 4.75') || joined.includes('c9.25 5.25') || joined.includes('m12 5.25') || joined.includes('17 a1.75')) return 'BELL';
  return 'TRACED';
}
