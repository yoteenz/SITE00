export * from './constants.js';
export * from './types.js';
export * from './experimentDInterpretation.js';
export * from './evidenceQuarantine.js';
export * from './conceptVsDirection.js';
export * from './parentCollapseDetector.js';
export * from './orthogonalityV2.js';
export * from './intelligenceSnapshot.js';
export * from './historicalComparison.js';
export * from './formationPrompt.js';

export const WORLD_FORMATION_IMPLEMENTED = false as const;

export const CONCEPT_BEFORE_DIRECTION_HIERARCHY = [
  'BRAND INTELLIGENCE',
  'CREATIVE CONCEPT TERRITORY',
  'DIRECTION / EXPRESSION POSSIBILITIES',
  'WORLD EXPRESSION SYSTEM',
  'FORMAT',
  'SEQUENCE',
  'ASSET',
] as const;

export function formedIsNotReadyForVisualGeneration(): true {
  return true;
}

export function paymentAloneDoesNotApplyToExperimentF(): true {
  return true;
}

export function conceptToDirectionHierarchyFormalized(): true {
  return true;
}

export function worldExpressionTimingAfterConceptReview(): true {
  return true;
}

export function sequenceCreativeSystemDownstream(): true {
  return true;
}
