/**
 * P0.VR.1D.8 — Lab / Experiment 01 live correction pass.
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
import { buildReferenceDomRegionMap } from '../p0vr1d4/referenceDomRegionMap.js';
import { buildMappedReferenceDomDelta } from '../p0vr1d4/buildMappedReferenceDomDelta.js';
import { buildLabReferenceDetailAudit } from './referenceDetailAudit.js';
import { resolveExperiment01Artwork } from './resolveExperiment01Artwork.js';
import {
  NDX_EXPERIMENT_01_REFERENCE_PATH,
  NDX_EXPERIMENT_01_ROUTE,
  NDX_EXPERIMENT_01_ROUTE_SEARCH,
  NDX_EXPERIMENT_01_VIEWPORT,
} from './constants.js';
import type { NdxLabExperiment01CorrectionReport } from './types.js';

export type RunNdxLabExperiment01CorrectionPassInput = {
  rootDir?: string;
  baseUrl?: string;
  outputDir?: string;
  maxIterations?: number;
  executePatches?: boolean;
};

export async function runNdxLabExperiment01CorrectionPass(
  input: RunNdxLabExperiment01CorrectionPassInput = {},
): Promise<NdxLabExperiment01CorrectionReport> {
  const rootDir = input.rootDir ?? process.cwd();
  const outputDir = input.outputDir ?? join('/tmp', 'vr-p0vr1d8', randomUUID());
  mkdirSync(outputDir, { recursive: true });

  const referencePath = join(rootDir, NDX_EXPERIMENT_01_REFERENCE_PATH);
  if (!existsSync(referencePath)) {
    throw new Error(`Lab experiment 01 reference missing at ${referencePath}`);
  }

  const cardPaths = [
    'exp-card-01-subscription',
    'exp-card-02-save-time',
    'exp-card-03-apology',
    'exp-card-04-theory',
    'exp-card-05-serious',
    'exp-card-06-remember',
    'exp-card-07-stupid',
    'exp-card-08-decade',
    'exp-card-09-fair',
  ].map((id) => ({
    id,
    artworkPath: `/visual-references/founder/ndxbook/experiment-01-artwork/${id}.webp`,
  }));

  const artworkResolutions = resolveExperiment01Artwork({ projectRoot: rootDir, cards: cardPaths });

  const referenceBuffer = readFileSync(referencePath);
  const reference = await ingestScreenshotReference({
    sourceAsset: referencePath,
    buffer: referenceBuffer,
    forceMobileChrome: true,
  });
  const decomposition = decomposePageVisual({ reference, referenceAssetId: 'MOBILE_LAB_EXPERIMENT_01' });

  const baseUrl = input.baseUrl ?? 'http://127.0.0.1:5174';
  const maxIterations = input.maxIterations ?? 2;
  let structuralScore = 0;
  let visualScore = 0;
  let domMeasurement = null;
  let mappedDelta = null;
  let pixelMatch = null;
  let differenceMap = null;
  let patchesGenerated = 0;
  const patchesExecuted = 0;
  let renderPath: string | null = null;
  let overlayPath: string | null = null;
  let iterations = 0;
  let domRegionIds: string[] = [];

  for (let i = 1; i <= maxIterations; i++) {
    iterations = i;
    const snapshot = await renderControlledReference({
      route: NDX_EXPERIMENT_01_ROUTE,
      baseUrl,
      viewport: NDX_EXPERIMENT_01_VIEWPORT,
      outputDir: join(outputDir, 'renders'),
      reconstructionIteration: i,
      blueprintVersion: 'P0.VR.1D.8',
      previewDeviceMode: 'mobile',
      routeSearch: NDX_EXPERIMENT_01_ROUTE_SEARCH,
      captureDomMeasurements: true,
      waitForSelector: '[data-visual-reconstruction="mobile-lab-experiment-01"]',
    });

    renderPath = snapshot.screenshotPath;
    domMeasurement = snapshot.domMeasurement;
    domRegionIds = snapshot.domMeasurement?.measurements.map((m) => m.regionId) ?? [];

    if (domMeasurement) {
      const regionMap = buildReferenceDomRegionMap({
        screenId: 'MOBILE_LAB_EXPERIMENT_01',
        route: NDX_EXPERIMENT_01_ROUTE,
        referenceRegionIds: decomposition.regions.map((r) => r.regionId),
        domRegionIds,
      });
      mappedDelta = buildMappedReferenceDomDelta({
        screenId: 'MOBILE_LAB_EXPERIMENT_01',
        route: NDX_EXPERIMENT_01_ROUTE,
        geometryContract: {
          contractId: 'MOBILE_LAB_EXPERIMENT_01',
          referenceAssetId: 'MOBILE_LAB_EXPERIMENT_01',
          viewportClass: 'mobile',
          entries: decomposition.regions.map((r) => ({
            regionId: r.regionId,
            referenceX: r.bounds.x,
            referenceY: r.bounds.y,
            referenceWidth: r.bounds.width,
            referenceHeight: r.bounds.height,
            referenceAspectRatio: r.bounds.width / Math.max(r.bounds.height, 1),
            positionTolerancePx: 4,
            sizeTolerancePx: 4,
            rotationToleranceDeg: 0,
          })),
        },
        domMeasurement,
        regionMap,
      });
      patchesGenerated = mappedDelta.entries.length;
    }

    const renderBuffer = readFileSync(snapshot.screenshotPath);
    const comparison = await compareRenderedReference({
      referenceBuffer,
      renderBuffer,
      reference,
      snapshot,
      regions: decomposition.regions,
      outputDir: join(outputDir, 'overlays'),
    });
    overlayPath = comparison.heatmapPath;
    pixelMatch = evaluatePixelMatch({
      referenceAssetId: 'MOBILE_LAB_EXPERIMENT_01',
      renderAssetId: snapshot.renderId,
      comparison,
    });
    differenceMap = buildVisualDifferenceMap({
      referenceAssetId: 'MOBILE_LAB_EXPERIMENT_01',
      renderAssetId: snapshot.renderId,
      pixelMatch,
      heatmapPath: comparison.heatmapPath,
      regionScores: comparison.regionScores,
    });
    structuralScore = comparison.structuralSimilarity;
    visualScore = pixelMatch.globalAlignment;
  }

  const mobileSrc = readFileSync(
    join(rootDir, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'),
    'utf8',
  );
  const chromeSrc = readFileSync(
    join(rootDir, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'),
    'utf8',
  );

  const detailAudit = buildLabReferenceDetailAudit({
    projectRoot: rootDir,
    domRegionIds,
    limeDiamondPresent: chromeSrc.includes('Site00Diamond') && !chromeSrc.includes('name="origin"'),
    selectedCardBorder: mobileSrc.includes('site00-fws-mobile-lab__grid-cell--selected'),
    artworkBound: Object.fromEntries(
      cardPaths.map((c, i) => [`exp-card-0${i + 1}`, artworkResolutions.some((a) => a.cardId === c.id && a.artworkUrl)]),
    ),
  });

  const report: NdxLabExperiment01CorrectionReport = {
    reportId: randomUUID(),
    executedAt: new Date().toISOString(),
    referencePath,
    detailAudit,
    artworkResolutions,
    domMeasurement,
    mappedDelta,
    pixelMatch,
    differenceMap,
    structuralScore,
    visualScore,
    iterations,
    patchesGenerated,
    patchesExecuted,
    overlayPath,
    renderPath,
  };

  writeFileSync(join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
  return report;
}
