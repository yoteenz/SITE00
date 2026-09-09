/**
 * Brand family skin resolver — authority-gated rendering, generic fallback when missing.
 */

import { BRAND_FAMILY_LEGACY_MASTER_SKIN } from './constants.js';
import { getBrandFamilySkinByKey } from './registry.js';
import { getSkinScreenAuthority } from './screenAuthority.js';
import type { ResolvedBrandFamilySkin, ScreenAuthorityViewport, StandardScreenType } from './types.js';
import { getProjectBrandFamilyBinding } from './projectBinding.js';
import { listScreenAuthoritiesForFamily } from './screenAuthority.js';
import { getOrCreateSkinPack } from './skinPack.js';

export function resolveBrandFamilySkin(
  projectId: string,
  moduleId: string,
  screenType: StandardScreenType | string = 'PROJECT_OVERVIEW',
  viewport: ScreenAuthorityViewport = 'MOBILE',
): ResolvedBrandFamilySkin | null {
  const binding = getProjectBrandFamilyBinding(projectId);
  if (!binding?.active) return null;

  const family = getBrandFamilySkinByKey(binding.brandFamilySkinId);
  if (!family) {
    return {
      projectId,
      brandFamilySkinId: binding.brandFamilySkinId,
      brandKey: binding.brandFamilySkinId as ResolvedBrandFamilySkin['brandKey'],
      skinVersion: binding.skinVersion,
      skinIntent: 'EDITORIAL_INTELLIGENCE_DOSSIER',
      primaryColor: binding.primaryColor,
      visualAuthorityStatus: 'NOT_STARTED',
      renderMode: 'GENERIC_FALLBACK',
      screenAuthority: null,
      failureCode: 'BRAND_FAMILY_SKIN_MISSING',
      cssClass: null,
      hostFirewallStatus: 'INTACT',
    };
  }

  const resolvedModuleId = screenType === 'PROJECT_OVERVIEW' ? 'OVERVIEW' : moduleId;
  const authority = getSkinScreenAuthority(family.id, resolvedModuleId, screenType, viewport);

  if (authority?.status === 'APPROVED') {
    return {
      projectId,
      brandFamilySkinId: family.id,
      brandKey: family.brandKey,
      skinVersion: family.version,
      skinIntent: family.skinIntent,
      primaryColor: binding.primaryColor,
      visualAuthorityStatus: family.visualAuthorityStatus,
      renderMode: 'AUTHORITY_DRIVEN',
      screenAuthority: authority,
      failureCode: null,
      cssClass: `site00-brand-family-skin site00-brand-family-skin--${family.slug}`,
      hostFirewallStatus: 'INTACT',
    };
  }

  if (family.status === 'EXISTING_SKIN_TO_REFINE' && family.legacyMasterSkinId) {
    return {
      projectId,
      brandFamilySkinId: family.id,
      brandKey: family.brandKey,
      skinVersion: family.version,
      skinIntent: family.skinIntent,
      primaryColor: binding.primaryColor,
      visualAuthorityStatus: family.visualAuthorityStatus,
      renderMode: 'EXISTING_IMPLEMENTATION',
      screenAuthority: authority,
      failureCode: null,
      cssClass: `site00-master-skin site00-master-skin--${BRAND_FAMILY_LEGACY_MASTER_SKIN[family.brandKey]?.replace(/-/g, '-') ?? family.slug}`,
      hostFirewallStatus: 'INTACT',
    };
  }

  return {
    projectId,
    brandFamilySkinId: family.id,
    brandKey: family.brandKey,
    skinVersion: family.version,
    skinIntent: family.skinIntent,
    primaryColor: binding.primaryColor,
    visualAuthorityStatus: family.visualAuthorityStatus,
    renderMode: 'GENERIC_FALLBACK',
    screenAuthority: null,
    failureCode: 'SKIN_SCREEN_AUTHORITY_REQUIRED',
    cssClass: null,
    hostFirewallStatus: 'INTACT',
  };
}

export function shouldBlockAutoSkinDesign(projectId: string, screenType: string): boolean {
  const resolved = resolveBrandFamilySkin(projectId, 'OVERVIEW', screenType);
  if (!resolved) return false;
  return resolved.renderMode === 'GENERIC_FALLBACK' && resolved.failureCode === 'SKIN_SCREEN_AUTHORITY_REQUIRED';
}

export function brandFamilyInspectorPayload(projectId: string) {
  const binding = getProjectBrandFamilyBinding(projectId);
  const family = binding ? getBrandFamilySkinByKey(binding.brandFamilySkinId) : null;
  const authorities = family ? listScreenAuthoritiesForFamily(family.id) : [];

  return {
    projectId,
    brandFamilySkinId: binding?.brandFamilySkinId ?? null,
    skinVersion: binding?.skinVersion ?? family?.version ?? null,
    fieldTags: binding?.fieldTags ?? family?.fieldTags ?? [],
    primaryColor: binding?.primaryColor ?? family?.primaryColor ?? null,
    skinIntent: family?.skinIntent ?? null,
    visualAuthorityStatus: family?.visualAuthorityStatus ?? null,
    screenPackCompletion: family ? getOrCreateSkinPack(family.id).completionStatus : null,
    moduleVariants: family?.moduleVariants ?? [],
    approvedAuthorityCount: authorities.filter((a: { status: string }) => a.status === 'APPROVED').length,
    implementedAuthorityCount: authorities.filter((a: { status: string }) => a.status === 'IMPLEMENTED').length,
    verifiedAuthorityCount: authorities.filter((a: { status: string }) => a.status === 'VERIFIED').length,
    founderApproved: binding?.founderApproved ?? false,
    hostFirewallStatus: 'INTACT' as const,
  };
}
