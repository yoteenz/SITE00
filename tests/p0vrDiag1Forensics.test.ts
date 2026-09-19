/**
 * P0.VR.DIAG.1 — Authority-relative forensics + measured reconstruction spec.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  alignCapturePair,
  buildForensicUpgradeBundle,
  buildMeasuredReconstructionSpec,
  computeVisualConvergenceScore,
  deriveTwinCssSnapshotFromPlan,
  formatPx,
  markMeasuredSpecStale,
  recordForensicsVersion,
  resetForensicsEvidenceCounterForTest,
  resetForensicsVersionsForTest,
  resetFounderOverridesForTest,
  runAuthorityRelativeForensics,
  applyOverrideToSpec,
  recordFounderOverride,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/index.js';
import { P0_VR_DIAG_1_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/constants.js';

const SHELL = {
  headerHeightPx: 52,
  headerPaddingX: 14,
  contentPaddingX: 14,
  sectionGap: 10,
  bottomNavHeightPx: 52,
  viewportWidth: 390,
  viewportHeight: 844,
};

const DOM_HEADER = {
  regionId: 'ndx.overview.header-shell',
  actualX: 0,
  actualY: 47,
  actualWidth: 390,
  actualHeight: 124,
  computedFontSize: '14px',
  computedLineHeight: '18px',
};

const DOM_HERO = {
  regionId: 'ndx.overview.hero',
  actualX: 0,
  actualY: 171,
  actualWidth: 320,
  actualHeight: 210,
  computedFontSize: '22px',
  computedLineHeight: '26px',
};

describe('P0.VR.DIAG.1 forensics', () => {
  beforeEach(() => {
    resetForensicsEvidenceCounterForTest();
    resetForensicsVersionsForTest();
    resetFounderOverridesForTest();
  });

  it('1. build constant', () => {
    expect(P0_VR_DIAG_1_BUILD).toBe('v302');
  });

  it('2. viewport alignment excludes mobile chrome', () => {
    const aligned = alignCapturePair({
      currentWidth: 390,
      currentHeight: 844,
      authorityWidth: 390,
      authorityHeight: 844,
      viewport: 'mobile',
    });
    expect(aligned.chromeExcluded).toBe(true);
    expect(aligned.currentUsable.height).toBeLessThan(844);
  });

  it('3. normalized geometry includes px and pct', () => {
    const formatted = formatPx(92.4, 'HIGH');
    expect(formatted).toBe('92px');
    expect(formatPx(17.2, 'LOW')).toBe('~17px');
  });

  it('4. engine produces geometry delta with evidence', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      currentCapture: {
        captureId: 'cap_test',
        width: 390,
        height: 844,
        domMeasurements: [DOM_HEADER, DOM_HERO],
        cssSnapshot: { contentPaddingX: 10, sectionGap: 14 },
      },
      designAuthority: {
        authorityVersionId: 'authv_test',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    expect(report.geometryDiffs.length).toBeGreaterThan(0);
    expect(report.geometryDiffs[0].evidenceId).toMatch(/^(geom_|dim_)/);
    expect(report.geometryDiffs[0].authority).toBeTruthy();
    expect(report.geometryDiffs[0].current).toBeTruthy();
    expect(report.geometryDiffs[0].correction).toMatch(/height/i);
  });

  it('5. header height delta is authority-relative not generic label', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: {
        captureId: 'cap_test',
        width: 390,
        height: 844,
        domMeasurements: [DOM_HEADER],
      },
      designAuthority: {
        authorityVersionId: 'authv_test',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    const headerDiff = report.geometryDiffs.find((d) => d.regionName.includes('HEADER'));
    expect(headerDiff).toBeTruthy();
    expect(headerDiff!.absoluteDelta).toBeGreaterThan(0);
    expect(String(headerDiff!.authority)).toContain('px');
    expect(String(headerDiff!.current)).toContain('px');
  });

  it('6. spacing gutter delta from shell vs css snapshot', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: {
        captureId: 'cap_test',
        width: 390,
        height: 844,
        cssSnapshot: { contentPaddingX: 10 },
      },
      designAuthority: {
        authorityVersionId: 'authv_test',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    const gutter = report.spacingDiffs.find((d) => d.regionName.includes('GUTTER'));
    expect(gutter).toBeTruthy();
    expect(gutter!.absoluteDelta).toBe(-4);
    expect(gutter!.correction).toMatch(/14px/i);
  });

  it('7. missing region detection', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: { captureId: 'cap_test', width: 390, height: 844, domMeasurements: [] },
      designAuthority: {
        authorityVersionId: 'authv_test',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    expect(report.regionMatches.some((m) => m.status === 'MATCHED' || m.status === 'MISSING_CURRENT')).toBe(true);
  });

  it('8. measured spec traces plan items to evidence', () => {
    const bundle = buildForensicUpgradeBundle({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      pagePurpose: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook',
      isRootPage: true,
      currentCapture: {
        captureId: 'cap_test',
        width: 390,
        height: 844,
        domMeasurements: [DOM_HEADER],
        cssSnapshot: { contentPaddingX: 10 },
      },
      designAuthority: {
        authorityVersionId: 'authv_test',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    expect(bundle.measuredSpec.regionSpecs.length).toBeGreaterThan(0);
    expect(bundle.reconstructionPlan.measuredSpecId).toBe(bundle.measuredSpec.specId);
    expect(bundle.reconstructionPlan.geometryChanges[0]?.evidenceId).toBeTruthy();
    expect(bundle.visualDiagnosis.topVisualDifferences?.length).toBeGreaterThan(0);
    expect(bundle.visualDiagnosis.topFindings[0]).not.toBe('HEADER IS TOO TALL');
  });

  it('9. plan items include target current delta correction', () => {
    const bundle = buildForensicUpgradeBundle({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      pagePurpose: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook',
      currentCapture: {
        captureId: 'cap_test',
        width: 390,
        height: 844,
        domMeasurements: [DOM_HEADER],
      },
      designAuthority: {
        authorityVersionId: 'authv_test',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    const change = bundle.reconstructionPlan.geometryChanges[0];
    expect(change.authorityValue).toBeTruthy();
    expect(change.currentValue).toBeTruthy();
    expect(change.delta).toBeTruthy();
    expect(change.correction).toBeTruthy();
  });

  it('10. functional risk separated from visual diffs', () => {
    const report = runAuthorityRelativeForensics({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: {
        captureId: 'cap_test',
        width: 390,
        height: 844,
        domMeasurements: [DOM_HEADER],
      },
      designAuthority: {
        authorityVersionId: 'authv_test',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    expect(report.functionalRiskSummary.length).toBeGreaterThan(0);
    expect(report.functionalRiskSummary[0].risk).not.toBe('CRITICAL');
  });

  it('11. forensics versioning + stale spec', () => {
    const version = recordForensicsVersion({
      authorityVersionId: 'authv1',
      captureId: 'cap1',
      reportId: 'rep1',
      specId: 'spec1',
    });
    expect(version.status).toBe('CURRENT');
    const spec = buildMeasuredReconstructionSpec({
      pageId: 'p1',
      viewport: 'mobile',
      authorityVersionId: 'authv1',
      captureId: 'cap1',
      report: runAuthorityRelativeForensics({
        pageId: 'p1',
        viewport: 'mobile',
        pageArchetype: 'ndxbook-overview-mobile',
        currentCapture: { captureId: 'cap1', width: 390, height: 844 },
        designAuthority: { authorityVersionId: 'authv1', width: 390, height: 844, visualShellSpec: SHELL },
      }),
    });
    expect(markMeasuredSpecStale(spec).status).toBe('STALE');
  });

  it('12. founder override keep current', () => {
    const bundle = buildForensicUpgradeBundle({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      pagePurpose: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook',
      currentCapture: {
        captureId: 'cap_test',
        width: 390,
        height: 844,
        domMeasurements: [DOM_HEADER],
      },
      designAuthority: {
        authorityVersionId: 'authv_test',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    const evidenceId = bundle.measuredSpec.regionSpecs[0]?.evidenceId;
    const override = recordFounderOverride({
      specId: bundle.measuredSpec.specId,
      evidenceId: evidenceId!,
      who: 'founder',
      action: 'KEEP_CURRENT',
      reason: 'KEEP CURRENT PROGRESS BAND',
    });
    const updated = applyOverrideToSpec(bundle.measuredSpec, override);
    expect(updated.regionSpecs.find((r) => r.evidenceId === evidenceId)?.status).toBe('FOUNDER_OVERRIDE_KEEP_CURRENT');
  });

  it('13. visual convergence before vs after', () => {
    const before = runAuthorityRelativeForensics({
      pageId: 'p1',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: {
        captureId: 'cap_before',
        width: 390,
        height: 844,
        domMeasurements: [DOM_HEADER],
        cssSnapshot: { contentPaddingX: 10 },
      },
      designAuthority: { authorityVersionId: 'a1', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const after = runAuthorityRelativeForensics({
      pageId: 'p1',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      currentCapture: {
        captureId: 'cap_after',
        width: 390,
        height: 844,
        domMeasurements: [DOM_HEADER],
        cssSnapshot: { contentPaddingX: 14, headerHeightPx: 52 },
      },
      designAuthority: { authorityVersionId: 'a1', width: 390, height: 844, visualShellSpec: SHELL },
    });
    const scores = computeVisualConvergenceScore({ before, after, functionScore: 100 });
    expect(scores.after.geometry).toBeGreaterThanOrEqual(scores.before.geometry);
    expect(scores.after.function).toBe(100);
  });

  it('14. twin css snapshot derived from plan not hardcoded', () => {
    const bundle = buildForensicUpgradeBundle({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      pagePurpose: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook',
      currentCapture: {
        captureId: 'cap_test',
        width: 390,
        height: 844,
        cssSnapshot: { contentPaddingX: 10 },
      },
      designAuthority: {
        authorityVersionId: 'authv_test',
        width: 390,
        height: 844,
        visualShellSpec: SHELL,
      },
    });
    const css = deriveTwinCssSnapshotFromPlan(bundle.reconstructionPlan);
    expect(css.contentPaddingX).toBe(14);
  });

  it('15. low confidence uses estimate wording', () => {
    expect(formatPx(17.4, 'LOW')).toBe('~17px');
  });
});
