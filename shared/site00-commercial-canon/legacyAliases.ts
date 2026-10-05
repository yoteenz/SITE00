/**
 * Part 3 — Legacy package ID → canonical catalog (compatibility only).
 */

import type { LegacyPackageAlias } from './types.js';

export const LEGACY_PACKAGE_ALIASES: readonly LegacyPackageAlias[] = [
  {
    legacyAuthority: 'site00-evolve-pricing',
    legacyPackageId: 'evolve-solo',
    canonicalServiceId: 'evolve-pricing-ui-self-directed',
    canonicalPackageId: 'legacy-evolve-solo',
    notes: 'Display-only SaaS tier — no canonical managed SKU; do not bill from legacy ID',
  },
  {
    legacyAuthority: 'site00-evolve-pricing',
    legacyPackageId: 'discovery-sprint',
    canonicalServiceId: 'evolve-pricing-ui-directed',
    canonicalPackageId: 'legacy-discovery-sprint',
    notes: 'Maps to contact flow — not evolve_foundation (different product semantics)',
  },
  {
    legacyAuthority: 'site00-evolve-pricing',
    legacyPackageId: 'marketing-retainer',
    canonicalServiceId: 'evolve-recurring-growth',
    canonicalPackageId: 'evolve-recurring-growth',
    notes: 'Approximate alias — FOUNDER_DECISION_REQUIRED to merge or redirect UI',
  },
  {
    legacyAuthority: 'site00-evolve-commercial',
    legacyPackageId: 'launch_campaign',
    canonicalServiceId: 'evolve-project-launch-campaign',
    canonicalPackageId: 'launch_campaign',
    notes: 'Canonical EVOLVE project service',
  },
  {
    legacyAuthority: 'site00-marketing',
    legacyPackageId: 'launch-campaign',
    canonicalServiceId: 'marketing-launch-campaign',
    canonicalPackageId: 'marketing-launch-campaign',
    notes: 'Distinct from evolve launch_campaign — marketing intake category, not duplicate authority',
  },
];

export function resolveCanonicalPackageId(
  legacyAuthority: string,
  legacyPackageId: string,
): { serviceId: string; packageId: string } | null {
  const hit = LEGACY_PACKAGE_ALIASES.find(
    (a) => a.legacyAuthority === legacyAuthority && a.legacyPackageId === legacyPackageId,
  );
  if (!hit) return null;
  return { serviceId: hit.canonicalServiceId, packageId: hit.canonicalPackageId };
}

export function assertNoSilentLegacyBilling(legacyAuthority: string): boolean {
  return legacyAuthority !== 'site00-evolve-pricing';
}
