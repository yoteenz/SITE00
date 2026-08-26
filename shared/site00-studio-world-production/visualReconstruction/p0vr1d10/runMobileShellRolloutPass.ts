/**
 * P0.VR.1D.10 — Mobile full-screen shell rollout live pass.
 */

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  compareRenderedReference,
  evaluatePixelMatch,
  buildVisualDifferenceMap,
  ingestScreenshotReference,
  decomposePageVisual,
  renderControlledReference,
} from '../index.js';
import { markStaleShellLocks } from '../p0vr1d9/index.js';
import {
  P0_VR_1D10_REFERENCE_PATHS,
  P0_VR_1D10_REGRESSION_SCREENS,
  P0_VR_1D10_ROUTES,
  P0_VR_1D10_ROUTE_SEARCH,
  P0_VR_1D10_TARGET_SCREENS,
  P0_VR_1D10_VIEWPORT,
  P0_VR_1D10_WAIT_SELECTORS,
} from './constants.js';
import type { MobileShellRolloutReport, MobileShellRolloutScreenReport } from './types.js';

export type RunMobileShellRolloutPassInput = {
  rootDir?: string;
  baseUrl?: string;
  outputDir?: string;
};

export async function runMobileShellRolloutPass(
  input: RunMobileShellRolloutPassInput = {},
): Promise<MobileShellRolloutReport> {
  const rootDir = input.rootDir ?? process.cwd();
  const outputDir = input.outputDir ?? join('/tmp', 'vr-p0vr1d10', randomUUID());
  mkdirSync(outputDir, { recursive: true });
  const baseUrl = input.baseUrl ?? 'http://127.0.0.1:5174';

  const targets: MobileShellRolloutScreenReport[] = [];

  for (const screenId of P0_VR_1D10_TARGET_SCREENS) {
    const referencePath = join(rootDir, P0_VR_1D10_REFERENCE_PATHS[screenId]);
    if (!existsSync(referencePath)) {
      throw new Error(`Reference missing for ${screenId}: ${referencePath}`);
    }

    const referenceBuffer = readFileSync(referencePath);
    const reference = await ingestScreenshotReference({
      sourceAsset: referencePath,
      buffer: referenceBuffer,
      forceMobileChrome: true,
    });
    const decomposition = decomposePageVisual({ reference, referenceAssetId: screenId.toUpperCase() });

    const snapshot = await renderControlledReference({
      route: P0_VR_1D10_ROUTES[screenId],
      baseUrl,
      viewport: P0_VR_1D10_VIEWPORT,
      outputDir: join(outputDir, screenId, 'renders'),
      reconstructionIteration: 1,
      blueprintVersion: 'P0.VR.1D.10',
      previewDeviceMode: 'mobile',
      routeSearch: P0_VR_1D10_ROUTE_SEARCH,
      captureDomMeasurements: true,
      waitForSelector: P0_VR_1D10_WAIT_SELECTORS[screenId],
    });

    const renderBuffer = readFileSync(snapshot.screenshotPath);
    const comparison = await compareRenderedReference({
      referenceBuffer,
      renderBuffer,
      reference,
      snapshot,
      regions: decomposition.regions,
      outputDir: join(outputDir, screenId, 'overlays'),
    });
    const pixelMatch = evaluatePixelMatch({
      referenceAssetId: screenId.toUpperCase(),
      renderAssetId: snapshot.renderId,
      comparison,
    });
    const differenceMap = buildVisualDifferenceMap({
      referenceAssetId: screenId.toUpperCase(),
      renderAssetId: snapshot.renderId,
      pixelMatch,
      heatmapPath: comparison.heatmapPath,
      regionScores: comparison.regionScores,
    });

    targets.push({
      screenId,
      referencePath,
      renderPath: snapshot.screenshotPath,
      visualScore: pixelMatch.globalAlignment,
      structuralScore: comparison.structuralSimilarity,
      domMeasurement: snapshot.domMeasurement ?? null,
      pixelMatch,
      differenceMap,
      overlayPath: comparison.heatmapPath,
    });
  }

  const regression: MobileShellRolloutReport['regression'] = [];
  for (const screenId of P0_VR_1D10_REGRESSION_SCREENS) {
    const selector =
      screenId === 'campaign-board'
        ? '[data-visual-reconstruction="mobile-campaign-board"]'
        : '[data-visual-reconstruction="mobile-lab-experiment-01"]';
    const src = readFileSync(join(rootDir, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    regression.push({ screenId, selectorPresent: src.includes(selector.slice(1, -1)) });
  }

  const staleLocksMarked = markStaleShellLocks([
    { regionId: 'ndx.overview.content-shell', status: 'MATCHED' },
    { regionId: 'ndx.content-ops.desk', status: 'MATCHED' },
  ]).filter((l) => l.status === 'STALE_AFTER_VISUAL_SHELL_REBUILD').length;

  const report: MobileShellRolloutReport = {
    reportId: randomUUID(),
    executedAt: new Date().toISOString(),
    targets,
    regression,
    staleLocksMarked,
  };

  writeFileSync(join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
  return report;
}
