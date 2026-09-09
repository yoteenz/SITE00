/**
 * Brand Family Skin API client.
 */

import { apiFetch } from '../../../utils/api.js';
import type { StandardScreenType } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/types.js';

export async function fetchBrandFamilyRegistry() {
  const res = await apiFetch('/api/site00/brand-family-skin?action=registry');
  return res.json();
}

export async function fetchProjectExperienceSkin(projectId: string) {
  const res = await apiFetch(`/api/site00/brand-family-skin?action=get&projectId=${encodeURIComponent(projectId)}`);
  return res.json();
}

export async function fetchFamilyAuthorities(brandFamilySkinId: string) {
  const res = await apiFetch(
    `/api/site00/brand-family-skin?action=authorities&brandFamilySkinId=${encodeURIComponent(brandFamilySkinId)}`,
  );
  return res.json();
}

export async function fetchAuthorityPrefill(brandFamilySkinId: string, packScreenType: StandardScreenType) {
  const res = await apiFetch(
    `/api/site00/brand-family-skin?action=prefill&brandFamilySkinId=${encodeURIComponent(brandFamilySkinId)}&packScreenType=${encodeURIComponent(packScreenType)}`,
  );
  return res.json() as Promise<{
    ok: boolean;
    prefill?: { moduleId: string; screenType: string; screenLabel: string; defaultViewport: 'MOBILE' | 'TABLET' | 'DESKTOP' };
    contractPreview?: {
      keepFunction: boolean;
      rebuildLook: boolean;
      protectCurrentVisuals: boolean;
      screenshotQaRequired: boolean;
      visualConvergenceRequired: boolean;
    };
  }>;
}

export async function registerScreenAuthority(input: {
  brandFamilySkinId: string;
  packScreenType: StandardScreenType;
  moduleId?: string;
  screenType?: string;
  viewport: 'MOBILE' | 'TABLET' | 'DESKTOP';
  referenceAssetId: string;
  projectId: string;
  founderNote?: string;
}) {
  const res = await apiFetch('/api/site00/brand-family-skin?action=register_authority', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      referencePurpose: 'SCREEN_AUTHORITY',
      authorityMode: 'DESIGN_AUTHORITY',
      fidelityMode: 'EXACT',
      approvedByFounder: true,
    }),
  });
  return res.json();
}

export async function implementScreenAuthority(input: {
  brandFamilySkinId: string;
  moduleId: string;
  screenType: string;
  viewport: 'MOBILE' | 'TABLET' | 'DESKTOP';
  projectId: string;
}) {
  const res = await apiFetch('/api/site00/brand-family-skin?action=implement_authority', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function routeReferencePurpose(referencePurpose: string) {
  const res = await apiFetch('/api/site00/brand-family-skin?action=route_reference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referencePurpose }),
  });
  return res.json();
}

export async function approveBrandFamilySkinAssignment(input: {
  projectId: string;
  brandFamilySkinId: string;
  primaryColor?: string;
}) {
  const res = await apiFetch('/api/site00/brand-family-skin?action=approve_assignment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, selectedBy: 'founder' }),
  });
  return res.json();
}
