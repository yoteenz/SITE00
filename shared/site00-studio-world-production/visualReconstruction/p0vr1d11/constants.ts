/**
 * P0.VR.1D.11 — Character Lab reconstruction constants.
 */

export const P0_VR_1D11_LINEAGE = 'P0.VR.1D.11' as const;

export const CHARACTER_LAB_FULL_SCREEN_VISUAL_AUTHORITY = 'CHARACTER_LAB_FULL_SCREEN_VISUAL_AUTHORITY' as const;

export const FAIL_CHARACTER_LAB_OLD_SHELL_PRESERVED = 'FAIL_CHARACTER_LAB_OLD_SHELL_PRESERVED' as const;
export const FAIL_CHARACTER_LAB_REFERENCE_NOT_FULL_SCREEN_AUTHORITY = 'FAIL_CHARACTER_LAB_REFERENCE_NOT_FULL_SCREEN_AUTHORITY' as const;
export const FAIL_CHARACTER_LAB_HERO_GEOMETRY_DRIFT = 'FAIL_CHARACTER_LAB_HERO_GEOMETRY_DRIFT' as const;
export const FAIL_CHARACTER_PORTRAIT_WRONG_AUTHORITY = 'FAIL_CHARACTER_PORTRAIT_WRONG_AUTHORITY' as const;
export const FAIL_CHARACTER_LANGUAGE_NOTE_DRIFT = 'FAIL_CHARACTER_LANGUAGE_NOTE_DRIFT' as const;
export const FAIL_STICKY_NOTE_ASSET_MISSING = 'FAIL_STICKY_NOTE_ASSET_MISSING' as const;
export const FAIL_STICKY_NOTE_GENERIC_CSS_APPROXIMATION = 'FAIL_STICKY_NOTE_GENERIC_CSS_APPROXIMATION' as const;
export const FAIL_FAL_TEXT_TO_IMAGE_USED_WHEN_REFERENCE_AVAILABLE = 'FAIL_FAL_TEXT_TO_IMAGE_USED_WHEN_REFERENCE_AVAILABLE' as const;
export const FAIL_CHARACTER_IDENTITY_LAYOUT_DRIFT = 'FAIL_CHARACTER_IDENTITY_LAYOUT_DRIFT' as const;
export const FAIL_QUOTE_CARD_GEOMETRY_DRIFT = 'FAIL_QUOTE_CARD_GEOMETRY_DRIFT' as const;
export const FAIL_PERFORMANCE_GRID_DRIFT = 'FAIL_PERFORMANCE_GRID_DRIFT' as const;
export const FAIL_CHARACTER_LAB_BOTTOM_NAV_DRIFT = 'FAIL_CHARACTER_LAB_BOTTOM_NAV_DRIFT' as const;
export const FAIL_PREVIOUS_LOCK_BLOCKS_REBUILD = 'FAIL_PREVIOUS_LOCK_BLOCKS_REBUILD' as const;

export const STALE_AFTER_CHARACTER_LAB_REFERENCE_REBUILD = 'STALE_AFTER_CHARACTER_LAB_REFERENCE_REBUILD' as const;

export const NDX_CHARACTER_LAB_REFERENCE_PATH =
  'visual-references/founder/ndxbook/mobile-character-lab-fullscreen-reference.png' as const;

export const NDX_CHARACTER_LAB_ROUTE = '/projects/ndxbook/character/founder-discovery' as const;
export const NDX_CHARACTER_LAB_ROUTE_SEARCH = '?site00MobileLayout=1' as const;

export const NDX_CHARACTER_LAB_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
} as const;

export const NDX_CHARACTER_LAB_VR_REGION_IDS = [
  'ndx.character.screen',
  'ndx.character.header',
  'ndx.character.tabs',
  'ndx.character.hero',
  'ndx.character.portrait',
  'ndx.character.language-note',
  'ndx.character.identity',
  'ndx.character.sticky-note',
  'ndx.character.quote',
  'ndx.character.performance',
  'ndx.character.performance.card.1',
  'ndx.character.performance.card.2',
  'ndx.character.performance.card.3',
  'ndx.character.performance.card.4',
  'ndx.character.bottom-nav',
] as const;

export const NDX_CHARACTER_LAB_ASSET_PATHS = {
  portrait: '/visual-references/founder/ndxbook/character-lab-artwork/character-portrait.webp',
  languageNoteSurface: '/visual-references/founder/ndxbook/character-lab-artwork/language-note-surface.webp',
  stickyNoteSurface: '/visual-references/founder/ndxbook/character-lab-artwork/working-draft-sticky-note.webp',
} as const;
