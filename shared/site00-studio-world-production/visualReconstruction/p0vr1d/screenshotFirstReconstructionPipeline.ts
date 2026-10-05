/**
 * Screenshot-first reconstruction pipeline — image authority through compare/correct loop.
 */

import { randomUUID } from 'node:crypto';
import { ingestScreenshotReference } from '../ingestion/ScreenshotReferenceIngestionPipeline.js';
import { compareRenderedReference } from '../compare/RenderedReferenceComparison.js';
import { renderControlledReference } from '../render/ControlledReferenceRenderer.js';
import { lockMatchedRegions, buildVisualRegionMap } from './visualRegionMap.js';
import { decomposePageVisual } from './pageVisualDecomposition.js';
import { buildPixelGeometryContract } from './pixelGeometryContract.js';
import { buildReferenceTypographyContract } from './referenceTypographyContract.js';
import { extractFrameAuthority } from './frameAuthority.js';
import { resolveWebVisualReferenceAsset, referenceImageRequiredForReconstruction } from './resolveWebVisualReferenceAsset.js';
import {
  buildImageReferenceProviderPayload,
  createWebVisualReferenceAuthority,
  inferViewportClass,
} from './webVisualReferenceAuthority.js';
import { matchReferenceAssets } from './referenceAssetMatch.js';
import { evaluatePixelMatch } from './pixelMatchEvaluation.js';
import { buildVisualDifferenceMap, largestDriftRegions } from './visualDifferenceMap.js';
import {
  createDesktopVisualAuthority,
  createMobileVisualAuthority,
} from './desktopMobileVisualAuthority.js';
import {
  selectProviderForScreenshotReconstruction,
  textOnlyProviderBlockedAsPrimary,
} from './webReconstructionProviderRouting.js';
import { PIXEL_MATCH_THRESHOLDS } from './constants.js';
import type { WebsiteVisualWorkflowMode } from '../modes.js';
import type { ReconstructionRenderSnapshot, ScreenshotFirstReconstructionResult } from './types.js';

export type RunScreenshotFirstReconstructionInput = {
  referenceImagePath: string;
  referenceBuffer: Buffer;
  referenceAssetId: string;
  targetRoute: string;
  baseUrl: string;
  outputDir: string;
  renderSelector?: string;
  workflowMode?: WebsiteVisualWorkflowMode;
  projectAssets?: Array<{ assetId: string; regionHint?: string; url: string }>;
  maxIterations?: number;
  endpoint?: 'desktop' | 'mobile';
  skipRender?: boolean;
};

export async function runScreenshotFirstReconstructionPipeline(
  input: RunScreenshotFirstReconstructionInput,
): Promise<ScreenshotFirstReconstructionResult> {
  const workflowMode = input.workflowMode ?? 'WEBSITE_RECONSTRUCTION';
  const maxIterations = input.maxIterations ?? 3;

  const resolved = resolveWebVisualReferenceAsset({
    assetId: input.referenceAssetId,
    sourceType: 'APPROVED_SCREENSHOT',
    source: input.referenceImagePath,
  });
  if (!referenceImageRequiredForReconstruction(resolved)) {
    throw new Error('FAIL_REFERENCE_NOT_USED_AS_IMAGE_AUTHORITY');
  }

  const reference = await ingestScreenshotReference({
    sourceAsset: input.referenceImagePath,
    buffer: input.referenceBuffer,
    forceMobileChrome: input.endpoint === 'mobile' || resolved.width < 768,
  });

  const authority = createWebVisualReferenceAuthority({
    asset: resolved,
    reference,
    sourceType: 'APPROVED_SCREENSHOT',
    workflowMode,
    responsiveMode: 'REFERENCE_LOCKED',
  });

  if (input.endpoint === 'desktop') createDesktopVisualAuthority(authority);
  if (input.endpoint === 'mobile') createMobileVisualAuthority(authority);

  const decomposition = decomposePageVisual({
    reference,
    referenceAssetId: resolved.assetId,
  });
  const regionMap = buildVisualRegionMap(decomposition);
  const geometryContract = buildPixelGeometryContract({
    decomposition,
    viewportClass: inferViewportClass(resolved.width, resolved.height),
  });
  const typographyContract = buildReferenceTypographyContract(decomposition);
  const frameAuthority = extractFrameAuthority(decomposition);
  const assetMatches = matchReferenceAssets({
    decomposition,
    projectAssets: input.projectAssets ?? [],
  });

  const provider = selectProviderForScreenshotReconstruction();
  if (provider && textOnlyProviderBlockedAsPrimary(provider, workflowMode)) {
    throw new Error('TEXT_ONLY provider cannot be primary for screenshot reconstruction');
  }

  const imagePayload = buildImageReferenceProviderPayload(authority);
  if (!imagePayload.visionInput || !imagePayload.referenceImageUrl) {
    throw new Error('FAIL_REFERENCE_NOT_USED_AS_IMAGE_AUTHORITY');
  }

  const snapshots: ReconstructionRenderSnapshot[] = [];
  let pixelMatch = null;
  let differenceMap = null;
  let lockedMap = regionMap;
  let iterations = 0;

  for (let i = 1; i <= maxIterations; i++) {
    iterations = i;
    if (input.skipRender) break;

    const snapshot = await renderControlledReference({
      route: input.targetRoute,
      baseUrl: input.baseUrl,
      viewport: {
        width: authority.viewportWidth,
        height: authority.viewportHeight,
        deviceScaleFactor: 2,
      },
      outputDir: input.outputDir,
      reconstructionIteration: i,
      blueprintVersion: decomposition.decompositionId,
      selector: input.renderSelector,
    });

    snapshots.push({
      snapshotId: randomUUID(),
      route: input.targetRoute,
      viewport: {
        width: authority.viewportWidth,
        height: authority.viewportHeight,
        class: authority.viewportClass,
      },
      renderAssetId: snapshot.renderId,
      referenceAssetId: resolved.assetId,
      iteration: i,
      screenshotPath: snapshot.screenshotPath,
      timestamp: new Date().toISOString(),
    });

    const comparison = await compareRenderedReference({
      referenceBuffer: input.referenceBuffer,
      renderBuffer: await import('node:fs').then((fs) => fs.promises.readFile(snapshot.screenshotPath)),
      reference,
      snapshot,
      regions: decomposition.regions,
      outputDir: input.outputDir,
    });

    pixelMatch = evaluatePixelMatch({
      referenceAssetId: resolved.assetId,
      renderAssetId: snapshot.renderId,
      comparison,
    });

    differenceMap = buildVisualDifferenceMap({
      referenceAssetId: resolved.assetId,
      renderAssetId: snapshot.renderId,
      pixelMatch,
      heatmapPath: comparison.heatmapPath,
      regionScores: comparison.regionScores,
    });

    const matched = comparison.regionScores
      .filter((r) => r.structuralSimilarity >= PIXEL_MATCH_THRESHOLDS.VISUAL_PASS)
      .map((r) => r.regionId);
    lockedMap = lockMatchedRegions(lockedMap, matched);

    if (pixelMatch.tier === 'PIXEL_PASS' || pixelMatch.tier === 'VISUAL_PASS') break;

    const drift = largestDriftRegions(differenceMap, 1);
    if (!drift.length) break;
  }

  return {
    workflowMode,
    authority,
    decomposition,
    regionMap: lockedMap,
    geometryContract,
    typographyContract,
    frameAuthority,
    assetMatches,
    iterations,
    snapshots,
    pixelMatch,
    differenceMap,
    providerCapability: provider?.capability ?? 'REFERENCE_SUPPORTED',
    codedImplementation: true,
    flattenedScreenshotFallback: false,
  };
}

/** Founder overlay question helper */
export function referenceImplementationAligned(pixelMatch: { globalAlignment: number } | null): boolean {
  if (!pixelMatch) return false;
  return pixelMatch.globalAlignment >= PIXEL_MATCH_THRESHOLDS.VISUAL_PASS;
}
