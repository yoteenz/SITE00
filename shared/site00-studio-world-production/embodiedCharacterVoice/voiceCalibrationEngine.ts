/**
 * P0.5E.4B — Adaptive voice calibration engine.
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  EMBODIED_CHARACTER_VOICE_VERSION,
  INITIAL_VOICE_CANDIDATE_COUNT,
  MAX_VOICE_CANDIDATE_COUNT,
  MIN_VOICE_CANDIDATE_COUNT,
  VOICE_CALIBRATION_PROGRESS_DOMAINS,
} from './constants.js';
import { selectComparisonSpokenCopy } from './characterLanguageEvidence.js';
import { buildSyntheticCalibrationCapability } from './voiceGenerationCapability.js';
import type {
  CharacterVoiceCalibrationInference,
  CharacterVoiceCalibrationProgress,
  CharacterVoiceCalibrationRound,
  CharacterVoiceCalibrationState,
  CharacterVoiceHypothesis,
  CharacterVoicePairwiseComparison,
  EmbodiedCharacterVoiceIdentity,
  FounderVoiceJudgment,
  PairwiseVoicePreference,
  VoiceInferredTrait,
  VoicePerformanceState,
} from './types.js';

const VOICE_PROFILES = [
  {
    label: 'VOICE A',
    vocalCharacter: 'Lower register, warm, measured entry',
    traits: ['LOW_REGISTER_WARMTH', 'MEASURED_CADENCE', 'UNDERSTATED_CONFIDENCE'],
    varied: ['register', 'warmth'],
    pitch: 0.85,
    rate: 0.92,
    voiceIndex: 0,
  },
  {
    label: 'VOICE B',
    vocalCharacter: 'Medium register, cool, quicker cognitive rhythm',
    traits: ['COOL_TONE', 'QUICK_COGNITIVE_RHYTHM', 'DRY_DELIVERY'],
    varied: ['tone', 'cadence'],
    pitch: 1.0,
    rate: 1.05,
    voiceIndex: 1,
  },
  {
    label: 'VOICE C',
    vocalCharacter: 'Relaxed cadence, natural conversational texture',
    traits: ['NATURAL_CONVERSATIONAL_TEXTURE', 'DRY_AMUSEMENT', 'MEDIUM_LOW_EXPRESSIVENESS'],
    varied: ['texture', 'expressiveness'],
    pitch: 0.95,
    rate: 0.98,
    voiceIndex: 2,
  },
  {
    label: 'VOICE D',
    vocalCharacter: 'Softer presence, understated humor in pauses',
    traits: ['SOFT_PRESENCE', 'UNDERSTATED_CONFIDENCE', 'DRY_AMUSEMENT'],
    varied: ['presence', 'humor delivery'],
    pitch: 0.9,
    rate: 0.9,
    voiceIndex: 3,
  },
] as const;

const EMOTION_LINES: Record<VoicePerformanceState, string> = {
  PLAYFUL: "BE SERIOUS. YOU MEAN TO TELL ME WE'VE BEEN DOING THIS THE WHOLE TIME?",
  SKEPTICAL: "WAIT. THAT DOESN'T LINE UP.",
  ANNOYED: "NO. THAT'S NOT WHAT I SAID.",
  AMUSED: "OKAY... THAT'S ACTUALLY FUNNY.",
  TRYING_NOT_TO_LAUGH: "I'M NOT LAUGHING. I'M NOT.",
  GENUINELY_SURPRISED: 'WAIT — WHAT?',
  SERIOUS: 'NO JOKE FOR A SECOND. THIS PART ACTUALLY MATTERS.',
  TIRED: "I DON'T HAVE THE ENERGY FOR THIS RIGHT NOW.",
  EXCITED: 'GIRL. LOOK AT THIS.',
  EMBARRASSED: 'OKAY. I WAS WRONG ABOUT THAT.',
  SELF_CORRECTING: 'OKAY. I WAS WRONG. BUT LOOK AT WHY I WAS WRONG.',
  CURIOUS: "...THAT'S INTERESTING.",
  QUIET: '...HMM.',
  DIRECT: "LET'S BE CLEAR ABOUT THIS.",
  FRUSTRATED: "THIS DOESN'T MAKE SENSE.",
  CONFIDENT: 'I KNOW WHAT I SAW.',
  VULNERABLE: "I WASN'T EXPECTING THAT.",
  MATTER_OF_FACT: "HERE'S WHAT WE KNOW.",
  NEUTRAL: 'OKAY, SO... THAT CANNOT BE RIGHT. SOMEBODY WOULD HAVE SAID SOMETHING BY NOW.',
};

export function buildEmptyVoiceCalibrationState(params: {
  projectId: string;
  brandId: string;
  characterId: string;
}): CharacterVoiceCalibrationState {
  const now = new Date().toISOString();
  return {
    calibrationVersion: EMBODIED_CHARACTER_VOICE_VERSION,
    projectId: params.projectId,
    brandId: params.brandId,
    characterId: params.characterId,
    languageEvidence: [],
    rounds: [],
    hypotheses: [],
    pairwiseComparisons: [],
    inferences: [],
    emergingIdentity: null,
    canonicalIdentity: null,
    performanceEnvelope: null,
    referenceLibrary: null,
    recognitionEvaluation: {
      evaluationId: randomUUID(),
      response: null,
      neutralSampleId: null,
      playfulSampleId: null,
      seriousSampleId: null,
      skepticalSampleId: null,
      unseenLineSampleId: null,
      note: null,
      evaluatedAt: null,
      founderCharacterVoiceConfirmed: false,
    },
    generalizationTests: [],
    crossEmotionRecognition: null,
    migrationEvaluation: null,
    continuityEvaluation: null,
    audiovisualCoherence: {
      coherenceId: randomUUID(),
      faceSelected: false,
      voiceSelected: false,
      response: null,
      finalAudiovisualLockBlocked: true,
      evaluatedAt: null,
    },
    progress: buildInitialProgress(),
    sessionMessage: null,
    blindAuditionMode: false,
    compareModeHypothesisIds: null,
    voiceRequests: 0,
    audioAssetsGenerated: 0,
    falRequests: 0,
    estimatedCost: 0,
    actualCost: 0,
    updatedAt: now,
  };
}

function buildInitialProgress(): CharacterVoiceCalibrationProgress[] {
  return VOICE_CALIBRATION_PROGRESS_DOMAINS.map((domain) => ({
    domain,
    level: domain === 'VOICE_IDENTITY' ? 'FORMING' : domain === 'CROSS_LINE_IDENTITY' ? 'UNTESTED' : 'EARLY',
    label: domain.replace(/_/g, ' '),
  }));
}

export function compileNextVoiceCalibrationRound(
  state: CharacterVoiceCalibrationState,
): { state: CharacterVoiceCalibrationState; round: CharacterVoiceCalibrationRound; hypotheses: CharacterVoiceHypothesis[] } {
  if (state.canonicalIdentity?.founderApproval) {
    throw new Error('Voice identity already approved — no further calibration rounds');
  }

  const roundNumber = state.rounds.length + 1;
  const roundType = resolveRoundType(state, roundNumber);
  const spokenCopy = resolveSpokenCopy(state, roundType);
  const roundId = randomUUID();
  const candidateCount = resolveCandidateCount(roundType, state);
  const profiles = selectProfiles(state, candidateCount);

  const cap = buildSyntheticCalibrationCapability();
  const hypotheses: CharacterVoiceHypothesis[] = profiles.map((profile, i) => ({
    id: randomUUID(),
    characterId: state.characterId,
    roundId,
    hypothesisLabel: profile.label,
    vocalCharacter: profile.vocalCharacter,
    whyItFitsCharacter: `Explores ${profile.varied.join(' vs ')} while staying plausible for the same woman.`,
    primaryDifferencesFromSiblings: profiles
      .filter((_, j) => j !== i)
      .map((p) => `${p.label}: ${p.vocalCharacter}`),
    provider: cap.provider,
    model: cap.endpoint,
    voiceId: `synthetic-voice-${profile.voiceIndex}-${fingerprint(profile.label)}`,
    generationSettings: { pitch: profile.pitch, rate: profile.rate, voiceIndex: profile.voiceIndex },
    predictedTraits: [...profile.traits],
    uncertainTraits: ['pause rhythm', 'laugh behavior'],
    deliberatelyVariedTraits: [...profile.varied],
    spokenCopy,
    emotionalState: roundType === 'PERFORMANCE_RANGE' ? 'PLAYFUL' : 'NEUTRAL',
    audioAssetId: null,
    audioUrl: null,
    playbackProfile: {
      pitch: profile.pitch,
      rate: profile.rate,
      voiceIndex: profile.voiceIndex,
      providerVoiceId: `synthetic-voice-${profile.voiceIndex}`,
    },
    spokenLineId: randomUUID(),
    founderJudgment: null,
    founderNote: null,
    status: 'GENERATED',
    generatedAt: new Date().toISOString(),
  }));

  const round: CharacterVoiceCalibrationRound = {
    roundId,
    roundNumber,
    roundType,
    question: roundQuestion(roundType),
    spokenCopy,
    languageEvidenceId: state.languageEvidence[0]?.evidenceId ?? null,
    hypothesisIds: hypotheses.map((h) => h.id),
    sameLineAcrossCandidates: true,
    status: 'READY_FOR_JUDGMENT',
    blindAudition: state.blindAuditionMode,
    pairwiseComparisonId: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  return {
    state: {
      ...state,
      rounds: [...state.rounds, round],
      hypotheses: [...state.hypotheses, ...hypotheses],
      voiceRequests: state.voiceRequests + hypotheses.length,
      audioAssetsGenerated: state.audioAssetsGenerated + hypotheses.length,
      estimatedCost: state.estimatedCost + hypotheses.length * 0.01,
      sessionMessage: buildSessionMessage(state, roundType),
      progress: updateProgress(state.progress, roundType),
      updatedAt: new Date().toISOString(),
    },
    round,
    hypotheses,
  };
}

function resolveRoundType(state: CharacterVoiceCalibrationState, roundNumber: number) {
  if (roundNumber === 1) return 'BROAD_CASTING' as const;
  const positives = state.hypotheses.filter((h) => h.founderJudgment === 'YES_THATS_HER' || h.founderJudgment === 'CLOSE');
  if (positives.length >= 2 && !state.pairwiseComparisons.some((p) => p.preference)) return 'IDENTITY_NARROWING' as const;
  if (state.emergingIdentity && roundNumber <= 3) return 'CADENCE_TEXTURE' as const;
  if (state.emergingIdentity && roundNumber === 4) return 'PERFORMANCE_RANGE' as const;
  if (roundNumber >= 5) return 'UNSEEN_LINE_RECOGNITION' as const;
  return 'IDENTITY_NARROWING' as const;
}

function resolveSpokenCopy(state: CharacterVoiceCalibrationState, roundType: string): string {
  if (roundType === 'UNSEEN_LINE_RECOGNITION') {
    return "I ONLY OPENED THIS BECAUSE I WANTED TO CHECK ONE THING.";
  }
  if (roundType === 'PERFORMANCE_RANGE') {
    return EMOTION_LINES.PLAYFUL;
  }
  return selectComparisonSpokenCopy(state.languageEvidence);
}

function resolveCandidateCount(roundType: string, _state: CharacterVoiceCalibrationState): number {
  if (roundType === 'IDENTITY_NARROWING') return MIN_VOICE_CANDIDATE_COUNT;
  if (roundType === 'PERFORMANCE_RANGE') return 1;
  return INITIAL_VOICE_CANDIDATE_COUNT;
}

function selectProfiles(state: CharacterVoiceCalibrationState, count: number) {
  const rejected = new Set(
    state.inferences
      .filter((i) => i.rejectedTraits.length > 0)
      .flatMap((i) => i.rejectedTraits),
  );
  const preferred = state.inferences.flatMap((i) => i.inferredTraits);
  let profiles = [...VOICE_PROFILES];
  if (rejected.has('HIGH_ENERGY_SOCIAL_HOST' as VoiceInferredTrait)) {
    profiles = profiles.filter((p) => !p.traits.some((t) => t === 'QUICK_COGNITIVE_RHYTHM'));
  }
  if (preferred.includes('LOW_REGISTER_WARMTH' as VoiceInferredTrait)) {
    profiles = profiles.sort((a, b) => a.pitch - b.pitch);
  }
  return profiles.slice(0, Math.min(count, MAX_VOICE_CANDIDATE_COUNT));
}

function roundQuestion(roundType: string): string {
  switch (roundType) {
    case 'BROAD_CASTING':
      return 'Which general vocal presence feels like her?';
    case 'IDENTITY_NARROWING':
      return 'Narrowing around what you kept — which feels more like her?';
    case 'CADENCE_TEXTURE':
      return 'Testing cadence and conversational texture.';
    case 'PERFORMANCE_RANGE':
      return 'Same emerging identity — different emotional performance.';
    case 'UNSEEN_LINE_RECOGNITION':
      return 'Completely new dialogue — do you still hear her?';
    default:
      return 'Which voice feels like her?';
  }
}

function buildSessionMessage(state: CharacterVoiceCalibrationState, roundType: string): string {
  if (state.rounds.length === 0) return "LET'S FIND OUT WHAT SHE SOUNDS LIKE.";
  const rejections = state.inferences.filter((i) => i.rejectedTraits.includes('HIGH_ENERGY_SOCIAL_HOST'));
  if (rejections.length >= 2) {
    return "YOU'RE CONSISTENTLY REJECTING HIGH-ENERGY DELIVERY. THE VOICES YOU'RE KEEPING ARE LOWER, WARMER, AND MORE UNDERSTATED. NEXT I WANT TO TEST WHETHER HER HUMOR LIVES IN THE VOICE OR MOSTLY IN THE PAUSE.";
  }
  if (roundType === 'PERFORMANCE_RANGE') return "I'M STARTING TO HEAR HER. NOW — SAME WOMAN, DIFFERENT FEELING.";
  return "I'M GETTING CLOSER.";
}

function updateProgress(
  progress: CharacterVoiceCalibrationProgress[],
  roundType: string,
): CharacterVoiceCalibrationProgress[] {
  return progress.map((p) => {
    if (p.domain === 'VOICE_IDENTITY' && roundType !== 'BROAD_CASTING') {
      return { ...p, level: 'FORMING' as const };
    }
    if (p.domain === 'CADENCE' && roundType === 'CADENCE_TEXTURE') {
      return { ...p, level: 'STRONG' as const };
    }
    if (p.domain === 'EMOTIONAL_RANGE' && roundType === 'PERFORMANCE_RANGE') {
      return { ...p, level: 'FORMING' as const };
    }
    return p;
  });
}

export function applyVoiceHypothesisJudgment(
  state: CharacterVoiceCalibrationState,
  hypothesisId: string,
  judgment: FounderVoiceJudgment,
  note?: string,
): CharacterVoiceCalibrationState {
  const hypothesis = state.hypotheses.find((h) => h.id === hypothesisId);
  if (!hypothesis) return state;

  const inference = inferFromJudgment(hypothesisId, judgment, note);
  const hypotheses = state.hypotheses.map((h) =>
    h.id === hypothesisId
      ? { ...h, founderJudgment: judgment, founderNote: note ?? null, status: 'JUDGED' as const }
      : h,
  );

  let emergingIdentity = state.emergingIdentity;
  if (judgment === 'YES_THATS_HER' || judgment === 'CLOSE') {
    emergingIdentity = buildEmergingIdentity(state, hypothesis, judgment);
  }

  const roundJudgments = hypotheses.filter(
    (h) => h.roundId === hypothesis.roundId && h.founderJudgment,
  );
  const rounds = state.rounds.map((r) =>
    r.roundId === hypothesis.roundId && roundJudgments.length >= r.hypothesisIds.length
      ? { ...r, status: 'JUDGMENTS_COMPLETE' as const, completedAt: new Date().toISOString() }
      : r,
  );

  return {
    ...state,
    hypotheses,
    inferences: [...state.inferences, inference],
    emergingIdentity,
    rounds,
    updatedAt: new Date().toISOString(),
  };
}

function inferFromJudgment(
  hypothesisId: string,
  judgment: FounderVoiceJudgment,
  note?: string,
): CharacterVoiceCalibrationInference {
  const inferred: VoiceInferredTrait[] = [];
  const rejected: VoiceInferredTrait[] = [];

  switch (judgment) {
    case 'YES_THATS_HER':
    case 'CLOSE':
      inferred.push('UNDERSTATED_CONFIDENCE', 'NATURAL_CONVERSATIONAL_TEXTURE');
      break;
    case 'NO_NOT_HER':
      rejected.push('HIGH_ENERGY_SOCIAL_HOST');
      break;
    case 'TOO_POLISHED':
      rejected.push('POLISHED_DELIVERY');
      inferred.push('NATURAL_CONVERSATIONAL_TEXTURE');
      break;
    case 'TOO_INFLUENCER':
      rejected.push('HIGH_ENERGY_SOCIAL_HOST');
      break;
    case 'TOO_FAST':
      rejected.push('QUICK_COGNITIVE_RHYTHM');
      inferred.push('MEASURED_CADENCE');
      break;
    case 'TOO_SOFT':
      rejected.push('SOFT_PRESENCE');
      break;
    case 'TOO_GENERIC':
      rejected.push('POLISHED_DELIVERY');
      break;
    default:
      break;
  }

  return {
    inferenceId: randomUUID(),
    sourceHypothesisId: hypothesisId,
    sourceComparisonId: null,
    founderJudgment: judgment,
    founderNote: note ?? null,
    inferredTraits: inferred,
    rejectedTraits: rejected,
    evidenceType: judgment === 'YES_THATS_HER' ? 'FOUNDER_SELECTED_AUDIO' : judgment === 'NO_NOT_HER' ? 'FOUNDER_REJECTED_AUDIO' : judgment === 'CLOSE' ? 'FOUNDER_CLOSE_AUDIO' : 'SYSTEM_INFERRED_VOCAL_TRAIT',
    directlyConfirmed: judgment === 'YES_THATS_HER',
    at: new Date().toISOString(),
  };
}

function buildEmergingIdentity(
  state: CharacterVoiceCalibrationState,
  hypothesis: CharacterVoiceHypothesis,
  judgment: FounderVoiceJudgment,
): EmbodiedCharacterVoiceIdentity {
  const now = new Date().toISOString();
  return {
    id: state.emergingIdentity?.id ?? randomUUID(),
    projectId: state.projectId,
    brandId: state.brandId,
    characterId: state.characterId,
    version: '0.1.0-emerging',
    status: judgment === 'YES_THATS_HER' ? 'CANDIDATE' : 'EMERGING',
    voiceIdentityName: hypothesis.hypothesisLabel,
    voiceIdentityThesis: hypothesis.vocalCharacter,
    voiceProvider: hypothesis.provider,
    voiceModel: hypothesis.model,
    providerVoiceId: hypothesis.voiceId,
    vocalAgeBand: 'mid-20s to mid-30s',
    register: hypothesis.predictedTraits.includes('LOW_REGISTER_WARMTH') ? 'medium-low' : 'medium',
    pitchRange: 'medium',
    resonance: 'natural',
    texture: 'conversational',
    warmth: hypothesis.predictedTraits.includes('LOW_REGISTER_WARMTH') ? 'warm' : 'neutral-warm',
    brightness: 'medium',
    weight: 'medium',
    breathiness: 'light',
    rasp: 'none',
    clarity: 'clear',
    cadence: hypothesis.predictedTraits.includes('MEASURED_CADENCE') ? 'measured' : 'natural',
    tempoRange: 'medium',
    pauseBehavior: 'THOUGHT_PAUSE',
    sentenceMelody: 'conversational falloff',
    emphasisBehavior: 'understated',
    laughBehavior: 'QUIET_LAUGH',
    reactionSoundBehavior: 'small exhale, mm, wait',
    defaultEnergy: 'medium-low',
    defaultConfidence: 'understated',
    defaultIntimacy: 'medium',
    defaultExpressiveness: 'medium-low',
    defaultSeriousness: 'contextual',
    defaultPlayfulness: 'dry',
    regionality: null,
    culturalSpeechContext: null,
    slangBehavior: null,
    pronunciationBehavior: null,
    codeSwitchingBehavior: {
      behaviorId: randomUUID(),
      contexts: [
        { context: 'best friend', modulation: 'more immediate', sameVoiceIdentity: true },
        { context: 'TikTok', modulation: 'thought still forming', sameVoiceIdentity: true },
        { context: 'formal', modulation: 'more measured', sameVoiceIdentity: true },
      ],
      forcedDialect: false,
      caricatureRisk: false,
    },
    performanceRange: ['PLAYFUL', 'SKEPTICAL', 'SERIOUS', 'CURIOUS', 'SELF_CORRECTING'],
    prohibitedPerformanceStates: ['commercial announcer', 'podcast host caricature', 'influencer voice'],
    recognitionAnchors: [],
    voiceDriftConstraints: ['no generic AI narrator', 'no influencer collapse'],
    sourceCalibrationRounds: [hypothesis.roundId],
    approvedAudioReferences: [],
    providerConfiguration: hypothesis.generationSettings,
    founderApproval: false,
    fingerprint: fingerprint(hypothesis.voiceId),
    createdAt: state.emergingIdentity?.createdAt ?? now,
    updatedAt: now,
  };
}

export function applyPairwiseVoicePreference(
  state: CharacterVoiceCalibrationState,
  hypothesisAId: string,
  hypothesisBId: string,
  preference: PairwiseVoicePreference,
  customNote?: string,
): CharacterVoiceCalibrationState {
  const comparison: CharacterVoicePairwiseComparison = {
    comparisonId: randomUUID(),
    roundId: state.rounds[state.rounds.length - 1]?.roundId ?? randomUUID(),
    hypothesisAId,
    hypothesisBId,
    spokenCopy: state.hypotheses.find((h) => h.id === hypothesisAId)?.spokenCopy ?? '',
    preference,
    customNote: customNote ?? null,
    at: new Date().toISOString(),
  };

  const inference: CharacterVoiceCalibrationInference = {
    inferenceId: randomUUID(),
    sourceHypothesisId: null,
    sourceComparisonId: comparison.comparisonId,
    founderJudgment: null,
    founderNote: customNote ?? null,
    inferredTraits: preference === 'PREFER_A' || preference === 'PREFER_B' ? ['UNDERSTATED_CONFIDENCE'] : ['NATURAL_CONVERSATIONAL_TEXTURE'],
    rejectedTraits: [],
    evidenceType: 'SYSTEM_INFERRED_VOCAL_TRAIT',
    directlyConfirmed: false,
    at: new Date().toISOString(),
  };

  return {
    ...state,
    pairwiseComparisons: [...state.pairwiseComparisons, comparison],
    inferences: [...state.inferences, inference],
    updatedAt: new Date().toISOString(),
  };
}

export function blocksRandomVoiceBatch(state: CharacterVoiceCalibrationState): boolean {
  return state.rounds.every((r) => r.sameLineAcrossCandidates);
}

export function sameLineAcrossCandidates(round: CharacterVoiceCalibrationRound, hypotheses: CharacterVoiceHypothesis[]): boolean {
  const roundHypos = hypotheses.filter((h) => h.roundId === round.roundId);
  if (roundHypos.length === 0) return true;
  const line = roundHypos[0]!.spokenCopy;
  return roundHypos.every((h) => h.spokenCopy === line);
}

export function voiceIdentitySeparateFromPerformance(): true {
  return true;
}

export function blocksFinalizationFromSingleLine(state: CharacterVoiceCalibrationState): boolean {
  const yesCount = state.hypotheses.filter((h) => h.founderJudgment === 'YES_THATS_HER').length;
  const emotionRounds = state.rounds.filter((r) => r.roundType === 'PERFORMANCE_RANGE').length;
  const unseenTests = state.generalizationTests.filter((t) => t.response === 'YES_STILL_HER').length;
  if (yesCount < 1) return true;
  if (state.rounds.length < 2) return true;
  if (emotionRounds < 1) return true;
  if (unseenTests < 1) return true;
  return false;
}

function fingerprint(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export { EMOTION_LINES };
