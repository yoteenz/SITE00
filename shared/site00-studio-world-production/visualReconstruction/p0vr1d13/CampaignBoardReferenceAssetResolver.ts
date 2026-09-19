/**
 * P0.VR.1D.13 — Campaign Board reference asset resolver (FAL image-reference mode).
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CAMPAIGN_BOARD_VISUAL_ASSET_MANIFEST } from './campaignBoardVisualAssetManifest.js';
import type { CampaignBoardAssetSource } from './campaignBoardVisualAssetManifest.js';

export type CampaignBoardAssetResolution = {
  assetRole: string;
  assetId: string;
  source: CampaignBoardAssetSource;
  artworkUrl: string | null;
  referenceCrop: string | null;
  falImageReferenceRequired: boolean;
  falTextToImageUsed: boolean;
  blocked: boolean;
};

export function classifyCampaignBoardAssetSource(input: {
  projectRoot?: string;
  storagePath: string;
  referenceCrop?: string | null;
}): CampaignBoardAssetSource {
  const root = input.projectRoot ?? process.cwd();
  if (input.storagePath.startsWith('css:')) return 'DOM_REPRODUCIBLE';
  const publicAbs = join(root, 'public', input.storagePath.replace(/^\//, ''));
  if (existsSync(publicAbs)) return 'EXISTING_ASSET';
  if (input.referenceCrop) return 'FAL_RECONSTRUCTION_REQUIRED';
  return 'BLOCKED';
}

/** Resolve manifest entries — existing assets preferred; FAL only when reference crop exists. */
export function existingAssetPreferredOverFalGeneration(
  resolutions: CampaignBoardAssetResolution[],
): boolean {
  const imageAssets = resolutions.filter((r) => r.assetRole !== 'PAPER_TEXTURES');
  return imageAssets.every((r) => !r.falImageReferenceRequired && !r.falTextToImageUsed);
}

export function falReconstructionCandidates(
  resolutions: CampaignBoardAssetResolution[],
): CampaignBoardAssetResolution[] {
  return resolutions.filter((r) => r.falImageReferenceRequired);
}

export function resolveCampaignBoardReferenceAssets(input: {
  projectRoot?: string;
} = {}): CampaignBoardAssetResolution[] {
  const root = input.projectRoot ?? process.cwd();

  return CAMPAIGN_BOARD_VISUAL_ASSET_MANIFEST.filter((e) => e.assetRole !== 'PAPER_TEXTURES').map((entry) => {
    const source = classifyCampaignBoardAssetSource({
      projectRoot: root,
      storagePath: entry.storagePath,
      referenceCrop: entry.referenceCrop,
    });

    const publicAbs = entry.storagePath.startsWith('css:')
      ? null
      : join(root, 'public', entry.storagePath.replace(/^\//, ''));

    const exists = publicAbs ? existsSync(publicAbs) : source === 'DOM_REPRODUCIBLE';

    return {
      assetRole: entry.assetRole,
      assetId: entry.assetId,
      source: exists ? (source === 'FAL_RECONSTRUCTION_REQUIRED' ? 'REFERENCE_CROP' : source) : source,
      artworkUrl: exists && entry.storagePath.startsWith('/') ? entry.storagePath : null,
      referenceCrop: entry.referenceCrop,
      falImageReferenceRequired: !exists && Boolean(entry.referenceCrop),
      falTextToImageUsed: false,
      blocked: !exists && !entry.referenceCrop,
    };
  });
}
