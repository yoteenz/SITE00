/**
 * P0.VR.DIAG.1R3 — Delta math + depth aggregation reconciliation.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { computeDeltaMath } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/deltaMath.js';
import { normalizeDimensionPair as normalizePair } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/dimensionNormalization.js';
import {
  isRegionDepthSufficient,
  reconcileBundleDimensions,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/forensicDepthQualification.js';
import {
  P0_VR_DIAG_1R3_BUILD,
  resetDimensionEvidenceCounterForTest,
  resetForensicsEvidenceCounterForTest,
  runAuthorityRelativeForensics,
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
  { regionId: 'ndx.overview.header-shell', actualX: 0, actualY: 47, actualWidth: 390, actualHeight: 41, computedFontSize: '14px' },
  { regionId: 'ndx.overview.hero', actualX: 14, actualY: 100, actualWidth: 320, actualHeight: 120, computedFontSize: '22px' },
  { regionId: 'ndx.overview.kpis', actualX: 14, actualY: 240, actualWidth: 362, actualHeight: 64, computedGap: '12px' },
  { regionId: 'ndx.overview.production', actualX: 14, actualY: 320, actualWidth: 362, actualHeight: 140 },
  { regionId: 'ndx.overview.content-shell', actualX: 14, actualY: 480, actualWidth: 362, actualHeight: 56 },
  { regionId: 'ndx.overview.radar', actualX: 14, actualY: 550, actualWidth: 362, actualHeight: 120 },
  { regionId: 'ndx.overview.bottom-nav-shell', actualX: 0, actualY: 765, actualWidth: 390, actualHeight: 79 },
];

describe('P0.VR.DIAG.1R3 scoring reconciliation', () => {
  beforeEach(() => {
    resetForensicsEvidenceCounterForTest();
    resetDimensionEvidenceCounterForTest();
  });

  it('1. build constant', () => {
    expect(P0_VR_DIAG_1R3_BUILD).toBe('v305');
  });

  it('2. equal px values → 0 delta', () => {
    const norm = normalizePair({ dimension: 'height', authorityValue: '52px', currentValue: '52px', unit: 'px' });
    const math = computeDeltaMath('height', norm);
    expect(math.status).toBe('EQUAL');
    expect(math.deltaPct).toBe(0);
    expect(math.displayDelta).toContain('0');
    expect(math.displayDelta).not.toContain('-100%');
  });

  it('3. zero authority baseline shows absolute not invalid pct', () => {
    const norm = normalizePair({ dimension: 'itemCount', authorityValue: '0', currentValue: '3', unit: 'count' });
    const math = computeDeltaMath('itemCount', norm);
    expect(math.status).toBe('BASELINE_ZERO');
    expect(math.deltaPct).toBeNull();
    expect(math.displayDelta).toContain('3');
  });

  it('4. both zero → 0 delta', () => {
    const norm = normalizePair({ dimension: 'itemCount', authorityValue: '0', currentValue: '0', unit: 'count' });
    const math = computeDeltaMath('itemCount', norm);
    expect(math.absoluteDelta).toBe(0);
    expect(math.deltaPct).toBe(0);
  });

  it('5. top-level depth matches qualified regions (not 0% contradiction)', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      route: '/projects/ndxbook',
      currentCapture: {
        captureId: 'cap_r3',
        width: 390,
        height: 844,
        domMeasurements: FULL_DOM,
        cssSnapshot: { contentPaddingX: 14 },
      },
      designAuthority: {
        authorityVersionId: 'auth_r3',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    expect(report.topLevelDepthAggregation).toBeTruthy();
    expect(report.topLevelDepthAggregation!.depthPct).toBeGreaterThan(0);
    expect(report.topLevelDepthAggregation!.sufficientRegionCount).toBeGreaterThanOrEqual(5);
    expect(report.coverageMap.coverageScore.measurementDepthPct).toBe(report.topLevelDepthAggregation!.depthPct);
    expect(report.forensicConsistencyStatus).toBe('OK');
  });

  it('6. region valid dimension count reconciles with card', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'p',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: { captureId: 'c', width: 390, height: 844, domMeasurements: FULL_DOM },
      designAuthority: { authorityVersionId: 'a', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const header = report.regionForensics.find((b) => b.regionId.includes('header'));
    expect(header?.measurementDepth?.validDimensionCount).toBeGreaterThanOrEqual(3);
    expect(isRegionDepthSufficient(header!)).toBe(true);
  });

  it('7. reconcile fixes equal-value -100% style deltas', () => {
    const bundle = reconcileBundleDimensions({
      regionId: 'test',
      regionName: 'TEST',
      regionType: 'HEADER',
      significance: 'MAJOR',
      status: 'MATCHED',
      componentTarget: {
        regionId: 'test',
        componentId: null,
        selector: null,
        route: null,
        confidence: 'HIGH',
        unresolvedComponentTarget: true,
      },
      dimensions: [
        {
          evidenceId: 'd1',
          regionId: 'test',
          dimension: 'height',
          authorityValue: '52px',
          currentValue: '52px',
          delta: '-100%',
          deltaPct: -100,
          unit: 'px',
          confidence: 'HIGH',
          source: 'DOM',
          authoritySource: 'DOM_RECT',
          currentSource: 'DOM_RECT',
        },
      ],
      corrections: [],
      confidence: 'HIGH',
      functionalRisk: 'LOW',
    });
    expect(bundle.dimensions[0]!.alignedWithinTolerance).toBe(true);
    expect(String(bundle.dimensions[0]!.delta)).not.toContain('-100%');
  });
});
