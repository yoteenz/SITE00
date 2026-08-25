/**
 * P0.5E.4C — Character visual casting service (founder-triggered still generation).
 */

import {
  applyCastingJudgment,
  createCastingMergeRequest,
  generateCastingRoundPlaceholders,
  generateFinalIdentityConfirmationRound,
  generateNextCastingRoundFromFeedback,
  lockFinalVisualIdentity,
  planInitialCastingRound,
  prepareCastingRoundForFalRetry,
} from '../../../../shared/site00-studio-world-production/characterVisualCasting/castingEngine.js';
import type { CastingPrimaryJudgment, MergeTraitOption } from '../../../../shared/site00-studio-world-production/characterVisualCasting/types.js';
import { createNewTruthVersionOnReopenCalibration } from '../../../../shared/site00-studio-world-production/characterVisualCasting/promoteRecognition.js';
import type { NdxFounderCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';
import { isNeuralProviderConfigured } from '../founderCharacterDiscovery/neuralVoiceGenerationService.js';
import * as discoveryStore from '../founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';
import { getFounderCharacterDiscoveryState } from '../founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import {
  maybeResumeCastingGeneration,
  reconcileStaleCastingGeneration,
  startCastingRoundFalBackgroundJob,
} from './castingFalBackgroundJob.js';
import { getSite00AssetPublicUrl } from '../../site00Assts/storage.js';

function falConfigured(): boolean {
  return isNeuralProviderConfigured();
}

async function loadRun(projectId: string): Promise<NdxFounderCharacterDiscoveryRun> {
  const run = await getFounderCharacterDiscoveryState({ projectId });
  if (!run) throw new Error('Founder character discovery room not initialized');
  return run;
}

async function save(run: NdxFounderCharacterDiscoveryRun): Promise<NdxFounderCharacterDiscoveryRun> {
  return discoveryStore.saveFounderCharacterDiscoveryRun(run);
}

async function hydrateCastingRun(projectId: string): Promise<NdxFounderCharacterDiscoveryRun> {
  let run = await loadRun(projectId);
  run = await reconcileStaleCastingGeneration(run);
  run = await maybeResumeCastingGeneration(run);
  return run;
}

async function dispatchCastingRoundInBackground(params: {
  projectId: string;
  run: NdxFounderCharacterDiscoveryRun;
  roundId: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const saved = await save(params.run);
  return startCastingRoundFalBackgroundJob({
    projectId: params.projectId,
    run: saved,
    roundId: params.roundId,
  });
}

export async function getVisualCastingState(params: { projectId: string }) {
  const run = await hydrateCastingRun(params.projectId);
  return {
    run,
    visualCastingState: run.visualCastingState ?? null,
    redirectToCasting: Boolean(run.visualCastingState?.visualCastingReady),
    background: Boolean(
      run.visualCastingState?.falGenerationTracking?.status === 'RUNNING' &&
        process.env.VITEST !== 'true',
    ),
  };
}

export async function estimateVisualCastingRound(params: { projectId: string }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { estimate } = planInitialCastingRound({ state: run.visualCastingState, falConfigured: falConfigured() });
  return { run, estimate };
}

export async function generateVisualCastingRound(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState?.visualCastingReady) throw new Error('Visual casting not ready');
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = generateCastingRoundPlaceholders({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({
      projectId: params.projectId,
      run: { ...run, visualCastingState },
      roundId,
    });
  }
  return save({ ...run, visualCastingState });
}

export async function saveVisualCastingJudgment(params: {
  projectId: string;
  candidateId: string;
  judgment: CastingPrimaryJudgment;
  note?: string;
}) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  let visualCastingState = applyCastingJudgment({
    state: run.visualCastingState,
    candidateId: params.candidateId,
    judgment: params.judgment,
    note: params.note,
  });
  if (params.judgment === 'THATS_HER') {
    visualCastingState = generateFinalIdentityConfirmationRound(visualCastingState);
  }
  return save({ ...run, visualCastingState });
}

export async function createVisualCastingMerge(params: {
  projectId: string;
  candidateIds: string[];
  retainFromEach: Partial<Record<string, MergeTraitOption[]>>;
}) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const visualCastingState = createCastingMergeRequest({
    state: run.visualCastingState,
    candidateIds: params.candidateIds,
    retainFromEach: params.retainFromEach,
  });
  return save({ ...run, visualCastingState });
}

export async function generateNextVisualCastingRound(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = generateNextCastingRoundFromFeedback({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({
      projectId: params.projectId,
      run: { ...run, visualCastingState },
      roundId,
    });
  }
  return save({ ...run, visualCastingState });
}

export async function retryVisualCastingRoundFal(params: { projectId: string; roundId?: string }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  if (!falConfigured()) throw new Error('FAL_KEY not configured on server');

  const roundId = params.roundId ?? run.visualCastingState.rounds.at(-1)?.roundId;
  if (!roundId) throw new Error('No casting round to retry');

  const roundCandidates = run.visualCastingState.candidates.filter((entry) => entry.roundId === roundId);
  const needsRetry = roundCandidates.every(
    (entry) => !entry.previewUrl || entry.previewUrl.includes('/api/placeholder/'),
  );
  if (!needsRetry) throw new Error('Latest round already has generated stills');

  const visualCastingState = prepareCastingRoundForFalRetry({
    state: run.visualCastingState,
    roundId,
    falConfigured: falConfigured(),
  });
  return dispatchCastingRoundInBackground({
    projectId: params.projectId,
    run: { ...run, visualCastingState },
    roundId,
  });
}

export async function lockVisualIdentity(params: { projectId: string }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const visualCastingState = lockFinalVisualIdentity(run.visualCastingState);
  return save({ ...run, visualCastingState });
}

export async function reopenCharacterCalibration(params: { projectId: string }) {
  const run = await loadRun(params.projectId);
  return save(createNewTruthVersionOnReopenCalibration({ run }));
}

export async function uploadFounderCastingReference(params: {
  projectId: string;
  imageData: string;
  role: import('../../../../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js').FounderCastingReferenceRole;
  label?: string | null;
}) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState?.visualCastingReady) throw new Error('Visual casting not ready');

  const { randomUUID } = await import('node:crypto');
  const referenceId = randomUUID();
  const { uploadCastingReferenceImage } = await import('./castingReferenceUpload.js');
  const { previewUrl, storagePath } = await uploadCastingReferenceImage({
    projectId: params.projectId,
    referenceId,
    imageData: params.imageData,
  });

  const {
    uploadFounderCastingReference: registerReference,
    decomposeFounderCastingReference,
  } = await import('../../../../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js');

  let visualCastingState = registerReference(run.visualCastingState, {
    previewUrl,
    storagePath,
    role: params.role,
    label: params.label,
  });
  visualCastingState = decomposeFounderCastingReference(
    visualCastingState,
    visualCastingState.founderReferences.at(-1)!.referenceId,
  );

  return save({ ...run, visualCastingState });
}

export async function storeFounderCastingReferenceInBible(params: {
  projectId: string;
  referenceId: string;
}) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const reference = run.visualCastingState.founderReferences?.find(
    (entry) => entry.referenceId === params.referenceId,
  );
  if (!reference) throw new Error('Founder casting reference not found');

  const { ingestFounderCastingReferenceToContinuity } = await import(
    '../characterContinuity/characterContinuityService.js'
  );
  const { receiptId } = await ingestFounderCastingReferenceToContinuity({
    projectId: params.projectId,
    reference,
  });

  const { storeFounderCastingReferenceInBible: markStored } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js'
  );
  const visualCastingState = markStored(run.visualCastingState, params.referenceId, receiptId);
  return save({ ...run, visualCastingState });
}

export async function regenerateCastingFromFounderReferences(params: {
  projectId: string;
  dispatchFal?: boolean;
}) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { hasFounderReferencesReadyForRegeneration } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js'
  );
  if (!hasFounderReferencesReadyForRegeneration(run.visualCastingState)) {
    throw new Error('Upload and decompose a Full Look reference first');
  }
  return generateCharacterBibleFromReference({
    projectId: params.projectId,
    dispatchFal: params.dispatchFal,
  });
}

export async function generateCharacterBibleFromReference(params: {
  projectId: string;
  dispatchFal?: boolean;
}) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { generateCharacterBibleAssetPackRound } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/referenceDrivenCasting.js'
  );
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = generateCharacterBibleAssetPackRound({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({
      projectId: params.projectId,
      run: { ...run, visualCastingState },
      roundId,
    });
  }
  return save({ ...run, visualCastingState });
}

export async function approveCharacterBibleAssetPack(params: { projectId: string }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { approveCharacterBibleAssetPack: approvePack } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/referenceDrivenCasting.js'
  );
  const visualCastingState = approvePack(run.visualCastingState);
  return save({ ...run, visualCastingState });
}

export async function updateCharacterBibleAssetLock(params: {
  projectId: string;
  lock: 'faceLocked' | 'wardrobeLocked' | 'environmentLocked';
  value: boolean;
}) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { updateCharacterBibleLockState } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/referenceDrivenCasting.js'
  );
  const visualCastingState = updateCharacterBibleLockState(run.visualCastingState, params.lock, params.value);
  return save({ ...run, visualCastingState });
}

export async function generateCanonicalAnchor(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { generateCanonicalAnchorRound } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/identityAnchorCasting.js'
  );
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = generateCanonicalAnchorRound({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({
      projectId: params.projectId,
      run: { ...run, visualCastingState },
      roundId,
    });
  }
  return save({ ...run, visualCastingState });
}

export async function approveCanonicalAnchorAction(params: { projectId: string }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { approveCanonicalAnchor } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/identityAnchorCasting.js'
  );
  const visualCastingState = approveCanonicalAnchor(run.visualCastingState);
  return save({ ...run, visualCastingState });
}

export async function regenerateCanonicalAnchorAction(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { regenerateCanonicalAnchor } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/identityAnchorCasting.js'
  );
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = regenerateCanonicalAnchor({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({
      projectId: params.projectId,
      run: { ...run, visualCastingState },
      roundId,
    });
  }
  return save({ ...run, visualCastingState });
}

export async function generateCharacterIsolate(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const mod = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/imageReferenceCasting.js'
  );
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = mod.syncCanonicalAnchorFromCharacterIsolate(
    mod.generateCharacterIsolateRound({
      state: run.visualCastingState,
      falConfigured: falConfigured(),
      dispatchFal: shouldDispatch,
      resolvePublicUrl: (path) => getSite00AssetPublicUrl(path),
    }),
  );
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({ projectId: params.projectId, run: { ...run, visualCastingState }, roundId });
  }
  return save({ ...run, visualCastingState });
}

export async function approveCharacterIsolateAction(params: { projectId: string }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const mod = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/imageReferenceCasting.js'
  );
  const visualCastingState = mod.syncCanonicalAnchorFromCharacterIsolate(mod.approveCharacterIsolate(run.visualCastingState));
  return save({ ...run, visualCastingState });
}

export async function generateCharacterTurnaround(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { generateCharacterTurnaroundRound } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/imageReferenceCasting.js'
  );
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = generateCharacterTurnaroundRound({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
    resolvePublicUrl: (path) => getSite00AssetPublicUrl(path),
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({ projectId: params.projectId, run: { ...run, visualCastingState }, roundId });
  }
  return save({ ...run, visualCastingState });
}

export async function generateWardrobeDocumentation(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { generateWardrobeDocumentationRound } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/imageReferenceCasting.js'
  );
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = generateWardrobeDocumentationRound({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
    resolvePublicUrl: (path) => getSite00AssetPublicUrl(path),
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({ projectId: params.projectId, run: { ...run, visualCastingState }, roundId });
  }
  return save({ ...run, visualCastingState });
}

export async function regenerateCharacterTurnaroundSlotAction(params: {
  projectId: string;
  slot: import('../../../../shared/site00-studio-world-production/characterVisualCasting/types.js').CharacterTurnaroundSlot;
  dispatchFal?: boolean;
}) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { regenerateCharacterTurnaroundSlot } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/imageReferenceCasting.js'
  );
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = regenerateCharacterTurnaroundSlot({
    state: run.visualCastingState,
    slot: params.slot,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
    resolvePublicUrl: (path) => getSite00AssetPublicUrl(path),
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({ projectId: params.projectId, run: { ...run, visualCastingState }, roundId });
  }
  return save({ ...run, visualCastingState });
}

export async function generateEnvironmentPlate(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { generateEnvironmentPlateRound } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/imageReferenceCasting.js'
  );
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  const visualCastingState = generateEnvironmentPlateRound({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
    resolvePublicUrl: (path) => getSite00AssetPublicUrl(path),
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    return dispatchCastingRoundInBackground({ projectId: params.projectId, run: { ...run, visualCastingState }, roundId });
  }
  return save({ ...run, visualCastingState });
}

export async function promoteFounderCastingReferenceToClosestReview(params: {
  projectId: string;
  referenceId: string;
}) {
  const run = await hydrateCastingRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { promoteFounderReferenceToClosestReview } = await import(
    '../../../../shared/site00-studio-world-production/characterVisualCasting/promoteFounderReferenceToClosestReview.js'
  );
  const visualCastingState = promoteFounderReferenceToClosestReview(
    run.visualCastingState,
    params.referenceId,
  );
  return save({ ...run, visualCastingState });
}
