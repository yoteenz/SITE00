/**
 * P0.VR.DIAG.1R2 — Region measurement depth + DOM-assisted extraction.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  buildForensicUpgradeBundle,
  evaluateForensicMeasurementDepthGate,
  extractCurrentDomMeasurements,
  extractAuthorityImageMeasurements,
  getRegionMeasurementProfile,
  isRegionDepthSufficient,
  P0_VR_DIAG_1R2_BUILD,
  resetDimensionEvidenceCounterForTest,
  resetForensicsEvidenceCounterForTest,
  resolvePageRegionLayoutProfile,
  runAuthorityRelativeForensics,
  validatePxDimension,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/index.js';

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
  { regionId: 'ndx.overview.header-shell', actualX: 0, actualY: 47, actualWidth: 390, actualHeight: 41, computedFontSize: '14px', computedGap: '8px' },
  { regionId: 'ndx.overview.hero', actualX: 14, actualY: 100, actualWidth: 320, actualHeight: 120, computedFontSize: '22px', computedLineHeight: '26px' },
  { regionId: 'ndx.overview.kpis', actualX: 14, actualY: 240, actualWidth: 362, actualHeight: 64, computedGap: '12px' },
  { regionId: 'ndx.overview.production', actualX: 14, actualY: 320, actualWidth: 362, actualHeight: 140 },
  { regionId: 'ndx.overview.content-shell', actualX: 14, actualY: 480, actualWidth: 362, actualHeight: 56 },
  { regionId: 'ndx.overview.radar', actualX: 14, actualY: 550, actualWidth: 362, actualHeight: 120 },
  { regionId: 'ndx.overview.bottom-nav-shell', actualX: 0, actualY: 765, actualWidth: 390, actualHeight: 79 },
];

function runNdxOverview(domMeasurements = FULL_DOM) {
  return runAuthorityRelativeForensics({
    pageId: 'ndxbook:/projects/ndxbook',
    viewport: 'mobile',
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
    route: '/projects/ndxbook',
    currentCapture: {
      captureId: 'cap_r2',
      width: 390,
      height: 844,
      domMeasurements,
      cssSnapshot: { contentPaddingX: 14, headerHeightPx: 41, bottomNavHeightPx: 79, sectionGap: 10 },
    },
    designAuthority: {
      authorityVersionId: 'authv_r2',
      width: 390,
      height: 844,
      visualShellSpec: SHELL,
    },
  });
}

describe('P0.VR.DIAG.1R2 measurement depth', () => {
  beforeEach(() => {
    resetForensicsEvidenceCounterForTest();
    resetDimensionEvidenceCounterForTest();
  });

  it('1. build constant', () => {
    expect(P0_VR_DIAG_1R2_BUILD).toBe('v304');
  });

  it('2. matched major regions have multi-dimension evidence (not 0)', () => {
    const report = runNdxOverview();
    const majorMatched = report.regionForensics.filter(
      (b) => b.significance === 'MAJOR' && b.status === 'MATCHED',
    );
    expect(majorMatched.length).toBeGreaterThanOrEqual(6);
    for (const bundle of majorMatched) {
      expect(bundle.dimensions.length).toBeGreaterThanOrEqual(3);
      expect(bundle.measurementDepth?.resolvedDimensions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('3. section nav has height inset itemGap dimensions', () => {
    const report = runNdxOverview();
    const nav = report.regionForensics.find((b) => b.regionId.includes('kpis'));
    expect(nav).toBeTruthy();
    const names = nav!.dimensions.map((d) => d.dimension);
    expect(names).toContain('containerHeight');
    expect(names.some((n) => n.includes('Inset') || n === 'leftInset')).toBe(true);
    expect(names).toContain('itemGap');
  });

  it('4. hero/media has position and aspect ratio', () => {
    const report = runNdxOverview();
    const hero = report.regionForensics.find((b) => b.regionId.includes('production'));
    expect(hero).toBeTruthy();
    const names = hero!.dimensions.map((d) => d.dimension);
    expect(names).toContain('width');
    expect(names).toContain('height');
    expect(names).toContain('aspectRatio');
  });

  it('5. current values prefer DOM sources when dom present', () => {
    const report = runNdxOverview();
    const header = report.regionForensics.find((b) => b.regionId.includes('header-shell'));
    expect(header).toBeTruthy();
    const domDims = header!.dimensions.filter(
      (d) => d.currentSource === 'DOM_RECT' || d.currentSource === 'COMPUTED_STYLE' || d.source === 'DOM',
    );
    expect(domDims.length).toBeGreaterThanOrEqual(2);
  });

  it('6. authority sources are image-derived', () => {
    const report = runNdxOverview();
    const anyAuth = report.regionForensics.flatMap((b) => b.dimensions).find((d) => d.authoritySource);
    expect(anyAuth?.authoritySource).toBe('AUTHORITY_IMAGE_ESTIMATE');
  });

  it('7. depth gate blocks when only shell dom (regression)', () => {
    const report = runNdxOverview([FULL_DOM[0]!, FULL_DOM[6]!]);
    const profile = resolvePageRegionLayoutProfile({
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      isRootPage: true,
    });
    const gate = evaluateForensicMeasurementDepthGate({
      profile,
      regionForensics: report.regionForensics,
    });
    expect(['BLOCK', 'WARNING']).toContain(gate.status);
  });

  it('8. full pilot reaches sufficient depth on most majors', () => {
    const report = runNdxOverview();
    const sufficient = report.regionForensics.filter(
      (b) => b.significance === 'MAJOR' && isRegionDepthSufficient(b),
    ).length;
    expect(sufficient).toBeGreaterThanOrEqual(5);
    expect(report.coverageMap.coverageScore.majorWithSufficientDepth).toBeGreaterThanOrEqual(5);
  });

  it('9. region coverage regression 8/8 accounted', () => {
    const report = runNdxOverview();
    expect(report.coverageMap.coverageScore.majorAccounted).toBe(report.coverageMap.coverageScore.majorAuthorityTotal);
  });

  it('10. measured spec carries depth metadata', () => {
    const bundle = buildForensicUpgradeBundle({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      route: '/projects/ndxbook',
      pagePurpose: 'NDXBOOK OVERVIEW',
      isRootPage: true,
      currentCapture: {
        captureId: 'cap_r2',
        width: 390,
        height: 844,
        domMeasurements: FULL_DOM,
        cssSnapshot: { contentPaddingX: 14 },
      },
      designAuthority: {
        authorityVersionId: 'authv_r2',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    const withDepth = bundle.measuredSpec.regionSpecs.filter((s) => s.resolvedDimensions?.length);
    expect(withDepth.length).toBeGreaterThan(4);
  });

  it('11. profiles exist for header nav hero', () => {
    expect(getRegionMeasurementProfile('HEADER').required.length).toBeGreaterThanOrEqual(4);
    expect(getRegionMeasurementProfile('NAVIGATION').required.map((r) => r.dimension)).toContain('itemGap');
    expect(getRegionMeasurementProfile('MEDIA').required.map((r) => r.dimension)).toContain('aspectRatio');
  });

  it('12. dimension validity rejects negative px', () => {
    expect(
      validatePxDimension({ name: 'height', value: -1, viewportWidth: 390, viewportHeight: 844, source: 'DOM_RECT' }).valid,
    ).toBe(false);
  });

  it('13. DOM extractor returns rect scalars', () => {
    const dom = FULL_DOM[2]!;
    const extracted = extractCurrentDomMeasurements({
      def: {
        regionId: dom.regionId,
        regionName: 'SECTION NAVIGATION',
        regionType: 'NAVIGATION',
        significance: 'MAJOR',
        category: 'NAVIGATION',
        normalizedY: 0.2,
        normalizedHeight: 0.08,
        hierarchyWeight: 0.8,
      },
      current: {
        regionId: dom.regionId,
        regionName: 'SECTION NAVIGATION',
        category: 'NAVIGATION',
        geometry: {
          xPx: dom.actualX,
          yPx: dom.actualY,
          widthPx: dom.actualWidth,
          heightPx: dom.actualHeight,
          widthPct: 90,
          heightPct: 8,
          aspectRatio: dom.actualWidth / dom.actualHeight,
          topOffsetPx: dom.actualY,
          leftOffsetPx: dom.actualX,
          rightOffsetPx: 0,
          bottomOffsetPx: 0,
        },
      },
      dom,
      viewportWidth: 390,
    });
    expect(extracted.scalars.get('itemGap')?.source).toBe('COMPUTED_STYLE');
  });
});
