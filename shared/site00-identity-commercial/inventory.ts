/**
 * Identity service/package inventory (canonical commercial spine — not a pricing source).
 */

export type IdentityPackageRow = {
  serviceId: string;
  packageId: string;
  publicRoute: string;
  commercialMode: 'CUSTOM_QUOTE';
  intakeRoute: string;
  projectType: 'IDENTITY';
  workspaceRoute: string;
  currentProductionEntry: string;
  deliverableType: 'IDENTITY_SYSTEM_PACKAGE';
  tierLabel?: string;
};

export const IDENTITY_SERVICE_IDS = ['services-hub-branding', 'idnty-investment-tiers'] as const;

/** Tier SKUs from IDNTY_INVESTMENT_TIERS (display config mirrored for catalog resolution). */
export const IDENTITY_TIER_PACKAGE_IDS = [
  'foundation',
  'refine',
  'evolve',
  'build-ready-tier',
] as const;

export type IdentityTierPackageId = (typeof IDENTITY_TIER_PACKAGE_IDS)[number];

export function listIdentityCommercialPackages(): IdentityPackageRow[] {
  const hub: IdentityPackageRow = {
    serviceId: 'services-hub-branding',
    packageId: 'services-hub-branding',
    publicRoute: '/services',
    commercialMode: 'CUSTOM_QUOTE',
    intakeRoute: '/idnty/:stateSlug/*',
    projectType: 'IDENTITY',
    workspaceRoute: '/projects/:projectSlug/identity',
    currentProductionEntry: 'identity-brand-discovery',
    deliverableType: 'IDENTITY_SYSTEM_PACKAGE',
  };

  const tierBase: Omit<IdentityPackageRow, 'serviceId' | 'packageId' | 'tierLabel'> = {
    publicRoute: '/idnty/state',
    commercialMode: 'CUSTOM_QUOTE',
    intakeRoute: '/idnty/:stateSlug/*',
    projectType: 'IDENTITY',
    workspaceRoute: '/projects/:projectSlug/identity',
    currentProductionEntry: 'identity-brand-discovery',
    deliverableType: 'IDENTITY_SYSTEM_PACKAGE',
  };

  const tiers: IdentityPackageRow[] = IDENTITY_TIER_PACKAGE_IDS.map((tierId) => ({
    ...tierBase,
    serviceId: 'idnty-investment-tiers',
    packageId: tierId,
    tierLabel: tierId.replace(/-/g, ' ').toUpperCase(),
  }));

  return [hub, ...tiers];
}

export function resolveIdentityPackageRow(
  serviceId: string,
  packageId: string,
): IdentityPackageRow | null {
  return listIdentityCommercialPackages().find((p) => p.serviceId === serviceId && p.packageId === packageId) ?? null;
}
