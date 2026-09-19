/**
 * BrandFamilySkinPack — standard screen pack + partial completion support.
 */

import { DEFAULT_SCREEN_DESIGN_ORDER } from './constants.js';
import { getBrandFamilySkinByKey } from './registry.js';
import { getScreenAuthorityStatus, getScreenPackSlotStatuses, listScreenAuthoritiesForFamily } from './screenAuthority.js';
import { SCREEN_SLOT_PREFILL } from './screenSlotConfig.js';
import type { BrandFamilySkinPack, StandardScreenType } from './types.js';
import { STANDARD_SCREEN_PACK } from './types.js';

const packStore = new Map<string, BrandFamilySkinPack>();

function packKey(brandFamilySkinId: string, skinVersion: string): string {
  return `${brandFamilySkinId}@${skinVersion}`;
}

export function getOrCreateSkinPack(brandFamilySkinId: string): BrandFamilySkinPack {
  const skin = getBrandFamilySkinByKey(brandFamilySkinId);
  const skinVersion = skin?.version ?? '1.0';
  const key = packKey(brandFamilySkinId, skinVersion);
  const existing = packStore.get(key);
  if (existing) return existing;

  const authorities = listScreenAuthoritiesForFamily(brandFamilySkinId);
  const approvedCount = authorities.filter((a) => a.status === 'APPROVED').length;

  const pack: BrandFamilySkinPack = {
    brandFamilySkinId,
    skinVersion,
    screenAuthorities: authorities,
    completionStatus: approvedCount === 0 ? 'NOT_STARTED' : approvedCount >= STANDARD_SCREEN_PACK.length ? 'COMPLETE' : 'PARTIAL',
    consistencyStatus: 'NOT_EVALUATED',
    implementationStatus: approvedCount === 0 ? 'NOT_STARTED' : 'PARTIAL',
    founderApproved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  packStore.set(key, pack);
  return pack;
}

export function getStandardScreenPackStatus(brandFamilySkinId: string): Record<StandardScreenType, string> {
  const result = {} as Record<StandardScreenType, string>;
  for (const screen of STANDARD_SCREEN_PACK) {
    const slot = SCREEN_SLOT_PREFILL[screen];
    result[screen] = getScreenAuthorityStatus(brandFamilySkinId, slot.screenType);
  }
  return result;
}

export function getStandardScreenPackViewportStatus(
  brandFamilySkinId: string,
): Record<StandardScreenType, Record<'MOBILE' | 'TABLET' | 'DESKTOP', string>> {
  const result = {} as Record<StandardScreenType, Record<'MOBILE' | 'TABLET' | 'DESKTOP', string>>;
  for (const screen of STANDARD_SCREEN_PACK) {
    const slot = SCREEN_SLOT_PREFILL[screen];
    const statuses = getScreenPackSlotStatuses(brandFamilySkinId, screen, slot.screenType);
    result[screen] = {
      MOBILE: statuses.MOBILE,
      TABLET: statuses.TABLET,
      DESKTOP: statuses.DESKTOP,
    };
  }
  return result;
}

export function getDefaultFirstAuthorityScreen(): StandardScreenType {
  return DEFAULT_SCREEN_DESIGN_ORDER[0] as StandardScreenType;
}

export function supportsPartialSkinPack(brandFamilySkinId: string): boolean {
  const pack = getOrCreateSkinPack(brandFamilySkinId);
  return pack.completionStatus === 'PARTIAL' || pack.completionStatus === 'NOT_STARTED';
}

export function refreshSkinPack(brandFamilySkinId: string): BrandFamilySkinPack {
  const skin = getBrandFamilySkinByKey(brandFamilySkinId);
  const key = packKey(brandFamilySkinId, skin?.version ?? '1.0');
  packStore.delete(key);
  return getOrCreateSkinPack(brandFamilySkinId);
}

export function clearSkinPacksForTest(): void {
  packStore.clear();
}
