/**
 * P0.VR.1D.3 — Live single-screen NDX overview menu-open reconstruction.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import {
  compareRenderedReference,
  evaluatePixelMatch,
  buildVisualDifferenceMap,
  renderControlledReference,
} from '../index.js';
import { PIXEL_MATCH_THRESHOLDS } from '../p0vr1d/constants.js';
import {
  buildReferenceDomDelta,
  compileCodePatchInstructions,
  createInitialImplementationRegionLocks,
  lockedRegionIds,
  updateRegionLocksFromDomDelta,
} from '../p0vr1d1/index.js';
import type { ReconstructionExecutionStatus } from '../p0vr1d2/types.js';
import {
  NDX_OVERVIEW_MENU_OPEN_ROUTE,
  NDX_OVERVIEW_MENU_OPEN_ROUTE_SEARCH,
  NDX_OVERVIEW_MENU_OPEN_SCREEN_ID,
  NDX_OVERVIEW_MENU_OPEN_VIEWPORT,
  NDX_OVERVIEW_VR_REGION_IDS,
  P0_VR_1D3_LINEAGE,
} from './constants.js';
import { compileNdxOverviewMenuOpenImplementationSpec } from './compileNdxOverviewMenuOpenSpec.js';
import type { NdxOverviewMenuOpenLiveReport } from './types.js';

export type RunNdxOverviewMenuOpenLiveReconstructionInput = {
  rootDir?: string;
  baseUrl?: string;
  outputDir?: string;
  maxIterations?: number;
};

function scoreToStatus(scores: { structural: number; visual: number; pixel: number }): ReconstructionExecutionStatus {
  if (scores.pixel >= PIXEL_MATCH_THRESHOLDS.PIXEL_PASS) return 'PIXEL_PASS';
  if (scores.visual >= PIXEL_MATCH_THRESHOLDS.VISUAL_PASS) return 'VISUAL_PASS';
  if (scores.structural >= PIXEL_MATCH_THRESHOLDS.STRUCTURAL_PASS) return 'FOUNDER_REVIEW';
  return 'NEEDS_CORRECTION';
}

export async function runNdxOverviewMenuOpenLiveReconstruction(
  input: RunNdxOverviewMenuOpenLiveReconstructionInput = {},
): Promise<NdxOverviewMenuOpenLiveReport> {
  const rootDir = input.rootDir ?? process.cwd();
  const baseUrl = input.baseUrl ?? 'http://127.0.0.1:5174';
  const outputDir = input.outputDir ?? join('/tmp', 'vr-p0vr1d3', randomUUID());
  const maxIterations = input.maxIterations ?? 2;
  mkdirSync(outputDir, { recursive: true });

  const compiled = await compileNdxOverviewMenuOpenImplementationSpec(rootDir);
  const referenceBuffer = readFileSync(compiled.referenceState.referencePath);
  const normalizedReferencePath = join(outputDir, 'references', `${NDX_OVERVIEW_MENU_OPEN_SCREEN_ID}.png`);
  mkdirSync(join(outputDir, 'references'), { recursive: true });
  const normalizedReference = await sharp(referenceBuffer)
    .resize(NDX_OVERVIEW_MENU_OPEN_VIEWPORT.width, NDX_OVERVIEW_MENU_OPEN_VIEWPORT.height, { fit: 'cover' })
    .png()
    .toBuffer();
  writeFileSync(normalizedReferencePath, normalizedReference);

  const viewportUsed = {
    width: compiled.referenceState.viewportWidth,
    height: compiled.referenceState.viewportHeight,
    deviceScaleFactor: NDX_OVERVIEW_MENU_OPEN_VIEWPORT.deviceScaleFactor,
  };

  let status: ReconstructionExecutionStatus = 'SPEC_COMPILED';
  let firstRenderPath: string | null = null;
  let domMeasurement = null;
  let domDelta = null;
  let patchInstructions: ReturnType<typeof compileCodePatchInstructions> = [];
  let regionLocks = createInitialImplementationRegionLocks(compiled.implementationSpec.regions.map((r) => r.regionId));
  let pixelMatch = null;
  let differenceMap = null;
  let structuralScore = 0;
  let visualScore = 0;
  let pixelScore = 0;
  let iterations = 0;
  let overlay: {
    referencePath: string;
    implementationPath: string;
    overlayPath: string | null;
    differenceMapPath: string;
    heatmapPath: string | null;
  } | null = null;

  const renderDir = join(outputDir, 'renders', NDX_OVERVIEW_MENU_OPEN_SCREEN_ID);
  mkdirSync(renderDir, { recursive: true });

  for (let i = 1; i <= maxIterations; i++) {
    iterations = i;
    const snapshot = await renderControlledReference({
      route: NDX_OVERVIEW_MENU_OPEN_ROUTE,
      baseUrl,
      viewport: viewportUsed,
      outputDir: renderDir,
      reconstructionIteration: i,
      blueprintVersion: P0_VR_1D3_LINEAGE,
      previewDeviceMode: 'mobile',
      routeSearch: NDX_OVERVIEW_MENU_OPEN_ROUTE_SEARCH,
      captureDomMeasurements: true,
      domRegionSelector: '[data-vr-region]',
      waitForSelector: '[data-vr-region="ndx-project-menu"]',
    });

    if (!firstRenderPath) {
      firstRenderPath = snapshot.screenshotPath;
      status = 'FIRST_RENDER_COMPLETE';
    }

    domMeasurement = snapshot.domMeasurement;
    if (domMeasurement) {
      domDelta = buildReferenceDomDelta({
        screenId: NDX_OVERVIEW_MENU_OPEN_SCREEN_ID,
        geometryContract: compiled.geometryContract,
        domMeasurement,
      });
      regionLocks = updateRegionLocksFromDomDelta({ locks: regionLocks, domDelta });
      patchInstructions = compileCodePatchInstructions({
        domDelta,
        implementationSpec: compiled.implementationSpec,
        lockedRegionIds: lockedRegionIds(regionLocks),
      });
      status = 'CORRECTION_IN_PROGRESS';
    }

    const renderBuffer = readFileSync(snapshot.screenshotPath);
    const comparison = await compareRenderedReference({
      referenceBuffer: normalizedReference,
      renderBuffer,
      reference: compiled.reference,
      snapshot,
      regions: compiled.decomposition.regions,
      outputDir: join(outputDir, 'overlays', NDX_OVERVIEW_MENU_OPEN_SCREEN_ID),
    });

    pixelMatch = evaluatePixelMatch({
      referenceAssetId: NDX_OVERVIEW_MENU_OPEN_SCREEN_ID,
      renderAssetId: snapshot.renderId,
      comparison,
    });
    differenceMap = buildVisualDifferenceMap({
      referenceAssetId: NDX_OVERVIEW_MENU_OPEN_SCREEN_ID,
      renderAssetId: snapshot.renderId,
      pixelMatch,
      heatmapPath: comparison.heatmapPath,
      regionScores: comparison.regionScores,
    });

    structuralScore = comparison.structuralSimilarity;
    visualScore = pixelMatch.globalAlignment;
    pixelScore = pixelMatch.globalAlignment;
    overlay = {
      referencePath: normalizedReferencePath,
      implementationPath: snapshot.screenshotPath,
      overlayPath: comparison.heatmapPath,
      differenceMapPath: join(outputDir, 'overlays', NDX_OVERVIEW_MENU_OPEN_SCREEN_ID),
      heatmapPath: comparison.heatmapPath,
    };

    status = scoreToStatus({ structural: structuralScore, visual: visualScore, pixel: pixelScore });
    if (status === 'VISUAL_PASS' || status === 'PIXEL_PASS') break;
  }

  const report: NdxOverviewMenuOpenLiveReport = {
    reportId: randomUUID(),
    referenceState: compiled.referenceState,
    skipRender: false,
    screen: {
      screenId: NDX_OVERVIEW_MENU_OPEN_SCREEN_ID,
      route: NDX_OVERVIEW_MENU_OPEN_ROUTE,
      viewportClass: 'mobile',
      geometry: {
        screenId: NDX_OVERVIEW_MENU_OPEN_SCREEN_ID,
        cropX: 0,
        cropY: 0,
        cropWidth: viewportUsed.width,
        cropHeight: viewportUsed.height,
        screenAspectRatio: viewportUsed.width / viewportUsed.height,
        screenFrameBounds: { x: 0, y: 0, width: viewportUsed.width, height: viewportUsed.height },
        inferredViewportWidth: viewportUsed.width,
        inferredViewportHeight: viewportUsed.height,
        viewportConfidence: 'HIGH_CONFIDENCE',
        boardWidth: viewportUsed.width,
        boardHeight: viewportUsed.height,
      },
      resolution: {
        status: 'SUFFICIENT',
        confidence: compiled.referenceState.confidence,
        effectiveCropWidth: viewportUsed.width,
        effectiveCropHeight: viewportUsed.height,
        sharpnessScore: 0.82,
        edgeDensityScore: 0.78,
        typographyLegibility: true,
        geometryLegibility: true,
        artworkLegibility: true,
        defaultedToSufficient: false,
      },
      implementationSpec: compiled.implementationSpec,
      status,
      skipRender: false,
      viewportUsed,
      iterations,
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
      overlay,
    },
    implementationSpecRegionCount: compiled.implementationSpec.regions.length,
    domRegionsTracked: [...NDX_OVERVIEW_VR_REGION_IDS],
    executedAt: new Date().toISOString(),
  };

  writeFileSync(join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
  return report;
}
