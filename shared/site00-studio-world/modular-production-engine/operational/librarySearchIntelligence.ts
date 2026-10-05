/**
 * Reuse / reskin intelligence before billable net-new creation.
 */

import type { GenerationEconomics } from '../monetization.js';
import { searchCatalogueBeforeNewActor } from './roleFirstCasting.js';
import type { CastingRequirement } from '../../acting-catalogue/types.js';

export type ReusePathSuggestion = {
  economics: GenerationEconomics;
  assetKind: string;
  assetId: string | null;
  rationale: string;
};

export function suggestReuseBeforeNetNew(args: {
  castingRequirement: CastingRequirement | null;
  projectId: string;
  brand: string;
  creativeTerritory: string;
  nearFitSetExists: boolean;
  nearFitWardrobeExists: boolean;
}): ReusePathSuggestion[] {
  const paths: ReusePathSuggestion[] = [];
  if (args.castingRequirement) {
    const search = searchCatalogueBeforeNewActor({
      requirement: args.castingRequirement,
      projectId: args.projectId,
      brand: args.brand,
      creativeTerritory: args.creativeTerritory,
    });
    if (search.outcome !== 'NO_SUITABLE_MATCH') {
      paths.push({
        economics: 'REUSE_EXISTING',
        assetKind: 'ACTOR',
        assetId: search.matchedActorIds[0] ?? search.possibleActorIds[0] ?? null,
        rationale: search.rationale,
      });
    }
  }
  if (args.nearFitSetExists) {
    paths.push({
      economics: 'RESKIN_EXISTING',
      assetKind: 'SET',
      assetId: null,
      rationale: 'Near-fit set — reskin signage/palette before net-new geometry',
    });
  }
  if (args.nearFitWardrobeExists) {
    paths.push({
      economics: 'REUSE_EXISTING',
      assetKind: 'WARDROBE',
      assetId: null,
      rationale: 'Wardrobe pull from catalogue before custom creation',
    });
  }
  if (paths.length === 0) {
    paths.push({
      economics: 'GENERATE_NET_NEW',
      assetKind: 'UNSPECIFIED',
      assetId: null,
      rationale: 'No reuse path — net-new requires entitlement check',
    });
  }
  return paths;
}
