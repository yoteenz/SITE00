/**
 * P0.5E.4B — Voice generation contract + immutable snapshots.
 */

import { createHash, randomUUID } from 'node:crypto';
import { EMBODIED_CHARACTER_VOICE_VERSION } from './constants.js';
import type {
  CharacterVoiceGenerationContract,
  CharacterVoiceGenerationSnapshot,
  CharacterVoiceHypothesis,
  EmbodiedCharacterVoiceIdentity,
} from './types.js';

export function compileVoiceGenerationContract(params: {
  identity: EmbodiedCharacterVoiceIdentity | null;
  hypothesis: CharacterVoiceHypothesis;
  languageEvidenceId?: string;
  roundId?: string;
}): CharacterVoiceGenerationContract {
  const cast = Boolean(params.identity?.founderApproval);
  return {
    contractId: randomUUID(),
    characterVoiceIdentityId: params.identity?.id ?? null,
    languageEvidenceId: params.languageEvidenceId ?? null,
    voiceCalibrationRoundId: params.roundId ?? params.hypothesis.roundId,
    provider: params.hypothesis.provider,
    endpoint: params.hypothesis.model,
    schemaVersion: 'synthetic@P0.5E.4B',
    voiceId: params.hypothesis.voiceId,
    referenceAudioIds: [],
    spokenCopy: params.hypothesis.spokenCopy,
    emotionalState: params.hypothesis.emotionalState,
    socialContext: null,
    platform: null,
    intention: null,
    performanceDirection: params.hypothesis.vocalCharacter,
    tempo: null,
    energy: null,
    expressiveness: null,
    pauseBehavior: 'THOUGHT_PAUSE',
    laughBehavior: 'QUIET_LAUGH',
    reactionBehavior: 'small exhale before disbelief',
    negativePerformanceConstraints: [
      'no celebrity voice',
      'no founder voice',
      'no real-person impersonation',
      'no influencer collapse',
      'no generic AI narrator',
    ],
    seed: fingerprint(params.hypothesis.voiceId + params.hypothesis.spokenCopy),
    format: 'mp3',
    sampleRate: 44100,
    costEstimate: 0.01,
    compilerVersion: EMBODIED_CHARACTER_VOICE_VERSION,
    fingerprint: fingerprint(JSON.stringify(params.hypothesis.generationSettings)),
    voiceIdentityCast: cast,
    blockingReason: cast ? null : 'VOICE_IDENTITY_NOT_CAST',
  };
}

export function createVoiceGenerationSnapshot(params: {
  contract: CharacterVoiceGenerationContract;
  hypothesis: CharacterVoiceHypothesis;
  bibleVersion?: string;
  judgment?: CharacterVoiceGenerationSnapshot['founderJudgment'];
}): CharacterVoiceGenerationSnapshot {
  return {
    snapshotId: randomUUID(),
    characterBibleVersion: params.bibleVersion ?? null,
    voiceIdentityVersion: params.contract.characterVoiceIdentityId,
    languageEvidenceVersion: params.contract.languageEvidenceId,
    provider: params.contract.provider,
    endpoint: params.contract.endpoint,
    modelSchema: params.contract.schemaVersion,
    voiceId: params.contract.voiceId ?? 'unknown',
    referenceAudio: params.contract.referenceAudioIds,
    spokenCopy: params.contract.spokenCopy,
    performanceSettings: {
      emotionalState: params.contract.emotionalState,
      performanceDirection: params.contract.performanceDirection,
      generationSettings: params.hypothesis.generationSettings,
    },
    seed: params.contract.seed,
    generatedAudioUrl: params.hypothesis.audioUrl,
    audioAssetId: params.hypothesis.audioAssetId,
    cost: params.contract.costEstimate,
    founderJudgment: params.judgment ?? params.hypothesis.founderJudgment,
    immutable: true,
    generatedAt: new Date().toISOString(),
  };
}

function fingerprint(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export function snapshotIsImmutable(snapshot: CharacterVoiceGenerationSnapshot): true {
  return snapshot.immutable;
}
