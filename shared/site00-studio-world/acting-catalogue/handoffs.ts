/**
 * Storyboard / keyframe / video character authority handoffs.
 */

import type { NarrativeMomentumPlan } from '../../site00-expression-engine/narrative-momentum/types.js';
import { evaluateCastGate } from './castGate.js';
import type { ProductionCastState, ProductionCharacter, ShotCastEntry } from './types.js';

export type StoryboardCharacterHandoff = {
  characterId: string;
  actorId: string;
  actorIdentityAuthorityId: string;
  characterAuthorityId: string;
  campaignLookId: string;
  temporalLookId: string | null;
  performanceDirection: string;
  continuityRequirements: string;
};

export function buildStoryboardCharacterHandoff(
  state: ProductionCastState,
): StoryboardCharacterHandoff[] {
  const gate = evaluateCastGate(state);
  if (storyboardHandoffBlocked(state, gate)) {
    return [];
  }
  return state.characters
    .filter((c) => c.actorId && c.characterAuthorityId && c.status === 'LOCKED')
    .map((c) => mapCharacterToHandoff(c, state));
}

function mapCharacterToHandoff(c: ProductionCharacter, state: ProductionCastState): StoryboardCharacterHandoff {
  const sheet = state.authoritySheets.find((a) => a.characterAuthorityId === c.characterAuthorityId);
  const temporal =
    c.temporalLookIds.length > 0 ?
      state.temporalLooks.find((t) => t.temporalLookId === c.temporalLookIds[0]) ?? null
    : null;
  return {
    characterId: c.characterId,
    actorId: c.actorId!,
    actorIdentityAuthorityId: sheet?.actorIdentityAuthorityId ?? '',
    characterAuthorityId: c.characterAuthorityId!,
    campaignLookId: c.campaignLookId ?? '',
    temporalLookId: temporal?.temporalLookId ?? null,
    performanceDirection: c.performanceDirection,
    continuityRequirements: sheet?.continuityNotes ?? '',
  };
}

export function buildKeyframeCharacterHandoff(state: ProductionCastState): {
  visualAuthorityIds: readonly string[];
  characters: readonly StoryboardCharacterHandoff[];
} {
  const characters = buildStoryboardCharacterHandoff(state);
  const visualAuthorityIds = characters.flatMap((c) =>
    [c.actorIdentityAuthorityId, c.characterAuthorityId, c.campaignLookId].filter(Boolean),
  );
  return { visualAuthorityIds, characters };
}

export function buildVideoCharacterHandoff(
  state: ProductionCastState,
  shotId: string,
): {
  startFrameCharacterAuthorities: StoryboardCharacterHandoff[];
  endFrameCharacterAuthorities: StoryboardCharacterHandoff[];
  shotCast: readonly ShotCastEntry[];
  continuityLock: boolean;
} {
  const roster = state.shotCastByShotId[shotId] ?? [];
  const characters = buildStoryboardCharacterHandoff(state);
  const byChar = new Map(characters.map((c) => [c.characterId, c]));
  const shotHandoffs = roster.map((s) => byChar.get(s.characterId)).filter(Boolean) as StoryboardCharacterHandoff[];
  return {
    startFrameCharacterAuthorities: shotHandoffs,
    endFrameCharacterAuthorities: shotHandoffs,
    shotCast: roster,
    continuityLock: evaluateCastGate(state).allRequiredCharactersLocked,
  };
}

export function extendNarrativeStoryboardHandoffWithCast(
  plan: NarrativeMomentumPlan,
  castState: ProductionCastState,
): {
  narrativeMomentumPlanId: string;
  castingRequirements: ProductionCastState['requirements'];
  characterHandoff: StoryboardCharacterHandoff[];
  castGateBlocked: boolean;
} {
  const characterHandoff = buildStoryboardCharacterHandoff(castState);
  const gate = evaluateCastGate(castState);
  return {
    narrativeMomentumPlanId: plan.id,
    castingRequirements: castState.requirements,
    characterHandoff,
    castGateBlocked: gate.blockedReason === 'CAST_GATE_BLOCKED',
  };
}

function storyboardHandoffBlocked(
  state: ProductionCastState,
  gate: ReturnType<typeof evaluateCastGate>,
): boolean {
  const heroSupporting = state.requirements.filter(
    (r) => r.screenImportance === 'HERO' || r.screenImportance === 'SUPPORTING',
  );
  if (heroSupporting.length === 0) return false;
  return !gate.allRequiredCharactersLocked;
}
