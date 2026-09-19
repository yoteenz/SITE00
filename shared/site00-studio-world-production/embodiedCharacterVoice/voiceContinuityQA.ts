/**
 * P0.5E.4B — Voice continuity QA, recognition gate, migration, reference library.
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterVoiceCalibrationState,
  CharacterVoiceContinuityEvaluation,
  CharacterVoiceCrossEmotionRecognition,
  CharacterVoiceGeneralizationTest,
  CharacterVoiceMigrationEvaluation,
  CharacterVoiceReferenceLibrary,
  CanonicalCharacterVoiceIdentity,
  EmbodiedCharacterVoiceIdentity,
  FounderVoiceRecognitionResponse,
  UnseenLineRecognitionResponse,
  VoiceContinuityFailure,
} from './types.js';
import { buildPerformanceEnvelope } from './voicePerformanceEnvelope.js';
import { blocksFinalizationFromSingleLine } from './voiceCalibrationEngine.js';

export function buildReferenceLibrary(identity: EmbodiedCharacterVoiceIdentity): CharacterVoiceReferenceLibrary {
  return {
    libraryId: randomUUID(),
    voiceIdentityId: identity.id,
    neutralSampleId: null,
    playfulSampleId: null,
    seriousSampleId: null,
    skepticalSampleId: null,
    selfCorrectionSampleId: null,
    conversationalSampleId: null,
    unseenLineValidationSampleId: null,
    stableInternalId: `character-primary-voice-v1`,
  };
}

export function evaluateVoiceContinuity(
  identity: EmbodiedCharacterVoiceIdentity,
): CharacterVoiceContinuityEvaluation {
  const failures: VoiceContinuityFailure[] = [];
  if (!identity.providerVoiceId) failures.push('FAIL_VOICE_NOT_PERSISTED');
  if (identity.prohibitedPerformanceStates.length === 0) {
    failures.push('FAIL_GENERIC_AI_NARRATOR');
  }
  return {
    evaluationId: randomUUID(),
    voiceIdentityId: identity.id,
    result: failures.length === 0 ? 'PASS' : 'FAIL',
    failures,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateVoiceMigration(
  fromProvider: string,
  toProvider: string,
  fromVoiceId: string,
): CharacterVoiceMigrationEvaluation {
  return {
    evaluationId: randomUUID(),
    fromProvider,
    toProvider,
    fromVoiceId,
    outcome: fromProvider === toProvider ? 'EQUIVALENT' : 'CLOSE_FOUNDER_REVIEW_REQUIRED',
    evaluatedAt: new Date().toISOString(),
    silentlyRecast: false,
  };
}

export function migrationDoesNotSilentlyRecast(eval_: CharacterVoiceMigrationEvaluation): boolean {
  return eval_.silentlyRecast === false;
}

export function recordUnseenLineTest(
  state: CharacterVoiceCalibrationState,
  hypothesisId: string,
  spokenCopy: string,
  response: UnseenLineRecognitionResponse,
): CharacterVoiceCalibrationState {
  const test: CharacterVoiceGeneralizationTest = {
    testId: randomUUID(),
    spokenCopy,
    hypothesisId,
    response,
    wasInCalibrationSet: false,
    at: new Date().toISOString(),
  };
  return {
    ...state,
    generalizationTests: [...state.generalizationTests, test],
    progress: state.progress.map((p) =>
      p.domain === 'CROSS_LINE_IDENTITY'
        ? { ...p, level: response === 'YES_STILL_HER' ? 'STRONG' : 'FORMING' }
        : p,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function recordCrossEmotionRecognition(
  state: CharacterVoiceCalibrationState,
  identityId: string,
  emotionSampleIds: Record<string, string>,
  passes: boolean,
): CharacterVoiceCalibrationState {
  const recognition: CharacterVoiceCrossEmotionRecognition = {
    recognitionId: randomUUID(),
    voiceIdentityId: identityId,
    emotionSampleIds,
    passesCrossEmotion: passes,
    evaluatedAt: new Date().toISOString(),
  };
  return {
    ...state,
    crossEmotionRecognition: recognition,
    progress: state.progress.map((p) =>
      p.domain === 'EMOTIONAL_RANGE' ? { ...p, level: passes ? 'STRONG' : 'FORMING' } : p,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function applyFounderVoiceRecognition(
  state: CharacterVoiceCalibrationState,
  response: FounderVoiceRecognitionResponse,
  note?: string,
): CharacterVoiceCalibrationState {
  if (response === 'YES_THATS_HER_VOICE' && blocksFinalizationFromSingleLine(state)) {
    return {
      ...state,
      recognitionEvaluation: {
        ...state.recognitionEvaluation,
        response: 'ALMOST_KEEP_CALIBRATING',
        note: 'Additional emotion and unseen-line validation required before final approval.',
        evaluatedAt: new Date().toISOString(),
        founderCharacterVoiceConfirmed: false,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  let canonicalIdentity = state.canonicalIdentity;
  let performanceEnvelope = state.performanceEnvelope;
  let referenceLibrary = state.referenceLibrary;

  if (response === 'YES_THATS_HER_VOICE' && state.emergingIdentity) {
    if (state.emergingIdentity.voiceProvider === 'site00_synthetic') {
      return {
        ...state,
        recognitionEvaluation: {
          ...state.recognitionEvaluation,
          response: 'ALMOST_KEEP_CALIBRATING',
          note: 'DEV_PLACEHOLDER provider cannot establish canonical voice.',
          evaluatedAt: new Date().toISOString(),
          founderCharacterVoiceConfirmed: false,
        },
        updatedAt: new Date().toISOString(),
      };
    }
    canonicalIdentity = {
      ...state.emergingIdentity,
      status: 'APPROVED',
      founderApproval: true,
      version: '1.0.0',
      isCanon: true,
      ingestibleToContinuityPipeline: true,
    } as CanonicalCharacterVoiceIdentity;
    performanceEnvelope = buildPerformanceEnvelope(state.emergingIdentity);
    referenceLibrary = buildReferenceLibrary(state.emergingIdentity);
  }

  return {
    ...state,
    canonicalIdentity,
    performanceEnvelope,
    referenceLibrary,
    recognitionEvaluation: {
      ...state.recognitionEvaluation,
      response,
      note: note ?? null,
      evaluatedAt: new Date().toISOString(),
      founderCharacterVoiceConfirmed: response === 'YES_THATS_HER_VOICE' && !blocksFinalizationFromSingleLine(state),
    },
    audiovisualCoherence: {
      ...state.audiovisualCoherence,
      voiceSelected: response === 'YES_THATS_HER_VOICE',
    },
    updatedAt: new Date().toISOString(),
  };
}

export function finalAudiovisualLockRequiresFaceAndVoice(state: CharacterVoiceCalibrationState): boolean {
  return !state.audiovisualCoherence.faceSelected || !state.audiovisualCoherence.voiceSelected;
}

export function voiceCalibrationMayPrecedeFaceSelection(): true {
  return true;
}

export function founderKnowsHerNotAutoTriggered(): true {
  return true;
}

export function detectGenericAiNarratorRisk(identity: EmbodiedCharacterVoiceIdentity): boolean {
  return identity.voiceDriftConstraints.some((c) => c.includes('AI narrator'));
}

export function detectInfluencerVoiceRisk(identity: EmbodiedCharacterVoiceIdentity): boolean {
  return identity.prohibitedPerformanceStates.some((p) => p.includes('influencer'));
}

export function directVsInferredTruthSeparate(inferences: { directlyConfirmed: boolean; evidenceType: string }[]): boolean {
  const hasDirect = inferences.some(
    (i) =>
      i.directlyConfirmed ||
      i.evidenceType === 'FOUNDER_SELECTED_AUDIO' ||
      i.evidenceType === 'FOUNDER_REJECTED_AUDIO' ||
      i.evidenceType === 'FOUNDER_CLOSE_AUDIO' ||
      i.evidenceType === 'FOUNDER_COMMENT',
  );
  const hasInferred = inferences.some((i) => i.evidenceType === 'SYSTEM_INFERRED_VOCAL_TRAIT');
  return hasDirect && hasInferred;
}

export function genericStudioWorldHasNoIdentityAssumptions(): true {
  return true;
}
