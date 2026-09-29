/**
 * Part 1 — Dual EVOLVE pricing tree audit (PR #1250).
 */

export const TREE_A = {
  id: 'EVOLVE_COMMERCIAL_CATALOG',
  location: 'shared/site00-evolve-commercial/catalog.ts',
  role: 'CANONICAL_MANAGED_SERVICES',
  packageIdExamples: [
    'evolve_foundation',
    'evolve_essential',
    'evolve_growth',
    'evolve_studio',
    'evolve_private',
    'creative_direction_intensive',
    'launch_campaign',
    'paid_media_management',
  ],
  pricingFields: ['priceCents', 'priceQualifier', 'billingInterval', 'billingType'],
  ctaDependencies: ['Admin setEvolveCommercialPlan', 'EvolveCommercialPage (unrouted)'],
  intakeDependencies: ['EVOLVE OS onboarding', 'Foundation qualification'],
  projectDependencies: ['site00_projects', 'marketing profile metadata commercial.planId'],
  productionDependencies: ['api/_lib/site00Evolve/*', 'project EVOLVE modules'],
  consumers: [
    'api/admin/site00-evolve.ts',
    'api/_lib/site00Evolve/commercial/governedActions.ts',
    'projectResolver commercial summary',
    'EvolveCommercialPage.tsx',
  ],
} as const;

export const TREE_B = {
  id: 'EVOLVE_PRICING_UI_CATALOG',
  location: 'shared/site00-evolve-pricing/catalog.ts',
  role: 'LEGACY_PUBLIC_DISPLAY_ONLY',
  packageIdExamples: [
    'evolve-solo',
    'evolve-studio',
    'evolve-pro',
    'project-pass',
    'discovery-sprint',
    'directed-build',
    'marketing-retainer',
  ],
  pricingFields: ['price (display string)', 'priceDetail', 'ctaRoute'],
  ctaDependencies: ['/evolve/plans → sign-in query or /contact?offer='],
  intakeDependencies: ['None wired'],
  projectDependencies: ['None automatic'],
  productionDependencies: ['None'],
  consumers: ['src/site00/pages/evolve/EvolvePricingPage.tsx'],
} as const;

export const DUAL_PRICING_RESOLUTION = {
  canonicalTree: TREE_A.id,
  canonicalPath: TREE_A.location,
  legacyCompatibilityTree: TREE_B.id,
  legacyPath: TREE_B.location,
  normalizationLayer: 'shared/site00-commercial-canon/serviceCatalog.ts (Site00ServiceCatalog)',
  rule: 'Legacy tree B is display/CTA compatibility only — never billing or entitlement authority.',
} as const;
