/**
 * Creative Intelligence provider configuration validation — truthful states without costly calls.
 */

import { ANTHROPIC_CREATIVE_MODEL, isAnthropicConfigured } from './config.js';

export type CreativeIntelligenceProviderConfigStatus = 'CONFIGURED' | 'UNAVAILABLE' | 'MISCONFIGURED';

export type CreativeIntelligenceProviderConfig = {
  status: CreativeIntelligenceProviderConfigStatus;
  providerId: 'anthropic' | 'unavailable';
  modelId: string;
  apiKeyPresent: boolean;
  message: string | null;
};

export function resolveCreativeIntelligenceProviderConfig(): CreativeIntelligenceProviderConfig {
  const apiKeyPresent = isAnthropicConfigured();
  const modelId = ANTHROPIC_CREATIVE_MODEL;

  if (!apiKeyPresent) {
    return {
      status: 'UNAVAILABLE',
      providerId: 'unavailable',
      modelId: 'none',
      apiKeyPresent: false,
      message: 'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE',
    };
  }

  if (!modelId?.trim()) {
    return {
      status: 'MISCONFIGURED',
      providerId: 'anthropic',
      modelId: '',
      apiKeyPresent: true,
      message: 'Creative Intelligence model not configured',
    };
  }

  return {
    status: 'CONFIGURED',
    providerId: 'anthropic',
    modelId,
    apiKeyPresent: true,
    message: null,
  };
}

export function isCreativeIntelligenceConfigured(): boolean {
  return resolveCreativeIntelligenceProviderConfig().status === 'CONFIGURED';
}
