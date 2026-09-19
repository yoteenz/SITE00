/**
 * Experiment 01 — stale batch generation recovery (P0.5C.2 follow-up)
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  formulateMarketingExpressionExperiment01,
  formulateMarketingExpressionExperiment01V2,
  formulateMarketingExpressionExperiment01V21,
  formulateMarketingExpressionExperiment01V22,
  formulateMarketingExpressionExperiment01V23,
  generateAllExperiment01V21ArtifactAssets,
  generateAllExperiment01V23ArtifactAssets,
  getBrandMarketingExpressionState,
  prepareBrandMarketingExpression,
  compileBrandMarketingExpression,
  resetBrandMarketingExpressionWorkers,
  isExperiment01GenerationWorkerActive,
  hasFreshExperiment01GenerationAttemptForVersion,
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
  await formulateMarketingExpressionExperiment01V22({ projectId: 'ndxbook' });
  await formulateMarketingExpressionExperiment01V23({ projectId: 'ndxbook' });
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

  it('does not reconcile fresh V2.3 GENERATING state when persisted attempt is active', async () => {
    const run = await getBrandMarketingExpressionState({ projectId: 'ndxbook' });
    const attemptId = 'vitest-v23-batch-attempt';
    const artifacts = run!.experiment01V23!.generatedArtifacts.map((artifact, index) =>
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
      status: 'EXPERIMENT_01_V23_GENERATING',
      experiment01V23: {
        ...run!.experiment01V23!,
        status: 'GENERATING',
        generatedArtifacts: artifacts,
      },
      experiment01GenerationTracking: {
        version: 'v23',
        attemptId,
        startedAt: new Date().toISOString(),
      },
    });

    expect(isExperiment01GenerationWorkerActive('ndxbook', 'v23')).toBe(false);
    const persisted = await getBrandMarketingExpressionState({ projectId: 'ndxbook' });
    expect(hasFreshExperiment01GenerationAttemptForVersion(persisted!, 'v23')).toBe(true);
    expect(persisted?.experiment01V23?.generatedArtifacts.filter((a) => a.generationStatus === 'GENERATING').length).toBe(8);
    expect(persisted?.status).toBe('EXPERIMENT_01_V23_GENERATING');
  });

  it('generateAll V2.3 dispatches all nine FAL requests in one parallel batch', async () => {
    const generated = await generateAllExperiment01V23ArtifactAssets({ projectId: 'ndxbook' });
    expect(generated.experiment01V23?.generatedArtifacts.every((a) => a.generationStatus === 'GENERATED')).toBe(true);
    expect(generated.accounting.falRequests).toBe(9);
    expect(generated.experiment01GenerationTracking).toBeNull();
  });
});
