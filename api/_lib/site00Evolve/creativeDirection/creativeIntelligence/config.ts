/**
 * Centralized Creative Intelligence configuration — model names live here only.
 */

export const CREATIVE_INTELLIGENCE_PROMPT_VERSION = 'core-direction-formation-v1';

export const MAX_CREATIVE_REVISION_ROUNDS = 2;

export const REQUIRED_DIRECTION_COUNT = 3;

export const ANTHROPIC_CREATIVE_MODEL =
  process.env.SITE00_CREATIVE_INTELLIGENCE_MODEL?.trim() ||
  process.env.ANTHROPIC_CREATIVE_MODEL?.trim() ||
  'claude-sonnet-4-20250514';

export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function getConfiguredProviderId(): 'anthropic' | 'unavailable' {
  return isAnthropicConfigured() ? 'anthropic' : 'unavailable';
}

/** Redact sensitive founder lore from diagnostic logs unless explicit debug mode. */
export function creativeIntelligenceDebugLoggingEnabled(): boolean {
  return process.env.SITE00_CREATIVE_INTELLIGENCE_DEBUG === '1';
}
