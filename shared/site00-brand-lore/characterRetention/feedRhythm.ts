/**
 * Feed-level character + humor rhythm for 3×3 board.
 */

import type { CharacterRetainedFirstSlideContract } from './types.js';
import type { FeedCharacterRhythm, FeedHumorRhythm } from './types.js';

export function buildFeedCharacterRhythm(params: {
  boardId: string;
  contracts: CharacterRetainedFirstSlideContract[];
}): FeedCharacterRhythm {
  const humorIntensity = params.contracts.map((c) =>
    c.characterRetention.humorEligibility === 'REQUIRED' ? 3 : c.characterRetention.humorEligibility === 'STRONGLY_HELPFUL' ? 2 : 1,
  );
  const traceIntensity = params.contracts.map((c) =>
    c.characterRetention.humanTraceStrength === 'STRONG' ? 3 : c.characterRetention.humanTraceStrength === 'MODERATE' ? 2 : 1,
  );
  const uniqueHumorEligibility = new Set(params.contracts.map((c) => c.characterRetention.humorEligibility)).size;
  const uniqueBeats = new Set(params.contracts.map((c) => c.characterRetention.primaryCharacterBeat.beatType)).size;

  return {
    boardId: params.boardId,
    humorIntensity,
    traceIntensity,
    pettiness: params.contracts.map((c) => (c.characterRetention.pettinessLevel === 'PLAYFUL' ? 2 : 1)),
    seriousness: params.contracts.map((c) => (c.characterRetention.humorEligibility === 'INAPPROPRIATE' ? 3 : 1)),
    culturalShorthand: params.contracts.map((c) => (c.characterRetention.culturalShorthandAllowed ? 2 : 1)),
    visualMisbehavior: params.contracts.map((c) => c.characterRetention.controlledMisbehavior.length),
    variationAdequate: uniqueHumorEligibility >= 2 && uniqueBeats >= 5,
  };
}

export function buildFeedHumorRhythm(params: {
  boardId: string;
  contracts: CharacterRetainedFirstSlideContract[];
}): FeedHumorRhythm {
  const distribution: Record<string, number> = {};
  for (const c of params.contracts) {
    const key = c.characterRetention.primaryCharacterBeat.beatType;
    distribution[key] = (distribution[key] ?? 0) + 1;
  }
  const jokeCount = params.contracts.filter((c) => c.characterRetention.humorRequired).length;
  const requiredMissing = params.contracts.filter(
    (c) => c.characterRetention.humorEligibility === 'REQUIRED' && !c.characterRetention.humorRequired,
  ).length;

  return {
    boardId: params.boardId,
    distribution,
    everyPostIsJoke: jokeCount >= 8,
    noHumorWhereRequired: requiredMissing > 0,
  };
}

export function everyPostIsJokeFails(rhythm: FeedHumorRhythm): boolean {
  return rhythm.everyPostIsJoke;
}

export function noHumorWhereRequiredFails(rhythm: FeedHumorRhythm): boolean {
  return rhythm.noHumorWhereRequired;
}

export function seriousPostsRemainValid(contracts: CharacterRetainedFirstSlideContract[]): boolean {
  return contracts.some((c) => c.characterRetention.humorEligibility === 'INAPPROPRIATE' || c.characterRetention.humorEligibility === 'NOT_NEEDED');
}
