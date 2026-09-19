/**
 * Experience Implementation Evaluation — intended vs implemented including asset system.
 */

import type { ExperienceImplementationContract, ExperienceImplementationEvaluation } from './types.js';

const EVAL_DIMENSIONS = [
  'CONCEPT_FIDELITY',
  'WORLD_FIDELITY',
  'HOST_FIDELITY',
  'CLIENT_FIDELITY',
  'FUNCTIONAL_FIDELITY',
  'INFORMATION_HIERARCHY',
  'INTERACTION_GRAMMAR',
  'TYPOGRAPHY_BEHAVIOR',
  'COLOR_BEHAVIOR',
  'SPATIAL_COMPOSITION',
  'RESPONSIVE_TRANSLATION',
  'GENERIC_TEMPLATE_RESEMBLANCE',
  'ACCESSIBILITY_RISK',
  'ASSET_ROLE_FIDELITY',
  'ASSET_INTEGRATION_FIDELITY',
  'MISSING_ASSET_SUBSTITUTION',
  'RESPONSIVE_ASSET_FIDELITY',
] as const;

export function evaluateExperienceImplementation(params: {
  contract: ExperienceImplementationContract | null;
  renderedEvidence?: Record<string, unknown> | null;
  surfaceMetadata?: Record<string, unknown> | null;
  assetIntegrationEvidence?: Record<string, unknown> | null;
}): ExperienceImplementationEvaluation {
  if (!params.contract || !params.renderedEvidence) {
    return {
      evaluatedAt: new Date().toISOString(),
      overallResult: 'NOT_EVALUATED',
      dimensions: EVAL_DIMENSIONS.map((dimension) => ({
        dimension,
        result: 'NOT_EVALUATED',
        notes: ['No rendered implementation evidence supplied — never false-fail'],
      })),
    };
  }

  const notes: string[] = ['Evaluator scaffold ready — autonomous code mutation disabled'];
  if (params.contract.implementationStatus === 'IMPLEMENTATION_BLOCKED_MISSING_ASSET') {
    notes.push(`Missing required assets: ${params.contract.missingRequiredAssets.join('; ')}`);
  }

  return {
    evaluatedAt: new Date().toISOString(),
    overallResult: 'NOT_EVALUATED',
    dimensions: EVAL_DIMENSIONS.map((dimension) => ({
      dimension,
      result: 'NOT_EVALUATED',
      notes,
    })),
  };
}

export function implementationEvaluationNotEvaluatedBehavior(
  evaluation: ExperienceImplementationEvaluation,
): boolean {
  if (evaluation.overallResult === 'NOT_EVALUATED') return true;
  return evaluation.dimensions.every((d) => d.result === 'NOT_EVALUATED' || d.result !== 'FAIL');
}

export function assetFidelityDimensionsPresent(evaluation: ExperienceImplementationEvaluation): boolean {
  return evaluation.dimensions.some((d) => d.dimension === 'ASSET_ROLE_FIDELITY');
}
