/**
 * Canonical semantic dependency edges — first invalidation coverage (P0.5A).
 */

import { P0_5A_METHODOLOGY_VERSION } from './constants.js';
import type {
  InvalidationChangeType,
  InvalidationPolicy,
  ProductionDependencyEdge,
  ProductionRecordType,
} from './dependencyTypes.js';

type CanonicalEdgeTemplate = {
  upstreamType: ProductionRecordType;
  downstreamType: ProductionRecordType;
  invalidationPolicy: InvalidationPolicy;
  reason: string;
  changeTypes: InvalidationChangeType[];
};

export const CANONICAL_DEPENDENCY_TEMPLATES: CanonicalEdgeTemplate[] = [
  {
    upstreamType: 'BRAND_LORE',
    downstreamType: 'BRAND_PERSONALITY',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Brand personality derives from brand lore worldview',
    changeTypes: ['BRAND_LORE_CHANGE'],
  },
  {
    upstreamType: 'BRAND_LORE',
    downstreamType: 'BRAND_CHARACTER',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Brand character territories derive from brand truth and personality evidence',
    changeTypes: ['BRAND_LORE_CHANGE', 'BRAND_CHARACTER_CHANGE'],
  },
  {
    upstreamType: 'BRAND_PERSONALITY',
    downstreamType: 'BRAND_CHARACTER',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Personality evidence informs but does not replace character formation',
    changeTypes: ['BRAND_LORE_CHANGE'],
  },
  {
    upstreamType: 'BRAND_CHARACTER',
    downstreamType: 'BRAND_CHARACTER_SYSTEM',
    invalidationPolicy: 'FOUNDER_REVIEW_REQUIRED',
    reason: 'Character system compiled from founder-selected territory',
    changeTypes: ['BRAND_CHARACTER_CHANGE'],
  },
  {
    upstreamType: 'BRAND_CHARACTER_SYSTEM',
    downstreamType: 'IDENTITY_CONCEPT',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Identity concepts should align with approved character',
    changeTypes: ['BRAND_CHARACTER_CHANGE'],
  },
  {
    upstreamType: 'BRAND_CHARACTER_SYSTEM',
    downstreamType: 'CONCEPT_FORMATION',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Brand presentation concepts may need character compatibility review',
    changeTypes: ['BRAND_CHARACTER_CHANGE'],
  },
  {
    upstreamType: 'BRAND_CHARACTER_SYSTEM',
    downstreamType: 'DIRECTION',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Directions inherit character dependency — not auto-regenerated',
    changeTypes: ['BRAND_CHARACTER_CHANGE'],
  },
  {
    upstreamType: 'BRAND_CHARACTER_SYSTEM',
    downstreamType: 'DESIGN_PROOF',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Visual proofs upstream character layer was missing — review on character change',
    changeTypes: ['BRAND_CHARACTER_CHANGE'],
  },
  {
    upstreamType: 'BRAND_LORE',
    downstreamType: 'CONCEPT_FORMATION',
    invalidationPolicy: 'REGENERATION_REQUIRED',
    reason: 'Concept formation inputs may no longer match brand truth',
    changeTypes: ['BRAND_LORE_CHANGE'],
  },
  {
    upstreamType: 'BRAND_LORE',
    downstreamType: 'EXPERIENCE_CONCEPT',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Experience concepts may need re-evaluation against updated brand truth',
    changeTypes: ['BRAND_LORE_CHANGE'],
  },
  {
    upstreamType: 'BRAND_LORE',
    downstreamType: 'IDENTITY_CONCEPT',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Identity concept territories connect to brand truth',
    changeTypes: ['BRAND_LORE_CHANGE'],
  },
  {
    upstreamType: 'BRAND_LORE',
    downstreamType: 'CLIENT_EXPRESSION',
    invalidationPolicy: 'RECOMPILE_ONLY',
    reason: 'Client expression may need recompilation without invalidating canon',
    changeTypes: ['BRAND_LORE_CHANGE'],
  },
  {
    upstreamType: 'FOUNDER_CREATIVE_APPETITE',
    downstreamType: 'CONCEPT_FORMATION',
    invalidationPolicy: 'NO_INVALIDATION',
    reason: 'Future concept work only; does not rewrite brand truth or frozen experiments',
    changeTypes: ['FOUNDER_CREATIVE_APPETITE_CHANGE'],
  },
  {
    upstreamType: 'FOUNDER_CREATIVE_APPETITE',
    downstreamType: 'DIRECTION',
    invalidationPolicy: 'NO_INVALIDATION',
    reason: 'Existing frozen experiments remain unchanged',
    changeTypes: ['FOUNDER_CREATIVE_APPETITE_CHANGE'],
  },
  {
    upstreamType: 'FUNCTIONAL_CANON',
    downstreamType: 'SITE_PAGE_INVENTORY',
    invalidationPolicy: 'HARD_INVALIDATION',
    reason: 'Route or functional requirement changes affect page inventory',
    changeTypes: ['FUNCTIONAL_CANON_CHANGE'],
  },
  {
    upstreamType: 'FUNCTIONAL_CANON',
    downstreamType: 'DESIGN_PROOF',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Functional canon changes may stale visual proofs',
    changeTypes: ['FUNCTIONAL_CANON_CHANGE'],
  },
  {
    upstreamType: 'FUNCTIONAL_CANON',
    downstreamType: 'IMPLEMENTATION_CONTRACT',
    invalidationPolicy: 'HARD_INVALIDATION',
    reason: 'Implementation contract must reflect current functional requirements',
    changeTypes: ['FUNCTIONAL_CANON_CHANGE'],
  },
  {
    upstreamType: 'FUNCTIONAL_CANON',
    downstreamType: 'FIDELITY_BASELINE',
    invalidationPolicy: 'HARD_INVALIDATION',
    reason: 'Fidelity baseline depends on functional coverage',
    changeTypes: ['FUNCTIONAL_CANON_CHANGE'],
  },
  {
    upstreamType: 'SITE_ARCHITECTURE',
    downstreamType: 'SITE_PAGE_INVENTORY',
    invalidationPolicy: 'HARD_INVALIDATION',
    reason: 'Architecture changes affect page inventory',
    changeTypes: ['SITE_ARCHITECTURE_CHANGE'],
  },
  {
    upstreamType: 'SITE_ARCHITECTURE',
    downstreamType: 'SITE_PAGE_FAMILY',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Page family membership may need re-evaluation',
    changeTypes: ['SITE_ARCHITECTURE_CHANGE'],
  },
  {
    upstreamType: 'SITE_ARCHITECTURE',
    downstreamType: 'IMPLEMENTATION_CONTRACT',
    invalidationPolicy: 'HARD_INVALIDATION',
    reason: 'Site architecture fingerprint is part of implementation contract',
    changeTypes: ['SITE_ARCHITECTURE_CHANGE'],
  },
  {
    upstreamType: 'VISUAL_REFERENCE',
    downstreamType: 'VISUAL_REFERENCE_PACKAGE',
    invalidationPolicy: 'EVIDENCE_STALE',
    reason: 'Reference staleness requires package recompile review',
    changeTypes: ['VISUAL_REFERENCE_STALENESS'],
  },
  {
    upstreamType: 'VISUAL_REFERENCE',
    downstreamType: 'DESIGN_PROOF',
    invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
    reason: 'Proof review may be required; automatic deletion blocked',
    changeTypes: ['VISUAL_REFERENCE_STALENESS'],
  },
  {
    upstreamType: 'DESIGN_PROOF',
    downstreamType: 'IMPLEMENTATION_CONTRACT',
    invalidationPolicy: 'HARD_INVALIDATION',
    reason: 'Approved proof revision invalidates implementation contract bindings',
    changeTypes: ['APPROVED_DESIGN_PROOF_REVISION'],
  },
  {
    upstreamType: 'DESIGN_PROOF',
    downstreamType: 'FIDELITY_BASELINE',
    invalidationPolicy: 'FOUNDER_REVIEW_REQUIRED',
    reason: 'Proof revision requires fidelity baseline reconsideration',
    changeTypes: ['APPROVED_DESIGN_PROOF_REVISION'],
  },
  {
    upstreamType: 'PROJECT_INTELLIGENCE',
    downstreamType: 'SITE_STRATEGY',
    invalidationPolicy: 'RECOMPILE_ONLY',
    reason: 'Scope expansion may add strategy requirements without invalidating completed modules',
    changeTypes: ['PROJECT_SCOPE_EXPANSION'],
  },
  {
    upstreamType: 'PROJECT_INTELLIGENCE',
    downstreamType: 'SITE_PAGE_FAMILY',
    invalidationPolicy: 'NO_INVALIDATION',
    reason: 'Scope expansion adds new families; preserves unaffected completed records',
    changeTypes: ['PROJECT_SCOPE_EXPANSION'],
  },
];

export function instantiateCanonicalEdge(
  projectId: string,
  template: CanonicalEdgeTemplate,
  upstreamId: string,
  downstreamId: string,
): ProductionDependencyEdge {
  const now = new Date().toISOString();
  return {
    id: `${projectId}:${template.upstreamType}:${upstreamId}->${template.downstreamType}:${downstreamId}`,
    upstreamType: template.upstreamType,
    upstreamId,
    downstreamType: template.downstreamType,
    downstreamId,
    relationshipType: 'DERIVED_FROM',
    invalidationPolicy: template.invalidationPolicy,
    reason: template.reason,
    createdAt: now,
    updatedAt: now,
    sourceMethodologyVersion: P0_5A_METHODOLOGY_VERSION,
    metadata: { changeTypes: template.changeTypes },
  };
}

export function templatesForChangeType(changeType: InvalidationChangeType): CanonicalEdgeTemplate[] {
  return CANONICAL_DEPENDENCY_TEMPLATES.filter((t) => t.changeTypes.includes(changeType));
}
