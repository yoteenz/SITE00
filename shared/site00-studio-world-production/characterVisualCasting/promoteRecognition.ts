/**
 * P0.5E.4C — Promote founder I KNOW HER confirmation to visual casting stage.
 */

import { randomUUID } from 'node:crypto';
import type { NdxFounderCharacterDiscoveryRun } from '../../site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';
import type { FounderRecognitionResponse } from '../embodiedCharacterFounderDiscovery/types.js';
import { buildCharacterTruthSnapshot } from './characterTruthSnapshot.js';
import { buildEmptyVisualCastingState, syncPipelineState } from './stateMachine.js';
import { evaluateVisualCastingReadiness } from './visualCastingReadiness.js';
import type {
  CharacterCastingAuthority,
  CharacterVisualCastingState,
  FounderCharacterRecognitionConfirmed,
} from './types.js';

export type PromoteRecognitionResult = {
  run: NdxFounderCharacterDiscoveryRun;
  visualCastingState: CharacterVisualCastingState;
  redirectToCasting: boolean;
  blockers: string[];
};

function ensureVisualCastingState(run: NdxFounderCharacterDiscoveryRun): CharacterVisualCastingState {
  return run.visualCastingState ?? buildEmptyVisualCastingState();
}

export function promoteFounderRecognition(params: {
  run: NdxFounderCharacterDiscoveryRun;
  response: FounderRecognitionResponse;
  sourceRoute: string;
  falConfigured: boolean;
}): PromoteRecognitionResult {
  const { run, response } = params;
  let visualCastingState = ensureVisualCastingState(run);

  if (response !== 'YES_I_KNOW_HER') {
    return { run, visualCastingState, redirectToCasting: false, blockers: [] };
  }

  if (!run.humanReadableSynthesis?.whoIThinkSheIs) {
    return {
      run,
      visualCastingState,
      redirectToCasting: false,
      blockers: ['CHARACTER_READ_REQUIRED_BEFORE_I_KNOW_HER'],
    };
  }

  const version = visualCastingState.truthSnapshots.length + 1;
  const snapshot = buildCharacterTruthSnapshot({ run, version, lockedForCasting: true });

  const castingAuthority: CharacterCastingAuthority = {
    authorityId: randomUUID(),
    snapshotId: snapshot.snapshotId,
    visualHypothesisEvidence: run.visualHypothesisReviews.map((v) => v.hypothesis),
    visualTendencyEvidence: ['put together without looking styled for content', 'protective styles / natural texture', 'gold jewelry lived-in'],
    projectVisualCanonNotes: ['Black and neutrals dominate', 'Signature accent feels chosen'],
    continuityArchitectureNotes: ['P0.5E.5 CharacterContinuityBible — visual section pending lock'],
  };

  const recognitionConfirmed: FounderCharacterRecognitionConfirmed = {
    eventId: randomUUID(),
    projectId: run.projectId,
    characterId: 'ndx',
    synthesisVersion: run.humanReadableSynthesis.generatedAt ?? null,
    confirmedAt: new Date().toISOString(),
    founderAction: 'YES_I_KNOW_HER',
    sourceRoute: params.sourceRoute,
    calibrationSessionId: run.calibrationState?.sessions.at(-1)?.sessionId ?? null,
    characterTruthSnapshotId: snapshot.snapshotId,
  };

  const readiness = evaluateVisualCastingReadiness({
    founderIKnowHerConfirmed: true,
    truthSnapshot: snapshot,
    castingAuthority,
    falConfigured: params.falConfigured,
  });

  visualCastingState = syncPipelineState({
    ...visualCastingState,
    founderIKnowHerConfirmed: true,
    characterTruthLockedForCasting: true,
    visualCastingReady: readiness.visualCastingReady,
    recognitionConfirmed,
    truthSnapshots: [...visualCastingState.truthSnapshots, snapshot],
    activeTruthSnapshotId: snapshot.snapshotId,
    castingAuthority,
    readiness,
    pipelineState: readiness.visualCastingReady ? 'VISUAL_CASTING_READY' : 'FOUNDER_I_KNOW_HER_CONFIRMED',
  });

  const updatedRun: NdxFounderCharacterDiscoveryRun = {
    ...run,
    visualCastingState,
    castingReadiness: {
      ...run.castingReadiness,
      readyForCastingExploration: readiness.visualCastingReady,
      state: readiness.visualCastingReady ? 'READY_FOR_CHARACTER_CASTING_EXPLORATION' : run.castingReadiness.state,
    },
  };

  return {
    run: updatedRun,
    visualCastingState,
    redirectToCasting: readiness.visualCastingReady,
    blockers: readiness.blockers,
  };
}

export function createNewTruthVersionOnReopenCalibration(params: {
  run: NdxFounderCharacterDiscoveryRun;
}): NdxFounderCharacterDiscoveryRun {
  const state = params.run.visualCastingState;
  if (!state?.founderIKnowHerConfirmed) return params.run;

  const version = state.truthSnapshots.length + 1;
  const snapshot = buildCharacterTruthSnapshot({
    run: params.run,
    version,
    lockedForCasting: false,
    supersededBySnapshotId: null,
  });

  const visualCastingState = syncPipelineState({
    ...state,
    truthSnapshots: [...state.truthSnapshots, snapshot],
    activeTruthSnapshotId: snapshot.snapshotId,
    reopenCalibrationAcknowledged: true,
    rounds: state.rounds.map((r) => ({ ...r, basedOnPriorTruthSnapshotId: state.activeTruthSnapshotId })),
  });

  return { ...params.run, visualCastingState };
}
