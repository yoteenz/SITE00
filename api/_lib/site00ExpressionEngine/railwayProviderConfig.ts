/**
 * C1.9R2 — Railway / server-side Anthropic configuration verification (no secret exposure).
 */

import { checkCreativeReasoningProviderHealth } from './seniorCreativeJudgment/creativeReasoningProvider.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';

export type RailwayProviderConfigStatus = {
  configured: boolean;
  authConfigured: boolean;
  providerName: string;
  model: string;
  mockActive: boolean;
  forceFallbackActive: boolean;
  vitestStubActive: boolean;
  blockReason?: string;
  capabilityStatus: 'RAILWAY_PROVIDER_READY' | 'RAILWAY_PROVIDER_CONFIG_BLOCKED';
};

function authConfiguredServerSide(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

/** Returns configured=true/false only — never exposes secret value. */
export function verifyRailwayProviderConfig(): RailwayProviderConfigStatus {
  const configured = authConfiguredServerSide();
  const mockActive = process.env.SITE00_CREATIVE_REASONING_MOCK_FULL === '1';
  const forceFallbackActive = process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK === '1';
  const vitestStubActive = process.env.VITEST === 'true';

  if (!configured) {
    return {
      configured: false,
      authConfigured: false,
      providerName: 'none',
      model: ANTHROPIC_CREATIVE_MODEL,
      mockActive,
      forceFallbackActive,
      vitestStubActive,
      blockReason: 'ANTHROPIC_API_KEY not configured in Railway API environment',
      capabilityStatus: 'RAILWAY_PROVIDER_CONFIG_BLOCKED',
    };
  }

  return {
    configured: true,
    authConfigured: true,
    providerName: 'anthropic',
    model: ANTHROPIC_CREATIVE_MODEL,
    mockActive,
    forceFallbackActive,
    vitestStubActive,
    capabilityStatus: 'RAILWAY_PROVIDER_READY',
  };
}

export async function verifyRailwayProviderHealthExtended(): Promise<
  RailwayProviderConfigStatus & Awaited<ReturnType<typeof checkCreativeReasoningProviderHealth>>
> {
  const config = verifyRailwayProviderConfig();
  const health = await checkCreativeReasoningProviderHealth();
  return {
    ...health,
    ...config,
    authConfigured: config.authConfigured,
    configured: config.configured,
    capabilityStatus: config.configured ? 'RAILWAY_PROVIDER_READY' : 'RAILWAY_PROVIDER_CONFIG_BLOCKED',
  };
}

/** Ensure API responses never leak the raw key. */
export function redactSecretsFromPayload<T>(payload: T): T {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return payload;
  const serialized = JSON.stringify(payload);
  if (!serialized.includes(key)) return payload;
  return JSON.parse(serialized.replaceAll(key, '[REDACTED]')) as T;
}
