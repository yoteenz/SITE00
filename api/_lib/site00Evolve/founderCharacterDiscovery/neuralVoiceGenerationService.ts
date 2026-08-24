/**
 * P0.5E.4B.1 — FAL neural TTS generation (server-side only).
 */

import type { NeuralVoiceCastingContract } from '../../../../shared/site00-studio-world-production/embodiedCharacterVoice/types.js';
import { NEURAL_TTS_DISCOVERY_ENDPOINTS } from '../../../../shared/site00-studio-world-production/embodiedCharacterVoice/neuralVoiceCasting.js';

export type NeuralVoiceGenerationResult = {
  audioUrl: string;
  durationMs: number;
  actualCostUsd: number;
  falRequestId: string | null;
  provider: string;
  endpoint: string;
};

export function isNeuralProviderConfigured(): boolean {
  return process.env.VITEST === 'true' || Boolean(process.env.FAL_KEY?.trim());
}

export function buildFalMinimaxInput(contract: NeuralVoiceCastingContract): Record<string, unknown> {
  return {
    text: contract.spokenCopy,
    output_format: 'url',
    language_boost: contract.languageBoost,
    voice_setting: contract.voiceSetting,
  };
}

export async function generateNeuralVoiceClip(
  contract: NeuralVoiceCastingContract,
): Promise<NeuralVoiceGenerationResult> {
  if (process.env.VITEST === 'true' || !process.env.FAL_KEY?.trim()) {
    return {
      audioUrl: `https://vitest.local/neural-voice/${contract.hypothesisId}.mp3`,
      durationMs: 6000,
      actualCostUsd: contract.estimatedCostUsd,
      falRequestId: `vitest-${contract.hypothesisId}`,
      provider: contract.provider,
      endpoint: contract.endpoint,
    };
  }

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: process.env.FAL_KEY });
  const endpoint = contract.endpoint || NEURAL_TTS_DISCOVERY_ENDPOINTS.MINIMAX_SPEECH_02_HD;
  const input = buildFalMinimaxInput(contract);
  const result = await fal.subscribe(endpoint, { input });
  const data = result.data as { audio?: { url?: string }; duration_ms?: number };
  const audioUrl = data.audio?.url;
  if (!audioUrl) {
    throw new Error('Neural voice generation returned no audio URL');
  }
  return {
    audioUrl,
    durationMs: data.duration_ms ?? 6000,
    actualCostUsd: contract.estimatedCostUsd,
    falRequestId: result.requestId ?? null,
    provider: contract.provider,
    endpoint,
  };
}
