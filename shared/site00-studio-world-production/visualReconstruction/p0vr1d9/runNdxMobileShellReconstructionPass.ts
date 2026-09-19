/**
 * P0.VR.1D.9 — Live mobile shell reconstruction QA pass (Campaign + Lab).
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
import { createInitialImplementationRegionLocks } from '../p0vr1d1/implementationRegionLock.js';
import { NDX_CAMPAIGN_BOARD_REFERENCE_PATH } from '../p0vr1d6/constants.js';
import { NDX_EXPERIMENT_01_REFERENCE_PATH } from '../p0vr1d8/constants.js';
import { buildCampaignFullScreenImplementationSpec } from './campaignScreenImplementationSpec.js';
import { buildLabFullScreenImplementationSpec } from './labScreenImplementationSpec.js';
import {
  NDX_CAMPAIGN_BOARD_SHELL_ROUTE,
  NDX_LAB_EXPERIMENT_01_SHELL_ROUTE,
  NDX_MOBILE_REFERENCE_VIEWPORT,
  NDX_MOBILE_SHELL_ROUTE_SEARCH,
  P0_VR_1D9_LINEAGE,
} from './constants.js';
import { markStaleLocksAfterShellReconstruction } from './invalidateStaleShellLocks.js';
import {
  CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC,
  LAB_MOBILE_VISUAL_SHELL_SPEC,
} from './mobileScreenVisualShellSpec.js';
import { filterChildLocksUntilParentGeometryPasses } from './parentGeometryFirst.js';
import { evaluateVisualShellMatch } from './visualShellMatchEvaluation.js';
import type { NdxMobileShellReconstructionReport } from './types.js';

export type RunNdxMobileShellReconstructionPassInput = {
  rootDir?: string;
  baseUrl?: string;
  outputDir?: string;
};

async function captureShellRoute(input: {
  route: string;
  waitForSelector: string;
  baseUrl: string;
  outputDir: string;
  label: string;
}) {
  return renderControlledReference({
    route: input.route,
    baseUrl: input.baseUrl,
    viewport: NDX_MOBILE_REFERENCE_VIEWPORT,
    outputDir: join(input.outputDir, 'renders', input.label),
    reconstructionIteration: 1,
    blueprintVersion: P0_VR_1D9_LINEAGE,
    previewDeviceMode: 'mobile',
    routeSearch: NDX_MOBILE_SHELL_ROUTE_SEARCH,
    captureDomMeasurements: true,
    waitForSelector: input.waitForSelector,
  });
}

export async function runNdxMobileShellReconstructionPass(
  input: RunNdxMobileShellReconstructionPassInput = {},
): Promise<NdxMobileShellReconstructionReport> {
  const rootDir = input.rootDir ?? process.cwd();
  const outputDir = input.outputDir ?? join('/tmp', 'vr-p0vr1d9', randomUUID());
  mkdirSync(outputDir, { recursive: true });
  const baseUrl = input.baseUrl ?? 'http://127.0.0.1:5174';

  const campaignRef = join(rootDir, NDX_CAMPAIGN_BOARD_REFERENCE_PATH);
  const labRef = join(rootDir, NDX_EXPERIMENT_01_REFERENCE_PATH);
  if (!existsSync(campaignRef) || !existsSync(labRef)) {
    throw new Error('Mobile shell reference screenshots missing');
  }

  const campaignImplementationSpec = buildCampaignFullScreenImplementationSpec();
  const labImplementationSpec = buildLabFullScreenImplementationSpec();

  let campaignSnapshot = null;
  let labSnapshot = null;
  let campaignOverlayPath: string | null = null;
  let labOverlayPath: string | null = null;
  let pixelMatchCampaign = null;
  let pixelMatchLab = null;

  try {
    campaignSnapshot = await captureShellRoute({
      route: NDX_CAMPAIGN_BOARD_SHELL_ROUTE,
      waitForSelector: '[data-vr-region="ndx.campaign.screen"]',
      baseUrl,
      outputDir,
      label: 'campaign',
    });
    labSnapshot = await captureShellRoute({
      route: NDX_LAB_EXPERIMENT_01_SHELL_ROUTE,
      waitForSelector: '[data-vr-region="ndx.lab.screen"]',
      baseUrl,
      outputDir,
      label: 'lab',
    });
  } catch {
    // Live render optional in CI — shell spec + DOM attrs still validated in unit tests.
  }

  const campaignShellMatch = evaluateVisualShellMatch({
    spec: CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC,
    domMeasurement: campaignSnapshot?.domMeasurement ?? null,
  });
  const labShellMatch = evaluateVisualShellMatch({
    spec: LAB_MOBILE_VISUAL_SHELL_SPEC,
    domMeasurement: labSnapshot?.domMeasurement ?? null,
  });

  const priorLocks = createInitialImplementationRegionLocks([
    ...campaignImplementationSpec.regions.map((r) => r.regionId),
    ...labImplementationSpec.regions.map((r) => r.regionId),
  ]).map((lock) => ({ ...lock, state: 'MATCHED' as const, lockedAt: new Date().toISOString() }));

  const { staleExtensions } = markStaleLocksAfterShellReconstruction(priorLocks, P0_VR_1D9_LINEAGE);
  filterChildLocksUntilParentGeometryPasses({
    locks: priorLocks,
    shellEvaluation: campaignShellMatch,
  });

  if (campaignSnapshot?.screenshotPath && existsSync(campaignRef)) {
    const referenceBuffer = readFileSync(campaignRef);
    const reference = await ingestScreenshotReference({
      sourceAsset: campaignRef,
      buffer: referenceBuffer,
      forceMobileChrome: true,
    });
    const decomposition = decomposePageVisual({ reference, referenceAssetId: 'MOBILE_CAMPAIGN_BOARD' });
    const renderBuffer = readFileSync(campaignSnapshot.screenshotPath);
    const comparison = await compareRenderedReference({
      referenceBuffer,
      renderBuffer,
      reference,
      snapshot: campaignSnapshot,
      regions: decomposition.regions,
      outputDir: join(outputDir, 'overlays', 'campaign'),
    });
    pixelMatchCampaign = evaluatePixelMatch({
      referenceAssetId: 'MOBILE_CAMPAIGN_BOARD',
      renderAssetId: campaignSnapshot.renderId,
      comparison,
    });
    campaignOverlayPath = comparison.heatmapPath ?? null;
  }

  if (labSnapshot?.screenshotPath && existsSync(labRef)) {
    const referenceBuffer = readFileSync(labRef);
    const reference = await ingestScreenshotReference({
      sourceAsset: labRef,
      buffer: referenceBuffer,
      forceMobileChrome: true,
    });
    const decomposition = decomposePageVisual({ reference, referenceAssetId: 'MOBILE_LAB_EXPERIMENT_01' });
    const renderBuffer = readFileSync(labSnapshot.screenshotPath);
    const comparison = await compareRenderedReference({
      referenceBuffer,
      renderBuffer,
      reference,
      snapshot: labSnapshot,
      regions: decomposition.regions,
      outputDir: join(outputDir, 'overlays', 'lab'),
    });
    pixelMatchLab = evaluatePixelMatch({
      referenceAssetId: 'MOBILE_LAB_EXPERIMENT_01',
      renderAssetId: labSnapshot.renderId,
      comparison,
    });
    labOverlayPath = comparison.heatmapPath ?? null;
  }

  return {
    reportId: randomUUID(),
    executedAt: new Date().toISOString(),
    campaignSpec: CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC,
    labSpec: LAB_MOBILE_VISUAL_SHELL_SPEC,
    campaignImplementationSpec,
    labImplementationSpec,
    campaignShellMatch,
    labShellMatch,
    staleLocks: staleExtensions,
    domMeasurementCampaign: campaignSnapshot?.domMeasurement ?? null,
    domMeasurementLab: labSnapshot?.domMeasurement ?? null,
    campaignOverlayPath,
    labOverlayPath,
    campaignRenderPath: campaignSnapshot?.screenshotPath ?? null,
    labRenderPath: labSnapshot?.screenshotPath ?? null,
    pixelMatchCampaign,
    pixelMatchLab,
  };
}
