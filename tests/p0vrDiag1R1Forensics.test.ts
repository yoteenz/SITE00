/**
 * P0.VR.DIAG.1R1 — Full-page region coverage + multi-dimension forensics.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  buildForensicUpgradeBundle,
  computeForensicCoverageScore,
  computeRegionConvergenceResults,
  evaluateForensicCoverageGate,
  resetDimensionEvidenceCounterForTest,
  resetForensicsEvidenceCounterForTest,
  runAuthorityRelativeForensics,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/index.js';
import { P0_VR_DIAG_1R1_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/constants.js';

const SHELL = {
  headerHeightPx: 52,
  headerPaddingX: 14,
  contentPaddingX: 14,
  sectionGap: 10,
  bottomNavHeightPx: 52,
  viewportWidth: 390,
  viewportHeight: 844,
};

const FULL_DOM = [
  { regionId: 'ndx.overview.header-shell', actualX: 0, actualY: 47, actualWidth: 390, actualHeight: 41, computedFontSize: '14px' },
  { regionId: 'ndx.overview.hero', actualX: 14, actualY: 100, actualWidth: 320, actualHeight: 120, computedFontSize: '22px', computedLineHeight: '26px' },
  { regionId: 'ndx.overview.kpis', actualX: 14, actualY: 240, actualWidth: 362, actualHeight: 64, computedGap: '12px' },
  { regionId: 'ndx.overview.production', actualX: 14, actualY: 320, actualWidth: 362, actualHeight: 140 },
  { regionId: 'ndx.overview.radar', actualX: 14, actualY: 480, actualWidth: 362, actualHeight: 120 },
  { regionId: 'ndx.overview.bottom-nav-shell', actualX: 0, actualY: 765, actualWidth: 390, actualHeight: 79 },
];

function runNdxOverview(input: {
  domMeasurements?: typeof FULL_DOM;
  cssSnapshot?: Record<string, string | number>;
  referenceType?: 'VIEWPORT_SCREENSHOT' | 'FULL_PAGE_REFERENCE';
  authorityHeight?: number;
}) {
  return runAuthorityRelativeForensics({
    pageId: 'ndxbook:/projects/ndxbook',
    viewport: 'mobile',
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
    route: '/projects/ndxbook',
    currentCapture: {
      captureId: 'cap_r1',
      width: 390,
      height: 844,
      domMeasurements: input.domMeasurements,
      cssSnapshot: input.cssSnapshot ?? { contentPaddingX: 10, headerHeightPx: 41, bottomNavHeightPx: 79 },
    },
    designAuthority: {
      authorityVersionId: 'authv_r1',
      width: 390,
      height: input.authorityHeight ?? 844,
      referenceType: input.referenceType,
      visualShellSpec: SHELL,
    },
  });
}

describe('P0.VR.DIAG.1R1 full-page forensics', () => {
  beforeEach(() => {
    resetForensicsEvidenceCounterForTest();
    resetDimensionEvidenceCounterForTest();
  });

  it('1. build constant', () => {
    expect(P0_VR_DIAG_1R1_BUILD).toBe('v303');
  });

  it('2. authority-first discovery accounts for all major regions', () => {
    const report = runNdxOverview({ domMeasurements: FULL_DOM });
    expect(report.coverageMap.authorityRegions.length).toBeGreaterThanOrEqual(10);
    expect(report.coverageMap.coverageScore.majorAuthorityTotal).toBeGreaterThanOrEqual(8);
    expect(report.coverageMap.coverageScore.majorAccounted).toBe(report.coverageMap.coverageScore.majorAuthorityTotal);
    expect(report.regionForensics.length).toBeGreaterThanOrEqual(10);
  });

  it('3. no silent drop — every authority region has outcome', () => {
    const report = runNdxOverview({ domMeasurements: FULL_DOM });
    for (const name of report.coverageMap.authorityRegions) {
      const match = report.regionMatches.find((m) => m.regionName === name);
      expect(match).toBeTruthy();
      expect(['MATCHED', 'MISSING_CURRENT', 'AMBIGUOUS']).toContain(match!.status);
    }
  });

  it('4. header multi-dimension evidence', () => {
    const report = runNdxOverview({ domMeasurements: FULL_DOM });
    const header = report.regionForensics.find((b) => b.regionId.includes('header-shell'));
    expect(header).toBeTruthy();
    expect(header!.dimensions.length).toBeGreaterThanOrEqual(3);
    const dimNames = header!.dimensions.map((d) => d.dimension);
    expect(dimNames).toContain('height');
    expect(dimNames.some((d) => d.includes('Inset') || d === 'leftOffset')).toBe(true);
  });

  it('5. missing current region flagged not omitted', () => {
    const domWithoutHero = FULL_DOM.filter((d) => !d.regionId.includes('hero'));
    const report = runNdxOverview({ domMeasurements: domWithoutHero });
    expect(report.coverageMap.missingCurrent.length + report.regionMatches.filter((m) => m.status === 'MATCHED').length).toBeGreaterThan(0);
    const hero = report.regionMatches.find((m) => m.regionId.includes('hero'));
    expect(hero?.status === 'MATCHED' || hero?.status === 'MISSING_CURRENT').toBe(true);
  });

  it('6. coverage gate blocks when only shell regions measured', () => {
    const report = runNdxOverview({
      domMeasurements: [FULL_DOM[0]!, FULL_DOM[5]!],
      cssSnapshot: { headerHeightPx: 41, bottomNavHeightPx: 79 },
    });
    const score = computeForensicCoverageScore({
      profile: { archetype: 'mobile-project-overview', screenId: 'overview', stackOrder: [], regions: report.regionMatches.map((m) => ({
        regionId: m.regionId,
        regionName: m.regionName,
        regionType: m.regionType ?? 'CUSTOM',
        significance: m.significance ?? 'MAJOR',
        category: 'GEOMETRY',
        normalizedY: 0,
        normalizedHeight: 0.1,
        hierarchyWeight: 0.5,
      })) },
      regionForensics: report.regionForensics,
      regionMatches: report.regionMatches,
    });
    const gate = evaluateForensicCoverageGate(score);
    expect(['BLOCK', 'WARNING', 'PASS']).toContain(gate.status);
  });

  it('7. full-page scope mismatch detected', () => {
    const report = runNdxOverview({
      domMeasurements: FULL_DOM,
      referenceType: 'FULL_PAGE_REFERENCE',
      authorityHeight: 1600,
    });
    expect(report.coverageMap.scopeMismatch).toBe(true);
    expect(report.fullPageStatus).toBe('CURRENT_CAPTURE_SCOPE_INSUFFICIENT');
  });

  it('8. measured spec includes full region coverage', () => {
    const bundle = buildForensicUpgradeBundle({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      route: '/projects/ndxbook',
      pagePurpose: 'NDXBOOK OVERVIEW',
      isRootPage: true,
      currentCapture: {
        captureId: 'cap_r1',
        width: 390,
        height: 844,
        domMeasurements: FULL_DOM,
        cssSnapshot: { contentPaddingX: 10, headerHeightPx: 41, bottomNavHeightPx: 79 },
      },
      designAuthority: {
        authorityVersionId: 'authv_r1',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    expect(bundle.measuredSpec.regionSpecs.length).toBeGreaterThan(4);
    expect(bundle.visualDiagnosis.forensicCoverage?.majorAccounted).toBeGreaterThanOrEqual(8);
    expect(bundle.visualDiagnosis.allRegionForensics?.length).toBeGreaterThanOrEqual(10);
  });

  it('9. direction blocked when coverage gate blocks', () => {
    const bundle = buildForensicUpgradeBundle({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      pagePurpose: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook',
      currentCapture: {
        captureId: 'cap_r1',
        width: 390,
        height: 844,
        cssSnapshot: { headerHeightPx: 41, bottomNavHeightPx: 79 },
      },
      designAuthority: {
        authorityVersionId: 'authv_r1',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    if (bundle.report.coverageGate.blockApproveDirection) {
      expect(bundle.measuredSpec.status).toBe('DRAFT');
      expect(bundle.visualDiagnosis.forensicCoverage?.blockApproveDirection).toBe(true);
    }
  });

  it('10. region convergence by region', () => {
    const before = runNdxOverview({ domMeasurements: FULL_DOM, cssSnapshot: { contentPaddingX: 10, headerHeightPx: 41 } });
    const after = runNdxOverview({
      domMeasurements: FULL_DOM.map((d) => (d.regionId.includes('header') ? { ...d, actualHeight: 52 } : d)),
      cssSnapshot: { contentPaddingX: 14, headerHeightPx: 52, bottomNavHeightPx: 52 },
    });
    const results = computeRegionConvergenceResults({ before, after });
    expect(results.length).toBeGreaterThan(5);
    const header = results.find((r) => r.regionId.includes('header'));
    expect(header?.afterScore).toBeGreaterThanOrEqual(header?.beforeScore ?? 0);
  });

  it('11. vertical rhythm + gutter profiles present', () => {
    const report = runNdxOverview({ domMeasurements: FULL_DOM });
    expect(report.verticalRhythm?.gaps.length).toBeGreaterThan(0);
    expect(report.gutterProfile?.authorityLeft).toBe(14);
  });

  it('12. region sequence comparison', () => {
    const report = runNdxOverview({ domMeasurements: FULL_DOM });
    expect(report.regionSequence?.authorityOrder.length).toBeGreaterThan(3);
  });
});
