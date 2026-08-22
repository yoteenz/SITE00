/**
 * Canonical direction field contract — Anthropic → persistence → API → founder UI.
 * Single normalization path; aliases mapped once, never duplicated in storage.
 */

import type { FormedCoreDirection } from './types.js';

export type FounderDirectionFieldKey =
  | 'name'
  | 'bigIdea'
  | 'thesis'
  | 'brandConnection'
  | 'loreLineage'
  | 'centralMetaphor'
  | 'conceptualAncestor'
  | 'audienceRole'
  | 'brandRole'
  | 'governingBehavior'
  | 'primaryArtifact'
  | 'materialLanguage'
  | 'imageryLanguage'
  | 'typographicAttitude'
  | 'colorLogic'
  | 'motionSeed'
  | 'socialExpressionHypothesis'
  | 'risks'
  | 'qualityConfidence';

export type FounderDirectionPresentationField = {
  key: FounderDirectionFieldKey;
  label: string;
  value: string | string[];
  missing: boolean;
};

const PRODUCTION_REQUIRED_KEYS: FounderDirectionFieldKey[] = [
  'name',
  'bigIdea',
  'thesis',
  'brandConnection',
  'loreLineage',
  'centralMetaphor',
  'conceptualAncestor',
  'governingBehavior',
  'primaryArtifact',
  'materialLanguage',
  'imageryLanguage',
  'typographicAttitude',
  'colorLogic',
  'motionSeed',
  'socialExpressionHypothesis',
  'risks',
];

function nonEmpty(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((v) => String(v).trim().length > 0);
  return false;
}

/** Normalize raw/persisted direction into canonical FormedCoreDirection shape. */
export function normalizeFormedDirection(raw: FormedCoreDirection | Record<string, unknown>): FormedCoreDirection {
  const r = raw as Record<string, unknown>;
  const loreLineage = Array.isArray(r.loreLineage)
    ? r.loreLineage.map(String).filter((s) => s.trim())
    : [];
  const risks = Array.isArray(r.risks) ? r.risks.map(String).filter((s) => s.trim()) : [];

  return {
    directionId: String(r.directionId ?? ''),
    directionName: String(r.directionName ?? r.name ?? ''),
    bigIdea: String(r.bigIdea ?? ''),
    oneLineThesis: String(r.oneLineThesis ?? r.thesis ?? ''),
    brandConnection: String(
      r.brandConnection ?? r.whyThisBelongs ?? r.brand_connection ?? '',
    ),
    loreLineage,
    conceptualAncestor: String(
      r.conceptualAncestor ?? r.culturalReference ?? r.conceptual_ancestor ?? '',
    ),
    culturalReference: String(r.culturalReference ?? r.conceptualAncestor ?? ''),
    emotionalPromise: String(r.emotionalPromise ?? ''),
    audienceRole: String(r.audienceRole ?? ''),
    brandRole: String(r.brandRole ?? ''),
    visualMetaphor: String(r.visualMetaphor ?? r.centralMetaphor ?? r.central_metaphor ?? ''),
    governingBehavior: String(r.governingBehavior ?? ''),
    materialImageryLanguage: String(
      r.materialImageryLanguage ?? r.materialLanguage ?? r.material_language ?? '',
    ),
    imageryLanguage: String(r.imageryLanguage ?? r.imagery_language ?? ''),
    typographicAttitude: String(
      r.typographicAttitude ?? r.typography ?? r.typographic_attitude ?? '',
    ),
    coreColorLogic: String(r.coreColorLogic ?? r.colorLogic ?? r.color_logic ?? ''),
    colorLogic: String(r.colorLogic ?? r.coreColorLogic ?? r.color_logic ?? ''),
    signatureDevices: Array.isArray(r.signatureDevices) ? r.signatureDevices.map(String) : [],
    primaryBrandArtifact: String(
      r.primaryBrandArtifact ?? r.primaryArtifact ?? r.primary_artifact ?? '',
    ),
    motionSeed: String(r.motionSeed ?? r.motion_seed ?? ''),
    socialExpressionHypothesis: String(
      r.socialExpressionHypothesis ?? r.social_expression_hypothesis ?? '',
    ),
    proprietaryQuality: String(r.proprietaryQuality ?? ''),
    antiDirection: Array.isArray(r.antiDirection) ? r.antiDirection.map(String) : [],
    risks,
    qualityConfidence: (r.qualityConfidence as FormedCoreDirection['qualityConfidence']) ?? 'MEDIUM',
  };
}

export function normalizeFormedDirections(
  directions: FormedCoreDirection[] | unknown,
): FormedCoreDirection[] {
  if (!Array.isArray(directions)) return [];
  return directions.map((d) => normalizeFormedDirection(d as FormedCoreDirection));
}

function fieldValueForPresentation(
  direction: FormedCoreDirection,
  key: FounderDirectionFieldKey,
): string | string[] {
  switch (key) {
    case 'name':
      return direction.directionName;
    case 'bigIdea':
      return direction.bigIdea;
    case 'thesis':
      return direction.oneLineThesis;
    case 'brandConnection':
      return direction.brandConnection;
    case 'loreLineage':
      return direction.loreLineage;
    case 'centralMetaphor':
      return direction.visualMetaphor;
    case 'conceptualAncestor':
      return direction.conceptualAncestor || direction.culturalReference;
    case 'audienceRole':
      return direction.audienceRole;
    case 'brandRole':
      return direction.brandRole;
    case 'governingBehavior':
      return direction.governingBehavior;
    case 'primaryArtifact':
      return direction.primaryBrandArtifact;
    case 'materialLanguage':
      return direction.materialImageryLanguage;
    case 'imageryLanguage':
      return direction.imageryLanguage;
    case 'typographicAttitude':
      return direction.typographicAttitude;
    case 'colorLogic':
      return direction.colorLogic || direction.coreColorLogic;
    case 'motionSeed':
      return direction.motionSeed;
    case 'socialExpressionHypothesis':
      return direction.socialExpressionHypothesis;
    case 'risks':
      return direction.risks;
    case 'qualityConfidence':
      return direction.qualityConfidence ?? 'MEDIUM';
    default:
      return '';
  }
}

const FOUNDER_FIELD_LABELS: Record<FounderDirectionFieldKey, string> = {
  name: 'NAME',
  bigIdea: 'BIG IDEA',
  thesis: 'ONE-LINE THESIS',
  brandConnection: 'WHY THIS BELONGS TO NDX BOOK',
  loreLineage: 'LORE LINEAGE',
  centralMetaphor: 'CENTRAL METAPHOR',
  conceptualAncestor: 'CONCEPTUAL ANCESTOR',
  audienceRole: 'AUDIENCE ROLE',
  brandRole: 'BRAND ROLE',
  governingBehavior: 'GOVERNING BEHAVIOR',
  primaryArtifact: 'PRIMARY ARTIFACT',
  materialLanguage: 'MATERIAL LANGUAGE',
  imageryLanguage: 'IMAGERY LANGUAGE',
  typographicAttitude: 'TYPOGRAPHIC ATTITUDE',
  colorLogic: 'COLOR LOGIC',
  motionSeed: 'MOTION SEED',
  socialExpressionHypothesis: 'SOCIAL EXPRESSION HYPOTHESIS',
  risks: 'RISKS',
  qualityConfidence: 'QUALITY CONFIDENCE',
};

/** Fields for founder UI — omits empty values unless governance visibility requested. */
export function buildFounderDirectionPresentationFields(
  direction: FormedCoreDirection,
  options?: { showMissingPlaceholders?: boolean },
): FounderDirectionPresentationField[] {
  const keys: FounderDirectionFieldKey[] = [
    'bigIdea',
    'thesis',
    'brandConnection',
    'centralMetaphor',
    'governingBehavior',
    'primaryArtifact',
    'materialLanguage',
    'imageryLanguage',
    'typographicAttitude',
    'colorLogic',
    'motionSeed',
    'socialExpressionHypothesis',
    'risks',
    'conceptualAncestor',
    'loreLineage',
  ];

  return keys
    .map((key) => {
      const value = fieldValueForPresentation(direction, key);
      const missing = !nonEmpty(value);
      if (missing && !options?.showMissingPlaceholders) return null;
      return {
        key,
        label: FOUNDER_FIELD_LABELS[key],
        value: missing ? 'NOT GENERATED IN THIS FORMATION' : value,
        missing,
      };
    })
    .filter((f): f is FounderDirectionPresentationField => f != null);
}

export type DirectionProductionCompleteness = {
  directionId: string;
  directionName: string;
  complete: boolean;
  missingFields: FounderDirectionFieldKey[];
};

export function assessDirectionProductionCompleteness(
  direction: FormedCoreDirection,
): DirectionProductionCompleteness {
  const missingFields = PRODUCTION_REQUIRED_KEYS.filter((key) => {
    const value = fieldValueForPresentation(direction, key);
    return !nonEmpty(value);
  });

  return {
    directionId: direction.directionId,
    directionName: direction.directionName,
    complete: missingFields.length === 0,
    missingFields,
  };
}

export function assessFormationProductionCompleteness(
  directions: FormedCoreDirection[],
): {
  allComplete: boolean;
  directions: DirectionProductionCompleteness[];
  blockedStatus: 'VISUAL_PLAN_BLOCKED_INCOMPLETE_DIRECTION' | null;
} {
  const assessed = directions.map(assessDirectionProductionCompleteness);
  const allComplete = assessed.every((d) => d.complete);
  return {
    allComplete,
    directions: assessed,
    blockedStatus: allComplete ? null : 'VISUAL_PLAN_BLOCKED_INCOMPLETE_DIRECTION',
  };
}
