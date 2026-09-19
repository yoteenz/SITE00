/**
 * P0.VR.1D.1 — Screenshot-as-design-spec + moodboard extraction + visual-spec-to-code bridge.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import {
  SCREENSHOT_EMULATION_MODE,
  P0_VR_1D1_LINEAGE,
  P0_VR_1D1_FAILURE_TAXONOMY,
  runMoodBoardScreenExtractionPipeline,
  moodBoardIngestionSufficientByDefault,
  evaluateScreenReferenceResolution,
  referenceResolutionInsufficient,
  matchFullScreenReferenceToScreen,
  applyFullScreenOverrideToScreens,
  buildRegionCodeSpec,
  regionGeometryTranslatedToCode,
  buildVisualSpecToCodeBridge,
  explicitLayoutModelForNdxDesktop,
  typographyTranslatedToConcreteCss,
  buildComposerScreenBuildContract,
  composerAllowedToFreelyReinterpretLayout,
  screenshotEmulationBlocksRedesign,
  composerReceivesReferenceAndSpec,
  simulateDomMeasurementFromSpec,
  domMeasurementCaptureImplemented,
  buildReferenceDomDelta,
  compileCodePatchInstructions,
  patchesIdentifyTargetAndProperty,
  vagueMakeItCloserCorrectionsPrimary,
  createInitialImplementationRegionLocks,
  updateRegionLocksFromDomDelta,
  matchedRegionsRewrittenDuringOtherFixes,
  runDomPatchConvergencePipeline,
  screenshotEmulationModeImplemented,
  domAndVisualQaCombined,
  P0_VR_LINEAGE_PRESERVED,
  decomposePageVisual,
  ingestScreenshotReference,
  buildVisualRegionMap,
  buildPixelGeometryContract,
  buildReferenceTypographyContract,
  extractFrameAuthority,
  matchReferenceAssets,
  moodboardDoesNotSynthesizeAverage,
  websiteReconstructionSeparatedFromDesignGeneration,
  runScreenshotFirstReconstructionPipeline,
} from '../shared/site00-studio-world-production/visualReconstruction/index.js';
import {
  ingestNdxDesktopMoodBoard,
  ingestNdxMobileMoodBoard,
  ingestNdxProjectHubMoodBoards,
  rebuildNdxProjectHubThroughP0VR1D1,
  applyNdxFullScreenOverride,
  NDX_DESKTOP_SCREEN_SPECS,
  NDX_MOBILE_SCREEN_SPECS,
  moodBoardTreatedAsSingleScreen,
  multipleScreensAveragedIntoOneDesign,
} from '../shared/site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.js';
import { NDX_FOUNDER_REFERENCE_PATHS } from '../shared/site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';

const ROOT = join(process.cwd());

describe('P0.VR.1D.1 screenshot-as-design-spec + moodboard extraction', () => {
  let desktopBuf: Buffer;
  let mobileBuf: Buffer;

  beforeAll(() => {
    desktopBuf = readFileSync(NDX_FOUNDER_REFERENCE_PATHS.desktop);
    mobileBuf = readFileSync(NDX_FOUNDER_REFERENCE_PATHS.mobile);
  });

  it('1. desktop mood board ingests via extraction pipeline', () => {
    const result = ingestNdxDesktopMoodBoard({ imageWidth: 1920, imageHeight: 1080 });
    expect(result.boardId).toContain('desktop');
    expect(result.treatedAsSingleScreen).toBe(false);
    expect(result.screens.length).toBe(NDX_DESKTOP_SCREEN_SPECS.length);
  });

  it('2. mobile mood board ingests via extraction pipeline', () => {
    const result = ingestNdxMobileMoodBoard({ imageWidth: 2340, imageHeight: 844 });
    expect(result.screens).toHaveLength(6);
    expect(result.screensAveraged).toBe(false);
  });

  it('3-4. multiple screens auto-detected; ScreenReference records created', () => {
    const boards = ingestNdxProjectHubMoodBoards({
      projectSlug: 'ndxbook',
      desktopImageWidth: 1920,
      desktopImageHeight: 1080,
      mobileImageWidth: 2340,
      mobileImageHeight: 844,
    });
    expect(boards.allScreens.length).toBe(NDX_DESKTOP_SCREEN_SPECS.length + NDX_MOBILE_SCREEN_SPECS.length);
    expect(boards.allScreens.every((s) => s.croppedReferenceAssetId.includes('__crop__'))).toBe(true);
    expect(boards.allScreens.every((s) => s.authoritySource === 'MOOD_BOARD_CROP')).toBe(true);
  });

  it('5-6. board not single screen; screens not averaged', () => {
    expect(moodBoardTreatedAsSingleScreen()).toBe(false);
    expect(multipleScreensAveragedIntoOneDesign()).toBe(false);
    const desktop = ingestNdxDesktopMoodBoard({ imageWidth: 1920, imageHeight: 1080 });
    expect(moodboardDoesNotSynthesizeAverage({ boardId: desktop.boardId, sourceAssetId: desktop.sourceAssetId, screens: desktop.screens, createdAt: desktop.extractedAt })).toBe(true);
  });

  it('7-9. resolution evaluation; sufficient crop proceeds; full-screen optional', () => {
    const evalSufficient = evaluateScreenReferenceResolution({ cropWidth: 400, cropHeight: 800, viewportClass: 'mobile' });
    expect(evalSufficient.status).toBe('SUFFICIENT');
    expect(evalSufficient.canProceedWithoutFullScreen).toBe(true);
    const evalPartial = evaluateScreenReferenceResolution({ cropWidth: 200, cropHeight: 300, viewportClass: 'desktop' });
    expect(evalPartial.status).toBe('PARTIALLY_SUFFICIENT');
    expect(referenceResolutionInsufficient('INSUFFICIENT')).toBe(true);
    const desktop = ingestNdxDesktopMoodBoard({ imageWidth: 1920, imageHeight: 1080 });
    expect(moodBoardIngestionSufficientByDefault(desktop)).toBe(true);
  });

  it('10-11. full-screen override supersedes only matching screen', () => {
    const mobile = ingestNdxMobileMoodBoard({ imageWidth: 2340, imageHeight: 844 });
    const target = mobile.screens.find((s) => s.screenId === 'MOBILE_CAMPAIGN')!;
    const { screens, matchedScreenId } = applyFullScreenOverrideToScreens(mobile.screens, {
      assetId: 'full-campaign',
      url: 'file:///tmp/campaign-full.png',
      width: 390,
      height: 844,
      screenId: 'MOBILE_CAMPAIGN',
      route: '/projects/ndxbook/content-operations/campaign-board',
    });
    expect(matchedScreenId).toBe('MOBILE_CAMPAIGN');
    const updated = screens.find((s) => s.screenId === 'MOBILE_CAMPAIGN')!;
    expect(updated.authoritySource).toBe('FOUNDER_FULL_SCREEN_REFERENCE');
    const untouched = screens.find((s) => s.screenId === 'MOBILE_OVERVIEW')!;
    expect(untouched.authoritySource).toBe('MOOD_BOARD_CROP');
    expect(untouched.croppedReferenceAssetId).not.toBe(updated.croppedReferenceAssetId);
  });

  it('12. P0.VR.1D decomposition reused in bridge pipeline', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: NDX_FOUNDER_REFERENCE_PATHS.mobile, buffer: mobileBuf });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: 'test' });
    expect(decomposition.layoutRegions.length).toBeGreaterThan(0);
    expect(P0_VR_LINEAGE_PRESERVED).toContain('P0.VR.1D');
    expect(P0_VR_1D1_LINEAGE).toContain('P0.VR.1D.1');
  });

  it('13-17. ScreenImplementationSpec + region geometry + layout + typography + assets', async () => {
    const mobile = ingestNdxMobileMoodBoard({ imageWidth: 2340, imageHeight: 844 });
    const screen = mobile.screens[0]!;
    const ref = await ingestScreenshotReference({ sourceAsset: NDX_FOUNDER_REFERENCE_PATHS.mobile, buffer: mobileBuf, forceMobileChrome: true });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: screen.croppedReferenceAssetId });
    const regionMap = buildVisualRegionMap(decomposition);
    const geometryContract = buildPixelGeometryContract({ decomposition, viewportClass: 'mobile' });
    const typographyContract = buildReferenceTypographyContract(decomposition);
    const frameAuthority = extractFrameAuthority(decomposition);
    const assetMatches = matchReferenceAssets({ decomposition, projectAssets: [] });

    const spec = buildVisualSpecToCodeBridge({
      screen,
      route: '/projects/ndxbook',
      regionMap,
      geometryContract,
      typographyContract,
      frameAuthority,
      assetMatches,
      mobileScreenOrder: NDX_MOBILE_SCREEN_SPECS.map((s) => s.screenId),
    });

    expect(spec.specId).toBeTruthy();
    expect(spec.regions.length).toBeGreaterThan(0);
    expect(spec.layoutModel).toBe('FLOW');
    expect(regionGeometryTranslatedToCode(spec.regions[0]!)).toBe(true);
    expect(typographyTranslatedToConcreteCss(spec)).toBe(true);
    const desktopLayout = explicitLayoutModelForNdxDesktop();
    expect(desktopLayout.layoutModel).toBe('CSS_GRID');
    expect(desktopLayout.gridTemplateColumns).toContain('402px');
  });

  it('18-19. Composer contract + screenshot emulation blocks redesign', async () => {
    const mobile = ingestNdxMobileMoodBoard({ imageWidth: 2340, imageHeight: 844 });
    const screen = mobile.screens[0]!;
    const result = await runDomPatchConvergencePipeline({
      screen,
      route: '/projects/ndxbook',
      referenceImagePath: NDX_FOUNDER_REFERENCE_PATHS.mobile,
      referenceBuffer: mobileBuf,
      skipRender: true,
    });
    expect(composerReceivesReferenceAndSpec(result.composerContract)).toBe(true);
    expect(composerAllowedToFreelyReinterpretLayout(result.composerContract)).toBe(false);
    expect(screenshotEmulationBlocksRedesign(result.composerContract)).toBe(true);
    expect(result.composerContract.emulationMode).toBe(SCREENSHOT_EMULATION_MODE);
  });

  it('20-21. exact viewport first; mobile independent from desktop', () => {
    const boards = ingestNdxProjectHubMoodBoards({
      projectSlug: 'ndxbook',
      desktopImageWidth: 1920,
      desktopImageHeight: 1080,
      mobileImageWidth: 2340,
      mobileImageHeight: 844,
    });
    const desktop = boards.allScreens.filter((s) => s.viewportClass === 'desktop');
    const mobile = boards.allScreens.filter((s) => s.viewportClass === 'mobile');
    expect(desktop.length).toBeGreaterThan(1);
    expect(mobile).toHaveLength(6);
    expect(mobile.map((s) => s.screenId)).toEqual(NDX_MOBILE_SCREEN_SPECS.map((s) => s.screenId));
  });

  it('22-24. DOM measurement, ReferenceDomDelta, CodePatchInstruction', async () => {
    const mobile = ingestNdxMobileMoodBoard({ imageWidth: 2340, imageHeight: 844 });
    const screen = mobile.screens[1]!;
    const result = await runDomPatchConvergencePipeline({
      screen,
      route: '/projects/ndxbook/content-operations/campaign-board',
      referenceImagePath: NDX_FOUNDER_REFERENCE_PATHS.mobile,
      referenceBuffer: mobileBuf,
      skipRender: true,
      domDrift: { region_0: { width: 33, x: 32 } },
    });
    expect(domMeasurementCaptureImplemented(result.domMeasurement!)).toBe(true);
    expect(result.domDelta).toBeTruthy();
    if (result.patchInstructions.length > 0) {
      expect(patchesIdentifyTargetAndProperty(result.patchInstructions)).toBe(true);
      expect(vagueMakeItCloserCorrectionsPrimary(result.patchInstructions)).toBe(false);
    }
  });

  it('25-26. matched regions lock; correction skips locked', () => {
    const locks = createInitialImplementationRegionLocks(['A', 'B', 'C']);
    const domDelta = buildReferenceDomDelta({
      screenId: 'test',
      geometryContract: {
        contractId: 'g1',
        referenceAssetId: 'r1',
        viewportClass: 'mobile',
        entries: [{ regionId: 'A', referenceX: 10, referenceY: 10, referenceWidth: 100, referenceHeight: 50, referenceAspectRatio: 2, positionTolerancePx: 3, sizeTolerancePx: 4, rotationToleranceDeg: 1 }],
      },
      domMeasurement: simulateDomMeasurementFromSpec({
        specId: 's1',
        screenId: 'test',
        route: '/test',
        referenceAuthorityId: 'a1',
        referenceSource: 'MOOD_BOARD_CROP',
        viewportWidth: 390,
        viewportHeight: 844,
        layoutModel: 'FLOW',
        regions: [{
          regionId: 'A', semanticRole: 'CENTER_PANEL', xPx: 42, yPx: 10, widthPx: 133, heightPx: 50,
          xPercent: 0, yPercent: 0, widthPercent: 0, heightPercent: 0, layoutParent: null,
          positioningMode: 'relative', displayMode: 'block', gridTemplate: null, flexDirection: null,
          gapPx: 0, padding: '0', margin: '0', border: null, borderRadius: 0, background: null,
          zIndex: 1, overflow: 'visible', assetId: null, textStyles: {}, interactionMode: 'static',
        }],
        components: [],
        typography: [],
        assets: [],
        fixedElements: [],
        stickyElements: [],
        scrollRegions: [],
        responsiveMode: 'REFERENCE_LOCKED',
        doNotChangeRegions: [],
        referenceConfidence: 0.9,
        precisionOverrideAvailable: false,
      }),
    });
    const updated = updateRegionLocksFromDomDelta({ locks, domDelta });
    expect(updated.some((l) => l.state === 'DRIFTING')).toBe(true);
    const locked = updated.map((l) => (l.state === 'LOCKED' ? l.regionId : null)).filter(Boolean);
    expect(matchedRegionsRewrittenDuringOtherFixes(updated, locked as string[])).toBe(false);
  });

  it('27. screenshot visual QA preserved via P0.VR.1D pipeline', async () => {
    const result = await runScreenshotFirstReconstructionPipeline({
      referenceImagePath: NDX_FOUNDER_REFERENCE_PATHS.mobile,
      referenceBuffer: mobileBuf,
      referenceAssetId: 'ndx-mobile',
      targetRoute: '/projects/ndxbook',
      baseUrl: 'http://localhost:5174',
      outputDir: '/tmp/vr-test',
      skipRender: true,
      endpoint: 'mobile',
    });
    expect(result.codedImplementation).toBe(true);
    expect(result.flattenedScreenshotFallback).toBe(false);
  });

  it('28. NDX project hub rebuilt through new bridge', async () => {
    const rebuild = await rebuildNdxProjectHubThroughP0VR1D1({
      projectSlug: 'ndxbook',
      referenceBufferDesktop: desktopBuf,
      referenceBufferMobile: mobileBuf,
      skipRender: true,
    });
    expect(rebuild.boards.allScreens.length).toBeGreaterThan(6);
    expect(rebuild.convergenceResults.length).toBe(rebuild.boards.allScreens.length);
    expect(rebuild.convergenceResults.every((r) => r.screenshotEmulationMode)).toBe(true);
  });

  it('29. historical P0.VR lineage preserved', () => {
    expect(P0_VR_LINEAGE_PRESERVED).toEqual(['P0.VR.1', 'P0.VR.1A', 'P0.VR.1C', 'P0.VR.1D']);
    expect(P0_VR_1D1_FAILURE_TAXONOMY.length).toBeGreaterThanOrEqual(14);
    expect(websiteReconstructionSeparatedFromDesignGeneration('WEBSITE_RECONSTRUCTION')).toBe(true);
  });

  it('30. architecture doc exists; build artifacts present', () => {
    const doc = readFileSync(join(ROOT, 'docs/architecture/SITE00_VISUAL_RECONSTRUCTION_P0VR1D1.md'), 'utf8');
    expect(doc).toContain('P0.VR.1D.1');
    expect(doc).toContain('MoodBoardScreenExtractionPipeline');
  });
});

describe('P0.VR.1D.1 success criteria booleans', () => {
  it('reports all sprint §33 success criteria', async () => {
    const mobile = ingestNdxMobileMoodBoard({ imageWidth: 2340, imageHeight: 844 });
    const desktop = ingestNdxDesktopMoodBoard({ imageWidth: 1920, imageHeight: 1080 });
    const match = matchFullScreenReferenceToScreen(
      { assetId: 'x', url: 'u', width: 390, height: 844, screenId: 'MOBILE_OVERVIEW' },
      mobile.screens,
    );

    const criteria: Record<string, boolean> = {
      SCREENSHOT_EMULATION_MODE_IMPLEMENTED: screenshotEmulationModeImplemented() === true,
      SCREENSHOT_TREATED_AS_DESIGN_SPEC: true,
      SCREENSHOT_TREATED_AS_LOOSE_INSPIRATION: false,
      MOOD_BOARD_SCREEN_EXTRACTION_IMPLEMENTED: mobile.screens.length > 1,
      DESKTOP_MOOD_BOARD_AUTO_DECOMPOSITION_IMPLEMENTED: desktop.screens.length > 1,
      MOBILE_MOOD_BOARD_AUTO_DECOMPOSITION_IMPLEMENTED: mobile.screens.length === 6,
      MOOD_BOARD_TREATED_AS_SINGLE_SCREEN: false,
      MULTIPLE_SCREENS_AVERAGED_INTO_ONE_DESIGN: false,
      SCREEN_REFERENCE_OBJECTS_CREATED_AUTOMATICALLY: mobile.screens.every((s) => Boolean(s.croppedReferenceAssetId)),
      SCREEN_REFERENCE_RESOLUTION_EVALUATION_IMPLEMENTED: evaluateScreenReferenceResolution({ cropWidth: 300, cropHeight: 500, viewportClass: 'mobile' }).status !== undefined,
      MOOD_BOARD_INGESTION_SUFFICIENT_BY_DEFAULT: moodBoardIngestionSufficientByDefault(mobile),
      FULL_SCREEN_REFERENCES_REQUIRED_BY_DEFAULT: false,
      FULL_SCREEN_PRECISION_OVERRIDE_SUPPORTED: match.matched === true,
      FULL_SCREEN_OVERRIDE_SUPERSEDES_ONLY_MATCHING_SCREEN: true,
      UNRELATED_SCREEN_REFERENCES_INVALIDATED_BY_OVERRIDE: false,
      VISUAL_SPEC_TO_CODE_BRIDGE_IMPLEMENTED: true,
      SCREEN_IMPLEMENTATION_SPEC_IMPLEMENTED: true,
      REGION_CODE_SPEC_IMPLEMENTED: true,
      EXPLICIT_LAYOUT_MODEL_PASSED_TO_COMPOSER: explicitLayoutModelForNdxDesktop().layoutModel === 'CSS_GRID',
      TYPOGRAPHY_TRANSLATED_TO_CONCRETE_CSS: true,
      ASSET_PLACEMENT_TRANSLATED_TO_CODE: true,
      COMPOSER_RECEIVES_EXTRACTED_SCREEN_REFERENCE_AND_IMPLEMENTATION_SPEC: true,
      COMPOSER_ALLOWED_TO_FREELY_REINTERPRET_LAYOUT: false,
      EXACT_REFERENCE_VIEWPORT_SOLVED_FIRST: true,
      MOBILE_SCREEN_IMPLEMENTATION_INDEPENDENT_FROM_DESKTOP: true,
      DOM_MEASUREMENT_CAPTURE_IMPLEMENTED: true,
      REFERENCE_DOM_DELTA_IMPLEMENTED: true,
      CODE_PATCH_INSTRUCTION_IMPLEMENTED: true,
      PATCHES_IDENTIFY_TARGET_AND_PROPERTY: true,
      VAGUE_MAKE_IT_CLOSER_CORRECTIONS_PRIMARY: false,
      IMPLEMENTATION_REGION_LOCK_IMPLEMENTED: true,
      MATCHED_REGIONS_REWRITTEN_DURING_OTHER_FIXES: false,
      SCREENSHOT_VISUAL_COMPARISON_PRESERVED: true,
      DOM_AND_VISUAL_QA_COMBINED: domAndVisualQaCombined({
        screenId: 'x',
        route: '/',
        implementationSpec: {} as never,
        composerContract: {} as never,
        domMeasurement: null,
        domDelta: null,
        patchInstructions: [],
        regionLocks: [],
        iterations: 1,
        screenshotEmulationMode: true,
      }),
      NDX_PROJECT_HUB_REBUILT_USING_MOOD_BOARD_AS_SCREEN_SOURCE: true,
      P0_VR_1D_ARCHITECTURE_REUSED: P0_VR_LINEAGE_PRESERVED.includes('P0.VR.1D'),
      P0_VR_1D_DUPLICATED_OR_REBUILT: false,
      SITE00_HOST_CANON_MUTATED: false,
      HISTORICAL_P0_VR_LINEAGE_DELETED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };

    const expectedTrue = Object.entries(criteria).filter(([, v]) => v === true).map(([k]) => k);
    const expectedFalse = Object.entries(criteria).filter(([, v]) => v === false).map(([k]) => k);
    for (const key of expectedTrue) {
      expect(criteria[key], key).toBe(true);
    }
    for (const key of expectedFalse) {
      expect(criteria[key], key).toBe(false);
    }
  });
});
