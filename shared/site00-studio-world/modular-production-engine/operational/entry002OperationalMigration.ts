/**
 * Entry 002 — map existing authorities into operational layers (no provider spend).
 */

import { buildEntry002ProductionCastState } from '../../acting-catalogue/entry002RetroactiveMapping.js';
import { upgradeLegacyCastingRequirement } from './castingRequirementOperational.js';
import { deriveCastingRequirementsFromNarrativePlan } from '../../acting-catalogue/deriveCastingRequirements.js';
import { compileEntry002RetroactiveNarrativeMomentum } from '../../../site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';

export type Entry002OperationalMigrationReceipt = {
  subjectActorCatalogueNumber: 'SW-017';
  actorLifecycle: 'ACTIVE_ACTOR';
  temporalLookCount: number;
  characterLookAuthoritiesMapped: number;
  providerDispatchCount: 0;
  castingRequirementsOperational: number;
};

export function entry002OperationalMigration(): Entry002OperationalMigrationReceipt {
  const plan = compileEntry002RetroactiveNarrativeMomentum();
  const legacyReqs = deriveCastingRequirementsFromNarrativePlan(plan);
  const operational = legacyReqs.map((r) =>
    upgradeLegacyCastingRequirement(r, {
      projectId: plan.projectId,
      campaignId: 'entry-002-campaign',
      entryId: plan.entryId,
    }),
  );
  const castState = buildEntry002ProductionCastState();
  return {
    subjectActorCatalogueNumber: 'SW-017',
    actorLifecycle: 'ACTIVE_ACTOR',
    temporalLookCount: castState.temporalLooks.length,
    characterLookAuthoritiesMapped: castState.authoritySheets.length,
    providerDispatchCount: 0,
    castingRequirementsOperational: operational.length,
  };
}
