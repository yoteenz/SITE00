/**
 * P0.5E.4B — Ingest canonical voice identity into P0.5E.5 continuity pipeline.
 */

import type { CanonicalCharacterVoiceIdentity } from '../../site00-studio-world-production/embodiedCharacterVoice/types.js';
import type { EmbodiedCharacterBible } from '../../site00-studio-world-production/characterContinuityPipeline/types.js';
import type { NdxCharacterContinuityPipelineRun } from '../ndxCharacterContinuityPipeline/types.js';

export function ingestCanonicalVoiceIntoBible(
  bible: EmbodiedCharacterBible,
  voice: CanonicalCharacterVoiceIdentity,
): EmbodiedCharacterBible {
  return {
    ...bible,
    voiceAuthority: 'APPROVED',
    voiceSystem: {
      voiceIdentityName: voice.voiceIdentityName,
      voiceIdentityThesis: voice.voiceIdentityThesis,
      voiceProvider: voice.voiceProvider,
      voiceModel: voice.voiceModel,
      providerVoiceId: voice.providerVoiceId,
      cadence: voice.cadence,
      vocalTexture: voice.texture,
      performanceRange: voice.performanceRange,
      recognitionAnchors: voice.recognitionAnchors,
      prohibitedDrift: voice.voiceDriftConstraints,
      pauseBehavior: voice.pauseBehavior,
      laughBehavior: voice.laughBehavior,
      codeSwitching: voice.codeSwitchingBehavior,
      stableInternalId: `character-primary-voice-v1`,
      version: voice.version,
      founderApproval: true,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function updateContinuityRunWithCastVoice(
  run: NdxCharacterContinuityPipelineRun,
  voice: CanonicalCharacterVoiceIdentity,
): NdxCharacterContinuityPipelineRun {
  if (!run.bible) return run;
  const bible = ingestCanonicalVoiceIntoBible(run.bible, voice);
  return {
    ...run,
    bible,
    voiceContract: {
      ...run.voiceContract,
      voiceBibleVersion: voice.version,
      voiceIdentityCast: true as const,
      blockingReason: null,
      spokenCopy: run.voiceContract.spokenCopy,
    },
    updatedAt: new Date().toISOString(),
  } as unknown as NdxCharacterContinuityPipelineRun;
}

export function voiceIdentityCastInContinuity(run: NdxCharacterContinuityPipelineRun): boolean {
  return (run.voiceContract as { voiceIdentityCast?: boolean }).voiceIdentityCast === true;
}
