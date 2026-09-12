/**
 * P0.VR.DIAG.1R2 — Region measurement depth + multi-dimension evidence assembly.
 */

import { DEPTH_SUFFICIENT_MIN_WEIGHT, FORENSIC_DELTA_MIN_PX } from './constants.js';
import { extractAuthorityImageMeasurements } from './authorityImageMeasurementExtractor.js';
import { extractCurrentDomMeasurements } from './currentDomMeasurementExtractor.js';
import { isGenericViewportWidthGaming, validatePxDimension } from './dimensionValidityCheck.js';
import type { PageRegionLayoutDefinition } from './pageRegionLayoutProfiles.js';
import {
  allRequirements,
  getRegionMeasurementProfile,
  importanceWeight,
  type DimensionRequirement,
} from './regionMeasurementProfiles.js';
import type {
  DimensionMeasurementSource,
  ForensicConfidence,
  RegionDimensionEvidence,
  RegionMeasurementDepth,
  RegionMeasurementDepthStatus,
  RegionReconstructionTargetMap,
  VisualRegionBounds,
  DomRegionMeasurement,
} from './types.js';

let dimCounter = 0;
export function resetRegionMeasurementDepthCounterForTest(): void {
  dimCounter = 0;
}

function nextDimId(prefix: string): string {
  dimCounter += 1;
  return `${prefix}_${dimCounter}`;
}

function formatPx(value: number, confidence: ForensicConfidence): string {
  const rounded = Math.round(value * 10) / 10;
  return confidence === 'LOW' ? `~${rounded}px` : `${rounded}px`;
}

function formatDelta(abs: number, pct: number | null, confidence: ForensicConfidence): string {
  const sign = abs > 0 ? '+' : abs < 0 ? '' : '';
  const pxPart =
    confidence === 'LOW' ? `~${sign}${Math.round(abs)}px` : `${sign}${Math.round(abs * 10) / 10}px`;
  if (pct != null && Number.isFinite(pct)) {
    return `${pxPart} · ${sign}${Math.round(pct)}%`;
  }
  return pxPart;
}

function legacySource(
  authSource: DimensionMeasurementSource,
  curSource: DimensionMeasurementSource,
): RegionDimensionEvidence['source'] {
  if (curSource === 'DOM_RECT' || curSource === 'COMPUTED_STYLE' || curSource === 'DOM') return 'DOM';
  if (curSource === 'CSS_SNAPSHOT') return 'CSS_SNAPSHOT';
  if (authSource === 'SHELL_SPEC') return 'SHELL_SPEC';
  if (curSource === 'LAYOUT_PROFILE') return 'LAYOUT_PROFILE';
  return 'ESTIMATED';
}

function scoreDepth(
  resolved: DimensionRequirement[],
  missing: string[],
  hasDomAnchor: boolean,
): { score: number; status: RegionMeasurementDepthStatus } {
  let weight = 0;
  let criticalResolved = 0;
  for (const r of resolved) {
    weight += importanceWeight(r.importance);
    if (r.importance === 'CRITICAL') criticalResolved += 1;
  }
  if (resolved.length === 0) return { score: 0, status: 'UNMEASURED' };
  const missingCritical = missing.length > 0 && criticalResolved === 0;
  if (weight >= DEPTH_SUFFICIENT_MIN_WEIGHT + 3 && hasDomAnchor) return { score: weight, status: 'DEEP' };
  if (weight >= DEPTH_SUFFICIENT_MIN_WEIGHT && criticalResolved >= 1 && hasDomAnchor) {
    return { score: weight, status: 'SUFFICIENT' };
  }
  if (weight >= DEPTH_SUFFICIENT_MIN_WEIGHT && !hasDomAnchor) {
    return { score: weight, status: 'SHALLOW' };
  }
  if (missingCritical) return { score: weight, status: 'BLOCKED' };
  return { score: weight, status: 'SHALLOW' };
}

export function buildRegionMeasurementDepthEvidence(input: {
  def: PageRegionLayoutDefinition;
  authority: VisualRegionBounds;
  current: VisualRegionBounds;
  dom?: DomRegionMeasurement;
  shell?: { headerPaddingX: number; contentPaddingX: number; sectionGap?: number } | null;
  cssSnapshot?: Record<string, string | number>;
  viewportWidth: number;
  viewportHeight: number;
  matchConfidence: ForensicConfidence;
}): { dimensions: RegionDimensionEvidence[]; depth: RegionMeasurementDepth; target: RegionReconstructionTargetMap } {
  const profile = getRegionMeasurementProfile(input.def.regionType);
  const requirements = allRequirements(profile);

  const currentExtraction = extractCurrentDomMeasurements({
    def: input.def,
    current: input.current,
    dom: input.dom,
    cssSnapshot: input.cssSnapshot,
    viewportWidth: input.viewportWidth,
    contentPaddingX: input.shell?.contentPaddingX ?? null,
  });

  const authorityExtraction = extractAuthorityImageMeasurements({
    def: input.def,
    authority: input.authority,
    shell: input.shell,
    viewportWidth: input.viewportWidth,
  });

  const dimensions: RegionDimensionEvidence[] = [];
  const resolvedReqs: DimensionRequirement[] = [];
  const missingDimensions: string[] = [];
  const seen = new Set<string>();

  for (const req of requirements) {
    if (seen.has(req.dimension)) continue;
    seen.add(req.dimension);

    const curScalar = currentExtraction.scalars.get(req.dimension);
    const authScalar = authorityExtraction.scalars.get(req.dimension);

    if (!curScalar && !authScalar) {
      if (req.importance === 'CRITICAL' || req.importance === 'HIGH') {
        missingDimensions.push(req.dimension);
      }
      continue;
    }

    if (!curScalar && authScalar && (req.importance === 'CRITICAL' || req.importance === 'HIGH')) {
      missingDimensions.push(req.dimension);
      continue;
    }

    const curVal = curScalar?.value ?? 0;
    const authVal = authScalar?.value ?? curVal;
    const unit = curScalar?.unit ?? authScalar?.unit ?? 'px';
    const curSource = curScalar?.source ?? 'SCREENSHOT_ESTIMATE';
    const authSource = authScalar?.source ?? 'AUTHORITY_IMAGE_ESTIMATE';
    const conf: ForensicConfidence =
      curScalar?.confidence === 'HIGH' && authScalar?.confidence === 'HIGH'
        ? 'HIGH'
        : curScalar?.confidence ?? authScalar?.confidence ?? input.matchConfidence;

    if (
      unit === 'px' &&
      isGenericViewportWidthGaming(req.dimension, curVal, input.viewportWidth, input.current.geometry.widthPx)
    ) {
      missingDimensions.push(req.dimension);
      continue;
    }

    if (unit === 'px') {
      const validCur = validatePxDimension({
        name: req.dimension,
        value: curVal,
        viewportWidth: input.viewportWidth,
        viewportHeight: input.viewportHeight,
        source: curSource,
      });
      const validAuth = validatePxDimension({
        name: req.dimension,
        value: authVal,
        viewportWidth: input.viewportWidth,
        viewportHeight: input.viewportHeight,
        source: authSource,
      });
      if (!validCur.valid && !validAuth.valid) {
        missingDimensions.push(req.dimension);
        continue;
      }
    }

    const abs = curVal - authVal;
    const pct = authVal !== 0 ? (abs / authVal) * 100 : null;
    const aligned = unit === 'px' && Math.abs(abs) < FORENSIC_DELTA_MIN_PX;

    resolvedReqs.push(req);

    dimensions.push({
      evidenceId: nextDimId('dim'),
      regionId: input.def.regionId,
      dimension: req.dimension,
      authorityValue: authScalar?.display ?? (unit === 'px' ? formatPx(authVal, conf) : String(authVal)),
      currentValue: curScalar ? (unit === 'px' ? formatPx(curVal, curScalar.confidence) : String(curVal)) : formatPx(curVal, conf),
      delta: formatDelta(abs, pct, conf),
      deltaPct: pct != null ? Math.round(pct * 10) / 10 : null,
      unit,
      confidence: conf,
      source: legacySource(authSource, curSource),
      authoritySource: authSource,
      currentSource: curSource,
      importance: req.importance,
      alignedWithinTolerance: aligned,
    });
  }

  const { score, status } = scoreDepth(resolvedReqs, missingDimensions, Boolean(input.dom));
  const depth: RegionMeasurementDepth = {
    regionId: input.def.regionId,
    regionType: input.def.regionType,
    requiredDimensions: profile.required.map((r) => r.dimension),
    resolvedDimensions: resolvedReqs.map((r) => r.dimension),
    missingDimensions,
    depthScore: score,
    confidence: input.matchConfidence,
    status,
  };

  const target: RegionReconstructionTargetMap = {
    regionId: input.def.regionId,
    componentId: input.dom?.componentId ?? input.def.componentId ?? null,
    domPath: input.def.componentId ? `component:${input.def.componentId}` : null,
    layoutParent: input.def.shellBound ?? null,
    styleOwner: input.def.componentId ?? null,
    confidence: input.dom ? 'HIGH' : input.def.componentId ? 'MEDIUM' : 'LOW',
  };

  return { dimensions, depth, target };
}

export function isDepthSufficient(depth: RegionMeasurementDepth | undefined): boolean {
  if (!depth) return false;
  return depth.status === 'SUFFICIENT' || depth.status === 'DEEP';
}

/** @deprecated prefer isRegionDepthSufficient(bundle) after 1R3 reconciliation */

export function buildGlobalPageMeasurementProfile(input: {
  viewportWidth: number;
  shell?: { contentPaddingX: number; sectionGap?: number } | null;
  cssSnapshot?: Record<string, string | number>;
  regionCount: number;
}): import('./types.js').GlobalPageMeasurementProfile {
  const parse = (v: string | number | undefined | null): number | null => {
    if (v == null) return null;
    if (typeof v === 'number') return v;
    const m = /^([\d.]+)/.exec(String(v).trim());
    return m ? Number(m[1]) : null;
  };
  const left = parse(input.cssSnapshot?.contentPaddingX) ?? input.shell?.contentPaddingX ?? null;
  return {
    pageLeftGutter: left,
    pageRightGutter: left,
    verticalRhythmGap: parse(input.cssSnapshot?.sectionGap) ?? input.shell?.sectionGap ?? null,
    contentMaxWidth: input.viewportWidth && left != null ? input.viewportWidth - left * 2 : null,
    sectionCount: input.regionCount,
    occupiedAreaRatio: null,
  };
}
