/**
 * P0.FILM.1 — Brand film bible builder (generic).
 */

import type { BrandFilmBible } from '../types.js';

export function buildBrandFilmBible(params: {
  brandId: string;
  version?: string;
  overrides?: Partial<BrandFilmBible>;
}): BrandFilmBible {
  const base: BrandFilmBible = {
    brandId: params.brandId,
    version: params.version ?? '1.0.0',
    visualTone: [],
    cameraRelationship: 'observational',
    realismTarget: 'social-native premium',
    pacingRange: { min: 15, max: 60 },
    shotDensity: 'moderate',
    preferredCameraDistance: ['medium', 'medium-wide'],
    preferredLensCharacter: 'naturalistic',
    preferredFraming: ['off-center', 'environmental'],
    lightingRules: ['natural light preferred', 'no studio glamour'],
    movementRules: ['handheld tolerance moderate', 'no orbit shots'],
    editingRules: ['observational pacing', 'cuts serve narrative'],
    soundRules: ['ambient first', 'dialogue natural'],
    textOverlayRules: ['minimal', 'brand typography when used'],
    performanceRules: ['react before explain', 'camera caught not presented'],
    allowedStylization: ['slight imperfection', 'social-native'],
    disallowedStylization: ['commercial polish', 'AI-glam', 'music-video posing'],
    continuityRules: ['wardrobe persists within scene', 'props tracked'],
    approvedShotIds: [],
    approvedFormatTemplateIds: [],
    founderOverrides: {},
  };
  return { ...base, ...params.overrides };
}

export function brandFilmBibleResolvesBeforeGeneration(bible: BrandFilmBible | null): boolean {
  return bible !== null && bible.brandId.length > 0 && bible.visualTone.length > 0;
}
