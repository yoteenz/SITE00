/**
 * P0.FILM.1 — Hair & beauty bible.
 */

import type { HairBeautyBible } from '../types.js';

export function buildHairBeautyBible(params: {
  characterId: string;
  overrides?: Partial<HairBeautyBible>;
}): HairBeautyBible {
  const base: HairBeautyBible = {
    characterId: params.characterId,
    canonicalHairIdentity: 'natural texture, consistent between shots',
    approvedHairModes: ['natural down', 'clipped back', 'low pony'],
    makeupIntensity: 'minimal natural',
    skinRealism: 'lived-in, not campaign',
    nails: 'natural or subtle lime accent',
    brows: 'natural groomed',
    lashes: 'natural',
    lip: 'natural nude',
    jewelryCompatibility: ['minimal gold', 'lime accent pieces'],
  };
  return { ...base, ...params.overrides };
}

export function hairBeautyContinuityConsistent(bible: HairBeautyBible, shotHair: string): boolean {
  return bible.approvedHairModes.some((m) => shotHair.toLowerCase().includes(m.toLowerCase()));
}
