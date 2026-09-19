/**
 * P0.VR.DIAG.1R5B — VIEW STRUCTURE on blockers + zero-anchor recovery.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_DIAG_1R5B_BUILD,
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
  regionCardMustShowViewStructure,
  collectMeaningfulChildCandidates,
  detectRepeatedRowGeometry,
  resolveMetricRegionSubtype,
  buildMeasurementOriginTraces,
  summarizeAnchorSideStatus,
  resetRegionInternalStructureRegistryForTest,
  resetRegionStructureVersionsForTest,
  analyzeSingleRegionStructure,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R5/index.js';
import {
  regionOffersViewStructure,
  regionCardActionListIncludesViewStructure,
} from '../src/site00/components/designWorkspace/pageFamily/ForensicEvidenceOverlays.js';
import { resolvePageRegionLayoutProfile } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/pageRegionLayoutProfiles.js';
import { extractCurrentRegionStructure } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R5/currentRegionStructureExtractor.js';
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

const NDXBOOK_DOM = [
  { regionId: 'ndx.overview.header-shell', actualX: 0, actualY: 47, actualWidth: 390, actualHeight: 41 },
  { regionId: 'ndx.overview.hero', actualX: 14, actualY: 100, actualWidth: 320, actualHeight: 120 },
  { regionId: 'ndx.overview.kpis', actualX: 14, actualY: 240, actualWidth: 362, actualHeight: 40, computedGap: '8px' },
  { regionId: 'ndx.overview.production', actualX: 14, actualY: 320, actualWidth: 362, actualHeight: 140 },
  { regionId: 'ndx.overview.content-shell', actualX: 14, actualY: 480, actualWidth: 362, actualHeight: 56 },
  { regionId: 'ndx.overview.kpi.audience', actualX: 14, actualY: 560, actualWidth: 362, actualHeight: 64 },
  { regionId: 'ndx.overview.radar', actualX: 14, actualY: 640, actualWidth: 362, actualHeight: 120 },
  { regionId: 'ndx.overview.radar.row.0', actualX: 14, actualY: 648, actualWidth: 362, actualHeight: 28 },
  { regionId: 'ndx.overview.radar.row.1', actualX: 14, actualY: 680, actualWidth: 362, actualHeight: 28 },
  { regionId: 'ndx.overview.radar.row.2', actualX: 14, actualY: 712, actualWidth: 362, actualHeight: 28 },
  { regionId: 'ndx.overview.bottom-nav-shell', actualX: 0, actualY: 765, actualWidth: 390, actualHeight: 79 },
];

describe('P0.VR.DIAG.1R5B zero-anchor + VIEW STRUCTURE surface', () => {
  beforeEach(() => {
    resetForensicsEvidenceCounterForTest();
    resetDimensionEvidenceCounterForTest();
    resetRecoveryHistoryForTest();
    resetRegionInternalStructureRegistryForTest();
    resetRegionStructureVersionsForTest();
  });

  it('build constant v309', () => {
    expect(P0_VR_DIAG_1R5B_BUILD).toBe('v309');
  });

  it('VIEW STRUCTURE on shallow blocker even without regionType (name inference)', () => {
    const region = {
      regionId: 'ndx.overview.kpis',
      regionName: 'SECTION NAVIGATION',
      status: 'MATCHED',
      confidence: 'MEDIUM',
      dimensionCount: 1,
      measurementDepthStatus: 'SHALLOW',
      topDelta: null,
    };
    expect(regionOffersViewStructure(region)).toBe(true);
    expect(
      regionCardActionListIncludesViewStructure(region, ['VIEW EVIDENCE', 'VIEW STRUCTURE']),
    ).toBe(true);
  });

  it('structure undefined still offers VIEW STRUCTURE for shallow major', () => {
    expect(
      regionCardMustShowViewStructure({
        regionName: 'METRIC / STATUS CELLS',
        measurementDepthStatus: 'SHALLOW',
      }),
    ).toBe(true);
  });

  it('meaningful child traversal detects list rows', () => {
    const container = NDXBOOK_DOM.find((d) => d.regionId === 'ndx.overview.radar')!;
    const related = NDXBOOK_DOM.filter((d) => d.regionId.startsWith('ndx.overview.radar.row'));
    const { accepted } = collectMeaningfulChildCandidates({ container, relatedDom: related });
    expect(accepted.length).toBeGreaterThanOrEqual(3);
    expect(detectRepeatedRowGeometry(accepted)?.length).toBeGreaterThanOrEqual(3);
  });

  it('LIST region extracts row anchors when related DOM present', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'LIST')!;
    const dom = NDXBOOK_DOM.find((d) => d.regionId === def.regionId)!;
    const related = NDXBOOK_DOM.filter((m) => m.regionId.startsWith(def.regionId) && m.regionId !== def.regionId);
    const structure = extractCurrentRegionStructure({ def, dom, relatedDom: related });
    const nonContainer = structure.childAnchors.filter((a) => a.anchorType !== 'CONTAINER');
    expect(nonContainer.length).toBeGreaterThanOrEqual(3);
    expect(structure.groups.some((g) => g.groupType === 'LIST_ROWS')).toBe(true);
  });

  it('metric subtype resolver for METRIC / STATUS CELLS', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionName.includes('METRIC'))!;
    const dom = NDXBOOK_DOM.find((d) => d.regionId === def.regionId)!;
    const res = resolveMetricRegionSubtype({ def, dom, relatedDom: [] });
    expect(['STATUS_CELLS', 'METRIC_GRID', 'AMBIGUOUS', 'KPI_BAND']).toContain(res.subtype);
  });

  it('diagnosis R5B flags showViewStructure on shallow regions', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile', screenId: 'overview' });
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      currentCapture: { captureId: 'cap_r5b', width: 390, height: 844, domMeasurements: NDXBOOK_DOM },
      designAuthority: { authorityVersionId: 'a', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const diagnosis = forensicReportToVisualDiagnosis(report, { profile, domMeasurements: NDXBOOK_DOM });
    expect(diagnosis.structureUiVersion).toBe('R5B');
    const shallow = diagnosis.allRegionForensics?.filter((r) => r.measurementDepthStatus === 'SHALLOW') ?? [];
    for (const r of shallow) {
      expect(r.showViewStructure).toBe(true);
      expect(regionOffersViewStructure(r)).toBe(true);
    }
  });

  it('recovery reconciles after structure pass (R5B build)', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile', screenId: 'overview' });
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      currentCapture: { captureId: 'cap_r5b_rec', width: 390, height: 844, domMeasurements: NDXBOOK_DOM },
      designAuthority: { authorityVersionId: 'auth', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const beforePct = report.topLevelDepthAggregation?.depthPct ?? 0;
    const { report: after, receipt } = analyzeMissingForensicEvidence({
      report,
      profile,
      forensicsVersion: 'v308',
      domMeasurements: NDXBOOK_DOM,
      shell: { headerPaddingX: 14, contentPaddingX: 14, sectionGap: 10 },
    });
    expect(receipt.forensicsVersionAfter).toBe(P0_VR_DIAG_1R5B_BUILD);
    expect(receipt.structureRecoveryReceipts?.length).toBeGreaterThan(0);
    const afterPct = after.topLevelDepthAggregation?.depthPct ?? 0;
    expect(afterPct).toBeGreaterThanOrEqual(beforePct);
    expect((receipt.structureRecoveryReceipts?.length ?? 0) > 0 || receipt.rootCauseSummary).toBeTruthy();
  });

  it('single-region analyze returns recovery receipt', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const report = runAuthorityRelativeForensics({
      pageId: 'p',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: { captureId: 'c', width: 390, height: 844, domMeasurements: NDXBOOK_DOM },
      designAuthority: { authorityVersionId: 'a', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const nav = profile.regions.find((r) => r.regionType === 'NAVIGATION')!;
    const result = analyzeSingleRegionStructure({
      report,
      profile,
      regionId: nav.regionId,
      domMeasurements: NDXBOOK_DOM,
    });
    expect(result?.receipt.regionId).toBe(nav.regionId);
  });

  it('measurement origin trace flags container-only when no anchors', () => {
    const traces = buildMeasurementOriginTraces(
      [
        {
          evidenceId: 'e1',
          dimension: 'bandWidth',
          authorityValue: 100,
          currentValue: 90,
          delta: '-10px',
          confidence: 'MEDIUM',
          currentSource: 'DOM_RECT',
          source: 'DOM_RECT',
        },
      ],
      [],
    );
    expect(traces[0]?.containerOnly).toBe(true);
  });

  it('anchor side summary exposes authority unresolved path', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'NAVIGATION')!;
    const dom = NDXBOOK_DOM.find((d) => d.regionId === def.regionId)!;
    const current = extractCurrentRegionStructure({ def, dom, relatedDom: [] });
    const summary = summarizeAnchorSideStatus({
      current,
      authority: { ...current, childAnchors: [current.childAnchors[0]!], status: 'UNRESOLVED' },
    });
    expect(summary.current).not.toBe('UNRESOLVED');
    expect(summary.authority).toBe('UNRESOLVED');
  });

  it('reconcile runs after bundle structure update', () => {
    const profile = resolvePageRegionLayoutProfile({ pageArchetype: 'ndxbook-overview-mobile' });
    const def = profile.regions.find((r) => r.regionType === 'NAVIGATION')!;
    const reconciled = reconcileBundleDimensions({
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
      internalStructure: { status: 'PARTIAL', completenessPct: 40, anchorHierarchy: ['CONTAINER', 'ITEM_1'] },
    });
    expect(reconciled.depthComputation).toBeDefined();
  });
});
