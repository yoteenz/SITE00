/**
 * P0.E.FT4 — Portrait prompt contracts.
 */

import type { VisualAssetContract } from './types.js';
import { AW_VISUAL_FOUNDATION_BATCH, ASTRAL_WORLD_PROJECT_ID } from './types.js';
import { astralNegativeBlock } from './masterVisualContract.js';

export type PortraitPromptVars = {
  reader_name?: string;
  friend_name?: string;
  specialties?: string;
  destination?: string;
  personality?: string;
};

export function compileReaderPortraitPrompt(vars: PortraitPromptVars): string {
  return `Create a premium Astral World reader portrait.

Reader: ${vars.reader_name ?? 'Unknown'}
Identity: ${vars.specialties ?? 'Intuitive guide'}
Primary destination: ${vars.destination ?? 'Astréa'}
Personality: ${vars.personality ?? 'Warm, distinctive, contemporary'}

Contemporary, believable, warm and distinctive. Subtle environmental cues from primary destination.
Real person + elevated Astral World identity — not cosplay, RPG character, or generic influencer headshot.

Camera: editorial portrait, natural expression, clear face, strong avatar crop compatibility.

${astralNegativeBlock()}`;
}

export function compileFriendAvatarPrompt(vars: PortraitPromptVars): string {
  return `Create a contemporary warm Astral World seeker avatar portrait for ${vars.friend_name ?? 'a friend'}.

Real member of a social world, not a reader character. Natural styling, modern clothing, warm cinematic light, subtle Astral World background atmosphere.

Suitable for circular avatar crop. No fantasy costume. No tarot props required.

${astralNegativeBlock()}`;
}

function portraitContract(
  assetKey: string,
  targetSlot: string,
  role: 'reader_portrait' | 'friend_avatar',
  priority: 'P1',
): VisualAssetContract {
  return {
    assetContractId: `${assetKey}@v1`,
    projectId: ASTRAL_WORLD_PROJECT_ID,
    worldScope: 'astral-world',
    districtScope: 'astrea',
    destinationScope: null,
    assetKey,
    assetType: 'CHARACTER_PORTRAIT',
    role,
    targetSlot,
    referenceSources: ['reference-portrait-crop'],
    promptTemplateId: role === 'reader_portrait' ? 'READER_PROFILE_PORTRAIT' : 'FRIEND_AVATAR',
    promptVersion: 'v1',
    negativeConstraints: astralNegativeBlock().split('. ').filter(Boolean),
    aspectRatio: '1:1',
    widthTarget: 512,
    heightTarget: 512,
    focalPoint: 'face_center',
    safeZones: ['circular_avatar_crop'],
    mobileBehavior: 'SHARED',
    desktopBehavior: 'SHARED',
    generationMode: 'IMAGE_REFERENCE_EDIT',
    assetClass: 'CHARACTER_PORTRAIT',
    priority,
    batchId: AW_VISUAL_FOUNDATION_BATCH,
  };
}

export const READER_PORTRAIT_IDS = [
  'reader-madame-j',
  'reader-kai',
  'reader-earth-mama',
  'reader-sage',
  'reader-orion',
  'reader-aria',
] as const;

export const FRIEND_AVATAR_IDS = [
  'friend-jane',
  'friend-marcus',
  'friend-luna',
  'friend-lux',
] as const;

export function buildReaderPortraitContracts(): VisualAssetContract[] {
  return READER_PORTRAIT_IDS.map((id) =>
    portraitContract(`READER_PORTRAIT_${id}`, `READER_PORTRAIT_${id}`, 'reader_portrait', 'P1'),
  );
}

export function buildFriendAvatarContracts(): VisualAssetContract[] {
  return FRIEND_AVATAR_IDS.map((id) =>
    portraitContract(`FRIEND_AVATAR_${id}`, `FRIEND_AVATAR_${id}`, 'friend_avatar', 'P1'),
  );
}
