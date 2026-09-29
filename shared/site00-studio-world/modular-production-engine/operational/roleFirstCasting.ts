/**
 * Role-first casting — catalogue search before any Actor generation.
 */

import type { CastingRequirement } from '../../acting-catalogue/types.js';
import { recommendActorsForCharacter } from '../../acting-catalogue/castingIntelligence.js';
import { getStudioWorldActorCatalogue } from '../../acting-catalogue/seedCatalogue.js';
import type { OperationalCastingRequirement } from './castingRequirementOperational.js';

export const CATALOGUE_MATCH_OUTCOMES = ['MATCHED', 'POSSIBLE_MATCH', 'NO_SUITABLE_MATCH'] as const;
export type CatalogueMatchOutcome = (typeof CATALOGUE_MATCH_OUTCOMES)[number];

export type CatalogueSearchResult = {
  outcome: CatalogueMatchOutcome;
  matchedActorIds: readonly string[];
  possibleActorIds: readonly string[];
  rationale: string;
  createNewActorAllowed: boolean;
};

export type RoleFirstCastingFlowStep =
  | 'NARRATIVE'
  | 'CASTING_REQUIREMENT'
  | 'SEARCH_ACTING_CATALOGUE'
  | 'SHORTLIST_EXISTING'
  | 'FOUNDER_CAST_DECISION'
  | 'CREATE_NEW_ACTOR';

export function searchCatalogueBeforeNewActor(args: {
  requirement: CastingRequirement | OperationalCastingRequirement;
  projectId: string;
  brand: string;
  creativeTerritory: string;
  permittedActorIds?: readonly string[];
}): CatalogueSearchResult {
  const recs = recommendActorsForCharacter({
    requirement: args.requirement as CastingRequirement,
    brand: args.brand,
    project: args.projectId,
    creativeTerritory: args.creativeTerritory,
    narrativePlan: null,
    previousActorUsage: [],
    catalogue: getStudioWorldActorCatalogue(),
  });

  const permitted = args.permittedActorIds ?
    recs.filter((r) => args.permittedActorIds!.includes(r.actor.actorId))
  : recs;

  const strong = permitted.filter((r) => r.reuseSuggested);
  const weak = permitted.filter((r) => !r.reuseSuggested && r.repetitionRisk !== 'ELEVATED');

  if (strong.length > 0) {
    return {
      outcome: 'MATCHED',
      matchedActorIds: strong.map((r) => r.actor.actorId),
      possibleActorIds: weak.map((r) => r.actor.actorId),
      rationale: strong.map((r) => r.rationale).join(' · '),
      createNewActorAllowed: false,
    };
  }
  if (weak.length > 0) {
    return {
      outcome: 'POSSIBLE_MATCH',
      matchedActorIds: [],
      possibleActorIds: weak.map((r) => r.actor.actorId),
      rationale: 'Founder should review possible catalogue fits before net-new Actor genesis',
      createNewActorAllowed: false,
    };
  }
  return {
    outcome: 'NO_SUITABLE_MATCH',
    matchedActorIds: [],
    possibleActorIds: [],
    rationale: 'No suitable permitted catalogue talent — Founder may approve NEW ACTOR genesis',
    createNewActorAllowed: true,
  };
}

export function nextRoleFirstCastingStep(
  current: RoleFirstCastingFlowStep,
  search: CatalogueSearchResult,
  founderSelectedExisting: boolean,
): RoleFirstCastingFlowStep {
  if (current === 'NARRATIVE') return 'CASTING_REQUIREMENT';
  if (current === 'CASTING_REQUIREMENT') return 'SEARCH_ACTING_CATALOGUE';
  if (current === 'SEARCH_ACTING_CATALOGUE') {
    if (search.outcome === 'NO_SUITABLE_MATCH') return 'CREATE_NEW_ACTOR';
    return 'SHORTLIST_EXISTING';
  }
  if (current === 'SHORTLIST_EXISTING') return 'FOUNDER_CAST_DECISION';
  if (current === 'FOUNDER_CAST_DECISION') {
    return founderSelectedExisting ? 'FOUNDER_CAST_DECISION' : 'CREATE_NEW_ACTOR';
  }
  return current;
}

/** Narrative must produce requirement before Actor creation paths unlock. */
export function narrativePrecedesActorCreation(
  hasCastingRequirement: boolean,
  attemptingActorGenesis: boolean,
): { allowed: boolean; reason: string } {
  if (attemptingActorGenesis && !hasCastingRequirement) {
    return { allowed: false, reason: 'CastingRequirement required from Narrative Momentum + campaign function' };
  }
  return { allowed: true, reason: 'OK' };
}
