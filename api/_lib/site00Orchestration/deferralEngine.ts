import type {
  DeferralImpact,
  ManifestRequirementRow,
  RequirementClassification,
  RequirementDependencyRow,
} from './types.js';
import { getDownstreamRequirements } from './dependencyGraph.js';

export function calculateDeferralImpact(
  requirement: ManifestRequirementRow,
  allRequirements: ManifestRequirementRow[],
  dependencies: RequirementDependencyRow[],
): DeferralImpact {
  const downstream = getDownstreamRequirements(requirement.id, dependencies);
  const byId = new Map(allRequirements.map((r) => [r.id, r]));

  const dependentRequirements = downstream
    .map((id) => byId.get(id)?.title)
    .filter(Boolean) as string[];

  const launchImpact =
    requirement.classification === 'REQUIRED_FOR_LAUNCH' ||
    requirement.classification === 'REQUIRED_FOR_MILESTONE'
      ? ('NON_BLOCKING' as const)
      : ('NON_BLOCKING' as const);

  let operationalWarning: string | null = null;
  if (dependentRequirements.length > 0) {
    operationalWarning = `Deferring "${requirement.title}" may affect ${dependentRequirements.length} downstream requirement(s). Review dependency chain before committing.`;
  }

  return {
    dependenciesAffected: downstream.map((id) => byId.get(id)?.requirement_key ?? id),
    launchImpact,
    dependentRequirements,
    operationalWarning,
    suggestedDestination: 'EVOLVE / POST-LAUNCH',
  };
}

export type DeferralRecord = {
  requirementId: string;
  manifestId: string;
  deferredByEmail: string;
  reason: string;
  originalClassification: RequirementClassification;
  newClassification: RequirementClassification;
  destinationMilestone: string;
  impactSnapshot: DeferralImpact;
};

export function buildDeferralRecord(
  requirement: ManifestRequirementRow,
  manifestId: string,
  deferredByEmail: string,
  reason: string,
  impact: DeferralImpact,
): DeferralRecord {
  return {
    requirementId: requirement.id,
    manifestId,
    deferredByEmail,
    reason,
    originalClassification: requirement.classification,
    newClassification: 'DEFERRED_BY_OWNER',
    destinationMilestone: impact.suggestedDestination,
    impactSnapshot: impact,
  };
}
