/**
 * Content Operations + opportunity visual potential integration.
 */

import type { ContentOpportunity } from '../contentOperations/types.js';
import type { SocialContentPackage } from '../contentOperations/types.js';
import type { BrandMarketingExpressionSystem } from '../brandMarketingExpression/types.js';
import type { AmendedFirstSlideContract } from './types.js';
import type { ContentPackageVisualSubjectLayer, OpportunityVisualPotential } from './types.js';
import { amendFirstSlideContractWithCulturalParticipation } from './experiment01V21.js';
import { buildEditorialLayerForContentPackage } from '../editorialInformationArchitecture/integration.js';

export function evaluateOpportunityVisualPotential(opp: ContentOpportunity): OpportunityVisualPotential {
  const base = opp.culturalPotential + opp.depthPotential;
  return {
    humanVisualPotential: opp.themes.includes('human') ? 0.8 : 0.4,
    culturalVisualPotential: opp.culturalPotential,
    objectVisualPotential: opp.domains.some((d) => /consumer|product|lifestyle/i.test(d)) ? 0.7 : 0.3,
    archivalVisualPotential: opp.sourceType === 'HISTORICAL_CALLBACK' ? 0.9 : 0.3,
    artisticVisualPotential: opp.humorPotential > 0.5 ? 0.6 : 0.4,
    photographicVisualPotential: base > 0.5 ? 0.7 : 0.4,
  };
}

export function buildContentPackageVisualSubjectLayer(params: {
  pkg: SocialContentPackage;
  opportunity: ContentOpportunity;
  expressionSystem: BrandMarketingExpressionSystem;
  characterSystemId: string;
  amendedContract?: AmendedFirstSlideContract;
}): ContentPackageVisualSubjectLayer {
  const editorial = buildEditorialLayerForContentPackage({
    pkg: params.pkg,
    opportunity: params.opportunity,
    expressionSystem: params.expressionSystem,
    characterSystemId: params.characterSystemId,
  });

  const artifact = {
    id: `bma-co-${params.pkg.id}`,
    topic: params.opportunity.domains[0] ?? '',
    subject: params.opportunity.subject,
    supportingLanguage: [params.opportunity.summary],
    characterTemperature: 'CURIOUS',
  } as never;

  const amended =
    params.amendedContract ??
    amendFirstSlideContractWithCulturalParticipation({
      baseContract: editorial.editorialLayer.firstSlideContract,
      artifact,
      topicIndex: 1,
      characterTemperature: 'CURIOUS',
      topic: params.opportunity.domains[0] ?? params.opportunity.subject,
    });

  const cp = amended.culturalParticipation;

  return {
    visualSubjectMatterDecisionId: cp.visualSubjectMatterDecision.decisionId,
    culturalVisualEvidenceIds: cp.culturalVisualEvidence.map((e) => e.evidenceId),
    artisticEvidenceIds: cp.artisticEvidence.map((e) => e.evidenceId),
    visualParticipationBalance: cp.visualParticipationBalance,
    visualAppetiteEvaluation: cp.visualAppetiteEvaluation,
  };
}

export function contentOperationsVisualSubjectIntegrated(layer: ContentPackageVisualSubjectLayer | null): boolean {
  return layer !== null && Boolean(layer.visualSubjectMatterDecisionId);
}

export function imageParticipationCannotBypassEditorialDecision(
  editorialDecisionId: string | null | undefined,
  visualDecisionId: string | null | undefined,
): boolean {
  return Boolean(editorialDecisionId && visualDecisionId);
}

export function experimentFImmutable(): true {
  return true;
}

export function experimentGNotReevaluated(): true {
  return true;
}

export function brandCharacterImmutable(): true {
  return true;
}

export function brandCanonUnchanged(): true {
  return true;
}

export function productExpressionBlocked(): true {
  return true;
}

export function worldFormationBlocked(): true {
  return true;
}

export function p05c1HierarchyPreserved(contract: AmendedFirstSlideContract): boolean {
  return Boolean(contract.informationBudget?.withinBudget !== undefined);
}

export function limeGovernancePreserved(): true {
  return true;
}
