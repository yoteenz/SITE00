/**
 * P0.E.FT5.2D — AW_D_01_WORLD_ENTRY canonical geometry (1536×1024).
 * Reference = design authority. V2 background normalized from 1672×941 shell.
 */

import {
  AW_D_01_CANONICAL_STAGE,
  AW_D_01_NORMALIZATION_SCALE,
  AW_D_01_SHELL_SOURCE,
  type CanonicalPctRect,
  type CanonicalStageConfig,
  validateManifestResolvers,
} from './canonicalScreenStage.js';

export const AW_D_01_SCREEN_ID = 'AW_D_01_WORLD_ENTRY' as const;

export const AW_D_01_CANONICAL: CanonicalStageConfig = AW_D_01_CANONICAL_STAGE;

export const AW_D_01_WORLD_ENTRY_BACKGROUND_V1 = {
  slotKey: 'AW_D_01_WORLD_ENTRY_BACKGROUND_V1',
  publicPath: '/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/AW_D_01_WORLD_ENTRY_BACKGROUND_V1.png',
  repoPath: 'docs/projects/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/AW_D_01_WORLD_ENTRY_BACKGROUND_V1.png',
  nativeWidth: 1672,
  nativeHeight: 941,
  sourceAuthority: 'ATTACHMENT_A_PRODUCTION_BACKGROUND',
} as const;

/** Normalized production shell — 1536×1024 uniform downsample from extended 1672×1115 canvas */
export const AW_D_01_WORLD_ENTRY_BACKGROUND_V2 = {
  slotKey: 'AW_D_01_WORLD_ENTRY_BACKGROUND_V2',
  publicPath: '/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/AW_D_01_WORLD_ENTRY_BACKGROUND_V2.png',
  repoPath: 'docs/projects/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/AW_D_01_WORLD_ENTRY_BACKGROUND_V2.png',
  nativeWidth: 1536,
  nativeHeight: 1024,
  sourceShellWidth: AW_D_01_SHELL_SOURCE.width,
  sourceShellHeight: AW_D_01_SHELL_SOURCE.height,
  normalizationScale: AW_D_01_NORMALIZATION_SCALE,
  normalizationMethod: 'VERTICAL_REFRAME_THEN_UNIFORM_SCALE',
  sourceAuthority: 'ATTACHMENT_A_PRODUCTION_BACKGROUND_V2',
} as const;

export const AW_D_01_FINAL_COMPOSITION_REFERENCE = {
  path: '/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/final-composition-reference-v1.jpg',
  repoPath: 'docs/projects/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/final-composition-reference-v1.jpg',
  nativeWidth: 1536,
  nativeHeight: 1024,
  role: 'QA_COMPOSITION_AUTHORITY',
} as const;

export type AwD01AssetSlot =
  | 'AW_D_01_WORLD_ENTRY_BACKGROUND_V2'
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
  {
    slotKey: AwD01AssetSlot;
    resolver: 'BACKGROUND_V2' | 'USER_PORTRAIT' | 'ICON_ASSET' | 'INLINE_SVG';
    resolutionType: 'BACKGROUND_SHELL' | 'AVATAR_ASSET' | 'ICON_ASSET' | 'DECORATIVE_ASSET';
    iconKey?: 'TAROT_SUITE' | 'COFFEE_SHOP' | 'ASTRAL_MALL';
  }
> = {
  AW_D_01_WORLD_ENTRY_BACKGROUND_V2: {
    slotKey: 'AW_D_01_WORLD_ENTRY_BACKGROUND_V2',
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
  ACTION_WHOS_HERE_ICON: { slotKey: 'ACTION_WHOS_HERE_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  ACTION_TAKE_ME_SOMEWHERE_ICON: {
    slotKey: 'ACTION_TAKE_ME_SOMEWHERE_ICON',
    resolver: 'INLINE_SVG',
    resolutionType: 'DECORATIVE_ASSET',
  },
  ACTION_FIND_MY_READER_ICON: {
    slotKey: 'ACTION_FIND_MY_READER_ICON',
    resolver: 'INLINE_SVG',
    resolutionType: 'DECORATIVE_ASSET',
  },
  NAV_HOME_ICON: { slotKey: 'NAV_HOME_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  NAV_WORLD_ICON: { slotKey: 'NAV_WORLD_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  NAV_JOURNAL_ICON: { slotKey: 'NAV_JOURNAL_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  NAV_FRIENDS_ICON: { slotKey: 'NAV_FRIENDS_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  NAV_PROFILE_ICON: { slotKey: 'NAV_PROFILE_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  TOP_NOTIFICATION_ICON: { slotKey: 'TOP_NOTIFICATION_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
  TOP_MESSAGE_ICON: { slotKey: 'TOP_MESSAGE_ICON', resolver: 'INLINE_SVG', resolutionType: 'DECORATIVE_ASSET' },
};

validateManifestResolvers(AW_D_01_LAYERED_ASSET_MANIFEST);

/** Structural anchors — re-derived from final composition reference at 1536×1024 */
export const AW_D_01_STRUCTURAL_ANCHORS = {
  D_TOP_NAV: { x: 50, y: 2.5, w: 96, h: 6.0 },
  D_BRAND_ORIGIN: { x: 10, y: 2.5, w: 18, h: 5.5 },
  D_PRIMARY_NAV_CENTER: { x: 50, y: 2.5, w: 40, h: 5.5 },
  D_AVATAR_CENTER: { x: 94.5, y: 2.8, w: 5.5, h: 8.5 },
  D_LEFT_PANEL_BOUNDS: { x: 14, y: 26, w: 24, h: 40 },
  D_CENTER_ARCH_AXIS: { x: 50, y: 14, w: 34, h: 12 },
  D_HERO_TITLE_CENTER: { x: 50, y: 12.5, w: 36, h: 5.5 },
  D_CRYSTAL_CENTER: { x: 50, y: 22, w: 18, h: 8 },
  D_RIGHT_PANEL_BOUNDS: { x: 87, y: 40, w: 20, h: 24 },
  D_BOTTOM_NAV_BOUNDS: { x: 50, y: 86.5, w: 52, h: 10 },
  D_ROW_TAROT: { x: 14, y: 40.5, w: 22, h: 7.5 },
  D_ROW_COFFEE: { x: 14, y: 49.5, w: 22, h: 7.5 },
  D_ROW_MALL: { x: 14, y: 58.5, w: 22, h: 7.5 },
  D_ACTION_WHOS_HERE: { x: 87, y: 41.5, w: 18, h: 7.5 },
  D_ACTION_TAKE_ME: { x: 87, y: 50.5, w: 18, h: 7.5 },
  D_ACTION_FIND_READER: { x: 87, y: 59.5, w: 18, h: 7.5 },
} as const satisfies Record<string, CanonicalPctRect>;

export const AW_D_01_OVERLAY_ANCHORS = {
  TOP_NAV_BRAND: { ...AW_D_01_STRUCTURAL_ANCHORS.D_BRAND_ORIGIN, region: 'TOP_NAV' },
  TOP_NAV_LINKS: { ...AW_D_01_STRUCTURAL_ANCHORS.D_PRIMARY_NAV_CENTER, region: 'TOP_NAV' },
  TOP_NAV_UTILITIES: { x: 91, y: 2.5, w: 14, h: 5.5, region: 'TOP_NAV' },
  AVATAR_SHELL_CENTER: AW_D_01_STRUCTURAL_ANCHORS.D_AVATAR_CENTER,
  HERO_KICKER_CENTER: { x: 50, y: 9.5, w: 28, h: 3.0, region: 'HERO_ENVIRONMENT' },
  HERO_TITLE_CENTER: AW_D_01_STRUCTURAL_ANCHORS.D_HERO_TITLE_CENTER,
  HERO_SUBTITLE_CENTER: { x: 50, y: 17.0, w: 30, h: 5.0, region: 'HERO_ENVIRONMENT' },
  ASTREA_ENTERING: { x: 14, y: 26.5, w: 20, h: 2.5, region: 'LEFT_ASTREA_PANEL' },
  ASTREA_TITLE: { x: 14, y: 29.5, w: 18, h: 3.5, region: 'LEFT_ASTREA_PANEL' },
  ASTREA_DISTRICT: { x: 14, y: 33.0, w: 20, h: 2.5, region: 'LEFT_ASTREA_PANEL' },
  ASTREA_TAGLINE: { x: 14, y: 35.5, w: 18, h: 2.5, region: 'LEFT_ASTREA_PANEL' },
  DESTINATION_ROW_1: { ...AW_D_01_STRUCTURAL_ANCHORS.D_ROW_TAROT, region: 'DESTINATION_ROW_01' },
  DESTINATION_ROW_2: { ...AW_D_01_STRUCTURAL_ANCHORS.D_ROW_COFFEE, region: 'DESTINATION_ROW_02' },
  DESTINATION_ROW_3: { ...AW_D_01_STRUCTURAL_ANCHORS.D_ROW_MALL, region: 'DESTINATION_ROW_03' },
  RIGHT_ACTION_1: { ...AW_D_01_STRUCTURAL_ANCHORS.D_ACTION_WHOS_HERE, region: 'RIGHT_ACTION_PANEL' },
  RIGHT_ACTION_2: { ...AW_D_01_STRUCTURAL_ANCHORS.D_ACTION_TAKE_ME, region: 'RIGHT_ACTION_PANEL' },
  RIGHT_ACTION_3: { ...AW_D_01_STRUCTURAL_ANCHORS.D_ACTION_FIND_READER, region: 'RIGHT_ACTION_PANEL' },
  BOTTOM_NAV: { ...AW_D_01_STRUCTURAL_ANCHORS.D_BOTTOM_NAV_BOUNDS, region: 'NAV_SHELL' },
} as const satisfies Record<string, CanonicalPctRect>;

export const AW_D_01_DESTINATION_ROW_INSETS = {
  iconWell: { left: 0.04, top: 0.1, right: 0.72, bottom: 0.1 },
  copy: { left: 0.18, top: 0.15, right: 0.08, bottom: 0.15 },
} as const;

export function resolveAwD01BackgroundPath(): string {
  return AW_D_01_WORLD_ENTRY_BACKGROUND_V2.publicPath;
}

export function resolveAwD01IconKey(
  slot: 'TAROT_DESTINATION_ICON' | 'COFFEE_DESTINATION_ICON' | 'MALL_DESTINATION_ICON',
): 'TAROT_SUITE' | 'COFFEE_SHOP' | 'ASTRAL_MALL' {
  const entry = AW_D_01_LAYERED_ASSET_MANIFEST[slot];
  if (entry.resolver !== 'ICON_ASSET' || !entry.iconKey) {
    throw new Error(`${slot} must resolve as ICON_ASSET`);
  }
  return entry.iconKey;
}
