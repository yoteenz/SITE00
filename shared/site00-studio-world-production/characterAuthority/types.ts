import type {
  CHARACTER_AUTHORITY_FAILURE_CODES,
  CHARACTER_AUTHORITY_SURFACES,
  CHARACTER_VARIATION_MODES,
  PRE_CANON_ASSET_CLASSIFICATIONS,
  PRODUCTION_READINESS_STATUSES,
  REFERENCE_ONLY_SURFACES,
  VISUAL_IDENTITY_READINESS_STATUSES,
} from './constants.js';

export type VisualIdentityReadinessStatus = (typeof VISUAL_IDENTITY_READINESS_STATUSES)[number];
export type ProductionReadinessStatus = (typeof PRODUCTION_READINESS_STATUSES)[number];
export type CharacterVariationMode = (typeof CHARACTER_VARIATION_MODES)[number];
export type PreCanonAssetClassification = (typeof PRE_CANON_ASSET_CLASSIFICATIONS)[number];
export type CharacterAuthorityFailureCode = (typeof CHARACTER_AUTHORITY_FAILURE_CODES)[number];
export type CharacterAuthoritySurface = (typeof CHARACTER_AUTHORITY_SURFACES)[number];
export type ReferenceOnlySurface = (typeof REFERENCE_ONLY_SURFACES)[number];

export type NDXCharacterTruthReadiness = {
  evaluationId: string;
  characterId: string;
  ready: boolean;
  blockers: string[];
  truthSnapshotId: string | null;
  founderIKnowHerConfirmed: boolean;
  characterTruthLockedForCasting: boolean;
  evaluatedAt: string;
};

export type NDXVisualIdentityReadiness = {
  evaluationId: string;
  characterId: string;
  status: VisualIdentityReadinessStatus;
  ready: boolean;
  blockers: string[];
  dependencies: {
    founderReferenceAuthorityApproved: boolean;
    canonicalAnchorApproved: boolean;
    visualIdentityLockActive: boolean;
    wardrobeLockActive: boolean;
    environmentLockActive: boolean;
    anglePackComplete: boolean;
    identityDriftQaPass: boolean;
    expressionPackComplete: boolean;
    cameraPresencePackComplete: boolean;
    bodyAuthorityConfirmed: boolean;
  };
  evaluatedAt: string;
};

export type NDXProductionReadiness = {
  evaluationId: string;
  characterId: string;
  status: ProductionReadinessStatus;
  readyForStillProduction: boolean;
  readyForMotionProduction: boolean;
  blockers: string[];
  stillContinuityPass: boolean;
  shortVideoContinuityPass: boolean;
  referencePackComplete: boolean;
  evaluatedAt: string;
};

export type CanonicalCharacterVisualVersion = {
  versionId: string;
  versionLabel: string;
  createdAt: string;
  founderReferenceIds: string[];
  canonicalAnchorId: string | null;
  referencePackId: string | null;
  wardrobeBibleVersion: string | null;
  environmentAuthorityVersion: string | null;
  status: 'DRAFT' | 'READY_FOR_STILL' | 'READY_FOR_MOTION' | 'SUPERSEDED';
  supersedesVersionId: string | null;
};

export type CanonicalCharacterVisualAuthority = {
  authorityId: string;
  characterId: string;
  visualVersion: CanonicalCharacterVisualVersion;
  approvedFounderReferenceId: string | null;
  approvedFounderReferenceUrl: string | null;
  canonicalAnchorId: string | null;
  canonicalAnchorPreviewUrl: string | null;
  identityLockId: string | null;
  wardrobeLockId: string | null;
  environmentLockId: string | null;
  referencePackId: string | null;
  anglePackSlotCount: number;
  negativeIdentityConstraints: string[];
  continuityEvaluationIds: string[];
  visualIdentityReadiness: NDXVisualIdentityReadiness;
  productionReadiness: NDXProductionReadiness;
  compiledAt: string;
};

export type CharacterVariationRule = {
  dimension: string;
  mode: CharacterVariationMode;
  notes: string;
};

export type CharacterInjectionRequest = {
  projectId: string;
  characterId: string;
  surface: CharacterAuthoritySurface | ReferenceOnlySurface;
  sceneContext?: string | null;
  wardrobeRequirement?: string | null;
  environmentRequirement?: string | null;
  expressionRequirement?: string | null;
  cameraRequirement?: string | null;
  requiresCharacterPhotography: boolean;
};

export type CharacterInjectionBundle = {
  bundleId: string;
  characterAuthorityVersion: string;
  characterVisualVersion: string;
  identityReferences: string[];
  bodyReferences: string[];
  hairReferences: string[];
  wardrobeContinuityId: string | null;
  wardrobeReferences: string[];
  environmentAuthorityId: string | null;
  expressionReferences: string[];
  cameraPresenceReferences: string[];
  negativeIdentityConstraints: string[];
  continuityConstraints: string[];
  providerReferencePack: string[];
  readinessState: VisualIdentityReadinessStatus;
  variationRules: CharacterVariationRule[];
  compiledAt: string;
};

export type PreCanonGuardResult = {
  allowed: boolean;
  mode: 'PRODUCTION' | 'REFERENCE_ONLY' | 'CHARACTER_PLACEHOLDER' | 'BLOCKED';
  failureCode: CharacterAuthorityFailureCode | null;
  founderMessage: string | null;
  founderHeadline: string | null;
  founderSubhead: string | null;
  allowedActions: ('FINISH_CHARACTER' | 'CONTINUE_WITHOUT_CHARACTER' | 'USE_REFERENCE_ONLY_PLACEHOLDER')[];
};

export type CharacterCanonContaminationEvaluation = {
  evaluationId: string;
  passed: boolean;
  failureCode: CharacterAuthorityFailureCode | null;
  reasons: string[];
  assetClassification: PreCanonAssetClassification | null;
  evaluatedAt: string;
};

export type CharacterAssetLineageRecord = {
  characterId: string;
  characterVisualVersion: string;
  injectionBundleSnapshot: CharacterInjectionBundle | null;
  wardrobeContinuityId: string | null;
  environmentAuthorityId: string | null;
  providerReferenceIds: string[];
  continuityEvaluationId: string | null;
};

export type CharacterAuthorityContext = {
  characterId: string;
  truthReadiness: NDXCharacterTruthReadiness;
  visualIdentityReadiness: NDXVisualIdentityReadiness;
  productionReadiness: NDXProductionReadiness;
  canonicalAuthority: CanonicalCharacterVisualAuthority | null;
  visualVersion: CanonicalCharacterVisualVersion | null;
};

export type SystemCharacterAuthorityAuditEntry = {
  system: string;
  requiresCharacterAuthority: boolean;
  referenceOnlySupported: boolean;
  notes: string;
};
