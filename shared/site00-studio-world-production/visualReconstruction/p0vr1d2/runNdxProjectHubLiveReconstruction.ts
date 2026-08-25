/**
 * P0.VR.1D.2 — Execute live NDX project hub reconstruction (no skipRender).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import {
  ingestScreenshotReference,
  decomposePageVisual,
  buildVisualRegionMap,
  buildPixelGeometryContract,
  buildReferenceTypographyContract,
  extractFrameAuthority,
  matchReferenceAssets,
  compareRenderedReference,
  evaluatePixelMatch,
  buildVisualDifferenceMap,
  renderControlledReference,
} from '../index.js';
import { PIXEL_MATCH_THRESHOLDS } from '../p0vr1d/constants.js';
import {
  buildVisualSpecToCodeBridge,
  buildReferenceDomDelta,
  compileCodePatchInstructions,
  createInitialImplementationRegionLocks,
  updateRegionLocksFromDomDelta,
  lockedRegionIds,
} from '../p0vr1d1/index.js';
import {
  NDX_DESKTOP_SCREEN_SPECS,
  NDX_MOBILE_SCREEN_SPECS,
  NDX_DESKTOP_BOARD_REGIONS,
} from '../../../site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.js';
import {
  NDX_CALIBRATION_ROUTES,
  type NdxCalibrationRoute,
} from '../../../site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';
import { resolveNdxFounderProjectHubBoards } from './resolveNdxFounderBoardAssets.js';
import {
  cropBoardScreenReference,
  detectScreenFramesOnBoard,
  inferScreenViewportFromBoardCrop,
} from './inferScreenViewportFromBoardCrop.js';
import { measureScreenReferenceResolutionFromCrop } from './measureScreenReferenceResolution.js';
import type {
  LiveScreenRunResult,
  NdxProjectHubLiveReconstructionReport,
  ReconstructionExecutionStatus,
} from './types.js';

export type RunNdxProjectHubLiveReconstructionInput = {
  projectSlug?: string;
  baseUrl?: string;
  outputDir?: string;
  allowFixtureFallback?: boolean;
  maxIterations?: number;
};

function routeForScreen(projectSlug: string, screenId: string, viewportClass: 'desktop' | 'mobile'): string {
  const specs = viewportClass === 'desktop' ? NDX_DESKTOP_SCREEN_SPECS : NDX_MOBILE_SCREEN_SPECS;
  const spec = specs.find((s) => s.screenId === screenId);
  return `/projects/${projectSlug}${spec?.routeSuffix ?? ''}`;
}

function calibrationRouteFor(path: string, viewportClass: 'desktop' | 'mobile'): NdxCalibrationRoute | undefined {
  const candidates = NDX_CALIBRATION_ROUTES.filter((r) => r.path === path);
  if (viewportClass === 'mobile') {
    return candidates.find((r) => r.routeId.startsWith('mobile-')) ?? candidates[0];
  }
  return candidates.find((r) => !r.routeId.startsWith('mobile-')) ?? candidates[0];
}

function scoreToStatus(scores: { structural: number; visual: number; pixel: number }): ReconstructionExecutionStatus {
  if (scores.pixel >= PIXEL_MATCH_THRESHOLDS.PIXEL_PASS) return 'PIXEL_PASS';
  if (scores.visual >= PIXEL_MATCH_THRESHOLDS.VISUAL_PASS) return 'VISUAL_PASS';
  if (scores.structural >= PIXEL_MATCH_THRESHOLDS.STRUCTURAL_PASS) return 'FOUNDER_REVIEW';
  return 'NEEDS_CORRECTION';
}

async function runLiveScreen(input: {
  projectSlug: string;
  screenId: string;
  viewportClass: 'desktop' | 'mobile';
  boardBuffer: Buffer;
  boardWidth: number;
  boardHeight: number;
  frame: { x: number; y: number; width: number; height: number };
  baseUrl: string;
  outputDir: string;
  maxIterations: number;
}): Promise<LiveScreenRunResult> {
  const route = routeForScreen(input.projectSlug, input.screenId, input.viewportClass);
  const cal = calibrationRouteFor(route, input.viewportClass);
  const cropPath = join(input.outputDir, 'references', `${input.screenId}.png`);
  const cropBuffer = await cropBoardScreenReference(input.boardBuffer, {
    screenId: input.screenId,
    x: input.frame.x,
    y: input.frame.y,
    width: input.frame.width,
    height: input.frame.height,
    viewportClass: input.viewportClass,
  }, cropPath);

  const resolution = await measureScreenReferenceResolutionFromCrop(cropBuffer);
  const geometry = inferScreenViewportFromBoardCrop({
    screenId: input.screenId,
    cropX: input.frame.x,
    cropY: input.frame.y,
    cropWidth: input.frame.width,
    cropHeight: input.frame.height,
    boardWidth: input.boardWidth,
    boardHeight: input.boardHeight,
    viewportClass: input.viewportClass,
    routeViewportHint:
      input.viewportClass === 'mobile'
        ? { width: 390, height: 844 }
        : { width: 1440, height: 900 },
  });

  const reference = await ingestScreenshotReference({
    sourceAsset: cropPath,
    buffer: cropBuffer,
    forceMobileChrome: input.viewportClass === 'mobile',
  });
  const decomposition = decomposePageVisual({ reference, referenceAssetId: input.screenId });
  const regionMap = buildVisualRegionMap(decomposition);
  const geometryContract = buildPixelGeometryContract({
    decomposition,
    viewportClass: input.viewportClass,
  });
  const typographyContract = buildReferenceTypographyContract(decomposition);
  const frameAuthority = extractFrameAuthority(decomposition);
  const assetMatches = matchReferenceAssets({ decomposition, projectAssets: [] });

  const extractedScreen = {
    screenId: input.screenId,
    boardId: 'live-board',
    bounds: { x: input.frame.x, y: input.frame.y, width: input.frame.width, height: input.frame.height },
    viewportRatio: geometry.screenAspectRatio,
    screenType: input.viewportClass,
    viewportClass: input.viewportClass,
    crop: { x: 0, y: 0, width: input.frame.width, height: input.frame.height },
    authority: null,
    sourceBoardId: 'live-board',
    croppedReferenceAssetId: input.screenId,
    surfaceType: input.screenId,
    confidence: resolution.confidence,
    referenceResolution: resolution.status,
    authoritySource: 'MOOD_BOARD_CROP' as const,
    authorityVersion: 1,
  };

  const implementationSpec = buildVisualSpecToCodeBridge({
    screen: extractedScreen,
    route,
    regionMap,
    geometryContract,
    typographyContract,
    frameAuthority,
    assetMatches,
    layoutModel: input.viewportClass === 'desktop' ? 'CSS_GRID' : 'FLOW',
  });

  const viewportUsed = {
    width: geometry.inferredViewportWidth,
    height: geometry.inferredViewportHeight,
    deviceScaleFactor: input.viewportClass === 'mobile' ? 2 : 1,
  };

  let status: ReconstructionExecutionStatus = 'SPEC_COMPILED';
  let firstRenderPath: string | null = null;
  let domMeasurement = null;
  let domDelta = null;
  let patchInstructions: ReturnType<typeof compileCodePatchInstructions> = [];
  let regionLocks = createInitialImplementationRegionLocks(implementationSpec.regions.map((r) => r.regionId));
  let pixelMatch = null;
  let differenceMap = null;
  let structuralScore = 0;
  let visualScore = 0;
  let pixelScore = 0;
  let iterations = 0;
  let overlay: LiveScreenRunResult['overlay'] = null;

  const renderDir = join(input.outputDir, 'renders', input.screenId);
  mkdirSync(renderDir, { recursive: true });

  for (let i = 1; i <= input.maxIterations; i++) {
    iterations = i;
    const snapshot = await renderControlledReference({
      route,
      baseUrl: input.baseUrl,
      viewport: viewportUsed,
      outputDir: renderDir,
      reconstructionIteration: i,
      blueprintVersion: 'P0.VR.1D.2',
      selector: cal?.renderSelector.split(',')[0]?.trim(),
      previewDeviceMode: input.viewportClass === 'mobile' ? 'mobile' : 'desktop',
      routeSearch: input.viewportClass === 'mobile' ? '?site00MobileLayout=1' : '',
      captureDomMeasurements: true,
      domRegionSelector: '[data-vr-region], [data-visual-reconstruction]',
    });

    if (!firstRenderPath) {
      firstRenderPath = snapshot.screenshotPath;
      status = 'FIRST_RENDER_COMPLETE';
    }

    domMeasurement = snapshot.domMeasurement;
    if (domMeasurement) {
      domDelta = buildReferenceDomDelta({
        screenId: input.screenId,
        geometryContract,
        domMeasurement,
      });
      regionLocks = updateRegionLocksFromDomDelta({ locks: regionLocks, domDelta });
      patchInstructions = compileCodePatchInstructions({
        domDelta,
        implementationSpec,
        lockedRegionIds: lockedRegionIds(regionLocks),
      });
      status = 'CORRECTION_IN_PROGRESS';
    }

    const renderBuffer = readFileSync(snapshot.screenshotPath);
    const comparison = await compareRenderedReference({
      referenceBuffer: cropBuffer,
      renderBuffer,
      reference,
      snapshot,
      regions: decomposition.regions,
      outputDir: join(input.outputDir, 'overlays', input.screenId),
    });

    pixelMatch = evaluatePixelMatch({
      referenceAssetId: input.screenId,
      renderAssetId: snapshot.renderId,
      comparison,
    });
    differenceMap = buildVisualDifferenceMap({
      referenceAssetId: input.screenId,
      renderAssetId: snapshot.renderId,
      pixelMatch,
      heatmapPath: comparison.heatmapPath,
      regionScores: comparison.regionScores,
    });

    structuralScore = comparison.structuralSimilarity;
    visualScore = pixelMatch.globalAlignment;
    pixelScore = pixelMatch.globalAlignment;
    overlay = {
      referencePath: cropPath,
      implementationPath: snapshot.screenshotPath,
      overlayPath: comparison.heatmapPath,
      differenceMapPath: join(input.outputDir, 'overlays', input.screenId),
      heatmapPath: comparison.heatmapPath,
    };

    status = scoreToStatus({ structural: structuralScore, visual: visualScore, pixel: pixelScore });
    if (status === 'VISUAL_PASS' || status === 'PIXEL_PASS') break;
  }

  return {
    screenId: input.screenId,
    route,
    viewportClass: input.viewportClass,
    geometry,
    resolution,
    implementationSpec,
    status,
    skipRender: false,
    viewportUsed,
    firstRenderPath,
    domMeasurement,
    domDelta,
    patchInstructions,
    lockedRegionIds: lockedRegionIds(regionLocks),
    pixelMatch,
    differenceMap,
    structuralScore,
    visualScore,
    pixelScore,
    iterations,
    overlay,
  };
}

export async function runNdxProjectHubLiveReconstruction(
  input: RunNdxProjectHubLiveReconstructionInput = {},
): Promise<NdxProjectHubLiveReconstructionReport> {
  const projectSlug = input.projectSlug ?? 'ndxbook';
  const baseUrl = input.baseUrl ?? process.env.VR_BASE_URL ?? 'http://127.0.0.1:5174';
  const outputDir = input.outputDir ?? join('/tmp', 'ndx-project-hub-live-vr', String(Date.now()));
  const maxIterations = input.maxIterations ?? 3;
  mkdirSync(outputDir, { recursive: true });

  const founderBoards = await resolveNdxFounderProjectHubBoards({
    allowFixtureFallback: input.allowFixtureFallback ?? false,
  });

  if (!founderBoards.desktopPath || !founderBoards.mobilePath) {
    const report: NdxProjectHubLiveReconstructionReport = {
      reportId: randomUUID(),
      executedAt: new Date().toISOString(),
      founderBoards,
      boardDimensions: { desktop: { width: 0, height: 0 }, mobile: { width: 0, height: 0 } },
      desktopScreens: [],
      mobileScreens: [],
      skipRenderUsed: false,
      browser: 'playwright-chromium',
      architectureReady: true,
      actualReconstructionExecuted: false,
      desktopVisualPass: false,
      mobileVisualPass: false,
      pixelPass: false,
    };
    writeFileSync(join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
    return report;
  }

  const desktopBuf = readFileSync(founderBoards.desktopPath);
  const mobileBuf = readFileSync(founderBoards.mobilePath);
  const desktopMeta = await sharp(desktopBuf).metadata();
  const mobileMeta = await sharp(mobileBuf).metadata();
  const boardDimensions = {
    desktop: { width: desktopMeta.width ?? 0, height: desktopMeta.height ?? 0 },
    mobile: { width: mobileMeta.width ?? 0, height: mobileMeta.height ?? 0 },
  };

  const desktopFrames = await detectScreenFramesOnBoard({
    boardBuffer: desktopBuf,
    boardId: 'desktop-board',
    viewportClass: 'desktop',
    screenSpecs: NDX_DESKTOP_SCREEN_SPECS.map((s) => ({
      screenId: s.screenId,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
    })),
  });

  const mobileFrames = await detectScreenFramesOnBoard({
    boardBuffer: mobileBuf,
    boardId: 'mobile-board',
    viewportClass: 'mobile',
    screenSpecs:
      boardDimensions.mobile.width / Math.max(boardDimensions.mobile.height, 1) > 1.4
        ? NDX_MOBILE_SCREEN_SPECS.map((s) => ({
            screenId: s.screenId,
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
          }))
        : [{ screenId: 'MOBILE_OVERVIEW', x: 0.02, y: 0.04, width: 0.96, height: 0.92 }],
  });

  const desktopScreens: LiveScreenRunResult[] = [];
  for (const frame of desktopFrames.slice(0, 6)) {
    desktopScreens.push(
      await runLiveScreen({
        projectSlug,
        screenId: frame.screenId,
        viewportClass: 'desktop',
        boardBuffer: desktopBuf,
        boardWidth: boardDimensions.desktop.width,
        boardHeight: boardDimensions.desktop.height,
        frame,
        baseUrl,
        outputDir,
        maxIterations,
      }),
    );
  }

  const mobileScreens: LiveScreenRunResult[] = [];
  for (const frame of mobileFrames.slice(0, 6)) {
    mobileScreens.push(
      await runLiveScreen({
        projectSlug,
        screenId: frame.screenId,
        viewportClass: 'mobile',
        boardBuffer: mobileBuf,
        boardWidth: boardDimensions.mobile.width,
        boardHeight: boardDimensions.mobile.height,
        frame,
        baseUrl,
        outputDir,
        maxIterations,
      }),
    );
  }

  const desktopVisualPass = desktopScreens.every(
    (s) => s.status === 'VISUAL_PASS' || s.status === 'PIXEL_PASS',
  );
  const mobileVisualPass = mobileScreens.every(
    (s) => s.status === 'VISUAL_PASS' || s.status === 'PIXEL_PASS',
  );
  const pixelPass = [...desktopScreens, ...mobileScreens].every((s) => s.status === 'PIXEL_PASS');

  const report: NdxProjectHubLiveReconstructionReport = {
    reportId: randomUUID(),
    executedAt: new Date().toISOString(),
    founderBoards,
    boardDimensions,
    desktopScreens,
    mobileScreens,
    skipRenderUsed: false,
    browser: 'playwright-chromium',
    architectureReady: true,
    actualReconstructionExecuted: true,
    desktopVisualPass,
    mobileVisualPass,
    pixelPass,
  };

  writeFileSync(join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
  return report;
}

export { NDX_DESKTOP_BOARD_REGIONS };
