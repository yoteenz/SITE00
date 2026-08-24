/**
 * P0.5E.4B.1+ — Founder revision notes → voice contract update → neural re-synthesis.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { FounderVoiceJudgment } from './types.js';
import type {
  CharacterVoiceHypothesis,
  NeuralCastingTerritory,
  NeuralVoiceCastingContract,
  NeuralVoiceCastingModelSelection,
  NeuralVoiceFounderRevisionRecord,
  NeuralVoicePromptSnapshot,
} from './types.js';
import {
  buildNaturalConversationalPerformanceContract,
  compileNeuralVoiceCastingContract,
} from './neuralVoiceCasting.js';

export {
  isVoiceApprovalJudgment,
  judgmentRequiresVoiceRevisionNote,
  revisionNotePlaceholder,
  VOICE_APPROVAL_JUDGMENTS,
  VOICE_REVISION_JUDGMENTS,
} from './voiceFounderRevisionLabels.js';

export const NEURAL_VOICE_FOUNDER_REVISION_PIPELINE_IMPLEMENTED = true as const;

type VoiceSetting = Record<string, unknown>;

function fingerprint(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export function rebuildTerritoryFromHypothesis(hypothesis: CharacterVoiceHypothesis): NeuralCastingTerritory {
  const raw = hypothesis.generationSettings.voice_setting ?? hypothesis.generationSettings;
  const voiceSetting = (typeof raw === 'object' && raw ? raw : {}) as VoiceSetting;
  return {
    label: hypothesis.hypothesisLabel,
    territory: hypothesis.vocalCharacter,
    vocalCharacter: hypothesis.vocalCharacter,
    providerVoiceId: hypothesis.voiceId,
    providerVoiceName: hypothesis.hypothesisLabel,
    speed: Number(voiceSetting.speed ?? 1),
    pitch: Number(voiceSetting.pitch ?? 0),
    emotion: voiceSetting.emotion as NeuralCastingTerritory['emotion'],
    traits: hypothesis.predictedTraits,
    varied: hypothesis.deliberatelyVariedTraits,
    performanceDirection: hypothesis.performanceDirection ?? undefined,
  };
}

export function buildVoiceRevisionDirective(params: {
  judgment: FounderVoiceJudgment;
  founderNote: string;
  vocalCharacter: string;
  spokenCopy: string;
}): string {
  const preserve = [
    'same woman identity',
    'same provider voice preset unless note says otherwise',
    'same spoken line unless note specifies different copy',
    'natural conversational adult female delivery',
    'no celebrity imitation or forced dialect',
  ];
  const micro =
    params.judgment === 'VOICE_RIGHT_PERFORMANCE_WRONG' ||
    params.judgment === 'RIGHT_CHARACTER_TOO_SYNTHETIC' ||
    params.judgment === 'TOO_POLISHED';
  return [
    `FOUNDER VOICE REVISION JUDGMENT: ${params.judgment.replace(/_/g, ' ')}`,
    `FOUNDER REVISION NOTE: ${params.founderNote.trim()}`,
    `VOCAL CHARACTER CONTEXT: ${params.vocalCharacter}`,
    `SPOKEN LINE: ${params.spokenCopy}`,
    micro
      ? 'REVISION MODE: MICRO — preserve voice timbre. Change ONLY performance/delivery per founder note.'
      : 'REVISION MODE: TARGETED — preserve successful identity cues; apply founder correction.',
    `PRESERVE: ${preserve.join('; ')}`,
    'Do not switch to announcer, influencer, or AI-assistant delivery.',
  ].join('\n');
}

function clampSpeed(speed: number): number {
  return Math.min(1.25, Math.max(0.75, speed));
}

function clampPitch(pitch: number): number {
  return Math.min(4, Math.max(-4, Math.round(pitch)));
}

export function applyFounderJudgmentToVoiceSettings(params: {
  voiceSetting: VoiceSetting;
  performanceDirection: string | null;
  judgment: FounderVoiceJudgment;
  founderNote: string;
}): { voiceSetting: VoiceSetting; performanceDirection: string } {
  const voiceSetting = { ...params.voiceSetting };
  let performanceDirection =
    params.performanceDirection ??
    'Adult woman speaking naturally in conversation. Understated confidence. Emotionally grounded.';

  const note = params.founderNote.trim();
  switch (params.judgment) {
    case 'TOO_FAST':
      voiceSetting.speed = clampSpeed(Number(voiceSetting.speed ?? 1) - 0.08);
      break;
    case 'TOO_SLOW':
      voiceSetting.speed = clampSpeed(Number(voiceSetting.speed ?? 1) + 0.08);
      break;
    case 'TOO_YOUNG':
      voiceSetting.pitch = clampPitch(Number(voiceSetting.pitch ?? 0) - 1);
      break;
    case 'TOO_OLD':
      voiceSetting.pitch = clampPitch(Number(voiceSetting.pitch ?? 0) + 1);
      break;
    case 'TOO_SOFT':
      voiceSetting.vol = Math.min(1.2, Number(voiceSetting.vol ?? 1) + 0.08);
      break;
    case 'TOO_HARD':
      voiceSetting.pitch = clampPitch(Number(voiceSetting.pitch ?? 0) - 1);
      voiceSetting.speed = clampSpeed(Number(voiceSetting.speed ?? 1) - 0.04);
      break;
    case 'TOO_PLAYFUL':
      voiceSetting.emotion = 'neutral';
      break;
    case 'TOO_SERIOUS':
      voiceSetting.emotion = 'happy';
      break;
    default:
      break;
  }

  if (note) {
    performanceDirection = `${performanceDirection} FOUNDER CORRECTION: ${note}`;
  }

  return { voiceSetting, performanceDirection };
}

export function compileVoicePromptSnapshot(params: {
  hypothesis: CharacterVoiceHypothesis;
  contract: NeuralVoiceCastingContract;
  triggerSource: NeuralVoicePromptSnapshot['triggerSource'];
  revisionDirective?: string | null;
}): NeuralVoicePromptSnapshot {
  const revisionDirective = params.revisionDirective ?? null;
  return {
    snapshotId: `nvps-${randomUUID().slice(0, 8)}`,
    hypothesisId: params.hypothesis.id,
    contractFingerprint: params.contract.fingerprint,
    voiceSetting: { ...params.contract.voiceSetting },
    performanceDirection: params.hypothesis.performanceDirection,
    spokenCopy: params.contract.spokenCopy,
    revisionDirective,
    triggerSource: params.triggerSource,
    compiledAt: new Date().toISOString(),
    fingerprint: fingerprint(
      `${params.contract.fingerprint}:${params.triggerSource}:${revisionDirective ?? ''}:${params.contract.spokenCopy}`,
    ),
  };
}

export function applyFounderRevisionToVoiceHypothesis(params: {
  hypothesis: CharacterVoiceHypothesis;
  selection: NeuralVoiceCastingModelSelection;
  judgment: FounderVoiceJudgment;
  founderNote: string;
}): CharacterVoiceHypothesis {
  const parentAudioUrl = params.hypothesis.audioUrl;
  const territory = rebuildTerritoryFromHypothesis(params.hypothesis);
  const raw = params.hypothesis.generationSettings.voice_setting ?? params.hypothesis.generationSettings;
  const priorVoiceSetting = (typeof raw === 'object' && raw ? raw : {}) as VoiceSetting;
  const { voiceSetting, performanceDirection } = applyFounderJudgmentToVoiceSettings({
    voiceSetting: priorVoiceSetting,
    performanceDirection: params.hypothesis.performanceDirection,
    judgment: params.judgment,
    founderNote: params.founderNote,
  });

  const updatedTerritory: NeuralCastingTerritory = {
    ...territory,
    speed: Number(voiceSetting.speed ?? territory.speed),
    pitch: Number(voiceSetting.pitch ?? territory.pitch),
    emotion: voiceSetting.emotion as NeuralCastingTerritory['emotion'],
    performanceDirection,
  };

  const revisionDirective = buildVoiceRevisionDirective({
    judgment: params.judgment,
    founderNote: params.founderNote,
    vocalCharacter: params.hypothesis.vocalCharacter,
    spokenCopy: params.hypothesis.spokenCopy,
  });

  const performanceContract = buildNaturalConversationalPerformanceContract();
  performanceContract.performanceDirection = performanceDirection;

  const interimHypothesis: CharacterVoiceHypothesis = {
    ...params.hypothesis,
    generationSettings: { voice_setting: voiceSetting },
    performanceDirection,
    founderJudgment: params.judgment,
    founderNote: params.founderNote.trim(),
    generationStatus: 'GENERATING',
    parentAudioUrl,
  };

  const generationContract = compileNeuralVoiceCastingContract({
    hypothesis: interimHypothesis,
    territory: updatedTerritory,
    selection: params.selection,
    performanceContract,
  });

  const revisionRecord: NeuralVoiceFounderRevisionRecord = {
    revisionId: `nvfr-${randomUUID().slice(0, 8)}`,
    judgment: params.judgment,
    founderNote: params.founderNote.trim(),
    appliedAt: new Date().toISOString(),
    parentAudioUrl,
    previousFingerprint: params.hypothesis.castingContract?.fingerprint ?? null,
    revisionDirective,
    contractFingerprint: generationContract.fingerprint,
    generatedAudioUrl: null,
    status: 'GENERATING',
  };

  const promptSnapshot = compileVoicePromptSnapshot({
    hypothesis: interimHypothesis,
    contract: generationContract,
    triggerSource: 'FOUNDER_REVISION',
    revisionDirective,
  });

  return {
    ...interimHypothesis,
    castingContract: generationContract,
    revisionHistory: [...(params.hypothesis.revisionHistory ?? []), revisionRecord],
    promptSnapshots: [...(params.hypothesis.promptSnapshots ?? []), promptSnapshot],
    humanWomanTest: null,
    naturalnessPass: null,
    status: 'GENERATED',
  };
}
