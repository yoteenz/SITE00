/**
 * P0.VR.DIAG.1R1 — Multi-dimension region forensics.
 */

import { FORENSIC_DELTA_MIN_PX } from './constants.js';
import type { PageRegionLayoutDefinition } from './pageRegionLayoutProfiles.js';
import { geometryMetrics } from './stackLayout.js';
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
  const sign = abs > 0 ? '+' : '';
  const pxPart = confidence === 'LOW' ? `~${sign}${Math.round(abs)}px` : `${sign}${Math.round(abs * 10) / 10}px`;
  if (pct != null && Number.isFinite(pct)) {
    return `${pxPart} · ${sign}${Math.round(pct)}%`;
  }
  return pxPart;
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

const CORE_DIMENSIONS = ['height', 'width', 'leftOffset', 'topOffset'] as const;
const HEADER_EXTRA = ['leftInset', 'bottomEdgeY', 'controlSize'] as const;
const NAV_EXTRA = ['itemGap', 'containerHeight'] as const;
const MEDIA_EXTRA = ['aspectRatio', 'occupiedAreaPct'] as const;

export function buildRegionDimensionEvidence(input: {
  def: PageRegionLayoutDefinition;
  authority: VisualRegionBounds;
  current: VisualRegionBounds;
  dom?: DomRegionMeasurement;
  shell?: { headerPaddingX: number; contentPaddingX: number } | null;
  cssSnapshot?: Record<string, string | number>;
  matchConfidence: ForensicConfidence;
}): RegionDimensionEvidence[] {
  const { def, authority, current, dom, shell, cssSnapshot, matchConfidence } = input;
  const auth = geometryMetrics(authority.geometry);
  const cur = geometryMetrics(current.geometry);
  const source = dom ? 'DOM' : cssSnapshot ? 'CSS_SNAPSHOT' : shell ? 'SHELL_SPEC' : 'LAYOUT_PROFILE';
  const confidence = dom ? 'HIGH' : matchConfidence;

  const dimensions: RegionDimensionEvidence[] = [];

  const pushDim = (
    dimension: string,
    authVal: number,
    curVal: number,
    unit: RegionDimensionEvidence['unit'],
    src: RegionDimensionEvidence['source'] = source,
    conf: ForensicConfidence = confidence,
  ) => {
    const abs = curVal - authVal;
    const pct = authVal !== 0 ? (abs / authVal) * 100 : null;
    if (unit === 'px' && Math.abs(abs) < FORENSIC_DELTA_MIN_PX && dimension !== 'bottomEdgeY') return;
    if (unit === 'pct' && pct != null && Math.abs(pct) < 2) return;

    dimensions.push({
      evidenceId: nextDimId('dim'),
      regionId: def.regionId,
      dimension,
      authorityValue: unit === 'px' ? formatPx(authVal, conf) : `${Math.round(authVal * 10) / 10}${unit === 'pct' ? '%' : ''}`,
      currentValue: unit === 'px' ? formatPx(curVal, conf) : `${Math.round(curVal * 10) / 10}${unit === 'pct' ? '%' : ''}`,
      delta: formatDelta(abs, pct, conf),
      deltaPct: pct != null ? Math.round(pct * 10) / 10 : null,
      unit,
      confidence: conf,
      source: src,
    });
  };

  for (const key of CORE_DIMENSIONS) {
    pushDim(key, auth[key], cur[key], key.includes('Pct') ? 'pct' : 'px');
  }

  if (def.regionType === 'HEADER') {
    const authInset = shell?.headerPaddingX ?? auth.leftOffset;
    const curInset = parseCss(cssSnapshot?.headerPaddingX) ?? dom?.actualX ?? cur.leftOffset;
    pushDim('leftInset', authInset, curInset, 'px', shell ? 'SHELL_SPEC' : source);
    pushDim('bottomEdgeY', auth.y + auth.height, cur.y + cur.height, 'px');
    const controlSize = 32;
    const curControl = parseCss(dom?.computedFontSize) ? parseCss(dom?.computedFontSize)! + 12 : 28;
    pushDim('controlSize', controlSize, curControl, 'px', dom ? 'DOM' : 'ESTIMATED', dom ? 'HIGH' : 'LOW');
  }

  if (def.regionType === 'NAVIGATION' || def.regionType === 'PERSISTENT_NAV') {
    pushDim('containerHeight', auth.height, cur.height, 'px');
    const gap = parseCss(dom?.computedGap);
    if (gap != null) pushDim('itemGap', shell?.contentPaddingX ? 8 : 8, gap, 'px', 'DOM', 'HIGH');
  }

  if (def.regionType === 'MEDIA' || def.regionType === 'HERO') {
    pushDim('aspectRatio', auth.aspectRatio, cur.aspectRatio, 'ratio');
    pushDim('occupiedAreaPct', auth.occupiedAreaPct, cur.occupiedAreaPct, 'pct');
  }

  if (dom?.computedPadding) {
    const padTop = parsePadding(dom.computedPadding, 'top');
    if (padTop != null && shell) pushDim('paddingTop', 0, padTop, 'px', 'DOM', 'MEDIUM');
  }

  if (dom?.computedFontSize) {
    const fs = parseCss(dom.computedFontSize);
    if (fs != null) pushDim('fontSize', estimateAuthorityFontSize(def, auth.height), fs, 'px', 'ESTIMATED', 'MEDIUM');
  }

  return dimensions;
}

function estimateAuthorityFontSize(def: PageRegionLayoutDefinition, regionHeight: number): number {
  if (def.regionType === 'IDENTITY') return Math.round(regionHeight * 0.12);
  if (def.regionType === 'NAVIGATION') return 11;
  return Math.round(regionHeight * 0.08);
}

function parseCss(value: string | number | undefined | null): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = /^([\d.]+)/.exec(String(value).trim());
  return match ? Number(match[1]) : null;
}

function parsePadding(padding: string, edge: 'top'): number | null {
  const parts = padding.trim().split(/\s+/);
  if (!parts.length) return null;
  if (parts.length === 1) return parseCss(parts[0]);
  if (edge === 'top') return parseCss(parts[0]);
  return null;
}

export function buildRegionForensicsBundle(input: {
  def: PageRegionLayoutDefinition;
  status: RegionMatchStatus;
  authority: VisualRegionBounds | null;
  current: VisualRegionBounds | null;
  dom?: DomRegionMeasurement;
  shell?: { headerPaddingX: number; contentPaddingX: number } | null;
  cssSnapshot?: Record<string, string | number>;
  matchConfidence: ForensicConfidence;
  route?: string | null;
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

  const dimensions = buildRegionDimensionEvidence({
    def: input.def,
    authority: input.authority,
    current: input.current,
    dom: input.dom,
    shell: input.shell,
    cssSnapshot: input.cssSnapshot,
    matchConfidence: input.matchConfidence,
  });

  const corrections = dimensions
    .filter((d) => d.delta && d.delta !== '0px')
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

export { HEADER_EXTRA, NAV_EXTRA, MEDIA_EXTRA };
