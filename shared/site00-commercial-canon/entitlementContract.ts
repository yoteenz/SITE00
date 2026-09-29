/**
 * Part 16 — Shared entitlement dimensions (one model, family-specific templates).
 */

import type { CanonicalEntitlementContract } from './types.js';

export const CANONICAL_ENTITLEMENT_TEMPLATES: Record<string, CanonicalEntitlementContract> = {
  'marketing-category': {
    entitlementTemplateId: 'marketing-category',
    dimensions: ['characters', 'actors', 'sets', 'assets', 'generationCredits', 'campaigns'],
    enforcement: 'PIPELINE',
  },
  'evolve-recurring-plan': {
    entitlementTemplateId: 'evolve-recurring-plan',
    dimensions: ['assets', 'campaigns', 'channels'],
    enforcement: 'INFORMATIONAL',
  },
  'builder-simple': {
    entitlementTemplateId: 'builder-simple',
    dimensions: ['pages', 'concepts', 'revisions'],
    enforcement: 'NOT_WIRED',
  },
  'builder-custom': {
    entitlementTemplateId: 'builder-custom',
    dimensions: ['pages', 'concepts', 'revisions', 'assets'],
    enforcement: 'NOT_WIRED',
  },
  'identity': {
    entitlementTemplateId: 'identity',
    dimensions: ['concepts', 'revisions'],
    enforcement: 'NOT_WIRED',
  },
  'add-on': {
    entitlementTemplateId: 'add-on',
    dimensions: ['characters', 'actors', 'sets', 'generationCredits'],
    enforcement: 'PIPELINE',
  },
};

export function resolveEntitlementContract(templateId: string | null): CanonicalEntitlementContract | null {
  if (!templateId) return null;
  return CANONICAL_ENTITLEMENT_TEMPLATES[templateId] ?? null;
}
