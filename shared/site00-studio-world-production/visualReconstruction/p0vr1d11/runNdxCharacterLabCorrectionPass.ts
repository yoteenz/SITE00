/**
 * P0.VR.1D.11 — Character Lab live correction pass (shell + asset + overlay QA).
 */

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  compareRenderedReference,
  decomposePageVisual,
  evaluatePixelMatch,
  ingestScreenshotReference,
  renderControlledReference,
} from '../index.js';
import { buildCharacterLabVisualAssetManifest, falReconstructionCandidates } from './characterLabReferenceAssetResolver.js';
import { buildCharacterLabFullScreenImplementationSpec } from './characterLabScreenImplementationSpec.js';
import { CHARACTER_LAB_MOBILE_VISUAL_SHELL_SPEC } from './characterLabMobileVisualShellSpec.js';
import {
  NDX_CHARACTER_LAB_REFERENCE_PATH,
  NDX_CHARACTER_LAB_ROUTE,
  NDX_CHARACTER_LAB_ROUTE_SEARCH,
  NDX_CHARACTER_LAB_VIEWPORT,
  P0_VR_1D11_LINEAGE,
} from './constants.js';
import type { NdxCharacterLabCorrectionReport } from './types.js';

export type RunNdxCharacterLabCorrectionPassInput = {
  rootDir?: string;
  baseUrl?: string;
  outputDir?: string;
  maxIterations?: number;
};

export async function runNdxCharacterLabCorrectionPass(
  input: RunNdxCharacterLabCorrectionPassInput = {},
): Promise<NdxCharacterLabCorrectionReport> {
  const rootDir = input.rootDir ?? process.cwd();
  const outputDir = input.outputDir ?? join('/tmp', 'vr-p0vr1d11', randomUUID());
  mkdirSync(outputDir, { recursive: true });
  const baseUrl = input.baseUrl ?? 'http://127.0.0.1:5174';
  const maxIterations = input.maxIterations ?? 2;

  const referencePath = join(rootDir, NDX_CHARACTER_LAB_REFERENCE_PATH);
  if (!existsSync(referencePath)) {
    throw new Error(`Character Lab reference missing at ${referencePath}`);
  }

  const assetManifest = buildCharacterLabVisualAssetManifest({ projectRoot: rootDir });
  const implementationSpec = buildCharacterLabFullScreenImplementationSpec();
  const falCandidates = falReconstructionCandidates(assetManifest);

  let structuralScore = 0;
  let visualScore = 0;
  let domMeasurement = null;
  let pixelMatch = null;
  let overlayPath: string | null = null;
  let renderPath: string | null = null;
  let iterations = 0;

  for (let i = 1; i <= maxIterations; i++) {
    iterations = i;
    try {
      const snapshot = await renderControlledReference({
        route: NDX_CHARACTER_LAB_ROUTE,
        baseUrl,
        viewport: NDX_CHARACTER_LAB_VIEWPORT,
        outputDir: join(outputDir, 'renders'),
        reconstructionIteration: i,
        blueprintVersion: P0_VR_1D11_LINEAGE,
        previewDeviceMode: 'mobile',
        routeSearch: NDX_CHARACTER_LAB_ROUTE_SEARCH,
        captureDomMeasurements: true,
        waitForSelector: '[data-visual-reconstruction="mobile-character-lab"]',
      });

      renderPath = snapshot.screenshotPath;
      domMeasurement = snapshot.domMeasurement;

      const referenceBuffer = readFileSync(referencePath);
      const reference = await ingestScreenshotReference({
        sourceAsset: referencePath,
        buffer: referenceBuffer,
        forceMobileChrome: true,
      });
      const decomposition = decomposePageVisual({ reference, referenceAssetId: 'MOBILE_CHARACTER_LAB' });
      const renderBuffer = readFileSync(snapshot.screenshotPath);
      const comparison = await compareRenderedReference({
        referenceBuffer,
        renderBuffer,
        reference,
        snapshot,
        regions: decomposition.regions,
        outputDir: join(outputDir, 'overlays'),
      });
      overlayPath = comparison.heatmapPath ?? null;
      pixelMatch = evaluatePixelMatch({
        referenceAssetId: 'MOBILE_CHARACTER_LAB',
        renderAssetId: snapshot.renderId,
        comparison,
      });
      structuralScore = comparison.structuralSimilarity;
      visualScore = pixelMatch.globalAlignment;
    } catch {
      // Live render optional in CI when dev server unavailable.
    }
  }

  return {
    reportId: randomUUID(),
    executedAt: new Date().toISOString(),
    referencePath: NDX_CHARACTER_LAB_REFERENCE_PATH,
    shellSpec: CHARACTER_LAB_MOBILE_VISUAL_SHELL_SPEC,
    implementationSpec,
    assetManifest,
    domMeasurement,
    pixelMatch,
    overlayPath,
    renderPath,
    structuralScore,
    visualScore,
    iterations,
    falCandidateCount: falCandidates.length,
    falGeneratedCount: 0,
    falImageReferenceRequests: 0,
    falTextToImageRequests: 0,
  };
}
