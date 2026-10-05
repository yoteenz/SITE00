/**
 * P0.5E.3 — Uneven intelligence profile — intelligence expressed through behavior.
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterIntelligenceProfile } from './types.js';

export const INTELLIGENCE_DIMENSIONS = [
  'pattern recognition',
  'cultural memory',
  'social intuition',
  'research discipline',
  'synthesis',
  'visual intelligence',
  'linguistic sensitivity',
  'contradiction detection',
  'practical reasoning',
  'emotional perception',
  'systems thinking',
  'bullshit detection',
  'curiosity',
  'source evaluation',
] as const;

export function buildEmbodiedCharacterIntelligenceProfile(
  overrides: Partial<EmbodiedCharacterIntelligenceProfile> = {},
): EmbodiedCharacterIntelligenceProfile {
  return {
    profileId: randomId('int'),
    strongestIntelligences: overrides.strongestIntelligences ?? [],
    averageIntelligences: overrides.averageIntelligences ?? [],
    blindSpots: overrides.blindSpots ?? [],
    falseConfidenceAreas: overrides.falseConfidenceAreas ?? [],
    thingsSheLearnsSlowly: overrides.thingsSheLearnsSlowly ?? [],
    thingsSheLearnsQuickly: overrides.thingsSheLearnsQuickly ?? [],
    behavioralExpression:
      overrides.behavioralExpression ??
      'Intelligence creates behavior — remembers obscure statements, notices contradictions, goes looking before posting.',
  };
}

export function intelligenceRequiresUnevenProfile(profile: EmbodiedCharacterIntelligenceProfile): boolean {
  return profile.blindSpots.length >= 1 && profile.strongestIntelligences.length >= 1;
}
