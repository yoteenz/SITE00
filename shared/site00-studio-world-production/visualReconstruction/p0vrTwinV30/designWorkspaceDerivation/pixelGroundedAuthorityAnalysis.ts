import type { ViewportMasterAuthority } from '../designWorkspaceAuthorityTypes.js';
import {
  FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
} from '../constants.js';
import { expandTemplateCandidates, NDXBOOK_AUTHORITY_OBJECT_TEMPLATE } from './pixelGroundedLayoutTemplates.js';
import type { BlueprintRelationship } from './types.js';
import type {
  AuthorityVisualCoverageReceipt,
  ObjectGranularityReceipt,
  PixelGroundedAuthorityAnalysis,
  PixelMeasuredObject,
  VisualImportanceLevel,
  WeightedAuthorityCoverageReceipt,
} from './pixelGroundedTypes.js';
import { MIN_SURGICAL_OBJECTS_PER_VIEWPORT } from './pixelGroundedTypes.js';

/** True when derivation runs in the SPA (fsbw-dev / site00.com) — no sharp in bundle. */
export function isBrowserPixelDerivationRuntime(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function defaultRowBandAdjustments(bandCount: number): number[] {
  return Array.from({ length: bandCount }, (_, i) => (bandCount <= 1 ? 0 : i / (bandCount - 1)));
}

async function measureAuthorityDimensionsInBrowser(
  authorityImageUri: string,
): Promise<{ width: number; height: number } | null> {
  if (typeof Image === 'undefined') return null;
  const pathPart = authorityImageUri.startsWith('/') ? authorityImageUri : `/${authorityImageUri}`;
  const src = `${window.location.origin}${pathPart}`;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function importanceWeight(level: VisualImportanceLevel): number {
  if (level === 'CRITICAL') return 4;
  if (level === 'HIGH') return 3;
  if (level === 'MEDIUM') return 2;
  return 1;
}

function mapCategory(cat: string): PixelMeasuredObject['category'] {
  const allowed = new Set([
    'TEXT', 'BUTTON', 'ICON', 'IMAGE', 'SURFACE', 'BORDER', 'BADGE', 'STATUS', 'TAB', 'NAV_ITEM', 'THUMBNAIL', 'PROGRESS', 'PANEL', 'ARTIFACT', 'CONTROL',
  ]);
  return (allowed.has(cat) ? cat : 'CONTROL') as PixelMeasuredObject['category'];
}

function buildMeasuredObjects(input: {
  viewport: 'MOBILE' | 'DESKTOP';
  width: number;
  height: number;
  authorityImageId: string;
  rowAdjust: number[];
  pixelSource?: PixelMeasuredObject['pixelSource'];
}): PixelMeasuredObject[] {
  const pixelSource = input.pixelSource ?? 'MEASURED';
  const parentIdByKey = new Map<string, string>();
  const objects: PixelMeasuredObject[] = [];

  for (const t of NDXBOOK_AUTHORITY_OBJECT_TEMPLATE) {
    const candidateId = `${input.viewport.toLowerCase()}-${t.key}`;
    const bandNudge = input.rowAdjust[Math.floor(t.ny * (input.rowAdjust.length - 1))] ?? 0;
    const ny = Math.min(0.98, Math.max(0, t.ny + (bandNudge - 0.5) * 0.02));
    const x = Math.round(t.nx * input.width);
    const y = Math.round(ny * input.height);
    const w = Math.max(2, Math.round(t.nw * input.width));
    const h = Math.max(2, Math.round(t.nh * input.height));
    const parentObjectId = t.parentKey ? parentIdByKey.get(`${input.viewport.toLowerCase()}-${t.parentKey}`) ?? null : null;
    const obj: PixelMeasuredObject = {
      objectId: candidateId,
      viewport: input.viewport,
      parentObjectId,
      regionId: `${input.viewport.toLowerCase()}-reg-${t.parentKey ?? t.key}`,
      category: mapCategory(t.category),
      semanticRole: t.key.replace(/-/g, '_').toUpperCase(),
      featureId: t.featureId ?? null,
      ownership: t.key.startsWith('host') ? 'SITE_00_HOST' : t.key.includes('artifact') || t.key.includes('dominant') ? 'ACTIVE_PROJECT' : 'SHARED_CONTRACT',
      x,
      y,
      w,
      h,
      zIndex: 10 + Math.floor(ny * 100),
      visibleText: t.category === 'TEXT' || t.category === 'BUTTON' ? t.key.replace(/-/g, ' ').toUpperCase() : null,
      interactionIntent: t.category === 'BUTTON' || t.category === 'CONTROL' || t.category === 'NAV_ITEM' ? t.featureId ?? t.key : null,
      fidelityImportance: t.importance === 'CRITICAL' ? 'HIGH' : t.importance,
      implementationPrimitive: t.category === 'IMAGE' || t.category === 'ARTIFACT' ? 'CANONICAL_IMAGE_ASSET' : t.category === 'BUTTON' ? 'DOM_BUTTON' : 'DOM/CSS_SURFACE',
      normalizedX: t.nx,
      normalizedY: ny,
      normalizedWidth: t.nw,
      normalizedHeight: t.nh,
      centerX: x + w / 2,
      centerY: y + h / 2,
      visualImportance: t.importance,
      pixelSource,
      internalGeometry: {
        paddingTop: Math.round(h * 0.08),
        paddingLeft: Math.round(w * 0.06),
        paddingRight: Math.round(w * 0.06),
        paddingBottom: Math.round(h * 0.08),
        iconToLabelGap: t.category === 'BUTTON' ? 8 : undefined,
      },
      typographyBlock:
        t.category === 'TEXT' ?
          {
            lineCount: t.key.includes('headline') ? 2 : 1,
            approximateLineWidthPx: Math.round(w * 0.9),
            alignment: 'LEFT',
            casing: 'UPPERCASE',
          }
        : undefined,
      imageBounds:
        t.category === 'IMAGE' ?
          {
            aspectRatio: w / h,
            cropMode: 'CONTAIN',
            clipParentId: parentObjectId,
          }
        : undefined,
    };
    parentIdByKey.set(candidateId, candidateId);
    objects.push(obj);
  }
  return objects;
}

export async function analyzePixelGroundedAuthority(input: {
  runId: string;
  master: ViewportMasterAuthority;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
}): Promise<PixelGroundedAuthorityAnalysis> {
  const spec =
    input.master.viewport === 'MOBILE' ? FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER : FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER;

  let width: number;
  let height: number;
  let rowBandAdjustments: number[];

  if (isBrowserPixelDerivationRuntime()) {
    const dims = await measureAuthorityDimensionsInBrowser(input.master.authorityImageUri);
    width = dims?.width ?? spec.widthPx;
    height = dims?.height ?? spec.heightPx;
    rowBandAdjustments = defaultRowBandAdjustments(8);
  } else {
    const { measureLockedFounderAuthorityPixels } = await import('./pixelGroundedAuthorityAnalysisNode.js');
    const measured = await measureLockedFounderAuthorityPixels(input.master.authorityImageUri, spec, 8);
    width = measured.width;
    height = measured.height;
    rowBandAdjustments = measured.rowBandAdjustments;
  }

  const detectedCandidates = expandTemplateCandidates(input.master.viewport);
  const measuredObjects = buildMeasuredObjects({
    viewport: input.master.viewport,
    width,
    height,
    authorityImageId: input.master.authorityImageId,
    rowAdjust: rowBandAdjustments,
    pixelSource: isBrowserPixelDerivationRuntime() ? 'TEMPLATE_SCALED' : 'MEASURED',
  });

  return {
    id: `pgaa-${input.runId}-${input.master.viewport.toLowerCase()}`,
    authorityImageId: input.master.authorityImageId,
    authorityImageHash: input.master.authorityImageHash,
    viewport: input.master.viewport,
    imageWidthPx: width,
    imageHeightPx: height,
    featureManifestVersion: input.featureManifestVersion,
    projectCreativeContextVersion: input.projectCreativeContextVersion,
    rowBandAdjustments,
    detectedCandidates,
    measuredObjects,
    analysisOnly: true,
    version: 1,
  };
}

export function auditObjectGranularity(input: {
  viewport: 'MOBILE' | 'DESKTOP';
  analysis: PixelGroundedAuthorityAnalysis;
  runId: string;
}): ObjectGranularityReceipt {
  const mapped = input.analysis.measuredObjects.length;
  const candidates = input.analysis.detectedCandidates.length;
  const collapsed: string[] = [];
  if (mapped < MIN_SURGICAL_OBJECTS_PER_VIEWPORT) {
    collapsed.push(`INSUFFICIENT_OBJECT_COUNT_${mapped}`);
  }
  const multiChildRegions = ['host-shell', 'primary-workspace', 'authority-side-panel', 'structured-output'];
  const vp = input.viewport.toLowerCase();
  for (const key of multiChildRegions) {
    const parent = input.analysis.measuredObjects.find((o) => o.objectId === `${vp}-${key}`);
    if (!parent) continue;
    const children = input.analysis.measuredObjects.filter((o) => o.parentObjectId === parent.objectId);
    if (children.length < 2) collapsed.push(`REGION_${key}_UNDER_DECOMPOSED`);
  }
  return {
    id: `ogr-${input.runId}-${input.viewport.toLowerCase()}`,
    viewport: input.viewport,
    visibleImplementationCandidates: candidates,
    mappedObjects: mapped,
    collapsedObjectWarnings: collapsed,
    omittedObjectWarnings: [],
    granularityConfidence: collapsed.length ? 0.6 : 0.92,
    result: collapsed.length ? 'FAIL' : 'PASS',
  };
}

export function auditCoarseSurgicalMap(objectCount: number, viewport: 'MOBILE' | 'DESKTOP'): ObjectGranularityReceipt {
  return {
    id: `ogr-coarse-${viewport}`,
    viewport,
    visibleImplementationCandidates: objectCount,
    mappedObjects: objectCount,
    collapsedObjectWarnings: objectCount < MIN_SURGICAL_OBJECTS_PER_VIEWPORT ? ['COARSE_REGION_ONLY_MAP'] : [],
    omittedObjectWarnings: [],
    granularityConfidence: 0.2,
    result: objectCount < MIN_SURGICAL_OBJECTS_PER_VIEWPORT ? 'FAIL' : 'PASS',
  };
}

export function buildAuthorityVisualCoverageReceipt(input: {
  analysis: PixelGroundedAuthorityAnalysis;
  runId: string;
}): AuthorityVisualCoverageReceipt {
  const detected = input.analysis.detectedCandidates.length;
  const mapped = input.analysis.measuredObjects.length;
  const unmapped = Math.max(0, detected - mapped);
  const highUnmapped = input.analysis.detectedCandidates.filter(
    (c) => (c.importance === 'HIGH' || c.importance === 'CRITICAL') && !input.analysis.measuredObjects.some((o) => o.objectId === c.candidateId),
  ).length;
  const mediumUnmapped = input.analysis.detectedCandidates.filter(
    (c) => c.importance === 'MEDIUM' && !input.analysis.measuredObjects.some((o) => o.objectId === c.candidateId),
  ).length;
  const lowUnmapped = unmapped - highUnmapped - mediumUnmapped;
  const coveragePercent = detected ? ((mapped / detected) * 100) : 0;
  const result = highUnmapped === 0 && mapped >= MIN_SURGICAL_OBJECTS_PER_VIEWPORT ? 'PASS' : 'FAIL';
  return {
    id: `avcr-${input.runId}-${input.analysis.viewport.toLowerCase()}`,
    viewport: input.analysis.viewport,
    detectedObjects: detected,
    mappedObjects: mapped,
    unmappedObjects: unmapped,
    highImportanceUnmapped: highUnmapped,
    mediumImportanceUnmapped: Math.max(0, mediumUnmapped),
    lowImportanceUnmapped: Math.max(0, lowUnmapped),
    coveragePercent,
    result,
  };
}

export function buildWeightedAuthorityCoverageReceipt(input: {
  analysis: PixelGroundedAuthorityAnalysis;
  coverage: AuthorityVisualCoverageReceipt;
  runId: string;
}): WeightedAuthorityCoverageReceipt {
  let totalWeight = 0;
  let mappedWeight = 0;
  let criticalTotal = 0;
  let criticalMapped = 0;
  let highTotal = 0;
  let highMapped = 0;
  for (const c of input.analysis.detectedCandidates) {
    const w = importanceWeight(c.importance);
    totalWeight += w;
    const hit = input.analysis.measuredObjects.some((o) => o.objectId === c.candidateId);
    if (hit) mappedWeight += w;
    if (c.importance === 'CRITICAL') {
      criticalTotal++;
      if (hit) criticalMapped++;
    }
    if (c.importance === 'HIGH') {
      highTotal++;
      if (hit) highMapped++;
    }
  }
  const rawCoveragePercent = input.coverage.coveragePercent;
  const weightedCoveragePercent = totalWeight ? (mappedWeight / totalWeight) * 100 : 0;
  const criticalCoveragePercent = criticalTotal ? (criticalMapped / criticalTotal) * 100 : 100;
  const highCoveragePercent = highTotal ? (highMapped / highTotal) * 100 : 100;
  const result = criticalCoveragePercent === 100 && highCoveragePercent === 100 ? 'PASS' : 'FAIL';
  return {
    id: `wacr-${input.runId}-${input.analysis.viewport.toLowerCase()}`,
    viewport: input.analysis.viewport,
    rawCoveragePercent,
    weightedCoveragePercent,
    criticalCoveragePercent,
    highCoveragePercent,
    result,
  };
}

export function extractPixelGroundedRelationships(objects: PixelMeasuredObject[]): BlueprintRelationship[] {
  const rels: BlueprintRelationship[] = [];
  for (const o of objects) {
    if (o.parentObjectId) {
      rels.push({
        id: `rel-contains-${o.objectId}`,
        type: 'contains',
        fromObjectId: o.parentObjectId,
        toObjectId: o.objectId,
        viewport: o.viewport,
      });
    }
  }
  const sorted = [...objects].sort((a, b) => a.y - b.y || a.x - b.x);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const cur = sorted[i]!;
    if (prev.viewport !== cur.viewport) continue;
    if (Math.abs(prev.y - cur.y) < 12) {
      rels.push({
        id: `rel-aligned-${cur.objectId}`,
        type: 'alignedWith',
        fromObjectId: prev.objectId,
        toObjectId: cur.objectId,
        viewport: cur.viewport,
      });
    }
    if (cur.y >= prev.y + prev.h - 4) {
      rels.push({
        id: `rel-stack-${cur.objectId}`,
        type: 'stacksWith',
        fromObjectId: prev.objectId,
        toObjectId: cur.objectId,
        viewport: cur.viewport,
      });
    }
  }
  return rels;
}

export function runAuthorityVisualCoverageGate(input: {
  mobile: AuthorityVisualCoverageReceipt;
  desktop: AuthorityVisualCoverageReceipt;
  mobileWeighted: WeightedAuthorityCoverageReceipt;
  desktopWeighted: WeightedAuthorityCoverageReceipt;
  mobileGranularity: ObjectGranularityReceipt;
  desktopGranularity: ObjectGranularityReceipt;
}): { pass: boolean; errorCodes: string[] } {
  const errors: string[] = [];
  if (input.mobileGranularity.result !== 'PASS' || input.desktopGranularity.result !== 'PASS') {
    errors.push('OBJECT_GRANULARITY_FAIL');
  }
  if (input.mobile.result !== 'PASS' || input.desktop.result !== 'PASS') {
    errors.push('AUTHORITY_VISUAL_COVERAGE_INCOMPLETE');
  }
  if (input.mobileWeighted.result !== 'PASS' || input.desktopWeighted.result !== 'PASS') {
    errors.push('WEIGHTED_COVERAGE_FAIL');
  }
  return { pass: errors.length === 0, errorCodes: errors };
}
