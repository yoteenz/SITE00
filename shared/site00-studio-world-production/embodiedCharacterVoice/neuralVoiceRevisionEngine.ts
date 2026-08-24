/**
 * P0.5E.4B.1+ — Neural voice regenerate / replay generation authority.
 */

import { randomUUID } from 'node:crypto';
import type { GenerationMode } from '../generationAuthority/types.js';
import type {
  CharacterVoiceCalibrationState,
  CharacterVoiceHypothesis,
  NeuralVoiceCastingContract,
  NeuralVoiceCastingModelSelection,
  NeuralVoiceGenerationAsset,
  NeuralVoicePromptSnapshot,
} from './types.js';
import {
  applyFounderRevisionToVoiceHypothesis,
  compileVoicePromptSnapshot,
  rebuildTerritoryFromHypothesis,
} from './neuralVoiceFounderRevisionPipeline.js';
import {
  buildNaturalConversationalPerformanceContract,
  compileNeuralVoiceCastingContract,
  selectNeuralVoiceCastingModel,
} from './neuralVoiceCasting.js';
import { buildDefaultVoiceCapabilityRegistry, buildMinimaxHdTtsCapability } from './voiceGenerationCapability.js';
import type { FounderVoiceJudgment } from './types.js';

export const NEURAL_VOICE_REGENERATE_CURRENT_SUPPORTED = true as const;
export const NEURAL_VOICE_REPLAY_GENERATION_SUPPORTED = true as const;

function resolveSelection(state: CharacterVoiceCalibrationState): NeuralVoiceCastingModelSelection {
  return (
    state.selectedCastingProvider ??
    selectNeuralVoiceCastingModel({
      capabilities: [...buildDefaultVoiceCapabilityRegistry(), buildMinimaxHdTtsCapability()],
    })
  );
}

export function applyFounderNeuralVoiceRevision(params: {
  state: CharacterVoiceCalibrationState;
  hypothesisId: string;
  judgment: FounderVoiceJudgment;
  founderNote: string;
}): CharacterVoiceCalibrationState {
  const hypothesis = params.state.hypotheses.find((h) => h.id === params.hypothesisId);
  if (!hypothesis) throw new Error('Voice hypothesis not found');
  if (hypothesis.isDevPlaceholder) throw new Error('Placeholder voice cannot be revised via neural pipeline');

  const note = params.founderNote.trim();
  if (!note) throw new Error('Founder revision note is required');

  const selection = resolveSelection(params.state);
  const revised = applyFounderRevisionToVoiceHypothesis({
    hypothesis,
    selection,
    judgment: params.judgment,
    founderNote: note,
  });

  const hypotheses = params.state.hypotheses.map((h) => (h.id === params.hypothesisId ? revised : h));
  return {
    ...params.state,
    hypotheses,
    sessionMessage: 'RE-SYNTHESIZING VOICE WITH YOUR REVISION NOTE…',
    updatedAt: new Date().toISOString(),
  };
}

export function prepareNeuralVoiceRegeneration(params: {
  state: CharacterVoiceCalibrationState;
  hypothesisId: string;
  mode: GenerationMode;
}): { state: CharacterVoiceCalibrationState; contract: NeuralVoiceCastingContract } {
  const hypothesis = params.state.hypotheses.find((h) => h.id === params.hypothesisId);
  if (!hypothesis) throw new Error('Voice hypothesis not found');
  if (hypothesis.isDevPlaceholder) throw new Error('Placeholder voice cannot be regenerated');

  const selection = resolveSelection(params.state);

  if (params.mode === 'REPLAY_GENERATION') {
    const snapshots = hypothesis.promptSnapshots ?? [];
    const replay = snapshots[snapshots.length - 1];
    if (!replay) throw new Error('No historical prompt snapshot to replay');
    const territory = rebuildTerritoryFromHypothesis({
      ...hypothesis,
      spokenCopy: replay.spokenCopy,
      performanceDirection: replay.performanceDirection,
      generationSettings: { voice_setting: replay.voiceSetting },
    });
    const contract = compileNeuralVoiceCastingContract({
      hypothesis: { ...hypothesis, spokenCopy: replay.spokenCopy, performanceDirection: replay.performanceDirection },
      territory,
      selection,
      performanceContract: buildNaturalConversationalPerformanceContract(),
    });
    const generating = markHypothesisGenerating(hypothesis, contract, 'REPLAY_GENERATION', replay.revisionDirective);
    return {
      state: replaceHypothesis(params.state, generating),
      contract,
    };
  }

  const territory = rebuildTerritoryFromHypothesis(hypothesis);
  const contract =
    hypothesis.castingContract ??
    compileNeuralVoiceCastingContract({
      hypothesis,
      territory,
      selection,
      performanceContract: buildNaturalConversationalPerformanceContract(),
    });
  const generating = markHypothesisGenerating(hypothesis, contract, 'REGENERATE_CURRENT', null);
  return {
    state: replaceHypothesis(params.state, generating),
    contract,
  };
}

function markHypothesisGenerating(
  hypothesis: CharacterVoiceHypothesis,
  contract: NeuralVoiceCastingContract,
  triggerSource: NeuralVoicePromptSnapshot['triggerSource'],
  revisionDirective: string | null,
): CharacterVoiceHypothesis {
  const promptSnapshot = compileVoicePromptSnapshot({
    hypothesis,
    contract,
    triggerSource,
    revisionDirective,
  });
  return {
    ...hypothesis,
    castingContract: contract,
    generationStatus: 'GENERATING',
    parentAudioUrl: hypothesis.audioUrl,
    promptSnapshots: [...(hypothesis.promptSnapshots ?? []), promptSnapshot],
  };
}

function replaceHypothesis(
  state: CharacterVoiceCalibrationState,
  hypothesis: CharacterVoiceHypothesis,
): CharacterVoiceCalibrationState {
  return {
    ...state,
    hypotheses: state.hypotheses.map((h) => (h.id === hypothesis.id ? hypothesis : h)),
    sessionMessage: 'RE-SYNTHESIZING VOICE CLIP…',
    updatedAt: new Date().toISOString(),
  };
}

export function applyNeuralVoiceRegenerationResult(params: {
  state: CharacterVoiceCalibrationState;
  hypothesisId: string;
  audioUrl: string;
  durationMs: number;
  costUsd: number;
  failed?: boolean;
}): CharacterVoiceCalibrationState {
  const hypothesis = params.state.hypotheses.find((h) => h.id === params.hypothesisId);
  if (!hypothesis) return params.state;

  const generationStatus = params.failed ? 'FAILED' : 'GENERATED';
  const snapshots = hypothesis.promptSnapshots ?? [];
  const latestSnapshot = snapshots[snapshots.length - 1];

  const generationAsset: NeuralVoiceGenerationAsset | null =
    !params.failed && latestSnapshot
      ? {
          assetId: `nva-${randomUUID().slice(0, 8)}`,
          audioUrl: params.audioUrl,
          promptSnapshotId: latestSnapshot.snapshotId,
          lineageClassification: 'CURRENT',
          createdAt: new Date().toISOString(),
        }
      : null;

  const priorAssets = (hypothesis.generationAssets ?? []).map((a) => ({
    ...a,
    lineageClassification: 'HISTORICAL' as const,
  }));

  const revisionHistory = [...(hypothesis.revisionHistory ?? [])];
  const lastRev = revisionHistory[revisionHistory.length - 1];
  if (lastRev?.status === 'GENERATING') {
    revisionHistory[revisionHistory.length - 1] = {
      ...lastRev,
      status: params.failed ? 'FAILED' : 'GENERATED',
      generatedAudioUrl: params.failed ? null : params.audioUrl,
    };
  }

  const updatedHypothesis: CharacterVoiceHypothesis = {
    ...hypothesis,
    audioUrl: params.failed ? hypothesis.audioUrl : params.audioUrl,
    audioAssetId: params.failed ? hypothesis.audioAssetId : `neural-audio-${hypothesis.id}-${Date.now()}`,
    durationMs: params.durationMs,
    estimatedCostUsd: params.costUsd,
    generationStatus,
    generationAssets: generationAsset ? [...priorAssets, generationAsset] : priorAssets,
    revisionHistory,
    status: 'GENERATED',
  };

  const hypotheses = params.state.hypotheses.map((h) => (h.id === params.hypothesisId ? updatedHypothesis : h));

  return {
    ...params.state,
    hypotheses,
    audioAssetsGenerated: params.failed ? params.state.audioAssetsGenerated : params.state.audioAssetsGenerated + 1,
    falRequests: params.failed ? params.state.falRequests : params.state.falRequests + 1,
    voiceRequests: params.failed ? params.state.voiceRequests : params.state.voiceRequests + 1,
    actualCost: params.failed ? params.state.actualCost : params.state.actualCost + params.costUsd,
    estimatedCost: params.failed ? params.state.estimatedCost : params.state.estimatedCost + params.costUsd,
    sessionMessage: params.failed ? 'VOICE RE-SYNTHESIS FAILED — TRY REGENERATE CURRENT.' : 'VOICE REVISION READY — LISTEN AND JUDGE.',
    updatedAt: new Date().toISOString(),
  };
}

export function attachInitialNeuralGenerationMetadata(params: {
  hypothesis: CharacterVoiceHypothesis;
  contract: NeuralVoiceCastingContract;
  audioUrl: string;
  durationMs: number;
  costUsd: number;
}): CharacterVoiceHypothesis {
  const snapshot = compileVoicePromptSnapshot({
    hypothesis: params.hypothesis,
    contract: params.contract,
    triggerSource: 'INITIAL',
  });
  const asset: NeuralVoiceGenerationAsset = {
    assetId: `nva-${randomUUID().slice(0, 8)}`,
    audioUrl: params.audioUrl,
    promptSnapshotId: snapshot.snapshotId,
    lineageClassification: 'CURRENT',
    createdAt: new Date().toISOString(),
  };
  return {
    ...params.hypothesis,
    castingContract: params.contract,
    generationStatus: 'GENERATED',
    promptSnapshots: [snapshot],
    generationAssets: [asset],
    revisionHistory: params.hypothesis.revisionHistory ?? [],
    parentAudioUrl: null,
  };
}
