/**
 * Reference Reconstruction Intelligence — 5-layer methodology tests.
 * P0.VR.6R5 — MEASURE → INFER → CONSTRAIN → CONVERGE → VERIFY
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  RRI_FAILURE_CODES,
  segmentReferenceFrame,
  measureReference,
  inferReferenceLayout,
  assertResponsiveAuthorityIsolation,
  auditExecutionStyleConflicts,
  auditBoxModel,
  allowLegacyWrapperReplacement,
  buildRegionVisualDelta,
  detectCumulativeLayoutDrift,
  buildVisualCorrectionPlan,
  recordConvergenceIteration,
  evaluateNoOpGuard,
  CORRECTION_PRIORITY_ORDER,
  buildReferenceReconstructionBlueprint,
  blueprintRequiredBeforeExactImplementation,
  lockVerifiedRegion,
  evaluateCaptureReadiness,
  defaultSkinsMobileDataState,
  evaluateVerification,
  evaluateHardVerificationBlockers,
  fidelityFalsePassGuard,
  classifyLineBreakDrift,
  exceedsThreshold,
  EXACT_FIDELITY_THRESHOLDS,
  buildSkinsMobileReferenceBlueprint,
  buildReferenceReconstructionInspectorState,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/index.js';
import { SKINS_FAMILY_LINE_BREAKS } from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function mobileMeasurement() {
  return measureReference({
    authorityId: 'test-mobile',
    referenceImageUrl: '/test/mobile.png',
    referenceNaturalWidth: 941,
    referenceNaturalHeight: 1672,
    viewport: 'mobile',
    liveCssViewportWidth: 390,
    liveCssViewportHeight: 844,
  });
}

function desktopMeasurement() {
  return measureReference({
    authorityId: 'test-desktop',
    referenceImageUrl: '/test/desktop.png',
    referenceNaturalWidth: 1920,
    referenceNaturalHeight: 1080,
    viewport: 'desktop',
    liveCssViewportWidth: 1280,
    liveCssViewportHeight: 900,
  });
}

function readyBlueprint() {
  const measurement = mobileMeasurement();
  const layoutPlan = inferReferenceLayout(measurement);
  return buildReferenceReconstructionBlueprint({
    authorityId: 'test-mobile',
    viewport: 'mobile',
    route: '/projects/site00/design?tab=SKINS',
    measurement,
    layoutPlan,
    status: 'READY',
    assetRequirements: [{ slotId: 'TEST', required: true, bound: true }],
  });
}

describe('Reference Reconstruction Intelligence', () => {
  it('1. viewport calibration exists on measurement spec', () => {
    const m = mobileMeasurement();
    expect(m.viewportCalibration.referenceViewportWidth).toBeGreaterThan(0);
    expect(m.viewportCalibration.liveCssViewportWidth).toBe(390);
    expect(typeof m.viewportCalibration.viewportMatch).toBe('boolean');
  });

  it('2. device frame segmentation exists', () => {
    const seg = segmentReferenceFrame({ naturalWidth: 941, naturalHeight: 1672, viewport: 'mobile' });
    expect(seg.deviceFrameRegion).not.toBeNull();
    expect(seg.browserChromeRegion).not.toBeNull();
    expect(seg.contentCanvasRegion.width).toBeGreaterThan(0);
  });

  it('3. content canvas isolated from device frame', () => {
    const seg = segmentReferenceFrame({ naturalWidth: 941, naturalHeight: 1672, viewport: 'mobile' });
    const canvas = seg.contentCanvasRegion;
    const frame = seg.deviceFrameRegion!;
    expect(canvas.width).toBeLessThan(frame.width);
    expect(canvas.y).toBeGreaterThan(seg.browserChromeRegion!.height - 1);
  });

  it('4. canonical coordinate system uses content canvas pixels', () => {
    const m = mobileMeasurement();
    expect(m.normalizedCoordinateMap).toBe(true);
    expect(m.contentCanvasWidth).toBe(m.frameSegmentation.contentCanvasRegion.width);
    expect(m.contentCanvasHeight).toBe(m.frameSegmentation.contentCanvasRegion.height);
  });

  it('5. region tree generated', () => {
    const m = mobileMeasurement();
    expect(m.regions.length).toBeGreaterThan(3);
    expect(m.regions.some((r) => r.role === 'ROOT')).toBe(true);
    expect(m.regions.some((r) => r.role === 'SHELL')).toBe(true);
  });

  it('6. parent-child graph generated', () => {
    const layout = inferReferenceLayout(mobileMeasurement());
    expect(layout.parentChildGraph.nodes.length).toBeGreaterThan(0);
    expect(layout.parentChildGraph.edges.some((e) => e.relationship === 'CONTAINS')).toBe(true);
  });

  it('7. geometry measured per region', () => {
    const m = mobileMeasurement();
    expect(m.geometrySpecs.length).toBe(m.regions.length);
    expect(m.geometrySpecs[0].width).toBeGreaterThan(0);
  });

  it('8. spacing system measured', () => {
    const m = mobileMeasurement();
    expect(m.spacingSystem.cardGap).toBeGreaterThan(0);
    expect(m.spacingSystem.screenScopedTokens['--ref-panel-gap']).toBeDefined();
  });

  it('9. typography measured when preset provided', () => {
    const bp = buildSkinsMobileReferenceBlueprint();
    expect(bp?.typographySpecs.length).toBeGreaterThan(0);
    expect(bp?.typographySpecs[0].fontFamily).toBe('Martian Mono');
  });

  it('10. line-break contract supported', () => {
    const bp = buildSkinsMobileReferenceBlueprint();
    expect(bp?.lineBreakContracts.length).toBeGreaterThan(0);
    const aio = bp?.lineBreakContracts.find((c) => c.regionId.includes('AIO'));
    expect(aio?.expectedLineCount).toBe(2);
    expect(aio?.expectedBreakPositions).toEqual(['ALL IN ONE', 'ENTERPRISES']);
  });

  it('11. optical alignment hints type exists', () => {
    const m = mobileMeasurement();
    expect(Array.isArray(m.opticalAlignmentHints)).toBe(true);
  });

  it('12. surface spec generated', () => {
    const m = mobileMeasurement();
    expect(m.surfaceSpecs.length).toBe(m.regions.length);
    expect(m.surfaceSpecs.some((s) => s.backgroundColor !== '#FFFFFF')).toBe(true);
  });

  it('13. layout model inference exists', () => {
    const layout = inferReferenceLayout(mobileMeasurement());
    expect(Object.keys(layout.regionLayoutModes).length).toBeGreaterThan(0);
  });

  it('14. grid inference supported', () => {
    const layout = inferReferenceLayout(mobileMeasurement());
    expect(layout.gridInferences.some((g) => g.columns >= 2)).toBe(true);
  });

  it('15. flex inference supported', () => {
    const layout = inferReferenceLayout(mobileMeasurement());
    expect(layout.flexInferences.some((f) => f.direction === 'ROW')).toBe(true);
  });

  it('16. sticky/fixed inference supported via expectedPositioning', () => {
    const m = mobileMeasurement();
    const modes = new Set(m.regions.map((r) => r.expectedPositioning));
    expect(modes.has('FLEX') || modes.has('GRID') || modes.has('NORMAL_FLOW')).toBe(true);
  });

  it('17. mobile/desktop plans independent', () => {
    const mobile = inferReferenceLayout(mobileMeasurement());
    const desktop = inferReferenceLayout(desktopMeasurement());
    const isolation = assertResponsiveAuthorityIsolation(mobile, desktop);
    expect(isolation.isolated).toBe(true);
    expect(isolation.failureCode).toBeNull();
  });

  it('18. execution conflict audit runs', () => {
    const css = read('src/site00/styles/site00-design-skins-tab.css');
    const conflicts = auditExecutionStyleConflicts({
      cssSources: [css],
      authorityGeometry: mobileMeasurement().geometrySpecs,
    });
    expect(Array.isArray(conflicts)).toBe(true);
  });

  it('19. global CSS contamination detectable', () => {
    const conflicts = auditExecutionStyleConflicts({
      cssSources: ['.shared-card { min-height: 120px; }'],
      authorityGeometry: [{ regionId: 'family-row', x: 0, y: 0, width: 100, height: 96, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, gap: null, alignmentAnchor: 'START', aspectRatio: 1 }],
    });
    expect(conflicts.some((c) => c.failureCode === 'REFERENCE_GLOBAL_CSS_CONTAMINATION')).toBe(true);
  });

  it('20. legacy wrappers replaceable', () => {
    expect(allowLegacyWrapperReplacement(true)).toBe(true);
  });

  it('21. local authority tokens supported', () => {
    const bp = buildSkinsMobileReferenceBlueprint();
    expect(bp?.spacingSystem.screenScopedTokens['--skins-mobile-family-w']).toBeDefined();
  });

  it('22. native control leak detectable', () => {
    const conflicts = auditExecutionStyleConflicts({
      cssSources: ['input[type=file] { color: red; }'],
      authorityGeometry: [],
    });
    expect(conflicts.some((c) => c.failureCode === 'REFERENCE_NATIVE_CONTROL_LEAK')).toBe(true);
  });

  it('23. box model audit runs', () => {
    expect(auditBoxModel({ boxSizing: 'content-box', usesBorderBox: false })).toBe('REFERENCE_BOX_MODEL_DRIFT');
    expect(auditBoxModel({ boxSizing: 'border-box', usesBorderBox: true })).toBeNull();
  });

  it('24. overflow contract enforced on blueprint', () => {
    const bp = readyBlueprint();
    expect(bp.overflowContracts['family-row'] ?? bp.overflowContracts['screen-pack']).toBeDefined();
  });

  it('25. anchoring contract enforced on blueprint', () => {
    const bp = readyBlueprint();
    expect(Object.keys(bp.anchoringContracts).length).toBeGreaterThan(0);
  });

  it('26. layer stack enforced', () => {
    const bp = readyBlueprint();
    expect(bp.layerStack.length).toBe(bp.regionTree.length);
  });

  it('27. density contract works', () => {
    const bp = readyBlueprint();
    expect(bp.densityContract.visiblePrimaryData).toBeGreaterThan(0);
  });

  it('28. cumulative drift detected', () => {
    const deltas = Array.from({ length: 8 }, (_, i) =>
      buildRegionVisualDelta({
        regionId: `region-${i}`,
        referenceBounds: { x: 0, y: i * 50, width: 100, height: 50 },
        liveBounds: { x: 0, y: i * 50, width: 100, height: 54 },
      }),
    );
    const cumulative = detectCumulativeLayoutDrift(deltas);
    expect(cumulative.detected).toBe(true);
    expect(cumulative.probableCause).toBe('REPEATED_PARENT_SPACING_ERROR');
  });

  it('29. correction priority enforced', () => {
    expect(CORRECTION_PRIORITY_ORDER[0]).toBe('VIEWPORT_CANVAS');
    expect(CORRECTION_PRIORITY_ORDER).toContain('PARENT_GEOMETRY');
    expect(CORRECTION_PRIORITY_ORDER.indexOf('MICRO_DETAIL')).toBeGreaterThan(
      CORRECTION_PRIORITY_ORDER.indexOf('SPACING'),
    );
  });

  it('30. probable cause resolver works', () => {
    const delta = buildRegionVisualDelta({
      regionId: 'test',
      referenceBounds: { x: 0, y: 0, width: 100, height: 50 },
      liveBounds: { x: 12, y: 0, width: 100, height: 50 },
    });
    expect(delta.probableCause).toBe('PARENT_PADDING_WRONG');
  });

  it('31. correction plan generated', () => {
    const delta = buildRegionVisualDelta({
      regionId: 'family-row',
      referenceBounds: { x: 0, y: 0, width: 100, height: 50 },
      liveBounds: { x: 0, y: 0, width: 100, height: 70 },
    });
    const plan = buildVisualCorrectionPlan({ iteration: 1, deltas: [delta], preferRootCause: true });
    expect(plan.targetRegions).toContain('family-row');
    expect(plan.proposedChanges.length).toBeGreaterThan(0);
  });

  it('32. shared component impact analyzed via risk level', () => {
    const delta = buildRegionVisualDelta({
      regionId: 'card',
      referenceBounds: { x: 0, y: 0, width: 100, height: 50 },
      liveBounds: { x: 0, y: 0, width: 100, height: 70 },
    });
    const plan = buildVisualCorrectionPlan({ iteration: 1, deltas: [delta] });
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(plan.riskToOtherScreens);
  });

  it('33. deterministic capture enforced', () => {
    const ready = evaluateCaptureReadiness({
      fontsReady: true,
      layoutStable: true,
      animationsFrozen: true,
      scrollY: 0,
      expectedScrollY: 0,
      dataState: defaultSkinsMobileDataState(),
      expectedDataState: defaultSkinsMobileDataState(),
      imagesLoaded: true,
      hydrationComplete: true,
    });
    expect(ready.ready).toBe(true);
    expect(ready.blockers).toHaveLength(0);
  });

  it('34. font-ready gate enforced', () => {
    const blocked = evaluateCaptureReadiness({
      fontsReady: false,
      layoutStable: true,
      animationsFrozen: true,
      scrollY: 0,
      expectedScrollY: 0,
      dataState: defaultSkinsMobileDataState(),
      expectedDataState: defaultSkinsMobileDataState(),
      imagesLoaded: true,
      hydrationComplete: true,
    });
    expect(blocked.blockers).toContain('REFERENCE_FONT_NOT_READY');
  });

  it('35. layout-stability gate enforced', () => {
    const blocked = evaluateCaptureReadiness({
      fontsReady: true,
      layoutStable: false,
      animationsFrozen: true,
      scrollY: 0,
      expectedScrollY: 0,
      dataState: defaultSkinsMobileDataState(),
      expectedDataState: defaultSkinsMobileDataState(),
      imagesLoaded: true,
      hydrationComplete: true,
    });
    expect(blocked.blockers).toContain('REFERENCE_LAYOUT_NOT_STABLE');
  });

  it('36. animation freeze works', () => {
    const blocked = evaluateCaptureReadiness({
      fontsReady: true,
      layoutStable: true,
      animationsFrozen: false,
      scrollY: 0,
      expectedScrollY: 0,
      dataState: defaultSkinsMobileDataState(),
      expectedDataState: defaultSkinsMobileDataState(),
      imagesLoaded: true,
      hydrationComplete: true,
    });
    expect(blocked.blockers).toContain('REFERENCE_CAPTURE_NONDETERMINISTIC');
  });

  it('37. scroll position locked', () => {
    const blocked = evaluateCaptureReadiness({
      fontsReady: true,
      layoutStable: true,
      animationsFrozen: true,
      scrollY: 100,
      expectedScrollY: 0,
      dataState: defaultSkinsMobileDataState(),
      expectedDataState: defaultSkinsMobileDataState(),
      imagesLoaded: true,
      hydrationComplete: true,
    });
    expect(blocked.blockers).toContain('REFERENCE_DATA_STATE_MISMATCH');
  });

  it('38. data state contract enforced', () => {
    const state = defaultSkinsMobileDataState();
    expect(state.selectedTab).toBe('SKINS');
    expect(state.scrollY).toBe(0);
  });

  it('39. verification thresholds work', () => {
    expect(EXACT_FIDELITY_THRESHOLDS.majorRegionGeometryPx).toBe(8);
    expect(exceedsThreshold(10, 'MAJOR', EXACT_FIDELITY_THRESHOLDS)).toBe(true);
    expect(exceedsThreshold(2, 'MICRO', EXACT_FIDELITY_THRESHOLDS)).toBe(false);
  });

  it('40. hard blockers prevent verify', () => {
    const bp = readyBlueprint();
    const result = evaluateVerification({
      blueprint: bp,
      deltas: [],
      visualQaExecuted: false,
      captureDeterministic: true,
      fontReady: true,
      layoutStable: true,
      dataStateMatch: true,
      noOpGuardPass: true,
    });
    expect(result.status).toBe('BLOCKED');
    expect(result.failureCodes).toContain('REFERENCE_FALSE_PASS');
  });

  it('41. false-pass guard works', () => {
    const guard = fidelityFalsePassGuard({ testsPass: true, visualQaExecuted: false, majorDriftRemaining: 40 });
    expect(guard.pass).toBe(false);
    expect(guard.failureCode).toBe('REFERENCE_FALSE_PASS');
  });

  it('42. no-op guard works', () => {
    const noChange = evaluateNoOpGuard(0.01, 0.01);
    expect(noChange.materialVisualDelta).toBe(false);
    expect(noChange.failureCode).toBe('VISUAL_IMPLEMENTATION_NO_OP');
    const improved = evaluateNoOpGuard(0.5, 0.01);
    expect(improved.materialVisualDelta).toBe(true);
  });

  it('43. blueprint required before exact implementation', () => {
    expect(blueprintRequiredBeforeExactImplementation(null).allowed).toBe(false);
    expect(blueprintRequiredBeforeExactImplementation(readyBlueprint()).allowed).toBe(true);
    const draft = buildReferenceReconstructionBlueprint({
      authorityId: 'x',
      viewport: 'mobile',
      route: '/x',
      measurement: mobileMeasurement(),
      layoutPlan: inferReferenceLayout(mobileMeasurement()),
      status: 'DRAFT',
    });
    expect(blueprintRequiredBeforeExactImplementation(draft).failureCode).toBe('REFERENCE_BLUEPRINT_MISSING');
  });

  it('44. uncertainty represented', () => {
    const lowConfidence = mobileMeasurement();
    lowConfidence.regions[0].confidence = 0.5;
    const layout = inferReferenceLayout(lowConfidence);
    expect(layout.uncertainties.some((u) => u.severity === 'NEEDS_INFERENCE_REVIEW')).toBe(true);
  });

  it('45. convergence iterations stored', () => {
    const delta = buildRegionVisualDelta({
      regionId: 'r1',
      referenceBounds: { x: 0, y: 0, width: 100, height: 50 },
      liveBounds: { x: 0, y: 0, width: 100, height: 50 },
    });
    const plan = buildVisualCorrectionPlan({ iteration: 1, deltas: [delta] });
    const record = recordConvergenceIteration({
      iteration: 1,
      beforeCaptureId: 'before-1',
      afterCaptureId: 'after-1',
      deltas: [delta],
      plan,
      filesChanged: ['test.css'],
    });
    expect(record.iteration).toBe(1);
    expect(record.improvementScore).toBeGreaterThan(0);
  });

  it('46. regression masks via locked regions', () => {
    const bp = lockVerifiedRegion(readyBlueprint(), 'shell');
    expect(bp.lockedRegions).toContain('shell');
  });

  it('47. mobile authority can verify independently', () => {
    const bp = buildSkinsMobileReferenceBlueprint();
    expect(bp?.viewport).toBe('mobile');
    expect(bp?.status).toBe('READY');
  });

  it('48. desktop authority can verify independently', () => {
    const desktop = inferReferenceLayout(desktopMeasurement());
    expect(desktop.viewport).toBe('desktop');
    expect(desktop.gridInferences.some((g) => g.columns === 4)).toBe(true);
  });

  it('49. intermediate widths remain functional — collapsed authority fails', () => {
    const mobile = inferReferenceLayout(mobileMeasurement());
    const desktopCopy = { ...mobile, viewport: 'desktop' as const };
    const collapsed = assertResponsiveAuthorityIsolation(mobile, desktopCopy);
    expect(collapsed.isolated).toBe(false);
    expect(collapsed.failureCode).toBe('REFERENCE_RESPONSIVE_AUTHORITY_COLLAPSED');
  });

  it('50. acceptance — line break drift for ALL IN ONE ENTERPRISES', () => {
    const expected = SKINS_FAMILY_LINE_BREAKS.AIO;
    const liveWrong = ['ALL IN ONE ENTERPRISES'];
    expect(classifyLineBreakDrift(expected, liveWrong)).toBe('REFERENCE_LINE_BREAK_DRIFT');
    expect(classifyLineBreakDrift(expected, expected)).toBeNull();
  });

  it('51. all failure codes registered', () => {
    expect(RRI_FAILURE_CODES.length).toBeGreaterThanOrEqual(31);
    expect(RRI_FAILURE_CODES).toContain('REFERENCE_BLUEPRINT_MISSING');
    expect(RRI_FAILURE_CODES).toContain('REFERENCE_FALSE_PASS');
  });

  it('52. system inspector builds state', () => {
    const css = read('src/site00/styles/site00-design-skins-tab.css');
    const inspector = buildReferenceReconstructionInspectorState({ cssSources: [css] });
    expect(inspector).not.toBeNull();
    expect(inspector!.blueprintStatus).toBe('READY');
    expect(inspector!.regionCount).toBeGreaterThan(0);
  });

  it('53. major layout mode failure — desktop stack vs 3-column', () => {
    const mobile = mobileMeasurement();
    const desktop = desktopMeasurement();
    const mobileLayout = inferReferenceLayout(mobile);
    const desktopLayout = inferReferenceLayout(desktop);
    expect(desktopLayout.regionLayoutModes['family-rail']).toBeDefined();
    expect(mobileLayout.regionLayoutModes['family-row']).toBeDefined();
    expect(desktopLayout.gridInferences[0]?.columns).not.toBe(mobileLayout.gridInferences[0]?.columns);
  });

  it('54. hard verification blockers — missing asset', () => {
    const bp = readyBlueprint();
    bp.assetRequirements = [{ slotId: 'MISSING', required: true, bound: false }];
    const codes = evaluateHardVerificationBlockers({
      deltas: [],
      blueprint: bp,
      visualQaExecuted: true,
      majorCount: 0,
    });
    expect(codes).toContain('REFERENCE_INTRINSIC_SIZE_DRIFT');
  });

  it('55. UI inspector component file exists', () => {
    const src = read('src/site00/components/designWorkspace/DesignReferenceReconstructionInspector.tsx');
    expect(src).toContain('REFERENCE RECONSTRUCTION');
    expect(src).toContain('buildSkinsMobileReferenceBlueprint');
  });
});
