/**
 * P0.VR.DIAG.1R5 — Derive typed dimension evidence from internal structure.
 */

import type { RegionDimensionEvidence } from '../p0vrDiag1/types.js';
import { getRegionMeasurementProfile } from '../p0vrDiag1/regionMeasurementProfiles.js';
import { compareTypedDimensions } from './typedDimensionComparator.js';
import { formatTypedDimensionValue, inferDimensionValueTypeR5 } from './typedDimensionFormatter.js';
import type { VisualRegionType } from '../p0vrDiag1/types.js';
import type { RegionInternalStructure, InternalStructureMeasurement } from './types.js';
import { buildChildAnchorCorrespondence } from './childAnchorCorrespondence.js';

let evidenceCounter = 0;
export function resetInternalStructureEvidenceCounterForTest(): void {
  evidenceCounter = 0;
}

function nextId(regionId: string): string {
  evidenceCounter += 1;
  return `is_${regionId}_${evidenceCounter}`;
}

function px(n: number): string {
  return `${Math.round(n * 10) / 10}px`;
}

export function buildInternalStructureMeasurements(
  authority: RegionInternalStructure,
  current: RegionInternalStructure,
): InternalStructureMeasurement[] {
  const measurements: InternalStructureMeasurement[] = [];
  const authContainer = authority.container;
  const curContainer = current.container;
  if (authContainer && curContainer) {
    pushPx(measurements, authority.regionId, 'containerHeight', authContainer.bounds.height, curContainer.bounds.height, [
      authContainer.anchorId,
      curContainer.anchorId,
    ]);
    pushPx(measurements, authority.regionId, 'leftInset', authContainer.bounds.x, curContainer.bounds.x, [
      authContainer.anchorId,
      curContainer.anchorId,
    ]);
  }

  if (authority.regionType === 'NAVIGATION') {
    const authNav = authority.groups.find((g) => g.groupType === 'NAV_ITEMS');
    const curNav = current.groups.find((g) => g.groupType === 'NAV_ITEMS');
    if (authNav && curNav) {
      measurements.push({
        regionId: authority.regionId,
        measurementType: 'itemCount',
        authorityValue: authNav.count,
        currentValue: curNav.count,
        delta: compareTypedDimensions({
          measurementType: 'itemCount',
          valueType: 'COUNT',
          authorityValue: authNav.count,
          currentValue: curNav.count,
        }).delta,
        valueType: 'COUNT',
        unit: 'count',
        sourceAnchors: [...authNav.anchors.map((a) => a.anchorId), ...curNav.anchors.map((a) => a.anchorId)],
        confidence: curNav.confidence,
      });
      measurements.push({
        regionId: authority.regionId,
        measurementType: 'itemGap',
        authorityValue: px(authNav.spacingProfile.meanGap),
        currentValue: px(curNav.spacingProfile.meanGap),
        delta: compareTypedDimensions({
          measurementType: 'itemGap',
          valueType: 'PIXEL',
          authorityValue: authNav.spacingProfile.meanGap,
          currentValue: curNav.spacingProfile.meanGap,
        }).delta,
        valueType: 'PIXEL',
        unit: 'px',
        sourceAnchors: [],
        confidence: 'MEDIUM',
      });
    }
    const authInd = authority.childAnchors.find((a) => a.anchorType === 'ACTIVE_INDICATOR');
    const curInd = current.childAnchors.find((a) => a.anchorType === 'ACTIVE_INDICATOR');
    if (authInd && curInd) {
      pushPx(measurements, authority.regionId, 'activeIndicatorWidth', authInd.bounds.width, curInd.bounds.width, [
        authInd.anchorId,
        curInd.anchorId,
      ]);
      pushPx(measurements, authority.regionId, 'activeIndicatorHeight', authInd.bounds.height, curInd.bounds.height, [
        authInd.anchorId,
        curInd.anchorId,
      ]);
      measurements.push({
        regionId: authority.regionId,
        measurementType: 'activeStateGeometry',
        authorityValue: 'YES',
        currentValue: 'YES',
        delta: 'MATCH',
        valueType: 'BOOLEAN',
        unit: 'none',
        sourceAnchors: [authInd.anchorId, curInd.anchorId],
        confidence: 'MEDIUM',
      });
    }
  }

  if (authority.regionType === 'METRICS') {
    const authG = authority.groups.find((g) => g.groupType === 'METRIC_CELLS');
    const curG = current.groups.find((g) => g.groupType === 'METRIC_CELLS');
    if (authG && curG) {
      measurements.push({
        regionId: authority.regionId,
        measurementType: 'cellCount',
        authorityValue: authG.count,
        currentValue: curG.count,
        delta: compareTypedDimensions({
          measurementType: 'cellCount',
          valueType: 'COUNT',
          authorityValue: authG.count,
          currentValue: curG.count,
        }).delta,
        valueType: 'COUNT',
        unit: 'count',
        sourceAnchors: [],
        confidence: curG.confidence,
      });
      if (authG.sharedGeometry && curG.sharedGeometry) {
        pushPx(measurements, authority.regionId, 'cellWidth', authG.sharedGeometry.width, curG.sharedGeometry.width, []);
        pushPx(measurements, authority.regionId, 'cellHeight', authG.sharedGeometry.height, curG.sharedGeometry.height, []);
      }
      measurements.push({
        regionId: authority.regionId,
        measurementType: 'gap',
        authorityValue: px(authG.spacingProfile.meanGap),
        currentValue: px(curG.spacingProfile.meanGap),
        delta: compareTypedDimensions({
          measurementType: 'gap',
          valueType: 'PIXEL',
          authorityValue: authG.spacingProfile.meanGap,
          currentValue: curG.spacingProfile.meanGap,
        }).delta,
        valueType: 'PIXEL',
        unit: 'px',
        sourceAnchors: [],
        confidence: 'MEDIUM',
      });
    }
  }

  if (authority.regionType === 'STATUS') {
    const authTrack = authority.childAnchors.find((a) => a.anchorType === 'TRACK');
    const curTrack = current.childAnchors.find((a) => a.anchorType === 'TRACK');
    const authFill = authority.childAnchors.find((a) => a.anchorType === 'FILL');
    const curFill = current.childAnchors.find((a) => a.anchorType === 'FILL');
    if (authTrack && curTrack) {
      pushPx(measurements, authority.regionId, 'progressTrackHeight', authTrack.bounds.height, curTrack.bounds.height, [
        authTrack.anchorId,
        curTrack.anchorId,
      ]);
      pushPx(measurements, authority.regionId, 'bandWidth', authTrack.bounds.width, curTrack.bounds.width, [
        authTrack.anchorId,
        curTrack.anchorId,
      ]);
    }
    if (authFill && curFill && authTrack && curTrack) {
      const authRatio = authFill.bounds.width / authTrack.bounds.width;
      const curRatio = curFill.bounds.width / curTrack.bounds.width;
      measurements.push({
        regionId: authority.regionId,
        measurementType: 'fillRatio',
        authorityValue: Math.round(authRatio * 100) / 100,
        currentValue: Math.round(curRatio * 100) / 100,
        delta: compareTypedDimensions({
          measurementType: 'fillRatio',
          valueType: 'RATIO',
          authorityValue: authRatio,
          currentValue: curRatio,
        }).delta,
        valueType: 'RATIO',
        unit: 'ratio',
        sourceAnchors: [authFill.anchorId, curFill.anchorId],
        confidence: 'MEDIUM',
      });
    }
    pushPx(measurements, authority.regionId, 'bandHeight', authority.container?.bounds.height ?? 0, current.container?.bounds.height ?? 0, []);
  }

  if (authority.regionType === 'CARD_RAIL') {
    const curG = current.groups.find((g) => g.groupType === 'CARDS');
    const authG = authority.groups.find((g) => g.groupType === 'CARDS');
    if (curG && authG) {
      pushPx(measurements, authority.regionId, 'cardWidth', authG.sharedGeometry?.width ?? 0, curG.sharedGeometry?.width ?? 0, []);
      pushPx(measurements, authority.regionId, 'cardGap', authG.spacingProfile.meanGap, curG.spacingProfile.meanGap, []);
      measurements.push({
        regionId: authority.regionId,
        measurementType: 'cardCountVisible',
        authorityValue: authG.count,
        currentValue: curG.count,
        delta: compareTypedDimensions({
          measurementType: 'cardCountVisible',
          valueType: 'COUNT',
          authorityValue: authG.count,
          currentValue: curG.count,
        }).delta,
        valueType: 'COUNT',
        unit: 'count',
        sourceAnchors: [],
        confidence: 'MEDIUM',
      });
    }
  }

  buildChildAnchorCorrespondence(authority, current);
  return measurements;
}

function pushPx(
  measurements: InternalStructureMeasurement[],
  regionId: string,
  measurementType: string,
  auth: number,
  cur: number,
  sourceAnchors: string[],
): void {
  if (!Number.isFinite(auth) || !Number.isFinite(cur) || auth <= 0) return;
  measurements.push({
    regionId,
    measurementType,
    authorityValue: px(auth),
    currentValue: px(cur),
    delta: compareTypedDimensions({
      measurementType,
      valueType: 'PIXEL',
      authorityValue: auth,
      currentValue: cur,
    }).delta,
    valueType: 'PIXEL',
    unit: 'px',
    sourceAnchors,
    confidence: 'MEDIUM',
  });
}

export function internalMeasurementsToDimensionEvidence(
  regionId: string,
  measurements: InternalStructureMeasurement[],
  regionType: VisualRegionType,
): RegionDimensionEvidence[] {
  const profile = getRegionMeasurementProfile(regionType);
  const importanceByDim = new Map(profile.required.concat(profile.optional).map((r) => [r.dimension, r.importance]));

  return measurements.map((m) => {
    const valueType = inferDimensionValueTypeR5(m.measurementType, m.unit);
    const unit = m.unit === 'count' ? 'count' : m.unit === 'ratio' ? 'ratio' : m.unit === 'pct' ? 'pct' : 'px';
    const authorityValue =
      valueType === 'COUNT' || valueType === 'BOOLEAN' || valueType === 'ENUM'
        ? formatTypedDimensionValue(m.authorityValue, valueType, m.unit)
        : m.authorityValue;
    const currentValue =
      valueType === 'COUNT' || valueType === 'BOOLEAN' || valueType === 'ENUM'
        ? formatTypedDimensionValue(m.currentValue, valueType, m.unit)
        : m.currentValue;
    return {
      evidenceId: nextId(regionId),
      regionId,
      dimension: m.measurementType,
      authorityValue,
      currentValue,
      delta: m.delta,
      deltaPct: null,
      unit,
      confidence: m.confidence,
      source: m.sourceAnchors.length ? 'DOM' : 'ESTIMATED',
      currentSource: 'CHILD_ANCHOR',
      authoritySource: 'AUTHORITY_IMAGE_ESTIMATE',
      importance: importanceByDim.get(m.measurementType) ?? 'MEDIUM',
    };
  });
}
