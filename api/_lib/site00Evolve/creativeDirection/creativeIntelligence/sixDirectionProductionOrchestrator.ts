/**
 * Orchestrates v1 completion → validation → six-direction proof production.
 */

import {
  completeNdxbookV1Directions,
  mergeCompletionUsage,
} from './directionCompletionService.js';
import {
  NDXBOOK_V1_FORMATION_ID,
  NDXBOOK_V2_FORMATION_ID,
  resolveNdxbookFounderComparisonSet,
} from './founderComparisonSet.js';
import { getFormationRecordById } from './formationStore/storeAdapter.js';
import {
  attachProofAssetsToComparisonSet,
  runSixDirectionProofProduction,
} from './comparisonProofProduction.js';
import { assessDirectionProductionCompleteness } from './directionFieldContract.js';
import type { SixDirectionProductionResult } from './types.js';

export type RunSixDirectionProductionPipelineOptions = {
  completeV1?: boolean;
  dryRun?: boolean;
  includeAllProofTypes?: boolean;
};

export type RunSixDirectionProductionPipelineResult = SixDirectionProductionResult & {
  comparisonSetAttached: boolean;
  allSixComplete: boolean;
  incompleteDirections: string[];
};

export async function runSixDirectionProductionPipeline(
  options: RunSixDirectionProductionPipelineOptions = {},
): Promise<RunSixDirectionProductionPipelineResult> {
  let v1Completion = { anthropicRequestCount: 0, directionsCompleted: 0, tokenUsage: undefined as import('./types.js').ProviderRequestUsage | undefined };

  if (options.completeV1 !== false) {
    try {
      const completion = await completeNdxbookV1Directions();
      v1Completion = {
        anthropicRequestCount: completion.anthropicRequestCount,
        directionsCompleted: completion.directionsCompleted,
        tokenUsage: mergeCompletionUsage(completion.record.directionCompletionOverlays ?? []),
      };
    } catch (e) {
      if ((e as Error).message === 'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE') {
        v1Completion = { anthropicRequestCount: 0, directionsCompleted: 0, tokenUsage: undefined };
      } else {
        throw e;
      }
    }
  }

  const v2 = await getFormationRecordById(NDXBOOK_V2_FORMATION_ID);
  if (!v2) throw new Error('NDXBOOK_V2_FORMATION_NOT_FOUND');

  const comparisonSet = await resolveNdxbookFounderComparisonSet({
    orgSlug: 'ndxbook',
    organizationId: v2.organizationId,
    brandLoreFingerprint: v2.brandLoreFingerprint,
    brandLoreProfileVersion: v2.brandLoreProfileVersion,
    canonicalFormation: v2,
  });

  if (!comparisonSet) throw new Error('COMPARISON_SET_RESOLUTION_FAILED');

  const incompleteDirections = comparisonSet.directions
    .filter((d) => !d.fieldCompleteness.complete)
    .map((d) => d.directionName);

  const allSixComplete = incompleteDirections.length === 0;

  const v1Record = await getFormationRecordById(NDXBOOK_V1_FORMATION_ID);
  const formationInputByFormationId: Record<string, import('./types.js').CoreDirectionFormationInput> = {};
  if (v1Record?.formationInput) formationInputByFormationId[v1Record.formationId] = v1Record.formationInput;
  if (v2.formationInput) formationInputByFormationId[v2.formationId] = v2.formationInput;

  const proofTypes = options.includeAllProofTypes
    ? ([
        'heroWorld',
        'primaryArtifact',
        'materialObject',
        'typographicGraphic',
        'socialExpression',
        'motionSeed',
      ] as const)
    : (['heroWorld', 'primaryArtifact', 'socialExpression'] as const);

  const production = await runSixDirectionProofProduction({
    comparisonSet,
    formationInputByFormationId,
    proofTypes: [...proofTypes],
    dryRun: options.dryRun,
    skipIncompleteDirections: true,
  });

  attachProofAssetsToComparisonSet(comparisonSet);

  return {
    ...production,
    v1Completion,
    comparisonSetAttached: true,
    allSixComplete,
    incompleteDirections,
  };
}

export function validateAllSixProductionComplete(
  directions: Array<{ directionName: string; fieldCompleteness: { complete: boolean } }>,
): { complete: boolean; missing: string[] } {
  const missing = directions.filter((d) => !d.fieldCompleteness.complete).map((d) => d.directionName);
  return { complete: missing.length === 0, missing };
}

export { assessDirectionProductionCompleteness };
