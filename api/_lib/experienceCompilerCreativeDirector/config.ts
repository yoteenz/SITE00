/** Configurable creative-director model slot (upgrade without workspace redesign). */

export const CREATIVE_DIRECTOR_PROMPT_VERSION = 'map2-creative-director-v1';

export function getCreativeDirectorModelId(): string {
  return (
    process.env.SITE00_CREATIVE_DIRECTOR_MODEL?.trim() ||
    process.env.OPENAI_CREATIVE_DIRECTOR_MODEL?.trim() ||
    'gpt-5.6-sol-medium'
  );
}

export function getCreativeDirectorReasoningLevel(): string | null {
  return process.env.SITE00_CREATIVE_DIRECTOR_REASONING?.trim() || null;
}

export function isCreativeDirectorModelConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function creativeDirectorRuntimeBlocked(): { code: 'MODEL_RUNTIME_BLOCKED'; missing: string[]; message: string } | null {
  if (process.env.VITEST === 'true') {
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
  return null;
}
