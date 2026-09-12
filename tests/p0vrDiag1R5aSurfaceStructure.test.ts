/**
 * P0.VR.DIAG.1R5A — VIEW STRUCTURE visibility + structure→depth trace.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_DIAG_1R5A_BUILD,
  runAuthorityRelativeForensics,
  forensicReportToVisualDiagnosis,
  resetForensicsEvidenceCounterForTest,
  resetDimensionEvidenceCounterForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/index.js';
import {
  analyzeMissingForensicEvidence,
  resetRecoveryHistoryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R4/index.js';
import {
  shouldShowViewStructure,
  buildStructureToDepthTrace,
  structureCacheKey,
  resetRegionInternalStructureRegistryForTest,
  resetRegionStructureVersionsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R5/index.js';
import { regionOffersViewStructure } from '../src/site00/components/designWorkspace/pageFamily/ForensicEvidenceOverlays.js';
import { resolvePageRegionLayoutProfile } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/pageRegionLayoutProfiles.js';
import { reconcileBundleDimensions } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/forensicDepthQualification.js';

const SHELL = {
  headerHeightPx: 52,
  headerPaddingX: 14,
  contentPaddingX: 14,
  sectionGap: 10,
  bottomNavHeightPx: 52,
  viewportWidth: 390,
  viewportHeight: 844,
};

const SHALLOW_QA_DOM = [
  { regionId: 'ndx.overview.header-shell', actualX: 0, actualY: 47, actualWidth: 390, actualHeight: 41 },
  { regionId: 'ndx.overview.hero', actualX: 14, actualY: 100, actualWidth: 320, actualHeight: 120 },
  { regionId: 'ndx.overview.kpis', actualX: 14, actualY: 240, actualWidth: 362, actualHeight: 40, computedGap: '8px' },
  { regionId: 'ndx.overview.production', actualX: 14, actualY: 320, actualWidth: 362, actualHeight: 140 },
  { regionId: 'ndx.overview.content-shell', actualX: 14, actualY: 480, actualWidth: 362, actualHeight: 56 },
  { regionId: 'ndx.overview.kpi.audience', actualX: 14, actualY: 560, actualWidth: 362, actualHeight: 64 },
  { regionId: 'ndx.overview.radar', actualX: 14, actualY: 640, actualWidth: 362, actualHeight: 120 },
  { regionId: 'ndx.overview.bottom-nav-shell', actualX: 0, actualY: 765, actualWidth: 390, actualHeight: 79 },
];

describe('P0.VR.DIAG.1R5A surface structure UI + depth binding', () => {
  beforeEach(() => {
    resetForensicsEvidenceCounterForTest();
    resetDimensionEvidenceCounterForTest();
    resetRecoveryHistoryForTest();
    resetRegionInternalStructureRegistryForTest();
    resetRegionStructureVersionsForTest();
  });

  it('build constant', () => {
    expect(P0_VR_DIAG_1R5A_BUILD).toBe('v308');
  });

  it('VIEW STRUCTURE visible for partial + shallow complex regions', () => {
    expect(
      shouldShowViewStructure({
        regionType: 'NAVIGATION',
        measurementDepthStatus: 'SHALLOW',
        internalStructureStatus: 'PARTIAL',
      }),
    ).toBe(true);
    expect(
      regionOffersViewStructure({
        regionId: 'r',
        regionName: 'NAV',
        regionType: 'NAVIGATION',
        measurementDepthStatus: 'SHALLOW',
        internalStructureStatus: 'PARTIAL',
        status: 'MATCHED',
        confidence: 'MEDIUM',
        dimensionCount: 1,
        topDelta: null,
      }),
    ).toBe(true);
  });

  it('diagnosis enriches complex regions with showViewStructure without prior recovery', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile', screenId: 'overview' });
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      currentCapture: { captureId: 'cap', width: 390, height: 844, domMeasurements: SHALLOW_QA_DOM },
      designAuthority: { authorityVersionId: 'a', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const diagnosis = forensicReportToVisualDiagnosis(report, { profile, domMeasurements: SHALLOW_QA_DOM });
    expect(diagnosis.structureUiVersion).toBe('R5A');
    const nav = diagnosis.allRegionForensics?.find((r) => r.regionType === 'NAVIGATION');
    expect(nav?.showViewStructure).toBe(true);
    expect(nav?.internalStructureHierarchy?.length).toBeGreaterThan(0);
  });

  it('recovery produces structureToDepthTraces and re-reconciles after type repair', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile', screenId: 'overview' });
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      currentCapture: { captureId: 'cap_r5a', width: 390, height: 844, domMeasurements: SHALLOW_QA_DOM },
      designAuthority: { authorityVersionId: 'auth', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const beforePct = report.topLevelDepthAggregation?.depthPct ?? 0;
    const { report: after, receipt } = analyzeMissingForensicEvidence({
      report,
      profile,
      forensicsVersion: 'v307',
      domMeasurements: SHALLOW_QA_DOM,
      shell: { headerPaddingX: 14, contentPaddingX: 14, sectionGap: 10 },
    });
    expect(receipt.forensicsVersionAfter).toBe(P0_VR_DIAG_1R5A_BUILD);
    expect(receipt.structureToDepthTraces?.length).toBeGreaterThan(0);
    const afterPct = after.topLevelDepthAggregation?.depthPct ?? 0;
    expect(afterPct).toBeGreaterThanOrEqual(beforePct);
    const key = structureCacheKey({
      pageId: after.pageId,
      viewport: after.viewport,
      authorityVersionId: after.authorityVersionId,
      captureId: after.captureId,
      forensicsVersion: P0_VR_DIAG_1R5A_BUILD,
    });
    expect(key.includes('cap_r5a')).toBe(true);
  });

  it('StructureToDepthTrace explains unchanged depth', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'NAVIGATION')!;
    const bundle = reconcileBundleDimensions({
      regionId: def.regionId,
      regionName: def.regionName,
      regionType: 'NAVIGATION',
      significance: 'MAJOR',
      status: 'MATCHED',
      componentTarget: {
        regionId: def.regionId,
        componentId: null,
        selector: null,
        route: null,
        confidence: 'HIGH',
        unresolvedComponentTarget: false,
      },
      dimensions: [],
      corrections: [],
      confidence: 'MEDIUM',
      functionalRisk: 'LOW',
    });
    const trace = buildStructureToDepthTrace({
      regionId: def.regionId,
      regionName: def.regionName,
      internalStructureStatus: 'PARTIAL',
      resolvedAnchorLabels: ['ITEM_1'],
      structureEvidence: [],
      bundleBefore: bundle,
    });
    expect(trace.depthChanged).toBe(false);
    expect(trace.blockingReason).toBeTruthy();
  });
});
