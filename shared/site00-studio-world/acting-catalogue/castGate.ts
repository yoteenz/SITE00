/**
 * Cast gate + uncatalogued hero guard.
 */

import type {
  CastGateEvaluation,
  CastingRequirement,
  ProductionCastState,
  ProductionCharacter,
  ScreenImportance,
} from './types.js';

const HERO_TIERS: ScreenImportance[] = ['HERO', 'SUPPORTING'];

export function evaluateCastGate(state: ProductionCastState): CastGateEvaluation {
  const required = state.requirements.filter((r) => HERO_TIERS.includes(r.screenImportance));
  const charsByReq = new Map(state.characters.map((c) => [c.castingRequirementId, c]));
  const uncataloguedHeroes: string[] = [];
  const missingAuthorities: string[] = [];

  for (const req of required) {
    const character = charsByReq.get(req.requirementId);
    if (!character?.actorId) {
      uncataloguedHeroes.push(req.narrativeRole);
      continue;
    }
    if (character.status !== 'LOCKED' || !character.characterAuthorityId) {
      missingAuthorities.push(character.characterName || req.narrativeRole);
    }
  }

  const allLocked =
    required.length > 0 &&
    uncataloguedHeroes.length === 0 &&
    missingAuthorities.length === 0 &&
    required.every((r) => {
      const c = charsByReq.get(r.requirementId);
      return c?.status === 'LOCKED' && Boolean(c.characterAuthorityId);
    });

  return {
    allRequiredCharactersLocked: allLocked,
    blockedReason: allLocked ? null : 'CAST_GATE_BLOCKED',
    uncataloguedHeroes,
    missingCharacterAuthorities: missingAuthorities,
  };
}

export function assertUncataloguedHeroBlocked(
  character: ProductionCharacter,
  requirement: CastingRequirement | undefined,
): { blocked: boolean; code: 'UNCATALOGUED_HERO_CHARACTER' | null; message: string | null } {
  if (!requirement || !HERO_TIERS.includes(requirement.screenImportance)) {
    return { blocked: false, code: null, message: null };
  }
  if (!character.actorId) {
    return {
      blocked: true,
      code: 'UNCATALOGUED_HERO_CHARACTER',
      message: `${requirement.narrativeRole} requires a Studio World Actor before downstream production`,
    };
  }
  return { blocked: false, code: null, message: null };
}

export function storyboardBlockedUntilCastLocked(gate: CastGateEvaluation): boolean {
  return !gate.allRequiredCharactersLocked;
}
