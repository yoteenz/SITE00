/**
 * Experience Implementation Evaluation — intended vs implemented (architecture only).
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
] as const;

export function evaluateExperienceImplementation(params: {
  contract: ExperienceImplementationContract | null;
  renderedEvidence?: Record<string, unknown> | null;
  surfaceMetadata?: Record<string, unknown> | null;
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

  return {
    evaluatedAt: new Date().toISOString(),
    overallResult: 'NOT_EVALUATED',
    dimensions: EVAL_DIMENSIONS.map((dimension) => ({
      dimension,
      result: 'NOT_EVALUATED',
      notes: ['Evaluator scaffold ready — autonomous code mutation disabled'],
    })),
  };
}

export function implementationEvaluationNotEvaluatedBehavior(
  evaluation: ExperienceImplementationEvaluation,
): boolean {
  if (evaluation.overallResult === 'NOT_EVALUATED') return true;
  return evaluation.dimensions.every((d) => d.result === 'NOT_EVALUATED' || d.result !== 'FAIL');
}
