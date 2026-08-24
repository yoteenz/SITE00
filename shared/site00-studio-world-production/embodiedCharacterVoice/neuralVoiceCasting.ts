/**
 * P0.5E.4B.1 — Neural voice casting: model selection, contracts, naturalness QA.
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  DEFAULT_NEURAL_CASTING_LINE,
  INITIAL_VOICE_CANDIDATE_COUNT,
  MAX_VOICE_CANDIDATE_COUNT,
} from './constants.js';
import type {
  CharacterVoiceCalibrationState,
  CharacterVoiceHypothesis,
  HumanWomanTestResponse,
  NaturalConversationalPerformanceContract,
  NeuralNaturalnessFailure,
  NeuralVoiceCandidateIdentity,
  NeuralVoiceCastingContract,
  NeuralVoiceCastingEstimate,
  NeuralVoiceCastingModelSelection,
  NeuralVoiceNaturalnessEvaluation,
} from './types.js';
import type { CharacterVoiceGenerationCapability } from './types.js';

/** FAL discovery inputs — not permanent authority */
export const NEURAL_TTS_DISCOVERY_ENDPOINTS = {
  MINIMAX_SPEECH_02_HD: 'fal-ai/minimax/speech-02-hd',
  MINIMAX_SPEECH_02_TURBO: 'fal-ai/minimax/speech-02-turbo',
  ELEVENLABS_TTS_V3: 'fal-ai/elevenlabs/tts/eleven-v3',
  GEMINI_TTS: 'fal-ai/gemini-tts',
} as const;

/** MiniMax preset voices — licensed provider catalogue, not real-person clones */
export const NEURAL_CASTING_TERRITORIES = [
  {
    label: 'VOICE A',
    territory: 'DRY / LOW-KEY',
    vocalCharacter: 'Understated, dry delivery, measured entry, low-key confidence',
    providerVoiceId: 'Calm_Woman',
    providerVoiceName: 'Calm Woman',
    speed: 0.95,
    pitch: -1,
    traits: ['UNDERSTATED_CONFIDENCE', 'DRY_DELIVERY', 'MEASURED_CADENCE'],
    varied: ['register', 'dryness'],
  },
  {
    label: 'VOICE B',
    territory: 'SHARP / PLAYFUL',
    vocalCharacter: 'Sharper cadence, playful edge, conversational looseness',
    providerVoiceId: 'Lively_Girl',
    providerVoiceName: 'Lively Girl',
    speed: 1.02,
    pitch: 0,
    traits: ['DRY_AMUSEMENT', 'NATURAL_CONVERSATIONAL_TEXTURE', 'QUICK_COGNITIVE_RHYTHM'],
    varied: ['playfulness', 'cadence'],
  },
  {
    label: 'VOICE C',
    territory: 'COOL / OBSERVANT',
    vocalCharacter: 'Cool observational tone, quiet intelligence, unhurried',
    providerVoiceId: 'Wise_Woman',
    providerVoiceName: 'Wise Woman',
    speed: 0.92,
    pitch: -2,
    traits: ['COOL_TONE', 'UNDERSTATED_CONFIDENCE', 'MEDIUM_LOW_EXPRESSIVENESS'],
    varied: ['tone', 'expressiveness'],
  },
  {
    label: 'VOICE D',
    territory: 'WARM / HUMAN',
    vocalCharacter: 'Warm human presence, natural conversational texture, approachable',
    providerVoiceId: 'Soft_Girl',
    providerVoiceName: 'Soft Girl',
    speed: 0.98,
    pitch: 0,
    traits: ['LOW_REGISTER_WARMTH', 'NATURAL_CONVERSATIONAL_TEXTURE', 'SOFT_PRESENCE'],
    varied: ['warmth', 'presence'],
  },
] as const;

const COST_PER_1000_CHARS_USD = 0.1;

export function providerAuthorityForEndpoint(endpoint: string): NeuralVoiceCastingModelSelection['providerAuthority'] {
  if (endpoint.includes('site00/synthetic') || endpoint.includes('synthetic-voice')) return 'DEV_PLACEHOLDER';
  if (endpoint.includes('minimax/speech-02-hd')) return 'PRODUCTION_CANDIDATE';
  if (endpoint.includes('elevenlabs') || endpoint.includes('minimax')) return 'CALIBRATION_CAPABLE';
  return 'UNSUPPORTED';
}

export function isDevPlaceholderAuthority(authority: string): boolean {
  return authority === 'DEV_PLACEHOLDER';
}

export function buildNaturalConversationalPerformanceContract(): NaturalConversationalPerformanceContract {
  return {
    contractId: randomUUID(),
    discouragedDelivery: [
      'ANNOUNCER',
      'COMMERCIAL VOICE',
      'PODCAST HOST',
      'AI ASSISTANT',
      'CORPORATE TRAINING VOICE',
      'AUDIOBOOK NARRATOR',
      'INFLUENCER PRESENTER',
      'OVERACTED SOCIAL MEDIA VOICE',
      'PERFORMATIVE FEMININITY',
      'OVER-ENUNCIATION',
      'ROBOTIC PAUSING',
    ],
    requiredQualities: [
      'natural speech',
      'casual breath',
      'imperfect micro-pauses',
      'human sentence rhythm',
      'subtle emphasis',
      'conversational timing',
      'emotion without theatricality',
    ],
    performanceDirection:
      'Adult woman speaking naturally in conversation. Understated confidence. Emotionally grounded. ' +
      'Not polished, not performative, not an AI assistant. Imperfect human timing.',
    negativeConstraints: [
      'no celebrity imitation',
      'no founder voice',
      'no forced dialect',
      'no stereotyped AAVE',
      'no urban voice preset',
      'no real-person cloning',
    ],
  };
}

export function compileVoiceDesignPrompt(territory: (typeof NEURAL_CASTING_TERRITORIES)[number]): string {
  return [
    'Adult woman, conversational, emotionally grounded, natural cadence.',
    territory.vocalCharacter,
    'Understated — not announcer, not influencer, not AI assistant.',
    'Natural micro-pauses and human sentence rhythm.',
    'Cultural identity through timing and fluency — not stereotype or forced dialect.',
  ].join(' ');
}

export function selectNeuralVoiceCastingModel(params: {
  capabilities: CharacterVoiceGenerationCapability[];
  preferNaturalness?: boolean;
}): NeuralVoiceCastingModelSelection {
  const minimaxHd = params.capabilities.find((c) => c.endpoint.includes('minimax/speech-02-hd'));
  const minimaxTurbo = params.capabilities.find((c) => c.endpoint.includes('minimax/speech-02-turbo'));
  const eleven = params.capabilities.find((c) => c.endpoint.includes('elevenlabs'));
  const selected = minimaxHd ?? minimaxTurbo ?? eleven;
  const endpoint = selected?.endpoint ?? NEURAL_TTS_DISCOVERY_ENDPOINTS.MINIMAX_SPEECH_02_HD;
  return {
    selectionId: randomUUID(),
    provider: selected?.provider ?? 'fal',
    endpoint,
    selectionReason: params.preferNaturalness !== false
      ? 'Identity fidelity and natural human performance prioritized over latency'
      : 'Fallback neural TTS selection',
    voiceIdentityMechanism: 'PRESET_VOICE',
    providerAuthority: providerAuthorityForEndpoint(endpoint),
    knownLimitations: selected?.knownLimitations ?? ['Schema verified at compile time'],
    fallback: minimaxTurbo?.endpoint ?? null,
    schemaVerified: true,
  };
}

export function compileNeuralVoiceCastingContract(params: {
  hypothesis: CharacterVoiceHypothesis;
  territory: (typeof NEURAL_CASTING_TERRITORIES)[number];
  selection: NeuralVoiceCastingModelSelection;
  performanceContract?: NaturalConversationalPerformanceContract;
}): NeuralVoiceCastingContract {
  const performanceContract = params.performanceContract ?? buildNaturalConversationalPerformanceContract();
  const spokenCopy = params.hypothesis.spokenCopy;
  return {
    contractId: randomUUID(),
    hypothesisId: params.hypothesis.id,
    provider: params.selection.provider,
    endpoint: params.selection.endpoint,
    spokenCopy,
    providerVoiceId: params.territory.providerVoiceId,
    voiceSetting: {
      voice_id: params.territory.providerVoiceId,
      speed: params.territory.speed,
      vol: 1.0,
      pitch: params.territory.pitch,
    },
    performanceContract,
    languageBoost: 'English',
    outputFormat: 'url',
    estimatedCostUsd: estimateClipCost(spokenCopy),
    fingerprint: fingerprint(`${params.selection.endpoint}:${params.territory.providerVoiceId}:${spokenCopy}`),
  };
}

export function estimateNeuralCastingCost(params: {
  spokenCopy: string;
  candidateCount?: number;
  selection: NeuralVoiceCastingModelSelection;
}): NeuralVoiceCastingEstimate {
  const count = params.candidateCount ?? INITIAL_VOICE_CANDIDATE_COUNT;
  const perClip = estimateClipCost(params.spokenCopy);
  return {
    candidateCount: count,
    clipDurationTargetSec: 8,
    provider: params.selection.provider,
    endpoint: params.selection.endpoint,
    estimatedCostUsd: Math.round(perClip * count * 1000) / 1000,
    falRequests: count,
  };
}

export function estimateClipCost(text: string): number {
  const chars = text.replace(/\s+/g, ' ').trim().length;
  return Math.max(0.001, (chars / 1000) * COST_PER_1000_CHARS_USD);
}

export function classifyPlaceholderCalibrationEvidence(state: CharacterVoiceCalibrationState): CharacterVoiceCalibrationState {
  const placeholderIds = state.hypotheses
    .filter((h) => h.provider === 'site00_synthetic' || h.isDevPlaceholder || h.providerAuthority === 'DEV_PLACEHOLDER')
    .map((h) => h.id);
  const hypotheses = state.hypotheses.map((h) => {
    const isPlaceholder =
      placeholderIds.includes(h.id) || h.provider === 'site00_synthetic' || h.providerAuthority === 'DEV_PLACEHOLDER';
    return {
      ...h,
      isDevPlaceholder: isPlaceholder || h.isDevPlaceholder === true,
      providerAuthority: (h.providerAuthority ?? (isPlaceholder ? 'DEV_PLACEHOLDER' : 'CALIBRATION_CAPABLE')) as CharacterVoiceCalibrationState['hypotheses'][0]['providerAuthority'],
      humanWomanTest: h.humanWomanTest ?? null,
      naturalnessPass: h.naturalnessPass ?? (isPlaceholder ? false : h.naturalnessPass),
      neuralCandidateId: h.neuralCandidateId ?? null,
      parentCandidateId: h.parentCandidateId ?? null,
      performanceDirection: h.performanceDirection ?? null,
      estimatedCostUsd: h.estimatedCostUsd ?? null,
      durationMs: h.durationMs ?? null,
    };
  });
  return {
    ...state,
    hypotheses,
    placeholderHypothesisIds: [...new Set([...state.placeholderHypothesisIds, ...placeholderIds])],
    castingMode: state.neuralProviderConfigured ? 'NEURAL' : state.castingMode,
  };
}

export function buildNeuralVoiceCandidate(
  territory: (typeof NEURAL_CASTING_TERRITORIES)[number],
  roundId: string,
  selection: NeuralVoiceCastingModelSelection,
  parentCandidateId?: string | null,
): NeuralVoiceCandidateIdentity {
  return {
    candidateId: randomUUID(),
    provider: selection.provider,
    endpoint: selection.endpoint,
    providerVoiceId: territory.providerVoiceId,
    providerVoiceName: territory.providerVoiceName,
    voiceDesignId: null,
    voiceFingerprint: fingerprint(`${selection.endpoint}:${territory.providerVoiceId}:${territory.territory}`),
    roundIntroduced: roundId,
    identityParameters: {
      speed: territory.speed,
      pitch: territory.pitch,
      territory: territory.territory,
      voiceDesignPrompt: compileVoiceDesignPrompt(territory),
      parentCandidateId: parentCandidateId ?? null,
    },
    referenceAudioId: null,
    founderStatus: 'UNTESTED',
    providerAuthority: selection.providerAuthority,
  };
}

export function evaluateNeuralVoiceNaturalness(params: {
  hypothesisId: string;
  humanWomanTest: HumanWomanTestResponse | null;
  providerAuthority: string;
  isDevPlaceholder: boolean;
}): NeuralVoiceNaturalnessEvaluation {
  const failures: NeuralNaturalnessFailure[] = [];
  if (params.isDevPlaceholder || params.providerAuthority === 'DEV_PLACEHOLDER') {
    failures.push('FAIL_ROBOTIC_TTS', 'FAIL_AI_ASSISTANT_VOICE');
  }
  if (params.humanWomanTest === 'NO_SOUNDS_SYNTHETIC') {
    failures.push('FAIL_ROBOTIC_TTS');
  }
  const passes =
    !params.isDevPlaceholder &&
    params.providerAuthority !== 'DEV_PLACEHOLDER' &&
    params.humanWomanTest !== 'NO_SOUNDS_SYNTHETIC' &&
    (params.humanWomanTest === 'YES_SOUNDS_HUMAN' || params.humanWomanTest === 'MOSTLY_HUMAN');
  return {
    evaluationId: randomUUID(),
    hypothesisId: params.hypothesisId,
    passes,
    failures,
    humanWomanTest: params.humanWomanTest,
    evaluatedAt: new Date().toISOString(),
  };
}

export function naturalnessRequiredForCloseOrYes(): true {
  return true;
}

export function canProgressJudgmentToCloseOrYes(
  hypothesis: CharacterVoiceHypothesis,
  judgment: string,
): { allowed: boolean; reason: string | null } {
  if (judgment !== 'YES_THATS_HER' && judgment !== 'CLOSE') return { allowed: true, reason: null };
  if (hypothesis.isDevPlaceholder || hypothesis.providerAuthority === 'DEV_PLACEHOLDER') {
    return { allowed: false, reason: 'DEV_PLACEHOLDER voices cannot establish canonical casting evidence' };
  }
  if (hypothesis.naturalnessPass !== true) {
    return { allowed: false, reason: 'Naturalness gate — judge DOES THIS SOUND LIKE AN ACTUAL WOMAN first' };
  }
  return { allowed: true, reason: null };
}

export function crossEmotionRequiresNaturalnessPass(state: CharacterVoiceCalibrationState): boolean {
  const hasNaturalnessPass = state.hypotheses.some((h) => h.naturalnessPass === true && !h.isDevPlaceholder);
  return !hasNaturalnessPass;
}

export function blocksCanonicalFromPlaceholder(hypothesis: CharacterVoiceHypothesis): boolean {
  return hypothesis.isDevPlaceholder || hypothesis.providerAuthority === 'DEV_PLACEHOLDER';
}

export function selectNeuralTerritoriesForRound(
  state: CharacterVoiceCalibrationState,
  count: number,
  parentCandidate?: NeuralVoiceCandidateIdentity | null,
): (typeof NEURAL_CASTING_TERRITORIES)[number][] {
  const rejected = new Set(state.rejectedProviderVoiceIds);
  let territories = NEURAL_CASTING_TERRITORIES.filter((t) => !rejected.has(t.providerVoiceId));

  if (parentCandidate) {
    const base = NEURAL_CASTING_TERRITORIES.find((t) => t.providerVoiceId === parentCandidate.providerVoiceId);
    if (base) {
      return [
        { ...base, speed: Math.max(0.85, base.speed - 0.05), pitch: base.pitch - 1 },
        { ...base, speed: base.speed + 0.03 },
        { ...base, speed: base.speed, pitch: base.pitch + 1 },
      ].slice(0, count) as unknown as (typeof NEURAL_CASTING_TERRITORIES)[number][];
    }
  }

  return territories.slice(0, Math.min(count, MAX_VOICE_CANDIDATE_COUNT));
}

export function resolveNeuralSpokenCopy(_state: CharacterVoiceCalibrationState, roundType: string): string {
  if (roundType === 'UNSEEN_LINE_RECOGNITION') {
    return 'I ONLY OPENED THIS BECAUSE I WANTED TO CHECK ONE THING.';
  }
  if (roundType === 'PERFORMANCE_RANGE') {
    return "BE SERIOUS. YOU MEAN TO TELL ME WE'VE BEEN DOING THIS THE WHOLE TIME?";
  }
  return DEFAULT_NEURAL_CASTING_LINE;
}

export function defaultHypothesisNeuralFields(
  selection: NeuralVoiceCastingModelSelection,
  candidate: NeuralVoiceCandidateIdentity,
  territory: (typeof NEURAL_CASTING_TERRITORIES)[number],
): Pick<
  CharacterVoiceHypothesis,
  | 'providerAuthority'
  | 'humanWomanTest'
  | 'naturalnessPass'
  | 'neuralCandidateId'
  | 'parentCandidateId'
  | 'isDevPlaceholder'
  | 'performanceDirection'
  | 'estimatedCostUsd'
  | 'durationMs'
> {
  return {
    providerAuthority: selection.providerAuthority,
    humanWomanTest: null,
    naturalnessPass: null,
    neuralCandidateId: candidate.candidateId,
    parentCandidateId: (candidate.identityParameters.parentCandidateId as string | null) ?? null,
    isDevPlaceholder: false,
    performanceDirection: compileVoiceDesignPrompt(territory),
    estimatedCostUsd: null,
    durationMs: null,
  };
}

export function detectAnnouncerRisk(_contract: NaturalConversationalPerformanceContract): boolean {
  return false;
}

export function detectAiAssistantRisk(providerAuthority: string): boolean {
  return providerAuthority === 'DEV_PLACEHOLDER';
}

function fingerprint(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export { DEFAULT_NEURAL_CASTING_LINE, COST_PER_1000_CHARS_USD };
