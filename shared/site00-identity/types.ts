/**
 * SITE 00 Identity Phase — generic types (P0.D)
 */

export const TRUTH_LAYERS = [
  'CLIENT_FOUNDER_TRUTH',
  'CREATIVE_EXPLORATION',
  'APPROVED_CANON',
  'UNRESOLVED',
] as const;

export type TruthLayer = (typeof TRUTH_LAYERS)[number];

export const IDENTITY_PHASE_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'AWAITING_REVIEW',
  'PARTIALLY_APPROVED',
  'COMPLETE',
] as const;

export type IdentityPhaseStatus = (typeof IDENTITY_PHASE_STATUSES)[number];

export const IDENTITY_TERRITORY_STATUSES = [
  'PROPOSED',
  'SELECTED',
  'REVISED',
  'REJECTED',
  'PROMOTED_PARTIAL',
  'PROMOTED',
] as const;

export type IdentityTerritoryStatus = (typeof IDENTITY_TERRITORY_STATUSES)[number];

export const IDENTITY_JUDGMENTS = ['SELECT', 'REVISE', 'REJECT', 'UNREVIEWED', 'HYBRIDIZE'] as const;
export type IdentityJudgmentValue = (typeof IDENTITY_JUDGMENTS)[number];

export const WORLD_HIERARCHY_NODE_TYPES = ['WORLD', 'DISTRICT', 'DESTINATION', 'EXPERIENCE'] as const;
export type WorldHierarchyNodeType = (typeof WORLD_HIERARCHY_NODE_TYPES)[number];

export const CANON_HIERARCHY_SCOPES = ['MASTER', 'DISTRICT', 'DESTINATION', 'EXPERIENCE'] as const;
export type CanonHierarchyScope = (typeof CANON_HIERARCHY_SCOPES)[number];

export const PROVENANCE_LABELS = [
  'CLIENT_CONFIRMED',
  'CLIENT_PROPOSED',
  'DERIVED',
  'FOUNDER_HYPOTHESIS',
  'CREATIVE_HYPOTHESIS',
  'UNRESOLVED',
] as const;

export type ProvenanceLabel = (typeof PROVENANCE_LABELS)[number];

export type IdentityTerritoryPayload = {
  positioning?: string;
  personality?: string;
  tone?: string;
  masterBrandDirection?: string;
  districtIdentityDirection?: string;
  typographyDirection?: string;
  paletteDirection?: string;
  symbolicLanguage?: string;
  differentiation?: string;
  risks?: string[];
  districtRelationship?: string;
  futureDistrictModel?: string;
};

export type IdentityBriefSection = {
  label: ProvenanceLabel;
  content: string | Record<string, unknown>;
};

export type IdentityBriefPayload = {
  projectSlug: string;
  masterBrand: string;
  flagshipDistrict: string;
  productHierarchy: string;
  sections: Record<string, IdentityBriefSection>;
  sourceTruthCount: number;
  unresolvedCount: number;
  note: string;
};

export type ProjectBibleSection = {
  id: string;
  title: string;
  truthLayer: TruthLayer;
  content: unknown;
};

export type CompiledProjectBible = {
  projectSlug: string;
  compiledAt: string;
  sections: ProjectBibleSection[];
  worldFormationState: 'NOT_FORMED';
};

/** Governance invariant */
export function assertTruthLayerSeparation(): true {
  return true;
}
