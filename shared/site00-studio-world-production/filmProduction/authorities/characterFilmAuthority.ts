/**
 * P0.FILM.1 — Character film authority (extends character continuity).
 */

import type { CharacterFilmAuthority } from '../types.js';

export function buildCharacterFilmAuthority(params: {
  characterId: string;
  truthSnapshot?: Record<string, unknown> | null;
  referencePackId?: string | null;
  continuityBibleId?: string | null;
  overrides?: Partial<CharacterFilmAuthority>;
}): CharacterFilmAuthority {
  const base: CharacterFilmAuthority = {
    characterId: params.characterId,
    identityAnchors: [],
    bodyProportionAnchors: [],
    faceAnchors: [],
    hairAnchors: [],
    expressionRange: ['subtle', 'micro-reaction', 'double-take'],
    gestureVocabulary: [],
    posture: 'comfortable, not presenter',
    walkingBehavior: 'natural city pace',
    sittingBehavior: 'occupied with something else',
    cameraAwareness: 'notices camera late',
    socialBehavior: 'observational before performative',
    humorBehavior: 'dry, understated',
    microExpressionRules: ['react before explain'],
    emotionalRange: ['curious', 'skeptical', 'absorbed', 'amused'],
    speechCadence: 'natural, conversational',
    voice: null,
    negativeBehaviorConstraints: ['no influencer posing', 'no constant eye contact'],
    referencePackId: params.referencePackId ?? null,
    continuityBibleId: params.continuityBibleId ?? null,
  };
  return { ...base, ...params.overrides };
}

export function characterFilmAuthorityFromTruthSnapshot(
  characterId: string,
  snapshot: Record<string, unknown> | null,
): CharacterFilmAuthority {
  if (!snapshot) {
    return buildCharacterFilmAuthority({ characterId });
  }
  return buildCharacterFilmAuthority({
    characterId,
    overrides: {
      identityAnchors: (snapshot.identityAnchors as string[]) ?? [],
      faceAnchors: (snapshot.faceAnchors as string[]) ?? [],
      hairAnchors: (snapshot.hairAnchors as string[]) ?? [],
      referencePackId: (snapshot.referencePackId as string) ?? null,
    },
  });
}
