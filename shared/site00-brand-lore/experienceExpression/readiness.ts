/**
 * Experiment E — Experience Expression readiness gate.
 */

import type { BrandLoreProfile } from '../types.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import { shouldIncludeCreativeAppetiteInFormation } from '../founderCreativeAppetite/experimentExclusion.js';
import { EXPERIMENT_E_RUN_ID, EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION } from './constants.js';
import { crossMediumEvidenceStatus, type CrossMediumConceptEvidence } from './crossMediumConceptEvidence.js';
import type { ExperimentEIntelligenceSnapshot } from './experienceExpressionSnapshot.js';
import type { ExperienceExpressionReadiness, ExperienceFunctionalCanon, HostExperienceCanon } from './types.js';

export function assessExperienceExpressionReadiness(params: {
  profile: BrandLoreProfile | null;
  territory: CreativeConceptTerritory | null;
  world: WorldExpressionSystem | null;
  functionalCanon: ExperienceFunctionalCanon | null;
  hostCanon: HostExperienceCanon | null;
  experimentSnapshot: ExperimentEIntelligenceSnapshot | null;
  crossMediumEvidence: CrossMediumConceptEvidence[];
  /** Legacy — optional explicit promotion, not required for formation. */
  experienceTestTerritoryId?: string | null;
}): ExperienceExpressionReadiness {
  const {
    profile,
    territory,
    world,
    functionalCanon,
    hostCanon,
    experimentSnapshot,
    crossMediumEvidence = [],
    experienceTestTerritoryId,
  } = params;

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
  const worldExpressionAvailable = Boolean(world) || crossMediumEvidence.some((e) => e.worldExpressionSystemId);
  const hostCanonReady = Boolean(hostCanon);
  const functionalCanonReady = Boolean(functionalCanon);
  const snapshotCompiled = Boolean(experimentSnapshot?.fingerprint);
  const cmStatus = crossMediumEvidenceStatus(crossMediumEvidence);

  const blockers: string[] = [];
  if (!brandLoreReady) blockers.push('Brand Lore not ready');
  if (!brandPersonalityReady) blockers.push('Brand Personality not ready');
  if (!expressionContextReady) blockers.push('Primary Expression Context not ready');
  if (!functionalCanonReady) blockers.push('Functional Canon extraction failed');
  if (!hostCanonReady) blockers.push('Host Experience Canon unavailable');
  if (!snapshotCompiled) blockers.push('Experiment E intelligence snapshot not compiled');

  let state: ExperienceExpressionReadiness['state'] = 'NOT_READY';
  if (!functionalCanonReady) state = 'BLOCKED_FUNCTIONAL_CANON';
  else if (!hostCanonReady) state = 'BLOCKED_HOST_CANON';
  else if (!snapshotCompiled) state = 'WAITING_FOR_SNAPSHOT';
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
    snapshotCompiled,
    crossMediumEvidenceStatus: cmStatus,
    blockers,
  };
}

export function experienceFormationAllowed(readiness: ExperienceExpressionReadiness): boolean {
  return readiness.state === 'READY_FOR_EXPERIENCE_FORMATION';
}
