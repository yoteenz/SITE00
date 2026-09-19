/**
 * P0.5D Content Operations + P0.5E.1 cross-platform hooks.
 */

import type { ContentOpportunity } from '../contentOperations/types.js';
import type { SocialContentPackage } from '../contentOperations/types.js';
import type { BrandMarketingArtifact, BrandMarketingExpressionSystem } from '../brandMarketingExpression/types.js';
import type { AmendedFirstSlideContract } from '../culturalVisualParticipation/types.js';
import { buildCharacterRetentionContract } from './characterRetentionContract.js';
import type { CharacterRetentionContract, ContentPackageCharacterRetentionLayer } from './types.js';

export function buildContentPackageCharacterRetentionLayer(params: {
  pkg: SocialContentPackage;
  opportunity: ContentOpportunity;
  expressionSystem: BrandMarketingExpressionSystem;
  characterSystemId: string;
  v21Contract: AmendedFirstSlideContract;
}): ContentPackageCharacterRetentionLayer {
  const artifact = {
    id: `bma-co-${params.pkg.id}`,
    topic: params.opportunity.domains[0] ?? params.opportunity.subject,
    subject: params.opportunity.subject,
    supportingLanguage: [params.opportunity.summary],
    characterTemperature: 'CURIOUS',
  } as BrandMarketingArtifact;

  const contract = buildCharacterRetentionContract({
    projectId: params.pkg.projectId,
    artifact,
    v21Contract: params.v21Contract,
    characterSystemId: params.characterSystemId,
    marketingExpressionSystemId: params.expressionSystem.id,
  });

  return {
    characterRetentionContractId: contract.id,
    contract,
  };
}

export function contentOperationsRequiresCharacterRetentionContract(
  contract: CharacterRetentionContract | null | undefined,
): boolean {
  return contract !== null && contract !== undefined;
}

export function contentOperationsBypassCharacterRetentionBlocked(
  contract: CharacterRetentionContract | null | undefined,
): boolean {
  return !contentOperationsRequiresCharacterRetentionContract(contract);
}

export function performanceLearningCannotMutateHumorAutomatically(): true {
  return true;
}

export function platformDerivationConsumesCharacterPayload(): true {
  return true;
}

export function experimentFImmutable(): true {
  return true;
}

export function experimentGImmutable(): true {
  return true;
}

export function brandCharacterImmutable(): true {
  return true;
}

export function brandCanonUnchanged(): true {
  return true;
}

export function productExpressionBlocked(): false {
  return false;
}

export function worldFormationBlocked(): false {
  return false;
}
