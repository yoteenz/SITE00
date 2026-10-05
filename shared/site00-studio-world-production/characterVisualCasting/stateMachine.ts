/**
 * P0.5E.4C — Character pipeline state machine helpers.
 */

import type { CharacterPipelineState, CharacterVisualCastingState } from './types.js';
import { CHARACTER_VISUAL_CASTING_VERSION } from './constants.js';
import { evaluateVisualCastingReadiness } from './visualCastingReadiness.js';

export function buildEmptyVisualCastingState(): CharacterVisualCastingState {
  return {
    castingVersion: CHARACTER_VISUAL_CASTING_VERSION,
    pipelineState: 'CHARACTER_DISCOVERY_IN_PROGRESS',
    founderIKnowHerConfirmed: false,
    characterTruthLockedForCasting: false,
    visualCastingReady: false,
    castingCandidatesReady: false,
    finalVisualIdentityApproved: false,
    characterReferencePackReady: false,
    continuityTestReady: false,
    recognitionConfirmed: null,
    truthSnapshots: [],
    activeTruthSnapshotId: null,
    castingAuthority: null,
    readiness: evaluateVisualCastingReadiness({
      founderIKnowHerConfirmed: false,
      truthSnapshot: null,
      castingAuthority: null,
      falConfigured: false,
    }),
    rounds: [],
    candidates: [],
    mergeRequests: [],
    selectedCandidateId: null,
    finalIdentityConfirmationRoundId: null,
    referencePackSummary: {
      packId: null,
      faceAnchors: 0,
      expressionAnchors: 0,
      hairAnchors: 0,
      wardrobeAnchors: 0,
      negativeConstraints: 0,
    },
    reopenCalibrationAcknowledged: false,
    falImageRequests: 0,
    falVideoRequests: 0,
    falGenerationTracking: null,
    founderReferences: [],
    activeReferenceAuthority: null,
    promptContractSnapshots: {},
    referenceDrivenBundles: [],
    characterBibleAssetPack: null,
    referenceDerivedSummary: null,
    visualAuthoritySnapshot: null,
    canonicalAnchor: null,
    anchorWorkflowStage: 'CANONICAL_ANCHOR_PENDING',
    continuityDriftEvaluations: [],
    visualCastingLineage: [],
    castingAuthorityMode: 'REFERENCE_IMAGE_DRIVEN',
    characterImageReferenceAuthority: null,
    characterIsolate: null,
    environmentPlate: null,
    characterTurnaroundPack: null,
    updatedAt: new Date().toISOString(),
  };
}

export function resolvePipelineState(state: CharacterVisualCastingState): CharacterPipelineState {
  if (state.continuityTestReady) return 'CONTINUITY_TEST_READY';
  if (state.characterReferencePackReady) return 'CHARACTER_REFERENCE_PACK_READY';
  if (state.finalVisualIdentityApproved) return 'FINAL_VISUAL_IDENTITY_APPROVED';
  if (state.finalIdentityConfirmationRoundId) return 'FINAL_IDENTITY_CONFIRMATION';
  if (state.selectedCandidateId) return 'VISUAL_IDENTITY_CANDIDATE_SELECTED';
  if (state.candidates.some((c) => c.founderJudgment && c.founderJudgment !== 'NOT_HER')) {
    return 'FOUNDER_CASTING_CALIBRATION';
  }
  if (state.castingCandidatesReady) return 'CASTING_CANDIDATES_READY';
  if (state.rounds.some((r) => r.status === 'GENERATING')) return 'CASTING_CANDIDATES_PENDING';
  if (state.visualCastingReady) return 'VISUAL_CASTING_READY';
  if (state.characterTruthLockedForCasting && state.founderIKnowHerConfirmed) {
    return 'CHARACTER_TRUTH_LOCKED_FOR_CASTING';
  }
  if (state.founderIKnowHerConfirmed) return 'FOUNDER_I_KNOW_HER_CONFIRMED';
  return 'CHARACTER_DISCOVERY_IN_PROGRESS';
}

export function syncPipelineState(state: CharacterVisualCastingState): CharacterVisualCastingState {
  const pipelineState = resolvePipelineState(state);
  return { ...state, pipelineState, updatedAt: new Date().toISOString() };
}

export function discoveryShouldShowRecognizedNotCalibration(state: CharacterVisualCastingState): boolean {
  return state.founderIKnowHerConfirmed && !state.reopenCalibrationAcknowledged;
}
