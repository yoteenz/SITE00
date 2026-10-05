/**
 * Pre-purchase project discovery — commercial/scope diagnostic data.
 * Discovery answers are NOT production intelligence and NOT Brand Canon.
 */

import type { ProjectExperienceClass } from '../site00-world-intake/constants.js';

export const DISCOVERY_PROVENANCE = 'PRE_PURCHASE_DISCOVERY' as const;
export const DISCOVERY_EVIDENCE_CLASS = 'DISCOVERY_EVIDENCE' as const;
export const DISCOVERY_INFERENCE_CLASS = 'DISCOVERY_INFERENCE' as const;
export const DISCOVERY_CARRY_FORWARD_CLASS = 'DISCOVERY_CARRY_FORWARD' as const;

export type DiscoveryProvenance = typeof DISCOVERY_PROVENANCE;

export type IdentityNeedClassification =
  | 'IDENTITY_NOT_REQUIRED'
  | 'IDENTITY_REFINEMENT_RECOMMENDED'
  | 'IDENTITY_FOUNDATION_RECOMMENDED'
  | 'IDENTITY_DEEP_DEVELOPMENT_RECOMMENDED';

export type CreativeDepthPreference =
  | 'STRAIGHTFORWARD'
  | 'DISTINCTIVE'
  | 'HIGHLY_ART_DIRECTED'
  | 'UNCONVENTIONAL_EXPERIMENTAL';

export type RecommendationStatus =
  | 'RECOMMENDATION_READY'
  | 'NEEDS_CLARIFICATION'
  | 'CUSTOM_SCOPE_REQUIRED'
  | 'UNRESOLVED';

export type ProjectDiscoveryAnswer = {
  questionId: string;
  value: string | string[];
  provenance: DiscoveryProvenance;
  capturedAt: string;
};

export type ProjectScopeDiagnosis = {
  experienceClass: ProjectExperienceClass;
  identityNeed: IdentityNeedClassification;
  creativeDepth: CreativeDepthPreference | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  unresolvedReasons: string[];
  diagnosedAt: string;
};

export type ProjectRecommendation = {
  status: RecommendationStatus;
  headline: string;
  identityNeed: IdentityNeedClassification;
  experienceClass: ProjectExperienceClass;
  additions: string[];
  rationale: string[];
  fingerprint: string;
  compiledAt: string;
};

export type ProjectDiscoverySnapshot = {
  sessionId: string;
  intakeType: 'IDENTITY' | 'BUILDER';
  intakeId: string | null;
  answers: ProjectDiscoveryAnswer[];
  scopeDiagnosis: ProjectScopeDiagnosis | null;
  recommendation: ProjectRecommendation | null;
  provenance: DiscoveryProvenance;
  createdAt: string;
  updatedAt: string;
};

export const PUBLIC_INTAKE_PURPOSE = 'SCOPE_AND_PURCHASE_DIAGNOSIS' as const;
export const DEEP_INTELLIGENCE_BEFORE_PURCHASE_REQUIRED = false;
export const DISCOVERY_DATA_EQUALS_CANON = false;
