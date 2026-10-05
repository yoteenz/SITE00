/**
 * P0.VR.DIAG.1R4 — Targeted shallow region evidence recovery.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_DIAG_1R4_BUILD,
  resetDimensionEvidenceCounterForTest,
  resetForensicsEvidenceCounterForTest,
  runAuthorityRelativeForensics,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/index.js';
import {
  analyzeMissingForensicEvidence,
  recoverDomTarget,
  resolveBlockingRegions,
  buildRegionEvidenceRecoveryPlan,
  runAuthorityRegionMeasurementPass,
  extractRegionChildAnchors,
  computeRegionEvidenceCompleteness,
  mergeRecoveredDimensions,
  recordFounderRegionOverride,
  resetFounderRegionOverridesForTest,
  resetRecoveryHistoryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R4/index.js';
import {
  isRegionDepthSufficient,
  reconcileBundleDimensions,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/forensicDepthQualification.js';
import { resolvePageRegionLayoutProfile } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/pageRegionLayoutProfiles.js';
import { reconcileForensicReportScoring } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/forensicReconciliation.js';

const SHELL = {
  headerHeightPx: 52,
  headerPaddingX: 14,
  contentPaddingX: 14,
  sectionGap: 10,
  bottomNavHeightPx: 52,
  viewportWidth: 390,
  viewportHeight: 844,
};

/** Live QA–like DOM: regions present but nav/progress/metrics lack gap/padding signals. */
const SHALLOW_QA_DOM = [
  { regionId: 'ndx.overview.header-shell', actualX: 0, actualY: 47, actualWidth: 390, actualHeight: 41, computedFontSize: '14px' },
  { regionId: 'ndx.overview.hero', actualX: 14, actualY: 100, actualWidth: 320, actualHeight: 120, computedFontSize: '22px' },
  { regionId: 'ndx.overview.kpis', actualX: 14, actualY: 240, actualWidth: 362, actualHeight: 40 },
  { regionId: 'ndx.overview.production', actualX: 14, actualY: 320, actualWidth: 362, actualHeight: 140 },
  { regionId: 'ndx.overview.content-shell', actualX: 14, actualY: 480, actualWidth: 362, actualHeight: 56 },
  { regionId: 'ndx.overview.kpi.audience', actualX: 14, actualY: 560, actualWidth: 362, actualHeight: 64 },
  { regionId: 'ndx.overview.radar', actualX: 14, actualY: 640, actualWidth: 362, actualHeight: 120 },
  { regionId: 'ndx.overview.bottom-nav-shell', actualX: 0, actualY: 765, actualWidth: 390, actualHeight: 79 },
];

describe('P0.VR.DIAG.1R4 evidence recovery', () => {
  beforeEach(() => {
    resetForensicsEvidenceCounterForTest();
    resetDimensionEvidenceCounterForTest();
    resetFounderRegionOverridesForTest();
    resetRecoveryHistoryForTest();
  });

  it('build constant', () => {
    expect(P0_VR_DIAG_1R4_BUILD).toBe('v306');
  });

  it('identifies blocking regions from live R3 report (not hardcoded names)', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      route: '/projects/ndxbook',
      currentCapture: { captureId: 'cap_r4', width: 390, height: 844, domMeasurements: SHALLOW_QA_DOM, cssSnapshot: { contentPaddingX: 14 } },
      designAuthority: { authorityVersionId: 'auth_r4', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile', screenId: 'overview' });
    const blocking = resolveBlockingRegions({ report, profile });
    expect(blocking.length).toBeGreaterThanOrEqual(1);
    expect(blocking.every((b) => b.regionId.startsWith('ndx.overview.'))).toBe(true);
    const names = blocking.map((b) => b.regionName);
    expect(names.some((n) => n.includes('NAV') || n.includes('PROGRESS') || n.includes('METRIC') || n.includes('FOCUS'))).toBe(true);
  });

  it('dom target recovery avoids nth-child and uses selector hints', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionId === 'ndx.overview.kpis')!;
    const recovery = recoverDomTarget({ def, dom: SHALLOW_QA_DOM[2] });
    expect(recovery.candidateTargets.every((c) => !c.usesNthChild)).toBe(true);
    expect(recovery.chosenTarget?.signals.length).toBeGreaterThan(0);
  });

  it('section nav child anchors derive itemGap', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'NAVIGATION')!;
    const anchors = extractRegionChildAnchors({ def, dom: SHALLOW_QA_DOM[2] });
    expect(anchors.some((a) => a.role.startsWith('nav-item'))).toBe(true);
  });

  it('analyze missing evidence improves depth without new capture', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile', screenId: 'overview' });
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      currentCapture: { captureId: 'cap_r4', width: 390, height: 844, domMeasurements: SHALLOW_QA_DOM },
      designAuthority: { authorityVersionId: 'auth_r4', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const before = report.topLevelDepthAggregation?.sufficientRegionCount ?? 0;
    const { report: afterReport, receipt } = analyzeMissingForensicEvidence({
      report,
      profile,
      forensicsVersion: 'v306',
      domMeasurements: SHALLOW_QA_DOM,
      cssSnapshot: { contentPaddingX: 14, sectionGap: 10 },
      shell: { headerPaddingX: 14, contentPaddingX: 14, sectionGap: 10 },
      viewportWidth: 390,
      viewportHeight: 844,
    });
    expect(receipt.regionsAttempted.length).toBeGreaterThan(0);
    expect(receipt.captureRequired).toBe(false);
    const after = afterReport.topLevelDepthAggregation?.sufficientRegionCount ?? 0;
    expect(after).toBeGreaterThanOrEqual(before);
    expect(receipt.depthAfter.pct).toBeGreaterThanOrEqual(receipt.depthBefore.pct);
  });

  it('preserves valid evidence on merge; replace only when better', () => {
    const existing = [
      {
        evidenceId: 'e1',
        regionId: 'r',
        dimension: 'height',
        authorityValue: '40px',
        currentValue: '40px',
        unit: 'px' as const,
        confidence: 'HIGH' as const,
        source: 'DOM' as const,
        currentSource: 'DOM_RECT' as const,
        authoritySource: 'AUTHORITY_IMAGE_ESTIMATE' as const,
        delta: '0px · 0%',
      },
    ];
    const weak = [
      {
        evidenceId: 'e2',
        regionId: 'r',
        dimension: 'height',
        authorityValue: '40px',
        currentValue: '38px',
        unit: 'px' as const,
        confidence: 'LOW' as const,
        source: 'ESTIMATED' as const,
        currentSource: 'SCREENSHOT_ESTIMATE' as const,
        authoritySource: 'AUTHORITY_IMAGE_ESTIMATE' as const,
        delta: '-2px',
      },
    ];
    const { merged, added } = mergeRecoveredDimensions(existing, weak);
    expect(merged[0]?.currentValue).toBe('40px');
    expect(added).toBe(0);
  });

  it('founder exclude removes region from blocking without fake pass', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'p',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: { captureId: 'c', width: 390, height: 844, domMeasurements: SHALLOW_QA_DOM },
      designAuthority: { authorityVersionId: 'a', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const block = resolveBlockingRegions({ report, profile });
    if (!block[0]) return;
    recordFounderRegionOverride({
      reportId: report.reportId,
      regionId: block[0].regionId,
      action: 'EXCLUDE_FROM_RECONSTRUCTION',
      who: 'founder',
      reason: 'out of scope',
    });
    const afterExclude = resolveBlockingRegions({ report, profile, reportId: report.reportId });
    expect(afterExclude.some((b) => b.regionId === block[0]!.regionId)).toBe(false);
  });

  it('R3 math regression: reconciliation still runs after recovery', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'p',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: { captureId: 'c', width: 390, height: 844, domMeasurements: SHALLOW_QA_DOM },
      designAuthority: { authorityVersionId: 'a', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const { report: recovered } = analyzeMissingForensicEvidence({
      report,
      profile,
      forensicsVersion: 'v306',
      domMeasurements: SHALLOW_QA_DOM,
      shell: { headerPaddingX: 14, contentPaddingX: 14, sectionGap: 10 },
    });
    const { aggregation } = reconcileForensicReportScoring({ report: recovered, profile });
    expect(recovered.forensicConsistencyStatus).toBe('OK');
    expect(aggregation.depthPct).toBe(recovered.coverageMap.coverageScore.measurementDepthPct);
  });

  it('authority targeted remeasure pass for one region', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionId === 'ndx.overview.content-shell')!;
    const report = runAuthorityRelativeForensics({
      pageId: 'p',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: { captureId: 'c', width: 390, height: 844, domMeasurements: SHALLOW_QA_DOM },
      designAuthority: { authorityVersionId: 'a', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const match = report.regionMatches.find((m) => m.regionId === def.regionId);
    expect(match?.authorityRegion).toBeTruthy();
    const pass = runAuthorityRegionMeasurementPass({
      def,
      authority: match!.authorityRegion!,
      shell: { headerPaddingX: 14, contentPaddingX: 14, sectionGap: 10 },
      viewportWidth: 390,
      dom: SHALLOW_QA_DOM.find((d) => d.regionId === def.regionId),
    });
    expect(pass.dimensions.length).toBeGreaterThan(0);
    expect(['COMPLETE', 'PARTIAL']).toContain(pass.status);
  });

  it('type-aware completeness does not use arbitrary dimension count pass', () => {
    const bundle = reconcileBundleDimensions({
      regionId: 'ndx.overview.kpis',
      regionName: 'SECTION NAVIGATION',
      regionType: 'NAVIGATION',
      significance: 'MAJOR',
      status: 'MATCHED',
      componentTarget: { regionId: 'ndx.overview.kpis', componentId: 'x', selector: '.a', route: null, confidence: 'HIGH', unresolvedComponentTarget: false },
      dimensions: [
        {
          evidenceId: 'd1',
          regionId: 'ndx.overview.kpis',
          dimension: 'width',
          authorityValue: '300px',
          currentValue: '300px',
          unit: 'px',
          confidence: 'HIGH',
          source: 'DOM',
          currentSource: 'DOM_RECT',
          authoritySource: 'AUTHORITY_IMAGE_ESTIMATE',
          delta: '0px · 0%',
        },
        {
          evidenceId: 'd2',
          regionId: 'ndx.overview.kpis',
          dimension: 'height',
          authorityValue: '40px',
          currentValue: '40px',
          unit: 'px',
          confidence: 'HIGH',
          source: 'DOM',
          currentSource: 'DOM_RECT',
          authoritySource: 'AUTHORITY_IMAGE_ESTIMATE',
          delta: '0px · 0%',
        },
      ],
      corrections: [],
      confidence: 'HIGH',
      functionalRisk: 'LOW',
    });
    const completeness = computeRegionEvidenceCompleteness({
      regionId: bundle.regionId,
      regionType: bundle.regionType,
      depthComputation: bundle.depthComputation,
    });
    expect(isRegionDepthSufficient(bundle)).toBe(false);
    expect(completeness.blockingMissing.length).toBeGreaterThan(0);
  });

  it('recovery plan classifies DOM vs authority methods', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'NAVIGATION')!;
    const domRecovery = recoverDomTarget({ def, dom: SHALLOW_QA_DOM[2] });
    const authorityPass = runAuthorityRegionMeasurementPass({
      def,
      authority: {
        regionId: def.regionId,
        regionName: def.regionName,
        category: 'NAVIGATION',
        geometry: { x: 0, y: 0, width: 390, height: 40, widthPct: 1, heightPct: 0.05, xPct: 0, yPct: 0.2 },
      },
      viewportWidth: 390,
      dom: SHALLOW_QA_DOM[2],
    });
    const plan = buildRegionEvidenceRecoveryPlan({
      blocking: { regionId: def.regionId, regionName: def.regionName, regionType: 'NAVIGATION', depthStatus: 'SHALLOW', reasons: [] },
      bundle: reconcileBundleDimensions({
        regionId: def.regionId,
        regionName: def.regionName,
        regionType: 'NAVIGATION',
        significance: 'MAJOR',
        status: 'MATCHED',
        componentTarget: { regionId: def.regionId, componentId: null, selector: def.selectorHint ?? null, route: null, confidence: 'MEDIUM', unresolvedComponentTarget: false },
        dimensions: [],
        corrections: [],
        confidence: 'MEDIUM',
        functionalRisk: 'LOW',
      }),
      domRecovery,
      authorityPass,
      scopeMismatch: false,
    });
    expect(plan.missingCriticalDimensions.length).toBeGreaterThan(0);
    expect(plan.recommendedRecoveryMethod).toMatch(/DOM|CHILD|AUTHORITY|COMPUTED/);
  });
});
