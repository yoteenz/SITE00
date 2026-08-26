/**
 * P0.E.FT5.2B — AW_M_01_WORLD_ENTRY layered production background + overlay anchors.
 * Attachment A = production background authority. Attachment B = composition authority.
 */

import { ASTRAL_REFERENCE_CROPS } from '../referenceCropRegistry.js';

export const AW_M_01_SCREEN_ID = 'AW_M_01_WORLD_ENTRY' as const;

/** Registered production background — do not recreate with CSS */
export const AW_M_01_WORLD_ENTRY_BACKGROUND_V1 = {
  slotKey: 'AW_M_01_WORLD_ENTRY_BACKGROUND_V1',
  publicPath: '/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/AW_M_01_WORLD_ENTRY_BACKGROUND_V1.png',
  repoPath: 'docs/projects/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/AW_M_01_WORLD_ENTRY_BACKGROUND_V1.png',
  nativeWidth: 852,
  nativeHeight: 1846,
  canonicalViewportWidth: 390,
  sourceAuthority: 'ATTACHMENT_A_PRODUCTION_BACKGROUND',
} as const;

export const AW_M_01_FINAL_COMPOSITION_REFERENCE = {
  path: '/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/final-composition-reference-v1.jpg',
  repoPath: 'docs/projects/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/final-composition-reference-v1.jpg',
  role: 'QA_COMPOSITION_AUTHORITY',
} as const;

export type AwM01AssetSlot =
  | 'AW_M_01_WORLD_ENTRY_BACKGROUND_V1'
  | 'CURRENT_USER_AVATAR'
  | 'TAROT_DESTINATION_ICON'
  | 'COFFEE_DESTINATION_ICON'
  | 'MALL_DESTINATION_ICON'
  | 'NAV_HOME_ICON'
  | 'NAV_WORLD_ICON'
  | 'NAV_JOURNAL_ICON'
  | 'NAV_FRIENDS_ICON'
  | 'NAV_PROFILE_ICON';

/** Screen-specific asset manifest — no anonymous URLs in components */
export const AW_M_01_LAYERED_ASSET_MANIFEST: Record<
  AwM01AssetSlot,
  { slotKey: AwM01AssetSlot; resolver: 'BACKGROUND_V1' | 'USER_PORTRAIT' | 'REFERENCE_CROP' | 'INLINE_SVG'; cropKey?: string }
> = {
  AW_M_01_WORLD_ENTRY_BACKGROUND_V1: { slotKey: 'AW_M_01_WORLD_ENTRY_BACKGROUND_V1', resolver: 'BACKGROUND_V1' },
  CURRENT_USER_AVATAR: { slotKey: 'CURRENT_USER_AVATAR', resolver: 'USER_PORTRAIT' },
  TAROT_DESTINATION_ICON: { slotKey: 'TAROT_DESTINATION_ICON', resolver: 'REFERENCE_CROP', cropKey: 'TAROT_SUITE_MOBILE' },
  COFFEE_DESTINATION_ICON: { slotKey: 'COFFEE_DESTINATION_ICON', resolver: 'REFERENCE_CROP', cropKey: 'COFFEE_SHOP_MOBILE' },
  MALL_DESTINATION_ICON: { slotKey: 'MALL_DESTINATION_ICON', resolver: 'REFERENCE_CROP', cropKey: 'ASTRAL_MALL_MOBILE' },
  NAV_HOME_ICON: { slotKey: 'NAV_HOME_ICON', resolver: 'INLINE_SVG' },
  NAV_WORLD_ICON: { slotKey: 'NAV_WORLD_ICON', resolver: 'INLINE_SVG' },
  NAV_JOURNAL_ICON: { slotKey: 'NAV_JOURNAL_ICON', resolver: 'INLINE_SVG' },
  NAV_FRIENDS_ICON: { slotKey: 'NAV_FRIENDS_ICON', resolver: 'INLINE_SVG' },
  NAV_PROFILE_ICON: { slotKey: 'NAV_PROFILE_ICON', resolver: 'INLINE_SVG' },
};

/** Percentage anchors derived from 852×1846 production background + Attachment B composition */
export const AW_M_01_OVERLAY_ANCHORS = {
  TOP_CELESTIAL_CENTER: { x: 50, y: 9.5, w: 18, h: 3 },
  AVATAR_SHELL_CENTER: { x: 88.5, y: 4.8, w: 13.5, h: 6.2 },
  HERO_KICKER_CENTER: { x: 50, y: 11.2, w: 72, h: 2.2 },
  HERO_TITLE_CENTER: { x: 50, y: 13.8, w: 88, h: 4.2 },
  HERO_SUBTITLE_CENTER: { x: 50, y: 19.5, w: 78, h: 5.5 },
  ASTREA_ENTERING_CENTER: { x: 50, y: 37.8, w: 70, h: 2 },
  ASTREA_TITLE_CENTER: { x: 50, y: 40.2, w: 72, h: 3.8 },
  ASTREA_DISTRICT_CENTER: { x: 50, y: 43.8, w: 82, h: 2.4 },
  ASTREA_TAGLINE_CENTER: { x: 50, y: 45.8, w: 72, h: 2.2 },
  DESTINATION_ROW_1: { x: 50, y: 49.2, w: 92, h: 5.6 },
  DESTINATION_ROW_2: { x: 50, y: 55.6, w: 92, h: 5.6 },
  DESTINATION_ROW_3: { x: 50, y: 62.0, w: 92, h: 5.6 },
  QUICK_ACTION_1: { x: 22, y: 69.8, w: 26, h: 3.8 },
  QUICK_ACTION_2: { x: 50, y: 69.8, w: 30, h: 3.8 },
  QUICK_ACTION_3: { x: 78, y: 69.8, w: 28, h: 3.8 },
  BOTTOM_NAV: { x: 50, y: 91.5, w: 96, h: 7.5 },
} as const;

export function resolveAwM01BackgroundPath(): string {
  return AW_M_01_WORLD_ENTRY_BACKGROUND_V1.publicPath;
}

export function resolveAwM01DestinationIconCrop(cropKey: 'TAROT_SUITE_MOBILE' | 'COFFEE_SHOP_MOBILE' | 'ASTRAL_MALL_MOBILE') {
  return ASTRAL_REFERENCE_CROPS[cropKey];
}
