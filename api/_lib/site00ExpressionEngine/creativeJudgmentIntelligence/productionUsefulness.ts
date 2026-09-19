/**
 * ProductionUsefulnessScore
 */

import type {
  CreativeJudgmentInput,
  ProductionUsefulnessScore,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

export function scoreProductionUsefulness(input: CreativeJudgmentInput): ProductionUsefulnessScore {
  const specifiesWorld = input.territory.visualWorld.length > 10;
  const specifiesRoles = Boolean(input.ndxRole || input.subjectRole || input.worldRole);
  const specifiesArtifact = Boolean(input.artifactRole);
  const specifiesSequence = Boolean(input.channelRoleMap && input.channelRoleMap.entries.length >= 2);
  const specifiesChannelJobs = Boolean(input.channelRoleMap?.allRolesDistinct);
  const overSpecifiedEarly = false;

  let score = 40;
  if (specifiesWorld) score += 15;
  if (specifiesRoles) score += 15;
  if (specifiesArtifact) score += 10;
  if (specifiesSequence) score += 10;
  if (specifiesChannelJobs) score += 10;

  return {
    score: Math.min(100, score),
    specifiesWorld,
    specifiesRoles,
    specifiesArtifact,
    specifiesSequence,
    specifiesChannelJobs,
    overSpecifiedEarly,
    rationale: score >= 75 ? 'Real team can produce from world/roles/sequence' : 'Missing production scaffolding',
  };
}
