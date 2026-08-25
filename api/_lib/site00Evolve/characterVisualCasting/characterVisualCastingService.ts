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
import { dispatchCastingRoundFal } from './castingFalDispatch.js';

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

export async function getVisualCastingState(params: { projectId: string }) {
  const run = await loadRun(params.projectId);
  return {
    run,
    visualCastingState: run.visualCastingState ?? null,
    redirectToCasting: Boolean(run.visualCastingState?.visualCastingReady),
  };
}

export async function estimateVisualCastingRound(params: { projectId: string }) {
  const run = await loadRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const { estimate } = planInitialCastingRound({ state: run.visualCastingState, falConfigured: falConfigured() });
  return { run, estimate };
}

export async function generateVisualCastingRound(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await loadRun(params.projectId);
  if (!run.visualCastingState?.visualCastingReady) throw new Error('Visual casting not ready');
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  let visualCastingState = generateCastingRoundPlaceholders({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    visualCastingState = await dispatchCastingRoundFal({
      projectId: params.projectId,
      state: visualCastingState,
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
  const run = await loadRun(params.projectId);
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
  const run = await loadRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const visualCastingState = createCastingMergeRequest({
    state: run.visualCastingState,
    candidateIds: params.candidateIds,
    retainFromEach: params.retainFromEach,
  });
  return save({ ...run, visualCastingState });
}

export async function generateNextVisualCastingRound(params: { projectId: string; dispatchFal?: boolean }) {
  const run = await loadRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const shouldDispatch = params.dispatchFal ?? falConfigured();
  let visualCastingState = generateNextCastingRoundFromFeedback({
    state: run.visualCastingState,
    falConfigured: falConfigured(),
    dispatchFal: shouldDispatch,
  });
  const roundId = visualCastingState.rounds.at(-1)?.roundId;
  if (shouldDispatch && falConfigured() && roundId) {
    visualCastingState = await dispatchCastingRoundFal({
      projectId: params.projectId,
      state: visualCastingState,
      roundId,
    });
  }
  return save({ ...run, visualCastingState });
}

export async function retryVisualCastingRoundFal(params: { projectId: string; roundId?: string }) {
  const run = await loadRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  if (!falConfigured()) throw new Error('FAL_KEY not configured on server');

  const roundId = params.roundId ?? run.visualCastingState.rounds.at(-1)?.roundId;
  if (!roundId) throw new Error('No casting round to retry');

  const roundCandidates = run.visualCastingState.candidates.filter((entry) => entry.roundId === roundId);
  const needsRetry = roundCandidates.every(
    (entry) => !entry.previewUrl || entry.previewUrl.includes('/api/placeholder/'),
  );
  if (!needsRetry) throw new Error('Latest round already has generated stills');

  let visualCastingState = prepareCastingRoundForFalRetry({
    state: run.visualCastingState,
    roundId,
    falConfigured: falConfigured(),
  });
  visualCastingState = await dispatchCastingRoundFal({
    projectId: params.projectId,
    state: visualCastingState,
    roundId,
  });
  return save({ ...run, visualCastingState });
}

export async function lockVisualIdentity(params: { projectId: string }) {
  const run = await loadRun(params.projectId);
  if (!run.visualCastingState) throw new Error('Visual casting not initialized');
  const visualCastingState = lockFinalVisualIdentity(run.visualCastingState);
  return save({ ...run, visualCastingState });
}

export async function reopenCharacterCalibration(params: { projectId: string }) {
  const run = await loadRun(params.projectId);
  return save(createNewTruthVersionOnReopenCalibration({ run }));
}
