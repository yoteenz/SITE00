/**
 * B5.6 — Campaign package API client.
 */

import { apiFetch } from '../../../../utils/api.js';
import type { LegacyEntry001LocalState } from '../../../../../shared/site00-campaign-package/types.js';
import type { Entry001ArchiveStatePersisted } from './entry001ArchiveIntelligence.js';

export type CampaignPackageApiResponse = {
  ok: boolean;
  snapshot: unknown;
  legacy: Entry001ArchiveStatePersisted;
  carouselAssets?: unknown[];
  storyAssets?: unknown[];
  migrated?: boolean;
  error?: string;
  founderMessage?: string;
  conflict?: { code: string; message: string };
};

const BASE = '/api/site00/campaign-package';

export async function fetchCampaignPackage(): Promise<CampaignPackageApiResponse> {
  const res = await apiFetch(`${BASE}?action=get`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to load package');
  }
  return res.json() as Promise<CampaignPackageApiResponse>;
}

export async function migrateCampaignPackage(legacy: LegacyEntry001LocalState): Promise<CampaignPackageApiResponse> {
  const res = await apiFetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'migrate', legacy }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as CampaignPackageApiResponse;
    throw new Error(body.founderMessage ?? body.error ?? 'PACKAGE SYNC REQUIRED');
  }
  return res.json() as Promise<CampaignPackageApiResponse>;
}

export async function reorderCampaignSequence(args: {
  formatFamily: 'CAROUSEL' | 'STORY';
  orderedAssetIds: string[];
  expectedVersion: number;
}): Promise<CampaignPackageApiResponse> {
  const res = await apiFetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reorder_sequence', ...args }),
  });
  const body = (await res.json()) as CampaignPackageApiResponse;
  if (res.status === 409) return body;
  if (!res.ok) throw new Error(body.founderMessage ?? 'SAVE FAILED');
  return body;
}

export async function removeCampaignAssetApi(assetId: string): Promise<CampaignPackageApiResponse> {
  const res = await apiFetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'remove_asset', assetId }),
  });
  if (!res.ok) throw new Error('SAVE FAILED');
  return res.json() as Promise<CampaignPackageApiResponse>;
}

export async function restoreCampaignAssetApi(assetId: string): Promise<CampaignPackageApiResponse> {
  const res = await apiFetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'restore_asset', assetId }),
  });
  if (!res.ok) throw new Error('SAVE FAILED');
  return res.json() as Promise<CampaignPackageApiResponse>;
}

export async function reclassifyCampaignAssetApi(
  assetId: string,
  patch: Record<string, unknown>,
): Promise<CampaignPackageApiResponse> {
  const res = await apiFetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reclassify_asset', assetId, patch }),
  });
  if (!res.ok) throw new Error('SAVE FAILED');
  return res.json() as Promise<CampaignPackageApiResponse>;
}
