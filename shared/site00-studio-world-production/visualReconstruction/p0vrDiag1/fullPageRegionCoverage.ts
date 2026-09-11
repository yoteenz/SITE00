/**
 * P0.VR.DIAG.1R1 — Full-page region coverage map + coverage gate.
 */

import {
  COVERAGE_BLOCK_DEPTH_RATIO,
  COVERAGE_BLOCK_MAJOR_RATIO,
} from './constants.js';
import type { PageRegionLayoutDefinition, PageRegionLayoutProfile } from './pageRegionLayoutProfiles.js';
import type {
  ForensicCaptureScope,
  ForensicCoverageGate,
  ForensicCoverageScore,
  ForensicCoverageGateStatus,
  FullPageForensicStatus,
  FullPageRegionCoverageMap,
  RegionForensicsBundle,
  VisualRegionMatch,
} from './types.js';
import type { DesignViewportClass } from '../p0vr2/types.js';

export function resolveCaptureScopes(input: {
  authorityReferenceType?: 'VIEWPORT_SCREENSHOT' | 'FULL_PAGE_REFERENCE';
  currentHeight: number;
  authorityHeight: number;
}): {
  currentScope: ForensicCaptureScope;
  authorityScope: ForensicCaptureScope;
  scopeMismatch: boolean;
} {
  const authorityScope: ForensicCaptureScope =
    input.authorityReferenceType === 'FULL_PAGE_REFERENCE' ? 'FULL_PAGE' : 'CURRENT_VIEWPORT';
  const currentScope: ForensicCaptureScope = 'CURRENT_VIEWPORT';
  const scopeMismatch =
    authorityScope === 'FULL_PAGE' && input.currentHeight < input.authorityHeight * 0.85;
  return { currentScope, authorityScope, scopeMismatch };
}

export function computeForensicCoverageScore(input: {
  profile: PageRegionLayoutProfile;
  regionForensics: RegionForensicsBundle[];
  regionMatches: VisualRegionMatch[];
}): ForensicCoverageScore {
  const majorDefs = input.profile.regions.filter((r) => r.significance === 'MAJOR');
  const majorTotal = majorDefs.length;

  const accountedStatuses = new Set(['MATCHED', 'MISSING_CURRENT', 'AMBIGUOUS', 'MISSING_AUTHORITY']);
  const majorAccounted = majorDefs.filter((def) => {
    const match = input.regionMatches.find((m) => m.regionId === def.regionId);
    return match && accountedStatuses.has(match.status);
  }).length;

  const majorWithDepth = majorDefs.filter((def) => {
    const bundle = input.regionForensics.find((b) => b.regionId === def.regionId);
    return bundle && bundle.dimensions.length >= 2;
  }).length;

  const ambiguousCount = input.regionMatches.filter((m) => m.status === 'AMBIGUOUS').length;
  const majorAccountedPct = majorTotal ? Math.round((majorAccounted / majorTotal) * 100) : 0;
  const measurementDepthPct = majorTotal ? Math.round((majorWithDepth / majorTotal) * 100) : 0;
  const score = Math.round(majorAccountedPct * 0.55 + measurementDepthPct * 0.45);

  return {
    majorAuthorityTotal: majorTotal,
    majorAccounted,
    majorAccountedPct,
    majorWithMeasurementDepth: majorWithDepth,
    measurementDepthPct,
    ambiguousCount,
    score,
  };
}

export function evaluateForensicCoverageGate(score: ForensicCoverageScore): ForensicCoverageGate {
  let status: ForensicCoverageGateStatus = 'PASS';
  let reason = 'All major authority regions accounted for with sufficient measurement depth.';

  const majorRatio = score.majorAuthorityTotal ? score.majorAccounted / score.majorAuthorityTotal : 1;
  const depthRatio = score.majorAuthorityTotal ? score.majorWithMeasurementDepth / score.majorAuthorityTotal : 1;

  if (majorRatio < COVERAGE_BLOCK_MAJOR_RATIO || depthRatio < COVERAGE_BLOCK_DEPTH_RATIO) {
    status = 'BLOCK';
    const unaccounted = score.majorAuthorityTotal - score.majorAccounted;
    reason =
      unaccounted > 0
        ? `${unaccounted} major authority region(s) have not been accounted for (${score.majorAccounted}/${score.majorAuthorityTotal} major regions, ${score.majorWithMeasurementDepth} with multi-dimension depth).`
        : `Insufficient multi-dimension measurement depth (${score.majorWithMeasurementDepth}/${score.majorAuthorityTotal} major regions with ≥2 dimensions).`;
  } else if (score.ambiguousCount > 0 || majorRatio < 0.95 || depthRatio < 0.85) {
    status = 'WARNING';
    reason =
      score.ambiguousCount > 0
        ? `${score.ambiguousCount} ambiguous region(s) need founder review before direction approval.`
        : `Coverage acceptable but ${score.majorAuthorityTotal - score.majorWithMeasurementDepth} major region(s) lack full dimension depth.`;
  }

  return {
    status,
    reason,
    blockApproveDirection: status === 'BLOCK',
    founderMayProceedWithWarning: status === 'WARNING',
  };
}

export function buildFullPageRegionCoverageMap(input: {
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string | null;
  captureId: string;
  profile: PageRegionLayoutProfile;
  regionMatches: VisualRegionMatch[];
  regionForensics: RegionForensicsBundle[];
  currentScope: ForensicCaptureScope;
  authorityScope: ForensicCaptureScope;
  scopeMismatch: boolean;
  coverageScore: ForensicCoverageScore;
  coverageGate: ForensicCoverageGate;
}): FullPageRegionCoverageMap {
  const missingCurrent = input.regionMatches
    .filter((m) => m.status === 'MISSING_CURRENT')
    .map((m) => m.regionName);
  const extraCurrent = input.regionMatches
    .filter((m) => m.status === 'MISSING_AUTHORITY')
    .map((m) => m.regionName);
  const ambiguous = input.regionMatches.filter((m) => m.status === 'AMBIGUOUS').map((m) => m.regionName);

  const unresolvedMajor = input.profile.regions
    .filter((r) => r.significance === 'MAJOR')
    .filter((def) => {
      const bundle = input.regionForensics.find((b) => b.regionId === def.regionId);
      return !bundle || bundle.dimensions.length < 2;
    })
    .map((r) => r.regionName);

  let status: FullPageForensicStatus = 'READY_FOR_DIRECTION';
  if (input.scopeMismatch) status = 'CURRENT_CAPTURE_SCOPE_INSUFFICIENT';
  else if (input.coverageGate.status === 'BLOCK') status = 'INCOMPLETE_FORENSICS';
  else if (input.coverageGate.status === 'WARNING') status = 'READY_FOR_DIRECTION';

  return {
    pageId: input.pageId,
    viewport: input.viewport,
    authorityVersionId: input.authorityVersionId,
    captureId: input.captureId,
    authorityRegions: input.profile.regions.map((r) => r.regionName),
    currentRegions: input.regionMatches.filter((m) => m.currentRegion).map((m) => m.regionName),
    matches: input.regionMatches,
    missingCurrent,
    extraCurrent,
    ambiguous,
    coverageScore: input.coverageScore,
    unresolvedMajorRegions: unresolvedMajor,
    captureScope: input.currentScope,
    authorityCaptureScope: input.authorityScope,
    scopeMismatch: input.scopeMismatch,
    status,
  };
}

export function buildVerticalRhythmProfile(input: {
  profile: PageRegionLayoutProfile;
  regionMatches: VisualRegionMatch[];
  sectionGapAuthority: number;
  sectionGapCurrent: number;
}): import('./types.js').VerticalRhythmProfile {
  const gaps: import('./types.js').VerticalRhythmGap[] = [];
  const ordered = input.profile.regions.filter((r) => !r.shellBound);
  for (let i = 0; i < ordered.length - 1; i++) {
    const fromDef = ordered[i]!;
    const toDef = ordered[i + 1]!;
    const fromMatch = input.regionMatches.find((m) => m.regionId === fromDef.regionId);
    const toMatch = input.regionMatches.find((m) => m.regionId === toDef.regionId);
    if (!fromMatch?.authorityRegion || !toMatch?.authorityRegion) continue;
    if (!fromMatch.currentRegion || !toMatch.currentRegion) continue;

    const authGap =
      toMatch.authorityRegion.geometry.yPx -
      (fromMatch.authorityRegion.geometry.yPx + fromMatch.authorityRegion.geometry.heightPx);
    const curGap =
      toMatch.currentRegion.geometry.yPx -
      (fromMatch.currentRegion.geometry.yPx + fromMatch.currentRegion.geometry.heightPx);

    gaps.push({
      fromRegionId: fromDef.regionId,
      toRegionId: toDef.regionId,
      fromRegionName: fromDef.regionName,
      toRegionName: toDef.regionName,
      authorityGapPx: Math.round(authGap),
      currentGapPx: Math.round(curGap),
      deltaPx: Math.round(curGap - authGap),
      confidence: fromMatch.matchConfidence,
      correction:
        Math.abs(curGap - authGap) >= 4
          ? `Adjust ${fromDef.regionName} → ${toDef.regionName} gap toward ${Math.round(authGap)}px`
          : null,
    });
  }

  return { evidenceId: `rhythm_${Date.now()}`, gaps };
}

export function buildPageGutterProfile(input: {
  shell: { contentPaddingX: number } | null;
  cssSnapshot?: Record<string, string | number>;
}): import('./types.js').PageGutterProfile | null {
  if (!input.shell) return null;
  const parse = (v: string | number | undefined | null): number | null => {
    if (v == null) return null;
    if (typeof v === 'number') return v;
    const m = /^([\d.]+)/.exec(String(v).trim());
    return m ? Number(m[1]) : null;
  };
  const currentLeft = parse(input.cssSnapshot?.contentPaddingX ?? input.cssSnapshot?.['--ndx-mobile-content-px']);
  const authorityLeft = input.shell.contentPaddingX;
  const deltaLeft = currentLeft != null ? currentLeft - authorityLeft : null;

  return {
    evidenceId: `gutter_${Date.now()}`,
    authorityLeft,
    authorityRight: authorityLeft,
    currentLeft,
    currentRight: currentLeft,
    deltaLeft,
    deltaRight: deltaLeft,
    confidence: currentLeft != null ? 'HIGH' : 'MEDIUM',
    correction:
      deltaLeft != null && Math.abs(deltaLeft) >= 2
        ? `${deltaLeft < 0 ? 'Increase' : 'Decrease'} horizontal gutter toward ${authorityLeft}px`
        : null,
  };
}

export function buildRegionSequenceComparison(input: {
  profile: PageRegionLayoutProfile;
  regionMatches: VisualRegionMatch[];
}): import('./types.js').RegionSequenceComparison {
  const authorityOrder = input.profile.stackOrder;
  const present = input.regionMatches
    .filter((m) => m.currentRegion && m.status === 'MATCHED')
    .sort((a, b) => (a.currentRegion!.geometry.yPx) - (b.currentRegion!.geometry.yPx))
    .map((m) => m.regionName);
  const mismatch = present.length > 1 && present.join('|') !== input.profile.regions.slice(0, present.length).map((r) => r.regionName).join('|');

  return {
    evidenceId: `sequence_${Date.now()}`,
    authorityOrder,
    currentOrder: present.length ? present : authorityOrder,
    mismatch,
    correction: mismatch ? 'Reorder mobile stack to match authority sequence' : null,
    confidence: present.length ? 'HIGH' : 'LOW',
  };
}

export function discoverExtraCurrentRegions(input: {
  profile: PageRegionLayoutProfile;
  domMap: Map<string, import('./types.js').DomRegionMeasurement>;
}): PageRegionLayoutDefinition[] {
  const known = new Set(input.profile.regions.map((r) => r.regionId));
  const extras: PageRegionLayoutDefinition[] = [];
  for (const [regionId, dom] of input.domMap) {
    if (known.has(regionId)) continue;
    if (dom.actualHeight < 4) continue;
    extras.push({
      regionId,
      regionName: regionId.split('.').pop()?.toUpperCase() ?? 'EXTRA REGION',
      regionType: 'CUSTOM',
      significance: 'MINOR',
      category: 'GEOMETRY',
      normalizedY: dom.actualY / 844,
      normalizedHeight: dom.actualHeight / 844,
      hierarchyWeight: 0.3,
    });
  }
  return extras;
}
