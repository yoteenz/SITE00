import type { ProviderCapability, ProviderCategory } from './types.js';

export type DigitalFoundationProviderAdapter = {
  provider_id: string;
  label: string;
  category: ProviderCategory;
  capabilities: ProviderCapability[];
  /** No live writes in V1 — architecture only. */
  live_writes_enabled: boolean;
};

/** Provider-neutral registry — no single-vendor lock-in. */
export const DIGITAL_FOUNDATION_PROVIDER_REGISTRY: DigitalFoundationProviderAdapter[] = [
  {
    provider_id: 'google_workspace',
    label: 'Google Workspace',
    category: 'EMAIL_PROVIDER',
    capabilities: ['READ', 'CREATE', 'UPDATE', 'VERIFY', 'HANDOFF_ONLY'],
    live_writes_enabled: false,
  },
  {
    provider_id: 'microsoft_365',
    label: 'Microsoft 365',
    category: 'EMAIL_PROVIDER',
    capabilities: ['READ', 'CREATE', 'UPDATE', 'VERIFY', 'HANDOFF_ONLY'],
    live_writes_enabled: false,
  },
  {
    provider_id: 'cloudflare',
    label: 'Cloudflare',
    category: 'DNS_PROVIDER',
    capabilities: ['READ', 'UPDATE', 'VERIFY', 'HANDOFF_ONLY'],
    live_writes_enabled: false,
  },
  {
    provider_id: 'godaddy',
    label: 'GoDaddy',
    category: 'DOMAIN_REGISTRAR',
    capabilities: ['SEARCH', 'READ', 'HANDOFF_ONLY'],
    live_writes_enabled: false,
  },
  {
    provider_id: 'namecheap',
    label: 'Namecheap',
    category: 'DOMAIN_REGISTRAR',
    capabilities: ['SEARCH', 'READ', 'HANDOFF_ONLY'],
    live_writes_enabled: false,
  },
  {
    provider_id: 'squarespace_domains',
    label: 'Squarespace Domains',
    category: 'DOMAIN_REGISTRAR',
    capabilities: ['SEARCH', 'READ', 'HANDOFF_ONLY'],
    live_writes_enabled: false,
  },
  {
    provider_id: 'generic_dns',
    label: 'Other DNS provider',
    category: 'DNS_PROVIDER',
    capabilities: ['READ', 'VERIFY', 'HANDOFF_ONLY'],
    live_writes_enabled: false,
  },
  {
    provider_id: 'generic_migration',
    label: 'Migration tooling',
    category: 'MIGRATION_PROVIDER',
    capabilities: ['READ', 'HANDOFF_ONLY'],
    live_writes_enabled: false,
  },
];

export function getProvider(providerId: string): DigitalFoundationProviderAdapter | undefined {
  return DIGITAL_FOUNDATION_PROVIDER_REGISTRY.find((p) => p.provider_id === providerId);
}

export function providersForCategory(category: ProviderCategory): DigitalFoundationProviderAdapter[] {
  return DIGITAL_FOUNDATION_PROVIDER_REGISTRY.filter((p) => p.category === category);
}

export function assertProviderCapability(providerId: string, capability: ProviderCapability): boolean {
  const p = getProvider(providerId);
  return Boolean(p?.capabilities.includes(capability));
}
