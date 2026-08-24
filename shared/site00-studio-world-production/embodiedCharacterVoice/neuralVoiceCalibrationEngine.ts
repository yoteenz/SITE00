/**
 * P0.5E.4B.1 — Neural voice calibration round planning + generation hooks.
 */

import { randomUUID } from 'node:crypto';
import { EMBODIED_CHARACTER_VOICE_VERSION } from './constants.js';
import {
  buildNeuralVoiceCandidate,
  classifyPlaceholderCalibrationEvidence,
  compileNeuralVoiceCastingContract,
  defaultHypothesisNeuralFields,
  estimateNeuralCastingCost,
  evaluateNeuralVoiceNaturalness,
  resolveNeuralSpokenCopy,
  selectNeuralTerritoriesForRound,
  selectNeuralVoiceCastingModel,
} from './neuralVoiceCasting.js';
import { buildDefaultVoiceCapabilityRegistry, buildMinimaxHdTtsCapability } from './voiceGenerationCapability.js';
import {
  compileNextVoiceCalibrationRound,
  resolveRoundType,
} from './voiceCalibrationEngine.js';
import type {
  CharacterVoiceCalibrationRound,
  CharacterVoiceCalibrationState,
  CharacterVoiceHypothesis,
  HumanWomanTestResponse,
  NeuralVoiceCastingEstimate,
} from './types.js';

export function initializeNeuralCastingState(
  state: CharacterVoiceCalibrationState,
  neuralProviderConfigured: boolean,
): CharacterVoiceCalibrationState {
  const classified = classifyPlaceholderCalibrationEvidence(state);
  const capabilities = buildDefaultVoiceCapabilityRegistry();
  const selection = selectNeuralVoiceCastingModel({ capabilities: [...capabilities, buildMinimaxHdTtsCapability()] });
  return {
    ...classified,
    calibrationVersion: EMBODIED_CHARACTER_VOICE_VERSION,
    neuralProviderConfigured,
    castingMode: neuralProviderConfigured ? 'NEURAL' : 'DEV_PLACEHOLDER',
    selectedCastingProvider: selection,
    neuralCandidates: classified.neuralCandidates ?? [],
    rejectedProviderVoiceIds: classified.rejectedProviderVoiceIds ?? [],
    rejectedVocalRegions: classified.rejectedVocalRegions ?? [],
    placeholderHypothesisIds: classified.placeholderHypothesisIds ?? [],
    naturalnessEvaluations: classified.naturalnessEvaluations ?? [],
    characterVoiceLocked: false,
    providerLocked: false,
    pendingCostEstimate: null,
  };
}

export function estimateNeuralAudition(state: CharacterVoiceCalibrationState): NeuralVoiceCastingEstimate {
  const selection =
    state.selectedCastingProvider ??
    selectNeuralVoiceCastingModel({ capabilities: buildDefaultVoiceCapabilityRegistry() });
  const spokenCopy = resolveNeuralSpokenCopy(state, 'BROAD_CASTING');
  return estimateNeuralCastingCost({ spokenCopy, selection });
}

export function planNeuralVoiceCalibrationRound(state: CharacterVoiceCalibrationState): {
  state: CharacterVoiceCalibrationState;
  round: CharacterVoiceCalibrationRound;
  hypotheses: CharacterVoiceHypothesis[];
  contracts: ReturnType<typeof compileNeuralVoiceCastingContract>[];
} {
  if (!state.neuralProviderConfigured) {
    throw new Error('NEURAL_VOICE_PROVIDER_NOT_CONFIGURED');
  }

  const roundNumber = state.rounds.filter((r) => r.isNeuralRound).length + 1;
  const roundType = resolveRoundType(state, state.rounds.length + 1);
  if (roundType === 'PERFORMANCE_RANGE' && state.hypotheses.every((h) => h.naturalnessPass !== true)) {
    throw new Error('Cross-emotion testing blocked until naturalness pass');
  }

  const spokenCopy = resolveNeuralSpokenCopy(state, roundType);
  const roundId = randomUUID();
  const selection = state.selectedCastingProvider!;
  const closeParent = state.neuralCandidates.find((c) => c.founderStatus === 'CLOSE' || c.founderStatus === 'YES');
  const territories = selectNeuralTerritoriesForRound(state, roundNumber === 1 ? 4 : 3, closeParent ?? null);
  const performanceContract = undefined;

  const candidates = territories.map((t) => buildNeuralVoiceCandidate(t, roundId, selection, closeParent?.candidateId));
  const hypotheses: CharacterVoiceHypothesis[] = territories.map((territory, i) => {
    const candidate = candidates[i]!;
    const base: CharacterVoiceHypothesis = {
      id: randomUUID(),
      characterId: state.characterId,
      roundId,
      hypothesisLabel: territory.label,
      vocalCharacter: territory.vocalCharacter,
      whyItFitsCharacter:
        territory.performanceDirection ??
        `Internal territory: ${territory.territory}. Natural conversational adult female presence.`,
      primaryDifferencesFromSiblings: territories.filter((_, j) => j !== i).map((t) => `${t.label}: ${t.territory}`),
      provider: selection.provider,
      model: selection.endpoint,
      voiceId: territory.providerVoiceId,
      generationSettings: { voice_setting: { voice_id: territory.providerVoiceId, speed: territory.speed, pitch: territory.pitch } },
      predictedTraits: [...territory.traits],
      uncertainTraits: ['pause rhythm', 'humor in voice vs pause'],
      deliberatelyVariedTraits: [...territory.varied],
      spokenCopy,
      emotionalState: roundType === 'PERFORMANCE_RANGE' ? 'PLAYFUL' : 'NEUTRAL',
      audioAssetId: null,
      audioUrl: null,
      playbackProfile: null,
      spokenLineId: randomUUID(),
      founderJudgment: null,
      founderNote: null,
      status: 'GENERATED',
      generatedAt: new Date().toISOString(),
      ...defaultHypothesisNeuralFields(selection, candidate, territory),
    };
    return base;
  });

  const contracts = hypotheses.map((h, i) =>
    compileNeuralVoiceCastingContract({
      hypothesis: h,
      territory: territories[i]!,
      selection,
      performanceContract,
    }),
  );

  const round: CharacterVoiceCalibrationRound = {
    roundId,
    roundNumber: state.rounds.length + 1,
    roundType,
    question: state.pendingRoundQuestion ?? (roundNumber === 1 ? 'Which general vocal presence feels like her?' : 'Narrowing around what you kept.'),
    spokenCopy,
    languageEvidenceId: state.languageEvidence[0]?.evidenceId ?? null,
    hypothesisIds: hypotheses.map((h) => h.id),
    sameLineAcrossCandidates: true,
    status: 'GENERATING',
    blindAudition: state.blindAuditionMode,
    pairwiseComparisonId: null,
    castingMode: 'NEURAL',
    isNeuralRound: true,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  const estimate = estimateNeuralCastingCost({ spokenCopy, candidateCount: hypotheses.length, selection });

  return {
    state: {
      ...state,
      rounds: [...state.rounds, round],
      hypotheses: [...state.hypotheses, ...hypotheses],
      neuralCandidates: [...state.neuralCandidates, ...candidates],
      pendingCostEstimate: estimate,
      sessionMessage: state.sessionMessage ?? "LET'S FIND HER ACTUAL VOICE.",
      castingMode: 'NEURAL',
      castingTerritoryPlan: null,
      pendingRoundQuestion: null,
      updatedAt: new Date().toISOString(),
    },
    round,
    hypotheses,
    contracts,
  };
}

export function applyNeuralGenerationResults(
  state: CharacterVoiceCalibrationState,
  roundId: string,
  results: Array<{ hypothesisId: string; audioUrl: string; durationMs: number; costUsd: number }>,
): CharacterVoiceCalibrationState {
  const resultMap = new Map(results.map((r) => [r.hypothesisId, r]));
  const hypotheses = state.hypotheses.map((h) => {
    const r = resultMap.get(h.id);
    if (!r) return h;
    return {
      ...h,
      audioUrl: r.audioUrl,
      audioAssetId: `neural-audio-${h.id}`,
      durationMs: r.durationMs,
      estimatedCostUsd: r.costUsd,
      status: 'GENERATED' as const,
    };
  });
  const rounds = state.rounds.map((r) =>
    r.roundId === roundId ? { ...r, status: 'READY_FOR_JUDGMENT' as const } : r,
  );
  const actualCost = results.reduce((sum, r) => sum + r.costUsd, 0);
  return {
    ...state,
    hypotheses,
    rounds,
    audioAssetsGenerated: state.audioAssetsGenerated + results.length,
    falRequests: state.falRequests + results.length,
    voiceRequests: state.voiceRequests + results.length,
    actualCost: state.actualCost + actualCost,
    estimatedCost: state.estimatedCost + actualCost,
    pendingCostEstimate: null,
    updatedAt: new Date().toISOString(),
  };
}

export function applyHumanWomanTest(
  state: CharacterVoiceCalibrationState,
  hypothesisId: string,
  response: HumanWomanTestResponse,
): CharacterVoiceCalibrationState {
  const hypothesis = state.hypotheses.find((h) => h.id === hypothesisId);
  if (!hypothesis) return state;
  const evaluation = evaluateNeuralVoiceNaturalness({
    hypothesisId,
    humanWomanTest: response,
    providerAuthority: hypothesis.providerAuthority,
    isDevPlaceholder: hypothesis.isDevPlaceholder,
  });
  const hypotheses = state.hypotheses.map((h) =>
    h.id === hypothesisId
      ? { ...h, humanWomanTest: response, naturalnessPass: evaluation.passes }
      : h,
  );
  return {
    ...state,
    hypotheses,
    naturalnessEvaluations: [...state.naturalnessEvaluations, evaluation],
    updatedAt: new Date().toISOString(),
  };
}

/** Dev-only: plan placeholder round using legacy engine */
export function planDevPlaceholderRound(state: CharacterVoiceCalibrationState) {
  return compileNextVoiceCalibrationRound(state);
}
