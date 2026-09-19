/**
 * Brand Presentation set orthogonality — deterministic preflight + semantic audit contract.
 */

import { runDeterministicDistinctivenessPreCheck, createSemanticConceptSetAuditContract } from '../../site00-studio-world-production/semanticDistinctiveness.js';
import type { BrandPresentationConceptTerritory, BrandPresentationOrthogonalityEvaluation } from './types.js';

export function runBrandPresentationOrthogonalityEvaluation(
  concepts: BrandPresentationConceptTerritory[],
): BrandPresentationOrthogonalityEvaluation {
  const auditInput = {
    conceptSetId: 'ndxbook-brand-presentation',
    concepts: concepts.map((c) => ({
      conceptId: c.id,
      conceptThesis: c.conceptThesis,
      viewerRole: c.audienceRelationship,
      contentMechanism: c.publishingLogic,
      transformationModel: c.recurrenceEngine,
      artifactLogic: c.artifactLogic,
    })),
  };

  const heuristic = runDeterministicDistinctivenessPreCheck(auditInput);
  const semanticContract = createSemanticConceptSetAuditContract(auditInput, heuristic);

  const names = concepts.map((c) => c.name.toLowerCase());
  const sharedParentHypotheses: string[] = [];
  if (new Set(names).size < names.length) {
    sharedParentHypotheses.push('Duplicate concept names detected');
  }

  const pairwise: number[][] = concepts.map((a, i) =>
    concepts.map((b, j) => {
      if (i === j) return 0;
      const overlap = [a.brandExistenceModel, a.brandBehavior, a.publishingLogic].filter((field) =>
        [b.brandExistenceModel, b.brandBehavior, b.publishingLogic].some((other) =>
          field.toLowerCase().slice(0, 24) === other.toLowerCase().slice(0, 24),
        ),
      ).length;
      return overlap / 3;
    }),
  );

  const maxOverlap = pairwise.flat().reduce((m, v) => Math.max(m, v), 0);
  const collapseRisk =
    maxOverlap > 0.66 ? 'HIGH' : maxOverlap > 0.4 ? 'MEDIUM' : heuristic === 'HEURISTIC_FAIL' ? 'MEDIUM' : 'LOW';

  const setResult =
    heuristic === 'HEURISTIC_FAIL'
      ? 'NEEDS_REFORMATION'
      : semanticContract.semanticAuditResult === 'SEMANTIC_AUDIT_NOT_EVALUATED'
        ? 'NOT_EVALUATED'
        : 'PASS';

  return {
    evaluatedAt: new Date().toISOString(),
    deterministicPreflight: heuristic,
    semanticAuditResult: semanticContract.semanticAuditResult,
    pairwiseOverlapMatrix: pairwise,
    sharedParentHypotheses,
    collapseRisk,
    setResult,
    reformationRecommended: heuristic === 'HEURISTIC_FAIL' || collapseRisk === 'HIGH',
    notes: [
      'Deterministic preflight cannot alone issue final methodology approval',
      'Semantic model audit not executed in correction sprint',
      'Founder judgment required',
    ],
  };
}

export function deterministicOrthogonalityCannotAloneApprove(): true {
  return true;
}
