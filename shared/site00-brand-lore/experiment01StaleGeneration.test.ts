/**
 * Experiment 01 — stale batch generation recovery (P0.5C.2 follow-up)
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  formulateMarketingExpressionExperiment01,
  formulateMarketingExpressionExperiment01V2,
  formulateMarketingExpressionExperiment01V21,
  generateAllExperiment01V21ArtifactAssets,
  getBrandMarketingExpressionState,
  prepareBrandMarketingExpression,
  compileBrandMarketingExpression,
  resetBrandMarketingExpressionWorkers,
  isExperiment01GenerationWorkerActive,
  seedVitestNdxbookMarketingExpressionPrerequisites,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionService.js';
import {
  resetBrandMarketingExpressionMemory,
  resetBrandMarketingExpressionStoreModeCache,
  saveBrandMarketingExpressionRun,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionStoreAdapter.js';

beforeEach(async () => {
  resetBrandMarketingExpressionMemory();
  resetBrandMarketingExpressionStoreModeCache();
  resetBrandMarketingExpressionWorkers();
  await seedVitestNdxbookMarketingExpressionPrerequisites();
  await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
  await compileBrandMarketingExpression({ projectId: 'ndxbook' });
  await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
  await formulateMarketingExpressionExperiment01V2({ projectId: 'ndxbook' });
  await formulateMarketingExpressionExperiment01V21({ projectId: 'ndxbook' });
});

describe('Experiment 01 stale generation recovery', () => {
  it('reconciles stale V2.1 GENERATING state on get when no worker is active', async () => {
    const run = await getBrandMarketingExpressionState({ projectId: 'ndxbook' });
    expect(run?.experiment01V21?.generatedArtifacts.length).toBe(9);

    const artifacts = run!.experiment01V21!.generatedArtifacts.map((artifact, index) =>
      index === 0
        ? {
            ...artifact,
            generationStatus: 'GENERATED' as const,
            generatedAssetUrl: 'https://vitest.local/slide-1.png',
            generatedAssetId: 'asset-1',
          }
        : { ...artifact, generationStatus: 'GENERATING' as const },
    );

    await saveBrandMarketingExpressionRun({
      ...run!,
      status: 'EXPERIMENT_01_V21_GENERATING',
      experiment01V21: {
        ...run!.experiment01V21!,
        status: 'GENERATING',
        generatedArtifacts: artifacts,
      },
    });

    expect(isExperiment01GenerationWorkerActive('ndxbook', 'v21')).toBe(false);

    const reconciled = await getBrandMarketingExpressionState({ projectId: 'ndxbook' });
    expect(reconciled?.status).toBe('EXPERIMENT_01_V21_READY');
    expect(reconciled?.experiment01V21?.status).toBe('CONTRACTS_READY');
    expect(reconciled?.experiment01V21?.generatedArtifacts.filter((a) => a.generationStatus === 'GENERATED').length).toBe(1);
    expect(reconciled?.experiment01V21?.generatedArtifacts.filter((a) => a.generationStatus === 'NOT_GENERATED').length).toBe(8);
    expect(reconciled?.experiment01V21?.generatedArtifacts.some((a) => a.generationStatus === 'GENERATING')).toBe(false);
  });

  it('generateAll resumes remaining slides after stale partial state', async () => {
    const run = await getBrandMarketingExpressionState({ projectId: 'ndxbook' });
    const artifacts = run!.experiment01V21!.generatedArtifacts.map((artifact, index) =>
      index === 0
        ? {
            ...artifact,
            generationStatus: 'GENERATED' as const,
            generatedAssetUrl: 'https://vitest.local/slide-1.png',
            generatedAssetId: 'asset-1',
          }
        : { ...artifact, generationStatus: 'NOT_GENERATED' as const },
    );

    await saveBrandMarketingExpressionRun({
      ...run!,
      status: 'EXPERIMENT_01_V21_READY',
      experiment01V21: {
        ...run!.experiment01V21!,
        status: 'CONTRACTS_READY',
        generatedArtifacts: artifacts,
      },
    });

    const generated = await generateAllExperiment01V21ArtifactAssets({ projectId: 'ndxbook' });
    expect(generated.experiment01V21?.generatedArtifacts.every((a) => a.generationStatus === 'GENERATED')).toBe(true);
    expect(generated.accounting.falRequests).toBe(8);
  });
});
