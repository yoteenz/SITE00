/**
 * P0.FILM.1 — Wardrobe bible.
 */

import type { CharacterWardrobeBible, WardrobeMode, WardrobeOutfit, NdxEnvironmentId } from '../types.js';

export function buildWardrobeOutfit(params: Partial<WardrobeOutfit> & { mode: WardrobeMode; continuityId: string }): WardrobeOutfit {
  return {
    continuityId: params.continuityId,
    mode: params.mode,
    top: params.top ?? 'fitted tee',
    bottom: params.bottom ?? 'structured denim',
    outerLayer: params.outerLayer ?? null,
    shoes: params.shoes ?? 'clean sneakers',
    bag: params.bag ?? null,
    jewelry: params.jewelry ?? [],
    eyewear: params.eyewear ?? null,
    limeAccent: params.limeAccent ?? null,
    hairCompatibility: params.hairCompatibility ?? ['natural down', 'clipped back'],
    environmentCompatibility: params.environmentCompatibility ?? ['CAFE', 'CITY_SIDEWALK'],
    movementCompatibility: params.movementCompatibility ?? ['walk', 'sit', 'stand'],
    season: params.season ?? 'transitional',
    temperature: params.temperature ?? 'mild',
    approvalState: params.approvalState ?? 'APPROVED',
  };
}

export function buildCharacterWardrobeBible(params: {
  characterId: string;
  modes: WardrobeOutfit[];
  limeRules?: string[];
  northStar?: string[];
}): CharacterWardrobeBible {
  return {
    characterId: params.characterId,
    modes: params.modes,
    limeRules: params.limeRules ?? [
      'lime must be recognizable but restrained',
      'one dominant lime piece per look unless approved',
    ],
    northStar: params.northStar ?? [
      'casual cultural modern edgy',
      'structured enough to preserve figure',
      'never costume-y or hyper-glam',
    ],
  };
}

export function resolveWardrobeForEnvironment(
  bible: CharacterWardrobeBible,
  environment: NdxEnvironmentId,
): WardrobeOutfit | null {
  return (
    bible.modes.find((m) => m.environmentCompatibility.includes(environment) && m.approvalState === 'APPROVED') ??
    bible.modes.find((m) => m.approvalState === 'APPROVED') ??
    null
  );
}

export function wardrobeContinuityTracked(outfit: WardrobeOutfit): boolean {
  return outfit.continuityId.length > 0;
}
