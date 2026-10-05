/**
 * P0.VR.DIAG.1R1 — Multi-dimension region forensics.
 */

import type { PageRegionLayoutDefinition } from './pageRegionLayoutProfiles.js';
import { buildRegionMeasurementDepthEvidence, resetRegionMeasurementDepthCounterForTest } from './regionMeasurementDepth.js';
import type {
  DomRegionMeasurement,
  ForensicConfidence,
  FunctionalRiskLevel,
  RegionComponentTarget,
  RegionDimensionEvidence,
  RegionForensicsBundle,
  RegionMatchStatus,
  VisualRegionBounds,
  VisualRegionType,
} from './types.js';

let dimCounter = 0;
export function resetDimensionEvidenceCounterForTest(): void {
  dimCounter = 0;
  resetRegionMeasurementDepthCounterForTest();
}

function nextDimId(prefix: string): string {
  dimCounter += 1;
  return `${prefix}_${dimCounter}`;
}

export function buildRegionComponentTarget(
  def: PageRegionLayoutDefinition,
  dom?: DomRegionMeasurement,
  route?: string | null,
): RegionComponentTarget {
  const componentId = dom?.componentId ?? def.componentId ?? null;
  const selector = def.selectorHint ?? (componentId ? null : null);
  return {
    regionId: def.regionId,
    componentId,
    selector,
    route: route ?? null,
    confidence: dom ? 'HIGH' : componentId ? 'MEDIUM' : 'LOW',
    unresolvedComponentTarget: !componentId && !selector,
  };
}

export function buildRegionDimensionEvidence(input: {
  def: PageRegionLayoutDefinition;
  authority: VisualRegionBounds;
  current: VisualRegionBounds;
  dom?: DomRegionMeasurement;
  shell?: { headerPaddingX: number; contentPaddingX: number; sectionGap?: number } | null;
  cssSnapshot?: Record<string, string | number>;
  matchConfidence: ForensicConfidence;
  viewportWidth?: number;
  viewportHeight?: number;
}): RegionDimensionEvidence[] {
  return buildRegionMeasurementDepthEvidence({
    def: input.def,
    authority: input.authority,
    current: input.current,
    dom: input.dom,
    shell: input.shell,
    cssSnapshot: input.cssSnapshot,
    viewportWidth: input.viewportWidth ?? 390,
    viewportHeight: input.viewportHeight ?? 844,
    matchConfidence: input.matchConfidence,
  }).dimensions;
}

export function buildRegionForensicsBundle(input: {
  def: PageRegionLayoutDefinition;
  status: RegionMatchStatus;
  authority: VisualRegionBounds | null;
  current: VisualRegionBounds | null;
  dom?: DomRegionMeasurement;
  shell?: { headerPaddingX: number; contentPaddingX: number; sectionGap?: number } | null;
  cssSnapshot?: Record<string, string | number>;
  matchConfidence: ForensicConfidence;
  route?: string | null;
  viewportWidth?: number;
  viewportHeight?: number;
}): RegionForensicsBundle {
  const componentTarget = buildRegionComponentTarget(input.def, input.dom, input.route ?? null);
  const functionalRisk = inferFunctionalRisk(input.def.regionType, input.status);

  if (input.status === 'MISSING_CURRENT' && input.authority) {
    return {
      regionId: input.def.regionId,
      regionName: input.def.regionName,
      regionType: input.def.regionType,
      significance: input.def.significance,
      status: input.status,
      componentTarget,
      dimensions: [
        {
          evidenceId: nextDimId('dim_missing'),
          regionId: input.def.regionId,
          dimension: 'presence',
          authorityValue: 'PRESENT',
          currentValue: 'MISSING',
          delta: 'MISSING_CURRENT',
          deltaPct: null,
          unit: 'none',
          confidence: 'HIGH',
          source: 'LAYOUT_PROFILE',
        },
      ],
      corrections: [`Add/restore ${input.def.regionName.toLowerCase()} region present in authority`],
      confidence: 'HIGH',
      functionalRisk,
    };
  }

  if (input.status === 'MISSING_AUTHORITY' && input.current) {
    return {
      regionId: input.def.regionId,
      regionName: input.def.regionName,
      regionType: input.def.regionType,
      significance: input.def.significance,
      status: input.status,
      componentTarget,
      dimensions: [
        {
          evidenceId: nextDimId('dim_extra'),
          regionId: input.def.regionId,
          dimension: 'presence',
          authorityValue: 'ABSENT',
          currentValue: 'EXTRA',
          delta: 'EXTRA_CURRENT',
          deltaPct: null,
          unit: 'none',
          confidence: 'MEDIUM',
          source: 'DOM',
        },
      ],
      corrections: [`Review extra region ${input.def.regionName.toLowerCase()} — remove, relocate, or founder override`],
      confidence: 'MEDIUM',
      functionalRisk,
    };
  }

  if (input.status === 'AMBIGUOUS' || !input.authority || !input.current) {
    return {
      regionId: input.def.regionId,
      regionName: input.def.regionName,
      regionType: input.def.regionType,
      significance: input.def.significance,
      status: 'AMBIGUOUS',
      componentTarget,
      dimensions: [],
      corrections: [`Needs review — ambiguous correspondence for ${input.def.regionName.toLowerCase()}`],
      confidence: 'LOW',
      functionalRisk,
    };
  }

  const depthResult = buildRegionMeasurementDepthEvidence({
    def: input.def,
    authority: input.authority,
    current: input.current,
    dom: input.dom,
    shell: input.shell,
    cssSnapshot: input.cssSnapshot,
    viewportWidth: input.viewportWidth ?? 390,
    viewportHeight: input.viewportHeight ?? 844,
    matchConfidence: input.matchConfidence,
  });
  const dimensions = depthResult.dimensions;

  const corrections = dimensions
    .filter((d) => !d.alignedWithinTolerance && d.delta && !String(d.delta).startsWith('0'))
    .map((d) => correctionForDimension(input.def.regionName, d));

  if (!corrections.length && dimensions.length) {
    corrections.push(`${input.def.regionName} aligned within tolerance — verify in evidence`);
  }

  return {
    regionId: input.def.regionId,
    regionName: input.def.regionName,
    regionType: input.def.regionType,
    significance: input.def.significance,
    status: input.status,
    componentTarget,
    dimensions,
    corrections,
    confidence: input.matchConfidence,
    functionalRisk,
    measurementDepth: depthResult.depth,
    reconstructionTarget: depthResult.target,
  };
}

function correctionForDimension(regionName: string, dim: RegionDimensionEvidence): string {
  const lower = regionName.toLowerCase();
  if (dim.dimension === 'height') {
    const sign = String(dim.delta).startsWith('-') ? 'Increase' : 'Decrease';
    return `${sign} ${lower} height toward ${dim.authorityValue}`;
  }
  if (dim.dimension === 'leftInset' || dim.dimension === 'leftOffset') {
    const sign = String(dim.delta).startsWith('-') ? 'Increase' : 'Decrease';
    return `${sign} ${lower} left inset toward ${dim.authorityValue}`;
  }
  if (dim.dimension === 'width') {
    return `Resize ${lower} width toward ${dim.authorityValue}`;
  }
  if (dim.dimension === 'controlSize') {
    return `Resize ${lower} controls toward ${dim.authorityValue}`;
  }
  if (dim.dimension === 'itemGap') {
    return `Adjust ${lower} item spacing toward authority rhythm`;
  }
  return `Align ${lower} ${dim.dimension} toward ${dim.authorityValue}`;
}

function inferFunctionalRisk(regionType: VisualRegionType, status: RegionMatchStatus): FunctionalRiskLevel {
  if (status === 'MISSING_CURRENT' && (regionType === 'NAVIGATION' || regionType === 'PERSISTENT_NAV')) return 'MEDIUM';
  if (regionType === 'PERSISTENT_NAV') return 'MEDIUM';
  if (regionType === 'NAVIGATION') return 'LOW';
  return 'LOW';
}

