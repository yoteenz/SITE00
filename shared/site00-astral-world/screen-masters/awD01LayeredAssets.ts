/**
 * P0.E.FT5.2C — AW_D_01_WORLD_ENTRY desktop layered production background + overlay anchors.
 */

import { ASTRAL_REFERENCE_CROPS } from '../referenceCropRegistry.js';

export const AW_D_01_SCREEN_ID = 'AW_D_01_WORLD_ENTRY' as const;

export const AW_D_01_WORLD_ENTRY_BACKGROUND_V1 = {
  slotKey: 'AW_D_01_WORLD_ENTRY_BACKGROUND_V1',
  publicPath: '/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/AW_D_01_WORLD_ENTRY_BACKGROUND_V1.png',
  repoPath: 'docs/projects/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/AW_D_01_WORLD_ENTRY_BACKGROUND_V1.png',
  nativeWidth: 1672,
  nativeHeight: 941,
  canonicalViewportWidth: 1280,
  sourceAuthority: 'ATTACHMENT_A_PRODUCTION_BACKGROUND',
} as const;

export const AW_D_01_FINAL_COMPOSITION_REFERENCE = {
  path: '/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/final-composition-reference-v1.jpg',
  repoPath: 'docs/projects/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/final-composition-reference-v1.jpg',
  role: 'QA_COMPOSITION_AUTHORITY',
} as const;

export type AwD01AssetSlot =
  | 'AW_D_01_WORLD_ENTRY_BACKGROUND_V1'
  | 'CURRENT_USER_AVATAR'
  | 'TAROT_DESTINATION_ICON'
  | 'COFFEE_DESTINATION_ICON'
  | 'MALL_DESTINATION_ICON'
  | 'ACTION_WHOS_HERE_ICON'
  | 'ACTION_TAKE_ME_SOMEWHERE_ICON'
  | 'ACTION_FIND_MY_READER_ICON'
  | 'NAV_HOME_ICON'
  | 'NAV_WORLD_ICON'
  | 'NAV_JOURNAL_ICON'
  | 'NAV_FRIENDS_ICON'
  | 'NAV_PROFILE_ICON'
  | 'TOP_NOTIFICATION_ICON'
  | 'TOP_MESSAGE_ICON';

export const AW_D_01_LAYERED_ASSET_MANIFEST: Record<
  AwD01AssetSlot,
  { slotKey: AwD01AssetSlot; resolver: 'BACKGROUND_V1' | 'USER_PORTRAIT' | 'REFERENCE_CROP' | 'INLINE_SVG'; cropKey?: string }
> = {
  AW_D_01_WORLD_ENTRY_BACKGROUND_V1: { slotKey: 'AW_D_01_WORLD_ENTRY_BACKGROUND_V1', resolver: 'BACKGROUND_V1' },
  CURRENT_USER_AVATAR: { slotKey: 'CURRENT_USER_AVATAR', resolver: 'USER_PORTRAIT' },
  TAROT_DESTINATION_ICON: { slotKey: 'TAROT_DESTINATION_ICON', resolver: 'REFERENCE_CROP', cropKey: 'TAROT_SUITE' },
  COFFEE_DESTINATION_ICON: { slotKey: 'COFFEE_DESTINATION_ICON', resolver: 'REFERENCE_CROP', cropKey: 'COFFEE_SHOP' },
  MALL_DESTINATION_ICON: { slotKey: 'MALL_DESTINATION_ICON', resolver: 'REFERENCE_CROP', cropKey: 'ASTRAL_MALL' },
  ACTION_WHOS_HERE_ICON: { slotKey: 'ACTION_WHOS_HERE_ICON', resolver: 'INLINE_SVG' },
  ACTION_TAKE_ME_SOMEWHERE_ICON: { slotKey: 'ACTION_TAKE_ME_SOMEWHERE_ICON', resolver: 'INLINE_SVG' },
  ACTION_FIND_MY_READER_ICON: { slotKey: 'ACTION_FIND_MY_READER_ICON', resolver: 'INLINE_SVG' },
  NAV_HOME_ICON: { slotKey: 'NAV_HOME_ICON', resolver: 'INLINE_SVG' },
  NAV_WORLD_ICON: { slotKey: 'NAV_WORLD_ICON', resolver: 'INLINE_SVG' },
  NAV_JOURNAL_ICON: { slotKey: 'NAV_JOURNAL_ICON', resolver: 'INLINE_SVG' },
  NAV_FRIENDS_ICON: { slotKey: 'NAV_FRIENDS_ICON', resolver: 'INLINE_SVG' },
  NAV_PROFILE_ICON: { slotKey: 'NAV_PROFILE_ICON', resolver: 'INLINE_SVG' },
  TOP_NOTIFICATION_ICON: { slotKey: 'TOP_NOTIFICATION_ICON', resolver: 'INLINE_SVG' },
  TOP_MESSAGE_ICON: { slotKey: 'TOP_MESSAGE_ICON', resolver: 'INLINE_SVG' },
};

/** Percentage anchors — 1672×941 production shell + Attachment B composition */
export const AW_D_01_OVERLAY_ANCHORS = {
  TOP_NAV_BRAND: { x: 9, y: 2.8, w: 16, h: 5.5 },
  TOP_NAV_LINKS: { x: 50, y: 2.8, w: 38, h: 5.5 },
  TOP_NAV_UTILITIES: { x: 91, y: 2.8, w: 14, h: 5.5 },
  AVATAR_SHELL_CENTER: { x: 94.5, y: 3.2, w: 4.8, h: 8.5 },
  HERO_KICKER_CENTER: { x: 50, y: 10.5, w: 28, h: 3 },
  HERO_TITLE_CENTER: { x: 50, y: 13.8, w: 34, h: 5.5 },
  HERO_SUBTITLE_CENTER: { x: 50, y: 18.5, w: 30, h: 5 },
  ASTREA_ENTERING: { x: 13, y: 27.5, w: 20, h: 2.5 },
  ASTREA_TITLE: { x: 13, y: 30.5, w: 18, h: 3.5 },
  ASTREA_DISTRICT: { x: 13, y: 34, w: 20, h: 2.5 },
  ASTREA_TAGLINE: { x: 13, y: 36.5, w: 18, h: 2.5 },
  DESTINATION_ROW_1: { x: 13, y: 41.5, w: 22, h: 7.5 },
  DESTINATION_ROW_2: { x: 13, y: 50.5, w: 22, h: 7.5 },
  DESTINATION_ROW_3: { x: 13, y: 59.5, w: 22, h: 7.5 },
  RIGHT_ACTION_1: { x: 87, y: 41.5, w: 18, h: 7.5 },
  RIGHT_ACTION_2: { x: 87, y: 50.5, w: 18, h: 7.5 },
  RIGHT_ACTION_3: { x: 87, y: 59.5, w: 18, h: 7.5 },
  BOTTOM_NAV: { x: 50, y: 87.5, w: 52, h: 10 },
} as const;

export function resolveAwD01BackgroundPath(): string {
  return AW_D_01_WORLD_ENTRY_BACKGROUND_V1.publicPath;
}

export function resolveAwD01DestinationIconCrop(cropKey: 'TAROT_SUITE' | 'COFFEE_SHOP' | 'ASTRAL_MALL') {
  return ASTRAL_REFERENCE_CROPS[cropKey];
}
