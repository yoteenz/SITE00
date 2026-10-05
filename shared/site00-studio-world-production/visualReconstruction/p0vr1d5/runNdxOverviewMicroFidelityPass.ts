/**
 * P0.VR.1D.5 — Micro-fidelity live pass (extends P0.VR.1D.3 single-screen runner).
 */

import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { runNdxOverviewMenuOpenLiveReconstruction } from '../p0vr1d3/runNdxOverviewMenuOpenLiveReconstruction.js';
import { NDX_OVERVIEW_MENU_OPEN_REFERENCE_PATH } from '../p0vr1d3/constants.js';
import { buildReferenceDetailAudit } from './referenceDetailAudit.js';
import { resolveProductionCardArtwork } from './resolveProductionCardArtwork.js';
import type { NdxOverviewMicroFidelityReport } from './types.js';

export type RunNdxOverviewMicroFidelityPassInput = {
  rootDir?: string;
  baseUrl?: string;
  outputDir?: string;
  maxIterations?: number;
  metrics?: { fromAudience: number | null };
  cardArtworkPaths?: Array<{ id: string; title: string; artworkPath: string; artworkObjectPosition: string }>;
};

export async function runNdxOverviewMicroFidelityPass(
  input: RunNdxOverviewMicroFidelityPassInput = {},
): Promise<NdxOverviewMicroFidelityReport> {
  const rootDir = input.rootDir ?? process.cwd();
  const outputDir = input.outputDir ?? join('/tmp', 'vr-p0vr1d5', randomUUID());
  mkdirSync(outputDir, { recursive: true });

  const artworkResolutions = resolveProductionCardArtwork({
    projectRoot: rootDir,
    cards:
      input.cardArtworkPaths ??
      [
        {
          id: 'subscription-normalization',
          title: 'Subscription Normalization',
          artworkPath: '/visual-references/founder/ndxbook/card-artwork/subscription-normalization.webp',
          artworkObjectPosition: 'center 42%',
        },
        {
          id: 'corporate-layoff-memo',
          title: 'Corporate Layoff Memo',
          artworkPath: '/visual-references/founder/ndxbook/card-artwork/corporate-layoff-memo.webp',
          artworkObjectPosition: 'center 35%',
        },
        {
          id: 'late-fees-across-decades',
          title: 'Late Fees Across Decades',
          artworkPath: '/visual-references/founder/ndxbook/card-artwork/late-fees-across-decades.webp',
          artworkObjectPosition: 'center 40%',
        },
      ],
  });

  const live = await runNdxOverviewMenuOpenLiveReconstruction({
    rootDir,
    baseUrl: input.baseUrl ?? 'http://127.0.0.1:5174',
    outputDir: join(outputDir, 'live'),
    maxIterations: input.maxIterations ?? 2,
  });

  const domRegions = live.domRegionsTracked;
  const detailAudit = buildReferenceDetailAudit({
    projectRoot: rootDir,
    domRegionIds: domRegions,
    metrics: input.metrics ?? { fromAudience: 1 },
    artworkBound: {
      subscription: artworkResolutions.some(
        (a) => a.cardId === 'subscription-normalization' && a.artworkUrl,
      ),
      layoff: artworkResolutions.some((a) => a.cardId === 'corporate-layoff-memo' && a.artworkUrl),
      'late-fees': artworkResolutions.some((a) => a.cardId === 'late-fees-across-decades' && a.artworkUrl),
    },
    bordersPresent: { kpi: true },
  });

  const report: NdxOverviewMicroFidelityReport = {
    reportId: randomUUID(),
    executedAt: new Date().toISOString(),
    referencePath: join(rootDir, NDX_OVERVIEW_MENU_OPEN_REFERENCE_PATH),
    detailAudit,
    artworkResolutions,
    firstVisualScore: live.screen.visualScore,
    finalVisualScore: live.screen.visualScore,
    overlayPath: live.screen.overlay?.heatmapPath ?? null,
    differenceMapPath: live.screen.differenceMap?.heatmapPath ?? null,
    remainingMismatches: detailAudit.entries
      .filter((e) => e.status !== 'MATCHED')
      .map((e) => `${e.detailId}:${e.status}`),
  };

  writeFileSync(join(outputDir, 'micro-fidelity-report.json'), JSON.stringify(report, null, 2));
  return report;
}
