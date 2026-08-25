/**
 * P0.5E.4C — Casting round generation, judgments, merge, and next-round refinement.
 */

import { randomUUID } from 'node:crypto';
import {
  CASTING_VARIATION_AXES,
  DEFAULT_CASTING_CANDIDATE_COUNT,
  FINAL_IDENTITY_EXPRESSIONS,
  FINAL_IDENTITY_POSES,
  FINAL_IDENTITY_VIEWS,
} from './constants.js';
import { buildInitialCastingPromptMatrix, compileCharacterCastingPromptContract } from './promptContract.js';
import { estimateCastingRoundCost, recommendStillImageCastingProvider } from './providerSelection.js';
import { syncPipelineState } from './stateMachine.js';
import { founderReferencePromptNotes, migrateCastingStateFounderReferences } from './founderReferenceIngestion.js';
import {
  generateCharacterBibleAssetPackRound,
  hasActiveReferenceAuthority,
  migrateReferenceDrivenCastingState,
} from './referenceDrivenCasting.js';
import { storePromptContractSnapshot } from './promptContract.js';
import type {
  CastingPrimaryJudgment,
  CastingVariationAxis,
  CharacterCastingCandidate,
  CharacterCastingMergeRequest,
  CharacterCastingRound,
  CharacterVisualCastingState,
  MergeTraitOption,
} from './types.js';

export function planInitialCastingRound(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
}): { state: CharacterVisualCastingState; estimate: { candidateCount: number; costUsd: number | null; provider: string | null; model: string | null } } {
  const snapshot = params.state.truthSnapshots.find((s) => s.snapshotId === params.state.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');
  const rec = recommendStillImageCastingProvider(params.falConfigured);
  return {
    state: params.state,
    estimate: {
      candidateCount: DEFAULT_CASTING_CANDIDATE_COUNT,
      costUsd: estimateCastingRoundCost(DEFAULT_CASTING_CANDIDATE_COUNT, params.falConfigured),
      provider: rec.provider,
      model: rec.model,
    },
  };
}

export function generateCastingRoundPlaceholders(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
}): CharacterVisualCastingState {
  const snapshot = params.state.truthSnapshots.find((s) => s.snapshotId === params.state.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');
  if (!params.state.visualCastingReady) throw new Error('Visual casting not ready');

  const migrated = migrateCastingStateFounderReferences(params.state);
  const referenceNotes = founderReferencePromptNotes(migrated);
  const contracts = buildInitialCastingPromptMatrix(snapshot, referenceNotes);
  let working = migrated;
  for (const contract of contracts) {
    working = storePromptContractSnapshot(working, contract);
  }
  const rec = recommendStillImageCastingProvider(params.falConfigured);
  const roundNumber = params.state.rounds.length + 1;
  const roundId = randomUUID();

  const candidates: CharacterCastingCandidate[] = contracts.map((contract, index) => ({
    candidateId: randomUUID(),
    roundId,
    characterTruthSnapshotId: snapshot.snapshotId,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    promptSnapshotId: contract.contractId,
    variationAxis: contract.variationAxis,
    assetSlot: null,
    generationMode: hasActiveReferenceAuthority(working) ? 'REFERENCE_DRIVEN' : 'LEGACY_VARIATION',
    outputAssetId: null,
    previewUrl: params.dispatchFal ? null : `/api/placeholder/casting/${roundNumber}-${index + 1}`,
    createdAt: new Date().toISOString(),
    founderJudgment: null,
    deeperJudgment: null,
    strengths: [],
    weaknesses: [],
    castingStatus: 'UNREVIEWED',
    founderNote: null,
  }));

  const round: CharacterCastingRound = {
    roundId,
    roundNumber,
    characterId: snapshot.characterId,
    characterTruthSnapshotId: snapshot.snapshotId,
    candidateIds: candidates.map((c) => c.candidateId),
    generationContractId: contracts[0]?.contractId ?? null,
    generationMode: hasActiveReferenceAuthority(working) ? 'REFERENCE_DRIVEN' : 'LEGACY_VARIATION',
    referenceAuthorityId: working.activeReferenceAuthority?.authorityId ?? null,
    assetPackId: null,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    costUsd: params.dispatchFal ? estimateCastingRoundCost(candidates.length, params.falConfigured) : 0,
    createdAt: new Date().toISOString(),
    status: params.dispatchFal ? 'GENERATING' : 'REVIEW_READY',
    retainedTraits: [],
    variedTraits: contracts.map((c) => c.variationAxis),
    rejectedTraits: [],
    basedOnPriorTruthSnapshotId: null,
  };

  return syncPipelineState({
    ...working,
    rounds: [...params.state.rounds, round],
    candidates: [...params.state.candidates, ...candidates],
    castingCandidatesReady: !params.dispatchFal,
    falImageRequests: params.state.falImageRequests + (params.dispatchFal ? candidates.length : 0),
    falVideoRequests: 0,
  });
}

export function applyCastingJudgment(params: {
  state: CharacterVisualCastingState;
  candidateId: string;
  judgment: CastingPrimaryJudgment;
  note?: string;
}): CharacterVisualCastingState {
  const candidate = params.state.candidates.find((c) => c.candidateId === params.candidateId);
  if (!candidate) throw new Error('Candidate not found');

  const castingStatus: CharacterCastingCandidate['castingStatus'] =
    params.judgment === 'THATS_HER'
      ? 'SELECTED'
      : params.judgment === 'CLOSE' || params.judgment === 'RIGHT_FACE_WRONG_ENERGY' || params.judgment === 'RIGHT_ENERGY_WRONG_STYLING'
        ? 'CLOSE'
        : params.judgment === 'NOT_HER'
          ? 'REJECTED'
          : 'SHORTLISTED';

  const candidates = params.state.candidates.map((c) =>
    c.candidateId === params.candidateId
      ? {
          ...c,
          founderJudgment: params.judgment,
          founderNote: params.note ?? null,
          castingStatus,
        }
      : c,
  );

  let selectedCandidateId = params.state.selectedCandidateId;
  if (params.judgment === 'THATS_HER') {
    selectedCandidateId = params.candidateId;
  }

  return syncPipelineState({
    ...params.state,
    candidates,
    selectedCandidateId,
  });
}

export function createCastingMergeRequest(params: {
  state: CharacterVisualCastingState;
  candidateIds: string[];
  retainFromEach: Partial<Record<string, MergeTraitOption[]>>;
}): CharacterVisualCastingState {
  if (params.candidateIds.length < 2 || params.candidateIds.length > 3) {
    throw new Error('MIX THESE requires 2–3 candidates');
  }
  const round = params.state.rounds.at(-1);
  if (!round) throw new Error('No casting round');

  const merge: CharacterCastingMergeRequest = {
    mergeRequestId: randomUUID(),
    roundId: round.roundId,
    candidateIds: params.candidateIds,
    retainFromEach: params.retainFromEach,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };

  return syncPipelineState({
    ...params.state,
    mergeRequests: [...params.state.mergeRequests, merge],
  });
}

export function deriveNextRoundTraitsFromFeedback(state: CharacterVisualCastingState): {
  retainedTraits: MergeTraitOption[];
  variedTraits: CastingVariationAxis[];
  rejectedTraits: string[];
} {
  const latestRound = state.rounds.at(-1);
  const roundCandidates = state.candidates.filter((c) => c.roundId === latestRound?.roundId);
  const retainedTraits: MergeTraitOption[] = [];
  const variedTraits: CastingVariationAxis[] = [];
  const rejectedTraits: string[] = [];

  for (const c of roundCandidates) {
    if (c.founderJudgment === 'NOT_HER') {
      rejectedTraits.push(c.variationAxis);
      continue;
    }
    if (c.founderJudgment === 'RIGHT_FACE_WRONG_ENERGY') {
      retainedTraits.push('FACE', 'PRESENCE');
      variedTraits.push('WARDROBE_ENERGY', 'STYLING_POLISH');
    }
    if (c.founderJudgment === 'RIGHT_ENERGY_WRONG_STYLING') {
      retainedTraits.push('PRESENCE', 'STYLING', 'CAMERA_ENERGY');
      variedTraits.push('FACE_STRUCTURE');
    }
    if (c.founderJudgment === 'CLOSE' || c.founderJudgment === 'THATS_HER') {
      retainedTraits.push('PRESENCE');
    }
  }

  return {
    retainedTraits: [...new Set(retainedTraits)],
    variedTraits: [...new Set(variedTraits.length ? variedTraits : (['HAIR_PROTECTIVE_STYLE'] as CastingVariationAxis[]))],
    rejectedTraits: [...new Set(rejectedTraits)],
  };
}

export function applyCastingGenerationResults(params: {
  state: CharacterVisualCastingState;
  roundId: string;
  results: Array<{ candidateId: string; previewUrl: string; outputAssetId: string; model?: string }>;
  model?: string;
}): CharacterVisualCastingState {
  const resultById = new Map(params.results.map((r) => [r.candidateId, r]));
  const candidates = params.state.candidates.map((c) => {
    const result = resultById.get(c.candidateId);
    if (!result) return c;
    return {
      ...c,
      previewUrl: result.previewUrl,
      outputAssetId: result.outputAssetId,
      model: result.model ?? params.model ?? c.model,
    };
  });
  const rounds = params.state.rounds.map((r) =>
    r.roundId === params.roundId
      ? { ...r, status: 'REVIEW_READY' as const, model: params.model ?? r.model }
      : r,
  );
  return syncPipelineState({
    ...params.state,
    candidates,
    rounds,
    castingCandidatesReady: true,
    characterBibleAssetPack: params.state.characterBibleAssetPack
      ? {
          ...params.state.characterBibleAssetPack,
          status: 'REVIEW',
        }
      : null,
  });
}

export function prepareCastingRoundForFalRetry(params: {
  state: CharacterVisualCastingState;
  roundId: string;
  falConfigured: boolean;
}): CharacterVisualCastingState {
  const round = params.state.rounds.find((entry) => entry.roundId === params.roundId);
  if (!round) throw new Error('Casting round not found');

  const roundCandidates = params.state.candidates.filter((entry) => entry.roundId === params.roundId);
  if (roundCandidates.length === 0) throw new Error('Casting round has no candidates');
  if (!roundCandidates.every((entry) => !entry.previewUrl || entry.previewUrl.includes('/api/placeholder/'))) {
    throw new Error('Round already has generated stills');
  }

  const rec = recommendStillImageCastingProvider(params.falConfigured);
  const candidates = params.state.candidates.map((entry) =>
    entry.roundId === params.roundId
      ? { ...entry, previewUrl: null, outputAssetId: null, model: rec.model ?? entry.model }
      : entry,
  );
  const rounds = params.state.rounds.map((entry) =>
    entry.roundId === params.roundId
      ? {
          ...entry,
          status: 'GENERATING' as const,
          model: rec.model ?? entry.model,
          costUsd: estimateCastingRoundCost(roundCandidates.length, params.falConfigured),
        }
      : entry,
  );

  return syncPipelineState({
    ...params.state,
    candidates,
    rounds,
    castingCandidatesReady: false,
    falImageRequests: params.state.falImageRequests + roundCandidates.length,
  });
}

export function applyCastingGenerationFailure(params: {
  state: CharacterVisualCastingState;
  roundId: string;
  errorMessage: string;
}): CharacterVisualCastingState {
  const rounds = params.state.rounds.map((entry) =>
    entry.roundId === params.roundId ? { ...entry, status: 'REVIEW_READY' as const } : entry,
  );
  return syncPipelineState({
    ...params.state,
    rounds,
    castingCandidatesReady: false,
    falGenerationTracking: params.state.falGenerationTracking
      ? {
          ...params.state.falGenerationTracking,
          status: 'FAILED',
          errorMessage: params.errorMessage,
        }
      : {
          attemptId: 'unknown',
          roundId: params.roundId,
          startedAt: new Date().toISOString(),
          status: 'FAILED',
          errorMessage: params.errorMessage,
        },
  });
}

export function generateNextCastingRoundFromFeedback(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
}): CharacterVisualCastingState {
  const migrated = migrateReferenceDrivenCastingState(params.state);
  if (hasActiveReferenceAuthority(migrated)) {
    return generateCharacterBibleAssetPackRound({
      state: migrated,
      falConfigured: params.falConfigured,
      dispatchFal: params.dispatchFal,
    });
  }

  const snapshot = migrated.truthSnapshots.find((s) => s.snapshotId === migrated.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Snapshot required');
  const feedback = deriveNextRoundTraitsFromFeedback(migrated);
  const axis = feedback.variedTraits[0] ?? 'HAIR_PROTECTIVE_STYLE';
  const referenceNotes = founderReferencePromptNotes(migrateCastingStateFounderReferences(migrated));
  const contract = compileCharacterCastingPromptContract({
    snapshot,
    variationAxis: axis,
    founderReferenceNotes: referenceNotes,
  });
  let working = storePromptContractSnapshot(migrated, contract);
  const rec = recommendStillImageCastingProvider(params.falConfigured);
  const roundId = randomUUID();
  const roundNumber = migrated.rounds.length + 1;

  const candidates: CharacterCastingCandidate[] = CASTING_VARIATION_AXES.slice(0, 6).map((variationAxis, index) => ({
    candidateId: randomUUID(),
    roundId,
    characterTruthSnapshotId: snapshot.snapshotId,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    promptSnapshotId: contract.contractId,
    variationAxis,
    assetSlot: null,
    generationMode: 'LEGACY_VARIATION' as const,
    outputAssetId: null,
    previewUrl: params.dispatchFal ? null : `/api/placeholder/casting/r${roundNumber}-${index + 1}`,
    createdAt: new Date().toISOString(),
    founderJudgment: null,
    deeperJudgment: null,
    strengths: [],
    weaknesses: [],
    castingStatus: 'UNREVIEWED',
    founderNote: null,
  }));

  const round: CharacterCastingRound = {
    roundId,
    roundNumber,
    characterId: snapshot.characterId,
    characterTruthSnapshotId: snapshot.snapshotId,
    candidateIds: candidates.map((c) => c.candidateId),
    generationContractId: contract.contractId,
    generationMode: 'LEGACY_VARIATION',
    referenceAuthorityId: null,
    assetPackId: null,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    costUsd: params.dispatchFal ? estimateCastingRoundCost(candidates.length, params.falConfigured) : 0,
    createdAt: new Date().toISOString(),
    status: params.dispatchFal ? 'GENERATING' : 'REVIEW_READY',
    retainedTraits: feedback.retainedTraits,
    variedTraits: feedback.variedTraits,
    rejectedTraits: feedback.rejectedTraits,
    basedOnPriorTruthSnapshotId: snapshot.snapshotId,
  };

  return syncPipelineState({
    ...working,
    rounds: [...migrated.rounds.map((r) => ({ ...r, status: r.status === 'REVIEW_READY' ? 'COMPLETE' as const : r.status })), round],
    candidates: [...migrated.candidates, ...candidates],
    castingCandidatesReady: !params.dispatchFal,
    falImageRequests: migrated.falImageRequests + (params.dispatchFal ? candidates.length : 0),
  });
}

export function generateFinalIdentityConfirmationRound(state: CharacterVisualCastingState): CharacterVisualCastingState {
  const selected = state.candidates.find((c) => c.candidateId === state.selectedCandidateId);
  if (!selected) throw new Error('Select THATS HER before final identity confirmation');
  const roundId = randomUUID();
  const views = [...FINAL_IDENTITY_VIEWS, ...FINAL_IDENTITY_EXPRESSIONS, ...FINAL_IDENTITY_POSES];
  const candidates: CharacterCastingCandidate[] = views.map((view, index) => ({
    candidateId: randomUUID(),
    roundId,
    characterTruthSnapshotId: selected.characterTruthSnapshotId,
    provider: selected.provider,
    model: selected.model,
    promptSnapshotId: selected.promptSnapshotId,
    variationAxis: 'FACE_STRUCTURE',
    assetSlot: null,
    generationMode: 'LEGACY_VARIATION',
    outputAssetId: null,
    previewUrl: `/api/placeholder/casting/final-${index + 1}`,
    createdAt: new Date().toISOString(),
    founderJudgment: null,
    deeperJudgment: null,
    strengths: [],
    weaknesses: [],
    castingStatus: 'UNREVIEWED',
    founderNote: view,
  }));

  const round: CharacterCastingRound = {
    roundId,
    roundNumber: state.rounds.length + 1,
    characterId: 'ndx',
    characterTruthSnapshotId: selected.characterTruthSnapshotId,
    candidateIds: candidates.map((c) => c.candidateId),
    generationContractId: selected.promptSnapshotId,
    generationMode: 'LEGACY_VARIATION',
    referenceAuthorityId: null,
    assetPackId: null,
    provider: selected.provider,
    model: selected.model,
    costUsd: 0,
    createdAt: new Date().toISOString(),
    status: 'REVIEW_READY',
    retainedTraits: ['FACE', 'PRESENCE'],
    variedTraits: [],
    rejectedTraits: [],
    basedOnPriorTruthSnapshotId: selected.characterTruthSnapshotId,
  };

  return syncPipelineState({
    ...state,
    finalIdentityConfirmationRoundId: roundId,
    rounds: [...state.rounds, round],
    candidates: [...state.candidates, ...candidates],
  });
}

export function lockFinalVisualIdentity(state: CharacterVisualCastingState): CharacterVisualCastingState {
  if (!state.selectedCandidateId) throw new Error('LOCK HER requires selected candidate');
  const packId = randomUUID();
  return syncPipelineState({
    ...state,
    finalVisualIdentityApproved: true,
    characterReferencePackReady: true,
    continuityTestReady: true,
    referencePackSummary: {
      packId,
      faceAnchors: 3,
      expressionAnchors: FINAL_IDENTITY_EXPRESSIONS.length,
      hairAnchors: 1,
      wardrobeAnchors: 1,
      negativeConstraints: 9,
    },
  });
}

export function mergeDoesNotBlindlyAverageFaces(merge: CharacterCastingMergeRequest): boolean {
  const traits = Object.values(merge.retainFromEach).flat();
  return traits.includes('FACE') && traits.length >= 2;
}
