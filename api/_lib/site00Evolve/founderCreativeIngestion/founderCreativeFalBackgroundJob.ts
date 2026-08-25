/**
 * Background FAL batch for founder creative ingestion slide reconstruction.
 */

import { randomUUID } from 'node:crypto';
import type { MarketingCampaignProductionRun } from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/types.js';
import type { FounderCreativeIngestionState } from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/types.js';
import {
  applyFounderCreativeBatchFailure,
  applySlidePhotographyFalResult,
  replaceSlidePhotography,
  slideIdsEligibleForExistingAsset,
  slideIdsEligibleForFalBatch,
} from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/ingestionEngine.js';
import { dispatchPhotographyGeneration } from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/realismLabBridge.js';
import {
  enqueueFalBackgroundWork,
  FAL_BACKGROUND_RESUME_MS,
  FAL_BACKGROUND_STALE_MS,
  isFreshBackgroundAttempt,
  shouldRunFalSynchronously,
} from '../falBackgroundJob.js';
import * as campaignStore from '../marketingCampaignProduction/marketingCampaignProductionStoreAdapter.js';
import { dispatchSlidePhotographyFal } from './founderCreativeFalDispatch.js';

const activeIngestionGenerationAttempts = new Map<string, string>();

async function loadRun(projectId: string): Promise<MarketingCampaignProductionRun> {
  const run = await campaignStore.getCampaignProductionRun(projectId);
  if (!run?.founderCreativeIngestion) throw new Error('Founder creative ingestion not initialized');
  return run;
}

async function saveIngestion(
  projectId: string,
  run: MarketingCampaignProductionRun,
  ingestion: FounderCreativeIngestionState,
): Promise<MarketingCampaignProductionRun> {
  return campaignStore.saveCampaignProductionRun({
    ...run,
    founderCreativeIngestion: ingestion,
    updatedAt: new Date().toISOString(),
  });
}

function hasFreshIngestionGenerationAttempt(state: FounderCreativeIngestionState): boolean {
  const tracking = state.falGenerationTracking;
  if (!tracking || tracking.status !== 'RUNNING') return false;
  return isFreshBackgroundAttempt(tracking.startedAt, FAL_BACKGROUND_STALE_MS);
}

function withBatchTracking(
  state: FounderCreativeIngestionState,
  slideIds: string[],
  attemptId: string,
): FounderCreativeIngestionState {
  return {
    ...state,
    workflowStep: 'RECONSTRUCT',
    falGenerationTracking: {
      attemptId,
      slideIds,
      startedAt: new Date().toISOString(),
      status: 'RUNNING',
      currentSlideId: slideIds[0] ?? null,
      completedSlideIds: [],
      errorMessage: null,
    },
    updatedAt: new Date().toISOString(),
  };
}

async function executeFounderCreativeBatchWork(params: {
  projectId: string;
  attemptId: string;
  slideIds: string[];
  existingAssetSlideIds: string[];
}): Promise<void> {
  try {
    let run = await loadRun(params.projectId);
    let ingestion = run.founderCreativeIngestion!;
    if (ingestion.falGenerationTracking?.attemptId !== params.attemptId) return;
    if (activeIngestionGenerationAttempts.get(params.projectId) !== params.attemptId) return;

    for (const slideId of params.existingAssetSlideIds) {
      run = await loadRun(params.projectId);
      ingestion = run.founderCreativeIngestion!;
      if (ingestion.falGenerationTracking?.attemptId !== params.attemptId) return;

      const spec = ingestion.reconstructionSpecs.find((entry) => entry.slideId === slideId);
      if (!spec) continue;
      const assetId = spec.photography.selectedAssetId ?? spec.photography.canonicalAssetId ?? 'ndx-hq-desk-photo-canonical';
      ingestion = replaceSlidePhotography(ingestion, slideId, assetId);
      ingestion = {
        ...ingestion,
        falGenerationTracking: ingestion.falGenerationTracking
          ? {
              ...ingestion.falGenerationTracking,
              currentSlideId: slideId,
              completedSlideIds: [...ingestion.falGenerationTracking.completedSlideIds, slideId],
            }
          : null,
      };
      run = await saveIngestion(params.projectId, run, ingestion);
    }

    for (const slideId of params.slideIds) {
      run = await loadRun(params.projectId);
      ingestion = run.founderCreativeIngestion!;
      if (ingestion.falGenerationTracking?.attemptId !== params.attemptId) return;
      if (activeIngestionGenerationAttempts.get(params.projectId) !== params.attemptId) return;

      const spec = ingestion.reconstructionSpecs.find((entry) => entry.slideId === slideId);
      if (!spec) continue;

      const staged = dispatchPhotographyGeneration({
        spec,
        falConfigured: true,
        dispatchFal: true,
      });

      const result = await dispatchSlidePhotographyFal({
        projectId: params.projectId,
        spec: staged.spec,
        assetId: staged.assetId,
      });

      ingestion = applySlidePhotographyFalResult(ingestion, slideId, {
        assetId: result.assetId,
        previewUrl: result.previewUrl,
      });
      ingestion = {
        ...ingestion,
        falGenerationTracking: ingestion.falGenerationTracking
          ? {
              ...ingestion.falGenerationTracking,
              currentSlideId: slideId,
              completedSlideIds: [...ingestion.falGenerationTracking.completedSlideIds, slideId],
            }
          : null,
      };
      run = await saveIngestion(params.projectId, run, ingestion);
    }

    run = await loadRun(params.projectId);
    ingestion = run.founderCreativeIngestion!;
    if (ingestion.falGenerationTracking?.attemptId !== params.attemptId) return;

    await saveIngestion(params.projectId, run, {
      ...ingestion,
      falGenerationTracking: ingestion.falGenerationTracking
        ? {
            ...ingestion.falGenerationTracking,
            status: 'COMPLETED',
            currentSlideId: null,
            errorMessage: null,
          }
        : null,
      workflowStep: 'REVIEW',
    });
  } catch (error) {
    const run = await loadRun(params.projectId);
    const ingestion = run.founderCreativeIngestion!;
    if (ingestion.falGenerationTracking?.attemptId !== params.attemptId) return;
    await saveIngestion(
      params.projectId,
      run,
      applyFounderCreativeBatchFailure(
        ingestion,
        error instanceof Error ? error.message : 'Founder creative FAL batch failed',
      ),
    );
  } finally {
    if (activeIngestionGenerationAttempts.get(params.projectId) === params.attemptId) {
      activeIngestionGenerationAttempts.delete(params.projectId);
    }
  }
}

export async function startFounderCreativeFalBatch(params: {
  projectId: string;
  run: MarketingCampaignProductionRun;
  ingestion: FounderCreativeIngestionState;
  force?: boolean;
  slideIdsOverride?: string[];
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const falSlideIds = (params.slideIdsOverride ?? slideIdsEligibleForFalBatch(params.ingestion)).filter((slideId) => {
    const spec = params.ingestion.reconstructionSpecs.find((entry) => entry.slideId === slideId);
    return (
      spec?.photography.required &&
      (spec.photography.sourceMode === 'GENERATE_FROM_REFERENCE' ||
        spec.photography.sourceMode === 'UPLOAD_HQ')
    );
  });
  const existingAssetSlideIds = (params.slideIdsOverride ?? slideIdsEligibleForExistingAsset(params.ingestion)).filter(
    (slideId) => {
      const spec = params.ingestion.reconstructionSpecs.find((entry) => entry.slideId === slideId);
      return (
        spec?.photography.required &&
        (spec.photography.sourceMode === 'USE_EXISTING_ASSET' ||
          spec.photography.sourceMode === 'LOCK_CANONICAL')
      );
    },
  );
  const allSlideIds = [...existingAssetSlideIds, ...falSlideIds];
  if (allSlideIds.length === 0) {
    return { run: params.run, ingestion: params.ingestion };
  }

  if (!params.force) {
    if (activeIngestionGenerationAttempts.has(params.projectId)) {
      return { run: params.run, ingestion: params.ingestion };
    }
    if (hasFreshIngestionGenerationAttempt(params.ingestion)) {
      return { run: params.run, ingestion: params.ingestion };
    }
  }

  const attemptId = randomUUID();
  activeIngestionGenerationAttempts.set(params.projectId, attemptId);

  const startedIngestion = withBatchTracking(params.ingestion, allSlideIds, attemptId);
  const saved = await saveIngestion(params.projectId, params.run, startedIngestion);

  const work = executeFounderCreativeBatchWork({
    projectId: params.projectId,
    attemptId,
    slideIds: falSlideIds,
    existingAssetSlideIds,
  });

  if (shouldRunFalSynchronously()) {
    await work;
    const finalRun = await loadRun(params.projectId);
    return { run: finalRun, ingestion: finalRun.founderCreativeIngestion! };
  }

  enqueueFalBackgroundWork(work);
  return { run: saved, ingestion: startedIngestion };
}

export async function startFounderCreativeSlideFal(params: {
  projectId: string;
  run: MarketingCampaignProductionRun;
  ingestion: FounderCreativeIngestionState;
  slideId: string;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const spec = params.ingestion.reconstructionSpecs.find((entry) => entry.slideId === params.slideId);
  if (!spec) throw new Error('Slide spec not found');

  if (
    spec.photography.sourceMode === 'USE_EXISTING_ASSET' ||
    spec.photography.sourceMode === 'LOCK_CANONICAL'
  ) {
    const assetId = spec.photography.selectedAssetId ?? spec.photography.canonicalAssetId ?? 'ndx-hq-desk-photo-canonical';
    const ingestion = replaceSlidePhotography(params.ingestion, params.slideId, assetId);
    const saved = await saveIngestion(params.projectId, params.run, ingestion);
    return { run: saved, ingestion };
  }

  return startFounderCreativeFalBatch({
    projectId: params.projectId,
    run: params.run,
    ingestion: params.ingestion,
    slideIdsOverride: [params.slideId],
    force: true,
  });
}

export async function reconcileStaleFounderCreativeGeneration(
  run: MarketingCampaignProductionRun,
): Promise<MarketingCampaignProductionRun> {
  const ingestion = run.founderCreativeIngestion;
  if (!ingestion?.falGenerationTracking || ingestion.falGenerationTracking.status !== 'RUNNING') return run;
  if (activeIngestionGenerationAttempts.has(run.projectId)) return run;
  if (isFreshBackgroundAttempt(ingestion.falGenerationTracking.startedAt, FAL_BACKGROUND_STALE_MS)) return run;

  return saveIngestion(
    run.projectId,
    run,
    applyFounderCreativeBatchFailure(ingestion, 'Reconstruction timed out — tap decompose again to retry.'),
  );
}

export async function maybeResumeFounderCreativeGeneration(
  run: MarketingCampaignProductionRun,
): Promise<MarketingCampaignProductionRun> {
  const ingestion = run.founderCreativeIngestion;
  if (!ingestion?.falGenerationTracking || ingestion.falGenerationTracking.status !== 'RUNNING') return run;
  if (activeIngestionGenerationAttempts.has(run.projectId)) return run;
  if (!isFreshBackgroundAttempt(ingestion.falGenerationTracking.startedAt, FAL_BACKGROUND_STALE_MS)) return run;
  if (Date.now() - new Date(ingestion.falGenerationTracking.startedAt).getTime() < FAL_BACKGROUND_RESUME_MS) {
    return run;
  }

  const remaining = ingestion.falGenerationTracking.slideIds.filter(
    (slideId) => !ingestion.falGenerationTracking!.completedSlideIds.includes(slideId),
  );
  if (remaining.length === 0) return run;

  const { run: resumedRun, ingestion: resumedIngestion } = await startFounderCreativeFalBatch({
    projectId: run.projectId,
    run,
    ingestion,
    force: true,
  });
  return { ...resumedRun, founderCreativeIngestion: resumedIngestion };
}
