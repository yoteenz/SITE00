/**
 * SkinScreenAuthority — one screen, one authority, one implementation target.
 */

import type { SkinScreenAuthority, ScreenAuthorityStatus, StandardScreenType, ScreenAuthorityViewport } from './types.js';

const authorityStore = new Map<string, SkinScreenAuthority>();

function authorityKey(
  brandFamilySkinId: string,
  moduleId: string,
  screenType: string,
  viewport: ScreenAuthorityViewport,
): string {
  return `${brandFamilySkinId}:${moduleId}:${screenType}:${viewport}`;
}

export function createSkinScreenAuthority(input: {
  brandFamilySkinId: string;
  moduleId: string;
  screenType: StandardScreenType | string;
  viewport: ScreenAuthorityViewport;
  referenceAssetId: string;
  approvedByFounder?: boolean;
  version?: string;
}): SkinScreenAuthority {
  const id = authorityKey(input.brandFamilySkinId, input.moduleId, input.screenType, input.viewport);
  const record: SkinScreenAuthority = {
    id,
    brandFamilySkinId: input.brandFamilySkinId,
    moduleId: input.moduleId,
    screenType: input.screenType,
    viewport: input.viewport,
    referenceAssetId: input.referenceAssetId,
    authorityMode: 'DESIGN_AUTHORITY',
    fidelityMode: 'EXACT',
    status: input.approvedByFounder ? 'APPROVED' : 'IN_PROGRESS',
    approvedByFounder: input.approvedByFounder ?? false,
    approvedAt: input.approvedByFounder ? new Date().toISOString() : null,
    version: input.version ?? '1.0',
    visualConvergenceRequired: true,
  };
  authorityStore.set(id, record);
  return record;
}

export function getSkinScreenAuthority(
  brandFamilySkinId: string,
  moduleId: string,
  screenType: string,
  viewport: ScreenAuthorityViewport,
): SkinScreenAuthority | null {
  return authorityStore.get(authorityKey(brandFamilySkinId, moduleId, screenType, viewport)) ?? null;
}

export function listScreenAuthoritiesForFamily(brandFamilySkinId: string): SkinScreenAuthority[] {
  return [...authorityStore.values()].filter((a) => a.brandFamilySkinId === brandFamilySkinId);
}

export function approveSkinScreenAuthority(id: string, _approvedBy = 'founder'): SkinScreenAuthority | null {
  const record = authorityStore.get(id);
  if (!record) return null;
  record.status = 'APPROVED';
  record.approvedByFounder = true;
  record.approvedAt = new Date().toISOString();
  return record;
}

export function getScreenAuthorityStatus(
  brandFamilySkinId: string,
  screenType: StandardScreenType | string,
): ScreenAuthorityStatus {
  const authorities = listScreenAuthoritiesForFamily(brandFamilySkinId).filter((a) => a.screenType === screenType);
  if (authorities.length === 0) return 'NOT_STARTED';
  if (authorities.some((a) => a.status === 'APPROVED')) return 'APPROVED';
  return 'IN_PROGRESS';
}

export function clearScreenAuthoritiesForTest(): void {
  authorityStore.clear();
}
