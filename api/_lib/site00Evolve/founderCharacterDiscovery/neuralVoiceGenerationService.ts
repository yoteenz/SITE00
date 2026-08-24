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
  const voiceSetting = contract.voiceSetting;
  return {
    text: contract.spokenCopy.trim(),
    output_format: 'url',
    language_boost: contract.languageBoost,
    voice_setting: {
      ...voiceSetting,
      pitch: Math.round(Number(voiceSetting.pitch ?? 0)),
      speed: Number(voiceSetting.speed ?? 1),
      vol: Number(voiceSetting.vol ?? 1),
    },
  };
}

function formatFalGenerationError(err: unknown): string {
  if (err && typeof err === 'object') {
    const body = (err as { body?: { detail?: unknown } }).body;
    const detail = body?.detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string; loc?: unknown[]; input?: string };
      if (first.msg) {
        const field = Array.isArray(first.loc) ? first.loc.slice(-1)[0] : null;
        return field ? `${String(field)}: ${first.msg}` : first.msg;
      }
    }
    if (typeof (err as { message?: string }).message === 'string') {
      return (err as { message: string }).message;
    }
  }
  return 'Neural voice generation failed';
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
  try {
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
  } catch (err) {
    throw new Error(formatFalGenerationError(err));
  }
}
