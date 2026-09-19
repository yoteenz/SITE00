/**
 * Experience Expression scope correction — P0.5A methodology boundary.
 */

import { P0_5A_METHODOLOGY_VERSION } from './constants.js';

export const EXPERIENCE_EXPRESSION_OWNED_RESPONSIBILITIES = [
  'interaction_grammar',
  'information_behavior',
  'spatial_structural_metaphor',
  'hierarchy_behavior',
  'attention_behavior',
  'transition_behavior',
  'responsive_experience_philosophy',
  'motion_behavior',
  'material_behavior',
  'user_information_relationship',
  'host_client_expression_relationship',
] as const;

export const EXPERIENCE_EXPRESSION_EXCLUDED_RESPONSIBILITIES = [
  'site_route_inventory',
  'site_navigation_architecture',
  'page_existence_decisions',
  'business_conversion_architecture',
  'basic_content_model',
  'product_state_models',
  'factual_seo_content_architecture',
] as const;

export type ExperienceConceptFormationActor = 'ANTHROPIC_REASONING' | 'DETERMINISTIC_CODE';

export type ExperienceConceptFormationPolicy = {
  actor: ExperienceConceptFormationActor;
  founderTriggered: true;
  deterministicMayValidateSchema: true;
  deterministicMayNotCreativeDirect: true;
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
};

export const EXPERIENCE_CONCEPT_FORMATION_POLICY: ExperienceConceptFormationPolicy = {
  actor: 'ANTHROPIC_REASONING',
  founderTriggered: true,
  deterministicMayValidateSchema: true,
  deterministicMayNotCreativeDirect: true,
  methodologyVersion: P0_5A_METHODOLOGY_VERSION,
};

export type ExperienceConceptCandidate = {
  conceptId: string;
  experienceThesis: string;
  viewerUserRelationship: string;
  informationBehavior: string;
  interactionBehavior: string;
  structuralMetaphor: string | null;
  attentionModel: string;
  spatialTemporalLogic: string;
};

export type ExperienceConceptVsLayoutEvaluation = {
  result: 'CONCEPT' | 'LAYOUT_NOT_CONCEPT';
  survivesLayoutChange: boolean;
  notes: string[];
};

export type ExperienceMetaphorBehaviorEvaluation = {
  result: 'VALID' | 'INVALID' | 'NOT_EVALUATED';
  servesBehavior: boolean;
  behaviorMappings: string[];
  notes: string[];
};

const LAYOUT_MARKERS = [
  'three-column',
  'grid layout',
  'card placement',
  'sidebar left',
  'sidebar right',
  'exact grid',
  'css styling',
  'pixel layout',
];

export function evaluateExperienceConceptVsLayout(concept: ExperienceConceptCandidate): ExperienceConceptVsLayoutEvaluation {
  const combined = [
    concept.experienceThesis,
    concept.viewerUserRelationship,
    concept.informationBehavior,
    concept.interactionBehavior,
    concept.structuralMetaphor ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const layoutOnly =
    LAYOUT_MARKERS.some((m) => combined.includes(m)) &&
    !concept.informationBehavior &&
    !concept.interactionBehavior &&
    !concept.viewerUserRelationship;

  const hasConceptualCore =
    Boolean(concept.experienceThesis) &&
    Boolean(concept.viewerUserRelationship) &&
    Boolean(concept.informationBehavior) &&
    Boolean(concept.interactionBehavior);

  if (layoutOnly || !hasConceptualCore) {
    return {
      result: 'LAYOUT_NOT_CONCEPT',
      survivesLayoutChange: false,
      notes: ['Concept appears to be layout-dependent rather than experiential'],
    };
  }

  return {
    result: 'CONCEPT',
    survivesLayoutChange: true,
    notes: ['Concept defines behavior and relationship independent of exact layout'],
  };
}

export function evaluateExperienceMetaphorBehaviorGuard(input: {
  metaphor: string;
  behaviorBenefits: string[];
}): ExperienceMetaphorBehaviorEvaluation {
  const validBenefits = ['navigation', 'understanding', 'attention', 'interaction', 'meaning', 'workflow', 'decision-making'];
  const mappings = input.behaviorBenefits.filter((b) =>
    validBenefits.some((v) => b.toLowerCase().includes(v)),
  );

  if (!input.metaphor.trim()) {
    return {
      result: 'NOT_EVALUATED',
      servesBehavior: false,
      behaviorMappings: [],
      notes: ['No metaphor provided'],
    };
  }

  if (mappings.length === 0) {
    return {
      result: 'INVALID',
      servesBehavior: false,
      behaviorMappings: [],
      notes: ['Metaphor does not map to behavior — EXPERIENCE_METAPHOR_MUST_SERVE_BEHAVIOR'],
    };
  }

  return {
    result: 'VALID',
    servesBehavior: true,
    behaviorMappings: mappings,
    notes: ['Metaphor serves documented behavioral benefit'],
  };
}

export function experienceExpressionScopeCorrectionApplied(): true {
  return true;
}

export function deterministicPreCheckCanRunWithoutSemanticAudit(): true {
  return true;
}

export function semanticAuditAbsenceYieldsNotEvaluated(): 'NOT_EVALUATED' {
  return 'NOT_EVALUATED';
}
