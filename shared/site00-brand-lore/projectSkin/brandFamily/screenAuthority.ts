/**
 * SkinScreenAuthority — one screen, one authority, one implementation target.
 */

import type { DesignReferencePurpose } from './referencePurpose.js';
import type { ReferenceJobType } from './referencePurpose.js';
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

function parseVersion(version: string): number {
  const n = Number.parseFloat(version);
  return Number.isFinite(n) ? n : 1;
}

export function createSkinScreenAuthority(input: {
  brandFamilySkinId: string;
  moduleId: string;
  screenType: StandardScreenType | string;
  viewport: ScreenAuthorityViewport;
  referenceAssetId: string;
  approvedByFounder?: boolean;
  version?: string;
  referencePurpose?: DesignReferencePurpose;
  jobType?: ReferenceJobType;
  founderNote?: string | null;
  authorityMode?: 'DESIGN_AUTHORITY';
  fidelityMode?: 'EXACT';
}): SkinScreenAuthority {
  const id = authorityKey(input.brandFamilySkinId, input.moduleId, input.screenType, input.viewport);
  const record: SkinScreenAuthority = {
    id,
    brandFamilySkinId: input.brandFamilySkinId,
    moduleId: input.moduleId,
    screenType: input.screenType,
    viewport: input.viewport,
    referenceAssetId: input.referenceAssetId,
    referencePurpose: 'SCREEN_AUTHORITY',
    jobType: 'SCREEN_AUTHORITY',
    authorityMode: input.authorityMode ?? 'DESIGN_AUTHORITY',
    fidelityMode: input.fidelityMode ?? 'EXACT',
    status: input.approvedByFounder ? 'APPROVED' : 'IN_PROGRESS',
    implementationStatus: 'NOT_STARTED',
    visualMatchStatus: 'NOT_EVALUATED',
    approvedByFounder: input.approvedByFounder ?? false,
    approvedAt: input.approvedByFounder ? new Date().toISOString() : null,
    version: input.version ?? '1.0',
    visualConvergenceRequired: true,
    founderNote: input.founderNote ?? null,
    fidelityContractId: null,
    convergenceSessionId: null,
  };
  authorityStore.set(id, record);
  return record;
}

export function replaceSkinScreenAuthorityVersion(
  id: string,
  input: {
    referenceAssetId: string;
    approvedByFounder?: boolean;
    founderNote?: string | null;
  },
): SkinScreenAuthority | null {
  const existing = authorityStore.get(id);
  if (!existing) return null;

  const nextVersion = `${parseVersion(existing.version) + 1}.0`;
  const record: SkinScreenAuthority = {
    ...existing,
    referenceAssetId: input.referenceAssetId,
    version: nextVersion,
    status: input.approvedByFounder ? 'APPROVED' : 'IN_PROGRESS',
    implementationStatus: 'NOT_STARTED',
    visualMatchStatus: 'NOT_EVALUATED',
    approvedByFounder: input.approvedByFounder ?? true,
    approvedAt: input.approvedByFounder !== false ? new Date().toISOString() : null,
    founderNote: input.founderNote ?? existing.founderNote ?? null,
    fidelityContractId: null,
    convergenceSessionId: null,
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

export function patchSkinScreenAuthority(
  id: string,
  patch: Partial<Pick<SkinScreenAuthority, 'implementationStatus' | 'visualMatchStatus' | 'status' | 'fidelityContractId' | 'convergenceSessionId'>>,
): SkinScreenAuthority | null {
  const record = authorityStore.get(id);
  if (!record) return null;
  Object.assign(record, patch);
  return record;
}

export function getScreenAuthorityStatus(
  brandFamilySkinId: string,
  screenType: StandardScreenType | string,
  viewport?: ScreenAuthorityViewport,
): ScreenAuthorityStatus {
  const authorities = listScreenAuthoritiesForFamily(brandFamilySkinId).filter((a) => {
    if (a.screenType !== screenType && a.screenType !== screenType.replace(/_/g, ' ')) return false;
    if (viewport && a.viewport !== viewport) return false;
    return true;
  });
  if (authorities.length === 0) return 'NOT_STARTED';
  if (authorities.some((a) => a.status === 'APPROVED' || a.status === 'IMPLEMENTED' || a.status === 'VERIFIED')) {
    return 'APPROVED';
  }
  return 'IN_PROGRESS';
}

export function getScreenPackSlotStatuses(
  brandFamilySkinId: string,
  packScreenType: StandardScreenType,
  moduleScreenType: string,
): Record<ScreenAuthorityViewport, ScreenAuthorityStatus> {
  const authorities = listScreenAuthoritiesForFamily(brandFamilySkinId).filter(
    (a) => a.screenType === moduleScreenType || a.screenType === packScreenType,
  );
  const result: Record<ScreenAuthorityViewport, ScreenAuthorityStatus> = {
    MOBILE: 'NOT_STARTED',
    TABLET: 'NOT_STARTED',
    DESKTOP: 'NOT_STARTED',
  };
  for (const viewport of ['MOBILE', 'TABLET', 'DESKTOP'] as ScreenAuthorityViewport[]) {
    const match = authorities.find((a) => a.viewport === viewport);
    if (!match) continue;
    result[viewport] = match.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : match.status === 'NOT_STARTED' ? 'NOT_STARTED' : 'APPROVED';
  }
  return result;
}

export function clearScreenAuthoritiesForTest(): void {
  authorityStore.clear();
}
