import type { ServiceScopeContract } from './types.js';

/** Extensible commercial scopes — no pricing or billing in this sprint. */
export const SERVICE_SCOPE_CONTRACTS: ServiceScopeContract[] = [
  {
    service_scope_id: 'one-off-email',
    label: 'ONE-OFF EMAIL CREATION',
    includes: ['copy', 'design'],
    delivery_package_profile: 'design_and_previews',
    provider_neutral: true,
  },
  {
    service_scope_id: 'multi-email-campaign',
    label: 'MULTI-EMAIL CAMPAIGN',
    includes: ['copy', 'design', 'campaign_strategy'],
    delivery_package_profile: 'design_and_previews',
    provider_neutral: true,
  },
  {
    service_scope_id: 'responsive-html-production',
    label: 'RESPONSIVE HTML PRODUCTION',
    includes: ['copy', 'design', 'responsive_html', 'esp_implementation'],
    delivery_package_profile: 'full_implementation',
    provider_neutral: true,
  },
];
