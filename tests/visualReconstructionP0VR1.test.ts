/**
 * P0.VR.1 Visual Reconstruction Engine — comprehensive tests.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import sharp from 'sharp';
import {
  ingestScreenshotReference,
  evaluateBrowserChrome,
  decomposeReferenceRegions,
  buildVisualReferenceSet,
  measureRegions,
  evaluateLineWrapMatch,
  buildVisualReconstructionBlueprint,
  matchRepositoryComponents,
  matchRepositoryAssets,
  buildDefaultSite00RepositoryCatalog,
  preferCanonicalOverReplacement,
  evaluateTypographyForRegions,
  typographyMatchScore,
  evaluateResponsiveInference,
  compareRenderedReference,
  overallScoreCannotHideRegionFailure,
  generateVisualDifferenceHeatmap,
  createInitialRegionLocks,
  updateRegionLocksFromScores,
  isRegionLocked,
  detectLockedRegionRegression,
  lockedRegionIds,
  buildVisualCorrectionPlan,
  evaluateCorrectionScope,
  evaluateConvergence,
  shouldStopForPlateau,
  evaluateReferenceMatchReadiness,
  buildVisualReconstructionReport,
  createReferenceVisualRegressionBaseline,
  baselineReadyForAudit,
  isModeImplemented,
  IMPLEMENTED_MODES,
  PREPARED_MODES,
  runVisualReconstructionLoop,
  DEFAULT_RECONSTRUCTION_LOOP_CONFIG,
} from '../shared/site00-studio-world-production/visualReconstruction/index.js';
import {
  EXPERIMENTS_HUB_PILOT_ROUTE,
  mapExperimentsHubPilotPresentation,
  freezeExperimentsHubPilotState,
  stageKeywordsFor,
} from '../shared/site00-brand-lore/visualReconstruction/experimentsHubPilotAdapter.js';
import { buildSite00HostRepositoryCatalog, isSite00ShellRegion } from '../shared/site00-studio-world-production/visualReconstruction/adapters/site00HostAdapter.js';

const FIXTURE = 'tests/fixtures/visual-reconstruction/experiments-hub-mobile-reference.png';

describe('P0.VR.1 Visual Reconstruction Engine', () => {
  let referenceBuffer: Buffer;

  beforeAll(() => {
    referenceBuffer = readFileSync(FIXTURE);
  });

  it('1. ingests screenshot reference', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer });
    expect(ref.referenceId).toMatch(/^ref-/);
    expect(ref.pixelWidth).toBe(390);
    expect(ref.pixelHeight).toBe(844);
  });

  it('2-4. preserves dimensions and excludes browser chrome', async () => {
    const ref = await ingestScreenshotReference({
      sourceAsset: FIXTURE,
      buffer: referenceBuffer,
      forceMobileChrome: true,
    });
    expect(ref.pixelWidth).toBe(390);
    expect(ref.usablePageBounds.height).toBeLessThan(ref.pixelHeight);
    expect(ref.browserChromePresent).toBe(true);
    const chrome = evaluateBrowserChrome(390, 844, { forceMobileChrome: true });
    expect(chrome.usablePageBounds.y).toBeGreaterThan(0);
  });

  it('5-6. decomposes regions with confidence', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer });
    const regions = decomposeReferenceRegions({ reference: ref });
    expect(regions.length).toBeGreaterThan(5);
    expect(regions.every((r) => r.confidence > 0)).toBe(true);
  });

  it('7-8. creates blueprint before implementation', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer });
    const regions = decomposeReferenceRegions({ reference: ref });
    const catalog = buildDefaultSite00RepositoryCatalog();
    const bp = buildVisualReconstructionBlueprint({
      reference: ref,
      targetRoute: EXPERIMENTS_HUB_PILOT_ROUTE,
      regions,
      componentMatches: matchRepositoryComponents(regions, catalog),
      assetMatches: matchRepositoryAssets(regions, catalog),
    });
    expect(bp.blueprintId).toBeTruthy();
    expect(bp.layoutRegions.length).toBe(regions.length);
  });

  it('9-11. repository matchers prefer canonical components', () => {
    const catalog = buildDefaultSite00RepositoryCatalog();
    const ref = { usablePageBounds: { x: 0, y: 0, width: 390, height: 700 }, pixelWidth: 390, pixelHeight: 844 } as Awaited<
      ReturnType<typeof ingestScreenshotReference>
    >;
    const regions = decomposeReferenceRegions({ reference: ref });
    const matches = matchRepositoryComponents(regions, catalog).map(preferCanonicalOverReplacement);
    const shell = matches.find((m) => m.componentId === 'EcosystemShell');
    expect(shell?.classification).toBe('EXISTING_CANONICAL_COMPONENT');
  });

  it('12-13. typography matcher and line wrap evaluation', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer });
    const regions = decomposeReferenceRegions({ reference: ref });
    const typo = evaluateTypographyForRegions(regions);
    expect(typo.length).toBeGreaterThan(0);
    const wrap = evaluateLineWrapMatch(2, 2);
    expect(wrap.exact).toBe(true);
    const badWrap = evaluateLineWrapMatch(2, 3);
    expect(badWrap.exact).toBe(false);
  });

  it('14-16. comparison pipeline with heatmap and multi-metrics', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer });
    const regions = decomposeReferenceRegions({ reference: ref });
    const dir = join('/tmp', 'vr-test-' + Date.now());
    mkdirSync(dir, { recursive: true });

    const comparison = await compareRenderedReference({
      referenceBuffer,
      renderBuffer: referenceBuffer,
      reference: ref,
      snapshot: {
        renderId: 'test-render',
        route: EXPERIMENTS_HUB_PILOT_ROUTE,
        viewport: { width: 390, height: 700, deviceScaleFactor: 2 },
        timestamp: new Date().toISOString(),
        commit: null,
        screenshotPath: FIXTURE,
        reconstructionIteration: 1,
        blueprintVersion: 'bp-test',
      },
      regions,
      outputDir: dir,
    });

    expect(comparison.structuralSimilarity).toBeGreaterThan(0.95);
    expect(comparison.edgeSimilarity).toBeDefined();
    expect(comparison.regionScores.length).toBe(regions.length);
    expect(comparison.heatmapPath).toBeTruthy();
  });

  it('17-24. region locks and correction planning', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer });
    const regions = decomposeReferenceRegions({ reference: ref });
    let locks = createInitialRegionLocks(regions.map((r) => r.regionId));

    const scores = regions.map((r, i) => ({
      regionId: r.regionId,
      visualRole: r.visualRole,
      pixelDifference: i === 0 ? 0.01 : 0.2,
      structuralSimilarity: i === 0 ? 0.99 : 0.8,
      edgeSimilarity: 0.9,
      colorDifference: 0.05,
      textBoundsDifference: 0.05,
      layoutDifference: 0.05,
      passed: i === 0,
      highAuthority: i < 3,
    }));

    locks = updateRegionLocksFromScores(locks, scores, 1, 'GEOMETRY');
    expect(lockedRegionIds(locks).length).toBeGreaterThan(0);
    expect(isRegionLocked(locks[0]!)).toBe(true);

    const comparison = await compareRenderedReference({
      referenceBuffer,
      renderBuffer: referenceBuffer,
      reference: ref,
      snapshot: {
        renderId: 'r2',
        route: EXPERIMENTS_HUB_PILOT_ROUTE,
        viewport: { width: 390, height: 700, deviceScaleFactor: 2 },
        timestamp: new Date().toISOString(),
        commit: null,
        screenshotPath: FIXTURE,
        reconstructionIteration: 2,
        blueprintVersion: 'bp-test',
      },
      regions,
      outputDir: join('/tmp', 'vr-test-locks'),
    });

    const plan = buildVisualCorrectionPlan(comparison, locks, 2, 'GEOMETRY');
    expect(plan.skippedLockedRegions.length).toBeGreaterThan(0);
    expect(evaluateCorrectionScope('GEOMETRY', 0.2)).toBeTruthy();
  });

  it('25-29. convergence guard and readiness', async () => {
    expect(evaluateConvergence({ scores: [0.8, 0.85, 0.87], iterations: [1, 2, 3] })).toBe('improving');
    expect(shouldStopForPlateau('plateau', 4)).toBe(true);

    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer });
    const regions = decomposeReferenceRegions({ reference: ref });
    const locks = createInitialRegionLocks(regions.map((r) => r.regionId));
    const comparison = await compareRenderedReference({
      referenceBuffer,
      renderBuffer: referenceBuffer,
      reference: ref,
      snapshot: {
        renderId: 'r3',
        route: EXPERIMENTS_HUB_PILOT_ROUTE,
        viewport: { width: 390, height: 700, deviceScaleFactor: 2 },
        timestamp: new Date().toISOString(),
        commit: null,
        screenshotPath: FIXTURE,
        reconstructionIteration: 1,
        blueprintVersion: 'bp',
      },
      regions,
      outputDir: join('/tmp', 'vr-ready'),
    });

    const readiness = evaluateReferenceMatchReadiness(comparison, locks);
    expect(readiness.overallSimilarity).toBeGreaterThan(0.9);

    const failedHigh = comparison.regionScores.map((s) => ({ ...s, passed: false, highAuthority: true }));
    const blocked = evaluateReferenceMatchReadiness(
      { ...comparison, regionScores: failedHigh, structuralSimilarity: 0.99 },
      locks,
    );
    expect(blocked.ready).toBe(false);
    expect(overallScoreCannotHideRegionFailure({ ...comparison, regionScores: failedHigh, structuralSimilarity: 0.99 })).toBe(true);
  });

  it('30-38. modes, responsive inference, multi-reference, pilot adapter', async () => {
    expect(isModeImplemented('REPRODUCE')).toBe(true);
    expect(PREPARED_MODES).toContain('AUDIT');
    expect(IMPLEMENTED_MODES).not.toContain('TRANSLATE' as never);

    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer, forceMobileChrome: true });
    const responsive = evaluateResponsiveInference(ref);
    expect(responsive.mobileAuthoritative).toBe(true);

    const set = buildVisualReferenceSet(ref);
    expect(set.references.length).toBe(1);

    const presentation = mapExperimentsHubPilotPresentation(
      [{ id: 'e1', order: 1, title: 'LORE CALIBRATION', path: '/x' }],
      { create: '/x' },
    );
    expect(presentation.recentExperiments[0]?.title).toBe('LORE CALIBRATION');
    expect(stageKeywordsFor('UNDERSTAND')).toContain('Lore');
    expect(freezeExperimentsHubPilotState({ a: 1 }).pilotFrozenAt).toBeTruthy();
  });

  it('39-44. SITE00 shell adapter and host regions', () => {
    const catalog = buildSite00HostRepositoryCatalog();
    expect(catalog.components.some((c) => c.id === 'MobileSiteNavigation')).toBe(true);
    expect(isSite00ShellRegion('BOTTOM_NAV')).toBe(true);
  });

  it('45-51. report and baseline architecture', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer });
    const readiness = evaluateReferenceMatchReadiness(
      {
        comparisonId: 'c',
        referenceId: ref.referenceId,
        renderId: 'r',
        pixelDifference: 0.02,
        structuralSimilarity: 0.98,
        edgeSimilarity: 0.97,
        regionOverlap: 0.96,
        colorDifference: 0.03,
        textBoundsDifference: 0.02,
        layoutDifference: 0.02,
        regionScores: [],
        mismatches: [],
        heatmapPath: null,
        comparedAt: new Date().toISOString(),
      },
      createInitialRegionLocks(['a']),
    );

    const report = buildVisualReconstructionReport({
      reference: ref,
      targetRoute: EXPERIMENTS_HUB_PILOT_ROUTE,
      viewport: { width: 390, height: 700, deviceScaleFactor: 2 },
      mode: 'REPRODUCE',
      iterations: 3,
      regions: [],
      locks: [],
      comparison: null,
      readiness,
      responsiveInference: evaluateResponsiveInference(ref),
      finalScreenshotPath: null,
      heatmapPath: null,
      repositoryAssetsReused: [],
      newComponentsCreated: ['ExperimentsHubOperateLayer'],
      convergenceTrend: 'improving',
      manualFounderCorrections: 0,
      knownLimitations: [],
    });
    expect(report.reportId).toMatch(/^report-/);

    const baseline = createReferenceVisualRegressionBaseline({
      referenceId: ref.referenceId,
      targetRoute: EXPERIMENTS_HUB_PILOT_ROUTE,
      viewport: { width: 390, height: 700 },
      approvedRenderPath: '/tmp/render.png',
      regionLocks: [],
      readinessSnapshot: readiness,
    });
    expect(baselineReadyForAudit({ ...baseline, readinessSnapshot: { ...readiness, ready: true } })).toBe(true);
  });

  it('52-55. locked region regression detection', () => {
    const locks = createInitialRegionLocks(['a', 'b']);
    locks[0] = {
      regionId: 'a',
      state: 'LOCKED',
      lockedAtIteration: 1,
      matchScoreAtLock: 0.98,
      invalidatedReason: null,
      passLockedAt: 'GEOMETRY',
    };
    const prev = [{ regionId: 'a', visualRole: 'HERO' as const, pixelDifference: 0, structuralSimilarity: 0.98, edgeSimilarity: 0.98, colorDifference: 0, textBoundsDifference: 0, layoutDifference: 0, passed: true, highAuthority: true }];
    const curr = [{ ...prev[0]!, structuralSimilarity: 0.9 }];
    const updated = detectLockedRegionRegression(locks, prev, curr);
    expect(updated[0]?.state).toBe('INVALIDATED');
  });

  it('56-58. automated loop with skip-render produces blueprint and report', async () => {
    const out = join('/tmp', 'vr-loop-skip-' + Date.now());
    const result = await runVisualReconstructionLoop({
      referenceImagePath: FIXTURE,
      targetRoute: EXPERIMENTS_HUB_PILOT_ROUTE,
      baseUrl: 'http://127.0.0.1:5174',
      outputDir: out,
      skipRender: true,
    });
    expect(result.report.iterations).toBeGreaterThanOrEqual(0);
    expect(readFileSync(join(out, 'blueprint.json')).length).toBeGreaterThan(10);
    writeFileSync(join(out, 'report-check.json'), JSON.stringify(result));
  });

  it('59-61. measurements have confidence; config defaults; heatmap generation', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: FIXTURE, buffer: referenceBuffer });
    const regions = decomposeReferenceRegions({ reference: ref });
    const measurements = measureRegions(regions);
    expect(measurements.every((m) => m.confidence > 0)).toBe(true);
    expect(DEFAULT_RECONSTRUCTION_LOOP_CONFIG.maxIterations).toBeGreaterThan(3);

    const diff = Buffer.alloc(390 * 844 * 4, 0);
    const hm = await generateVisualDifferenceHeatmap({
      diffBuffer: diff,
      width: 390,
      height: 844,
      comparisonId: 'hm-test',
      outputDir: join('/tmp', 'vr-hm'),
      mismatchPixels: 0,
      totalPixels: 390 * 844,
    });
    expect(hm.mismatchRatio).toBe(0);
  });
});

describe('Experiments Hub pilot preservation', () => {
  it('uses canonical route and preserves experiment mapping shape', () => {
    expect(EXPERIMENTS_HUB_PILOT_ROUTE).toBe('/projects/ndxbook/experiments');
    const entries = Array.from({ length: 3 }, (_, i) => ({
      id: `e${i}`,
      order: i + 1,
      title: `T${i}`,
      path: `/p/${i}`,
    }));
    const p = mapExperimentsHubPilotPresentation(entries, {});
    expect(p.recentExperiments).toHaveLength(3);
  });
});
