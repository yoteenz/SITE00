/** Visual DNA contract schema — promotion gate requires APPROVED lifecycle */

import type { CreativeTerritory, FounderDecision, HybridSelection, VisualDnaContract } from './types.js';

export function emptyVisualDnaContract(): VisualDnaContract {
  return {
    status: 'INCOMPLETE',
    brandMark: {},
    color: {},
    typography: {},
    composition: {},
    graphicLanguage: {},
    imagery: {},
    contentArchitecture: {},
    motion: {},
    channelAdaptation: {},
    aiGeneration: {},
    provenance: {},
  };
}

export function buildProposedVisualDnaFromTerritory(
  territory: CreativeTerritory,
  hybridSelections: HybridSelection[],
  approvedBy: string,
): VisualDnaContract {
  const hybrids = hybridSelections.filter((h) => h.territoryId !== territory.id);
  return {
    status: 'PROPOSED',
    brandMark: {
      publicDisplay: 'NDXBOOK',
      uiCopy: 'ndxbook',
      wordmarkTreatment: territory.typographyLogic.display,
      lockups: 'TBD — founder review',
    },
    color: territory.colorLogic,
    typography: territory.typographyLogic,
    composition: {
      behavior: territory.compositionBehavior,
      hierarchy: territory.informationHierarchy,
    },
    graphicLanguage: {
      elements: territory.graphicLanguage,
      principles: territory.visualPrinciples,
    },
    imagery: { language: territory.imageLanguage },
    contentArchitecture: {
      pageSystem: territory.socialBehavior,
      volumeBehavior: territory.crossVolumeBehavior,
    },
    motion: { behavior: territory.motionBehavior },
    channelAdaptation: {
      instagram: 'PRIMARY_PILOT — 9:16 page specimen',
      otherPlatforms: 'LOCKED_DURING_INITIAL_PILOT',
    },
    aiGeneration: {
      canonicalIngredients: [territory.thesis, ...territory.visualPrinciples.slice(0, 3)],
      negativeConstraints: ['childish', 'preachy', 'luxury editorial', 'generic explainer'],
      consistencyAnchors: [territory.name, territory.colorLogic.primary ?? ''],
    },
    provenance: {
      originatingTerritoryId: territory.id,
      originatingTerritoryName: territory.name,
      hybridContributions: hybrids,
      approvedBy,
      approvedAt: new Date().toISOString(),
      lifecycle: 'PROPOSED',
    },
  };
}

export function promoteVisualDnaToApproved(
  contract: VisualDnaContract,
  decision: FounderDecision,
): VisualDnaContract {
  return {
    ...contract,
    status: 'APPROVED',
    provenance: {
      ...contract.provenance,
      founderDecision: decision.type,
      approvedAt: decision.at,
      approvedBy: decision.by,
      lifecycle: 'APPROVED',
    },
  };
}
