/**
 * P0.VR.4R1 / P0.VR.4R2 — Design asset reconstruction API client helpers.
 */

import { apiFetch } from '../../../utils/api.js';
import type { DesignReconstructionAsset } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/client.js';
import type {
  GenerationReceipt,
  GoldenAcceptanceConditions,
  MaterialPreservationQA,
  BackgroundRemovalReceipt,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/browserClient.js';
import type { CropCoordinateRecord, DesignGenerationPreflightResult } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/browserClient.js';
import type { SourcePixelBounds } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/browserClient.js';

export type LiveGenerateResponse = {
  ok: boolean;
  blocked?: boolean;
  blocker?: string;
  preflight?: DesignGenerationPreflightResult;
  dispatchCounts?: { generations: number; cropVersion: number };
  result?: {
    assetId: string | null;
    generationReceipt: GenerationReceipt | null;
    backgroundRemovalReceipt: BackgroundRemovalReceipt | null;
    materialQa: MaterialPreservationQA | null;
    conditions: GoldenAcceptanceConditions;
  };
  asset?: DesignReconstructionAsset | null;
};

export async function postDesignAssetReconstruction<T>(body: Record<string, unknown>): Promise<T> {
  const res = await apiFetch('/api/site00/design-asset-reconstruction?action=' + String(body.action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export async function extractPlanetCrop(input: {
  assetId?: string;
  founderAdjustedBounds?: SourcePixelBounds | null;
}): Promise<{ ok: boolean; cropRecord?: CropCoordinateRecord; asset?: DesignReconstructionAsset }> {
  return postDesignAssetReconstruction({
    action: 'extract_crop',
    assetId: input.assetId,
    founderAdjustedBounds: input.founderAdjustedBounds ?? null,
  });
}

export async function approvePlanetCrop(assetId: string): Promise<{ ok: boolean; cropRecord?: CropCoordinateRecord }> {
  return postDesignAssetReconstruction({ action: 'approve_crop', assetId });
}

export async function preflightPlanetGenerate(assetId: string): Promise<{
  ok: boolean;
  preflight?: DesignGenerationPreflightResult;
  dispatchCounts?: { generations: number; cropVersion: number };
  cropRecord?: CropCoordinateRecord;
}> {
  return postDesignAssetReconstruction({
    action: 'preflight',
    assetId,
    explicitFounderAction: true,
  });
}

export async function generateLivePlanetAsset(input: {
  assetId: string;
  cropApproved: boolean;
  founderAdjustedBounds?: SourcePixelBounds | null;
}): Promise<LiveGenerateResponse> {
  return postDesignAssetReconstruction({
    action: 'generate',
    live: true,
    assetId: input.assetId,
    explicitFounderAction: true,
    cropApproved: input.cropApproved,
    founderAdjustedBounds: input.founderAdjustedBounds ?? null,
  });
}

export async function approveLiveAsset(assetId: string): Promise<{ ok: boolean; asset?: DesignReconstructionAsset }> {
  const approved = await postDesignAssetReconstruction<{ ok: boolean; asset?: DesignReconstructionAsset }>({
    action: 'approve',
    assetId,
  });
  if (!approved.ok) return approved;
  return postDesignAssetReconstruction({ action: 'persist_live', assetId });
}

export async function applyAssetToPage(
  assetId: string,
  canonicalUrl?: string,
): Promise<{ ok: boolean; binding?: unknown }> {
  return postDesignAssetReconstruction({
    action: 'apply_to_page',
    assetId,
    ...(canonicalUrl ? { canonicalUrl } : {}),
  });
}

export async function fetchFalProviderHealth(): Promise<{ ok: boolean; health?: unknown }> {
  const res = await apiFetch('/api/site00/design-asset-reconstruction?action=provider_health');
  return res.json() as Promise<{ ok: boolean; health?: unknown }>;
}
