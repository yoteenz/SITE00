/**
 * P0.5E.7A — Character visual participation recommendation.
 */

import type { CharacterVisualParticipationRecommendation, NDXPageRoleMapEntry } from './types.js';
import type { NdxPageRoleMapRole } from './types.js';

const ROLE_PARTICIPATION: Partial<Record<NdxPageRoleMapRole, CharacterVisualParticipationRecommendation['level']>> = {
  PERSONAL_CONTRADICTION: 'STRONGLY_RECOMMENDED',
  INCITING_INCIDENT: 'STRONGLY_RECOMMENDED',
  BELIEF_REVISION: 'RECOMMENDED',
  BEHAVIOR_CHANGE: 'OPTIONAL',
  WHAT_I_MISSED: 'RECOMMENDED',
  OBSERVATION: 'OPTIONAL',
  SYSTEM_LOGIC: 'NONE',
  BOOKMARK: 'NONE',
};

export function recommendCharacterVisualParticipation(
  entry: NDXPageRoleMapEntry,
): CharacterVisualParticipationRecommendation {
  const level = ROLE_PARTICIPATION[entry.role] ?? 'OPTIONAL';
  const reasons: Record<CharacterVisualParticipationRecommendation['level'], string> = {
    NONE: 'Educational/system slide — photography not required',
    OPTIONAL: 'Photography may strengthen but is not mandatory',
    RECOMMENDED: 'NDX reacting or investigating would materially strengthen this beat',
    STRONGLY_RECOMMENDED: 'Reaction/investigation/revision beat — character participation strongly recommended',
  };
  return {
    slideNumber: entry.slideNumber,
    level,
    reason: reasons[level],
  };
}

export function ndxPhotographyRequiredOnEverySlide(): false {
  return false;
}

export function ndxPhotographySupportsCharacterAction(recommendation: CharacterVisualParticipationRecommendation): boolean {
  return recommendation.level !== 'NONE' || recommendation.reason.includes('not required');
}

export function characterVisualParticipationRecommendationImplemented(): true {
  return true;
}
