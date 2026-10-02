/** Configurable creative-director model slot (upgrade without workspace redesign). */

export const CREATIVE_DIRECTOR_PROMPT_VERSION = 'map2-creative-director-v1';

export {
  resolveCreativeDirectorModelConfig,
  normalizeCreativeDirectorModelId,
  validateModelIdentifier,
  type CreativeDirectorModelConfig,
  type CreativeDirectorReasoningEffort,
} from './modelConfig.js';

import { normalizeCreativeDirectorModelId, resolveCreativeDirectorModelConfig, validateModelIdentifier } from './modelConfig.js';

export function getCreativeDirectorModelId(): string {
  return resolveCreativeDirectorModelConfig().model;
}

export function getCreativeDirectorReasoningLevel(): string {
  return resolveCreativeDirectorModelConfig().reasoning_effort;
}

export function isCreativeDirectorModelConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function openAiKeyPresent(): boolean {
  return isCreativeDirectorModelConfigured();
}

export type CreativeDirectorRuntimeState =
  | 'MODEL_RUNTIME_READY'
  | 'MODEL_RUNTIME_BLOCKED'
  | 'LIVE_RUN_SUCCEEDED'
  | 'LIVE_RUN_FAILED'
  | 'FAILED_VALIDATION'
  | 'PERSISTENCE_FAILED'
  | 'RESTORE_FAILED';

export function creativeDirectorRuntimeBlocked(): { code: 'MODEL_RUNTIME_BLOCKED'; missing: string[]; message: string } | null {
  if (process.env.VITEST === 'true' && process.env.SITE00_CREATIVE_DIRECTOR_ALLOW_VITEST_LIVE !== '1') {
    return {
      code: 'MODEL_RUNTIME_BLOCKED',
      missing: ['LIVE_MODEL_CALLS_DISABLED_IN_VITEST'],
      message: 'Live creative director model calls are disabled during vitest.',
    };
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return {
      code: 'MODEL_RUNTIME_BLOCKED',
      missing: ['OPENAI_API_KEY'],
      message: 'Set OPENAI_API_KEY on the server to enable CreativeDirectorAgent live runs.',
    };
  }
  const model = normalizeCreativeDirectorModelId(
    process.env.SITE00_CREATIVE_DIRECTOR_MODEL || process.env.OPENAI_CREATIVE_DIRECTOR_MODEL,
  );
  const valid = validateModelIdentifier(model);
  if (!valid.ok) {
    return { code: 'MODEL_RUNTIME_BLOCKED', missing: ['INVALID_MODEL_IDENTIFIER'], message: valid.reason };
  }
  return null;
}
