/**
 * P0.CGO.1 — Concept execution fidelity QA + generic execution detector + revision director.
 */

import type {
  AssetReviewInput,
  ConceptDriftDiagnosis,
  ConceptToExecutionFidelityScore,
  ExecutionWitScore,
  RevisionDirection,
} from './types.js';
import { detectGenericExecution } from './genericExecutionDetector.js';

export function runConceptExecutionFidelityQA(input: AssetReviewInput): ConceptToExecutionFidelityScore {
  const genericIssues = detectGenericExecution(input.assetDescription, input.shotRole);
  const perDimension = scoreDimensions(input, genericIssues);

  const conceptFidelity =
    Object.values(perDimension).reduce((a, b) => a + b, 0) / Object.keys(perDimension).length;

  const visualQuality = input.visualQualityScore;
  const beautifulButGeneric = visualQuality >= 0.85 && conceptFidelity < 0.65;
  const pass =
    !beautifulButGeneric &&
    conceptFidelity >= input.executionBible.qaThresholds.conceptFidelityMin;

  return {
    overall: Math.round(((conceptFidelity + visualQuality) / 2) * 100) / 100,
    visualQuality,
    conceptFidelity: Math.round(conceptFidelity * 100) / 100,
    perDimension,
    pass,
    beautifulButGeneric,
  };
}

function scoreDimensions(
  input: AssetReviewInput,
  genericIssues: string[],
): ConceptToExecutionFidelityScore['perDimension'] {
  const penalty = genericIssues.length * 0.08;
  const base = 0.85 - penalty;
  const isClue = input.shotRole === 'CLUE';

  return {
    CONCEPT_VISIBILITY: genericIssues.includes('COPY_OVEREXPLAINING') ? base - 0.2 : base,
    WORLD_INTEGRATION: genericIssues.includes('ENVIRONMENT_BACKDROP_ONLY') ? 0.45 : base,
    MOTIF_INTELLIGENCE: genericIssues.includes('MOTIFS_ABSENT') ? 0.4 : base,
    HUMAN_SPECIFICITY: genericIssues.includes('MODEL_POSING_WITHOUT_BEHAVIOR') ? 0.5 : base,
    PRODUCT_INTEGRATION: genericIssues.includes('PRODUCT_CENTERED_EVERY_FRAME') ? 0.4 : isClue ? 0.7 : base,
    BEHAVIOR: genericIssues.includes('MODEL_POSING_WITHOUT_BEHAVIOR') ? 0.35 : base,
    SHOT_ORIGINALITY: genericIssues.includes('GENERIC_EDITORIAL_POSES') ? 0.45 : base,
    ANTI_GENERIC_QUALITY: Math.max(0, base - genericIssues.length * 0.1),
  };
}

export function diagnoseConceptDrift(input: {
  conceptSummary: string;
  executionSummary: string;
}): ConceptDriftDiagnosis {
  const exec = input.executionSummary.toLowerCase();
  return {
    conceptSummary: input.conceptSummary,
    executionSummary: input.executionSummary,
    issues: [],
    behaviorRemoved: /posing|portrait|static/i.test(exec) && /gameplay|behavior|action/i.test(input.conceptSummary.toLowerCase()),
    environmentBackdropOnly: /backdrop|background only|generic location/i.test(exec),
    productOverStaged: /centered product|hero product|product forward/i.test(exec),
    motifUnderused: !exec.includes('motif') && input.conceptSummary.toLowerCase().includes('motif'),
  };
}

export function directCreativeRevision(input: {
  diagnosis: ConceptDriftDiagnosis;
  worldConcept: string;
}): RevisionDirection {
  const specific: string[] = [];
  if (input.diagnosis.behaviorRemoved) {
    specific.push('Reduce direct posing. Introduce active hand interaction with the environment.');
  }
  if (input.diagnosis.environmentBackdropOnly) {
    specific.push('Move camera wider. Let environment dominate the frame.');
  }
  if (input.diagnosis.productOverStaged) {
    specific.push('Move product off center. Show partial visibility through gesture.');
  }
  if (input.diagnosis.motifUnderused) {
    specific.push('Repeat the numbered-ball motif in nail detail or environmental object.');
  }
  if (input.diagnosis.productOverStaged) {
    specific.push('Remove the second location. Keep the camera locked. Make the product appear through the subject\'s action rather than a presentation pose.');
  }
  if (input.diagnosis.environmentBackdropOnly) {
    specific.push('Let the world motif generate the title. Move camera wider so environment dominates.');
  }
  if (specific.length === 0) {
    specific.push('Increase behavior specificity. Reduce generic editorial polish.');
  }

  return {
    summary: `Revise to restore concept: ${input.worldConcept}`,
    specificDirections: specific,
    preserve: ['Visual quality', 'Color palette from world bible'],
    reduce: ['Direct posing', 'Product centering', 'Studio sterility'],
    introduce: ['Active gesture', 'Motif variation', 'Environmental dominance in clue frames'],
  };
}

export function computeExecutionWitScore(input: {
  motifCount: number;
  behaviorPresent: boolean;
  surprisePresent: boolean;
  lateralConnection: boolean;
  conceptualEfficiency?: number;
  worldNativeCopy?: boolean;
  reductionApplied?: boolean;
}): ExecutionWitScore {
  let score = 0.5;
  if (input.lateralConnection) score += 0.15;
  if (input.behaviorPresent) score += 0.15;
  if (input.motifCount >= 2) score += 0.1;
  if (input.surprisePresent) score += 0.1;
  if ((input.conceptualEfficiency ?? 0) >= 0.7) score += 0.08;
  if (input.worldNativeCopy) score += 0.05;
  if (input.reductionApplied) score += 0.05;
  return {
    lateralConnection: input.lateralConnection ? 0.85 : 0.4,
    visualPayoff: input.surprisePresent ? 0.8 : 0.5,
    motifUsage: Math.min(1, input.motifCount * 0.35),
    humanIntegration: input.behaviorPresent ? 0.85 : 0.35,
    surprise: input.surprisePresent ? 0.8 : 0.3,
    nonObviousness: input.lateralConnection ? 0.85 : 0.4,
    coherence: 0.75,
    overall: Math.min(1, Math.round(score * 100) / 100),
  };
}
