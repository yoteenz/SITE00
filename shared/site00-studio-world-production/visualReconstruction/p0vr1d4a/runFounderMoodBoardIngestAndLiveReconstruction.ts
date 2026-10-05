/**
 * P0.VR.1D.4A — Ingest founder mood boards + execute live 6×6 reconstruction.
 * Reuses P0.VR.1D / 1D.1 / 1D.2 / 1D.4 — no new reconstruction architecture.
 */

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { persistFounderVisualBoards } from '../p0vr1d4/persistFounderVisualBoards.js';
import { runNdxProjectHubAlignedLiveReconstruction } from '../p0vr1d4/runNdxProjectHubAlignedLiveReconstruction.js';
import { mappedReferenceDomDeltaNonempty, largestMappedDelta } from '../p0vr1d4/buildMappedReferenceDomDelta.js';
import { measureScreenReferenceResolutionFromCrop } from '../p0vr1d2/measureScreenReferenceResolution.js';
import {
  cropBoardScreenReference,
  detectScreenFramesOnBoard,
} from '../p0vr1d2/inferScreenViewportFromBoardCrop.js';
import {
  FAIL_REGION_MAPPING_RUNTIME,
  FOUNDER_REFERENCE_SOURCE,
  P0_VR_1D4A_LINEAGE,
} from './constants.js';
import { buildDesktopCompositeScopeRevalidationReport } from '../p0vr1d7/runDesktopCompositeScopeRevalidation.js';
import { markInvalidHistoricalScopeComparisons } from '../p0vr1d7/markInvalidHistoricalScopeComparisons.js';
import { verifyFounderBoardCanonicalResolution, founderReferenceReady } from './verifyFounderBoardCanonicalResolution.js';
import type {
  ExtractedScreenSummary,
  FounderMoodBoardIngestLiveReport,
} from './types.js';
import type { LiveScreenRunResult } from '../p0vr1d2/types.js';

export type RunFounderMoodBoardIngestAndLiveReconstructionInput = {
  projectRoot?: string;
  projectSlug?: string;
  desktopSourcePath?: string;
  mobileSourcePath?: string;
  skipPersist?: boolean;
  baseUrl?: string;
  outputDir?: string;
  maxIterations?: number;
  executePatches?: boolean;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
};

async function evaluateBoardCrops(input: {
  boardPath: string;
  viewportClass: 'desktop' | 'mobile';
  screenSpecs: Array<{ screenId: string; x: number; y: number; width: number; height: number }>;
  outputDir: string;
}): Promise<
  Array<{
    screenId: string;
    cropPath: string;
    resolution: Awaited<ReturnType<typeof measureScreenReferenceResolutionFromCrop>>;
  }>
> {
  const boardBuffer = readFileSync(input.boardPath);
  await sharp(boardBuffer).metadata();

  const frames = await detectScreenFramesOnBoard({
    boardBuffer,
    boardId: `${input.viewportClass}-board`,
    viewportClass: input.viewportClass,
    screenSpecs: input.screenSpecs.map((s) => ({
      screenId: s.screenId,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
    })),
  });

  const results = [];
  for (const frame of frames.slice(0, 6)) {
    const cropPath = join(input.outputDir, 'crops', input.viewportClass, `${frame.screenId}.png`);
    const cropBuffer = await cropBoardScreenReference(boardBuffer, frame, cropPath);
    const resolution = await measureScreenReferenceResolutionFromCrop(cropBuffer);
    results.push({ screenId: frame.screenId, cropPath, resolution });
  }
  return results;
}

function summarizeScreen(
  screen: LiveScreenRunResult,
  cropEval: { cropPath: string; resolution: LiveScreenRunResult['resolution'] } | undefined,
  patchesExecuted: number,
): ExtractedScreenSummary {
  const domDelta = screen.domDelta;
  const mappedRegions =
    domDelta && 'mappedRegionCount' in domDelta
      ? Number((domDelta as { mappedRegionCount: number }).mappedRegionCount)
      : 0;
  const unmappedRegions =
    domDelta && 'unmappedReferenceRegions' in domDelta
      ? (() => {
          const mapped = domDelta as unknown as {
            unmappedReferenceRegions: string[];
            unmappedDomRegions: string[];
          };
          return mapped.unmappedReferenceRegions.length + mapped.unmappedDomRegions.length;
        })()
      : 0;

  const scorePct = (value: number) => (value <= 1 ? value * 100 : value);
  const visualPct = scorePct(screen.visualScore);
  const structuralPct = scorePct(screen.structuralScore);

  const visualDrift = visualPct > 0 && visualPct < 85;
  const deltaEmpty = !domDelta || !mappedReferenceDomDeltaNonempty(domDelta as import('../p0vr1d4/types.js').MappedReferenceDomDelta);
  const failRegionMappingRuntime =
    visualDrift && deltaEmpty && Boolean(screen.domMeasurement?.measurements.length);

  let blocker: string | null = null;
  if (failRegionMappingRuntime) blocker = FAIL_REGION_MAPPING_RUNTIME;
  else if (screen.status !== 'VISUAL_PASS' && screen.status !== 'PIXEL_PASS') {
    blocker = `Status ${screen.status} — visual ${visualPct.toFixed(1)}% structural ${structuralPct.toFixed(1)}%`;
  }

  return {
    screenId: screen.screenId,
    route: screen.route,
    viewportClass: screen.viewportClass,
    referenceCropPath: cropEval?.cropPath ?? screen.overlay?.referencePath ?? null,
    viewport: { width: screen.viewportUsed.width, height: screen.viewportUsed.height },
    resolution: cropEval?.resolution ?? screen.resolution,
    mappedRegions,
    unmappedRegions,
    firstStructuralScore: screen.structuralScore,
    firstVisualScore: screen.visualScore,
    patchesGenerated: screen.patchInstructions.length,
    patchesExecuted,
    iterations: screen.iterations,
    finalStructuralScore: screen.structuralScore,
    finalVisualScore: screen.visualScore,
    finalPixelScore: screen.pixelScore,
    status: screen.status,
    blocker,
    failRegionMappingRuntime,
  };
}

export async function runFounderMoodBoardIngestAndLiveReconstruction(
  input: RunFounderMoodBoardIngestAndLiveReconstructionInput = {},
): Promise<FounderMoodBoardIngestLiveReport> {
  const root = input.projectRoot ?? process.cwd();
  const projectSlug = input.projectSlug ?? 'ndxbook';
  const outputDir = input.outputDir ?? join('/tmp', 'vr-p0vr1d4a', randomUUID());
  mkdirSync(outputDir, { recursive: true });

  let actualFounderDesktopBoardPersisted = false;
  let actualFounderMobileBoardPersisted = false;

  if (!input.skipPersist && input.desktopSourcePath && input.mobileSourcePath) {
    const desktopPng = join(outputDir, 'ingest', 'desktop-source.png');
    const mobilePng = join(outputDir, 'ingest', 'mobile-source.png');
    mkdirSync(join(outputDir, 'ingest'), { recursive: true });
    await sharp(input.desktopSourcePath).png().toFile(desktopPng);
    await sharp(input.mobileSourcePath).png().toFile(mobilePng);

    await persistFounderVisualBoards({
      projectRoot: root,
      desktopSourcePath: desktopPng,
      mobileSourcePath: mobilePng,
      supabaseUrl: input.supabaseUrl,
      supabaseServiceKey: input.supabaseServiceKey,
    });
    actualFounderDesktopBoardPersisted = existsSync(join(root, 'visual-references/founder/ndxbook/desktop-mood-board.png'));
    actualFounderMobileBoardPersisted = existsSync(join(root, 'visual-references/founder/ndxbook/mobile-mood-board.png'));
  } else {
    actualFounderDesktopBoardPersisted = existsSync(join(root, 'visual-references/founder/ndxbook/desktop-mood-board.png'));
    actualFounderMobileBoardPersisted = existsSync(join(root, 'visual-references/founder/ndxbook/mobile-mood-board.png'));
  }

  const founderReferenceProof = await verifyFounderBoardCanonicalResolution({ projectRoot: root });

  if (!founderReferenceReady(founderReferenceProof)) {
    const blocked: FounderMoodBoardIngestLiveReport = {
      reportId: randomUUID(),
      executedAt: new Date().toISOString(),
      lineage: P0_VR_1D4A_LINEAGE,
      founderReferenceProof,
      desktopExtraction: {
        boardId: '',
        sourceAssetId: '',
        viewportClass: 'desktop',
        screens: [],
        extractedAt: '',
        treatedAsSingleScreen: false,
        screensAveraged: false,
      },
      mobileExtraction: {
        boardId: '',
        sourceAssetId: '',
        viewportClass: 'mobile',
        screens: [],
        extractedAt: '',
        treatedAsSingleScreen: false,
        screensAveraged: false,
      },
      desktopScreens: [],
      mobileScreens: [],
      alignedReport: null,
      scopeRevalidation: null,
      liveFixtureFallbackUsed: false,
      actualFounderDesktopBoardPersisted,
      actualFounderMobileBoardPersisted,
      reconstructionBlocked: true,
      blockReason: founderReferenceProof.blockReason,
    };
    writeFileSync(join(outputDir, 'report.json'), JSON.stringify(blocked, null, 2));
    return blocked;
  }

  const desktopPath = founderReferenceProof.desktopLocalPath!;
  const mobilePath = founderReferenceProof.mobileLocalPath!;
  const desktopMeta = await sharp(desktopPath).metadata();
  const mobileMeta = await sharp(mobilePath).metadata();

  const { ingestNdxProjectHubMoodBoards, NDX_DESKTOP_SCREEN_SPECS, NDX_MOBILE_SCREEN_SPECS } =
    await import('../../../site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.js');

  const extraction = ingestNdxProjectHubMoodBoards({
    projectSlug,
    desktopImageWidth: desktopMeta.width ?? 0,
    desktopImageHeight: desktopMeta.height ?? 0,
    mobileImageWidth: mobileMeta.width ?? 0,
    mobileImageHeight: mobileMeta.height ?? 0,
  });

  const desktopCropEvals = await evaluateBoardCrops({
    boardPath: desktopPath,
    viewportClass: 'desktop',
    screenSpecs: [...NDX_DESKTOP_SCREEN_SPECS],
    outputDir,
  });
  const mobileCropEvals = await evaluateBoardCrops({
    boardPath: mobilePath,
    viewportClass: 'mobile',
    screenSpecs: [...NDX_MOBILE_SCREEN_SPECS],
    outputDir,
  });

  const alignedReport = await runNdxProjectHubAlignedLiveReconstruction({
    projectSlug,
    projectId: projectSlug,
    baseUrl: input.baseUrl ?? 'http://127.0.0.1:5174',
    outputDir: join(outputDir, 'live'),
    allowFixtureFallback: false,
    requireFounderReference: true,
    maxIterations: input.maxIterations ?? 2,
    executePatches: input.executePatches ?? true,
  });

  const desktopScreens = alignedReport.desktopScreens.map((screen) => {
    const cropEval = desktopCropEvals.find((c) => c.screenId === screen.screenId);
    const executed = alignedReport.appliedPatches.filter((p) =>
      screen.patchInstructions.some((pi) => pi.instructionId === p.instructionId),
    ).length;
    return summarizeScreen(screen, cropEval, executed);
  });

  const mobileScreens = alignedReport.mobileScreens.map((screen) => {
    const cropEval = mobileCropEvals.find((c) => c.screenId === screen.screenId);
    const executed = alignedReport.appliedPatches.filter((p) =>
      screen.patchInstructions.some((pi) => pi.instructionId === p.instructionId),
    ).length;
    return summarizeScreen(screen, cropEval, executed);
  });

  const invalidHistorical = markInvalidHistoricalScopeComparisons([...desktopScreens, ...mobileScreens]);
  const scopeRevalidation = alignedReport
    ? buildDesktopCompositeScopeRevalidationReport({
        desktopScreens: alignedReport.desktopScreens,
        mobileScreens: alignedReport.mobileScreens,
        invalidHistoricalMarked: invalidHistorical.filter((r) => r.scopeComparisonMarker === 'INVALID_SCOPE_COMPARISON').length,
      })
    : null;

  const report: FounderMoodBoardIngestLiveReport = {
    reportId: randomUUID(),
    executedAt: new Date().toISOString(),
    lineage: P0_VR_1D4A_LINEAGE,
    founderReferenceProof,
    desktopExtraction: extraction.desktop,
    mobileExtraction: extraction.mobile,
    desktopScreens,
    mobileScreens,
    alignedReport,
    scopeRevalidation,
    liveFixtureFallbackUsed: false,
    actualFounderDesktopBoardPersisted,
    actualFounderMobileBoardPersisted,
    reconstructionBlocked: false,
    blockReason: null,
  };

  writeFileSync(join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
  return report;
}

export { FOUNDER_REFERENCE_SOURCE, FAIL_REGION_MAPPING_RUNTIME, largestMappedDelta };
