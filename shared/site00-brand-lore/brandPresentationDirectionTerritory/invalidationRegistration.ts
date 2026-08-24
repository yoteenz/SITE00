/**
 * P0.5A dependency registration for Brand Presentation Direction layer.
 */

import { instantiateCanonicalEdge } from '../../site00-studio-world-production/canonicalDependencyEdges.js';
import { registerDependencyEdge } from '../../site00-studio-world-production/invalidationResolver.js';
import type { StudioWorldDependencyGraph } from '../../site00-studio-world-production/dependencyTypes.js';

export function registerBrandPresentationDirectionDependencies(params: {
  graph: StudioWorldDependencyGraph;
  projectId: string;
  parentConceptId: string;
  directionRunId: string;
}): StudioWorldDependencyGraph {
  return registerDependencyEdge(
    params.graph,
    instantiateCanonicalEdge(params.projectId, {
      upstreamType: 'DIRECTION',
      downstreamType: 'DESIGN_PROOF',
      invalidationPolicy: 'BLOCK_DOWNSTREAM_EXECUTION',
      reason: `Brand presentation direction ${params.directionRunId} parent ${params.parentConceptId} — visual formulation blocked until founder review`,
      changeTypes: ['APPROVED_DESIGN_PROOF_REVISION'],
    }),
    params.parentConceptId,
    params.directionRunId,
  );
}

export function parentConceptChangeRequiresDirectionSupersede(): 'SUPERSEDE_REQUIRED' {
  return 'SUPERSEDE_REQUIRED';
}

export function loveDirectionDoesNotCreateBrandCanon(): true {
  return true;
}

export function loveDirectionDoesNotTriggerFal(): true {
  return true;
}

export function visualFormulationBlockedUntilFounderReview(): true {
  return true;
}
