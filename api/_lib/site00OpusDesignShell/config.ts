import { OPUS_DESIGN_SHELL_MODEL } from '../../../shared/site00-opus-design-shell/constants.js';

export { OPUS_DESIGN_SHELL_MODEL };

export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
export const ANTHROPIC_VERSION_HEADER = '2023-06-01';

export function anthropicApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function isAnthropicConfigured(): boolean {
  return anthropicApiKey() !== null;
}

export function scriptedShellEnabled(): boolean {
  return process.env.SITE00_OPUS_DESIGN_SHELL_SCRIPTED === '1' || !isAnthropicConfigured();
}

export function modelAvailabilityBlocked(): boolean {
  return process.env.SITE00_OPUS_DESIGN_SHELL_MODEL_BLOCKED === '1';
}
