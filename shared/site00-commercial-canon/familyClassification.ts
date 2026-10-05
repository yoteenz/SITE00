/**
 * Part 4 — Map audit serviceId → fulfillment family.
 */

import type { ServiceFulfillmentFamily } from './types.js';

export const SERVICE_FAMILY_BY_ID: Record<string, ServiceFulfillmentFamily> = {
  'services-hub-branding': 'IDENTITY',
  'idnty-investment-tiers': 'IDENTITY',
  'bldr-site-class': 'BUILDER_SIMPLE',
  'bldr-world-class': 'BUILDER_CUSTOM_WORLD',
  'bldr-enterprise-class': 'BUILDER_CUSTOM_WORLD',
  'evolve-path-refine': 'EVOLVE_PLATFORM',
  'evolve-path-install': 'EVOLVE_PLATFORM',
  'evolve-path-transform': 'EVOLVE_PLATFORM',
  'evolve-pricing-ui-self-directed': 'EVOLVE_PLATFORM',
  'evolve-commercial-foundation': 'RECURRING_RETAINER',
  'evolve-recurring-essential': 'RECURRING_RETAINER',
  'evolve-recurring-growth': 'RECURRING_RETAINER',
  'evolve-recurring-studio': 'RECURRING_RETAINER',
  'evolve-recurring-private': 'RECURRING_RETAINER',
  'evolve-project-creative-direction-intensive': 'CUSTOM_QUOTE',
  'evolve-project-launch-campaign': 'MARKETING_CAMPAIGN',
  'marketing-social-content': 'MARKETING_CAMPAIGN',
  'marketing-product-campaign': 'MARKETING_CAMPAIGN',
  'marketing-brand-film': 'MARKETING_CAMPAIGN',
  'marketing-ugc-style': 'MARKETING_CAMPAIGN',
  'marketing-campaign': 'MARKETING_CAMPAIGN',
  'marketing-launch-campaign': 'MARKETING_CAMPAIGN',
  'marketing-content-system': 'RECURRING_RETAINER',
  'control-ongoing-support': 'CUSTOM_QUOTE',
  'control-billing-shell': 'EVOLVE_PLATFORM',
  'studio-world-add-ons': 'ADD_ON',
};

export function familyForServiceId(serviceId: string): ServiceFulfillmentFamily | null {
  return SERVICE_FAMILY_BY_ID[serviceId] ?? null;
}

export const FULFILLMENT_FAMILY_COUNT = new Set(Object.values(SERVICE_FAMILY_BY_ID)).size;
