/**
 * P0.E.FT4 — Canonical Astral World visual slot registry.
 */

import type { ReferenceCropKey } from '../referenceCropRegistry.js';
import {
  ARTIFACT_CONTRACTS,
} from './artifactContracts.js';
import { ENVIRONMENT_CONTRACTS } from './environmentContracts.js';
import {
  buildFriendAvatarContracts,
  buildReaderPortraitContracts,
} from './portraitContracts.js';
import type { VisualAssetContract } from './types.js';

export type AstralAssetSlotKey =
  | 'ASTRAL_WORLD_HERO_DESKTOP'
  | 'ASTRAL_WORLD_HERO_MOBILE'
  | 'ASTREA_DISTRICT_PANORAMA_DESKTOP'
  | 'ASTREA_DISTRICT_PANORAMA_MOBILE'
  | 'TAROT_SUITE_HERO_DESKTOP'
  | 'TAROT_SUITE_HERO_MOBILE'
  | 'ASTRAL_MALL_HERO_DESKTOP'
  | 'ASTRAL_MALL_HERO_MOBILE'
  | 'COFFEE_SHOP_HERO_DESKTOP'
  | 'COFFEE_SHOP_HERO_MOBILE'
  | 'COFFEE_SHOP_TABLE_SCENE'
  | 'ASTRAL_MALL_KIOSK_SCENE'
  | 'TAROT_SUITE_READING_SCENE'
  | 'JOURNAL_ARTIFACT'
  | 'DAILY_CARD_ARTIFACT'
  | 'CREATE_A_DECK_HERO'
  | 'CUSTOM_AVATAR_HERO'
  | 'CIRCLE_COMMUNITY_HERO'
  | `READER_PORTRAIT_${string}`
  | `FRIEND_AVATAR_${string}`;

/** Maps FT3 reference crop keys to canonical slot keys */
export const CROP_KEY_TO_SLOT: Partial<Record<ReferenceCropKey, AstralAssetSlotKey>> = {
  ASTRAL_WORLD_HERO: 'ASTRAL_WORLD_HERO_DESKTOP',
  ASTRAL_WORLD_HERO_MOBILE: 'ASTRAL_WORLD_HERO_MOBILE',
  ASTREA_DISTRICT: 'ASTREA_DISTRICT_PANORAMA_DESKTOP',
  ASTREA_DISTRICT_MOBILE: 'ASTREA_DISTRICT_PANORAMA_MOBILE',
  TAROT_SUITE: 'TAROT_SUITE_HERO_DESKTOP',
  TAROT_SUITE_MOBILE: 'TAROT_SUITE_HERO_MOBILE',
  ASTRAL_MALL: 'ASTRAL_MALL_HERO_DESKTOP',
  ASTRAL_MALL_MOBILE: 'ASTRAL_MALL_HERO_MOBILE',
  COFFEE_SHOP: 'COFFEE_SHOP_HERO_DESKTOP',
  COFFEE_SHOP_MOBILE: 'COFFEE_SHOP_HERO_MOBILE',
  JOURNAL: 'JOURNAL_ARTIFACT',
  JOURNAL_MOBILE: 'JOURNAL_ARTIFACT',
  DAILY_CARD: 'DAILY_CARD_ARTIFACT',
  CREATE_DECK: 'CREATE_A_DECK_HERO',
  CUSTOM_AVATAR: 'CUSTOM_AVATAR_HERO',
  SOCIAL_PRESENCE: 'CIRCLE_COMMUNITY_HERO',
  SOCIAL_PRESENCE_MOBILE: 'CIRCLE_COMMUNITY_HERO',
};

export const SLOT_TO_CROP_KEY: Partial<Record<AstralAssetSlotKey, ReferenceCropKey>> = {
  ASTRAL_WORLD_HERO_DESKTOP: 'ASTRAL_WORLD_HERO',
  ASTRAL_WORLD_HERO_MOBILE: 'ASTRAL_WORLD_HERO_MOBILE',
  ASTREA_DISTRICT_PANORAMA_DESKTOP: 'ASTREA_DISTRICT',
  ASTREA_DISTRICT_PANORAMA_MOBILE: 'ASTREA_DISTRICT_MOBILE',
  TAROT_SUITE_HERO_DESKTOP: 'TAROT_SUITE',
  TAROT_SUITE_HERO_MOBILE: 'TAROT_SUITE_MOBILE',
  ASTRAL_MALL_HERO_DESKTOP: 'ASTRAL_MALL',
  ASTRAL_MALL_HERO_MOBILE: 'ASTRAL_MALL_MOBILE',
  COFFEE_SHOP_HERO_DESKTOP: 'COFFEE_SHOP',
  COFFEE_SHOP_HERO_MOBILE: 'COFFEE_SHOP_MOBILE',
  JOURNAL_ARTIFACT: 'JOURNAL',
  DAILY_CARD_ARTIFACT: 'DAILY_CARD',
  CREATE_A_DECK_HERO: 'CREATE_DECK',
  CUSTOM_AVATAR_HERO: 'CUSTOM_AVATAR',
  CIRCLE_COMMUNITY_HERO: 'SOCIAL_PRESENCE',
};

export function slotKeyFromCrop(crop: ReferenceCropKey): AstralAssetSlotKey | null {
  return CROP_KEY_TO_SLOT[crop] ?? null;
}

export function cropKeyFromSlot(slot: AstralAssetSlotKey): ReferenceCropKey | null {
  return SLOT_TO_CROP_KEY[slot] ?? null;
}

export function portraitSlotFromPersonId(personId: string): AstralAssetSlotKey {
  if (personId.startsWith('reader-')) return `READER_PORTRAIT_${personId}` as AstralAssetSlotKey;
  if (personId.startsWith('friend-')) return `FRIEND_AVATAR_${personId}` as AstralAssetSlotKey;
  if (personId === 'user-demo-teena') return 'CUSTOM_AVATAR_HERO';
  return `FRIEND_AVATAR_${personId}` as AstralAssetSlotKey;
}

export function buildAllAstralAssetContracts(): VisualAssetContract[] {
  return [
    ...ENVIRONMENT_CONTRACTS,
    ...buildReaderPortraitContracts(),
    ...buildFriendAvatarContracts(),
    ...ARTIFACT_CONTRACTS,
  ];
}

export function getContractBySlot(slotKey: string): VisualAssetContract | null {
  return buildAllAstralAssetContracts().find((c) => c.targetSlot === slotKey) ?? null;
}

export function getContractById(assetContractId: string): VisualAssetContract | null {
  return buildAllAstralAssetContracts().find((c) => c.assetContractId === assetContractId) ?? null;
}

export const P0_SLOT_KEYS: AstralAssetSlotKey[] = ENVIRONMENT_CONTRACTS
  .filter((c) => c.priority === 'P0')
  .map((c) => c.targetSlot as AstralAssetSlotKey);

export const P1_SLOT_KEYS: AstralAssetSlotKey[] = [
  'COFFEE_SHOP_TABLE_SCENE',
  ...buildReaderPortraitContracts().map((c) => c.targetSlot as AstralAssetSlotKey),
  ...buildFriendAvatarContracts().map((c) => c.targetSlot as AstralAssetSlotKey),
];

export const P2_SLOT_KEYS: AstralAssetSlotKey[] = ARTIFACT_CONTRACTS.map(
  (c) => c.targetSlot as AstralAssetSlotKey,
);
