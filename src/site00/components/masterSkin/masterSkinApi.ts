/**
 * Master Skin API client.
 */

import { apiFetch } from '../../../utils/api.js';
import type {
  MasterSkin,
  MasterSkinRecommendationResult,
  ProjectExperienceSkin,
} from '../../../../shared/site00-brand-lore/projectSkin/browserClient.js';

async function postMasterSkin<T>(body: Record<string, unknown>): Promise<T> {
  const res = await apiFetch('/api/site00/master-skin?action=' + String(body.action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export async function fetchMasterSkinCatalog(): Promise<{ ok: boolean; skins?: MasterSkin[] }> {
  const res = await apiFetch('/api/site00/master-skin?action=catalog');
  return res.json() as Promise<{ ok: boolean; skins?: MasterSkin[] }>;
}

export async function fetchProjectSkin(projectId: string): Promise<{
  ok: boolean;
  binding?: ProjectExperienceSkin;
  skin?: MasterSkin;
}> {
  const res = await apiFetch(`/api/site00/master-skin?action=get&projectId=${encodeURIComponent(projectId)}`);
  return res.json() as Promise<{ ok: boolean; binding?: ProjectExperienceSkin; skin?: MasterSkin }>;
}

export async function recommendProjectSkin(input: {
  fieldTags: string[];
  brandPersonality?: string[];
  audience?: string;
  primaryColor?: string;
}): Promise<{ ok: boolean; recommendation?: MasterSkinRecommendationResult }> {
  return postMasterSkin({ action: 'recommend', ...input });
}

export async function approveProjectMasterSkin(input: {
  projectId: string;
  selectedSkinId: string;
  selectedBy?: string;
  primaryColor?: string;
}): Promise<{ ok: boolean; binding?: ProjectExperienceSkin }> {
  return postMasterSkin({ action: 'approve', ...input });
}

export async function completeSkinOnboarding(input: {
  projectId: string;
  fieldTags: string[];
  selectedSkinId: string;
  primaryColor: string;
  founderApproved: boolean;
  brandPersonality?: string[];
}): Promise<{ ok: boolean; binding?: ProjectExperienceSkin; recommendation?: MasterSkinRecommendationResult }> {
  return postMasterSkin({ action: 'onboarding_complete', selectedBy: 'founder', ...input });
}
