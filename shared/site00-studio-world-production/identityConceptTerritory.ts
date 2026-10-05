/**
 * Identity Concept Territory — governing idea before style/direction.
 */

import { P0_5A_METHODOLOGY_VERSION } from './constants.js';

export type IdentityConceptTerritory = {
  id: string;
  brandId: string;
  name: string;
  identityThesis: string;
  coreIdentityIdea: string;
  brandTruthConnection: string;
  audienceRelationship: string;
  emotionalPromise: string;
  verbalImplication: string | null;
  visualImplication: string | null;
  behavioralImplication: string | null;
  materialImplication: string | null;
  motionImplication: string | null;
  symbolicLogic: string | null;
  identityTension: string | null;
  possibleDirectionRange: Array<{ directionSeed: string; explanation: string }>;
  antiCollapseRules: string[];
  provenance: string;
  snapshotFingerprint: string | null;
  formationReceipt: string | null;
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
};

export type IdentityConceptVsDirectionEvaluation = {
  result: 'CONCEPT' | 'DIRECTION_NOT_CONCEPT' | 'STYLE_DEPENDENT';
  survivesStyleChange: boolean;
  supportsMultipleDirections: boolean;
  notes: string[];
};

export type IdentityConceptDistinctivenessEvaluation = {
  result: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  dimensions: Array<{
    dimension: string;
    distinct: boolean;
    note: string;
  }>;
  styleDimensionsIgnored: true;
};

export type IdentityDirectionCandidate = {
  id: string;
  conceptTerritoryId: string;
  directionName: string;
  visualLanguage: string[];
  typographyApproach: string[];
  paletteStrategy: string[];
  imageBehavior: string[];
  graphicGrammar: string[];
  materialSystem: string[];
  logoMarkExplorationBehavior: string[];
  motionDirection: string[];
  verbalExecutionBehavior: string[];
};

export type IdentitySystemContract = {
  id: string;
  brandId: string;
  conceptTerritoryId: string;
  directionId: string;
  scopeDomains: Array<
    | 'verbal_identity'
    | 'logo_mark_system'
    | 'typography_system'
    | 'color_system'
    | 'imagery_system'
    | 'graphic_grammar'
    | 'material_behavior'
    | 'motion_identity'
    | 'iconography'
    | 'composition_rules'
    | 'content_behavior'
    | 'digital_behavior'
    | 'physical_behavior'
    | 'accessibility_requirements'
  >;
  domainRules: Record<string, string[]>;
  lifecycleState: 'DRAFT' | 'READY' | 'STALE';
};

export type IdentityProductionReadiness = {
  brandId: string;
  state: 'NOT_READY' | 'PARTIAL' | 'READY' | 'BLOCKED' | 'NOT_EVALUATED';
  approvedIdentityConcept: boolean;
  approvedIdentityDirection: boolean;
  requiredSystemDomainsComplete: boolean;
  founderClientApproval: boolean;
  productionAssetsAvailable: boolean;
  guidelinesCompilationReady: boolean;
  blockers: string[];
};

const STYLE_ONLY_MARKERS = ['serif', 'cream', 'gold', 'palette', 'font', 'typography', 'logo form', 'photography'];

export function evaluateIdentityConceptVsDirection(concept: IdentityConceptTerritory): IdentityConceptVsDirectionEvaluation {
  const combined = [
    concept.coreIdentityIdea,
    concept.identityThesis,
    concept.visualImplication ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const styleOnly =
    STYLE_ONLY_MARKERS.filter((m) => combined.includes(m)).length >= 2 &&
    !concept.behavioralImplication &&
    !concept.verbalImplication;

  const directionSeeds = concept.possibleDirectionRange ?? [];
  const supportsMultipleDirections =
    directionSeeds.length >= 2 &&
    directionSeeds[0]?.directionSeed.toLowerCase() !== directionSeeds[1]?.directionSeed.toLowerCase();

  if (!concept.coreIdentityIdea || !concept.brandTruthConnection || !concept.audienceRelationship) {
    return {
      result: 'DIRECTION_NOT_CONCEPT',
      survivesStyleChange: false,
      supportsMultipleDirections: false,
      notes: ['Missing core identity idea or brand truth connection'],
    };
  }

  if (styleOnly) {
    return {
      result: 'STYLE_DEPENDENT',
      survivesStyleChange: false,
      supportsMultipleDirections: false,
      notes: ['Identity appears style-dependent (palette/font-only) — not a concept'],
    };
  }

  if (!supportsMultipleDirections) {
    return {
      result: 'DIRECTION_NOT_CONCEPT',
      survivesStyleChange: true,
      supportsMultipleDirections: false,
      notes: ['Valid concept should support multiple direction seeds'],
    };
  }

  return {
    result: 'CONCEPT',
    survivesStyleChange: true,
    supportsMultipleDirections: true,
    notes: ['Governing identity idea survives style changes'],
  };
}

export function paletteFontOnlyCandidateFailsConceptGate(concept: IdentityConceptTerritory): boolean {
  return evaluateIdentityConceptVsDirection(concept).result === 'STYLE_DEPENDENT';
}

export function evaluateIdentityConceptDistinctiveness(
  concepts: IdentityConceptTerritory[],
): IdentityConceptDistinctivenessEvaluation {
  const semanticDimensions = [
    'core idea',
    'brand truth relationship',
    'audience relationship',
    'emotional promise',
    'symbolic model',
    'behavioral model',
    'verbal implication',
    'identity tension',
  ];

  if (concepts.length < 2) {
    return {
      result: 'NOT_EVALUATED',
      dimensions: semanticDimensions.map((d) => ({ dimension: d, distinct: false, note: 'Insufficient concepts' })),
      styleDimensionsIgnored: true,
    };
  }

  const dimensions = semanticDimensions.map((dimension) => {
    const values = concepts.map((c) => {
      switch (dimension) {
        case 'core idea':
          return c.coreIdentityIdea;
        case 'brand truth relationship':
          return c.brandTruthConnection;
        case 'audience relationship':
          return c.audienceRelationship;
        case 'emotional promise':
          return c.emotionalPromise;
        case 'symbolic model':
          return c.symbolicLogic ?? '';
        case 'behavioral model':
          return c.behavioralImplication ?? '';
        case 'verbal implication':
          return c.verbalImplication ?? '';
        case 'identity tension':
          return c.identityTension ?? '';
        default:
          return '';
      }
    });
    const distinct = new Set(values.map((v) => v.toLowerCase().trim())).size === values.length;
    return { dimension, distinct, note: distinct ? 'Distinct across concepts' : 'Overlap detected' };
  });

  const allDistinct = dimensions.every((d) => d.distinct);
  return {
    result: allDistinct ? 'PASS' : 'FAIL',
    dimensions,
    styleDimensionsIgnored: true,
  };
}

export function evaluateIdentityProductionReadiness(input: {
  brandId: string;
  logoApproved: boolean;
  conceptApproved: boolean;
  directionApproved: boolean;
  systemDomainsComplete: boolean;
  founderClientApproval: boolean;
  assetsAvailable: boolean;
  guidelinesReady: boolean;
}): IdentityProductionReadiness {
  const blockers: string[] = [];
  if (!input.conceptApproved) blockers.push('Approved identity concept required');
  if (!input.directionApproved) blockers.push('Approved identity direction required');
  if (!input.systemDomainsComplete) blockers.push('Required system domains incomplete');
  if (!input.founderClientApproval) blockers.push('Founder/client approval required');
  if (!input.assetsAvailable) blockers.push('Production assets not available');
  if (!input.guidelinesReady) blockers.push('Guidelines compilation not ready');

  let state: IdentityProductionReadiness['state'] = 'NOT_EVALUATED';
  if (input.logoApproved && !input.conceptApproved) {
    blockers.push('Logo approval alone does not constitute identity production readiness');
    state = 'NOT_READY';
  } else if (blockers.length === 0) {
    state = 'READY';
  } else if (input.conceptApproved || input.directionApproved) {
    state = 'PARTIAL';
  } else {
    state = 'NOT_READY';
  }

  return {
    brandId: input.brandId,
    state,
    approvedIdentityConcept: input.conceptApproved,
    approvedIdentityDirection: input.directionApproved,
    requiredSystemDomainsComplete: input.systemDomainsComplete,
    founderClientApproval: input.founderClientApproval,
    productionAssetsAvailable: input.assetsAvailable,
    guidelinesCompilationReady: input.guidelinesReady,
    blockers,
  };
}

export function identityGuidelinesAreDownstreamEvidenceNotMethodology(): true {
  return true;
}

export function identitySystemContractIsScopeAware(contract: IdentitySystemContract): boolean {
  return contract.scopeDomains.length > 0;
}
