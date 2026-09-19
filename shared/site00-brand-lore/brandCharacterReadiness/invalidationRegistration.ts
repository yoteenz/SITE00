/**
 * P0.5B.2 — Character readiness dependency chain registration.
 */

import { instantiateCanonicalEdge } from '../../site00-studio-world-production/canonicalDependencyEdges.js';
import { registerDependencyEdge } from '../../site00-studio-world-production/invalidationResolver.js';
import type { StudioWorldDependencyGraph } from '../../site00-studio-world-production/dependencyTypes.js';

export function registerBrandCharacterReadinessDependencies(params: {
  graph: StudioWorldDependencyGraph;
  projectId: string;
  readinessRecordId: string;
  characterRunId: string;
}): StudioWorldDependencyGraph {
  let graph = params.graph;

  graph = registerDependencyEdge(
    graph,
    instantiateCanonicalEdge(
      params.projectId,
      {
        upstreamType: 'PROJECT_INTELLIGENCE',
        downstreamType: 'CHARACTER_READINESS',
        invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
        reason: 'Character readiness derives from post-purchase project intelligence',
        changeTypes: ['BRAND_LORE_CHANGE'],
      },
      'project-intelligence',
      params.readinessRecordId,
    ),
  );

  graph = registerDependencyEdge(
    graph,
    instantiateCanonicalEdge(
      params.projectId,
      {
        upstreamType: 'CHARACTER_READINESS',
        downstreamType: 'CHARACTER_DEEPENING',
        invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
        reason: 'Deepening module compiles from readiness gaps',
        changeTypes: ['BRAND_CHARACTER_CHANGE'],
      },
      params.readinessRecordId,
      `${params.readinessRecordId}-deepening`,
    ),
  );

  graph = registerDependencyEdge(
    graph,
    instantiateCanonicalEdge(
      params.projectId,
      {
        upstreamType: 'CHARACTER_DEEPENING',
        downstreamType: 'BRAND_CHARACTER',
        invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
        reason: 'New deepening answers may require territory review — no auto-regeneration',
        changeTypes: ['BRAND_CHARACTER_CHANGE'],
      },
      `${params.readinessRecordId}-deepening`,
      params.characterRunId,
    ),
  );

  return graph;
}

export function characterDeepeningDoesNotAutoRegenerateTerritories(): true {
  return true;
}
