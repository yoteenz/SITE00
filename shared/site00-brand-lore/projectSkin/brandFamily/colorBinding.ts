/**
 * BrandSkinColorBinding — color separate from skin grammar.
 */

import { BRAND_FAMILY_PRIMARY_COLORS } from './constants.js';
import { getBrandFamilySkinByKey } from './registry.js';
import type { BrandSkinColorBinding } from './types.js';

export function buildBrandSkinColorBinding(brandFamilySkinId: string): BrandSkinColorBinding | null {
  const skin = getBrandFamilySkinByKey(brandFamilySkinId);
  if (!skin) return null;

  const colors = BRAND_FAMILY_PRIMARY_COLORS[skin.brandKey] ?? {};
  return {
    brandFamilySkinId: skin.id,
    hostAccentBehavior: 'HOST_RED_ONLY',
    projectPrimaryColor: skin.primaryColor ?? colors.color ?? '#333333',
    projectSecondaryColor: null,
    accentCoveragePolicy: 'MODERATE',
  };
}

export function colorIsSeparateFromSkinGrammar(
  bindingA: BrandSkinColorBinding,
  bindingB: BrandSkinColorBinding,
  skinAId: string,
  skinBId: string,
): boolean {
  const sameColor =
    bindingA.projectPrimaryColor === bindingB.projectPrimaryColor ||
    bindingA.hostAccentBehavior === bindingB.hostAccentBehavior;
  return sameColor && skinAId !== skinBId;
}
