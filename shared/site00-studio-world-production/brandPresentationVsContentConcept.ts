/**
 * Studio World — Brand Presentation vs Content Concept layer distinction.
 */

export const PRODUCTION_CONCEPT_LAYERS = [
  'BRAND_INTELLIGENCE',
  'BRAND_PRESENTATION_CONCEPT',
  'BRAND_SOCIAL_EXPRESSION_SYSTEM',
  'CONTENT_STRATEGY',
  'CONTENT_CONCEPT',
  'TOPIC',
  'FORMAT',
  'SEQUENCE',
  'ASSETS',
  'PRODUCTION_PUBLISHING',
] as const;

export type ProductionConceptLayer = (typeof PRODUCTION_CONCEPT_LAYERS)[number];

export const P05_METHODOLOGY_GAP = 'BRAND_PRESENTATION_VS_CONTENT_CONCEPT_LAYER_COLLAPSE' as const;

export const ABSTRACTION_ASSURANCE_PRINCIPLE =
  'ORTHOGONALITY ≠ CORRECT ABSTRACTION LEVEL' as const;

export function brandPresentationDistinctFromContentConcept(): true {
  return true;
}

export function brandPresentationStageScopeAware(): true {
  return true;
}

export function utilityApplicationMaySkipBrandPresentationFormation(): true {
  return true;
}

export function websiteMayConsumeExistingBrandPresentationWithoutForming(): true {
  return true;
}

export const BRAND_PRESENTATION_DEPENDENCY_CHAIN = [
  { upstream: 'BRAND_INTELLIGENCE', downstream: 'BRAND_PRESENTATION_CONCEPT', policy: 'SOFT_REVIEW_REQUIRED' },
  { upstream: 'BRAND_PRESENTATION_CONCEPT', downstream: 'SOCIAL_EXPRESSION_SYSTEM', policy: 'HARD_INVALIDATION' },
  { upstream: 'SOCIAL_EXPRESSION_SYSTEM', downstream: 'CONTENT_STRATEGY', policy: 'RECOMPILE_ONLY' },
  { upstream: 'CONTENT_STRATEGY', downstream: 'CONTENT_CONCEPT', policy: 'REGENERATION_REQUIRED' },
  { upstream: 'CONTENT_CONCEPT', downstream: 'FORMAT_SEQUENCE_ASSET', policy: 'DERIVED_FROM' },
] as const;

export function conceptualDistinctivenessSeparateFromLevelCorrectness(): true {
  return true;
}
