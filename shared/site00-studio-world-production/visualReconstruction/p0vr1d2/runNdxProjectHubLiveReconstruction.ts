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
  buildVisualDifferenceMap,
} from '../index.js';
import { PIXEL_MATCH_THRESHOLDS } from '../p0vr1d/constants.js';
import {
  buildVisualSpecToCodeBridge,
  createInitialImplementationRegionLocks,
  lockedRegionIds,
} from '../p0vr1d1/index.js';
import { buildMappedReferenceDomDelta,
} from '../p0vr1d4/buildMappedReferenceDomDelta.js';
import { buildScopedReferenceDomRegionMap } from '../p0vr1d7/scopedReferenceDomRegionMap.js';
import {
  classifyVisualReferenceScope,
} from '../p0vr1d7/classifyVisualReferenceScope.js';
import {
  buildScopedImplementationSpec,
  scopeVisualScoreLabel,
} from '../p0vr1d7/scopedImplementationSpec.js';
import {
  captureScopedRenderSnapshot,
  resolveScopedRenderSearch,
} from '../p0vr1d7/captureScopedRenderSnapshot.js';
import {
  compareScopedPixelMatch,
} from '../p0vr1d7/scopedPixelComparison.js';
import {
  normalizeScopedDomMeasurements,
} from '../p0vr1d7/scopedDomMeasurement.js';
import { compileActionableCodePatches } from '../p0vr1d4/compileActionableCodePatches.js';
import { applyCodePatchInstructions } from '../p0vr1d4/applyCodePatchInstructions.js';
import { updateRegionLocksFromMappedDomDelta } from '../p0vr1d4/implementationRegionLockAligned.js';
import { canonicalRegionIdsForScreen } from '../p0vr1d4/normalizeReferenceRegionId.js';
import {
  NDX_DESKTOP_SCREEN_SPECS,
  NDX_MOBILE_SCREEN_SPECS,
  NDX_DESKTOP_BOARD_REGIONS,
} from '../../../site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.js';
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
  requireFounderReference?: boolean;
  maxIterations?: number;
  executePatches?: boolean;
};

function routeForScreen(projectSlug: string, screenId: string, viewportClass: 'desktop' | 'mobile'): string {
  const specs = viewportClass === 'desktop' ? NDX_DESKTOP_SCREEN_SPECS : NDX_MOBILE_SCREEN_SPECS;
  const spec = specs.find((s) => s.screenId === screenId);
  return `/projects/${projectSlug}${spec?.routeSuffix ?? ''}`;
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
  executePatches: boolean;
}): Promise<LiveScreenRunResult> {
  const legacyRoute = routeForScreen(input.projectSlug, input.screenId, input.viewportClass);
  const scopeAuthority = classifyVisualReferenceScope({
    screenId: input.screenId,
    viewportClass: input.viewportClass,
    cropWidth: input.frame.width,
    cropHeight: input.frame.height,
    boardWidth: input.boardWidth,
    boardHeight: input.boardHeight,
    route: legacyRoute,
    projectSlug: input.projectSlug,
    hasDeviceFrame: input.viewportClass === 'mobile',
    hasGlobalNavigation: input.screenId === 'DESKTOP_COMPOSITE_OVERVIEW',
  });
  const route = scopeAuthority.route;
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
      scopeAuthority.comparisonMode === 'SCOPED_REGION'
        ? { width: input.frame.width, height: input.frame.height }
        : input.viewportClass === 'mobile'
          ? { width: 390, height: 844 }
          : { width: 1440, height: 900 },
  });

  const reference = await ingestScreenshotReference({
    sourceAsset: cropPath,
    buffer: cropBuffer,
    forceMobileChrome: input.viewportClass === 'mobile',
  });
  const decomposition = decomposePageVisual({ reference, referenceAssetId: input.screenId });
  const visualRegionMap = buildVisualRegionMap(decomposition);
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
    regionMap: visualRegionMap,
    geometryContract,
    typographyContract,
    frameAuthority,
    assetMatches,
    layoutModel: input.viewportClass === 'desktop' ? 'CSS_GRID' : 'FLOW',
  });
  const scopedImplementationSpec = buildScopedImplementationSpec(implementationSpec, scopeAuthority);

  const viewportUsed = {
    width: geometry.inferredViewportWidth,
    height: geometry.inferredViewportHeight,
    deviceScaleFactor: input.viewportClass === 'mobile' ? 2 : 1,
  };

  let status: ReconstructionExecutionStatus = 'SPEC_COMPILED';
  let firstRenderPath: string | null = null;
  let domMeasurement = null;
  let domDelta = null;
  let patchInstructions: ReturnType<typeof compileActionableCodePatches> = [];
  let domRegionMap = null;
  let regionLocks = createInitialImplementationRegionLocks(
    canonicalRegionIdsForScreen(input.screenId),
  );
  let pixelMatch = null;
  let differenceMap = null;
  let structuralScore = 0;
  let visualScore = 0;
  let pixelScore = 0;
  let iterations = 0;
  let overlay: LiveScreenRunResult['overlay'] = null;

  let scopeComparisonMarker: string = 'VALID_SCOPE_COMPARISON';
  let invalidScopeComparison = false;

  const renderDir = join(input.outputDir, 'renders', input.screenId);
  mkdirSync(renderDir, { recursive: true });

  for (let i = 1; i <= input.maxIterations; i++) {
    iterations = i;
    const scopedCapture = await captureScopedRenderSnapshot({
      route,
      baseUrl: input.baseUrl,
      scopeAuthority,
      outputDir: renderDir,
      reconstructionIteration: i,
      previewDeviceMode: input.viewportClass === 'mobile' ? 'mobile' : 'desktop',
      routeSearch: resolveScopedRenderSearch(scopeAuthority, input.viewportClass === 'mobile' ? 'mobile' : 'desktop'),
    });

    const snapshot = {
      renderId: scopedCapture.renderId,
      route,
      viewport: viewportUsed,
      timestamp: new Date().toISOString(),
      commit: null,
      screenshotPath: scopedCapture.snapshotPath,
      reconstructionIteration: i,
      blueprintVersion: 'P0.VR.1D.7',
      domMeasurement: scopedCapture.domMeasurement,
      finalUrl: scopedCapture.finalUrl,
    };

    if (!firstRenderPath) {
      firstRenderPath = scopedCapture.snapshotPath;
      status = 'FIRST_RENDER_COMPLETE';
    }

    domMeasurement = scopedCapture.domMeasurement
      ? normalizeScopedDomMeasurements(scopedCapture.domMeasurement, scopedCapture.scopeRootRect, scopeAuthority)
      : null;
    if (domMeasurement) {
      domRegionMap = buildScopedReferenceDomRegionMap({
        scopeAuthority,
        referenceRegionIds: geometryContract.entries.map((e) => e.regionId),
        domRegionIds: domMeasurement.measurements.map((m) => m.regionId),
      });
      invalidScopeComparison = domRegionMap.invalidScopeComparison;
      domDelta = buildMappedReferenceDomDelta({
        screenId: input.screenId,
        route,
        geometryContract,
        domMeasurement,
        regionMap: domRegionMap,
      });
      const lockResult = updateRegionLocksFromMappedDomDelta({
        locks: regionLocks,
        mappedDelta: domDelta,
        regionMap: domRegionMap,
      });
      regionLocks = lockResult.locks;
      patchInstructions = compileActionableCodePatches({
        mappedDelta: domDelta,
        implementationSpec,
        lockedRegionIds: lockedRegionIds(regionLocks),
      });
      if (input.executePatches && patchInstructions.length > 0) {
        applyCodePatchInstructions({
          patches: patchInstructions,
          dryRun: false,
        });
      }
      status = 'CORRECTION_IN_PROGRESS';
    }

    const renderBuffer = readFileSync(scopedCapture.snapshotPath);
    const scopedCompare = await compareScopedPixelMatch({
      referenceBuffer: cropBuffer,
      renderBuffer,
      reference,
      scopeAuthority,
      comparedRoute: legacyRoute,
      outputDir: join(input.outputDir, 'overlays', input.screenId),
      regions: decomposition.regions,
    });
    scopeComparisonMarker = scopedCompare.scopeComparisonMarker;
    invalidScopeComparison = invalidScopeComparison || !scopedCompare.scopeComparisonValid;

    pixelMatch = scopedCompare.pixelMatch;
    differenceMap = buildVisualDifferenceMap({
      referenceAssetId: input.screenId,
      renderAssetId: snapshot.renderId,
      pixelMatch: scopedCompare.pixelMatch,
      heatmapPath: scopedCompare.comparison.heatmapPath,
      regionScores: scopedCompare.comparison.regionScores,
    });

    structuralScore = scopedCompare.comparison.structuralSimilarity;
    visualScore = scopedCompare.pixelMatch.globalAlignment;
    pixelScore = scopedCompare.pixelMatch.globalAlignment;
    overlay = {
      referencePath: cropPath,
      implementationPath: scopedCapture.snapshotPath,
      overlayPath: scopedCompare.comparison.heatmapPath,
      differenceMapPath: join(input.outputDir, 'overlays', input.screenId),
      heatmapPath: scopedCompare.comparison.heatmapPath,
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
    scopeAuthority,
    scopedImplementationSpec,
    scopeVisualScoreLabel: scopeVisualScoreLabel(scopeAuthority),
    invalidScopeComparison,
    scopeComparisonMarker,
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
    requireFounderReference: input.requireFounderReference ?? !input.allowFixtureFallback,
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
        executePatches: input.executePatches ?? false,
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
        executePatches: input.executePatches ?? false,
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
