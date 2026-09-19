/**
 * Hybrid semantic distinctiveness architecture — deterministic pre-filter + model audit + founder review.
 */

import { P0_5A_METHODOLOGY_VERSION } from './constants.js';

export const DISTINCTIVENESS_AUDIT_STAGES = [
  'DETERMINISTIC_PRE_CHECK',
  'MODEL_BASED_SET_AUDIT',
  'FOUNDER_REVIEW',
] as const;

export type DistinctivenessAuditStage = (typeof DISTINCTIVENESS_AUDIT_STAGES)[number];

export const HEURISTIC_DISTINCTIVENESS_RESULTS = [
  'HEURISTIC_PASS',
  'HEURISTIC_FAIL',
  'HEURISTIC_NOT_EVALUATED',
] as const;

export type HeuristicDistinctivenessResult = (typeof HEURISTIC_DISTINCTIVENESS_RESULTS)[number];

export const SEMANTIC_AUDIT_RESULTS = [
  'SEMANTIC_AUDIT_PASS',
  'SEMANTIC_AUDIT_FAIL',
  'SEMANTIC_AUDIT_NOT_EVALUATED',
] as const;

export type SemanticAuditResult = (typeof SEMANTIC_AUDIT_RESULTS)[number];

export type SemanticConceptSetAuditInput = {
  conceptSetId: string;
  concepts: Array<{
    conceptId: string;
    parentConceptId?: string | null;
    conceptThesis: string;
    viewerRole: string;
    contentMechanism: string;
    transformationModel?: string;
    artifactLogic?: string;
  }>;
};

export type SemanticConceptSetAudit = {
  auditId: string;
  conceptSetId: string;
  stage: DistinctivenessAuditStage;
  heuristicResult: HeuristicDistinctivenessResult;
  semanticAuditResult: SemanticAuditResult;
  founderReviewRequired: true;
  liveSonnetAuditExecuted: false;
  dimensions: Array<{
    dimension: string;
    evaluated: boolean;
    note: string;
  }>;
  artificialDiversityRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'NOT_EVALUATED';
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
  evaluatedAt: string;
};

const SEMANTIC_DIMENSIONS = [
  'shared parent concept',
  'conceptual ancestry',
  'direction-level clustering',
  'viewer-role overlap',
  'content-mechanism overlap',
  'artifact-logic overlap',
  'transformation-model overlap',
  'artificial diversity',
];

export function runDeterministicDistinctivenessPreCheck(
  input: SemanticConceptSetAuditInput,
): HeuristicDistinctivenessResult {
  if (input.concepts.length < 2) return 'HEURISTIC_NOT_EVALUATED';

  const theses = input.concepts.map((c) => c.conceptThesis.toLowerCase().trim());
  const uniqueTheses = new Set(theses);
  if (uniqueTheses.size < theses.length) return 'HEURISTIC_FAIL';

  const viewerRoles = input.concepts.map((c) => c.viewerRole.toLowerCase().trim());
  if (new Set(viewerRoles).size === 1 && input.concepts.length > 2) {
    return 'HEURISTIC_FAIL';
  }

  return 'HEURISTIC_PASS';
}

export function createSemanticConceptSetAuditContract(
  input: SemanticConceptSetAuditInput,
  heuristicResult: HeuristicDistinctivenessResult,
): SemanticConceptSetAudit {
  return {
    auditId: `semantic-audit-${input.conceptSetId}`,
    conceptSetId: input.conceptSetId,
    stage: heuristicResult === 'HEURISTIC_PASS' ? 'MODEL_BASED_SET_AUDIT' : 'DETERMINISTIC_PRE_CHECK',
    heuristicResult,
    semanticAuditResult: 'SEMANTIC_AUDIT_NOT_EVALUATED',
    founderReviewRequired: true,
    liveSonnetAuditExecuted: false,
    dimensions: SEMANTIC_DIMENSIONS.map((dimension) => ({
      dimension,
      evaluated: false,
      note: 'Model-based audit not executed in P0.5A',
    })),
    artificialDiversityRisk: 'NOT_EVALUATED',
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
    evaluatedAt: new Date().toISOString(),
  };
}

export function experimentFDistinctivenessCanCarryHeuristicPass(audit: SemanticConceptSetAudit): boolean {
  return (
    audit.heuristicResult === 'HEURISTIC_PASS' &&
    audit.semanticAuditResult === 'SEMANTIC_AUDIT_NOT_EVALUATED'
  );
}

export function hybridDistinctivenessArchitectureReady(): true {
  return true;
}

export function liveSonnetAuditNotExecutedInP05A(): false {
  return false;
}
