/**
 * Experiment E — Experience Expression readiness gate.
 */

import type { BrandLoreProfile } from '../types.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import { shouldIncludeCreativeAppetiteInFormation } from '../founderCreativeAppetite/experimentExclusion.js';
import { EXPERIMENT_E_RUN_ID, EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION } from './constants.js';
import type { ExperienceExpressionReadiness, ExperienceFunctionalCanon, HostExperienceCanon } from './types.js';

export function assessExperienceExpressionReadiness(params: {
  profile: BrandLoreProfile | null;
  territory: CreativeConceptTerritory | null;
  world: WorldExpressionSystem | null;
  functionalCanon: ExperienceFunctionalCanon | null;
  hostCanon: HostExperienceCanon | null;
  experienceTestTerritoryId: string | null;
}): ExperienceExpressionReadiness {
  const { profile, territory, world, functionalCanon, hostCanon, experienceTestTerritoryId } = params;

  const brandLoreReady = Boolean(profile?.brandWorld?.value);
  const brandPersonalityReady = Boolean(profile?.brandPersonality);
  const expressionContextReady = Boolean(profile?.contextClassification);
  const appetiteAvailable = Boolean(
    profile?.founderCreativeAppetite && Object.keys(profile.founderCreativeAppetite.rawAnswers ?? {}).length > 0,
  );
  const appetiteIncluded = shouldIncludeCreativeAppetiteInFormation({
    experimentId: EXPERIMENT_E_RUN_ID,
    intelligenceSnapshotVersion: EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
  });
  const conceptTerritorySelected = Boolean(experienceTestTerritoryId && territory);
  const worldExpressionAvailable = Boolean(world);
  const hostCanonReady = Boolean(hostCanon);
  const functionalCanonReady = Boolean(functionalCanon);

  const blockers: string[] = [];
  if (!brandLoreReady) blockers.push('Brand Lore not ready');
  if (!brandPersonalityReady) blockers.push('Brand Personality not ready');
  if (!expressionContextReady) blockers.push('Primary Expression Context not ready');
  if (!conceptTerritorySelected) blockers.push('SELECT CONCEPT TERRITORY FOR EXPERIENCE TEST');
  if (!worldExpressionAvailable) blockers.push('World Expression System unavailable for selected territory');
  if (!functionalCanonReady) blockers.push('Functional Canon extraction failed');
  if (!hostCanonReady) blockers.push('Host Experience Canon unavailable');

  let state: ExperienceExpressionReadiness['state'] = 'NOT_READY';
  if (!functionalCanonReady) state = 'BLOCKED_FUNCTIONAL_CANON';
  else if (!hostCanonReady) state = 'BLOCKED_HOST_CANON';
  else if (!conceptTerritorySelected) state = 'WAITING_FOR_CONCEPT_SELECTION';
  else if (blockers.length === 0) state = 'READY_FOR_EXPERIENCE_FORMATION';

  return {
    state,
    brandLoreReady,
    brandPersonalityReady,
    expressionContextReady,
    appetiteAvailable,
    appetiteIncluded,
    conceptTerritorySelected,
    worldExpressionAvailable,
    hostCanonReady,
    functionalCanonReady,
    blockers,
  };
}

export function experienceFormationAllowed(readiness: ExperienceExpressionReadiness): boolean {
  return readiness.state === 'READY_FOR_EXPERIENCE_FORMATION';
}
