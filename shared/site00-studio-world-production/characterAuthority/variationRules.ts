/**
 * P0.5E.4F — Allowed character variation model.
 */

import type { CharacterVariationRule } from './types.js';

export const NDX_DEFAULT_VARIATION_RULES: CharacterVariationRule[] = [
  { dimension: 'FACE', mode: 'LOCKED', notes: 'Facial structure locked to canonical anchor' },
  { dimension: 'SKIN', mode: 'LOCKED', notes: 'Skin tone locked to reference authority' },
  { dimension: 'BODY', mode: 'LOCKED', notes: 'Body silhouette locked to approved anchor' },
  { dimension: 'HAIR_IDENTITY', mode: 'LOCKED', notes: 'Hair texture/length/category locked' },
  { dimension: 'HAIR_STYLING', mode: 'ALLOWED_TO_VARY', notes: 'Minor styling within approved modes only' },
  { dimension: 'WARDROBE', mode: 'SCENE_DEPENDENT', notes: 'From approved Character Wardrobe Bible' },
  { dimension: 'LIME_ACCENT', mode: 'SCENE_DEPENDENT', notes: 'Restrained, scene-dependent' },
  { dimension: 'ENVIRONMENT', mode: 'SCENE_DEPENDENT', notes: 'From approved environment library' },
  { dimension: 'MAKEUP', mode: 'LOCKED', notes: 'No arbitrary beauty polish drift' },
  { dimension: 'NAILS', mode: 'LOCKED', notes: 'Locked unless founder approves variation' },
];

export function allowedCharacterVariationModelImplemented(): boolean {
  return NDX_DEFAULT_VARIATION_RULES.length >= 8;
}

export function variationRuleForDimension(dimension: string): CharacterVariationRule | null {
  return NDX_DEFAULT_VARIATION_RULES.find((r) => r.dimension === dimension) ?? null;
}
