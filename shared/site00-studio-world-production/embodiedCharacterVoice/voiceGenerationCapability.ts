/**
 * P0.5E.4B — FAL / audio provider capability registry for voice generation.
 */

import { randomUUID } from 'node:crypto';
import type { CharacterVoiceGenerationCapability } from './types.js';

/** Representative endpoints — schema discovery at runtime, not permanent authority */
export const REPRESENTATIVE_VOICE_ENDPOINTS = {
  FAL_MINIMAX_SPEECH_02_HD: 'fal-ai/minimax/speech-02-hd',
  FAL_ELEVEN_TTS: 'fal-ai/elevenlabs/tts/eleven-v3',
  FAL_ELEVEN_SOUND_EFFECTS: 'fal-ai/elevenlabs/sound-effects',
  FAL_PLAYHT_TTS: 'fal-ai/playht/tts/v3',
  FAL_MINIMAX_TTS: 'fal-ai/minimax/speech-02-turbo',
} as const;

export function buildElevenLabsTtsCapability(): CharacterVoiceGenerationCapability {
  return {
    capabilityId: randomUUID(),
    provider: 'fal',
    endpoint: REPRESENTATIVE_VOICE_ENDPOINTS.FAL_ELEVEN_TTS,
    endpointClass: 'TEXT_TO_SPEECH',
    schemaVersion: 'schema-review-required',
    retrievedAt: new Date().toISOString(),
    supportsTextToSpeech: true,
    supportsVoiceSelection: true,
    supportsVoiceDesign: false,
    supportsPromptedVoiceCreation: true,
    supportsReferenceAudio: false,
    supportsVoiceCloning: false,
    supportsEmotion: true,
    supportsStyleInstruction: true,
    supportsSpeedControl: true,
    supportsPitchControl: false,
    supportsProsodyControl: true,
    supportsPauseControl: false,
    supportsSeed: false,
    supportsDeterminism: false,
    supportsPersistentVoiceId: true,
    supportsMultilingual: true,
    supportsStreaming: true,
    supportsPhonemeControl: false,
    supportsAudioExport: true,
    knownLimitations: ['No unauthorized voice cloning', 'Schema requires runtime verification'],
  };
}

export function buildPlayhtTtsCapability(): CharacterVoiceGenerationCapability {
  return {
    capabilityId: randomUUID(),
    provider: 'fal',
    endpoint: REPRESENTATIVE_VOICE_ENDPOINTS.FAL_PLAYHT_TTS,
    endpointClass: 'TEXT_TO_SPEECH',
    schemaVersion: 'schema-review-required',
    retrievedAt: new Date().toISOString(),
    supportsTextToSpeech: true,
    supportsVoiceSelection: true,
    supportsVoiceDesign: true,
    supportsPromptedVoiceCreation: true,
    supportsReferenceAudio: true,
    supportsVoiceCloning: false,
    supportsEmotion: true,
    supportsStyleInstruction: true,
    supportsSpeedControl: true,
    supportsPitchControl: true,
    supportsProsodyControl: true,
    supportsPauseControl: false,
    supportsSeed: true,
    supportsDeterminism: false,
    supportsPersistentVoiceId: true,
    supportsMultilingual: true,
    supportsStreaming: true,
    supportsPhonemeControl: false,
    supportsAudioExport: true,
    knownLimitations: ['Voice cloning requires authorized character-owned source only'],
  };
}

export function buildMinimaxTtsCapability(): CharacterVoiceGenerationCapability {
  return {
    capabilityId: randomUUID(),
    provider: 'fal',
    endpoint: REPRESENTATIVE_VOICE_ENDPOINTS.FAL_MINIMAX_TTS,
    endpointClass: 'TEXT_TO_SPEECH',
    schemaVersion: 'schema-review-required',
    retrievedAt: new Date().toISOString(),
    supportsTextToSpeech: true,
    supportsVoiceSelection: true,
    supportsVoiceDesign: true,
    supportsPromptedVoiceCreation: true,
    supportsReferenceAudio: false,
    supportsVoiceCloning: false,
    supportsEmotion: true,
    supportsStyleInstruction: true,
    supportsSpeedControl: true,
    supportsPitchControl: true,
    supportsProsodyControl: true,
    supportsPauseControl: true,
    supportsSeed: true,
    supportsDeterminism: false,
    supportsPersistentVoiceId: false,
    supportsMultilingual: true,
    supportsStreaming: true,
    supportsPhonemeControl: false,
    supportsAudioExport: true,
    knownLimitations: ['Persistent voice ID may require provider-specific training'],
  };
}

export function buildMinimaxHdTtsCapability(): CharacterVoiceGenerationCapability {
  return {
    capabilityId: randomUUID(),
    provider: 'fal',
    endpoint: REPRESENTATIVE_VOICE_ENDPOINTS.FAL_MINIMAX_SPEECH_02_HD,
    endpointClass: 'TEXT_TO_SPEECH',
    schemaVersion: 'minimax-speech-02-hd@verified',
    retrievedAt: new Date().toISOString(),
    supportsTextToSpeech: true,
    supportsVoiceSelection: true,
    supportsVoiceDesign: false,
    supportsPromptedVoiceCreation: true,
    supportsReferenceAudio: false,
    supportsVoiceCloning: false,
    supportsEmotion: true,
    supportsStyleInstruction: true,
    supportsSpeedControl: true,
    supportsPitchControl: true,
    supportsProsodyControl: true,
    supportsPauseControl: false,
    supportsSeed: false,
    supportsDeterminism: false,
    supportsPersistentVoiceId: true,
    supportsMultilingual: true,
    supportsStreaming: true,
    supportsPhonemeControl: false,
    supportsAudioExport: true,
    knownLimitations: ['Preset voices only — no unauthorized cloning', '$0.1 per 1000 characters'],
  };
}

export function buildSyntheticCalibrationCapability(): CharacterVoiceGenerationCapability {
  return {
    capabilityId: randomUUID(),
    provider: 'site00_synthetic',
    endpoint: 'site00/synthetic-voice-calibration',
    endpointClass: 'VOICE_DESIGN',
    schemaVersion: 'synthetic@P0.5E.4B-DEV_PLACEHOLDER',
    retrievedAt: new Date().toISOString(),
    supportsTextToSpeech: true,
    supportsVoiceSelection: true,
    supportsVoiceDesign: true,
    supportsPromptedVoiceCreation: true,
    supportsReferenceAudio: false,
    supportsVoiceCloning: false,
    supportsEmotion: true,
    supportsStyleInstruction: true,
    supportsSpeedControl: true,
    supportsPitchControl: true,
    supportsProsodyControl: true,
    supportsPauseControl: true,
    supportsSeed: true,
    supportsDeterminism: true,
    supportsPersistentVoiceId: true,
    supportsMultilingual: false,
    supportsStreaming: false,
    supportsPhonemeControl: false,
    supportsAudioExport: true,
    knownLimitations: [
      'DEV_PLACEHOLDER — browser SpeechSynthesis for tests/dev only',
      'Not eligible for founder canonical voice casting',
      'No real-person impersonation',
    ],
  };
}

export function syntheticProviderAuthority(): 'DEV_PLACEHOLDER' {
  return 'DEV_PLACEHOLDER';
}

export function buildDefaultVoiceCapabilityRegistry(): CharacterVoiceGenerationCapability[] {
  return [
    buildMinimaxHdTtsCapability(),
    buildElevenLabsTtsCapability(),
    buildPlayhtTtsCapability(),
    buildMinimaxTtsCapability(),
    buildSyntheticCalibrationCapability(),
  ];
}

export function blocksRealPersonImpersonation(): true {
  return true;
}

export function blocksUnauthorizedVoiceCloning(): true {
  return true;
}

export function blocksCulturalCaricature(): true {
  return true;
}

export function blocksForcedDialect(): true {
  return true;
}
