/**
 * Provider registry — business logic selects providers through this registry only.
 */

import type { CreativeIntelligenceProvider } from './types.js';
import { getConfiguredProviderId } from './config.js';
import { createAnthropicCreativeIntelligenceProvider } from './anthropicProvider.js';
import { createUnavailableCreativeIntelligenceProvider } from './unavailableProvider.js';

let testProviderOverride: CreativeIntelligenceProvider | null = null;

export function setCreativeIntelligenceProviderForTests(provider: CreativeIntelligenceProvider | null): void {
  testProviderOverride = provider;
}

export function getCreativeIntelligenceProvider(): CreativeIntelligenceProvider {
  if (testProviderOverride) return testProviderOverride;
  const id = getConfiguredProviderId();
  if (id === 'anthropic') return createAnthropicCreativeIntelligenceProvider();
  return createUnavailableCreativeIntelligenceProvider();
}

export function listCreativeIntelligenceProviders(): Array<{
  providerId: string;
  status: string;
  modelId: string;
}> {
  const provider = getCreativeIntelligenceProvider();
  return [
    {
      providerId: provider.providerId,
      status: provider.capability.status,
      modelId: provider.capability.modelId,
    },
  ];
}
