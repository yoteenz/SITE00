/**
 * P0.VR.DIAG.1R3 — Qualified dimensions, region depth, top-level aggregation, consistency.
 */

import { DEPTH_SUFFICIENT_MIN_WEIGHT } from './constants.js';
import { normalizeDimensionPair } from './dimensionNormalization.js';
import { applyDeltaMathToEvidence } from './deltaMath.js';
import { getRegionMeasurementProfile, importanceWeight } from './regionMeasurementProfiles.js';
import type { PageRegionLayoutProfile } from './pageRegionLayoutProfiles.js';
import type {
  DimensionImportance,
  DimensionValidityStatus,
  QualifiedDimensionEvidence,
  RegionDepthComputation,
  RegionDimensionEvidence,
  RegionForensicsBundle,
  RegionMeasurementDepthStatus,
  TopLevelDepthAggregation,
} from './types.js';

const ALIAS_GROUPS: string[][] = [
  ['height', 'containerHeight', 'bandHeight'],
  ['width', 'bandWidth', 'sectionWidth', 'railWidth'],
  ['leftInset', 'leftOffset', 'railInset'],
  ['rightInset', 'rightOffset'],
  ['topOffset', 'y'],
  ['itemGap', 'gap', 'cardGap'],
];

function aliasKey(dimension: string): string {
  const lower = dimension.toLowerCase();
  for (const group of ALIAS_GROUPS) {
    if (group.some((g) => g.toLowerCase() === lower)) return group[0]!;
  }
  return lower;
}

export function qualifyDimensionEvidence(input: {
  row: RegionDimensionEvidence;
  importance?: DimensionImportance;
}): { qualified: QualifiedDimensionEvidence; updated: RegionDimensionEvidence; validity: DimensionValidityStatus } {
  const norm = normalizeDimensionPair({
    dimension: input.row.dimension,
    authorityValue: input.row.authorityValue,
    currentValue: input.row.currentValue,
    unit: input.row.unit,
  });

  let validity: DimensionValidityStatus = 'VALID';
  let reason = 'Comparable evidence with provenance';

  if (!norm.authorityValid && !norm.currentValid) {
    validity = 'INVALID_AUTHORITY';
    reason = 'Both sides invalid';
  } else if (!norm.authorityValid) {
    validity = 'MISSING_AUTHORITY';
    reason = 'Authority value missing or unparsable';
  } else if (!norm.currentValid) {
    validity = 'MISSING_CURRENT';
    reason = 'Current value missing or unparsable';
  } else if (norm.normalizationStatus === 'INVALID_VALUE') {
    validity = 'INVALID_CURRENT';
    reason = norm.errorCode ?? 'INVALID_VALUE';
  } else if (!input.row.authoritySource && !input.row.currentSource && !input.row.source) {
    validity = 'NOT_COMPARABLE';
    reason = 'No source provenance';
  } else if (input.row.confidence === 'LOW' && (input.importance === 'CRITICAL' || input.importance === 'HIGH')) {
    validity = 'NOT_COMPARABLE';
    reason = 'LOW confidence for high-importance dimension';
  }

  const updated = applyDeltaMathToEvidence(input.row, norm);
  const countsTowardDepth = validity === 'VALID';

  return {
    qualified: {
      dimension: input.row.dimension,
      validity,
      countsTowardDepth,
      importance: input.importance ?? input.row.importance ?? 'MEDIUM',
      confidence: input.row.confidence,
      reason,
    },
    updated,
    validity,
  };
}

export function computeRegionDepthComputation(bundle: RegionForensicsBundle): RegionDepthComputation {
  const profile = getRegionMeasurementProfile(bundle.regionType);
  const importanceByDim = new Map(
    [...profile.required, ...profile.optional].map((r) => [r.dimension, r.importance]),
  );

  const qualifiedDimensions: QualifiedDimensionEvidence[] = [];
  const disqualifiedDimensions: QualifiedDimensionEvidence[] = [];
  const seenAlias = new Set<string>();
  const reasons: string[] = [];

  for (const row of bundle.dimensions) {
    const imp = importanceByDim.get(row.dimension) ?? row.importance ?? 'MEDIUM';
    const { qualified } = qualifyDimensionEvidence({ row, importance: imp });
    const key = aliasKey(row.dimension);
    if (qualified.countsTowardDepth) {
      if (seenAlias.has(key)) {
        disqualifiedDimensions.push({ ...qualified, countsTowardDepth: false, reason: 'DUPLICATE_ALIAS' });
        continue;
      }
      seenAlias.add(key);
      qualifiedDimensions.push(qualified);
    } else {
      disqualifiedDimensions.push(qualified);
    }
  }

  let criticalResolved = 0;
  let highResolved = 0;
  let weight = 0;
  for (const q of qualifiedDimensions) {
    weight += importanceWeight(q.importance);
    if (q.importance === 'CRITICAL') criticalResolved += 1;
    if (q.importance === 'HIGH') highResolved += 1;
  }

  const requiredCritical = profile.required.filter((r) => r.importance === 'CRITICAL').map((r) => r.dimension);
  const requiredHigh = profile.required.filter((r) => r.importance === 'HIGH').map((r) => r.dimension);

  const missingCritical = requiredCritical.filter(
    (d) => !qualifiedDimensions.some((q) => q.dimension === d || aliasKey(q.dimension) === aliasKey(d)),
  );
  const missingHigh = requiredHigh.filter(
    (d) => !qualifiedDimensions.some((q) => q.dimension === d || aliasKey(q.dimension) === aliasKey(d)),
  );

  if (missingCritical.length) reasons.push(`MISSING: ${missingCritical.join(', ')}`);
  if (missingHigh.length) reasons.push(`MISSING HIGH: ${missingHigh.join(', ')}`);

  let depthStatus: RegionMeasurementDepthStatus = 'UNMEASURED';
  if (qualifiedDimensions.length === 0) {
    depthStatus = 'UNMEASURED';
    reasons.push('No qualified dimensions');
  } else if (missingCritical.length === 0 && weight >= DEPTH_SUFFICIENT_MIN_WEIGHT + 3) {
    depthStatus = 'DEEP';
    reasons.push(`${qualifiedDimensions.length} valid dimensions; all critical present`);
  } else if (
    (missingCritical.length === 0 || criticalResolved >= 1) &&
    weight >= DEPTH_SUFFICIENT_MIN_WEIGHT &&
    qualifiedDimensions.length >= 3
  ) {
    depthStatus = 'SUFFICIENT';
    reasons.push(`${qualifiedDimensions.length} valid dimensions resolved`);
  } else if (weight >= 1) {
    depthStatus = 'SHALLOW';
    if (missingHigh.length) reasons.push(`SHALLOW: missing ${missingHigh.slice(0, 3).join(', ')}`);
  } else {
    depthStatus = 'BLOCKED';
  }

  return {
    regionId: bundle.regionId,
    requiredCritical,
    requiredHigh,
    qualifiedDimensions,
    disqualifiedDimensions,
    criticalResolved,
    highResolved,
    depthScore: weight,
    depthStatus,
    reasons,
  };
}

export function computeTopLevelDepthAggregation(input: {
  profile: PageRegionLayoutProfile;
  regionForensics: RegionForensicsBundle[];
}): TopLevelDepthAggregation {
  const majorDefs = input.profile.regions.filter((r) => r.significance === 'MAJOR');
  const majorRegionCount = majorDefs.length;

  const regionSummaries: TopLevelDepthAggregation['regionSummaries'] = [];
  let sufficientRegionCount = 0;
  let deepRegionCount = 0;
  let shallowRegionCount = 0;
  let blockedRegionCount = 0;

  for (const def of majorDefs) {
    const bundle = input.regionForensics.find((b) => b.regionId === def.regionId);
    const comp = bundle?.depthComputation;
    const status = comp?.depthStatus ?? bundle?.measurementDepth?.status ?? 'UNMEASURED';
    const validCount = comp?.qualifiedDimensions.filter((q) => q.countsTowardDepth).length ?? 0;
    const expected = (comp?.requiredCritical.length ?? 0) + (comp?.requiredHigh.length ?? 0) || 4;

    regionSummaries.push({
      regionId: def.regionId,
      regionName: def.regionName,
      depthStatus: status,
      validDimensionCount: validCount,
      expectedDimensionCount: expected,
      reasons: comp?.reasons ?? [],
    });

    if (bundle?.status !== 'MATCHED') continue;

    if (status === 'SUFFICIENT') sufficientRegionCount += 1;
    else if (status === 'DEEP') {
      deepRegionCount += 1;
      sufficientRegionCount += 1;
    } else if (status === 'SHALLOW') shallowRegionCount += 1;
    else if (status === 'BLOCKED' || status === 'UNMEASURED') blockedRegionCount += 1;
  }

  const depthPct = majorRegionCount ? Math.round((sufficientRegionCount / majorRegionCount) * 100) : 0;

  let status: TopLevelDepthAggregation['status'] = 'PASS';
  if (depthPct < 50) status = 'BLOCK';
  else if (depthPct < 75 || shallowRegionCount > 0) status = 'WARNING';

  return {
    majorRegionCount,
    sufficientRegionCount,
    deepRegionCount,
    shallowRegionCount,
    blockedRegionCount,
    depthPct,
    status,
    regionSummaries,
  };
}

export function runForensicConsistencyCheck(input: {
  aggregation: TopLevelDepthAggregation;
  regionForensics: RegionForensicsBundle[];
}): { consistent: boolean; status: 'OK' | 'FORENSIC_STATE_INCONSISTENT'; message: string | null } {
  let visibleQualified = 0;
  for (const bundle of input.regionForensics) {
    if (bundle.significance !== 'MAJOR' || bundle.status !== 'MATCHED') continue;
    const valid = bundle.depthComputation?.qualifiedDimensions.filter((q) => q.countsTowardDepth).length ?? 0;
    if (valid >= 3) visibleQualified += 1;
  }

  if (visibleQualified >= 4 && input.aggregation.sufficientRegionCount === 0 && input.aggregation.depthPct === 0) {
    return {
      consistent: false,
      status: 'FORENSIC_STATE_INCONSISTENT',
      message: `${visibleQualified} regions show qualified dimensions but top-level depth is 0%`,
    };
  }

  return { consistent: true, status: 'OK', message: null };
}

export function isRegionDepthSufficient(bundle: RegionForensicsBundle): boolean {
  const status = bundle.depthComputation?.depthStatus ?? bundle.measurementDepth?.status;
  return status === 'SUFFICIENT' || status === 'DEEP';
}

export function reconcileBundleDimensions(bundle: RegionForensicsBundle): RegionForensicsBundle {
  const profile = getRegionMeasurementProfile(bundle.regionType);
  const importanceByDim = new Map(
    [...profile.required, ...profile.optional].map((r) => [r.dimension, r.importance]),
  );

  const dimensions: RegionDimensionEvidence[] = [];
  for (const row of bundle.dimensions) {
    const imp = importanceByDim.get(row.dimension) ?? row.importance ?? 'MEDIUM';
    const { updated } = qualifyDimensionEvidence({ row, importance: imp });
    dimensions.push(updated);
  }

  const depthComputation = computeRegionDepthComputation({ ...bundle, dimensions });
  const depth = {
    ...(bundle.measurementDepth ?? {
      regionId: bundle.regionId,
      regionType: bundle.regionType,
      requiredDimensions: profile.required.map((r) => r.dimension),
      resolvedDimensions: [],
      missingDimensions: [],
      depthScore: 0,
      confidence: bundle.confidence,
      status: 'UNMEASURED' as RegionMeasurementDepthStatus,
    }),
    status: depthComputation.depthStatus,
    depthScore: depthComputation.depthScore,
    resolvedDimensions: depthComputation.qualifiedDimensions.map((q) => q.dimension),
    missingDimensions: depthComputation.reasons.filter((r) => r.startsWith('MISSING')).flatMap((r) => r.split(':').slice(1).join(':').split(',').map((s) => s.trim())),
    validDimensionCount: depthComputation.qualifiedDimensions.filter((q) => q.countsTowardDepth).length,
    disqualifiedDimensionCount: depthComputation.disqualifiedDimensions.length,
    depthReasons: depthComputation.reasons,
  };

  return {
    ...bundle,
    dimensions,
    measurementDepth: depth,
    depthComputation,
  };
}
