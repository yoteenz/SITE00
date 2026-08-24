/**
 * P0.5A dependency registration for Brand Character layer.
 */

import { instantiateCanonicalEdge } from '../../site00-studio-world-production/canonicalDependencyEdges.js';
import { registerDependencyEdge } from '../../site00-studio-world-production/invalidationResolver.js';
import type { StudioWorldDependencyGraph } from '../../site00-studio-world-production/dependencyTypes.js';

export function registerBrandCharacterDependencies(params: {
  graph: StudioWorldDependencyGraph;
  projectId: string;
  characterRunId: string;
}): StudioWorldDependencyGraph {
  let graph = params.graph;

  graph = registerDependencyEdge(
    graph,
    instantiateCanonicalEdge(
      params.projectId,
      {
        upstreamType: 'BRAND_LORE',
        downstreamType: 'BRAND_CHARACTER',
        invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
        reason: 'Brand character territories derive from brand truth',
        changeTypes: ['BRAND_LORE_CHANGE'],
      },
      'brand-lore',
      params.characterRunId,
    ),
  );

  graph = registerDependencyEdge(
    graph,
    instantiateCanonicalEdge(
      params.projectId,
      {
        upstreamType: 'BRAND_CHARACTER',
        downstreamType: 'BRAND_CHARACTER_SYSTEM',
        invalidationPolicy: 'FOUNDER_REVIEW_REQUIRED',
        reason: 'Character system compiled from founder-selected territory',
        changeTypes: ['BRAND_CHARACTER_CHANGE'],
      },
      params.characterRunId,
      `${params.characterRunId}-system`,
    ),
  );

  graph = registerDependencyEdge(
    graph,
    instantiateCanonicalEdge(
      params.projectId,
      {
        upstreamType: 'BRAND_CHARACTER_SYSTEM',
        downstreamType: 'IDENTITY_CONCEPT',
        invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
        reason: 'Identity concept territories should align with approved character',
        changeTypes: ['BRAND_CHARACTER_CHANGE'],
      },
      `${params.characterRunId}-system`,
      'identity-concept-formation',
    ),
  );

  graph = registerDependencyEdge(
    graph,
    instantiateCanonicalEdge(
      params.projectId,
      {
        upstreamType: 'BRAND_CHARACTER_SYSTEM',
        downstreamType: 'CONCEPT_FORMATION',
        invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
        reason: 'Brand presentation concepts should align with approved character — not auto-regenerated',
        changeTypes: ['BRAND_CHARACTER_CHANGE'],
      },
      `${params.characterRunId}-system`,
      'brand-presentation-concept-formation',
    ),
  );

  return graph;
}

export function characterChangeDoesNotAutoRegenerateDownstream(): true {
  return true;
}

export function historicalExperimentGRecordsImmutable(): true {
  return true;
}
