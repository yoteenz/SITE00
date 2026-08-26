/**
 * P0.VR.1D.6 — Campaign Board live correction pass.
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
import { buildCampaignBoardReferenceDetailAudit } from './referenceDetailAudit.js';
import { resolveCampaignBoardArtwork } from './resolveCampaignBoardArtwork.js';
import {
  NDX_CAMPAIGN_BOARD_REFERENCE_PATH,
  NDX_CAMPAIGN_BOARD_ROUTE,
  NDX_CAMPAIGN_BOARD_ROUTE_SEARCH,
  NDX_CAMPAIGN_BOARD_VIEWPORT,
} from './constants.js';
import type { NdxCampaignBoardCorrectionReport } from './types.js';

export type RunNdxCampaignBoardCorrectionPassInput = {
  rootDir?: string;
  baseUrl?: string;
  outputDir?: string;
  maxIterations?: number;
  executePatches?: boolean;
};

export async function runNdxCampaignBoardCorrectionPass(
  input: RunNdxCampaignBoardCorrectionPassInput = {},
): Promise<NdxCampaignBoardCorrectionReport> {
  const rootDir = input.rootDir ?? process.cwd();
  const outputDir = input.outputDir ?? join('/tmp', 'vr-p0vr1d6', randomUUID());
  mkdirSync(outputDir, { recursive: true });

  const referencePath = join(rootDir, NDX_CAMPAIGN_BOARD_REFERENCE_PATH);
  if (!existsSync(referencePath)) {
    throw new Error(`Campaign board reference missing at ${referencePath}`);
  }

  const artworkResolutions = resolveCampaignBoardArtwork({
    projectRoot: rootDir,
    cards: [
      { id: 'pages-subscription', artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-subscription.webp' },
      { id: 'pages-theory', artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-theory.webp' },
      { id: 'pages-serious', artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-serious.webp' },
      { id: 'pages-decade', artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-decade.webp' },
      { id: 'book-in-motion', artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/book-in-motion-interesting-fair.webp' },
    ],
  });

  const referenceBuffer = readFileSync(referencePath);
  const reference = await ingestScreenshotReference({
    sourceAsset: referencePath,
    buffer: referenceBuffer,
    forceMobileChrome: true,
  });
  const decomposition = decomposePageVisual({ reference, referenceAssetId: 'MOBILE_CAMPAIGN_BOARD' });

  const baseUrl = input.baseUrl ?? 'http://127.0.0.1:5174';
  const maxIterations = input.maxIterations ?? 2;
  let structuralScore = 0;
  let visualScore = 0;
  let domMeasurement = null;
  let mappedDelta = null;
  let pixelMatch = null;
  let differenceMap = null;
  let patchesGenerated = 0;
  let patchesExecuted = 0;
  let renderPath: string | null = null;
  let overlayPath: string | null = null;
  let iterations = 0;
  let domRegionIds: string[] = [];

  for (let i = 1; i <= maxIterations; i++) {
    iterations = i;
    const snapshot = await renderControlledReference({
      route: NDX_CAMPAIGN_BOARD_ROUTE,
      baseUrl,
      viewport: NDX_CAMPAIGN_BOARD_VIEWPORT,
      outputDir: join(outputDir, 'renders'),
      reconstructionIteration: i,
      blueprintVersion: 'P0.VR.1D.6',
      previewDeviceMode: 'mobile',
      routeSearch: NDX_CAMPAIGN_BOARD_ROUTE_SEARCH,
      captureDomMeasurements: true,
      waitForSelector: '[data-visual-reconstruction="mobile-campaign-board-v1d13"]',
    });

    renderPath = snapshot.screenshotPath;
    domMeasurement = snapshot.domMeasurement;
    domRegionIds = snapshot.domMeasurement?.measurements.map((m) => m.regionId) ?? [];

    if (domMeasurement) {
      const regionMap = buildReferenceDomRegionMap({
        screenId: 'MOBILE_CAMPAIGN_BOARD',
        route: NDX_CAMPAIGN_BOARD_ROUTE,
        referenceRegionIds: decomposition.regions.map((r) => r.regionId),
        domRegionIds,
      });
      mappedDelta = buildMappedReferenceDomDelta({
        screenId: 'MOBILE_CAMPAIGN_BOARD',
        route: NDX_CAMPAIGN_BOARD_ROUTE,
        geometryContract: {
          contractId: 'MOBILE_CAMPAIGN_BOARD',
          referenceAssetId: 'MOBILE_CAMPAIGN_BOARD',
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
      referenceAssetId: 'MOBILE_CAMPAIGN_BOARD',
      renderAssetId: snapshot.renderId,
      comparison,
    });
    differenceMap = buildVisualDifferenceMap({
      referenceAssetId: 'MOBILE_CAMPAIGN_BOARD',
      renderAssetId: snapshot.renderId,
      pixelMatch,
      heatmapPath: comparison.heatmapPath,
      regionScores: comparison.regionScores,
    });
    structuralScore = comparison.structuralSimilarity;
    visualScore = pixelMatch.globalAlignment;
  }

  const chromeSrc = readFileSync(join(rootDir, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'), 'utf8');
  const detailAudit = buildCampaignBoardReferenceDetailAudit({
    projectRoot: rootDir,
    domRegionIds,
    limeDiamondPresent: chromeSrc.includes('Site00Diamond') && !chromeSrc.includes('name="origin"'),
    artworkBound: {
      'pages-subscription': artworkResolutions.some((a) => a.cardId === 'pages-subscription' && a.artworkUrl),
      'pages-layoffs': artworkResolutions.some((a) => a.cardId === 'pages-layoffs' && a.artworkUrl),
      'margins-gibl': artworkResolutions.some((a) => a.cardId === 'margins-gibl' && a.artworkUrl),
      'margins-nope': artworkResolutions.some((a) => a.cardId === 'margins-nope' && a.artworkUrl),
      'margins-pattern': artworkResolutions.some((a) => a.cardId === 'margins-pattern' && a.artworkUrl),
    },
  });

  const report: NdxCampaignBoardCorrectionReport = {
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
