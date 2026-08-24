/**
 * Post-purchase project intelligence — production intelligence lifecycle.
 */

export const POST_PURCHASE_INTAKE_PURPOSE = 'PRODUCTION_INTELLIGENCE' as const;

export type ProjectCommercialState =
  | 'DISCOVERY'
  | 'RECOMMENDED'
  | 'SELECTED'
  | 'CHECKOUT_PENDING'
  | 'PAID'
  | 'ACTIVATED'
  | 'CANCELLED';

export type ProjectIntelligenceReadinessState =
  | 'PROJECT_INTELLIGENCE_NOT_STARTED'
  | 'PROJECT_INTELLIGENCE_INCOMPLETE'
  | 'PROJECT_INTELLIGENCE_PARTIAL'
  | 'PROJECT_INTELLIGENCE_NEEDS_CLARIFICATION'
  | 'PROJECT_INTELLIGENCE_READY';

export type IntelligenceModuleRequirement = 'REQUIRED' | 'CONDITIONAL' | 'OPTIONAL' | 'NOT_APPLICABLE';

export type IntelligenceModuleLifecycle =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'NEEDS_CLARIFICATION'
  | 'READY'
  | 'SUPERSEDED';

export type ProjectIntelligenceModuleId =
  | 'BUSINESS_TRUTH'
  | 'OFFERING_MAP'
  | 'AUDIENCE_INTELLIGENCE'
  | 'BRAND_LORE'
  | 'BRAND_PERSONALITY'
  | 'PRIMARY_EXPRESSION_CONTEXT'
  | 'FOUNDER_CREATIVE_APPETITE'
  | 'IDENTITY_DIRECTION'
  | 'CONTENT_INTELLIGENCE'
  | 'EXPERIENCE_INTENT'
  | 'FUNCTIONAL_REQUIREMENTS'
  | 'INFORMATION_ARCHITECTURE'
  | 'INTERACTION_REQUIREMENTS'
  | 'ASSET_INVENTORY'
  | 'VISUAL_REFERENCES'
  | 'ANTI_DIRECTION'
  | 'MOTION_INTENT'
  | 'APPLICATION_BEHAVIOR'
  | 'USER_ROLES'
  | 'WORKFLOW_INTELLIGENCE'
  | 'PERSISTENT_STATE'
  | 'NOTIFICATION_BEHAVIOR'
  | 'COMMERCE_INTELLIGENCE'
  | 'SERVICE_INTELLIGENCE'
  | 'LIVE_INTERACTION'
  | 'WORLD_READINESS'
  | 'WORLD_ENTRY_INTENT'
  | 'WORLD_SPATIAL_INTENT'
  | 'WORLD_IDENTITY_AVATAR'
  | 'WORLD_FOUNDER_PRESENCE'
  | 'WORLD_AI_REPRESENTATION'
  | 'WORLD_NAVIGATION'
  | 'WORLD_PERSISTENCE'
  | 'WORLD_SOCIAL_PRESENCE'
  | 'WORLD_CONTENT_CREATION'
  | 'WORLD_GAME_DEPTH'
  | 'WORLD_HARD_BOUNDARIES'
  | 'BRAND_CHARACTER_DEEPENING';

export type ProjectIntelligenceModuleDefinition = {
  moduleId: ProjectIntelligenceModuleId;
  label: string;
  requiredDependencies: ProjectIntelligenceModuleId[];
  recommendedDependencies: ProjectIntelligenceModuleId[];
  readinessContribution: number;
  existingSystemRoute?: string;
};

export type ProjectIntelligenceModuleAssignment = {
  moduleId: ProjectIntelligenceModuleId;
  requirement: IntelligenceModuleRequirement;
  lifecycle: IntelligenceModuleLifecycle;
  moduleVersion: string;
  questionVersion: string | null;
  rawAnswerCount: number;
  synthesized: boolean;
  unlockCondition: string | null;
};

export type ProjectIntelligenceIntakeManifest = {
  manifestId: string;
  manifestVersion: number;
  projectId: string;
  projectSlug: string;
  commercialState: ProjectCommercialState;
  experienceClass: string;
  purchasedScope: string[];
  modules: ProjectIntelligenceModuleAssignment[];
  fingerprint: string;
  compiledAt: string;
  previousManifestId: string | null;
  scopeChangeReason: string | null;
};

export type ProjectIntelligenceSnapshot = {
  snapshotId: string;
  manifestFingerprint: string;
  rawAnswers: Record<string, unknown>;
  synthesizedIntelligence: Record<string, unknown>;
  readiness: ProjectIntelligenceReadinessState;
  provenance: 'POST_PURCHASE_INTELLIGENCE';
  createdAt: string;
};

export const PROJECT_INTELLIGENCE_MANIFEST_SCOPE_DERIVED = true;
export const EVERY_PROJECT_RECEIVES_EVERY_MODULE = false;
export const PURCHASE_EQUALS_READY_FOR_FORMATION = false;
export const INTELLIGENCE_READINESS_REQUIRED_FOR_FORMATION = true;
export const FORMATION_AUTOMATIC_ON_READINESS = false;
export const WORLD_FORMATION_IMPLEMENTED = false;

export type PrefillContext = {
  questionId: string;
  discoveryEvidence: string;
  canonized: false;
  provenance: 'DISCOVERY_CARRY_FORWARD' | 'DISCOVERY_EVIDENCE';
};
