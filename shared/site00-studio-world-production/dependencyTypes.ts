/**
 * Dependency graph + invalidation edge model — semantic production dependencies.
 */

export const PRODUCTION_RECORD_TYPES = [
  'BRAND_LORE',
  'BRAND_PERSONALITY',
  'BRAND_CHARACTER',
  'BRAND_CHARACTER_DEVELOPMENT',
  'BRAND_CHARACTER_SYSTEM',
  'FOUNDER_CREATIVE_APPETITE',
  'CONCEPT_FORMATION',
  'CREATIVE_CONCEPT',
  'EXPERIENCE_CONCEPT',
  'IDENTITY_CONCEPT',
  'DIRECTION',
  'EXPERIENCE_DIRECTION',
  'IDENTITY_DIRECTION',
  'WORLD_EXPRESSION',
  'VISUAL_REFERENCE',
  'VISUAL_REFERENCE_PACKAGE',
  'DESIGN_PROOF',
  'FAMILY_DESIGN_PROOF',
  'FUNCTIONAL_CANON',
  'HOST_CANON',
  'CLIENT_EXPRESSION',
  'SITE_STRATEGY',
  'SITE_ARCHITECTURE',
  'SITE_INFORMATION_ARCHITECTURE',
  'SITE_PAGE_INVENTORY',
  'SITE_PAGE_FAMILY',
  'SITE_SURFACE_EXPERIENCE_BRIEF',
  'IMPLEMENTATION_CONTRACT',
  'PAGE_FAMILY_IMPLEMENTATION_CONTRACT',
  'SITE_SURFACE_IMPLEMENTATION_CONTRACT',
  'FIDELITY_BASELINE',
  'EXPERIMENT_D_RUN',
  'EXPERIMENT_E_RUN',
  'EXPERIMENT_F_RUN',
  'PROJECT_INTELLIGENCE',
  'CHARACTER_READINESS',
  'CHARACTER_DEEPENING',
  'ASSET_MANIFEST',
] as const;

export type ProductionRecordType = (typeof PRODUCTION_RECORD_TYPES)[number];

export const PRODUCTION_RELATIONSHIP_TYPES = [
  'DERIVED_FROM',
  'COMPILED_FROM',
  'VISUALLY_CONDITIONED_BY',
  'FUNCTIONALLY_DEPENDS_ON',
  'USES_ASSET',
  'USES_REFERENCE',
  'USES_CANON',
  'USES_EXPERIMENT_EVIDENCE',
  'IMPLEMENTS',
  'SUPERSEDES',
  'REVISION_OF',
  'PROMOTED_FROM',
] as const;

export type ProductionRelationshipType = (typeof PRODUCTION_RELATIONSHIP_TYPES)[number];

export const INVALIDATION_POLICIES = [
  'NO_INVALIDATION',
  'RECOMPILE_ONLY',
  'SOFT_REVIEW_REQUIRED',
  'EVIDENCE_STALE',
  'REGENERATION_REQUIRED',
  'FOUNDER_REVIEW_REQUIRED',
  'HARD_INVALIDATION',
  'SUPERSEDE_REQUIRED',
  'BLOCK_DOWNSTREAM_EXECUTION',
] as const;

export type InvalidationPolicy = (typeof INVALIDATION_POLICIES)[number];

export const INVALIDATION_CHANGE_TYPES = [
  'BRAND_LORE_CHANGE',
  'BRAND_CHARACTER_CHANGE',
  'FOUNDER_CREATIVE_APPETITE_CHANGE',
  'FUNCTIONAL_CANON_CHANGE',
  'SITE_ARCHITECTURE_CHANGE',
  'VISUAL_REFERENCE_STALENESS',
  'APPROVED_DESIGN_PROOF_REVISION',
  'PROJECT_SCOPE_EXPANSION',
  'IDENTITY_CONCEPT_CHANGE',
  'EXPERIENCE_DIRECTION_CHANGE',
  'HOST_CANON_CHANGE',
  'CLIENT_EXPRESSION_CHANGE',
  'GENERIC_UPSTREAM_CHANGE',
] as const;

export type InvalidationChangeType = (typeof INVALIDATION_CHANGE_TYPES)[number];

export const INVALIDATION_RESOLUTIONS = [
  'PENDING',
  'RECOMPILED',
  'FOUNDER_REVIEWED',
  'REGENERATED',
  'SUPERSEDED',
  'NO_ACTION_REQUIRED',
  'HISTORICAL_EVIDENCE_PRESERVED',
  'NO_LONGER_CURRENT_INPUT',
] as const;

export type InvalidationResolution = (typeof INVALIDATION_RESOLUTIONS)[number];

export type ProductionDependencyEdge = {
  id: string;
  upstreamType: ProductionRecordType;
  upstreamId: string;
  downstreamType: ProductionRecordType;
  downstreamId: string;
  relationshipType: ProductionRelationshipType;
  invalidationPolicy: InvalidationPolicy;
  reason: string;
  createdAt: string;
  updatedAt: string;
  sourceMethodologyVersion: string;
  metadata: Record<string, unknown>;
};

export type InvalidationAffectedNode = {
  recordType: ProductionRecordType;
  recordId: string;
  policyApplied: InvalidationPolicy;
  reason: string;
  requiredAction: string;
  frozenExperimentProtected?: boolean;
};

export type ProductionInvalidationEvent = {
  id: string;
  projectId: string;
  sourceType: ProductionRecordType;
  sourceId: string;
  sourceVersionBefore: string | null;
  sourceVersionAfter: string | null;
  changeType: InvalidationChangeType;
  changeSummary: string;
  affectedNodes: InvalidationAffectedNode[];
  policyApplied: InvalidationPolicy;
  createdAt: string;
  resolvedAt: string | null;
  resolution: InvalidationResolution | null;
  founderActionRequired: boolean;
  metadata: Record<string, unknown>;
};

export type DownstreamInvalidationResult = {
  affectedRecords: Array<{
    recordType: ProductionRecordType;
    recordId: string;
  }>;
  invalidationPolicy: InvalidationPolicy;
  reason: string;
  requiredAction: string;
  founderActionRequired: boolean;
  automaticRegenerationBlocked: true;
  automaticDeletionBlocked: true;
};

export type StudioWorldDependencyGraph = {
  projectId: string;
  edges: ProductionDependencyEdge[];
  methodologyVersion: string;
  updatedAt: string;
};
