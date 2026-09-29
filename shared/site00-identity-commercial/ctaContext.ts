/**
 * Website → intake commercial context (serviceId / packageId / mode).
 */

import { getCanonicalPackage } from '../site00-commercial-canon/serviceCatalog.js';
import type { IdentityCommercialSelection } from './types.js';
import { IDENTITY_TIER_PACKAGE_IDS, resolveIdentityPackageRow } from './inventory.js';

const DEFAULT_HUB: IdentityCommercialSelection = {
  serviceId: 'services-hub-branding',
  packageId: 'services-hub-branding',
  commercialMode: 'CUSTOM_QUOTE',
};

export function parseIdentityCommercialSearchParams(search: string): IdentityCommercialSelection {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  let serviceId = params.get('serviceId')?.trim() ?? '';
  let packageId = params.get('packageId')?.trim() ?? '';
  const tier = params.get('tier')?.trim() ?? params.get('investmentTier')?.trim() ?? '';

  if (!serviceId && tier && IDENTITY_TIER_PACKAGE_IDS.includes(tier as (typeof IDENTITY_TIER_PACKAGE_IDS)[number])) {
    serviceId = 'idnty-investment-tiers';
    packageId = tier;
  }

  if (!serviceId) return { ...DEFAULT_HUB, sourceRoute: null };

  if (!packageId) {
    packageId = serviceId === 'idnty-investment-tiers' ? 'foundation' : serviceId;
  }

  const row = resolveIdentityPackageRow(serviceId, packageId);
  const pkg = getCanonicalPackage(serviceId, packageId);
  const commercialMode = pkg?.commercialMode ?? row?.commercialMode ?? 'CUSTOM_QUOTE';

  return {
    serviceId,
    packageId,
    commercialMode,
    selectedOfferLabel: row?.tierLabel ?? pkg?.name ?? null,
    sourceRoute: null,
  };
}

export function appendIdentityCommercialQuery(path: string, selection: IdentityCommercialSelection): string {
  const url = new URL(path, 'https://site00.local');
  url.searchParams.set('serviceId', selection.serviceId);
  url.searchParams.set('packageId', selection.packageId);
  if (selection.commercialMode) url.searchParams.set('commercialMode', selection.commercialMode);
  return `${url.pathname}${url.search}`;
}

export function commercialBlockFromDraftPayload(draft: Record<string, unknown>): IdentityCommercialSelection | null {
  const commercial = draft.commercial;
  if (!commercial || typeof commercial !== 'object') return null;
  const c = commercial as Record<string, unknown>;
  const serviceId = String(c.serviceId ?? '');
  const packageId = String(c.packageId ?? '');
  if (!serviceId || !packageId) return null;
  return {
    serviceId,
    packageId,
    commercialMode: (c.commercialMode as IdentityCommercialSelection['commercialMode']) ?? 'CUSTOM_QUOTE',
    selectedOfferLabel: (c.selectedOfferLabel as string | null) ?? null,
    sourceRoute: (c.sourceRoute as string | null) ?? null,
  };
}

export function mergeCommercialIntoDraftPayload(
  draft: Record<string, unknown>,
  selection: IdentityCommercialSelection,
  sourceRoute?: string,
): Record<string, unknown> {
  return {
    ...draft,
    commercial: {
      serviceId: selection.serviceId,
      packageId: selection.packageId,
      commercialMode: selection.commercialMode,
      selectedOfferLabel: selection.selectedOfferLabel ?? null,
      sourceRoute: sourceRoute ?? selection.sourceRoute ?? null,
    },
  };
}
