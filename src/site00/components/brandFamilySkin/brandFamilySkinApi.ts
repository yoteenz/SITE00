/**
 * Brand Family Skin API client.
 */

import { apiFetch } from '../../../utils/api.js';

export async function fetchBrandFamilyRegistry() {
  const res = await apiFetch('/api/site00/brand-family-skin?action=registry');
  return res.json();
}

export async function fetchProjectExperienceSkin(projectId: string) {
  const res = await apiFetch(`/api/site00/brand-family-skin?action=get&projectId=${encodeURIComponent(projectId)}`);
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
