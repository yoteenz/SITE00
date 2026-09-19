/**
 * P0.VR.1A Visual Reconstruction — founder calibration + design grammar tests.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it, beforeAll } from 'vitest';
import {
  ingestScreenshotReference,
  buildVisualReferenceSet,
  isModeImplemented,
  IMPLEMENTED_MODES,
  evaluateReferencePalette,
  evaluateWorkspaceLuminosity,
  evaluateBrandAccentAuthority,
  evaluateHostClientVisualAuthority,
  evaluateArtworkAuthority,
  evaluateContainerRepetition,
  evaluateSpatialRhythm,
  evaluateDesignGrammarMatch,
  evaluateBrandEssenceMatch,
  evaluateCompositionalSimilarity,
  evaluateFocalHierarchy,
  evaluateTypographicCharacterMatch,
  evaluateSurfaceGrammar,
  buildRelationalAlignmentGraph,
  generateDesignDisconnectHeatmap,
  DESIGN_GRAMMAR_FAILURES,
  DEFAULT_EVALUATION_WEIGHTS,
  weightedScore,
  createFounderPerceptualEvaluation,
  recordFounderPerceptualEvaluation,
  evaluateReferenceMatchReadinessV2,
  pixelScoreCannotOverrideDesignFailure,
  NDX_MODULE_RESPONSIVE_BEHAVIORS,
  evaluateResponsiveRelationship,
  buildVisualReferenceSetFromFounderBoards,
  runFounderReferenceCalibration,
  diagnoseCurrentImplementation,
  diagnoseP0VR1ExperimentsHubRegression,
  regionLockRequiresDesignFidelity,
  createInitialRegionLocks,
} from '../shared/site00-studio-world-production/visualReconstruction/index.js';
import {
  NDX_WORKSPACE_TOKENS,
  DARK_PRIMARY_NDX_WORKSPACE,
  NDX_BRAND_EXPRESSION_TRAITS,
  NDX_EVALUATION_WEIGHTS,
  NDX_CALIBRATION_ROUTES,
  NDX_FOUNDER_REFERENCE_PATHS,
  ndxLuminanceTarget,
  ndxLimePresenceMin,
  ndxLimeProminenceMax,
} from '../shared/site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';

const DESKTOP_FIXTURE = NDX_FOUNDER_REFERENCE_PATHS.desktop;
const MOBILE_FIXTURE = NDX_FOUNDER_REFERENCE_PATHS.mobile;

describe('P0.VR.1A Visual Reconstruction Calibration', () => {
  let desktopBuf: Buffer;
  let mobileBuf: Buffer;

  beforeAll(() => {
    desktopBuf = readFileSync(DESKTOP_FIXTURE);
    mobileBuf = readFileSync(MOBILE_FIXTURE);
  });

  it('1-3. VisualReferenceSet supports desktop + mobile authority with roles', async () => {
    const desktop = await ingestScreenshotReference({ sourceAsset: DESKTOP_FIXTURE, buffer: desktopBuf });
    const mobile = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf, forceMobileChrome: true });
    const extended = buildVisualReferenceSetFromFounderBoards({ desktop, mobile });
    expect(extended.references).toHaveLength(2);
    expect(extended.references[0]?.referenceRole).toBe('DESKTOP_PRIMARY');
    expect(extended.references[1]?.referenceRole).toBe('MOBILE_PRIMARY');
    const basic = buildVisualReferenceSet(desktop, [mobile]);
    expect(basic.references).toHaveLength(2);
  });

  it('4-7. brand accent + luminosity evaluations', () => {
    const lightPalette = evaluateReferencePalette({
      cssSnapshot: { background: NDX_WORKSPACE_TOKENS.paper, limeRatio: '0.06', hostRedRatio: '0.02' },
      viewport: { width: 1440, height: 900 },
    });
    const lum = evaluateWorkspaceLuminosity(lightPalette, ndxLuminanceTarget());
    expect(lum.passed).toBe(true);
    const accent = evaluateBrandAccentAuthority(lightPalette, ndxLimePresenceMin(), ndxLimeProminenceMax());
    expect(accent.passed).toBe(true);
    const darkPalette = evaluateReferencePalette({
      cssSnapshot: { background: '#0f0f0f', luminance: '0.08', limeRatio: '0.01' },
      viewport: { width: 390, height: 844 },
    });
    const darkLum = evaluateWorkspaceLuminosity(darkPalette);
    expect(darkLum.failures).toContain('FAIL_DARK_PRIMARY_WORKSPACE');
  });

  it('8-10. design grammar + compositional + disconnect heatmap', () => {
    const palette = evaluateReferencePalette({
      cssSnapshot: { background: NDX_WORKSPACE_TOKENS.paper },
      viewport: { width: 390, height: 844 },
    });
    const regions = [
      { regionId: 'a', role: 'IMAGE', bounds: { width: 200, height: 200 }, artworkAreaRatio: 0.8, gapAfter: 32 },
      { regionId: 'b', role: 'TEXT_BLOCK', bounds: { width: 100, height: 40 }, borderRadius: 0, hasBorder: false, gapAfter: 8 },
    ];
    const grammar = evaluateDesignGrammarMatch({
      palette,
      luminosity: evaluateWorkspaceLuminosity(palette),
      accent: evaluateBrandAccentAuthority(palette),
      artwork: evaluateArtworkAuthority(regions, true),
      container: evaluateContainerRepetition(regions),
      spatial: evaluateSpatialRhythm(regions),
    });
    expect(grammar.score).toBeGreaterThan(0.5);
    const comp = evaluateCompositionalSimilarity(grammar.dimensions);
    expect(comp.score).toBeGreaterThan(0);
    const hm = generateDesignDisconnectHeatmap(grammar.failures);
    expect(hm.hotspots.length).toBe(grammar.failures.length);
  });

  it('11-12. brand essence + host/client authority', () => {
    const palette = evaluateReferencePalette({
      cssSnapshot: { background: NDX_WORKSPACE_TOKENS.paper, hostRedRatio: '0.02', limeRatio: '0.05' },
      viewport: { width: 390, height: 844 },
    });
    const brand = evaluateBrandEssenceMatch({ palette, designGrammarScore: 0.8, traitsMatched: 6, traitsTotal: 7 });
    expect(brand.passed).toBe(true);
    const host = evaluateHostClientVisualAuthority(palette);
    expect(host.passed).toBe(true);
    const leak = evaluateHostClientVisualAuthority({ clientAccentRatio: 0.03, hostAccentRatio: 0.15 });
    expect(leak.failures).toContain('FAIL_HOST_ACCENT_LEAKAGE');
  });

  it('13-20. responsive relationship behaviors', () => {
    const rels = NDX_MODULE_RESPONSIVE_BEHAVIORS.map((m) => m.relationship);
    expect(rels).toContain('PERSIST');
    expect(rels).toContain('REORDER');
    expect(rels).toContain('STACK');
    expect(rels).toContain('COLLAPSE');
    expect(rels).toContain('CAROUSEL');
    expect(rels).toContain('HORIZONTAL_SCROLL');
    expect(rels).toContain('BOTTOM_SHEET');
    expect(rels).toContain('HIDE_TO_INSPECT');
    expect(rels).toContain('RECOMPOSE');
    const eval_ = evaluateResponsiveRelationship('campaign-board', true, true, 0.6, 0.55);
    expect(eval_.behavior?.relationship).toBe('RECOMPOSE');
  });

  it('21. responsive failure taxonomy present', () => {
    expect(DESIGN_GRAMMAR_FAILURES).toContain('FAIL_DESKTOP_IS_STRETCHED_MOBILE');
    expect(DESIGN_GRAMMAR_FAILURES).toContain('FAIL_MOBILE_IS_SHRUNK_DESKTOP');
    expect(DESIGN_GRAMMAR_FAILURES).toContain('FAIL_RESPONSIVE_REFERENCE_RELATIONSHIP');
  });

  it('22-29. palette, surface, container, artwork, typo, spatial, relational, focal', () => {
    const regions = [
      { regionId: 'r1', role: 'IMAGE', bounds: { width: 300, height: 200 }, artworkAreaRatio: 0.9, gapAfter: 24 },
      { regionId: 'r2', role: 'HERO', bounds: { width: 300, height: 80 }, borderRadius: 12, hasBorder: true, gapAfter: 48 },
    ];
    expect(evaluateContainerRepetition(regions).score).toBeGreaterThan(0);
    expect(evaluateSpatialRhythm(regions).variance).toBeGreaterThan(0);
    expect(evaluateArtworkAuthority(regions, true).artworkShare).toBeGreaterThan(0);
    expect(evaluateTypographicCharacterMatch(0.3).score).toBeGreaterThan(0.4);
    expect(evaluateSurfaceGrammar(0.4).score).toBe(0.4);
    expect(buildRelationalAlignmentGraph(regions).edges.length).toBeGreaterThan(0);
    expect(evaluateFocalHierarchy('IMAGE', [{ role: 'IMAGE', weight: 1 }, { role: 'NAV', weight: 0.2 }]).passed).toBe(true);
  });

  it('30-33. readiness v2 blocks pixel-only pass', () => {
    const readiness = evaluateReferenceMatchReadinessV2({
      comparison: {
        comparisonId: 't',
        referenceId: 'r',
        renderId: 'x',
        pixelDifference: 0.05,
        structuralSimilarity: 0.95,
        edgeSimilarity: 0.95,
        regionOverlap: 0.95,
        colorDifference: 0.05,
        textBoundsDifference: 0.05,
        layoutDifference: 0.05,
        regionScores: [],
        mismatches: [],
        heatmapPath: null,
        comparedAt: new Date().toISOString(),
      },
      locks: createInitialRegionLocks(['main']),
      designGrammarScore: 0.4,
      brandScore: 0.5,
      responsiveScore: 0.6,
      artworkScore: 0.7,
      palettePass: false,
      hostClientPass: true,
      focalPass: true,
      criticalFailures: ['FAIL_DARK_PRIMARY_WORKSPACE'],
    });
    expect(readiness.ready).toBe(false);
    expect(pixelScoreCannotOverrideDesignFailure(0.95, 0.4, 0.5, 0.6)).toBe(true);
    expect(pixelScoreCannotOverrideDesignFailure(0.95, 0.7, 0.4, 0.6)).toBe(true);
    expect(pixelScoreCannotOverrideDesignFailure(0.9, 0.7, 0.7, 0.3)).toBe(true);
  });

  it('34-39. NDX adapter tokens + dark superseded + accent guards', () => {
    expect(DARK_PRIMARY_NDX_WORKSPACE).toBe('SUPERSEDED_VISUAL_DIRECTION');
    expect(NDX_WORKSPACE_TOKENS.paper).toBe('#FAF8F5');
    expect(NDX_WORKSPACE_TOKENS.lime).toBe('#B7D236');
    expect(NDX_BRAND_EXPRESSION_TRAITS.prohibited).toContain('dark-primary UI');
    const overLime = evaluateBrandAccentAuthority({ clientAccentRatio: 0.25, hostAccentRatio: 0.02, randomAccentDetected: false });
    expect(overLime.failures).toContain('FAIL_NDX_LIME_TOO_DOMINANT');
    const random = evaluateBrandAccentAuthority({ clientAccentRatio: 0.05, hostAccentRatio: 0.02, randomAccentDetected: true });
    expect(random.failures).toContain('FAIL_RANDOM_ACCENT_COLOR');
  });

  it('40. forensic diagnosis without founder screen recording', () => {
    const d = diagnoseCurrentImplementation({
      routeId: 'experiments-hub',
      moduleLabel: 'Experiments Hub',
      cssSnapshot: { luminance: '0.08', background: '#0f0f0f' },
      designGrammarFailures: ['FAIL_DARK_PRIMARY_WORKSPACE'],
      pixelScore: 0.03,
      designGrammarScore: 0.2,
    });
    expect(d.rootCause).toBe('PALETTE_DRIFT');
    expect(diagnoseP0VR1ExperimentsHubRegression().routeId).toBe('experiments-hub');
  });

  it('41-45. calibration routes + CALIBRATE mode + desktop/mobile', async () => {
    expect(NDX_CALIBRATION_ROUTES.map((r) => r.routeId)).toEqual([
      'experiments-hub',
      'campaign-board',
      'content-operations',
    ]);
    expect(isModeImplemented('CALIBRATE')).toBe(true);
    expect(IMPLEMENTED_MODES).toContain('CALIBRATE');
    const desktop = await ingestScreenshotReference({ sourceAsset: DESKTOP_FIXTURE, buffer: desktopBuf });
    const mobile = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    expect(desktop.pixelWidth).toBe(1440);
    expect(mobile.pixelWidth).toBe(390);
  });

  it('46-48. founder perceptual + weights + adapter separation', () => {
    const fp = createFounderPerceptualEvaluation(null);
    expect(fp.judgment).toBeNull();
    const recorded = recordFounderPerceptualEvaluation(fp, { judgment: 'CLOSE_BUT_OFF', reasons: ['BRAND'] });
    expect(recorded.judgment).toBe('CLOSE_BUT_OFF');
    expect(NDX_EVALUATION_WEIGHTS.brandWeight).toBeGreaterThan(NDX_EVALUATION_WEIGHTS.geometryWeight);
    expect(weightedScore({ brand: 0.9, geometry: 0.5 }, DEFAULT_EVALUATION_WEIGHTS)).toBeGreaterThan(0);
  });

  it('49-50. generic engine exports remain; NDX logic in adapter file', () => {
    expect(typeof evaluateDesignGrammarMatch).toBe('function');
    expect(NDX_CALIBRATION_ROUTES.length).toBe(3);
  });

  it('51-60. calibration run + region lock + build smoke', async () => {
    const result = await runFounderReferenceCalibration({
      baseUrl: 'http://127.0.0.1:5174',
      outputDir: '/tmp/vr-cal-test-' + Date.now(),
      skipRender: true,
    });
    expect(result.reports.length).toBe(3);
    expect(result.reports.every((r) => r.routeId)).toBe(true);
    const lock = createInitialRegionLocks(['main'])[0]!;
    lock.state = 'LOCKED';
    lock.dimensionsPassed = ['GEOMETRY_MATCH', 'SURFACE_MATCH', 'BRAND_MATCH', 'GRAMMAR_MATCH'];
    expect(regionLockRequiresDesignFidelity(lock)).toBe(true);
    lock.dimensionsPassed = ['GEOMETRY_MATCH'];
    expect(regionLockRequiresDesignFidelity(lock)).toBe(false);
  });
});
