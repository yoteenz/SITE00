/**
 * P0.VR.5 — Constants and built-in instruction presets.
 */

import { P0_VR_5_LINEAGE } from './types.js';

export { P0_VR_5_LINEAGE };

export const P0_VR_5_FEATURE_LABEL = 'ASSET DECONSTRUCTION PIPELINE' as const;

export const LOW_CONFIDENCE_THRESHOLD = 0.45;
export const HIGH_CONFIDENCE_THRESHOLD = 0.75;

export const DEFAULT_SOURCE_DIMENSIONS = { width: 946, height: 667 } as const;

export const BUILT_IN_PRESET_IDS = {
  CUSTOM: 'preset-custom',
  SINGLE_ICON: 'preset-isolate-single-icon',
  ICON_SET: 'preset-isolate-icon-set',
  REPLACE_NAV: 'preset-replace-nav-icon-set',
  HERO_OBJECT: 'preset-extract-hero-object',
  BACKGROUND: 'preset-extract-background-image',
  PROJECT_CARDS: 'preset-isolate-project-card-visuals',
  SOLO_TRANSPARENT: 'preset-recreate-solo-no-background',
  RECONSTRUCT_REPLACE: 'preset-reconstruct-replace-page-asset',
  REPLICATE_PAGE_EXACTLY: 'preset-replicate-page-exactly',
  REPLICATE_MOBILE_EXACTLY: 'preset-replicate-mobile-screen-exactly',
  REPLICATE_DESKTOP_EXACTLY: 'preset-replicate-desktop-screen-exactly',
  EXTRACT_REPLACE_ASSETS_EXACTLY: 'preset-extract-replace-assets-exactly',
} as const;

export const GENERATION_PROVIDER_PLAN = [
  'GPT_IMAGE_2_EDIT (PRIMARY)',
  'IDEOGRAM (OPTIONAL BG REMOVAL)',
  'PIXELCUT (OPTIONAL BG REMOVAL)',
  'FAL (FALLBACK WHEN ENABLED)',
] as const;

export const NAV_ICON_SET_BOUNDS_TEMPLATE = {
  y: 580,
  height: 72,
  iconWidth: 64,
  iconGap: 24,
  startX: 80,
} as const;

export const BACKGROUND_EXTRACT_BOUNDS = {
  x: 0,
  y: 0,
  width: 946,
  height: 667,
  chromeMargin: 48,
} as const;

export const PROJECTS_HEADER_PLANET_BOUNDS = {
  x: 528,
  y: 42,
  width: 365,
  height: 318,
} as const;

export const SINGLE_ICON_DEFAULT_BOUNDS = {
  x: 400,
  y: 280,
  width: 120,
  height: 120,
} as const;
