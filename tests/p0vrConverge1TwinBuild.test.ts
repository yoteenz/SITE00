/**
 * P0.VR.CONVERGE.1 — Twin build with forensic warnings.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_CONVERGE_1_BUILD,
  runAuthorityRelativeForensics,
  forensicReportToVisualDiagnosis,
  reconcileForensicReportScoring,
  resetForensicsEvidenceCounterForTest,
  resetDimensionEvidenceCounterForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/index.js';
import {
  evaluateTwinBuildReadiness,
  founderMayBuildTwin,
  buildRegionExecutionDecisions,
  buildTwinCssPatch,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrConverge1/index.js';
import { combineCoverageAndDepthGates, evaluateForensicMeasurementDepthGate } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/forensicMeasurementDepthGate.js';
import { evaluateForensicCoverageGate, computeForensicCoverageScore } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/fullPageRegionCoverage.js';
import { resolvePageRegionLayoutProfile } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/pageRegionLayoutProfiles.js';

const SHELL = {
  headerHeightPx: 52,
  headerPaddingX: 14,
  contentPaddingX: 14,
  sectionGap: 10,
  bottomNavHeightPx: 52,
  viewportWidth: 390,
  viewportHeight: 844,
};

const DOM = [
  { regionId: 'ndx.overview.header-shell', actualX: 0, actualY: 47, actualWidth: 390, actualHeight: 41 },
  { regionId: 'ndx.overview.hero', actualX: 14, actualY: 100, actualWidth: 320, actualHeight: 120 },
  { regionId: 'ndx.overview.kpis', actualX: 14, actualY: 240, actualWidth: 362, actualHeight: 40, computedGap: '8px' },
  { regionId: 'ndx.overview.production', actualX: 14, actualY: 320, actualWidth: 362, actualHeight: 140 },
  { regionId: 'ndx.overview.content-shell', actualX: 14, actualY: 480, actualWidth: 362, actualHeight: 56 },
  { regionId: 'ndx.overview.kpi.audience', actualX: 14, actualY: 560, actualWidth: 362, actualHeight: 64 },
  { regionId: 'ndx.overview.radar', actualX: 14, actualY: 640, actualWidth: 362, actualHeight: 120 },
  { regionId: 'ndx.overview.bottom-nav-shell', actualX: 0, actualY: 765, actualWidth: 390, actualHeight: 79 },
];

describe('P0.VR.CONVERGE.1 twin build readiness', () => {
  beforeEach(() => {
    resetForensicsEvidenceCounterForTest();
    resetDimensionEvidenceCounterForTest();
  });

  it('build constant', () => {
    expect(P0_VR_CONVERGE_1_BUILD).toBe('v310');
  });

  it('depth block becomes warning when region coverage complete', () => {
    const coverage = evaluateForensicCoverageGate({
      majorAuthorityTotal: 8,
      majorAccounted: 8,
      majorAccountedPct: 100,
      majorWithMeasurementDepth: 8,
      majorWithSufficientDepth: 4,
      measurementDepthPct: 50,
      ambiguousCount: 0,
      score: 1,
    });
    const depth = evaluateForensicMeasurementDepthGate({
      profile: resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' }),
      regionForensics: [],
      aggregation: {
        depthPct: 50,
        sufficientRegionCount: 4,
        majorRegionCount: 8,
        regionSummaries: [],
      },
    });
    const combined = combineCoverageAndDepthGates(coverage, depth, { regionCoverageComplete: true });
    expect(combined.status).toBe('WARNING');
    expect(combined.blockApproveDirection).toBe(false);
    expect(combined.founderMayProceedWithWarning).toBe(true);
  });

  it('NDXBOOK pilot evaluates READY_WITH_WARNINGS at 50% depth', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile', screenId: 'overview' });
    const raw = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      currentCapture: { captureId: 'cap_c1', width: 390, height: 844, domMeasurements: DOM },
      designAuthority: { authorityVersionId: 'auth', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const { report } = reconcileForensicReportScoring({ report: raw, profile });
    const diagnosis = forensicReportToVisualDiagnosis(report, { profile, domMeasurements: DOM });
    const readiness = evaluateTwinBuildReadiness({
      diagnosis,
      safety: {
        authorityReady: true,
        captureReady: true,
        routeReady: true,
        viewportReady: true,
        canonicalRoute: '/projects/ndxbook',
        expectedRoute: '/projects/ndxbook',
      },
    });
    expect(readiness.coverageReady).toBe(true);
    expect(readiness.status).toBe('READY_WITH_WARNINGS');
    expect(founderMayBuildTwin(readiness)).toBe(true);
    expect(diagnosis.forensicCoverage?.founderMayProceedWithWarning).toBe(true);
    expect(diagnosis.forensicCoverage?.blockApproveDirection).toBe(false);
  });

  it('region execution decisions include shallow regions', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const raw = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: { captureId: 'cap_c2', width: 390, height: 844, domMeasurements: DOM },
      designAuthority: { authorityVersionId: 'auth', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const { report } = reconcileForensicReportScoring({ report: raw, profile });
    const decisions = buildRegionExecutionDecisions({ report, profile, authorityVersionId: 'auth' });
    expect(decisions.length).toBeGreaterThan(0);
    expect(decisions.some((d) => d.executionMode !== 'MEASURED')).toBe(true);
  });

  it('twin css patch derives variables from plan', () => {
    const patch = buildTwinCssPatch({
      plan: {
        planId: 'p',
        pageId: 'p',
        pagePurpose: 'overview',
        viewport: 'mobile',
        authorityVersionId: 'a',
        captureId: 'c',
        goal: 'match authority',
        geometryChanges: [
          {
            id: '1',
            label: 'HEADER',
            sourceDimension: 'PARENT_GEOMETRY',
            category: 'geometry',
            regionName: 'HEADER SHELL',
            authorityValue: '52px',
          },
        ],
        typographyChanges: [],
        componentChanges: [],
        assetChanges: [],
        spacingChanges: [],
        interactionPreservation: [],
        responsiveChanges: [],
        functionPreservation: [],
        rootPreservation: [],
        risks: [],
        status: 'APPROVED',
      },
      regionDecisions: [],
    });
    expect(patch.cssVariables['--site00-twin-header-height']).toBe('52px');
  });
});
