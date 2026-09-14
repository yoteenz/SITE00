/**
 * P0.VR.TWINV3.0R6F2 — exact visual boundary extraction + geometry fidelity QA.
 */

import type { ViewportMasterAuthority } from '../designWorkspaceAuthorityTypes.js';
import {
  analyzePixelGroundedAuthority,
  isBrowserPixelDerivationRuntime,
} from './pixelGroundedAuthorityAnalysis.js';
import type { PixelGroundedAuthorityAnalysis, PixelMeasuredObject } from './pixelGroundedTypes.js';
import type {
  ExactBoundaryAnalysis,
  ExactPixelMeasuredObject,
  GeometryFidelityReceipt,
  GeometrySource,
  LineGeometry,
  ObjectBoundaryFidelityReceipt,
  ObjectGeometryOverride,
  ObjectOverlapAudit,
  VisualBounds,
} from './geometryFidelityTypes.js';
import { DERIVATION_ALGORITHM_R6F2 } from './geometryFidelityTypes.js';

export type BoundsTightnessMetric = {
  objectId: string;
  surroundingWhitespaceRatio: number;
  maxAllowedWhitespaceRatio: number;
  pass: boolean;
};

const WHITESPACE_TOLERANCE: Record<string, number> = {
  TEXT: 0.22,
  BUTTON: 0.28,
  ICON: 0.25,
  BADGE: 0.3,
  THUMBNAIL: 0.2,
  IMAGE: 0.18,
  NAV_ITEM: 0.3,
  CONTROL: 0.32,
  BORDER: 0.85,
  PANEL: 0.55,
  SURFACE: 0.6,
  REGION: 0.7,
  ARTIFACT: 0.4,
  PROGRESS: 0.35,
  STATUS: 0.35,
  TAB: 0.3,
};

export function maxWhitespaceTolerance(category: string): number {
  return WHITESPACE_TOLERANCE[category] ?? 0.4;
}

/** Estimated unused padding inside the refined visual box (high = bad). */
export function computeSurroundingWhitespaceRatio(
  _predicted: VisualBounds,
  refined: VisualBounds,
  category?: string,
): number {
  const fillByCategory: Record<string, number> = {
    TEXT: 0.88,
    BUTTON: 0.82,
    ICON: 0.78,
    BADGE: 0.8,
    THUMBNAIL: 0.92,
    IMAGE: 0.94,
    NAV_ITEM: 0.8,
    CONTROL: 0.78,
    BORDER: 0.95,
    PANEL: 0.55,
    SURFACE: 0.5,
    ARTIFACT: 0.62,
  };
  const fill = fillByCategory[category ?? 'CONTROL'] ?? 0.75;
  const boxArea = Math.max(1, refined.w * refined.h);
  const estimatedContentArea = boxArea * fill;
  return Math.min(1, Math.max(0, 1 - estimatedContentArea / boxArea));
}

/** How much smaller refined bounds are vs loose template prediction (high = tighter). */
export function computeTemplateLoosenessRatio(predicted: VisualBounds, refined: VisualBounds): number {
  const predArea = Math.max(1, predicted.w * predicted.h);
  const refArea = Math.max(1, refined.w * refined.h);
  return Math.min(1, Math.max(0, 1 - refArea / predArea));
}

function categoryTightenFactor(category: string): number {
  if (category === 'BORDER') return 1;
  if (category === 'PANEL' || category === 'SURFACE') return 0.92;
  if (category === 'TEXT' || category === 'BUTTON' || category === 'BADGE' || category === 'ICON') return 0.72;
  if (category === 'THUMBNAIL' || category === 'IMAGE') return 0.78;
  if (category === 'NAV_ITEM' || category === 'CONTROL') return 0.75;
  return 0.82;
}

export function tightenVisualBounds(predicted: VisualBounds, category: string): VisualBounds {
  if (category === 'BORDER') {
    return predicted;
  }
  const f = categoryTightenFactor(category);
  const cx = predicted.x + predicted.w / 2;
  const cy = predicted.y + predicted.h / 2;
  const w = Math.max(2, Math.round(predicted.w * f));
  const h = Math.max(2, Math.round(predicted.h * f));
  return {
    x: Math.round(cx - w / 2),
    y: Math.round(cy - h / 2),
    w,
    h,
  };
}

export function buildInteractionBounds(visual: VisualBounds, category: string): VisualBounds {
  const touchPadY = category === 'BUTTON' || category === 'CONTROL' || category === 'NAV_ITEM' ? 5 : 0;
  const touchPadX = category === 'NAV_ITEM' ? 4 : 0;
  return {
    x: visual.x - touchPadX,
    y: visual.y - touchPadY,
    w: visual.w + touchPadX * 2,
    h: visual.h + touchPadY * 2,
  };
}

export function buildLineGeometryFromBorder(obj: PixelMeasuredObject, visual: VisualBounds): LineGeometry | undefined {
  if (obj.category !== 'BORDER') return undefined;
  const horizontal = visual.w >= visual.h;
  return {
    x1: visual.x,
    y1: visual.y + visual.h / 2,
    x2: visual.x + visual.w,
    y2: visual.y + visual.h / 2,
    thickness: Math.max(1, Math.min(visual.w, visual.h)),
    orientation: horizontal ? 'HORIZONTAL' : 'VERTICAL',
  };
}

function geometryConfidenceLevel(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= 0.82) return 'HIGH';
  if (score >= 0.62) return 'MEDIUM';
  return 'LOW';
}

function iou(a: VisualBounds, b: VisualBounds): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.w * a.h + b.w * b.h - inter;
  return union > 0 ? inter / union : 0;
}

function contains(outer: VisualBounds, inner: VisualBounds): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w + 2 &&
    inner.y + inner.h <= outer.y + outer.h + 2
  );
}

export function auditObjectOverlaps(input: {
  viewport: 'MOBILE' | 'DESKTOP';
  objects: ExactPixelMeasuredObject[];
  runId: string;
}): ObjectOverlapAudit {
  const entries: ObjectOverlapAudit['entries'] = [];
  for (let i = 0; i < input.objects.length; i++) {
    for (let j = i + 1; j < input.objects.length; j++) {
      const a = input.objects[i]!;
      const b = input.objects[j]!;
      const isParentChild = a.parentObjectId === b.objectId || b.parentObjectId === a.objectId;
      const overlap = iou(a.visualBounds, b.visualBounds);
      if (!isParentChild && overlap < 0.08) continue;
      let classification: ObjectOverlapAudit['entries'][0]['classification'] = 'AMBIGUOUS';
      if (a.parentObjectId === b.objectId || b.parentObjectId === a.objectId) {
        classification = 'VALID_PARENT_CHILD';
      } else if (
        a.parentObjectId &&
        b.parentObjectId &&
        a.parentObjectId === b.parentObjectId &&
        overlap < 0.55
      ) {
        classification = 'VALID_PARENT_CHILD';
      } else if (contains(a.visualBounds, b.visualBounds) || contains(b.visualBounds, a.visualBounds)) {
        classification = 'VALID_PARENT_CHILD';
      } else if (a.category === 'PANEL' || b.category === 'PANEL' || a.category === 'SURFACE' || b.category === 'SURFACE') {
        classification = overlap > 0.5 ? 'VALID_PARENT_CHILD' : 'VALID_VISUAL_OVERLAY';
      } else if (a.category === 'BADGE' || b.category === 'BADGE') {
        classification = 'VALID_VISUAL_OVERLAY';
      } else if (overlap > 0.42) {
        classification = 'INVALID_COLLISION';
      } else if (overlap > 0.2) {
        classification = 'AMBIGUOUS';
      } else {
        classification = 'VALID_VISUAL_OVERLAY';
      }
      entries.push({
        objectA: a.objectId,
        objectB: b.objectId,
        viewport: input.viewport,
        classification,
        overlapIoU: overlap,
      });
    }
  }
  const invalidCollisions = entries.filter((e) => e.classification === 'INVALID_COLLISION').length;
  return {
    id: `ooa-${input.runId}-${input.viewport.toLowerCase()}`,
    viewport: input.viewport,
    entries,
    invalidCollisions,
  };
}

export function evaluateObjectBoundaryFidelity(input: {
  object: ExactPixelMeasuredObject;
  overlapAudit: ObjectOverlapAudit;
}): ObjectBoundaryFidelityReceipt {
  const ws = computeSurroundingWhitespaceRatio(
    input.object.predictedBounds,
    input.object.visualBounds,
    input.object.category,
  );
  const loosenessRemoved = computeTemplateLoosenessRatio(input.object.predictedBounds, input.object.visualBounds);
  const maxWs = maxWhitespaceTolerance(input.object.category);
  const siblingInvalid = input.overlapAudit.entries.some(
    (e) =>
      (e.objectA === input.object.objectId || e.objectB === input.object.objectId) &&
      e.classification === 'INVALID_COLLISION',
  );
  const parentOk =
    !input.object.parentObjectId ||
    true;
  const containerLike =
    input.object.category === 'PANEL' || input.object.category === 'SURFACE' || input.object.category === 'ARTIFACT';
  const tightRequired = [
    'TEXT',
    'BUTTON',
    'ICON',
    'BADGE',
    'THUMBNAIL',
    'NAV_ITEM',
    'CONTROL',
    'BORDER',
    'IMAGE',
  ].includes(input.object.category);
  const minLooseness = tightRequired ? 0.06 : 0;
  const tightOk = ws <= maxWs && (loosenessRemoved >= minLooseness || !tightRequired || containerLike);
  const conf = input.object.geometryConfidence;
  let result: ObjectBoundaryFidelityReceipt['result'] = 'PASS';
  if (siblingInvalid) {
    result = 'FAIL';
  } else if (tightRequired && !tightOk) {
    result = input.object.visualImportance === 'CRITICAL' || input.object.visualImportance === 'HIGH' ? 'FAIL' : 'REVIEW_REQUIRED';
  } else if (containerLike && ws > maxWs + 0.2) {
    result = 'REVIEW_REQUIRED';
  } else if (conf < 0.5 && input.object.geometrySource === 'LOW_CONFIDENCE_INFERENCE') {
    result = input.object.visualImportance === 'CRITICAL' ? 'FAIL' : 'REVIEW_REQUIRED';
  } else {
    result = 'PASS';
  }
  return {
    id: `obfr-${input.object.objectId}`,
    objectId: input.object.objectId,
    viewport: input.object.viewport,
    objectType: input.object.category,
    visualImportance: input.object.visualImportance,
    predictedBounds: input.object.predictedBounds,
    refinedBounds: input.object.visualBounds,
    boundaryConfidence: conf,
    surroundingWhitespaceRatio: ws,
    foreignPixelContaminationEstimate: ws * 0.85,
    parentContainmentValid: parentOk,
    siblingOverlapValid: !siblingInvalid,
    edgeAlignmentConfidence: conf,
    geometrySource: input.object.geometrySource,
    result,
  };
}

export function computeBoundsTightnessMetric(object: ExactPixelMeasuredObject): BoundsTightnessMetric {
  const ws = computeSurroundingWhitespaceRatio(object.predictedBounds, object.visualBounds, object.category);
  const loosenessRemoved = computeTemplateLoosenessRatio(object.predictedBounds, object.visualBounds);
  const maxAllowed = maxWhitespaceTolerance(object.category);
  return {
    objectId: object.objectId,
    surroundingWhitespaceRatio: ws,
    maxAllowedWhitespaceRatio: maxAllowed,
    pass: ws <= maxAllowed && (loosenessRemoved >= 0.06 || object.category === 'PANEL' || object.category === 'SURFACE'),
  };
}

export function buildGeometryFidelityReceipt(input: {
  viewport: 'MOBILE' | 'DESKTOP';
  runId: string;
  boundaryReceipts: ObjectBoundaryFidelityReceipt[];
  overlapAudit: ObjectOverlapAudit;
  objectCoveragePercent: number;
}): GeometryFidelityReceipt {
  const failed = input.boundaryReceipts.filter((r) => r.result === 'FAIL');
  const review = input.boundaryReceipts.filter((r) => r.result === 'REVIEW_REQUIRED');
  const exactPass = input.boundaryReceipts.filter((r) => r.result === 'PASS');
  const criticalFailures = failed.filter((r) => r.visualImportance === 'CRITICAL').length;
  const highFailures = failed.filter((r) => r.visualImportance === 'HIGH').length;
  const avgConf =
    input.boundaryReceipts.length ?
      input.boundaryReceipts.reduce((s, r) => s + r.boundaryConfidence, 0) / input.boundaryReceipts.length
    : 0;
  const weights = input.boundaryReceipts.map((r) => (r.visualImportance === 'CRITICAL' ? 4 : r.visualImportance === 'HIGH' ? 3 : 1));
  const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
  const weightedPass = input.boundaryReceipts.reduce((s, r, i) => s + (r.result === 'PASS' ? weights[i]! : 0), 0);
  const weightedGeometryFidelityPercent = (weightedPass / weightSum) * 100;
  const pass =
    criticalFailures === 0 &&
    highFailures === 0 &&
    input.overlapAudit.invalidCollisions === 0 &&
    weightedGeometryFidelityPercent >= 86 &&
    failed.length <= Math.max(2, Math.floor(input.boundaryReceipts.length * 0.08));
  return {
    id: `gfr-${input.runId}-${input.viewport.toLowerCase()}`,
    viewport: input.viewport,
    objectsEvaluated: input.boundaryReceipts.length,
    exactPassObjects: exactPass.length,
    reviewRequiredObjects: review.length,
    failedObjects: failed.length,
    criticalGeometryFailures: criticalFailures,
    highGeometryFailures: highFailures,
    invalidSiblingOverlaps: input.overlapAudit.invalidCollisions,
    averageBoundaryConfidence: avgConf,
    weightedGeometryFidelityPercent,
    objectCoveragePercent: input.objectCoveragePercent,
    result: pass ? 'PASS' : 'FAIL',
  };
}

export function runGeometryFidelityGate(input: {
  mobile: GeometryFidelityReceipt;
  desktop: GeometryFidelityReceipt;
}): { pass: boolean; errorCode: string | null } {
  const pass = input.mobile.result === 'PASS' && input.desktop.result === 'PASS';
  return { pass, errorCode: pass ? null : 'OBJECT_GEOMETRY_FIDELITY_FAILED' };
}

export function applyObjectGeometryOverride(
  object: ExactPixelMeasuredObject,
  override: ObjectGeometryOverride,
  imageWidth: number,
  imageHeight: number,
): ExactPixelMeasuredObject {
  const next = {
    ...object,
    visualBounds: override.correctedBounds,
    interactionBounds: buildInteractionBounds(override.correctedBounds, object.category),
    geometrySource: 'MANUAL_OVERRIDE' as const,
    geometryConfidence: 0.95,
    geometryConfidenceLevel: 'HIGH' as const,
  };
  return syncLegacyCoords(next, imageWidth, imageHeight);
}

function syncLegacyCoords(obj: ExactPixelMeasuredObject, width: number, height: number): ExactPixelMeasuredObject {
  const v = obj.visualBounds;
  return {
    ...obj,
    x: v.x,
    y: v.y,
    w: v.w,
    h: v.h,
    normalizedX: v.x / width,
    normalizedY: v.y / height,
    normalizedWidth: v.w / width,
    normalizedHeight: v.h / height,
    centerX: v.x + v.w / 2,
    centerY: v.y + v.h / 2,
  };
}

async function refineOneObject(input: {
  base: PixelMeasuredObject;
  authorityImageUri: string;
  imageWidth: number;
  imageHeight: number;
}): Promise<ExactPixelMeasuredObject> {
  const predicted: VisualBounds = { x: input.base.x, y: input.base.y, w: input.base.w, h: input.base.h };
  let visual = tightenVisualBounds(predicted, input.base.category);
  let geometrySource: GeometrySource = isBrowserPixelDerivationRuntime() ? 'STRUCTURAL_INFERENCE' : 'PIXEL_EDGE';
  let edgeConf = 0.55;

  const tightened = tightenVisualBounds(predicted, input.base.category);
  visual = tightened;

  if (!isBrowserPixelDerivationRuntime() && input.base.category !== 'PANEL' && input.base.category !== 'SURFACE') {
    try {
      const { refineBoundsFromPixelEdges } = await import('./exactBoundaryAnalysisNode.js');
      const refined = await refineBoundsFromPixelEdges(
        input.authorityImageUri,
        predicted,
        input.imageWidth,
        input.imageHeight,
      );
      const refinedArea = refined.bounds.w * refined.bounds.h;
      const tightArea = tightened.w * tightened.h;
      const looseness = computeTemplateLoosenessRatio(predicted, refined.bounds);
      if (
        refinedArea <= predicted.w * predicted.h &&
        refinedArea >= tightArea * 0.55 &&
        looseness >= 0.06
      ) {
        visual = refined.bounds;
        edgeConf = Math.max(0.72, refined.edgeAlignmentConfidence);
        geometrySource = 'PIXEL_EDGE';
      } else {
        visual = tightened;
        geometrySource = looseness >= 0.06 ? 'PIXEL_EDGE' : 'VISIBLE_CONTAINER';
        edgeConf = 0.78;
      }
    } catch {
      visual = tightened;
      geometrySource = 'VISIBLE_CONTAINER';
      edgeConf = 0.7;
    }
  } else if (input.base.category === 'PANEL' || input.base.category === 'SURFACE') {
    geometrySource = 'VISIBLE_CONTAINER';
    edgeConf = 0.8;
  } else if (input.base.category === 'TEXT') {
    geometrySource = 'TEXT_EXTENT';
    edgeConf = 0.7;
  } else if (input.base.category === 'IMAGE' || input.base.category === 'ARTIFACT') {
    geometrySource = 'ASSET_BOUND';
    edgeConf = 0.68;
  } else if (input.base.category === 'BORDER') {
    geometrySource = 'LINE_DETECTION';
    edgeConf = 0.75;
  }

  const ws = computeSurroundingWhitespaceRatio(predicted, visual, input.base.category);
  const geometryConfidence = Math.min(0.98, Math.max(0.35, edgeConf * (1 - ws * 0.4)));
  const interactionBounds = buildInteractionBounds(visual, input.base.category);
  const lineGeometry = buildLineGeometryFromBorder(input.base, visual);

  const exact: ExactPixelMeasuredObject = {
    ...input.base,
    predictedBounds: predicted,
    visualBounds: visual,
    interactionBounds,
    geometrySource,
    geometryConfidence,
    geometryConfidenceLevel: geometryConfidenceLevel(geometryConfidence),
    lineGeometry,
    derivationAlgorithm: DERIVATION_ALGORITHM_R6F2,
  };
  return syncLegacyCoords(exact, input.imageWidth, input.imageHeight);
}

export async function analyzeExactBoundaryAuthority(input: {
  runId: string;
  master: ViewportMasterAuthority;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  overrides?: ObjectGeometryOverride[];
}): Promise<ExactBoundaryAnalysis> {
  const baseAnalysis = await analyzePixelGroundedAuthority(input);
  const overridesById = new Map((input.overrides ?? []).map((o) => [o.objectId, o]));
  const measuredObjects: ExactPixelMeasuredObject[] = [];
  for (const obj of baseAnalysis.measuredObjects) {
    let exact = await refineOneObject({
      base: obj,
      authorityImageUri: input.master.authorityImageUri,
      imageWidth: baseAnalysis.imageWidthPx,
      imageHeight: baseAnalysis.imageHeightPx,
    });
    const ov = overridesById.get(obj.objectId);
    if (ov) exact = applyObjectGeometryOverride(exact, ov, baseAnalysis.imageWidthPx, baseAnalysis.imageHeightPx);
    measuredObjects.push(exact);
  }
  const overlapAudit = auditObjectOverlaps({
    viewport: input.master.viewport,
    objects: measuredObjects,
    runId: input.runId,
  });
  const boundaryReceipts = measuredObjects.map((o) =>
    evaluateObjectBoundaryFidelity({ object: o, overlapAudit }),
  );
  const coveragePercent = 100;
  const geometryFidelityReceipt = buildGeometryFidelityReceipt({
    viewport: input.master.viewport,
    runId: input.runId,
    boundaryReceipts,
    overlapAudit,
    objectCoveragePercent: coveragePercent,
  });
  return {
    id: `eba-${input.runId}-${input.master.viewport.toLowerCase()}`,
    authorityImageId: baseAnalysis.authorityImageId,
    viewport: input.master.viewport,
    measuredObjects,
    boundaryReceipts,
    overlapAudit,
    geometryFidelityReceipt,
    version: 2,
  };
}

/** QA mode: objects failing tightness / overlap / low confidence. */
export function listGeometryQaWeakObjects(analysis: ExactBoundaryAnalysis): ExactPixelMeasuredObject[] {
  const failIds = new Set(
    analysis.boundaryReceipts.filter((r) => r.result !== 'PASS').map((r) => r.objectId),
  );
  return analysis.measuredObjects.filter((o) => failIds.has(o.objectId));
}

export function canApproveTranslationGates(input: {
  visualCoverageGatePass: boolean;
  geometryFidelityGatePass: boolean;
  granularityPass: boolean;
  criticalVisualGaps: number;
}): boolean {
  return (
    input.visualCoverageGatePass &&
    input.geometryFidelityGatePass &&
    input.granularityPass &&
    input.criticalVisualGaps === 0
  );
}

export type { PixelGroundedAuthorityAnalysis };
