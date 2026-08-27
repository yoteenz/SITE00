/**
 * P0.E.FT5.2D — AW_M_01_WORLD_ENTRY canonical geometry (854×1842).
 * Reference = design authority. V2 background normalized from 941×1672 shell.
 */

import {
  AW_M_01_CANONICAL_STAGE,
  AW_M_01_NORMALIZATION_SCALE,
  AW_M_01_SHELL_SOURCE,
  type CanonicalPctRect,
  type CanonicalStageConfig,
  validateManifestResolvers,
} from './canonicalScreenStage.js';

export const AW_M_01_SCREEN_ID = 'AW_M_01_WORLD_ENTRY' as const;

export const AW_M_01_CANONICAL: CanonicalStageConfig = AW_M_01_CANONICAL_STAGE;

/** V1 retained for lineage — V2 is production authority (FT5.2D) */
export const AW_M_01_WORLD_ENTRY_BACKGROUND_V1 = {
  slotKey: 'AW_M_01_WORLD_ENTRY_BACKGROUND_V1',
  publicPath: '/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/AW_M_01_WORLD_ENTRY_BACKGROUND_V1.png',
  repoPath: 'docs/projects/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/AW_M_01_WORLD_ENTRY_BACKGROUND_V1.png',
  nativeWidth: 852,
  nativeHeight: 1846,
  sourceAuthority: 'ATTACHMENT_A_PRODUCTION_BACKGROUND',
} as const;

/** Founder Supabase live-preview shell (640BC0A0-BE92-4519-88F6-EED15E4B2998) — 853×1844 source */
export const AW_M_01_WORLD_ENTRY_BACKGROUND_V2 = {
  slotKey: 'AW_M_01_WORLD_ENTRY_BACKGROUND_V2',
  publicPath: '/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/AW_M_01_WORLD_ENTRY_BACKGROUND_V2.png',
  repoPath: 'docs/projects/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/AW_M_01_WORLD_ENTRY_BACKGROUND_V2.png',
  sourceAssetId: '640BC0A0-BE92-4519-88F6-EED15E4B2998',
  sourceNativeWidth: 853,
  sourceNativeHeight: 1844,
  nativeWidth: 854,
  nativeHeight: 1842,
  sourceShellWidth: AW_M_01_SHELL_SOURCE.width,
  sourceShellHeight: AW_M_01_SHELL_SOURCE.height,
  normalizationScale: AW_M_01_NORMALIZATION_SCALE,
  normalizationMethod: 'FOUNDER_SUPABASE_SHELL_CANONICAL_RESIZE',
  sourceAuthority: 'FOUNDER_SUPABASE_LIVE_PREVIEW',
} as const;

export const AW_M_01_FINAL_COMPOSITION_REFERENCE = {
  path: '/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/final-composition-reference-v1.jpg',
  repoPath: 'docs/projects/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/final-composition-reference-v1.jpg',
  nativeWidth: 854,
  nativeHeight: 1842,
  role: 'QA_COMPOSITION_AUTHORITY',
} as const;

export type AwM01AssetSlot =
  | 'AW_M_01_WORLD_ENTRY_BACKGROUND_V2'
  | 'CURRENT_USER_AVATAR'
  | 'TAROT_DESTINATION_ICON'
  | 'COFFEE_DESTINATION_ICON'
  | 'MALL_DESTINATION_ICON'
  | 'NAV_HOME_ICON'
  | 'NAV_WORLD_ICON'
  | 'NAV_JOURNAL_ICON'
  | 'NAV_FRIENDS_ICON'
  | 'NAV_PROFILE_ICON';

export const AW_M_01_LAYERED_ASSET_MANIFEST: Record<
  AwM01AssetSlot,
  {
    slotKey: AwM01AssetSlot;
    resolver: 'BACKGROUND_V2' | 'USER_PORTRAIT' | 'ICON_ASSET' | 'INLINE_SVG';
    resolutionType: 'BACKGROUND_SHELL' | 'AVATAR_ASSET' | 'ICON_ASSET' | 'DECORATIVE_ASSET';
    iconKey?: 'TAROT_SUITE' | 'COFFEE_SHOP' | 'ASTRAL_MALL';
  }
> = {
  AW_M_01_WORLD_ENTRY_BACKGROUND_V2: {
    slotKey: 'AW_M_01_WORLD_ENTRY_BACKGROUND_V2',
    resolver: 'BACKGROUND_V2',
    resolutionType: 'BACKGROUND_SHELL',
  },
  CURRENT_USER_AVATAR: {
    slotKey: 'CURRENT_USER_AVATAR',
    resolver: 'USER_PORTRAIT',
    resolutionType: 'AVATAR_ASSET',
  },
  TAROT_DESTINATION_ICON: {
    slotKey: 'TAROT_DESTINATION_ICON',
    resolver: 'ICON_ASSET',
    resolutionType: 'ICON_ASSET',
    iconKey: 'TAROT_SUITE',
  },
  COFFEE_DESTINATION_ICON: {
    slotKey: 'COFFEE_DESTINATION_ICON',
    resolver: 'ICON_ASSET',
    resolutionType: 'ICON_ASSET',
    iconKey: 'COFFEE_SHOP',
  },
  MALL_DESTINATION_ICON: {
    slotKey: 'MALL_DESTINATION_ICON',
    resolver: 'ICON_ASSET',
    resolutionType: 'ICON_ASSET',
    iconKey: 'ASTRAL_MALL',
  },
  NAV_HOME_ICON: { slotKey: 'NAV_HOME_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  NAV_WORLD_ICON: { slotKey: 'NAV_WORLD_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  NAV_JOURNAL_ICON: { slotKey: 'NAV_JOURNAL_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  NAV_FRIENDS_ICON: { slotKey: 'NAV_FRIENDS_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  NAV_PROFILE_ICON: { slotKey: 'NAV_PROFILE_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
};

validateManifestResolvers(AW_M_01_LAYERED_ASSET_MANIFEST);

/**
 * Structural anchors — re-derived from final composition reference at 854×1842.
 * Center-x + top-y percentages within canonical stage. NOT legacy 941×1672 offsets.
 */
export const AW_M_01_STRUCTURAL_ANCHORS = {
  M_TOP_CELESTIAL_MARK: { x: 50, y: 6.0, w: 18, h: 3 },
  M_AVATAR_CENTER: { x: 89.0, y: 5.5, w: 14, h: 7.5 },
  M_HERO_TITLE_CENTER: { x: 50, y: 12.0, w: 88, h: 4.5 },
  M_HERO_SUBTITLE_CENTER: { x: 50, y: 15.5, w: 80, h: 6.0 },
  M_CRYSTAL_CENTER: { x: 50, y: 32.0, w: 22, h: 8 },
  M_ASTREA_PANEL_TOP: { x: 50, y: 35.0, w: 92, h: 12 },
  M_ASTREA_TITLE_CENTER: { x: 50, y: 37.5, w: 72, h: 4.0 },
  M_ROW_TAROT: { x: 50, y: 49.0, w: 92, h: 5.6 },
  M_ROW_COFFEE: { x: 50, y: 55.4, w: 92, h: 5.6 },
  M_ROW_MALL: { x: 50, y: 61.8, w: 92, h: 5.6 },
  M_ACTION_1: { x: 22, y: 68.5, w: 26, h: 4.0 },
  M_ACTION_2: { x: 50, y: 68.5, w: 30, h: 4.0 },
  M_ACTION_3: { x: 78, y: 68.5, w: 28, h: 4.0 },
  M_NAV_TOP: { x: 50, y: 88.5, w: 96, h: 8.0 },
  M_NAV_BASELINE: { x: 50, y: 91.5, w: 96, h: 7.5 },
} as const satisfies Record<string, CanonicalPctRect>;

/** Overlay anchors mapped to baked visual regions */
export const AW_M_01_OVERLAY_ANCHORS = {
  HERO_KICKER_CENTER: { x: 50, y: 9.8, w: 70, h: 2.2, region: 'HERO_ENVIRONMENT' },
  HERO_TITLE_CENTER: AW_M_01_STRUCTURAL_ANCHORS.M_HERO_TITLE_CENTER,
  HERO_SUBTITLE_CENTER: AW_M_01_STRUCTURAL_ANCHORS.M_HERO_SUBTITLE_CENTER,
  AVATAR_SHELL_CENTER: AW_M_01_STRUCTURAL_ANCHORS.M_AVATAR_CENTER,
  ASTREA_ENTERING_CENTER: { x: 50, y: 35.5, w: 70, h: 2.0, region: 'ASTREA_PARENT_SHELL' },
  ASTREA_TITLE_CENTER: AW_M_01_STRUCTURAL_ANCHORS.M_ASTREA_TITLE_CENTER,
  ASTREA_DISTRICT_CENTER: { x: 50, y: 40.5, w: 82, h: 2.4, region: 'ASTREA_PARENT_SHELL' },
  ASTREA_TAGLINE_CENTER: { x: 50, y: 42.5, w: 72, h: 2.2, region: 'ASTREA_PARENT_SHELL' },
  DESTINATION_ROW_1: { ...AW_M_01_STRUCTURAL_ANCHORS.M_ROW_TAROT, region: 'DESTINATION_ROW_01' },
  DESTINATION_ROW_2: { ...AW_M_01_STRUCTURAL_ANCHORS.M_ROW_COFFEE, region: 'DESTINATION_ROW_02' },
  DESTINATION_ROW_3: { ...AW_M_01_STRUCTURAL_ANCHORS.M_ROW_MALL, region: 'DESTINATION_ROW_03' },
  QUICK_ACTION_1: { ...AW_M_01_STRUCTURAL_ANCHORS.M_ACTION_1, region: 'QUICK_ACTION_01' },
  QUICK_ACTION_2: { ...AW_M_01_STRUCTURAL_ANCHORS.M_ACTION_2, region: 'QUICK_ACTION_02' },
  QUICK_ACTION_3: { ...AW_M_01_STRUCTURAL_ANCHORS.M_ACTION_3, region: 'QUICK_ACTION_03' },
  BOTTOM_NAV: { ...AW_M_01_STRUCTURAL_ANCHORS.M_NAV_BASELINE, region: 'NAV_SHELL' },
} as const satisfies Record<string, CanonicalPctRect>;

/** Panel-relative insets for destination row content within row bounds */
export const AW_M_01_DESTINATION_ROW_INSETS = {
  iconWell: { left: 0.025, top: 0.08, right: 0.78, bottom: 0.08 },
  copy: { left: 0.16, top: 0.12, right: 0.12, bottom: 0.12 },
} as const;

export function resolveAwM01BackgroundPath(): string {
  return AW_M_01_WORLD_ENTRY_BACKGROUND_V2.publicPath;
}

export function resolveAwM01IconKey(
  slot: 'TAROT_DESTINATION_ICON' | 'COFFEE_DESTINATION_ICON' | 'MALL_DESTINATION_ICON',
): 'TAROT_SUITE' | 'COFFEE_SHOP' | 'ASTRAL_MALL' {
  const entry = AW_M_01_LAYERED_ASSET_MANIFEST[slot];
  if (entry.resolver !== 'ICON_ASSET' || !entry.iconKey) {
    throw new Error(`${slot} must resolve as ICON_ASSET`);
  }
  return entry.iconKey;
}
