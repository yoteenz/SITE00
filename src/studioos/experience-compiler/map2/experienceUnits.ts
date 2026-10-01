import type { ExperienceRouteNode, ExperienceUnitKind } from './map2Types';

const UNIT_KEYWORDS: [RegExp, ExperienceUnitKind][] = [
  [/\/build|configurator/i, 'CONFIGURATOR'],
  [/\/checkout|\/review/i, 'TRANSACTION_FLOW'],
  [/\/account|\/projects|portal/i, 'PORTAL'],
  [/\/world|\/room|immersive/i, 'IMMERSIVE_EXPERIENCE'],
  [/\/lab|tool/i, 'INTERACTIVE_TOOL'],
  [/\/diagnostic|repair/i, 'DIAGNOSTIC'],
  [/^\/$/, 'ENTRY'],
];

export function classifyExperienceUnit(route: string, fallback: ExperienceUnitKind = 'HUB'): ExperienceUnitKind {
  for (const [re, kind] of UNIT_KEYWORDS) {
    if (re.test(route)) return kind;
  }
  return fallback;
}

export function reclassifyGraphUnits(nodes: ExperienceRouteNode[]): ExperienceRouteNode[] {
  return nodes.map((n) => ({ ...n, experience_unit: classifyExperienceUnit(n.route, n.experience_unit) }));
}

export const ALL_EXPERIENCE_UNIT_KINDS: ExperienceUnitKind[] = [
  'STANDARD_PAGE',
  'ENTRY',
  'HUB',
  'ROUTE_SELECTOR',
  'CONTENT',
  'WORKFLOW',
  'MULTI_STEP_FLOW',
  'CONFIGURATOR',
  'DIAGNOSTIC',
  'RECOMMENDATION_ENGINE',
  'INTERACTIVE_TOOL',
  'CUSTOM_EXPERIENCE',
  'IMMERSIVE_EXPERIENCE',
  'TRANSACTION_FLOW',
  'DASHBOARD',
  'PORTAL',
  'CONTENT_SYSTEM',
  'COMMERCE_EXPERIENCE',
  'BOOKING_EXPERIENCE',
  'MEMBERSHIP_EXPERIENCE',
  'INTEGRATION',
  'CAPABILITY_INSTALL',
  'REPAIR_WORKFLOW',
  'EXTERNAL_LOCATION',
  'SYSTEM_UTILITY',
];
