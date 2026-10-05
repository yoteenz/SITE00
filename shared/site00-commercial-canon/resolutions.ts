/**
 * Parts 23–24 — Orphan + duplicate resolution records.
 */

export const ORPHAN_RESOLUTION = {
  ORPHAN_LOCATION: 'src/site00/pages/evolve/EvolveCommercialPage.tsx',
  ORPHAN_PURPOSE: 'Renders canonical shared/site00-evolve-commercial catalog with disabled SELECT PLAN',
  ROOT_CAUSE: 'Page never registered in Site00Routes.tsx — public traffic uses /evolve/plans (legacy tree B)',
  RESOLUTION:
    'Catalog authority moved to Site00ServiceCatalog; EvolveCommercialPage classified ADMIN_ONLY until Founder routes or retires UI (FD-EVOLVE-COMMERCIAL-PAGE)',
} as const;

export const DUPLICATED_SERVICES_RESOLUTION = [
  {
    duplicateId: 'DUP-EVOLVE-PRICING-TREES',
    kind: 'true_duplicate_authority' as const,
    treeA: 'shared/site00-evolve-commercial/catalog.ts',
    treeB: 'shared/site00-evolve-pricing/catalog.ts',
    resolution:
      'Tree A canonical for managed SKUs; Tree B legacy display via LEGACY_PACKAGE_ALIASES — assertNoSilentLegacyBilling() blocks billing from tree B',
  },
  {
    duplicateId: 'DUP-LAUNCH-CAMPAIGN',
    kind: 'different_fulfillment_scope' as const,
    ids: ['evolve-project-launch-campaign / launch_campaign', 'marketing-launch-campaign / marketing-launch-campaign'],
    resolution:
      'Not merged — EVOLVE project service vs Marketing intake category; aliases document distinct adapters (custom-quote vs marketing-campaign-fulfillment)',
  },
] as const;
