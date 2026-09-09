/**
 * Brand Family Skin constants — five canonical families + project bindings.
 */

import { MASTER_SKIN_CATALOG_IDS } from '../constants.js';
import { BRAND_FAMILY_KEYS } from './types.js';

export { BRAND_FAMILY_KEYS };

export const BRAND_FAMILY_SLUGS: Record<string, string> = {
  [BRAND_FAMILY_KEYS.NDXBOOK]: 'ndxbook',
  [BRAND_FAMILY_KEYS.FRONTAL_SLAYER]: 'frontal-slayer',
  [BRAND_FAMILY_KEYS.AIO]: 'aio',
  [BRAND_FAMILY_KEYS.ASTRAL_WORLD]: 'astral-world',
  [BRAND_FAMILY_KEYS.STUDIO_WORLD]: 'studio-world',
};

export const BRAND_FAMILY_PROJECT_MAP: Record<string, string> = {
  ndxbook: BRAND_FAMILY_KEYS.NDXBOOK,
  'frontal-slayer': BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
  'all-in-one-enterprises': BRAND_FAMILY_KEYS.AIO,
  'astral-world': BRAND_FAMILY_KEYS.ASTRAL_WORLD,
  'studio-world': BRAND_FAMILY_KEYS.STUDIO_WORLD,
};

export const BRAND_FAMILY_PRIMARY_COLORS: Record<string, { color?: string; family?: string }> = {
  [BRAND_FAMILY_KEYS.NDXBOOK]: { family: 'LIME / CHARTREUSE FAMILY', color: '#b7d236' },
  [BRAND_FAMILY_KEYS.FRONTAL_SLAYER]: { color: '#EB1C24' },
  [BRAND_FAMILY_KEYS.AIO]: { family: 'GOLD', color: '#c9a227' },
  [BRAND_FAMILY_KEYS.ASTRAL_WORLD]: { family: 'PURPLE', color: '#7b4fd4' },
  [BRAND_FAMILY_KEYS.STUDIO_WORLD]: { family: 'GOLD', color: '#d4af37' },
};

/** NDXBOOK preserves existing cultural editorial master skin bridge. */
export const BRAND_FAMILY_LEGACY_MASTER_SKIN: Record<string, string> = {
  [BRAND_FAMILY_KEYS.NDXBOOK]: MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL,
};

export const DEFAULT_SCREEN_DESIGN_ORDER: readonly string[] = ['PROJECT_OVERVIEW'] as const;

export const TYPOGRAPHY_FIREWALL = {
  requiredFontFamily: 'MARTIAN MONO',
  uiCaseRule: 'UPPERCASE',
  allowedVariations: ['FONT_SIZE', 'FONT_WEIGHT', 'TRACKING', 'LINE_HEIGHT', 'DENSITY', 'SCALE_RELATIONSHIPS'],
  prohibitedFonts: ['SERIF', 'SCRIPT', 'RANDOM_SANS', 'BRAND_DISPLAY'],
} as const;

export const HOST_SKIN_FIREWALL = {
  hostControls: [
    'GLOBAL_HOST_SHELL',
    'MARTIAN_MONO_TYPOGRAPHY',
    'UPPERCASE_UI_RULE',
    'GLOBAL_NAVIGATION',
    'PROJECT_ROUTING',
    'MODULE_ENTITLEMENTS',
    'AUTH',
    'FOUNDER_CLIENT_PERMISSIONS',
    'ACCESSIBILITY',
    'CLIENT_FIREWALL',
    'SYSTEM_CONTROLS',
    'GLOBAL_DATA_BEHAVIOR',
  ],
  skinControls: [
    'INTERNAL_MODULE_COMPOSITION',
    'INTERNAL_PANEL_GRAMMAR',
    'SURFACE_MATERIALS',
    'ACCENT_USAGE',
    'BRAND_COLOR_APPLICATION',
    'IMAGE_TREATMENT',
    'DECORATIVE_SYSTEM',
    'DENSITY',
    'SPACING_RHYTHM',
    'MODULE_SPECIFIC_VISUAL_EXPRESSION',
  ],
} as const;
