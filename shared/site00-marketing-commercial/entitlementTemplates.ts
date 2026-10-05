/**
 * Marketing service category → entitlement template (configurable allowances — no hardcoded global "2").
 */

import type { MarketingServiceCategory } from '../site00-marketing/types.js';
import type { MarketingEntitlementTemplate } from './types.js';

const BASE_SCOPES = ['STUDIO_WORLD_SHARED', 'CLIENT_PRIVATE'] as const;

function template(
  serviceCategory: MarketingServiceCategory,
  overrides: Partial<MarketingEntitlementTemplate>,
): MarketingEntitlementTemplate {
  return {
    entitlementTemplateId: `ent-tpl-${serviceCategory}`,
    marketingPlanId: null,
    serviceCategory,
    characterAllowance: 2,
    newActorAllowance: 0,
    reskinAllowance: 2,
    characterLookAllowance: 2,
    setAllowance: 1,
    setReskinAllowance: 1,
    environmentAllowance: 1,
    wardrobeAllowance: 2,
    propAllowance: 2,
    graphicAllowance: 2,
    generationAllowance: 20,
    resetCadence: 'MONTHLY',
    allowedAssetScopes: [...BASE_SCOPES],
    overagePolicy: 'ADD_ON_REQUIRED',
    ...overrides,
  };
}

export const MARKETING_ENTITLEMENT_TEMPLATES: Record<MarketingServiceCategory, MarketingEntitlementTemplate> = {
  'social-content': template('social-content', { characterAllowance: 1, setAllowance: 0 }),
  campaign: template('campaign', { characterAllowance: 2, newActorAllowance: 1 }),
  'product-campaign': template('product-campaign', { characterAllowance: 1, wardrobeAllowance: 3 }),
  'brand-film': template('brand-film', { characterAllowance: 2, newActorAllowance: 1, generationAllowance: 30 }),
  'ugc-style': template('ugc-style', { characterAllowance: 2, reskinAllowance: 3 }),
  'launch-campaign': template('launch-campaign', { characterAllowance: 2, setAllowance: 2, environmentAllowance: 2 }),
  'content-system': template('content-system', { characterAllowance: 3, reskinAllowance: 4, generationAllowance: 40 }),
};

export function entitlementTemplateForService(
  serviceCategory: MarketingServiceCategory,
  marketingPlanId?: string | null,
): MarketingEntitlementTemplate {
  const base = MARKETING_ENTITLEMENT_TEMPLATES[serviceCategory];
  return marketingPlanId ? { ...base, marketingPlanId } : base;
}
