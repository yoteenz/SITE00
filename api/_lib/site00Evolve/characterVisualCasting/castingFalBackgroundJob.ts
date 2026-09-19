/**
 * Background FAL dispatch for character visual casting rounds.
 */

import { randomUUID } from 'node:crypto';
import type { NdxFounderCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';
import {
  applyCastingGenerationFailure,
} from '../../../../shared/site00-studio-world-production/characterVisualCasting/castingEngine.js';
import { reconcileOrphanedCastingGenerationState } from '../../../../shared/site00-studio-world-production/characterVisualCasting/orphanGenerationReconcile.js';
import { syncPipelineState } from '../../../../shared/site00-studio-world-production/characterVisualCasting/stateMachine.js';
import type { CharacterVisualCastingState } from '../../../../shared/site00-studio-world-production/characterVisualCasting/types.js';
import {
  enqueueFalBackgroundWork,
  FAL_BACKGROUND_RESUME_MS,
  FAL_BACKGROUND_STALE_MS,
  isFreshBackgroundAttempt,
  shouldRunFalSynchronously,
} from '../falBackgroundJob.js';
import * as discoveryStore from '../founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';
import { getFounderCharacterDiscoveryState } from '../founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import { dispatchCastingRoundFal } from './castingFalDispatch.js';

const activeCastingGenerationAttempts = new Map<string, string>();

async function loadRun(projectId: string): Promise<NdxFounderCharacterDiscoveryRun> {
  const run = await getFounderCharacterDiscoveryState({ projectId });
  if (!run) throw new Error('Founder character discovery room not initialized');
  return run;
}

async function save(run: NdxFounderCharacterDiscoveryRun): Promise<NdxFounderCharacterDiscoveryRun> {
  return discoveryStore.saveFounderCharacterDiscoveryRun(run);
}

function isOrphanedCastingGeneration(state: CharacterVisualCastingState, projectId: string): boolean {
  const tracking = state.falGenerationTracking;
  if (!tracking || tracking.status !== 'RUNNING') return false;
  return !activeCastingGenerationAttempts.has(projectId);
}

function withCastingTracking(
  state: CharacterVisualCastingState,
  roundId: string,
  attemptId: string,
): CharacterVisualCastingState {
  return syncPipelineState({
    ...state,
    falGenerationTracking: {
      attemptId,
      roundId,
      startedAt: new Date().toISOString(),
      status: 'RUNNING',
      errorMessage: null,
    },
  });
}

async function executeCastingRoundFalWork(params: {
  projectId: string;
  roundId: string;
  attemptId: string;
}): Promise<void> {
  try {
    const initialRun = await loadRun(params.projectId);
    const initialState = initialRun.visualCastingState;
    if (!initialState) return;
    if (initialState.falGenerationTracking?.attemptId !== params.attemptId) return;
    if (activeCastingGenerationAttempts.get(params.projectId) !== params.attemptId) return;

    const visualCastingState = await dispatchCastingRoundFal({
      projectId: params.projectId,
      state: initialState,
      roundId: params.roundId,
    });

    const currentRun = await loadRun(params.projectId);
    if (currentRun.visualCastingState?.falGenerationTracking?.attemptId !== params.attemptId) return;

    await save({
      ...currentRun,
      visualCastingState: syncPipelineState({
        ...visualCastingState,
        falGenerationTracking: null,
      }),
    });
  } catch (error) {
    const run = await loadRun(params.projectId);
    if (!run.visualCastingState) return;
    if (run.visualCastingState.falGenerationTracking?.attemptId !== params.attemptId) return;
    await save({
      ...run,
      visualCastingState: applyCastingGenerationFailure({
        state: run.visualCastingState,
        roundId: params.roundId,
        errorMessage: error instanceof Error ? error.message : 'Casting generation failed',
      }),
    });
  } finally {
    if (activeCastingGenerationAttempts.get(params.projectId) === params.attemptId) {
      activeCastingGenerationAttempts.delete(params.projectId);
    }
  }
}

export async function startCastingRoundFalBackgroundJob(params: {
  projectId: string;
  run: NdxFounderCharacterDiscoveryRun;
  roundId: string;
  force?: boolean;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const state = params.run.visualCastingState;
  if (!state) throw new Error('Visual casting not initialized');

  if (!params.force) {
    if (activeCastingGenerationAttempts.has(params.projectId)) return params.run;
  }

  const attemptId = randomUUID();
  activeCastingGenerationAttempts.set(params.projectId, attemptId);

  const started = await save({
    ...params.run,
    visualCastingState: withCastingTracking(state, params.roundId, attemptId),
  });

  const work = executeCastingRoundFalWork({
    projectId: params.projectId,
    roundId: params.roundId,
    attemptId,
  });

  if (shouldRunFalSynchronously()) {
    await work;
    return loadRun(params.projectId);
  }

  enqueueFalBackgroundWork(work);
  return started;
}

export async function reconcileOrphanedCastingGeneration(
  run: NdxFounderCharacterDiscoveryRun,
): Promise<NdxFounderCharacterDiscoveryRun> {
  const state = run.visualCastingState;
  if (!state) return run;
  const next = reconcileOrphanedCastingGenerationState(state);
  if (next === state) return run;
  return save({ ...run, visualCastingState: next });
}

export async function reconcileStaleCastingGeneration(
  run: NdxFounderCharacterDiscoveryRun,
): Promise<NdxFounderCharacterDiscoveryRun> {
  const state = run.visualCastingState;
  if (!state?.falGenerationTracking || state.falGenerationTracking.status !== 'RUNNING') return run;
  if (activeCastingGenerationAttempts.has(run.projectId)) return run;
  if (isFreshBackgroundAttempt(state.falGenerationTracking.startedAt, FAL_BACKGROUND_STALE_MS)) return run;

  return save({
    ...run,
    visualCastingState: applyCastingGenerationFailure({
      state,
      roundId: state.falGenerationTracking.roundId,
      errorMessage: 'Casting generation timed out — tap retry to run again.',
    }),
  });
}

export async function maybeResumeCastingGeneration(
  run: NdxFounderCharacterDiscoveryRun,
): Promise<NdxFounderCharacterDiscoveryRun> {
  const state = run.visualCastingState;
  if (!state?.falGenerationTracking || state.falGenerationTracking.status !== 'RUNNING') return run;
  if (activeCastingGenerationAttempts.has(run.projectId)) return run;
  if (!isFreshBackgroundAttempt(state.falGenerationTracking.startedAt, FAL_BACKGROUND_STALE_MS)) return run;

  // DB says RUNNING but this process is not generating — resume immediately (no 45s wait).
  if (isOrphanedCastingGeneration(state, run.projectId)) {
    return startCastingRoundFalBackgroundJob({
      projectId: run.projectId,
      run,
      roundId: state.falGenerationTracking.roundId,
      force: true,
    });
  }

  if (Date.now() - new Date(state.falGenerationTracking.startedAt).getTime() < FAL_BACKGROUND_RESUME_MS) return run;

  return startCastingRoundFalBackgroundJob({
    projectId: run.projectId,
    run,
    roundId: state.falGenerationTracking.roundId,
    force: true,
  });
}

export function castingBackgroundJobActive(projectId: string): boolean {
  return activeCastingGenerationAttempts.has(projectId);
}
