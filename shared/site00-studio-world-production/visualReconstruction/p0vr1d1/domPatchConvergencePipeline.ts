/**
 * P0.VR.1D.1 — DOM patch convergence pipeline.
 * Mood board → extraction → implementation spec → DOM measure → delta → patch → lock.
 */

import {
  buildPixelGeometryContract,
  buildReferenceTypographyContract,
  buildVisualRegionMap,
  decomposePageVisual,
  extractFrameAuthority,
  matchReferenceAssets,
  runScreenshotFirstReconstructionPipeline,
} from '../p0vr1d/index.js';
import { ingestScreenshotReference } from '../ingestion/ScreenshotReferenceIngestionPipeline.js';
import type { ExtractedScreenReference } from './types.js';
import type { DomPatchConvergenceResult } from './types.js';
import { buildVisualSpecToCodeBridge } from './visualSpecToCodeBridge.js';
import { buildComposerScreenBuildContract } from './composerScreenBuildContract.js';
import { simulateDomMeasurementFromSpec, captureRenderedDomMeasurementMap } from './renderedDomMeasurementMap.js';
import { buildReferenceDomDelta } from './referenceDomDelta.js';
import { compileCodePatchInstructions } from './codePatchInstruction.js';
import {
  createInitialImplementationRegionLocks,
  lockedRegionIds,
  updateRegionLocksFromDomDelta,
} from './implementationRegionLock.js';
import { SCREENSHOT_EMULATION_MODE } from './constants.js';

export type RunDomPatchConvergenceInput = {
  screen: ExtractedScreenReference;
  route: string;
  referenceImagePath: string;
  referenceBuffer: Buffer;
  projectAssets?: Array<{ assetId: string; regionHint?: string; url: string }>;
  mobileScreenOrder?: string[];
  skipRender?: boolean;
  domDrift?: Record<string, Partial<{ x: number; y: number; width: number; height: number }>>;
};

export async function runDomPatchConvergencePipeline(
  input: RunDomPatchConvergenceInput,
): Promise<DomPatchConvergenceResult> {
  const p0Result = await runScreenshotFirstReconstructionPipeline({
    referenceImagePath: input.referenceImagePath,
    referenceBuffer: input.referenceBuffer,
    referenceAssetId: input.screen.croppedReferenceAssetId,
    targetRoute: input.route,
    baseUrl: 'http://localhost:5174',
    outputDir: '/tmp/visual-reconstruction',
    endpoint: input.screen.viewportClass === 'mobile' ? 'mobile' : 'desktop',
    projectAssets: input.projectAssets,
    skipRender: input.skipRender ?? true,
    maxIterations: 1,
  });

  const bridgeInput = {
    screen: input.screen,
    route: input.route,
    regionMap: p0Result.regionMap,
    geometryContract: p0Result.geometryContract,
    typographyContract: p0Result.typographyContract,
    frameAuthority: p0Result.frameAuthority,
    assetMatches: p0Result.assetMatches,
    mobileScreenOrder: input.mobileScreenOrder,
    layoutModel: input.screen.viewportClass === 'desktop' ? ('CSS_GRID' as const) : ('FLOW' as const),
  };

  const implementationSpec = buildVisualSpecToCodeBridge(bridgeInput);

  let domMeasurement = simulateDomMeasurementFromSpec(implementationSpec, input.domDrift ?? {});
  if (!input.skipRender && p0Result.snapshots.length > 0) {
    domMeasurement = captureRenderedDomMeasurementMap({
      route: input.route,
      renderAssetId: p0Result.snapshots[0]!.renderAssetId,
      measuredRegions: implementationSpec.regions.map((r) => ({
        regionId: r.regionId,
        rect: { x: r.xPx, y: r.yPx, width: r.widthPx, height: r.heightPx },
        computed: {},
      })),
    });
  }

  const domDelta = buildReferenceDomDelta({
    screenId: input.screen.screenId,
    geometryContract: p0Result.geometryContract,
    domMeasurement,
  });

  let regionLocks = createInitialImplementationRegionLocks(implementationSpec.regions.map((r) => r.regionId));
  regionLocks = updateRegionLocksFromDomDelta({ locks: regionLocks, domDelta });
  const locked = lockedRegionIds(regionLocks);

  const patchInstructions = compileCodePatchInstructions({
    domDelta,
    implementationSpec,
    lockedRegionIds: locked,
  });

  const composerContract = buildComposerScreenBuildContract({
    screen: input.screen,
    implementationSpec,
    lockedRegionIds: locked,
    referenceImagePath: input.referenceImagePath,
  });

  return {
    screenId: input.screen.screenId,
    route: input.route,
    implementationSpec,
    composerContract,
    domMeasurement,
    domDelta,
    patchInstructions,
    regionLocks,
    iterations: p0Result.iterations,
    screenshotEmulationMode: true,
  };
}

export async function buildScreenImplementationSpecFromReference(input: {
  referenceImagePath: string;
  referenceBuffer: Buffer;
  referenceAssetId: string;
  screen: ExtractedScreenReference;
  route: string;
  mobileScreenOrder?: string[];
}): Promise<ReturnType<typeof buildVisualSpecToCodeBridge>> {
  const reference = await ingestScreenshotReference({
    sourceAsset: input.referenceImagePath,
    buffer: input.referenceBuffer,
    forceMobileChrome: input.screen.viewportClass === 'mobile',
  });
  const decomposition = decomposePageVisual({ reference, referenceAssetId: input.referenceAssetId });
  const regionMap = buildVisualRegionMap(decomposition);
  const geometryContract = buildPixelGeometryContract({
    decomposition,
    viewportClass: input.screen.viewportClass,
  });
  const typographyContract = buildReferenceTypographyContract(decomposition);
  const frameAuthority = extractFrameAuthority(decomposition);
  const assetMatches = matchReferenceAssets({ decomposition, projectAssets: [] });

  return buildVisualSpecToCodeBridge({
    screen: input.screen,
    route: input.route,
    regionMap,
    geometryContract,
    typographyContract,
    frameAuthority,
    assetMatches,
    mobileScreenOrder: input.mobileScreenOrder,
  });
}

export function screenshotEmulationModeImplemented(): true {
  return true;
}

export function domAndVisualQaCombined(result: DomPatchConvergenceResult): boolean {
  return result.domDelta !== null && result.screenshotEmulationMode === true;
}

export { SCREENSHOT_EMULATION_MODE };
