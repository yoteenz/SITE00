/** @deprecated Use families/registry.ts EmailFamilyCanon — re-export for gallery compat */
import type { EmailFamilyCanon } from '../families/registry.js';
import { EMAIL_FAMILY_CANON_LIST, EMAIL_FAMILY_REGISTRY, getFamilySpec } from '../families/registry.js';
import { getPrimaryFamily } from '../registry/family-map.js';
import { EMAIL_TEMPLATES } from '../registry/templates.js';

export type VisualFamilyGroup = EmailFamilyCanon;

export const VISUAL_FAMILIES = EMAIL_FAMILY_REGISTRY;

export function visualFamilyForRegistryFamily(family: string): EmailFamilyCanon {
  const t = EMAIL_TEMPLATES.find((x) => x.family === family);
  if (t) return getPrimaryFamily(t.id);
  const map: Record<string, EmailFamilyCanon> = {
    access: 'ACCESS_SECURITY',
    identity: 'WELCOME_ONBOARDING',
    project: 'PROJECT_PRODUCTION',
    studio: 'PROJECT_PRODUCTION',
    input: 'PROJECT_PRODUCTION',
    assets: 'PROJECT_PRODUCTION',
    review: 'ACTION_REVIEW',
    milestone: 'MILESTONE_CELEBRATION',
    launch: 'DELIVERY_COMPLETE',
    property: 'DELIVERY_COMPLETE',
    domain: 'DELIVERY_COMPLETE',
    billing: 'BILLING_PAYMENT',
    support: 'ALERT_BLOCKER',
    signal: 'REENGAGEMENT_HUMAN',
    internal: 'PROJECT_PRODUCTION',
  };
  return map[family] ?? 'PROJECT_PRODUCTION';
}

export { EMAIL_FAMILY_CANON_LIST, getFamilySpec };
