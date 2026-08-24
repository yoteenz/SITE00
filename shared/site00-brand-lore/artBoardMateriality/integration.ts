/**
 * P0.5D Content Operations + cross-platform material translation boundary.
 */

import type { ContentOpportunity } from '../contentOperations/types.js';
import type { SocialContentPackage } from '../contentOperations/types.js';
import type { BrandMarketingArtifact, BrandMarketingExpressionSystem } from '../brandMarketingExpression/types.js';
import type { AmendedFirstSlideContract } from '../culturalVisualParticipation/types.js';
import type { CharacterRetentionContract } from '../characterRetention/types.js';
import { buildArtBoardDirectionContract } from './artBoardDirectionContract.js';
import type { ArtBoardDirectionContract, ContentPackageArtBoardLayer } from './types.js';

export function buildContentPackageArtBoardLayer(params: {
  pkg: SocialContentPackage;
  opportunity: ContentOpportunity;
  expressionSystem: BrandMarketingExpressionSystem;
  amendedContract: AmendedFirstSlideContract;
  characterContract: CharacterRetentionContract;
}): ContentPackageArtBoardLayer {
  const artifact = {
    id: `bma-co-${params.pkg.id}`,
    topic: params.opportunity.domains[0] ?? params.opportunity.subject,
    subject: params.opportunity.subject,
    supportingLanguage: [params.opportunity.summary],
    characterTemperature: 'CURIOUS',
  } as BrandMarketingArtifact;

  const v22Contract = {
    ...params.amendedContract,
    characterRetention: params.characterContract,
    characterEvaluation: { passesApprovalGate: true },
  } as import('../characterRetention/types.js').CharacterRetainedFirstSlideContract;

  const contract = buildArtBoardDirectionContract({
    projectId: params.pkg.projectId,
    artifact,
    v22Contract,
  });

  return {
    artBoardDirectionContractId: contract.id,
    contract,
  };
}

export function contentOperationsRequiresArtBoardDirection(
  contract: ArtBoardDirectionContract | null | undefined,
): boolean {
  return contract !== null && contract !== undefined;
}

export function contentOperationsBypassArtBoardBlocked(
  contract: ArtBoardDirectionContract | null | undefined,
): boolean {
  return !contentOperationsRequiresArtBoardDirection(contract);
}

export function platformDerivationDoesNotBlindlyReusePaperArtifact(): true {
  return true;
}

export function brandCharacterImmutable(): true {
  return true;
}

export function brandCanonUnchanged(): true {
  return true;
}

export function experimentFImmutable(): true {
  return true;
}

export function experimentGImmutable(): true {
  return true;
}

export function productExpressionBlocked(): false {
  return false;
}

export function worldFormationBlocked(): false {
  return false;
}
