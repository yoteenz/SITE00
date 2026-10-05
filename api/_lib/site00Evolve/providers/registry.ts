/** Provider capability registry — normalized, not provider-name conditionals in EVOLVE core */

import type { CapabilityAvailability, ProviderCapability, ProviderCategory } from './types.js';

export type ProviderDefinition = {
  providerKey: string;
  displayName: string;
  category: ProviderCategory;
  supportedCapabilities: ProviderCapability[];
  adapterAvailable: boolean;
  requiresCredentials: string[];
};

export const PROVIDER_REGISTRY: ProviderDefinition[] = [
  {
    providerKey: 'google_analytics',
    displayName: 'Google Analytics',
    category: 'ANALYTICS',
    supportedCapabilities: ['READ_ACCOUNT', 'READ_ANALYTICS', 'READ_AUDIENCE', 'READ_CONTENT_METRICS'],
    adapterAvailable: true,
    requiresCredentials: ['GOOGLE_ANALYTICS_CLIENT_ID', 'GOOGLE_ANALYTICS_CLIENT_SECRET', 'GOOGLE_ANALYTICS_REFRESH_TOKEN'],
  },
  {
    providerKey: 'google_search_console',
    displayName: 'Google Search Console',
    category: 'SEARCH',
    supportedCapabilities: ['READ_ACCOUNT', 'READ_SEARCH_ANALYTICS'],
    adapterAvailable: true,
    requiresCredentials: ['GOOGLE_SEARCH_CONSOLE_CLIENT_ID', 'GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET'],
  },
  {
    providerKey: 'meta_instagram',
    displayName: 'Meta / Instagram',
    category: 'SOCIAL',
    supportedCapabilities: [
      'READ_ACCOUNT',
      'READ_PROFILE',
      'READ_CONTENT',
      'READ_CONTENT_METRICS',
      'READ_AUDIENCE',
      'PUBLISH_CONTENT',
      'SCHEDULE_CONTENT',
    ],
    adapterAvailable: true,
    requiresCredentials: ['META_APP_ID', 'META_APP_SECRET', 'META_ACCESS_TOKEN'],
  },
  {
    providerKey: 'tiktok',
    displayName: 'TikTok',
    category: 'SOCIAL',
    supportedCapabilities: ['READ_ACCOUNT', 'READ_CONTENT', 'READ_CONTENT_METRICS', 'PUBLISH_CONTENT'],
    adapterAvailable: true,
    requiresCredentials: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
  },
  {
    providerKey: 'resend',
    displayName: 'Resend',
    category: 'EMAIL',
    supportedCapabilities: ['SEND_EMAIL', 'READ_EMAIL_METRICS'],
    adapterAvailable: true,
    requiresCredentials: ['RESEND_API_KEY'],
  },
  {
    providerKey: 'sendgrid',
    displayName: 'SendGrid',
    category: 'EMAIL',
    supportedCapabilities: ['SEND_EMAIL', 'READ_EMAIL_METRICS'],
    adapterAvailable: true,
    requiresCredentials: ['SENDGRID_API_KEY'],
  },
];

export function getProviderDefinition(providerKey: string): ProviderDefinition | undefined {
  return PROVIDER_REGISTRY.find((p) => p.providerKey === providerKey);
}

export function credentialsConfigured(required: string[]): boolean {
  return required.every((k) => Boolean(process.env[k]?.trim()));
}

export function adapterStatus(providerKey: string): 'ADAPTER_AVAILABLE' | 'ADAPTER_UNAVAILABLE' | 'REQUIRES_CREDENTIALS' {
  const def = getProviderDefinition(providerKey);
  if (!def || !def.adapterAvailable) return 'ADAPTER_UNAVAILABLE';
  if (!credentialsConfigured(def.requiresCredentials)) return 'REQUIRES_CREDENTIALS';
  return 'ADAPTER_AVAILABLE';
}

export function buildCapabilityMap(
  supported: ProviderCapability[],
  granted: ProviderCapability[],
): Record<string, CapabilityAvailability> {
  const map: Record<string, CapabilityAvailability> = {};
  for (const cap of supported) {
    map[cap] = granted.includes(cap) ? 'AVAILABLE' : 'UNAVAILABLE_FOR_CONNECTION';
  }
  return map;
}

export function listProvidersByCategory(category?: ProviderCategory): ProviderDefinition[] {
  if (!category) return PROVIDER_REGISTRY;
  return PROVIDER_REGISTRY.filter((p) => p.category === category);
}
