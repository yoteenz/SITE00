/**
 * P0.R.1 — FAL generation contracts for AW_AVATAR_LIBRARY_V1 pilot + custom avatars.
 */

import type { VisualAssetContract } from '../generation/types.js';
import { AW_VISUAL_FOUNDATION_BATCH, ASTRAL_WORLD_PROJECT_ID } from '../generation/types.js';
import { astralNegativeBlock } from '../generation/masterVisualContract.js';
import { compileAvatarLibraryPrompt } from './avatarMasterContract.js';
import { listPilotAvatars } from './avatarLibraryManifest.js';

export const AW_AVATAR_LIBRARY_MANIFEST_ID = 'AW_AVATAR_LIBRARY_V1' as const;

export function buildAvatarLibraryPilotContracts(): VisualAssetContract[] {
  return listPilotAvatars().map((avatar) => ({
    assetContractId: `${avatar.portraitAssetSlot}@v1`,
    projectId: ASTRAL_WORLD_PROJECT_ID,
    worldScope: 'astral-world',
    districtScope: 'astrea',
    destinationScope: null,
    assetKey: avatar.portraitAssetSlot,
    assetType: 'CHARACTER_PORTRAIT',
    role: 'reader_portrait',
    targetSlot: avatar.portraitAssetSlot,
    referenceSources: ['ASTRAL_WORLD_AVATAR_MASTER_CONTRACT'],
    promptTemplateId: 'AW_AVATAR_LIBRARY_PORTRAIT',
    promptVersion: avatar.promptVersion,
    negativeConstraints: astralNegativeBlock().split('. ').filter(Boolean),
    aspectRatio: '1:1',
    widthTarget: 512,
    heightTarget: 512,
    focalPoint: 'face_center',
    safeZones: ['circular_avatar_crop'],
    mobileBehavior: 'SHARED',
    desktopBehavior: 'SHARED',
    generationMode: 'TEXT_TO_IMAGE',
    assetClass: 'CHARACTER_PORTRAIT',
    priority: 'P1',
    batchId: AW_VISUAL_FOUNDATION_BATCH,
  }));
}

export function compileAvatarLibraryPromptForSlot(avatarId: string): string | null {
  const pilot = listPilotAvatars().find((a) => a.avatarId === avatarId);
  if (!pilot) return null;
  return compileAvatarLibraryPrompt({
    avatarId: pilot.avatarId,
    presentation: pilot.presentation,
    displayLabel: pilot.displayLabel,
  });
}

export const CUSTOM_ASTRAL_AVATAR_CONTRACT: VisualAssetContract = {
  assetContractId: 'CUSTOM_ASTRAL_AVATAR@v1',
  projectId: ASTRAL_WORLD_PROJECT_ID,
  worldScope: 'astral-world',
  districtScope: 'astrea',
  destinationScope: null,
  assetKey: 'CUSTOM_ASTRAL_AVATAR',
  assetType: 'CHARACTER_PORTRAIT',
  role: 'reader_portrait',
  targetSlot: 'CUSTOM_ASTRAL_AVATAR',
  referenceSources: ['ASTRAL_WORLD_AVATAR_MASTER_CONTRACT', 'user_reference_upload'],
  promptTemplateId: 'CUSTOM_ASTRAL_AVATAR',
  promptVersion: 'v1',
  negativeConstraints: astralNegativeBlock().split('. ').filter(Boolean),
  aspectRatio: '1:1',
  widthTarget: 768,
  heightTarget: 768,
  focalPoint: 'face_center',
  safeZones: ['circular_avatar_crop', 'profile_portrait', 'scene_cutout'],
  mobileBehavior: 'SHARED',
  desktopBehavior: 'SHARED',
  generationMode: 'IMAGE_REFERENCE_EDIT',
  assetClass: 'CHARACTER_PORTRAIT',
  priority: 'P2',
  batchId: AW_VISUAL_FOUNDATION_BATCH,
};
